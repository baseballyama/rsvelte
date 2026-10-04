use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::names::{META_TAGS, is_component_name, is_valid_element_name};
use rsvelte_svelte_syntax::syntax_tree::{Range, TemplateNode, TemplateNodeIdentifier, TokenType};

use super::{End, ParseResult, Parser, is_void};

/// Upstream `read_tag_name`: up to whitespace, `/` or `>`.
pub(super) fn peek_tag_name(s: &str) -> &str {
    let end = s
        .as_bytes()
        .iter()
        .position(|&byte| byte.is_ascii_whitespace() || matches!(byte, b'/' | b'>'))
        .unwrap_or(s.len());
    &s[..end]
}

/// Upstream's root-only meta tags.
const ROOT_ONLY_META_TAGS: &[&str] = &[
    "svelte:head",
    "svelte:options",
    "svelte:window",
    "svelte:document",
    "svelte:body",
];

impl Parser<'_> {
    pub(super) fn element(&mut self, at_root: bool) -> ParseResult<Option<TemplateNodeIdentifier>> {
        let start_offset = self.position;
        self.eat_token(TokenType::TagOpen, 1);
        let name = self.tag_name();
        let name_text = name.text(self.source_text);
        if name.is_empty() {
            return self.err("expected a tag name");
        }
        if at_root && matches!(name_text, "script" | "style") {
            self.script_or_style(start_offset, name_text)?;
            return Ok(None);
        }
        if name_text.starts_with("svelte:") && !META_TAGS.contains(&name_text) {
            return Self::err_at(name, format!("`<{name_text}>` is not a valid meta tag"));
        }
        let component_name = is_component_name(name_text);
        if !is_valid_element_name(name_text) && !component_name {
            return Self::err_at(name, format!("`<{name_text}>` is not a valid element name"));
        }
        if ROOT_ONLY_META_TAGS.contains(&name_text) && !at_root {
            return Self::err_at(name, format!("`<{name_text}>` must be at the top level"));
        }
        let component = component_name
            .then(|| self.component_reference(name))
            .flatten()
            .unwrap_or(rsvelte_typescript::NodeIdentifier::NONE);
        let (attributes, self_closing) = self.attributes()?;
        let start_tag = Span::new(start_offset as u32, self.position as u32);
        let regular = !name_text.starts_with("svelte:") && !component_name;
        let children = if self_closing || is_void(name_text) {
            self.empty_range()
        } else if name_text == "textarea" {
            self.textarea_children()?
        } else if matches!(name_text, "script" | "style") {
            self.raw_children(name_text)?
        } else {
            let children = self.fragment(End::Tag {
                name: name_text,
                regular,
            })?;
            self.end_tag(name_text, regular)?;
            children
        };
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(Some(self.push_node(TemplateNode::Element {
            name,
            component,
            attributes,
            children,
            start_tag,
            self_closing,
            span,
        })))
    }

    fn component_reference(&mut self, name: Span) -> Option<rsvelte_typescript::NodeIdentifier> {
        let text = name.text(self.source_text);
        if text.split('.').any(str::is_empty) {
            return None;
        }
        let mut offset = name.start_offset;
        let mut reference = None;
        for part in text.split('.') {
            let end = offset + u32::try_from(part.len()).expect("source positions use u32 bytes");
            let identifier = self
                .component
                .javascript
                .ident(part, Span::new(offset, end));
            reference = Some(if let Some(object) = reference {
                self.component.javascript.member(
                    object,
                    identifier,
                    false,
                    false,
                    Span::new(name.start_offset, end),
                )
            } else {
                identifier
            });
            offset = end + 1;
        }
        self.component.template_expressions.extend(reference);
        reference
    }

    pub(super) fn tag_name(&mut self) -> Span {
        let start_offset = self.position;
        self.position += peek_tag_name(self.rest()).len();
        self.token(TokenType::TagName, start_offset);
        Span::new(start_offset as u32, self.position as u32)
    }

    fn end_tag(&mut self, name: &str, regular: bool) -> ParseResult<()> {
        let rest = self.rest();
        let Some(after) = rest.strip_prefix("</") else {
            // `closing_tag_omitted` stopped the children at a start tag.
            return Ok(());
        };
        let closing = peek_tag_name(after);
        if closing != name {
            if regular {
                return Ok(());
            }
            return self.err(format!(
                "`</{closing}>` attempted to close an element that was not open"
            ));
        }
        self.eat_token(TokenType::EndTagOpen, 2);
        self.eat_token(TokenType::TagName, closing.len());
        self.skip_ws();
        if self.peek() != Some(b'>') {
            return self.err("expected `>`");
        }
        self.eat_token(TokenType::TagEnd, 1);
        Ok(())
    }

    fn textarea_children(&mut self) -> ParseResult<Range> {
        let children_start = self.pending_children.len();
        loop {
            let rest = self.rest();
            if rest.is_empty() {
                return self.err("`<textarea>` was left open");
            }
            if is_textarea_end(rest) {
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
                    if rest.as_bytes()[i] == b'{' || is_textarea_end(&rest[i..]) {
                        end = i;
                        break;
                    }
                }
                self.position += end;
                self.token(TokenType::Text, start_offset);
                self.push_node(TemplateNode::Text {
                    span: Span::new(start_offset as u32, self.position as u32),
                })
            };
            self.pending_children.push(child);
        }
        let children = self.finish_children(children_start);
        self.eat_token(TokenType::EndTagOpen, 2);
        self.tag_name();
        self.skip_ws();
        if self.peek() != Some(b'>') {
            return self.err("expected `>`");
        }
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
        self.token(TokenType::Text, start_offset);
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
            return self.err(format!("expected `{close}`"));
        }
        self.eat_token(TokenType::EndTagOpen, 2);
        self.tag_name();
        self.eat_token(TokenType::TagEnd, 1);
        Ok(children)
    }
}

/// Upstream `regex_closing_textarea_tag`, without attributes on the end tag.
fn is_textarea_end(s: &str) -> bool {
    const END: &str = "</textarea";
    s.get(..END.len())
        .is_some_and(|h| h.eq_ignore_ascii_case(END))
        && super::whitespace::trim_ascii_start(&s[END.len()..]).starts_with('>')
}
