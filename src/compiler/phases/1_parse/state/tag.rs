//! Mustache tag and block parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/state/tag.js`
//!
//! It handles parsing of mustache expressions (`{expression}`), block tags
//! (`{#if}`, `{#each}`, `{#await}`, `{#key}`, `{#snippet}`), and special tags
//! (`{@html}`, `{@render}`, `{@debug}`, `{@const}`).

use compact_str::CompactString;

use crate::ast::js::Expression;
use crate::ast::template::{
    AwaitBlock, ConstTag, DebugTag, EachBlock, ExpressionTag, Fragment, FragmentType, HtmlTag,
    IfBlock, KeyBlock, RenderTag, SnippetBlock, TemplateNode,
};
use crate::compiler::phases::phase1_parse::utils::find_matching_bracket;
use crate::error::ParseResult;

use super::super::parser::{Parser, StackEntry};

impl Parser<'_> {
    /// Parse a mustache expression.
    pub fn parse_mustache(&mut self) -> ParseResult<Option<TemplateNode>> {
        let start = self.index;
        self.advance(); // consume '{'

        self.skip_whitespace();

        // Check for block tags
        if self.match_str("#") {
            return self.parse_block_open(start);
        }

        if self.match_str(":") {
            // Block continuation - should not happen at top level
            return Err(crate::error::ParseError::svelte(
                "block_invalid_continuation_placement",
                "{:...} block is invalid at this position (did you forget to close the preceding element or block?)",
                (start, start),
            ));
        }

        if self.match_str("/") && !self.match_str("/*") && !self.match_str("//") {
            // Block close (but not JS comment) - should not happen at top level
            return Ok(None);
        }

        if self.match_str("@") {
            return self.parse_special_tag(start);
        }

        // Regular expression tag
        let expr_start = self.index;

        // Use find_matching_bracket to properly handle strings, comments, and regex
        // inside the expression (the naive depth counter breaks on e.g. {'{'})
        let end = find_matching_bracket(self.source, expr_start, '{').unwrap_or(self.source.len());
        self.index = end;

        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        // Parse the expression - propagate JS parse errors when not in loose mode
        // (corresponds to Svelte's read_expression call which throws on invalid JS)
        let expression = self.parse_js_expression_strict(expr_content.trim(), expr_start)?;

        Ok(Some(TemplateNode::ExpressionTag(ExpressionTag {
            start: start as u32,
            end: self.index as u32,
            expression,
        })))
    }

    /// Parse block open tag ({#if}, {#each}, etc.)
    pub fn parse_block_open(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
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
    pub fn parse_if_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
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
        let mut alternate = self.parse_if_alternate()?;

        // Handle closing {/if} if not already consumed
        let mut found_closing = false;
        if self.match_str("{/") {
            self.advance_by(2);
            self.eat_optional("if");
            self.skip_whitespace();
            self.eat_optional("}");
            found_closing = true;
        }

        // Pop from stack only if we found the closing tag
        // If we reached EOF without closing, leave on stack for error reporting
        if found_closing && !self.stack.is_empty() {
            self.stack.pop();
        }

        // Update end positions of all elseif blocks recursively
        if found_closing && let Some(alt_fragment) = &mut alternate {
            Self::update_if_block_ends(alt_fragment, self.index as u32);
        }

        Ok(Some(TemplateNode::IfBlock(IfBlock {
            start: start as u32,
            end: self.index as u32,
            elseif: false,
            test,
            consequent,
            alternate,
            metadata: Default::default(),
        })))
    }

    /// Update end positions of all elseif IfBlocks recursively
    fn update_if_block_ends(fragment: &mut Fragment, end: u32) {
        for node in &mut fragment.nodes {
            if let TemplateNode::IfBlock(if_block) = node
                && if_block.elseif
            {
                if_block.end = end;
                // Recursively update nested elseif blocks
                if let Some(alt) = &mut if_block.alternate {
                    Self::update_if_block_ends(alt, end);
                }
            }
        }
    }

    /// Parse {:else} or {:else if} blocks recursively
    pub fn parse_if_alternate(&mut self) -> ParseResult<Option<Fragment>> {
        if !self.match_str("{:") {
            return Ok(None);
        }

        let else_block_start = self.index;
        self.advance_by(2); // consume '{:'
        self.skip_whitespace();

        if !self.eat_optional("else") {
            // Not an else block, backtrack
            self.index = else_block_start;
            return Ok(None);
        }

        self.skip_whitespace();

        if self.eat_optional("if") {
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

            // Don't consume {/if} here - let parse_if_block handle it

            Ok(Some(Fragment {
                node_type: FragmentType::Fragment,
                nodes: vec![TemplateNode::IfBlock(IfBlock {
                    start: else_block_start as u32,
                    end: self.index as u32,
                    elseif: true,
                    test: alt_test,
                    consequent: alt_consequent,
                    alternate: alt_alternate,
                    metadata: Default::default(),
                })],
                ..Default::default()
            }))
        } else {
            // {:else}
            self.skip_whitespace(); // Handle {:else } with space before }
            self.eat_optional("}");
            let alt_fragment = self.parse_fragment()?;

            // Don't consume {/if} here - let parse_if_block handle it

            Ok(Some(alt_fragment))
        }
    }

    /// Parse {#each} block.
    /// Syntax: {#each expression as context}...{:else}...{/each}
    /// Or: {#each expression as context, index}...{/each}
    /// Or: {#each expression as context (key)}...{/each}
    pub fn parse_each_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
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
        // Use disallow_loose = true to prevent patterns like `as { y = z }` from being parsed as expressions
        // (corresponds to Svelte's read_expression(parser, undefined, true))
        let expression = self.parse_js_expression_internal(expr_content, expr_start, true, '{');

        if !found_as {
            // No "as" found - check for ", identifier" index syntax
            // For "{#each expr, index}", expr_content contains "expr, index"

            let (final_expr, index_name, has_key) = {
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

                    // Check if idx_part contains a key expression (contains '(' at top level)
                    // e.g., "i (key)" means we have both index and key
                    let idx_has_key = {
                        let mut d = 0;
                        let mut key_found = false;
                        for ch in idx_part.chars() {
                            match ch {
                                '[' | '{' => d += 1,
                                ']' | '}' => d -= 1,
                                '(' if d == 0 => {
                                    key_found = true;
                                    break;
                                }
                                _ => {}
                            }
                        }
                        key_found
                    };

                    // Check if idx_part is a simple identifier (or has a key after it)
                    if !idx_part.is_empty() {
                        // Extract the identifier part (before any '(')
                        let idx_name = if idx_has_key {
                            idx_part.split('(').next().unwrap_or("").trim()
                        } else {
                            idx_part
                        };

                        if idx_name.chars().all(|c| c.is_alphanumeric() || c == '_') {
                            (
                                self.parse_js_expression(expr_part, expr_start),
                                Some(CompactString::from(idx_name)),
                                idx_has_key,
                            )
                        } else {
                            (expression, None, false)
                        }
                    } else {
                        (expression, None, false)
                    }
                } else {
                    (expression, None, false)
                }
            };

            // Error if we have a key without "as" clause
            if has_key {
                return Err(crate::error::ParseError::svelte(
                    "each_key_without_as",
                    "An `{#each ...}` block without an `as` clause cannot have a key",
                    (start, self.index),
                ));
            }

            // Consume the closing }
            if self.current_char() == '}' {
                self.advance();
            }

            // Push block to stack so {:else} is recognized
            self.stack.push(StackEntry::EachBlock {
                start: start as u32,
            });

            // Parse body fragment
            let body = self.parse_fragment()?;

            // Check for {:else}
            let mut fallback = None;
            if self.match_str("{:") {
                let continuation_start = self.index;
                self.advance_by(2);
                self.skip_whitespace();
                if self.eat_optional("else") {
                    self.skip_whitespace();
                    self.eat_optional("}");
                    fallback = Some(self.parse_fragment()?);
                } else {
                    return Err(crate::error::ParseError::svelte(
                        "expected_token",
                        "Expected token {:else}",
                        (continuation_start, continuation_start),
                    ));
                }
            }

            // Handle {/each}
            if self.match_str("{/each}") {
                self.advance_by(7);
            } else if self.match_str("{/") {
                self.advance_by(2);
                self.eat_optional("each");
                self.skip_whitespace();
                self.eat_optional("}");
            }

            // Pop from stack
            if !self.stack.is_empty() {
                self.stack.pop();
            }

            return Ok(Some(TemplateNode::EachBlock(EachBlock {
                start: start as u32,
                end: self.index as u32,
                expression: final_expr,
                context: None, // No context when no "as" clause
                index: index_name,
                key: None,
                body,
                fallback,
                metadata: Default::default(),
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
        let context = self.parse_binding_pattern(trimmed_content, actual_context_start)?;

        // Check for index
        let mut index = None;
        if self.eat_optional(",") {
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
        if self.eat_optional("(") {
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
            // Use opening_token = '(' for key expressions (corresponds to Svelte's read_expression(parser, '('))
            key = Some(self.parse_js_expression_internal(key_content, key_start, false, '('));
            self.eat_optional(")"); // consume closing paren
        }

        self.skip_whitespace();
        self.eat_optional("}"); // consume closing brace

        // Push block to stack
        self.stack.push(StackEntry::EachBlock {
            start: start as u32,
        });

        // Parse body
        let body = self.parse_fragment()?;

        // Check for {:else}
        let mut fallback = None;
        if self.match_str("{:") {
            let continuation_start = self.index;
            self.advance_by(2);
            self.skip_whitespace();
            if self.eat_optional("else") {
                self.skip_whitespace();
                self.eat_optional("}");
                fallback = Some(self.parse_fragment()?);
            } else {
                // Invalid continuation tag in each block - expected {:else}
                return Err(crate::error::ParseError::svelte(
                    "expected_token",
                    "Expected token {:else}",
                    (continuation_start, continuation_start),
                ));
            }
        }

        // Handle closing {/each}
        if self.match_str("{/") {
            self.advance_by(2);
            self.eat_optional("each");
            self.skip_whitespace();
            self.eat_optional("}");
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
            metadata: Default::default(),
        })))
    }

    /// Parse a binding pattern (for each block context).
    pub fn parse_binding_pattern(
        &self,
        content: &str,
        offset: usize,
    ) -> Result<Expression, crate::error::ParseError> {
        super::super::expression::parse_binding_pattern(
            content,
            offset,
            self.expression_line_offsets(),
        )
    }

    /// Parse {#await} block.
    pub fn parse_await_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
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
        let expr_end = self.index;
        let expr_content = &self.source[expr_start..expr_end];
        // Calculate the actual start position after trimming leading whitespace
        let trimmed_content = expr_content.trim_start();
        let leading_ws = expr_content.len() - trimmed_content.len();
        let adjusted_start = expr_start + leading_ws;
        let adjusted_end = expr_end - (expr_content.len() - trimmed_content.trim_end().len());
        // For await blocks, we parse the expression with a known end position
        // to avoid find_matching_bracket finding the block's closing }
        let expression = super::super::expression::parse_expression_with_end(
            trimmed_content.trim(),
            adjusted_start,
            adjusted_end,
            self.expression_line_offsets(),
            self.source,
            self.options.loose,
            false,
            '{',
        )
        .unwrap_or_else(|(_, pos)| {
            // Return an invalid identifier on parse error (empty name)
            super::super::expression::create_identifier_with_character(
                "",
                pos,
                adjusted_end,
                self.expression_line_offsets(),
            )
        });

        // Parse 'then' value if present
        if has_then {
            self.advance_by(4); // consume 'then'
            self.skip_whitespace();

            // Check if there's a value identifier/pattern
            if self.current_char() != '}' {
                let value_start = self.index;
                // Parse pattern with brace/bracket matching for destructuring patterns
                self.skip_pattern_expression();
                let value_content = &self.source[value_start..self.index];
                if !value_content.trim().is_empty() {
                    // Use parse_binding_pattern to properly parse destructuring patterns
                    // (e.g., `{ width, height }` -> ObjectPattern) instead of creating
                    // a simple identifier. This ensures phase 2 scope analysis correctly
                    // declares individual bindings for destructured names.
                    value = Some(self.parse_binding_pattern(value_content.trim(), value_start)?);
                }
            }
        }

        // Parse 'catch' error if present
        if has_catch {
            self.advance_by(5); // consume 'catch'
            self.skip_whitespace();

            // Check if there's an error identifier/pattern
            if self.current_char() != '}' {
                let error_start = self.index;
                // Parse pattern with brace/bracket matching for destructuring patterns
                self.skip_pattern_expression();
                let error_content = &self.source[error_start..self.index];
                if !error_content.trim().is_empty() {
                    // Use parse_binding_pattern to properly parse destructuring patterns
                    // (same as for then values above).
                    error = Some(self.parse_binding_pattern(error_content.trim(), error_start)?);
                }
            }
        }

        self.skip_whitespace();
        self.eat_optional("}"); // consume closing '}'

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

            if self.eat_optional("then") {
                self.skip_whitespace();

                // Check if there's a value identifier/pattern
                if self.current_char() != '}' {
                    let value_start = self.index;
                    // Parse pattern with brace/bracket matching for destructuring patterns
                    self.skip_pattern_expression();
                    let value_content = &self.source[value_start..self.index];
                    if !value_content.trim().is_empty() {
                        // Use parse_binding_pattern to properly parse destructuring patterns
                        value =
                            Some(self.parse_binding_pattern(value_content.trim(), value_start)?);
                    }
                }
                self.skip_whitespace();
                self.eat_optional("}");

                then_fragment = Some(self.parse_fragment()?);
            } else if self.eat_optional("catch") {
                self.skip_whitespace();

                // Check if there's an error identifier/pattern
                if self.current_char() != '}' {
                    let error_start = self.index;
                    // Parse pattern with brace/bracket matching for destructuring patterns
                    self.skip_pattern_expression();
                    let error_content = &self.source[error_start..self.index];
                    if !error_content.trim().is_empty() {
                        // Use parse_binding_pattern to properly parse destructuring patterns
                        error =
                            Some(self.parse_binding_pattern(error_content.trim(), error_start)?);
                    }
                }
                self.skip_whitespace();
                self.eat_optional("}");

                catch_fragment = Some(self.parse_fragment()?);
            } else {
                // Invalid clause (e.g., {:else} in await block) - report error
                return Err(crate::error::ParseError::svelte(
                    "expected_token",
                    "Expected token {:then ...} or {:catch ...}",
                    (self.index - 2, self.index - 2),
                ));
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
            metadata: Default::default(),
        })))
    }

    /// Parse {#key} block.
    pub fn parse_key_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.skip_whitespace();

        // Read the key expression
        let expr_start = self.index;
        while !self.is_eof() && self.current_char() != '}' {
            self.advance();
        }
        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        let expression = self.parse_js_expression(expr_content.trim(), expr_start);

        // Push block to stack
        self.stack.push(StackEntry::KeyBlock {
            start: start as u32,
        });

        // Parse body
        let fragment = self.parse_fragment()?;

        // Handle closing {/key} if present (but NOT other closing tags like {/if})
        if self.match_str("{/key") {
            self.advance_by(2); // consume '{/'
            self.eat_optional("key");
            self.skip_whitespace();
            self.eat_optional("}");
        }

        // Pop from stack
        if !self.stack.is_empty() {
            self.stack.pop();
        }

        Ok(Some(TemplateNode::KeyBlock(KeyBlock {
            start: start as u32,
            end: self.index as u32,
            expression,
            fragment,
            metadata: Default::default(),
        })))
    }

    /// Parse {#snippet name(params)} block.
    pub fn parse_snippet_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.skip_whitespace();

        // Parse the snippet name (identifier)
        let name_start = self.index;
        let name = self.read_identifier();
        let name_end = self.index;

        // Create expression for the snippet name (with character field in loc)
        let expression = super::super::expression::create_identifier_with_character(
            &name,
            name_start,
            name_end,
            self.expression_line_offsets(),
        );

        // Parse optional type parameters (between < and >)
        let mut type_params = None;
        if self.eat_optional("<") {
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
            self.eat_optional(">"); // consume closing >
        }

        // Parse parameters (inside parentheses)
        self.skip_whitespace();
        let mut parameters = Vec::new();

        if self.eat_optional("(") {
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

            // Check for rest parameters (snippets don't support them)
            // Look for ... at top level (not inside nested parens/brackets)
            {
                let trimmed = params_content.trim();
                let chars: Vec<char> = trimmed.chars().collect();
                let mut depth = 0;
                for i in 0..chars.len() {
                    let c = chars[i];
                    if c == '(' || c == '[' || c == '{' {
                        depth += 1;
                    } else if c == ')' || c == ']' || c == '}' {
                        depth -= 1;
                    } else if depth == 0
                        && c == '.'
                        && i + 2 < chars.len()
                        && chars[i + 1] == '.'
                        && chars[i + 2] == '.'
                    {
                        // Found rest parameter
                        let rest_start = params_start + i;
                        return Err(crate::error::ParseError::svelte(
                            "snippet_invalid_rest_parameter",
                            "Snippets do not support rest parameters; use an array instead",
                            (rest_start, rest_start + 7), // approximate end
                        ));
                    }
                }
            }

            // Parse parameters with TypeScript type annotations
            if !params_content.trim().is_empty() {
                parameters = super::super::expression::parse_typescript_params(
                    params_content,
                    params_start,
                    self.expression_line_offsets(),
                );
            }

            self.eat_optional(")"); // consume closing paren
        }

        self.skip_whitespace();
        // Check for closing brace
        if !self.eat_optional("}") {
            // No closing brace found - report error
            return Err(crate::error::ParseError::svelte(
                "expected_token",
                "Expected token }",
                (self.index, self.index),
            ));
        }

        // Push to stack
        self.stack.push(StackEntry::SnippetBlock {
            start: start as u32,
        });

        // Parse body
        let body = self.parse_fragment()?;

        // Handle closing {/snippet}
        if self.match_str("{/") {
            self.advance_by(2);
            self.eat_optional("snippet");
            self.skip_whitespace();
            self.eat_optional("}");
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
            metadata: Default::default(),
        })))
    }

    /// Parse special tag ({@html}, {@debug}, etc.)
    pub fn parse_special_tag(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.advance(); // consume '@'

        // Try to match known keywords and check for whitespace
        let _keyword_start = self.index;
        let known_keywords = ["html", "render", "const", "debug", "attach"];

        // Check each keyword to see if it matches
        let mut keyword = CompactString::new("");
        for kw in &known_keywords {
            if self.match_str(kw) {
                // Found a match - check if followed by identifier chars
                let pos_after_kw = self.index + kw.len();
                if pos_after_kw < self.source.len() {
                    let next_char = self.source[pos_after_kw..].chars().next().unwrap_or('\0');
                    if next_char.is_alphanumeric() || next_char == '_' {
                        // Keyword followed by identifier chars without whitespace
                        // This is an error like @constfoo
                        return Err(crate::error::ParseError::svelte(
                            "expected_whitespace",
                            "Expected whitespace",
                            (pos_after_kw, pos_after_kw),
                        ));
                    }
                }
                self.advance_by(kw.len());
                keyword = CompactString::from(*kw);
                break;
            }
        }

        // If no keyword matched, read as identifier (unknown tag)
        if keyword.is_empty() {
            keyword = self.read_identifier();
        }

        self.skip_whitespace();

        match keyword.as_str() {
            "html" => {
                let expr_start = self.index;

                // Track bracket depth to handle nested braces in expressions
                // e.g., {@html `foo: ${foo}`} - need to skip the inner `}` in template literal
                let mut depth = 1; // We're already inside the opening `{` of the tag
                while !self.is_eof() {
                    let ch = self.current_char();
                    match ch {
                        '{' => {
                            depth += 1;
                            self.advance();
                        }
                        '}' => {
                            depth -= 1;
                            if depth == 0 {
                                break;
                            }
                            self.advance();
                        }
                        // Skip string literals to avoid counting braces inside strings
                        '"' | '\'' => {
                            let quote = ch;
                            self.advance();
                            let mut escaped = false;
                            while !self.is_eof() {
                                let c = self.current_char();
                                if escaped {
                                    escaped = false;
                                } else if c == '\\' {
                                    escaped = true;
                                } else if c == quote {
                                    break;
                                }
                                self.advance();
                            }
                            if !self.is_eof() {
                                self.advance(); // consume closing quote
                            }
                        }
                        // Skip template literals - they can contain ${...}
                        '`' => {
                            self.advance(); // consume opening backtick
                            let mut escaped = false;
                            while !self.is_eof() {
                                let c = self.current_char();
                                if escaped {
                                    escaped = false;
                                    self.advance();
                                } else if c == '\\' {
                                    escaped = true;
                                    self.advance();
                                } else if c == '$' && self.peek_chars(1).starts_with('{') {
                                    // Template literal expression ${...}
                                    self.advance(); // consume '$'
                                    self.advance(); // consume '{'
                                    let mut template_depth = 1;
                                    while !self.is_eof() && template_depth > 0 {
                                        match self.current_char() {
                                            '{' => {
                                                template_depth += 1;
                                                self.advance();
                                            }
                                            '}' => {
                                                template_depth -= 1;
                                                self.advance();
                                            }
                                            '`' => {
                                                // Nested template literal - skip it recursively
                                                self.advance(); // consume opening backtick
                                                let mut nested_escaped = false;
                                                while !self.is_eof() {
                                                    let nc = self.current_char();
                                                    if nested_escaped {
                                                        nested_escaped = false;
                                                        self.advance();
                                                    } else if nc == '\\' {
                                                        nested_escaped = true;
                                                        self.advance();
                                                    } else if nc == '`' {
                                                        self.advance();
                                                        break;
                                                    } else {
                                                        self.advance();
                                                    }
                                                }
                                            }
                                            '"' | '\'' => {
                                                // Skip strings inside template expression
                                                let q = self.current_char();
                                                self.advance();
                                                while !self.is_eof() {
                                                    let sc = self.current_char();
                                                    if sc == '\\' {
                                                        self.advance();
                                                        if !self.is_eof() {
                                                            self.advance();
                                                        }
                                                    } else if sc == q {
                                                        self.advance();
                                                        break;
                                                    } else {
                                                        self.advance();
                                                    }
                                                }
                                            }
                                            _ => self.advance(),
                                        }
                                    }
                                } else if c == '`' {
                                    break;
                                } else {
                                    self.advance();
                                }
                            }
                            if !self.is_eof() {
                                self.advance(); // consume closing backtick
                            }
                        }
                        _ => self.advance(),
                    }
                }
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'

                let expression = self.parse_js_expression(expr_content.trim(), expr_start);

                Ok(Some(TemplateNode::HtmlTag(HtmlTag {
                    start: start as u32,
                    end: self.index as u32,
                    expression,
                    metadata: Default::default(),
                })))
            }
            "render" => {
                // {@render snippet(...)}
                let expr_start = self.index;

                // Track bracket depth to handle nested braces in expressions
                // e.g., {@render foo({ count })} - need to skip the inner `}` of the object
                let mut depth = 1; // We're already inside the opening `{` of the tag
                while !self.is_eof() {
                    let ch = self.current_char();
                    match ch {
                        '{' => depth += 1,
                        '}' => {
                            depth -= 1;
                            if depth == 0 {
                                break;
                            }
                        }
                        // Skip string literals to avoid counting braces inside strings
                        '"' | '\'' | '`' => {
                            let quote = ch;
                            self.advance();
                            let mut escaped = false;
                            while !self.is_eof() {
                                let c = self.current_char();
                                if escaped {
                                    escaped = false;
                                } else if c == '\\' {
                                    escaped = true;
                                } else if c == quote {
                                    break;
                                }
                                self.advance();
                            }
                        }
                        _ => {}
                    }
                    self.advance();
                }

                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'

                // Check for invalid call patterns (apply, bind, call)
                let trimmed = expr_content.trim();
                if trimmed.contains(".apply(")
                    || trimmed.contains(".bind(")
                    || trimmed.contains(".call(")
                {
                    return Err(crate::error::ParseError::svelte(
                        "render_tag_invalid_call_expression",
                        "Calling a snippet function using apply, bind or call is not allowed",
                        (expr_start, expr_start),
                    ));
                }

                let expression = self.parse_js_expression(trimmed, expr_start);

                Ok(Some(TemplateNode::RenderTag(RenderTag {
                    start: start as u32,
                    end: self.index as u32,
                    expression,
                    metadata: crate::ast::template::RenderTagMetadata::default(),
                })))
            }
            "const" => {
                // {@const foo = bar}
                // Note: Must track brace depth for destructuring patterns like { handler } = obj
                self.skip_whitespace();
                let expr_start = self.index;
                let mut brace_depth = 0;
                let mut in_string = false;
                let mut string_char = '\0';
                let mut prev_char = '\0';

                while !self.is_eof() {
                    let c = self.current_char();

                    if in_string {
                        // Handle escape sequences - backslash escapes the next char
                        if c == string_char && prev_char != '\\' {
                            in_string = false;
                        }
                        prev_char = c;
                        self.advance();
                        continue;
                    }

                    if c == '"' || c == '\'' || c == '`' {
                        in_string = true;
                        string_char = c;
                        prev_char = c;
                        self.advance();
                        continue;
                    }

                    if c == '{' {
                        brace_depth += 1;
                    } else if c == '}' {
                        if brace_depth == 0 {
                            // Found the closing brace of the @const tag
                            break;
                        }
                        brace_depth -= 1;
                    }
                    prev_char = c;
                    self.advance();
                }
                let expr_content = &self.source[expr_start..self.index];
                let expr_end = self.index;
                self.advance(); // consume '}'

                // Check for sequence expression (multiple declarations with comma)
                // Parse the expression and check if it's a sequence expression
                let trimmed = expr_content.trim();

                // Simple check: if there's a comma at top level (outside parentheses/brackets),
                // and not part of a single assignment, it's invalid
                let mut depth = 0;
                let mut in_string = false;
                let mut string_char = '\0';
                let chars: Vec<char> = trimmed.chars().collect();
                let mut first_equals = None;

                for (i, &c) in chars.iter().enumerate() {
                    if in_string {
                        if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                            in_string = false;
                        }
                        continue;
                    }

                    if c == '"' || c == '\'' || c == '`' {
                        in_string = true;
                        string_char = c;
                        continue;
                    }

                    if c == '(' || c == '[' || c == '{' {
                        depth += 1;
                    } else if c == ')' || c == ']' || c == '}' {
                        depth -= 1;
                    } else if c == '=' && first_equals.is_none() && depth == 0 {
                        // Check it's not ==, ===, !=, !==, <=, >=, =>
                        if i + 1 < chars.len()
                            && chars[i + 1] != '='
                            && chars[i + 1] != '>'
                            && (i == 0
                                || (chars[i - 1] != '!'
                                    && chars[i - 1] != '<'
                                    && chars[i - 1] != '>'))
                        {
                            first_equals = Some(i);
                        }
                    } else if c == ',' && depth == 0 {
                        // Found top-level comma after the first assignment - this is a sequence expression
                        if first_equals.is_some() {
                            return Err(crate::error::ParseError::svelte(
                                "const_tag_invalid_expression",
                                "{@const ...} must consist of a single variable declaration",
                                (expr_start, expr_end),
                            ));
                        }
                    }
                }

                // Build a proper VariableDeclaration node, matching the official
                // Svelte compiler output.  The official compiler uses
                // `read_pattern` (reads identifier/destructuring + optional TS
                // type annotation), then `=`, then `read_expression` for the
                // init.  We approximate this by splitting at the first
                // top-level `=` we already found.
                let declaration = if let Some(eq_idx) = first_equals {
                    // Split into pattern string and init string
                    let pattern_str = trimmed[..eq_idx].trim();
                    let init_str = trimmed[eq_idx + 1..].trim();

                    // Strip TypeScript type annotation from pattern if present.
                    // For a simple identifier like `area: number`, strip `: number`.
                    // For destructuring like `{ x, y }: Point`, strip `: Point`.
                    let pattern_clean = strip_type_annotation(pattern_str);

                    // Parse the pattern (LHS)
                    // For destructuring patterns ({...} or [...]), use the dedicated
                    // pattern parser which wraps in `let ... = null` to handle
                    // default values (e.g., {x = 1, y}) that are not valid as
                    // standalone expressions.
                    let pattern_expr =
                        if pattern_clean.starts_with('{') || pattern_clean.starts_with('[') {
                            super::super::read::expression::parse_destructuring_pattern(
                                &pattern_clean,
                                expr_start,
                                self.expression_line_offsets(),
                            )
                            .unwrap_or_else(|| self.parse_js_expression(&pattern_clean, expr_start))
                        } else {
                            self.parse_js_expression(&pattern_clean, expr_start)
                        };

                    // Calculate the offset for the init expression in the
                    // original source.  `trimmed` starts at `expr_start` in
                    // the source, and `eq_idx` is the position of `=` within
                    // `trimmed`.
                    let init_offset = expr_start
                        + eq_idx
                        + 1
                        + (trimmed[eq_idx + 1..].len() - trimmed[eq_idx + 1..].trim_start().len());
                    let init_expr = self.parse_js_expression(init_str, init_offset);

                    // Build VariableDeclaration JSON node like the official compiler.
                    // Use expr_start / expr_end so that the server-side handler
                    // can still extract the original source text via
                    // tag.declaration.start() / tag.declaration.end().
                    build_const_variable_declaration(
                        &pattern_expr,
                        &init_expr,
                        expr_start,
                        expr_end,
                    )
                } else {
                    // No `=` found – fall back to parsing as a single expression
                    self.parse_js_expression(trimmed, expr_start)
                };

                Ok(Some(TemplateNode::ConstTag(ConstTag {
                    start: start as u32,
                    end: self.index as u32,
                    declaration,
                    metadata: Default::default(),
                })))
            }
            "debug" => {
                // Parse {@debug} tag
                // {@debug} with no args means "debug all"
                // {@debug x, y, z} debugs specific identifiers
                self.skip_whitespace();

                let identifiers: Vec<Expression> = if self.current_char() == '}' {
                    // {@debug} - no identifiers (debug all)
                    Vec::new()
                } else {
                    // Read expression content up to closing brace
                    let expr_start = self.index;
                    let mut depth = 1;
                    while !self.is_eof() && depth > 0 {
                        let ch = self.current_char();
                        match ch {
                            '{' => depth += 1,
                            '}' => depth -= 1,
                            _ => {}
                        }
                        if depth > 0 {
                            self.advance();
                        }
                    }
                    let expr_end = self.index;
                    let expr_content = self.source[expr_start..expr_end].trim();

                    if expr_content.is_empty() {
                        Vec::new()
                    } else {
                        // Parse as expression
                        let expression = self.parse_js_expression(expr_content, expr_start);

                        // Extract identifiers from the expression
                        // If it's a SequenceExpression (comma-separated), extract each one
                        // Otherwise treat as single identifier
                        let value = expression.as_json();
                        let expr_type = value.get("type").and_then(|t| t.as_str());

                        if expr_type == Some("SequenceExpression") {
                            // Extract expressions from sequence
                            if let Some(expressions) =
                                value.get("expressions").and_then(|e| e.as_array())
                            {
                                expressions
                                    .iter()
                                    .map(|e| Expression::Value(e.clone()))
                                    .collect()
                            } else {
                                vec![expression]
                            }
                        } else {
                            vec![expression]
                        }
                    }
                };

                self.advance(); // consume '}'

                Ok(Some(TemplateNode::DebugTag(DebugTag {
                    start: start as u32,
                    end: self.index as u32,
                    identifiers,
                    metadata: Default::default(),
                })))
            }
            "attach" => {
                // Skip to closing brace (attach not fully implemented yet)
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

    /// Parse a JavaScript expression and return as Expression (internal version).
    ///
    /// Corresponds to calling `read_expression(parser)` in Svelte.
    ///
    /// # Arguments
    /// * `content` - The expression string to parse
    /// * `offset` - Byte offset in the source
    /// * `disallow_loose` - Whether to disallow loose mode even if enabled
    /// * `opening_token` - The opening bracket token (default: '{')
    pub fn parse_js_expression_internal(
        &self,
        content: &str,
        offset: usize,
        disallow_loose: bool,
        opening_token: char,
    ) -> Expression {
        // Adjust offset for leading whitespace that gets trimmed
        let leading_ws = content.len() - content.trim_start().len();
        let trimmed = content.trim();
        super::super::expression::parse_expression(
            trimmed,
            offset + leading_ws,
            self.expression_line_offsets(),
            self.source,
            self.options.loose,
            disallow_loose,
            opening_token,
        )
        .unwrap_or_else(|(_, pos)| {
            // Return an invalid identifier on parse error (empty name, no loc field)
            super::super::expression::create_empty_identifier("", pos, pos + trimmed.len())
        })
    }

    /// Parse a JavaScript expression and return as Result, propagating errors.
    ///
    /// This is similar to `parse_js_expression_internal` but returns `ParseResult`
    /// instead of always falling back to an empty identifier on errors.
    pub fn parse_js_expression_strict(
        &self,
        content: &str,
        offset: usize,
    ) -> crate::error::ParseResult<Expression> {
        // Adjust offset for leading whitespace that gets trimmed
        let leading_ws = content.len() - content.trim_start().len();
        let trimmed = content.trim();
        super::super::expression::parse_expression(
            trimmed,
            offset + leading_ws,
            self.expression_line_offsets(),
            self.source,
            self.options.loose,
            false,
            '{',
        )
        .map_err(|(msg, pos)| {
            crate::error::ParseError::svelte("js_parse_error", msg, (pos, pos + trimmed.len()))
        })
    }

    /// Parse a JavaScript expression and return as Expression.
    ///
    /// Convenience wrapper that calls `parse_js_expression_internal` with `disallow_loose = false`
    /// and `opening_token = '{'`.
    pub fn parse_js_expression(&self, content: &str, offset: usize) -> Expression {
        self.parse_js_expression_internal(content, offset, false, '{')
    }
}

/// Strip a TypeScript type annotation from a pattern string.
///
/// For simple identifiers: `area: number` -> `area`
/// For destructuring: `{ x, y }: Point` -> `{ x, y }`
///
/// This handles nested braces/brackets so that colons inside destructuring
/// patterns (like `{ x: aliasX }`) are not mistakenly treated as type
/// annotations.
fn strip_type_annotation(pattern: &str) -> String {
    let chars: Vec<char> = pattern.chars().collect();
    let mut depth = 0;

    for (i, &c) in chars.iter().enumerate() {
        match c {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ':' if depth == 0 => {
                // Found a top-level colon - this is a type annotation
                return pattern[..i].trim().to_string();
            }
            _ => {}
        }
    }

    // No type annotation found
    pattern.to_string()
}

/// Build a `VariableDeclaration` node from a pattern expression and init
/// expression.
///
/// This creates the same JSON structure as the official Svelte compiler:
/// ```json
/// {
///   "type": "VariableDeclaration",
///   "kind": "const",
///   "declarations": [{
///     "type": "VariableDeclarator",
///     "id": <pattern>,
///     "init": <init>
///   }]
/// }
/// ```
fn build_const_variable_declaration(
    pattern: &Expression,
    init: &Expression,
    decl_start: usize,
    decl_end: usize,
) -> Expression {
    use serde_json::{Map, Value};

    let pattern_value = pattern.as_json().clone();
    let init_value = init.as_json().clone();

    // Get positions from the pattern and init for the declarator
    let id_start = pattern_value
        .get("start")
        .and_then(|v| v.as_u64())
        .unwrap_or(decl_start as u64);
    let init_end = init_value
        .get("end")
        .and_then(|v| v.as_u64())
        .unwrap_or(decl_end as u64);

    // Build VariableDeclarator
    let mut declarator = Map::new();
    declarator.insert(
        "type".to_string(),
        Value::String("VariableDeclarator".to_string()),
    );
    declarator.insert("id".to_string(), pattern_value);
    declarator.insert("init".to_string(), init_value);
    declarator.insert("start".to_string(), Value::Number((id_start as i64).into()));
    declarator.insert("end".to_string(), Value::Number((init_end as i64).into()));

    // Build VariableDeclaration
    let mut declaration = Map::new();
    declaration.insert(
        "type".to_string(),
        Value::String("VariableDeclaration".to_string()),
    );
    declaration.insert("kind".to_string(), Value::String("const".to_string()));
    declaration.insert(
        "declarations".to_string(),
        Value::Array(vec![Value::Object(declarator)]),
    );
    declaration.insert(
        "start".to_string(),
        Value::Number((decl_start as i64).into()),
    );
    declaration.insert("end".to_string(), Value::Number((decl_end as i64).into()));

    Expression::Value(Value::Object(declaration))
}
