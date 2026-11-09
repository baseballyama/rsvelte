//! The start and end tags of a component, `<script>` and `<style>` included, and token queries
//! over them, for the rules that check markup layout.

use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::{Token, Tokens};
use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, Component, TagAttributes, TemplateNode, TokenType,
};

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
                    value.end_offset + u32::from(raw_value_is_quoted(tokens, value))
                }),
            ),
            key: name,
            template: None,
        });
        template.chain(raw)
    }
}

/// Whether a `<script>` or `<style>` attribute's value has quotes around it.
pub(super) fn raw_value_is_quoted(tokens: &Tokens<TokenType>, value: Span) -> bool {
    tokens
        .until_offset(value.start_offset)
        .last()
        .is_some_and(|token| {
            token.kind == TokenType::Quote && token.span.end_offset == value.start_offset
        })
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

/// JavaScript's `\s`: Unicode `White_Space` without U+0085, with U+FEFF.
pub(super) const fn is_javascript_whitespace(c: char) -> bool {
    (c.is_whitespace() && c != '\u{85}') || c == '\u{feff}'
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
