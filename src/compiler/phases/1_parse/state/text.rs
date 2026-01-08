//! Text node parsing.

use compact_str::CompactString;

use crate::ast::template::{TemplateNode, Text};
use crate::error::ParseResult;

use super::super::parser::Parser;
use super::super::utils::decode_html_entities;

impl Parser<'_> {
    /// Parse text content.
    pub fn parse_text(&mut self) -> ParseResult<Option<TemplateNode>> {
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
}
