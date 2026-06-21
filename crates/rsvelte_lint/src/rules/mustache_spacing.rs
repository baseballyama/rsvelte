//! `svelte/mustache-spacing` — enforce unified spacing inside mustache
//! delimiters.
//!
//! Each mustache region (`{ … }`) is checked for whitespace immediately after
//! the opening `{` and immediately before the closing `}`, against a per-context
//! option (`"always"` requires exactly one space, `"never"` forbids any). The
//! closing brace of block tags additionally supports `"always-after-expression"`
//! — require a space only when the tag ends with an expression/binding.
//!
//! Option (`options[0]`, object):
//! - `textExpressions` (default `"never"`) — `{expr}` text interpolations.
//! - `attributesAndProps` (default `"never"`) — attribute / prop expressions,
//!   shorthands and spreads.
//! - `directiveExpressions` (default `"never"`) — directive value expressions.
//! - `tags.openingBrace` (default `"never"`) / `tags.closingBrace` (default
//!   `"never"`, also accepts `"always-after-expression"`) — block / `@`-tag
//!   delimiters (`{#if}`, `{@html}`, `{#each}`, …).
//!
//! Port of `eslint-plugin-svelte/src/rules/mustache-spacing.ts`.
//! Upstream: `meta.fixable = 'code'`, `type: 'layout'`.

use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, AwaitBlock, DebugTag, DeclarationTag, EachBlock,
    ExpressionTag, HtmlTag, IfBlock, KeyBlock, RenderTag, SnippetBlock, TemplateNode,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/mustache-spacing",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce unified spacing in mustache",
    options_schema: Some(
        r#"[{"type":"object","properties":{"textExpressions":{"enum":["never","always"]},"attributesAndProps":{"enum":["never","always"]},"directiveExpressions":{"enum":["never","always"]},"tags":{"type":"object","properties":{"openingBrace":{"enum":["never","always"]},"closingBrace":{"enum":["never","always","always-after-expression"]}},"additionalProperties":false}},"additionalProperties":false}]"#,
    ),
};

#[derive(Clone, Copy, PartialEq, Eq)]
enum OpenOpt {
    Never,
    Always,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum CloseOpt {
    Never,
    Always,
    AlwaysAfterExpression,
}

struct Options {
    text_expressions: OpenOpt,
    attributes_and_props: OpenOpt,
    directive_expressions: OpenOpt,
    tags_opening: OpenOpt,
    tags_closing: CloseOpt,
}

fn parse_open(s: Option<&str>, default: OpenOpt) -> OpenOpt {
    match s {
        Some("always") => OpenOpt::Always,
        Some("never") => OpenOpt::Never,
        _ => default,
    }
}

impl Options {
    fn resolve(ctx: &LintContext) -> Self {
        let opt = ctx.option0();
        let get =
            |key: &str| -> Option<&str> { opt.and_then(|v| v.get(key)).and_then(|v| v.as_str()) };
        let tags = opt.and_then(|v| v.get("tags"));
        let tags_opening = parse_open(
            tags.and_then(|v| v.get("openingBrace"))
                .and_then(|v| v.as_str()),
            OpenOpt::Never,
        );
        let tags_closing = match tags
            .and_then(|v| v.get("closingBrace"))
            .and_then(|v| v.as_str())
        {
            Some("always") => CloseOpt::Always,
            Some("always-after-expression") => CloseOpt::AlwaysAfterExpression,
            _ => CloseOpt::Never,
        };
        Options {
            text_expressions: parse_open(get("textExpressions"), OpenOpt::Never),
            attributes_and_props: parse_open(get("attributesAndProps"), OpenOpt::Never),
            directive_expressions: parse_open(get("directiveExpressions"), OpenOpt::Never),
            tags_opening,
            tags_closing,
        }
    }
}

/// First non-whitespace byte at or after `from` (clamped to `end`).
fn first_non_ws(src: &[u8], from: u32, end: u32) -> u32 {
    let mut i = from as usize;
    let end = end as usize;
    while i < end && (src[i] as char).is_ascii_whitespace() {
        i += 1;
    }
    i as u32
}

/// Byte just past the last non-whitespace byte in `[start, before)`.
fn last_non_ws_end(src: &[u8], start: u32, before: u32) -> u32 {
    let start = start as usize;
    let mut i = before as usize;
    while i > start && (src[i - 1] as char).is_ascii_whitespace() {
        i -= 1;
    }
    i as u32
}

/// First `}` at or after `from`.
fn first_close_brace(src: &[u8], from: u32) -> Option<u32> {
    let mut i = from as usize;
    while i < src.len() {
        if src[i] == b'}' {
            return Some(i as u32);
        }
        i += 1;
    }
    None
}

/// Last `{` strictly before `before` (scanning back to `floor`).
fn prev_open_brace(src: &[u8], floor: u32, before: u32) -> Option<u32> {
    let floor = floor as usize;
    let mut i = before as usize;
    while i > floor {
        i -= 1;
        if src[i] == b'{' {
            return Some(i as u32);
        }
    }
    None
}

#[derive(Default)]
pub struct MustacheSpacing;

impl MustacheSpacing {
    /// The core verifier. `open_brace` is the byte offset of `{`. `close_brace`
    /// is the byte offset of `}` (or `None` to skip the closing check).
    fn verify_braces(
        &self,
        ctx: &mut LintContext,
        open_brace: u32,
        close_brace: Option<u32>,
        open_opt: OpenOpt,
        close_opt: CloseOpt,
        has_expression: bool,
    ) {
        // Skip checks for mustaches inside pug templates — the oracle's
        // svelte-eslint-parser does not parse pug template content as Svelte
        // mustaches, so there are no oracle findings for those positions.
        if is_inside_pug_template(ctx.source(), open_brace) {
            return;
        }
        let src = ctx.source().as_bytes();
        let after_open = open_brace + 1;
        // Stop the inner scan at the closing brace (or EOF) so we don't run past
        // the mustache region.
        let inner_end = close_brace.unwrap_or(src.len() as u32);
        let first_inner = first_non_ws(src, after_open, inner_end);

        match open_opt {
            OpenOpt::Always => {
                if after_open == first_inner {
                    ctx.report_with_fix(
                        open_brace,
                        after_open,
                        "Expected 1 space after '{', but not found.",
                        Fix {
                            message: "Insert space after '{'".to_string(),
                            edits: vec![TextEdit {
                                start: after_open,
                                end: after_open,
                                new_text: " ".to_string(),
                            }],
                        },
                    );
                }
            }
            OpenOpt::Never => {
                if after_open != first_inner {
                    ctx.report_with_fix(
                        open_brace,
                        first_inner,
                        "Expected no space after '{', but found.",
                        Fix {
                            message: "Remove space after '{'".to_string(),
                            edits: vec![TextEdit {
                                start: after_open,
                                end: first_inner,
                                new_text: String::new(),
                            }],
                        },
                    );
                }
            }
        }

        let Some(close_brace) = close_brace else {
            return;
        };
        let last_end = last_non_ws_end(src, after_open, close_brace);

        let require_close = matches!(close_opt, CloseOpt::Always)
            || (matches!(close_opt, CloseOpt::AlwaysAfterExpression) && has_expression);

        if require_close {
            if close_brace == last_end {
                ctx.report_with_fix(
                    close_brace,
                    close_brace + 1,
                    "Expected 1 space before '}', but not found.",
                    Fix {
                        message: "Insert space before '}'".to_string(),
                        edits: vec![TextEdit {
                            start: close_brace,
                            end: close_brace,
                            new_text: " ".to_string(),
                        }],
                    },
                );
            }
        } else if close_brace != last_end {
            ctx.report_with_fix(
                last_end,
                close_brace + 1,
                "Expected no space before '}', but found.",
                Fix {
                    message: "Remove space before '}'".to_string(),
                    edits: vec![TextEdit {
                        start: last_end,
                        end: close_brace,
                        new_text: String::new(),
                    }],
                },
            );
        }
    }

    /// Verify a `{ … }` region given its outer span (`{` at `start`, `}` at
    /// `end - 1`), with the same option on both braces.
    fn verify_wrapped(&self, ctx: &mut LintContext, start: u32, end: u32, opt: OpenOpt) {
        let close_opt = match opt {
            OpenOpt::Always => CloseOpt::Always,
            OpenOpt::Never => CloseOpt::Never,
        };
        self.verify_braces(ctx, start, Some(end - 1), opt, close_opt, false);
    }

    /// Verify a whole-node tag (`{@html …}`, `{@debug …}`, `{@render …}`, …)
    /// using the `tags` option, with `hasExpression = true`.
    fn verify_tag_node(&self, ctx: &mut LintContext, start: u32, end: u32) {
        let opts = Options::resolve(ctx);
        self.verify_braces(
            ctx,
            start,
            Some(end - 1),
            opts.tags_opening,
            opts.tags_closing,
            true,
        );
    }
}

impl Rule for MustacheSpacing {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_expression_tag(&self, ctx: &mut LintContext, tag: &ExpressionTag) {
        let opt = Options::resolve(ctx).text_expressions;
        self.verify_wrapped(ctx, tag.start, tag.end, opt);
    }

    fn check_html_tag(&self, ctx: &mut LintContext, tag: &HtmlTag) {
        self.verify_tag_node(ctx, tag.start, tag.end);
    }

    fn check_debug_tag(&self, ctx: &mut LintContext, tag: &DebugTag) {
        self.verify_tag_node(ctx, tag.start, tag.end);
    }

    fn check_declaration_tag(&self, ctx: &mut LintContext, tag: &DeclarationTag) {
        self.verify_tag_node(ctx, tag.start, tag.end);
    }

    fn check_render_tag(&self, ctx: &mut LintContext, tag: &RenderTag) {
        self.verify_tag_node(ctx, tag.start, tag.end);
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        let opts = Options::resolve(ctx);
        let src = ctx.source().as_bytes();
        match attr {
            Attribute::Attribute(node) => {
                let opt = opts.attributes_and_props;
                match &node.value {
                    AttributeValue::True(_) => {}
                    AttributeValue::Expression(tag) => {
                        // Shorthand `{name}`: the AttributeNode itself spans the
                        // braces (the ExpressionTag is identifier-only). Regular
                        // `name={expr}`: the ExpressionTag spans `{expr}`.
                        if src.get(node.start as usize) == Some(&b'{') {
                            self.verify_wrapped(ctx, node.start, node.end, opt);
                        } else {
                            self.verify_wrapped(ctx, tag.start, tag.end, opt);
                        }
                    }
                    AttributeValue::Sequence(parts) => {
                        for part in parts {
                            if let AttributeValuePart::ExpressionTag(tag) = part {
                                self.verify_wrapped(ctx, tag.start, tag.end, opt);
                            }
                        }
                    }
                }
            }
            Attribute::SpreadAttribute(node) => {
                self.verify_wrapped(ctx, node.start, node.end, opts.attributes_and_props);
            }
            Attribute::AttachTag(_) => {}
            Attribute::BindDirective(d) => self.verify_directive(
                ctx,
                src,
                d.start,
                d.end,
                d.expression.start(),
                d.expression.end(),
                opts.directive_expressions,
            ),
            Attribute::OnDirective(d) => self.verify_directive_opt(
                ctx,
                src,
                d.start,
                d.end,
                d.expression.as_ref(),
                opts.directive_expressions,
            ),
            Attribute::ClassDirective(d) => self.verify_directive(
                ctx,
                src,
                d.start,
                d.end,
                d.expression.start(),
                d.expression.end(),
                opts.directive_expressions,
            ),
            Attribute::StyleDirective(d) => {
                let opt = opts.directive_expressions;
                match &d.value {
                    AttributeValue::True(_) => {}
                    AttributeValue::Expression(tag) => {
                        self.verify_wrapped(ctx, tag.start, tag.end, opt)
                    }
                    AttributeValue::Sequence(parts) => {
                        for part in parts {
                            if let AttributeValuePart::ExpressionTag(tag) = part {
                                self.verify_wrapped(ctx, tag.start, tag.end, opt);
                            }
                        }
                    }
                }
            }
            Attribute::TransitionDirective(d) => self.verify_directive_opt(
                ctx,
                src,
                d.start,
                d.end,
                d.expression.as_ref(),
                opts.directive_expressions,
            ),
            Attribute::AnimateDirective(d) => self.verify_directive_opt(
                ctx,
                src,
                d.start,
                d.end,
                d.expression.as_ref(),
                opts.directive_expressions,
            ),
            Attribute::UseDirective(d) => self.verify_directive_opt(
                ctx,
                src,
                d.start,
                d.end,
                d.expression.as_ref(),
                opts.directive_expressions,
            ),
            Attribute::LetDirective(d) => self.verify_directive_opt(
                ctx,
                src,
                d.start,
                d.end,
                d.expression.as_ref(),
                opts.directive_expressions,
            ),
        }
    }

    fn check_if(&self, ctx: &mut LintContext, block: &IfBlock) {
        let opts = Options::resolve(ctx);
        let src = ctx.source().as_bytes();
        // Opening tag `{#if expr}` / `{:else if expr}`.
        let open = block.start;
        if let Some(test_end) = block.test.end()
            && let Some(close) = first_close_brace(src, test_end)
        {
            self.verify_braces(
                ctx,
                open,
                Some(close),
                opts.tags_opening,
                opts.tags_closing,
                true,
            );
        }
        // Plain `{:else}` (not `{:else if}`) — check for every IfBlock
        // (including elseif blocks) whose alternate is a plain else, not another
        // elseif. The upstream ESLint rule uses a separate `SvelteElseBlock`
        // visitor that fires for each else block regardless of nesting depth.
        if let Some(alt) = &block.alternate {
            let is_elseif = alt
                .nodes
                .iter()
                .any(|n| matches!(n, TemplateNode::IfBlock(b) if b.elseif));
            if !is_elseif && let Some((eo, ec)) = find_else_tag(src, block.start, block.end) {
                self.verify_braces(
                    ctx,
                    eo,
                    Some(ec),
                    opts.tags_opening,
                    opts.tags_closing,
                    false,
                );
            }
        }
        if block.elseif {
            return;
        }
        // Closing tag `{/if}`.
        let close = block.end - 1;
        if let Some(open_b) = prev_open_brace(src, block.start, close) {
            self.verify_braces(
                ctx,
                open_b,
                Some(close),
                opts.tags_opening,
                opts.tags_closing,
                false,
            );
        }
    }

    fn check_each(&self, ctx: &mut LintContext, block: &EachBlock) {
        let opts = Options::resolve(ctx);
        let src = ctx.source().as_bytes();
        // Opening `{#each … }`: close brace is the first `}` after the last
        // present expression (expression / context / key).
        let mut last = block.expression.end().unwrap_or(block.start);
        if let Some(c) = &block.context {
            last = last.max(c.end().unwrap_or(last));
        }
        if let Some(k) = &block.key {
            last = last.max(k.end().unwrap_or(last));
        }
        if let Some(close) = first_close_brace(src, last) {
            self.verify_braces(
                ctx,
                block.start,
                Some(close),
                opts.tags_opening,
                opts.tags_closing,
                true,
            );
        }
        // Closing `{/each}`.
        let close = block.end - 1;
        if let Some(open_b) = prev_open_brace(src, block.start, close) {
            self.verify_braces(
                ctx,
                open_b,
                Some(close),
                opts.tags_opening,
                opts.tags_closing,
                false,
            );
        }
        // `{:else}` fallback.
        if block.fallback.is_some()
            && let Some((eo, ec)) = find_else_tag(src, block.start, block.end)
        {
            self.verify_braces(
                ctx,
                eo,
                Some(ec),
                opts.tags_opening,
                opts.tags_closing,
                false,
            );
        }
    }

    fn check_key(&self, ctx: &mut LintContext, block: &KeyBlock) {
        let opts = Options::resolve(ctx);
        let src = ctx.source().as_bytes();
        if let Some(expr_end) = block.expression.end()
            && let Some(close) = first_close_brace(src, expr_end)
        {
            self.verify_braces(
                ctx,
                block.start,
                Some(close),
                opts.tags_opening,
                opts.tags_closing,
                true,
            );
        }
        let close = block.end - 1;
        if let Some(open_b) = prev_open_brace(src, block.start, close) {
            self.verify_braces(
                ctx,
                open_b,
                Some(close),
                opts.tags_opening,
                opts.tags_closing,
                false,
            );
        }
    }

    fn check_snippet(&self, ctx: &mut LintContext, block: &SnippetBlock) {
        let opts = Options::resolve(ctx);
        let src = ctx.source().as_bytes();
        // Opening `{#snippet id(params)}`: close brace after the last param (or
        // the id when there are none).
        let last = block
            .parameters
            .last()
            .and_then(|p| p.end())
            .or_else(|| block.expression.end())
            .unwrap_or(block.start);
        if let Some(close) = first_close_brace(src, last) {
            self.verify_braces(
                ctx,
                block.start,
                Some(close),
                opts.tags_opening,
                opts.tags_closing,
                true,
            );
        }
        let close = block.end - 1;
        if let Some(open_b) = prev_open_brace(src, block.start, close) {
            self.verify_braces(
                ctx,
                open_b,
                Some(close),
                opts.tags_opening,
                opts.tags_closing,
                false,
            );
        }
    }

    fn check_await(&self, ctx: &mut LintContext, block: &AwaitBlock) {
        let opts = Options::resolve(ctx);
        let src = ctx.source().as_bytes();

        // Closing `{/await}`.
        let close = block.end - 1;
        if let Some(open_b) = prev_open_brace(src, block.start, close) {
            self.verify_braces(
                ctx,
                open_b,
                Some(close),
                opts.tags_opening,
                opts.tags_closing,
                false,
            );
        }

        let await_then = block.pending.is_none() && block.then.is_some();
        let await_catch = block.pending.is_none() && block.then.is_none() && block.catch.is_some();

        // Opening `{#await expr}` — only when a separate pending block exists.
        if block.pending.is_some()
            && let Some(expr_end) = block.expression.end()
            && let Some(c) = first_close_brace(src, expr_end)
        {
            self.verify_braces(
                ctx,
                block.start,
                Some(c),
                opts.tags_opening,
                opts.tags_closing,
                true,
            );
        }

        // `{:then …}` / combined `{#await … then …}`.
        if block.then.is_some() {
            let open_b = if await_then {
                block.start
            } else {
                find_branch_tag(src, block.start, block.end, b":then")
            };
            let open_block_last = block
                .value
                .as_ref()
                .and_then(|v| v.end())
                .or(if await_then {
                    block.expression.end()
                } else {
                    None
                });
            self.verify_branch(ctx, &opts, open_b, open_block_last, src);
        }

        // `{:catch …}` / combined `{#await … catch …}`.
        if block.catch.is_some() {
            let open_b = if await_catch {
                block.start
            } else {
                find_branch_tag(src, block.start, block.end, b":catch")
            };
            let open_block_last = block
                .error
                .as_ref()
                .and_then(|e| e.end())
                .or(if await_catch {
                    block.expression.end()
                } else {
                    None
                });
            self.verify_branch(ctx, &opts, open_b, open_block_last, src);
        }
    }
}

impl MustacheSpacing {
    /// Verify a directive value (`name={expr}`): find the `{` before the
    /// expression and the `}` after it; skip shorthands / value-less directives.
    #[allow(clippy::too_many_arguments)]
    fn verify_directive(
        &self,
        ctx: &mut LintContext,
        src: &[u8],
        node_start: u32,
        node_end: u32,
        expr_start: Option<u32>,
        expr_end: Option<u32>,
        opt: OpenOpt,
    ) {
        let (Some(es), Some(ee)) = (expr_start, expr_end) else {
            return;
        };
        let Some(open) = prev_open_brace(src, node_start, es) else {
            return; // shorthand / no braces
        };
        let Some(close) = first_close_brace(src, ee).filter(|c| *c < node_end) else {
            return;
        };
        self.verify_wrapped_braces(ctx, open, close, opt);
    }

    fn verify_directive_opt(
        &self,
        ctx: &mut LintContext,
        src: &[u8],
        node_start: u32,
        node_end: u32,
        expr: Option<&rsvelte_core::ast::js::Expression>,
        opt: OpenOpt,
    ) {
        if let Some(e) = expr {
            self.verify_directive(ctx, src, node_start, node_end, e.start(), e.end(), opt);
        }
    }

    /// Like [`verify_wrapped`] but the braces are at explicit offsets.
    fn verify_wrapped_braces(&self, ctx: &mut LintContext, open: u32, close: u32, opt: OpenOpt) {
        let close_opt = match opt {
            OpenOpt::Always => CloseOpt::Always,
            OpenOpt::Never => CloseOpt::Never,
        };
        self.verify_braces(ctx, open, Some(close), opt, close_opt, false);
    }

    /// Verify an await then/catch branch given its opening `{` and the byte just
    /// past the last binding/expression (or `None` when the branch carries no
    /// binding — then only the opening brace is checked).
    fn verify_branch(
        &self,
        ctx: &mut LintContext,
        opts: &Options,
        open_b: u32,
        open_block_last: Option<u32>,
        src: &[u8],
    ) {
        if open_b == u32::MAX {
            return;
        }
        let (close, has_expr) = match open_block_last {
            Some(last) => match first_close_brace(src, last) {
                Some(c) => {
                    // hasExpression ⇔ the close brace is the first token after
                    // the binding (only whitespace between them).
                    let has = last_non_ws_end(src, last, c) == last;
                    (Some(c), has)
                }
                None => (None, false),
            },
            None => (None, false),
        };
        self.verify_braces(
            ctx,
            open_b,
            close,
            opts.tags_opening,
            opts.tags_closing,
            has_expr,
        );
    }
}

/// Find the `{` that opens a `{:then …}` / `{:catch …}` branch within
/// `[start, end)`. Returns `u32::MAX` when not found.
fn find_branch_tag(src: &[u8], start: u32, end: u32, keyword: &[u8]) -> u32 {
    let mut i = start as usize;
    let end = (end as usize).min(src.len());
    while i < end {
        if src[i] == b'{' {
            // Skip whitespace after `{`.
            let mut j = i + 1;
            while j < end && (src[j] as char).is_ascii_whitespace() {
                j += 1;
            }
            if src[j..end.min(j + keyword.len())] == *keyword {
                return i as u32;
            }
        }
        i += 1;
    }
    u32::MAX
}

/// Return `true` when `offset` falls within a `<template lang="pug">` (or
/// `lang='pug'`) element in `src`. Used to suppress false positives on pug
/// template content, which the oracle's svelte-eslint-parser does not parse as
/// Svelte mustaches.
fn is_inside_pug_template(src: &str, offset: u32) -> bool {
    let bytes = src.as_bytes();
    let src_len = bytes.len();
    let offset = offset as usize;

    // Find all `<template` openers and check if any pug template wraps `offset`.
    let mut i = 0;
    while i + 9 < src_len {
        if &bytes[i..i + 9] != b"<template" {
            i += 1;
            continue;
        }
        // Find the end of the opening tag (`>`).
        let tag_start = i;
        let mut j = i + 9;
        while j < src_len && bytes[j] != b'>' {
            j += 1;
        }
        let tag_open_end = j; // position of `>`
        // Check if the opening tag contains lang="pug" or lang='pug'.
        let attrs = std::str::from_utf8(&bytes[i + 9..tag_open_end]).unwrap_or("");
        let is_pug = attrs.contains("lang=\"pug\"") || attrs.contains("lang='pug'");
        if !is_pug {
            i = tag_open_end + 1;
            continue;
        }
        // Find the matching `</template>`.
        let content_start = tag_open_end + 1;
        if let Some(close_pos) = src[content_start..].find("</template>") {
            let template_end = content_start + close_pos + "</template>".len();
            if offset >= tag_start && offset < template_end {
                return true;
            }
            i = template_end;
        } else {
            break;
        }
    }
    false
}

/// Find the plain `{:else}` (NOT `{:else if}`) tag in `[start, end)`. Returns
/// `(open_brace, close_brace)`.
fn find_else_tag(src: &[u8], start: u32, end: u32) -> Option<(u32, u32)> {
    let mut i = start as usize;
    let end = (end as usize).min(src.len());
    while i < end {
        if src[i] == b'{' {
            // Find the matching `}` (the `{:else}` tag has no nested braces).
            if let Some(close) = first_close_brace(src, (i + 1) as u32) {
                let inner = std::str::from_utf8(&src[i + 1..close as usize])
                    .unwrap_or("")
                    .trim();
                if inner == ":else" {
                    return Some((i as u32, close));
                }
            }
        }
        i += 1;
    }
    None
}
