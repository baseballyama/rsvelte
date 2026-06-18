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
use memchr::memmem;
use smallvec::SmallVec;

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

            // Use SIMD-accelerated search for "-->" instead of byte-by-byte scanning
            if let Some(pos) = memmem::find(&self.bytes[self.index..], b"-->") {
                self.index += pos;
            } else {
                self.index = self.bytes.len();
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
        if self.match_byte(b'/') {
            let close_start = self.index - 1; // start includes '<'
            self.advance(); // consume '/'
            let name_start_idx = self.index;
            self.read_tag_name();
            let name_end_idx = self.index;
            self.skip_whitespace();

            // Check if closing a void element (which is invalid)
            if is_void_element(&self.source[name_start_idx..name_end_idx]) {
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
        let name = CompactString::from(self.read_tag_name());
        let name_end = self.index;

        // Validate svelte: tag names using first-byte dispatch on suffix
        if name.as_bytes().first() == Some(&b's')
            && name.len() > 7
            && name.as_bytes().get(6) == Some(&b':')
            && name.as_bytes()[..7] == *b"svelte:"
        {
            let suffix = &name[7..];
            let is_valid = matches!(
                suffix,
                "head"
                    | "options"
                    | "window"
                    | "document"
                    | "body"
                    | "element"
                    | "component"
                    | "self"
                    | "fragment"
                    | "boundary"
            );
            if !is_valid {
                return Err(crate::error::ParseError::svelte(
                    "svelte_meta_invalid_tag",
                    "Valid `<svelte:...>` tag names are svelte:head, svelte:options, svelte:window, svelte:document, svelte:body, svelte:element, svelte:component, svelte:self, svelte:fragment or svelte:boundary\nhttps://svelte.dev/e/svelte_meta_invalid_tag",
                    (name_start, name_end),
                ));
            }
        } else if !name.is_empty() && !self.options.loose {
            // Validate element/component names
            // regex_valid_element_name: /^(?:![a-zA-Z]+|[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|[a-zA-Z][a-zA-Z0-9]*:[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])$/
            // regex_valid_component_name: /^(?:\p{Lu}[$\u200c\u200d\p{ID_Continue}.]*|\p{ID_Start}[$\u200c\u200d\p{ID_Continue}]*(?:\.[$\u200c\u200d\p{ID_Continue}]+)+)$/u
            if !is_valid_element_name(&name) && !is_valid_component_name(&name) {
                return Err(crate::error::ParseError::svelte(
                    "tag_invalid_name",
                    "Expected a valid element or component name. Components must have a valid variable name or dot notation expression\nhttps://svelte.dev/e/tag_invalid_name",
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

        // Parse attributes. Top-level `<script>` / `<style>` attributes are
        // static upstream (`read_static_attribute`, element.js
        // `is_top_level_script_or_style`), so `{...}` chunks in their quoted
        // values must not be parsed as JS expressions.
        let is_top_level_script_or_style =
            (name == "script" || name == "style") && self.stack.len() == 1;
        let prev_in_root_script_or_style = self.in_root_script_or_style;
        self.in_root_script_or_style = is_top_level_script_or_style;
        let attributes_result = self.parse_attributes();
        self.in_root_script_or_style = prev_in_root_script_or_style;
        let attributes = attributes_result?;

        // Track position after attributes for unclosed elements at EOF
        let pos_after_attrs = self.index;
        self.skip_whitespace();

        // Check for self-closing or void element. A top-level `<script>` /
        // `<style>` cannot be self-closed: upstream's
        // `is_top_level_script_or_style` branch runs `parser.eat('>', true)`
        // directly (the `/` is never consumed), so `<script foo="bar"/>` is an
        // `expected_token` error at the `/`.
        //
        // In lenient (lint) mode we mirror svelte-eslint-parser, which DOES
        // tolerate a self-closed `<style />` / `<script />` (it produces a
        // self-closing node so layout/style lint rules can still fire). Allow
        // the `/` to be consumed so the template parse does not abort — the
        // compiler keeps `lenient_script: false`, so its output is unchanged.
        let self_closing = if is_top_level_script_or_style
            && !self.options.loose
            && !self.options.lenient_script
        {
            false
        } else {
            self.eat_optional("/")
        };
        let has_closing_bracket = self.eat_optional(">"); // consume '>'

        // A missing `>` after the attributes is a strict-mode error.
        //
        // - At EOF, upstream's next `read_attribute` → `read_until` call
        //   throws `unexpected_eof` (parser.read_until errors when invoked at
        //   the end of input), e.g. `<d` ⊣.
        // - Mid-template the attribute loop ends on a non-name character and
        //   `parser.eat('>', true, false)` throws `expected_token`, e.g.
        //   `<Comp foo={bar}\n</div>` or a top-level `<script …/>`.
        if !has_closing_bracket && !self.options.loose {
            self.skip_whitespace();
            if self.is_eof() {
                return Err(crate::error::ParseError::svelte(
                    "unexpected_eof",
                    "Unexpected end of input",
                    (self.source.len(), self.source.len()),
                ));
            }
            return Err(crate::error::ParseError::expected_token(">", self.index));
        }
        // In loose mode, treat as an unclosed element and continue

        // Handle script and style tags specially
        // Only treat as Svelte script if at root level (not inside another element)
        if name == "script" && !self.is_inside_element() {
            return self.parse_script_tag(start, attributes, self_closing);
        }

        // Only treat as Svelte style (component CSS) if at root level (not inside another element)
        // When inside any element (including svelte:head), style should remain as a child element
        if name == "style" && !self.is_inside_element() {
            return self.parse_style_tag(start, attributes, self_closing);
        }

        // Handle svelte:options specially - extract and store options
        if name == "svelte:options" {
            return self.parse_svelte_options(start, attributes, self_closing);
        }

        // Add character field for compatibility (skip in compilation mode)
        let name_loc_with_char = self.create_name_loc_optional(name_start, name_end);

        let is_void = is_void_element(&name);
        let element_type = self.get_element_type(&name, &attributes);

        // Check if this is a raw text element (textarea, or non-top-level script/style).
        // Non-top-level <script> and <style> tags have their content parsed as raw text,
        // matching the official Svelte compiler behavior (element.js L400-417).
        let is_raw_text_element = name == "textarea"
            || ((name == "script" || name == "style") && self.is_inside_element());

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
                let cn_start = self.index;
                self.read_tag_name();
                let cn_end = self.index;
                self.skip_whitespace();

                // Verify matching tag
                let closing_name = &self.source[cn_start..cn_end];
                if closing_name == name.as_str() {
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

                    // Upstream clears `last_auto_closed_tag` once a closing tag
                    // pops the stack below the depth recorded when the tag was
                    // auto-closed (element.js L133-135). The pop for this
                    // element happens just below, so compare against
                    // `stack.len() - 1`.
                    if let Some(ref last_auto) = self.last_auto_closed_tag
                        && self.stack.len().saturating_sub(1) < last_auto.depth
                    {
                        self.last_auto_closed_tag = None;
                    }
                } else {
                    // Mismatched close tag. Upstream's close() while-loop:
                    // a *RegularElement* parent is implicitly closed with an
                    // `element_implicitly_closed` warning (suppressed when the
                    // tag was just auto-closed); any other parent (Component,
                    // SvelteElement, TitleElement, …) is a strict-mode error —
                    // `element_invalid_closing_tag` or its `…_autoclosed`
                    // variant (element.js L107-122).
                    let is_regular_element = matches!(
                        element_type,
                        ElementType::Regular | ElementType::ShadowrootTemplate
                    );
                    if is_regular_element {
                        if self
                            .last_auto_closed_tag
                            .as_ref()
                            .is_none_or(|t| t.tag.as_str() != closing_name)
                        {
                            self.parse_warnings.push(crate::ast::template::ParseWarning {
                                code: "element_implicitly_closed".to_string(),
                                message: format!(
                                    "This element is implicitly closed by the following `</{}>`, which can cause an unexpected DOM structure. Add an explicit `</{}>` to avoid surprises.\nhttps://svelte.dev/e/element_implicitly_closed",
                                    closing_name, name
                                ),
                            });
                        }
                    } else if !self.options.loose {
                        if let Some(ref last_auto) = self.last_auto_closed_tag
                            && last_auto.tag.as_str() == closing_name
                        {
                            let reason = last_auto.reason.clone();
                            return Err(crate::error::ParseError::svelte(
                                "element_invalid_closing_tag_autoclosed",
                                format!(
                                    "`</{}>` attempted to close element that was already automatically closed by `<{}>` (cannot nest `<{}>` inside `</{}>`)",
                                    closing_name, reason, reason, closing_name
                                ),
                                (close_start, close_start),
                            ));
                        }
                        return Err(crate::error::ParseError::svelte(
                            "element_invalid_closing_tag",
                            format!(
                                "`</{}>` attempted to close an element that was not open",
                                closing_name
                            ),
                            (close_start, close_start),
                        ));
                    }
                    self.index = close_start; // Reset to before '</...'
                    // Still mark as found for backwards compatibility (auto-close behavior)
                    found_closing_tag = true;
                }
            } else if let Some(slash_pos) = self.match_block_close_marker() {
                // `{/...}` while this element is still open. Upstream `close()`
                // hits the `RegularElement` / default case: strict mode errors
                // `block_unexpected_close` (e.g. the open `<li>b` in
                // `{#if true}<li>b{/if}`), loose mode pops the element so the
                // enclosing block consumes the marker (auto-close recovery).
                if !self.options.loose {
                    return Err(crate::error::ParseError::svelte(
                        "block_unexpected_close",
                        "Unexpected block closing tag",
                        (slash_pos, slash_pos),
                    ));
                }
                found_closing_tag = true;
            } else if self.match_block_continuation_marker().is_some() {
                // A `{:...}` continuation while inside an element: loose-mode
                // recovery auto-closes the element. (In strict mode
                // `parse_fragment` already errored with
                // `block_invalid_continuation_placement` before reaching here.)
                found_closing_tag = true;
            } else if let Some(reason) = self.should_implicitly_close() {
                // Element was implicitly closed by the next element (sibling).
                // Emit element_implicitly_closed warning.
                // Corresponds to element.js L203-205:
                //   w.element_implicitly_closed({ start: parent.start, end }, `<${tag.name}>`, `</${parent.name}>`);
                self.parse_warnings.push(crate::ast::template::ParseWarning {
                    code: "element_implicitly_closed".to_string(),
                    message: format!(
                        "This element is implicitly closed by the following `<{}>`, which can cause an unexpected DOM structure. Add an explicit `</{}>` to avoid surprises.\nhttps://svelte.dev/e/element_implicitly_closed",
                        reason, name
                    ),
                });
                // Track which tag was auto-closed so we can raise the correct error later.
                // Reference: element.js `parser.last_auto_closed_tag` assignment.
                let auto_closed_tag_name = match self.stack.last() {
                    Some(StackEntry::Element { name, .. }) => Some(name.clone()),
                    _ => None,
                };
                if let Some(auto_closed_name) = auto_closed_tag_name {
                    self.last_auto_closed_tag = Some(
                        crate::compiler::phases::phase1_parse::parser::LastAutoClosedTag {
                            tag: auto_closed_name,
                            reason,
                            depth: self.stack.len() - 1, // depth after popping
                        },
                    );
                }
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
                    TemplateNode::DeclarationTag(d) => d.end,
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
                name_loc: name_loc_with_char,
                attributes,
                fragment,
            }),
            ElementType::Title => TemplateNode::TitleElement(TitleElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
            }),
            ElementType::Component => TemplateNode::Component(Box::new(Component {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
                metadata: Default::default(),
            })),
            ElementType::SvelteHead => TemplateNode::SvelteHead(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
            }),
            ElementType::SvelteBody => TemplateNode::SvelteBody(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
            }),
            ElementType::SvelteWindow => TemplateNode::SvelteWindow(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
            }),
            ElementType::SvelteDocument => TemplateNode::SvelteDocument(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
            }),
            ElementType::SvelteFragment => TemplateNode::SvelteFragment(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
            }),
            ElementType::SvelteBoundary => TemplateNode::SvelteBoundary(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
            }),
            ElementType::SvelteSelf => TemplateNode::SvelteSelf(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
            }),
            ElementType::SvelteOptions => TemplateNode::SvelteOptions(SvelteElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
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

                TemplateNode::SvelteComponent(Box::new(SvelteComponentElement {
                    start: start as u32,
                    end,
                    name: name.clone(),
                    name_loc: name_loc_with_char,
                    attributes: filtered_attrs,
                    fragment,
                    expression,
                    ignored_codes: Vec::new(),
                }))
            }
            ElementType::SvelteElement => {
                // Check if the "this" attribute is a string value (not an expression)
                // and emit svelte_element_invalid_this warning if so.
                // Corresponds to element.js L288-289: if (!is_expression_attribute(definition)) { w.svelte_element_invalid_this(definition); }
                for attr in &attributes {
                    if let crate::ast::Attribute::Attribute(node) = attr
                        && node.name.as_str() == "this"
                    {
                        let is_expression_attribute = match &node.value {
                            AttributeValue::Expression(_) => true,
                            AttributeValue::Sequence(parts) => {
                                parts.len() == 1
                                    && matches!(&parts[0], AttributeValuePart::ExpressionTag(_))
                            }
                            _ => false,
                        };
                        if !is_expression_attribute {
                            self.parse_warnings.push(crate::ast::template::ParseWarning {
                                code: "svelte_element_invalid_this".to_string(),
                                message: "`this` should be an `{expression}`. Using a string attribute value will cause an error in future versions of Svelte\nhttps://svelte.dev/e/svelte_element_invalid_this".to_string(),
                            });
                        }
                    }
                }

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

                TemplateNode::SvelteElement(Box::new(SvelteDynamicElement {
                    start: start as u32,
                    end,
                    name: name.clone(),
                    name_loc: name_loc_with_char,
                    attributes: filtered_attrs,
                    fragment,
                    tag,
                    metadata: Default::default(),
                }))
            }
            _ => TemplateNode::RegularElement(Box::new(RegularElement {
                start: start as u32,
                end,
                name: name.clone(),
                name_loc: name_loc_with_char,
                attributes,
                fragment,
                metadata: Default::default(),
            })),
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
                    AttributeValue::Sequence(parts)
                        // A non-expression `this` uses the FIRST chunk only,
                        // mirroring upstream element.js L298-315: `this="h{n}"`
                        // (buggy Svelte 4 behaviour, preserved upstream) becomes
                        // the Literal `'h'` rather than an error.
                        if !parts.is_empty() => {
                            match &parts[0] {
                                AttributeValuePart::Text(text) => {
                                    // For quoted string values like this="div"
                                    // Create a proper Literal AST node matching the official compiler:
                                    // { type: "Literal", value: "div", raw: "'div'" }
                                    return Expression::from_json(serde_json::json!({
                                        "type": "Literal",
                                        "value": text.data.as_str(),
                                        "raw": format!("'{}'", text.raw.as_str()),
                                        "start": text.start,
                                        "end": text.end
                                    }));
                                }
                                AttributeValuePart::ExpressionTag(expr_tag) => {
                                    // For quoted expression like this="{expr}"
                                    return expr_tag.expression.clone();
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
                // Fast byte-level check: uppercase ASCII or first char is uppercase Unicode
                let first = name.as_bytes().first().copied().unwrap_or(0);
                if first.is_ascii_uppercase()
                    || (first >= 0x80 && name.chars().next().is_some_and(|c| c.is_uppercase()))
                    || memchr(b'.', name.as_bytes()).is_some()
                {
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

    /// Check if not at root level (inside any element or block context).
    /// A script/style tag at root level is a Svelte script/style.
    /// A script/style tag inside an element or block is an HTML script/style.
    #[inline]
    pub fn is_inside_element(&self) -> bool {
        // Root is always at position 0 in the stack.
        // If there's more than just Root, we're nested.
        self.stack.len() > 1
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
    /// This handles HTML5 optional end tags (e.g., `<li>` closes a previous `<li>`).
    ///
    /// Returns `Some(reason)` where `reason` is the name of the opening tag that caused
    /// the implicit close. Returns `None` if no implicit close is needed.
    pub fn should_implicitly_close(&self) -> Option<CompactString> {
        // Get the IMMEDIATE parent element from the stack (not separated by blocks)
        // We only implicitly close if the direct parent is an element that can be implicitly closed
        let current_element = match self.stack.last() {
            Some(StackEntry::Element { name, .. }) => name.as_str(),
            _ => return None, // If parent is a block ({#if}, {#each}, etc.), don't implicitly close
        };

        // Check if the next tag would implicitly close the current element
        if !self.match_byte(b'<') || self.match_str("</") || self.match_str("<!") {
            return None;
        }

        // Look ahead to get the next tag name using bytes (avoids String allocation)
        let tag_start = self.index + 1; // skip '<'
        let mut tag_end = tag_start;
        while tag_end < self.bytes.len() {
            let b = self.bytes[tag_end];
            if b.is_ascii_alphanumeric() || b == b'-' || b == b':' {
                tag_end += 1;
            } else {
                break;
            }
        }

        if tag_end == tag_start {
            return None;
        }

        let next_tag_bytes = &self.bytes[tag_start..tag_end];

        // Components (starting with uppercase) should not trigger implicit closing.
        // Only HTML elements (lowercase) can implicitly close other elements.
        if next_tag_bytes[0].is_ascii_uppercase() {
            return None;
        }

        // All HTML tag names are ASCII - use a stack buffer for case-insensitive comparison
        // This avoids the heap allocation from to_lowercase()
        let next_tag_str = std::str::from_utf8(next_tag_bytes).unwrap_or("");

        // Helper macro for case-insensitive comparison against lowercase literals
        macro_rules! tag_eq {
            ($lit:expr) => {
                next_tag_str.eq_ignore_ascii_case($lit)
            };
        }

        // Check implicit closing rules (case-insensitive for HTML compliance)
        let closes = match current_element {
            "li" => tag_eq!("li"),
            "p" => {
                tag_eq!("address")
                    || tag_eq!("article")
                    || tag_eq!("aside")
                    || tag_eq!("blockquote")
                    || tag_eq!("details")
                    || tag_eq!("div")
                    || tag_eq!("dl")
                    || tag_eq!("fieldset")
                    || tag_eq!("figcaption")
                    || tag_eq!("figure")
                    || tag_eq!("footer")
                    || tag_eq!("form")
                    || tag_eq!("h1")
                    || tag_eq!("h2")
                    || tag_eq!("h3")
                    || tag_eq!("h4")
                    || tag_eq!("h5")
                    || tag_eq!("h6")
                    || tag_eq!("header")
                    || tag_eq!("hgroup")
                    || tag_eq!("hr")
                    || tag_eq!("main")
                    || tag_eq!("menu")
                    || tag_eq!("nav")
                    || tag_eq!("ol")
                    || tag_eq!("p")
                    || tag_eq!("pre")
                    || tag_eq!("section")
                    || tag_eq!("table")
                    || tag_eq!("ul")
            }
            "dt" => tag_eq!("dt") || tag_eq!("dd"),
            "dd" => tag_eq!("dt") || tag_eq!("dd"),
            "rt" => tag_eq!("rt") || tag_eq!("rp"),
            "rp" => tag_eq!("rt") || tag_eq!("rp"),
            "td" => tag_eq!("td") || tag_eq!("th") || tag_eq!("tr"),
            "th" => tag_eq!("td") || tag_eq!("th") || tag_eq!("tr"),
            "tr" => tag_eq!("tr") || tag_eq!("tbody"),
            "thead" => tag_eq!("tbody") || tag_eq!("tfoot"),
            "tbody" => tag_eq!("tbody") || tag_eq!("tfoot"),
            "tfoot" => tag_eq!("tbody"),
            "option" => tag_eq!("option") || tag_eq!("optgroup"),
            "optgroup" => tag_eq!("optgroup"),
            _ => false,
        };

        if closes {
            // Only allocate CompactString when we actually need the result
            let mut lower = String::with_capacity(next_tag_str.len());
            for b in next_tag_str.bytes() {
                lower.push(b.to_ascii_lowercase() as char);
            }
            Some(CompactString::from(lower))
        } else {
            None
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

            // Stop conditions (fast byte checks):
            if self.index >= self.bytes.len() {
                // For unclosed elements at EOF, restore position to before trailing whitespace
                if self.index > before_ws {
                    self.index = before_ws;
                }
                break;
            }
            let b = self.bytes[self.index];
            if b == b'>' {
                break;
            }
            if b == b'/' && self.index + 1 < self.bytes.len() && self.bytes[self.index + 1] == b'>'
            {
                break;
            }
            if b == b'<' && self.index + 1 < self.bytes.len() && self.bytes[self.index + 1] == b'/'
            {
                break;
            }
            if b == b'{'
                && self.index + 1 < self.bytes.len()
                && (self.bytes[self.index + 1] == b'/' || self.bytes[self.index + 1] == b'#')
            {
                break;
            }

            if let Some(attr) = self.parse_attribute()? {
                // Check for duplicate attributes - linear scan over existing attributes.
                // No separate data structure needed (most elements have < 10 attributes).
                let (attr_type_prefix, attr_name, attr_start): (u8, &str, u32) = match &attr {
                    crate::ast::Attribute::Attribute(a) => (b'A', a.name.as_str(), a.start),
                    crate::ast::Attribute::BindDirective(b) => {
                        // bind:attribute and attribute are the same, normalize to Attribute
                        (b'A', b.name.as_str(), b.start)
                    }
                    crate::ast::Attribute::ClassDirective(c) => (b'C', c.name.as_str(), c.start),
                    crate::ast::Attribute::StyleDirective(s) => (b'S', s.name.as_str(), s.start),
                    _ => {
                        // Other attribute types are not checked for duplicates
                        attributes.push(attr);
                        continue;
                    }
                };

                // Skip duplicate check for "this" attribute (used on svelte:element and svelte:component)
                if attr_name != "this" {
                    // Linear scan for duplicates against already-parsed attributes.
                    // Zero allocations - just compare names in existing attribute objects.
                    let is_dup = attributes.iter().any(|existing| {
                        let (existing_prefix, existing_name): (u8, &str) = match existing {
                            crate::ast::Attribute::Attribute(a) => (b'A', a.name.as_str()),
                            crate::ast::Attribute::BindDirective(b) => (b'A', b.name.as_str()),
                            crate::ast::Attribute::ClassDirective(c) => (b'C', c.name.as_str()),
                            crate::ast::Attribute::StyleDirective(s) => (b'S', s.name.as_str()),
                            _ => return false,
                        };
                        existing_prefix == attr_type_prefix && existing_name == attr_name
                    });

                    if is_dup {
                        return Err(crate::error::ParseError::svelte(
                            "attribute_duplicate",
                            "Attributes need to be unique",
                            (attr_start as usize, attr_start as usize + attr_name.len()),
                        ));
                    }
                }

                attributes.push(attr);
            } else {
                break;
            }
        }

        Ok(attributes)
    }

    /// Try to consume a `//` line comment or `/* */` block comment.
    ///
    /// Returns `true` if a comment was consumed (and pushed onto
    /// `root_comments`), `false` otherwise. Mirrors `read_comment()` in the
    /// official Svelte compiler (5.53+).
    fn read_attr_comment(&mut self) -> bool {
        let start = self.index;
        if self.match_str("//") {
            self.advance_by(2); // consume '//'
            let value_start = self.index;
            if let Some(pos) = memchr(b'\n', &self.bytes[self.index..]) {
                self.index += pos;
            } else {
                self.index = self.bytes.len();
            }
            let value_end = self.index;
            let end = self.index;
            let value = compact_str::CompactString::from(&self.source[value_start..value_end]);
            let loc = self.create_name_loc(start, end);
            self.root_comments
                .borrow_mut()
                .push(crate::ast::template::JsComment {
                    kind: crate::ast::template::JsCommentKind::Line,
                    start: start as u32,
                    end: end as u32,
                    value,
                    loc,
                });
            true
        } else if self.match_str("/*") {
            self.advance_by(2); // consume '/*'
            let value_start = self.index;
            let value_end;
            if let Some(pos) = memmem::find(&self.bytes[self.index..], b"*/") {
                value_end = self.index + pos;
                self.index += pos + 2; // skip past '*/'
            } else {
                value_end = self.bytes.len();
                self.index = self.bytes.len();
            }
            let end = self.index;
            let value = compact_str::CompactString::from(&self.source[value_start..value_end]);
            let loc = self.create_name_loc(start, end);
            self.root_comments
                .borrow_mut()
                .push(crate::ast::template::JsComment {
                    kind: crate::ast::template::JsCommentKind::Block,
                    start: start as u32,
                    end: end as u32,
                    value,
                    loc,
                });
            true
        } else {
            false
        }
    }

    /// Parse a single attribute.
    pub fn parse_attribute(&mut self) -> ParseResult<Option<crate::ast::Attribute>> {
        // Capture JS-style comments (// and /* */) before attribute parsing
        // and record them in `root.comments`. Corresponds to `read_comment()`
        // in the official Svelte compiler (5.53+) — see
        // `submodules/svelte/packages/svelte/src/compiler/phases/1-parse/state/element.js`.
        while self.read_attr_comment() {
            self.skip_whitespace();
        }

        let start = self.index;

        // Check for spread attribute, @attach, or expression shorthand
        if self.match_byte(b'{') {
            self.advance(); // consume '{'
            self.skip_whitespace();

            // Check for @attach
            if self.eat_optional("@attach") {
                return self.parse_attach_attribute(start);
            }

            // Check for spread attribute {...expr}
            if self.eat_optional("...") {
                let expr_start = self.index;
                let mut depth: u32 = 1;
                // Fast byte-level brace scanning
                while self.index < self.bytes.len() && depth > 0 {
                    match self.bytes[self.index] {
                        b'{' => {
                            depth += 1;
                            self.index += 1;
                        }
                        b'}' => {
                            depth -= 1;
                            if depth > 0 {
                                self.index += 1;
                            }
                        }
                        b if b < 0x80 => self.index += 1,
                        _ => self.advance(),
                    }
                }
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'
                let expression =
                    self.parse_head_expression(expr_content.trim(), expr_start, false, '}')?;
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
            let mut depth: u32 = 1;
            // Fast byte-level brace scanning
            while self.index < self.bytes.len() && depth > 0 {
                match self.bytes[self.index] {
                    b'{' => {
                        depth += 1;
                        self.index += 1;
                    }
                    b'}' => {
                        depth -= 1;
                        if depth > 0 {
                            self.index += 1;
                        }
                    }
                    b if b < 0x80 => self.index += 1,
                    _ => self.advance(),
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
                let name_loc = self.create_name_loc_optional(expr_start, expr_start);

                // Create an empty ExpressionTag value
                let expression = if self.options.skip_expression_loc {
                    Expression::Value(serde_json::json!({
                        "type": "Identifier",
                        "name": "",
                        "start": expr_start,
                        "end": expr_start,
                        "loc": null
                    }))
                } else {
                    let loc = self.get_location(expr_start);
                    Expression::Value(serde_json::json!({
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
                    }))
                };

                let value = AttributeValue::Expression(ExpressionTag {
                    start: expr_start as u32,
                    end: expr_start as u32,
                    expression: expression.clone(),
                    metadata: Default::default(),
                });

                return Ok(Some(crate::ast::Attribute::Attribute(AttributeNode {
                    start: start as u32,
                    end: self.index as u32,
                    name: CompactString::from(""),
                    name_loc,
                    value,
                    metadata: Default::default(),
                })));
            }

            // Create the expression
            let expression = self.parse_js_expression(expr_content.trim(), expr_start);

            // Create the attribute name from the expression (shorthand)
            let name = expr_content.trim().to_string();

            // Attribute shorthand must be a bare identifier (`{foo}`). Upstream
            // reads a single identifier and then expects `}`, so `{a.b}`,
            // `{a + b}`, `{a()}` are `expected_token` errors at the first
            // non-identifier character (not valid attribute names). H-153.
            if !self.options.loose
                && let Some(bad) = shorthand_first_invalid_offset(&name)
            {
                let leading_ws = expr_content.len() - expr_content.trim_start().len();
                return Err(crate::error::ParseError::expected_token(
                    "}",
                    expr_start + leading_ws + bad,
                ));
            }

            // Check for reserved words in shorthand attributes
            // In the official Svelte, read_identifier() checks is_reserved(name)
            // Reference: svelte/packages/svelte/src/compiler/phases/1-parse/index.js L248
            if crate::compiler::phases::phase1_parse::utils::is_reserved(&name) {
                return Err(crate::error::ParseError::svelte(
                    "unexpected_reserved_word",
                    format!(
                        "'{}' is a reserved word in JavaScript and cannot be used here",
                        name
                    ),
                    (expr_start, expr_start),
                ));
            }

            // Calculate name_loc
            let name_loc = self.create_name_loc_optional(expr_start, expr_end);

            // Create the ExpressionTag value
            let value = AttributeValue::Expression(ExpressionTag {
                start: (start + 1) as u32, // start after {
                end: expr_end as u32,
                expression: expression.clone(),
                metadata: Default::default(),
            });

            return Ok(Some(crate::ast::Attribute::Attribute(AttributeNode {
                start: start as u32,
                end: self.index as u32,
                name: CompactString::from(name),
                name_loc,
                value,
                metadata: Default::default(),
            })));
        }

        // Read attribute name
        let name_start = self.index;
        let name = CompactString::from(self.read_attribute_name());
        let name_end = self.index;

        if name.is_empty() {
            return Ok(None);
        }

        let name_loc = self.create_name_loc_optional(name_start, name_end);

        self.skip_whitespace();

        // Directive detection using first-byte dispatch to avoid multiple starts_with scans
        if let Some(colon_pos) = memchr(b':', name.as_bytes()) {
            let prefix = &name.as_bytes()[..colon_pos];
            match prefix {
                b"on" => {
                    return self.parse_on_directive(start, &name, name_start, name_end);
                }
                b"bind" => {
                    return self.parse_bind_directive(start, &name, name_start, name_end);
                }
                b"use" => {
                    return self.parse_use_directive(start, &name, name_start, name_end);
                }
                b"class" => {
                    return self.parse_class_directive(start, &name, name_start, name_end);
                }
                b"style" => {
                    return self.parse_style_directive(start, &name, name_start, name_end);
                }
                b"transition" | b"in" | b"out" => {
                    return self.parse_transition_directive(start, &name, name_start, name_end);
                }
                b"animate" => {
                    return self.parse_animate_directive(start, &name, name_start, name_end);
                }
                b"let" => {
                    return self.parse_let_directive(start, &name, name_start, name_end);
                }
                _ => {} // Not a directive, fall through to normal attribute
            }
        }

        // Check for value
        let (value, attr_end) = if self.eat_optional("=") {
            self.skip_whitespace();
            (self.parse_attribute_value()?, self.index)
        } else if !self.is_eof() && (self.current_char() == '"' || self.current_char() == '\'') {
            // If the next character is a quote but we didn't find '=', the user
            // likely forgot the equals sign. e.g. <h1 class"foo">
            // Corresponds to element.js L615-616:
            //   } else if (parser.match_regex(regex_starts_with_quote_characters)) {
            //     e.expected_token(parser.index, '=');
            return Err(crate::error::ParseError::svelte(
                "expected_token",
                "Expected token =\nhttps://svelte.dev/e/expected_token",
                (self.index, self.index),
            ));
        } else {
            // Boolean attribute - end is at the end of the name, not after whitespace
            (AttributeValue::True(true), name_end)
        };

        Ok(Some(crate::ast::Attribute::Attribute(AttributeNode {
            start: start as u32,
            end: attr_end as u32,
            name: name.clone(),
            name_loc,
            value,
            metadata: Default::default(),
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
            let mods: SmallVec<[CompactString; 2]> = after_on[pipe_pos + 1..]
                .split('|')
                .map(CompactString::from)
                .collect();
            (CompactString::from(&after_on[..pipe_pos]), mods)
        } else {
            (CompactString::from(after_on), SmallVec::new())
        };

        let name_loc = self.create_name_loc_optional(name_start, name_end);

        // Parse the value (expression)
        let (expression, end_pos) = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}"
            if self.eat_optional("\"") || self.eat_optional("'") {
                let quote = if self.bytes[self.index - 1] == b'"' {
                    '"'
                } else {
                    '\''
                };
                if self.eat_optional("{") {
                    let expr_start = self.index;
                    self.scan_to_closing_brace();
                    let expr_content = &self.source[expr_start..self.index];
                    self.advance(); // consume '}'
                    if self.index < self.bytes.len() && self.bytes[self.index] == quote as u8 {
                        self.advance();
                    }
                    (
                        Some(self.parse_head_expression(expr_content, expr_start, false, '}')?),
                        self.index,
                    )
                } else {
                    // Plain quoted string without expression is invalid for directives
                    let error_pos = self.index - 1; // Position at the opening quote
                    return Err(crate::error::ParseError::svelte(
                        "directive_invalid_value",
                        "Directive value must be a JavaScript expression enclosed in curly braces\nhttps://svelte.dev/e/directive_invalid_value",
                        (error_pos, error_pos),
                    ));
                }
            } else if self.eat_optional("{") {
                // Expression in braces
                let expr_start = self.index;
                self.scan_to_closing_brace();
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'
                (
                    Some(self.parse_head_expression(expr_content, expr_start, false, '}')?),
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
                name: event_name,
                name_loc,
                expression,
                modifiers,
                metadata: Default::default(),
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
            let mods: SmallVec<[CompactString; 2]> = after_bind[pipe_pos + 1..]
                .split('|')
                .map(CompactString::from)
                .collect();
            (&after_bind[..pipe_pos], mods)
        } else {
            (after_bind, SmallVec::new())
        };

        let name_loc = self.create_name_loc_optional(name_start, name_end);

        // Parse the value (expression)
        let (expression, end_pos) = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}"
            if self.eat_optional("\"") || self.eat_optional("'") {
                let quote = if self.bytes[self.index - 1] == b'"' {
                    '"'
                } else {
                    '\''
                };
                if self.eat_optional("{") {
                    let expr_start = self.index;
                    self.scan_to_closing_brace();
                    let expr_content = &self.source[expr_start..self.index];
                    self.advance(); // consume '}'
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (
                        self.parse_head_expression(expr_content, expr_start, false, '}')?,
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
                            prop_name,
                            name_start + 5,
                            name_end,
                            self.expression_line_offsets(),
                        ),
                        self.index,
                    )
                }
            } else if self.eat_optional("{") {
                // Expression in braces
                let expr_start = self.index;
                self.scan_to_closing_brace();
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'
                (
                    self.parse_head_expression(expr_content, expr_start, false, '}')?,
                    self.index,
                )
            } else {
                // Shorthand: bind:value without expression means bind to a variable with same name
                (
                    super::super::expression::create_identifier_with_character(
                        prop_name,
                        name_start + 5, // start after "bind:"
                        name_end,
                        self.expression_line_offsets(),
                    ),
                    name_end,
                )
            }
        } else {
            // Shorthand: bind:value means bind to variable named "value"
            (
                super::super::expression::create_identifier_with_character(
                    prop_name,
                    name_start + 5, // start after "bind:"
                    name_end,
                    self.expression_line_offsets(),
                ),
                name_end,
            )
        };

        Ok(Some(crate::ast::Attribute::BindDirective(
            crate::ast::template::BindDirective {
                start: start as u32,
                end: end_pos as u32,
                name: CompactString::from(prop_name),
                name_loc,
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

        let name_loc = self.create_name_loc_optional(name_start, name_end);

        let (expression, end_pos) = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}" or ="value"
            if self.eat_optional("\"") || self.eat_optional("'") {
                let quote = if self.bytes[self.index - 1] == b'"' {
                    '"'
                } else {
                    '\''
                };
                // Look for expression inside quotes: "{expr}"
                if self.eat_optional("{") {
                    let expr_start = self.index;
                    self.scan_to_closing_brace();
                    let expr_end = self.index;
                    let expr_content = &self.source[expr_start..expr_end];
                    self.advance(); // consume '}'
                    // Consume the closing quote
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (
                        Some(self.parse_head_expression(expr_content, expr_start, false, '}')?),
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
                self.scan_to_closing_brace();
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                (
                    Some(self.parse_head_expression(expr_content, expr_start, false, '}')?),
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
                name_loc,
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

        let name_loc = self.create_name_loc_optional(name_start, name_end);

        let expression = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle both bare {expr} and quoted "{expr}" / '{expr}'
            let quote =
                if !self.is_eof() && (self.current_char() == '"' || self.current_char() == '\'') {
                    let q = self.current_char();
                    self.advance(); // consume opening quote
                    Some(q)
                } else {
                    None
                };
            if self.eat_optional("{") {
                let expr_start = self.index;
                self.scan_to_closing_brace();
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                if quote.is_some() {
                    self.advance(); // consume closing quote
                }
                self.parse_head_expression(expr_content, expr_start, false, '}')?
            } else {
                if quote.is_some() {
                    self.index -= 1; // revert quote consumption
                }
                // Shorthand: class:name means expression is Identifier("name")
                super::super::expression::create_identifier_with_character(
                    class_name,
                    name_start + 6, // start after "class:"
                    name_end,
                    self.expression_line_offsets(),
                )
            }
        } else {
            // Shorthand: class:name without = means expression is Identifier("name")
            super::super::expression::create_identifier_with_character(
                class_name,
                name_start + 6, // start after "class:"
                name_end,
                self.expression_line_offsets(),
            )
        };

        Ok(Some(crate::ast::Attribute::ClassDirective(
            crate::ast::template::ClassDirective {
                start: start as u32,
                end: self.index as u32,
                name: CompactString::from(class_name),
                name_loc,
                expression,
                metadata: Default::default(),
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
            let mods: SmallVec<[CompactString; 2]> = after_style[pipe_pos + 1..]
                .split('|')
                .map(CompactString::from)
                .collect();
            (&after_style[..pipe_pos], mods)
        } else {
            (after_style, SmallVec::new())
        };

        let name_loc = self.create_name_loc_optional(name_start, name_end);

        let value = if self.eat_optional("=") {
            self.skip_whitespace();
            if self.eat_optional("{") {
                let expr_start = self.index;
                self.scan_to_closing_brace();
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                AttributeValue::Expression(ExpressionTag {
                    start: (expr_start - 1) as u32, // include the '{'
                    end: self.index as u32,
                    expression: self.parse_head_expression(expr_content, expr_start, false, '}')?,
                    metadata: Default::default(),
                })
            } else if self.eat_optional("\"") || self.eat_optional("'") {
                // Quoted string value with potential expressions: "red{variable}"
                let quote = if self.bytes[self.index - 1] == b'"' {
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
                                data: CompactString::from(decode_html_entities(
                                    &self.source[text_start..self.index],
                                    true,
                                )),
                            }));
                        }
                        let expr_start = self.index;
                        self.advance(); // consume '{'
                        let inner_start = self.index;
                        self.scan_to_closing_brace();
                        let inner_end = self.index;
                        self.advance(); // consume '}'
                        parts.push(AttributeValuePart::ExpressionTag(ExpressionTag {
                            start: expr_start as u32,
                            end: self.index as u32,
                            expression: self.parse_js_expression_strict_eager(
                                &self.source[inner_start..inner_end],
                                inner_start,
                            )?,
                            metadata: Default::default(),
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
                        data: CompactString::from(decode_html_entities(
                            &self.source[text_start..self.index],
                            true,
                        )),
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
                                data: CompactString::from(decode_html_entities(
                                    &self.source[text_start..self.index],
                                    true,
                                )),
                            }));
                        }
                        let expr_start = self.index;
                        self.advance(); // consume '{'
                        let inner_start = self.index;
                        self.scan_to_closing_brace();
                        let inner_end = self.index;
                        self.advance(); // consume '}'
                        parts.push(AttributeValuePart::ExpressionTag(ExpressionTag {
                            start: expr_start as u32,
                            end: self.index as u32,
                            expression: self.parse_js_expression_strict_eager(
                                &self.source[inner_start..inner_end],
                                inner_start,
                            )?,
                            metadata: Default::default(),
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
                        data: CompactString::from(decode_html_entities(
                            &self.source[text_start..self.index],
                            true,
                        )),
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
                name_loc,
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
        let (directive_label, transition_name, intro, outro, modifiers) =
            if let Some(stripped) = full_name.strip_prefix("transition:") {
                let (name, mods) = Self::extract_name_and_modifiers(stripped);
                ("transition:", name, true, true, mods)
            } else if let Some(stripped) = full_name.strip_prefix("in:") {
                let (name, mods) = Self::extract_name_and_modifiers(stripped);
                ("in:", name, true, false, mods)
            } else if let Some(stripped) = full_name.strip_prefix("out:") {
                let (name, mods) = Self::extract_name_and_modifiers(stripped);
                ("out:", name, false, true, mods)
            } else {
                return Ok(None);
            };

        // An empty name (`transition:`, `in:|global`, …) is a parse error —
        // it would otherwise lower to an empty JS identifier. H-146 / M-040.
        if transition_name.is_empty() {
            return Err(crate::error::ParseError::svelte(
                "directive_missing_name",
                format!("`{directive_label}` name cannot be empty"),
                (start, name_end),
            ));
        }

        let name_loc = self.create_name_loc_optional(name_start, name_end);

        let (expression, end_pos) = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle quoted value: ="{expression}"
            if self.eat_optional("\"") || self.eat_optional("'") {
                let quote = if self.bytes[self.index - 1] == b'"' {
                    '"'
                } else {
                    '\''
                };
                if self.eat_optional("{") {
                    let expr_start = self.index;
                    self.scan_to_closing_brace();
                    let expr_content = &self.source[expr_start..self.index];
                    self.advance(); // consume '}'
                    if self.current_char() == quote {
                        self.advance();
                    }
                    (
                        Some(self.parse_head_expression(expr_content, expr_start, false, '}')?),
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
                self.scan_to_closing_brace();
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'
                (
                    Some(self.parse_head_expression(expr_content, expr_start, false, '}')?),
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
                name_loc,
                expression,
                modifiers,
                intro,
                outro,
                metadata: None,
            },
        )))
    }

    /// Helper to extract name and modifiers from "name|mod1|mod2".
    pub fn extract_name_and_modifiers(s: &str) -> (&str, SmallVec<[CompactString; 2]>) {
        if let Some(pipe_pos) = memchr(b'|', s.as_bytes()) {
            let name = &s[..pipe_pos];
            let mods: SmallVec<[CompactString; 2]> = s[pipe_pos + 1..]
                .split('|')
                .map(CompactString::from)
                .collect();
            (name, mods)
        } else {
            (s, SmallVec::new())
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
        let name_loc = self.create_name_loc_optional(name_start, name_end);

        let expression = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle both bare {expr} and quoted "{expr}" / '{expr}'
            let quote =
                if !self.is_eof() && (self.current_char() == '"' || self.current_char() == '\'') {
                    let q = self.current_char();
                    self.advance(); // consume opening quote
                    Some(q)
                } else {
                    None
                };
            if self.eat_optional("{") {
                let expr_start = self.index;
                self.scan_to_closing_brace();
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                if quote.is_some() {
                    self.advance(); // consume closing quote
                }
                Some(self.parse_head_expression(expr_content, expr_start, false, '}')?)
            } else {
                if quote.is_some() {
                    self.index -= 1; // revert quote consumption
                }
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
                name_loc,
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
        let name_loc = self.create_name_loc_optional(name_start, name_end);

        let expression = if self.eat_optional("=") {
            self.skip_whitespace();
            // Handle both bare {expr} and quoted "{expr}" / '{expr}'
            let quote =
                if !self.is_eof() && (self.current_char() == '"' || self.current_char() == '\'') {
                    let q = self.current_char();
                    self.advance(); // consume opening quote
                    Some(q)
                } else {
                    None
                };
            if self.eat_optional("{") {
                let expr_start = self.index;
                self.scan_to_closing_brace();
                let expr_end = self.index;
                let expr_content = &self.source[expr_start..expr_end];
                self.advance(); // consume '}'
                if quote.is_some() {
                    self.advance(); // consume closing quote
                }
                Some(self.parse_head_expression(expr_content, expr_start, false, '}')?)
            } else {
                if quote.is_some() {
                    self.index -= 1; // revert quote consumption
                }
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
                name_loc,
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
        self.scan_to_closing_brace();
        let expr_end = self.index;
        let expr_content = &self.source[expr_start..expr_end];
        self.advance(); // consume closing '}'

        let expression = self.parse_head_expression(expr_content.trim(), expr_start, false, '}')?;

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
        if self.index < self.bytes.len() && self.bytes[self.index] == b'>' {
            return Err(crate::error::ParseError::svelte(
                "expected_attribute_value",
                "Expected attribute value",
                (self.index, self.index),
            ));
        }

        // Special case: `href=/>` should be parsed as `href=/` with `/` as the value
        // followed by `>` to close the tag. This matches official Svelte behavior.
        if self.index + 1 < self.bytes.len()
            && self.bytes[self.index] == b'/'
            && self.bytes[self.index + 1] == b'>'
        {
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

        let quote = if self.index < self.bytes.len() && self.bytes[self.index] == b'"' {
            self.index += 1;
            Some(b'"')
        } else if self.index < self.bytes.len() && self.bytes[self.index] == b'\'' {
            self.index += 1;
            Some(b'\'')
        } else {
            None
        };

        let mut parts = Vec::new();
        let value_start = self.index;

        loop {
            if self.index >= self.bytes.len() {
                break;
            }

            let cur_byte = self.bytes[self.index];
            if let Some(q) = quote {
                if cur_byte == q {
                    break;
                }
            } else {
                // Unquoted value ends at whitespace or >
                if cur_byte == b'>'
                    || cur_byte == b' '
                    || cur_byte == b'\t'
                    || cur_byte == b'\n'
                    || cur_byte == b'\r'
                {
                    break;
                }
                // Stop at /> (self-closing tag marker)
                if cur_byte == b'/'
                    && self.index + 1 < self.bytes.len()
                    && self.bytes[self.index + 1] == b'>'
                {
                    break;
                }
                // Non-ASCII whitespace check
                if cur_byte >= 0x80 {
                    let c = self.source[self.index..].chars().next().unwrap_or('\0');
                    if c.is_whitespace() {
                        break;
                    }
                }
            }

            // Check for expression
            if cur_byte == b'{' {
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

                // Use find_matching_bracket which properly handles strings,
                // comments (// and /* */), and regex expressions.
                // The simple depth-tracking approach fails when JS comments
                // contain quote characters (e.g., `don't` in a // comment).
                if let Some(close_pos) =
                    crate::compiler::phases::phase1_parse::utils::find_matching_bracket(
                        self.source,
                        expr_start + 1,
                        '{',
                    )
                {
                    self.index = close_pos + 1;
                } else {
                    self.index = self.source.len();
                    return Err(crate::error::ParseError::svelte(
                        "expected_token",
                        "Expected token }",
                        (self.index, self.index),
                    ));
                }

                let expr_end = self.index;

                // Create expression tag. Use the strict parser so that an
                // invalid expression (`a={...}`, `a={1 ? 2 : }`, TS syntax in
                // a non-TS file) surfaces as `js_parse_error`, mirroring
                // upstream's `read_expression` inside `read_attribute_value`.
                // In deferred mode this creates a Lazy expression whose error
                // is raised by `resolve_lazy_expressions`; in loose mode the
                // underlying parser still recovers with a placeholder.
                let expr_content = &self.source[expr_start + 1..expr_end - 1];
                let expression = if self.in_root_script_or_style {
                    // Top-level <script>/<style> attributes are static
                    // upstream (`read_static_attribute`): `{...}` chunks in
                    // quoted values are plain text. The parts get merged back
                    // into a Text node (`merge_attribute_parts_to_text`), so
                    // parse leniently and never raise `js_parse_error`.
                    self.parse_js_expression(expr_content, expr_start + 1)
                } else {
                    self.parse_js_expression_strict_eager(expr_content, expr_start + 1)?
                };
                parts.push(AttributeValuePart::ExpressionTag(ExpressionTag {
                    start: expr_start as u32,
                    end: expr_end as u32,
                    expression,
                    metadata: Default::default(),
                }));
            } else {
                // Text content - use byte-level scanning for speed
                let text_start = self.index;
                if let Some(q) = quote {
                    // Quoted: scan for '{' or closing quote using memchr
                    while self.index < self.bytes.len() {
                        let b = self.bytes[self.index];
                        if b == b'{' || b == q {
                            break;
                        }
                        if b < 0x80 {
                            self.index += 1;
                        } else {
                            self.advance();
                        }
                    }
                } else {
                    // Unquoted: scan for '{', whitespace, '>', or '/>'
                    while self.index < self.bytes.len() {
                        let b = self.bytes[self.index];
                        if b == b'{'
                            || b == b'>'
                            || b == b' '
                            || b == b'\t'
                            || b == b'\n'
                            || b == b'\r'
                        {
                            break;
                        }
                        if b == b'/'
                            && self.index + 1 < self.bytes.len()
                            && self.bytes[self.index + 1] == b'>'
                        {
                            break;
                        }
                        if b < 0x80 {
                            self.index += 1;
                        } else {
                            // Non-ASCII: check for Unicode whitespace
                            let c = self.source[self.index..].chars().next().unwrap_or('\0');
                            if c.is_whitespace() {
                                break;
                            }
                            self.index += c.len_utf8();
                        }
                    }
                }
                let text_end = self.index;

                if text_end > text_start {
                    let raw = &self.source[text_start..text_end];
                    // Fast path: skip entity decoding when no '&' present
                    let has_entity = memchr(b'&', &self.bytes[text_start..text_end]).is_some();
                    if has_entity {
                        let data = decode_html_entities(raw, true);
                        parts.push(AttributeValuePart::Text(Text {
                            start: text_start as u32,
                            end: text_end as u32,
                            raw: CompactString::from(raw),
                            data: CompactString::from(data),
                        }));
                    } else {
                        let cs = CompactString::from(raw);
                        parts.push(AttributeValuePart::Text(Text {
                            start: text_start as u32,
                            end: text_end as u32,
                            raw: cs.clone(),
                            data: cs,
                        }));
                    }
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
        let is_raw_content = tag_name == "style" || tag_name == "script";

        // For style and script elements, just get raw content (no expression handling)
        if is_raw_content {
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

        // For textarea/raw elements, we need to find a valid closing tag
        while !self.is_eof() && !self.is_valid_closing_tag(&closing_tag) {
            // Check for expression tag
            if self.match_byte(b'{') && !self.match_str("{{") {
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
                // A logic block (`{#each}`, `{#if}`, …) cannot appear inside a
                // <textarea>. Svelte raises `block_invalid_placement` at PARSE
                // (read_sequence's `'inside <textarea>'` location); rsvelte
                // mirrored it only in the analyze EachBlock visitor, which
                // svelte2tsx (parse-only) never runs. Raise it here too so the
                // error surfaces consistently.
                if trimmed_peek.starts_with('#') {
                    let after_hash = trimmed_peek.get(1..).unwrap_or("");
                    let block_name: String = after_hash
                        .chars()
                        .take_while(|c| c.is_ascii_lowercase())
                        .collect();
                    return Err(crate::error::ParseError::svelte(
                        "block_invalid_placement",
                        format!("{{#{} ...}} block cannot be inside <textarea>", block_name),
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

/// Check if a name is a valid HTML element name.
/// Based on: /^(?:![a-zA-Z]+|[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|[a-zA-Z][a-zA-Z0-9]*:[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])$/
fn is_valid_element_name(name: &str) -> bool {
    let bytes = name.as_bytes();
    if bytes.is_empty() {
        return false;
    }

    // Check for doctype-like: !DOCTYPE, etc.
    if bytes[0] == b'!' {
        return bytes.len() > 1 && bytes[1..].iter().all(|b| b.is_ascii_alphabetic());
    }

    // Must start with a letter
    if !bytes[0].is_ascii_alphabetic() {
        return false;
    }

    // Check for namespaced element (e.g., svg:rect)
    if let Some(colon_pos) = name.find(':') {
        let before_bytes = &name.as_bytes()[..colon_pos];
        let after_bytes = &name.as_bytes()[colon_pos + 1..];

        // Before colon: [a-zA-Z][a-zA-Z0-9]*
        if before_bytes.is_empty() || !before_bytes[0].is_ascii_alphabetic() {
            return false;
        }
        if !before_bytes[1..].iter().all(|b| b.is_ascii_alphanumeric()) {
            return false;
        }

        // After colon: [a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]
        if after_bytes.is_empty() || !after_bytes[0].is_ascii_alphabetic() {
            return false;
        }
        if after_bytes.len() == 1 {
            return true;
        }
        // Must end with alphanumeric
        if !after_bytes.last().unwrap().is_ascii_alphanumeric() {
            return false;
        }
        // Middle can be alphanumeric or hyphen
        return after_bytes[1..after_bytes.len() - 1]
            .iter()
            .all(|b| b.is_ascii_alphanumeric() || *b == b'-');
    }

    // Simple element name: [a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?
    if bytes.len() == 1 {
        return true; // Single letter is valid
    }

    // Must end with alphanumeric
    if !bytes.last().unwrap().is_ascii_alphanumeric() {
        return false;
    }

    // Middle can be alphanumeric or hyphen
    bytes[1..bytes.len() - 1]
        .iter()
        .all(|b| b.is_ascii_alphanumeric() || *b == b'-')
}

/// Check if a name is a valid Svelte component name.
/// Based on: /^(?:\p{Lu}[$\u200c\u200d\p{ID_Continue}.]*|\p{ID_Start}[$\u200c\u200d\p{ID_Continue}]*(?:\.[$\u200c\u200d\p{ID_Continue}]+)+)$/u
///
/// Simplified implementation that handles the common cases:
/// 1. Uppercase starting names: Component, MyComponent, Cæжαकン中
/// 2. Dot notation: foo.Bar, a.b.C
fn is_valid_component_name(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }

    let mut chars = name.chars();
    let first = chars.next().unwrap();

    // Check for uppercase-starting component (e.g., Component, MyComponent)
    // Also supports Unicode uppercase letters (e.g., Wunderschön, Cæжαकン中)
    if first.is_uppercase() {
        // Rest can be identifier characters, $, or .
        return chars.all(is_component_name_char);
    }

    // Check for dot-notation component (e.g., foo.Bar, a.b.C)
    // Must start with a valid identifier start character
    if !is_identifier_start(first) {
        return false;
    }

    // Split by dots
    let parts: Vec<&str> = name.split('.').collect();
    if parts.len() < 2 {
        return false; // Must have at least one dot for non-uppercase start
    }

    // Each part must be a valid identifier
    for (i, part) in parts.iter().enumerate() {
        if part.is_empty() {
            return false;
        }
        let mut part_chars = part.chars();
        let part_first = part_chars.next().unwrap();

        // First part must start with identifier start
        if i == 0 {
            if !is_identifier_start(part_first) {
                return false;
            }
        } else {
            // Subsequent parts can start with identifier continue, $
            if !is_identifier_continue(part_first) && part_first != '$' {
                return false;
            }
        }

        // Rest of part must be identifier continue or $
        if !part_chars.all(|c| is_identifier_continue(c) || c == '$') {
            return false;
        }
    }

    true
}

/// Check if a character can start a JavaScript identifier.
/// Simplified version of Unicode ID_Start.
fn is_identifier_start(c: char) -> bool {
    c.is_alphabetic() || c == '_' || c == '$'
}

/// Check if a character can continue a JavaScript identifier.
/// Simplified version of Unicode ID_Continue.
fn is_identifier_continue(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$' || c == '\u{200c}' || c == '\u{200d}'
}

/// Check if a character is valid in a component name (after the first char).
fn is_component_name_char(c: char) -> bool {
    is_identifier_continue(c) || c == '.'
}

/// Returns the byte offset within `name` of the first character that prevents
/// it from being a bare JS identifier — the attribute-shorthand grammar accepts
/// only a single identifier (`{foo}`), so `{a.b}` / `{a + b}` / `{a()}` are
/// rejected at the offending character. Returns `None` when `name` is a valid
/// identifier. An empty `name` returns `Some(0)`. H-153.
fn shorthand_first_invalid_offset(name: &str) -> Option<usize> {
    let mut iter = name.char_indices();
    match iter.next() {
        None => Some(0),
        Some((_, c)) if !is_identifier_start(c) => Some(0),
        _ => iter
            .find(|(_, c)| !is_identifier_continue(*c))
            .map(|(i, _)| i),
    }
}
