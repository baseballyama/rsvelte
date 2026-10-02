use super::{
    Diagnostic, P, R, Script, Span, Style, TagAttributes, Template, TokenType, parse_program,
};

impl P<'_> {
    // ---- the top level ---------------------------------------------------------------------

    pub(super) fn blocks(&mut self) -> R<()> {
        loop {
            let rest = self.rest();
            if rest.is_empty() {
                return Ok(());
            }
            if rest.starts_with("<!--") {
                let Some(end) = rest.find("-->") else {
                    return self.err("unterminated comment");
                };
                self.eat_token(TokenType::MarkupComment, end + 3);
            } else if rest.starts_with("<template") && self.tag_ends_at("<template".len()) {
                self.template()?;
            } else if rest.starts_with("<script") && self.tag_ends_at("<script".len()) {
                self.script()?;
            } else if rest.starts_with("<style") && self.tag_ends_at("<style".len()) {
                self.style()?;
            } else if rest.starts_with('<') {
                return self.err("custom blocks are not supported yet");
            } else {
                let start_offset = self.position;
                self.position += rest.find('<').unwrap_or(rest.len());
                let kind = if self.source_text[start_offset..self.position]
                    .trim_ascii()
                    .is_empty()
                {
                    TokenType::Whitespace
                } else {
                    TokenType::Text
                };
                self.token(kind, start_offset);
            }
        }
    }

    pub(super) fn tag_ends_at(&self, n: usize) -> bool {
        self.b
            .get(self.position + n)
            .is_some_and(|&c| c.is_ascii_whitespace() || c == b'>' || c == b'/')
    }

    /// `(name, unquoted value)` pairs of a block's start tag, through its `>`.
    pub(super) fn open_tag_attributes(&mut self) -> R<Vec<TagAttributes>> {
        self.eat_token(TokenType::TagOpen, 1);
        let start_offset = self.position;
        while self.peek().is_some_and(|c| c.is_ascii_alphanumeric()) {
            self.position += 1;
        }
        self.token(TokenType::TagName, start_offset);
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
                    let n = self.position;
                    while self
                        .peek()
                        .is_some_and(|c| !c.is_ascii_whitespace() && !matches!(c, b'=' | b'>'))
                    {
                        self.position += 1;
                    }
                    let name = Span::new(n as u32, self.position as u32);
                    self.token(TokenType::AttributeName, n);
                    let mut value = None;
                    if self.peek() == Some(b'=') {
                        self.eat_token(TokenType::Eq, 1);
                        let Some(q @ (b'"' | b'\'')) = self.peek() else {
                            return self.err("expected a quoted value");
                        };
                        let v = self.position + 1;
                        let Some(len) = self.source_text[v..].find(q as char) else {
                            return self.err("unterminated attribute value");
                        };
                        value = Some(Span::new(v as u32, (v + len) as u32));
                        self.eat_token(TokenType::Quote, 1);
                        self.eat_token(TokenType::AttributeText, len);
                        self.eat_token(TokenType::Quote, 1);
                    }
                    attributes.push((name, value));
                }
            }
        }
    }

    /// Raw text up to `</tag>`; leaves `position` at the closing tag.
    pub(super) fn raw_text(&mut self, tag: &str) -> R<Span> {
        let close = format!("</{tag}>");
        let start_offset = self.position;
        let Some(len) = self.rest().find(&close) else {
            return self.err(format!("`<{tag}>` was left open"));
        };
        self.position += len;
        Ok(Span::new(start_offset as u32, (start_offset + len) as u32))
    }

    pub(super) fn close_tag(&mut self, tag: &str) -> R<()> {
        if !self.rest().starts_with("</") || !self.rest()[2..].starts_with(tag) {
            return self.err(format!("expected `</{tag}>`"));
        }
        self.eat_token(TokenType::EndTagOpen, 2);
        self.eat_token(TokenType::TagName, tag.len());
        self.skip_ws();
        if self.peek() != Some(b'>') {
            return self.err("expected `>`");
        }
        self.eat_token(TokenType::TagEnd, 1);
        Ok(())
    }

    pub(super) fn template(&mut self) -> R<()> {
        let start_offset = self.position;
        let attributes = self.open_tag_attributes()?;
        if let Some((name, _)) = attributes
            .iter()
            .find(|(n, _)| matches!(n.text(self.source_text), "lang" | "src" | "functional"))
        {
            return Self::err_at(*name, "this template attribute is not supported yet");
        }
        if self.c.template.is_some() {
            return self.err("a component can have only one <template>");
        }
        let content_start_offset = self.position;
        let root = self.fragment(Some("template"))?;
        let content = Span::new(content_start_offset as u32, self.position as u32);
        self.close_tag("template")?;
        self.c.template = Some(Template {
            span: Span::new(start_offset as u32, self.position as u32),
            attributes,
            content,
            root,
        });
        Ok(())
    }

    pub(super) fn script(&mut self) -> R<()> {
        let start_offset = self.position;
        let attributes = self.open_tag_attributes()?;
        let has = |name: &str| {
            attributes
                .iter()
                .find(|(n, _)| n.text(self.source_text) == name)
        };
        if has("setup").is_none() {
            return Self::err_at(
                Span::new(start_offset as u32, self.position as u32),
                "only <script setup> is supported yet",
            );
        }
        if let Some((name, _)) = has("src") {
            return Self::err_at(*name, "an external script is not supported yet");
        }
        if let Some((name, Some(lang))) = has("lang")
            && !matches!(lang.text(self.source_text), "ts" | "js")
        {
            return Self::err_at(*name, "this script language is not supported");
        }
        let content = self.raw_text("script")?;
        if self.c.script.is_some() {
            return Self::err_at(content, "a component can have only one <script setup>");
        }
        let (t, c) = self.marks();
        let program = parse_program(
            &mut self.c.javascript,
            self.source_text,
            content,
            self.c.typescript,
        )
        .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.javascript_region(content.start_offset, content.end_offset, t, c);
        self.close_tag("script")?;
        self.c.script = Some(Script {
            span: Span::new(start_offset as u32, self.position as u32),
            attributes,
            content,
            program,
        });
        Ok(())
    }

    pub(super) fn style(&mut self) -> R<()> {
        let start_offset = self.position;
        let attributes = self.open_tag_attributes()?;
        if let Some((name, _)) = attributes
            .iter()
            .find(|(n, _)| matches!(n.text(self.source_text), "lang" | "src" | "module"))
        {
            return Self::err_at(*name, "this style attribute is not supported yet");
        }
        let scoped = attributes
            .iter()
            .any(|(n, _)| n.text(self.source_text) == "scoped");
        let content = self.raw_text("style")?;
        self.c.tokens.push(TokenType::Stylesheet, content);
        self.close_tag("style")?;
        let sheet = rsvelte_stylesheet::parse(self.source_text, content)
            .map_err(|e| Diagnostic::error("css_parse_error", e.message, e.span))?;
        self.c.styles.push(Style {
            span: Span::new(start_offset as u32, self.position as u32),
            attributes,
            content,
            sheet,
            scoped,
        });
        Ok(())
    }
}
