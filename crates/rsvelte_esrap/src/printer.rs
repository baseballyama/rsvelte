//! The oxc-AST → JavaScript visitor.
//!
//! A port of esrap's `languages/ts` visitor, adapted to oxc's AST. Where esrap
//! dispatches through a `visitors[node.type]` map, this matches on oxc node
//! kinds; the layout logic — precedence-based parenthesisation, the `sequence`
//! helper for comma lists, and the `body` helper for statement lists — is the
//! same.
//!
//! Coverage is intentionally incremental (this is step 0 of the printer port):
//! the [`golden`](../../tests/golden.rs) test measures how much of the official
//! snapshot corpus round-trips, and that rate only ratchets up. Nodes that are
//! not yet handled return [`Unsupported`] so the harness can attribute misses
//! precisely rather than emit wrong output.

use oxc_ast::ast::*;
use oxc_span::GetSpan;
use oxc_syntax::operator::UnaryOperator;

use crate::context::Context;
use crate::{PrintOptions, QuoteStyle};

/// A node kind the printer does not yet handle. Carries the kind name so the
/// conformance harness can report exactly which visitors are still missing.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Unsupported(pub &'static str);

/// esrap's `create_keyword_write` closure, as an explicit cursor. Writes a run
/// of sequential keyword fragments anchored from one source position, advancing
/// the column by each fragment's length. When `cursor` is `None`, fragments are
/// written unmapped.
struct KeywordCursor {
    cursor: Option<(u32, u32)>,
}

impl KeywordCursor {
    /// Write one fragment (e.g. `"declare "`, `"class "`). Mapped if a cursor is
    /// active, otherwise a plain write.
    fn write(&mut self, ctx: &mut Context, fragment: &str) {
        if let Some((line, col)) = self.cursor {
            Printer::write_source_keyword(ctx, line, col, fragment);
            self.cursor = Some((line, col + fragment.len() as u32));
        } else {
            ctx.write(fragment.to_string());
        }
    }
}

pub struct Printer<'opt> {
    options: &'opt PrintOptions,
    /// Set by the first unsupported node encountered; printing continues so the
    /// harness gets a single representative miss per file.
    pub missing: Option<Unsupported>,
    /// Source-order comments to interleave, and the cursor into them. esrap
    /// threads comments positionally (leading before a node, trailing on a
    /// node's last line) rather than attaching them to AST nodes.
    comments: Vec<Cmt>,
    comment_index: usize,
    /// Byte offsets of each line start, for offset→line lookups when placing
    /// comments. Empty when printing without comments.
    line_starts: Vec<u32>,
    /// Optional caller hooks that inject synthetic leading/trailing comments per
    /// statement (esrap's `getLeadingComments` / `getTrailingComments`).
    hooks: Option<&'opt crate::CommentHooks<'opt>>,
}

/// Byte offsets at which each source line begins (line 1 starts at 0).
pub fn line_starts(source: &str) -> Vec<u32> {
    let mut starts = vec![0];
    for (i, b) in source.bytes().enumerate() {
        if b == b'\n' {
            starts.push(i as u32 + 1);
        }
    }
    starts
}

/// A comment to interleave, pre-resolved to byte offsets, 1-based line numbers,
/// and its delimiter-stripped value (so `Printer::write_comment` can rebuild
/// it exactly as esrap does, re-indenting multi-line block bodies).
#[derive(Debug, Clone)]
pub struct Cmt {
    pub start: u32,
    pub end: u32,
    pub start_line: u32,
    pub end_line: u32,
    pub block: bool,
    pub value: String,
}

/// Resolve a program's oxc comments into [`Cmt`]s in source order. `source` is
/// the text the program was parsed from (for the comment bodies + line numbers).
pub fn build_comments(program: &Program<'_>, source: &str) -> Vec<Cmt> {
    let starts = line_starts(source);
    let line_of = |offset: u32| -> u32 {
        // 1-based line: number of line starts <= offset.
        starts.partition_point(|&s| s <= offset) as u32
    };

    program
        .comments
        .iter()
        .map(|c| {
            let (start, end) = (c.span.start, c.span.end);
            let raw = &source[start as usize..end as usize];
            let block = !matches!(c.kind, oxc_ast::ast::CommentKind::Line);
            let value = if block {
                let inner = raw
                    .strip_prefix("/*")
                    .and_then(|s| s.strip_suffix("*/"))
                    .unwrap_or(raw);
                // Svelte's `onComment` (1-parse/acorn.js) dedents a multi-line
                // block comment by its opener line's leading indentation, so the
                // re-indent on output (one `newline()` per line) doesn't stack
                // on top of the source indentation. Mirror it exactly.
                if inner.contains('\n') {
                    dedent_block_comment(source, start, inner)
                } else {
                    inner.to_string()
                }
            } else {
                raw.strip_prefix("//").unwrap_or(raw).to_string()
            };
            Cmt {
                start,
                end,
                start_line: line_of(start),
                end_line: line_of(end),
                block,
                value,
            }
        })
        .collect()
}

/// Strip the comment opener's line indentation from every line of a multi-line
/// block comment body, mirroring Svelte's `onComment` handler:
/// `value.replace(new RegExp('^' + indentation, 'gm'), '')`. `start` is the byte
/// offset of the `/*`; the indentation is the whitespace from the start of that
/// line up to the first non-`[ \t]` byte.
fn dedent_block_comment(source: &str, start: u32, inner: &str) -> String {
    let bytes = source.as_bytes();
    // Walk back to the start of the comment opener's line.
    let mut a = start as usize;
    while a > 0 && bytes[a - 1] != b'\n' {
        a -= 1;
    }
    // The leading run of spaces/tabs on that line is the indentation.
    let mut b = a;
    while b < bytes.len() && (bytes[b] == b' ' || bytes[b] == b'\t') {
        b += 1;
    }
    let indentation = &source[a..b];
    if indentation.is_empty() {
        return inner.to_string();
    }
    inner
        .split('\n')
        .map(|line| line.strip_prefix(indentation).unwrap_or(line))
        .collect::<Vec<_>>()
        .join("\n")
}

/// Strip explicit `ParenthesizedExpression` wrappers. esrap parses with acorn,
/// which never produces these nodes, so all of its precedence / `needs_parens`
/// logic operates on the real underlying expression. We unwrap paren nodes
/// before printing (see the `ParenthesizedExpression` arm in `print_expression`),
/// so every precedence query must look through them too — otherwise a paren
/// node's top precedence (20) would mask the inner operator and suppress the
/// parens the grammar actually requires (e.g. `await (a || b)`).
fn unparen<'a, 'b>(mut expr: &'a Expression<'b>) -> &'a Expression<'b> {
    while let Expression::ParenthesizedExpression(p) = expr {
        expr = &p.expression;
    }
    expr
}

/// Faithful port of esrap's `has_call_expression`: walk a callee's member-object
/// spine and report whether any link is a CallExpression. Used to decide whether
/// a `new` callee needs wrapping parens.
fn callee_has_call_expression(expr: &Expression) -> bool {
    let mut node = unparen(expr);
    loop {
        match node {
            Expression::CallExpression(_) => return true,
            Expression::StaticMemberExpression(m) => node = unparen(&m.object),
            Expression::ComputedMemberExpression(m) => node = unparen(&m.object),
            Expression::PrivateFieldExpression(m) => node = unparen(&m.object),
            _ => return false,
        }
    }
}

/// esrap's `EXPRESSIONS_PRECEDENCE`, keyed by oxc `Expression` kind. Higher
/// binds tighter; a child is parenthesised when its precedence is lower than the
/// position requires.
fn expr_precedence(expr: &Expression) -> u8 {
    match unparen(expr) {
        Expression::JSXElement(_)
        | Expression::JSXFragment(_)
        | Expression::ArrayExpression(_)
        | Expression::TaggedTemplateExpression(_)
        | Expression::ThisExpression(_)
        | Expression::Identifier(_)
        | Expression::TemplateLiteral(_)
        // `super` as a callee (`super(...)`) must never be parenthesized;
        // esrap leaves its precedence undefined, so the `<` test is false.
        | Expression::Super(_)
        | Expression::SequenceExpression(_) => 20,
        Expression::StaticMemberExpression(_)
        | Expression::ComputedMemberExpression(_)
        | Expression::PrivateFieldExpression(_)
        | Expression::MetaProperty(_)
        | Expression::CallExpression(_)
        | Expression::ChainExpression(_)
        | Expression::ImportExpression(_)
        | Expression::NewExpression(_) => 19,
        Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::StringLiteral(_) => 18,
        Expression::AwaitExpression(_)
        | Expression::ClassExpression(_)
        | Expression::FunctionExpression(_)
        | Expression::ObjectExpression(_) => 17,
        Expression::UpdateExpression(_) => 16,
        Expression::UnaryExpression(_) => 15,
        Expression::BinaryExpression(_) => 14,
        // `as`/`satisfies` sit between binary and logical operators.
        Expression::TSAsExpression(_) | Expression::TSSatisfiesExpression(_) => 13,
        Expression::LogicalExpression(_) => 12,
        Expression::ConditionalExpression(_) => 4,
        Expression::ArrowFunctionExpression(_) | Expression::AssignmentExpression(_) => 3,
        Expression::YieldExpression(_) => 2,
        Expression::TSInstantiationExpression(_)
        | Expression::TSNonNullExpression(_)
        | Expression::TSTypeAssertion(_) => 18,
        // `unparen` already stripped any `ParenthesizedExpression`, so it never
        // reaches here.
        _ => 18,
    }
}

/// Binary/logical operator precedence (esrap's `OPERATOR_PRECEDENCE`).
fn binary_operator_precedence(op: &str) -> u8 {
    match op {
        "||" => 2,
        "&&" => 3,
        "??" => 4,
        "|" => 5,
        "^" => 6,
        "&" => 7,
        "==" | "!=" | "===" | "!==" => 8,
        "<" | ">" | "<=" | ">=" | "in" | "instanceof" => 9,
        "<<" | ">>" | ">>>" => 10,
        "+" | "-" => 11,
        "*" | "%" | "/" => 12,
        "**" => 13,
        _ => 0,
    }
}

/// Port of esrap's `needs_parens` for a binary/logical operand. `parent_op` is
/// the enclosing operator and `parent_is_logical` selects its node-type
/// precedence (12 for logical, 14 for binary).
fn binary_needs_parens(
    child: &Expression,
    parent_is_logical: bool,
    parent_op: &str,
    is_right: bool,
) -> bool {
    let parent_precedence = if parent_is_logical { 12 } else { 14 };
    // esrap operates on acorn ASTs (no paren nodes), so look through any
    // explicit `ParenthesizedExpression` before inspecting the child's kind.
    let child = unparen(child);

    // A left-hand `as`/`satisfies` child only needs parens when the parent
    // operator would otherwise swallow the trailing type (`**`, `&`, `|`).
    if !is_right
        && matches!(
            child,
            Expression::TSAsExpression(_) | Expression::TSSatisfiesExpression(_)
        )
    {
        return parent_op == "**" || parent_op == "&" || parent_op == "|";
    }

    // `??` cannot be mixed with `||`/`&&` without parentheses.
    if parent_is_logical && let Expression::LogicalExpression(c) = child {
        let child_op = c.operator.as_str();
        if (parent_op == "??" && child_op != "??") || (parent_op != "??" && child_op == "??") {
            return true;
        }
    }

    let precedence = expr_precedence(child);
    if precedence != parent_precedence {
        return (!is_right && precedence == 15 && parent_precedence == 14 && parent_op == "**")
            || precedence < parent_precedence;
    }

    // Same node-type precedence — only meaningful for binary (14) / logical (12)
    // children, where associativity via operator precedence decides parens.
    if precedence != 12 && precedence != 14 {
        return false;
    }

    let child_op = child_binary_op(child);
    if child_op == "**" && parent_op == "**" {
        // Exponentiation is right-associative.
        return !is_right;
    }

    let co = binary_operator_precedence(child_op);
    let po = binary_operator_precedence(parent_op);
    if is_right { co <= po } else { co < po }
}

/// The operator string of a binary/logical child (only consulted when the child
/// is known to be one of those).
fn child_binary_op(expr: &Expression) -> &'static str {
    match expr {
        Expression::BinaryExpression(b) => b.operator.as_str(),
        Expression::LogicalExpression(l) => l.operator.as_str(),
        _ => "",
    }
}

/// Whether a concise arrow body must be wrapped in parens (esrap's
/// `arrow_concise_body_needs_wrap`). A body that is an object literal — or a
/// compound whose leftmost token would otherwise be `{` — is ambiguous with a
/// block body, so esrap parenthesizes it. Explicit `ParenthesizedExpression`
/// bodies are printed faithfully by their own visitor and need no extra wrap.
fn arrow_concise_body_needs_wrap(body: &Expression) -> bool {
    match unparen(body) {
        Expression::ObjectExpression(_) => true,
        Expression::AssignmentExpression(a) => {
            matches!(a.left, AssignmentTarget::ObjectAssignmentTarget(_))
        }
        Expression::LogicalExpression(l) => {
            matches!(unparen(&l.left), Expression::ObjectExpression(_))
        }
        Expression::ConditionalExpression(c) => {
            matches!(unparen(&c.test), Expression::ObjectExpression(_))
        }
        // `as` / `satisfies` / `!` don't change the leftmost token, so recurse.
        Expression::TSAsExpression(e) => arrow_concise_body_needs_wrap(&e.expression),
        Expression::TSSatisfiesExpression(e) => arrow_concise_body_needs_wrap(&e.expression),
        Expression::TSNonNullExpression(e) => arrow_concise_body_needs_wrap(&e.expression),
        _ => false,
    }
}

impl<'opt> Printer<'opt> {
    pub fn new(options: &'opt PrintOptions) -> Self {
        Self {
            options,
            missing: None,
            comments: Vec::new(),
            comment_index: 0,
            line_starts: Vec::new(),
            hooks: None,
        }
    }

    /// A printer that interleaves `comments` (see [`build_comments`]).
    /// `line_starts` is the table from [`line_starts`].
    pub fn with_comments(
        options: &'opt PrintOptions,
        comments: Vec<Cmt>,
        line_starts: Vec<u32>,
    ) -> Self {
        Self {
            options,
            missing: None,
            comments,
            comment_index: 0,
            line_starts,
            hooks: None,
        }
    }

    /// Attach caller comment hooks (builder-style).
    pub fn with_hooks(mut self, hooks: &'opt crate::CommentHooks<'opt>) -> Self {
        self.hooks = Some(hooks);
        self
    }

    /// 1-based line of a byte offset (number of line starts at/before it).
    fn line_of(&self, offset: u32) -> u32 {
        self.line_starts.partition_point(|&s| s <= offset) as u32
    }

    /// Convert a byte offset to `(line_1based, column_0based)` using
    /// `line_starts`, mirroring ESTree `loc` (1-based line, 0-based column). The
    /// column is the offset relative to the start of its line; for ASCII / BMP
    /// source this equals the UTF-16 column esrap uses. Returns `None` when
    /// there are no line starts (printing without source context).
    fn offset_to_line_col(&self, offset: u32) -> Option<(u32, u32)> {
        if self.line_starts.is_empty() {
            return None;
        }
        let line = self.line_of(offset);
        // `line` is 1-based; its start offset lives at index `line - 1`.
        let line_start = self.line_starts[(line - 1) as usize];
        Some((line, offset.saturating_sub(line_start)))
    }

    /// esrap's `write_source_keyword`: bracket the literal `keyword` with
    /// source-map anchors for its exact span, so breakpoints land on the keyword.
    fn write_source_keyword(ctx: &mut Context, line: u32, column: u32, keyword: &str) {
        ctx.location(line, column);
        ctx.write(keyword);
        ctx.location(line, column + keyword.len() as u32);
    }

    /// esrap's `write_keyword`: map one `keyword` anchored at the byte offset
    /// `start` (resolved to a source `loc`), then append an unmapped `suffix`. If
    /// the offset can't be resolved (no source context), falls back to a plain
    /// `keyword + suffix` write.
    fn write_keyword(&self, ctx: &mut Context, start: u32, keyword: &str, suffix: &str) {
        if let Some((line, column)) = self.offset_to_line_col(start) {
            Self::write_source_keyword(ctx, line, column, keyword);
            if !suffix.is_empty() {
                ctx.write(suffix.to_string());
            }
        } else {
            ctx.write(format!("{keyword}{suffix}"));
        }
    }

    /// esrap's `create_keyword_write`: returns a closure-like cursor for writing
    /// a run of sequential keyword fragments (e.g. `declare `, `class `) starting
    /// at byte offset `start`, advancing the column by each fragment's length.
    /// When `map_ok` is false (or no source context), every fragment is written
    /// unmapped. Implemented as an explicit [`KeywordCursor`] because Rust closures
    /// can't borrow `self` mutably across calls the way the JS closure does.
    fn keyword_cursor(&self, start: u32, map_ok: bool) -> KeywordCursor {
        let cursor = if map_ok {
            self.offset_to_line_col(start)
        } else {
            None
        };
        KeywordCursor { cursor }
    }

    /// esrap's `function_async_function_offset_ok`: the `async function` source
    /// offsets are only trustworthy when the `function` token shares a line with
    /// `async`, anchored by the id or body starting on the same line as the node.
    fn function_async_offset_ok(&self, node: &Function) -> bool {
        let Some((line, _)) = self.offset_to_line_col(node.span().start) else {
            return false;
        };
        let id_line = node
            .id
            .as_ref()
            .and_then(|id| self.offset_to_line_col(id.span().start))
            .map(|(l, _)| l);
        let body_line = node
            .body
            .as_ref()
            .and_then(|b| self.offset_to_line_col(b.span().start))
            .map(|(l, _)| l);
        id_line == Some(line) || body_line == Some(line)
    }

    /// esrap's `class_modifier_keywords_map_ok`: map class modifiers only when
    /// there are no decorators and the id (or body, if anonymous) starts on the
    /// node's start line.
    fn class_modifier_map_ok(&self, node: &Class) -> bool {
        if !node.decorators.is_empty() {
            return false;
        }
        let Some((line, _)) = self.offset_to_line_col(node.span().start) else {
            return false;
        };
        let anchor = match &node.id {
            Some(id) => self.offset_to_line_col(id.span().start),
            None => self.offset_to_line_col(node.body.span().start),
        };
        anchor.map(|(l, _)| l) == Some(line)
    }

    /// Whether any source comment starts within `[start, end)` — used to decide
    /// if an unwrapped `ParenthesizedExpression` must keep its literal parens to
    /// bracket an interior comment (`(/*c*/ x)`).
    fn comment_in_span(&self, start: u32, end: u32) -> bool {
        self.comments
            .iter()
            .any(|c| c.start >= start && c.start < end)
    }

    // ----- comments ---------------------------------------------------------

    /// esrap's `write_comment`: re-emit a comment, splitting a multi-line block
    /// body across `newline`s so its interior re-indents to the current level.
    fn write_comment(&mut self, cmt: &Cmt, ctx: &mut Context) {
        self.write_comment_parts(cmt.block, &cmt.value, ctx);
    }

    /// The body of [`Self::write_comment`], shared with synthetic comments
    /// injected via [`crate::CommentHooks`].
    fn write_comment_parts(&mut self, block: bool, value: &str, ctx: &mut Context) {
        if !block {
            ctx.write(format!("//{value}"));
            return;
        }
        ctx.write("/*");
        let mut multiline = false;
        for (i, line) in value.split('\n').enumerate() {
            if i > 0 {
                ctx.newline();
                multiline = true;
            }
            ctx.write(line.to_string());
        }
        ctx.write("*/");
        if multiline {
            ctx.newline();
        }
    }

    /// esrap's `write_additional_comments`: emit hook-supplied synthetic comments
    /// around a node. Leading comments get a newline (line) or trailing space
    /// (single-line block) after them; trailing comments get a leading space
    /// before the first.
    fn write_additional_comments(
        &mut self,
        comments: &[crate::SynthComment],
        leading: bool,
        ctx: &mut Context,
    ) {
        for (i, c) in comments.iter().enumerate() {
            if !leading && i == 0 {
                ctx.write(" ");
            }
            self.write_comment_parts(c.block, &c.value, ctx);
            if leading {
                if !c.block {
                    ctx.newline();
                } else if !c.value.contains('\n') {
                    ctx.write(" ");
                }
            }
        }
    }

    /// esrap's `flush_comments_until`: emit every pending comment that starts
    /// before `to` (byte offset / `to_line`). The `from_line` margin rule adds a
    /// blank line before a detached leading comment block.
    fn flush_comments_until(
        &mut self,
        ctx: &mut Context,
        to: u32,
        to_line: u32,
        from_line: Option<u32>,
        pad: bool,
    ) {
        let mut first = true;
        while self.comment_index < self.comments.len() {
            let cmt = self.comments[self.comment_index].clone();
            if cmt.start >= to {
                break;
            }
            if first
                && let Some(from_line) = from_line
                && cmt.start_line > from_line
            {
                ctx.margin();
                ctx.newline();
            }
            first = false;
            self.write_comment(&cmt, ctx);
            if cmt.end_line < to_line {
                ctx.newline();
            } else if pad {
                ctx.write(" ");
            }
            self.comment_index += 1;
        }
    }

    /// esrap's `flush_trailing_comments`: emit comments on the same line as a
    /// node's end (`// trailing`), provided they fall before `next`. Returns
    /// `true` if a trailing `// line` comment (and its closing `newline()`) was
    /// emitted — esrap propagates that newline into the surrounding context's
    /// `multiline` via the next `append`, which the call-argument layout relies
    /// on to force the wrapped one-arg-per-line form.
    fn flush_trailing_comments(
        &mut self,
        ctx: &mut Context,
        prev_end_line: u32,
        next: Option<u32>,
    ) -> bool {
        let mut emitted_line_newline = false;
        while self.comment_index < self.comments.len() {
            let cmt = self.comments[self.comment_index].clone();
            let fits = cmt.start_line == prev_end_line && next.is_none_or(|n| cmt.end < n);
            if !fits {
                break;
            }
            ctx.write(" ");
            self.write_comment(&cmt, ctx);
            self.comment_index += 1;
            if cmt.block {
                continue;
            }
            ctx.newline();
            emitted_line_newline = true;
            break;
        }
        emitted_line_newline
    }

    /// esrap's `reset_comment_index`: re-sync the cursor to the first comment
    /// at/after `node_start` (so a nested body doesn't replay earlier comments).
    fn reset_comment_index(&mut self, node_start: u32) {
        let cur = self.comments.get(self.comment_index);
        let prev = self
            .comment_index
            .checked_sub(1)
            .and_then(|i| self.comments.get(i));
        let synced =
            cur.is_some_and(|c| c.start >= node_start) && prev.is_none_or(|p| p.start < node_start);
        if synced {
            return;
        }
        self.comment_index = self
            .comments
            .iter()
            .position(|c| c.start >= node_start)
            .unwrap_or(self.comments.len());
    }

    /// The `_` wildcard's leading flush: emit comments positioned before `node`.
    fn flush_leading(&mut self, ctx: &mut Context, node_start: u32, node_start_line: u32) {
        if self.comments.is_empty() {
            return;
        }
        self.flush_comments_until(ctx, node_start, node_start_line, None, true);
    }

    /// Port of esrap's `sequence` (`languages/ts/index.js`). Lays `nodes` out as
    /// a separator-joined comma list, threading comments through the shared
    /// `comment_index` cursor: each node is rendered, its separator written, and
    /// its **trailing** comments flushed in source order (so a comment after a
    /// node's separator — e.g. `foo: 1, /* c */ bar` — attaches to that node, not
    /// as a leading comment of the next). After the layout, end-of-list comments
    /// up to `until` are flushed.
    ///
    /// `until` is the byte offset that closes the list (e.g. the `}` / `]`); used
    /// as the `next` boundary for the final node's trailing comments and as the
    /// limit for the closing `flush_comments_until`.
    fn sequence(
        &mut self,
        mut nodes: Vec<SeqNode<'_>>,
        until: Option<u32>,
        pad: bool,
        separator: &str,
        trailing_newline: bool,
        parent: &mut Context,
    ) {
        let n = nodes.len();
        let mut multiline = false;
        let mut length: i64 = -1;

        // Each node's start, for use as the *next* node's trailing-comment
        // boundary (precomputed so the render loop can borrow `nodes` mutably).
        let starts: Vec<Option<u32>> = nodes.iter().map(|node| node.start).collect();

        // First pass — render each child, write its separator, then flush its
        // trailing comments. This must interleave with rendering (not run after
        // all children are built) because the single forward `comment_index`
        // cursor would otherwise hand item[i]'s trailing comment to item[i+1] as
        // a leading comment.
        let mut items: Vec<SeqItem> = Vec::with_capacity(n);
        for (i, node) in nodes.iter_mut().enumerate() {
            let mut child = parent.child();
            (node.render)(self, &mut child);

            let node_multiline = child.multiline;

            // esrap writes the separator for every non-final element, and also
            // for a trailing elision (`[a, ,]`): `i < n-1 || !child`.
            if i < n - 1 || node.is_elision {
                child.write(separator);
            }

            // `next` boundary for this node's trailing comments: the next node's
            // start, or `until` for the final node.
            let next = if i == n - 1 { until } else { starts[i + 1] };
            if let Some(end) = node.end {
                self.flush_trailing_comments(&mut child, self.line_of(end), next);
            }

            length += child.measure() as i64 + 1;
            multiline |= child.multiline;

            items.push(SeqItem {
                ctx: child,
                multiline: node_multiline,
                obj_or_array: node.obj_or_array,
                is_elision: node.is_elision,
            });
        }

        multiline |= length > 60;

        if multiline {
            parent.indent();
            parent.newline();
        } else if pad && length > 0 {
            parent.write(" ");
        }

        let mut prev: Option<(bool, bool)> = None;
        for item in items {
            if let Some((prev_multiline, prev_obj)) = prev {
                if prev_multiline && item.multiline && !(prev_obj && item.obj_or_array) {
                    parent.margin();
                }
                if !item.is_elision {
                    if multiline {
                        parent.newline();
                    } else {
                        parent.write(" ");
                    }
                }
            }
            prev = Some((item.multiline, item.obj_or_array));
            parent.append(item.ctx);
        }

        // esrap: flush_comments_until(context, lastNode.loc.end, until, false).
        if let Some(until) = until {
            let from_line = nodes
                .last()
                .and_then(|node| node.end)
                .map(|e| self.line_of(e));
            self.flush_comments_until(parent, until, self.line_of(until), from_line, false);
        }

        if multiline {
            parent.dedent();
            if trailing_newline {
                parent.newline();
            }
        } else if pad && length > 0 {
            parent.write(" ");
        }
    }

    fn unsupported(&mut self, kind: &'static str, ctx: &mut Context) {
        if self.missing.is_none() {
            self.missing = Some(Unsupported(kind));
        }
        // Emit a marker so output is obviously wrong if a miss slips through a
        // test that forgot to check `missing`.
        ctx.write(format!("/*unsupported:{kind}*/"));
    }

    // ----- statements -------------------------------------------------------

    pub fn print_program(&mut self, program: &Program, ctx: &mut Context) {
        let span = program.span();
        // Directives (`"use strict"`) are a separate oxc node, but esrap (from
        // an acorn AST) sees them as leading string-literal ExpressionStatements
        // in `body`; thread them through the same `body` sequence so margins and
        // leading comments are computed identically.
        let mut elems: Vec<BodyElem> = program.directives.iter().map(BodyElem::Directive).collect();
        elems.extend(program.body.iter().map(BodyElem::Statement));
        self.body_elems(&elems, span.start, span.end, ctx);
    }

    /// esrap's `body`: statements on their own lines, with a blank line between
    /// two multiline statements or a change of statement kind, interleaving
    /// leading (before each statement), trailing (same-line), and end-of-body
    /// comments. `body_end` is the byte offset that closes the body (program
    /// end, or the `}` of a block).
    fn body(
        &mut self,
        statements: &[Statement],
        body_start: u32,
        body_end: u32,
        ctx: &mut Context,
    ) {
        let elems: Vec<BodyElem> = statements.iter().map(BodyElem::Statement).collect();
        self.body_elems(&elems, body_start, body_end, ctx);
    }

    /// The element-based core of [`Self::body`], shared by `print_program` so a
    /// program's leading directives participate in the same margin/comment pass.
    fn body_elems(
        &mut self,
        elems: &[BodyElem],
        body_start: u32,
        body_end: u32,
        ctx: &mut Context,
    ) {
        // esrap filters `EmptyStatement` (`;`) nodes from statement-list bodies
        // (matching the server AST + official esrap). The client `to_oxc` path,
        // which parses string-codegen `Raw` `;;` into real EmptyStatement nodes the
        // official COMPILER output keeps, opts into preserving them.
        let non_empty: Vec<&BodyElem> = if self.options.keep_empty_statements {
            elems.iter().collect()
        } else {
            elems.iter().filter(|e| !e.is_empty_stmt()).collect()
        };
        // Re-sync to the body's own start so a leading comment that precedes the
        // first statement (e.g. a file header) isn't skipped over.
        self.reset_comment_index(body_start);

        let mut prev: Option<(&BodyElem, bool)> = None;
        for (i, elem) in non_empty.iter().enumerate() {
            let mut child = ctx.child();
            elem.print(self, &mut child);

            if let Some((prev_elem, prev_multiline)) = prev {
                if child.multiline || prev_multiline || !elem.same_kind(prev_elem) {
                    ctx.margin();
                }
                ctx.newline();
            }
            let multiline = child.multiline;
            ctx.append(child);

            let end_line = self.line_of(elem.span_end());
            let next = non_empty.get(i + 1).map(|e| e.span_start());
            self.flush_trailing_comments(ctx, end_line, next);

            prev = Some((elem, multiline));
        }

        // esrap's body tail (`if (node.loc)`) runs unconditionally: a trailing
        // newline closes the body (a no-op flag at top level — nothing follows
        // to flush it), then any comments up to the body end. Doing this even
        // for an empty body emits an interior comment inside an otherwise empty
        // block (`() => { /* x */ }`); the lone pending newline keeps the block
        // `empty()`, so a comment-free `{}` is unaffected.
        ctx.newline();
        if !self.comments.is_empty() {
            let from_line = non_empty.last().map(|e| self.line_of(e.span_end()));
            self.flush_comments_until(ctx, body_end, self.line_of(body_end), from_line, false);
        }
    }

    /// A program/function-body directive (`"use strict";`), printed like the
    /// string-literal ExpressionStatement esrap sees.
    fn print_directive(&mut self, d: &Directive, ctx: &mut Context) {
        let start = d.span.start;
        self.flush_leading(ctx, start, self.line_of(start));
        ctx.write(self.string_literal(&d.expression));
        ctx.write(";");
    }

    fn print_statement(&mut self, stmt: &Statement, ctx: &mut Context) {
        // esrap's `_` wildcard order: hook-supplied leading comments, then the
        // real leading-comment flush + node, then hook-supplied trailing comments.
        if let Some(hooks) = self.hooks
            && let Some(f) = &hooks.get_leading
        {
            let synth = f(stmt);
            self.write_additional_comments(&synth, true, ctx);
        }
        self.print_statement_inner(stmt, ctx);
        if let Some(hooks) = self.hooks
            && let Some(f) = &hooks.get_trailing
        {
            let synth = f(stmt);
            self.write_additional_comments(&synth, false, ctx);
        }
    }

    fn print_statement_inner(&mut self, stmt: &Statement, ctx: &mut Context) {
        // esrap's `_` wildcard: emit comments positioned before this node first.
        let start = stmt.span().start;
        self.flush_leading(ctx, start, self.line_of(start));
        match stmt {
            Statement::ExpressionStatement(s) => {
                // esrap wraps a leading object/function-expression statement in
                // parens so it isn't parsed as a block/declaration. The check is
                // on the leftmost token; `unparen` looks through explicit paren
                // nodes (which acorn elides) so `({ a: 1 });` re-wraps correctly.
                let inner = unparen(&s.expression);
                let needs_parens = matches!(
                    inner,
                    Expression::ObjectExpression(_) | Expression::FunctionExpression(_)
                ) || matches!(inner, Expression::AssignmentExpression(a)
                    if matches!(a.left, AssignmentTarget::ObjectAssignmentTarget(_)));
                if needs_parens {
                    ctx.write("(");
                    self.print_expression(inner, ctx);
                    ctx.write(");");
                } else {
                    self.print_expression(inner, ctx);
                    ctx.write(";");
                }
            }
            Statement::VariableDeclaration(d) => {
                self.variable_declaration(d, ctx);
                ctx.write(";");
            }
            Statement::ReturnStatement(s) => {
                if let Some(arg) = &s.argument {
                    // esrap: when a comment sits between `return` and the
                    // argument, wrap the argument in parens (`return (/*c*/ x);`)
                    // so the comment can't be read as ending the statement.
                    let contains_comment = self
                        .comments
                        .get(self.comment_index)
                        .is_some_and(|c| c.start < arg.span().start);
                    let start = s.span().start;
                    if contains_comment {
                        self.write_keyword(ctx, start, "return", " (");
                        self.print_expression(arg, ctx);
                        ctx.write(");");
                    } else {
                        self.write_keyword(ctx, start, "return", " ");
                        self.print_expression(arg, ctx);
                        ctx.write(";");
                    }
                } else {
                    self.write_keyword(ctx, s.span().start, "return", ";");
                }
            }
            Statement::BlockStatement(b) => {
                let span = b.span();
                self.block(&b.body, span.start, span.end, ctx)
            }
            Statement::FunctionDeclaration(f) => self.function(f, ctx),
            Statement::ClassDeclaration(c) => self.class_node(c, ctx),
            Statement::IfStatement(s) => self.if_statement(s, ctx),
            Statement::ForStatement(s) => self.for_statement(s, ctx),
            Statement::WhileStatement(s) => {
                ctx.write("while (");
                self.print_expression(&s.test, ctx);
                ctx.write(") ");
                self.print_statement(&s.body, ctx);
            }
            Statement::ThrowStatement(s) => {
                self.write_keyword(ctx, s.span().start, "throw", " ");
                self.print_expression(&s.argument, ctx);
                ctx.write(";");
            }
            Statement::DoWhileStatement(s) => self.do_while_statement(s, ctx),
            Statement::ExportAllDeclaration(s) => {
                if matches!(s.export_kind, ImportOrExportKind::Type) {
                    ctx.write("export type *");
                } else {
                    ctx.write("export *");
                }
                if let Some(exported) = &s.exported {
                    ctx.write(" as ");
                    ctx.write(module_export_name_str(exported));
                }
                ctx.write(" from ");
                ctx.write(self.string_literal(&s.source));
                ctx.write(";");
            }
            Statement::ImportDeclaration(d) => self.import_declaration(d, ctx),
            Statement::ExportNamedDeclaration(d) => self.export_named_declaration(d, ctx),
            Statement::ExportDefaultDeclaration(d) => self.export_default_declaration(d, ctx),
            Statement::LabeledStatement(s) => {
                ctx.write(s.label.name.as_str());
                ctx.write(": ");
                self.print_statement(&s.body, ctx);
            }
            Statement::ForInStatement(s) => {
                ctx.write("for (");
                self.for_statement_left(&s.left, ctx);
                ctx.write(" in ");
                self.print_expression(&s.right, ctx);
                ctx.write(") ");
                self.print_statement(&s.body, ctx);
            }
            Statement::ForOfStatement(s) => {
                ctx.write("for ");
                if s.r#await {
                    ctx.write("await ");
                }
                ctx.write("(");
                self.for_statement_left(&s.left, ctx);
                ctx.write(" of ");
                self.print_expression(&s.right, ctx);
                ctx.write(") ");
                self.print_statement(&s.body, ctx);
            }
            Statement::TryStatement(s) => self.try_statement(s, ctx),
            Statement::SwitchStatement(s) => self.switch_statement(s, ctx),
            Statement::DebuggerStatement(_) => ctx.write("debugger;"),
            Statement::WithStatement(s) => {
                ctx.write("with (");
                self.print_expression(&s.object, ctx);
                ctx.write(") ");
                self.print_statement(&s.body, ctx);
            }
            Statement::EmptyStatement(_) => ctx.write(";"),
            Statement::BreakStatement(s) => match &s.label {
                Some(l) => ctx.write(format!("break {};", l.name)),
                None => ctx.write("break;"),
            },
            Statement::ContinueStatement(s) => match &s.label {
                Some(l) => ctx.write(format!("continue {};", l.name)),
                None => ctx.write("continue;"),
            },
            Statement::TSTypeAliasDeclaration(d) => self.type_alias_declaration(d, ctx),
            Statement::TSInterfaceDeclaration(d) => self.interface_declaration(d, ctx),
            Statement::TSEnumDeclaration(d) => self.enum_declaration(d, ctx),
            Statement::TSModuleDeclaration(d) => self.module_declaration(d, ctx),
            Statement::TSGlobalDeclaration(d) => self.global_declaration(d, ctx),
            Statement::TSImportEqualsDeclaration(d) => self.import_equals_declaration(d, ctx),
            Statement::TSExportAssignment(d) => {
                ctx.write("export = ");
                self.print_expression(&d.expression, ctx);
                ctx.write(";");
            }
            Statement::TSNamespaceExportDeclaration(d) => {
                ctx.write("export as namespace ");
                ctx.write(d.id.name.as_str());
                ctx.write(";");
            }
        }
    }

    fn import_declaration(&mut self, node: &ImportDeclaration, ctx: &mut Context) {
        if node.specifiers.as_ref().is_none_or(|v| v.is_empty()) {
            ctx.write("import ");
            ctx.write(self.string_literal(&node.source));
            ctx.write(";");
            return;
        }

        let import_type = matches!(node.import_kind, ImportOrExportKind::Type);

        let mut default_spec = None;
        let mut namespace_spec = None;
        let mut named = Vec::new();
        for s in node.specifiers.iter().flatten() {
            match s {
                ImportDeclarationSpecifier::ImportDefaultSpecifier(d) => default_spec = Some(d),
                ImportDeclarationSpecifier::ImportNamespaceSpecifier(n) => namespace_spec = Some(n),
                ImportDeclarationSpecifier::ImportSpecifier(i) => named.push(i),
            }
        }

        ctx.write("import ");
        if import_type {
            ctx.write("type ");
        }
        if let Some(d) = default_spec {
            ctx.write(d.local.name.as_str());
            if namespace_spec.is_some() || !named.is_empty() {
                ctx.write(", ");
            }
        }
        if let Some(ns) = namespace_spec {
            ctx.write(format!("* as {}", ns.local.name));
        }
        if !named.is_empty() {
            ctx.write("{");
            let nodes: Vec<SeqNode> = named
                .iter()
                .map(|s| {
                    let span = s.span();
                    SeqNode {
                        start: Some(span.start),
                        end: Some(span.end),
                        obj_or_array: false,
                        is_elision: false,
                        render: Box::new(move |p: &mut Printer, child: &mut Context| {
                            p.import_specifier(s, child);
                        }),
                    }
                })
                .collect();
            self.sequence(nodes, None, true, ",", true, ctx);
            ctx.write("}");
        }
        ctx.write(" from ");
        ctx.write(self.string_literal(&node.source));
        self.import_attributes(node.with_clause.as_deref(), ctx);
        ctx.write(";");
    }

    /// esrap's import-attributes tail: ` with { key: value, … }`.
    fn import_attributes(&mut self, clause: Option<&WithClause>, ctx: &mut Context) {
        let Some(clause) = clause else { return };
        if clause.with_entries.is_empty() {
            return;
        }
        ctx.write(" with { ");
        for (i, attr) in clause.with_entries.iter().enumerate() {
            match &attr.key {
                ImportAttributeKey::Identifier(id) => ctx.write(id.name.as_str()),
                ImportAttributeKey::StringLiteral(s) => ctx.write(self.string_literal(s)),
            }
            ctx.write(": ");
            ctx.write(self.string_literal(&attr.value));
            if i + 1 != clause.with_entries.len() {
                ctx.write(", ");
            }
        }
        ctx.write(" }");
    }

    fn import_specifier(&mut self, node: &ImportSpecifier, ctx: &mut Context) {
        if matches!(node.import_kind, ImportOrExportKind::Type) {
            ctx.write("type ");
        }
        // esrap only emits the `imported as local` form when both sides are
        // identifiers whose names differ; otherwise just the local binding.
        let imported = match &node.imported {
            ModuleExportName::IdentifierName(n) => Some(n.name.as_str()),
            ModuleExportName::IdentifierReference(n) => Some(n.name.as_str()),
            ModuleExportName::StringLiteral(_) => None,
        };
        if let Some(name) = imported
            && name != node.local.name.as_str()
        {
            ctx.write(name);
            ctx.write(" as ");
        }
        ctx.write(node.local.name.as_str());
    }

    fn export_named_declaration(&mut self, node: &ExportNamedDeclaration, ctx: &mut Context) {
        if let Some(decl) = &node.declaration {
            // A class declaration's decorators are printed *before* `export`.
            if let Declaration::ClassDeclaration(c) = decl
                && !c.decorators.is_empty()
            {
                for decorator in &c.decorators {
                    self.decorator(decorator, ctx);
                }
                self.write_keyword(ctx, node.span().start, "export", " ");
                self.class_node_no_decorators(c, ctx);
                return;
            }
            self.write_keyword(ctx, node.span().start, "export", " ");
            self.declaration(decl, ctx);
            return;
        }

        let mut kw = self.keyword_cursor(node.span().start, true);
        kw.write(ctx, "export ");
        if matches!(node.export_kind, ImportOrExportKind::Type) {
            kw.write(ctx, "type ");
        }
        ctx.write("{");
        let nodes: Vec<SeqNode> = node
            .specifiers
            .iter()
            .map(|s| {
                let span = s.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(move |p: &mut Printer, child: &mut Context| {
                        p.export_specifier(s, child);
                    }),
                }
            })
            .collect();
        self.sequence(nodes, None, true, ",", true, ctx);
        ctx.write("}");
        if let Some(source) = &node.source {
            ctx.write(" from ");
            ctx.write(self.string_literal(source));
        }
        ctx.write(";");
    }

    fn export_default_declaration(&mut self, node: &ExportDefaultDeclaration, ctx: &mut Context) {
        // esrap: `export ` then `default ` via a keyword cursor, mapped only when
        // the export is single-line (`single_line_node`).
        let map_ok = self
            .offset_to_line_col(node.span().start)
            .zip(self.offset_to_line_col(node.span().end))
            .is_some_and(|((s, _), (e, _))| s == e);
        let mut kw = self.keyword_cursor(node.span().start, map_ok);
        kw.write(ctx, "export ");
        kw.write(ctx, "default ");
        match &node.declaration {
            ExportDefaultDeclarationKind::FunctionDeclaration(f) => {
                // No trailing `;` after a function declaration.
                self.function(f, ctx);
            }
            ExportDefaultDeclarationKind::ClassDeclaration(c) => self.class_node(c, ctx),
            ExportDefaultDeclarationKind::TSInterfaceDeclaration(d) => {
                self.interface_declaration(d, ctx)
            }
            other => {
                if let Some(expr) = other.as_expression() {
                    self.print_expression(expr, ctx);
                } else {
                    self.unsupported("ExportDefault", ctx);
                }
                ctx.write(";");
            }
        }
    }

    fn template_literal(&mut self, node: &TemplateLiteral, ctx: &mut Context) {
        ctx.write("`");
        for (i, expr) in node.expressions.iter().enumerate() {
            let raw = node
                .quasis
                .get(i)
                .map(|q| q.value.raw.as_str())
                .unwrap_or("");
            ctx.write(format!("{raw}${{"));
            self.print_expression(expr, ctx);
            ctx.write("}");
            // A newline *inside* the literal makes the enclosing context
            // multiline (esrap), which drives statement-margin decisions.
            if raw.contains('\n') {
                ctx.multiline = true;
            }
        }
        if let Some(last) = node.quasis.last() {
            let raw = last.value.raw.as_str();
            ctx.write(format!("{raw}`"));
            if raw.contains('\n') {
                ctx.multiline = true;
            }
        }
    }

    fn export_specifier(&mut self, node: &ExportSpecifier, ctx: &mut Context) {
        if matches!(node.export_kind, ImportOrExportKind::Type) {
            ctx.write("type ");
        }
        let local = module_export_name_str(&node.local);
        let exported = module_export_name_str(&node.exported);
        ctx.write(local);
        if local != exported {
            ctx.write(" as ");
            ctx.write(exported);
        }
    }

    /// Print a `Declaration` node (the RHS of `export <decl>` and standalone
    /// declarations). Only the variable form is wired so far.
    fn declaration(&mut self, decl: &Declaration, ctx: &mut Context) {
        match decl {
            Declaration::VariableDeclaration(d) => {
                self.variable_declaration(d, ctx);
                ctx.write(";");
            }
            Declaration::FunctionDeclaration(f) => self.function(f, ctx),
            Declaration::ClassDeclaration(c) => self.class_node(c, ctx),
            Declaration::TSTypeAliasDeclaration(d) => self.type_alias_declaration(d, ctx),
            Declaration::TSInterfaceDeclaration(d) => self.interface_declaration(d, ctx),
            Declaration::TSEnumDeclaration(d) => self.enum_declaration(d, ctx),
            Declaration::TSModuleDeclaration(d) => self.module_declaration(d, ctx),
            Declaration::TSGlobalDeclaration(d) => self.global_declaration(d, ctx),
            Declaration::TSImportEqualsDeclaration(d) => self.import_equals_declaration(d, ctx),
        }
    }

    /// esrap's `FunctionDeclaration|FunctionExpression`:
    /// `[async ]function[* ] id(params) { body }`.
    fn function(&mut self, node: &Function, ctx: &mut Context) {
        if node.declare {
            ctx.write("declare ");
        }
        // esrap's `FunctionDeclaration|FunctionExpression`: map `async` and
        // `function` to their source spans. `async` sits at the node start;
        // `function` follows it by `"async ".len()`. The offset heuristic
        // (`function_async_function_offset_ok`) only maps when `async` and
        // `function` share a line with the id/body — true for all single-line
        // forms the keyword tests exercise.
        let start = node.span().start;
        let offset_ok = self.function_async_offset_ok(node);
        let gen_suffix = if node.generator { "* " } else { " " };
        match self.offset_to_line_col(start) {
            Some((line, column)) if node.r#async && offset_ok => {
                Self::write_source_keyword(ctx, line, column, "async ");
                let col2 = column + "async ".len() as u32;
                Self::write_source_keyword(ctx, line, col2, "function");
                ctx.write(gen_suffix);
            }
            Some((line, column)) if !node.r#async => {
                Self::write_source_keyword(ctx, line, column, "function");
                ctx.write(gen_suffix);
            }
            _ => {
                if node.r#async {
                    ctx.write("async ");
                }
                ctx.write(if node.generator {
                    "function* "
                } else {
                    "function "
                });
            }
        }
        if let Some(id) = &node.id {
            ctx.write(id.name.as_str());
        }
        if let Some(tp) = &node.type_parameters {
            self.type_parameter_declaration(tp, ctx);
        }
        ctx.write("(");
        self.formal_parameters_with_this(&node.params, node.this_param.as_deref(), ctx);
        ctx.write(")");
        if let Some(rt) = &node.return_type {
            self.type_annotation(rt, ctx);
        }
        // A `declare function`/overload has no body — esrap emits `;`.
        match &node.body {
            Some(body) => {
                ctx.write(" ");
                let span = body.span();
                self.block(&body.statements, span.start, span.end, ctx);
            }
            None => ctx.write(";"),
        }
    }

    /// esrap's `ClassDeclaration|ClassExpression`: `class [id ][extends sup ]{…}`.
    fn class_node(&mut self, node: &Class, ctx: &mut Context) {
        for decorator in &node.decorators {
            self.decorator(decorator, ctx);
        }
        self.class_node_no_decorators(node, ctx);
    }

    /// The class body sans leading decorators (already emitted by the caller —
    /// e.g. `export @dec class`, which prints decorators before `export`).
    fn class_node_no_decorators(&mut self, node: &Class, ctx: &mut Context) {
        // esrap's class modifier keyword cursor: `declare `/`abstract `/`class `
        // mapped to their source span when `class_modifier_keywords_map_ok`
        // (no decorators, id/body on the node's start line).
        let map_ok = self.class_modifier_map_ok(node);
        let mut kw = self.keyword_cursor(node.span().start, map_ok);
        if node.declare {
            kw.write(ctx, "declare ");
        }
        if node.r#abstract {
            kw.write(ctx, "abstract ");
        }
        kw.write(ctx, "class ");
        if let Some(id) = &node.id {
            ctx.write(id.name.as_str());
            if let Some(tp) = &node.type_parameters {
                self.type_parameter_declaration(tp, ctx);
            }
            ctx.write(" ");
        } else if let Some(tp) = &node.type_parameters {
            self.type_parameter_declaration(tp, ctx);
            ctx.write(" ");
        }
        if let Some(super_class) = &node.super_class {
            ctx.write("extends ");
            self.child_with_parens(super_class, 19, ctx);
            if let Some(ta) = &node.super_type_arguments {
                self.type_parameter_instantiation(ta, ctx);
            }
            ctx.write(" ");
        }
        if !node.implements.is_empty() {
            ctx.write("implements");
            let nodes: Vec<SeqNode> = node
                .implements
                .iter()
                .map(|imp| {
                    let span = imp.span();
                    SeqNode {
                        start: Some(span.start),
                        end: Some(span.end),
                        obj_or_array: false,
                        is_elision: false,
                        render: Box::new(move |p: &mut Printer, child: &mut Context| {
                            p.print_type_name(&imp.expression, child);
                            if let Some(ta) = &imp.type_arguments {
                                p.type_parameter_instantiation(ta, child);
                            }
                        }),
                    }
                })
                .collect();
            self.sequence(nodes, Some(node.body.span().start), true, ",", true, ctx);
        }
        self.class_body(&node.body, ctx);
    }

    fn decorator(&mut self, node: &Decorator, ctx: &mut Context) {
        ctx.write("@");
        self.print_expression(&node.expression, ctx);
        ctx.newline();
    }

    /// esrap's `BlockStatement|ClassBody`: route class members through the shared
    /// `body` machinery (one-per-line, blank line between two multiline members
    /// or a change of member kind) so leading / trailing / end-of-body comments
    /// are interleaved identically to a statement block.
    fn class_body(&mut self, body: &ClassBody, ctx: &mut Context) {
        let span = body.span();
        ctx.write("{");
        let mut child = ctx.child();
        let elems: Vec<BodyElem> = body
            .body
            .iter()
            // esrap's `body` only skips `EmptyStatement`; TS index signatures are
            // not statements and have no printer mapping here, so drop them.
            .filter(|e| !matches!(e, ClassElement::TSIndexSignature(_)))
            .map(BodyElem::ClassMember)
            .collect();
        self.body_elems(&elems, span.start, span.end, &mut child);
        if !child.empty() {
            ctx.indent();
            ctx.newline();
            ctx.append(child);
            ctx.dedent();
            ctx.newline();
        }
        ctx.write("}");
    }

    fn class_element(&mut self, element: &ClassElement, ctx: &mut Context) {
        // esrap's `_` wildcard flushes any comment positioned before the member
        // (e.g. a leading JSDoc block) before visiting it.
        let start = element.span().start;
        self.flush_leading(ctx, start, self.line_of(start));
        match element {
            ClassElement::MethodDefinition(m) => self.method_definition(m, ctx),
            ClassElement::PropertyDefinition(p) => self.property_definition(p, ctx),
            ClassElement::AccessorProperty(a) => self.accessor_property(a, ctx),
            ClassElement::StaticBlock(b) => {
                self.write_keyword(ctx, b.span().start, "static", " ");
                let span = b.span();
                self.block(&b.body, span.start, span.end, ctx);
            }
            _ => self.unsupported("ClassElement", ctx),
        }
    }

    fn method_definition(&mut self, node: &MethodDefinition, ctx: &mut Context) {
        for decorator in &node.decorators {
            self.decorator(decorator, ctx);
        }
        // esrap's method-modifier keyword cursor: `abstract`/accessibility/
        // `override`/`static`/`get`/`set`/`async` all mapped to their source
        // span when `method_modifiers_keywords_map_ok` (no decorators, node and
        // value start on the same line).
        let map_ok = node.decorators.is_empty() && {
            let n = self.offset_to_line_col(node.span().start).map(|(l, _)| l);
            let v = self
                .offset_to_line_col(node.value.span().start)
                .map(|(l, _)| l);
            n.is_some() && n == v
        };
        let mut kw = self.keyword_cursor(node.span().start, map_ok);
        if matches!(
            node.r#type,
            MethodDefinitionType::TSAbstractMethodDefinition
        ) {
            kw.write(ctx, "abstract ");
        }
        if let Some(acc) = &node.accessibility {
            kw.write(ctx, &format!("{} ", accessibility_str(acc)));
        }
        if node.r#override {
            kw.write(ctx, "override ");
        }
        if node.r#static {
            kw.write(ctx, "static ");
        }
        match node.kind {
            MethodDefinitionKind::Get => kw.write(ctx, "get "),
            MethodDefinitionKind::Set => kw.write(ctx, "set "),
            _ => {}
        }
        if node.value.r#async {
            kw.write(ctx, "async ");
        }
        if node.value.generator {
            ctx.write("*");
        }
        if node.computed {
            ctx.write("[");
            self.property_key(&node.key, ctx);
            ctx.write("]");
        } else {
            self.property_key(&node.key, ctx);
        }
        if node.optional {
            ctx.write("?");
        }
        if let Some(tp) = &node.value.type_parameters {
            self.type_parameter_declaration(tp, ctx);
        }
        ctx.write("(");
        self.formal_parameters(&node.value.params, ctx);
        ctx.write(")");
        if let Some(rt) = &node.value.return_type {
            self.type_annotation(rt, ctx);
        }
        ctx.write(" ");
        // esrap: an abstract method has no body — it emits only the trailing
        // space from `context.write(' ')`, leaving `abstract get a() `.
        if let Some(body) = &node.value.body {
            let span = body.span();
            self.block(&body.statements, span.start, span.end, ctx);
        }
    }

    fn property_definition(&mut self, node: &PropertyDefinition, ctx: &mut Context) {
        for decorator in &node.decorators {
            self.decorator(decorator, ctx);
        }
        if let Some(acc) = &node.accessibility {
            ctx.write(format!("{} ", accessibility_str(acc)));
        }
        if matches!(
            node.r#type,
            PropertyDefinitionType::TSAbstractPropertyDefinition
        ) {
            ctx.write("abstract ");
        }
        if node.declare {
            ctx.write("declare ");
        }
        if node.r#override {
            ctx.write("override ");
        }
        if node.r#static {
            ctx.write("static ");
        }
        if node.readonly {
            ctx.write("readonly ");
        }
        if node.computed {
            ctx.write("[");
            self.property_key(&node.key, ctx);
            ctx.write("]");
        } else {
            self.property_key(&node.key, ctx);
        }
        if node.optional {
            ctx.write("?");
        }
        if node.definite {
            ctx.write("!");
        }
        if let Some(ann) = &node.type_annotation {
            self.type_annotation(ann, ctx);
        }
        if let Some(value) = &node.value {
            ctx.write(" = ");
            self.print_expression(value, ctx);
        }
        ctx.write(";");
    }

    fn accessor_property(&mut self, node: &AccessorProperty, ctx: &mut Context) {
        for decorator in &node.decorators {
            self.decorator(decorator, ctx);
        }
        if let Some(acc) = &node.accessibility {
            ctx.write(format!("{} ", accessibility_str(acc)));
        }
        if matches!(
            node.r#type,
            AccessorPropertyType::TSAbstractAccessorProperty
        ) {
            ctx.write("abstract ");
        }
        if node.r#static {
            ctx.write("static ");
        }
        ctx.write("accessor ");
        if node.computed {
            ctx.write("[");
            self.property_key(&node.key, ctx);
            ctx.write("]");
        } else {
            self.property_key(&node.key, ctx);
        }
        if node.definite {
            ctx.write("!");
        }
        if let Some(ann) = &node.type_annotation {
            self.type_annotation(ann, ctx);
        }
        if let Some(value) = &node.value {
            ctx.write(" = ");
            self.print_expression(value, ctx);
        }
        ctx.write(";");
    }

    fn if_statement(&mut self, node: &IfStatement, ctx: &mut Context) {
        self.write_keyword(ctx, node.span().start, "if", " (");
        self.print_expression(&node.test, ctx);
        ctx.write(") ");
        self.print_statement(&node.consequent, ctx);
        if let Some(alternate) = &node.alternate {
            ctx.space();
            // esrap maps `else` to a *computed* offset: one past the end of the
            // consequent, when the alternate begins on the consequent's end line
            // and starts at column >= 4 (room for the literal `else`). Otherwise
            // it writes an unmapped `else `.
            let con_end = self.offset_to_line_col(node.consequent.span().end);
            let alt_start = self.offset_to_line_col(alternate.span().start);
            match (con_end, alt_start) {
                (Some((ce_line, ce_col)), Some((al_line, al_col)))
                    if ce_line == al_line && al_col >= 4 =>
                {
                    Self::write_source_keyword(ctx, ce_line, ce_col + 1, "else");
                    ctx.write(" ");
                }
                _ => ctx.write("else "),
            }
            self.print_statement(alternate, ctx);
        }
    }

    fn do_while_statement(&mut self, node: &DoWhileStatement, ctx: &mut Context) {
        self.write_keyword(ctx, node.span().start, "do", " ");
        self.print_statement(&node.body, ctx);
        // esrap maps the trailing `while` to a computed offset (one past the body
        // end) when the test begins on the body's end line at column >= 6.
        let body_end = self.offset_to_line_col(node.body.span().end);
        let test_start = self.offset_to_line_col(node.test.span().start);
        match (body_end, test_start) {
            (Some((be_line, be_col)), Some((t_line, t_col))) if be_line == t_line && t_col >= 6 => {
                ctx.write(" ");
                Self::write_source_keyword(ctx, be_line, be_col + 1, "while");
                ctx.write(" (");
            }
            _ => ctx.write(" while ("),
        }
        self.print_expression(&node.test, ctx);
        ctx.write(");");
    }

    fn for_statement(&mut self, node: &ForStatement, ctx: &mut Context) {
        ctx.write("for (");
        if let Some(init) = &node.init {
            match init {
                ForStatementInit::VariableDeclaration(d) => self.variable_declaration(d, ctx),
                _ => {
                    if let Some(e) = init.as_expression() {
                        self.print_expression(e, ctx);
                    }
                }
            }
        }
        ctx.write("; ");
        if let Some(test) = &node.test {
            self.print_expression(test, ctx);
        }
        ctx.write("; ");
        if let Some(update) = &node.update {
            self.print_expression(update, ctx);
        }
        ctx.write(") ");
        self.print_statement(&node.body, ctx);
    }

    /// The binding of a `for…in` / `for…of` head: a declaration or a target.
    fn for_statement_left(&mut self, left: &ForStatementLeft, ctx: &mut Context) {
        match left {
            ForStatementLeft::VariableDeclaration(d) => self.variable_declaration(d, ctx),
            _ => match left.as_assignment_target() {
                Some(t) => self.assignment_target(t, ctx),
                None => self.unsupported("ForStatementLeft", ctx),
            },
        }
    }

    /// esrap's `TryStatement`: `try {…}` + optional `catch (p) {…}` + `finally {…}`.
    fn try_statement(&mut self, node: &TryStatement, ctx: &mut Context) {
        self.write_keyword(ctx, node.span().start, "try", " ");
        let span = node.block.span();
        self.block(&node.block.body, span.start, span.end, ctx);
        if let Some(handler) = &node.handler {
            ctx.write(" ");
            if let Some(param) = &handler.param {
                // esrap emits `catch(e)` with no space after the keyword.
                self.write_keyword(ctx, handler.span().start, "catch", "(");
                self.binding_pattern(&param.pattern, ctx);
                ctx.write(") ");
            } else {
                self.write_keyword(ctx, handler.span().start, "catch", " ");
            }
            let span = handler.body.span();
            self.block(&handler.body.body, span.start, span.end, ctx);
        }
        if let Some(finalizer) = &node.finalizer {
            // esrap maps `finally` to a computed offset (one past the previous
            // block end) when the finalizer begins on the prev block's end line
            // at column >= 7. Otherwise an unmapped ` finally `.
            let prev_end = node
                .handler
                .as_ref()
                .map(|h| h.span().end)
                .unwrap_or(node.block.span().end);
            let prev = self.offset_to_line_col(prev_end);
            let fin = self.offset_to_line_col(finalizer.span().start);
            match (prev, fin) {
                (Some((p_line, p_col)), Some((f_line, f_col)))
                    if p_line == f_line && f_col >= 7 =>
                {
                    ctx.write(" ");
                    Self::write_source_keyword(ctx, p_line, p_col + 1, "finally");
                    ctx.write(" ");
                }
                _ => ctx.write(" finally "),
            }
            let span = finalizer.span();
            self.block(&finalizer.body, span.start, span.end, ctx);
        }
    }

    /// esrap's `SwitchStatement`: `switch (disc) {`, each case indented with a
    /// blank-line margin between cases, statements one-per-line.
    fn switch_statement(&mut self, node: &SwitchStatement, ctx: &mut Context) {
        self.write_keyword(ctx, node.span().start, "switch", " (");
        self.print_expression(&node.discriminant, ctx);
        ctx.write(") {");
        ctx.indent();

        for (i, case) in node.cases.iter().enumerate() {
            if i > 0 {
                ctx.margin();
            }
            ctx.newline();
            match &case.test {
                Some(test) => {
                    self.write_keyword(ctx, case.span().start, "case", " ");
                    self.print_expression(test, ctx);
                    ctx.write(":");
                }
                None => self.write_keyword(ctx, case.span().start, "default", ":"),
            }
            ctx.indent();
            for stmt in &case.consequent {
                ctx.newline();
                self.print_statement(stmt, ctx);
            }
            ctx.dedent();
        }

        ctx.dedent();
        ctx.newline();
        ctx.write("}");
    }

    fn object_pattern(&mut self, node: &ObjectPattern, ctx: &mut Context) {
        ctx.write("{");
        let mut nodes: Vec<SeqNode> = node
            .properties
            .iter()
            .map(|prop| {
                let span = prop.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(move |p: &mut Printer, child: &mut Context| {
                        // esrap's `sequence` visits each property through the `_`
                        // wildcard, which flushes any comment positioned before it
                        // (`{ a, /* c */ b } = x` or a `// line` comment before a
                        // destructured prop). Mirror that per property — a `// line`
                        // comment also forces the sequence multiline (via the
                        // `newline()` in `write_comment`), so it can't swallow the
                        // following token (`tabindex = // c 0` → unparseable).
                        p.flush_leading(child, span.start, p.line_of(span.start));
                        p.binding_property(prop, child);
                    }),
                }
            })
            .collect();
        if let Some(rest) = &node.rest {
            let span = rest.span();
            nodes.push(SeqNode {
                start: Some(span.start),
                end: Some(span.end),
                obj_or_array: false,
                is_elision: false,
                render: Box::new(move |p: &mut Printer, child: &mut Context| {
                    p.flush_leading(child, span.start, p.line_of(span.start));
                    child.write("...");
                    p.binding_pattern(&rest.argument, child);
                }),
            });
        }
        self.sequence(nodes, Some(node.span().end), true, ",", true, ctx);
        ctx.write("}");
    }

    fn binding_property(&mut self, node: &BindingProperty, ctx: &mut Context) {
        if node.shorthand {
            self.binding_pattern(&node.value, ctx);
            return;
        }
        if node.computed {
            ctx.write("[");
            self.property_key(&node.key, ctx);
            ctx.write("]: ");
        } else {
            self.property_key(&node.key, ctx);
            ctx.write(": ");
        }
        self.binding_pattern(&node.value, ctx);
    }

    fn array_pattern(&mut self, node: &ArrayPattern, ctx: &mut Context) {
        ctx.write("[");
        let mut nodes: Vec<SeqNode> = node
            .elements
            .iter()
            .map(|el| {
                let span = el.as_ref().map(|p| p.span());
                SeqNode {
                    start: span.map(|s| s.start),
                    end: span.map(|s| s.end),
                    obj_or_array: false,
                    is_elision: el.is_none(),
                    render: Box::new(move |p: &mut Printer, child: &mut Context| {
                        if let Some(pattern) = el {
                            p.binding_pattern(pattern, child);
                        }
                    }),
                }
            })
            .collect();
        if let Some(rest) = &node.rest {
            let span = rest.span();
            nodes.push(SeqNode {
                start: Some(span.start),
                end: Some(span.end),
                obj_or_array: false,
                is_elision: false,
                render: Box::new(move |p: &mut Printer, child: &mut Context| {
                    child.write("...");
                    p.binding_pattern(&rest.argument, child);
                }),
            });
        }
        self.sequence(nodes, Some(node.span().end), false, ",", true, ctx);
        ctx.write("]");
    }

    /// Parameter list via esrap's `sequence` (no padding): `a, b, ...rest`.
    fn formal_parameters(&mut self, params: &FormalParameters, ctx: &mut Context) {
        self.formal_parameters_with_this(params, None, ctx);
    }

    /// As [`Self::formal_parameters`], but with a leading `this: T` parameter —
    /// esrap (from an acorn AST) sees `this` as the first ordinary parameter.
    fn formal_parameters_with_this(
        &mut self,
        params: &FormalParameters,
        this_param: Option<&TSThisParameter>,
        ctx: &mut Context,
    ) {
        let mut nodes: Vec<SeqNode> = Vec::new();
        if let Some(tp) = this_param {
            let span = tp.span;
            nodes.push(SeqNode {
                start: Some(span.start),
                end: Some(span.end),
                obj_or_array: false,
                is_elision: false,
                render: Box::new(move |p: &mut Printer, child: &mut Context| {
                    child.write("this");
                    if let Some(ann) = &tp.type_annotation {
                        p.type_annotation(ann, child);
                    }
                }),
            });
        }
        nodes.extend(params.items.iter().map(|param| {
            let span = param.span();
            SeqNode {
                start: Some(span.start),
                end: Some(span.end),
                obj_or_array: false,
                is_elision: false,
                render: Box::new(move |p: &mut Printer, child: &mut Context| {
                    // TS parameter properties (`constructor(private readonly x: T)`).
                    if let Some(acc) = &param.accessibility {
                        child.write(format!("{} ", accessibility_str(acc)));
                    }
                    if param.readonly {
                        child.write("readonly ");
                    }
                    if param.r#override {
                        child.write("override ");
                    }
                    p.binding_pattern(&param.pattern, child);
                    if param.optional {
                        child.write("?");
                    }
                    if let Some(ann) = &param.type_annotation {
                        p.type_annotation(ann, child);
                    }
                    // Default value: oxc stores parameter defaults on
                    // `FormalParameter::initializer`, not as an
                    // `AssignmentPattern`.
                    if let Some(init) = &param.initializer {
                        child.write(" = ");
                        p.print_expression(init, child);
                    }
                }),
            }
        }));
        if let Some(rest) = &params.rest {
            let span = rest.span();
            nodes.push(SeqNode {
                start: Some(span.start),
                end: Some(span.end),
                obj_or_array: false,
                is_elision: false,
                render: Box::new(move |p: &mut Printer, child: &mut Context| {
                    child.write("...");
                    p.binding_pattern(&rest.rest.argument, child);
                    if let Some(ann) = &rest.type_annotation {
                        p.type_annotation(ann, child);
                    }
                }),
            });
        }
        // esrap passes the closing `)` location as `until`, but the Rust caller
        // already owns the parens around `formal_parameters`; there is no node
        // span for the list itself, so no end-of-list comment flush is needed
        // here (params rarely carry trailing comments in the corpus).
        self.sequence(nodes, None, false, ",", true, ctx);
    }

    /// esrap's `ArrowFunctionExpression`: `[async ](params) => body`, wrapping an
    /// object concise body in parens so it isn't read as a block.
    fn arrow_function(&mut self, node: &ArrowFunctionExpression, ctx: &mut Context) {
        if node.r#async {
            ctx.write("async ");
        }
        if let Some(tp) = &node.type_parameters {
            self.type_parameter_declaration(tp, ctx);
        }
        ctx.write("(");
        self.formal_parameters(&node.params, ctx);
        ctx.write(")");
        if let Some(rt) = &node.return_type {
            self.type_annotation(rt, ctx);
        }
        ctx.write(" => ");
        if node.expression {
            // Concise body: a single `ExpressionStatement` holds the expression.
            if let Some(Statement::ExpressionStatement(es)) = node.body.statements.first() {
                let body = &es.expression;
                if arrow_concise_body_needs_wrap(body) {
                    ctx.write("(");
                    self.print_expression(body, ctx);
                    ctx.write(")");
                } else {
                    self.print_expression(body, ctx);
                }
            }
        } else {
            let span = node.body.span();
            self.block(&node.body.statements, span.start, span.end, ctx);
        }
    }

    /// esrap's `BlockStatement|ClassBody`: build the body into a child context,
    /// and only break it across lines when it has real content (so an empty body
    /// stays `{}`). The `Newline`s are idempotent flags, so body's trailing
    /// newline and the closing one collapse to a single line break before `}`.
    fn block(&mut self, body: &[Statement], body_start: u32, body_end: u32, ctx: &mut Context) {
        ctx.write("{");
        let mut child = ctx.child();
        self.body(body, body_start, body_end, &mut child);
        if !child.empty() {
            ctx.indent();
            ctx.newline();
            ctx.append(child);
            ctx.dedent();
            ctx.newline();
        }
        ctx.write("}");
    }

    /// esrap's `handle_var_declaration` (not the generic `sequence`): break the
    /// declarators one-per-line — joined by `,\n` and indented — when any
    /// declarator is itself multiline (e.g. carries a leading comment) or there
    /// is more than one and they don't fit (`measure + 2*(n-1) > 50`).
    fn variable_declaration(&mut self, decl: &VariableDeclaration, ctx: &mut Context) {
        // esrap's `handle_var_declaration`: a keyword cursor anchored at the
        // declaration start writes `declare ` (if present) then the kind keyword,
        // each mapped to its source span so breakpoints land on `let`/`const`/etc.
        let keyword = match decl.kind {
            VariableDeclarationKind::Var => "var ",
            VariableDeclarationKind::Let => "let ",
            VariableDeclarationKind::Const => "const ",
            VariableDeclarationKind::Using => "using ",
            VariableDeclarationKind::AwaitUsing => "await using ",
        };
        let mut kw = self.keyword_cursor(decl.span().start, true);
        if decl.declare {
            kw.write(ctx, "declare ");
        }
        kw.write(ctx, keyword);

        let n = decl.declarations.len();
        let mut rendered: Vec<Context> = Vec::with_capacity(n);
        // esrap measures the whole `child_context`, which includes the keyword,
        // so the fit test sees `let `/`const ` etc. as part of the length.
        let mut total_measure = keyword.len();
        let mut any_multiline = false;
        for declarator in &decl.declarations {
            let mut child = ctx.child();
            let start = declarator.span().start;
            self.flush_leading(&mut child, start, self.line_of(start));
            self.binding_pattern(&declarator.id, &mut child);
            if declarator.definite {
                child.write("!");
            }
            if let Some(ann) = &declarator.type_annotation {
                self.type_annotation(ann, &mut child);
            }
            if let Some(init) = &declarator.init {
                child.write(" = ");
                self.print_expression(init, &mut child);
            }
            total_measure += child.measure();
            any_multiline |= child.multiline;
            rendered.push(child);
        }

        let length = total_measure + 2 * n.saturating_sub(1);
        let multiline = any_multiline || (n > 1 && length > 50);

        if multiline {
            if n > 1 {
                ctx.indent();
            }
            for (i, child) in rendered.into_iter().enumerate() {
                if i > 0 {
                    ctx.write(",");
                    ctx.newline();
                }
                ctx.append(child);
            }
            if n > 1 {
                ctx.dedent();
            }
        } else {
            for (i, child) in rendered.into_iter().enumerate() {
                if i > 0 {
                    ctx.write(", ");
                }
                ctx.append(child);
            }
        }
    }

    fn binding_pattern(&mut self, pattern: &BindingPattern, ctx: &mut Context) {
        match pattern {
            BindingPattern::BindingIdentifier(id) => ctx.write(id.name.as_str()),
            BindingPattern::AssignmentPattern(a) => {
                self.binding_pattern(&a.left, ctx);
                ctx.write(" = ");
                self.print_expression(&a.right, ctx);
            }
            BindingPattern::ObjectPattern(o) => self.object_pattern(o, ctx),
            BindingPattern::ArrayPattern(a) => self.array_pattern(a, ctx),
        }
    }

    // ----- expressions ------------------------------------------------------

    fn print_expression(&mut self, expr: &Expression, ctx: &mut Context) {
        // esrap's `_` wildcard: emit comments positioned before this node first.
        let start = expr.span().start;
        self.flush_leading(ctx, start, self.line_of(start));
        match expr {
            Expression::ParenthesizedExpression(p) => {
                // esrap parses with acorn, which ELIDES parentheses — there is
                // no `ParenthesizedExpression` node, so esrap recomputes every
                // paren purely from operator/precedence rules (`needs_parens`).
                // oxc instead PRESERVES explicit parens as this node. To match
                // esrap byte-for-byte we UNWRAP it and print the inner
                // expression, letting the precedence-based parenthesisation
                // (`child_with_parens` / `binary_needs_parens` at each parent)
                // re-add only the parens the grammar requires.
                //
                // Two exceptions keep the literal parens:
                //
                // 1. A comment inside the paren span: dropping the parens would
                //    leave the interior comment dangling (`return (/*c*/ x)`,
                //    `return (// hey\n x)`). The comment is flushed as a leading
                //    comment of the inner expression, so the parens must stay to
                //    bracket it as in the source.
                // 2. A sequence: `(a, b)` parses as `Paren(Sequence)`, and the
                //    `SequenceExpression` visitor already emits its own
                //    surrounding parens, so the paren layer is dropped to avoid
                //    doubling. (An explicit redundant `((a, b))` is handled
                //    recursively — the outer layer here, the inner by the
                //    sequence visitor.)
                if matches!(p.expression, Expression::SequenceExpression(_)) {
                    self.print_expression(&p.expression, ctx);
                } else if self.comment_in_span(p.span.start, p.span.end) {
                    ctx.write("(");
                    self.print_expression(&p.expression, ctx);
                    ctx.write(")");
                } else {
                    self.print_expression(&p.expression, ctx);
                }
            }
            Expression::ChainExpression(c) => match &c.expression {
                ChainElement::CallExpression(call) => self.call_expression(call, ctx),
                ChainElement::StaticMemberExpression(m) => self.static_member(m, ctx),
                ChainElement::ComputedMemberExpression(m) => self.computed_member(m, ctx),
                ChainElement::PrivateFieldExpression(_) => {
                    self.unsupported("PrivateFieldExpression", ctx)
                }
                _ => self.unsupported("ChainElement", ctx),
            },
            Expression::Identifier(id) => ctx.write(id.name.as_str()),
            Expression::ThisExpression(_) => ctx.write("this"),
            Expression::BooleanLiteral(b) => ctx.write(if b.value { "true" } else { "false" }),
            Expression::NullLiteral(_) => ctx.write("null"),
            Expression::NumericLiteral(n) => ctx
                .write(literal_raw(n.raw.as_ref().map(|a| a.as_str()), || {
                    n.value.to_string()
                })),
            Expression::BigIntLiteral(n) => ctx
                .write(literal_raw(n.raw.as_ref().map(|a| a.as_str()), || {
                    format!("{}n", n.value)
                })),
            Expression::StringLiteral(s) => ctx.write(self.string_literal(s)),
            Expression::TemplateLiteral(t) => self.template_literal(t, ctx),
            Expression::BinaryExpression(b) => self.binary_expression(b, ctx),
            Expression::LogicalExpression(l) => self.logical_expression(l, ctx),
            Expression::UnaryExpression(u) => self.unary_expression(u, ctx),
            Expression::CallExpression(c) => self.call_expression(c, ctx),
            Expression::StaticMemberExpression(m) => self.static_member(m, ctx),
            Expression::ComputedMemberExpression(m) => self.computed_member(m, ctx),
            Expression::ArrayExpression(a) => self.array_expression(a, ctx),
            Expression::ObjectExpression(o) => self.object_expression(o, ctx),
            Expression::AssignmentExpression(a) => self.assignment_expression(a, ctx),
            Expression::ConditionalExpression(c) => self.conditional_expression(c, ctx),
            Expression::ArrowFunctionExpression(a) => self.arrow_function(a, ctx),
            Expression::FunctionExpression(f) => self.function(f, ctx),
            Expression::ClassExpression(c) => self.class_node(c, ctx),
            Expression::PrivateFieldExpression(m) => {
                self.child_with_parens(&m.object, 19, ctx);
                ctx.write(if m.optional { "?." } else { "." });
                ctx.write(format!("#{}", m.field.name));
            }
            Expression::MetaProperty(m) => {
                ctx.write(m.meta.name.as_str());
                ctx.write(".");
                ctx.write(m.property.name.as_str());
            }
            Expression::AwaitExpression(a) => {
                // esrap's `AwaitExpression`: map `await` to its source span, then
                // `' ('`/arg/`')'` when the argument is below await's precedence
                // (17), else `' '`/arg. Text is unchanged from `await ` + parens.
                let start = a.span().start;
                if expr_precedence(&a.argument) < 17 {
                    self.write_keyword(ctx, start, "await", " (");
                    self.print_expression(&a.argument, ctx);
                    ctx.write(")");
                } else {
                    self.write_keyword(ctx, start, "await", " ");
                    self.print_expression(&a.argument, ctx);
                }
            }
            Expression::Super(_) => ctx.write("super"),
            Expression::YieldExpression(y) => {
                ctx.write(if y.delegate { "yield*" } else { "yield" });
                if let Some(arg) = &y.argument {
                    ctx.write(" ");
                    self.print_expression(arg, ctx);
                }
            }
            Expression::RegExpLiteral(r) => match &r.raw {
                Some(raw) => ctx.write(raw.as_str()),
                None => ctx.write(format!("/{}/{}", r.regex.pattern.text, r.regex.flags)),
            },
            Expression::TaggedTemplateExpression(t) => {
                self.print_expression(&t.tag, ctx);
                self.template_literal(&t.quasi, ctx);
            }
            Expression::NewExpression(n) => {
                ctx.write("new ");
                // `new` binds tighter than a call, so a callee whose member-spine
                // contains a CallExpression (`$.get(x).Member`) — or a
                // ChainExpression — must be parenthesized, else `new a().b(c)`
                // would parse the trailing `(c)` as the `new` arguments. Mirrors
                // esrap's `has_call_expression` clause.
                let callee = unparen(&n.callee);
                if matches!(callee, Expression::ChainExpression(_))
                    || callee_has_call_expression(callee)
                {
                    ctx.write("(");
                    self.print_expression(&n.callee, ctx);
                    ctx.write(")");
                } else {
                    self.child_with_parens(&n.callee, 19, ctx);
                }
                self.call_arguments(&n.arguments, n.span().end, ctx);
            }
            Expression::UpdateExpression(u) => {
                let op = u.operator.as_str();
                if u.prefix {
                    ctx.write(op.to_string());
                    self.simple_assignment_target(&u.argument, ctx);
                } else {
                    self.simple_assignment_target(&u.argument, ctx);
                    ctx.write(op.to_string());
                }
            }
            Expression::SequenceExpression(s) => self.sequence_expression(s, ctx),
            Expression::ImportExpression(n) => {
                // esrap's `ImportExpression`: `import(source[, options])`.
                ctx.write("import(");
                self.print_expression(&n.source, ctx);
                if let Some(options) = &n.options {
                    ctx.write(", ");
                    self.print_expression(options, ctx);
                }
                ctx.write(")");
            }
            Expression::TSAsExpression(e) => {
                self.child_with_parens(&e.expression, 13, ctx);
                ctx.write(" as ");
                self.print_type(&e.type_annotation, ctx);
            }
            Expression::TSSatisfiesExpression(e) => {
                self.child_with_parens(&e.expression, 13, ctx);
                ctx.write(" satisfies ");
                self.print_type(&e.type_annotation, ctx);
            }
            Expression::TSNonNullExpression(e) => {
                self.child_with_parens(&e.expression, 18, ctx);
                ctx.write("!");
            }
            Expression::TSTypeAssertion(e) => {
                ctx.write("<");
                self.print_type(&e.type_annotation, ctx);
                ctx.write(">");
                self.child_with_parens(&e.expression, 18, ctx);
            }
            Expression::TSInstantiationExpression(e) => {
                self.print_expression(&e.expression, ctx);
                self.type_parameter_instantiation(&e.type_arguments, ctx);
            }
            Expression::JSXElement(e) => self.jsx_element(e, ctx),
            Expression::JSXFragment(f) => self.jsx_fragment(f, ctx),
            other => self.unsupported(expression_kind(other), ctx),
        }
    }

    // ----- JSX (port of esrap's `languages/tsx`) ---------------------------

    fn jsx_element(&mut self, node: &JSXElement, ctx: &mut Context) {
        // oxc derives self-closing from the absence of a closing element.
        self.jsx_opening_element(&node.opening_element, node.closing_element.is_none(), ctx);
        if !node.children.is_empty() {
            ctx.indent();
        }
        for child in &node.children {
            self.jsx_child(child, ctx);
        }
        if !node.children.is_empty() {
            ctx.dedent();
        }
        if let Some(closing) = &node.closing_element {
            ctx.write("</");
            self.jsx_element_name(&closing.name, ctx);
            ctx.write(">");
        }
    }

    fn jsx_fragment(&mut self, node: &JSXFragment, ctx: &mut Context) {
        ctx.write("<>");
        if !node.children.is_empty() {
            ctx.indent();
        }
        for child in &node.children {
            self.jsx_child(child, ctx);
        }
        if !node.children.is_empty() {
            ctx.dedent();
        }
        ctx.write("</>");
    }

    fn jsx_opening_element(
        &mut self,
        node: &JSXOpeningElement,
        self_closing: bool,
        ctx: &mut Context,
    ) {
        ctx.write("<");
        self.jsx_element_name(&node.name, ctx);
        if let Some(type_args) = &node.type_arguments {
            self.type_parameter_instantiation(type_args, ctx);
        }
        for attr in &node.attributes {
            ctx.write(" ");
            match attr {
                JSXAttributeItem::Attribute(a) => {
                    self.jsx_attribute_name(&a.name, ctx);
                    if let Some(value) = &a.value {
                        ctx.write("=");
                        self.jsx_attribute_value(value, ctx);
                    }
                }
                JSXAttributeItem::SpreadAttribute(s) => {
                    ctx.write("{...");
                    self.print_expression(&s.argument, ctx);
                    ctx.write("}");
                }
            }
        }
        if self_closing {
            ctx.write(" /");
        }
        ctx.write(">");
    }

    fn jsx_child(&mut self, child: &JSXChild, ctx: &mut Context) {
        match child {
            JSXChild::Text(t) => ctx.write(t.value.as_str()),
            JSXChild::Element(e) => self.jsx_element(e, ctx),
            JSXChild::Fragment(f) => self.jsx_fragment(f, ctx),
            JSXChild::ExpressionContainer(c) => self.jsx_expression_container(c, ctx),
            JSXChild::Spread(s) => {
                ctx.write("{...");
                self.print_expression(&s.expression, ctx);
                ctx.write("}");
            }
        }
    }

    fn jsx_expression_container(&mut self, node: &JSXExpressionContainer, ctx: &mut Context) {
        ctx.write("{");
        // A `JSXEmptyExpression` (e.g. `{}` or `{/* comment */}`) prints nothing.
        if let Some(expr) = node.expression.as_expression() {
            self.print_expression(expr, ctx);
        }
        ctx.write("}");
    }

    fn jsx_attribute_value(&mut self, value: &JSXAttributeValue, ctx: &mut Context) {
        match value {
            JSXAttributeValue::StringLiteral(s) => ctx.write(self.string_literal(s)),
            JSXAttributeValue::ExpressionContainer(c) => self.jsx_expression_container(c, ctx),
            JSXAttributeValue::Element(e) => self.jsx_element(e, ctx),
            JSXAttributeValue::Fragment(f) => self.jsx_fragment(f, ctx),
        }
    }

    fn jsx_attribute_name(&mut self, name: &JSXAttributeName, ctx: &mut Context) {
        match name {
            JSXAttributeName::Identifier(id) => ctx.write(id.name.as_str()),
            JSXAttributeName::NamespacedName(n) => {
                ctx.write(n.namespace.name.as_str());
                ctx.write(":");
                ctx.write(n.name.name.as_str());
            }
        }
    }

    fn jsx_element_name(&mut self, name: &JSXElementName, ctx: &mut Context) {
        match name {
            JSXElementName::Identifier(id) => ctx.write(id.name.as_str()),
            JSXElementName::IdentifierReference(id) => ctx.write(id.name.as_str()),
            JSXElementName::NamespacedName(n) => {
                ctx.write(n.namespace.name.as_str());
                ctx.write(":");
                ctx.write(n.name.name.as_str());
            }
            JSXElementName::MemberExpression(m) => self.jsx_member_expression(m, ctx),
            JSXElementName::ThisExpression(_) => ctx.write("this"),
        }
    }

    fn jsx_member_expression(&mut self, node: &JSXMemberExpression, ctx: &mut Context) {
        match &node.object {
            JSXMemberExpressionObject::IdentifierReference(id) => ctx.write(id.name.as_str()),
            JSXMemberExpressionObject::MemberExpression(m) => self.jsx_member_expression(m, ctx),
            JSXMemberExpressionObject::ThisExpression(_) => ctx.write("this"),
        }
        ctx.write(".");
        ctx.write(node.property.name.as_str());
    }

    /// Print the object of a member expression, parenthesised per esrap's
    /// `MemberExpression` rule: wrap when the object is a `ChainExpression`
    /// (e.g. `($$arg0?.()).href` — the parens keep `.href` out of the optional
    /// chain so it doesn't short-circuit) or when its precedence is below a
    /// member access. A parsed optional chain like `a?.b.c` is a single
    /// `ChainExpression` at the top, so its inner member objects are plain
    /// members/identifiers and never trip this — only an explicitly nested chain
    /// (the snippet-argument base) does.
    fn member_object_with_parens(&mut self, object: &Expression, ctx: &mut Context) {
        if matches!(object, Expression::ChainExpression(_)) {
            ctx.write("(");
            self.print_expression(object, ctx);
            ctx.write(")");
        } else {
            self.child_with_parens(object, 19, ctx);
        }
    }

    /// Print `child` parenthesised iff its precedence is below `min`.
    fn child_with_parens(&mut self, child: &Expression, min: u8, ctx: &mut Context) {
        if expr_precedence(child) < min {
            ctx.write("(");
            self.print_expression(child, ctx);
            ctx.write(")");
        } else {
            self.print_expression(child, ctx);
        }
    }

    fn binary_expression(&mut self, node: &BinaryExpression, ctx: &mut Context) {
        let op = node.operator.as_str();
        self.binary_child(&node.left, false, op, false, ctx);
        ctx.write(format!(" {op} "));
        self.binary_child(&node.right, false, op, true, ctx);
    }

    fn logical_expression(&mut self, node: &LogicalExpression, ctx: &mut Context) {
        let op = node.operator.as_str();
        self.binary_child(&node.left, true, op, false, ctx);
        ctx.write(format!(" {op} "));
        self.binary_child(&node.right, true, op, true, ctx);
    }

    /// Print one operand of a binary/logical expression, parenthesised per
    /// esrap's `needs_parens` (operator precedence + associativity + the `**`
    /// and `??`-mixing special cases).
    fn binary_child(
        &mut self,
        child: &Expression,
        parent_is_logical: bool,
        parent_op: &str,
        is_right: bool,
        ctx: &mut Context,
    ) {
        if binary_needs_parens(child, parent_is_logical, parent_op, is_right) {
            ctx.write("(");
            self.print_expression(child, ctx);
            ctx.write(")");
        } else {
            self.print_expression(child, ctx);
        }
    }

    fn unary_expression(&mut self, node: &UnaryExpression, ctx: &mut Context) {
        let op = node.operator.as_str();
        // `typeof`/`void`/`delete` are word operators and need a trailing space.
        if matches!(
            node.operator,
            UnaryOperator::Typeof | UnaryOperator::Void | UnaryOperator::Delete
        ) {
            ctx.write(format!("{op} "));
        } else {
            ctx.write(op.to_string());
        }
        self.child_with_parens(&node.argument, 15, ctx);
    }

    fn call_expression(&mut self, node: &CallExpression, ctx: &mut Context) {
        // esrap's `CallExpression|NewExpression` wrap rule: parenthesize the
        // callee when it is a ChainExpression — otherwise a NON-optional call on
        // an optional-chain callee (`(a?.b)(c)`) would be mis-printed as the
        // optional-chain call `a?.b(c)`, which short-circuits differently. The
        // precedence path (`< 19`) does not catch this because a ChainExpression
        // has the same precedence (19) as a call.
        if matches!(unparen(&node.callee), Expression::ChainExpression(_)) {
            ctx.write("(");
            self.print_expression(unparen(&node.callee), ctx);
            ctx.write(")");
        } else {
            self.child_with_parens(&node.callee, 19, ctx);
        }
        if node.optional {
            ctx.write("?.");
        }
        self.call_arguments(&node.arguments, node.span().end, ctx);
    }

    fn static_member(&mut self, node: &StaticMemberExpression, ctx: &mut Context) {
        self.member_object_with_parens(&node.object, ctx);
        ctx.write(if node.optional { "?." } else { "." });
        ctx.write(node.property.name.as_str());
    }

    fn computed_member(&mut self, node: &ComputedMemberExpression, ctx: &mut Context) {
        self.member_object_with_parens(&node.object, ctx);
        if node.optional {
            ctx.write("?.");
        }
        ctx.write("[");
        self.print_expression(&node.expression, ctx);
        ctx.write("]");
    }

    fn assignment_expression(&mut self, node: &AssignmentExpression, ctx: &mut Context) {
        // esrap visits both sides without adding parens.
        self.assignment_target(&node.left, ctx);
        ctx.write(format!(" {} ", node.operator.as_str()));
        self.print_expression(&node.right, ctx);
    }

    /// A `SimpleAssignmentTarget` (the operand of `++`/`--`, a subset of
    /// `AssignmentTarget`).
    fn simple_assignment_target(&mut self, target: &SimpleAssignmentTarget, ctx: &mut Context) {
        match target {
            SimpleAssignmentTarget::AssignmentTargetIdentifier(id) => ctx.write(id.name.as_str()),
            SimpleAssignmentTarget::StaticMemberExpression(m) => self.static_member(m, ctx),
            SimpleAssignmentTarget::ComputedMemberExpression(m) => self.computed_member(m, ctx),
            SimpleAssignmentTarget::PrivateFieldExpression(m) => {
                self.child_with_parens(&m.object, 19, ctx);
                ctx.write(if m.optional { "?." } else { "." });
                ctx.write(format!("#{}", m.field.name));
            }
            _ => self.unsupported("SimpleAssignmentTarget", ctx),
        }
    }

    fn assignment_target(&mut self, target: &AssignmentTarget, ctx: &mut Context) {
        match target {
            AssignmentTarget::AssignmentTargetIdentifier(id) => ctx.write(id.name.as_str()),
            AssignmentTarget::StaticMemberExpression(m) => self.static_member(m, ctx),
            AssignmentTarget::ComputedMemberExpression(m) => self.computed_member(m, ctx),
            AssignmentTarget::PrivateFieldExpression(m) => {
                self.child_with_parens(&m.object, 19, ctx);
                ctx.write(if m.optional { "?." } else { "." });
                ctx.write(format!("#{}", m.field.name));
            }
            AssignmentTarget::ArrayAssignmentTarget(a) => {
                ctx.write("[");
                let mut nodes: Vec<SeqNode> = a
                    .elements
                    .iter()
                    .map(|el| {
                        let span = el.as_ref().map(|t| t.span());
                        SeqNode {
                            start: span.map(|s| s.start),
                            end: span.map(|s| s.end),
                            obj_or_array: false,
                            is_elision: el.is_none(),
                            render: Box::new(move |p: &mut Printer, child: &mut Context| {
                                if let Some(t) = el {
                                    p.assignment_target_maybe_default(t, child);
                                }
                            }),
                        }
                    })
                    .collect();
                if let Some(rest) = &a.rest {
                    let span = rest.span();
                    nodes.push(SeqNode {
                        start: Some(span.start),
                        end: Some(span.end),
                        obj_or_array: false,
                        is_elision: false,
                        render: Box::new(move |p: &mut Printer, child: &mut Context| {
                            child.write("...");
                            p.assignment_target(&rest.target, child);
                        }),
                    });
                }
                self.sequence(nodes, Some(a.span().end), false, ",", true, ctx);
                ctx.write("]");
            }
            AssignmentTarget::ObjectAssignmentTarget(o) => {
                ctx.write("{");
                let mut nodes: Vec<SeqNode> = o
                    .properties
                    .iter()
                    .map(|prop| {
                        let span = prop.span();
                        SeqNode {
                            start: Some(span.start),
                            end: Some(span.end),
                            obj_or_array: false,
                            is_elision: false,
                            render: Box::new(move |p: &mut Printer, child: &mut Context| {
                                p.assignment_target_property(prop, child);
                            }),
                        }
                    })
                    .collect();
                if let Some(rest) = &o.rest {
                    let span = rest.span();
                    nodes.push(SeqNode {
                        start: Some(span.start),
                        end: Some(span.end),
                        obj_or_array: false,
                        is_elision: false,
                        render: Box::new(move |p: &mut Printer, child: &mut Context| {
                            child.write("...");
                            p.assignment_target(&rest.target, child);
                        }),
                    });
                }
                self.sequence(nodes, Some(o.span().end), true, ",", true, ctx);
                ctx.write("}");
            }
            _ => self.unsupported("AssignmentTarget", ctx),
        }
    }

    fn assignment_target_maybe_default(
        &mut self,
        target: &AssignmentTargetMaybeDefault,
        ctx: &mut Context,
    ) {
        match target {
            AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(d) => {
                self.assignment_target(&d.binding, ctx);
                ctx.write(" = ");
                self.print_expression(&d.init, ctx);
            }
            _ => match target.as_assignment_target() {
                Some(t) => self.assignment_target(t, ctx),
                None => self.unsupported("AssignmentTargetMaybeDefault", ctx),
            },
        }
    }

    fn assignment_target_property(&mut self, prop: &AssignmentTargetProperty, ctx: &mut Context) {
        match prop {
            AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => {
                ctx.write(p.binding.name.as_str());
                if let Some(init) = &p.init {
                    ctx.write(" = ");
                    self.print_expression(init, ctx);
                }
            }
            AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                if p.computed {
                    ctx.write("[");
                    self.property_key(&p.name, ctx);
                    ctx.write("]: ");
                } else {
                    self.property_key(&p.name, ctx);
                    ctx.write(": ");
                }
                self.assignment_target_maybe_default(&p.binding, ctx);
            }
        }
    }

    /// esrap's `ConditionalExpression`: only the test is parenthesised (by
    /// precedence); the branches are emitted as-is. When either branch is
    /// multiline or the two together exceed 50 columns, break onto indented
    /// `? …` / `: …` lines.
    fn conditional_expression(&mut self, node: &ConditionalExpression, ctx: &mut Context) {
        self.child_with_parens(&node.test, 5, ctx);

        let mut consequent = ctx.child();
        self.print_expression(&node.consequent, &mut consequent);
        let mut alternate = ctx.child();
        self.print_expression(&node.alternate, &mut alternate);

        let multiline = consequent.multiline
            || alternate.multiline
            || consequent.measure() + alternate.measure() > 50;

        if multiline {
            ctx.indent();
            ctx.newline();
            ctx.write("? ");
            ctx.append(consequent);
            ctx.newline();
            ctx.write(": ");
            ctx.append(alternate);
            ctx.dedent();
        } else {
            ctx.write(" ? ");
            ctx.append(consequent);
            ctx.write(" : ");
            ctx.append(alternate);
        }
    }

    fn array_expression(&mut self, node: &ArrayExpression, ctx: &mut Context) {
        ctx.write("[");
        let nodes: Vec<SeqNode> = node
            .elements
            .iter()
            .map(|el| {
                let is_elision = matches!(el, ArrayExpressionElement::Elision(_));
                let span = el.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision,
                    render: Box::new(move |p: &mut Printer, child: &mut Context| match el {
                        ArrayExpressionElement::SpreadElement(s) => {
                            child.write("...");
                            p.print_expression(&s.argument, child);
                        }
                        ArrayExpressionElement::Elision(_) => {}
                        _ => {
                            if let Some(e) = el.as_expression() {
                                p.print_expression(e, child);
                            }
                        }
                    }),
                }
            })
            .collect();
        self.sequence(nodes, Some(node.span().end), false, ",", true, ctx);
        ctx.write("]");
    }

    /// esrap always parenthesizes a sequence expression (`(a, b)`), laying the
    /// comma list out with the shared `sequence` machinery.
    fn sequence_expression(&mut self, node: &SequenceExpression, ctx: &mut Context) {
        ctx.write("(");
        let nodes: Vec<SeqNode> = node
            .expressions
            .iter()
            .map(|e| {
                let span = e.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(move |p: &mut Printer, child: &mut Context| {
                        p.print_expression(e, child);
                    }),
                }
            })
            .collect();
        self.sequence(nodes, Some(node.span().end), false, ",", true, ctx);
        ctx.write(")");
    }

    fn object_expression(&mut self, node: &ObjectExpression, ctx: &mut Context) {
        ctx.write("{");
        let nodes: Vec<SeqNode> = node
            .properties
            .iter()
            .map(|prop| {
                let span = prop.span();
                let obj_or_array = matches!(prop, ObjectPropertyKind::ObjectProperty(p)
                if matches!(
                    &p.value,
                    Expression::ObjectExpression(_) | Expression::ArrayExpression(_)
                ));
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array,
                    is_elision: false,
                    render: Box::new(move |p: &mut Printer, child: &mut Context| {
                        // esrap's `sequence` visits each property through the `_`
                        // wildcard, which flushes any comment positioned before
                        // it (`{ /** doc */ key: … }`). Mirror that per property.
                        p.flush_leading(child, span.start, p.line_of(span.start));
                        match prop {
                            ObjectPropertyKind::ObjectProperty(prop) => {
                                p.object_property(prop, child)
                            }
                            ObjectPropertyKind::SpreadProperty(s) => {
                                child.write("...");
                                p.print_expression(&s.argument, child);
                            }
                        }
                    }),
                }
            })
            .collect();
        self.sequence(nodes, Some(node.span().end), true, ",", true, ctx);
        ctx.write("}");
    }

    fn object_property(&mut self, prop: &ObjectProperty, ctx: &mut Context) {
        // Shorthand `{ x }` when key and value are the same identifier.
        if !prop.computed
            && prop.kind == PropertyKind::Init
            && let (PropertyKey::StaticIdentifier(key), Expression::Identifier(val)) =
                (&prop.key, &prop.value)
            && key.name == val.name
        {
            ctx.write(val.name.as_str());
            return;
        }
        // Method / accessor shorthand: `key() {}`, `get key() {}`, `*key() {}`.
        // esrap takes this branch for ANY property whose value is a
        // FunctionExpression (regardless of the `method` flag or key kind), so a
        // string-keyed function property prints as `"k"() {}`, not `"k": function`.
        if let Expression::FunctionExpression(f) = &prop.value {
            match prop.kind {
                PropertyKind::Get => ctx.write("get "),
                PropertyKind::Set => ctx.write("set "),
                PropertyKind::Init => {}
            }
            if f.r#async {
                ctx.write("async ");
            }
            if f.generator {
                ctx.write("*");
            }
            if prop.computed {
                ctx.write("[");
                self.property_key(&prop.key, ctx);
                ctx.write("]");
            } else {
                self.property_key(&prop.key, ctx);
            }
            ctx.write("(");
            self.formal_parameters(&f.params, ctx);
            ctx.write(")");
            ctx.write(" ");
            match &f.body {
                Some(body) => {
                    let span = body.span();
                    self.block(&body.statements, span.start, span.end, ctx);
                }
                None => ctx.write("{}"),
            }
            return;
        }
        if prop.computed {
            ctx.write("[");
            self.property_key(&prop.key, ctx);
            ctx.write("]: ");
        } else {
            self.property_key(&prop.key, ctx);
            ctx.write(": ");
        }
        self.print_expression(&prop.value, ctx);
    }

    fn property_key(&mut self, key: &PropertyKey, ctx: &mut Context) {
        match key {
            PropertyKey::StaticIdentifier(id) => ctx.write(id.name.as_str()),
            PropertyKey::PrivateIdentifier(id) => ctx.write(format!("#{}", id.name)),
            PropertyKey::StringLiteral(s) => ctx.write(self.string_literal(s)),
            PropertyKey::NumericLiteral(n) => ctx
                .write(literal_raw(n.raw.as_ref().map(|a| a.as_str()), || {
                    n.value.to_string()
                })),
            _ => {
                if let Some(e) = key.as_expression() {
                    self.print_expression(e, ctx);
                } else {
                    self.unsupported("PropertyKey", ctx);
                }
            }
        }
    }

    /// esrap's bespoke call/new argument layout (`(...)`). Unlike a generic
    /// `sequence`, the call wraps one-argument-per-line **only when a non-final
    /// argument is itself multiline** — so a trailing function/array/object
    /// argument can span lines while the call stays on one line
    /// (`$.run([ … ])`, `foo(a, b, () => { … })`). Length is not a factor.
    fn call_arguments(&mut self, args: &[Argument], call_end: u32, ctx: &mut Context) {
        let n = args.len();

        // Render each argument into its own context (non-final ones carry the
        // trailing comma), flushing each arg's trailing comments in source order
        // — esrap threads comments through the single `comment_index` cursor in
        // its argument loop (`flush_trailing_comments(context, arg.loc.end, next)`).
        let mut rendered: Vec<Context> = Vec::with_capacity(n);

        // esrap special case: a comment sitting *above* the final argument forces
        // the whole sequence multiline (it sets the non-final `child_context`'s
        // `multiline`), so a `(\n\t// comment\n\targ\n)` layout is used instead of
        // dangling the comment after `(`.
        let mut force_multiline = false;

        for (i, arg) in args.iter().enumerate() {
            let is_last = i == n - 1;
            let arg_start = arg.span().start;

            if is_last
                && let Some(c) = self.comments.get(self.comment_index)
                && c.start < arg_start
                && c.start_line < self.line_of(arg_start)
            {
                force_multiline = true;
            }

            let mut child = ctx.child();
            match arg {
                Argument::SpreadElement(s) => {
                    child.write("...");
                    self.print_expression(&s.argument, &mut child);
                }
                _ => match arg.as_expression() {
                    Some(e) => self.print_expression(e, &mut child),
                    None => self.unsupported("Argument", &mut child),
                },
            }
            if !is_last {
                child.write(",");
            }

            let next = if is_last {
                Some(call_end)
            } else {
                Some(args[i + 1].span().start)
            };
            let emitted_line =
                self.flush_trailing_comments(&mut child, self.line_of(arg.span().end), next);
            // esrap accumulates all non-final args in one `child_context` and
            // `append`s a `join` context after each, which propagates the
            // trailing line comment's pending newline into `child_context.multiline`
            // and forces the wrapped layout. Mirror that per non-final arg.
            if emitted_line && !is_last {
                child.multiline = true;
            }

            rendered.push(child);
        }

        // esrap forces the wrap only on the **non-final** args' multiline state
        // (so a trailing multiline function/array/object argument keeps the call
        // on one line). The force-multiline special case also only sets the
        // non-final context.
        let wrap = force_multiline
            || rendered
                .iter()
                .take(n.saturating_sub(1))
                .any(|c| c.multiline);

        ctx.write("(");
        if wrap {
            ctx.indent();
            for arg_ctx in rendered {
                ctx.newline();
                ctx.append(arg_ctx);
            }
            ctx.dedent();
            ctx.newline();
        } else {
            for (i, arg_ctx) in rendered.into_iter().enumerate() {
                if i > 0 {
                    ctx.write(" ");
                }
                ctx.append(arg_ctx);
            }
        }
        ctx.write(")");
    }

    // ----- TypeScript types -------------------------------------------------

    /// esrap's `TSTypeAnnotation`: `: ` + the type.
    fn type_annotation(&mut self, node: &TSTypeAnnotation, ctx: &mut Context) {
        ctx.write(": ");
        self.print_type(&node.type_annotation, ctx);
    }

    /// esrap's `TSTypeParameterInstantiation`: `<a, b>`.
    fn type_parameter_instantiation(
        &mut self,
        node: &TSTypeParameterInstantiation,
        ctx: &mut Context,
    ) {
        ctx.write("<");
        for (i, p) in node.params.iter().enumerate() {
            if i > 0 {
                ctx.write(", ");
            }
            self.print_type(p, ctx);
        }
        ctx.write(">");
    }

    /// esrap's `TSTypeParameterDeclaration`: `<T, U extends V = W>`.
    fn type_parameter_declaration(&mut self, node: &TSTypeParameterDeclaration, ctx: &mut Context) {
        ctx.write("<");
        for (i, p) in node.params.iter().enumerate() {
            if i > 0 {
                ctx.write(", ");
            }
            self.type_parameter(p, ctx);
        }
        ctx.write(">");
    }

    fn type_parameter(&mut self, node: &TSTypeParameter, ctx: &mut Context) {
        ctx.write(node.name.name.as_str());
        if let Some(constraint) = &node.constraint {
            ctx.write(" extends ");
            self.print_type(constraint, ctx);
        }
        if let Some(default) = &node.default {
            ctx.write(" = ");
            self.print_type(default, ctx);
        }
    }

    /// esrap's `TSTypeName` (`IdentifierReference` / `TSQualifiedName`).
    fn print_type_name(&mut self, name: &TSTypeName, ctx: &mut Context) {
        match name {
            TSTypeName::IdentifierReference(id) => ctx.write(id.name.as_str()),
            TSTypeName::QualifiedName(q) => {
                self.print_type_name(&q.left, ctx);
                ctx.write(".");
                ctx.write(q.right.name.as_str());
            }
            TSTypeName::ThisExpression(_) => ctx.write("this"),
        }
    }

    /// The core type dispatcher (esrap's TS type visitors).
    fn print_type(&mut self, ty: &TSType, ctx: &mut Context) {
        match ty {
            TSType::TSAnyKeyword(_) => ctx.write("any"),
            TSType::TSBigIntKeyword(_) => ctx.write("bigint"),
            TSType::TSBooleanKeyword(_) => ctx.write("boolean"),
            TSType::TSIntrinsicKeyword(_) => ctx.write("intrinsic"),
            TSType::TSNeverKeyword(_) => ctx.write("never"),
            TSType::TSNullKeyword(_) => ctx.write("null"),
            TSType::TSNumberKeyword(_) => ctx.write("number"),
            TSType::TSObjectKeyword(_) => ctx.write("object"),
            TSType::TSStringKeyword(_) => ctx.write("string"),
            TSType::TSSymbolKeyword(_) => ctx.write("symbol"),
            TSType::TSUndefinedKeyword(_) => ctx.write("undefined"),
            TSType::TSUnknownKeyword(_) => ctx.write("unknown"),
            TSType::TSVoidKeyword(_) => ctx.write("void"),
            TSType::TSThisType(_) => ctx.write("this"),
            TSType::TSArrayType(t) => {
                self.print_type(&t.element_type, ctx);
                ctx.write("[]");
            }
            TSType::TSParenthesizedType(t) => {
                ctx.write("(");
                self.print_type(&t.type_annotation, ctx);
                ctx.write(")");
            }
            TSType::TSTypeReference(t) => {
                self.print_type_name(&t.type_name, ctx);
                if let Some(ta) = &t.type_arguments {
                    self.type_parameter_instantiation(ta, ctx);
                }
            }
            TSType::TSTypeLiteral(t) => self.type_literal(t, ctx),
            TSType::TSUnionType(t) => {
                // No trailing newline so a following `=>` stays on the line.
                let nodes = self.type_seq_nodes(&t.types);
                self.sequence(nodes, Some(t.span.end), false, " |", false, ctx);
            }
            TSType::TSIntersectionType(t) => {
                let nodes = self.type_seq_nodes(&t.types);
                self.sequence(nodes, Some(t.span.end), false, " &", false, ctx);
            }
            TSType::TSConditionalType(t) => {
                self.print_type(&t.check_type, ctx);
                ctx.write(" extends ");
                self.print_type(&t.extends_type, ctx);
                ctx.write(" ? ");
                self.print_type(&t.true_type, ctx);
                ctx.write(" : ");
                self.print_type(&t.false_type, ctx);
            }
            TSType::TSIndexedAccessType(t) => {
                self.print_type(&t.object_type, ctx);
                ctx.write("[");
                self.print_type(&t.index_type, ctx);
                ctx.write("]");
            }
            TSType::TSInferType(t) => {
                ctx.write("infer ");
                self.type_parameter(&t.type_parameter, ctx);
            }
            TSType::TSLiteralType(t) => self.ts_literal(&t.literal, ctx),
            TSType::TSTypeOperatorType(t) => {
                ctx.write(format!("{} ", ts_type_operator_str(t.operator)));
                self.print_type(&t.type_annotation, ctx);
            }
            TSType::TSTypeQuery(t) => {
                ctx.write("typeof ");
                match &t.expr_name {
                    TSTypeQueryExprName::TSImportType(it) => self.import_type(it, ctx),
                    TSTypeQueryExprName::IdentifierReference(id) => ctx.write(id.name.as_str()),
                    TSTypeQueryExprName::QualifiedName(q) => {
                        self.print_type_name(&q.left, ctx);
                        ctx.write(".");
                        ctx.write(q.right.name.as_str());
                    }
                    TSTypeQueryExprName::ThisExpression(_) => ctx.write("this"),
                }
                if let Some(ta) = &t.type_arguments {
                    self.type_parameter_instantiation(ta, ctx);
                }
            }
            TSType::TSTypePredicate(t) => {
                if t.asserts {
                    ctx.write("asserts ");
                }
                match &t.parameter_name {
                    TSTypePredicateName::Identifier(id) => ctx.write(id.name.as_str()),
                    TSTypePredicateName::This(_) => ctx.write("this"),
                }
                if let Some(ann) = &t.type_annotation {
                    ctx.write(" is ");
                    self.print_type(&ann.type_annotation, ctx);
                }
            }
            TSType::TSTupleType(t) => {
                ctx.write("[");
                let nodes = self.tuple_element_seq_nodes(&t.element_types);
                self.sequence(nodes, Some(t.span.end), false, ",", true, ctx);
                ctx.write("]");
            }
            TSType::TSNamedTupleMember(t) => self.named_tuple_member(t, ctx),
            TSType::TSFunctionType(t) => {
                if let Some(tp) = &t.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write("(");
                self.formal_parameters(&t.params, ctx);
                ctx.write(") => ");
                self.print_type(&t.return_type.type_annotation, ctx);
            }
            TSType::TSConstructorType(t) => {
                if t.r#abstract {
                    ctx.write("abstract ");
                }
                ctx.write("new ");
                if let Some(tp) = &t.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write("(");
                self.formal_parameters(&t.params, ctx);
                ctx.write(") => ");
                self.print_type(&t.return_type.type_annotation, ctx);
            }
            TSType::TSImportType(t) => self.import_type(t, ctx),
            TSType::TSMappedType(t) => self.mapped_type(t, ctx),
            TSType::TSTemplateLiteralType(t) => {
                ctx.write("`");
                for (i, inner) in t.types.iter().enumerate() {
                    let raw = t.quasis.get(i).map(|q| q.value.raw.as_str()).unwrap_or("");
                    ctx.write(format!("{raw}${{"));
                    self.print_type(inner, ctx);
                    ctx.write("}");
                    if raw.contains('\n') {
                        ctx.multiline = true;
                    }
                }
                if let Some(last) = t.quasis.last() {
                    ctx.write(format!("{}`", last.value.raw));
                }
            }
            other => self.unsupported(ts_type_kind(other), ctx),
        }
    }

    /// esrap's `TSImportType`: `import('src')[.qualifier]`. (Type-argument
    /// support is unused by the samples.)
    fn import_type(&mut self, node: &TSImportType, ctx: &mut Context) {
        ctx.write("import(");
        ctx.write(self.string_literal(&node.source));
        ctx.write(")");
        if let Some(qualifier) = &node.qualifier {
            ctx.write(".");
            self.import_type_qualifier(qualifier, ctx);
        }
    }

    fn import_type_qualifier(&mut self, q: &TSImportTypeQualifier, ctx: &mut Context) {
        match q {
            TSImportTypeQualifier::Identifier(id) => ctx.write(id.name.as_str()),
            TSImportTypeQualifier::QualifiedName(qn) => {
                self.import_type_qualifier(&qn.left, ctx);
                ctx.write(".");
                ctx.write(qn.right.name.as_str());
            }
        }
    }

    /// esrap's `TSNamedTupleMember`: `label[?]: type`.
    fn named_tuple_member(&mut self, node: &TSNamedTupleMember, ctx: &mut Context) {
        ctx.write(node.label.name.as_str());
        if node.optional {
            ctx.write("?");
        }
        ctx.write(": ");
        self.tuple_element(&node.element_type, ctx);
    }

    fn tuple_element(&mut self, el: &TSTupleElement, ctx: &mut Context) {
        match el {
            TSTupleElement::TSOptionalType(t) => {
                self.print_type(&t.type_annotation, ctx);
                ctx.write("?");
            }
            TSTupleElement::TSRestType(t) => {
                ctx.write("...");
                self.print_type(&t.type_annotation, ctx);
            }
            _ => {
                if let Some(ty) = el.as_ts_type() {
                    self.print_type(ty, ctx);
                }
            }
        }
    }

    /// esrap's `TSMappedType`: `{[K in C]: T}` (no inner spaces).
    fn mapped_type(&mut self, node: &TSMappedType, ctx: &mut Context) {
        ctx.write("{");
        if let Some(readonly) = node.readonly {
            ctx.write(mapped_modifier_prefix(readonly, "readonly"));
        }
        ctx.write("[");
        ctx.write(node.key.name.as_str());
        ctx.write(" in ");
        self.print_type(&node.constraint, ctx);
        if let Some(name_type) = &node.name_type {
            ctx.write(" as ");
            self.print_type(name_type, ctx);
        }
        ctx.write("]");
        if let Some(optional) = node.optional {
            ctx.write(mapped_modifier_prefix(optional, "?"));
        }
        if let Some(ann) = &node.type_annotation {
            ctx.write(": ");
            self.print_type(ann, ctx);
        }
        ctx.write("}");
    }

    /// esrap's `TSTypeLiteral`: `{ ` + `;`-separated members + ` }`.
    fn type_literal(&mut self, node: &TSTypeLiteral, ctx: &mut Context) {
        ctx.write("{ ");
        let nodes = self.signature_seq_nodes(&node.members);
        self.sequence(nodes, Some(node.span.end), false, ";", true, ctx);
        ctx.write(" }");
    }

    fn ts_literal(&mut self, lit: &TSLiteral, ctx: &mut Context) {
        match lit {
            TSLiteral::BooleanLiteral(b) => ctx.write(if b.value { "true" } else { "false" }),
            TSLiteral::NumericLiteral(n) => ctx
                .write(literal_raw(n.raw.as_ref().map(|a| a.as_str()), || {
                    n.value.to_string()
                })),
            TSLiteral::BigIntLiteral(n) => ctx
                .write(literal_raw(n.raw.as_ref().map(|a| a.as_str()), || {
                    format!("{}n", n.value)
                })),
            TSLiteral::StringLiteral(s) => ctx.write(self.string_literal(s)),
            TSLiteral::TemplateLiteral(t) => self.template_literal(t, ctx),
            TSLiteral::UnaryExpression(u) => self.unary_expression(u, ctx),
        }
    }

    /// Build [`SeqNode`]s for a list of types (union/intersection).
    fn type_seq_nodes<'p>(&self, types: &'p [TSType<'p>]) -> Vec<SeqNode<'p>> {
        types
            .iter()
            .map(|ty| {
                let span = ty.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(move |p: &mut Printer, child: &mut Context| {
                        p.print_type(ty, child);
                    }),
                }
            })
            .collect()
    }

    fn tuple_element_seq_nodes<'p>(&self, els: &'p [TSTupleElement<'p>]) -> Vec<SeqNode<'p>> {
        els.iter()
            .map(|el| {
                let span = el.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(move |p: &mut Printer, child: &mut Context| {
                        p.tuple_element(el, child);
                    }),
                }
            })
            .collect()
    }

    fn signature_seq_nodes<'p>(&self, members: &'p [TSSignature<'p>]) -> Vec<SeqNode<'p>> {
        members
            .iter()
            .map(|m| {
                let span = m.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(move |p: &mut Printer, child: &mut Context| {
                        p.signature(m, child);
                    }),
                }
            })
            .collect()
    }

    /// esrap's `TSSignature` visitors (members of an interface / type literal).
    fn signature(&mut self, sig: &TSSignature, ctx: &mut Context) {
        match sig {
            TSSignature::TSPropertySignature(s) => {
                if s.readonly {
                    ctx.write("readonly ");
                }
                if s.computed {
                    ctx.write("[");
                    self.property_key(&s.key, ctx);
                    ctx.write("]");
                } else {
                    self.property_key(&s.key, ctx);
                }
                if s.optional {
                    ctx.write("?");
                }
                if let Some(ann) = &s.type_annotation {
                    self.type_annotation(ann, ctx);
                }
            }
            TSSignature::TSIndexSignature(s) => {
                if s.readonly {
                    ctx.write("readonly ");
                }
                ctx.write("[");
                for (i, param) in s.parameters.iter().enumerate() {
                    if i > 0 {
                        ctx.write(", ");
                    }
                    ctx.write(param.name.as_str());
                    self.type_annotation(&param.type_annotation, ctx);
                }
                ctx.write("]");
                self.type_annotation(&s.type_annotation, ctx);
            }
            TSSignature::TSMethodSignature(s) => {
                if s.computed {
                    ctx.write("[");
                    self.property_key(&s.key, ctx);
                    ctx.write("]");
                } else {
                    self.property_key(&s.key, ctx);
                }
                if s.optional {
                    ctx.write("?");
                }
                if let Some(tp) = &s.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write("(");
                self.formal_parameters(&s.params, ctx);
                ctx.write(")");
                if let Some(rt) = &s.return_type {
                    self.type_annotation(rt, ctx);
                }
            }
            TSSignature::TSCallSignatureDeclaration(s) => {
                if let Some(tp) = &s.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write("(");
                self.formal_parameters(&s.params, ctx);
                ctx.write(")");
                if let Some(rt) = &s.return_type {
                    self.type_annotation(rt, ctx);
                }
            }
            TSSignature::TSConstructSignatureDeclaration(s) => {
                ctx.write("new");
                if let Some(tp) = &s.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write("(");
                self.formal_parameters(&s.params, ctx);
                ctx.write(")");
                if let Some(rt) = &s.return_type {
                    self.type_annotation(rt, ctx);
                }
            }
        }
    }

    // ----- TypeScript declarations ------------------------------------------

    fn type_alias_declaration(&mut self, node: &TSTypeAliasDeclaration, ctx: &mut Context) {
        if node.declare {
            ctx.write("declare ");
        }
        ctx.write("type ");
        ctx.write(node.id.name.as_str());
        if let Some(tp) = &node.type_parameters {
            self.type_parameter_declaration(tp, ctx);
        }
        ctx.write(" = ");
        self.print_type(&node.type_annotation, ctx);
        ctx.write(";");
    }

    fn interface_declaration(&mut self, node: &TSInterfaceDeclaration, ctx: &mut Context) {
        if node.declare {
            ctx.write("declare ");
        }
        ctx.write("interface ");
        ctx.write(node.id.name.as_str());
        if let Some(tp) = &node.type_parameters {
            self.type_parameter_declaration(tp, ctx);
        }
        if !node.extends.is_empty() {
            ctx.write(" extends ");
            let nodes: Vec<SeqNode> = node
                .extends
                .iter()
                .map(|h| {
                    let span = h.span();
                    SeqNode {
                        start: Some(span.start),
                        end: Some(span.end),
                        obj_or_array: false,
                        is_elision: false,
                        render: Box::new(move |p: &mut Printer, child: &mut Context| {
                            p.print_expression(&h.expression, child);
                            if let Some(ta) = &h.type_arguments {
                                p.type_parameter_instantiation(ta, child);
                            }
                        }),
                    }
                })
                .collect();
            self.sequence(nodes, Some(node.body.span().start), false, ",", true, ctx);
        }
        ctx.write(" {");
        // esrap's `TSInterfaceBody`: `;`-separated members with padding.
        let nodes = self.signature_seq_nodes(&node.body.body);
        self.sequence(nodes, Some(node.body.span().end), true, ";", true, ctx);
        ctx.write("}");
    }

    fn enum_declaration(&mut self, node: &TSEnumDeclaration, ctx: &mut Context) {
        if node.declare {
            ctx.write("declare ");
        }
        if node.r#const {
            ctx.write("const ");
        }
        ctx.write("enum ");
        ctx.write(node.id.name.as_str());
        ctx.write(" {");
        ctx.indent();
        ctx.newline();
        let nodes: Vec<SeqNode> = node
            .body
            .members
            .iter()
            .map(|m| {
                let span = m.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(move |p: &mut Printer, child: &mut Context| {
                        p.enum_member(m, child);
                    }),
                }
            })
            .collect();
        self.sequence(nodes, Some(node.span.end), false, ",", true, ctx);
        ctx.dedent();
        ctx.newline();
        ctx.write("}");
    }

    fn enum_member(&mut self, node: &TSEnumMember, ctx: &mut Context) {
        match &node.id {
            TSEnumMemberName::Identifier(id) => ctx.write(id.name.as_str()),
            TSEnumMemberName::String(s) => ctx.write(self.string_literal(s)),
            TSEnumMemberName::ComputedString(s) => {
                ctx.write("[");
                ctx.write(self.string_literal(s));
                ctx.write("]");
            }
            TSEnumMemberName::ComputedTemplateString(t) => {
                ctx.write("[");
                self.template_literal(t, ctx);
                ctx.write("]");
            }
        }
        if let Some(init) = &node.initializer {
            ctx.write(" = ");
            self.print_expression(init, ctx);
        }
    }

    fn module_declaration(&mut self, node: &TSModuleDeclaration, ctx: &mut Context) {
        if node.declare {
            ctx.write("declare ");
        }
        let kind = match node.kind {
            TSModuleDeclarationKind::Module => "module ",
            TSModuleDeclarationKind::Namespace => "namespace ",
        };
        ctx.write(kind);
        match &node.id {
            TSModuleDeclarationName::Identifier(id) => ctx.write(id.name.as_str()),
            TSModuleDeclarationName::StringLiteral(s) => ctx.write(self.string_literal(s)),
        }
        match &node.body {
            None => {}
            Some(TSModuleDeclarationBody::TSModuleBlock(block)) => self.module_block(block, ctx),
            Some(TSModuleDeclarationBody::TSModuleDeclaration(inner)) => {
                // `namespace A.B {}` — esrap recurses into the nested decl.
                ctx.write(".");
                self.module_declaration(inner, ctx);
            }
        }
    }

    fn global_declaration(&mut self, node: &TSGlobalDeclaration, ctx: &mut Context) {
        if node.declare {
            ctx.write("declare ");
        }
        ctx.write("global");
        self.module_block(&node.body, ctx);
    }

    /// esrap's `TSModuleBlock`: ` {` + indented body + `}`.
    fn module_block(&mut self, node: &TSModuleBlock, ctx: &mut Context) {
        ctx.write(" {");
        ctx.indent();
        ctx.newline();
        let mut elems: Vec<BodyElem> = node.directives.iter().map(BodyElem::Directive).collect();
        elems.extend(node.body.iter().map(BodyElem::Statement));
        self.body_elems(&elems, node.span.start, node.span.end, ctx);
        ctx.dedent();
        ctx.newline();
        ctx.write("}");
    }

    fn import_equals_declaration(&mut self, node: &TSImportEqualsDeclaration, ctx: &mut Context) {
        ctx.write("import ");
        ctx.write(node.id.name.as_str());
        ctx.write(" = ");
        match &node.module_reference {
            TSModuleReference::ExternalModuleReference(r) => {
                ctx.write("require(");
                ctx.write(self.string_literal(&r.expression));
                ctx.write(");");
            }
            TSModuleReference::IdentifierReference(id) => {
                ctx.write(id.name.as_str());
            }
            TSModuleReference::QualifiedName(q) => {
                self.print_type_name(&q.left, ctx);
                ctx.write(".");
                ctx.write(q.right.name.as_str());
            }
        }
    }

    // ----- literals ---------------------------------------------------------

    fn string_literal(&self, s: &StringLiteral) -> String {
        if let Some(raw) = &s.raw {
            return raw.to_string();
        }
        quote(s.value.as_str(), self.options.quote)
    }
}

/// esrap prefers a literal's preserved `raw` spelling; only synthesised literals
/// fall back to a canonical rendering.
fn literal_raw(raw: Option<&str>, fallback: impl FnOnce() -> String) -> String {
    match raw {
        Some(r) => r.to_string(),
        None => fallback(),
    }
}

/// Quote a string value with the preferred quote char, escaping as needed.
fn quote(value: &str, style: QuoteStyle) -> String {
    let q = match style {
        QuoteStyle::Single => '\'',
        QuoteStyle::Double => '"',
    };
    // esrap's `quote` escapes only `\`, the quote char, `\n`, and `\r` — a literal
    // tab is left as-is. Match it exactly (don't escape `\t`).
    let mut out = String::with_capacity(value.len() + 2);
    out.push(q);
    for ch in value.chars() {
        match ch {
            '\\' => out.push_str("\\\\"),
            c if c == q => {
                out.push('\\');
                out.push(c);
            }
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            c => out.push(c),
        }
    }
    out.push(q);
    out
}

/// A pre-rendered element of a comma sequence, plus the layout flags esrap's
/// `sequence` consults: whether the element itself broke across lines, and
/// whether it's a property with an object/array value (which suppresses the
/// blank-line margin between adjacent multiline elements).
struct SeqItem {
    ctx: Context,
    multiline: bool,
    obj_or_array: bool,
    /// This item is an array elision (a hole, `[a, , b]`). esrap still writes
    /// the hole's separator but omits the inter-element space/newline *before*
    /// it, so consecutive holes read `,,` rather than `, ,`.
    is_elision: bool,
}

/// One node of a comma sequence, as fed to [`Printer::sequence`]. Carries the
/// node's source span (so trailing comments can be flushed in source order) and
/// a closure that renders it into a child context.
struct SeqNode<'p> {
    /// Node `loc.end` byte offset, or `None` for a synthetic node without a
    /// span (no trailing-comment flush is attempted for it).
    end: Option<u32>,
    /// Node `loc.start` byte offset (the `next` boundary for the *previous*
    /// node's trailing comments).
    start: Option<u32>,
    obj_or_array: bool,
    is_elision: bool,
    render: Box<dyn FnMut(&mut Printer<'_>, &mut Context) + 'p>,
}

fn accessibility_str(acc: &TSAccessibility) -> &'static str {
    match acc {
        TSAccessibility::Private => "private",
        TSAccessibility::Protected => "protected",
        TSAccessibility::Public => "public",
    }
}

fn ts_type_operator_str(op: TSTypeOperatorOperator) -> &'static str {
    match op {
        TSTypeOperatorOperator::Keyof => "keyof",
        TSTypeOperatorOperator::Unique => "unique",
        TSTypeOperatorOperator::Readonly => "readonly",
    }
}

/// The mapped-type modifier prefix: `+`/`-`/none before `readonly` / `?`.
fn mapped_modifier_prefix(op: TSMappedTypeModifierOperator, keyword: &str) -> String {
    match op {
        TSMappedTypeModifierOperator::True => keyword.to_string(),
        TSMappedTypeModifierOperator::Plus => format!("+{keyword}"),
        TSMappedTypeModifierOperator::Minus => format!("-{keyword}"),
    }
}

fn ts_type_kind(ty: &TSType) -> &'static str {
    match ty {
        TSType::JSDocNullableType(_) => "JSDocNullableType",
        TSType::JSDocNonNullableType(_) => "JSDocNonNullableType",
        TSType::JSDocUnknownType(_) => "JSDocUnknownType",
        _ => "TSType",
    }
}

fn module_export_name_str<'a>(name: &'a ModuleExportName) -> &'a str {
    match name {
        ModuleExportName::IdentifierName(n) => n.name.as_str(),
        ModuleExportName::IdentifierReference(n) => n.name.as_str(),
        ModuleExportName::StringLiteral(s) => s.value.as_str(),
    }
}

/// A member of a `body` sequence: a leading directive, a statement, or a class
/// member (esrap's `ClassBody` shares the same `body` machinery as a block).
enum BodyElem<'a, 'b> {
    Directive(&'b Directive<'a>),
    Statement(&'b Statement<'a>),
    ClassMember(&'b ClassElement<'a>),
}

impl<'a, 'b> BodyElem<'a, 'b> {
    fn is_empty_stmt(&self) -> bool {
        match self {
            // A *sentinel* empty (`span.end == u32::MAX`) is a deliberately-kept
            // `;` (see `B::empty_kept`): the rsvelte server pipeline emits these
            // for removed `$inspect(...)` statements so the printed `;;` matches
            // upstream's empty-statement-as-expression shape. They must survive
            // the body-sequence filter, so they are NOT treated as elidable.
            BodyElem::Statement(Statement::EmptyStatement(s)) => s.span.end != u32::MAX,
            _ => false,
        }
    }

    fn span_start(&self) -> u32 {
        match self {
            BodyElem::Directive(d) => d.span.start,
            BodyElem::Statement(s) => s.span().start,
            BodyElem::ClassMember(e) => e.span().start,
        }
    }

    fn span_end(&self) -> u32 {
        match self {
            BodyElem::Directive(d) => d.span.end,
            BodyElem::Statement(s) => s.span().end,
            BodyElem::ClassMember(e) => e.span().end,
        }
    }

    /// esrap's `child.type === prev_type` margin grouping. A directive groups as
    /// its own kind (separated from a following non-directive, matching the
    /// acorn shape where `"use strict"` precedes `import`/`let`).
    fn same_kind(&self, other: &BodyElem<'a, '_>) -> bool {
        match (self, other) {
            (BodyElem::Directive(_), BodyElem::Directive(_)) => true,
            (BodyElem::Statement(a), BodyElem::Statement(b)) => {
                std::mem::discriminant(*a) == std::mem::discriminant(*b)
            }
            (BodyElem::ClassMember(a), BodyElem::ClassMember(b)) => {
                std::mem::discriminant(*a) == std::mem::discriminant(*b)
            }
            _ => false,
        }
    }

    fn print(&self, printer: &mut Printer, ctx: &mut Context) {
        match self {
            BodyElem::Directive(d) => printer.print_directive(d, ctx),
            BodyElem::Statement(s) => printer.print_statement(s, ctx),
            BodyElem::ClassMember(e) => printer.class_element(e, ctx),
        }
    }
}

fn expression_kind(expr: &Expression) -> &'static str {
    match expr {
        Expression::TaggedTemplateExpression(_) => "TaggedTemplateExpression",
        Expression::YieldExpression(_) => "YieldExpression",
        Expression::MetaProperty(_) => "MetaProperty",
        Expression::ImportExpression(_) => "ImportExpression",
        Expression::PrivateFieldExpression(_) => "PrivateFieldExpression",
        Expression::PrivateInExpression(_) => "PrivateInExpression",
        Expression::RegExpLiteral(_) => "RegExpLiteral",
        Expression::Super(_) => "Super",
        _ => "Expression",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    fn roundtrip(src: &str) -> (String, Option<Unsupported>) {
        let allocator = Allocator::default();
        let ret = Parser::new(&allocator, src, SourceType::mjs()).parse();
        assert!(
            ret.diagnostics.is_empty(),
            "parse error: {:?}",
            ret.diagnostics
        );
        let opts = PrintOptions::default();
        let mut printer = Printer::new(&opts);
        let mut ctx = Context::new();
        printer.print_program(&ret.program, &mut ctx);
        (
            crate::command::print(&ctx.into_commands(), &opts.indent),
            printer.missing,
        )
    }

    fn print_ok(src: &str) -> String {
        let (out, missing) = roundtrip(src);
        assert!(
            missing.is_none(),
            "unsupported node: {missing:?} for {src:?}"
        );
        out
    }

    fn print_with_comments_ok(src: &str) -> String {
        let allocator = Allocator::default();
        let ret = Parser::new(&allocator, src, SourceType::mjs()).parse();
        assert!(
            ret.diagnostics.is_empty(),
            "parse error: {:?}",
            ret.diagnostics
        );
        let opts = PrintOptions::default();
        let comments = build_comments(&ret.program, src);
        let mut printer = Printer::with_comments(&opts, comments, line_starts(src));
        let mut ctx = Context::new();
        printer.print_program(&ret.program, &mut ctx);
        let out = crate::command::print(&ctx.into_commands(), &opts.indent);
        assert!(
            printer.missing.is_none(),
            "unsupported node: {:?}",
            printer.missing
        );
        out
    }

    #[test]
    fn comments_leading_line() {
        assert_eq!(
            print_with_comments_ok("// hi\nconst x = 1;"),
            "// hi\nconst x = 1;"
        );
    }

    #[test]
    fn comments_leading_block() {
        assert_eq!(
            print_with_comments_ok("/* a */\nconst x = 1;"),
            "/* a */\nconst x = 1;"
        );
    }

    #[test]
    fn comments_trailing_line() {
        assert_eq!(
            print_with_comments_ok("const x = 1; // tail"),
            "const x = 1; // tail"
        );
    }

    #[test]
    fn comments_between_statements() {
        // A comment before the second statement gets a blank line ahead of it
        // (esrap's margin rule), because the statement it leads becomes multiline.
        assert_eq!(
            print_with_comments_ok("const a = 1;\n// c\nconst b = 2;"),
            "const a = 1;\n\n// c\nconst b = 2;"
        );
    }

    #[test]
    fn simple_var_and_expr() {
        assert_eq!(print_ok("const x = 1;"), "const x = 1;");
        assert_eq!(print_ok("let a = b;"), "let a = b;");
    }

    #[test]
    fn binary_precedence_parens() {
        assert_eq!(print_ok("const x = (1 + 2) * 3;"), "const x = (1 + 2) * 3;");
        assert_eq!(print_ok("const x = 1 + 2 * 3;"), "const x = 1 + 2 * 3;");
        assert_eq!(print_ok("const x = 1 - (2 - 3);"), "const x = 1 - (2 - 3);");
    }

    #[test]
    fn member_and_call() {
        assert_eq!(print_ok("foo.bar.baz();"), "foo.bar.baz();");
        assert_eq!(print_ok("a(b, c, d);"), "a(b, c, d);");
        assert_eq!(print_ok("obj['key'];"), "obj['key'];");
        assert_eq!(print_ok("a?.b?.();"), "a?.b?.();");
    }

    #[test]
    fn unary_and_conditional() {
        assert_eq!(print_ok("const x = typeof y;"), "const x = typeof y;");
        assert_eq!(print_ok("const x = !y;"), "const x = !y;");
        assert_eq!(print_ok("const x = a ? b : c;"), "const x = a ? b : c;");
        // Branches are not parenthesised (esrap), even low-precedence ones.
        assert_eq!(
            print_ok("const x = a ? () => b : c;"),
            "const x = a ? () => b : c;"
        );
        assert_eq!(
            print_ok("const x = a ? b : c ? d : e;"),
            "const x = a ? b : c ? d : e;"
        );
    }

    #[test]
    fn object_and_array() {
        assert_eq!(print_ok("const x = { a: 1, b };"), "const x = { a: 1, b };");
        assert_eq!(print_ok("const x = {};"), "const x = {};");
        assert_eq!(print_ok("const x = [1, 2, 3];"), "const x = [1, 2, 3];");
    }

    #[test]
    fn string_raw_preserved() {
        assert_eq!(print_ok("const x = \"hi\";"), "const x = \"hi\";");
        assert_eq!(print_ok("const x = 'hi';"), "const x = 'hi';");
    }

    #[test]
    fn leading_object_statement_parenthesised() {
        assert_eq!(print_ok("({ a: 1 });"), "({ a: 1 });");
    }

    #[test]
    fn imports() {
        assert_eq!(print_ok("import 'x';"), "import 'x';");
        assert_eq!(print_ok("import a from 'x';"), "import a from 'x';");
        assert_eq!(
            print_ok("import { a, b } from 'x';"),
            "import { a, b } from 'x';"
        );
        assert_eq!(
            print_ok("import { a as b } from 'x';"),
            "import { a as b } from 'x';"
        );
        assert_eq!(
            print_ok("import a, { b } from 'x';"),
            "import a, { b } from 'x';"
        );
        assert_eq!(
            print_ok("import * as ns from 'x';"),
            "import * as ns from 'x';"
        );
    }

    #[test]
    fn exports() {
        assert_eq!(print_ok("export { a, b };"), "export { a, b };");
        assert_eq!(
            print_ok("export { a as b } from 'x';"),
            "export { a as b } from 'x';"
        );
        assert_eq!(print_ok("export const x = 1;"), "export const x = 1;");
    }

    #[test]
    fn functions_and_arrows() {
        assert_eq!(
            print_ok("function f(a, b) { return a; }"),
            "function f(a, b) {\n\treturn a;\n}"
        );
        assert_eq!(
            print_ok("const g = (x) => x + 1;"),
            "const g = (x) => x + 1;"
        );
        assert_eq!(
            print_ok("const h = () => ({ a: 1 });"),
            "const h = () => ({ a: 1 });"
        );
        assert_eq!(print_ok("async function a() {}"), "async function a() {}");
        assert_eq!(print_ok("function r(...xs) {}"), "function r(...xs) {}");
        assert_eq!(print_ok("const e = await f();"), "const e = await f();");
        assert_eq!(print_ok("new Foo(1, 2);"), "new Foo(1, 2);");
        assert_eq!(print_ok("x++;"), "x++;");
        assert_eq!(print_ok("--obj.count;"), "--obj.count;");
    }

    #[test]
    fn call_trailing_multiline_arg_stays_inline() {
        // A multiline *final* argument does not wrap the call (esrap's bespoke
        // call layout) — only a multiline non-final argument would.
        assert_eq!(
            print_ok("foo(a, () => { b(); });"),
            "foo(a, () => {\n\tb();\n});"
        );
    }

    #[test]
    fn destructuring_assignment() {
        assert_eq!(print_ok("[a, b] = arr;"), "[a, b] = arr;");
        assert_eq!(print_ok("({ a, b: c } = o);"), "({ a, b: c } = o);");
        assert_eq!(print_ok("[a, ...rest] = arr;"), "[a, ...rest] = arr;");
        assert_eq!(print_ok("({ a = 1 } = o);"), "({ a = 1 } = o);");
    }

    #[test]
    fn private_and_meta() {
        assert_eq!(print_ok("this.#x;"), "this.#x;");
        assert_eq!(print_ok("export * from 'x';"), "export * from 'x';");
        assert_eq!(
            print_ok("export * as ns from 'x';"),
            "export * as ns from 'x';"
        );
    }

    #[test]
    fn classes() {
        assert_eq!(print_ok("class A {}"), "class A {}");
        assert_eq!(print_ok("const C = class {};"), "const C = class {};");
        assert_eq!(
            print_ok("class A extends B { m() {} }"),
            "class A extends B {\n\tm() {}\n}"
        );
        assert_eq!(print_ok("class A { x = 1; }"), "class A {\n\tx = 1;\n}");
    }

    #[test]
    fn object_methods() {
        assert_eq!(
            print_ok("const o = { f() {}, g() {} };"),
            "const o = { f() {}, g() {} };"
        );
        assert_eq!(
            print_ok("const o = { get x() {}, set x(v) {} };"),
            "const o = { get x() {}, set x(v) {} };"
        );
    }

    #[test]
    fn var_declaration_layout() {
        assert_eq!(print_ok("let a = 1, b = 2;"), "let a = 1, b = 2;");
        assert_eq!(
            print_with_comments_ok("let a = 1,\n// c\nb = 2;"),
            "let a = 1,\n\t// c\n\tb = 2;"
        );
    }

    #[test]
    fn control_flow() {
        assert_eq!(print_ok("if (a) b; else c;"), "if (a) b; else c;");
        assert_eq!(print_ok("while (a) b;"), "while (a) b;");
        assert_eq!(
            print_ok("for (let i = 0; i < n; i++) f();"),
            "for (let i = 0; i < n; i++) f();"
        );
        assert_eq!(print_ok("throw new Error('x');"), "throw new Error('x');");
    }

    #[test]
    fn more_statements() {
        assert_eq!(
            print_ok("outer: for (const x of xs) break outer;"),
            "outer: for (const x of xs) break outer;"
        );
        assert_eq!(
            print_ok("for (const x of xs) f(x);"),
            "for (const x of xs) f(x);"
        );
        assert_eq!(
            print_ok("for (const k in o) f(k);"),
            "for (const k in o) f(k);"
        );
        assert_eq!(
            print_ok("try { a(); } catch (e) { b(); }"),
            "try {\n\ta();\n} catch(e) {\n\tb();\n}"
        );
        assert_eq!(
            print_ok("try { a(); } finally { c(); }"),
            "try {\n\ta();\n} finally {\n\tc();\n}"
        );
        assert_eq!(print_ok("debugger;"), "debugger;");
    }

    #[test]
    fn param_defaults() {
        assert_eq!(
            print_ok("function f(a = 1, b) {}"),
            "function f(a = 1, b) {}"
        );
        assert_eq!(
            print_ok("const g = (x = 2) => x;"),
            "const g = (x = 2) => x;"
        );
    }

    #[test]
    fn more_expressions() {
        assert_eq!(print_ok("const r = /ab+c/gi;"), "const r = /ab+c/gi;");
        assert_eq!(print_ok("const s = tag`a${x}b`;"), "const s = tag`a${x}b`;");
        assert_eq!(
            print_ok("function* g() { yield 1; yield* h(); }"),
            "function* g() {\n\tyield 1;\n\tyield* h();\n}"
        );
    }

    #[test]
    fn destructuring_patterns() {
        assert_eq!(print_ok("const { a, b: c } = o;"), "const { a, b: c } = o;");
        assert_eq!(print_ok("const [x, y] = arr;"), "const [x, y] = arr;");
        assert_eq!(
            print_ok("const { a, ...rest } = o;"),
            "const { a, ...rest } = o;"
        );
        assert_eq!(
            print_ok("function f({ a = 1 }) {}"),
            "function f({ a = 1 }) {}"
        );
    }

    #[test]
    fn block_layout() {
        // `return` outside a function won't parse in mjs, so exercise the block
        // layout with an expression statement instead.
        assert_eq!(print_ok("{ a; }"), "{\n\ta;\n}");
        assert_eq!(print_ok("{}"), "{}");
    }
}
