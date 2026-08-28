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

use crate::ast::js::{Expression, LazyKind};
use crate::ast::template::{
    AwaitBlock, ConstTag, DebugTag, DeclarationTag, EachBlock, ExpressionTag, Fragment,
    FragmentType, HtmlTag, IfBlock, KeyBlock, RenderTag, SnippetBlock, TemplateNode,
};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase1_parse::utils::find_matching_bracket;
use crate::compiler::phases::phase3_transform::shared::js_scan::slash_starts_regex_at;
use crate::compiler::utils::is_escaped;
use crate::error::ParseResult;

use super::super::parser::{Parser, StackEntry, is_js_whitespace};
use super::super::utils::TrimWs;

fn leftover_token_offset(content: &str, ts: bool) -> Option<usize> {
    super::super::read::expression::trailing_token_offset(content, ts).filter(|&off| {
        off > 0
            && content.get(..off).is_some_and(|prefix| {
                super::super::read::expression::check_js_parse_error_with_pos(prefix, ts).is_none()
            })
    })
}

/// A `{:…}` continuation clause.
///
/// Whether a *second* one is legal is decided per block type, and the two
/// directions are easy to drift apart: upstream's `next()`
/// (`1-parse/state/tag.js:527-635`) re-creates `block.alternate` for `{#if}` and
/// `block.fallback` for `{#each}` unconditionally — a repeat is **accepted** and
/// replaces the earlier branch — while `{#await}` guards both of its clauses
/// with `block_duplicate_clause` and **rejects** it. Two issues found the two
/// directions separately (#3284 accepted-but-rejected, #3349
/// rejected-but-accepted), so the decision lives here rather than at each site.
///
/// The `match` is the invariant: a new clause cannot be added without answering
/// the question for it.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum Clause {
    Else,
    // `expect` rather than `allow`: the `{#await}` clause loop reads these arms
    // as soon as its duplicate check lands, and an unfulfilled `expect` is a
    // compile error — so the placeholder cannot outlive its reason.
    Then,
    Catch,
}

impl Clause {
    /// The spelling upstream puts in `block_duplicate_clause`'s message.
    const fn tag(self) -> &'static str {
        match self {
            Self::Else => "{:else}",
            Self::Then => "{:then}",
            Self::Catch => "{:catch}",
        }
    }

    /// Whether a second occurrence of this clause in one block is an error.
    const fn duplicate_is_error(self) -> bool {
        match self {
            Self::Else => false,
            Self::Then | Self::Catch => true,
        }
    }

    /// Upstream positions every clause diagnostic at the `:`.
    fn duplicate_error(self, at: usize) -> crate::error::ParseError {
        crate::error::ParseError::svelte(
            "block_duplicate_clause",
            format!("{} cannot appear more than once within a block", self.tag()),
            (at, at),
        )
    }
}

impl<'a> Parser<'a> {
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
    ) -> ParseResult<Option<TemplateNode<'a>>> {
        // The `parse_mustache` caller has already consumed `{` and skipped
        // whitespace. Peek at the next bytes to detect `let ` / `const `;
        // require a trailing whitespace / line-ending byte so we don't
        // accidentally swallow `{letter}` or `{constant}` expressions.
        let decl_start = self.index;

        // Upstream keys this on `\b`, whose word class is `[A-Za-z0-9_]`. `$` is
        // outside it, so `{var$x}` reaches the unsupported-keyword throw before
        // anything is parsed even though `var$x` is a legal identifier — an
        // upstream defect (`upstream_issues/svelte-declaration-tag-dollar-identifier.md`)
        // that byte parity means reproducing rather than picking a side.
        let word_boundary_at = |off: usize| {
            self.bytes
                .get(self.index + off)
                .copied()
                .is_none_or(|b| !b.is_ascii_alphanumeric() && b != b'_')
        };
        // The other two regexes are CONFIRMED by parsing, and the parse reads
        // `let$x` as one identifier — so their boundary is the identifier class,
        // which is where the upstream defect above stops.
        let ident_boundary_at = |off: usize| {
            self.bytes
                .get(self.index + off)
                .copied()
                .is_none_or(|b| !b.is_ascii_alphanumeric() && !matches!(b, b'_' | b'$') && b < 0x80)
        };

        // `var` / `interface` / `enum` are reserved words that can never be a
        // valid declaration tag — error immediately with the keyword span
        // (mirrors upstream `regex_unsupported_declaration`).
        if (self.match_str("var") && word_boundary_at(3))
            || (self.match_str("interface") && word_boundary_at(9))
            || (self.match_str("enum") && word_boundary_at(4))
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
        let is_const = self.match_str("const") && ident_boundary_at(5);
        let is_let = self.match_str("let") && ident_boundary_at(3);
        let is_maybe_type = self.match_str("type") && ident_boundary_at(4);
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
                .trim_start_ws()
                .as_bytes()
                .first()
                .copied()
                .is_some_and(|b| b.is_ascii_alphabetic() || b == b'_' || b == b'$');
            let has_assignment = find_top_level_assignment(body_after).is_some();
            if !(ident_next && has_assignment) {
                return Ok(None);
            }
            // Upstream reaches its `declaration_tag_invalid_type` only through
            // the parse, so a type alias in a plain `<script>` is a JavaScript
            // parse error rather than a Svelte one — and a shape that parses as
            // JS is an `ExpressionStatement`, which upstream hands back to the
            // expression-tag reader.
            let stmt_text = self.source[decl_start..body_end].trim_end_ws();
            if let Some((msg, pos)) =
                super::super::read::expression::check_js_statement_parse_error(stmt_text, self.ts)
            {
                let abs = decl_start + pos.min(stmt_text.len());
                return Err(crate::error::ParseError::svelte(
                    "js_parse_error",
                    msg,
                    (abs, abs),
                ));
            }
            if !self.ts {
                return Ok(None);
            }
            // Genuine `type Foo = …` alias → invalid declaration tag. The span
            // covers the whole declaration (trailing whitespace trimmed),
            // mirroring upstream's `{ start: declaration.start, end:
            // declaration.end }`.
            let decl_text_end = decl_start + stmt_text.len();
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
        let body_text = self.source[body_start..body_end].trim_end_ws();
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
                // `let` permits a declarator without an initializer. The
                // multi-declarator builder already represents that as
                // `init: null`; let the single-declarator path use the same
                // representation once the complete statement has parsed.
                if kind == "let" && !body_text.is_empty() {
                    let stmt_text = self.source[decl_start..body_end].trim_end_ws();
                    if super::super::read::expression::check_js_statement_parse_error(
                        stmt_text, self.ts,
                    )
                    .is_none()
                    {
                        return Ok(Some(self.build_multi_declarator_tag(
                            start,
                            decl_start,
                            body_start,
                            body_end,
                            kind,
                            &[(0, body_text.to_string())],
                        )));
                    }
                }
                if !self.options.loose {
                    // Upstream `read_declaration()` parses the tag body as a
                    // statement with acorn and rethrows the failure in strict
                    // mode (`if (!parser.loose) throw error;`), so a body
                    // that doesn't parse (e.g. `{let }`) surfaces as
                    // `js_parse_error` — only a parseable statement that
                    // isn't a `let`/`const` declaration becomes
                    // `declaration_tag_invalid_type`.
                    let stmt_text = self.source[decl_start..body_end].trim_end_ws();
                    if let Some((msg, pos)) =
                        super::super::read::expression::check_js_statement_parse_error(
                            stmt_text, self.ts,
                        )
                    {
                        // `let` is not a reserved word in sloppy mode, so acorn
                        // rejects a bare `{let}` only for being a declaration it
                        // cannot finish, and reports that AT the keyword. `const`
                        // is reserved, consumed, and fails at the token after.
                        let abs = if kind == "let" && body_text.is_empty() {
                            decl_start
                        } else {
                            decl_start + pos.min(stmt_text.len())
                        };
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

        let pattern_str = body_text[..eq_idx].trim_ws();
        let init_str = body_text[eq_idx + 1..].trim_ws();

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
                self.ts,
            )
            .unwrap_or_else(|| self.parse_js_expression(&pattern_clean, body_start))
        } else {
            self.parse_js_expression(&pattern_clean, body_start)
        };

        let init_offset = body_start
            + eq_idx
            + 1
            + (body_text[eq_idx + 1..].len() - body_text[eq_idx + 1..].trim_start_ws().len());
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
            pattern_expr,
            init_expr,
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
    ) -> TemplateNode<'a> {
        use serde_json::{Map, Value};

        let mut declarators: Vec<Value> = Vec::with_capacity(segments.len());
        for (seg_off, raw) in segments {
            let lead = raw.len() - raw.trim_start_ws().len();
            let seg = raw.trim_ws();
            if seg.is_empty() {
                continue;
            }
            let seg_off = body_start + seg_off + lead;

            let (pattern_str, init_str, init_off) = match find_top_level_assignment(seg) {
                Some(eq) => {
                    let init_lead = seg[eq + 1..].len() - seg[eq + 1..].trim_start_ws().len();
                    (
                        seg[..eq].trim_ws().to_string(),
                        seg[eq + 1..].trim_ws().to_string(),
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
                    self.ts,
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
    pub fn parse_mustache(&mut self) -> ParseResult<Option<TemplateNode<'a>>> {
        let start = self.index;
        self.advance(); // consume '{'

        self.skip_whitespace();

        // Check for block tags (use byte comparison for single-char checks)
        if self.match_byte(b'#') {
            return self.parse_block_open(start);
        }

        if self.match_byte(b':') {
            // Block continuation - should not happen at top level. Upstream
            // `next()` reports at the `:` it just ate, not at the `{`.
            return Err(crate::error::ParseError::svelte(
                "block_invalid_continuation_placement",
                "{:...} block is invalid at this position (did you forget to close the preceding element or block?)",
                (self.index, self.index),
            ));
        }

        if self.match_byte(b'/')
            && !self.match_str("/*")
            && !self.match_str("//")
            && (!self.options.reparse_leading_slash_expression
                || self.block_close_shaped(self.index))
        {
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
        let end = self.find_mustache_close(expr_start)?;
        self.index = end;

        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        // Parse the expression - propagate JS parse errors when not in loose mode
        // (corresponds to Svelte's read_expression call which throws on invalid JS)
        let expression = self.parse_js_expression_strict(expr_content.trim_ws(), expr_start)?;

        Ok(Some(TemplateNode::ExpressionTag(Box::new(ExpressionTag {
            start: start as u32,
            end: self.index as u32,
            expression,
            metadata: Default::default(),
        }))))
    }

    /// Parse block open tag ({#if}, {#each}, etc.)
    pub fn parse_block_open(&mut self, start: usize) -> ParseResult<Option<TemplateNode<'a>>> {
        self.advance(); // consume '#'

        // Upstream dispatches with `parser.eat(...)`, a prefix match, so `{#ifx}`
        // is an `{#if}` missing its separator rather than an unknown block.
        if self.eat_optional("if") {
            return self.parse_if_block(start);
        }
        if self.eat_optional("each") {
            return self.parse_each_block(start);
        }
        if self.eat_optional("await") {
            return self.parse_await_block(start);
        }
        if self.eat_optional("key") {
            return self.parse_key_block(start);
        }
        if self.eat_optional("snippet") {
            return self.parse_snippet_block(start);
        }

        // Upstream reports the unknown type immediately, before looking for a
        // closing brace or allowing a later close tag to replace the diagnosis.
        Err(crate::error::ParseError::svelte(
            "expected_block_type",
            "Expected 'if', 'each', 'await', 'key' or 'snippet'",
            (self.index, self.index),
        ))
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
    pub fn parse_if_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode<'a>>> {
        self.require_whitespace()?;

        // Read the test expression using find_matching_bracket to handle
        // strings, comments, and regex inside the expression (e.g., /^\d{4}/)
        let expr_start = self.index;
        let end = self.find_mustache_close(expr_start)?;
        self.index = end;
        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        let test = self.parse_head_expression(expr_content.trim_ws(), expr_start, false, '}')?;

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
    pub fn parse_if_alternate(&mut self) -> ParseResult<Option<Fragment<'a>>> {
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
            self.require_whitespace()?;
            let alt_expr_start = self.index;
            let end = self.find_mustache_close(alt_expr_start)?;
            self.index = end;
            let alt_expr_content = &self.source[alt_expr_start..self.index];
            self.advance(); // consume '}'

            let alt_test =
                self.parse_head_expression(alt_expr_content.trim_ws(), alt_expr_start, false, '}')?;
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
            let mut alt_fragment = self.parse_fragment()?;

            while !Clause::Else.duplicate_is_error()
                && let Some(replacement) = self.parse_if_alternate()?
            {
                alt_fragment = replacement;
            }

            // Don't consume {/if} here - let parse_if_block handle it

            Ok(Some(alt_fragment))
        }
    }

    /// Skip a string or template literal whose opening quote byte (`'`, `"`, or
    /// `` ` ``) is at `self.index`. Advances `self.index` past the closing quote.
    /// Handles backslash escapes and, for template literals, balanced `${ … }`
    /// interpolations so their braces aren't miscounted by header scanners.
    /// Step over a regex literal from its opening `/`. A `/` inside a character
    /// class does not close it, which is the one rule a quote scan does not have.
    fn skip_header_regex(&mut self) {
        self.index += 1; // consume the opening `/`
        let mut in_class = false;
        while self.index < self.bytes.len() {
            match self.bytes[self.index] {
                b'\\' => {
                    self.index += 2;
                    continue;
                }
                b'[' => in_class = true,
                b']' => in_class = false,
                b'/' if !in_class => {
                    self.index += 1;
                    // the flags
                    while self.index < self.bytes.len()
                        && self.bytes[self.index].is_ascii_alphabetic()
                    {
                        self.index += 1;
                    }
                    return;
                }
                // A regex literal cannot span a line; an unterminated one is a
                // parse error the expression reader reports, not this scan.
                b'\n' => return,
                _ => {}
            }
            self.index += 1;
        }
    }

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
        let j = self.skip_js_whitespace_from(self.index);
        self.bytes.get(j) == Some(&b'a')
            && self.bytes.get(j + 1) == Some(&b's')
            && (self.is_js_whitespace_at(j + 2)
                || (!self.options.loose && self.bytes.get(j + 2) == Some(&b'}')))
    }

    fn identifier_end_at(&self, i: usize) -> usize {
        let Some(first) = self.source.get(i..).and_then(|s| s.chars().next()) else {
            return i;
        };
        if !(first.is_alphabetic() || first == '_' || first == '$') {
            return i;
        }
        let mut j = i + first.len_utf8();
        while let Some(c) = self.source.get(j..).and_then(|s| s.chars().next()) {
            if c.is_alphanumeric() || c == '_' || c == '$' {
                j += c.len_utf8();
            } else {
                break;
            }
        }
        j
    }

    fn binding_pattern_end(&self, i: usize) -> ParseResult<usize> {
        let ident_end = self.identifier_end_at(i);
        if ident_end > i {
            return Ok(ident_end);
        }
        match self.bytes.get(i) {
            Some(&open @ (b'{' | b'[')) => {
                Ok(find_matching_bracket(self.source, i + 1, open as char)
                    .map_or(self.bytes.len(), |close| close + 1))
            }
            _ => Err(crate::error::ParseError::svelte(
                "expected_pattern",
                "Expected identifier or destructure pattern",
                (i, i),
            )),
        }
    }

    pub fn parse_each_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode<'a>>> {
        self.require_whitespace()?;

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
        // The previous significant CODE byte. Only it separates `/re/` from a
        // division, and it must be recorded by the scan rather than read back
        // off the source, so bytes inside a literal never count as the token.
        let mut prev: Option<u8> = None;
        while self.index < self.bytes.len() {
            let b = self.bytes[self.index];

            // Skip string / template literals and comments so a ` as `, brace,
            // or bracket inside them isn't treated as structure (H-018). e.g.
            // `{#each " as ".split(x) as item}` must split at the second ` as `.
            match b {
                b'\'' | b'"' | b'`' => {
                    self.skip_header_string(b);
                    prev = Some(b);
                    continue;
                }
                b'/' if self.bytes.get(self.index + 1) != Some(&b'/')
                    && self.bytes.get(self.index + 1) != Some(&b'*')
                    && slash_starts_regex_at(self.bytes, self.index, prev) =>
                {
                    self.skip_header_regex();
                    prev = Some(b'/');
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
                _ if depth == 0
                    && self.is_js_whitespace_at(self.index)
                    && self.looks_like_as_separator() =>
                {
                    last_as = Some(self.index);
                    self.skip_whitespace();
                    self.index += 2; // consume `as`
                    continue;
                }
                _ => {}
            }

            if !b.is_ascii_whitespace() {
                prev = Some(b);
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
        let expr_content = &self.source[expr_start..expr_end].trim_ws();
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
                    let expr_part = s[..comma_pos].trim_ws();
                    let idx_part = s[comma_pos + 1..].trim_ws();

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
                            idx_part.split('(').next().unwrap_or("").trim_ws()
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
                                let lead_ws = raw_slice.len() - raw_slice.trim_start_ws().len();
                                let base = expr_start + lead_ws;
                                if let Some(rel_paren) = s[comma_pos + 1..].find('(') {
                                    let key_start = base + comma_pos + 1 + rel_paren + 1;
                                    let key_end =
                                        find_matching_bracket(self.source, key_start, '(')
                                            .unwrap_or(self.bytes.len());
                                    let key_raw = &self.source[key_start..key_end];
                                    let key_lead = key_raw.len() - key_raw.trim_start_ws().len();
                                    let key_content = key_raw.trim_ws().to_string();
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

            // Check for {:else}. Upstream replaces the fallback when another
            // {:else} follows it, so keep consuming continuation clauses.
            let mut fallback = None;
            while let Some(colon_pos) = self.match_block_continuation_marker() {
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
                        (colon_pos, colon_pos),
                    ));
                }
            }

            // Handle {/each}. A mismatched close (e.g. `{/if}`) errors in strict
            // mode; in loose mode it is left for an outer block.
            let found_closing = self.expect_block_close("each")?;

            // At EOF the entry stays on the stack for `block_unclosed`.
            if found_closing && !self.stack.is_empty() {
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
        self.require_whitespace()?;

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
        // Calculate actual start position after trimming leading whitespace
        let leading_ws = raw_content.len() - raw_content.trim_start_ws().len();
        let actual_context_start = context_start + leading_ws;
        let mut content_end = context_end;
        if !self.options.loose {
            let pattern_end = self.binding_pattern_end(actual_context_start)?;
            let after = self.skip_js_whitespace_from(pattern_end);
            if self.bytes.get(after) != Some(&b':') {
                if after < context_end {
                    return Err(crate::error::ParseError::expected_token("}", after));
                }
                content_end = pattern_end;
            }
        }
        let trimmed_content = self.source[actual_context_start..content_end].trim_ws();
        let context = self.parse_binding_pattern(trimmed_content, actual_context_start)?;

        // Check for index
        let mut index = None;
        if self.eat_optional(",") {
            self.skip_whitespace();
            let idx_start = self.index;
            let idx_end = self.identifier_end_at(idx_start);
            if idx_end == idx_start {
                if !self.options.loose {
                    return Err(crate::error::ParseError::svelte(
                        "expected_identifier",
                        "Expected an identifier",
                        (idx_start, idx_start),
                    ));
                }
                while !self.is_eof() && !matches!(self.current_char(), '}' | '(') {
                    self.advance();
                }
            } else {
                super::super::expression::validate_template_binding_pattern(
                    &self.source[idx_start..idx_end],
                    idx_start,
                    self.ts,
                )?;
                index = Some(CompactString::from(&self.source[idx_start..idx_end]));
                self.index = idx_end;
            }
            self.skip_whitespace();
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
            let key_content = self.source[key_start..self.index].trim_ws();
            // Use opening_token = '(' for key expressions (corresponds to Svelte's read_expression(parser, '('))
            key = Some(self.parse_head_expression(key_content, key_start, false, ')')?);
            self.eat_optional(")"); // consume closing paren
        }

        self.skip_whitespace();
        if !self.options.loose && !self.is_eof() && self.current_char() != '}' {
            return Err(crate::error::ParseError::svelte(
                "expected_token",
                "Expected token }",
                (self.index, self.index),
            ));
        }
        self.eat_optional("}"); // consume closing brace

        // Push block to stack
        self.stack.push(StackEntry::EachBlock {
            start: start as u32,
        });

        // Parse body
        let body = self.parse_fragment()?;

        // Like `{#if}`, a repeated `{:else}` replaces the earlier fallback.
        let mut fallback = None;
        while let Some(colon_pos) = self.match_block_continuation_marker() {
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
                    (colon_pos, colon_pos),
                ));
            }
        }

        // Handle closing {/each}. A mismatched close (e.g. `{/if}`) errors in
        // strict mode; in loose mode it is left for an outer block.
        let found_closing = self.expect_block_close("each")?;

        // At EOF the entry stays on the stack for `block_unclosed`.
        if found_closing && !self.stack.is_empty() {
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

    fn read_block_pattern(&mut self) -> ParseResult<Option<Expression<'a>>> {
        let start = self.index;
        if !self.options.loose {
            let pattern_end = self.binding_pattern_end(start)?;
            let after = self.skip_js_whitespace_from(pattern_end);
            self.index = pattern_end;
            if self.bytes.get(after) == Some(&b':') {
                self.skip_pattern_expression();
            } else if self.bytes.get(after) != Some(&b'}') {
                return Err(crate::error::ParseError::expected_token("}", after));
            }
        } else {
            self.skip_pattern_expression();
        }
        let content = self.source[start..self.index].trim_ws();
        if content.is_empty() {
            return Ok(None);
        }
        Ok(Some(self.parse_binding_pattern(content, start)?))
    }

    /// Parse a binding pattern (for each block context).
    pub fn parse_binding_pattern(
        &self,
        content: &str,
        offset: usize,
    ) -> Result<Expression<'a>, crate::error::ParseError> {
        super::super::expression::parse_binding_pattern(
            &self.arena,
            content,
            offset,
            self.expression_line_offsets(),
            self.ts,
        )
    }

    /// Parse {#await} block.
    pub fn parse_await_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode<'a>>> {
        self.require_whitespace()?;

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
        // The previous significant code byte — the only thing that separates a
        // regex literal from a division, and it has to be recorded by the scan
        // so bytes inside a literal or a comment never count as the token.
        let mut prev: Option<u8> = None;
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
                        prev = Some(b'\'');
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
                        prev = Some(b'"');
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
                        prev = Some(b'`');
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
            // This scan had no arm for either, so a `}` in a comment or a regex
            // literal ended the head.
            if c == '/' {
                if self.bytes.get(self.index + 1) == Some(&b'/') {
                    while !self.is_eof() && self.bytes[self.index] != b'\n' {
                        self.index += 1;
                    }
                    continue;
                }
                if self.bytes.get(self.index + 1) == Some(&b'*') {
                    self.index += 2;
                    while self.index + 1 < self.bytes.len()
                        && !(self.bytes[self.index] == b'*' && self.bytes[self.index + 1] == b'/')
                    {
                        self.index += 1;
                    }
                    self.index = (self.index + 2).min(self.bytes.len());
                    continue;
                }
                if slash_starts_regex_at(self.bytes, self.index, prev) {
                    self.skip_header_regex();
                    prev = Some(b'/');
                    continue;
                }
            }
            if c == '(' {
                paren_depth += 1;
                prev = Some(b'(');
                self.advance();
                continue;
            }
            if c == ')' {
                paren_depth -= 1;
                prev = Some(b')');
                self.advance();
                continue;
            }
            if c == '[' {
                bracket_depth += 1;
                prev = Some(b'[');
                self.advance();
                continue;
            }
            if c == ']' {
                bracket_depth -= 1;
                prev = Some(b']');
                self.advance();
                continue;
            }
            if c == '{' {
                brace_depth += 1;
                prev = Some(b'{');
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
                // A byte here decodes as Latin-1, so `U+3000`'s last byte read as a
                // control character and the keyword was swallowed into the expression.
                let preceded_by_ws = self.index == expr_start
                    || self.source[..self.index]
                        .chars()
                        .next_back()
                        .is_some_and(|c| is_js_whitespace(c) || c == ')' || c == ']');
                if preceded_by_ws && self.match_str("then") {
                    let after_idx = self.index + 4;
                    let is_word_boundary = self.source[after_idx.min(self.source.len())..]
                        .chars()
                        .next()
                        .is_none_or(|c| is_js_whitespace(c) || c == '}');
                    if is_word_boundary {
                        has_then = true;
                        break;
                    }
                }
                if preceded_by_ws && self.match_str("catch") {
                    let after_idx = self.index + 5;
                    let is_word_boundary = self.source[after_idx.min(self.source.len())..]
                        .chars()
                        .next()
                        .is_none_or(|c| is_js_whitespace(c) || c == '}');
                    if is_word_boundary {
                        has_catch = true;
                        break;
                    }
                }
            }
            if !c.is_whitespace() {
                prev = Some(self.bytes[self.index]);
            }
            self.advance();
        }
        let expr_end = self.index;
        let expr_content = &self.source[expr_start..expr_end];
        // Calculate the actual start position after trimming leading whitespace
        let trimmed_content = expr_content.trim_start_ws();
        let leading_ws = expr_content.len() - trimmed_content.len();
        let adjusted_start = expr_start + leading_ws;
        let adjusted_end = expr_end - (expr_content.len() - trimmed_content.trim_end_ws().len());
        if !self.options.loose
            && !has_then
            && !has_catch
            && trimmed_content.trim_end_ws().is_empty()
        {
            return Err(crate::error::ParseError::svelte(
                "js_parse_error",
                "Unexpected token",
                (adjusted_start, adjusted_start),
            ));
        }
        // For await blocks, we parse the expression with a known end position
        // to avoid find_matching_bracket finding the block's closing }
        let head = trimmed_content.trim_ws();
        let expression =
            if let Some(lazy) = self.defer_expression(head, adjusted_start, LazyKind::AwaitHead) {
                lazy
            } else {
                match super::super::expression::parse_expression_with_end(
                    &self.arena,
                    head,
                    adjusted_start,
                    adjusted_end,
                    self.expression_line_offsets(),
                    self.source,
                    self.options.loose,
                    false,
                    '{',
                    self.ts,
                ) {
                    Ok(expr) => expr,
                    Err((_, pos)) if self.options.loose => {
                        super::super::expression::create_identifier_with_character(
                            "",
                            pos,
                            adjusted_end,
                            self.expression_line_offsets(),
                        )
                    }
                    Err((msg, _)) => {
                        return Err(super::super::read::expression::close_token_or_parse_error(
                            msg,
                            head,
                            adjusted_start,
                            '}',
                            self.ts,
                        ));
                    }
                }
            };

        // Parse 'then' value if present
        if has_then {
            self.advance_by(4); // consume 'then'
            self.skip_whitespace();

            // The opening tag permits an omitted binding after `then`.
            if self.current_char() != '}' {
                value = self.read_block_pattern()?;
            }
        }

        // Parse 'catch' error if present
        if has_catch {
            self.advance_by(5); // consume 'catch'
            self.skip_whitespace();

            if self.current_char() != '}' {
                error = self.read_block_pattern()?;
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
                if !self.options.loose
                    && Clause::Then.duplicate_is_error()
                    && then_fragment.is_some()
                {
                    return Err(Clause::Then.duplicate_error(colon_pos));
                }
                // Upstream eats `}` before requiring the separator, so `{:then}`
                // stays legal while `{:thenv}` is not.
                if !self.match_str("}") {
                    self.require_whitespace()?;
                    value = self.read_block_pattern()?;
                }
                self.skip_whitespace();
                self.eat_optional("}");

                then_fragment = Some(self.parse_fragment()?);
            } else if self.eat_optional("catch") {
                if !self.options.loose
                    && Clause::Catch.duplicate_is_error()
                    && catch_fragment.is_some()
                {
                    return Err(Clause::Catch.duplicate_error(colon_pos));
                }
                if !self.match_str("}") {
                    self.require_whitespace()?;
                    error = self.read_block_pattern()?;
                }
                self.skip_whitespace();
                self.eat_optional("}");

                catch_fragment = Some(self.parse_fragment()?);
            } else {
                // Invalid clause (e.g., {:else} in await block) - report error
                return Err(crate::error::ParseError::svelte(
                    "expected_token",
                    "Expected token {:then ...} or {:catch ...}",
                    (colon_pos, colon_pos),
                ));
            }
        }

        // Handle closing {/await}. A mismatched close (e.g. `{#await}` closed by
        // `{/if}`) errors in strict mode; in loose mode it is left for an outer
        // block.
        let found_closing = self.expect_block_close("await")?;

        // At EOF the entry stays on the stack for `block_unclosed`.
        if found_closing && !self.stack.is_empty() {
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
    pub fn parse_key_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode<'a>>> {
        self.require_whitespace()?;

        // Read the key expression using find_matching_bracket to handle
        // strings, comments, and regex inside the expression
        let expr_start = self.index;
        let end = self.find_mustache_close(expr_start)?;
        self.index = end;
        let expr_content = &self.source[expr_start..self.index];
        self.advance(); // consume '}'

        let expression =
            self.parse_head_expression(expr_content.trim_ws(), expr_start, false, '}')?;

        // Push block to stack
        self.stack.push(StackEntry::KeyBlock {
            start: start as u32,
        });

        // Parse body
        let fragment = self.parse_fragment()?;

        // Handle closing {/key}. A mismatched close (e.g. `{/if}`) errors in
        // strict mode; in loose mode it is left for an outer block.
        let found_closing = self.expect_block_close("key")?;

        // At EOF the entry stays on the stack for `block_unclosed`.
        if found_closing && !self.stack.is_empty() {
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
    pub fn parse_snippet_block(&mut self, start: usize) -> ParseResult<Option<TemplateNode<'a>>> {
        self.require_whitespace()?;

        // Parse the snippet name (identifier)
        let name_start = self.index;
        let name = self.read_identifier();
        let name_end = self.index;

        if name.is_empty() && !self.options.loose {
            return Err(crate::error::ParseError::svelte(
                "expected_identifier",
                "Expected an identifier\nhttps://svelte.dev/e/expected_identifier",
                (self.index, self.index),
            ));
        }

        // Create expression for the snippet name (with character field in loc)
        let expression = super::super::expression::create_identifier_with_character(
            &name,
            name_start,
            name_end,
            self.expression_line_offsets(),
        );

        // Parse optional type parameters (between < and >). Upstream gates the
        // whole scan on TypeScript mode, so a `<` after the name is not a type
        // parameter list in a component without `lang="ts"`.
        let mut type_params = None;
        if self.ts && self.eat_optional("<") {
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
            // Upstream reads this with `match_bracket`, which reports
            // `unexpected_eof` at the end of the input for a list that never closes.
            if depth > 0 && !self.options.loose {
                return Err(crate::error::ParseError::svelte(
                    "unexpected_eof",
                    "Unexpected end of input",
                    (self.source.len(), self.source.len()),
                ));
            }
            let type_params_content = &self.source[type_params_start..self.index];
            if !type_params_content.trim_ws().is_empty() {
                type_params = Some(CompactString::from(type_params_content.trim_ws()));
            }
            self.eat_optional(">"); // consume closing >
        }

        // Parse parameters (inside parentheses). Upstream's `eat('(', true,
        // false)` requires the opener outside loose mode.
        self.skip_whitespace();
        let mut parameters = Vec::new();

        let opened = self.eat_optional("(");
        if !opened && !self.options.loose {
            return Err(crate::error::ParseError::svelte(
                "expected_token",
                "Expected token (",
                (self.index, self.index),
            ));
        }
        if opened {
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

            // Upstream immediately requires `)` after this scan. If the
            // parameter list runs into the end of the component, do not let
            // the later snippet-header `}` check replace that diagnostic.
            if depth > 0 && !self.options.loose {
                return Err(crate::error::ParseError::expected_token(
                    ")",
                    self.content_end,
                ));
            }

            let params_end = self.index;
            let params_content = &self.source[params_start..params_end];

            // Parse parameters with TypeScript type annotations
            if !params_content.trim_ws().is_empty() {
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
        let found_closing = self.expect_block_close("snippet")?;

        // At EOF the entry stays on the stack for `block_unclosed`.
        if found_closing && !self.stack.is_empty() {
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
    pub fn parse_special_tag(&mut self, start: usize) -> ParseResult<Option<TemplateNode<'a>>> {
        self.advance(); // consume '@'

        // Try to match known keywords using first-byte dispatch
        let keyword_start = self.index;
        let matched_kw = if self.index < self.bytes.len() {
            match self.bytes[self.index] {
                b'h' if self.match_str("html") => Some(("html", 4)),
                b'r' if self.match_str("render") => Some(("render", 6)),
                b'c' if self.match_str("const") => Some(("const", 5)),
                b'd' if self.match_str("debug") => Some(("debug", 5)),
                _ => None,
            }
        } else {
            None
        };
        // Upstream's `special()` knows four tags. `{@attach}` is an *attribute*
        // form, parsed by `parse_attach_attribute`, so reaching it here — or any
        // other name — is `expected_tag`, raised at the index after the `@`.
        let Some((kw, len)) = matched_kw else {
            return Err(crate::error::ParseError::svelte(
                "expected_tag",
                "Expected 'html', 'render', 'attach', 'const', or 'debug'\nhttps://svelte.dev/e/expected_tag",
                (keyword_start, keyword_start),
            ));
        };
        self.index += len;
        // `{@debug}` is upstream's one argument-less special tag, so it
        // is the only keyword that does not require a separator.
        if kw != "debug" {
            self.require_whitespace()?;
        }
        let keyword = CompactString::from(kw);

        self.skip_whitespace();

        match keyword.as_str() {
            "html" => {
                // Locate the closing `}` with the JS-lexical-aware scanner so
                // braces inside strings, template literals, comments, and regex
                // literals (e.g. `{@html x /* } */ + y}`) do not terminate the
                // tag early. Mirrors upstream `read_expression`, which parses
                // with acorn and skips over the same lexical contexts.
                let expr_start = self.index;
                let end = self.find_mustache_close(expr_start)?;
                self.index = end;
                let expr_content = &self.source[expr_start..self.index];
                self.advance(); // consume '}'

                let expression =
                    self.parse_head_expression(expr_content.trim_ws(), expr_start, false, '}')?;

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
                let end = self.find_mustache_close(expr_start)?;
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
                // Upstream reaches the call test with the leftover unread, so
                // the test runs on the maximal leading expression — and a JS
                // failure inside it is a `js_parse_error`, not the placeholder
                // the call test would otherwise report as a semantic error.
                // The retry runs only on the failing path, so a well-formed
                // render tag still costs one parse.
                let (expression, leftover) =
                    self.parse_head_expression_split(expr_content, expr_start, false, '}', false)?;

                // Upstream rejects anything but a call (optionally chained) here:
                // `new foo()` and `foo` are parse errors, `foo?.()` is not.
                if !is_render_tag_call_expression(&self.arena, &expression) {
                    let err_start = expression.start().map(|s| s as usize).unwrap_or(expr_start);
                    let err_end = expression.end().map(|e| e as usize).unwrap_or(end);
                    return Err(crate::error::ParseError::svelte(
                        "render_tag_invalid_expression",
                        "`{@render ...}` tags can only contain call expressions\nhttps://svelte.dev/e/render_tag_invalid_expression",
                        (err_start, err_end),
                    ));
                }

                if let Some(err) = leftover {
                    return Err(err);
                }

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
                let end = self.find_mustache_close(expr_start)?;
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
                let trimmed = expr_content.trim_ws();
                let mut depth = 0i32;
                let mut in_string = false;
                let mut string_char = 0u8;
                let bytes = trimmed.as_bytes();
                let mut first_equals: Option<usize> = None;

                let mut i = 0;
                while i < bytes.len() {
                    let c = bytes[i];
                    if in_string {
                        if c == string_char && !is_escaped(bytes, i) {
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
                    let pattern_str = trimmed[..eq_idx].trim_ws();
                    let init_str = trimmed[eq_idx + 1..].trim_ws();

                    // Strip TypeScript type annotation from pattern if present.
                    // For a simple identifier like `area: number`, strip `: number`.
                    // For destructuring like `{ x, y }: Point`, strip `: Point`.
                    let pattern_clean = strip_type_annotation(pattern_str);

                    super::super::read::expression::validate_template_binding_pattern(
                        &pattern_clean,
                        expr_start,
                        self.ts,
                    )?;

                    // Parse the pattern (LHS)
                    // For destructuring patterns ({...} or [...]), use the dedicated
                    // pattern parser which wraps in `let ... = null` to handle
                    // default values (e.g., {x = 1, y}) that are not valid as
                    // standalone expressions.
                    let pattern_expr =
                        if pattern_clean.starts_with('{') || pattern_clean.starts_with('[') {
                            match super::super::read::expression::parse_destructuring_pattern(
                                &self.arena,
                                &pattern_clean,
                                expr_start,
                                self.expression_line_offsets(),
                                self.ts,
                            ) {
                                Some(expr) => expr,
                                // A pattern that does not parse in the component's
                                // mode is upstream's `read_pattern` throwing, not a
                                // reason to fall back to expression parsing.
                                None => self.parse_js_expression_head_strict(
                                    &pattern_clean,
                                    expr_start,
                                    false,
                                )?,
                            }
                        } else {
                            // A plain-identifier pattern goes through upstream's
                            // `read_identifier`, not acorn, so its `loc` carries
                            // `character`; only destructuring falls through.
                            super::super::read::expression::with_read_identifier_loc(
                                self.parse_js_expression_eager_strict(&pattern_clean, expr_start)?,
                                self.expression_line_offsets(),
                            )
                        };

                    // Calculate the offset for the init expression in the
                    // original source.  `trimmed` starts at `expr_start` in
                    // the source, and `eq_idx` is the position of `=` within
                    // `trimmed`.
                    let init_offset = if init_str.is_empty() {
                        // `read_expression` starts after `allow_whitespace`, at
                        // the closing brace when the initializer is empty.
                        expr_end
                    } else {
                        expr_start
                            + eq_idx
                            + 1
                            + (trimmed[eq_idx + 1..].len()
                                - trimmed[eq_idx + 1..].trim_start_ws().len())
                    };
                    let init_expr = self.parse_const_initializer(init_str, init_offset)?;

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
                    let declarator_end = init_offset + init_str.trim_end_ws().len();
                    // The VariableDeclaration starts at the `const` keyword
                    // (`start + 2`, i.e. past the leading `{@`), matching
                    // upstream's `start: start + 2 // start at const, not at @const`.
                    let decl_keyword_start = start + 2;
                    build_const_variable_declaration(
                        &self.arena,
                        pattern_expr,
                        init_expr,
                        decl_keyword_start,
                        expr_end,
                        declarator_end,
                    )
                } else {
                    // Upstream reads a PATTERN and then `parser.eat('=', true)`,
                    // so a const tag with no initializer is a missing `=` rather
                    // than an expression to be parsed and dropped.
                    return Err(self.const_tag_missing_equals(expr_content, expr_start));
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

                let mut leftover = None;
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
                    let end = self.find_mustache_close(expr_start)?;
                    self.index = end;
                    let expr_content = &self.source[expr_start..end];

                    if expr_content.trim_ws().is_empty() {
                        Vec::new()
                    } else {
                        // Upstream hands the argument list to the same
                        // `read_expression` every other tag body goes through, so
                        // a malformed list (`s,`, `, s`, `...arr`) is that
                        // parser's `js_parse_error` rather than a dropped
                        // argument. The identifier check below then runs before
                        // the leftover `expected_token`, as it does upstream.
                        let (expression, trailing) = self.parse_head_expression_split(
                            expr_content,
                            expr_start,
                            false,
                            '}',
                            false,
                        )?;
                        leftover = trailing;

                        // A comma-separated list parses as a SequenceExpression;
                        // anything else is one argument.
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

                // Upstream rejects a non-identifier argument here, on the parser,
                // so it competes with every other parse error by source position.
                for identifier in &identifiers {
                    if identifier.node_type() != Some("Identifier") {
                        let at = identifier.as_node().start().map_or(start, |s| s as usize);
                        return Err(crate::error::ParseError::svelte(
                            "debug_tag_invalid_arguments",
                            "{@debug ...} arguments must be identifiers, not arbitrary expressions\nhttps://svelte.dev/e/debug_tag_invalid_arguments",
                            (at, at),
                        ));
                    }
                }

                if let Some(err) = leftover {
                    return Err(err);
                }

                self.advance(); // consume '}'

                Ok(Some(TemplateNode::DebugTag(Box::new(DebugTag {
                    start: start as u32,
                    end: self.index as u32,
                    identifiers,
                    metadata: Default::default(),
                }))))
            }
            // Unreachable: the keyword dispatch above rejects everything else.
            _ => Ok(None),
        }
    }

    /// The error upstream raises for a `{@const …}` body with no top-level `=`.
    ///
    /// `read_pattern` reads an identifier or a bracketed destructuring pattern
    /// and stops, so the missing `=` is reported where that pattern ends, past
    /// the whitespace `allow_whitespace` then skips — which is why `{@const c}`
    /// and `{@const c }` report a byte apart.
    fn const_tag_missing_equals(
        &self,
        expr_content: &str,
        expr_start: usize,
    ) -> crate::error::ParseError {
        let pattern_end = match expr_content.chars().next() {
            Some(open @ ('{' | '[')) => {
                match find_matching_bracket(self.source, expr_start + 1, open) {
                    Some(close) => close + 1 - expr_start,
                    None => expr_content.len(),
                }
            }
            Some(first) if first.is_alphabetic() || first == '_' || first == '$' => {
                let len = expr_content
                    .char_indices()
                    .find(|(_, c)| !(c.is_alphanumeric() || *c == '_' || *c == '$'))
                    .map_or(expr_content.len(), |(at, _)| at);
                let name = &expr_content[..len];
                if crate::compiler::phases::phase1_parse::utils::is_reserved(name) {
                    return crate::error::ParseError::svelte(
                        "unexpected_reserved_word",
                        format!(
                            "'{name}' is a reserved word in JavaScript and cannot be used here"
                        ),
                        (expr_start, expr_start),
                    );
                }
                len
            }
            _ => {
                return crate::error::ParseError::svelte(
                    "expected_pattern",
                    "Expected identifier or destructure pattern",
                    (expr_start, expr_start),
                );
            }
        };
        let rest = &expr_content[pattern_end..];
        let at = expr_start + pattern_end + (rest.len() - rest.trim_start_ws().len());
        crate::error::ParseError::expected_token("=", at)
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
    ) -> Expression<'a> {
        // NOTE: This method does NOT create Lazy expressions because it's used
        // by @const tag which calls as_json() during parse. Only
        // parse_js_expression_strict() creates Lazy expressions.

        // Adjust offset for leading whitespace that gets trimmed
        let leading_ws = content.len() - content.trim_start_ws().len();
        let trimmed = content.trim_ws();
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
    ) -> crate::error::ParseResult<Expression<'a>> {
        // In deferred mode, create a Lazy expression
        if self.should_defer_template_parse() {
            let trimmed = content.trim_ws();
            if !trimmed.is_empty() {
                let leading_ws = content.len() - content.trim_start_ws().len();
                return Ok(Expression::Lazy {
                    start: (offset + leading_ws) as u32,
                    end: (offset + leading_ws + trimmed.len()) as u32,
                    ts: self.ts,
                    kind: LazyKind::Mustache,
                });
            }
        }

        self.parse_js_expression_eager_strict(content, offset)
    }

    /// `parse_js_expression_strict` without the deferral. `{@const}` inspects
    /// its parsed declaration during the parse, so it cannot hold a `Lazy` — but
    /// it must still report a `js_parse_error` rather than swallow one into an
    /// empty identifier the way `parse_js_expression_internal` does.
    pub fn parse_js_expression_eager_strict(
        &self,
        content: &str,
        offset: usize,
    ) -> crate::error::ParseResult<Expression<'a>> {
        // Adjust offset for leading whitespace that gets trimmed
        let leading_ws = content.len() - content.trim_start_ws().len();
        let trimmed = content.trim_ws();
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
            super::super::read::expression::mustache_parse_error(
                msg,
                trimmed,
                trimmed_offset,
                self.ts,
            )
        })
    }

    /// Parse a JavaScript expression and return as Expression.
    ///
    /// Convenience wrapper that calls `parse_js_expression_internal` with `disallow_loose = false`
    /// and `opening_token = '{'`.
    pub fn parse_js_expression(&self, content: &str, offset: usize) -> Expression<'a> {
        self.parse_js_expression_internal(content, offset, false, '{')
    }

    /// Defer `trimmed` (already whitespace-trimmed, starting at
    /// `trimmed_offset`) into an `Expression::Lazy` when the parse options and
    /// the current context allow it. `resolve_lazy_expressions` reproduces the
    /// eager entry point's diagnostics from `kind`.
    ///
    /// Loose (editor) mode is excluded: it recovers from broken expressions
    /// with placeholder identifiers, which the resolver cannot reconstruct.
    /// Comment-bearing bodies are excluded too: the JS comment sink is drained
    /// into `root.comments` when the parse ends, long before the resolver runs.
    #[inline]
    fn defer_expression(
        &self,
        trimmed: &str,
        trimmed_offset: usize,
        kind: LazyKind,
    ) -> Option<Expression<'a>> {
        (self.should_defer_template_parse()
            && !self.options.loose
            && !self.in_svelte_options
            && !trimmed.is_empty()
            && !contains_js_comment(trimmed))
        .then(|| Expression::Lazy {
            start: trimmed_offset as u32,
            end: (trimmed_offset + trimmed.len()) as u32,
            ts: self.ts,
            kind,
        })
    }

    /// Parse an attribute-value expression, propagating `js_parse_error` for
    /// invalid expressions like upstream's `read_expression`. Deferred unless
    /// the value belongs to `<svelte:options>`, whose values `read_options`
    /// inspects during the parse itself (e.g. `runes={false}`).
    pub fn parse_js_expression_attribute(
        &self,
        content: &str,
        offset: usize,
    ) -> crate::error::ParseResult<Expression<'a>> {
        // Adjust offset for leading whitespace that gets trimmed
        let leading_ws = content.len() - content.trim_start_ws().len();
        let trimmed = content.trim_ws();
        let trimmed_offset = offset + leading_ws;
        if let Some(lazy) = self.defer_expression(trimmed, trimmed_offset, LazyKind::Attribute) {
            return Ok(lazy);
        }
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
            // `read_attribute_value` is `read_expression` + `eat('}', true)`, so
            // leftover input after a complete expression is a missing close
            // token, not a broken expression.
            if let Some(pos) =
                super::super::read::expression::trailing_token_offset(trimmed, self.ts)
            {
                return crate::error::ParseError::expected_token("}", trimmed_offset + pos);
            }
            // Recover the precise failure position from OXC's labeled span,
            // mirroring upstream Svelte's `js_parse_error(err.pos, ...)`.
            let abs_pos =
                super::super::read::expression::check_js_parse_error_with_pos(trimmed, self.ts)
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
    ) -> crate::error::ParseResult<Expression<'a>> {
        let (expression, leftover) =
            self.parse_head_expression_split(content, offset, disallow_loose, close_char, true)?;
        match leftover {
            Some(err) => Err(err),
            None => Ok(expression),
        }
    }

    pub fn parse_js_expression_head_strict(
        &self,
        content: &str,
        offset: usize,
        defer: bool,
    ) -> crate::error::ParseResult<Expression<'a>> {
        if defer {
            self.parse_head_expression(content, offset, false, '}')
        } else {
            let (expression, leftover) =
                self.parse_head_expression_eager(content, offset, false, '}')?;
            match leftover {
                Some(err) => Err(err),
                None => Ok(expression),
            }
        }
    }

    /// [`Self::parse_head_expression`], but with the leading expression and the
    /// `expected_token` its leftover input would raise handed back separately.
    ///
    /// Upstream runs `read_expression` first and `eat(close, true)` last, so a
    /// caller that validates the expression in between (`{@debug o.k n}` is
    /// `debug_tag_invalid_arguments`, not `expected_token`) needs both halves.
    /// `allow_defer` is false for such a caller, which has to inspect the node
    /// during the parse and so cannot take a `Lazy`.
    fn parse_head_expression_split(
        &self,
        content: &str,
        offset: usize,
        disallow_loose: bool,
        close_char: char,
        allow_defer: bool,
    ) -> crate::error::ParseResult<(Expression<'a>, Option<crate::error::ParseError>)> {
        let leading_ws = content.len() - content.trim_start_ws().len();
        let trimmed = content.trim_ws();
        let trimmed_offset = offset + leading_ws;

        let kind = if close_char == ')' {
            LazyKind::HeadParen
        } else {
            LazyKind::HeadBrace
        };
        if allow_defer && let Some(lazy) = self.defer_expression(trimmed, trimmed_offset, kind) {
            return Ok((lazy, None));
        }
        self.parse_head_expression_eager(content, offset, disallow_loose, close_char)
    }

    /// `parse_head_expression` without the deferral, for the slots that inspect
    /// the parsed node during the parse itself (`{@const}`, `{@debug}`).
    pub fn parse_head_expression_eager(
        &self,
        content: &str,
        offset: usize,
        disallow_loose: bool,
        close_char: char,
    ) -> crate::error::ParseResult<(Expression<'a>, Option<crate::error::ParseError>)> {
        let leading_ws = content.len() - content.trim_start_ws().len();
        let trimmed = content.trim_ws();
        let trimmed_offset = offset + leading_ws;
        let opening_token = if close_char == ')' { '(' } else { '{' };

        let parse = |source: &str, at: usize| {
            super::super::read::expression::parse_expression(
                &self.arena,
                source,
                at,
                self.expression_line_offsets(),
                self.source,
                self.options.loose,
                disallow_loose,
                opening_token,
                self.ts,
            )
        };

        match parse(trimmed, trimmed_offset) {
            Ok(expr) => Ok((expr, None)),
            Err((msg, _)) => {
                // Loose / editor mode: stay lenient with a placeholder, matching
                // the previous `unwrap_or_else` swallow.
                if self.options.loose {
                    return Ok((
                        super::super::read::expression::create_empty_identifier(
                            "",
                            trimmed_offset,
                            trimmed_offset + trimmed.len(),
                        ),
                        None,
                    ));
                }
                // Upstream validates the maximal leading expression before the
                // caller consumes the closing token. Preserve both results so
                // callers such as `{@debug}` and `{@render}` can apply their
                // node-shape diagnostics before reporting leftover input.
                if let Some(off) = leftover_token_offset(trimmed, self.ts)
                    && let Some(prefix) = trimmed.get(..off)
                    && let Ok(expression) = parse(prefix, trimmed_offset)
                {
                    let mut buf = [0u8; 4];
                    return Ok((
                        expression,
                        Some(crate::error::ParseError::expected_token(
                            close_char.encode_utf8(&mut buf),
                            trimmed_offset + off,
                        )),
                    ));
                }

                // Otherwise this is a malformed expression rather than a
                // complete expression followed by leftover input.
                Err(super::super::read::expression::close_token_or_parse_error(
                    msg,
                    trimmed,
                    trimmed_offset,
                    close_char,
                    self.ts,
                ))
            }
        }
    }

    /// `read_expression` for a `{@const …}` initializer.
    ///
    /// Eager on purpose: the sequence-expression rejection that follows reads
    /// the parsed node, and a deferred expression has no node to read — the
    /// rejection would go silently missing.
    fn parse_const_initializer(
        &self,
        trimmed: &str,
        trimmed_offset: usize,
    ) -> crate::error::ParseResult<Expression<'a>> {
        match super::super::read::expression::parse_expression(
            &self.arena,
            trimmed,
            trimmed_offset,
            self.expression_line_offsets(),
            self.source,
            self.options.loose,
            false,
            '{',
            self.ts,
        ) {
            Ok(expr) => Ok(expr),
            Err(_) if self.options.loose => {
                Ok(super::super::read::expression::create_empty_identifier(
                    "",
                    trimmed_offset,
                    trimmed_offset + trimmed.len(),
                ))
            }
            Err((msg, _)) => Err(super::super::read::expression::close_token_or_parse_error(
                msg,
                trimmed,
                trimmed_offset,
                '}',
                self.ts,
            )),
        }
    }
}

/// The diagnostic upstream produces for a broken `{#await …}` head starting at
/// `start`. Upstream reads one acorn expression from there, so it can consume
/// the `then` / `catch` keyword the template scan stops at (`{#await 1 + then v}`
/// parses as `1 + then`, leaving `v` where the `}` was expected) — the
/// classification therefore has to run against the whole head, not the slice.
pub(crate) fn await_head_parse_error(
    source: &str,
    start: usize,
    message: String,
    ts: bool,
) -> crate::error::ParseError {
    use super::super::read::expression::{check_js_parse_error_with_pos, trailing_close_offset};

    let end = find_matching_bracket(source, start, '{').unwrap_or(source.len());
    let head = source[start..end].trim_end_ws();
    if let Some(pos) = trailing_close_offset(head, ts) {
        return crate::error::ParseError::expected_token("}", start + pos);
    }
    let (message, pos) =
        check_js_parse_error_with_pos(head, ts).unwrap_or((message, head.trim_end_ws().len()));
    let at = start + pos;
    crate::error::ParseError::svelte("js_parse_error", message, (at, at))
}

/// Whether `s` contains a `//` or `/*` comment opener. A `/` inside a string or
/// regex can produce a false positive, which only costs an eager parse.
fn contains_js_comment(s: &str) -> bool {
    let bytes = s.as_bytes();
    let mut i = 0;
    while let Some(off) = memchr::memchr(b'/', &bytes[i..]) {
        i += off + 1;
        if matches!(bytes.get(i), Some(b'/') | Some(b'*')) {
            return true;
        }
    }
    false
}

/// Whether a `{@render ...}` expression is a call, optionally optional-chained,
/// mirroring upstream's `1-parse/state/tag.js` check.
pub(crate) fn is_render_tag_call_expression(
    arena: &crate::ast::arena::ParseArena,
    expr: &Expression,
) -> bool {
    let Some(node) = expr.try_as_node_ref() else {
        // A `Lazy` expression is not resolved yet; leave it to analysis.
        return true;
    };
    match node {
        JsNode::CallExpression { .. } => true,
        JsNode::ChainExpression { expression, .. } => {
            matches!(
                arena.get_js_node(*expression),
                JsNode::CallExpression { .. }
            )
        }
        // The empty-identifier sentinel means the JS itself failed to parse;
        // reporting it as an invalid render tag would mask that.
        JsNode::Identifier { name, .. } => name.is_empty(),
        _ => false,
    }
}

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
            if c == string_ch && !is_escaped(bytes, i) {
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
            if c == string_ch && !is_escaped(bytes, i) {
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
fn build_empty_loose_declaration<'a>(
    start: usize,
    tag_end: usize,
    decl_start: usize,
    body_end: usize,
    kind: &str,
) -> TemplateNode<'a> {
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
                return pattern[..i].trim_ws().to_string();
            }
            _ => {}
        }
    }

    // No type annotation found
    pattern.to_string()
}

/// Build a `VariableDeclaration` node with a caller-supplied kind
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
fn build_kind_variable_declaration<'a>(
    arena: &crate::ast::arena::ParseArena,
    pattern: Expression<'a>,
    init: Expression<'a>,
    decl_start: usize,
    decl_end: usize,
    kind: &str,
) -> Expression<'a> {
    build_variable_declaration(arena, pattern, init, decl_start, decl_end, None, kind)
}

fn build_const_variable_declaration<'a>(
    arena: &crate::ast::arena::ParseArena,
    pattern: Expression<'a>,
    init: Expression<'a>,
    decl_start: usize,
    decl_end: usize,
    declarator_end: usize,
) -> Expression<'a> {
    build_variable_declaration(
        arena,
        pattern,
        init,
        decl_start,
        decl_end,
        Some(declarator_end),
        "const",
    )
}

/// Shared typed builder behind [`build_kind_variable_declaration`] and
/// [`build_const_variable_declaration`]. `declarator_end` overrides the
/// declarator's end (upstream captures `parser.index` just past the
/// initializer text, which differs from `init.end` inside wrapping parens);
/// `None` falls back to the initializer's own end.
fn build_variable_declaration<'a>(
    arena: &crate::ast::arena::ParseArena,
    pattern: Expression<'a>,
    init: Expression<'a>,
    decl_start: usize,
    decl_end: usize,
    declarator_end: Option<usize>,
    kind: &str,
) -> Expression<'a> {
    let pattern_node = expression_into_node(pattern);
    let init_node = expression_into_node(init);

    let id_start = pattern_node.start().unwrap_or(decl_start as u32);
    let init_end = init_node.end().unwrap_or(decl_end as u32);

    let id = arena.alloc_js_node(pattern_node);
    let init_id = arena.alloc_js_node(init_node);

    let declarations = arena.alloc_js_children(vec![JsNode::VariableDeclarator {
        start: id_start,
        end: declarator_end.map_or(init_end, |e| e as u32),
        loc: None,
        id,
        init: Some(init_id),
    }]);

    Expression::from_node(JsNode::VariableDeclaration {
        start: decl_start as u32,
        end: decl_end as u32,
        loc: None,
        declarations,
        kind: kind.into(),
        declare: false,
    })
}

/// Take ownership of an expression's typed node. `Lazy` cannot reach these
/// builders: the declaration paths parse their pattern/init eagerly.
fn expression_into_node(expr: Expression<'_>) -> JsNode {
    match expr {
        Expression::Typed(te) => te.node,
        Expression::Lazy { .. } => {
            panic!("Expression::Lazy must be resolved before building a declaration")
        }
    }
}

#[cfg(test)]
mod duplicate_clause_table {
    use super::Clause;

    /// Pins the table against upstream's `next()`. `{#if}` / `{#each}` re-create
    /// their fragment on every `{:else}`; `{#await}` guards `block.then` and
    /// `block.catch`. The `{#await}` call sites read these arms.
    #[test]
    fn matches_upstream() {
        assert!(!Clause::Else.duplicate_is_error());
        assert!(Clause::Then.duplicate_is_error());
        assert!(Clause::Catch.duplicate_is_error());
    }

    #[test]
    fn tags_are_the_spellings_upstream_reports() {
        assert_eq!(Clause::Else.tag(), "{:else}");
        assert_eq!(Clause::Then.tag(), "{:then}");
        assert_eq!(Clause::Catch.tag(), "{:catch}");
    }

    /// The diagnostic is a point span on the `:`, which is upstream's
    /// `start = parser.index - 1` in `next()`.
    #[test]
    fn the_error_is_a_point_span_on_the_colon() {
        let error = Clause::Catch.duplicate_error(33);
        let text = format!("{error:?}");
        assert!(text.contains("block_duplicate_clause"), "{text}");
        assert!(
            text.contains("{:catch} cannot appear more than once within a block"),
            "{text}"
        );
        assert!(text.contains("(33, 33)"), "{text}");
    }
}
