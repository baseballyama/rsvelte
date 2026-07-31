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
//! Non-dev removal stays where it is, in the text pass in `mod.rs`.

use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_span::GetSpan;

use super::ast_rewrite::Edit;

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
        transform_module_dev_tail_ast(source, true, false)
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
            out.contains(r#"console.log(...$.log_if_contains_state("log", b));"#),
            "the user's own console call should still be wrapped: {out}"
        );
    }
}
