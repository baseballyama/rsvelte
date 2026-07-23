//! Text node parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/state/text.js`
//!
//! It handles parsing of text content between elements and mustache tags,
//! including HTML entity decoding.
//!
//! ## JavaScript Implementation
//!
//! ```javascript
//! export default function text(parser) {
//!     const start = parser.index;
//!     let data = '';
//!
//!     while (parser.index < parser.template.length && !parser.match('<') && !parser.match('{')) {
//!         data += parser.template[parser.index++];
//!     }
//!
//!     parser.append({
//!         type: 'Text',
//!         start,
//!         end: parser.index,
//!         raw: data,
//!         data: decode_character_references(data, false)
//!     });
//! }
//! ```

use compact_str::CompactString;
use memchr::memchr2;

use crate::ast::template::{TemplateNode, Text};
use crate::error::ParseResult;

use super::super::parser::Parser;
use super::super::utils::decode_html_entities;

impl<'a> Parser<'a> {
    /// Parse text content.
    ///
    /// Corresponds to the `text()` function in `state/text.js`.
    ///
    /// This function:
    /// 1. Records the start position
    /// 2. Collects characters until `<` or `{` is encountered (using SIMD-accelerated search)
    /// 3. Decodes HTML character references with `decode_character_references(data, false)`
    /// 4. Creates a Text node with both raw and decoded data
    pub fn parse_text(&mut self) -> ParseResult<Option<TemplateNode<'a>>> {
        let start = self.index as u32;
        let start_pos = self.index;

        // Use SIMD-accelerated search to find '<' or '{' quickly
        // This is much faster than character-by-character scanning
        let remaining = &self.source.as_bytes()[self.index..];
        if let Some(pos) = memchr2(b'<', b'{', remaining) {
            self.index += pos;
        } else {
            // No '<' or '{' found, consume rest of source
            self.index = self.source.len();
        }

        // If no data was collected, return None
        if self.index == start_pos {
            return Ok(None);
        }

        let end = self.index as u32;
        let raw_str = &self.source[start_pos..self.index];

        // Fast path: skip decode_html_entities entirely if no '&' present
        let text_bytes = &self.bytes[start_pos..self.index];
        let has_entity = memchr::memchr(b'&', text_bytes).is_some();

        if has_entity {
            let decoded_data = decode_html_entities(raw_str, false);
            Ok(Some(TemplateNode::Text(Text {
                start,
                end,
                raw: CompactString::from(raw_str),
                data: CompactString::from(decoded_data),
            })))
        } else {
            // No entities: raw and data are the same, create both from the slice directly
            // (CompactString inlines short strings up to 24 bytes, avoiding heap for both)
            Ok(Some(TemplateNode::Text(Text {
                start,
                end,
                raw: CompactString::from(raw_str),
                data: CompactString::from(raw_str),
            })))
        }
    }
}
