//! AST-based `$derived.by(fn)` → `$.derived(fn)` rewrite for module
//! scripts (`.svelte.js` / `.svelte.ts`).
//!
//! Replaces the bare `result.replace("$derived.by(", "$.derived(")`
//! in `transform_module_script_runes`. `String::replace` rewrites
//! byte patterns regardless of context — `let s = "$derived.by("`
//! would be (incorrectly) rewritten to `let s = "$.derived("`. The
//! AST visitor descends only into expression positions, so the
//! rewrite is correct by construction.
//!
//! `$derived.by(fn)` invokes `fn` to compute the derived value;
//! `$.derived` (the runtime) is the same call shape, so the swap is
//! a pure callee rename — the argument list / surrounding source
//! stay verbatim.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

thread_local! {
    static MODULE_DERIVED_BY_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `$derived.by(fn)` → `$.derived(fn)`.
/// Returns `None` when nothing changed.
pub fn transform_derived_by_ast(source: &str, is_ts: bool) -> Option<String> {
    memchr::memmem::find(source.as_bytes(), b"$derived.by")?;

    MODULE_DERIVED_BY_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let source_type = if is_ts {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        };
        let parser_ret = Parser::new(&allocator, source, source_type).parse();
        if !parser_ret.diagnostics.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        let mut collector = DerivedByCollector { spans: Vec::new() };
        collector.visit_program(&parser_ret.program);
        let mut spans = collector.spans;

        if spans.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        spans.sort_by_key(|s| std::cmp::Reverse(s.0));
        let mut out = source.to_string();
        for (start, end) in &spans {
            out.replace_range(*start as usize..*end as usize, "$.derived");
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

struct DerivedByCollector {
    /// `(start, end)` byte offsets of `$derived.by` member-expression
    /// callees to overwrite with `$.derived`.
    spans: Vec<(u32, u32)>,
}

impl<'a> Visit<'a> for DerivedByCollector {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        walk::walk_call_expression(self, call);

        let Expression::StaticMemberExpression(member) = &call.callee else {
            return;
        };
        let Expression::Identifier(obj) = &member.object else {
            return;
        };
        if obj.name != "$derived" || member.property.name != "by" {
            return;
        }
        self.spans.push((member.span().start, member.span().end));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rewrites_basic_derived_by() {
        let out = transform_derived_by_ast("let d = $derived.by(() => x);", false).unwrap();
        assert_eq!(out, "let d = $.derived(() => x);");
    }

    #[test]
    fn rewrites_multiple_calls() {
        let src = "let a = $derived.by(() => 1); let b = $derived.by(() => 2);";
        let out = transform_derived_by_ast(src, false).unwrap();
        assert_eq!(
            out,
            "let a = $.derived(() => 1); let b = $.derived(() => 2);"
        );
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "$derived.by(fn)";"#;
        assert!(transform_derived_by_ast(src, false).is_none());
    }

    #[test]
    fn does_not_rewrite_static_template() {
        let src = "let s = `$derived.by(fn)`;";
        assert!(transform_derived_by_ast(src, false).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${$derived.by(() => 1)}`;";
        let out = transform_derived_by_ast(src, false).unwrap();
        assert_eq!(out, "let s = `${$.derived(() => 1)}`;");
    }

    #[test]
    fn leaves_plain_derived_alone() {
        // `$derived(x)` (no .by) is handled by other passes; this
        // helper only touches `$derived.by`.
        let src = "let d = $derived(x);";
        assert!(transform_derived_by_ast(src, false).is_none());
    }

    #[test]
    fn leaves_other_derived_methods_alone() {
        // `$derived.bogus(x)` isn't a known rune — leave it for
        // downstream analysis to complain about.
        let src = "$derived.bogus(x)";
        assert!(transform_derived_by_ast(src, false).is_none());
    }

    #[test]
    fn chained_member_after_call_works() {
        let src = "$derived.by(() => obj).foo";
        let out = transform_derived_by_ast(src, false).unwrap();
        assert_eq!(out, "$.derived(() => obj).foo");
    }

    #[test]
    fn ts_source_works() {
        let src = "let d: number = $derived.by(() => 1);";
        let out = transform_derived_by_ast(src, true).unwrap();
        assert!(out.contains("$.derived(() => 1)"));
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_derived_by_ast("let x = $derived.by(", false).is_none());
    }

    #[test]
    fn no_op_without_keyword() {
        assert!(transform_derived_by_ast("let x = 1;", false).is_none());
    }
}
