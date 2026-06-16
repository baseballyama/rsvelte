//! AST-based `$state.snapshot(x)` → `$.snapshot(x)` rewrite for
//! module scripts (`.svelte.js` / `.svelte.ts`).
//!
//! Replaces the text-based `result.replace("$state.snapshot(",
//! "$.snapshot(")` call in `mod.rs`. The bare `String::replace`
//! rewrites byte patterns indiscriminately — `let s =
//! "$state.snapshot("` would (incorrectly) become `let s =
//! "$.snapshot("`. The AST visitor only descends into expression
//! positions, so it can't make that class of mistake.
//!
//! The companion `$state.raw(...)` / `$state.frozen(...)` rewrites
//! intentionally aren't here — they depend on per-variable
//! analysis (which module bindings are reassigned vs not) to choose
//! between wrapping in `$.state(...)` and emitting the raw value.
//! That plumbing belongs in a follow-up PR.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

thread_local! {
    static MODULE_SNAPSHOT_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based rewrite of `$state.snapshot(x)` → `$.snapshot(x)`.
/// Returns `None` when nothing changed.
pub fn transform_state_snapshot_ast(source: &str, is_ts: bool) -> Option<String> {
    // Fast probe — most module scripts don't reference $state.snapshot.
    memchr::memmem::find(source.as_bytes(), b"$state.snapshot")?;

    MODULE_SNAPSHOT_ALLOC.with(|cell| {
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

        let mut collector = SnapshotCollector { spans: Vec::new() };
        collector.visit_program(&parser_ret.program);
        let mut spans = collector.spans;

        if spans.is_empty() {
            *cell.borrow_mut() = allocator;
            return None;
        }

        // Each replacement is a callee swap on a distinct call, so
        // spans don't overlap. Right-to-left splice preserves offsets.
        spans.sort_by_key(|s| std::cmp::Reverse(s.0));
        let mut out = source.to_string();
        for (start, end) in &spans {
            out.replace_range(*start as usize..*end as usize, "$.snapshot");
        }

        *cell.borrow_mut() = allocator;
        Some(out)
    })
}

struct SnapshotCollector {
    /// `(start, end)` byte offsets of `$state.snapshot` callee
    /// chains to overwrite with `$.snapshot`.
    spans: Vec<(u32, u32)>,
}

impl<'a> Visit<'a> for SnapshotCollector {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        walk::walk_call_expression(self, call);

        let Expression::StaticMemberExpression(member) = &call.callee else {
            return;
        };
        let Expression::Identifier(obj) = &member.object else {
            return;
        };
        if obj.name != "$state" || member.property.name != "snapshot" {
            return;
        }
        // Swap just the callee text (`$state.snapshot`) — the call's
        // argument list stays verbatim.
        self.spans.push((member.span().start, member.span().end));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rewrites_snapshot_call() {
        let out = transform_state_snapshot_ast("let s = $state.snapshot(x);", false).unwrap();
        assert_eq!(out, "let s = $.snapshot(x);");
    }

    #[test]
    fn rewrites_snapshot_with_complex_arg() {
        let out =
            transform_state_snapshot_ast("let s = $state.snapshot(obj.field);", false).unwrap();
        assert_eq!(out, "let s = $.snapshot(obj.field);");
    }

    #[test]
    fn rewrites_multiple_calls() {
        let src = "let a = $state.snapshot(x); let b = $state.snapshot(y);";
        let out = transform_state_snapshot_ast(src, false).unwrap();
        assert_eq!(out, "let a = $.snapshot(x); let b = $.snapshot(y);");
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        // This is the bug class the AST migration fixes.
        let src = r#"let s = "$state.snapshot(x)";"#;
        assert!(transform_state_snapshot_ast(src, false).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_template_static() {
        let src = "let s = `$state.snapshot(x)`;";
        assert!(transform_state_snapshot_ast(src, false).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${$state.snapshot(x)}`;";
        let out = transform_state_snapshot_ast(src, false).unwrap();
        assert_eq!(out, "let s = `${$.snapshot(x)}`;");
    }

    #[test]
    fn leaves_other_state_methods_alone() {
        for src in [
            "$state.raw(x)",
            "$state.frozen(x)",
            "$state(x)",
            "$state.bogus(x)",
        ] {
            assert!(
                transform_state_snapshot_ast(src, false).is_none(),
                "should not rewrite: {src}"
            );
        }
    }

    #[test]
    fn handles_chained_member_access_after_call() {
        // `$state.snapshot(x).foo` is a member access on the call
        // result. The callee swap is still applied to the inner call.
        let src = "let s = $state.snapshot(x).foo;";
        let out = transform_state_snapshot_ast(src, false).unwrap();
        assert_eq!(out, "let s = $.snapshot(x).foo;");
    }

    #[test]
    fn ts_source_works() {
        let src = "let s: number = $state.snapshot(x);";
        let out = transform_state_snapshot_ast(src, true).unwrap();
        assert!(out.contains("$.snapshot(x)"));
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_state_snapshot_ast("let x = $state.snapshot(", false).is_none());
    }

    #[test]
    fn no_op_without_keyword() {
        assert!(transform_state_snapshot_ast("let x = 1;", false).is_none());
    }
}
