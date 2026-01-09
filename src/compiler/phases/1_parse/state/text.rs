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

use crate::ast::template::{TemplateNode, Text};
use crate::error::ParseResult;

use super::super::parser::Parser;
use super::super::utils::decode_html_entities;

impl Parser<'_> {
    /// Parse text content.
    ///
    /// Corresponds to the `text()` function in `state/text.js`.
    ///
    /// This function:
    /// 1. Records the start position
    /// 2. Collects characters until `<` or `{` is encountered
    /// 3. Decodes HTML character references with `decode_character_references(data, false)`
    /// 4. Creates a Text node with both raw and decoded data
    pub fn parse_text(&mut self) -> ParseResult<Option<TemplateNode>> {
        let start = self.index as u32;
        let mut data = String::new();

        // Collect text data until we hit '<' or '{'
        while self.index < self.source.len() && !self.match_str("<") && !self.match_str("{") {
            data.push(self.source.as_bytes()[self.index] as char);
            self.index += 1;
        }

        // If no data was collected, return None
        if data.is_empty() {
            return Ok(None);
        }

        let end = self.index as u32;

        // Decode character references (is_attribute_value = false)
        let decoded_data = decode_html_entities(&data, false);

        Ok(Some(TemplateNode::Text(Text {
            start,
            end,
            raw: CompactString::from(data),
            data: CompactString::from(decoded_data),
        })))
    }
}
