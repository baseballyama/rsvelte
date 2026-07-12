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
    AwaitBlock, ConstTag, DebugTag, DeclarationTag, EachBlock, ExpressionTag, Fragment,
    FragmentType, HtmlTag, IfBlock, KeyBlock, RenderTag, SnippetBlock, TemplateNode,
};
use crate::compiler::phases::phase1_parse::utils::find_matching_bracket;
use crate::error::ParseResult;

use super::super::parser::{Parser, StackEntry};

impl Parser<'_> {
    /// Try to parse a declaration tag (`{let x = …}` / `{const x = …}`,
    /// Svelte 5.56.0 #18282). Returns `Ok(None)` when the source at
    /// `self.index` does not begin with a `let` / `const` keyword followed by
    /// whitespace, leaving the parser position unchanged so the regular
    /// expression-tag fallback can run.
    ///
    /// On a match, finds the matching `}`, splits the body at the first
    /// top-level `=`, parses the pattern + init, and returns a
    /// `TemplateNode::DeclarationTag` whose `declaration` field is a
    /// `VariableDeclaration` JSON node with the matching `kind`.
    pub(crate) fn try_parse_declaration_tag(
        &mut self,
        start: usize,
    ) -> ParseResult<Option<TemplateNode>> {
        // The `parse_mustache` caller has already consumed `{` and skipped
        // whitespace. Peek at the next bytes to detect `let ` / `const `;
        // require a trailing whitespace / line-ending byte so we don't
        // accidentally swallow `{letter}` or `{constant}` expressions.
        let decl_start = self.index;

        // The keyword must be followed by whitespace to open a declaration tag
        // (`{let ` / `{const ` / `{type `), so `{letter}` / `{constant}` /
        // `{type}` stay expression tags and contrived calls like `{let(x)}`
        // remain expressions rather than malformed declarations. (Upstream uses
        // a `\b` word boundary and then parses to disambiguate; requiring
        // whitespace reaches the same result for every real-world tag without a
        // statement parse.)
        let kw_terminated_at = |off: usize| {
            self.bytes
                .get(self.index + off)
                .copied()
                .is_some_and(|b| matches!(b, b' ' | b'\t' | b'\n' | b'\r'))
        };

        // `var` / `interface` / `enum` are reserved words that can never be a
        // valid declaration tag — error immediately with the keyword span
        // (mirrors upstream `regex_unsupported_declaration`).
        if (self.match_str("var") && kw_terminated_at(3))
            || (self.match_str("interface") && kw_terminated_at(9))
            || (self.match_str("enum") && kw_terminated_at(4))
        {
            let kw_len = if self.match_str("var") {
                3
            } else if self.match_str("enum") {
                4
            } else {
                9
            };
            return Err(crate::error::ParseError::svelte(
                "declaration_tag_invalid_type",
                "Declaration tags must be `let` or `const` declarations",
                (decl_start, decl_start + kw_len),
            ));
        }

        // A supported `let` / `const` declaration, or a `type` keyword that
        // *might* be a TS type-alias declaration (confirmed below from the
        // body). Anything else is not a declaration tag — return `Ok(None)`
        // with `self.index` untouched so the expression-tag parser re-reads it.
        let is_const = self.match_str("const") && kw_terminated_at(5);
        let is_let = self.match_str("let") && kw_terminated_at(3);
        let is_maybe_type = self.match_str("type") && kw_terminated_at(4);
        if !is_let && !is_const && !is_maybe_type {
            return Ok(None);
        }
        let kind = if is_const { "const" } else { "let" };
        let kw_len = if is_const {
            5
        } else if is_let {
            3
        } else {
            4
        };

        // Find the matching `}` for the tag. `find_matching_bracket` correctly
        // skips `}` inside strings, regexes, division operators, and comments,
        // and bails to `None` on an unterminated tag (e.g. `{let x = a /`),
        // where the previous hand-rolled brace walk would silently succeed.
        let body_end = match find_matching_bracket(self.source, start + 1, '{') {
            Some(p) => p,
            None => {
                // Unterminated declaration tag: upstream rethrows the parse
                // error in both strict and loose mode, surfacing as
                // `unexpected_eof` at the end of the input (Svelte 5.56.1
                // #18350).
                return Err(crate::error::ParseError::svelte(
                    "unexpected_eof",
                    "Unexpected end of input",
                    (self.source.len(), self.source.len()),
                ));
            }
        };

        // Disambiguate a `type` keyword (Svelte 5.56.1 #18330). A TS type-alias
        // declaration is `type <Identifier> … = …`: the first non-whitespace
        // byte after `type` starts an identifier AND there is a top-level
        // assignment `=` in the body. Otherwise `type` is an ordinary
        // identifier expression (`{type}`, `type instanceof X`, `type === y`,
        // …) and the tag is a regular expression tag. Upstream confirms this by
        // parsing the body; we use the same structural shape so identifier
        // expressions are not misclassified as malformed declarations.
        if is_maybe_type {
            let body_after = &self.source[decl_start + 4..body_end];
            let ident_next = body_after
                .trim_start()
                .as_bytes()
                .first()
                .copied()
                .is_some_and(|b| b.is_ascii_alphabetic() || b == b'_' || b == b'$');
            let has_assignment = find_top_level_assignment(body_after).is_some();
            if !(ident_next && has_assignment) {
                return Ok(None);
            }
            // Genuine `type Foo = …` alias → invalid declaration tag. The span
            // covers the whole declaration (trailing whitespace trimmed),
            // mirroring upstream's `{ start: declaration.start, end:
            // declaration.end }`.
            let decl_text_end = decl_start + self.source[decl_start..body_end].trim_end().len();
            return Err(crate::error::ParseError::svelte(
                "declaration_tag_invalid_type",
                "Declaration tags must be `let` or `const` declarations",
                (decl_start, decl_text_end),
            ));
        }

        // Committed to a `let` / `const` declaration tag.
        self.index = decl_start + kw_len;
        self.skip_whitespace();
        let body_start = self.index;
        let body_text = self.source[body_start..body_end].trim_end();
        self.index = body_end;
        self.advance(); // consume `}`

        // Multiple declarators (`{let a = $state(0), b = $derived(a * 2)}`,
        // Svelte 5.56.1 #18348): split the body on top-level commas and build
        // one declarator per segment so a later declarator can reference an
        // earlier one.
        let segments = split_top_level_commas(body_text);
        if segments.len() > 1 {
            let owned: Vec<(usize, String)> =
                segments.iter().map(|(o, s)| (*o, s.to_string())).collect();
            return Ok(Some(self.build_multi_declarator_tag(
                start, decl_start, body_start, body_end, kind, &owned,
            )));
        }

        // Single declarator: split at the first top-level assignment `=`.
        let first_equals = find_top_level_assignment(body_text);

        // The body must contain an assignment with an initializer — upstream
        // emits `declaration_tag_invalid_type` in strict mode, and falls back
        // to a placeholder VariableDeclaration with an empty-name identifier
        // in loose mode so editor tooling sees a continuous AST shape.
        let eq_idx = match first_equals {
            Some(i) => i,
            None => {
                if !self.options.loose {
                    // Upstream `read_declaration()` parses the tag body as a
                    // statement with acorn and rethrows the failure in strict
                    // mode (`if (!parser.loose) throw error;`), so a body
                    // that doesn't parse (e.g. `{let }`) surfaces as
                    // `js_parse_error` — only a parseable statement that
                    // isn't a `let`/`const` declaration becomes
                    // `declaration_tag_invalid_type`.
                    let stmt_text = self.source[decl_start..body_end].trim_end();
                    if let Some((msg, pos)) =
                        super::super::read::expression::check_js_statement_parse_error(
                            stmt_text, self.ts,
                        )
                    {
                        let abs = decl_start + pos.min(stmt_text.len());
                        return Err(crate::error::ParseError::svelte(
                            "js_parse_error",
                            msg,
                            (abs, abs),
                        ));
                    }
                    return Err(crate::error::ParseError::svelte(
                        "declaration_tag_invalid_type",
                        "Declaration tags can only contain `let` or `const` variable declarations",
                        (decl_start, body_end),
                    ));
                }
                // Loose mode: synthesize an empty-name declarator located at
                // the end of the body so the surrounding AST keeps its
                // shape. Mirrors upstream's `loose` fallback in
                // `read_declaration`.
                let empty_pos = body_end as u32;
                let mut declarator = serde_json::Map::new();
                declarator.insert(
                    "type".to_string(),
                    serde_json::Value::String("VariableDeclarator".to_string()),
                );
                let id = serde_json::json!({
                    "type": "Identifier",
                    "name": "",
                    "start": empty_pos,
                    "end": empty_pos,
                });
                declarator.insert("id".to_string(), id);
                declarator.insert("init".to_string(), serde_json::Value::Null);
                declarator.insert(
                    "start".to_string(),
                    serde_json::Value::Number(empty_pos.into()),
                );
                declarator.insert(
                    "end".to_string(),
                    serde_json::Value::Number(empty_pos.into()),
                );
                let mut declaration = serde_json::Map::new();
                declaration.insert(
                    "type".to_string(),
                    serde_json::Value::String("VariableDeclaration".to_string()),
                );
                declaration.insert(
                    "kind".to_string(),
                    serde_json::Value::String(kind.to_string()),
                );
                declaration.insert(
                    "declarations".to_string(),
                    serde_json::Value::Array(vec![serde_json::Value::Object(declarator)]),
                );
                declaration.insert(
                    "start".to_string(),
                    serde_json::Value::Number((decl_start as u32).into()),
                );
                declaration.insert(
                    "end".to_string(),
                    serde_json::Value::Number(empty_pos.into()),
                );
                let declaration_expr =
                    Expression::from_json(serde_json::Value::Object(declaration));
                return Ok(Some(TemplateNode::DeclarationTag(Box::new(
                    DeclarationTag {
                        start: start as u32,
                        end: self.index as u32,
                        declaration: declaration_expr,
                        metadata: Default::default(),
                    },
                ))));
            }
        };

        let pattern_str = body_text[..eq_idx].trim();
        let init_str = body_text[eq_idx + 1..].trim();

        // In loose mode, an empty RHS (`{const x = }`) collapses both sides
        // into a single empty-name declarator at the `}` position — mirrors
        // upstream's `read_declaration` loose fallback. The pattern's name
        // is discarded too, matching the upstream snapshot that puts an
        // empty Identifier at `body_end`.
        if self.options.loose && init_str.is_empty() {
            let empty_pos = body_end as u32;
            let id = serde_json::json!({
                "type": "Identifier",
                "name": "",
                "start": empty_pos,
                "end": empty_pos,
            });
            let mut declarator = serde_json::Map::new();
            declarator.insert(
                "type".to_string(),
                serde_json::Value::String("VariableDeclarator".to_string()),
            );
            declarator.insert("id".to_string(), id);
            declarator.insert("init".to_string(), serde_json::Value::Null);
            declarator.insert(
                "start".to_string(),
                serde_json::Value::Number(empty_pos.into()),
            );
            declarator.insert(
                "end".to_string(),
                serde_json::Value::Number(empty_pos.into()),
            );
            let mut declaration = serde_json::Map::new();
            declaration.insert(
                "type".to_string(),
                serde_json::Value::String("VariableDeclaration".to_string()),
            );
            declaration.insert(
                "kind".to_string(),
                serde_json::Value::String(kind.to_string()),
            );
            declaration.insert(
                "declarations".to_string(),
                serde_json::Value::Array(vec![serde_json::Value::Object(declarator)]),
            );
            declaration.insert(
                "start".to_string(),
                serde_json::Value::Number((decl_start as u32).into()),
            );
            declaration.insert(
                "end".to_string(),
                serde_json::Value::Number(empty_pos.into()),
            );
            return Ok(Some(TemplateNode::DeclarationTag(Box::new(
                DeclarationTag {
                    start: start as u32,
                    end: self.index as u32,
                    declaration: Expression::from_json(serde_json::Value::Object(declaration)),
                    metadata: Default::default(),
                },
            ))));
        }

        // Strip a TS type annotation (`x: number`, `{x, y}: Point`).
        let pattern_clean = strip_type_annotation(pattern_str);

        let pattern_expr = if pattern_clean.starts_with('{') || pattern_clean.starts_with('[') {
            super::super::read::expression::parse_destructuring_pattern(
                &self.arena,
                &pattern_clean,
                body_start,
                self.expression_line_offsets(),
            )
            .unwrap_or_else(|| self.parse_js_expression(&pattern_clean, body_start))
        } else {
            self.parse_js_expression(&pattern_clean, body_start)
        };

        let init_offset = body_start
            + eq_idx
            + 1
            + (body_text[eq_idx + 1..].len() - body_text[eq_idx + 1..].trim_start().len());
        // In loose mode an initializer that is not a complete expression
        // (e.g. `a /`) cannot be parsed. Upstream always parses the declaration
        // statement with acorn (non-loose); only the *fallback* is loose. So
        // validate the init the same way (`loose = false`) and, on failure,
        // synthesize a single empty-name declarator at the closing brace
        // (Svelte 5.56.1 #18353/#18330) instead of emitting a half-parsed loose
        // identifier.
        let init_expr = if self.options.loose {
            match super::super::expression::parse_expression(
                &self.arena,
                init_str,
                init_offset,
                self.expression_line_offsets(),
                self.source,
                false,
                false,
                '{',
                self.ts,
            ) {
                Ok(expr) => expr,
                Err(_) => {
                    return Ok(Some(build_empty_loose_declaration(
                        start, self.index, decl_start, body_end, kind,
                    )));
                }
            }
        } else {
            self.parse_js_expression(init_str, init_offset)
        };

        let declaration = build_kind_variable_declaration(
            &self.arena,
            &pattern_expr,
            &init_expr,
            decl_start,
            body_end,
            kind,
        );

        Ok(Some(TemplateNode::DeclarationTag(Box::new(
            DeclarationTag {
                start: start as u32,
                end: self.index as u32,
                declaration,
                metadata: Default::default(),
            },
        ))))
    }

    /// Build a `DeclarationTag` whose declaration has multiple declarators
    /// (`{let a = $state(0), b = $derived(a * 2)}`). The body has already been
    /// split into top-level-comma segments; each segment is `pattern = init`
    /// (or a bare `pattern`). Mirrors upstream parsing the whole
    /// `VariableDeclaration` statement at once (Svelte 5.56.1 #18348).
    fn build_multi_declarator_tag(
        &mut self,
        start: usize,
        decl_start: usize,
        body_start: usize,
        body_end: usize,
        kind: &str,
        segments: &[(usize, String)],
    ) -> TemplateNode {
        use serde_json::{Map, Value};

        let mut declarators: Vec<Value> = Vec::with_capacity(segments.len());
        for (seg_off, raw) in segments {
            let lead = raw.len() - raw.trim_start().len();
            let seg = raw.trim();
            if seg.is_empty() {
                continue;
            }
            let seg_off = body_start + seg_off + lead;

            let (pattern_str, init_str, init_off) = match find_top_level_assignment(seg) {
                Some(eq) => {
                    let init_lead = seg[eq + 1..].len() - seg[eq + 1..].trim_start().len();
                    (
                        seg[..eq].trim().to_string(),
                        seg[eq + 1..].trim().to_string(),
                        seg_off + eq + 1 + init_lead,
                    )
                }
                None => (seg.to_string(), String::new(), seg_off + seg.len()),
            };

            let pattern_clean = strip_type_annotation(&pattern_str);
            let pattern_expr = if pattern_clean.starts_with('{') || pattern_clean.starts_with('[') {
                super::super::read::expression::parse_destructuring_pattern(
                    &self.arena,
                    &pattern_clean,
                    seg_off,
                    self.expression_line_offsets(),
                )
                .unwrap_or_else(|| self.parse_js_expression(&pattern_clean, seg_off))
            } else {
                self.parse_js_expression(&pattern_clean, seg_off)
            };

            let init_value: Value = if init_str.is_empty() {
                Value::Null
            } else {
                let init_expr = self.parse_js_expression(&init_str, init_off);
                crate::ast::arena::with_serialize_arena(&self.arena, || init_expr.as_json()).clone()
            };
            let pattern_value: Value =
                crate::ast::arena::with_serialize_arena(&self.arena, || pattern_expr.as_json())
                    .clone();

            let id_start = pattern_value
                .get("start")
                .and_then(|v| v.as_u64())
                .unwrap_or(seg_off as u64);
            let decl_end = init_value
                .get("end")
                .and_then(|v| v.as_u64())
                .unwrap_or(id_start + seg.len() as u64);

            let mut declarator = Map::new();
            declarator.insert(
                "type".to_string(),
                Value::String("VariableDeclarator".to_string()),
            );
            declarator.insert("id".to_string(), pattern_value);
            declarator.insert("init".to_string(), init_value);
            declarator.insert("start".to_string(), Value::Number((id_start as i64).into()));
            declarator.insert("end".to_string(), Value::Number((decl_end as i64).into()));
            declarators.push(Value::Object(declarator));
        }

        let mut declaration = Map::new();
        declaration.insert(
            "type".to_string(),
            Value::String("VariableDeclaration".to_string()),
        );
        declaration.insert("kind".to_string(), Value::String(kind.to_string()));
        declaration.insert("declarations".to_string(), Value::Array(declarators));
        declaration.insert(
            "start".to_string(),
            Value::Number((decl_start as i64).into()),
        );
        declaration.insert("end".to_string(), Value::Number((body_end as i64).into()));

        TemplateNode::DeclarationTag(Box::new(DeclarationTag {
            start: start as u32,
            end: self.index as u32,
            declaration: Expression::from_json(Value::Object(declaration)),
            metadata: Default::default(),
        }))
    }

    /// Parse a mustache expression.
    pub fn parse_mustache(&mut self) -> ParseResult<Option<TemplateNode>> {
        let start = self.index;
        self.advance(); // consume '{'

        self.skip_whitespace();

        // Check for block tags (use byte comparison for single-char checks)
        if self.match_byte(b'#') {
            return self.parse_block_open(start);
        }

        if self.match_byte(b':') {
            // Block continuation - should not happen at top level
            return Err(crate::error::ParseError::svelte(
                "block_invalid_continuation_placement",
                "{:...} block is invalid at this position (did you forget to close the preceding element or block?)",
                (start, start),
            ));
        }

        if self.match_byte(b'/') && !self.match_str("/*") && !self.match_str("//") {
            // Block close (but not JS comment) - should not happen at top level
            return Ok(None);
        }

        if self.match_byte(b'@') {
            return self.parse_special_tag(start);
        }

        // Declaration tag: `{let x = expr}` or `{const x = expr}` (Svelte 5.56.0 #18282).
        // The opener is a `let` / `const` keyword followed by whitespace; if neither
        // matches we fall through to the regular expression tag.
        if let Some(node) = self.try_parse_declaration_tag(start)? {
            return Ok(Some(node));
        }

        // Regular expression tag
        let expr_start = self.index;

        // Use find_matching_bracket to properly handle strings, comments, and regex
        // inside the expression (the naive depth counter breaks on e.g. {'{'}).
        // find_matching_bracket already has an optimized fast path for simple expressions.
        let end = find_matching_bracket(self.source, expr_start, '{').unwrap_or(self.source.len());
        self.index = end;

        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        // Parse the expression - propagate JS parse errors when not in loose mode
        // (corresponds to Svelte's read_expression call which throws on invalid JS)
        let expression = self.parse_js_expression_strict(expr_content.trim(), expr_start)?;

        Ok(Some(TemplateNode::ExpressionTag(Box::new(ExpressionTag {
            start: start as u32,
            end: self.index as u32,
            expression,
            metadata: Default::default(),
        }))))
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
                // Unknown block, skip to closing brace using memchr
                if let Some(pos) = memchr::memchr(b'}', &self.bytes[self.index..]) {
                    self.index += pos + 1;
                } else {
                    self.index = self.bytes.len();
                }
                Ok(None)
            }
        }
    }

    /// Consume the matching `{/keyword}` close tag for the current block.
    ///
    /// Mirrors upstream `close()` in `state/tag.js`: the block keyword and the
    /// trailing `}` are required (a mismatched keyword such as `{#if}` closed by
    /// `{/each}` is a hard `expected_token` error in strict mode), while loose
    /// mode tolerates a mismatch for best-effort recovery. Precondition:
    /// `parse_fragment` has stopped on a `{/...}` close marker, so the parser is
    /// positioned at the `{`.
    ///
    /// Returns `Ok(true)` when the matching close tag was consumed. Returns
    /// `Ok(false)` when no matching close was consumed: at EOF (no close marker
    /// present) or, in loose mode, when a `{/other}` marker does not match this
    /// block — in which case the marker is left intact for an outer block to
    /// consume (best-effort recovery).
    fn expect_block_close(&mut self, keyword: &str) -> ParseResult<bool> {
        // No close marker present (e.g. EOF): nothing to consume. Whitespace
        // between `{` and `/` is allowed (upstream `allow_whitespace()`).
        let Some(slash_pos) = self.match_block_close_marker() else {
            return Ok(false);
        };
        let checkpoint = self.index;
        self.index = slash_pos + 1; // consume '{' + whitespace + '/'

        // Require the exact block keyword. `eat(keyword, true, false)` errors in
        // strict mode on a mismatch and returns false (without erroring) in
        // loose mode.
        if !self.eat_required_strict(keyword)? {
            // Loose mode only (strict mode errored above): the close marker
            // belongs to an outer block. Backtrack so it is left intact.
            self.index = checkpoint;
            return Ok(false);
        }

        self.skip_whitespace();
        // Require the closing `}` (in both strict and loose mode, matching
        // upstream `parser.eat('}', true)`).
        self.eat("}", true, true)?;
        Ok(true)
    }

    /// Parse {#if} block.
    pub fn parse_if_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.skip_whitespace();

        // Read the test expression using find_matching_bracket to handle
        // strings, comments, and regex inside the expression (e.g., /^\d{4}/)
        let expr_start = self.index;
        let end = find_matching_bracket(self.source, expr_start, '{').unwrap_or(self.source.len());
        self.index = end;
        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        let test = self.parse_head_expression(expr_content.trim(), expr_start, false, '}')?;

        // Push block to stack
        self.stack.push(StackEntry::IfBlock {
            start: start as u32,
        });

        // Parse consequent
        let consequent = self.parse_fragment()?;

        // Check for {:else} or {:else if}
        let mut alternate = self.parse_if_alternate()?;

        // Handle closing {/if} if not already consumed
        let found_closing = self.expect_block_close("if")?;

        // Pop from stack only if we found the closing tag
        // If we reached EOF without closing, leave on stack for error reporting
        if found_closing && !self.stack.is_empty() {
            self.stack.pop();
        }

        // Update end positions of all elseif blocks recursively
        if found_closing && let Some(alt_fragment) = &mut alternate {
            Self::update_if_block_ends(alt_fragment, self.index as u32);
        }

        Ok(Some(TemplateNode::IfBlock(Box::new(IfBlock {
            start: start as u32,
            end: self.index as u32,
            elseif: false,
            test,
            consequent,
            alternate,
            metadata: Default::default(),
        }))))
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
        // Whitespace between `{` and `:` is allowed (upstream `allow_whitespace()`).
        let Some(colon_pos) = self.match_block_continuation_marker() else {
            return Ok(None);
        };

        let else_block_start = self.index;
        self.index = colon_pos + 1; // consume '{' + whitespace + ':'
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
            let end = find_matching_bracket(self.source, alt_expr_start, '{')
                .unwrap_or(self.source.len());
            self.index = end;
            let alt_expr_content = &self.source[alt_expr_start..self.index];
            self.advance(); // consume '}'

            let alt_test =
                self.parse_head_expression(alt_expr_content.trim(), alt_expr_start, false, '}')?;
            let alt_consequent = self.parse_fragment()?;

            // Recursively check for another else/else-if
            let alt_alternate = self.parse_if_alternate()?;

            // Don't consume {/if} here - let parse_if_block handle it

            Ok(Some(Fragment {
                node_type: FragmentType::Fragment,
                nodes: vec![TemplateNode::IfBlock(Box::new(IfBlock {
                    start: else_block_start as u32,
                    end: self.index as u32,
                    elseif: true,
                    test: alt_test,
                    consequent: alt_consequent,
                    alternate: alt_alternate,
                    metadata: Default::default(),
                }))],
                ..Default::default()
            }))
        } else {
            // {:else}
            self.skip_whitespace(); // Handle {:else } with space before }
            // Upstream: `parser.eat('}', true)` — anything other than `}`
            // after `{:else` (e.g. `{:else +++if cond}`) is an
            // `expected_token` error, in loose mode too.
            self.eat("}", true, true)?;
            let alt_fragment = self.parse_fragment()?;

            // Don't consume {/if} here - let parse_if_block handle it

            Ok(Some(alt_fragment))
        }
    }

    /// Skip a string or template literal whose opening quote byte (`'`, `"`, or
    /// `` ` ``) is at `self.index`. Advances `self.index` past the closing quote.
    /// Handles backslash escapes and, for template literals, balanced `${ … }`
    /// interpolations so their braces aren't miscounted by header scanners.
    fn skip_header_string(&mut self, quote: u8) {
        self.index += 1; // consume the opening quote
        while self.index < self.bytes.len() {
            let c = self.bytes[self.index];
            if c == b'\\' {
                self.index += 2;
                continue;
            }
            if quote == b'`' && c == b'$' && self.bytes.get(self.index + 1) == Some(&b'{') {
                self.index += 2;
                let mut brace_depth = 1u32;
                while self.index < self.bytes.len() && brace_depth > 0 {
                    match self.bytes[self.index] {
                        b'{' => brace_depth += 1,
                        b'}' => brace_depth -= 1,
                        _ => {}
                    }
                    self.index += 1;
                }
                continue;
            }
            self.index += 1;
            if c == quote {
                break;
            }
        }
    }

    /// Parse {#each} block.
    /// Syntax: {#each expression as context}...{:else}...{/each}
    /// Or: {#each expression as context, index}...{/each}
    /// Or: {#each expression as context (key)}...{/each}
    /// Whether `self.index` (positioned on a whitespace byte) begins a
    /// `WS* as WS` run — the `as` alias separator of an `{#each … as …}` header.
    /// Tolerates arbitrary whitespace (incl. newlines) on both sides so a
    /// newline-split header parses like a single-spaced one.
    fn looks_like_as_separator(&self) -> bool {
        let mut j = self.index;
        while j < self.bytes.len() && self.bytes[j].is_ascii_whitespace() {
            j += 1;
        }
        self.bytes.get(j) == Some(&b'a')
            && self.bytes.get(j + 1) == Some(&b's')
            && self
                .bytes
                .get(j + 2)
                .is_some_and(|c| c.is_ascii_whitespace())
    }

    pub fn parse_each_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.skip_whitespace();

        // Parse the iterable expression (up to " as " or closing "}")
        let expr_start = self.index;

        // Scan the whole header recording every top-level ` as `. The alias
        // separator is the LAST one — upstream Svelte parses the iterable
        // greedily (acorn consumes TypeScript assertions like `as const` /
        // `as MyType` as TSAsExpression nodes), then unwraps any trailing
        // TSAsExpression. The byte-level equivalent is "the right-most ` as `
        // wins", since any earlier ` as ` is part of a cast inside the
        // iterable. Without this, `{#each items as const as item}` splits at
        // the first ` as ` and the codegen emits `let const as item = …`.
        let mut last_as: Option<usize> = None;
        let mut depth: i32 = 0;
        while self.index < self.bytes.len() {
            let b = self.bytes[self.index];

            // Skip string / template literals and comments so a ` as `, brace,
            // or bracket inside them isn't treated as structure (H-018). e.g.
            // `{#each " as ".split(x) as item}` must split at the second ` as `.
            match b {
                b'\'' | b'"' | b'`' => {
                    self.skip_header_string(b);
                    continue;
                }
                b'/' if self.bytes.get(self.index + 1) == Some(&b'/') => {
                    while self.index < self.bytes.len() && self.bytes[self.index] != b'\n' {
                        self.index += 1;
                    }
                    continue;
                }
                b'/' if self.bytes.get(self.index + 1) == Some(&b'*') => {
                    self.index += 2;
                    while self.index + 1 < self.bytes.len()
                        && !(self.bytes[self.index] == b'*' && self.bytes[self.index + 1] == b'/')
                    {
                        self.index += 1;
                    }
                    self.index = (self.index + 2).min(self.bytes.len());
                    continue;
                }
                _ => {}
            }

            // Track brace depth
            match b {
                b'{' | b'(' | b'[' => depth += 1,
                b')' | b']' => depth -= 1,
                b'}' => {
                    if depth == 0 {
                        // This is the closing brace of {#each}, not a nested brace
                        break;
                    }
                    depth -= 1;
                }
                // The alias separator is the `as` keyword bounded by whitespace.
                // Match it across *arbitrary* whitespace (including newlines), so
                // a newline-split header like `{#each\ncats\nas\n{ id }\n}` parses
                // the same as `{#each cats as { id }}`. We trigger on the first
                // whitespace byte of the run and skip the whole `WS* as` so it
                // is not re-scanned; the rightmost top-level `as` wins.
                _ if depth == 0 && b.is_ascii_whitespace() && self.looks_like_as_separator() => {
                    last_as = Some(self.index);
                    self.skip_whitespace();
                    self.index += 2; // consume `as`
                    continue;
                }
                _ => {}
            }

            if b < 0x80 {
                self.index += 1;
            } else {
                self.advance();
            }
        }

        // Rewind to the last ` as ` (or stay at the closing `}` if there was none).
        let found_as = last_as.is_some();
        if let Some(pos) = last_as {
            self.index = pos;
        }

        let expr_end = self.index;
        let expr_content = &self.source[expr_start..expr_end].trim();
        // Use disallow_loose = true to prevent patterns like `as { y = z }` from being parsed as expressions
        // (corresponds to Svelte's read_expression(parser, undefined, true))
        let expression = self.parse_head_expression(expr_content, expr_start, true, '}')?;

        if !found_as {
            // No "as" found - check for ", identifier" index syntax
            // For "{#each expr, index}", expr_content contains "expr, index"

            let (final_expr, index_name, key) = {
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
                            // A key without an `as` clause (`{#each items, i (key)}`)
                            // is invalid, but svelte raises `each_key_without_as`
                            // in the 2-analyze EachBlock visitor, NOT the parser
                            // (svelte2tsx, which skips analyze, still compiles it).
                            // Parse the key so analyze can flag it and svelte2tsx
                            // can emit it; the parser no longer errors here.
                            let key_opt = if idx_has_key {
                                let raw_slice = &self.source[expr_start..expr_end];
                                let lead_ws = raw_slice.len() - raw_slice.trim_start().len();
                                let base = expr_start + lead_ws;
                                if let Some(rel_paren) = s[comma_pos + 1..].find('(') {
                                    let key_start = base + comma_pos + 1 + rel_paren + 1;
                                    let key_end =
                                        find_matching_bracket(self.source, key_start, '(')
                                            .unwrap_or(self.bytes.len());
                                    let key_raw = &self.source[key_start..key_end];
                                    let key_lead = key_raw.len() - key_raw.trim_start().len();
                                    let key_content = key_raw.trim().to_string();
                                    Some(self.parse_head_expression(
                                        &key_content,
                                        key_start + key_lead,
                                        false,
                                        ')',
                                    )?)
                                } else {
                                    None
                                }
                            } else {
                                None
                            };
                            (
                                self.parse_js_expression(expr_part, expr_start),
                                Some(CompactString::from(idx_name)),
                                key_opt,
                            )
                        } else {
                            (expression, None, None)
                        }
                    } else {
                        (expression, None, None)
                    }
                } else {
                    (expression, None, None)
                }
            };

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
            if let Some(colon_pos) = self.match_block_continuation_marker() {
                let continuation_start = self.index;
                self.index = colon_pos + 1;
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

            // Handle {/each}. A mismatched close (e.g. `{/if}`) errors in strict
            // mode; in loose mode it is left for an outer block.
            self.expect_block_close("each")?;

            // Pop from stack (matched close, or EOF / loose-mode recovery).
            if !self.stack.is_empty() {
                self.stack.pop();
            }

            return Ok(Some(TemplateNode::EachBlock(Box::new(EachBlock {
                start: start as u32,
                end: self.index as u32,
                expression: final_expr,
                context: None, // No context when no "as" clause
                index: index_name,
                key,
                body,
                fallback,
                metadata: Default::default(),
            }))));
        }

        // Consume the `as` keyword and the whitespace around it. `self.index`
        // is at the start of the whitespace run preceding `as` (see
        // `looks_like_as_separator`), which may be arbitrary whitespace
        // (newline-split headers), so we can't assume a fixed-width ` as `.
        self.skip_whitespace();
        self.advance_by(2); // `as`
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
            // Find the matching ')' with JS-lexical awareness so a `)` inside a
            // string / comment / regex in the key expression (e.g.
            // `{#each items as item (item.name + ")")}`) doesn't close it early.
            self.index =
                find_matching_bracket(self.source, key_start, '(').unwrap_or(self.bytes.len());
            let key_content = self.source[key_start..self.index].trim();
            // Use opening_token = '(' for key expressions (corresponds to Svelte's read_expression(parser, '('))
            key = Some(self.parse_head_expression(key_content, key_start, false, ')')?);
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
        if let Some(colon_pos) = self.match_block_continuation_marker() {
            let continuation_start = self.index;
            self.index = colon_pos + 1;
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

        // Handle closing {/each}. A mismatched close (e.g. `{/if}`) errors in
        // strict mode; in loose mode it is left for an outer block.
        self.expect_block_close("each")?;

        // Pop from stack (matched close, or EOF / loose-mode recovery).
        if !self.stack.is_empty() {
            self.stack.pop();
        }

        Ok(Some(TemplateNode::EachBlock(Box::new(EachBlock {
            start: start as u32,
            end: self.index as u32,
            expression,
            context: Some(context),
            body,
            fallback,
            index,
            key,
            metadata: Default::default(),
        }))))
    }

    /// Parse a binding pattern (for each block context).
    pub fn parse_binding_pattern(
        &self,
        content: &str,
        offset: usize,
    ) -> Result<Expression, crate::error::ParseError> {
        super::super::expression::parse_binding_pattern(
            &self.arena,
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

        // Find the end of the expression part, tracking nesting of parentheses,
        // brackets, braces, and strings/template literals so nested `}` and the
        // words "then"/"catch" inside the expression (e.g. object literals, function
        // calls, identifiers like `then`) don't prematurely terminate the scan.
        let mut paren_depth: i32 = 0;
        let mut bracket_depth: i32 = 0;
        let mut brace_depth: i32 = 0;
        #[derive(PartialEq)]
        enum StrMode {
            None,
            Single,
            Double,
            Back,
        }
        let mut str_mode = StrMode::None;
        while !self.is_eof() {
            let c = self.current_char();
            // Handle strings and template literals
            match str_mode {
                StrMode::Single => {
                    if c == '\\' {
                        self.advance();
                        if !self.is_eof() {
                            self.advance();
                        }
                        continue;
                    }
                    if c == '\'' {
                        str_mode = StrMode::None;
                    }
                    self.advance();
                    continue;
                }
                StrMode::Double => {
                    if c == '\\' {
                        self.advance();
                        if !self.is_eof() {
                            self.advance();
                        }
                        continue;
                    }
                    if c == '"' {
                        str_mode = StrMode::None;
                    }
                    self.advance();
                    continue;
                }
                StrMode::Back => {
                    if c == '\\' {
                        self.advance();
                        if !self.is_eof() {
                            self.advance();
                        }
                        continue;
                    }
                    if c == '`' {
                        str_mode = StrMode::None;
                    }
                    self.advance();
                    continue;
                }
                StrMode::None => {}
            }
            if c == '\'' {
                str_mode = StrMode::Single;
                self.advance();
                continue;
            }
            if c == '"' {
                str_mode = StrMode::Double;
                self.advance();
                continue;
            }
            if c == '`' {
                str_mode = StrMode::Back;
                self.advance();
                continue;
            }
            if c == '(' {
                paren_depth += 1;
                self.advance();
                continue;
            }
            if c == ')' {
                paren_depth -= 1;
                self.advance();
                continue;
            }
            if c == '[' {
                bracket_depth += 1;
                self.advance();
                continue;
            }
            if c == ']' {
                bracket_depth -= 1;
                self.advance();
                continue;
            }
            if c == '{' {
                brace_depth += 1;
                self.advance();
                continue;
            }
            if c == '}' {
                if brace_depth == 0 && paren_depth == 0 && bracket_depth == 0 {
                    break;
                }
                brace_depth -= 1;
                self.advance();
                continue;
            }
            // Only honor `then`/`catch` at the top level of the expression
            if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 {
                // Require preceding character to be a word-boundary (whitespace or start)
                let preceded_by_ws = if self.index == expr_start {
                    true
                } else {
                    let prev = self.source.as_bytes()[self.index - 1] as char;
                    prev.is_whitespace() || prev == ')' || prev == ']'
                };
                if preceded_by_ws && self.match_str("then") {
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
                if preceded_by_ws && self.match_str("catch") {
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
            &self.arena,
            trimmed_content.trim(),
            adjusted_start,
            adjusted_end,
            self.expression_line_offsets(),
            self.source,
            self.options.loose,
            false,
            '{',
            self.ts,
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
        while let Some(colon_pos) = self.match_block_continuation_marker() {
            self.index = colon_pos + 1;
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

        // Handle closing {/await}. A mismatched close (e.g. `{#await}` closed by
        // `{/if}`) errors in strict mode; in loose mode it is left for an outer
        // block.
        self.expect_block_close("await")?;

        // Pop the stack (matched close, or EOF / loose-mode recovery).
        if !self.stack.is_empty() {
            self.stack.pop();
        }

        Ok(Some(TemplateNode::AwaitBlock(Box::new(AwaitBlock {
            start: start as u32,
            end: self.index as u32,
            expression,
            value,
            error,
            pending: pending_fragment,
            then: then_fragment,
            catch: catch_fragment,
            metadata: Default::default(),
        }))))
    }

    /// Parse {#key} block.
    pub fn parse_key_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.skip_whitespace();

        // Read the key expression using find_matching_bracket to handle
        // strings, comments, and regex inside the expression
        let expr_start = self.index;
        let end = find_matching_bracket(self.source, expr_start, '{').unwrap_or(self.source.len());
        self.index = end;
        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        let expression = self.parse_head_expression(expr_content.trim(), expr_start, false, '}')?;

        // Push block to stack
        self.stack.push(StackEntry::KeyBlock {
            start: start as u32,
        });

        // Parse body
        let fragment = self.parse_fragment()?;

        // Handle closing {/key}. A mismatched close (e.g. `{/if}`) errors in
        // strict mode; in loose mode it is left for an outer block.
        self.expect_block_close("key")?;

        // Pop from stack (matched close, or EOF / loose-mode recovery).
        if !self.stack.is_empty() {
            self.stack.pop();
        }

        Ok(Some(TemplateNode::KeyBlock(Box::new(KeyBlock {
            start: start as u32,
            end: self.index as u32,
            expression,
            fragment,
            metadata: Default::default(),
        }))))
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
            // Look for ... at top level (not inside nested parens/brackets).
            // svelte raises this in the 2-analyze SnippetBlock visitor, NOT the
            // parser — so svelte2tsx (parse-only) still COMPILES a snippet with
            // a rest param. rsvelte keeps the parse-time check for the compiler
            // (the compiler-errors fixture needs its position), but skips it in
            // svelte2tsx mode (`script_ts`, set only by `parse_script_ts`).
            if !self.script_ts {
                let trimmed = params_content.trim();
                let mut depth = 0;
                for (byte_offset, c) in trimmed.char_indices() {
                    if c == '(' || c == '[' || c == '{' {
                        depth += 1;
                    } else if c == ')' || c == ']' || c == '}' {
                        depth -= 1;
                    } else if depth == 0 && c == '.' && trimmed[byte_offset..].starts_with("...") {
                        // Found rest parameter
                        let rest_start = params_start + byte_offset;
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
                // Upstream parses `${params} => {}` with `parse_expression_at`
                // in the file's `parser.ts` mode (1-parse/state/tag.js), so
                // TS annotations without `lang="ts"` raise `js_parse_error`.
                // Probe (JS-only) before the lenient TS-stripping param
                // parser below. Only probe when:
                // - the file is NOT TypeScript: in TS mode acorn-typescript
                //   is more lenient than OXC (it accepts `c?: number = 5`,
                //   which OXC rejects), so an OXC probe would reject params
                //   upstream compiles — keep the lenient path there;
                // - the closing `)` was actually found (`depth == 0`): an
                //   unclosed param list (`{#snippet a(hi{/snippet}`) surfaces
                //   as `expected_token` downstream, matching upstream's
                //   `parser.eat(')', true)`.
                if !self.options.loose
                    && !self.ts
                    && depth == 0
                    && let Some((msg, pos)) =
                        super::super::read::expression::check_params_parse_error(
                            params_content,
                            false,
                        )
                {
                    let abs = params_start + pos;
                    return Err(crate::error::ParseError::svelte(
                        "js_parse_error",
                        msg,
                        (abs, abs),
                    ));
                }

                parameters = super::super::expression::parse_typescript_params(
                    &self.arena,
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

        // Handle closing {/snippet}. A mismatched close (e.g. `{/if}`) errors in
        // strict mode; in loose mode it is left for an outer block.
        self.expect_block_close("snippet")?;

        // Pop from stack (matched close, or EOF / loose-mode recovery).
        if !self.stack.is_empty() {
            self.stack.pop();
        }

        Ok(Some(TemplateNode::SnippetBlock(Box::new(SnippetBlock {
            start: start as u32,
            end: self.index as u32,
            expression,
            type_params,
            parameters,
            body,
            metadata: Default::default(),
        }))))
    }

    /// Parse special tag ({@html}, {@debug}, etc.)
    pub fn parse_special_tag(&mut self, start: usize) -> ParseResult<Option<TemplateNode>> {
        self.advance(); // consume '@'

        // Try to match known keywords using first-byte dispatch
        let _keyword_start = self.index;
        let keyword: CompactString = if self.index < self.bytes.len() {
            let matched_kw = match self.bytes[self.index] {
                b'h' if self.match_str("html") => Some(("html", 4)),
                b'r' if self.match_str("render") => Some(("render", 6)),
                b'c' if self.match_str("const") => Some(("const", 5)),
                b'd' if self.match_str("debug") => Some(("debug", 5)),
                b'a' if self.match_str("attach") => Some(("attach", 6)),
                _ => None,
            };
            if let Some((kw, len)) = matched_kw {
                // Check if followed by identifier chars
                let pos_after_kw = self.index + len;
                if pos_after_kw < self.bytes.len() {
                    let next_byte = self.bytes[pos_after_kw];
                    if next_byte.is_ascii_alphanumeric() || next_byte == b'_' {
                        return Err(crate::error::ParseError::svelte(
                            "expected_whitespace",
                            "Expected whitespace",
                            (pos_after_kw, pos_after_kw),
                        ));
                    }
                }
                self.index += len;
                CompactString::from(kw)
            } else {
                self.read_identifier()
            }
        } else {
            self.read_identifier()
        };

        self.skip_whitespace();

        match keyword.as_str() {
            "html" => {
                // Locate the closing `}` with the JS-lexical-aware scanner so
                // braces inside strings, template literals, comments, and regex
                // literals (e.g. `{@html x /* } */ + y}`) do not terminate the
                // tag early. Mirrors upstream `read_expression`, which parses
                // with acorn and skips over the same lexical contexts.
                let expr_start = self.index;
                let end = find_matching_bracket(self.source, expr_start, '{')
                    .unwrap_or(self.source.len());
                self.index = end;
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'

                let expression =
                    self.parse_head_expression(expr_content.trim(), expr_start, false, '}')?;

                Ok(Some(TemplateNode::HtmlTag(Box::new(HtmlTag {
                    start: start as u32,
                    end: self.index as u32,
                    expression,
                    metadata: Default::default(),
                }))))
            }
            "render" => {
                // {@render snippet(...)}
                // Locate the closing `}` with the JS-lexical-aware scanner so
                // braces inside strings, comments, and regex literals (e.g.
                // `{@render foo(/}/g)}`) do not terminate the tag early. Mirrors
                // upstream `read_expression`.
                let expr_start = self.index;
                let end = find_matching_bracket(self.source, expr_start, '{')
                    .unwrap_or(self.source.len());
                self.index = end;
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'

                // `render_tag_invalid_call_expression` (snippet via `.apply`/
                // `.bind`/`.call`) is an ANALYSIS-phase error in official Svelte
                // (`2-analyze/visitors/RenderTag.js`), NOT a parse error — the
                // parser accepts the call expression. Our `2_analyze/visitors/
                // render_tag.rs` performs the precise AST-based check, so we must
                // not reject it here at parse time (svelte2tsx, which only parses,
                // would otherwise diverge from official by erroring).
                let trimmed = expr_content.trim();
                let expression = self.parse_js_expression(trimmed, expr_start);

                Ok(Some(TemplateNode::RenderTag(Box::new(RenderTag {
                    start: start as u32,
                    end: self.index as u32,
                    expression,
                    metadata: crate::ast::template::RenderTagMetadata::default(),
                }))))
            }
            "const" => {
                // {@const foo = bar}
                // Locate the closing `}` with the JS-lexical-aware scanner so
                // braces inside strings, comments, and regex literals (e.g.
                // `{@const re = /}/}`) do not terminate the tag early, and
                // destructuring patterns like `{ handler } = obj` nest correctly.
                self.skip_whitespace();
                let expr_start = self.index;
                let end = find_matching_bracket(self.source, expr_start, '{')
                    .unwrap_or(self.source.len());
                self.index = end;
                let expr_content = &self.source[expr_start..self.index];
                let expr_end = self.index;
                self.advance(); // consume '}'

                // Locate the top-level assignment `=` that splits the pattern
                // from the initializer. Scan bytes (not a `Vec<char>`):
                // `first_equals` is later used as a byte index to slice
                // `trimmed`, so a character index would corrupt a `{@const}`
                // whose LHS has a multi-byte character (H-131). Every token
                // examined here is ASCII. A `=` can only appear before the
                // assignment operator inside a bracketed destructuring default
                // (depth > 0) or a string, both of which are skipped here, so
                // the first depth-0 `=` is the assignment.
                let trimmed = expr_content.trim();
                let mut depth = 0i32;
                let mut in_string = false;
                let mut string_char = 0u8;
                let bytes = trimmed.as_bytes();
                let mut first_equals: Option<usize> = None;

                let mut i = 0;
                while i < bytes.len() {
                    let c = bytes[i];
                    if in_string {
                        if c == string_char && (i == 0 || bytes[i - 1] != b'\\') {
                            in_string = false;
                        }
                        i += 1;
                        continue;
                    }

                    if c == b'"' || c == b'\'' || c == b'`' {
                        in_string = true;
                        string_char = c;
                        i += 1;
                        continue;
                    }

                    if c == b'(' || c == b'[' || c == b'{' {
                        depth += 1;
                    } else if c == b')' || c == b']' || c == b'}' {
                        depth -= 1;
                    } else if c == b'=' && depth == 0 {
                        // Check it's not ==, ===, !=, !==, <=, >=, =>
                        let next = bytes.get(i + 1).copied().unwrap_or(0);
                        let prev = if i > 0 { bytes[i - 1] } else { 0 };
                        if next != b'='
                            && next != b'>'
                            && prev != b'!'
                            && prev != b'<'
                            && prev != b'>'
                        {
                            first_equals = Some(i);
                            break;
                        }
                    }
                    i += 1;
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
                                &self.arena,
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

                    // Reject a sequence-expression initializer, mirroring
                    // upstream: `{@const a = (b, c)}` is allowed but
                    // `{@const a = b, c = d}` is not. A parenthesized sequence
                    // is permitted, detected (as upstream does) by a `(`
                    // between the `=` and the parsed initializer's start.
                    // Deriving this from the parsed `init` — rather than a
                    // top-level comma byte-scan — keeps commas inside strings,
                    // comments, and regex literals (e.g. `/a,b/`) from being
                    // mistaken for a sequence separator.
                    if init_expr.node_type() == Some("SequenceExpression") {
                        let paren_before = init_expr
                            .start()
                            .map(|s| self.source[init_offset..s as usize].contains('('))
                            .unwrap_or(false);
                        if !paren_before {
                            let err_start =
                                init_expr.start().map(|s| s as usize).unwrap_or(init_offset);
                            let err_end = init_expr.end().map(|e| e as usize).unwrap_or(expr_end);
                            return Err(crate::error::ParseError::svelte(
                                "const_tag_invalid_expression",
                                "{@const ...} must consist of a single variable declaration",
                                (err_start, err_end),
                            ));
                        }
                    }

                    // Position just past the initializer text (including any
                    // wrapping parens) but before trailing whitespace — mirrors
                    // upstream's `declarator_end = parser.index` captured right
                    // after `read_expression` (Svelte 5.56.4), rather than the
                    // bare `init.end` (which stops inside the parens).
                    let declarator_end = init_offset + init_str.trim_end().len();
                    // The VariableDeclaration starts at the `const` keyword
                    // (`start + 2`, i.e. past the leading `{@`), matching
                    // upstream's `start: start + 2 // start at const, not at @const`.
                    let decl_keyword_start = start + 2;
                    build_const_variable_declaration(
                        &self.arena,
                        &pattern_expr,
                        &init_expr,
                        decl_keyword_start,
                        expr_end,
                        declarator_end,
                    )
                } else {
                    // No `=` found – fall back to parsing as a single expression
                    self.parse_js_expression(trimmed, expr_start)
                };

                Ok(Some(TemplateNode::ConstTag(Box::new(ConstTag {
                    start: start as u32,
                    end: self.index as u32,
                    declaration,
                    metadata: Default::default(),
                }))))
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
                    // Read expression content up to the closing brace with the
                    // JS-lexical-aware scanner so braces inside strings,
                    // comments, and regex literals (e.g. `{@debug obj["}"]}`)
                    // do not terminate the tag early. Mirrors upstream
                    // `read_expression`.
                    let expr_start = self.index;
                    let end = find_matching_bracket(self.source, expr_start, '{')
                        .unwrap_or(self.source.len());
                    self.index = end;
                    let expr_content = self.source[expr_start..end].trim();

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
                                    .map(|e| Expression::from_json(e.clone()))
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

                Ok(Some(TemplateNode::DebugTag(Box::new(DebugTag {
                    start: start as u32,
                    end: self.index as u32,
                    identifiers,
                    metadata: Default::default(),
                }))))
            }
            // "attach" (not fully implemented yet) and any unknown special tag
            // are both skipped verbatim up to the closing brace.
            _ => {
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
        // NOTE: This method does NOT create Lazy expressions because it's used
        // by @const tag which calls as_json() during parse. Only
        // parse_js_expression_strict() creates Lazy expressions.

        // Adjust offset for leading whitespace that gets trimmed
        let leading_ws = content.len() - content.trim_start().len();
        let trimmed = content.trim();
        super::super::expression::parse_expression(
            &self.arena,
            trimmed,
            offset + leading_ws,
            self.expression_line_offsets(),
            self.source,
            self.options.loose,
            disallow_loose,
            opening_token,
            self.ts,
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
        // In deferred mode, create a Lazy expression
        if self.options.defer_script_parse {
            let trimmed = content.trim();
            if !trimmed.is_empty() {
                let leading_ws = content.len() - content.trim_start().len();
                return Ok(Expression::Lazy {
                    start: (offset + leading_ws) as u32,
                    end: (offset + leading_ws + trimmed.len()) as u32,
                    ts: self.ts,
                });
            }
        }

        // Adjust offset for leading whitespace that gets trimmed
        let leading_ws = content.len() - content.trim_start().len();
        let trimmed = content.trim();
        let trimmed_offset = offset + leading_ws;
        super::super::expression::parse_expression(
            &self.arena,
            trimmed,
            trimmed_offset,
            self.expression_line_offsets(),
            self.source,
            self.options.loose,
            false,
            '{',
            self.ts,
        )
        .map_err(|(msg, _)| {
            // Recover the precise failure position from OXC's labeled span,
            // mirroring upstream Svelte's `js_parse_error(err.pos, ...)` —
            // a *point* error at the byte where acorn stopped consuming
            // input. svelte2tsx's `expected.error.json` fixtures rely on
            // this character-accurate location.
            let abs_pos = super::super::read::expression::check_js_parse_error_with_pos(trimmed)
                .map_or(trimmed_offset, |(_, content_pos)| {
                    trimmed_offset + content_pos
                });
            crate::error::ParseError::svelte("js_parse_error", msg, (abs_pos, abs_pos))
        })
    }

    /// Parse a JavaScript expression and return as Expression.
    ///
    /// Convenience wrapper that calls `parse_js_expression_internal` with `disallow_loose = false`
    /// and `opening_token = '{'`.
    pub fn parse_js_expression(&self, content: &str, offset: usize) -> Expression {
        self.parse_js_expression_internal(content, offset, false, '{')
    }

    /// Like `parse_js_expression_strict`, but always parses eagerly (never
    /// creates a `Lazy` expression). Used for attribute values, which may be
    /// inspected at parse time (e.g. `<svelte:options runes={false} />`), so
    /// they cannot be deferred — while still propagating `js_parse_error` for
    /// invalid expressions like upstream's `read_expression`.
    pub fn parse_js_expression_strict_eager(
        &self,
        content: &str,
        offset: usize,
    ) -> crate::error::ParseResult<Expression> {
        // Adjust offset for leading whitespace that gets trimmed
        let leading_ws = content.len() - content.trim_start().len();
        let trimmed = content.trim();
        let trimmed_offset = offset + leading_ws;
        super::super::expression::parse_expression(
            &self.arena,
            trimmed,
            trimmed_offset,
            self.expression_line_offsets(),
            self.source,
            self.options.loose,
            false,
            '{',
            self.ts,
        )
        .map_err(|(msg, _)| {
            // Recover the precise failure position from OXC's labeled span,
            // mirroring upstream Svelte's `js_parse_error(err.pos, ...)`.
            let abs_pos = super::super::read::expression::check_js_parse_error_with_pos(trimmed)
                .map_or(trimmed_offset, |(_, content_pos)| {
                    trimmed_offset + content_pos
                });
            crate::error::ParseError::svelte("js_parse_error", msg, (abs_pos, abs_pos))
        })
    }

    /// Parse a block / directive head expression that, in strict (non-loose)
    /// mode, must be a single complete JS expression terminated by `close_char`
    /// (`'}'` or `')'`). Mirrors upstream Svelte, which parses one expression
    /// with acorn and then `eat(close_char, true)`:
    ///
    /// - trailing tokens *after* a complete expression (`{#if a b c}`) surface
    ///   as `expected_token`,
    /// - an incomplete / invalid expression (`{#if a +}`) surfaces as
    ///   `js_parse_error`.
    ///
    /// In loose / editor mode this stays lenient (placeholder identifier),
    /// matching the previous swallowing behaviour of `parse_js_expression`.
    /// (issue #445, H-002)
    pub fn parse_head_expression(
        &self,
        content: &str,
        offset: usize,
        disallow_loose: bool,
        close_char: char,
    ) -> crate::error::ParseResult<Expression> {
        let leading_ws = content.len() - content.trim_start().len();
        let trimmed = content.trim();
        let trimmed_offset = offset + leading_ws;
        let opening_token = if close_char == ')' { '(' } else { '{' };

        match super::super::read::expression::parse_expression(
            &self.arena,
            trimmed,
            trimmed_offset,
            self.expression_line_offsets(),
            self.source,
            self.options.loose,
            disallow_loose,
            opening_token,
            self.ts,
        ) {
            Ok(expr) => Ok(expr),
            Err((msg, _)) => {
                // Loose / editor mode: stay lenient with a placeholder, matching
                // the previous `unwrap_or_else` swallow.
                if self.options.loose {
                    return Ok(super::super::read::expression::create_empty_identifier(
                        "",
                        trimmed_offset,
                        trimmed_offset + trimmed.len(),
                    ));
                }
                // Strict mode: classify the failure the way upstream does. A
                // complete leading expression followed by leftover input is an
                // `expected_token` (missing `close_char`); anything else is a
                // `js_parse_error` at the point acorn/OXC stopped.
                if let Some(pos) = super::super::read::expression::trailing_token_offset(trimmed) {
                    return Err(crate::error::ParseError::expected_token(
                        &close_char.to_string(),
                        trimmed_offset + pos,
                    ));
                }
                let abs_pos =
                    super::super::read::expression::check_js_parse_error_with_pos(trimmed)
                        .map_or(trimmed_offset + trimmed.len(), |(_, pos)| {
                            trimmed_offset + pos
                        });
                Err(crate::error::ParseError::svelte(
                    "js_parse_error",
                    msg,
                    (abs_pos, abs_pos),
                ))
            }
        }
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
/// Find the byte offset of the first top-level assignment `=` in a declaration
/// body, skipping `==` / `===` / `!=` / `<=` / `>=` / `=>` and any `=` inside
/// strings or `()` / `[]` / `{}` nesting. Returns `None` when there is none.
fn find_top_level_assignment(body: &str) -> Option<usize> {
    let bytes = body.as_bytes();
    let mut depth = 0i32;
    let mut in_string = false;
    let mut string_ch = 0u8;
    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];
        if in_string {
            if c == string_ch && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }
        match c {
            b'"' | b'\'' | b'`' => {
                in_string = true;
                string_ch = c;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 => {
                let next = bytes.get(i + 1).copied().unwrap_or(0);
                let prev = if i > 0 { bytes[i - 1] } else { 0 };
                if next != b'='
                    && next != b'>'
                    && prev != b'!'
                    && prev != b'<'
                    && prev != b'>'
                    && prev != b'='
                {
                    return Some(i);
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Split a declaration body into declarator segments on top-level commas,
/// ignoring commas inside strings or `()` / `[]` / `{}` nesting. Each entry is
/// `(byte offset of the segment within `body`, the raw segment text)`.
fn split_top_level_commas(body: &str) -> Vec<(usize, &str)> {
    let bytes = body.as_bytes();
    let mut segments = Vec::new();
    let mut depth = 0i32;
    let mut in_string = false;
    let mut string_ch = 0u8;
    let mut seg_start = 0usize;
    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];
        if in_string {
            if c == string_ch && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }
        match c {
            b'"' | b'\'' | b'`' => {
                in_string = true;
                string_ch = c;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b',' if depth == 0 => {
                segments.push((seg_start, &body[seg_start..i]));
                seg_start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    segments.push((seg_start, &body[seg_start..]));
    segments
}

/// Build a loose-mode `DeclarationTag` with a single empty-name declarator at
/// the closing brace (`init: null`). Used when a declaration tag has no
/// assignment, an empty RHS, or an un-parseable initializer — mirroring the
/// `loose` fallback in upstream `read_declaration`.
fn build_empty_loose_declaration(
    start: usize,
    tag_end: usize,
    decl_start: usize,
    body_end: usize,
    kind: &str,
) -> TemplateNode {
    use serde_json::{Value, json};
    let empty_pos = body_end as u32;
    let declaration = json!({
        "type": "VariableDeclaration",
        "kind": kind,
        "declarations": [{
            "type": "VariableDeclarator",
            "id": { "type": "Identifier", "name": "", "start": empty_pos, "end": empty_pos },
            "init": Value::Null,
            "start": empty_pos,
            "end": empty_pos,
        }],
        "start": decl_start as u32,
        "end": empty_pos,
    });
    TemplateNode::DeclarationTag(Box::new(DeclarationTag {
        start: start as u32,
        end: tag_end as u32,
        declaration: Expression::from_json(declaration),
        metadata: Default::default(),
    }))
}

/// Strip a TypeScript type annotation from a destructuring/binding pattern,
/// returning the pattern text up to (but not including) the top-level `:`.
/// Bracket depth (`{}` / `[]` / `()`) is tracked so a colon nested inside a
/// type (e.g. `{ a: string }` or `Record<string, number>`) is not mistaken
/// for the pattern's own annotation.
fn strip_type_annotation(pattern: &str) -> String {
    let mut depth = 0;

    for (i, c) in pattern.char_indices() {
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

/// Build a `VariableDeclaration` JSON node with a caller-supplied kind
/// (`let` / `const` / `var`) from a pattern expression and init expression.
/// Mirrors `build_const_variable_declaration` (which is locked to `const`)
/// and powers both `{@const}` and the `{let x = …}` / `{const x = …}`
/// declaration-tag emit paths. Produces the same JSON structure as the
/// official Svelte compiler:
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
fn build_kind_variable_declaration(
    arena: &crate::ast::arena::ParseArena,
    pattern: &Expression,
    init: &Expression,
    decl_start: usize,
    decl_end: usize,
    kind: &str,
) -> Expression {
    use serde_json::{Map, Value};

    let pattern_value = crate::ast::arena::with_serialize_arena(arena, || pattern.as_json());
    let init_value = crate::ast::arena::with_serialize_arena(arena, || init.as_json());

    let id_start = pattern_value
        .get("start")
        .and_then(|v| v.as_u64())
        .unwrap_or(decl_start as u64);
    let init_end = init_value
        .get("end")
        .and_then(|v| v.as_u64())
        .unwrap_or(decl_end as u64);

    let mut declarator = Map::new();
    declarator.insert(
        "type".to_string(),
        Value::String("VariableDeclarator".to_string()),
    );
    declarator.insert("id".to_string(), pattern_value.clone());
    declarator.insert("init".to_string(), init_value.clone());
    declarator.insert("start".to_string(), Value::Number((id_start as i64).into()));
    declarator.insert("end".to_string(), Value::Number((init_end as i64).into()));

    let mut declaration = Map::new();
    declaration.insert(
        "type".to_string(),
        Value::String("VariableDeclaration".to_string()),
    );
    declaration.insert("kind".to_string(), Value::String(kind.to_string()));
    declaration.insert(
        "declarations".to_string(),
        Value::Array(vec![Value::Object(declarator)]),
    );
    declaration.insert(
        "start".to_string(),
        Value::Number((decl_start as i64).into()),
    );
    declaration.insert("end".to_string(), Value::Number((decl_end as i64).into()));

    Expression::from_json(Value::Object(declaration))
}

fn build_const_variable_declaration(
    arena: &crate::ast::arena::ParseArena,
    pattern: &Expression,
    init: &Expression,
    decl_start: usize,
    decl_end: usize,
    declarator_end: usize,
) -> Expression {
    use serde_json::{Map, Value};

    // Use the parser's arena for serialization context
    let pattern_value = crate::ast::arena::with_serialize_arena(arena, || pattern.as_json());
    let init_value = crate::ast::arena::with_serialize_arena(arena, || init.as_json());

    // Get positions from the pattern and init for the declarator
    let id_start = pattern_value
        .get("start")
        .and_then(|v| v.as_u64())
        .unwrap_or(decl_start as u64);

    // Build VariableDeclarator
    let mut declarator = Map::new();
    declarator.insert(
        "type".to_string(),
        Value::String("VariableDeclarator".to_string()),
    );
    declarator.insert("id".to_string(), pattern_value.clone());
    declarator.insert("init".to_string(), init_value.clone());
    declarator.insert("start".to_string(), Value::Number((id_start as i64).into()));
    // `declarator_end` is the parser position just past the initializer text
    // (including any wrapping parens) but before trailing whitespace, mirroring
    // upstream's `declarator_end = parser.index` (Svelte 5.56.4) rather than the
    // bare `init.end` (which stops inside the parens).
    declarator.insert(
        "end".to_string(),
        Value::Number((declarator_end as i64).into()),
    );

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

    Expression::from_json(Value::Object(declaration))
}
