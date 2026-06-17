//! AST-based location of rune calls (`$state(…)`, `$state.raw(…)`,
//! `$state.eager(…)`, `$derived(…)`, `$derived.by(…)`, `$bindable(…)`) for the
//! server script transform.
//!
//! Replaces the call-locating half of `transform_rune_call_multiline` — a
//! char-by-char scanner that matched a `$rune(` prefix textually, tracked a
//! brace/quote depth to find the matching `)`, and used
//! `find_rune_shadow_ranges` (a hand-rolled `function (…$derived…)` /
//! `(…$derived…) =>` parameter scan) to skip shadowed occurrences.
//!
//! The *emission* logic is unchanged: this pass extracts the exact same
//! `inner` text (everything between the call's `(` and matching `)`, verbatim —
//! comments, trailing comma, formatting preserved) and feeds it to the shared
//! [`emit_rune_replacement`](super::transform_script::emit_rune_replacement),
//! so output is byte-identical to the scanner. What changes is robustness:
//!
//! - a `$state(` inside a string / comment / nested template is never matched
//!   (the scanner's quote tracking was approximate);
//! - shadowing is resolved by real scope analysis — a binding named `$state`
//!   (`function f($state) { $state(1) }`) makes the call a plain call, exactly
//!   as upstream's `get_rune` returns null when the name resolves to a binding.
//!
//! One rune *flavour* is handled per call (the caller invokes it once per
//! prefix, mirroring the scanner's call sites). Returns `None` (caller falls
//! back to the scanner) when the script doesn't parse as a standalone module.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::{GetSpan, SourceType};

use super::super::shared::ast_rewrite;
use super::transform_script::emit_rune_replacement;

thread_local! {
    static RUNE_CALL_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Rewrite every unshadowed call of the rune named by `prefix` (e.g.
/// `"$derived("`, `"$state.raw("`) to its server form. Returns `Some(rewritten)`
/// when at least one call was rewritten, `None` on a parse failure or when
/// nothing matched (caller falls back to the byte scanner).
pub(crate) fn transform_rune_call_ast(script: &str, prefix: &str) -> Option<String> {
    // `prefix` is `"$rune("`; the rune name is everything before the `(`.
    let rune = &prefix[..prefix.len() - 1];
    let is_derived = prefix == "$derived(";
    let is_derived_by = prefix == "$derived.by(";

    // `$state` / `$bindable` / `$derived` are plain-identifier callees;
    // `$state.raw` / `$state.eager` / `$derived.by` are member callees on the
    // `$state` / `$derived` object.
    let (object_name, member_name): (&str, Option<&str>) = match rune.split_once('.') {
        Some((obj, member)) => (obj, Some(member)),
        None => (rune, None),
    };

    ast_rewrite::with_program(
        &RUNE_CALL_ALLOC,
        script,
        SourceType::mjs(),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |program| {
            let semantic_ret = SemanticBuilder::new().build(program);
            let semantic = &semantic_ret.semantic;

            let mut collector = RuneCallCollector {
                semantic,
                script,
                object_name,
                member_name,
                is_derived,
                is_derived_by,
                edits: Vec::new(),
            };
            collector.visit_program(program);

            if collector.edits.is_empty() {
                return None;
            }

            let mut edits = collector.edits;
            edits.sort_by_key(|&(start, ..)| std::cmp::Reverse(start));
            let mut out = script.to_string();
            for (start, end, replacement) in &edits {
                out.replace_range(*start as usize..*end as usize, replacement);
            }
            Some(out)
        },
    )
}

struct RuneCallCollector<'a, 'sem> {
    semantic: &'sem Semantic<'sem>,
    script: &'a str,
    object_name: &'a str,
    member_name: Option<&'a str>,
    is_derived: bool,
    is_derived_by: bool,
    edits: Vec<(u32, u32, String)>,
}

impl<'a, 'sem> RuneCallCollector<'a, 'sem> {
    /// True when `ident` resolves to a real binding (a parameter / local named
    /// e.g. `$state`), in which case the call is a plain call, not a rune —
    /// mirrors upstream `get_rune` returning null when the name is bound.
    fn is_bound(&self, ident: &IdentifierReference) -> bool {
        let Some(reference_id) = ident.reference_id.get() else {
            return false;
        };
        self.semantic
            .scoping()
            .get_reference(reference_id)
            .symbol_id()
            .is_some()
    }

    /// Check the callee matches this rune (by name + shape) and isn't shadowed.
    fn callee_matches(&self, callee: &Expression) -> bool {
        match self.member_name {
            None => {
                // Plain-identifier callee: `$state(…)`.
                if let Expression::Identifier(id) = callee {
                    id.name == self.object_name && !self.is_bound(id)
                } else {
                    false
                }
            }
            Some(member) => {
                // Member callee: `$state.raw(…)` etc. (non-computed).
                if let Expression::StaticMemberExpression(m) = callee
                    && let Expression::Identifier(obj) = &m.object
                {
                    obj.name == self.object_name && m.property.name == member && !self.is_bound(obj)
                } else {
                    false
                }
            }
        }
    }
}

impl<'a, 'sem, 'ast> Visit<'ast> for RuneCallCollector<'a, 'sem> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        // Recurse first so nested rune calls (e.g. inside the argument) are
        // collected; edits are applied right-to-left so order is irrelevant.
        walk::walk_call_expression(self, call);

        if !self.callee_matches(&call.callee) {
            return;
        }

        // Extract the verbatim `inner` text: between the call's `(` (the first
        // `(` after the callee) and the call's closing `)` (`call.span.end - 1`).
        // This reproduces the scanner's extraction exactly, preserving comments
        // / trailing commas / whitespace inside the parens.
        let callee_end = call.callee.span().end as usize;
        let bytes = self.script.as_bytes();
        let mut p = callee_end;
        while p < bytes.len() && bytes[p] != b'(' {
            p += 1;
        }
        if p >= bytes.len() {
            return;
        }
        let inner_start = p + 1;
        let inner_end = (call.span.end as usize).saturating_sub(1);
        if inner_end < inner_start {
            return;
        }
        let inner = &self.script[inner_start..inner_end];
        let replacement = emit_rune_replacement(inner, self.is_derived, self.is_derived_by);
        self.edits
            .push((call.span.start, call.span.end, replacement));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn run(script: &str, prefix: &str) -> Option<String> {
        transform_rune_call_ast(script, prefix)
    }

    #[test]
    fn derived_wraps_in_thunk() {
        assert_eq!(
            run("let x = $derived(a + b);", "$derived(").unwrap(),
            "let x = $.derived(() => a + b);"
        );
    }

    #[test]
    fn derived_by_unwraps() {
        assert_eq!(
            run("let x = $derived.by(fn);", "$derived.by(").unwrap(),
            "let x = $.derived(fn);"
        );
    }

    #[test]
    fn derived_object_literal_gets_parens() {
        assert_eq!(
            run("let x = $derived({ a: 1 });", "$derived(").unwrap(),
            "let x = $.derived(() => ({ a: 1 }));"
        );
    }

    #[test]
    fn derived_unthunk_no_arg_call() {
        assert_eq!(
            run("let x = $derived(getFoo());", "$derived(").unwrap(),
            "let x = $.derived(getFoo);"
        );
    }

    #[test]
    fn state_strips_wrapper() {
        assert_eq!(run("let x = $state(0);", "$state(").unwrap(), "let x = 0;");
    }

    #[test]
    fn state_raw_strips_wrapper() {
        assert_eq!(
            run("let x = $state.raw(0);", "$state.raw(").unwrap(),
            "let x = 0;"
        );
    }

    #[test]
    fn bindable_strips_wrapper() {
        assert_eq!(
            run("let x = $bindable(0);", "$bindable(").unwrap(),
            "let x = 0;"
        );
    }

    #[test]
    fn shadowed_rune_is_left_alone() {
        // `$derived` bound as a parameter — the inner call is a plain call.
        assert!(run("function f($derived) { return $derived(1); }", "$derived(").is_none());
    }

    #[test]
    fn does_not_match_inside_string() {
        assert!(run("let s = \"$state(0)\";", "$state(").is_none());
    }

    #[test]
    fn preserves_inner_comment_and_trailing_comma() {
        // `inner` is verbatim, so a trailing comma is stripped by the emitter
        // exactly as the scanner did.
        assert_eq!(
            run("let x = $derived.by(fn,);", "$derived.by(").unwrap(),
            "let x = $.derived(fn);"
        );
    }

    #[test]
    fn empty_derived() {
        assert_eq!(
            run("let x = $derived();", "$derived(").unwrap(),
            "let x = $.derived(() => void 0);"
        );
    }
}
