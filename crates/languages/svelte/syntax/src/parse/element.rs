use oxc_ast::ast::{Expression, IdentifierName};
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{End, ParseResult, Parser, is_void};
use crate::names::{META_TAGS, is_component_name, is_valid_element_name};
use crate::syntax_tree::{Range, TemplateNode, TemplateNodeIdentifier, TokenType};

/// Upstream `read_tag_name`: up to whitespace, `/` or `>`.
pub(super) fn peek_tag_name(s: &str) -> &str {
    let end = s
        .find(|c| is_ecmascript_whitespace(c) || matches!(c, '/' | '>'))
        .unwrap_or(s.len());
    &s[..end]
}

const TAG_INVALID_NAME: &str = "Expected a valid element or component name. Components must have \
                                a valid variable name or dot notation expression";

/// Upstream's root-only meta tags.
const ROOT_ONLY_META_TAGS: &[&str] = &[
    "svelte:head",
    "svelte:options",
    "svelte:window",
    "svelte:document",
    "svelte:body",
];

impl<'a> Parser<'a, '_> {
    pub(super) fn element(&mut self, at_root: bool) -> ParseResult<Option<TemplateNodeIdentifier>> {
        let start_offset = self.position;
        self.eat_token(TokenType::TagOpen, 1);
        let name = self.tag_name();
        let name_text = name.text(self.source_text);
        if name.is_empty() {
            if self.rest().is_empty() {
                return self.unexpected_eof();
            }
            return self.err("tag_invalid_name", TAG_INVALID_NAME);
        }
        if at_root && matches!(name_text, "script" | "style") {
            self.script_or_style(start_offset, name_text)?;
            return Ok(None);
        }
        if name_text.starts_with("svelte:") && !META_TAGS.contains(&name_text) {
            return Self::err_at(
                name,
                "svelte_meta_invalid_tag",
                "Valid `<svelte:...>` tag names are svelte:head, svelte:options, svelte:window, \
                 svelte:document, svelte:body, svelte:element, svelte:component, svelte:self, \
                 svelte:fragment or svelte:boundary",
            );
        }
        let component_name = is_component_name(name_text);
        if !is_valid_element_name(name_text) && !component_name {
            return Self::err_at(name, "tag_invalid_name", TAG_INVALID_NAME);
        }
        if let Some(index) = ROOT_ONLY_META_TAGS.iter().position(|t| *t == name_text) {
            let start = Span::new(start_offset as u32, start_offset as u32);
            if self.meta_tags & (1 << index) != 0 {
                return Self::err_at(
                    start,
                    "svelte_meta_duplicate",
                    format_args!("A component can only have one `<{name_text}>` element"),
                );
            }
            if !at_root {
                return Self::err_at(
                    start,
                    "svelte_meta_invalid_placement",
                    format_args!("`<{name_text}>` tags cannot be inside elements or blocks"),
                );
            }
            self.meta_tags |= 1 << index;
        }
        let component = component_name
            .then(|| self.component_reference(name))
            .flatten();
        let (attributes, self_closing) = self.attributes()?;
        let start_tag = Span::new(start_offset as u32, self.position as u32);
        let regular = !name_text.starts_with("svelte:") && !component_name;
        let (children, end_tag) = if self_closing || is_void(name_text) {
            (self.empty_range(), false)
        } else if name_text == "textarea" {
            self.textarea_children()?
        } else if matches!(name_text, "script" | "style") {
            self.raw_children(name_text)?
        } else {
            let children = self.fragment(End::Tag {
                name: name_text,
                regular,
                start: start_offset as u32,
            })?;
            (children, self.end_tag(name_text, regular)?)
        };
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(Some(self.push_node(TemplateNode::Element {
            name,
            component,
            attributes,
            children,
            start_tag,
            self_closing,
            end_tag,
            span,
        })))
    }

    /// What a component's name refers to: `Foo`, or the member chain `ui.Button`.
    fn component_reference(&mut self, name: Span) -> Option<ExpressionIdentifier> {
        let text: &'a str = name.text(self.source_text);
        if text.split('.').any(str::is_empty) {
            return None;
        }
        let nodes = self.builder.nodes();
        let span_of = |offset: u32, part: &str| {
            let end = offset + u32::try_from(part.len()).expect("source positions use u32 bytes");
            oxc_span::Span::new(offset, end)
        };
        let mut parts = text.split('.');
        let first = parts.next()?;
        let mut span = span_of(name.start_offset, first);
        let mut reference = Expression::new_identifier(span, first, &nodes);
        for part in parts {
            span = span_of(span.end + 1, part);
            reference = Expression::new_static_member_expression(
                oxc_span::Span::new(name.start_offset, span.end),
                reference,
                IdentifierName::new(span, part, &nodes),
                false,
                &nodes,
            );
        }
        Some(self.builder.keep_expression(reference))
    }

    pub(super) fn tag_name(&mut self) -> Span {
        let start_offset = self.position;
        self.position += peek_tag_name(self.rest()).len();
        self.token(TokenType::TagName, start_offset);
        Span::new(start_offset as u32, self.position as u32)
    }

    fn end_tag(&mut self, name: &str, regular: bool) -> ParseResult<bool> {
        let rest = self.rest();
        let Some(after) = rest.strip_prefix("</") else {
            // `closing_tag_omitted` stopped the children at a start tag.
            return Ok(false);
        };
        let closing = peek_tag_name(after);
        if closing != name {
            if regular {
                return Ok(false);
            }
            return self.err(
                "element_invalid_closing_tag",
                format_args!("`</{closing}>` attempted to close an element that was not open"),
            );
        }
        self.eat_token(TokenType::EndTagOpen, 2);
        self.eat_token(TokenType::TagName, closing.len());
        self.skip_ws();
        if self.peek() != Some(b'>') {
            return self.expected_token(">");
        }
        self.eat_token(TokenType::TagEnd, 1);
        Ok(true)
    }

    fn textarea_children(&mut self) -> ParseResult<(Range, bool)> {
        let children_start = self.pending_children.len();
        loop {
            let rest = self.rest();
            if rest.is_empty() {
                return self.unexpected_eof();
            }
            if textarea_end(rest).is_some() {
                break;
            }
            let start_offset = self.position;
            let child = if rest.starts_with('{') {
                self.eat_token(TokenType::MustacheOpen, 1);
                let expression = self.expression()?;
                self.close_mustache()?;
                let span = Span::new(start_offset as u32, self.position as u32);
                self.push_node(TemplateNode::Expression { expression, span })
            } else {
                let mut end = rest.len();
                for i in memchr::memchr2_iter(b'{', b'<', rest.as_bytes()) {
                    if rest.as_bytes()[i] == b'{' || textarea_end(&rest[i..]).is_some() {
                        end = i;
                        break;
                    }
                }
                self.position += end;
                self.words(TokenType::Text, start_offset);
                self.push_node(TemplateNode::Text {
                    span: Span::new(start_offset as u32, self.position as u32),
                })
            };
            self.pending_children.push(child);
        }
        let children = self.finish_children(children_start);
        let end = self.position + textarea_end(self.rest()).expect("the loop stops at an end tag");
        self.eat_token(TokenType::EndTagOpen, 2);
        self.tag_name();
        self.skip_ws();
        // Upstream's end tag takes anything up to its `>`, which no tree keeps.
        let ignored = self.position;
        self.position = end - 1;
        self.words(TokenType::Text, ignored);
        self.eat_token(TokenType::TagEnd, 1);
        Ok((children, true))
    }

    fn raw_children(&mut self, name: &str) -> ParseResult<(Range, bool)> {
        let close = match name {
            "script" => "</script>",
            "style" => "</style>",
            _ => unreachable!("only script and style have raw children"),
        };
        let start_offset = self.position;
        let len = memchr::memmem::find(self.rest().as_bytes(), close.as_bytes())
            .unwrap_or_else(|| self.rest().len());
        self.position += len;
        self.words(TokenType::Text, start_offset);
        let text = (len > 0).then(|| {
            self.push_node(TemplateNode::Text {
                span: Span::new(start_offset as u32, self.position as u32),
            })
        });
        let children = match text {
            Some(t) => {
                let start = self.component.children.len() as u32;
                self.component.children.push(t);
                Range { start, len: 1 }
            }
            None => self.empty_range(),
        };
        if self.rest().is_empty() {
            return self.expected_token(close);
        }
        self.eat_token(TokenType::EndTagOpen, 2);
        self.tag_name();
        self.eat_token(TokenType::TagEnd, 1);
        Ok((children, true))
    }
}

/// The length of the end tag that starts `s`, as upstream's `regex_closing_textarea_tag`
/// (`/<\/textarea(\s[^>]*)?>/i`) reads it.
fn textarea_end(s: &str) -> Option<usize> {
    const END: &str = "</textarea";
    if !s.get(..END.len())?.eq_ignore_ascii_case(END) {
        return None;
    }
    let rest = &s[END.len()..];
    let close = if rest.starts_with('>') {
        0
    } else if rest.starts_with(is_ecmascript_whitespace) {
        rest.find('>')?
    } else {
        return None;
    };
    Some(END.len() + close + 1)
}
