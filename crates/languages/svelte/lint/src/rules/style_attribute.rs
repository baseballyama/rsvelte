//! Inline styles: a `style` attribute's value and the string literals in its expressions, as
//! `PostCSS` declarations. The rules that read inline styles share them.

use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet::postcss::{self, InlineNode};
use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part,
};
use rsvelte_typescript::syntax_tree::{Kind, Tag};
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_svelte::Parsed;

use super::markup::part_span;
use crate::rule::File;

/// The inline style of every `style` attribute, by index in [`Component::attributes`]; `None` for
/// one that has no value or holds what upstream does not convert.
#[derive(Debug)]
pub(crate) struct InlineStyles;

impl Artifact for InlineStyles {
    type Output = Vec<(u32, Option<Box<[InlineNode]>>)>;

    const NAME: &'static str = "svelte.lint.inline_styles";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context
            .get::<Parsed>()
            .as_ref()
            .expect("lint requests inline styles after parsing");
        inline_styles(component, context.source_text())
    }
}

/// Whether `attribute` is a `style="…"` or `style={…}` attribute.
pub(super) fn is_style(attribute: &Attribute, source: &str) -> bool {
    attribute.kind == AttributeKind::Attribute
        && !attribute.shorthand
        && attribute.name.text(source) == "style"
}

/// The inline style of the `style` attribute at `index` in [`Component::attributes`]; `None` when
/// it has no value or holds what upstream does not convert (a rule, an at-rule, a hole in a
/// comment).
pub(super) fn inline_style<'a>(file: &File<'a>, index: usize) -> Option<&'a [InlineNode]> {
    let styles = file.context.get::<InlineStyles>();
    let at = styles
        .binary_search_by_key(&(index as u32), |(attribute, _)| *attribute)
        .ok()?;
    styles[at].1.as_deref()
}

fn inline_styles(component: &Component, source: &str) -> Vec<(u32, Option<Box<[InlineNode]>>)> {
    let mut holes = Vec::new();
    component
        .attributes
        .iter()
        .enumerate()
        .filter(|(_, attribute)| is_style(attribute, source))
        .map(|(index, attribute)| {
            let style = match attribute.value {
                AttributeValue::Parts(parts) => match component.parts(parts) {
                    [] => None,
                    parts @ ([first, .., last] | [first @ last]) => {
                        holes.clear();
                        holes.extend(parts.iter().filter_map(|part| match part {
                            Part::Expression { span, .. } => Some(*span),
                            Part::Text(_) => None,
                        }));
                        let content =
                            Span::new(part_span(first).start_offset, part_span(last).end_offset);
                        postcss::inline(source, content, &holes).map(Vec::into_boxed_slice)
                    }
                },
                AttributeValue::True => None,
            };
            (index as u32, style)
        })
        .collect()
}

/// The expression of hole `index` of a `style` attribute: its `index`th expression part.
pub(super) fn expression_of_hole(
    component: &Component,
    attribute: &Attribute,
    index: u32,
) -> NodeIdentifier {
    let AttributeValue::Parts(parts) = attribute.value else {
        unreachable!("a hole is a part of the value");
    };
    component
        .parts(parts)
        .iter()
        .filter_map(|part| match *part {
            Part::Expression { expression, .. } => Some(expression),
            Part::Text(_) => None,
        })
        .nth(index as usize)
        .expect("a hole is an expression part")
}

/// The string and template literals `expression` may evaluate to, through conditionals and
/// logical operators.
pub(super) fn literals(
    javascript: &SyntaxTree,
    expression: NodeIdentifier,
    out: &mut Vec<NodeIdentifier>,
) {
    match javascript.kind(expression) {
        Kind::String | Kind::Template { .. } => out.push(expression),
        Kind::Conditional {
            consequent,
            alternate,
            ..
        } => {
            literals(javascript, consequent, out);
            literals(javascript, alternate, out);
        }
        Kind::Logical(_, left, right) => {
            literals(javascript, left, out);
            literals(javascript, right, out);
        }
        _ => {}
    }
}

/// The inline style a string or template literal holds; a template's expressions are holes.
pub(super) fn literal_style(
    javascript: &SyntaxTree,
    source: &str,
    literal: NodeIdentifier,
) -> Option<Vec<InlineNode>> {
    let span = javascript.source_location(literal).span()?;
    let content = Span::new(span.start_offset + 1, span.end_offset - 1);
    let holes: Vec<Span> = match javascript.kind(literal) {
        Kind::Template { quasis, .. } => quasis
            .windows(2)
            .filter_map(|pair| {
                let before = javascript.source_location(pair[0]).span()?;
                let after = javascript.source_location(pair[1]).span()?;
                Some(Span::new(before.end_offset, after.start_offset))
            })
            .collect(),
        _ if javascript.tag(literal) == Tag::String => Vec::new(),
        _ => return None,
    };
    postcss::inline(source, content, &holes)
}

/// A declared property: its name and where it is.
pub(super) type Property<'a> = (&'a str, Span);

/// The properties a start tag declares, in sets: one per `style:` directive and per declaration,
/// and one for each expression of a `style` attribute (what all its literals declare).
pub(super) fn property_sets<'a>(
    file: &File<'a>,
    attributes: rsvelte_svelte::syntax::syntax_tree::Range,
    mut visit: impl FnMut(&[Property<'a>]),
) {
    let component = file.component().expect("a component rule");
    let source = file.source();
    let mut set = Vec::new();
    for (offset, attribute) in component.attributes(attributes).iter().enumerate() {
        if attribute.kind == AttributeKind::Style {
            let name = attribute
                .directive_name(&component.modifiers)
                .expect("a directive has a name");
            visit(&[(name.text(source), name)]);
        } else if is_style(attribute, source)
            && let Some(nodes) = inline_style(file, attributes.start as usize + offset)
        {
            for node in nodes {
                match node {
                    InlineNode::Declaration(declaration) => {
                        visit(&[(declaration.property.text(source), declaration.property)]);
                    }
                    InlineNode::Hole { index, .. } => {
                        set.clear();
                        let expression = expression_of_hole(component, attribute, *index);
                        expression_properties(&component.javascript, source, expression, &mut set);
                        visit(&set);
                    }
                    InlineNode::Comment(_) => {}
                }
            }
        }
    }
}

/// The declarations of every literal `expression` may be, and of the literals its templates'
/// expressions may be.
fn expression_properties<'a>(
    javascript: &SyntaxTree,
    source: &'a str,
    expression: NodeIdentifier,
    out: &mut Vec<Property<'a>>,
) {
    let mut found = Vec::new();
    literals(javascript, expression, &mut found);
    for literal in found {
        let Some(nodes) = literal_style(javascript, source, literal) else {
            continue;
        };
        for node in nodes {
            match node {
                InlineNode::Declaration(d) => out.push((d.property.text(source), d.property)),
                InlineNode::Hole { index, .. } => {
                    if let Kind::Template { expressions, .. } = javascript.kind(literal) {
                        expression_properties(javascript, source, expressions[index as usize], out);
                    }
                }
                InlineNode::Comment(_) => {}
            }
        }
    }
}
