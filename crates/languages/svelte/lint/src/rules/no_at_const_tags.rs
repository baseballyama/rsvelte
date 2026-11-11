use oxc_ast::ast::Expression;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{TemplateNode, TokenType};

use super::nodes;
use super::runes::runes;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-at-const-tags",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoAtConstTags))
}

#[derive(Debug)]
struct NoAtConstTags;

impl SvelteRule for NoAtConstTags {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        // Outside runes mode `$derived` does not exist, so `{const}` cannot keep the reactivity.
        if runes(file) != Some(true) {
            return;
        }
        let component = file.component().expect("a component rule");
        let javascript = &component.javascript;
        for node in &component.nodes {
            let TemplateNode::Const { declaration, span } = *node else {
                continue;
            };
            // `{@const` or `{ @const`: either way the block token ends with `@const`.
            let marker = component
                .tokens
                .within(span)
                .iter()
                .find(|token| token.kind == TokenType::BlockOpen)
                .expect("`{@const` is a block token");
            let at = marker.span.end_offset - "@const".len() as u32;
            let mut fix = Fix::remove(Span::new(at, at + 1));
            // `$derived(…) as T` is an assertion, not a call, so it is wrapped too.
            if let Some(initializer) = javascript
                .get_declaration(declaration)
                .declarations
                .first()
                .and_then(|declarator| declarator.init.as_ref())
                && !is_derived_call(initializer)
            {
                let init = nodes::span(initializer);
                fix.push(Span::new(init.start_offset, init.start_offset), "$derived(");
                fix.push(Span::new(init.end_offset, init.end_offset), ")");
            }
            reporter.report(
                Report::range(
                    "Use `{const ...}` declaration tag instead of legacy `{@const ...}`.",
                    span,
                )
                .message_id("unexpected")
                .fix(fix),
            );
        }
    }
}

/// `$derived(…)` already: wrapping it again would derive a derived value.
fn is_derived_call(expression: &Expression<'_>) -> bool {
    matches!(
        expression,
        Expression::CallExpression(call) if nodes::is_named(&call.callee, "$derived")
    )
}
