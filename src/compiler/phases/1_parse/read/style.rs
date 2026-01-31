//! Style tag and CSS parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/read/style.js`
//!
//! ## Differences from Svelte
//!
//! - **Standalone CSS parser**: Svelte uses CSS-Tree for CSS parsing, while this
//!   implementation includes a custom CSS parser to avoid external dependencies.
//! - **Selector parsing**: The selector parser is implemented from scratch to
//!   produce an AST compatible with Svelte's expected format.
//! - **Declaration/rule parsing**: Handles CSS rules, at-rules, and declarations
//!   with position tracking for source maps.

use memchr::memmem;
use serde_json::{Map, Value};

use crate::ast::css::{StyleSheet, StyleSheetContent, StyleSheetType};
use crate::ast::template::TemplateNode;
use crate::error::ParseResult;

use super::super::parser::Parser;

// ============================================================================
// Public API
// ============================================================================

/// Parse CSS content and return the children array for StyleSheet.
pub fn parse_css(content: &str, offset: usize) -> Vec<Value> {
    let mut parser = CssParser::new(content, offset);
    parser.parse()
}

// ============================================================================
// Parser implementation for style tags
// ============================================================================

impl Parser<'_> {
    /// Parse a <style> tag and store it in stylesheet.
    pub fn parse_style_tag(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
    ) -> ParseResult<Option<TemplateNode>> {
        // Check for duplicate style tags
        if self.stylesheet.is_some() {
            return Err(crate::error::ParseError::svelte(
                "style_duplicate",
                "A component can have a single top-level `<style>` element",
                (start, start),
            ));
        }

        let content_start = self.index;

        // Find the closing </style> tag (with optional whitespace before >)
        // Also track if we see an invalid '<' that is not part of </style
        let mut first_invalid_lt: Option<usize> = None;
        while !self.is_eof() && !self.is_valid_closing_tag("</style") {
            // Check for '<' that is not part of </style - this is invalid in CSS
            if self.current_char() == '<'
                && !self.match_str("</style")
                && first_invalid_lt.is_none()
            {
                first_invalid_lt = Some(self.index);
            }
            self.advance();
        }

        let content_end = self.index;
        let style_content = &self.source[content_start..content_end];

        // Consume </style followed by optional whitespace and >
        if self.match_str("</style") {
            self.advance_by(7); // consume '</style'
            // Skip whitespace before >
            while !self.is_eof() && self.current_char() != '>' {
                self.advance();
            }
            self.eat_optional(">"); // consume '>'
        } else if self.is_eof() {
            // Style tag was not closed - check if there was invalid '<' in content
            if let Some(lt_pos) = first_invalid_lt {
                return Err(crate::error::ParseError::svelte(
                    "css_expected_identifier",
                    "Expected a valid CSS identifier",
                    (lt_pos, lt_pos),
                ));
            }
            // Style tag was not closed
            return Err(crate::error::ParseError::svelte(
                "expected_token",
                "Expected token </style",
                (self.index, self.index),
            ));
        }

        let end = self.index;

        // Convert attributes to JSON values
        let style_attributes: Vec<serde_json::Value> = attributes
            .iter()
            .filter_map(|attr| {
                if let crate::ast::Attribute::Attribute(attr_node) = attr {
                    serde_json::to_value(attr_node).ok()
                } else {
                    None
                }
            })
            .collect();

        // Parse CSS content
        let css_children = parse_css(style_content, content_start);

        let stylesheet = StyleSheet {
            node_type: StyleSheetType::StyleSheet,
            start: start as u32,
            end: end as u32,
            attributes: style_attributes,
            children: css_children,
            content: StyleSheetContent {
                start: content_start as u32,
                end: content_end as u32,
                styles: style_content.to_string(),
                comment: None,
            },
        };

        self.stylesheet = Some(stylesheet);

        // Return None - style tags don't appear in the fragment
        Ok(None)
    }
}

// ============================================================================
// CSS Parser
// ============================================================================

struct CssParser<'a> {
    source: &'a str,
    offset: usize,
    index: usize,
}

impl<'a> CssParser<'a> {
    fn new(source: &'a str, offset: usize) -> Self {
        Self {
            source,
            offset,
            index: 0,
        }
    }

    fn parse(&mut self) -> Vec<Value> {
        let mut rules = Vec::new();

        while !self.is_eof() {
            self.skip_whitespace();
            if self.is_eof() {
                break;
            }

            // Check for comments
            if self.match_str("/*") {
                self.skip_block_comment();
                continue;
            }

            // Check for at-rules
            if self.current_char() == '@' {
                if let Some(rule) = self.parse_atrule() {
                    rules.push(rule);
                }
                continue;
            }

            // Parse regular rule
            if let Some(rule) = self.parse_rule() {
                rules.push(rule);
            }
        }

        rules
    }

    fn parse_atrule(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume '@'

        // Read at-rule name
        let name = self.read_identifier();
        self.skip_whitespace();

        // Read prelude (until { or ;)
        let prelude_start = self.index;
        let mut depth = 0;
        while !self.is_eof() {
            let c = self.current_char();
            if c == '(' {
                depth += 1;
            } else if c == ')' {
                depth -= 1;
            } else if depth == 0 && (c == '{' || c == ';') {
                break;
            }
            self.advance();
        }
        let prelude = self.source[prelude_start..self.index].trim().to_string();

        let _end = self.offset + self.index;

        // Check if there's a block
        let block = if self.current_char() == '{' {
            let block_start = self.offset + self.index;
            self.advance(); // consume '{'
            self.skip_whitespace();

            // Parse rules inside the block
            let mut children = Vec::new();
            while !self.is_eof() && self.current_char() != '}' {
                self.skip_whitespace();
                if self.is_eof() || self.current_char() == '}' {
                    break;
                }

                // Check for nested at-rule
                if self.current_char() == '@' {
                    if let Some(rule) = self.parse_atrule() {
                        children.push(rule);
                    }
                } else {
                    // Parse regular rule
                    if let Some(rule) = self.parse_rule() {
                        children.push(rule);
                    }
                }
                self.skip_whitespace();
            }

            // Consume closing brace
            self.eat_optional("}");
            let block_end = self.offset + self.index;

            let mut block_obj = Map::new();
            block_obj.insert("type".to_string(), Value::String("Block".to_string()));
            block_obj.insert(
                "start".to_string(),
                Value::Number((block_start as i64).into()),
            );
            block_obj.insert("end".to_string(), Value::Number((block_end as i64).into()));
            block_obj.insert("children".to_string(), Value::Array(children));
            Value::Object(block_obj)
        } else {
            self.eat_optional(";");
            Value::Null
        };

        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Atrule".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("name".to_string(), Value::String(name.to_string()));
        obj.insert("prelude".to_string(), Value::String(prelude));
        obj.insert("block".to_string(), block);

        Some(Value::Object(obj))
    }

    fn parse_rule(&mut self) -> Option<Value> {
        let start = self.offset + self.index;

        // Parse selector
        let selector_start = self.index;
        self.skip_until_block_start();
        let selector_end = self.index;
        let selector_text = &self.source[selector_start..selector_end];

        if selector_text.trim().is_empty() {
            return None;
        }

        // Calculate the actual start position (skipping leading whitespace)
        let leading_ws = selector_text.len() - selector_text.trim_start().len();
        let adjusted_start = self.offset + selector_start + leading_ws;

        let prelude = self.parse_selector_list(selector_text, adjusted_start);

        // Parse block
        if !self.eat_optional("{") {
            return None;
        }

        let block = self.parse_block();

        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Rule".to_string()));
        obj.insert("prelude".to_string(), prelude);
        obj.insert("block".to_string(), block);
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_selector_list(&self, text: &str, offset: usize) -> Value {
        let start = offset;
        // Calculate end position excluding trailing whitespace
        let trailing_ws = text.len() - text.trim_end().len();
        let end = offset + text.len() - trailing_ws;

        // Split by comma for multiple selectors, but respect parentheses and comments
        let selectors: Vec<Value> = self
            .split_by_comma_respecting_parens(text, offset)
            .into_iter()
            .filter(|(s, _)| !s.trim().is_empty())
            .map(|(selector, selector_offset)| {
                self.parse_complex_selector(selector.trim(), selector_offset)
            })
            .collect();

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("SelectorList".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(selectors));

        Value::Object(obj)
    }

    fn parse_complex_selector(&self, text: &str, offset: usize) -> Value {
        let start = offset;
        let end = offset + text.len();

        // Parse relative selectors with combinator handling
        let relative_selectors = self.parse_relative_selectors_with_combinators(text, offset);

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("ComplexSelector".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(relative_selectors));

        Value::Object(obj)
    }

    fn parse_relative_selectors_with_combinators(
        &self,
        text: &str,
        base_offset: usize,
    ) -> Vec<Value> {
        let mut result = Vec::new();
        let mut current_start = 0;
        let mut i = 0;
        let chars: Vec<char> = text.chars().collect();
        let mut last_combinator: Option<(char, usize, usize)> = None;

        while i < chars.len() {
            let c = chars[i];

            // Skip content in parentheses
            if c == '(' {
                let mut depth = 1;
                i += 1;
                while i < chars.len() && depth > 0 {
                    if chars[i] == '(' {
                        depth += 1;
                    } else if chars[i] == ')' {
                        depth -= 1;
                    }
                    i += 1;
                }
                continue;
            }

            // Skip content in brackets
            if c == '[' {
                let mut depth = 1;
                i += 1;
                while i < chars.len() && depth > 0 {
                    if chars[i] == '[' {
                        depth += 1;
                    } else if chars[i] == ']' {
                        depth -= 1;
                    }
                    i += 1;
                }
                continue;
            }

            // Check for combinators (+, >, ~)
            if c == '+' || c == '>' || c == '~' {
                let selector_text = text[current_start..i].trim();
                if !selector_text.is_empty() {
                    let selector_offset = base_offset + current_start;
                    let rel_selector = self.create_relative_selector(
                        selector_text,
                        selector_offset,
                        last_combinator,
                    );
                    result.push(rel_selector);
                }

                let combinator_start = base_offset + i;
                let combinator_end = combinator_start + 1;
                last_combinator = Some((c, combinator_start, combinator_end));

                i += 1;
                // Skip whitespace after combinator
                while i < chars.len() && chars[i].is_whitespace() {
                    i += 1;
                }
                current_start = i;
                continue;
            }

            // Check for descendant combinator (whitespace between selectors)
            if c.is_whitespace() {
                // Look ahead to see if this is followed by a selector (not a combinator)
                let mut j = i + 1;
                while j < chars.len() && chars[j].is_whitespace() {
                    j += 1;
                }
                if j < chars.len() && !matches!(chars[j], '+' | '>' | '~' | ')' | ']') {
                    // Check if next is a selector start
                    if chars[j].is_alphabetic()
                        || chars[j] == ':'
                        || chars[j] == '.'
                        || chars[j] == '#'
                        || chars[j] == '['
                        || chars[j] == '*'
                        || chars[j] == '&'
                    {
                        // This is a descendant combinator (space)
                        let selector_text = text[current_start..i].trim();
                        if !selector_text.is_empty() {
                            let selector_offset = base_offset + current_start;
                            let rel_selector = self.create_relative_selector(
                                selector_text,
                                selector_offset,
                                last_combinator,
                            );
                            result.push(rel_selector);

                            // Set up space combinator for next selector
                            let combinator_start = base_offset + i;
                            let combinator_end = combinator_start + 1;
                            last_combinator = Some((' ', combinator_start, combinator_end));

                            // Skip whitespace and continue from next selector
                            i = j;
                            current_start = i;
                            continue;
                        }
                    }
                }
            }

            i += 1;
        }

        // Add the last selector
        if current_start < text.len() {
            let selector_text = &text[current_start..];
            if !selector_text.trim().is_empty() {
                // Calculate offset skipping leading whitespace
                let leading_ws = selector_text.len() - selector_text.trim_start().len();
                let selector_offset = base_offset + current_start + leading_ws;
                let rel_selector =
                    self.create_relative_selector(selector_text, selector_offset, last_combinator);
                result.push(rel_selector);
            }
        }

        // If no selectors were found, create one for the whole text
        if result.is_empty() && !text.trim().is_empty() {
            // Calculate offset skipping leading whitespace
            let leading_ws = text.len() - text.trim_start().len();
            let adjusted_offset = base_offset + leading_ws;
            let rel_selector = self.create_relative_selector(text, adjusted_offset, None);
            result.push(rel_selector);
        }

        result
    }

    fn create_relative_selector(
        &self,
        text: &str,
        offset: usize,
        combinator: Option<(char, usize, usize)>,
    ) -> Value {
        let start = if let Some((_, comb_start, _)) = combinator {
            comb_start
        } else {
            offset
        };
        let end = offset + text.len();

        let selectors = self.parse_simple_selectors(text, offset);

        let combinator_value = if let Some((c, comb_start, comb_end)) = combinator {
            let mut comb_obj = Map::new();
            comb_obj.insert("type".to_string(), Value::String("Combinator".to_string()));
            comb_obj.insert("name".to_string(), Value::String(c.to_string()));
            comb_obj.insert(
                "start".to_string(),
                Value::Number((comb_start as i64).into()),
            );
            comb_obj.insert("end".to_string(), Value::Number((comb_end as i64).into()));
            Value::Object(comb_obj)
        } else {
            Value::Null
        };

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("RelativeSelector".to_string()),
        );
        obj.insert("combinator".to_string(), combinator_value);
        obj.insert("selectors".to_string(), Value::Array(selectors));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Value::Object(obj)
    }

    fn parse_simple_selectors(&self, text: &str, offset: usize) -> Vec<Value> {
        let mut selectors = Vec::new();

        // Don't trim the text - we need to preserve Unicode escape sequence terminators
        // which may be whitespace characters
        if text.trim().is_empty() {
            return selectors;
        }

        let mut parser = SelectorParser::new(text, offset);
        parser.parse_selectors(&mut selectors);
        selectors
    }

    fn split_by_comma_respecting_parens<'b>(
        &self,
        text: &'b str,
        base_offset: usize,
    ) -> Vec<(&'b str, usize)> {
        let mut result = Vec::new();
        let mut depth = 0;
        let mut last_start = 0;
        let mut in_comment = false;

        let bytes = text.as_bytes();
        let mut i = 0;
        while i < bytes.len() {
            // Handle comments
            if i + 1 < bytes.len() && bytes[i] == b'/' && bytes[i + 1] == b'*' {
                in_comment = true;
                i += 2;
                continue;
            }
            if in_comment && i + 1 < bytes.len() && bytes[i] == b'*' && bytes[i + 1] == b'/' {
                in_comment = false;
                i += 2;
                continue;
            }
            if in_comment {
                i += 1;
                continue;
            }

            let c = bytes[i] as char;
            if c == '(' {
                depth += 1;
            } else if c == ')' {
                depth -= 1;
            } else if c == ',' && depth == 0 {
                let selector = &text[last_start..i];
                result.push((selector, base_offset + last_start));
                last_start = i + 1;
            }
            i += 1;
        }

        // Add the last selector
        if last_start < text.len() {
            let selector = &text[last_start..];
            result.push((selector, base_offset + last_start));
        }

        result
    }

    fn parse_block(&mut self) -> Value {
        let start = self.offset + self.index - 1; // -1 to include the '{'
        let mut declarations = Vec::new();

        self.skip_whitespace();

        while !self.is_eof() && self.current_char() != '}' {
            // Skip comments
            if self.match_str("/*") {
                self.skip_block_comment();
                self.skip_whitespace();
                continue;
            }

            // Handle nested at-rules (like @apply)
            if self.current_char() == '@' {
                // Skip the at-rule until ; or }
                let at_start = self.offset + self.index;
                while !self.is_eof() && self.current_char() != ';' && self.current_char() != '}' {
                    self.advance();
                }
                let at_end = self.offset + self.index;
                self.eat_optional(";");

                // Create an Atrule node for the nested at-rule
                let at_text = &self.source[at_start - self.offset..at_end - self.offset];
                let at_name = at_text
                    .trim_start_matches('@')
                    .split_whitespace()
                    .next()
                    .unwrap_or("");
                let at_prelude = at_text
                    .trim_start_matches('@')
                    .trim_start_matches(at_name)
                    .trim()
                    .to_string();

                let mut at_obj = Map::new();
                at_obj.insert("type".to_string(), Value::String("Atrule".to_string()));
                at_obj.insert("start".to_string(), Value::Number((at_start as i64).into()));
                at_obj.insert("end".to_string(), Value::Number((at_end as i64).into()));
                at_obj.insert("name".to_string(), Value::String(at_name.to_string()));
                at_obj.insert("prelude".to_string(), Value::String(at_prelude));
                at_obj.insert("block".to_string(), Value::Null);
                declarations.push(Value::Object(at_obj));

                self.skip_whitespace();
                continue;
            }

            // Check if this looks like a nested rule (selector followed by {)
            // Look ahead to see if { comes before : or ;
            if self.is_nested_rule() {
                if let Some(rule) = self.parse_rule() {
                    declarations.push(rule);
                }
                self.skip_whitespace();
                continue;
            }

            if let Some(decl) = self.parse_declaration() {
                declarations.push(decl);
            } else {
                // If declaration parsing failed, skip to next ; or } to avoid infinite loop
                while !self.is_eof() && self.current_char() != ';' && self.current_char() != '}' {
                    self.advance();
                }
                self.eat_optional(";");
            }
            self.skip_whitespace();
        }

        self.eat_optional("}");
        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Block".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(declarations));

        Value::Object(obj)
    }

    /// Check if the current position looks like a nested rule (selector followed by {)
    /// by looking ahead to see if { comes before a declaration-style : (property: value)
    fn is_nested_rule(&self) -> bool {
        let remaining = &self.source[self.index..];
        let chars: Vec<char> = remaining.chars().collect();
        let mut depth = 0;
        let mut i = 0;

        // If it starts with : followed by an identifier and then {, it's a pseudo-class selector
        // like :global { ... } or :hover { ... }
        if chars.first() == Some(&':') {
            // Skip past the pseudo-class/pseudo-element
            i = 1;
            // Skip any additional ':'
            while i < chars.len() && chars[i] == ':' {
                i += 1;
            }
            // Skip the identifier
            while i < chars.len()
                && (chars[i].is_alphanumeric() || chars[i] == '-' || chars[i] == '_')
            {
                i += 1;
            }
        }

        while i < chars.len() {
            let c = chars[i];
            match c {
                '(' | '[' => depth += 1,
                ')' | ']' => depth -= 1,
                '{' if depth == 0 => return true,
                ':' if depth == 0 => {
                    // This looks like a property: value declaration
                    return false;
                }
                ';' | '}' if depth == 0 => return false,
                _ => {}
            }
            i += 1;
        }

        false
    }

    fn parse_declaration(&mut self) -> Option<Value> {
        self.skip_whitespace();
        let start = self.offset + self.index;

        // Read property name
        let property_start = self.index;
        while !self.is_eof() {
            let c = self.current_char();
            if c == ':' || c == '}' || c == ';' {
                break;
            }
            self.advance();
        }
        let property = self.source[property_start..self.index].trim().to_string();

        if property.is_empty() || self.current_char() != ':' {
            return None;
        }

        self.advance(); // consume ':'
        self.skip_whitespace();

        // Read value
        let value_start = self.index;
        let mut depth = 0;
        while !self.is_eof() {
            let c = self.current_char();
            if c == '(' {
                depth += 1;
            } else if c == ')' {
                depth -= 1;
            } else if depth == 0 && (c == ';' || c == '}') {
                break;
            }
            self.advance();
        }
        let value = self.source[value_start..self.index].trim().to_string();

        // End position is before the semicolon
        let end = self.offset + self.index;
        self.eat_optional(";");

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Declaration".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("property".to_string(), Value::String(property));
        obj.insert("value".to_string(), Value::String(value));

        Some(Value::Object(obj))
    }

    fn skip_until_block_start(&mut self) {
        let mut depth = 0;
        while !self.is_eof() {
            let c = self.current_char();
            if c == '(' {
                depth += 1;
            } else if c == ')' {
                depth -= 1;
            } else if depth == 0 && c == '{' {
                break;
            }
            self.advance();
        }
    }

    fn skip_block_comment(&mut self) {
        self.advance_by(2); // consume '/*'
        while !self.is_eof() && !self.match_str("*/") {
            self.advance();
        }
        self.advance_by(2); // consume '*/'
    }

    fn is_eof(&self) -> bool {
        self.index >= self.source.len()
    }

    fn current_char(&self) -> char {
        if self.is_eof() {
            '\0'
        } else {
            self.source[self.index..].chars().next().unwrap_or('\0')
        }
    }

    fn advance(&mut self) {
        if !self.is_eof() {
            let c = self.current_char();
            self.index += c.len_utf8();
        }
    }

    fn advance_by(&mut self, n: usize) {
        self.index = (self.index + n).min(self.source.len());
    }

    fn match_str(&self, s: &str) -> bool {
        self.source[self.index..].starts_with(s)
    }

    fn eat(&mut self, s: &str) -> bool {
        if self.match_str(s) {
            self.advance_by(s.len());
            true
        } else {
            false
        }
    }

    /// Alias for eat() to match the naming in Parser.
    /// In CssParser, all eat() calls are optional (no error throwing).
    #[inline]
    fn eat_optional(&mut self, s: &str) -> bool {
        self.eat(s)
    }

    fn skip_whitespace(&mut self) {
        while !self.is_eof() && self.current_char().is_whitespace() {
            self.advance();
        }
    }

    /// Read a CSS identifier, handling CSS escape sequences.
    fn read_identifier(&mut self) -> String {
        let start = self.index;

        while !self.is_eof() {
            let c = self.current_char();

            if c == '\\' {
                // CSS escape sequence
                self.advance(); // consume '\'

                if self.is_eof() {
                    break;
                }

                let next = self.current_char();

                if next.is_ascii_hexdigit() {
                    // Read 1-6 hex digits
                    let mut hex_count = 0;
                    while !self.is_eof() && hex_count < 6 {
                        let hc = self.current_char();
                        if !hc.is_ascii_hexdigit() {
                            break;
                        }
                        self.advance();
                        hex_count += 1;
                    }
                    // After hex digits, optionally consume one whitespace
                    if !self.is_eof() {
                        let after = self.current_char();
                        if after == ' ' || after == '\t' || after == '\n' || after == '\r' {
                            self.advance();
                        }
                    }
                } else {
                    // Escape of a single non-hex character
                    self.advance();
                }
            } else if c.is_alphanumeric() || c == '-' || c == '_' {
                self.advance();
            } else {
                break;
            }
        }

        self.source[start..self.index].to_string()
    }
}

// ============================================================================
// Selector Parser
// ============================================================================

/// Parser for CSS selectors
struct SelectorParser<'a> {
    source: &'a str,
    offset: usize,
    index: usize,
}

impl<'a> SelectorParser<'a> {
    fn new(source: &'a str, offset: usize) -> Self {
        Self {
            source,
            offset,
            index: 0,
        }
    }

    fn parse_selectors(&mut self, selectors: &mut Vec<Value>) {
        while !self.is_eof() {
            self.skip_whitespace();
            if self.is_eof() {
                break;
            }

            // Skip comments
            if self.match_str("/*") {
                self.skip_block_comment();
                continue;
            }

            let c = self.current_char();

            if c == ':' {
                // Pseudo-element (::) or pseudo-class (:)
                if self.peek_next_char() == ':' {
                    // Pseudo-element selector
                    if let Some(selector) = self.parse_pseudo_element_selector() {
                        selectors.push(selector);
                    }
                } else {
                    // Pseudo-class selector
                    if let Some(selector) = self.parse_pseudo_class_selector() {
                        selectors.push(selector);
                    }
                }
            } else if c == '.' {
                // Class selector
                if let Some(selector) = self.parse_class_selector() {
                    selectors.push(selector);
                }
            } else if c == '#' {
                // ID selector
                if let Some(selector) = self.parse_id_selector() {
                    selectors.push(selector);
                }
            } else if c == '[' {
                // Attribute selector
                if let Some(selector) = self.parse_attribute_selector() {
                    selectors.push(selector);
                }
            } else if c == '*' {
                // Universal selector
                let start = self.offset + self.index;
                self.advance();
                let end = self.offset + self.index;

                let mut obj = Map::new();
                obj.insert(
                    "type".to_string(),
                    Value::String("TypeSelector".to_string()),
                );
                obj.insert("name".to_string(), Value::String("*".to_string()));
                obj.insert("start".to_string(), Value::Number((start as i64).into()));
                obj.insert("end".to_string(), Value::Number((end as i64).into()));
                selectors.push(Value::Object(obj));
            } else if c.is_alphabetic() || c == '-' || c == '_' {
                // Type selector (element name)
                if let Some(selector) = self.parse_type_selector() {
                    selectors.push(selector);
                }
            } else {
                // Unknown character, skip it
                self.advance();
            }
        }
    }

    fn parse_pseudo_element_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume first ':'
        self.advance(); // consume second ':'

        let name = self.read_identifier();

        // Check for arguments in parentheses (e.g., ::view-transition-group(foo))
        let args = if self.current_char() == '(' {
            let args_start = self.offset + self.index + 1;
            self.advance(); // consume '('

            // Read content inside parentheses
            let content_start = self.index;
            let mut depth = 1;
            while !self.is_eof() && depth > 0 {
                let c = self.current_char();
                if c == '(' {
                    depth += 1;
                } else if c == ')' {
                    depth -= 1;
                    if depth == 0 {
                        break;
                    }
                }
                self.advance();
            }
            let content_end = self.index;
            let content = &self.source[content_start..content_end];
            let args_end = self.offset + self.index;

            self.advance(); // consume ')'

            // Parse the content as a simple text node (not a selector list for pseudo elements)
            // This handles cases like ::view-transition-group(foo)
            let trimmed = content.trim();
            if !trimmed.is_empty() {
                let mut args_obj = Map::new();
                args_obj.insert("type".to_string(), Value::String("Raw".to_string()));
                args_obj.insert("value".to_string(), Value::String(trimmed.to_string()));
                args_obj.insert(
                    "start".to_string(),
                    Value::Number((args_start as i64).into()),
                );
                args_obj.insert("end".to_string(), Value::Number((args_end as i64).into()));
                Some(Value::Object(args_obj))
            } else {
                None
            }
        } else {
            None
        };

        // Record end position after everything (including arguments if present)
        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("PseudoElementSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        if let Some(args_val) = args {
            obj.insert("args".to_string(), args_val);
        }

        Some(Value::Object(obj))
    }

    fn parse_pseudo_class_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume ':'

        let name = self.read_identifier();

        // Check for arguments in parentheses
        let args = if self.current_char() == '(' {
            let args_start = self.offset + self.index + 1;
            self.advance(); // consume '('

            // Read content inside parentheses
            let content_start = self.index;
            let mut depth = 1;
            while !self.is_eof() && depth > 0 {
                let c = self.current_char();
                if c == '(' {
                    depth += 1;
                } else if c == ')' {
                    depth -= 1;
                    if depth == 0 {
                        break;
                    }
                }
                self.advance();
            }
            let content_end = self.index;
            let content = &self.source[content_start..content_end];

            self.advance(); // consume ')'

            // Check if this is an nth-* pseudo-class that uses special An+B syntax
            let is_nth_pseudo = matches!(
                name.as_str(),
                "nth-child" | "nth-last-child" | "nth-of-type" | "nth-last-of-type"
            );

            if is_nth_pseudo {
                // For nth-* pseudo-classes, parse the An+B syntax and optional 'of S' selector
                let trimmed = content.trim();
                let leading_ws = content.len() - content.trim_start().len();
                let nth_start = args_start + leading_ws;

                // Check for 'of ' keyword to split An+B from selector
                let (nth_value, selector_part, nth_end_pos) = if let Some(of_pos) =
                    memmem::find(trimmed.as_bytes(), b" of ")
                {
                    // Split at ' of ' - include the ' of ' in the Nth value
                    let nth_val = &trimmed[..of_pos + 4]; // Include ' of '
                    let sel_part = &trimmed[of_pos + 4..];
                    let end_pos = nth_start + of_pos + 4;
                    (nth_val, Some((sel_part, end_pos)), end_pos)
                } else {
                    // Check if it's a valid An+B expression or just a selector
                    // An+B patterns: contains n, digits, +/-, or is even/odd
                    let is_nth_pattern = trimmed == "even"
                        || trimmed == "odd"
                        || trimmed.contains('n')
                        || trimmed.chars().any(|c| c.is_ascii_digit())
                        || trimmed.starts_with('+')
                        || trimmed.starts_with('-');

                    if is_nth_pattern {
                        let trailing_ws = content.len() - content.trim_end().len();
                        let end_pos = self.offset + content_end - trailing_ws;
                        (trimmed, None, end_pos)
                    } else {
                        // Not an An+B pattern, treat as regular selector
                        // Fall through to the non-nth parsing below
                        let mut trimmed_inner = content.trim();
                        let mut leading_skip = content.len() - content.trim_start().len();

                        loop {
                            if trimmed_inner.starts_with("/*") {
                                if let Some(end_pos) = memmem::find(trimmed_inner.as_bytes(), b"*/")
                                {
                                    leading_skip += end_pos + 2;
                                    trimmed_inner = &trimmed_inner[end_pos + 2..];
                                    let ws_skip =
                                        trimmed_inner.len() - trimmed_inner.trim_start().len();
                                    leading_skip += ws_skip;
                                    trimmed_inner = trimmed_inner.trim_start();
                                } else {
                                    break;
                                }
                            } else {
                                break;
                            }
                        }

                        let trailing_ws = content.len() - content.trim_end().len();
                        let trimmed_start = args_start + leading_skip;
                        let trimmed_end = self.offset + content_end - trailing_ws;

                        // Parse as regular selector list and set as args for the PseudoClassSelector
                        let args = self.parse_args_selector_list(
                            trimmed_inner,
                            trimmed_start,
                            trimmed_end,
                        );
                        let end = self.offset + self.index;

                        let mut obj = Map::new();
                        obj.insert(
                            "type".to_string(),
                            Value::String("PseudoClassSelector".to_string()),
                        );
                        obj.insert("name".to_string(), Value::String(name));
                        obj.insert("args".to_string(), args);
                        obj.insert("start".to_string(), Value::Number((start as i64).into()));
                        obj.insert("end".to_string(), Value::Number((end as i64).into()));

                        return Some(Value::Object(obj));
                    }
                };

                // Build the selectors array
                let mut selectors = Vec::new();

                // Add Nth object
                let mut nth_obj = Map::new();
                nth_obj.insert("type".to_string(), Value::String("Nth".to_string()));
                nth_obj.insert("value".to_string(), Value::String(nth_value.to_string()));
                nth_obj.insert(
                    "start".to_string(),
                    Value::Number((nth_start as i64).into()),
                );
                nth_obj.insert(
                    "end".to_string(),
                    Value::Number((nth_end_pos as i64).into()),
                );
                selectors.push(Value::Object(nth_obj));

                // Parse selector part if present
                if let Some((sel_text, sel_start)) = selector_part {
                    let sel_parser = SelectorParser::new(sel_text, sel_start);
                    let parsed = sel_parser.parse_simple_selectors();
                    selectors.extend(parsed);
                }

                // Get the actual end position
                let trailing_ws = content.len() - content.trim_end().len();
                let actual_end = self.offset + content_end - trailing_ws;

                // Wrap in RelativeSelector
                let mut rel_sel = Map::new();
                rel_sel.insert(
                    "type".to_string(),
                    Value::String("RelativeSelector".to_string()),
                );
                rel_sel.insert("combinator".to_string(), Value::Null);
                rel_sel.insert("selectors".to_string(), Value::Array(selectors));
                rel_sel.insert(
                    "start".to_string(),
                    Value::Number((nth_start as i64).into()),
                );
                rel_sel.insert("end".to_string(), Value::Number((actual_end as i64).into()));

                // Wrap in ComplexSelector
                let mut complex_sel = Map::new();
                complex_sel.insert(
                    "type".to_string(),
                    Value::String("ComplexSelector".to_string()),
                );
                complex_sel.insert(
                    "start".to_string(),
                    Value::Number((nth_start as i64).into()),
                );
                complex_sel.insert("end".to_string(), Value::Number((actual_end as i64).into()));
                complex_sel.insert(
                    "children".to_string(),
                    Value::Array(vec![Value::Object(rel_sel)]),
                );

                // Wrap in SelectorList
                let mut sel_list = Map::new();
                sel_list.insert(
                    "type".to_string(),
                    Value::String("SelectorList".to_string()),
                );
                sel_list.insert(
                    "start".to_string(),
                    Value::Number((nth_start as i64).into()),
                );
                sel_list.insert("end".to_string(), Value::Number((actual_end as i64).into()));
                sel_list.insert(
                    "children".to_string(),
                    Value::Array(vec![Value::Object(complex_sel)]),
                );

                Some(Value::Object(sel_list))
            } else {
                // Calculate trimmed content positions (strip whitespace and leading comments)
                let mut trimmed = content.trim();
                let mut leading_skip = content.len() - content.trim_start().len();

                // Also skip leading comments for the SelectorList start
                // And update `trimmed` to not include the leading comment
                loop {
                    if trimmed.starts_with("/*") {
                        if let Some(end_pos) = memmem::find(trimmed.as_bytes(), b"*/") {
                            leading_skip += end_pos + 2;
                            trimmed = &trimmed[end_pos + 2..];
                            let ws_skip = trimmed.len() - trimmed.trim_start().len();
                            leading_skip += ws_skip;
                            trimmed = trimmed.trim_start();
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }

                let trailing_ws = content.len() - content.trim_end().len();
                let trimmed_start = args_start + leading_skip;
                let trimmed_end = self.offset + content_end - trailing_ws;

                // Parse the content as a selector list
                Some(self.parse_args_selector_list(trimmed, trimmed_start, trimmed_end))
            }
        } else {
            None
        };

        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("PseudoClassSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        if let Some(args_value) = args {
            obj.insert("args".to_string(), args_value);
        }
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_args_selector_list(&self, text: &str, start: usize, end: usize) -> Value {
        // Parse selector list inside pseudo-class arguments
        // Split by comma for multiple selectors
        let children: Vec<Value> = self
            .split_selectors_by_comma(text, start)
            .into_iter()
            .map(|(selector_text, selector_offset)| {
                // Adjust offset for leading whitespace when trimming
                let leading_ws = selector_text.len() - selector_text.trim_start().len();
                let adjusted_offset = selector_offset + leading_ws;
                self.parse_complex_selector_from_text(selector_text.trim(), adjusted_offset)
            })
            .collect();

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("SelectorList".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(children));

        Value::Object(obj)
    }

    fn split_selectors_by_comma<'b>(
        &self,
        text: &'b str,
        base_offset: usize,
    ) -> Vec<(&'b str, usize)> {
        let mut result = Vec::new();
        let mut depth = 0;
        let mut last_start = 0;
        let mut in_comment = false;

        let bytes = text.as_bytes();
        let mut i = 0;
        while i < bytes.len() {
            if i + 1 < bytes.len() && bytes[i] == b'/' && bytes[i + 1] == b'*' {
                in_comment = true;
                i += 2;
                continue;
            }
            if in_comment && i + 1 < bytes.len() && bytes[i] == b'*' && bytes[i + 1] == b'/' {
                in_comment = false;
                i += 2;
                continue;
            }
            if in_comment {
                i += 1;
                continue;
            }

            let c = bytes[i] as char;
            if c == '(' {
                depth += 1;
            } else if c == ')' {
                depth -= 1;
            } else if c == ',' && depth == 0 {
                let selector = &text[last_start..i];
                result.push((selector, base_offset + last_start));
                last_start = i + 1;
            }
            i += 1;
        }

        // Add the last selector
        if last_start < text.len() {
            let selector = &text[last_start..];
            result.push((selector, base_offset + last_start));
        }

        result
    }

    fn parse_complex_selector_from_text(&self, text: &str, offset: usize) -> Value {
        // Strip leading whitespace and comments
        let mut current = text;
        let mut current_offset = offset;

        loop {
            let before_len = current.len();
            // Strip leading whitespace
            let trimmed = current.trim_start();
            current_offset += before_len - trimmed.len();
            current = trimmed;

            // Strip leading comment
            if current.starts_with("/*") {
                if let Some(end_pos) = memmem::find(current.as_bytes(), b"*/") {
                    current_offset += end_pos + 2;
                    current = &current[end_pos + 2..];
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        // Strip trailing whitespace and comments
        let mut end_current = current;
        loop {
            let _before_len = end_current.len();
            let trimmed = end_current.trim_end();
            end_current = trimmed;

            // Strip trailing comment
            if end_current.ends_with("*/") {
                if let Some(start_pos) = end_current.rfind("/*") {
                    end_current = &end_current[..start_pos];
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        let trimmed = end_current.trim();
        let start = current_offset;
        let end = start + trimmed.len();

        // Parse relative selectors (handle combinators like +, >, ~)
        let relative_selectors = self.parse_relative_selectors_from_text(trimmed, start);

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("ComplexSelector".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(relative_selectors));

        Value::Object(obj)
    }

    fn parse_relative_selectors_from_text(&self, text: &str, base_offset: usize) -> Vec<Value> {
        let mut result = Vec::new();
        let mut current_start = 0;
        let mut i = 0;
        let chars: Vec<char> = text.chars().collect();
        let mut last_combinator: Option<(char, usize, usize)> = None;

        while i < chars.len() {
            let c = chars[i];

            // Skip content in parentheses
            if c == '(' {
                let mut depth = 1;
                i += 1;
                while i < chars.len() && depth > 0 {
                    if chars[i] == '(' {
                        depth += 1;
                    } else if chars[i] == ')' {
                        depth -= 1;
                    }
                    i += 1;
                }
                continue;
            }

            // Check for combinators
            if c == '+' || c == '>' || c == '~' {
                // Found a combinator
                let selector_text = text[current_start..i].trim();
                if !selector_text.is_empty() {
                    let selector_offset = base_offset + current_start;
                    let rel_selector = self.create_relative_selector(
                        selector_text,
                        selector_offset,
                        last_combinator,
                    );
                    result.push(rel_selector);
                }

                let combinator_start = base_offset + i;
                let combinator_end = combinator_start + 1;
                last_combinator = Some((c, combinator_start, combinator_end));

                i += 1;
                // Skip whitespace after combinator
                while i < chars.len() && chars[i].is_whitespace() {
                    i += 1;
                }
                current_start = i;
                continue;
            }

            // Check for descendant combinator (whitespace between selectors)
            if c.is_whitespace() {
                // Look ahead to see if this is followed by a selector (not a combinator)
                let mut j = i + 1;
                while j < chars.len() && chars[j].is_whitespace() {
                    j += 1;
                }
                if j < chars.len() && !matches!(chars[j], '+' | '>' | '~' | ')') && chars[j] != '('
                {
                    // Check if next is a selector start
                    if chars[j].is_alphabetic()
                        || chars[j] == ':'
                        || chars[j] == '.'
                        || chars[j] == '#'
                        || chars[j] == '['
                        || chars[j] == '*'
                        || chars[j] == '&'
                    {
                        // This is a descendant combinator (space)
                        let selector_text = text[current_start..i].trim();
                        if !selector_text.is_empty() {
                            let selector_offset = base_offset + current_start;
                            let rel_selector = self.create_relative_selector(
                                selector_text,
                                selector_offset,
                                last_combinator,
                            );
                            result.push(rel_selector);

                            // Set up space combinator for next selector
                            let combinator_start = base_offset + i;
                            let combinator_end = combinator_start + 1;
                            last_combinator = Some((' ', combinator_start, combinator_end));

                            // Skip whitespace and continue from next selector
                            i = j;
                            current_start = i;
                            continue;
                        }
                    }
                }
            }

            i += 1;
        }

        // Add the last selector
        if current_start < text.len() {
            let selector_text = &text[current_start..];
            if !selector_text.trim().is_empty() {
                // Calculate offset skipping leading whitespace
                let leading_ws = selector_text.len() - selector_text.trim_start().len();
                let selector_offset = base_offset + current_start + leading_ws;
                let rel_selector =
                    self.create_relative_selector(selector_text, selector_offset, last_combinator);
                result.push(rel_selector);
            }
        }

        // If no selectors were found, create one for the whole text
        if result.is_empty() && !text.trim().is_empty() {
            // Calculate offset skipping leading whitespace
            let leading_ws = text.len() - text.trim_start().len();
            let adjusted_offset = base_offset + leading_ws;
            let rel_selector = self.create_relative_selector(text, adjusted_offset, None);
            result.push(rel_selector);
        }

        result
    }

    fn create_relative_selector(
        &self,
        text: &str,
        offset: usize,
        combinator: Option<(char, usize, usize)>,
    ) -> Value {
        let start = if let Some((_, comb_start, _)) = combinator {
            comb_start
        } else {
            offset
        };
        let end = offset + text.len();

        let mut selectors = Vec::new();
        let mut parser = SelectorParser::new(text, offset);
        parser.parse_selectors(&mut selectors);

        let combinator_value = if let Some((c, comb_start, comb_end)) = combinator {
            let mut comb_obj = Map::new();
            comb_obj.insert("type".to_string(), Value::String("Combinator".to_string()));
            comb_obj.insert("name".to_string(), Value::String(c.to_string()));
            comb_obj.insert(
                "start".to_string(),
                Value::Number((comb_start as i64).into()),
            );
            comb_obj.insert("end".to_string(), Value::Number((comb_end as i64).into()));
            Value::Object(comb_obj)
        } else {
            Value::Null
        };

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("RelativeSelector".to_string()),
        );
        obj.insert("combinator".to_string(), combinator_value);
        obj.insert("selectors".to_string(), Value::Array(selectors));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Value::Object(obj)
    }

    fn parse_class_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume '.'

        let name = self.read_identifier();
        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("ClassSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_id_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume '#'

        let name = self.read_identifier();
        let end = self.offset + self.index;

        // Debug output for Unicode escape sequences
        if name.contains('\\') {
            eprintln!(
                "[DEBUG parse_id_selector] start={}, end={}, name={:?}, name.len()={}",
                start,
                end,
                name,
                name.len()
            );
        }

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("IdSelector".to_string()));
        obj.insert("name".to_string(), Value::String(name));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_attribute_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume '['

        // Read until ']'
        let content_start = self.index;
        while !self.is_eof() && self.current_char() != ']' {
            self.advance();
        }
        let name = self.source[content_start..self.index].to_string();
        self.advance(); // consume ']'
        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("AttributeSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_type_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        let name = self.read_identifier();
        let end = self.offset + self.index;

        if name.is_empty() {
            return None;
        }

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("TypeSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn is_eof(&self) -> bool {
        self.index >= self.source.len()
    }

    fn current_char(&self) -> char {
        if self.is_eof() {
            '\0'
        } else {
            self.source[self.index..].chars().next().unwrap_or('\0')
        }
    }

    fn peek_next_char(&self) -> char {
        let mut chars = self.source[self.index..].chars();
        chars.next(); // skip current
        chars.next().unwrap_or('\0')
    }

    fn advance(&mut self) {
        if !self.is_eof() {
            let c = self.current_char();
            self.index += c.len_utf8();
        }
    }

    fn skip_whitespace(&mut self) {
        while !self.is_eof() && self.current_char().is_whitespace() {
            self.advance();
        }
    }

    fn match_str(&self, s: &str) -> bool {
        self.source[self.index..].starts_with(s)
    }

    fn skip_block_comment(&mut self) {
        if !self.match_str("/*") {
            return;
        }
        self.advance(); // consume '/'
        self.advance(); // consume '*'
        while !self.is_eof() {
            if self.match_str("*/") {
                self.advance(); // consume '*'
                self.advance(); // consume '/'
                break;
            }
            self.advance();
        }
    }

    /// Read a CSS identifier, handling CSS escape sequences.
    ///
    /// CSS escape sequences:
    /// - `\XXXXXX` where X are hex digits (1-6 digits) - represents a unicode code point
    /// - After hex digits, an optional single whitespace (space/tab/newline) terminates the escape
    /// - `\c` where c is any non-hex character - represents the literal character c
    fn read_identifier(&mut self) -> String {
        let start = self.index;

        while !self.is_eof() {
            let c = self.current_char();

            if c == '\\' {
                // CSS escape sequence
                self.advance(); // consume '\'

                if self.is_eof() {
                    break;
                }

                let next = self.current_char();

                if next.is_ascii_hexdigit() {
                    eprintln!(
                        "[DEBUG read_identifier] entering hex block at index={}",
                        self.index
                    );
                    // Read 1-6 hex digits
                    let mut hex_count = 0;
                    while !self.is_eof() && hex_count < 6 {
                        let hc = self.current_char();
                        if !hc.is_ascii_hexdigit() {
                            break;
                        }
                        self.advance();
                        hex_count += 1;
                    }
                    eprintln!(
                        "[DEBUG read_identifier] after hex loop: index={}, hex_count={}",
                        self.index, hex_count
                    );
                    eprintln!(
                        "[DEBUG read_identifier] is_eof={}, source.len={}",
                        self.is_eof(),
                        self.source.len()
                    );
                    // After hex digits, optionally consume one whitespace character
                    // but this whitespace is part of the escape and should be preserved
                    if !self.is_eof() {
                        let after = self.current_char();
                        let will_advance =
                            after == ' ' || after == '\t' || after == '\n' || after == '\r';
                        eprintln!(
                            "[DEBUG read_identifier hex] index={}, after={:?}, will_advance={}",
                            self.index, after, will_advance
                        );
                        if will_advance {
                            self.advance();
                            eprintln!(
                                "[DEBUG read_identifier hex] advanced to index={}",
                                self.index
                            );
                        }
                    }
                } else {
                    // Escape of a single non-hex character (e.g., \. means literal .)
                    self.advance();
                }
            } else if c.is_alphanumeric() || c == '-' || c == '_' {
                self.advance();
            } else {
                break;
            }
        }

        self.source[start..self.index].to_string()
    }

    /// Parse simple selectors from the current source and return them as a Vec.
    fn parse_simple_selectors(mut self) -> Vec<Value> {
        let mut selectors = Vec::new();
        self.parse_selectors(&mut selectors);
        selectors
    }
}
