//! Parser state machine.
//!
//! This module implements the main parser state and logic.

use compact_str::CompactString;

use crate::ast::{Fragment, FragmentType, Root, RootType, TemplateNode, Text};
use crate::error::{ParseError, ParseResult};

use super::ParseOptions;
use super::lexer::{decode_html_entities, is_identifier_char, is_identifier_start, is_whitespace};

/// The parser state.
pub struct Parser<'a> {
    /// The source code being parsed.
    source: &'a str,
    /// Source as bytes for faster indexing.
    bytes: &'a [u8],
    /// Current byte position in the source.
    index: usize,
    /// Parser options.
    #[allow(dead_code)]
    options: ParseOptions,
    /// Stack of open elements/blocks for validation.
    #[allow(dead_code)]
    stack: Vec<StackEntry>,
}

/// An entry on the parser stack.
#[derive(Debug)]
#[allow(dead_code)]
enum StackEntry {
    Element { name: CompactString, start: u32 },
    Block { name: CompactString, start: u32 },
}

impl<'a> Parser<'a> {
    /// Create a new parser.
    pub fn new(source: &'a str, options: ParseOptions) -> Self {
        Self {
            source,
            bytes: source.as_bytes(),
            index: 0,
            options,
            stack: Vec::new(),
        }
    }

    /// Parse the source into a Root AST node.
    pub fn parse(&mut self) -> ParseResult<Root> {
        let start = 0u32;
        let fragment = self.parse_fragment()?;
        let end = self.index as u32;

        Ok(Root {
            node_type: RootType::Root,
            start,
            end,
            fragment,
            options: None,
            css: None,
            instance: None,
            module: None,
            js: Vec::new(),
        })
    }

    /// Parse a fragment (sequence of nodes).
    fn parse_fragment(&mut self) -> ParseResult<Fragment> {
        let mut nodes = Vec::new();

        while !self.is_eof() {
            // Check for end conditions
            if self.match_str("</") || self.match_str("{/") || self.match_str("{:") {
                break;
            }

            if let Some(node) = self.parse_node()? {
                nodes.push(node);
            }
        }

        Ok(Fragment {
            node_type: FragmentType::Fragment,
            nodes,
        })
    }

    /// Parse a single node.
    fn parse_node(&mut self) -> ParseResult<Option<TemplateNode>> {
        if self.is_eof() {
            return Ok(None);
        }

        let c = self.current_char();

        match c {
            '<' => self.parse_element_or_comment(),
            '{' => self.parse_mustache(),
            _ => self.parse_text(),
        }
    }

    /// Parse text content.
    fn parse_text(&mut self) -> ParseResult<Option<TemplateNode>> {
        let start = self.index as u32;
        let mut end = self.index;

        while !self.is_eof() {
            let c = self.current_char();
            if c == '<' || c == '{' {
                break;
            }
            self.advance();
            end = self.index;
        }

        if end == start as usize {
            return Ok(None);
        }

        let raw = &self.source[start as usize..end];
        let data = decode_html_entities(raw);

        Ok(Some(TemplateNode::Text(Text {
            start,
            end: end as u32,
            raw: CompactString::from(raw),
            data: CompactString::from(data),
        })))
    }

    /// Parse an element or comment.
    fn parse_element_or_comment(&mut self) -> ParseResult<Option<TemplateNode>> {
        // TODO: Implement element parsing
        // For now, just skip and return None
        self.advance();
        Ok(None)
    }

    /// Parse a mustache expression.
    fn parse_mustache(&mut self) -> ParseResult<Option<TemplateNode>> {
        // TODO: Implement mustache parsing
        // For now, just skip and return None
        self.advance();
        Ok(None)
    }

    // =========================================================================
    // Low-level parsing utilities
    // =========================================================================

    /// Check if we've reached the end of the source.
    #[inline]
    fn is_eof(&self) -> bool {
        self.index >= self.bytes.len()
    }

    /// Get the current character.
    #[inline]
    fn current_char(&self) -> char {
        if self.is_eof() {
            '\0'
        } else {
            self.source[self.index..].chars().next().unwrap_or('\0')
        }
    }

    /// Get the current byte.
    #[inline]
    #[allow(dead_code)]
    fn current_byte(&self) -> u8 {
        if self.is_eof() {
            0
        } else {
            self.bytes[self.index]
        }
    }

    /// Advance the position by one character.
    #[inline]
    fn advance(&mut self) {
        if !self.is_eof() {
            let c = self.current_char();
            self.index += c.len_utf8();
        }
    }

    /// Advance by n bytes.
    #[inline]
    #[allow(dead_code)]
    fn advance_by(&mut self, n: usize) {
        self.index = (self.index + n).min(self.bytes.len());
    }

    /// Check if the source at current position starts with the given string.
    #[inline]
    fn match_str(&self, s: &str) -> bool {
        self.source[self.index..].starts_with(s)
    }

    /// Consume a string if it matches.
    #[allow(dead_code)]
    fn eat(&mut self, s: &str) -> bool {
        if self.match_str(s) {
            self.advance_by(s.len());
            true
        } else {
            false
        }
    }

    /// Consume a string, returning an error if it doesn't match.
    #[allow(dead_code)]
    fn expect(&mut self, s: &str) -> ParseResult<()> {
        if self.eat(s) {
            Ok(())
        } else {
            Err(ParseError::UnexpectedToken {
                expected: s.to_string(),
                found: self.peek_chars(s.len()),
                span: (self.index, self.index + 1),
            })
        }
    }

    /// Skip whitespace.
    #[allow(dead_code)]
    fn skip_whitespace(&mut self) {
        while !self.is_eof() && is_whitespace(self.current_char()) {
            self.advance();
        }
    }

    /// Read an identifier.
    #[allow(dead_code)]
    fn read_identifier(&mut self) -> Option<CompactString> {
        let start = self.index;

        if self.is_eof() || !is_identifier_start(self.current_char()) {
            return None;
        }

        while !self.is_eof() && is_identifier_char(self.current_char()) {
            self.advance();
        }

        if self.index > start {
            Some(CompactString::from(&self.source[start..self.index]))
        } else {
            None
        }
    }

    /// Peek at the next n characters.
    #[allow(dead_code)]
    fn peek_chars(&self, n: usize) -> String {
        self.source[self.index..].chars().take(n).collect()
    }

    /// Read until a pattern is found.
    #[allow(dead_code)]
    fn read_until(&mut self, pattern: &str) -> &'a str {
        let start = self.index;
        while !self.is_eof() && !self.match_str(pattern) {
            self.advance();
        }
        &self.source[start..self.index]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_text() {
        let mut parser = Parser::new("hello world", ParseOptions::default());
        let result = parser.parse().unwrap();

        assert_eq!(result.fragment.nodes.len(), 1);
        match &result.fragment.nodes[0] {
            TemplateNode::Text(text) => {
                assert_eq!(text.data.as_str(), "hello world");
                assert_eq!(text.raw.as_str(), "hello world");
            }
            _ => panic!("Expected Text node"),
        }
    }

    #[test]
    fn test_parse_empty() {
        let mut parser = Parser::new("", ParseOptions::default());
        let result = parser.parse().unwrap();

        assert!(result.fragment.nodes.is_empty());
    }
}
