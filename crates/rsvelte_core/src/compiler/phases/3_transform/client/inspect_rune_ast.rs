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
fn needs_parens(expr: &Expression<'_>) -> bool {
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
    fn args_thunk(&self, call: &CallExpression<'_>) -> String {
        let args = call
            .arguments
            .iter()
            .filter_map(|a| a.as_expression())
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
