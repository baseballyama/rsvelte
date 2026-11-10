//! The markup as `svelte-eslint-parser` sorts it: HTML elements, `SvelteAttribute`s, attribute
//! values with their quotes, the mustache tags (`SvelteMustacheTag`) of a component, and its start
//! and end tags, `<script>` and `<style>` included, with token queries over them.

use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::{Token, Tokens};
use rsvelte_svelte_syntax::names::is_component_name;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TagAttributes, TemplateNode,
    TokenType,
};
use rsvelte_typescript_syntax::{NodeIdentifier, SyntaxTree};

/// `kind: "html"`: neither a component nor a `svelte:` element.
pub(super) fn is_html(name: &str) -> bool {
    !name.starts_with("svelte:") && !is_component_name(name)
}

/// A `SvelteAttribute`: `a`, `a="…"` or `a={…}`. Not `{a}`, and not a
/// [special `this`](is_special_this).
pub(super) fn is_attribute(
    component: &Component,
    source: &str,
    element: &str,
    attribute: &Attribute,
) -> bool {
    attribute.kind == AttributeKind::Attribute
        && !attribute.shorthand
        && !is_special_this(component, source, element, attribute)
}

/// Whether `svelte-eslint-parser` reads `attribute` of the element named `element` as a special
/// directive rather than an attribute: `this={…}`, quoted or not, on `<svelte:element>` or
/// `<svelte:component>`.
pub(super) fn is_special_this(
    component: &Component,
    source: &str,
    element: &str,
    attribute: &Attribute,
) -> bool {
    matches!(element, "svelte:element" | "svelte:component")
        && attribute.kind == AttributeKind::Attribute
        && !attribute.shorthand
        && attribute.name.text(source) == "this"
        && matches!(parts(component, attribute), [Part::Expression { .. }])
}

/// The value's parts; none for a value-less attribute.
pub(super) fn parts<'a>(component: &'a Component, attribute: &Attribute) -> &'a [Part] {
    match attribute.value {
        AttributeValue::Parts(parts) => component.parts(parts),
        AttributeValue::True => &[],
    }
}

/// A part's span.
pub(super) const fn part_span(part: &Part) -> Span {
    match *part {
        Part::Text(span) | Part::Expression { span, .. } => span,
    }
}

/// The quote token that ends at `offset`: the opening quote of a value that starts there.
pub(super) fn quote_before(tokens: &Tokens<TokenType>, offset: u32) -> Option<&Token<TokenType>> {
    tokens.until_offset(offset).last().filter(|token| {
        matches!(token.kind, TokenType::DoubleQuote | TokenType::SingleQuote)
            && token.span.end_offset == offset
    })
}

/// The opening quote token of a written value.
fn opening_quote<'a>(
    component: &'a Component,
    attribute: &Attribute,
) -> Option<&'a Token<TokenType>> {
    if !attribute.quoted {
        return None;
    }
    let first = parts(component, attribute).first()?;
    quote_before(&component.tokens, part_span(first).start_offset)
}

/// The quote around a written value: `"` or `'`.
pub(super) fn quote<'s>(
    component: &Component,
    source: &'s str,
    attribute: &Attribute,
) -> Option<&'s str> {
    opening_quote(component, attribute).map(|token| token.span.text(source))
}

/// From the opening quote, or the first part of an unquoted value, to the end of the attribute;
/// `None` without `= value`.
pub(super) fn value_span(component: &Component, attribute: &Attribute) -> Option<Span> {
    if attribute.shorthand {
        return None;
    }
    let first = parts(component, attribute).first()?;
    let start = if attribute.quoted {
        opening_quote(component, attribute)?.span.start_offset
    } else {
        part_span(first).start_offset
    };
    Some(Span::new(start, attribute.span.end_offset))
}

/// Whether a comment starts inside `span`.
pub(super) fn has_comment(javascript: &SyntaxTree, span: Span) -> bool {
    let comments = &javascript.comments;
    let at = comments.partition_point(|comment| comment.start_offset < span.start_offset);
    comments
        .get(at)
        .is_some_and(|comment| comment.start_offset < span.end_offset)
}

/// What holds a mustache tag.
#[derive(Clone, Copy)]
pub(super) enum Holder<'a> {
    /// `{expression}` in the template.
    Text,
    /// `{@html expression}`.
    Raw,
    /// A part of a [`SvelteAttribute`](is_attribute)'s value.
    Attribute(&'a Attribute),
    /// A part of a `style:` directive's value.
    Style(&'a Attribute),
}

/// A `SvelteMustacheTag`: its expression, its span (braces included) and what holds it.
#[derive(Clone, Copy)]
pub(super) struct Mustache<'a> {
    pub expression: NodeIdentifier,
    pub span: Span,
    pub holder: Holder<'a>,
}

/// Calls `f` on each mustache tag of the component.
pub(super) fn for_each_mustache<'a>(
    component: &'a Component,
    source: &str,
    mut f: impl FnMut(Mustache<'a>),
) {
    for node in &component.nodes {
        match *node {
            TemplateNode::Expression { expression, span } => f(Mustache {
                expression,
                span,
                holder: Holder::Text,
            }),
            TemplateNode::Html { expression, span } => f(Mustache {
                expression,
                span,
                holder: Holder::Raw,
            }),
            TemplateNode::Element {
                name, attributes, ..
            } => {
                let element = name.text(source);
                for attribute in component.attributes(attributes) {
                    let holder = if is_attribute(component, source, element, attribute) {
                        Holder::Attribute(attribute)
                    } else if attribute.kind == AttributeKind::Style && !attribute.shorthand {
                        Holder::Style(attribute)
                    } else {
                        continue;
                    };
                    for part in parts(component, attribute) {
                        if let Part::Expression { expression, span } = *part {
                            f(Mustache {
                                expression,
                                span,
                                holder,
                            });
                        }
                    }
                }
            }
            _ => {}
        }
    }
}

/// `<name …>` or `<name … />`.
pub(super) struct StartTag<'a> {
    pub(super) span: Span,
    pub(super) name: Span,
    pub(super) self_closing: bool,
    pub(super) attributes: Attributes<'a>,
}

pub(super) enum Attributes<'a> {
    Template(&'a [Attribute]),
    /// A `<script>` or `<style>` tag's: name and unquoted value.
    Raw(&'a [TagAttributes]),
}

/// One attribute as layout sees it.
#[derive(Clone, Copy)]
pub(super) struct TagAttribute<'a> {
    pub(super) span: Span,
    /// The name as written; the whole attribute for a spread or an `{@attach}`.
    pub(super) key: Span,
    /// `None` for an attribute of `<script>` or `<style>`.
    pub(super) template: Option<&'a Attribute>,
}

impl<'a> StartTag<'a> {
    pub(super) fn attributes(
        &self,
        tokens: &'a Tokens<TokenType>,
    ) -> impl DoubleEndedIterator<Item = TagAttribute<'a>> + 'a {
        let (template, raw): (&'a [Attribute], &'a [TagAttributes]) = match self.attributes {
            Attributes::Template(attributes) => (attributes, &[]),
            Attributes::Raw(attributes) => (&[], attributes),
        };
        let template = template.iter().map(|attribute| TagAttribute {
            span: attribute.span,
            key: if matches!(
                attribute.kind,
                AttributeKind::Spread | AttributeKind::Attach
            ) {
                attribute.span
            } else {
                attribute.name
            },
            template: Some(attribute),
        });
        let raw = raw.iter().map(move |&(name, value)| TagAttribute {
            span: Span::new(
                name.start_offset,
                value.map_or(name.end_offset, |value| {
                    value.end_offset + u32::from(quote_before(tokens, value.start_offset).is_some())
                }),
            ),
            key: name,
            template: None,
        });
        template.chain(raw)
    }
}

/// Every start tag, in no particular order.
pub(super) fn start_tags(component: &Component) -> impl Iterator<Item = StartTag<'_>> {
    let elements = component.nodes.iter().filter_map(|node| {
        let TemplateNode::Element {
            name,
            attributes,
            start_tag,
            self_closing,
            ..
        } = node
        else {
            return None;
        };
        Some(StartTag {
            span: *start_tag,
            name: *name,
            self_closing: *self_closing,
            attributes: Attributes::Template(component.attributes(*attributes)),
        })
    });
    let scripts = [&component.module, &component.instance]
        .into_iter()
        .flatten()
        .map(|script| (script.span, &*script.attributes));
    let style = component
        .style
        .iter()
        .map(|style| (style.span, &*style.attributes));
    let raw = scripts.chain(style).map(|(span, attributes)| {
        let tokens = component.tokens.from_offset(span.start_offset);
        let end = tokens
            .iter()
            .find(|token| token.kind == TokenType::TagEnd)
            .expect("a script or style start tag ends with `>`");
        StartTag {
            span: Span::new(span.start_offset, end.span.end_offset),
            name: tokens[1].span,
            self_closing: false,
            attributes: Attributes::Raw(attributes),
        }
    });
    elements.chain(raw)
}

/// Every end tag `</name>`, in document order.
pub(super) fn end_tags(tokens: &Tokens<TokenType>) -> impl Iterator<Item = Span> + '_ {
    let all = tokens.from_offset(0);
    all.iter()
        .enumerate()
        .filter(|(_, open)| open.kind == TokenType::EndTagOpen)
        .map(move |(i, open)| {
            let end = all[i..]
                .iter()
                .find(|token| token.kind == TokenType::TagEnd)
                .expect("an end tag ends with `>`");
            Span::new(open.span.start_offset, end.span.end_offset)
        })
}

/// The last token of a tag: `>` or `/>`.
pub(super) fn closing_token(tokens: &Tokens<TokenType>, tag: Span) -> &Token<TokenType> {
    tokens
        .until_offset(tag.end_offset)
        .last()
        .expect("a tag has tokens")
}

/// The whitespace that ends at `offset`, empty at `offset` when there is none.
pub(super) fn whitespace_before(tokens: &Tokens<TokenType>, offset: u32) -> Span {
    let start = tokens
        .until_offset(offset)
        .iter()
        .rev()
        .take_while(|token| token.kind == TokenType::Whitespace)
        .last()
        .map_or(offset, |token| token.span.start_offset);
    Span::new(start, offset)
}

/// The whitespace that starts at `offset`, empty at `offset` when there is none.
pub(super) fn whitespace_after(tokens: &Tokens<TokenType>, offset: u32) -> Span {
    let end = tokens
        .from_offset(offset)
        .iter()
        .take_while(|token| token.kind == TokenType::Whitespace)
        .last()
        .map_or(offset, |token| token.span.end_offset);
    Span::new(offset, end)
}
