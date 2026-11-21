use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::whitespace::is_ascii_ecmascript_whitespace;
use super::{AutoClosed, End, ParseResult, Parser, is_void};
use crate::names::{META_TAGS, is_component_name, is_valid_element_name};
use crate::syntax_tree::{
    AttributeKind, AttributeValue, ClosingTag, ElementEnd, ImplicitlyClosed, Part, Range,
    TemplateNode, TemplateNodeIdentifier, TokenType,
};

#[cfg(test)]
mod tests;

/// Upstream `read_tag_name`: up to whitespace, `/` or `>`.
pub(super) fn peek_tag_name(s: &str) -> &str {
    let bytes = s.as_bytes();
    let mut end = 0;
    while let Some(&b) = bytes.get(end) {
        // ASCII needs no decoding.
        let len = if b.is_ascii() {
            if is_ascii_ecmascript_whitespace(b) || matches!(b, b'/' | b'>') {
                break;
            }
            1
        } else {
            let c = s[end..].chars().next().unwrap_or_default();
            if is_ecmascript_whitespace(c) {
                break;
            }
            c.len_utf8()
        };
        end += len;
    }
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

/// An element the parser read, and whether a start tag closed it: upstream's `closing_tag_omitted`
/// pops the element it is in, and the start tag opens in the element around it.
pub(super) struct Read {
    pub(super) element: TemplateNodeIdentifier,
    pub(super) closed_by_start_tag: bool,
}

impl<'a> Parser<'a, '_> {
    pub(super) fn element(&mut self, at_root: bool) -> ParseResult<Option<Read>> {
        let start_offset = self.position;
        self.eat_token(TokenType::TagOpen, 1);
        // Upstream's `read_until` stops at the trimmed end before it reads the name.
        if self.position >= self.source_text.len() {
            return self.unexpected_eof();
        }
        let name = self.tag_name();
        let name_text = name.text(self.source_text);
        if name.is_empty() {
            return self.err("tag_invalid_name", TAG_INVALID_NAME);
        }
        if at_root
            && matches!(name_text, "script" | "style")
            && !(self.self_closing_blocks && self.self_closing_block_ahead())
        {
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
        if name_text == "svelte:component" {
            self.component_this(start_offset, attributes)?;
        }
        let start_tag = Span::new(start_offset as u32, self.position as u32);
        // Upstream's `RegularElement`: its `TitleElement` and `SlotElement` are not.
        let regular = match name_text {
            _ if component_name || name_text.starts_with("svelte:") => false,
            "title" => !self.ancestry.head,
            "slot" => self.ancestry.shadow_root,
            _ => true,
        };
        let (children, closed, warned) = if self_closing || is_void(name_text) {
            (self.empty_range(), ElementEnd::StartTag, None)
        } else if name_text == "textarea" {
            (self.textarea_children()?, ElementEnd::EndTag, None)
        } else if matches!(name_text, "script" | "style") {
            (self.raw_children(name_text)?, ElementEnd::EndTag, None)
        } else {
            self.element_children(name_text, regular, component_name, attributes, start_offset)?
        };
        let span = Span::new(start_offset as u32, self.position as u32);
        let element = self.push_node(TemplateNode::Element {
            name,
            component,
            attributes,
            children,
            start_tag,
            self_closing,
            end: closed,
            span,
        });
        if let Some(by) = warned {
            (self.component.implicitly_closed).push(ImplicitlyClosed { element, by });
        }
        Ok(Some(Read {
            element,
            closed_by_start_tag: closed == ElementEnd::NextStartTag,
        }))
    }

    /// The children of an element with an end tag, read with what upstream knows of its
    /// ancestors, how it closed, and the tag upstream warns closed it.
    fn element_children(
        &mut self,
        name: &'a str,
        regular: bool,
        component: bool,
        attributes: Range,
        start_offset: usize,
    ) -> ParseResult<(Range, ElementEnd, Option<ClosingTag>)> {
        let ancestry = self.ancestry;
        if name == "svelte:head" {
            self.ancestry.head = true;
        } else if regular || component {
            self.ancestry.head = false;
        }
        if regular && self.has_attribute(attributes, "shadowrootmode") {
            self.ancestry.shadow_root = true;
        }
        let children = self.fragment(End::Tag {
            name,
            regular,
            start: start_offset as u32,
        });
        self.ancestry = ancestry;
        let children = children?;
        let (end, warned) = self.end_tag(name, regular)?;
        Ok((children, end, warned))
    }

    fn has_attribute(&self, attributes: Range, name: &str) -> bool {
        attributes
            .get(&self.component.attributes)
            .iter()
            .any(|a| a.kind == AttributeKind::Attribute && a.name.text(self.source_text) == name)
    }

    /// Upstream requires `this={…}` on `<svelte:component>` while it parses.
    #[expect(
        clippy::literal_string_with_formatting_args,
        reason = "upstream's message quotes an expression tag"
    )]
    fn component_this(&self, start_offset: usize, attributes: Range) -> ParseResult<()> {
        let this = attributes.get(&self.component.attributes).iter().find(|a| {
            a.kind == AttributeKind::Attribute && a.name.text(self.source_text) == "this"
        });
        let Some(this) = this else {
            let at = Span::new(start_offset as u32, start_offset as u32);
            return Self::err_at(
                at,
                "svelte_component_missing_this",
                "`<svelte:component>` must have a 'this' attribute",
            );
        };
        // Upstream's `is_expression_attribute`: one `{…}`, quoted or not.
        let expression = matches!(this.value, AttributeValue::Parts(parts)
                if matches!(parts.get(&self.component.parts), [Part::Expression { .. }]));
        if expression {
            return Ok(());
        }
        let at = Span::new(this.span.start_offset, this.span.start_offset);
        Self::err_at(
            at,
            "svelte_component_invalid_this",
            "Invalid component definition — must be an `{expression}`",
        )
    }

    /// What a component's name refers to: `Foo`, or the member chain `ui.Button`.
    fn component_reference(&mut self, name: Span) -> Option<ExpressionIdentifier> {
        let text = name.text(self.source_text);
        (!text.split('.').any(str::is_empty)).then(|| self.member_chain(name, false))
    }

    pub(super) fn tag_name(&mut self) -> Span {
        let start_offset = self.position;
        self.position += peek_tag_name(self.rest()).len();
        self.token(TokenType::TagName, start_offset);
        Span::new(start_offset as u32, self.position as u32)
    }

    /// The tag after an element's children, and the tag upstream warns closed it implicitly.
    fn end_tag(
        &mut self,
        name: &'a str,
        regular: bool,
    ) -> ParseResult<(ElementEnd, Option<ClosingTag>)> {
        let Some(tag) = self.rest().strip_prefix('<') else {
            unreachable!("`fragment` ends an element's children only at a tag, or fails");
        };
        let at = self.position as u32;
        let Some(after) = tag.strip_prefix('/') else {
            let by = peek_tag_name(tag);
            self.auto_closed = Some(AutoClosed {
                name,
                by,
                depth: self.depth,
            });
            let by = ClosingTag::Start(Span::new(at + 1, at + 1 + by.len() as u32));
            return Ok((ElementEnd::NextStartTag, Some(by)));
        };
        if self.position + 2 >= self.source_text.len() {
            return self.unexpected_eof();
        }
        let closing = peek_tag_name(after);
        if closing != name {
            if regular {
                // Upstream takes an end tag naming the element a start tag closed last as meant
                // for that one, and does not warn about the elements it closes on the way.
                let by = (self.auto_closed.is_none_or(|a| a.name != closing))
                    .then(|| ClosingTag::End(Span::new(at + 2, at + 2 + closing.len() as u32)));
                return Ok((ElementEnd::AncestorEndTag, by));
            }
            return self.stray_closing_tag();
        }
        self.eat_token(TokenType::EndTagOpen, 2);
        self.eat_token(TokenType::TagName, closing.len());
        self.skip_ws();
        if self.peek() != Some(b'>') {
            return self.expected_token(">");
        }
        self.eat_token(TokenType::TagEnd, 1);
        if self.auto_closed.is_some_and(|a| self.depth < a.depth) {
            self.auto_closed = None;
        }
        Ok((ElementEnd::EndTag, None))
    }

    /// Whether the start tag after this name ends in `/>`, as svelte-eslint-parser's
    /// `parseAttributes` scans it: a name must be followed by whitespace.
    fn self_closing_block_ahead(&self) -> bool {
        let rest = self.rest().as_bytes();
        if !rest.first().is_some_and(u8::is_ascii_whitespace) {
            return false;
        }
        let at_end = |i: usize| rest.get(i) == Some(&b'>') || rest[i..].starts_with(b"/>");
        let mut i = 0;
        loop {
            while rest.get(i).is_some_and(u8::is_ascii_whitespace) {
                i += 1;
            }
            match rest.get(i) {
                None | Some(b'>') => return false,
                Some(_) if rest[i..].starts_with(b"/>") => return true,
                Some(_) => {}
            }
            // The key: its first byte is always read.
            i += 1;
            while i < rest.len() && rest[i] != b'=' && !rest[i].is_ascii_whitespace() && !at_end(i)
            {
                i += 1;
            }
            let mut j = i;
            while rest.get(j).is_some_and(u8::is_ascii_whitespace) {
                j += 1;
            }
            if rest.get(j) != Some(&b'=') {
                continue;
            }
            j += 1;
            while rest.get(j).is_some_and(u8::is_ascii_whitespace) {
                j += 1;
            }
            i = match rest.get(j) {
                None => return false,
                Some(&quote @ (b'"' | b'\'')) => match memchr::memchr(quote, &rest[j + 1..]) {
                    Some(len) => j + 1 + len + 1,
                    None => return false,
                },
                // An unquoted value, a mustache's included, ends at whitespace or the tag's end.
                Some(_) => {
                    let mut k = j + 1;
                    while k < rest.len() && !rest[k].is_ascii_whitespace() && !at_end(k) {
                        k += 1;
                    }
                    k
                }
            };
        }
    }

    fn textarea_children(&mut self) -> ParseResult<Range> {
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
        Ok(children)
    }

    fn raw_children(&mut self, name: &str) -> ParseResult<Range> {
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
        Ok(children)
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
