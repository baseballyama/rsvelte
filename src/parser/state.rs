//! Parser state machine.
//!
//! This module implements the main parser state and logic.

use compact_str::CompactString;

use crate::ast::css::StyleSheet;
use crate::ast::js::Expression;
use crate::ast::span::{LineColumn, SourceLocation};
use crate::ast::template::{Script, ScriptType};
use crate::ast::{
    AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock, Comment, Component,
    CustomElementOptions, EachBlock, ExpressionTag, Fragment, FragmentType, HtmlTag, IfBlock,
    RegularElement, RenderTag, Root, RootType, ScriptContext, SlotElement, SnippetBlock,
    SvelteDynamicElement, SvelteElement, SvelteOptions, TemplateNode, Text, TitleElement,
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
    /// Parsed instance script (context="default").
    instance_script: Option<Script>,
    /// Parsed module script (context="module").
    module_script: Option<Script>,
    /// Parsed stylesheet.
    stylesheet: Option<StyleSheet>,
    /// Parsed svelte:options.
    svelte_options: Option<SvelteOptions>,
    /// Pending comments that could become leading comments for a script.
    pending_leading_comments: Vec<String>,
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
    ShadowrootTemplate,
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
            instance_script: None,
            module_script: None,
            stylesheet: None,
            svelte_options: None,
            pending_leading_comments: Vec::new(),
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
                character: pos as u32,
            },
            end: LineColumn {
                line: (line + 1) as u32,
                column: column as u32,
                character: pos as u32,
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

        // Determine the end position of script/style tags
        let script_end = self
            .instance_script
            .as_ref()
            .map(|s| s.end)
            .unwrap_or(0)
            .max(self.module_script.as_ref().map(|s| s.end).unwrap_or(0));
        let style_end = self.stylesheet.as_ref().map(|s| s.end).unwrap_or(0);
        let max_special_end = script_end.max(style_end);

        // Remove trailing whitespace-only Text nodes (Svelte doesn't include them)
        // But only if they're at the very end of the file (after script/style too)
        while let Some(TemplateNode::Text(text)) = fragment.nodes.last() {
            let is_whitespace = text.data.chars().all(|c| c.is_whitespace());
            let after_special = text.end >= max_special_end;
            if is_whitespace && after_special {
                fragment.nodes.pop();
            } else {
                break;
            }
        }

        // Calculate end position - consider fragment nodes, script, and style
        let fragment_end = fragment
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

        // End is the maximum of fragment end, script end, and style end
        let end = fragment_end.max(max_special_end);

        Ok(Root {
            css: self.stylesheet.take().map(Box::new),
            js: Vec::new(),
            start: 0,
            end,
            node_type: RootType::Root,
            fragment,
            options: self.svelte_options.take().map(Box::new),
            instance: self.instance_script.take().map(Box::new),
            module: self.module_script.take().map(Box::new),
        })
    }

    /// Check if the remaining content from current position to EOF is only whitespace.
    fn remaining_is_whitespace_only(&self) -> bool {
        self.source[self.index..].chars().all(|c| c.is_whitespace())
    }

    /// Parse a fragment (sequence of nodes).
    fn parse_fragment(&mut self) -> ParseResult<Fragment> {
        let mut nodes = Vec::new();

        while !self.is_eof() {
            // Check for end conditions
            if self.match_str("</") || self.match_str("{/") || self.match_str("{:") {
                break;
            }

            // Skip trailing whitespace at EOF - don't parse it as a Text node
            if self.remaining_is_whitespace_only() {
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

            // Track comment as potential leading comment for a script
            self.pending_leading_comments.push(data.to_string());

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

        // Track position after tag name for unclosed elements at EOF
        let pos_after_name = self.index;
        self.skip_whitespace();

        // Parse attributes
        let attributes = self.parse_attributes()?;

        // Track position before whitespace skip for unclosed elements at EOF
        let pos_after_attrs = self.index;
        self.skip_whitespace();

        // Check for self-closing or void element
        let self_closing = self.eat("/");
        let has_closing_bracket = self.eat(">"); // consume '>'

        // For unclosed elements at EOF, restore position to before trailing whitespace
        if !has_closing_bracket && self.is_eof() {
            // Restore to the earliest non-whitespace position
            if attributes.is_empty() {
                self.index = pos_after_name;
            } else if self.index > pos_after_attrs {
                self.index = pos_after_attrs;
            }
        }

        // Handle script and style tags specially
        if name == "script" {
            return self.parse_script_tag(start, attributes);
        }

        if name == "style" {
            return self.parse_style_tag(start, attributes);
        }

        // Handle svelte:options specially - extract and store options
        if name == "svelte:options" {
            return self.parse_svelte_options(start, attributes);
        }

        // Add character field for compatibility
        let name_loc_with_char = self.create_name_loc(name_start, name_end);

        let is_void = is_void_element(&name);
        let element_type = self.get_element_type(&name, &attributes);

        // Create fragment for children
        let mut fragment = Fragment {
            node_type: FragmentType::Fragment,
            nodes: Vec::new(),
        };

        // If not self-closing and not void, parse children
        // But only if we found the closing bracket '>' - otherwise the element is malformed
        if !self_closing && !is_void && has_closing_bracket {
            self.stack.push(StackEntry::Element {
                name: name.clone(),
                start: start as u32,
                element_type,
            });

            fragment = self.parse_fragment()?;

            // Handle closing tag or block close
            if self.match_str("</") {
                let close_start = self.index;
                self.advance_by(2); // consume '</'
                let closing_name = self.read_tag_name();
                self.skip_whitespace();

                // Verify matching tag
                if closing_name == name {
                    // Matching close tag - consume it
                    self.eat(">"); // consume '>'
                } else {
                    // Mismatched close tag - in loose mode, auto-close current element
                    // and don't consume the close tag (let parent handle it)
                    self.index = close_start; // Reset to before '</...'
                }
            }
            // If we encounter a block closing tag {/ while inside an element,
            // the element is unclosed - auto-close it and let the block handle {/
            // (We don't consume {/ here, parse_fragment already stopped at it)

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
            ElementType::SvelteElement => {
                // Extract the "this" attribute to get the tag expression
                let tag = self.extract_this_attribute(&attributes);

                // Filter out the "this" attribute from the list
                let filtered_attrs: Vec<_> = attributes
                    .into_iter()
                    .filter(|attr| {
                        if let crate::ast::Attribute::Attribute(node) = attr {
                            node.name.as_str() != "this"
                        } else {
                            true
                        }
                    })
                    .collect();

                TemplateNode::SvelteElement(SvelteDynamicElement {
                    start: start as u32,
                    end,
                    name: name.clone(),
                    name_loc: Some(name_loc_with_char),
                    attributes: filtered_attrs,
                    fragment,
                    tag,
                })
            }
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

    /// Extract the "this" attribute from a svelte:element to get the tag expression.
    fn extract_this_attribute(&self, attributes: &[crate::ast::Attribute]) -> Expression {
        for attr in attributes {
            if let crate::ast::Attribute::Attribute(node) = attr {
                if node.name.as_str() == "this" {
                    if let AttributeValue::Expression(expr_tag) = &node.value {
                        return expr_tag.expression.clone();
                    }
                }
            }
        }

        // Default to null expression if no "this" attribute found
        Expression::from_json(serde_json::json!(null))
    }

    /// Create name_loc with character field for Svelte compatibility.
    fn create_name_loc(&self, start: usize, end: usize) -> SourceLocation {
        let start_loc = self.get_location(start);
        let end_loc = self.get_location(end);

        SourceLocation {
            start: LineColumn {
                line: start_loc.start.line,
                column: start_loc.start.column,
                character: start_loc.start.character,
            },
            end: LineColumn {
                line: end_loc.start.line,
                column: end_loc.start.column,
                character: end_loc.start.character,
            },
        }
    }

    /// Get element type from tag name and attributes.
    fn get_element_type(&self, name: &str, attributes: &[crate::ast::Attribute]) -> ElementType {
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
            "template" => {
                // Check for shadowrootmode attribute
                if self.has_shadowrootmode_attr(attributes) {
                    ElementType::ShadowrootTemplate
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
        self.stack.iter().any(|entry| {
            matches!(
                entry,
                StackEntry::Element {
                    element_type: ElementType::ShadowrootTemplate,
                    ..
                }
            )
        })
    }

    /// Check if a template element has shadowrootmode attribute.
    fn has_shadowrootmode_attr(&self, attributes: &[crate::ast::Attribute]) -> bool {
        attributes.iter().any(|attr| {
            if let crate::ast::Attribute::Attribute(attr_node) = attr {
                attr_node.name.as_str() == "shadowrootmode"
            } else {
                false
            }
        })
    }

    /// Parse attributes.
    fn parse_attributes(&mut self) -> ParseResult<Vec<crate::ast::Attribute>> {
        let mut attributes = Vec::new();

        loop {
            // Track position before whitespace skip for unclosed elements
            let before_ws = self.index;
            self.skip_whitespace();

            // Stop conditions:
            // - EOF
            // - '>' (end of open tag)
            // - '/>' (self-closing)
            // - '</' (closing tag starts - unclosed open tag in loose mode)
            // - '{/' (block closing tag - unclosed open tag inside block in loose mode)
            // - '{#' (block opening tag - unclosed open tag followed by sibling block in loose mode)
            if self.is_eof()
                || self.current_char() == '>'
                || self.match_str("/>")
                || self.match_str("</")
                || self.match_str("{/")
                || self.match_str("{#")
            {
                // For unclosed elements at EOF, restore position to before trailing whitespace
                if self.is_eof() && self.index > before_ws {
                    self.index = before_ws;
                }
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

        // Check for spread attribute, @attach, or expression shorthand
        if self.match_str("{") {
            self.advance(); // consume '{'
            self.skip_whitespace();

            // Check for @attach
            if self.eat("@attach") {
                return self.parse_attach_attribute(start);
            }

            // Check for spread attribute {...expr}
            if self.eat("...") {
                let expr_start = self.index;
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    if depth > 0 {
                        self.advance();
                    }
                }
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'
                let expression = self.parse_js_expression(expr_content.trim(), expr_start);
                return Ok(Some(crate::ast::Attribute::SpreadAttribute(
                    crate::ast::template::SpreadAttribute {
                        start: start as u32,
                        end: self.index as u32,
                        expression,
                    },
                )));
            }

            // Expression shorthand {expr} or empty {} in loose mode
            let expr_start = self.index;
            let mut depth = 1;
            while !self.is_eof() && depth > 0 {
                let c = self.current_char();
                if c == '{' {
                    depth += 1;
                } else if c == '}' {
                    depth -= 1;
                }
                if depth > 0 {
                    self.advance();
                }
            }
            let expr_end = self.index;
            let expr_content = &self.source[expr_start..expr_end];
            self.advance(); // consume '}'

            // Create the expression
            let expression = if expr_content.trim().is_empty() {
                // Empty expression: create identifier with loc and character field
                super::expression::create_identifier_with_character(
                    "",
                    expr_start,
                    expr_start,
                    &self.line_offsets,
                )
            } else {
                self.parse_js_expression(expr_content.trim(), expr_start)
            };

            // Create the attribute name from the expression (shorthand)
            let name = if expr_content.trim().is_empty() {
                "".to_string()
            } else {
                expr_content.trim().to_string()
            };

            // Calculate name_loc
            let name_loc = self.create_name_loc(
                expr_start,
                if expr_content.trim().is_empty() {
                    expr_start
                } else {
                    expr_end
                },
            );

            // Create the ExpressionTag value
            let value = AttributeValue::Expression(ExpressionTag {
                start: (start + 1) as u32, // start after {
                end: if expr_content.trim().is_empty() {
                    (start + 1) as u32
                } else {
                    expr_end as u32
                },
                expression: expression.clone(),
            });

            return Ok(Some(crate::ast::Attribute::Attribute(AttributeNode {
                start: start as u32,
                end: self.index as u32,
                name: CompactString::from(name),
                name_loc: Some(name_loc),
                value,
            })));
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

        // Check for on: directive (event handler)
        if name.starts_with("on:") {
            return self.parse_on_directive(start, &name, name_start, name_end);
        }

        // Check for bind: directive
        if name.starts_with("bind:") {
            return self.parse_bind_directive(start, &name, name_start, name_end);
        }

        // Check for use: directive (actions)
        if name.starts_with("use:") {
            return self.parse_use_directive(start, &name, name_start, name_end);
        }

        // Check for class: directive
        if name.starts_with("class:") {
            return self.parse_class_directive(start, &name, name_start, name_end);
        }

        // Check for style: directive
        if name.starts_with("style:") {
            return self.parse_style_directive(start, &name, name_start, name_end);
        }

        // Check for transition: / in: / out: directives
        if name.starts_with("transition:") || name.starts_with("in:") || name.starts_with("out:") {
            return self.parse_transition_directive(start, &name, name_start, name_end);
        }

        // Check for animate: directive
        if name.starts_with("animate:") {
            return self.parse_animate_directive(start, &name, name_start, name_end);
        }

        // Check for let: directive
        if name.starts_with("let:") {
            return self.parse_let_directive(start, &name, name_start, name_end);
        }

        // Check for value
        let (value, attr_end) = if self.eat("=") {
            self.skip_whitespace();
            (self.parse_attribute_value()?, self.index)
        } else {
            // Boolean attribute - end is at the end of the name, not after whitespace
            (AttributeValue::True(true), name_end)
        };

        Ok(Some(crate::ast::Attribute::Attribute(AttributeNode {
            start: start as u32,
            end: attr_end as u32,
            name: name.clone(),
            name_loc: Some(name_loc),
            value,
        })))
    }

    /// Parse an on: directive (event handler).
    fn parse_on_directive(
        &mut self,
        start: usize,
        full_name: &str,
        name_start: usize,
        name_end: usize,
    ) -> ParseResult<Option<crate::ast::Attribute>> {
        // Extract event name and modifiers from "on:click|preventDefault"
        let after_on = &full_name[3..]; // Skip "on:"
        let (event_name, modifiers) = if let Some(pipe_pos) = after_on.find('|') {
            let name = &after_on[..pipe_pos];
            let mods: Vec<CompactString> = after_on[pipe_pos + 1..]
                .split('|')
                .map(CompactString::from)
                .collect();
            (name.to_string(), mods)
        } else {
            (after_on.to_string(), Vec::new())
        };

        let name_loc = self.create_name_loc(name_start, name_end);

        // Parse the value (expression)
        let (expression, end_pos) = if self.eat("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}"
            if self.eat("\"") || self.eat("'") {
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                if self.eat("{") {
                    let expr_start = self.index;
                    let mut depth = 1;
                    while !self.is_eof() && depth > 0 {
                        let c = self.current_char();
                        if c == '{' {
                            depth += 1;
                        } else if c == '}' {
                            depth -= 1;
                        }
                        if depth > 0 {
                            self.advance();
                        }
                    }
                    let expr_content = &self.source[expr_start..self.index];
                    self.advance(); // consume '}'
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (
                        Some(self.parse_js_expression(expr_content, expr_start)),
                        self.index,
                    )
                } else {
                    // Plain quoted string - skip
                    while !self.is_eof() && self.current_char() != quote {
                        self.advance();
                    }
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (None, self.index)
                }
            } else if self.eat("{") {
                // Expression in braces
                let expr_start = self.index;
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    if depth > 0 {
                        self.advance();
                    }
                }
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'
                (
                    Some(self.parse_js_expression(expr_content, expr_start)),
                    self.index,
                )
            } else {
                (None, self.index)
            }
        } else {
            (None, name_end)
        };

        Ok(Some(crate::ast::Attribute::OnDirective(
            crate::ast::template::OnDirective {
                start: start as u32,
                end: end_pos as u32,
                name: CompactString::from(event_name),
                name_loc: Some(name_loc),
                expression,
                modifiers,
            },
        )))
    }

    /// Parse a bind: directive (two-way binding).
    fn parse_bind_directive(
        &mut self,
        start: usize,
        full_name: &str,
        name_start: usize,
        name_end: usize,
    ) -> ParseResult<Option<crate::ast::Attribute>> {
        // Extract property name and modifiers from "bind:value|modifier"
        let after_bind = &full_name[5..]; // Skip "bind:"
        let (prop_name, modifiers) = if let Some(pipe_pos) = after_bind.find('|') {
            let name = &after_bind[..pipe_pos];
            let mods: Vec<CompactString> = after_bind[pipe_pos + 1..]
                .split('|')
                .map(CompactString::from)
                .collect();
            (name.to_string(), mods)
        } else {
            (after_bind.to_string(), Vec::new())
        };

        let name_loc = self.create_name_loc(name_start, name_end);

        // Parse the value (expression)
        let (expression, end_pos) = if self.eat("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}"
            if self.eat("\"") || self.eat("'") {
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                if self.eat("{") {
                    let expr_start = self.index;
                    let mut depth = 1;
                    while !self.is_eof() && depth > 0 {
                        let c = self.current_char();
                        if c == '{' {
                            depth += 1;
                        } else if c == '}' {
                            depth -= 1;
                        }
                        if depth > 0 {
                            self.advance();
                        }
                    }
                    let expr_content = &self.source[expr_start..self.index];
                    self.advance(); // consume '}'
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (
                        self.parse_js_expression(expr_content, expr_start),
                        self.index,
                    )
                } else {
                    // Plain quoted - skip
                    while !self.is_eof() && self.current_char() != quote {
                        self.advance();
                    }
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (
                        super::expression::create_identifier_with_character(
                            &prop_name,
                            name_start + 5,
                            name_end,
                            &self.line_offsets,
                        ),
                        self.index,
                    )
                }
            } else if self.eat("{") {
                // Expression in braces
                let expr_start = self.index;
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    if depth > 0 {
                        self.advance();
                    }
                }
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'
                (
                    self.parse_js_expression(expr_content, expr_start),
                    self.index,
                )
            } else {
                // Shorthand: bind:value without expression means bind to a variable with same name
                (
                    super::expression::create_identifier_with_character(
                        &prop_name,
                        name_start + 5, // start after "bind:"
                        name_end,
                        &self.line_offsets,
                    ),
                    name_end,
                )
            }
        } else {
            // Shorthand: bind:value means bind to variable named "value"
            (
                super::expression::create_identifier_with_character(
                    &prop_name,
                    name_start + 5, // start after "bind:"
                    name_end,
                    &self.line_offsets,
                ),
                name_end,
            )
        };

        Ok(Some(crate::ast::Attribute::BindDirective(
            crate::ast::template::BindDirective {
                start: start as u32,
                end: end_pos as u32,
                name: CompactString::from(prop_name),
                name_loc: Some(name_loc),
                expression,
                modifiers,
            },
        )))
    }

    /// Parse a use: directive (action): `use:action`, `use:action={expression}`, or `use:action="{expression}"`.
    fn parse_use_directive(
        &mut self,
        start: usize,
        full_name: &str,
        name_start: usize,
        name_end: usize,
    ) -> ParseResult<Option<crate::ast::Attribute>> {
        let action_name = &full_name[4..]; // Skip "use:"
        let name_loc = self.create_name_loc(name_start, name_end);

        let (expression, end_pos) = if self.eat("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}" or ="value"
            if self.eat("\"") || self.eat("'") {
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                // Look for expression inside quotes: "{expr}"
                if self.eat("{") {
                    let expr_start = self.index;
                    let mut depth = 1;
                    while !self.is_eof() && depth > 0 {
                        let c = self.current_char();
                        if c == '{' {
                            depth += 1;
                        } else if c == '}' {
                            depth -= 1;
                        }
                        if depth > 0 {
                            self.advance();
                        }
                    }
                    let expr_end = self.index;
                    let expr_content = &self.source[expr_start..expr_end];
                    self.advance(); // consume '}'
                    // Consume the closing quote
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (
                        Some(self.parse_js_expression(expr_content, expr_start)),
                        self.index,
                    )
                } else {
                    // Plain quoted string - skip until closing quote
                    while !self.is_eof() && self.current_char() != quote {
                        self.advance();
                    }
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (None, self.index)
                }
            } else if self.eat("{") {
                // Unquoted expression: ={expression}
                let expr_start = self.index;
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    if depth > 0 {
                        self.advance();
                    }
                }
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                (
                    Some(self.parse_js_expression(expr_content, expr_start)),
                    self.index,
                )
            } else {
                (None, self.index)
            }
        } else {
            // No value - use name_end as the end position
            (None, name_end)
        };

        Ok(Some(crate::ast::Attribute::UseDirective(
            crate::ast::template::UseDirective {
                start: start as u32,
                end: end_pos as u32,
                name: CompactString::from(action_name),
                name_loc: Some(name_loc),
                expression,
            },
        )))
    }

    /// Parse a class: directive: `class:name` or `class:name={expression}`.
    fn parse_class_directive(
        &mut self,
        start: usize,
        full_name: &str,
        name_start: usize,
        name_end: usize,
    ) -> ParseResult<Option<crate::ast::Attribute>> {
        let class_name = &full_name[6..]; // Skip "class:"
        let name_loc = self.create_name_loc(name_start, name_end);

        let expression = if self.eat("=") {
            self.skip_whitespace();
            if self.eat("{") {
                let expr_start = self.index;
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    if depth > 0 {
                        self.advance();
                    }
                }
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                self.parse_js_expression(expr_content, expr_start)
            } else {
                // Shorthand: class:name means expression is Identifier("name")
                super::expression::create_identifier_with_character(
                    class_name,
                    name_start + 6, // start after "class:"
                    name_end,
                    &self.line_offsets,
                )
            }
        } else {
            // Shorthand: class:name without = means expression is Identifier("name")
            super::expression::create_identifier_with_character(
                class_name,
                name_start + 6, // start after "class:"
                name_end,
                &self.line_offsets,
            )
        };

        Ok(Some(crate::ast::Attribute::ClassDirective(
            crate::ast::template::ClassDirective {
                start: start as u32,
                end: self.index as u32,
                name: CompactString::from(class_name),
                name_loc: Some(name_loc),
                expression,
            },
        )))
    }

    /// Parse a style: directive: `style:property={expression}` or `style:property="value"`.
    fn parse_style_directive(
        &mut self,
        start: usize,
        full_name: &str,
        name_start: usize,
        name_end: usize,
    ) -> ParseResult<Option<crate::ast::Attribute>> {
        // Extract property name and modifiers from "style:color|important"
        let after_style = &full_name[6..]; // Skip "style:"
        let (prop_name, modifiers) = if let Some(pipe_pos) = after_style.find('|') {
            let name = &after_style[..pipe_pos];
            let mods: Vec<CompactString> = after_style[pipe_pos + 1..]
                .split('|')
                .map(CompactString::from)
                .collect();
            (name.to_string(), mods)
        } else {
            (after_style.to_string(), Vec::new())
        };

        let name_loc = self.create_name_loc(name_start, name_end);

        let value = if self.eat("=") {
            self.skip_whitespace();
            if self.eat("{") {
                let expr_start = self.index;
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    if depth > 0 {
                        self.advance();
                    }
                }
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                AttributeValue::Expression(ExpressionTag {
                    start: (expr_start - 1) as u32, // include the '{'
                    end: self.index as u32,
                    expression: self.parse_js_expression(expr_content, expr_start),
                })
            } else if self.eat("\"") || self.eat("'") {
                // Quoted string value
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                let string_start = self.index;
                while !self.is_eof() && self.current_char() != quote {
                    self.advance();
                }
                let string_value = &self.source[string_start..self.index];
                self.advance(); // consume closing quote
                // For quoted string, create a Sequence with Text node
                AttributeValue::Sequence(vec![AttributeValuePart::Text(
                    crate::ast::template::Text {
                        start: string_start as u32,
                        end: (self.index - 1) as u32, // before closing quote
                        raw: CompactString::from(string_value),
                        data: CompactString::from(string_value),
                    },
                )])
            } else {
                // Shorthand - use True to indicate shorthand without explicit value
                AttributeValue::True(true)
            }
        } else {
            // Shorthand: style:color without = means expression is Identifier("color")
            AttributeValue::True(true)
        };

        Ok(Some(crate::ast::Attribute::StyleDirective(
            crate::ast::template::StyleDirective {
                start: start as u32,
                end: self.index as u32,
                name: CompactString::from(prop_name),
                name_loc: Some(name_loc),
                value,
                modifiers,
            },
        )))
    }

    /// Parse a transition: / in: / out: directive.
    fn parse_transition_directive(
        &mut self,
        start: usize,
        full_name: &str,
        name_start: usize,
        name_end: usize,
    ) -> ParseResult<Option<crate::ast::Attribute>> {
        // Determine type and extract name with modifiers
        let (transition_name, intro, outro, modifiers) =
            if let Some(stripped) = full_name.strip_prefix("transition:") {
                let (name, mods) = Self::extract_name_and_modifiers(stripped);
                (name, true, true, mods)
            } else if let Some(stripped) = full_name.strip_prefix("in:") {
                let (name, mods) = Self::extract_name_and_modifiers(stripped);
                (name, true, false, mods)
            } else if let Some(stripped) = full_name.strip_prefix("out:") {
                let (name, mods) = Self::extract_name_and_modifiers(stripped);
                (name, false, true, mods)
            } else {
                return Ok(None);
            };

        let name_loc = self.create_name_loc(name_start, name_end);

        let (expression, end_pos) = if self.eat("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}"
            if self.eat("\"") || self.eat("'") {
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                if self.eat("{") {
                    let expr_start = self.index;
                    let mut depth = 1;
                    while !self.is_eof() && depth > 0 {
                        let c = self.current_char();
                        if c == '{' {
                            depth += 1;
                        } else if c == '}' {
                            depth -= 1;
                        }
                        if depth > 0 {
                            self.advance();
                        }
                    }
                    let expr_content = &self.source[expr_start..self.index];
                    self.advance(); // consume '}'
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (
                        Some(self.parse_js_expression(expr_content, expr_start)),
                        self.index,
                    )
                } else {
                    // Plain quoted - skip
                    while !self.is_eof() && self.current_char() != quote {
                        self.advance();
                    }
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (None, self.index)
                }
            } else if self.eat("{") {
                let expr_start = self.index;
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    if depth > 0 {
                        self.advance();
                    }
                }
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'
                (
                    Some(self.parse_js_expression(expr_content, expr_start)),
                    self.index,
                )
            } else {
                (None, self.index)
            }
        } else {
            (None, name_end)
        };

        Ok(Some(crate::ast::Attribute::TransitionDirective(
            crate::ast::template::TransitionDirective {
                start: start as u32,
                end: end_pos as u32,
                name: CompactString::from(transition_name),
                name_loc: Some(name_loc),
                expression,
                modifiers,
                intro,
                outro,
            },
        )))
    }

    /// Helper to extract name and modifiers from "name|mod1|mod2".
    fn extract_name_and_modifiers(s: &str) -> (String, Vec<CompactString>) {
        if let Some(pipe_pos) = s.find('|') {
            let name = &s[..pipe_pos];
            let mods: Vec<CompactString> = s[pipe_pos + 1..]
                .split('|')
                .map(CompactString::from)
                .collect();
            (name.to_string(), mods)
        } else {
            (s.to_string(), Vec::new())
        }
    }

    /// Parse an animate: directive: `animate:name` or `animate:name={expression}`.
    fn parse_animate_directive(
        &mut self,
        start: usize,
        full_name: &str,
        name_start: usize,
        name_end: usize,
    ) -> ParseResult<Option<crate::ast::Attribute>> {
        let animate_name = &full_name[8..]; // Skip "animate:"
        let name_loc = self.create_name_loc(name_start, name_end);

        let expression = if self.eat("=") {
            self.skip_whitespace();
            if self.eat("{") {
                let expr_start = self.index;
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    if depth > 0 {
                        self.advance();
                    }
                }
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                Some(self.parse_js_expression(expr_content, expr_start))
            } else {
                None
            }
        } else {
            None
        };

        Ok(Some(crate::ast::Attribute::AnimateDirective(
            crate::ast::template::AnimateDirective {
                start: start as u32,
                end: self.index as u32,
                name: CompactString::from(animate_name),
                name_loc: Some(name_loc),
                expression,
            },
        )))
    }

    /// Parse a let: directive: `let:item` or `let:item={expression}`.
    fn parse_let_directive(
        &mut self,
        start: usize,
        full_name: &str,
        name_start: usize,
        name_end: usize,
    ) -> ParseResult<Option<crate::ast::Attribute>> {
        let let_name = &full_name[4..]; // Skip "let:"
        let name_loc = self.create_name_loc(name_start, name_end);

        let expression = if self.eat("=") {
            self.skip_whitespace();
            if self.eat("{") {
                let expr_start = self.index;
                let mut depth = 1;
                while !self.is_eof() && depth > 0 {
                    let c = self.current_char();
                    if c == '{' {
                        depth += 1;
                    } else if c == '}' {
                        depth -= 1;
                    }
                    if depth > 0 {
                        self.advance();
                    }
                }
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                Some(self.parse_js_expression(expr_content, expr_start))
            } else {
                None
            }
        } else {
            None
        };

        Ok(Some(crate::ast::Attribute::LetDirective(
            crate::ast::template::LetDirective {
                start: start as u32,
                end: self.index as u32,
                name: CompactString::from(let_name),
                name_loc: Some(name_loc),
                expression,
            },
        )))
    }

    /// Parse an @attach attribute: `{@attach expression}`.
    fn parse_attach_attribute(
        &mut self,
        start: usize,
    ) -> ParseResult<Option<crate::ast::Attribute>> {
        self.skip_whitespace();

        // Parse the expression until the closing }
        let expr_start = self.index;
        let mut depth = 1;
        while !self.is_eof() && depth > 0 {
            let c = self.current_char();
            if c == '{' {
                depth += 1;
            } else if c == '}' {
                depth -= 1;
            }
            if depth > 0 {
                self.advance();
            }
        }
        let expr_end = self.index;
        let expr_content = &self.source[expr_start..expr_end];
        self.advance(); // consume closing '}'

        let expression = self.parse_js_expression(expr_content.trim(), expr_start);

        Ok(Some(crate::ast::Attribute::AttachTag(
            crate::ast::template::AttachTag {
                start: start as u32,
                end: self.index as u32,
                expression,
            },
        )))
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

        // For unquoted values starting with {, find the last } before the delimiter
        // This handles cases like foo={'hi'}.} where the whole thing is one expression
        if quote.is_none() && self.current_char() == '{' {
            let expr_start = self.index;

            // Find the end of the unquoted value
            let mut value_end = self.index;
            let mut last_brace = None;
            let mut temp_idx = self.index;
            while temp_idx < self.source.len() {
                let c = self.source[temp_idx..].chars().next().unwrap_or('\0');
                if c.is_whitespace() || c == '>' || c == '/' {
                    break;
                }
                if c == '}' {
                    last_brace = Some(temp_idx);
                }
                temp_idx += c.len_utf8();
                value_end = temp_idx;
            }

            // If the value ends with }, treat the whole thing as an expression
            if let Some(brace_pos) = last_brace {
                if brace_pos == value_end - 1 {
                    // Consume the entire value
                    while self.index < value_end {
                        self.advance();
                    }

                    // The expression content is between { and the last }
                    let expr_content = &self.source[expr_start + 1..brace_pos];

                    return Ok(AttributeValue::Expression(ExpressionTag {
                        start: expr_start as u32,
                        end: value_end as u32,
                        expression: self.parse_js_expression(expr_content, expr_start + 1),
                    }));
                }
            }
        }

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
        } else if parts.len() == 1 && quote.is_none() {
            // Single unquoted expression - return as Expression, not Sequence
            match parts.into_iter().next() {
                Some(AttributeValuePart::ExpressionTag(expr)) => {
                    Ok(AttributeValue::Expression(expr))
                }
                Some(part) => Ok(AttributeValue::Sequence(vec![part])),
                None => Ok(AttributeValue::Sequence(vec![])),
            }
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
        let alternate = self.parse_if_alternate()?;

        // Handle closing {/if} if not already consumed
        if self.match_str("{/") {
            self.advance_by(2);
            self.eat("if");
            self.skip_whitespace();
            self.eat("}");
        }

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

    /// Parse {:else} or {:else if} blocks recursively
    fn parse_if_alternate(&mut self) -> ParseResult<Option<Fragment>> {
        if !self.match_str("{:") {
            return Ok(None);
        }

        let else_block_start = self.index;
        self.advance_by(2); // consume '{:'
        self.skip_whitespace();

        if !self.eat("else") {
            // Not an else block, backtrack
            self.index = else_block_start;
            return Ok(None);
        }

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

            let alt_test = self.parse_js_expression(alt_expr_content.trim(), alt_expr_start);
            let alt_consequent = self.parse_fragment()?;

            // Recursively check for another else/else-if
            let alt_alternate = self.parse_if_alternate()?;

            // Handle closing {/if} if present
            if self.match_str("{/") {
                self.advance_by(2);
                self.eat("if");
                self.skip_whitespace();
                self.eat("}");
            }

            Ok(Some(Fragment {
                node_type: FragmentType::Fragment,
                nodes: vec![TemplateNode::IfBlock(IfBlock {
                    start: else_block_start as u32,
                    end: self.index as u32,
                    elseif: true,
                    test: alt_test,
                    consequent: alt_consequent,
                    alternate: alt_alternate,
                })],
            }))
        } else {
            // {:else}
            self.skip_whitespace(); // Handle {:else } with space before }
            self.eat("}");
            let alt_fragment = self.parse_fragment()?;

            // Handle closing {/if} if present
            if self.match_str("{/") {
                self.advance_by(2);
                self.eat("if");
                self.skip_whitespace();
                self.eat("}");
            }

            Ok(Some(alt_fragment))
        }
    }

    /// Parse {#each} block.
    /// Syntax: {#each expression as context}...{:else}...{/each}
    /// Or: {#each expression as context, index}...{/each}
    /// Or: {#each expression as context (key)}...{/each}
    fn parse_each_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.skip_whitespace();

        // Parse the iterable expression (up to " as " or closing "}")
        let expr_start = self.index;

        // Find " as " to get the expression, tracking brace depth
        let mut found_as = false;
        let mut depth = 0;
        while !self.is_eof() {
            let c = self.current_char();

            // Track brace depth
            if c == '{' || c == '(' || c == '[' {
                depth += 1;
            } else if c == ')' || c == ']' {
                depth -= 1;
            } else if c == '}' {
                if depth == 0 {
                    // This is the closing brace of {#each}, not a nested brace
                    break;
                }
                depth -= 1;
            }

            // Check for " as " at top level
            if depth == 0 && self.match_str(" as ") {
                found_as = true;
                break;
            }

            self.advance();
        }

        let expr_end = self.index;
        let expr_content = &self.source[expr_start..expr_end].trim();
        let expression = self.parse_js_expression(expr_content, expr_start);

        if !found_as {
            // No "as" found - check for ", identifier" index syntax
            // For "{#each expr, index}", expr_content contains "expr, index"
            let (final_expr, index_name) = {
                let s = expr_content.to_string();
                // Find the last top-level comma (not inside braces, brackets, or parens)
                let mut depth = 0;
                let mut last_comma = None;
                for (i, c) in s.char_indices() {
                    match c {
                        '(' | '[' | '{' => depth += 1,
                        ')' | ']' | '}' => depth -= 1,
                        ',' if depth == 0 => last_comma = Some(i),
                        _ => {}
                    }
                }

                if let Some(comma_pos) = last_comma {
                    let expr_part = s[..comma_pos].trim();
                    let idx_part = s[comma_pos + 1..].trim();
                    // Check if idx_part is a simple identifier
                    if !idx_part.is_empty()
                        && idx_part.chars().all(|c| c.is_alphanumeric() || c == '_')
                    {
                        (
                            self.parse_js_expression(expr_part, expr_start),
                            Some(CompactString::from(idx_part)),
                        )
                    } else {
                        (expression, None)
                    }
                } else {
                    (expression, None)
                }
            };

            // Consume the closing }
            if self.current_char() == '}' {
                self.advance();
            }

            // Parse body fragment
            let body = self.parse_fragment()?;

            // Handle {/each}
            if self.match_str("{/each}") {
                self.advance_by(7);
            } else if self.match_str("{/") {
                self.advance_by(2);
                self.eat("each");
                self.skip_whitespace();
                self.eat("}");
            }

            return Ok(Some(TemplateNode::EachBlock(EachBlock {
                start: start as u32,
                end: self.index as u32,
                expression: final_expr,
                context: None, // No context when no "as" clause
                index: index_name,
                key: None,
                body,
                fallback: None,
            })));
        }

        // Consume " as "
        self.advance_by(4);
        self.skip_whitespace();

        // Parse the context (binding pattern)
        let context_start = self.index;

        // The context ends at:
        // - "}" (no index, no key)
        // - "," (has index)
        // - "(" (has key)
        // We need to handle nested braces for destructuring patterns like { name, cool = true }

        let mut depth = 0;
        while !self.is_eof() {
            let c = self.current_char();

            // Skip string literals - don't count braces inside strings
            if c == '\'' || c == '"' {
                let quote = c;
                self.advance();
                while !self.is_eof() && self.current_char() != quote {
                    if self.current_char() == '\\' {
                        self.advance(); // skip escape char
                    }
                    self.advance();
                }
                if !self.is_eof() {
                    self.advance(); // consume closing quote
                }
                continue;
            }

            // Skip template literals - handle nested braces in template expressions
            if c == '`' {
                self.advance();
                while !self.is_eof() && self.current_char() != '`' {
                    if self.current_char() == '\\' {
                        self.advance(); // skip escape char
                        self.advance();
                        continue;
                    }
                    if self.current_char() == '$'
                        && self.index + 1 < self.source.len()
                        && self.source.as_bytes()[self.index + 1] == b'{'
                    {
                        // Template expression - need to handle nested content
                        self.advance(); // $
                        self.advance(); // {
                        let mut template_depth = 1;
                        while !self.is_eof() && template_depth > 0 {
                            let tc = self.current_char();
                            if tc == '\\' {
                                self.advance();
                                self.advance();
                                continue;
                            }
                            // Handle nested template literals
                            if tc == '`' {
                                self.advance();
                                while !self.is_eof() && self.current_char() != '`' {
                                    if self.current_char() == '\\' {
                                        self.advance();
                                    }
                                    self.advance();
                                }
                                if !self.is_eof() {
                                    self.advance(); // closing `
                                }
                                continue;
                            }
                            if tc == '{' {
                                template_depth += 1;
                            } else if tc == '}' {
                                template_depth -= 1;
                            }
                            if template_depth > 0 {
                                self.advance();
                            }
                        }
                        if !self.is_eof() {
                            self.advance(); // closing }
                        }
                        continue;
                    }
                    self.advance();
                }
                if !self.is_eof() {
                    self.advance(); // consume closing backtick
                }
                continue;
            }

            if c == '{' || c == '[' {
                depth += 1;
            } else if c == '}' {
                if depth == 0 {
                    break; // End of block tag
                }
                depth -= 1;
            } else if c == ']' {
                if depth > 0 {
                    depth -= 1;
                }
            } else if depth == 0 {
                // Only check for , or ( at top level
                if c == ',' || c == '(' {
                    break;
                }
            }
            self.advance();
        }

        let context_end = self.index;
        let raw_content = &self.source[context_start..context_end];
        let trimmed_content = raw_content.trim();
        // Calculate actual start position after trimming leading whitespace
        let leading_ws = raw_content.len() - raw_content.trim_start().len();
        let actual_context_start = context_start + leading_ws;
        let context = self.parse_binding_pattern(trimmed_content, actual_context_start);

        // Check for index
        let mut index = None;
        if self.eat(",") {
            self.skip_whitespace();
            let idx_start = self.index;
            while !self.is_eof() {
                let c = self.current_char();
                if c == '}' || c == '(' {
                    break;
                }
                self.advance();
            }
            let idx_name = self.source[idx_start..self.index].trim();
            if !idx_name.is_empty() {
                index = Some(CompactString::from(idx_name));
            }
        }

        // Check for key expression
        let mut key = None;
        if self.eat("(") {
            self.skip_whitespace();
            let key_start = self.index;
            let mut key_depth = 1;
            while !self.is_eof() && key_depth > 0 {
                let c = self.current_char();
                if c == '(' {
                    key_depth += 1;
                } else if c == ')' {
                    key_depth -= 1;
                }
                if key_depth > 0 {
                    self.advance();
                }
            }
            let key_content = self.source[key_start..self.index].trim();
            key = Some(self.parse_js_expression(key_content, key_start));
            self.eat(")"); // consume closing paren
        }

        self.skip_whitespace();
        self.eat("}"); // consume closing brace

        // Push block to stack
        self.stack.push(StackEntry::EachBlock {
            start: start as u32,
        });

        // Parse body
        let body = self.parse_fragment()?;

        // Check for {:else}
        let mut fallback = None;
        if self.match_str("{:") {
            self.advance_by(2);
            self.skip_whitespace();
            if self.eat("else") {
                self.skip_whitespace();
                self.eat("}");
                fallback = Some(self.parse_fragment()?);
            }
        }

        // Handle closing {/each}
        if self.match_str("{/") {
            self.advance_by(2);
            self.eat("each");
            self.skip_whitespace();
            self.eat("}");
        }

        // Pop from stack
        if !self.stack.is_empty() {
            self.stack.pop();
        }

        Ok(Some(TemplateNode::EachBlock(EachBlock {
            start: start as u32,
            end: self.index as u32,
            expression,
            context: Some(context),
            body,
            fallback,
            index,
            key,
        })))
    }

    /// Parse a binding pattern (for each block context).
    fn parse_binding_pattern(&self, content: &str, offset: usize) -> Expression {
        super::expression::parse_binding_pattern(content, offset, &self.line_offsets)
    }

    /// Parse {#await} block.
    fn parse_await_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.skip_whitespace();

        // Read the expression (until 'then', 'catch', or '}')
        let expr_start = self.index;
        let mut value: Option<Expression> = None;
        let mut error: Option<Expression> = None;
        let mut has_then = false;
        let mut has_catch = false;

        // Find the end of the expression part
        while !self.is_eof() {
            let c = self.current_char();
            if c == '}' {
                break;
            }
            // Check for 'then' or 'catch' keyword
            if self.match_str("then") {
                let after_idx = self.index + 4;
                let is_word_boundary = if after_idx >= self.source.len() {
                    true
                } else {
                    let next_char = self.source.as_bytes()[after_idx] as char;
                    next_char.is_whitespace() || next_char == '}'
                };
                if is_word_boundary {
                    has_then = true;
                    break;
                }
            }
            if self.match_str("catch") {
                let after_idx = self.index + 5;
                let is_word_boundary = if after_idx >= self.source.len() {
                    true
                } else {
                    let next_char = self.source.as_bytes()[after_idx] as char;
                    next_char.is_whitespace() || next_char == '}'
                };
                if is_word_boundary {
                    has_catch = true;
                    break;
                }
            }
            self.advance();
        }
        let expr_content = &self.source[expr_start..self.index];
        let expression = self.parse_js_expression(expr_content.trim(), expr_start);

        // Parse 'then' value if present
        if has_then {
            self.advance_by(4); // consume 'then'
            self.skip_whitespace();

            // Check if there's a value identifier
            if self.current_char() != '}' {
                let value_start = self.index;
                while !self.is_eof() && self.current_char() != '}' {
                    self.advance();
                }
                let value_content = &self.source[value_start..self.index];
                if !value_content.trim().is_empty() {
                    value = Some(super::expression::create_identifier_with_character(
                        value_content.trim(),
                        value_start,
                        self.index,
                        &self.line_offsets,
                    ));
                }
            }
        }

        // Parse 'catch' error if present
        if has_catch {
            self.advance_by(5); // consume 'catch'
            self.skip_whitespace();

            // Check if there's an error identifier
            if self.current_char() != '}' {
                let error_start = self.index;
                while !self.is_eof() && self.current_char() != '}' {
                    self.advance();
                }
                let error_content = &self.source[error_start..self.index];
                if !error_content.trim().is_empty() {
                    error = Some(super::expression::create_identifier_with_character(
                        error_content.trim(),
                        error_start,
                        self.index,
                        &self.line_offsets,
                    ));
                }
            }
        }

        self.eat("}"); // consume closing '}'

        // Push block to stack
        self.stack.push(StackEntry::AwaitBlock {
            start: start as u32,
        });

        // Parse the body
        let body = self.parse_fragment()?;

        // Handle intermediate {:then} or {:catch} clauses
        let mut then_fragment: Option<Fragment> = None;
        let mut catch_fragment: Option<Fragment> = None;
        let mut pending_fragment: Option<Fragment> = None;

        // If we had 'then' in the opening tag, the body is the 'then' fragment
        if has_then {
            then_fragment = Some(body);
        } else if has_catch {
            // If we had 'catch' in the opening tag, the body is the 'catch' fragment
            catch_fragment = Some(body);
        } else {
            // The body is the pending fragment
            pending_fragment = Some(body);
        }

        // Check for {:then} or {:catch} intermediate clauses
        while self.match_str("{:") {
            self.advance_by(2);
            self.skip_whitespace();

            if self.eat("then") {
                self.skip_whitespace();

                // Check if there's a value identifier
                if self.current_char() != '}' {
                    let value_start = self.index;
                    while !self.is_eof() && self.current_char() != '}' {
                        self.advance();
                    }
                    let value_content = &self.source[value_start..self.index];
                    if !value_content.trim().is_empty() {
                        value = Some(super::expression::create_identifier_with_character(
                            value_content.trim(),
                            value_start,
                            self.index,
                            &self.line_offsets,
                        ));
                    }
                }
                self.eat("}");

                then_fragment = Some(self.parse_fragment()?);
            } else if self.eat("catch") {
                self.skip_whitespace();

                // Check if there's an error identifier
                if self.current_char() != '}' {
                    let error_start = self.index;
                    while !self.is_eof() && self.current_char() != '}' {
                        self.advance();
                    }
                    let error_content = &self.source[error_start..self.index];
                    if !error_content.trim().is_empty() {
                        error = Some(super::expression::create_identifier_with_character(
                            error_content.trim(),
                            error_start,
                            self.index,
                            &self.line_offsets,
                        ));
                    }
                }
                self.eat("}");

                catch_fragment = Some(self.parse_fragment()?);
            } else {
                break;
            }
        }

        // Handle closing {/await}
        if self.match_str("{/await}") {
            self.advance_by(8);
        }

        // Pop the stack
        self.stack.pop();

        Ok(Some(TemplateNode::AwaitBlock(AwaitBlock {
            start: start as u32,
            end: self.index as u32,
            expression,
            value,
            error,
            pending: pending_fragment,
            then: then_fragment,
            catch: catch_fragment,
        })))
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

    /// Parse {#snippet name(params)} block.
    fn parse_snippet_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.skip_whitespace();

        // Parse the snippet name (identifier)
        let name_start = self.index;
        let name = self.read_identifier();
        let name_end = self.index;

        // Create expression for the snippet name (with character field in loc)
        let expression = super::expression::create_identifier_with_character(
            &name,
            name_start,
            name_end,
            &self.line_offsets,
        );

        // Parse optional type parameters (between < and >)
        let mut type_params = None;
        if self.eat("<") {
            let type_params_start = self.index;
            let mut depth = 1;
            while !self.is_eof() && depth > 0 {
                let c = self.current_char();
                // Skip string literals
                if c == '\'' || c == '"' {
                    let quote = c;
                    self.advance();
                    while !self.is_eof() && self.current_char() != quote {
                        if self.current_char() == '\\' {
                            self.advance();
                        }
                        self.advance();
                    }
                    if !self.is_eof() {
                        self.advance(); // consume closing quote
                    }
                    continue;
                }
                if c == '<' {
                    depth += 1;
                } else if c == '>' {
                    depth -= 1;
                }
                if depth > 0 {
                    self.advance();
                }
            }
            let type_params_content = &self.source[type_params_start..self.index];
            if !type_params_content.trim().is_empty() {
                type_params = Some(CompactString::from(type_params_content.trim()));
            }
            self.eat(">"); // consume closing >
        }

        // Parse parameters (inside parentheses)
        self.skip_whitespace();
        let mut parameters = Vec::new();

        if self.eat("(") {
            let params_start = self.index;

            // Find matching closing paren, accounting for nested parens and strings
            let mut depth = 1;
            while !self.is_eof() && depth > 0 {
                let c = self.current_char();
                // Skip string literals
                if c == '\'' || c == '"' {
                    let quote = c;
                    self.advance();
                    while !self.is_eof() && self.current_char() != quote {
                        if self.current_char() == '\\' {
                            self.advance();
                        }
                        self.advance();
                    }
                    if !self.is_eof() {
                        self.advance(); // consume closing quote
                    }
                    continue;
                }
                if c == '(' {
                    depth += 1;
                } else if c == ')' {
                    depth -= 1;
                }
                if depth > 0 {
                    self.advance();
                }
            }

            let params_end = self.index;
            let params_content = &self.source[params_start..params_end];

            // Parse parameters with TypeScript type annotations
            if !params_content.trim().is_empty() {
                parameters = super::expression::parse_typescript_params(
                    params_content,
                    params_start,
                    &self.line_offsets,
                );
            }

            self.eat(")"); // consume closing paren
        }

        self.skip_whitespace();
        self.eat("}"); // consume closing brace

        // Push to stack
        self.stack.push(StackEntry::SnippetBlock {
            start: start as u32,
        });

        // Parse body
        let body = self.parse_fragment()?;

        // Handle closing {/snippet}
        if self.match_str("{/") {
            self.advance_by(2);
            self.eat("snippet");
            self.skip_whitespace();
            self.eat("}");
        }

        // Pop from stack
        if !self.stack.is_empty() {
            self.stack.pop();
        }

        Ok(Some(TemplateNode::SnippetBlock(SnippetBlock {
            start: start as u32,
            end: self.index as u32,
            expression,
            type_params,
            parameters,
            body,
        })))
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
            "render" => {
                // {@render snippet(...)}
                let expr_start = self.index;
                while !self.is_eof() && self.current_char() != '}' {
                    self.advance();
                }
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'

                let expression = self.parse_js_expression(expr_content.trim(), expr_start);

                Ok(Some(TemplateNode::RenderTag(RenderTag {
                    start: start as u32,
                    end: self.index as u32,
                    expression,
                })))
            }
            "debug" | "const" | "attach" => {
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
        // Adjust offset for leading whitespace that gets trimmed
        let leading_ws = content.len() - content.trim_start().len();
        let trimmed = content.trim();
        super::expression::parse_expression(trimmed, offset + leading_ws, &self.line_offsets)
    }

    /// Merge attribute value parts into a single Text for script/style tags.
    /// This is needed because {curly braces} in quoted attribute values are NOT expressions.
    fn merge_attribute_parts_to_text(
        &self,
        parts: &[AttributeValuePart],
    ) -> Vec<AttributeValuePart> {
        if parts.len() <= 1 {
            // No merging needed
            return parts.to_vec();
        }

        // Find the overall range and merge the content
        let first_start = match parts.first() {
            Some(AttributeValuePart::Text(t)) => t.start,
            Some(AttributeValuePart::ExpressionTag(e)) => e.start,
            None => return vec![],
        };
        let last_end = match parts.last() {
            Some(AttributeValuePart::Text(t)) => t.end,
            Some(AttributeValuePart::ExpressionTag(e)) => e.end,
            None => return vec![],
        };

        // Get the raw content from the original source
        let raw = &self.source[first_start as usize..last_end as usize];

        vec![AttributeValuePart::Text(Text {
            start: first_start,
            end: last_end,
            raw: CompactString::from(raw),
            data: CompactString::from(raw),
        })]
    }

    /// Parse a <script> tag and store it in instance_script or module_script.
    fn parse_script_tag(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
    ) -> ParseResult<Option<TemplateNode>> {
        let content_start = self.index;

        // Find the closing </script> tag
        while !self.is_eof() && !self.match_str("</script>") {
            self.advance();
        }

        let content_end = self.index;
        let script_content = &self.source[content_start..content_end];

        // Consume </script>
        if self.match_str("</script>") {
            self.advance_by(9);
        }

        let end = self.index;

        // Determine context and language from attributes
        let mut context = ScriptContext::Default;
        let mut is_typescript = false;
        let mut script_attributes = Vec::new();

        for attr in attributes {
            if let crate::ast::Attribute::Attribute(mut attr_node) = attr {
                // For script tags, merge expression parts back into text
                // because {curly braces} in quoted attribute values are NOT expressions
                if let AttributeValue::Sequence(ref parts) = attr_node.value {
                    let merged = self.merge_attribute_parts_to_text(parts);
                    attr_node.value = AttributeValue::Sequence(merged);
                }

                if attr_node.name.as_str() == "context" {
                    if let AttributeValue::Sequence(parts) = &attr_node.value {
                        if let Some(AttributeValuePart::Text(t)) = parts.first() {
                            if t.data.as_str() == "module" {
                                context = ScriptContext::Module;
                            }
                        }
                    }
                } else if attr_node.name.as_str() == "module" {
                    // `module` attribute (boolean or with value) indicates module context
                    context = ScriptContext::Module;
                    script_attributes.push(attr_node);
                    continue;
                } else if attr_node.name.as_str() == "lang" {
                    if let AttributeValue::Sequence(parts) = &attr_node.value {
                        if let Some(AttributeValuePart::Text(t)) = parts.first() {
                            let lang = t.data.as_str();
                            if lang == "ts" || lang == "typescript" {
                                is_typescript = true;
                            }
                        }
                    }
                    script_attributes.push(attr_node);
                } else {
                    script_attributes.push(attr_node);
                }
            }
        }

        // Parse the script content as a JavaScript/TypeScript Program
        // Pass any pending leading comments (HTML comments before the script tag)
        let leading_comments = std::mem::take(&mut self.pending_leading_comments);
        let program = super::expression::parse_program(
            script_content,
            content_start,
            &self.line_offsets,
            is_typescript,
            &leading_comments,
        );

        let script = Script {
            node_type: ScriptType::Script,
            start: start as u32,
            end: end as u32,
            context,
            content: program,
            attributes: script_attributes,
        };

        match context {
            ScriptContext::Default => self.instance_script = Some(script),
            ScriptContext::Module => self.module_script = Some(script),
        }

        // Return None - script tags don't appear in the fragment
        Ok(None)
    }

    /// Parse a <style> tag and store it in stylesheet.
    fn parse_style_tag(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
    ) -> ParseResult<Option<TemplateNode>> {
        let content_start = self.index;

        // Find the closing </style> tag
        while !self.is_eof() && !self.match_str("</style>") {
            self.advance();
        }

        let content_end = self.index;
        let style_content = &self.source[content_start..content_end];

        // Consume </style>
        if self.match_str("</style>") {
            self.advance_by(8);
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
        let css_children = super::css::parse_css(style_content, content_start);

        let stylesheet = StyleSheet {
            node_type: crate::ast::css::StyleSheetType::StyleSheet,
            start: start as u32,
            end: end as u32,
            attributes: style_attributes,
            children: css_children,
            content: crate::ast::css::StyleSheetContent {
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

    /// Parse svelte:options element and extract options.
    fn parse_svelte_options(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
    ) -> ParseResult<Option<TemplateNode>> {
        let end = self.index as u32;

        // Extract option values from attributes
        let mut runes = None;
        let mut custom_element = None;

        // Convert Vec<Attribute> to Vec<AttributeNode> for storage
        let mut attr_nodes = Vec::new();

        for attr in &attributes {
            if let crate::ast::Attribute::Attribute(attr_node) = attr {
                attr_nodes.push(attr_node.clone());

                match attr_node.name.as_str() {
                    "runes" => {
                        // runes={true} or runes={false}
                        if let AttributeValue::Expression(expr_tag) = &attr_node.value {
                            if let Some(val) = expr_tag.expression.as_json().get("value") {
                                if let Some(b) = val.as_bool() {
                                    runes = Some(b);
                                }
                            }
                        }
                    }
                    "customElement" => {
                        // customElement="tag-name"
                        if let AttributeValue::Sequence(parts) = &attr_node.value {
                            if let Some(AttributeValuePart::Text(text)) = parts.first() {
                                custom_element = Some(CustomElementOptions {
                                    tag: Some(text.data.clone()),
                                    shadow: None,
                                    props: None,
                                    extend: None,
                                });
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

        // Store the options
        self.svelte_options = Some(SvelteOptions {
            start: start as u32,
            end,
            runes,
            immutable: None,
            accessors: None,
            preserve_whitespace: None,
            namespace: None,
            css: None,
            custom_element,
            attributes: attr_nodes,
        });

        // svelte:options doesn't produce a node in the fragment
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
