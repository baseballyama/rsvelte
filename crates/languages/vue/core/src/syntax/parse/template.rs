use super::{
    Attribute, AttributeKind, Diagnostic, Directive, DirectiveExpression, DirectiveName,
    LoopExpression, P, ParsedDirective, R, Range, Span, TemplateNode, TemplateNodeIdentifier,
    TokenType, is_void, parse_parameters, split_for,
};

impl P<'_> {
    // ---- the template ----------------------------------------------------------------------

    /// Nodes up to the end tag of `parent` (left unconsumed).
    pub(super) fn fragment(&mut self, parent: Option<&str>) -> R<Range> {
        let mut items = Vec::new();
        loop {
            let rest = self.rest();
            if rest.is_empty() {
                return match parent {
                    Some(name) => self.err(format!("`<{name}>` was left open")),
                    None => Ok(Self::range_of(&mut self.c.children, items)),
                };
            }
            if rest.starts_with("</") {
                return Ok(Self::range_of(&mut self.c.children, items));
            }
            if rest.starts_with("<!--") {
                items.push(self.comment()?);
            } else if rest.starts_with('<') {
                items.push(self.element()?);
            } else if rest.starts_with("{{") {
                items.push(self.interpolation()?);
            } else {
                let start_offset = self.position;
                let len = match (rest.find('<'), rest.find("{{")) {
                    (Some(a), Some(b)) => a.min(b),
                    (a, b) => a.or(b).unwrap_or(rest.len()),
                };
                self.position += len;
                self.token(TokenType::Text, start_offset);
                items.push(self.push(TemplateNode::Text {
                    span: Span::new(start_offset as u32, self.position as u32),
                }));
            }
        }
    }

    pub(super) fn comment(&mut self) -> R<TemplateNodeIdentifier> {
        let start_offset = self.position;
        let Some(end) = self.rest().find("-->") else {
            return self.err("unterminated comment");
        };
        let data = Span::new((start_offset + 4) as u32, (start_offset + end) as u32);
        self.eat_token(TokenType::MarkupComment, end + 3);
        Ok(self.push(TemplateNode::Comment {
            span: Span::new(start_offset as u32, self.position as u32),
            data,
        }))
    }

    pub(super) fn interpolation(&mut self) -> R<TemplateNodeIdentifier> {
        let start_offset = self.position;
        let Some(end) = self.rest().find("}}") else {
            return self.err("interpolation end sign was not found");
        };
        self.eat_token(TokenType::InterpolationOpen, 2);
        let inner = Span::new(self.position as u32, (start_offset + end) as u32);
        let expression = self.expression(inner)?;
        self.position = inner.end_offset as usize;
        self.eat_token(TokenType::InterpolationClose, 2);
        Ok(self.push(TemplateNode::Interpolation {
            expression,
            span: Span::new(start_offset as u32, self.position as u32),
        }))
    }

    pub(super) fn element(&mut self) -> R<TemplateNodeIdentifier> {
        let start_offset = self.position;
        self.eat_token(TokenType::TagOpen, 1);
        let name_start_offset = self.position;
        while self
            .peek()
            .is_some_and(|c| c.is_ascii_alphanumeric() || c == b'-')
        {
            self.position += 1;
        }
        let name = Span::new(name_start_offset as u32, self.position as u32);
        if name.is_empty() {
            return self.err("expected a tag name");
        }
        self.token(TokenType::TagName, name_start_offset);
        let name_text = name.text(self.source_text);
        if name_text == "template"
            || name_text == "slot"
            || name_text.contains('-')
            || name_text.starts_with(|c: char| c.is_ascii_uppercase())
        {
            return Self::err_at(
                name,
                "components and template elements are not supported yet",
            );
        }
        let (attributes, self_closing) = self.attributes()?;
        let start_tag = Span::new(start_offset as u32, self.position as u32);
        let children = if self_closing || is_void(name_text) {
            Range {
                start: self.c.children.len() as u32,
                len: 0,
            }
        } else {
            let children = self.fragment(Some(name_text))?;
            self.close_tag(name_text)?;
            children
        };
        Ok(self.push(TemplateNode::Element {
            name,
            attributes,
            children,
            start_tag,
            self_closing,
            span: Span::new(start_offset as u32, self.position as u32),
        }))
    }

    /// Attributes through the `>` or `/>`.
    pub(super) fn attributes(&mut self) -> R<(Range, bool)> {
        let mut list = Vec::new();
        let self_closing = loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.eat_token(TokenType::TagEnd, 1);
                    break false;
                }
                Some(b'/') if self.rest().starts_with("/>") => {
                    self.eat_token(TokenType::SelfClose, 2);
                    break true;
                }
                Some(_) => list.push(self.attribute()?),
            }
        };
        let start = self.c.attributes.len() as u32;
        let len = list.len() as u32;
        self.c.attributes.extend(list);
        Ok((Range { start, len }, self_closing))
    }

    pub(super) fn attribute(&mut self) -> R<Attribute> {
        let start_offset = self.position;
        while self
            .peek()
            .is_some_and(|c| !c.is_ascii_whitespace() && !matches!(c, b'=' | b'>' | b'"' | b'\''))
            && !self.rest().starts_with("/>")
        {
            self.position += 1;
        }
        let name = Span::new(start_offset as u32, self.position as u32);
        if name.is_empty() {
            return self.err("expected an attribute name");
        }
        self.token(TokenType::AttributeName, start_offset);
        let directive = self.directive_name(name)?;
        self.skip_ws();
        let (value, quoted) = if self.peek() == Some(b'=') {
            self.eat_token(TokenType::Eq, 1);
            self.skip_ws();
            match self.peek() {
                Some(q @ (b'"' | b'\'')) => {
                    self.eat_token(TokenType::Quote, 1);
                    let v = self.position;
                    let Some(len) = self.rest().find(q as char) else {
                        return self.err("unterminated attribute value");
                    };
                    self.position += len;
                    (Some(Span::new(v as u32, self.position as u32)), true)
                }
                Some(_) => {
                    let v = self.position;
                    while self
                        .peek()
                        .is_some_and(|c| !c.is_ascii_whitespace() && c != b'>')
                    {
                        self.position += 1;
                    }
                    (Some(Span::new(v as u32, self.position as u32)), false)
                }
                None => return self.err("expected an attribute value"),
            }
        } else {
            (None, false)
        };
        let kind = match directive {
            None => {
                if let Some(v) = value {
                    self.position = v.start_offset as usize;
                    self.eat_token(TokenType::AttributeText, v.len() as usize);
                }
                AttributeKind::Static
            }
            Some((dir, arg, modifiers)) => {
                let exp = match (dir, value) {
                    (DirectiveName::Else, None) => DirectiveExpression::None,
                    (DirectiveName::Else, Some(v)) => {
                        return Self::err_at(v, "v-else has no expression");
                    }
                    (_, None) => return Self::err_at(name, "a directive needs an expression"),
                    (DirectiveName::For, Some(v)) => {
                        DirectiveExpression::For(self.for_expression(v)?)
                    }
                    (_, Some(v)) => DirectiveExpression::Expression(self.expression(v)?),
                };
                AttributeKind::Directive(Directive {
                    name: dir,
                    arg,
                    modifiers,
                    exp,
                })
            }
        };
        if let Some(v) = value {
            self.position = v.end_offset as usize;
            if quoted {
                self.eat_token(TokenType::Quote, 1);
            }
        }
        Ok(Attribute {
            name,
            kind,
            value,
            quoted,
            span: Span::new(start_offset as u32, self.position as u32),
        })
    }

    /// `:arg`, `@arg` and `v-name:arg`, and the `.modifier`s of `v-model` and `v-on`; `None` for a
    /// static attribute.
    pub(super) fn directive_name(&self, name: Span) -> R<Option<ParsedDirective>> {
        let text = name.text(self.source_text);
        let (dir, arg_start_offset) = match text.as_bytes()[0] {
            b':' => (DirectiveName::Bind, 1),
            b'@' => (DirectiveName::On, 1),
            b'#' | b'.' => return Self::err_at(name, "this directive is not supported yet"),
            _ if text.starts_with("v-") => {
                let end = text.find([':', '.']).unwrap_or(text.len());
                let dir = match &text[2..end] {
                    "bind" => DirectiveName::Bind,
                    "on" => DirectiveName::On,
                    "if" => DirectiveName::If,
                    "else-if" => DirectiveName::ElseIf,
                    "else" => DirectiveName::Else,
                    "for" => DirectiveName::For,
                    "model" => DirectiveName::Model,
                    _ => return Self::err_at(name, "this directive is not supported yet"),
                };
                let arg_start_offset = if text[end..].starts_with(':') {
                    end + 1
                } else {
                    end
                };
                (dir, arg_start_offset)
            }
            _ => return Ok(None),
        };
        // compiler-core: the argument runs to the first `.`, each `.` after it starts a modifier.
        let arg_end_offset = text[arg_start_offset..]
            .find('.')
            .map_or(text.len(), |i| arg_start_offset + i);
        let at = |start_offset: usize, end_offset: usize| {
            Span::new(
                name.start_offset + start_offset as u32,
                name.start_offset + end_offset as u32,
            )
        };
        let mut modifiers = Vec::new();
        if arg_end_offset < text.len() {
            if !matches!(dir, DirectiveName::Model | DirectiveName::On) {
                return Self::err_at(
                    name,
                    "directive modifiers and dynamic arguments are not supported yet",
                );
            }
            let mut start_offset = arg_end_offset + 1;
            for m in text[start_offset..].split('.') {
                if m.is_empty() {
                    return Self::err_at(name, "an empty directive modifier");
                }
                modifiers.push(at(start_offset, start_offset + m.len()));
                start_offset += m.len() + 1;
            }
        }
        if text[arg_start_offset..arg_end_offset].contains('[') {
            return Self::err_at(
                name,
                "directive modifiers and dynamic arguments are not supported yet",
            );
        }
        let arg = (arg_start_offset < arg_end_offset).then(|| at(arg_start_offset, arg_end_offset));
        if matches!(dir, DirectiveName::Bind | DirectiveName::On) && arg.is_none() {
            return Self::err_at(name, "an object v-bind or v-on is not supported yet");
        }
        Ok(Some((dir, arg, modifiers.into_boxed_slice())))
    }

    /// compiler-core's `parseForExpression`: `forAliasRE` splits the value at ` in ` / ` of `, the
    /// aliases lose their parentheses, and each part is parsed on its own.
    pub(super) fn for_expression(&mut self, v: Span) -> R<LoopExpression> {
        let text = v.text(self.source_text);
        let Some((alias_end, kw_start_offset)) = split_for(text) else {
            return Self::err_at(v, "v-for has invalid expression");
        };
        let at = |i: usize| v.start_offset + i as u32;
        let alias = &text[..alias_end];
        let trimmed_start_offset = alias.len() - alias.trim_start().len();
        let trimmed = alias.trim();
        let (inner_start_offset, inner_end_offset) =
            if trimmed.starts_with('(') && trimmed.ends_with(')') {
                (
                    trimmed_start_offset + 1,
                    trimmed_start_offset + trimmed.len() - 1,
                )
            } else {
                (trimmed_start_offset, trimmed_start_offset + trimmed.len())
            };
        self.position = v.start_offset as usize;
        self.skip_to(at(trimmed_start_offset), TokenType::Whitespace);
        if inner_start_offset > trimmed_start_offset {
            self.eat_token(TokenType::ForParen, 1);
        }
        let (t, c) = self.marks();
        let parameters = parse_parameters(
            &mut self.c.javascript,
            self.source_text,
            Span::new(at(inner_start_offset), at(inner_end_offset)),
            self.c.typescript,
        )
        .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.javascript_region(at(inner_start_offset), at(inner_end_offset), t, c);
        self.position = at(inner_end_offset) as usize;
        if inner_start_offset > trimmed_start_offset {
            self.eat_token(TokenType::ForParen, 1);
        }
        self.skip_to(at(kw_start_offset), TokenType::Whitespace);
        self.eat_token(TokenType::ForKeyword, 2);
        let source = self.expression(Span::new(at(kw_start_offset + 2), v.end_offset))?;
        if parameters.is_empty() {
            return Self::err_at(v, "v-for has no alias");
        }
        Ok(LoopExpression { parameters, source })
    }

    pub(super) fn skip_to(&mut self, to: u32, kind: TokenType) {
        let start_offset = self.position;
        self.position = to as usize;
        self.token(kind, start_offset);
    }
}
