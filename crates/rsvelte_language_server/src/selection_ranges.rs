//! `textDocument/selectionRange`.
//!
//! A port of the official language server's
//! `plugins/svelte/features/getSelectionRanges.ts`. Upstream walks whatever
//! node boundaries its AST happens to expose; this walks the same tree
//! deliberately, so an attribute value grows to its attribute, then to the
//! start tag, then to the element.
//!
//! Positions inside `<script>` and `<style>` are left alone, as upstream does:
//! their contents belong to the TypeScript and CSS services.

use lsp_types::{Range, SelectionRange};
use rsvelte_core::Allocator;
use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Root, TemplateNode,
};

use crate::context::body_of;
use crate::nodes::{Kind, Span, View, parse_root, span_of, view};
use crate::text::LineIndex;

/// The nested ranges around each position, or `None` when the document has
/// nothing to say about any of them — which lets the editor fall back to its
/// own word- and bracket-based expansion.
pub fn selection_ranges(text: &str, offsets: &[usize]) -> Option<Vec<SelectionRange>> {
    let allocator = Allocator::default();
    let root = parse_root(text, &allocator)?;
    let embedded = embedded_bodies(text, &root);

    let chains: Vec<Vec<Span>> = offsets
        .iter()
        .map(|&offset| {
            if embedded.iter().any(|body| body.contains(&offset)) {
                return Vec::new();
            }
            chain(text, &root, offset)
        })
        .collect();
    if chains.iter().all(Vec::is_empty) {
        return None;
    }

    let index = LineIndex::new(text);
    Some(
        chains
            .into_iter()
            .zip(offsets)
            .map(|(chain, &offset)| nest(text, &index, &chain, offset))
            .collect(),
    )
}

/// The bodies of `<script>` and `<style>`, which this provider stays out of.
fn embedded_bodies(text: &str, root: &Root<'_>) -> Vec<std::ops::Range<usize>> {
    let scripts = [root.instance.as_deref(), root.module.as_deref()]
        .into_iter()
        .flatten()
        .filter_map(|script| body_of(text, script.start as usize, script.end as usize));
    let style = root
        .css
        .as_deref()
        .map(|css| css.content.start as usize..css.content.end as usize);
    scripts.chain(style).collect()
}

fn chain(text: &str, root: &Root<'_>, offset: usize) -> Vec<Span> {
    let mut spans = Vec::new();
    if let Some(node) = root
        .fragment
        .nodes
        .iter()
        .find(|node| view(node).contains(offset))
    {
        descend(text, node, offset, &mut spans);
    }
    spans
}

fn descend(text: &str, node: &TemplateNode<'_>, offset: usize, spans: &mut Vec<Span>) {
    let node = view(node);
    push(spans, node.span());

    // The offset the start tag ends at already belongs to the content that
    // follows it.
    if let Some(tag_end) = open_tag_end(text, &node)
        && offset < tag_end as usize
    {
        push(spans, (node.start, tag_end));
        if let Some(attribute) = node
            .attributes
            .iter()
            .find(|attribute| contains(attribute_span(attribute), offset))
        {
            push(spans, attribute_span(attribute));
            attribute_value(attribute, offset, spans);
        }
        return;
    }

    if let Some(expression) = node
        .expressions()
        .find(|&expression| contains(expression, offset))
    {
        push(spans, expression);
        return;
    }

    for fragment in node.fragments() {
        if let Some(child) = fragment
            .nodes
            .iter()
            .find(|child| view(child).contains(offset))
        {
            descend(text, child, offset, spans);
            return;
        }
    }
}

fn attribute_value(attribute: &Attribute<'_>, offset: usize, spans: &mut Vec<Span>) {
    let Attribute::Attribute(attribute) = attribute else {
        return;
    };
    match &attribute.value {
        AttributeValue::True(_) => {}
        AttributeValue::Expression(tag) => {
            if !contains((tag.start, tag.end), offset) {
                return;
            }
            push(spans, (tag.start, tag.end));
            if let Some(expression) = span_of(&tag.expression) {
                push(spans, expression);
            }
        }
        AttributeValue::Sequence(parts) => {
            for part in parts {
                let (span, expression) = match part {
                    AttributeValuePart::Text(text) => ((text.start, text.end), None),
                    AttributeValuePart::ExpressionTag(tag) => {
                        ((tag.start, tag.end), span_of(&tag.expression))
                    }
                };
                if contains(span, offset) {
                    push(spans, span);
                    if let Some(expression) = expression {
                        push(spans, expression);
                    }
                    return;
                }
            }
        }
    }
}

/// Where an element's start tag ends, so that an attribute can grow to the
/// whole opener before it grows to the element.
fn open_tag_end(text: &str, node: &View<'_>) -> Option<u32> {
    let Kind::Element(name) = node.kind else {
        return None;
    };
    let from = node
        .attributes
        .last()
        .map_or(node.start as usize + 1 + name.len(), |attribute| {
            attribute_span(attribute).1 as usize
        });
    let rest = text.get(from..node.end as usize)?;
    Some((from + rest.find('>')? + 1) as u32)
}

fn attribute_span(attribute: &Attribute<'_>) -> Span {
    match attribute {
        Attribute::Attribute(node) => (node.start, node.end),
        Attribute::SpreadAttribute(node) => (node.start, node.end),
        Attribute::AttachTag(node) => (node.start, node.end),
        Attribute::BindDirective(node) => (node.start, node.end),
        Attribute::OnDirective(node) => (node.start, node.end),
        Attribute::ClassDirective(node) => (node.start, node.end),
        Attribute::StyleDirective(node) => (node.start, node.end),
        Attribute::TransitionDirective(node) => (node.start, node.end),
        Attribute::AnimateDirective(node) => (node.start, node.end),
        Attribute::UseDirective(node) => (node.start, node.end),
        Attribute::LetDirective(node) => (node.start, node.end),
    }
}

fn contains((start, end): Span, offset: usize) -> bool {
    (start as usize..=end as usize).contains(&offset)
}

/// A span that adds nothing to the chain — an element whose start tag is the
/// whole element, an expression filling its tag — would only make the client
/// expand the selection to the same text twice.
fn push(spans: &mut Vec<Span>, span: Span) {
    if spans.last() != Some(&span) {
        spans.push(span);
    }
}

fn nest(text: &str, index: &LineIndex, spans: &[Span], offset: usize) -> SelectionRange {
    let mut nested: Option<SelectionRange> = None;
    for &(start, end) in spans {
        nested = Some(SelectionRange {
            range: Range::new(
                index.position(text, start as usize),
                index.position(text, end as usize),
            ),
            parent: nested.map(Box::new),
        });
    }
    nested.unwrap_or_else(|| {
        let position = index.position(text, offset);
        SelectionRange {
            range: Range::new(position, position),
            parent: None,
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use lsp_types::Position;

    /// The ranges around the cursor, innermost first.
    fn at(text: &str, offset: usize) -> Vec<Range> {
        let mut ranges = Vec::new();
        let mut node = selection_ranges(text, &[offset]).map(|mut r| r.remove(0));
        while let Some(current) = node {
            ranges.push(current.range);
            node = current.parent.map(|parent| *parent);
        }
        ranges
    }

    fn range(start: (u32, u32), end: (u32, u32)) -> Range {
        Range::new(Position::new(start.0, start.1), Position::new(end.0, end.1))
    }

    #[test]
    fn nothing_inside_style_or_script() {
        assert_eq!(selection_ranges("<style>x</style>", &[7]), None);
        assert_eq!(selection_ranges("<script>x</script>", &[8]), None);
    }

    #[test]
    fn an_attribute_value_grows_to_the_attribute_then_the_element() {
        // `<h1 title="foo"></h1>`, cursor inside `foo`, as the official test
        // spells it — with the start tag added between value and element.
        let text = "<h1 title=\"foo\"></h1>";
        assert_eq!(
            at(text, 13),
            vec![
                range((0, 11), (0, 14)),
                range((0, 4), (0, 15)),
                range((0, 0), (0, 16)),
                range((0, 0), (0, 21)),
            ]
        );
    }

    #[test]
    fn text_in_a_block_grows_to_the_block() {
        let text = "{#if a > 1}foo{/if}";
        assert_eq!(
            at(text, 11),
            vec![range((0, 11), (0, 14)), range((0, 0), (0, 19))]
        );
    }

    #[test]
    fn a_block_expression_is_its_own_step() {
        let text = "{#if a > 1}foo{/if}";
        assert_eq!(
            at(text, 6),
            vec![range((0, 5), (0, 10)), range((0, 0), (0, 19))]
        );
    }

    #[test]
    fn nesting_is_reported_from_the_inside_out() {
        let text = "<div>\n  <p>hi</p>\n</div>";
        let ranges = at(text, text.find("hi").unwrap());
        assert_eq!(
            ranges,
            vec![
                range((1, 5), (1, 7)),
                range((1, 2), (1, 11)),
                range((0, 0), (2, 6)),
            ]
        );
    }

    #[test]
    fn an_interpolation_inside_an_attribute_value() {
        let text = "<a href=\"/x/{id}\">go</a>";
        let ranges = at(text, text.find("id").unwrap());
        assert_eq!(ranges[0], range((0, 13), (0, 15)), "the identifier");
        assert_eq!(ranges[1], range((0, 12), (0, 16)), "the interpolation");
        assert_eq!(ranges[2], range((0, 3), (0, 17)), "the attribute");
    }

    #[test]
    fn an_attribute_name_grows_to_the_start_tag_not_to_the_value() {
        let text = "<button onclick={go}>x</button>";
        let ranges = at(text, text.find("onclick").unwrap() + 2);
        assert_eq!(ranges[0], range((0, 8), (0, 20)), "the attribute");
        assert_eq!(ranges[1], range((0, 0), (0, 21)), "the start tag");
        assert_eq!(ranges[2], range((0, 0), (0, 31)), "the element");
    }

    #[test]
    fn a_self_closing_element_does_not_repeat_itself() {
        // The start tag is the whole element here, so it is not a step of its
        // own.
        let text = "<input value=\"a\" />";
        let ranges = at(text, 14);
        assert_eq!(
            ranges,
            vec![
                range((0, 14), (0, 15)),
                range((0, 7), (0, 16)),
                range((0, 0), (0, 19)),
            ]
        );
    }

    #[test]
    fn several_positions_are_answered_in_order() {
        let text = "<p>a</p><div>b</div>";
        let ranges = selection_ranges(text, &[3, 13]).unwrap();
        assert_eq!(ranges.len(), 2);
        assert_eq!(ranges[0].range, range((0, 3), (0, 4)));
        assert_eq!(ranges[1].range, range((0, 13), (0, 14)));
    }

    #[test]
    fn a_position_with_nothing_around_it_collapses_to_the_cursor() {
        // The second position is on a `<script>` tag, which the template AST
        // does not carry — and which is therefore left to the future
        // TypeScript provider rather than answered with the wrong thing.
        let text = "<p>a</p><script>let a;</script>";
        let ranges = selection_ranges(text, &[3, 10]).unwrap();
        assert_eq!(ranges[0].range, range((0, 3), (0, 4)));
        assert_eq!(ranges[1].range, range((0, 10), (0, 10)));
        assert!(ranges[1].parent.is_none());
    }

    #[test]
    fn astral_text_is_measured_in_utf16() {
        let text = "<p>💡ab</p>";
        let ranges = at(text, text.find('a').unwrap());
        assert_eq!(ranges[0], range((0, 3), (0, 7)));
    }

    #[test]
    fn an_unreadable_document_answers_nothing() {
        // A stray closing tag is one of the few things loose parsing still
        // refuses.
        assert_eq!(selection_ranges("<div>x</div>\n</span>", &[6]), None);
    }

    #[test]
    fn no_input_panics() {
        for text in crate::nodes::tests_support::BROKEN {
            // Every offset of every broken document, boundaries included.
            for offset in 0..=text.len() {
                let Some(ranges) = selection_ranges(text, &[offset]) else {
                    continue;
                };
                assert_eq!(ranges.len(), 1, "{text:?} at {offset}");
                assert!(ranges[0].range.start <= ranges[0].range.end);
            }
        }
    }

    #[test]
    fn a_document_being_typed_still_answers() {
        for text in [
            "<div>\n  <p>hi\n",
            "{#if a}\n  <p>x</p>\n",
            "<div attr=\"",
            "{#each items as }x{/each}",
            "<script>const a = {\n</script><p>x</p>",
        ] {
            let offset = text.find("x").or_else(|| text.find("hi")).unwrap_or(1);
            assert!(
                selection_ranges(text, &[offset]).is_some(),
                "{text:?} should still answer"
            );
        }
    }
}
