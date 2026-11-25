//! vscode-html-languageservice's `createScanner`, with pseudo close tags, as `parseHtml` runs it,
//! and the language server's `scanMatchingBraces`.

/// The scanner states `parseHtml` reads or restarts in, and the ones it passes through.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum State {
    WithinContent,
    AfterOpeningStartTag,
    WithinTag,
    AfterAttributeName,
    BeforeAttributeValue,
    AfterOpeningEndTag,
    WithinEndTag,
    WithinComment,
    WithinDoctype,
    WithinScriptContent,
    WithinStyleContent,
}

/// The tokens `parseHtml` reads; the rest are `Other`.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Token {
    Eos,
    StartTagOpen,
    StartTag,
    StartTagClose,
    StartTagSelfClose,
    EndTagOpen,
    EndTag,
    EndTagClose,
    AttributeName,
    DelimiterAssign,
    Whitespace,
    AttributeValue,
    Unknown,
    Content,
    Other,
}

pub(super) struct Scanner<'a> {
    text: &'a str,
    pub(super) position: usize,
    pub(super) state: State,
    pub(super) token_offset: usize,
    has_space_after_tag: bool,
    last_tag: String,
    last_attribute_name: String,
    last_type_value: Option<&'a str>,
}

const fn is_markup_whitespace(byte: u8) -> bool {
    matches!(byte, b' ' | b'\t' | b'\n' | b'\x0C' | b'\r')
}

impl<'a> Scanner<'a> {
    pub(super) const fn new(text: &'a str, position: usize, state: State) -> Self {
        Self {
            text,
            position,
            state,
            token_offset: position,
            has_space_after_tag: false,
            last_tag: String::new(),
            last_attribute_name: String::new(),
            last_type_value: None,
        }
    }

    fn rest(&self) -> &'a str {
        &self.text[self.position..]
    }

    fn peek(&self) -> Option<u8> {
        self.text.as_bytes().get(self.position).copied()
    }

    fn advance_if(&mut self, prefix: &str) -> bool {
        let matched = self.rest().starts_with(prefix);
        if matched {
            self.position += prefix.len();
        }
        matched
    }

    fn skip_whitespace(&mut self) -> bool {
        let skipped = self
            .rest()
            .bytes()
            .take_while(|&b| is_markup_whitespace(b))
            .count();
        self.position += skipped;
        skipped > 0
    }

    fn advance_until(&mut self, needle: &[u8]) {
        self.position = memchr::memmem::find(self.rest().as_bytes(), needle)
            .map_or(self.text.len(), |at| self.position + at);
    }

    /// `[_:\w][_:\w-.\d]*`, lowercased.
    fn element_name(&mut self) -> String {
        let rest = self.rest().as_bytes();
        let first = |b: u8| b == b'_' || b == b':' || b.is_ascii_alphanumeric();
        let len = match rest.first() {
            Some(&b) if first(b) => {
                1 + rest[1..]
                    .iter()
                    .take_while(|&&b| first(b) || b == b'-' || b == b'.')
                    .count()
            }
            _ => 0,
        };
        self.position += len;
        self.text[self.position - len..self.position].to_ascii_lowercase()
    }

    /// `[^\s"'></=\x00-\x0F\x7F\x80-\x9F]*`, lowercased.
    fn attribute_name(&mut self) -> String {
        let len: usize = (self.rest().chars())
            .take_while(|&c| {
                !rsvelte_kernel::source::characters::is_ecmascript_whitespace(c)
                    && !matches!(c, '"' | '\'' | '>' | '<' | '/' | '=')
                    && !matches!(c, '\0'..='\x0F' | '\x7F'..='\u{9F}')
            })
            .map(char::len_utf8)
            .sum();
        self.position += len;
        self.text[self.position - len..self.position].to_lowercase()
    }

    const fn finish(&mut self, offset: usize, token: Token) -> Token {
        self.token_offset = offset;
        token
    }

    pub(super) fn scan(&mut self) -> Token {
        let offset = self.position;
        let token = self.internal_scan();
        let pseudo_close = matches!(token, Token::StartTagClose | Token::EndTagClose);
        if token != Token::Eos && offset == self.position && !pseudo_close {
            self.position += self.rest().chars().next().map_or(1, char::len_utf8);
            return self.finish(offset, Token::Unknown);
        }
        token
    }

    fn internal_scan(&mut self) -> Token {
        let offset = self.position;
        if offset >= self.text.len() {
            return self.finish(offset, Token::Eos);
        }
        match self.state {
            State::WithinComment => {
                if self.advance_if("-->") {
                    self.state = State::WithinContent;
                } else {
                    self.advance_until(b"-->");
                }
                return self.finish(offset, Token::Other);
            }
            State::WithinDoctype => {
                if self.advance_if(">") {
                    self.state = State::WithinContent;
                } else {
                    self.advance_until(b">");
                }
                return self.finish(offset, Token::Other);
            }
            State::WithinContent => return self.content(offset),
            State::AfterOpeningEndTag => {
                if !self.element_name().is_empty() {
                    self.state = State::WithinEndTag;
                    return self.finish(offset, Token::EndTag);
                }
                if self.skip_whitespace() {
                    return self.finish(offset, Token::Whitespace);
                }
                self.state = State::WithinEndTag;
                self.advance_until(b">");
                if offset < self.position {
                    return self.finish(offset, Token::Unknown);
                }
                return self.internal_scan();
            }
            State::WithinEndTag => {
                if self.skip_whitespace() {
                    return self.finish(offset, Token::Whitespace);
                }
                if self.advance_if(">") || self.peek() == Some(b'<') {
                    self.state = State::WithinContent;
                    return self.finish(offset, Token::EndTagClose);
                }
            }
            State::AfterOpeningStartTag => {
                self.last_tag = self.element_name();
                self.last_type_value = None;
                self.last_attribute_name.clear();
                if !self.last_tag.is_empty() {
                    self.has_space_after_tag = false;
                    self.state = State::WithinTag;
                    return self.finish(offset, Token::StartTag);
                }
                if self.skip_whitespace() {
                    return self.finish(offset, Token::Whitespace);
                }
                self.state = State::WithinTag;
                self.advance_until(b">");
                if offset < self.position {
                    return self.finish(offset, Token::Unknown);
                }
                return self.internal_scan();
            }
            State::WithinTag => return self.within_tag(offset),
            State::AfterAttributeName => {
                if self.skip_whitespace() {
                    self.has_space_after_tag = true;
                    return self.finish(offset, Token::Whitespace);
                }
                if self.advance_if("=") {
                    self.state = State::BeforeAttributeValue;
                    return self.finish(offset, Token::DelimiterAssign);
                }
                self.state = State::WithinTag;
                return self.internal_scan();
            }
            State::BeforeAttributeValue => return self.before_attribute_value(offset),
            State::WithinScriptContent => return self.script_content(offset),
            State::WithinStyleContent => {
                self.position = find_ignoring_case(self.rest(), "</style")
                    .map_or(self.text.len(), |at| self.position + at);
                self.state = State::WithinContent;
                if offset < self.position {
                    return self.finish(offset, Token::Other);
                }
                return self.internal_scan();
            }
        }
        self.position += self.rest().chars().next().map_or(1, char::len_utf8);
        self.state = State::WithinContent;
        self.finish(offset, Token::Unknown)
    }

    fn content(&mut self, offset: usize) -> Token {
        if self.advance_if("<") {
            if self.advance_if("!--") {
                self.state = State::WithinComment;
                return self.finish(offset, Token::Other);
            }
            if self.rest().len() >= 8
                && self.rest().as_bytes()[..8].eq_ignore_ascii_case(b"!doctype")
            {
                self.position += 8;
                self.state = State::WithinDoctype;
                return self.finish(offset, Token::Other);
            }
            if self.advance_if("/") {
                self.state = State::AfterOpeningEndTag;
                return self.finish(offset, Token::EndTagOpen);
            }
            self.state = State::AfterOpeningStartTag;
            return self.finish(offset, Token::StartTagOpen);
        }
        self.advance_until(b"<");
        self.finish(offset, Token::Content)
    }

    fn within_tag(&mut self, offset: usize) -> Token {
        if self.skip_whitespace() {
            self.has_space_after_tag = true;
            return self.finish(offset, Token::Whitespace);
        }
        if self.has_space_after_tag {
            self.last_attribute_name = self.attribute_name();
            if !self.last_attribute_name.is_empty() {
                self.state = State::AfterAttributeName;
                self.has_space_after_tag = false;
                return self.finish(offset, Token::AttributeName);
            }
        }
        if self.advance_if("/>") {
            self.state = State::WithinContent;
            return self.finish(offset, Token::StartTagSelfClose);
        }
        if self.advance_if(">") {
            self.state = match self.last_tag.as_str() {
                "script"
                    if matches!(
                        self.last_type_value,
                        Some("text/x-handlebars-template" | "text/html")
                    ) =>
                {
                    State::WithinContent
                }
                "script" => State::WithinScriptContent,
                "style" => State::WithinStyleContent,
                _ => State::WithinContent,
            };
            return self.finish(offset, Token::StartTagClose);
        }
        if self.peek() == Some(b'<') {
            self.state = State::WithinContent;
            return self.finish(offset, Token::StartTagClose);
        }
        self.position += self.rest().chars().next().map_or(1, char::len_utf8);
        self.finish(offset, Token::Unknown)
    }

    fn before_attribute_value(&mut self, offset: usize) -> Token {
        if self.skip_whitespace() {
            return self.finish(offset, Token::Whitespace);
        }
        let unquoted = (self.rest().chars())
            .take_while(|&c| {
                !rsvelte_kernel::source::characters::is_ecmascript_whitespace(c)
                    && !matches!(c, '"' | '\'' | '`' | '=' | '<' | '>')
            })
            .map(char::len_utf8)
            .sum::<usize>();
        if unquoted > 0 {
            let mut len = unquoted;
            if self.text.as_bytes().get(self.position + len) == Some(&b'>')
                && self.text.as_bytes()[self.position + len - 1] == b'/'
            {
                len -= 1;
            }
            if self.last_attribute_name == "type" {
                self.last_type_value = Some(&self.text[self.position..self.position + len]);
            }
            if len > 0 {
                self.position += len;
                self.state = State::WithinTag;
                self.has_space_after_tag = false;
                return self.finish(offset, Token::AttributeValue);
            }
        }
        if let Some(quote @ (b'"' | b'\'')) = self.peek() {
            self.position += 1;
            match memchr::memchr(quote, self.rest().as_bytes()) {
                Some(at) => self.position += at + 1,
                None => self.position = self.text.len(),
            }
            if self.last_attribute_name == "type" {
                self.last_type_value = self.text.get(offset + 1..self.position - 1);
            }
            self.state = State::WithinTag;
            self.has_space_after_tag = false;
            return self.finish(offset, Token::AttributeValue);
        }
        self.state = State::WithinTag;
        self.has_space_after_tag = false;
        self.internal_scan()
    }

    /// Script data up to the `</script` that ends it, past one inside an escaped `<!--`.
    fn script_content(&mut self, offset: usize) -> Token {
        let mut escaped = 1;
        while self.position < self.text.len() {
            let Some((at, len, kind)) = next_script_mark(self.rest()) else {
                self.position = self.text.len();
                return self.finish(offset, Token::Other);
            };
            self.position += at + len;
            match kind {
                ScriptMark::CommentOpen if escaped == 1 => escaped = 2,
                ScriptMark::CommentClose => escaped = 1,
                ScriptMark::Open if escaped == 2 => escaped = 3,
                ScriptMark::Close if escaped == 3 => escaped = 2,
                ScriptMark::Close => {
                    self.position -= len;
                    break;
                }
                _ => {}
            }
        }
        self.state = State::WithinContent;
        if offset < self.position {
            return self.finish(offset, Token::Other);
        }
        self.internal_scan()
    }
}

#[derive(Clone, Copy)]
enum ScriptMark {
    CommentOpen,
    CommentClose,
    Open,
    Close,
}

/// The first match of `/<!--|-->|<\/?script\s*\/?>?/i`: where, how long, and which.
fn next_script_mark(text: &str) -> Option<(usize, usize, ScriptMark)> {
    let bytes = text.as_bytes();
    let mut from = 0;
    while let Some(i) = memchr::memchr2(b'<', b'-', &bytes[from..]) {
        let at = from + i;
        let rest = &text[at..];
        if rest.starts_with("<!--") {
            return Some((at, 4, ScriptMark::CommentOpen));
        }
        if rest.starts_with("-->") {
            return Some((at, 3, ScriptMark::CommentClose));
        }
        let (close, name) = rest.strip_prefix("</").map_or_else(
            || (false, rest.strip_prefix('<').unwrap_or("")),
            |name| (true, name),
        );
        if name.len() >= 6 && name.as_bytes()[..6].eq_ignore_ascii_case(b"script") {
            let after = &name[6..];
            let space = after.len()
                - after
                    .trim_start_matches(
                        rsvelte_kernel::source::characters::is_ecmascript_whitespace,
                    )
                    .len();
            let mut tail = &after[space..];
            let mut len = rest.len() - name.len() + 6 + space;
            for mark in ["/", ">"] {
                if let Some(next) = tail.strip_prefix(mark) {
                    tail = next;
                    len += 1;
                }
            }
            let kind = if close {
                ScriptMark::Close
            } else {
                ScriptMark::Open
            };
            return Some((at, len, kind));
        }
        from = at + 1;
    }
    None
}

fn find_ignoring_case(text: &str, needle: &str) -> Option<usize> {
    (text.as_bytes().windows(needle.len()))
        .position(|window| window.eq_ignore_ascii_case(needle.as_bytes()))
}

/// The language server's `scanMatchingBraces`: the offset after the `}` that closes the `{` at
/// `start`, past strings, template literals and comments, or the text's end.
pub(super) fn matching_brace_end(text: &str, start: usize) -> usize {
    let bytes = text.as_bytes();
    if bytes.get(start) != Some(&b'{') {
        return start;
    }
    let mut depth = 0usize;
    let mut templates: Vec<usize> = Vec::new();
    let mut index = start;
    let template = |index: &mut usize, depth: &mut usize, templates: &mut Vec<usize>| {
        while *index < bytes.len() {
            match bytes[*index] {
                b'`' => return,
                b'$' if bytes.get(*index + 1) == Some(&b'{') => {
                    templates.push(*depth);
                    *depth = 0;
                    return;
                }
                b'\\' => *index += 1,
                _ => {}
            }
            *index += 1;
        }
    };
    while index < bytes.len() {
        match bytes[index] {
            b'{' => depth += 1,
            b'}' => {
                depth = depth.saturating_sub(1);
                if depth == 0
                    && let Some(outer) = templates.pop()
                {
                    depth = outer;
                    template(&mut index, &mut depth, &mut templates);
                }
            }
            quote @ (b'\'' | b'"') => {
                index += 1;
                while index < bytes.len() && bytes[index] != quote {
                    index += if bytes[index] == b'\\' { 2 } else { 1 };
                }
            }
            b'`' => {
                index += 1;
                template(&mut index, &mut depth, &mut templates);
            }
            b'/' if bytes.get(index + 1) == Some(&b'/') => {
                while index < bytes.len() && !matches!(bytes[index], b'\r' | b'\n') {
                    index += 1;
                }
            }
            b'/' if bytes.get(index + 1) == Some(&b'*') => {
                index += 2;
                while index < bytes.len()
                    && !(bytes[index] == b'*' && bytes.get(index + 1) == Some(&b'/'))
                {
                    index += 1;
                }
                // Past `*/`, and the loop then steps over the character after it too.
                index = (index + 2).min(bytes.len());
            }
            _ => {}
        }
        index += 1;
        if depth == 0 && templates.is_empty() {
            return index.min(bytes.len());
        }
    }
    index.min(bytes.len())
}
