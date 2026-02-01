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
use memchr::memchr;

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

            // Check if comment was closed
            if self.match_str("-->") {
                self.advance_by(3); // consume '-->'
            } else if self.is_eof() {
                // Comment was not closed
                return Err(crate::error::ParseError::svelte(
                    "expected_token",
                    "Expected token -->",
                    (self.index, self.index),
                ));
            }

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
            let close_start = self.index - 1; // start includes '<'
            self.advance(); // consume '/'
            let name = self.read_tag_name();
            self.skip_whitespace();

            // Check if closing a void element (which is invalid)
            if is_void_element(&name) {
                return Err(crate::error::ParseError::svelte(
                    "void_element_invalid_content",
                    "Void elements cannot have children or closing tags",
                    (close_start, self.index),
                ));
            }

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

        // Validate svelte: tag names
        if name.starts_with("svelte:") {
            let valid_svelte_tags = [
                "svelte:head",
                "svelte:options",
                "svelte:window",
                "svelte:document",
                "svelte:body",
                "svelte:element",
                "svelte:component",
                "svelte:self",
                "svelte:fragment",
                "svelte:boundary",
            ];
            if !valid_svelte_tags.contains(&name.as_str()) {
                return Err(crate::error::ParseError::svelte(
                    "svelte_meta_invalid_tag",
                    "Valid `<svelte:...>` tag names are svelte:head, svelte:options, svelte:window, svelte:document, svelte:body, svelte:element, svelte:component, svelte:self, svelte:fragment or svelte:boundary\nhttps://svelte.dev/e/svelte_meta_invalid_tag",
                    (name_start, name_end),
                ));
            }
        }

        if name.is_empty() {
            // If we're at EOF with just '<', report unexpected_eof (unless in loose mode)
            if self.is_eof() {
                if self.options.loose {
                    // In loose mode, allow EOF after '<'
                    return Ok(None);
                }
                return Err(crate::error::ParseError::svelte(
                    "unexpected_eof",
                    "Unexpected end of input",
                    (self.index, self.index),
                ));
            }
            // Invalid tag, skip
            return Ok(None);
        }

        // Track position after tag name for unclosed elements at EOF
        let pos_after_name = self.index;
        self.skip_whitespace();

        // Parse attributes
        let attributes = self.parse_attributes()?;

        // Track position after attributes for unclosed elements at EOF
        let pos_after_attrs = self.index;
        self.skip_whitespace();

        // Check for self-closing or void element
        let self_closing = self.eat_optional("/");
        let has_closing_bracket = self.eat_optional(">"); // consume '>'

        // For unclosed elements at EOF, report unexpected_eof error (unless in loose mode)
        if !has_closing_bracket && self.is_eof() && !self.options.loose {
            return Err(crate::error::ParseError::svelte(
                "unexpected_eof",
                "Unexpected end of input",
                (self.index, self.index),
            ));
        }
        // In loose mode, treat as an unclosed element and continue

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
            return self.parse_svelte_options(start, attributes, self_closing);
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
            ..Default::default()
        };

        // Track whether we found a closing tag
        let mut found_closing_tag = false;

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
                    found_closing_tag = true;
                    // For raw text elements, the closing tag might have garbage before >
                    // (e.g., </textarea\n\n\n</textarea\n\n>)
                    // Scan forward to find the actual >
                    if is_raw_text_element {
                        while !self.is_eof() && self.current_char() != '>' {
                            self.advance();
                        }
                    }
                    self.eat_optional(">"); // consume '>'
                } else {
                    // Mismatched close tag - in loose mode, auto-close current element
                    // and don't consume the close tag (let parent handle it)
                    self.index = close_start; // Reset to before '</...'
                    // Still mark as found for backwards compatibility (auto-close behavior)
                    found_closing_tag = true;
                }
            } else if self.match_str("{/") || self.match_str("{:") {
                // If we encounter a block closing tag {/ or continuation {:
                // while inside an element, auto-close the element
                found_closing_tag = true;
            } else if self.should_implicitly_close() {
                // Element was implicitly closed by the next element
                // Don't consume anything, let the next element be parsed
                found_closing_tag = true;
            }

            // Pop from stack only if we found a closing mechanism (tag or block)
            // If we reached EOF without a closing tag, leave on stack for error reporting
            if found_closing_tag && !self.stack.is_empty() {
                self.stack.pop();
            }
        }

        // Calculate end position
        let end = if !has_closing_bracket {
            // Unclosed opening tag: use position after tag name and whitespace
            let base_pos = if attributes.is_empty() {
                pos_after_name
            } else {
                pos_after_attrs
            };

            // Check if there's a newline after the tag name/attributes,
            // but only if it's not at EOF (if there's more content after the newline)
            let mut end_pos = base_pos;
            if end_pos < self.source.len() && self.source.as_bytes()[end_pos] == b'\n' {
                // Check if there's content after the newline (not just EOF)
                if end_pos + 1 < self.source.len() {
                    // There's content after the newline, so include it
                    end_pos += 1;
                }
                // If it's EOF after the newline, don't include the newline
            }
            end_pos as u32
        } else if !self_closing && !is_void && has_closing_bracket && !found_closing_tag {
            // Element has opening tag but no closing tag (auto-closed at EOF)
            // Use the end of the last child node in the fragment
            fragment
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
                .unwrap_or(self.index as u32)
        } else {
            self.index as u32
        };

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
                metadata: Default::default(),
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
                metadata: Default::default(),
            }),
        };

        Ok(Some(node))
    }

    /// Extract the "this" attribute from a svelte:element to get the tag expression.
    pub fn extract_this_attribute(&self, attributes: &[crate::ast::Attribute]) -> Expression {
        for attr in attributes {
            if let crate::ast::Attribute::Attribute(node) = attr
                && node.name.as_str() == "this"
            {
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
        // Track unique attribute names for duplicate detection
        // Format: "type:name" where type is Attribute, BindDirective, ClassDirective, or StyleDirective
        let mut unique_names: Vec<String> = Vec::new();

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
                // Check for duplicate attributes
                // animate and transition can only be specified once per element so no need
                // to check here, use can be used multiple times, same for the on directive
                // finally let already has error handling in case of duplicate variable names
                let (attr_type, attr_name, attr_start) = match &attr {
                    crate::ast::Attribute::Attribute(a) => {
                        ("Attribute".to_string(), a.name.to_string(), a.start)
                    }
                    crate::ast::Attribute::BindDirective(b) => {
                        // bind:attribute and attribute are the same, normalize to Attribute
                        ("Attribute".to_string(), b.name.to_string(), b.start)
                    }
                    crate::ast::Attribute::ClassDirective(c) => {
                        ("ClassDirective".to_string(), c.name.to_string(), c.start)
                    }
                    crate::ast::Attribute::StyleDirective(s) => {
                        ("StyleDirective".to_string(), s.name.to_string(), s.start)
                    }
                    _ => {
                        // Other attribute types are not checked for duplicates
                        attributes.push(attr);
                        continue;
                    }
                };

                let key = format!("{}:{}", attr_type, attr_name);

                // Skip duplicate check for "this" attribute (used on svelte:element and svelte:component)
                if attr_name != "this" {
                    if unique_names.contains(&key) {
                        return Err(crate::error::ParseError::svelte(
                            "attribute_duplicate",
                            "Attributes need to be unique",
                            (attr_start as usize, attr_start as usize + attr_name.len()),
                        ));
                    }
                    unique_names.push(key);
                }

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
            if self.eat_optional("@attach") {
                return self.parse_attach_attribute(start);
            }

            // Check for spread attribute {...expr}
            if self.eat_optional("...") {
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

            // Check for empty attribute shorthand {}
            // In loose mode, allow empty shorthand (e.g., when typing)
            if expr_content.trim().is_empty() {
                if !self.options.loose {
                    return Err(crate::error::ParseError::svelte(
                        "attribute_empty_shorthand",
                        "Attribute shorthand cannot be empty",
                        (expr_start, expr_start),
                    ));
                }

                // In loose mode, create an empty attribute with empty expression
                let name_loc = self.create_name_loc(expr_start, expr_start);
                let loc = self.get_location(expr_start);

                // Create an empty ExpressionTag value
                let expression = Expression::Value(serde_json::json!({
                    "type": "Identifier",
                    "name": "",
                    "start": expr_start,
                    "end": expr_start,
                    "loc": {
                        "start": {
                            "line": loc.start.line,
                            "column": loc.start.column,
                            "character": expr_start
                        },
                        "end": {
                            "line": loc.end.line,
                            "column": loc.end.column,
                            "character": expr_start
                        }
                    }
                }));

                let value = AttributeValue::Expression(ExpressionTag {
                    start: expr_start as u32,
                    end: expr_start as u32,
                    expression: expression.clone(),
                });

                return Ok(Some(crate::ast::Attribute::Attribute(AttributeNode {
                    start: start as u32,
                    end: self.index as u32,
                    name: CompactString::from(""),
                    name_loc: Some(name_loc),
                    value,
                })));
            }

            // Create the expression
            let expression = self.parse_js_expression(expr_content.trim(), expr_start);

            // Create the attribute name from the expression (shorthand)
            let name = expr_content.trim().to_string();

            // Calculate name_loc
            let name_loc = self.create_name_loc(expr_start, expr_end);

            // Create the ExpressionTag value
            let value = AttributeValue::Expression(ExpressionTag {
                start: (start + 1) as u32, // start after {
                end: expr_end as u32,
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
        let (value, attr_end) = if self.eat_optional("=") {
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
        let (event_name, modifiers) = if let Some(pipe_pos) = memchr(b'|', after_on.as_bytes()) {
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
        let (expression, end_pos) = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}"
            if self.eat_optional("\"") || self.eat_optional("'") {
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                if self.eat_optional("{") {
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
            } else if self.eat_optional("{") {
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
        let (prop_name, modifiers) = if let Some(pipe_pos) = memchr(b'|', after_bind.as_bytes()) {
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
        let (expression, end_pos) = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}"
            if self.eat_optional("\"") || self.eat_optional("'") {
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                if self.eat_optional("{") {
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
            } else if self.eat_optional("{") {
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

        // Check for empty directive name
        if action_name.is_empty() {
            return Err(crate::error::ParseError::svelte(
                "directive_missing_name",
                "`use:` name cannot be empty",
                (start, name_end),
            ));
        }

        let name_loc = self.create_name_loc(name_start, name_end);

        let (expression, end_pos) = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}" or ="value"
            if self.eat_optional("\"") || self.eat_optional("'") {
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                // Look for expression inside quotes: "{expr}"
                if self.eat_optional("{") {
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
            } else if self.eat_optional("{") {
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

        // Check for empty directive name
        if class_name.is_empty() {
            return Err(crate::error::ParseError::svelte(
                "directive_missing_name",
                "`class:` name cannot be empty",
                (start, name_end),
            ));
        }

        let name_loc = self.create_name_loc(name_start, name_end);

        let expression = if self.eat_optional("=") {
            self.skip_whitespace();
            if self.eat_optional("{") {
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
        let (prop_name, modifiers) = if let Some(pipe_pos) = memchr(b'|', after_style.as_bytes()) {
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

        let value = if self.eat_optional("=") {
            self.skip_whitespace();
            if self.eat_optional("{") {
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
            } else if self.eat_optional("\"") || self.eat_optional("'") {
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

        let (expression, end_pos) = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}"
            if self.eat_optional("\"") || self.eat_optional("'") {
                let quote = if self.source.chars().nth(self.index - 1) == Some('"') {
                    '"'
                } else {
                    '\''
                };
                if self.eat_optional("{") {
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
            } else if self.eat_optional("{") {
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
                metadata: None,
            },
        )))
    }

    /// Helper to extract name and modifiers from "name|mod1|mod2".
    pub fn extract_name_and_modifiers(s: &str) -> (String, Vec<CompactString>) {
        if let Some(pipe_pos) = memchr(b'|', s.as_bytes()) {
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

        let expression = if self.eat_optional("=") {
            self.skip_whitespace();
            if self.eat_optional("{") {
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
                metadata: None, // Populated during Phase 2 analysis
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

        let expression = if self.eat_optional("=") {
            self.skip_whitespace();
            if self.eat_optional("{") {
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
                metadata: Default::default(),
            },
        )))
    }

    /// Parse attribute value.
    pub fn parse_attribute_value(&mut self) -> ParseResult<AttributeValue> {
        // Check for missing value (e.g., `class= >` or `class=>`)
        let c = self.current_char();
        if c == '>' {
            return Err(crate::error::ParseError::svelte(
                "expected_attribute_value",
                "Expected attribute value",
                (self.index, self.index),
            ));
        }

        // Special case: `href=/>` should be parsed as `href=/` with `/` as the value
        // followed by `>` to close the tag. This matches official Svelte behavior.
        if c == '/' && self.match_str("/>") {
            let start = self.index;
            self.advance(); // consume '/'
            return Ok(AttributeValue::Sequence(vec![AttributeValuePart::Text(
                Text {
                    start: start as u32,
                    end: self.index as u32,
                    raw: CompactString::from("/"),
                    data: CompactString::from("/"),
                },
            )]));
        }

        let quote = if self.eat_optional("\"") {
            Some('"')
        } else if self.eat_optional("'") {
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
                // Unquoted values end at whitespace or > or />
                if c.is_whitespace() || c == '>' {
                    break;
                }
                // Check for self-closing tag />
                if c == '/' && self.source.get(temp_idx + 1..temp_idx + 2) == Some(">") {
                    break;
                }
                if c == '}' {
                    last_brace = Some(temp_idx);
                }
                temp_idx += c.len_utf8();
                value_end = temp_idx;
            }

            // If the value ends with }, treat the whole thing as an expression
            if let Some(brace_pos) = last_brace
                && brace_pos == value_end - 1
            {
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

        loop {
            if self.is_eof() {
                break;
            }

            if let Some(q) = quote {
                if self.current_char() == q {
                    break;
                }
            } else {
                // Unquoted value ends at whitespace or > (but NOT / alone - it can be part of the value like href=/)
                let c = self.current_char();
                if c.is_whitespace() || c == '>' {
                    break;
                }
            }

            // Check for expression
            if self.current_char() == '{' {
                let expr_start = self.index;
                self.advance(); // consume '{'

                // Check for {@html} or other @ tags in attribute value - this is invalid
                self.skip_whitespace();
                if self.current_char() == '@' {
                    self.advance(); // consume '@'
                    let tag_name: String = self
                        .source
                        .get(self.index..)
                        .unwrap_or("")
                        .chars()
                        .take_while(|c| c.is_ascii_lowercase())
                        .collect();
                    return Err(crate::error::ParseError::svelte(
                        "tag_invalid_placement",
                        format!("{{@{} ...}} tag cannot be in attribute value", tag_name),
                        (expr_start, expr_start),
                    ));
                }
                // Check for {#if}, {#each}, {#await}, etc. block tags in attribute value - this is invalid
                if self.current_char() == '#' {
                    self.advance(); // consume '#'
                    let tag_name: String = self
                        .source
                        .get(self.index..)
                        .unwrap_or("")
                        .chars()
                        .take_while(|c| c.is_ascii_lowercase())
                        .collect();
                    return Err(crate::error::ParseError::svelte(
                        "block_invalid_placement",
                        format!("{{#{} ...}} block cannot be in attribute value", tag_name),
                        (expr_start, expr_start),
                    ));
                }
                // Reset position after whitespace check (we only peeked)
                self.index = expr_start + 1;

                // Parse expression content
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

                // Check if we found a closing brace
                if depth > 0 {
                    return Err(crate::error::ParseError::svelte(
                        "expected_token",
                        "Expected token }",
                        (self.index, self.index),
                    ));
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
                    let data = decode_html_entities(raw, true);
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
                ..Default::default()
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
                let mustache_start = self.index;

                // Check for {@html} or other @ tags in textarea - this is invalid
                // Peek ahead: { followed by optional whitespace and @
                let peek_content = self.source.get(self.index + 1..).unwrap_or("");
                let trimmed_peek = peek_content.trim_start();
                if trimmed_peek.starts_with('@') {
                    // Extract the tag name after @
                    let after_at = trimmed_peek.get(1..).unwrap_or("");
                    let tag_name_str: String = after_at
                        .chars()
                        .take_while(|c| c.is_ascii_lowercase())
                        .collect();
                    return Err(crate::error::ParseError::svelte(
                        "tag_invalid_placement",
                        format!(
                            "{{@{} ...}} tag cannot be inside a <textarea>",
                            tag_name_str
                        ),
                        (mustache_start, mustache_start),
                    ));
                }

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
            ..Default::default()
        })
    }
}
