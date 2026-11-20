use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, TokenType};

use super::shared::markup::start_tags;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-spaces-around-equal-signs-in-attribute",
    files: Files::Components,
    configure: without_options::<NoSpacesAroundEqualSigns>,
};

#[derive(Debug, Default)]
struct NoSpacesAroundEqualSigns;

impl SvelteRule for NoSpacesAroundEqualSigns {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let tokens = &component.tokens;
        for tag in start_tags(component) {
            for attribute in tag.attributes(tokens) {
                if attribute.template.is_some_and(|attribute| {
                    attribute.shorthand
                        || matches!(
                            attribute.kind,
                            AttributeKind::Spread | AttributeKind::Attach
                        )
                }) {
                    continue;
                }
                // `/^[\s=]*/` after the name.
                let after = Span::new(attribute.key.end_offset, attribute.span.end_offset);
                let mut end = after.start_offset;
                let mut spaced = false;
                for token in tokens.within(after) {
                    match token.kind {
                        TokenType::Whitespace => spaced = true,
                        TokenType::Eq => {}
                        _ => break,
                    }
                    end = token.span.end_offset;
                }
                if spaced {
                    let range = Span::new(after.start_offset, end);
                    reporter.report(
                        Report::range("Unexpected spaces found around equal signs.", range)
                            .fix(Fix::replace(range, "=")),
                    );
                }
            }
        }
    }
}
