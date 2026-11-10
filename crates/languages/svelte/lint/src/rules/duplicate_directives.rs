//! Directives of one start tag that repeat each other: the same key and the same expression, or
//! both without one.

use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{Attribute, Component, Part, TemplateNode};
use rsvelte_typescript_syntax::NodeIdentifier;

use super::expressions::Expressions;
use super::markup::parts;

/// Reports every directive that `key` selects and another directive of its start tag repeats.
/// `key` gives a directive's key text, or `None` for an attribute that is not one;
/// `message(key, line)` names the key and the line of the first other copy.
pub(super) fn report_duplicates<'s>(
    component: &Component,
    source: &'s str,
    reporter: &mut Reporter<'_>,
    key: impl Fn(&Attribute) -> Option<&'s str>,
    message: impl Fn(&str, u32) -> String,
) {
    let expressions = Expressions::new(&component.javascript, source);
    let mut lines = None;
    let mut groups: Vec<(&str, Option<NodeIdentifier>, Vec<Span>)> = Vec::new();
    for node in &component.nodes {
        let TemplateNode::Element { attributes, .. } = *node else {
            continue;
        };
        groups.clear();
        for attribute in component.attributes(attributes) {
            let Some(key) = key(attribute) else {
                continue;
            };
            let expression = match *parts(component, attribute) {
                [Part::Expression { expression, .. }] => Some(expression),
                _ => None,
            };
            let same = groups.iter_mut().find(|(other, other_expression, _)| {
                *other == key
                    && match (*other_expression, expression) {
                        (Some(a), Some(b)) => expressions.equal_tokens(a, b),
                        (a, b) => a == b,
                    }
            });
            match same {
                Some((_, _, spans)) => spans.push(attribute.span),
                None => groups.push((key, expression, vec![attribute.span])),
            }
        }
        for (key, _, spans) in &groups {
            if spans.len() < 2 {
                continue;
            }
            let lines = lines.get_or_insert_with(|| LineIndex::new(source));
            for (index, &span) in spans.iter().enumerate() {
                let other = spans[usize::from(index == 0)];
                let line = lines.line_column(other.start_offset).line;
                reporter.report(Report::range(message(key, line), span).message_id("duplication"));
            }
        }
    }
}
