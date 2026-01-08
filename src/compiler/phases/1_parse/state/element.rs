//! Element and attribute parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/state/element.js`
//!
//! It handles parsing of HTML elements, Svelte special elements (`svelte:*`),
//! components, attributes, and all directive types (`on:`, `bind:`, `use:`,
//! `class:`, `style:`, `transition:`, `animate:`, `let:`).

use compact_str::CompactString;

use crate::ast::js::Expression;
use crate::ast::template::{
    AttributeNode, AttributeValue, AttributeValuePart, Comment, Component, ExpressionTag, Fragment,
    FragmentType, RegularElement, SlotElement, SvelteComponentElement, SvelteDynamicElement,
    SvelteElement, TemplateNode, Text, TitleElement,
};
use crate::error::ParseResult;

use super::super::parser::{ElementType, Parser, StackEntry};
use super::super::utils::decode_html_entities;
use super::super::utils::is_void_element;

impl Parser<'_> {
    /// Parse an element or comment.
    pub fn parse_element_or_comment(&mut self) -> ParseResult<Option<TemplateNode>> {
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

        // Only extract style to root if not inside svelte:head
        // When inside svelte:head, style should remain as a child element
        if name == "style" && !self.is_inside_svelte_head() {
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

        // Check if this is a raw text element (textarea, or style inside svelte:head)
        // These elements parse their content as raw text, not HTML
        let is_raw_text_element =
            name == "textarea" || (name == "style" && self.is_inside_svelte_head());

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

            // For raw text elements, parse content as raw text instead of HTML
            if is_raw_text_element {
                fragment = self.parse_raw_text_content(&name)?;
            } else {
                fragment = self.parse_fragment()?;
            }

            // Handle closing tag or block close
            if self.match_str("</") {
                let close_start = self.index;
                self.advance_by(2); // consume '</'
                let closing_name = self.read_tag_name();
                self.skip_whitespace();

                // Verify matching tag
                if closing_name == name {
                    // For raw text elements, the closing tag might have garbage before >
                    // (e.g., </textarea\n\n\n</textarea\n\n>)
                    // Scan forward to find the actual >
                    if is_raw_text_element {
                        while !self.is_eof() && self.current_char() != '>' {
                            self.advance();
                        }
                    }
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
            ElementType::SvelteHead => TemplateNode::SvelteHead(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::SvelteBody => TemplateNode::SvelteBody(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::SvelteWindow => TemplateNode::SvelteWindow(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::SvelteDocument => TemplateNode::SvelteDocument(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::SvelteFragment => TemplateNode::SvelteFragment(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::SvelteBoundary => TemplateNode::SvelteBoundary(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::SvelteSelf => TemplateNode::SvelteSelf(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::SvelteOptions => TemplateNode::SvelteOptions(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: Some(name_loc_with_char),
                attributes,
                fragment,
            }),
            ElementType::SvelteComponent => {
                // Extract the "this" attribute to get the expression
                let expression = self.extract_this_attribute(&attributes);

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

                TemplateNode::SvelteComponent(SvelteComponentElement {
                    start: start as u32,
                    end,
                    name: name.clone(),
                    name_loc: Some(name_loc_with_char),
                    attributes: filtered_attrs,
                    fragment,
                    expression,
                })
            }
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
    pub fn extract_this_attribute(&self, attributes: &[crate::ast::Attribute]) -> Expression {
        for attr in attributes {
            if let crate::ast::Attribute::Attribute(node) = attr {
                if node.name.as_str() == "this" {
                    match &node.value {
                        AttributeValue::Expression(expr_tag) => {
                            return expr_tag.expression.clone();
                        }
                        AttributeValue::Sequence(parts) => {
                            // Handle single-item sequences
                            if parts.len() == 1 {
                                match &parts[0] {
                                    AttributeValuePart::Text(text) => {
                                        // For quoted string values like this="div"
                                        return Expression::from_json(serde_json::json!(
                                            text.data.as_str()
                                        ));
                                    }
                                    AttributeValuePart::ExpressionTag(expr_tag) => {
                                        // For quoted expression like this="{expr}"
                                        return expr_tag.expression.clone();
                                    }
                                }
                            }
                        }
                        _ => {}
                    }
                }
            }
        }

        // Default to null expression if no "this" attribute found
        Expression::from_json(serde_json::json!(null))
    }

    /// Get element type from tag name and attributes.
    pub fn get_element_type(
        &self,
        name: &str,
        attributes: &[crate::ast::Attribute],
    ) -> ElementType {
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
    pub fn is_inside_svelte_head(&self) -> bool {
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

    /// Check if current position starts a valid closing tag (e.g., `</textarea>` or `</textarea  >`).
    /// For RCDATA elements like textarea, a valid closing tag is `</tagname` followed by
    /// either immediately by `>` or whitespace, then anything until `>`.
    pub fn is_valid_closing_tag(&self, closing_tag_start: &str) -> bool {
        if !self.match_str(closing_tag_start) {
            return false;
        }

        // Look ahead past the closing tag start
        let after_tag = self.index + closing_tag_start.len();
        if after_tag >= self.source.len() {
            return false;
        }

        let next_char = self.source[after_tag..].chars().next();
        match next_char {
            Some('>') => true,                    // </textarea>
            Some(c) if c.is_whitespace() => true, // </textarea ...> (valid, will find > eventually)
            _ => false,                           // </textaread (not a valid closing tag)
        }
    }

    /// Check if the next opening tag should implicitly close the current element.
    /// This handles HTML5 optional end tags (e.g., <li> closes a previous <li>).
    pub fn should_implicitly_close(&self) -> bool {
        // Get the IMMEDIATE parent element from the stack (not separated by blocks)
        // We only implicitly close if the direct parent is an element that can be implicitly closed
        let current_element = match self.stack.last() {
            Some(StackEntry::Element { name, .. }) => name.as_str(),
            _ => return false, // If parent is a block ({#if}, {#each}, etc.), don't implicitly close
        };

        // Check if the next tag would implicitly close the current element
        if !self.match_str("<") || self.match_str("</") || self.match_str("<!") {
            return false;
        }

        // Look ahead to get the next tag name
        let remaining = &self.source[self.index + 1..]; // skip '<'
        let next_tag: String = remaining
            .chars()
            .take_while(|c| c.is_alphanumeric() || *c == '-' || *c == ':')
            .collect();

        if next_tag.is_empty() {
            return false;
        }

        let next_tag = next_tag.to_lowercase();

        // Check implicit closing rules
        match current_element {
            // <li> is implicitly closed by another <li>
            "li" => next_tag == "li",
            // <p> is implicitly closed by many block-level elements
            "p" => matches!(
                next_tag.as_str(),
                "address"
                    | "article"
                    | "aside"
                    | "blockquote"
                    | "details"
                    | "div"
                    | "dl"
                    | "fieldset"
                    | "figcaption"
                    | "figure"
                    | "footer"
                    | "form"
                    | "h1"
                    | "h2"
                    | "h3"
                    | "h4"
                    | "h5"
                    | "h6"
                    | "header"
                    | "hgroup"
                    | "hr"
                    | "main"
                    | "menu"
                    | "nav"
                    | "ol"
                    | "p"
                    | "pre"
                    | "section"
                    | "table"
                    | "ul"
            ),
            // <dt> is implicitly closed by <dt> or <dd>
            "dt" => matches!(next_tag.as_str(), "dt" | "dd"),
            // <dd> is implicitly closed by <dt> or <dd>
            "dd" => matches!(next_tag.as_str(), "dt" | "dd"),
            // <td> is implicitly closed by <td> or <th>
            "td" => matches!(next_tag.as_str(), "td" | "th"),
            // <th> is implicitly closed by <td> or <th>
            "th" => matches!(next_tag.as_str(), "td" | "th"),
            // <tr> is implicitly closed by <tr>
            "tr" => next_tag == "tr",
            // <option> is implicitly closed by <option> or <optgroup>
            "option" => matches!(next_tag.as_str(), "option" | "optgroup"),
            // <optgroup> is implicitly closed by <optgroup>
            "optgroup" => next_tag == "optgroup",
            _ => false,
        }
    }

    /// Check if inside shadowroot template.
    pub fn is_inside_shadowroot_template(&self) -> bool {
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
    pub fn has_shadowrootmode_attr(&self, attributes: &[crate::ast::Attribute]) -> bool {
        attributes.iter().any(|attr| {
            if let crate::ast::Attribute::Attribute(attr_node) = attr {
                attr_node.name.as_str() == "shadowrootmode"
            } else {
                false
            }
        })
    }

    /// Parse attributes.
    pub fn parse_attributes(&mut self) -> ParseResult<Vec<crate::ast::Attribute>> {
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
    pub fn parse_attribute(&mut self) -> ParseResult<Option<crate::ast::Attribute>> {
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
                super::super::expression::create_identifier_with_character(
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
    pub fn parse_on_directive(
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
    pub fn parse_bind_directive(
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
                        super::super::expression::create_identifier_with_character(
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
                    super::super::expression::create_identifier_with_character(
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
                super::super::expression::create_identifier_with_character(
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
    pub fn parse_use_directive(
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
    pub fn parse_class_directive(
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
                super::super::expression::create_identifier_with_character(
                    class_name,
                    name_start + 6, // start after "class:"
                    name_end,
                    &self.line_offsets,
                )
            }
        } else {
            // Shorthand: class:name without = means expression is Identifier("name")
            super::super::expression::create_identifier_with_character(
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
    pub fn parse_style_directive(
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
                // Quoted string value with potential expressions: "red{variable}"
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                let mut parts: Vec<AttributeValuePart> = Vec::new();
                let mut text_start = self.index;

                while !self.is_eof() && self.current_char() != quote {
                    if self.current_char() == '{' {
                        // Save text before expression
                        if self.index > text_start {
                            parts.push(AttributeValuePart::Text(crate::ast::template::Text {
                                start: text_start as u32,
                                end: self.index as u32,
                                raw: CompactString::from(&self.source[text_start..self.index]),
                                data: CompactString::from(&self.source[text_start..self.index]),
                            }));
                        }
                        let expr_start = self.index;
                        self.advance(); // consume '{'
                        let inner_start = self.index;
                        let mut depth = 1;
                        while !self.is_eof() && depth > 0 {
                            let ch = self.current_char();
                            if ch == '{' {
                                depth += 1;
                            } else if ch == '}' {
                                depth -= 1;
                            }
                            if depth > 0 {
                                self.advance();
                            }
                        }
                        let inner_end = self.index;
                        self.advance(); // consume '}'
                        parts.push(AttributeValuePart::ExpressionTag(ExpressionTag {
                            start: expr_start as u32,
                            end: self.index as u32,
                            expression: self.parse_js_expression(
                                &self.source[inner_start..inner_end],
                                inner_start,
                            ),
                        }));
                        text_start = self.index;
                    } else {
                        self.advance();
                    }
                }

                // Save remaining text
                if self.index > text_start {
                    parts.push(AttributeValuePart::Text(crate::ast::template::Text {
                        start: text_start as u32,
                        end: self.index as u32,
                        raw: CompactString::from(&self.source[text_start..self.index]),
                        data: CompactString::from(&self.source[text_start..self.index]),
                    }));
                }

                self.advance(); // consume closing quote
                AttributeValue::Sequence(parts)
            } else {
                // Unquoted value: style:color=red or style:color=red{expr}
                let mut parts: Vec<AttributeValuePart> = Vec::new();
                let mut text_start = self.index;

                while !self.is_eof() {
                    let c = self.current_char();
                    // End of unquoted value (but NOT / alone)
                    if c.is_whitespace() || c == '>' {
                        break;
                    }
                    // Expression start
                    if c == '{' {
                        // Save text before expression
                        if self.index > text_start {
                            parts.push(AttributeValuePart::Text(crate::ast::template::Text {
                                start: text_start as u32,
                                end: self.index as u32,
                                raw: CompactString::from(&self.source[text_start..self.index]),
                                data: CompactString::from(&self.source[text_start..self.index]),
                            }));
                        }
                        let expr_start = self.index;
                        self.advance(); // consume '{'
                        let inner_start = self.index;
                        let mut depth = 1;
                        while !self.is_eof() && depth > 0 {
                            let ch = self.current_char();
                            if ch == '{' {
                                depth += 1;
                            } else if ch == '}' {
                                depth -= 1;
                            }
                            if depth > 0 {
                                self.advance();
                            }
                        }
                        let inner_end = self.index;
                        self.advance(); // consume '}'
                        parts.push(AttributeValuePart::ExpressionTag(ExpressionTag {
                            start: expr_start as u32,
                            end: self.index as u32,
                            expression: self.parse_js_expression(
                                &self.source[inner_start..inner_end],
                                inner_start,
                            ),
                        }));
                        text_start = self.index;
                    } else {
                        self.advance();
                    }
                }

                // Save remaining text
                if self.index > text_start {
                    parts.push(AttributeValuePart::Text(crate::ast::template::Text {
                        start: text_start as u32,
                        end: self.index as u32,
                        raw: CompactString::from(&self.source[text_start..self.index]),
                        data: CompactString::from(&self.source[text_start..self.index]),
                    }));
                }

                if parts.is_empty() {
                    // No value found
                    AttributeValue::True(true)
                } else {
                    AttributeValue::Sequence(parts)
                }
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
    pub fn parse_transition_directive(
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
    pub fn extract_name_and_modifiers(s: &str) -> (String, Vec<CompactString>) {
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
    pub fn parse_animate_directive(
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
    pub fn parse_let_directive(
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
    pub fn parse_attach_attribute(
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
    pub fn parse_attribute_value(&mut self) -> ParseResult<AttributeValue> {
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
                // Unquoted values end at whitespace or > (but NOT / alone)
                if c.is_whitespace() || c == '>' {
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
                // Unquoted value ends at whitespace or > (but NOT / alone)
                let c = self.current_char();
                if c.is_whitespace() || c == '>' {
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
                    } else if c.is_whitespace() || c == '>' {
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

    /// Parse raw text content for elements like textarea, style (inside svelte:head).
    /// - For style: completely raw text, no expression parsing
    /// - For textarea: parses {expressions} but treats HTML as text
    pub fn parse_raw_text_content(&mut self, tag_name: &str) -> ParseResult<Fragment> {
        let closing_tag = format!("</{}", tag_name);
        let is_style = tag_name == "style";

        // For style elements (inside svelte:head), just get raw content
        if is_style {
            let content_start = self.index;
            while !self.is_eof() && !self.match_str(&closing_tag) {
                self.advance();
            }
            let content_end = self.index;
            let raw_content = &self.source[content_start..content_end];

            // Always add a Text node for style, even if empty
            let nodes = vec![TemplateNode::Text(Text {
                start: content_start as u32,
                end: content_end as u32,
                raw: raw_content.to_string().into(),
                data: raw_content.to_string().into(),
            })];

            return Ok(Fragment {
                node_type: FragmentType::Fragment,
                nodes,
            });
        }

        // For textarea: parse expressions but treat HTML as text
        let mut nodes = Vec::new();
        let mut text_start = self.index;

        // For textarea, we need to find a valid closing tag: </tagname followed by optional whitespace and >
        // This avoids false positives like </textaread matching </textarea
        while !self.is_eof() && !self.is_valid_closing_tag(&closing_tag) {
            // Check for expression tag
            if self.match_str("{") && !self.match_str("{{") {
                // Flush accumulated text
                if self.index > text_start {
                    let text_content = &self.source[text_start..self.index];
                    nodes.push(TemplateNode::Text(Text {
                        start: text_start as u32,
                        end: self.index as u32,
                        raw: text_content.to_string().into(),
                        data: text_content.to_string().into(),
                    }));
                }

                // Parse expression tag
                if let Some(expr_node) = self.parse_mustache()? {
                    nodes.push(expr_node);
                }
                text_start = self.index;
            } else {
                self.advance();
            }
        }

        // Flush remaining text
        if self.index > text_start {
            let text_content = &self.source[text_start..self.index];
            nodes.push(TemplateNode::Text(Text {
                start: text_start as u32,
                end: self.index as u32,
                raw: text_content.to_string().into(),
                data: text_content.to_string().into(),
            }));
        }

        Ok(Fragment {
            node_type: FragmentType::Fragment,
            nodes,
        })
    }
}
