//! Parser state machine.
//!
//! This module implements the main parser state and logic.

use compact_str::CompactString;

use crate::ast::js::Expression;
use crate::ast::span::{LineColumn, SourceLocation};
use crate::ast::{
    AttributeNode, AttributeValue, AttributeValuePart, Comment, Component, ExpressionTag, Fragment,
    FragmentType, HtmlTag, IfBlock, RegularElement, Root, RootType, SlotElement, SvelteElement,
    TemplateNode, Text, TitleElement,
};
use crate::error::{ParseError, ParseResult};

use super::ParseOptions;
use super::lexer::decode_html_entities;

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
    stack: Vec<StackEntry>,
    /// Line offsets for location calculation.
    line_offsets: Vec<usize>,
}

/// An entry on the parser stack.
#[derive(Debug, Clone)]
#[allow(dead_code)]
enum StackEntry {
    Root,
    Element {
        name: CompactString,
        start: u32,
        element_type: ElementType,
    },
    IfBlock {
        start: u32,
    },
    EachBlock {
        start: u32,
    },
    AwaitBlock {
        start: u32,
    },
    KeyBlock {
        start: u32,
    },
    SnippetBlock {
        start: u32,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ElementType {
    Regular,
    Component,
    Slot,
    Title,
    SvelteHead,
    SvelteBody,
    SvelteWindow,
    SvelteDocument,
    SvelteFragment,
    SvelteBoundary,
    SvelteComponent,
    SvelteElement,
    SvelteSelf,
    SvelteOptions,
}

impl<'a> Parser<'a> {
    /// Create a new parser.
    pub fn new(source: &'a str, options: ParseOptions) -> Self {
        // Calculate line offsets for location calculation
        let mut line_offsets = vec![0];
        for (i, c) in source.char_indices() {
            if c == '\n' {
                line_offsets.push(i + 1);
            }
        }

        Self {
            source,
            bytes: source.as_bytes(),
            index: 0,
            options,
            stack: vec![StackEntry::Root],
            line_offsets,
        }
    }

    /// Get source location for a position.
    fn get_location(&self, pos: usize) -> SourceLocation {
        let line = self
            .line_offsets
            .partition_point(|&offset| offset <= pos)
            .saturating_sub(1);
        let line_start = self.line_offsets.get(line).copied().unwrap_or(0);
        let column = pos - line_start;

        SourceLocation {
            start: LineColumn {
                line: (line + 1) as u32,
                column: column as u32,
            },
            end: LineColumn {
                line: (line + 1) as u32,
                column: column as u32,
            },
        }
    }

    /// Get source location for a range.
    #[allow(dead_code)]
    fn get_location_range(&self, start: usize, end: usize) -> SourceLocation {
        let start_loc = self.get_location(start);
        let end_loc = self.get_location(end);
        SourceLocation {
            start: start_loc.start,
            end: end_loc.start,
        }
    }

    /// Parse the source into a Root AST node.
    pub fn parse(&mut self) -> ParseResult<Root> {
        let mut fragment = self.parse_fragment()?;

        // Remove trailing whitespace-only Text nodes (Svelte doesn't include them)
        while let Some(TemplateNode::Text(text)) = fragment.nodes.last() {
            if text.data.chars().all(|c| c.is_whitespace()) {
                fragment.nodes.pop();
            } else {
                break;
            }
        }

        // Calculate end position based on last node, not parser position
        let end = fragment
            .nodes
            .last()
            .map(|node| match node {
                TemplateNode::Text(t) => t.end,
                TemplateNode::Comment(c) => c.end,
                TemplateNode::ExpressionTag(e) => e.end,
                TemplateNode::HtmlTag(h) => h.end,
                TemplateNode::ConstTag(c) => c.end,
                TemplateNode::DebugTag(d) => d.end,
                TemplateNode::RenderTag(r) => r.end,
                TemplateNode::AttachTag(a) => a.end,
                TemplateNode::IfBlock(b) => b.end,
                TemplateNode::EachBlock(b) => b.end,
                TemplateNode::AwaitBlock(b) => b.end,
                TemplateNode::KeyBlock(b) => b.end,
                TemplateNode::SnippetBlock(b) => b.end,
                TemplateNode::RegularElement(e) => e.end,
                TemplateNode::Component(c) => c.end,
                TemplateNode::TitleElement(t) => t.end,
                TemplateNode::SlotElement(s) => s.end,
                TemplateNode::SvelteBody(s)
                | TemplateNode::SvelteDocument(s)
                | TemplateNode::SvelteFragment(s)
                | TemplateNode::SvelteBoundary(s)
                | TemplateNode::SvelteHead(s)
                | TemplateNode::SvelteOptions(s)
                | TemplateNode::SvelteSelf(s)
                | TemplateNode::SvelteWindow(s) => s.end,
                TemplateNode::SvelteComponent(c) => c.end,
                TemplateNode::SvelteElement(e) => e.end,
            })
            .unwrap_or(0);

        Ok(Root {
            css: None,
            js: Vec::new(),
            start: 0,
            end,
            node_type: RootType::Root,
            fragment,
            options: None,
            instance: None,
            module: None,
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
        let start = self.index;
        self.advance(); // consume '<'

        // Check for comment
        if self.match_str("!--") {
            self.advance_by(3); // consume '!--'
            let data_start = self.index;

            while !self.is_eof() && !self.match_str("-->") {
                self.advance();
            }

            let data = &self.source[data_start..self.index];
            self.advance_by(3); // consume '-->'

            return Ok(Some(TemplateNode::Comment(Comment {
                start: start as u32,
                end: self.index as u32,
                data: CompactString::from(data),
            })));
        }

        // Check for closing tag
        if self.match_str("/") {
            self.advance(); // consume '/'
            let _name = self.read_tag_name();
            self.skip_whitespace();
            self.expect(">")?;

            // Pop from stack
            if !self.stack.is_empty() {
                self.stack.pop();
            }

            return Ok(None);
        }

        // Parse opening tag
        let name_start = self.index;
        let name = self.read_tag_name();
        let name_end = self.index;

        if name.is_empty() {
            // Invalid tag, skip
            return Ok(None);
        }

        // Add character field for compatibility
        let name_loc_with_char = self.create_name_loc(name_start, name_end);

        self.skip_whitespace();

        // Parse attributes
        let attributes = self.parse_attributes()?;

        self.skip_whitespace();

        // Check for self-closing or void element
        let self_closing = self.eat("/");
        self.eat(">"); // consume '>'

        let is_void = is_void_element(&name);
        let element_type = self.get_element_type(&name);

        // Create fragment for children
        let mut fragment = Fragment {
            node_type: FragmentType::Fragment,
            nodes: Vec::new(),
        };

        // If not self-closing and not void, parse children
        if !self_closing && !is_void {
            self.stack.push(StackEntry::Element {
                name: name.clone(),
                start: start as u32,
                element_type,
            });

            fragment = self.parse_fragment()?;

            // Handle closing tag
            if self.match_str("</") {
                self.advance_by(2); // consume '</'
                let closing_name = self.read_tag_name();
                self.skip_whitespace();
                self.eat(">"); // consume '>'

                // Verify matching tag
                if closing_name != name {
                    // Mismatched tag, but continue parsing
                }
            }

            // Pop from stack
            if !self.stack.is_empty() {
                self.stack.pop();
            }
        }

        let end = self.index as u32;

        // Create the appropriate element type
        let node = match element_type {
            ElementType::Slot => TemplateNode::SlotElement(SlotElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::Title => TemplateNode::TitleElement(TitleElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::Component => TemplateNode::Component(Component {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::SvelteHead
            | ElementType::SvelteBody
            | ElementType::SvelteWindow
            | ElementType::SvelteDocument
            | ElementType::SvelteFragment
            | ElementType::SvelteBoundary
            | ElementType::SvelteSelf
            | ElementType::SvelteOptions => TemplateNode::SvelteHead(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            _ => TemplateNode::RegularElement(RegularElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
        };

        Ok(Some(node))
    }

    /// Create name_loc with character field for Svelte compatibility.
    fn create_name_loc(&self, start: usize, end: usize) -> SourceLocation {
        let start_loc = self.get_location(start);
        let end_loc = self.get_location(end);

        SourceLocation {
            start: LineColumn {
                line: start_loc.start.line,
                column: start_loc.start.column,
            },
            end: LineColumn {
                line: end_loc.start.line,
                column: end_loc.start.column,
            },
        }
    }

    /// Get element type from tag name.
    fn get_element_type(&self, name: &str) -> ElementType {
        match name {
            "slot" => {
                // Check if inside shadowroot template
                if self.is_inside_shadowroot_template() {
                    ElementType::Regular
                } else {
                    ElementType::Slot
                }
            }
            "title" => {
                if self.is_inside_svelte_head() {
                    ElementType::Title
                } else {
                    ElementType::Regular
                }
            }
            "svelte:head" => ElementType::SvelteHead,
            "svelte:body" => ElementType::SvelteBody,
            "svelte:window" => ElementType::SvelteWindow,
            "svelte:document" => ElementType::SvelteDocument,
            "svelte:fragment" => ElementType::SvelteFragment,
            "svelte:boundary" => ElementType::SvelteBoundary,
            "svelte:component" => ElementType::SvelteComponent,
            "svelte:element" => ElementType::SvelteElement,
            "svelte:self" => ElementType::SvelteSelf,
            "svelte:options" => ElementType::SvelteOptions,
            _ => {
                // Check if component (starts with uppercase or contains dot)
                if name.chars().next().is_some_and(|c| c.is_uppercase()) || name.contains('.') {
                    ElementType::Component
                } else {
                    ElementType::Regular
                }
            }
        }
    }

    /// Check if inside svelte:head.
    fn is_inside_svelte_head(&self) -> bool {
        self.stack.iter().any(|entry| {
            matches!(
                entry,
                StackEntry::Element {
                    element_type: ElementType::SvelteHead,
                    ..
                }
            )
        })
    }

    /// Check if inside shadowroot template.
    fn is_inside_shadowroot_template(&self) -> bool {
        // For now, return false. Full implementation would check for template with shadowrootmode attribute
        false
    }

    /// Parse attributes.
    fn parse_attributes(&mut self) -> ParseResult<Vec<crate::ast::Attribute>> {
        let mut attributes = Vec::new();

        loop {
            self.skip_whitespace();

            if self.is_eof() || self.current_char() == '>' || self.match_str("/>") {
                break;
            }

            if let Some(attr) = self.parse_attribute()? {
                attributes.push(attr);
            } else {
                break;
            }
        }

        Ok(attributes)
    }

    /// Parse a single attribute.
    fn parse_attribute(&mut self) -> ParseResult<Option<crate::ast::Attribute>> {
        let start = self.index;

        // Check for spread attribute or expression shorthand
        if self.match_str("{") {
            // Skip for now, return None
            return Ok(None);
        }

        // Read attribute name
        let name_start = self.index;
        let name = self.read_attribute_name();
        let name_end = self.index;

        if name.is_empty() {
            return Ok(None);
        }

        let name_loc = self.create_name_loc(name_start, name_end);

        self.skip_whitespace();

        // Check for value
        let value = if self.eat("=") {
            self.skip_whitespace();
            self.parse_attribute_value()?
        } else {
            AttributeValue::True(true)
        };

        Ok(Some(crate::ast::Attribute::Attribute(AttributeNode {
            start: start as u32,
            end: self.index as u32,
            name: name.clone(),
            name_loc: Some(name_loc),
            value,
        })))
    }

    /// Parse attribute value.
    fn parse_attribute_value(&mut self) -> ParseResult<AttributeValue> {
        let quote = if self.eat("\"") {
            Some('"')
        } else if self.eat("'") {
            Some('\'')
        } else {
            None
        };

        let mut parts = Vec::new();
        let value_start = self.index;

        loop {
            if self.is_eof() {
                break;
            }

            if let Some(q) = quote {
                if self.current_char() == q {
                    break;
                }
            } else {
                // Unquoted value ends at whitespace, >, or /
                let c = self.current_char();
                if c.is_whitespace() || c == '>' || c == '/' {
                    break;
                }
            }

            // Check for expression
            if self.current_char() == '{' {
                // For now, skip expressions in attribute values
                // Just read until closing brace
                let expr_start = self.index;
                self.advance(); // consume '{'
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    self.advance();
                }
                let expr_end = self.index;

                // Create expression tag
                let expr_content = &self.source[expr_start + 1..expr_end - 1];
                parts.push(AttributeValuePart::ExpressionTag(ExpressionTag {
                    start: expr_start as u32,
                    end: expr_end as u32,
                    expression: self.parse_js_expression(expr_content, expr_start + 1),
                }));
            } else {
                // Text content
                let text_start = self.index;
                while !self.is_eof() {
                    let c = self.current_char();
                    if c == '{' {
                        break;
                    }
                    if let Some(q) = quote {
                        if c == q {
                            break;
                        }
                    } else if c.is_whitespace() || c == '>' || c == '/' {
                        break;
                    }
                    self.advance();
                }
                let text_end = self.index;

                if text_end > text_start {
                    let raw = &self.source[text_start..text_end];
                    let data = decode_html_entities(raw);
                    parts.push(AttributeValuePart::Text(Text {
                        start: text_start as u32,
                        end: text_end as u32,
                        raw: CompactString::from(raw),
                        data: CompactString::from(data),
                    }));
                }
            }
        }

        // Consume closing quote
        if quote.is_some() {
            self.advance();
        }

        if parts.is_empty() {
            // Empty quoted value
            Ok(AttributeValue::Sequence(vec![AttributeValuePart::Text(
                Text {
                    start: value_start as u32,
                    end: value_start as u32,
                    raw: CompactString::from(""),
                    data: CompactString::from(""),
                },
            )]))
        } else {
            Ok(AttributeValue::Sequence(parts))
        }
    }

    /// Parse a mustache expression.
    fn parse_mustache(&mut self) -> ParseResult<Option<TemplateNode>> {
        let start = self.index;
        self.advance(); // consume '{'

        self.skip_whitespace();

        // Check for block tags
        if self.match_str("#") {
            return self.parse_block_open(start);
        }

        if self.match_str(":") {
            // Block continuation - should not happen at top level
            return Ok(None);
        }

        if self.match_str("/") {
            // Block close - should not happen at top level
            return Ok(None);
        }

        if self.match_str("@") {
            return self.parse_special_tag(start);
        }

        // Regular expression tag
        let expr_start = self.index;
        let mut depth = 1;

        while !self.is_eof() && depth > 0 {
            let c = self.current_char();
            if c == '{' {
                depth += 1;
            } else if c == '}' {
                depth -= 1;
                if depth == 0 {
                    break;
                }
            }
            self.advance();
        }

        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        let expression = self.parse_js_expression(expr_content.trim(), expr_start);

        Ok(Some(TemplateNode::ExpressionTag(ExpressionTag {
            start: start as u32,
            end: self.index as u32,
            expression,
        })))
    }

    /// Parse block open tag ({#if}, {#each}, etc.)
    fn parse_block_open(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.advance(); // consume '#'

        let keyword = self.read_identifier();

        match keyword.as_str() {
            "if" => self.parse_if_block(start),
            "each" => self.parse_each_block(start),
            "await" => self.parse_await_block(start),
            "key" => self.parse_key_block(start),
            "snippet" => self.parse_snippet_block(start),
            _ => {
                // Unknown block, skip to closing brace
                while !self.is_eof() && self.current_char() != '}' {
                    self.advance();
                }
                self.advance(); // consume '}'
                Ok(None)
            }
        }
    }

    /// Parse {#if} block.
    fn parse_if_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.skip_whitespace();

        // Read the test expression
        let expr_start = self.index;
        while !self.is_eof() && self.current_char() != '}' {
            self.advance();
        }
        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        let test = self.parse_js_expression(expr_content.trim(), expr_start);

        // Push block to stack
        self.stack.push(StackEntry::IfBlock {
            start: start as u32,
        });

        // Parse consequent
        let consequent = self.parse_fragment()?;

        // Check for {:else} or {:else if}
        let alternate = if self.match_str("{:") {
            let else_block_start = self.index; // Position of {:
            self.advance_by(2); // consume '{:'
            self.skip_whitespace();

            if self.eat("else") {
                self.skip_whitespace();

                if self.eat("if") {
                    // {:else if ...}
                    self.skip_whitespace();
                    let alt_expr_start = self.index;
                    while !self.is_eof() && self.current_char() != '}' {
                        self.advance();
                    }
                    let alt_expr_content = &self.source[alt_expr_start..self.index];
                    self.advance(); // consume '}'

                    let elseif_start = else_block_start; // Position where {:else if started
                    let alt_test =
                        self.parse_js_expression(alt_expr_content.trim(), alt_expr_start);
                    let alt_consequent = self.parse_fragment()?;

                    // Check for another else
                    let alt_alternate = if self.match_str("{:") {
                        // Recursively handle nested else
                        None // Simplified
                    } else {
                        None
                    };

                    // Handle closing {/if}
                    if self.match_str("{/") {
                        self.advance_by(2);
                        self.eat("if");
                        self.skip_whitespace();
                        self.eat("}");
                    }

                    Some(Fragment {
                        node_type: FragmentType::Fragment,
                        nodes: vec![TemplateNode::IfBlock(IfBlock {
                            start: elseif_start as u32,
                            end: self.index as u32,
                            elseif: true,
                            test: alt_test,
                            consequent: alt_consequent,
                            alternate: alt_alternate,
                        })],
                    })
                } else {
                    // {:else}
                    self.eat("}");
                    let alt_fragment = self.parse_fragment()?;

                    // Handle closing {/if}
                    if self.match_str("{/") {
                        self.advance_by(2);
                        self.eat("if");
                        self.skip_whitespace();
                        self.eat("}");
                    }

                    Some(alt_fragment)
                }
            } else {
                None
            }
        } else if self.match_str("{/") {
            // Handle closing {/if}
            self.advance_by(2);
            self.eat("if");
            self.skip_whitespace();
            self.eat("}");
            None
        } else {
            None
        };

        // Pop from stack
        if !self.stack.is_empty() {
            self.stack.pop();
        }

        Ok(Some(TemplateNode::IfBlock(IfBlock {
            start: start as u32,
            end: self.index as u32,
            elseif: false,
            test,
            consequent,
            alternate,
        })))
    }

    /// Parse {#each} block.
    fn parse_each_block(&mut self, _start: usize) -> ParseResult<Option<TemplateNode>> {
        // Simplified: just skip to closing and return placeholder
        while !self.is_eof() && !self.match_str("{/each}") {
            self.advance();
        }
        if self.match_str("{/each}") {
            self.advance_by(7);
        }
        Ok(None)
    }

    /// Parse {#await} block.
    fn parse_await_block(&mut self, _start: usize) -> ParseResult<Option<TemplateNode>> {
        // Simplified: just skip to closing and return placeholder
        while !self.is_eof() && !self.match_str("{/await}") {
            self.advance();
        }
        if self.match_str("{/await}") {
            self.advance_by(8);
        }
        Ok(None)
    }

    /// Parse {#key} block.
    fn parse_key_block(&mut self, _start: usize) -> ParseResult<Option<TemplateNode>> {
        // Simplified: just skip to closing and return placeholder
        while !self.is_eof() && !self.match_str("{/key}") {
            self.advance();
        }
        if self.match_str("{/key}") {
            self.advance_by(6);
        }
        Ok(None)
    }

    /// Parse {#snippet} block.
    fn parse_snippet_block(&mut self, _start: usize) -> ParseResult<Option<TemplateNode>> {
        // Simplified: just skip to closing and return placeholder
        while !self.is_eof() && !self.match_str("{/snippet}") {
            self.advance();
        }
        if self.match_str("{/snippet}") {
            self.advance_by(10);
        }
        Ok(None)
    }

    /// Parse special tag ({@html}, {@debug}, etc.)
    fn parse_special_tag(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.advance(); // consume '@'

        let keyword = self.read_identifier();
        self.skip_whitespace();

        match keyword.as_str() {
            "html" => {
                let expr_start = self.index;
                while !self.is_eof() && self.current_char() != '}' {
                    self.advance();
                }
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'

                let expression = self.parse_js_expression(expr_content.trim(), expr_start);

                Ok(Some(TemplateNode::HtmlTag(HtmlTag {
                    start: start as u32,
                    end: self.index as u32,
                    expression,
                })))
            }
            "debug" | "const" | "render" | "attach" => {
                // Skip to closing brace
                while !self.is_eof() && self.current_char() != '}' {
                    self.advance();
                }
                self.advance(); // consume '}'
                Ok(None)
            }
            _ => {
                // Unknown special tag
                while !self.is_eof() && self.current_char() != '}' {
                    self.advance();
                }
                self.advance(); // consume '}'
                Ok(None)
            }
        }
    }

    /// Parse a JavaScript expression and return as Expression.
    fn parse_js_expression(&self, content: &str, offset: usize) -> Expression {
        super::expression::parse_expression(content.trim(), offset, &self.line_offsets)
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
    fn advance_by(&mut self, n: usize) {
        self.index = (self.index + n).min(self.bytes.len());
    }

    /// Check if the source at current position starts with the given string.
    #[inline]
    fn match_str(&self, s: &str) -> bool {
        self.source[self.index..].starts_with(s)
    }

    /// Consume a string if it matches.
    fn eat(&mut self, s: &str) -> bool {
        if self.match_str(s) {
            self.advance_by(s.len());
            true
        } else {
            false
        }
    }

    /// Consume a string, returning an error if it doesn't match.
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
    fn skip_whitespace(&mut self) {
        while !self.is_eof() {
            let c = self.current_char();
            if !c.is_whitespace() {
                break;
            }
            self.advance();
        }
    }

    /// Read an identifier.
    fn read_identifier(&mut self) -> CompactString {
        let start = self.index;

        while !self.is_eof() {
            let c = self.current_char();
            if !c.is_alphanumeric() && c != '_' && c != '$' {
                break;
            }
            self.advance();
        }

        CompactString::from(&self.source[start..self.index])
    }

    /// Read a tag name.
    fn read_tag_name(&mut self) -> CompactString {
        let start = self.index;

        while !self.is_eof() {
            let c = self.current_char();
            if c.is_whitespace() || c == '>' || c == '/' || c == '=' {
                break;
            }
            self.advance();
        }

        CompactString::from(&self.source[start..self.index])
    }

    /// Read an attribute name.
    fn read_attribute_name(&mut self) -> CompactString {
        let start = self.index;

        while !self.is_eof() {
            let c = self.current_char();
            if c.is_whitespace() || c == '=' || c == '>' || c == '/' || c == '"' || c == '\'' {
                break;
            }
            self.advance();
        }

        CompactString::from(&self.source[start..self.index])
    }

    /// Peek at the next n characters.
    fn peek_chars(&self, n: usize) -> String {
        self.source[self.index..].chars().take(n).collect()
    }
}

/// Check if an element is a void element.
fn is_void_element(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
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

    #[test]
    fn test_parse_element() {
        let mut parser = Parser::new("<div>hello</div>", ParseOptions::default());
        let result = parser.parse().unwrap();

        assert_eq!(result.fragment.nodes.len(), 1);
        match &result.fragment.nodes[0] {
            TemplateNode::RegularElement(el) => {
                assert_eq!(el.name.as_str(), "div");
                assert_eq!(el.fragment.nodes.len(), 1);
            }
            _ => panic!("Expected RegularElement node"),
        }
    }

    #[test]
    fn test_parse_if_block() {
        let mut parser = Parser::new("{#if foo}bar{/if}", ParseOptions::default());
        let result = parser.parse().unwrap();

        assert_eq!(result.fragment.nodes.len(), 1);
        match &result.fragment.nodes[0] {
            TemplateNode::IfBlock(block) => {
                assert!(!block.elseif);
                assert_eq!(block.consequent.nodes.len(), 1);
            }
            _ => panic!("Expected IfBlock node"),
        }
    }
}
