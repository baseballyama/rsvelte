use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Script, Style, TagAttributes, TokenType};
use rsvelte_typescript::parser::parse_program;

use super::{ParseResult, Parser, javascript_error};

/// Ports upstream's `regex_lang_attribute` (1-parse/index.js): the first `<script …lang=…>` outside
/// a comment decides, and only the exact value `ts` means TypeScript.
pub(super) fn script_is_typescript(source_text: &str) -> bool {
    let mut from = 0;
    loop {
        let rest = &source_text[from..];
        let Some(i) = memchr::memchr(b'<', rest.as_bytes()) else {
            return false;
        };
        let at = &rest[i..];
        if let Some(body) = at.strip_prefix("<!--") {
            match memchr::memmem::find(body.as_bytes(), b"-->") {
                Some(end) => from += i + 4 + end + 3,
                None => return false,
            }
            continue;
        }
        from += i + 1;
        let Some(after) = at.strip_prefix("<script") else {
            continue;
        };
        if !after.starts_with(|c: char| c.is_ascii_whitespace()) {
            continue;
        }
        let tag = &after[..after.find('>').unwrap_or(after.len())];
        // `[^>]*` is greedy, so the regex binds to the last `lang=` in the tag.
        let Some(l) = tag.rfind("lang=") else {
            continue;
        };
        let value = tag[l + 5..].trim_start_matches(['"', '\'']);
        let end = value.find(['"', '\'', ' ', '>']).unwrap_or(value.len());
        if end == 0 {
            continue;
        }
        return &value[..end] == "ts";
    }
}

/// Upstream `read_script`'s `get_context`: `module`, or the legacy `context="module"`.
fn is_module(source_text: &str, attributes: &[TagAttributes]) -> bool {
    attributes.iter().any(|(name, value)| {
        let name = name.text(source_text);
        name == "module"
            || (name == "context" && value.is_some_and(|v| v.text(source_text) == "module"))
    })
}

impl Parser<'_> {
    pub(super) fn script_or_style(&mut self, start_offset: usize, name: &str) -> ParseResult<()> {
        let attributes = self.open_tag_attributes()?;
        if name == "script" {
            self.script(start_offset, attributes)
        } else {
            self.style(start_offset, attributes)
        }
    }

    fn open_tag_attributes(&mut self) -> ParseResult<Vec<TagAttributes>> {
        let mut attributes = Vec::new();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.eat_token(TokenType::TagEnd, 1);
                    return Ok(attributes);
                }
                Some(_) => {
                    let name_start = self.position;
                    self.position += super::attribute::attribute_name_len(self.rest().as_bytes());
                    if self.position == name_start {
                        return self.err("expected an attribute name");
                    }
                    let name = Span::new(name_start as u32, self.position as u32);
                    self.token(TokenType::AttributeName, name_start);
                    let mut value = None;
                    if self.peek() == Some(b'=') {
                        self.eat_token(TokenType::Eq, 1);
                        if let Some(quote @ (b'"' | b'\'')) = self.peek() {
                            let value_start = self.position + 1;
                            let Some(len) = self.source_text[value_start..].find(quote as char)
                            else {
                                return self.err("unterminated attribute value");
                            };
                            value = Some(Span::new(value_start as u32, (value_start + len) as u32));
                            self.eat_token(TokenType::Quote, 1);
                            self.eat_token(TokenType::AttributeText, len);
                            self.eat_token(TokenType::Quote, 1);
                        } else {
                            let value_start = self.position;
                            let len = self
                                .rest()
                                .find(|c: char| c.is_ascii_whitespace() || c == '>')
                                .unwrap_or_else(|| self.rest().len());
                            if len == 0 {
                                return self.err("expected an attribute value");
                            }
                            value = Some(Span::new(value_start as u32, (value_start + len) as u32));
                            self.eat_token(TokenType::AttributeText, len);
                        }
                    }
                    attributes.push((name, value));
                }
            }
        }
    }

    fn raw_text(&mut self, tag: &str) -> ParseResult<Span> {
        let close = match tag {
            "script" => "</script",
            "style" => "</style",
            _ => unreachable!("only script and style have raw top-level content"),
        };
        let start_offset = self.position;
        let mut from = 0;
        let len = loop {
            let Some(next) =
                memchr::memmem::find(&self.rest().as_bytes()[from..], close.as_bytes())
            else {
                return self.err(format!("`<{tag}>` was left open"));
            };
            let at = from + next;
            let suffix = &self.rest()[at + close.len()..];
            let whitespace = super::whitespace::whitespace_len(suffix.as_bytes());
            if suffix.as_bytes().get(whitespace) == Some(&b'>') {
                break at;
            }
            from = at + close.len();
        };
        self.position += len;
        Ok(Span::new(start_offset as u32, (start_offset + len) as u32))
    }

    fn close_raw(&mut self, tag: &str) {
        self.eat_token(TokenType::EndTagOpen, 2);
        self.eat_token(TokenType::TagName, tag.len());
        self.skip_ws();
        self.eat_token(TokenType::TagEnd, 1);
    }

    fn script(&mut self, start_offset: usize, attributes: Vec<TagAttributes>) -> ParseResult<()> {
        let module = is_module(self.source_text, &attributes);
        let typescript = self.typescript;
        let content = self.raw_text("script")?;
        let duplicate = if module {
            self.component.module.is_some()
        } else {
            self.component.instance.is_some()
        };
        if duplicate {
            return Self::err_at(
                content,
                "a component can have a single top-level `<script>` element and/or a single \
                 top-level `<script module>` element",
            );
        }
        let (tokens, comments) = (
            self.component.javascript.tokens.len(),
            self.component.javascript.comments.len(),
        );
        let program = parse_program(
            &mut self.component.javascript,
            self.source_text,
            content,
            typescript,
        )
        .map_err(javascript_error)?;
        self.javascript_region(content.start_offset, content.end_offset, tokens, comments);
        self.close_raw("script");
        let span = Span::new(start_offset as u32, self.position as u32);
        let script = Script {
            span,
            attributes,
            content,
            program,
            typescript,
        };
        if module {
            self.component.module = Some(script);
        } else {
            self.component.instance = Some(script);
        }
        Ok(())
    }

    fn style(&mut self, start_offset: usize, attributes: Vec<TagAttributes>) -> ParseResult<()> {
        let content = self.raw_text("style")?;
        if self.component.style.is_some() {
            return Self::err_at(
                content,
                "a component can have a single top-level `<style>` element",
            );
        }
        self.component.tokens.push(TokenType::Stylesheet, content);
        self.close_raw("style");
        let sheet = rsvelte_stylesheet::parse(self.source_text, content)
            .map_err(|e| Diagnostic::error("css_parse_error", e.message, e.span))?;
        self.component.style = Some(Style {
            span: Span::new(start_offset as u32, self.position as u32),
            attributes,
            sheet,
        });
        Ok(())
    }
}
