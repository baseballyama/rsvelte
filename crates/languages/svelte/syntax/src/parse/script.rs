use oxc_span::SourceType;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_markup_syntax::script_language::is_typescript;
use rsvelte_typescript_tree::{ProgramIdentifier, SyntaxError};

use super::javascript::javascript_failure;
use super::{ParseResult, Parser, Scripts};
use crate::syntax_tree::{Script, Style, TagAttributes, TokenType};

/// The language a script element's attributes give it: `Some(true)` for `lang="ts"`, `None`
/// without a `lang`.
fn lang_is_typescript(source_text: &str, attributes: &[TagAttributes]) -> Option<bool> {
    let (_, value) = attributes
        .iter()
        .find(|(name, _)| name.text(source_text) == "lang")?;
    Some(value.is_some_and(|v| is_typescript(v.text(source_text))))
}

/// Whether `offset` is in the content of a `<script>` element. svelte-eslint-parser reads those
/// itself and blanks them before Svelte parses the rest, so an error there is not Svelte's.
pub(super) fn in_script_content(source_text: &str, offset: usize) -> bool {
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
        if !after.starts_with(|c| is_ecmascript_whitespace(c) || c == '>') {
            continue;
        }
        let Some(open) = after.find('>') else {
            return false;
        };
        let start = from + "script".len() + open + 1;
        let end = memchr::memmem::find(&source_text.as_bytes()[start..], b"</script")
            .map_or(source_text.len(), |len| start + len);
        if (start..=end).contains(&offset) {
            return true;
        }
        if offset < start {
            return false;
        }
        from = end;
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

impl Parser<'_, '_> {
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
        self.unique_names.clear();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.unexpected_eof(),
                Some(b'>') => {
                    self.eat_token(TokenType::TagEnd, 1);
                    return Ok(attributes);
                }
                Some(_) => {
                    let name_start = self.position;
                    self.position += super::attribute::attribute_name_len(self.rest());
                    if self.position == name_start {
                        return self.expected_token(">");
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
                                return self.unexpected_eof();
                            };
                            value = Some(Span::new(value_start as u32, (value_start + len) as u32));
                            let quote = super::attribute::quote_token(quote);
                            self.eat_token(quote, 1);
                            self.position += len;
                            self.words(TokenType::AttributeText, value_start);
                            self.eat_token(quote, 1);
                        } else {
                            let value_start = self.position;
                            let len = self
                                .rest()
                                .find(|c| is_ecmascript_whitespace(c) || c == '>')
                                .unwrap_or_else(|| self.rest().len());
                            if len == 0 {
                                return self
                                    .err("expected_attribute_value", "Expected attribute value");
                            }
                            value = Some(Span::new(value_start as u32, (value_start + len) as u32));
                            self.position += len;
                            self.words(TokenType::AttributeText, value_start);
                        }
                    }
                    let span = Span::new(name.start_offset, self.position as u32);
                    self.unique(super::attribute::Unique::Attribute, name, span)?;
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
        // Upstream's `read_until` fails at the end of the input before it reads.
        if self.rest().is_empty() {
            return self.unexpected_eof();
        }
        let start_offset = self.position;
        let mut from = 0;
        let len = loop {
            let Some(next) =
                memchr::memmem::find(&self.rest().as_bytes()[from..], close.as_bytes())
            else {
                return if tag == "script" {
                    let end = self.source_text.len() as u32;
                    Self::err_at(
                        Span::new(end, end),
                        "element_unclosed",
                        "`<script>` was left open",
                    )
                } else {
                    self.expected_token("</style")
                };
            };
            let at = from + next;
            let suffix = &self.rest()[at + close.len()..];
            let whitespace = super::whitespace::whitespace_len(suffix);
            if suffix.as_bytes().get(whitespace) == Some(&b'>') {
                break at;
            }
            from = at + close.len();
        };
        self.position += len;
        Ok(Span::new(start_offset as u32, (start_offset + len) as u32))
    }

    /// `</style`, and the `>` after it if there is one: upstream reads the rest as the template's.
    fn close_style(&mut self) {
        self.eat_token(TokenType::EndTagOpen, 2);
        self.eat_token(TokenType::TagName, "style".len());
        let whitespace = super::whitespace::whitespace_len(self.rest());
        if self.rest().as_bytes().get(whitespace) == Some(&b'>') {
            self.skip_ws();
            self.eat_token(TokenType::TagEnd, 1);
        }
    }

    fn close_raw(&mut self, tag: &str) {
        self.eat_token(TokenType::EndTagOpen, 2);
        self.eat_token(TokenType::TagName, tag.len());
        self.skip_ws();
        self.eat_token(TokenType::TagEnd, 1);
    }

    /// The script's program as Prettier's Svelte plugin and svelte-eslint-parser read it: as the
    /// compiler reads it, else as TypeScript, else what oxc recovered of it, else empty, keeping
    /// its TypeScript errors; and whether it is TypeScript.
    fn program_read_as_typescript(
        &mut self,
        content: Span,
        source_type: SourceType,
    ) -> Result<(ProgramIdentifier, bool), SyntaxError> {
        let typescript = SourceType::ts().with_module(true);
        let read = if source_type.is_typescript() {
            self.builder.program_or_errors(content, source_type)
        } else {
            match self.builder.program(content, source_type) {
                Ok(program) => return Ok((program, false)),
                Err(_) => self.builder.program_or_errors(content, typescript),
            }
        };
        let rejected = match read {
            Ok(program) => return Ok((program, true)),
            Err(rejected) => rejected,
        };
        self.component
            .script_typescript_errors
            .extend(rejected.errors);
        // typescript-eslint tolerates some of oxc's errors, and the rules read the rest.
        if let Some(program) = rejected.recovered {
            return Ok((program, true));
        }
        let end = content.end_offset;
        let program = self.builder.program(Span::new(end, end), source_type)?;
        Ok((program, source_type.is_typescript()))
    }

    fn script(&mut self, start_offset: usize, attributes: Vec<TagAttributes>) -> ParseResult<()> {
        let module = is_module(self.source_text, &attributes);
        if self.lang_read.is_none() {
            self.lang_read = lang_is_typescript(self.source_text, &attributes);
        }
        let typescript = self.typescript;
        let content = self.raw_text("script")?;
        let duplicate = if module {
            self.component.module.is_some()
        } else {
            self.component.instance.is_some()
        };
        let source_type = self.source_type();
        let (program, typescript) = match self.scripts {
            Scripts::Read => self
                .builder
                .program(content, source_type)
                .map(|p| (p, typescript)),
            Scripts::Left => (self.builder)
                .program(
                    Span::new(content.end_offset, content.end_offset),
                    source_type,
                )
                .map(|p| (p, typescript)),
            Scripts::ReadAsTypeScript => self.program_read_as_typescript(content, source_type),
        }
        .map_err(javascript_failure)?;
        // Upstream parses the script before it checks for another.
        if duplicate {
            return Self::err_at(
                Span::new(start_offset as u32, start_offset as u32),
                "script_duplicate",
                "A component can have a single top-level `<script>` element and/or a single \
                 top-level `<script module>` element",
            );
        }
        self.javascript_region(content.start_offset, content.end_offset);
        // Svelte only strips `generics`, so a list that does not parse is left out, as
        // `svelte-eslint-parser` does; read after the program's tokens are taken.
        let generics = (!module && self.typescript && self.scripts != Scripts::Left)
            .then(|| {
                let (_, value) = attributes
                    .iter()
                    .find(|(name, _)| name.text(self.source_text) == "generics")?;
                self.builder.type_parameters((*value)?, source_type).ok()
            })
            .flatten();
        self.close_raw("script");
        let span = Span::new(start_offset as u32, self.position as u32);
        let script = Script {
            span,
            attributes,
            content,
            program,
            typescript,
            generics,
        };
        if module {
            self.component.module = Some(script);
        } else {
            self.component.instance = Some(script);
        }
        Ok(())
    }

    fn style(&mut self, start_offset: usize, attributes: Vec<TagAttributes>) -> ParseResult<()> {
        // The sheet ends at the first `</style` between its rules, as upstream reads it; one that
        // does not parse ends at the first closing tag, so the rest of the component still parses.
        // Svelte parses the template without its trailing whitespace, so an open sheet ends there.
        let sheet = rsvelte_stylesheet_syntax::parse_until(
            self.source_text,
            self.position as u32,
            "</style",
        )
        .map_err(|e| super::svelte_error(e.code, e.message, e.span));
        let content = match &sheet {
            Ok(sheet)
                if self.source_text[sheet.content.end_offset as usize..].starts_with("</style") =>
            {
                self.position = sheet.content.end_offset as usize;
                sheet.content
            }
            Ok(sheet) => {
                self.position = sheet.content.end_offset as usize;
                return self.expected_token("</style");
            }
            // Without a closing tag Svelte has nothing to go on but the sheet's own error.
            Err(error) => match self.raw_text("style") {
                Ok(content) => content,
                Err(_) => return Err(error.clone()),
            },
        };
        if self.component.style.is_some() {
            return Self::err_at(
                Span::new(start_offset as u32, start_offset as u32),
                "style_duplicate",
                "A component can have a single top-level `<style>` element",
            );
        }
        self.component.tokens.push(TokenType::Stylesheet, content);
        self.close_style();
        self.component.style = Some(Style {
            span: Span::new(start_offset as u32, self.position as u32),
            attributes,
            content,
            sheet,
        });
        Ok(())
    }
}

#[cfg(test)]
mod tests;
