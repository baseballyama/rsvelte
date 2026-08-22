//! AST-based dev-mode `$inspect` lowering for module scripts
//! (`.svelte.js` / `.svelte.ts`).
//!
//! Mirrors `transform_inspect_rune` in the official compiler's
//! `visitors/CallExpression.js`:
//!
//! ```text
//! $inspect(a, b)          -> $.inspect(() => [a, b], (...$$args) => console.log(...$$args), true)
//! $inspect(a).with(cb)    -> $.inspect(() => [a], (...$$args) => cb(...$$args))
//! ```
//!
//! The component instance script gets this from the state-transform visitor;
//! module scripts had no equivalent, so the rune survived into the output and
//! threw `ReferenceError: $inspect is not defined` when the module ran.
//!
//! Non-dev removal lives here too ([`transform_module_inspect_removal_ast`]):
//! upstream's `CallExpression` visitor returns `b.empty` for the call while the
//! `ExpressionStatement` around it survives, so the printed statement is the
//! `;;` pair this pass splices in.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use super::ast_rewrite;
use super::ast_rewrite::Edit;

thread_local! {
    static INSPECT_REMOVAL_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Non-dev `$inspect` removal for a module script.
///
/// A statement-position `$inspect(…)` / `$inspect(…).with(…)` becomes `;;` (the
/// `ExpressionStatement` upstream keeps, holding an `EmptyStatement` where its
/// expression was); a statement-position `$inspect.trace(…)` is dropped, which
/// is upstream's `ExpressionStatement` visitor returning `b.empty` outright.
/// Occurrences in any other position are left alone: upstream splices an
/// `EmptyStatement` into expression position there and prints text no JS parser
/// accepts, which is not worth reproducing.
pub(super) fn transform_module_inspect_removal_ast(source: &str, is_ts: bool) -> Option<String> {
    if !source_has_inspect_rune(source) {
        return None;
    }
    let source_type = if is_ts {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    };
    ast_rewrite::rewrite_batched(
        &INSPECT_REMOVAL_ALLOC,
        source,
        source_type,
        ParseOptions::default(),
        collect_inspect_removal_edits,
    )
}

fn collect_inspect_removal_edits(program: &Program<'_>, source: &str) -> Vec<Edit> {
    let mut collector = RemovalCollector {
        source,
        edits: Vec::new(),
    };
    collector.visit_program(program);
    collector.edits
}

/// What a statement-position `$inspect*` call lowers to when `dev` is off.
enum Removal {
    /// `$inspect(…)` / `$inspect(…).with(…)` — the statement survives as `;;`.
    Hole,
    /// `$inspect.trace(…)` — the whole statement goes.
    Drop,
}

fn classify(expr: &Expression<'_>) -> Option<Removal> {
    let Expression::CallExpression(call) = expr else {
        return None;
    };
    if let Expression::Identifier(callee) = &call.callee
        && callee.name == "$inspect"
    {
        return Some(Removal::Hole);
    }
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return None;
    };
    if member.property.name == "with"
        && let Expression::CallExpression(inner) = &member.object
        && matches!(&inner.callee, Expression::Identifier(id) if id.name == "$inspect")
    {
        return Some(Removal::Hole);
    }
    if member.property.name == "trace"
        && matches!(&member.object, Expression::Identifier(id) if id.name == "$inspect")
    {
        return Some(Removal::Drop);
    }
    None
}

struct RemovalCollector<'src> {
    source: &'src str,
    edits: Vec<Edit>,
}

impl RemovalCollector<'_> {
    /// Widen a dropped statement's span over the indentation before it and the
    /// line break after it, so removing the only statement on a line does not
    /// leave a whitespace-only one behind.
    fn line_span(&self, span: oxc_span::Span) -> (u32, u32) {
        let bytes = self.source.as_bytes();
        let mut start = span.start as usize;
        while start > 0 && matches!(bytes[start - 1], b' ' | b'\t') {
            start -= 1;
        }
        if start > 0 && bytes[start - 1] != b'\n' {
            start = span.start as usize;
        }
        let mut end = span.end as usize;
        while end < bytes.len() && matches!(bytes[end], b' ' | b'\t') {
            end += 1;
        }
        if end < bytes.len() && bytes[end] == b'\n' {
            end += 1;
        } else {
            end = span.end as usize;
        }
        (start as u32, end as u32)
    }
}

impl<'a> Visit<'a> for RemovalCollector<'_> {
    fn visit_expression_statement(&mut self, stmt: &ExpressionStatement<'a>) {
        match classify(&stmt.expression) {
            Some(Removal::Hole) => {
                self.edits
                    .push((stmt.span.start, stmt.span.end, ";;".to_string()));
            }
            Some(Removal::Drop) => {
                let (start, end) = self.line_span(stmt.span);
                self.edits.push((start, end, String::new()));
            }
            None => walk::walk_expression_statement(self, stmt),
        }
    }
}

/// Cheap byte probe gating entry into the AST pass.
pub(super) fn source_has_inspect_rune(s: &str) -> bool {
    memchr::memmem::find(s.as_bytes(), b"$inspect").is_some()
}

/// An inspector that is not already a plain reference has to be parenthesised
/// before it can be invoked — `((t, v) => …)(...$$args)`.
pub(super) fn needs_parens(expr: &Expression<'_>) -> bool {
    !matches!(
        expr,
        Expression::Identifier(_)
            | Expression::StaticMemberExpression(_)
            | Expression::ComputedMemberExpression(_)
            | Expression::ParenthesizedExpression(_)
    )
}

pub(super) fn collect_inspect_rune_edits(program: &Program<'_>, source: &str) -> Vec<Edit> {
    let mut collector = InspectCollector {
        source,
        replacements: Vec::new(),
    };
    collector.visit_program(program);
    collector.replacements
}

struct InspectCollector<'src> {
    source: &'src str,
    replacements: Vec<Edit>,
}

impl<'src> InspectCollector<'src> {
    fn text(&self, span: oxc_span::Span) -> &'src str {
        self.source[span.start as usize..span.end as usize].trim()
    }

    /// `() => [arg, arg, …]` built from a `$inspect(...)` call's arguments.
    /// Slices each argument's own span so a `...spread` survives — narrowing to
    /// `as_expression()` would drop it from the array.
    fn args_thunk(&self, call: &CallExpression<'_>) -> String {
        let args = call
            .arguments
            .iter()
            .map(|a| self.text(a.span()))
            .collect::<Vec<_>>()
            .join(", ");
        format!("() => [{args}]")
    }
}

impl<'a, 'src> Visit<'a> for InspectCollector<'src> {
    fn visit_call_expression(&mut self, expr: &CallExpression<'a>) {
        // `$inspect(args).with(cb)` — match the outer call first so the inner
        // `$inspect(args)` is not rewritten separately.
        if expr.arguments.len() == 1
            && let Expression::StaticMemberExpression(member) = &expr.callee
            && member.property.name == "with"
            && let Expression::CallExpression(inner) = &member.object
            && let Expression::Identifier(callee) = &inner.callee
            && callee.name == "$inspect"
            && let Some(cb) = expr.arguments[0].as_expression()
        {
            let cb_text = self.text(cb.span());
            let inspector = if needs_parens(cb) {
                format!("({cb_text})")
            } else {
                cb_text.to_string()
            };
            self.replacements.push((
                expr.span.start,
                expr.span.end,
                format!(
                    "$.inspect({}, (...$$args) => {}(...$$args))",
                    self.args_thunk(inner),
                    inspector
                ),
            ));
            return;
        }

        if let Expression::Identifier(callee) = &expr.callee
            && callee.name == "$inspect"
        {
            self.replacements.push((
                expr.span.start,
                expr.span.end,
                format!(
                    "$.inspect({}, (...$$args) => console.log(...$$args), true)",
                    self.args_thunk(expr)
                ),
            ));
            return;
        }

        walk::walk_call_expression(self, expr);
    }
}

#[cfg(test)]
mod tests {
    use super::super::module_dev_tail_ast::transform_module_dev_tail_ast;

    /// Through the production entry point, so the gate is exercised too.
    fn lower(source: &str) -> Option<String> {
        transform_module_dev_tail_ast(source, true, false, true, None)
    }

    #[test]
    fn lowers_the_bare_rune() {
        assert_eq!(
            lower("$inspect(a);").unwrap(),
            "$.inspect(() => [a], (...$$args) => console.log(...$$args), true);"
        );
    }

    #[test]
    fn lowers_multiple_arguments() {
        assert_eq!(
            lower("$inspect(a, b);").unwrap(),
            "$.inspect(() => [a, b], (...$$args) => console.log(...$$args), true);"
        );
    }

    #[test]
    fn keeps_a_spread_argument() {
        assert_eq!(
            lower("$inspect(a, ...b, 3);").unwrap(),
            "$.inspect(() => [a, ...b, 3], (...$$args) => console.log(...$$args), true);"
        );
    }

    #[test]
    fn with_a_named_inspector_is_called_directly() {
        assert_eq!(
            lower("$inspect(a).with(fn);").unwrap(),
            "$.inspect(() => [a], (...$$args) => fn(...$$args));"
        );
        assert_eq!(
            lower("$inspect(a).with(obj.fn);").unwrap(),
            "$.inspect(() => [a], (...$$args) => obj.fn(...$$args));"
        );
    }

    #[test]
    fn with_an_inline_inspector_is_parenthesised() {
        assert_eq!(
            lower("$inspect(a).with((t, v) => log(t, v));").unwrap(),
            "$.inspect(() => [a], (...$$args) => ((t, v) => log(t, v))(...$$args));"
        );
    }

    #[test]
    fn does_not_touch_a_rune_shaped_string() {
        assert!(lower(r#"let s = "$inspect(a)";"#).is_none());
    }

    #[test]
    fn the_generated_default_inspector_is_not_re_wrapped() {
        // The console collector runs in the same batch; its skip for
        // `console.log(...$$args)` has to hold for what this pass just emitted.
        let out = lower("$inspect(a);\nconsole.log(b);").unwrap();
        assert!(
            out.contains("(...$$args) => console.log(...$$args), true)"),
            "default inspector was rewritten: {out}"
        );
        assert!(
            out.contains(r#"console.log(...$.log_if_contains_state('log', b));"#),
            "the user's own console call should still be wrapped: {out}"
        );
    }
}
