use oxc_ast::ast::Expression;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_stylesheet_syntax::postcss::InlineNode;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, TemplateNode};
use rsvelte_typescript_tree::ExpressionIdentifier;
use rustc_hash::{FxHashMap, FxHashSet};

use super::element_kind::is_markup_like;
use super::nodes;
use super::style_attribute::{expression_of_hole, inline_style, is_style, literal_style};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-style-directive",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(PreferStyleDirective))
}

#[derive(Debug)]
struct PreferStyleDirective;

const MESSAGE: &str = "Can use style directives instead.";

impl SvelteRule for PreferStyleDirective {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let mut directives = FxHashSet::default();
        let mut properties = FxHashMap::default();
        for node in &component.nodes {
            let TemplateNode::Element { attributes, .. } = node else {
                continue;
            };
            if !is_markup_like(node, source) {
                continue;
            }
            let all = component.attributes(*attributes);
            directives.clear();
            directives.extend(
                all.iter()
                    .filter(|attribute| attribute.kind == AttributeKind::Style)
                    .map(|attribute| {
                        attribute
                            .directive_name(&component.modifiers)
                            .expect("a directive has a name")
                            .text(source)
                    }),
            );
            for (offset, attribute) in all.iter().enumerate() {
                if !is_style(attribute, source) {
                    continue;
                }
                let Some(nodes) = inline_style(file, attributes.start as usize + offset) else {
                    continue;
                };
                let directive = |name: &str| directives.contains(name);
                properties.clear();
                let mut candidates = Vec::new();
                for (index, node) in nodes.iter().enumerate() {
                    match node {
                        InlineNode::Declaration(declaration) => {
                            let property = declaration.property.text(source);
                            *properties.entry(property.to_ascii_lowercase()).or_insert(0) += 1;
                            if declaration.important
                                || declaration.property_holes > 0
                                || declaration.other_holes > 0
                                || directive(property)
                            {
                                continue;
                            }
                            let value = declaration.value_text(source);
                            // A double quote would end the directive's value.
                            let text = (!value.contains('"'))
                                .then(|| format!("style:{property}=\"{value}\""));
                            candidates.push((index, declaration.span, property, text));
                        }
                        InlineNode::Hole { index: hole, .. } => {
                            let expression = expression_of_hole(component, attribute, *hole);
                            let Some((span, property, text)) =
                                conditional(file, expression, &directive)
                            else {
                                continue;
                            };
                            *properties.entry(property.to_ascii_lowercase()).or_insert(0) += 1;
                            candidates.push((index, span, property, Some(text)));
                        }
                        InlineNode::Comment(_) => {}
                    }
                }
                for (index, span, property, text) in candidates {
                    let mut report = Report::range(MESSAGE, span);
                    // A directive wins over the attribute, so a property the style sets twice
                    // would take another value.
                    if let Some(text) = text
                        && properties[&property.to_ascii_lowercase()] == 1
                    {
                        report = report.fix(replace(attribute, nodes, index, &text));
                    }
                    reporter.report(report.message_id("unexpected"));
                }
            }
        }
    }
}

/// `{test ? 'property: value' : ''}` as a directive: its span, the property and
/// `style:property={…}`.
fn conditional<'s>(
    file: &File<'s>,
    expression: ExpressionIdentifier,
    directive: &impl Fn(&str) -> bool,
) -> Option<(Span, &'s str, String)> {
    let source = file.source();
    let expression = file.javascript().get_expression(expression);
    let Expression::ConditionalExpression(conditional) = expression else {
        return None;
    };
    let (Expression::StringLiteral(when_true), Expression::StringLiteral(when_false)) =
        (&conditional.consequent, &conditional.alternate)
    else {
        return None;
    };
    let positive = when_false.value.is_empty();
    if !positive && !when_true.value.is_empty() {
        return None;
    }
    let literal = if positive {
        &conditional.consequent
    } else {
        &conditional.alternate
    };
    let nodes = literal_style(source, literal)?;
    let [InlineNode::Declaration(declaration)] = nodes.as_slice() else {
        return None;
    };
    let property = declaration.property.text(source);
    if directive(property) {
        return None;
    }
    let (test, consequent, alternate) = (
        nodes::span(&conditional.test),
        nodes::span(&conditional.consequent),
        nodes::span(&conditional.alternate),
    );
    let quoted = |literal: Span| {
        let quotes = literal.text(source);
        format!(
            "{}{}{}",
            &quotes[..1],
            declaration.value_text(source),
            &quotes[quotes.len() - 1..]
        )
    };
    let between =
        |from: Span, to: Span| &source[from.end_offset as usize..to.start_offset as usize];
    let value = format!(
        "{}{}{}{}",
        &source[test.start_offset as usize..consequent.start_offset as usize],
        if positive {
            quoted(consequent)
        } else {
            "null".to_owned()
        },
        between(consequent, alternate),
        if positive {
            "null".to_owned()
        } else {
            quoted(alternate)
        },
    );
    let important = if declaration.important {
        "|important"
    } else {
        ""
    };
    Some((
        nodes::span(expression),
        property,
        format!("style:{property}{important}={{{value}}}"),
    ))
}

/// Moves node `index` of the style out of `attribute` and into a directive `text`.
fn replace(attribute: &Attribute, nodes: &[InlineNode], index: usize, text: &str) -> Fix {
    if nodes.len() == 1 {
        return Fix::replace(attribute.span, text);
    }
    let span = nodes[index].span();
    let removed = nodes.get(index + 1).map_or_else(
        || Span::new(nodes[index - 1].span().end_offset, span.end_offset),
        |after| Span::new(span.start_offset, after.span().start_offset),
    );
    let mut fix = Fix::remove(removed);
    if index == 0 {
        fix.push(
            Span::new(attribute.span.start_offset, attribute.span.start_offset),
            format!("{text} "),
        );
    } else {
        fix.push(
            Span::new(attribute.span.end_offset, attribute.span.end_offset),
            format!(" {text}"),
        );
    }
    fix
}
