//! Fragment parsing - entry point and node dispatch.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/state/fragment.js`
//!
//! It provides the main entry point for parsing Svelte templates, dispatching
//! to element, text, and mustache tag parsers based on the current character.
//!
//! ## JavaScript Implementation
//!
//! ```javascript
//! export default function fragment(parser) {
//!     if (parser.match('<')) {
//!         return element;
//!     }
//!
//!     if (parser.match('{')) {
//!         return tag;
//!     }
//!
//!     return text;
//! }
//! ```
//!
//! The JavaScript version uses a state machine pattern where each state function
//! returns the next state function. The Rust implementation is more direct,
//! using methods that parse and return nodes directly rather than returning
//! function pointers. The `parse_node()` method corresponds to the `fragment()`
//! function's dispatch logic.

use crate::ast::template::{Fragment, FragmentType, Root, RootType, TemplateNode};
use crate::error::ParseResult;

use super::super::parser::Parser;

impl Parser<'_> {
    /// Parse the source into a Root AST node.
    pub fn parse(&mut self) -> ParseResult<Root> {
        use super::super::parser::StackEntry;
        use super::super::utils::is_void_element;

        let mut fragment = self.parse_fragment()?;

        // Check for unclosed elements or blocks on the stack (unless in loose mode)
        if !self.options.loose
            && let Some(entry) = self.stack.last()
        {
            match entry {
                StackEntry::Element { name, start, .. } => {
                    return Err(crate::error::ParseError::svelte(
                        "element_unclosed",
                        format!("`<{}>` was left open", name),
                        (*start as usize, *start as usize + 1),
                    ));
                }
                StackEntry::IfBlock { start } => {
                    return Err(crate::error::ParseError::svelte(
                        "block_unclosed",
                        "Block was left open",
                        (*start as usize, *start as usize + 1),
                    ));
                }
                StackEntry::EachBlock { start } => {
                    return Err(crate::error::ParseError::svelte(
                        "block_unclosed",
                        "Block was left open",
                        (*start as usize, *start as usize + 1),
                    ));
                }
                StackEntry::AwaitBlock { start } => {
                    return Err(crate::error::ParseError::svelte(
                        "block_unclosed",
                        "Block was left open",
                        (*start as usize, *start as usize + 1),
                    ));
                }
                StackEntry::KeyBlock { start } => {
                    return Err(crate::error::ParseError::svelte(
                        "block_unclosed",
                        "Block was left open",
                        (*start as usize, *start as usize + 1),
                    ));
                }
                StackEntry::SnippetBlock { start } => {
                    return Err(crate::error::ParseError::svelte(
                        "block_unclosed",
                        "Block was left open",
                        (*start as usize, *start as usize + 1),
                    ));
                }
                StackEntry::Root => {}
            }
        }

        // Check for remaining unprocessed content (void element closing tags, etc.)
        self.skip_whitespace();
        if self.match_str("</") {
            let close_start = self.index;
            let tag_name_start = self.index + 2;
            let mut tag_name_end = tag_name_start;
            while tag_name_end < self.bytes.len() {
                let b = self.bytes[tag_name_end];
                if b.is_ascii_alphanumeric() || b == b'-' || b == b':' {
                    tag_name_end += 1;
                } else {
                    break;
                }
            }
            let tag_name = &self.source[tag_name_start..tag_name_end];

            if is_void_element(tag_name) {
                return Err(crate::error::ParseError::svelte(
                    "void_element_invalid_content",
                    "Void elements cannot have children or closing tags",
                    (close_start, close_start + 2 + tag_name.len()),
                ));
            }
        }

        // A stray block close tag at root (e.g. `{/if}`) has no matching open
        // block. `parse_fragment` stops on `{/...}` without consuming it, so any
        // leftover close marker here is an error in strict mode. (Comments
        // `{/*`, `{//` are not close markers.)
        if !self.options.loose
            && self.match_str("{/")
            && !self.match_str("{/*")
            && !self.match_str("{//")
        {
            return Err(crate::error::ParseError::svelte(
                "block_unexpected_close",
                "Unexpected block closing tag",
                (self.index, self.index + 1),
            ));
        }

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
            let after_special = text.end >= max_special_end;
            // Fast byte-level whitespace check
            let is_whitespace = text.data.as_bytes().iter().all(|&b| {
                b == b' '
                    || b == b'\t'
                    || b == b'\n'
                    || b == b'\r'
                    || (b >= 0x80 && (b as char).is_whitespace())
            });
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
            comments: {
                // Drain any acorn/OXC-side comments collected during the
                // parse and merge with the Svelte-side attribute comments.
                // Both streams record positions in source order, so a sort
                // by `start` yields the upstream `parser.root.comments`
                // ordering.
                let oxc_comments =
                    crate::compiler::phases::phase1_parse::read::expression::take_expr_comments();
                let mut svelte_comments = std::mem::take(&mut *self.root_comments.borrow_mut());
                svelte_comments.extend(oxc_comments);
                svelte_comments.sort_by_key(|c| c.start);
                svelte_comments
            },
            instance: self.instance_script.take().map(Box::new),
            module: self.module_script.take().map(Box::new),
            parse_warnings: std::mem::take(&mut self.parse_warnings),
            source: None,
            arena: std::mem::take(&mut self.arena),
        })
    }

    /// Check if the remaining content from current position to EOF is only whitespace.
    #[inline]
    pub fn remaining_is_whitespace_only(&self) -> bool {
        // Fast path: scan bytes for ASCII whitespace
        let bytes = &self.bytes[self.index..];
        for &b in bytes {
            if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                continue;
            }
            if b < 0x80 {
                // ASCII non-whitespace
                return false;
            }
            // Non-ASCII: fall back to char-based check for entire remaining string
            return self.source[self.index..].chars().all(|c| c.is_whitespace());
        }
        true
    }

    /// Parse a fragment (sequence of nodes).
    pub fn parse_fragment(&mut self) -> ParseResult<Fragment> {
        use super::super::parser::StackEntry;
        use super::super::utils::is_void_element;

        let mut nodes = Vec::new();

        while self.index < self.bytes.len() {
            // Fast dispatch on first byte to avoid redundant match_str calls
            let first_byte = self.bytes[self.index];

            // Check for end conditions based on first byte
            let (is_block_close, is_block_continuation) =
                if first_byte == b'{' && self.index + 1 < self.bytes.len() {
                    let second_byte = self.bytes[self.index + 1];
                    if second_byte == b'/' {
                        // {/ - but not {/* or {//
                        let is_comment = self.index + 2 < self.bytes.len()
                            && (self.bytes[self.index + 2] == b'*'
                                || self.bytes[self.index + 2] == b'/');
                        (!is_comment, false)
                    } else if second_byte == b':' {
                        // {: - but not {:/* or {://
                        // Check 3rd+4th bytes directly: {:/ followed by * or /
                        let is_comment = self.index + 3 < self.bytes.len()
                            && self.bytes[self.index + 2] == b'/'
                            && (self.bytes[self.index + 3] == b'*'
                                || self.bytes[self.index + 3] == b'/');
                        (false, !is_comment)
                    } else {
                        (false, false)
                    }
                } else {
                    (false, false)
                };

            // If we see a closing tag and the stack only has Root (root level), this is an error
            if first_byte == b'<'
                && self.index + 1 < self.bytes.len()
                && self.bytes[self.index + 1] == b'/'
            {
                // Check if this is a closing tag at root level (only Root on stack)
                let is_root_level =
                    self.stack.len() == 1 && matches!(self.stack.first(), Some(StackEntry::Root));
                if is_root_level {
                    // Peek ahead to get the tag name using byte scanning (no allocation)
                    let close_start = self.index;
                    let tag_name_start = self.index + 2;
                    let mut tag_name_end = tag_name_start;
                    while tag_name_end < self.bytes.len() {
                        let b = self.bytes[tag_name_end];
                        if b.is_ascii_alphanumeric() || b == b'-' || b == b':' {
                            tag_name_end += 1;
                        } else {
                            break;
                        }
                    }
                    let tag_name = &self.source[tag_name_start..tag_name_end];

                    if is_void_element(tag_name) {
                        return Err(crate::error::ParseError::svelte(
                            "void_element_invalid_content",
                            "Void elements cannot have children or closing tags",
                            (close_start, close_start + 2 + tag_name.len()),
                        ));
                    } else {
                        // Non-void closing tag without matching opening tag.
                        // Check if this tag was auto-closed by a nested element.
                        // If so, raise element_invalid_closing_tag_autoclosed instead.
                        if let Some(ref last_auto) = self.last_auto_closed_tag
                            && last_auto.tag.as_str() == tag_name
                        {
                            let reason = last_auto.reason.clone();
                            return Err(crate::error::ParseError::svelte(
                                "element_invalid_closing_tag_autoclosed",
                                format!(
                                    "`</{}>` attempted to close element that was already automatically closed by `<{}>` (cannot nest `<{}>` inside `</{}>`)",
                                    tag_name, reason, reason, tag_name
                                ),
                                (close_start, close_start),
                            ));
                        }
                        return Err(crate::error::ParseError::svelte(
                            "element_invalid_closing_tag",
                            format!(
                                "`</{}>` attempted to close an element that was not open",
                                tag_name
                            ),
                            (close_start, close_start),
                        ));
                    }
                }
                break;
            }

            if is_block_close || is_block_continuation {
                // Check if block continuation is valid at this position
                // Block continuation tags like {:else}, {:then}, {:catch} are only valid
                // within IfBlock, EachBlock, or AwaitBlock contexts
                if is_block_continuation {
                    let cont_start = self.index;
                    // Get the current context from the stack
                    let current_context = self.stack.last();
                    let is_valid_continuation_context = matches!(
                        current_context,
                        Some(StackEntry::IfBlock { .. })
                            | Some(StackEntry::EachBlock { .. })
                            | Some(StackEntry::AwaitBlock { .. })
                    );

                    if !is_valid_continuation_context {
                        return Err(crate::error::ParseError::svelte(
                            "block_invalid_continuation_placement",
                            "{:...} block is invalid at this position (did you forget to close the preceding element or block?)",
                            (cont_start, cont_start),
                        ));
                    }
                }
                break;
            }

            // Check for implicit closing - if the next tag would implicitly close the current element
            if first_byte == b'<' && self.should_implicitly_close().is_some() {
                break;
            }

            // Skip trailing whitespace at EOF - don't parse it as a Text node
            // Only check if the first byte looks like whitespace (fast path)
            if (first_byte == b' '
                || first_byte == b'\t'
                || first_byte == b'\n'
                || first_byte == b'\r'
                || first_byte >= 0x80)
                && self.remaining_is_whitespace_only()
            {
                break;
            }

            if let Some(node) = self.parse_node()? {
                nodes.push(node);
            }
        }

        Ok(Fragment {
            node_type: FragmentType::Fragment,
            nodes,
            ..Default::default()
        })
    }

    /// Parse a single node.
    ///
    /// Corresponds to the `fragment()` function in `state/fragment.js`.
    ///
    /// The JavaScript version returns the next state function (element, tag, or text),
    /// while this Rust version directly dispatches to the appropriate parsing method
    /// and returns the parsed node.
    ///
    /// Dispatch logic:
    /// - `parser.match('<')` → `element` (JS) / `parse_element_or_comment()` (Rust)
    /// - `parser.match('{')` → `tag` (JS) / `parse_mustache()` (Rust)
    /// - Otherwise → `text` (JS) / `parse_text()` (Rust)
    #[inline]
    pub fn parse_node(&mut self) -> ParseResult<Option<TemplateNode>> {
        if self.index >= self.bytes.len() {
            return Ok(None);
        }

        // Use byte dispatch instead of char dispatch for ASCII
        match self.bytes[self.index] {
            b'<' => self.parse_element_or_comment(),
            b'{' => self.parse_mustache(),
            _ => self.parse_text(),
        }
    }
}
