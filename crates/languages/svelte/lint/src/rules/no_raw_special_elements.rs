use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode, TokenType};

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-raw-special-elements",
    files: Files::Components,
    configure,
};

/// Names that Svelte 4 read as special elements without the `svelte:` prefix.
const SPECIAL: &[&str] = &["head", "body", "window", "document", "element", "options"];

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoRawSpecialElements))
}

#[derive(Debug)]
struct NoRawSpecialElements;

impl SvelteRule for NoRawSpecialElements {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        for node in &component.nodes {
            let TemplateNode::Element {
                name,
                children,
                self_closing,
                span,
                ..
            } = *node
            else {
                continue;
            };
            let text = name.text(source);
            if !SPECIAL.contains(&text) {
                continue;
            }
            let mut fix = Fix::insert(name.start_offset, "svelte:");
            if !self_closing {
                let content_end = component
                    .children(children)
                    .last()
                    .map_or(name.end_offset, |&child| {
                        component.node(child).span().end_offset
                    });
                if let Some(end_name) = end_tag_name(component, source, span, content_end, text) {
                    fix.push(Span::new(end_name, end_name), "svelte:");
                }
            }
            reporter.report(
                Report::range(
                    format!(
                        "Special {text} element is deprecated in v5, use svelte:{text} instead."
                    ),
                    span,
                )
                .message_id("deprecatedElement")
                .fix(fix),
            );
        }
    }
}

/// Where the name of the element's end tag starts: `</name>` closes the element after its
/// content, unless the end tag was omitted.
fn end_tag_name(
    component: &Component,
    source: &str,
    element: Span,
    content_end: u32,
    name: &str,
) -> Option<u32> {
    let tokens = &component.tokens;
    let close = tokens.get(tokens.before(element.end_offset)?);
    let tag_name = tokens.get(tokens.before(close.span.start_offset)?);
    let open = tokens.get(tokens.before(tag_name.span.start_offset)?);
    (close.kind == TokenType::TagEnd
        && tag_name.kind == TokenType::TagName
        && tag_name.span.text(source) == name
        && open.kind == TokenType::EndTagOpen
        && open.span.start_offset >= content_end)
        .then_some(tag_name.span.start_offset)
}
