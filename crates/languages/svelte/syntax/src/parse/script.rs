use oxc_span::SourceType;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::{ProgramIdentifier, SyntaxError};

use super::javascript::javascript_failure;
use super::{ParseResult, Parser, Scripts};
use crate::syntax_tree::{Script, Style, TagAttributes, TokenType};

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
        if let Some(body) = at.strip_prefix("<!--")
            && let Some(end) = memchr::memmem::find(body.as_bytes(), b"-->")
        {
            from += i + 4 + end + 3;
            continue;
        }
        from += i + 1;
        if let Some(after) = at.strip_prefix("<script")
            && let Some(lang) = lang_attribute(after)
        {
            return lang == "ts";
        }
    }
}

/// The `lang` value the regex matches in a script tag, `after` being the text after `<script`:
/// either `lang=` in the text before the first `>`, the last one first, or after a run of
/// `name=value` attributes whose quoted values may hold a `>`.
fn lang_attribute(after: &str) -> Option<&str> {
    let attributes = after.trim_start_matches(is_ecmascript_whitespace);
    if attributes.len() == after.len() {
        return None;
    }
    let tag = &attributes[..attributes.find('>').unwrap_or(attributes.len())];
    tag.rmatch_indices("lang=")
        .find_map(|(at, _)| lang_value(&attributes[at..]))
        .or_else(|| after_attributes(attributes))
}

/// `(?:[^=>'"/]+=(?:"[^"]*"|'[^']*'|[^>\s]+)\s+)*lang=…`, trying the most attributes first.
fn after_attributes(text: &str) -> Option<&str> {
    let name = text.find(['=', '>', '\'', '"', '/']).filter(|&end| end > 0);
    if let Some(end) = name
        && text[end..].starts_with('=')
    {
        let value = &text[end + 1..];
        let quoted = |quote: char| {
            value
                .strip_prefix(quote)
                .and_then(|inner| inner.find(quote).map(|close| end + 1 + close + 2))
        };
        let unquoted = value
            .find(|c: char| c == '>' || is_ecmascript_whitespace(c))
            .unwrap_or(value.len());
        let ends = [
            quoted('"'),
            quoted('\''),
            (unquoted > 0).then_some(end + 1 + unquoted),
        ];
        for next in ends.into_iter().flatten() {
            let following = text[next..].trim_start_matches(is_ecmascript_whitespace);
            if following.len() < text.len() - next
                && let Some(lang) = after_attributes(following)
            {
                return Some(lang);
            }
        }
    }
    lang_value(text)
}

/// `lang=(["'])?([^"' >]+)\1[^>]*>` at the start of `text`.
fn lang_value(text: &str) -> Option<&str> {
    let value = text.strip_prefix("lang=")?;
    let (quote, value) = match value.chars().next() {
        Some(quote @ ('"' | '\'')) => (Some(quote), &value[1..]),
        _ => (None, value),
    };
    let end = value.find(['"', '\'', ' ', '>']).unwrap_or(value.len());
    if end == 0 {
        return None;
    }
    let rest = &value[end..];
    let rest = match quote {
        Some(quote) => rest.strip_prefix(quote)?,
        None => rest,
    };
    rest.contains('>').then_some(&value[..end])
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

    /// The script's program as Prettier's Svelte plugin reads it: as the compiler reads it, else
    /// as TypeScript, else empty, keeping the first such script's TypeScript errors; and whether
    /// it is TypeScript.
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
        let errors = match read {
            Ok(program) => return Ok((program, true)),
            Err(errors) => errors,
        };
        if self.component.script_typescript_errors.is_empty() {
            self.component.script_typescript_errors = errors;
        }
        let end = content.end_offset;
        let program = self.builder.program(Span::new(end, end), source_type)?;
        Ok((program, source_type.is_typescript()))
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
