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

use oxc_ast::ast::{
    AccessorProperty, AccessorPropertyType, Argument, ArrayExpression, ArrayExpressionElement,
    ArrayPattern, ArrowFunctionBody, ArrowFunctionExpression, AssignmentExpression,
    AssignmentTarget, AssignmentTargetMaybeDefault, AssignmentTargetProperty, BinaryExpression,
    BindingPattern, BindingProperty, CallExpression, ChainElement, Class, ClassBody, ClassElement,
    ComputedMemberExpression, ConditionalExpression, Declaration, Decorator, Directive,
    DoWhileStatement, ExportDeclaration, ExportDefaultDeclaration, ExportDefaultDeclarationKind,
    ExportFromDeclaration, ExportNamedDeclaration, ExportSpecifier, Expression, ForStatement,
    ForStatementInit, ForStatementLeft, FormalParameters, Function, IfStatement,
    ImportAttributeKey, ImportDeclaration, ImportDeclarationSpecifier, ImportOrExportKind,
    ImportSpecifier, JSXAttributeItem, JSXAttributeName, JSXAttributeValue, JSXChild, JSXElement,
    JSXElementName, JSXExpressionContainer, JSXFragment, JSXMemberExpression,
    JSXMemberExpressionObject, JSXOpeningElement, LogicalExpression, MethodDefinition,
    MethodDefinitionKind, MethodDefinitionType, ModuleExportName, ObjectExpression, ObjectPattern,
    ObjectProperty, ObjectPropertyKind, Program, PropertyDefinition, PropertyDefinitionType,
    PropertyKey, PropertyKind, SequenceExpression, SimpleAssignmentTarget, Statement,
    StaticMemberExpression, StringLiteral, SwitchStatement, TSAccessibility, TSEnumDeclaration,
    TSEnumMember, TSEnumMemberName, TSExternalModuleDeclaration, TSGlobalDeclaration,
    TSImportEqualsDeclaration, TSImportType, TSImportTypeQualifier, TSInterfaceDeclaration,
    TSLiteral, TSMappedType, TSMappedTypeModifierOperator, TSModuleBlock, TSModuleReference,
    TSNamedTupleMember, TSNamespaceDeclaration, TSNamespaceDeclarationBody,
    TSNamespaceDeclarationKind, TSSignature, TSThisParameter, TSTupleElement, TSType,
    TSTypeAliasDeclaration, TSTypeAnnotation, TSTypeLiteral, TSTypeName, TSTypeOperatorOperator,
    TSTypeParameter, TSTypeParameterDeclaration, TSTypeParameterInstantiation, TSTypePredicateName,
    TSTypeQueryExprName, TemplateLiteral, TryStatement, UnaryExpression, VariableDeclaration,
    VariableDeclarationKind, WithClause,
};
use oxc_span::{GetSpan, Span};
use oxc_syntax::operator::UnaryOperator;

use compact_str::{CompactString, format_compact};

use crate::PrintOptions;
use crate::command::EventKind;
use crate::context::{Context, EventMark};

fn usize_to_u32(value: usize) -> u32 {
    u32::try_from(value).expect("source positions exceed the u32 AST coordinate range")
}

fn usize_to_i64(value: usize) -> i64 {
    i64::try_from(value).expect("command buffers exceed the i64 layout range")
}

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
    line_end: Option<u32>,
}

impl KeywordCursor {
    /// Write one fragment (e.g. `"declare "`, `"class "`). Mapped if a cursor is
    /// active, otherwise a plain write.
    fn write<const DIRECT: bool>(&mut self, ctx: &mut Context<DIRECT>, fragment: &str) {
        if let Some((line, col)) = self.cursor {
            ctx.location(line, col);
            ctx.write(fragment);
            let end = col.saturating_add(usize_to_u32(fragment.len()));
            if end <= self.line_end.unwrap_or(u32::MAX) {
                ctx.location(line, end);
            }
            self.cursor = Some((line, col + usize_to_u32(fragment.len())));
        } else {
            ctx.write(fragment);
        }
    }
}

#[repr(C)]
pub struct Printer<'opt, const HAS_COMMENTS: bool = true, const DIRECT: bool = false> {
    options: &'opt PrintOptions,
    emit_locations: bool,
    /// Set by the first unsupported node encountered; printing continues so the
    /// harness gets a single representative miss per file.
    pub missing: Option<Unsupported>,
    /// Source-order comments to interleave, and the cursor into them. esrap
    /// threads comments positionally (leading before a node, trailing on a
    /// node's last line) rather than attaching them to AST nodes.
    comments: Vec<Cmt>,
    borrowed_comments: Option<&'opt [oxc_ast::ast::Comment]>,
    comment_index: usize,
    /// Byte offsets of each line start in the buffer the comment spans index
    /// into, for offset→line lookups when placing comments. Empty when printing
    /// without comments.
    line_starts: Vec<u32>,
    comment_source: Option<&'opt str>,
    /// Byte offsets of each line start in the buffer source-map positions are
    /// resolved against. Same as `line_starts` unless the caller split the two
    /// coordinate spaces (see [`crate::print_split`]).
    map_line_starts: Option<Vec<u32>>,
    /// Spans below this offset are synthesized and carry no source location, so
    /// they take no part in comment placement — the Rust equivalent of esrap's
    /// `if (node.loc)` guards. `None` = every span is a real location.
    loc_base: Option<u32>,
    /// Sorted, disjoint `(start, end, mapped)` ranges translating a comment-space
    /// offset back to a source-map-space offset. `None` mapped = unmapped.
    loc_map: Vec<(u32, u32, Option<u32>)>,
    /// Decorator expressions have no esrap mapping visitor, so their nested
    /// tokens must stay unmapped too.
    map_nodes: bool,
}

/// esrap's `write_comment`: re-emit a comment, splitting a multi-line block
/// body across `newline`s so its interior re-indents to the current level. A
/// free function so the comment-flush loops can hold a `&Cmt` borrowed straight
/// out of `self.comments` without cloning it.
fn write_comment<const DIRECT: bool>(cmt: &Cmt, ctx: &mut Context<DIRECT>) {
    let value = &cmt.value;
    if !cmt.block {
        ctx.write(format_compact!("//{value}"));
        return;
    }
    ctx.write_ascii_bytes(b"/*");
    let mut multiline = false;
    for (i, line) in value.split('\n').enumerate() {
        if i > 0 {
            ctx.newline();
            multiline = true;
        }
        ctx.write(line);
    }
    ctx.write_ascii_bytes(b"*/");
    if multiline {
        ctx.newline();
    }
}

fn write_borrowed_comment_span<const DIRECT: bool>(
    start: u32,
    end: u32,
    block: bool,
    source: &str,
    ctx: &mut Context<DIRECT>,
) {
    let raw = source.get(start as usize..end as usize).unwrap_or_default();
    if !block {
        ctx.write(raw);
        return;
    }
    let inner = raw
        .strip_prefix("/*")
        .and_then(|text| text.strip_suffix("*/"))
        .unwrap_or(raw);
    if !inner.contains('\n') {
        ctx.write(raw);
        return;
    }

    let line_start = source[..start as usize]
        .rfind('\n')
        .map_or(0, |index| index + 1);
    let opener_line = &source[line_start..start as usize];
    let indent_len = opener_line
        .as_bytes()
        .iter()
        .take_while(|&&byte| matches!(byte, b' ' | b'\t'))
        .count();
    let indentation = &opener_line[..indent_len];

    ctx.write_ascii_bytes(b"/*");
    for (index, line) in inner.split('\n').enumerate() {
        if index > 0 {
            ctx.newline();
        }
        ctx.write(line.strip_prefix(indentation).unwrap_or(line));
    }
    ctx.write_ascii_bytes(b"*/");
    ctx.newline();
}

struct BorrowedCommentDriver<'a> {
    comments: &'a [oxc_ast::ast::Comment],
    source: &'a str,
    index: usize,
}

#[derive(Clone, Copy)]
struct CommentMeta {
    start: u32,
    end: u32,
    start_line: u32,
    block: bool,
}

impl<'a> BorrowedCommentDriver<'a> {
    fn new(program: &'a Program<'a>, source: &'a str, located: bool) -> Self {
        Self {
            comments: &program.comments,
            source,
            index: if located { 0 } else { program.comments.len() },
        }
    }

    fn flush_until<const DIRECT: bool>(
        &mut self,
        ctx: &mut Context<DIRECT>,
        to: u32,
        from: Option<u32>,
        pad: bool,
    ) {
        let Some(next) = self.comments.get(self.index) else {
            return;
        };
        if next.span.start >= to {
            return;
        }
        let mut first = true;
        while let Some(comment) = self.comments.get(self.index) {
            if comment.span.start >= to {
                break;
            }
            if first && from.is_some_and(|from| self.has_newline(from, comment.span.start)) {
                ctx.margin();
                ctx.newline();
            }
            first = false;
            self.write(comment, ctx);
            if self.has_newline(comment.span.end, to) {
                ctx.newline();
            } else if pad {
                ctx.write_ascii(b' ');
            }
            self.index += 1;
        }
    }

    fn flush_trailing<const DIRECT: bool>(
        &mut self,
        ctx: &mut Context<DIRECT>,
        prev_end: u32,
        next: Option<u32>,
    ) {
        while let Some(comment) = self.comments.get(self.index) {
            if self.has_newline(prev_end, comment.span.start)
                || next.is_some_and(|next| comment.span.end >= next)
            {
                break;
            }
            ctx.write_ascii(b' ');
            self.write(comment, ctx);
            self.index += 1;
            if matches!(comment.kind, oxc_ast::ast::CommentKind::Line) {
                ctx.newline();
                break;
            }
        }
    }

    fn has_newline(&self, start: u32, end: u32) -> bool {
        debug_assert!(start <= end);
        self.source
            .get(start as usize..end as usize)
            .is_some_and(|text| text.as_bytes().contains(&b'\n'))
    }

    fn write<const DIRECT: bool>(
        &self,
        comment: &oxc_ast::ast::Comment,
        ctx: &mut Context<DIRECT>,
    ) {
        let raw = comment.span.source_text(self.source);
        if matches!(comment.kind, oxc_ast::ast::CommentKind::Line) {
            ctx.write(raw);
            return;
        }
        let inner = raw
            .strip_prefix("/*")
            .and_then(|text| text.strip_suffix("*/"))
            .unwrap_or(raw);
        if !inner.contains('\n') {
            ctx.write(raw);
            return;
        }

        let line_start = self.source[..comment.span.start as usize]
            .rfind('\n')
            .map_or(0, |index| index + 1);
        let opener_line = &self.source[line_start..comment.span.start as usize];
        let indent_len = opener_line
            .as_bytes()
            .iter()
            .take_while(|&&byte| matches!(byte, b' ' | b'\t'))
            .count();
        let indentation = &opener_line[..indent_len];

        ctx.write_ascii_bytes(b"/*");
        for (index, line) in inner.split('\n').enumerate() {
            if index > 0 {
                ctx.newline();
            }
            ctx.write(line.strip_prefix(indentation).unwrap_or(line));
        }
        ctx.write_ascii_bytes(b"*/");
        ctx.newline();
    }
}

/// Byte offsets at which each source line begins (line 1 starts at 0).
pub fn line_starts(source: &str) -> Vec<u32> {
    // Sized off an assumed ~32 bytes per line so a long source does not walk the
    // whole doubling sequence.
    let mut starts = Vec::with_capacity(source.len() / 32 + 8);
    starts.push(0);
    starts.extend(memchr::memchr_iter(b'\n', source.as_bytes()).map(|i| usize_to_u32(i) + 1));
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
    pub block: bool,
    pub value: String,
}

/// Resolve a program's oxc comments into [`Cmt`]s in source order. `source` is
/// the text the program was parsed from (for the comment bodies + line numbers).
pub fn build_comments(program: &Program<'_>, source: &str, starts: &[u32]) -> Vec<Cmt> {
    let line_of = |offset: u32| -> u32 {
        // 1-based line: number of line starts <= offset.
        usize_to_u32(starts.partition_point(|&s| s <= offset))
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
                block,
                value,
            }
        })
        .collect()
}

pub(crate) fn comments_are_program_level(program: &Program<'_>) -> bool {
    let mut comment_index = 0;
    let spans = program
        .directives
        .iter()
        .map(|directive| directive.span)
        .chain(program.body.iter().map(GetSpan::span));
    for span in spans {
        if span.start == u32::MAX || span.end == u32::MAX {
            return false;
        }
        while program
            .comments
            .get(comment_index)
            .is_some_and(|comment| comment.span.end <= span.start)
        {
            comment_index += 1;
        }
        if program
            .comments
            .get(comment_index)
            .is_some_and(|comment| comment.span.start < span.end)
        {
            return false;
        }
    }
    true
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
/// spine and report whether any link is a `CallExpression`. Used to decide whether
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
        | Expression::ImportMeta(_)
        | Expression::NewTarget(_)
        | Expression::CallExpression(_)
        | Expression::ChainExpression(_)
        | Expression::ImportExpression(_)
        | Expression::NewExpression(_) => 19,
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

impl<'opt, const HAS_COMMENTS: bool, const DIRECT: bool> Printer<'opt, HAS_COMMENTS, DIRECT> {
    fn deferred(&mut self) -> &mut Printer<'opt, HAS_COMMENTS, false> {
        // SAFETY: the const parameter does not affect the repr(C) field layout.
        unsafe { &mut *(std::ptr::from_mut(self).cast()) }
    }

    fn comment_free(&mut self) -> &mut Printer<'opt, false, DIRECT> {
        // SAFETY: the const parameter does not affect the repr(C) field layout.
        unsafe { &mut *(std::ptr::from_mut(self).cast()) }
    }

    #[cfg(test)]
    pub const fn new(options: &'opt PrintOptions) -> Self {
        Self {
            options,
            emit_locations: false,
            missing: None,
            comments: Vec::new(),
            borrowed_comments: None,
            comment_index: 0,
            line_starts: Vec::new(),
            comment_source: None,
            map_line_starts: None,
            loc_base: None,
            loc_map: Vec::new(),
            map_nodes: true,
        }
    }

    /// A printer that interleaves `comments` (see [`build_comments`]).
    /// `line_starts` is the table from [`line_starts`].
    pub const fn with_comments(
        options: &'opt PrintOptions,
        comments: Vec<Cmt>,
        line_starts: Vec<u32>,
    ) -> Self {
        Self {
            options,
            emit_locations: false,
            missing: None,
            comments,
            borrowed_comments: None,
            comment_index: 0,
            map_line_starts: None,
            line_starts,
            comment_source: None,
            loc_base: None,
            loc_map: Vec::new(),
            map_nodes: true,
        }
    }

    pub(crate) const fn with_borrowed_comments(
        mut self,
        comments: &'opt [oxc_ast::ast::Comment],
        source: &'opt str,
    ) -> Self {
        self.borrowed_comments = Some(comments);
        self.comment_source = Some(source);
        self
    }

    /// Resolve source-map positions against a different buffer than the one the
    /// comment spans index into, and treat spans below `loc_base` as
    /// synthesized (no location). `loc_map` translates comment-space offsets
    /// back into map-space offsets.
    pub fn with_split_coordinates(
        mut self,
        map_line_starts: Vec<u32>,
        loc_base: u32,
        loc_map: &[(u32, u32, Option<u32>)],
        emit_locations: bool,
    ) -> Self {
        self.emit_locations = emit_locations;
        self.map_line_starts = Some(map_line_starts);
        self.loc_base = Some(loc_base);
        self.loc_map = loc_map.to_vec();
        self
    }

    /// Enable source-map anchor events for this print.
    pub const fn with_source_map(mut self) -> Self {
        self.emit_locations = true;
        self
    }

    pub(crate) fn source_map_line_starts(&self) -> &[u32] {
        self.map_line_starts.as_deref().unwrap_or(&self.line_starts)
    }

    /// 1-based line of a byte offset (number of line starts at/before it).
    fn line_of(&self, offset: u32) -> u32 {
        usize_to_u32(self.line_starts.partition_point(|&s| s <= offset))
    }

    fn has_newline_between(&self, start: u32, end: u32) -> bool {
        if start >= end {
            return false;
        }
        self.comment_source.map_or_else(
            || self.line_of(start) < self.line_of(end),
            |source| {
                source
                    .get(start as usize..end as usize)
                    .is_some_and(|text| text.as_bytes().contains(&b'\n'))
            },
        )
    }

    fn comment_starts_on_earlier_line(&self, comment: CommentMeta, offset: u32) -> bool {
        self.comment_source.map_or_else(
            || comment.start_line < self.line_of(offset),
            |_| self.has_newline_between(comment.start, offset),
        )
    }

    /// esrap's `if (node.loc)`: whether a span offset is a real source position
    /// (and so may carry comments) rather than a synthesized node's placeholder.
    fn has_loc(&self, offset: u32) -> bool {
        offset != u32::MAX && self.loc_base.is_none_or(|base| offset >= base)
    }

    /// Convert a byte offset to `(line_1based, column_0based)` using
    /// `line_starts`, mirroring `ESTree` `loc` (1-based line, 0-based column). The
    /// column is the offset relative to the start of its line; for ASCII / BMP
    /// source this equals the UTF-16 column esrap uses. Returns `None` when
    /// there are no line starts (printing without source context).
    fn offset_to_line_col(&self, offset: u32) -> Option<(u32, u32)> {
        if !self.has_loc(offset) {
            return None;
        }
        let map_line_starts = self.map_line_starts.as_deref().unwrap_or(&self.line_starts);
        if map_line_starts.is_empty() {
            return None;
        }
        let offset = if self.loc_map.is_empty() {
            offset
        } else {
            match self
                .loc_map
                .binary_search_by(|(start, end, _)| {
                    if offset < *start {
                        std::cmp::Ordering::Greater
                    } else if offset >= *end {
                        std::cmp::Ordering::Less
                    } else {
                        std::cmp::Ordering::Equal
                    }
                })
                .ok()
                .map(|i| self.loc_map[i].2)
            {
                Some(Some(mapped)) => mapped,
                Some(None) => return None,
                None => offset,
            }
        };
        let line = usize_to_u32(map_line_starts.partition_point(|&s| s <= offset));
        // `line` is 1-based; its start offset lives at index `line - 1`.
        let line_start = map_line_starts[(line - 1) as usize];
        Some((line, offset.saturating_sub(line_start)))
    }

    /// esrap's `write_source_keyword`: bracket the literal `keyword` with
    /// source-map anchors for its exact span, so breakpoints land on the keyword.
    fn write_source_keyword(ctx: &mut Context<DIRECT>, line: u32, column: u32, keyword: &str) {
        ctx.location(line, column);
        ctx.write(keyword);
        ctx.location(line, column + usize_to_u32(keyword.len()));
    }

    /// esrap's `write_keyword`: map one `keyword` anchored at the byte offset
    /// `start` (resolved to a source `loc`), then append an unmapped `suffix`. If
    /// the offset can't be resolved (no source context), falls back to a plain
    /// `keyword + suffix` write.
    fn write_keyword(&self, ctx: &mut Context<DIRECT>, start: u32, keyword: &str, suffix: &str) {
        if !self.emit_locations {
            ctx.write(keyword);
            ctx.write(suffix);
            return;
        }
        if let Some((line, column)) = self.offset_to_line_col(start) {
            ctx.location(line, column);
            ctx.write(keyword);
            let line_starts = self.map_line_starts.as_deref().unwrap_or(&self.line_starts);
            let line_end = line_starts
                .get(line as usize)
                .copied()
                .unwrap_or(u32::MAX)
                .saturating_sub(1);
            let line_start = line_starts[(line - 1) as usize];
            let end = column.saturating_add(usize_to_u32(keyword.len()));
            if end <= line_end.saturating_sub(line_start) {
                ctx.location(line, end);
            }
            if !suffix.is_empty() {
                ctx.write(suffix);
            }
        } else {
            ctx.write(format_compact!("{keyword}{suffix}"));
        }
    }

    /// Write one source-backed token bracketed by anchors for its AST span.
    /// Synthesized nodes deliberately stay unmapped, matching esrap's `node.loc`
    /// guard.
    fn write_node(&self, ctx: &mut Context<DIRECT>, span: Span, content: impl AsRef<str>) {
        let content = content.as_ref();
        if !self.emit_locations || !self.map_nodes || span.is_empty() || !self.has_loc(span.start) {
            ctx.write(content);
            return;
        }

        if self.loc_map.is_empty() && !self.line_starts.is_empty() {
            ctx.location_offset(span.start);
            ctx.write(content);
            ctx.location_offset(span.end);
            return;
        }

        if let Some((line, column)) = self.offset_to_line_col(span.start) {
            ctx.location(line, column);
        }
        ctx.write(content);
        if let Some((line, column)) = self.offset_to_line_col(span.end) {
            ctx.location(line, column);
        }
    }

    /// A block brace maps to its own source offset; a synthesized block carries
    /// no braces in the source, so `body_start == body_end` stays unmapped.
    fn write_block_brace(
        &self,
        ctx: &mut Context<DIRECT>,
        body_start: u32,
        body_end: u32,
        open: bool,
    ) {
        if body_start >= body_end {
            ctx.write_ascii(if open { b'{' } else { b'}' });
            return;
        }
        let span = if open {
            Span::new(body_start, body_start + 1)
        } else {
            Span::new(body_end - 1, body_end)
        };
        self.write_node(ctx, span, if open { "{" } else { "}" });
    }

    /// esrap's `create_keyword_write`: returns a closure-like cursor for writing
    /// a run of sequential keyword fragments (e.g. `declare `, `class `) starting
    /// at byte offset `start`, advancing the column by each fragment's length.
    /// When `map_ok` is false (or no source context), every fragment is written
    /// unmapped. Implemented as an explicit [`KeywordCursor`] because Rust closures
    /// can't borrow `self` mutably across calls the way the JS closure does.
    fn keyword_cursor(&self, start: u32, map_ok: bool) -> KeywordCursor {
        let cursor = if map_ok && self.emit_locations {
            self.offset_to_line_col(start)
        } else {
            None
        };
        let line_end = cursor.map(|(line, _)| {
            let line_starts = self.map_line_starts.as_deref().unwrap_or(&self.line_starts);
            line_starts
                .get(line as usize)
                .copied()
                .unwrap_or(u32::MAX)
                .saturating_sub(1)
                .saturating_sub(line_starts[(line - 1) as usize])
        });
        KeywordCursor { cursor, line_end }
    }

    /// esrap's `function_async_function_offset_ok`: the `async function` source
    /// offsets are only trustworthy when the `function` token shares a line with
    /// `async`, anchored by the id or body starting on the same line as the node.
    fn function_async_offset_ok(&self, node: &Function) -> bool {
        if !self.emit_locations {
            return false;
        }
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
        if !self.emit_locations {
            return false;
        }
        if !node.decorators.is_empty() {
            return false;
        }
        let Some((line, _)) = self.offset_to_line_col(node.span().start) else {
            return false;
        };
        let anchor = node.id.as_ref().map_or_else(
            || self.offset_to_line_col(node.body.span().start),
            |id| self.offset_to_line_col(id.span().start),
        );
        anchor.map(|(l, _)| l) == Some(line)
    }

    // ----- comments ---------------------------------------------------------

    fn comment_len(&self) -> usize {
        self.borrowed_comments
            .map_or(self.comments.len(), <[_]>::len)
    }

    fn comment_at(&self, index: usize) -> Option<CommentMeta> {
        if let Some(comments) = self.borrowed_comments {
            return comments.get(index).map(|comment| CommentMeta {
                start: comment.span.start,
                end: comment.span.end,
                start_line: 0,
                block: !matches!(comment.kind, oxc_ast::ast::CommentKind::Line),
            });
        }
        self.comments.get(index).map(|comment| CommentMeta {
            start: comment.start,
            end: comment.end,
            start_line: comment.start_line,
            block: comment.block,
        })
    }

    fn comment_partition_point(&self, offset: u32) -> usize {
        self.borrowed_comments.map_or_else(
            || {
                self.comments
                    .partition_point(|comment| comment.start < offset)
            },
            |comments| comments.partition_point(|comment| comment.span.start < offset),
        )
    }

    fn write_comment_at(&self, index: usize, ctx: &mut Context<DIRECT>) {
        if let Some(source) = self.comment_source {
            let comment = self.comment_at(index).expect("pending comment");
            write_borrowed_comment_span(comment.start, comment.end, comment.block, source, ctx);
        } else {
            write_comment(&self.comments[index], ctx);
        }
    }

    /// esrap's `flush_comments_until`: emit every pending comment that starts
    /// before `to`. The `from` margin rule adds a
    /// blank line before a detached leading comment block.
    fn flush_comments_until(
        &mut self,
        ctx: &mut Context<DIRECT>,
        to: u32,
        from: Option<u32>,
        pad: bool,
    ) {
        if !HAS_COMMENTS || self.comment_index == self.comment_len() {
            return;
        }
        if !self.has_loc(to) {
            return;
        }
        let Some(next_comment) = self.comment_at(self.comment_index) else {
            return;
        };
        if next_comment.start >= to {
            return;
        }
        let mut first = true;
        while self.comment_index < self.comment_len() {
            let cmt = self
                .comment_at(self.comment_index)
                .expect("pending comment");
            if cmt.start >= to {
                break;
            }
            if first
                && let Some(from) = from.filter(|&offset| self.has_loc(offset))
                && self.has_newline_between(from, cmt.start)
            {
                ctx.margin();
                ctx.newline();
            }
            first = false;
            self.write_comment_at(self.comment_index, ctx);
            if self.has_newline_between(cmt.end, to) {
                ctx.newline();
            } else if pad {
                ctx.write_ascii(b' ');
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
        ctx: &mut Context<DIRECT>,
        prev_end: u32,
        next: Option<u32>,
    ) -> bool {
        if !HAS_COMMENTS || self.comment_index == self.comment_len() || !self.has_loc(prev_end) {
            return false;
        }
        // A `next` boundary that is itself synthesized bounds nothing (esrap's
        // `next` is `null` when the following node has no `loc`).
        let next = next.filter(|n| self.has_loc(*n));
        let mut emitted_line_newline = false;
        while self.comment_index < self.comment_len() {
            let cmt = self
                .comment_at(self.comment_index)
                .expect("pending comment");
            let fits =
                !self.has_newline_between(prev_end, cmt.start) && next.is_none_or(|n| cmt.end < n);
            if !fits {
                break;
            }
            ctx.write_ascii(b' ');
            self.write_comment_at(self.comment_index, ctx);
            let is_block = cmt.block;
            self.comment_index += 1;
            if is_block {
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
    /// `None` and synthesized offsets are esrap's `!node.loc`, which discards
    /// every pending comment instead of carrying the cursor forward.
    fn reset_comment_index(&mut self, node_start: Option<u32>) {
        if !HAS_COMMENTS {
            return;
        }
        let Some(node_start) = node_start else {
            self.comment_index = self.comment_len();
            return;
        };
        if !self.has_loc(node_start) {
            self.comment_index = self.comment_len();
            return;
        }
        let cur = self.comment_at(self.comment_index);
        let prev = self
            .comment_index
            .checked_sub(1)
            .and_then(|i| self.comment_at(i));
        let synced =
            cur.is_some_and(|c| c.start >= node_start) && prev.is_none_or(|p| p.start < node_start);
        if synced {
            return;
        }
        // `comments` is in source order (ascending `start`), so binary-search the
        // first comment at/after `node_start` instead of a linear scan.
        self.comment_index = self.comment_partition_point(node_start);
    }

    /// The `_` wildcard's leading flush: emit comments positioned before `node`.
    fn flush_leading(&mut self, ctx: &mut Context<DIRECT>, node_start: u32) {
        if !HAS_COMMENTS {
            return;
        }
        self.flush_comments_until(ctx, node_start, None, true);
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
        mut nodes: Vec<SeqNode<'_, HAS_COMMENTS>>,
        until: Option<u32>,
        pad: bool,
        separator: &'static str,
        trailing_newline: bool,
        parent: &mut Context<DIRECT>,
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
            (node.render)(self.deferred(), &mut child);

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
                self.deferred()
                    .flush_trailing_comments(&mut child, end, next);
            }

            length += usize_to_i64(child.measure()) + 1;
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
            parent.write_ascii(b' ');
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
                        parent.write_ascii(b' ');
                    }
                }
            }
            prev = Some((item.multiline, item.obj_or_array));
            parent.append(item.ctx);
        }

        // esrap: flush_comments_until(context, lastNode.loc.end, until, false).
        if let Some(until) = until {
            let from = nodes.last().and_then(|node| node.end);
            self.flush_comments_until(parent, until, from, false);
        }

        if multiline {
            parent.dedent();
            if trailing_newline {
                parent.newline();
            }
        } else if pad && length > 0 {
            parent.write_ascii(b' ');
        }
    }

    fn sequence_indexed(
        &mut self,
        n: usize,
        mut meta: impl FnMut(usize) -> SeqMeta,
        mut render: impl FnMut(&mut Self, usize, &mut Context<DIRECT>),
        until: Option<u32>,
        pad: bool,
        separator: &'static str,
        trailing_newline: bool,
        parent: &mut Context<DIRECT>,
    ) {
        // A comment can introduce a newline while rendering, so only clean sequences pre-indent.
        let has_sequence_comments = DIRECT && HAS_COMMENTS && n > 0 && {
            let before_until = |cmt: CommentMeta| until.is_none_or(|end| cmt.start < end);
            let pending = self
                .comment_at(self.comment_index)
                .is_some_and(before_until);
            let in_nodes = meta(0).start.is_none_or(|start| {
                let index = self.comment_partition_point(start);
                self.comment_at(index).is_some_and(before_until)
            });
            pending || in_nodes
        };
        let direct_layout = DIRECT && !has_sequence_comments;
        if n == 0 {
            if let Some(until) = until {
                self.flush_comments_until(parent, until, None, false);
            }
            return;
        }

        if n == 1 {
            let node_meta = meta(0);
            let mark = parent.event_mark();
            if direct_layout {
                if pad {
                    parent.optimistic_space();
                }
                parent.indent();
            }
            let scope = parent.begin_scope();
            render(self, 0, parent);
            if node_meta.is_elision {
                parent.write(separator);
            }
            if let Some(end) = node_meta.end {
                self.flush_trailing_comments(parent, end, until);
            }
            let length = parent.measure();
            let multiline = parent.end_scope(scope);

            if direct_layout && pad && length == 0 {
                parent.cancel_optimistic_space();
            }

            if multiline {
                parent.insert_event(mark, EventKind::Newline);
                if !direct_layout {
                    parent.insert_event(mark, EventKind::Indent);
                }
                parent.multiline = true;
            } else if !direct_layout && pad && length > 0 {
                parent.insert_event(mark, EventKind::Space);
            }

            if let Some(until) = until {
                self.flush_comments_until(parent, until, node_meta.end, false);
            }

            if multiline {
                parent.dedent();
                if trailing_newline {
                    parent.newline();
                }
            } else {
                if direct_layout {
                    parent.dedent();
                }
                if pad && length > 0 {
                    parent.write_ascii(b' ');
                }
            }
            return;
        }

        if n <= 3 {
            let mut multiline = false;
            let mut length: i64 = -1;
            let mut items = [None; 3];

            if direct_layout {
                parent.indent();
            }

            for (i, item) in items.iter_mut().enumerate().take(n) {
                let node_meta = meta(i);
                let mark = if direct_layout && (pad || i > 0) && !node_meta.is_elision {
                    parent.retro_space_mark()
                } else {
                    parent.event_mark()
                };
                let scope = parent.begin_scope();
                render(self, i, parent);

                let node_multiline = parent.multiline;
                if i < n - 1 || node_meta.is_elision {
                    parent.write(separator);
                }

                let next = if i == n - 1 { until } else { meta(i + 1).start };
                if let Some(end) = node_meta.end {
                    self.flush_trailing_comments(parent, end, next);
                }

                length += usize_to_i64(parent.measure()) + 1;
                multiline |= parent.end_scope(scope);
                *item = Some(SeqLayout {
                    mark,
                    multiline: node_multiline,
                    obj_or_array: node_meta.obj_or_array,
                    is_elision: node_meta.is_elision,
                });
            }

            multiline |= length > 60;

            for i in (0..n).rev() {
                let item = items[i].unwrap();
                if i > 0 {
                    let prev = items[i - 1].unwrap();
                    let margin = prev.multiline
                        && item.multiline
                        && !(prev.obj_or_array && item.obj_or_array);
                    if !item.is_elision && (multiline || !direct_layout) {
                        parent.insert_event(
                            item.mark,
                            if multiline {
                                EventKind::Newline
                            } else {
                                EventKind::Space
                            },
                        );
                    }
                    if margin {
                        parent.insert_event(item.mark, EventKind::Margin);
                    }
                }
            }

            let first = items[0].unwrap();
            if multiline {
                parent.insert_event(first.mark, EventKind::Newline);
                if !direct_layout {
                    parent.insert_event(first.mark, EventKind::Indent);
                }
                parent.multiline = true;
            } else if !direct_layout && pad && length > 0 {
                parent.insert_event(first.mark, EventKind::Space);
            }

            if let Some(until) = until {
                self.flush_comments_until(parent, until, meta(n - 1).end, false);
            }

            if multiline {
                parent.dedent();
                if trailing_newline {
                    parent.newline();
                }
            } else {
                if direct_layout {
                    parent.dedent();
                }
                if pad && length > 0 {
                    parent.write_ascii(b' ');
                }
            }
            return;
        }

        let mut multiline = false;
        let mut length: i64 = -1;
        let mut items: Vec<SeqLayout> = Vec::with_capacity(n);

        if direct_layout {
            parent.indent();
        }

        for i in 0..n {
            let node_meta = meta(i);
            let mark = if direct_layout && (pad || i > 0) && !node_meta.is_elision {
                parent.retro_space_mark()
            } else {
                parent.event_mark()
            };
            let scope = parent.begin_scope();
            render(self, i, parent);

            let node_multiline = parent.multiline;
            if i < n - 1 || node_meta.is_elision {
                parent.write(separator);
            }

            let next = if i == n - 1 { until } else { meta(i + 1).start };
            if let Some(end) = node_meta.end {
                self.flush_trailing_comments(parent, end, next);
            }

            length += usize_to_i64(parent.measure()) + 1;
            multiline |= parent.end_scope(scope);
            items.push(SeqLayout {
                mark,
                multiline: node_multiline,
                obj_or_array: node_meta.obj_or_array,
                is_elision: node_meta.is_elision,
            });
        }

        multiline |= length > 60;

        for i in (0..items.len()).rev() {
            let item = items[i];
            if i > 0 {
                let prev = items[i - 1];
                let margin =
                    prev.multiline && item.multiline && !(prev.obj_or_array && item.obj_or_array);
                if !item.is_elision && (multiline || !direct_layout) {
                    parent.insert_event(
                        item.mark,
                        if multiline {
                            EventKind::Newline
                        } else {
                            EventKind::Space
                        },
                    );
                }
                if margin {
                    parent.insert_event(item.mark, EventKind::Margin);
                }
            }
        }

        if let Some(first) = items.first() {
            if multiline {
                parent.insert_event(first.mark, EventKind::Newline);
                if !direct_layout {
                    parent.insert_event(first.mark, EventKind::Indent);
                }
                parent.multiline = true;
            } else if !direct_layout && pad && length > 0 {
                parent.insert_event(first.mark, EventKind::Space);
            }
        }

        if let Some(until) = until {
            let from = n.checked_sub(1).and_then(|i| meta(i).end);
            self.flush_comments_until(parent, until, from, false);
        }

        if multiline {
            parent.dedent();
            if trailing_newline {
                parent.newline();
            }
        } else {
            if direct_layout {
                parent.dedent();
            }
            if pad && length > 0 {
                parent.write_ascii(b' ');
            }
        }
    }

    fn sequence_slice<T>(
        &mut self,
        nodes: &[T],
        mut meta: impl FnMut(&T) -> SeqMeta,
        mut render: impl FnMut(&mut Self, &T, &mut Context<DIRECT>),
        until: Option<u32>,
        pad: bool,
        separator: &'static str,
        trailing_newline: bool,
        parent: &mut Context<DIRECT>,
    ) {
        self.sequence_indexed(
            nodes.len(),
            |i| meta(&nodes[i]),
            |printer, i, child| render(printer, &nodes[i], child),
            until,
            pad,
            separator,
            trailing_newline,
            parent,
        );
    }

    fn unsupported(&mut self, kind: &'static str, ctx: &mut Context<DIRECT>) {
        if self.missing.is_none() {
            self.missing = Some(Unsupported(kind));
        }
        // Emit a marker so output is obviously wrong if a miss slips through a
        // test that forgot to check `missing`.
        ctx.write(format_compact!("/*unsupported:{kind}*/"));
    }

    // ----- statements -------------------------------------------------------

    pub fn print_program(&mut self, program: &Program, ctx: &mut Context<DIRECT>) {
        let span = program.span();
        // Upstream's program is builder-made and carries no `loc`, so its
        // statement list discards the pending comments and only a nested body
        // that does carry one re-finds them — which is why a comment inside a
        // function body survives while a file header does not. Opt-in because
        // the recovery needs located nested bodies, and rsvelte only has those
        // where the chunks were re-parsed rather than assembled from builders.
        let body_start = (!self.options.unlocated_program).then_some(span.start);
        // Directives (`"use strict"`) are a separate oxc node, but esrap (from
        // an acorn AST) sees them as leading string-literal ExpressionStatements
        // in `body`; thread them through the same `body` sequence so margins and
        // leading comments are computed identically.
        let elems = program
            .directives
            .iter()
            .map(BodyElem::Directive)
            .chain(program.body.iter().map(BodyElem::Statement));
        self.body_elems(elems, body_start, span.end, ctx);
    }

    pub(crate) fn print_program_with_outer_comments(
        &mut self,
        program: &Program,
        source: &str,
        ctx: &mut Context<DIRECT>,
    ) {
        debug_assert!(!HAS_COMMENTS && DIRECT);
        let span = program.span();
        let body_start = (!self.options.unlocated_program).then_some(span.start);
        let mut comments = BorrowedCommentDriver::new(program, source, body_start.is_some());
        let keep_empty = self.options.keep_empty_statements;
        let mut elems = program
            .directives
            .iter()
            .map(BodyElem::Directive)
            .chain(program.body.iter().map(BodyElem::Statement))
            .filter(|elem| keep_empty || !elem.is_empty_stmt())
            .peekable();
        let mut prev: Option<(BodyElem<'_, '_>, bool)> = None;
        let mut last_end = None;
        while let Some(elem) = elems.next() {
            let layout_mark = ctx.event_mark();
            let mut has_margin = false;
            if let Some((prev_elem, prev_multiline)) = &prev {
                let joined = prev_elem.is_kept_empty() && elem.is_kept_empty();
                has_margin = !joined && (*prev_multiline || !elem.same_kind(prev_elem));
                if has_margin {
                    ctx.margin();
                }
                if !joined {
                    ctx.newline();
                }
            }

            let scope = ctx.begin_scope();
            comments.flush_until(ctx, elem.span_start(), None, true);
            elem.print(self, ctx);
            let multiline = ctx.end_scope(scope);
            if multiline && prev.is_some() && !has_margin {
                ctx.insert_event(layout_mark, EventKind::Margin);
            }

            let end = elem.comment_end();
            let next = elems.peek().map(BodyElem::comment_end);
            comments.flush_trailing(ctx, end, next);
            last_end = Some(end);
            prev = Some((elem, multiline));
        }

        ctx.newline();
        if body_start.is_some() {
            comments.flush_until(ctx, span.end, last_end, false);
        }
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
        ctx: &mut Context<DIRECT>,
    ) {
        self.body_elems(
            statements.iter().map(BodyElem::Statement),
            Some(body_start),
            body_end,
            ctx,
        );
    }

    fn comments_are_outer_to_block(
        &self,
        statements: &[Statement],
        body_start: u32,
        body_end: u32,
    ) -> bool {
        if !self.has_loc(body_start) || !self.has_loc(body_end) {
            return false;
        }
        let mut index = self.comment_partition_point(body_start);
        for statement in statements {
            let span = statement.span();
            if !self.has_loc(span.start) || !self.has_loc(span.end) {
                return false;
            }
            while let Some(comment) = self.comment_at(index) {
                if comment.start >= body_end || comment.end > span.start {
                    break;
                }
                index += 1;
            }
            if self
                .comment_at(index)
                .is_some_and(|comment| comment.start < span.end && comment.end > span.start)
            {
                return false;
            }
        }
        true
    }

    fn block_comment_island(
        &mut self,
        statements: &[Statement],
        body_start: u32,
        body_end: u32,
        ctx: &mut Context<DIRECT>,
    ) {
        self.reset_comment_index(Some(body_start));
        let keep_empty = self.options.keep_empty_statements;
        let mut statements = statements
            .iter()
            .filter(|statement| {
                keep_empty
                    || !matches!(statement, Statement::EmptyStatement(empty) if empty.span.end != u32::MAX)
            })
            .peekable();
        let mut prev: Option<(&Statement<'_>, bool)> = None;
        let mut last_end = None;
        while let Some(statement) = statements.next() {
            let layout_mark = ctx.event_mark();
            let mut has_margin = false;
            if let Some((prev_statement, prev_multiline)) = prev {
                let joined = is_kept_empty_stmt(prev_statement) && is_kept_empty_stmt(statement);
                has_margin =
                    !joined && (prev_multiline || !same_statement_kind(prev_statement, statement));
                if has_margin {
                    ctx.margin();
                }
                if !joined {
                    ctx.newline();
                }
            }

            let scope = ctx.begin_scope();
            self.flush_leading(ctx, statement.span().start);
            self.comment_free().print_statement(statement, ctx);
            let multiline = ctx.end_scope(scope);
            if multiline && prev.is_some() && !has_margin {
                ctx.insert_event(layout_mark, EventKind::Margin);
            }

            let end = statement_comment_end(statement);
            let next = statements
                .peek()
                .map(|statement| statement_comment_end(statement));
            self.flush_trailing_comments(ctx, end, next);
            last_end = Some(end);
            prev = Some((statement, multiline));
        }

        ctx.newline();
        self.flush_comments_until(ctx, body_end, last_end, false);
    }

    /// The element-based core of [`Self::body`], shared by `print_program` so a
    /// program's leading directives participate in the same margin/comment pass.
    fn body_elems<'a, 'b>(
        &mut self,
        elems: impl IntoIterator<Item = BodyElem<'a, 'b>>,
        body_start: Option<u32>,
        body_end: u32,
        ctx: &mut Context<DIRECT>,
    ) where
        'a: 'b,
    {
        // esrap filters `EmptyStatement` (`;`) nodes from statement-list bodies
        // (matching the server AST + official esrap). The client `to_oxc` path,
        // which parses string-codegen `Raw` `;;` into real EmptyStatement nodes the
        // official COMPILER output keeps, opts into preserving them.
        // Re-sync to the body's own start so a leading comment that precedes the
        // first statement (e.g. a file header) isn't skipped over.
        self.reset_comment_index(body_start);

        let keep_empty = self.options.keep_empty_statements;
        let mut elems = elems
            .into_iter()
            .filter(|elem| keep_empty || !elem.is_empty_stmt())
            .peekable();
        let mut prev: Option<(BodyElem<'a, 'b>, bool)> = None;
        let mut last_end = None;
        while let Some(elem) = elems.next() {
            let layout_mark = ctx.event_mark();
            let mut has_margin = false;
            if let Some((prev_elem, prev_multiline)) = &prev {
                // The two kept empties of one `;;` hole are a single upstream
                // statement, so nothing separates them.
                let joined = prev_elem.is_kept_empty() && elem.is_kept_empty();
                has_margin = !joined && (*prev_multiline || !elem.same_kind(prev_elem));
                if has_margin {
                    ctx.margin();
                }
                if !joined {
                    ctx.newline();
                }
            }

            let scope = ctx.begin_scope();
            if HAS_COMMENTS && DIRECT {
                let start = elem.span_start();
                let end = elem.span_end();
                self.flush_leading(ctx, start);
                let contains_comment = self
                    .comment_at(self.comment_index)
                    .is_some_and(|comment| comment.start < end);
                if !contains_comment && self.has_loc(start) && self.has_loc(end) {
                    elem.print(self.comment_free(), ctx);
                } else {
                    elem.print(self, ctx);
                }
            } else {
                elem.print(self, ctx);
            }
            let multiline = ctx.end_scope(scope);
            if multiline && prev.is_some() && !has_margin {
                ctx.insert_event(layout_mark, EventKind::Margin);
            }

            let end = elem.comment_end();
            let next = elems.peek().map(BodyElem::comment_end);
            self.flush_trailing_comments(ctx, end, next);

            last_end = Some(end);
            prev = Some((elem, multiline));
        }

        // esrap's body tail (`if (node.loc)`) runs unconditionally: a trailing
        // newline closes the body (a no-op flag at top level — nothing follows
        // to flush it), then any comments up to the body end. Doing this even
        // for an empty body emits an interior comment inside an otherwise empty
        // block (`() => { /* x */ }`); the lone pending newline keeps the block
        // `empty()`, so a comment-free `{}` is unaffected.
        ctx.newline();
        if HAS_COMMENTS
            && body_start.is_some_and(|start| self.has_loc(start))
            && self.has_loc(body_end)
        {
            self.flush_comments_until(ctx, body_end, last_end, false);
        }
    }

    /// A program/function-body directive (`"use strict";`), printed like the
    /// string-literal `ExpressionStatement` esrap sees.
    fn print_directive(&mut self, d: &Directive, ctx: &mut Context<DIRECT>) {
        let start = d.span.start;
        self.flush_leading(ctx, start);
        ctx.write(Self::string_literal(&d.expression));
        ctx.write_ascii(b';');
    }

    #[allow(clippy::too_many_lines)]
    fn print_statement(&mut self, stmt: &Statement, ctx: &mut Context<DIRECT>) {
        // esrap's `_` wildcard: emit comments positioned before this node first.
        let start = stmt.span().start;
        self.flush_leading(ctx, start);
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
                    ctx.write_ascii(b'(');
                    self.print_expression(inner, ctx);
                    ctx.write_ascii_bytes(b");");
                } else {
                    self.print_expression(inner, ctx);
                    ctx.write_ascii(b';');
                }
            }
            Statement::VariableDeclaration(d) => {
                self.variable_declaration(d, ctx);
                ctx.write_ascii(b';');
            }
            Statement::ReturnStatement(s) => {
                if let Some(arg) = &s.argument {
                    // esrap: when a comment sits between `return` and the
                    // argument, wrap the argument in parens (`return (/*c*/ x);`)
                    // so the comment can't be read as ending the statement.
                    // Compared against the UNWRAPPED argument because esrap's
                    // acorn AST has no paren node: with oxc's preserved parens
                    // `return (/*c*/ x)` would otherwise anchor at the `(`, which
                    // precedes the comment, and the rule would never fire.
                    let contains_comment = HAS_COMMENTS
                        && self
                            .comment_at(self.comment_index)
                            .is_some_and(|c| c.start < unparen(arg).span().start);
                    let start = s.span().start;
                    if contains_comment {
                        self.write_keyword(ctx, start, "return", " (");
                        self.print_expression(arg, ctx);
                        ctx.write_ascii_bytes(b");");
                    } else {
                        self.write_keyword(ctx, start, "return", " ");
                        self.print_expression(arg, ctx);
                        ctx.write_ascii(b';');
                    }
                } else {
                    self.write_keyword(ctx, s.span().start, "return", ";");
                }
            }
            Statement::BlockStatement(b) => {
                let span = b.span();
                self.block(&b.body, span.start, span.end, ctx);
            }
            Statement::FunctionDeclaration(f) => self.function(f, ctx),
            Statement::ClassDeclaration(c) => self.class_node(c, ctx),
            Statement::IfStatement(s) => self.if_statement(s, ctx),
            Statement::ForStatement(s) => self.for_statement(s, ctx),
            Statement::WhileStatement(s) => {
                ctx.write("while (");
                self.print_expression(&s.test, ctx);
                ctx.write_ascii_bytes(b") ");
                self.print_statement(&s.body, ctx);
            }
            Statement::ThrowStatement(s) => {
                self.write_keyword(ctx, s.span().start, "throw", " ");
                self.print_expression(&s.argument, ctx);
                ctx.write_ascii(b';');
            }
            Statement::DoWhileStatement(s) => self.do_while_statement(s, ctx),
            Statement::ExportAllDeclaration(s) => {
                if matches!(s.export_kind, ImportOrExportKind::Type) {
                    ctx.write("export type *");
                } else {
                    ctx.write("export *");
                }
                if let Some(exported) = &s.exported {
                    ctx.write_ascii_bytes(b" as ");
                    ctx.write(module_export_name_str(exported));
                }
                ctx.write(" from ");
                ctx.write(Self::string_literal(&s.source));
                ctx.write_ascii(b';');
            }
            Statement::ImportDeclaration(d) => self.import_declaration(d, ctx),
            Statement::ExportDeclaration(d) => self.export_declaration(d, ctx),
            Statement::ExportNamedDeclaration(d) => self.export_named_declaration(d, ctx),
            Statement::ExportFromDeclaration(d) => self.export_from_declaration(d, ctx),
            Statement::ExportDefaultDeclaration(d) => self.export_default_declaration(d, ctx),
            Statement::LabeledStatement(s) => {
                ctx.write(s.label.name.as_str());
                ctx.write_ascii_bytes(b": ");
                self.print_statement(&s.body, ctx);
            }
            Statement::ForInStatement(s) => {
                ctx.write("for (");
                self.for_statement_left(&s.left, ctx);
                ctx.write_ascii_bytes(b" in ");
                self.print_expression(&s.right, ctx);
                ctx.write_ascii_bytes(b") ");
                self.print_statement(&s.body, ctx);
            }
            Statement::ForOfStatement(s) => {
                ctx.write_ascii_bytes(b"for ");
                if s.r#await {
                    ctx.write("await ");
                }
                ctx.write_ascii(b'(');
                self.for_statement_left(&s.left, ctx);
                ctx.write_ascii_bytes(b" of ");
                self.print_expression(&s.right, ctx);
                ctx.write_ascii_bytes(b") ");
                self.print_statement(&s.body, ctx);
            }
            Statement::TryStatement(s) => self.try_statement(s, ctx),
            Statement::SwitchStatement(s) => self.switch_statement(s, ctx),
            Statement::DebuggerStatement(_) => ctx.write("debugger;"),
            Statement::WithStatement(s) => {
                ctx.write("with (");
                self.print_expression(&s.object, ctx);
                ctx.write_ascii_bytes(b") ");
                self.print_statement(&s.body, ctx);
            }
            Statement::EmptyStatement(_) => ctx.write_ascii(b';'),
            Statement::BreakStatement(s) => {
                ctx.write("break");
                if let Some(label) = &s.label {
                    ctx.write_ascii(b' ');
                    ctx.write(label.name.as_str());
                }
                ctx.write_ascii(b';');
            }
            Statement::ContinueStatement(s) => {
                ctx.write("continue");
                if let Some(label) = &s.label {
                    ctx.write_ascii(b' ');
                    ctx.write(label.name.as_str());
                }
                ctx.write_ascii(b';');
            }
            Statement::TSTypeAliasDeclaration(d) => self.type_alias_declaration(d, ctx),
            Statement::TSInterfaceDeclaration(d) => self.interface_declaration(d, ctx),
            Statement::TSEnumDeclaration(d) => self.enum_declaration(d, ctx),
            Statement::TSExternalModuleDeclaration(d) => self.external_module_declaration(d, ctx),
            Statement::TSNamespaceDeclaration(d) => self.namespace_declaration(d, true, ctx),
            Statement::TSGlobalDeclaration(d) => self.global_declaration(d, ctx),
            Statement::TSImportEqualsDeclaration(d) => Self::import_equals_declaration(d, ctx),
            Statement::TSExportAssignment(d) => {
                ctx.write("export = ");
                self.print_expression(&d.expression, ctx);
                ctx.write_ascii(b';');
            }
            Statement::TSNamespaceExportDeclaration(d) => {
                ctx.write("export as namespace ");
                ctx.write(d.id.name.as_str());
                ctx.write_ascii(b';');
            }
        }
    }

    fn import_declaration(&mut self, node: &ImportDeclaration, ctx: &mut Context<DIRECT>) {
        if node.specifiers.as_ref().is_none_or(|v| v.is_empty()) {
            ctx.write("import ");
            ctx.write(Self::string_literal(&node.source));
            ctx.write_ascii(b';');
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
                ctx.write_ascii_bytes(b", ");
            }
        }
        if let Some(ns) = namespace_spec {
            ctx.write("* as ");
            ctx.write(ns.local.name.as_str());
        }
        if !named.is_empty() {
            ctx.write_ascii(b'{');
            self.sequence_slice(
                &named,
                |s| {
                    let span = s.span();
                    SeqMeta {
                        start: Some(span.start),
                        end: Some(span.end),
                        obj_or_array: false,
                        is_elision: false,
                    }
                },
                |_p, s, child| {
                    Printer::<HAS_COMMENTS, DIRECT>::import_specifier(s, child);
                },
                None,
                true,
                ",",
                true,
                ctx,
            );
            ctx.write_ascii(b'}');
        }
        ctx.write(" from ");
        ctx.write(Self::string_literal(&node.source));
        Self::import_attributes(node.with_clause.as_deref(), ctx);
        ctx.write_ascii(b';');
    }

    /// esrap's import-attributes tail: ` with { key: value, … }`.
    fn import_attributes(clause: Option<&WithClause>, ctx: &mut Context<DIRECT>) {
        let Some(clause) = clause else { return };
        if clause.with_entries.is_empty() {
            return;
        }
        ctx.write(" with { ");
        for (i, attr) in clause.with_entries.iter().enumerate() {
            match &attr.key {
                ImportAttributeKey::Identifier(id) => ctx.write(id.name.as_str()),
                ImportAttributeKey::StringLiteral(s) => ctx.write(Self::string_literal(s)),
            }
            ctx.write_ascii_bytes(b": ");
            ctx.write(Self::string_literal(&attr.value));
            if i + 1 != clause.with_entries.len() {
                ctx.write_ascii_bytes(b", ");
            }
        }
        ctx.write_ascii_bytes(b" }");
    }

    fn import_specifier(node: &ImportSpecifier, ctx: &mut Context<DIRECT>) {
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
            ctx.write_ascii_bytes(b" as ");
        }
        ctx.write(node.local.name.as_str());
    }

    fn export_declaration(&mut self, node: &ExportDeclaration, ctx: &mut Context<DIRECT>) {
        // A class declaration's decorators are printed *before* `export`.
        if let Declaration::ClassDeclaration(c) = &node.declaration
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
        self.declaration(&node.declaration, ctx);
    }

    fn export_specifier_list(
        &mut self,
        span_start: u32,
        specifiers: &[ExportSpecifier],
        export_kind: ImportOrExportKind,
        ctx: &mut Context<DIRECT>,
    ) {
        let mut kw = self.keyword_cursor(span_start, true);
        kw.write(ctx, "export ");
        if matches!(export_kind, ImportOrExportKind::Type) {
            kw.write(ctx, "type ");
        }
        ctx.write_ascii(b'{');
        self.sequence_slice(
            specifiers,
            |s| {
                let span = s.span();
                SeqMeta {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                }
            },
            |_p, s, child| {
                Printer::<HAS_COMMENTS, DIRECT>::export_specifier(s, child);
            },
            None,
            true,
            ",",
            true,
            ctx,
        );
        ctx.write_ascii(b'}');
    }

    fn export_named_declaration(
        &mut self,
        node: &ExportNamedDeclaration,
        ctx: &mut Context<DIRECT>,
    ) {
        self.export_specifier_list(node.span().start, &node.specifiers, node.export_kind, ctx);
        ctx.write_ascii(b';');
    }

    fn export_from_declaration(&mut self, node: &ExportFromDeclaration, ctx: &mut Context<DIRECT>) {
        self.export_specifier_list(node.span().start, &node.specifiers, node.export_kind, ctx);
        ctx.write(" from ");
        ctx.write(Self::string_literal(&node.source));
        ctx.write_ascii(b';');
    }

    fn export_default_declaration(
        &mut self,
        node: &ExportDefaultDeclaration,
        ctx: &mut Context<DIRECT>,
    ) {
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
                self.interface_declaration(d, ctx);
            }
            other => {
                if let Some(expr) = other.as_expression() {
                    self.print_expression(expr, ctx);
                } else {
                    self.unsupported("ExportDefault", ctx);
                }
                ctx.write_ascii(b';');
            }
        }
    }

    fn template_literal(&mut self, node: &TemplateLiteral, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii(b'`');
        for (i, expr) in node.expressions.iter().enumerate() {
            let raw = node.quasis.get(i).map_or("", |q| q.value.raw.as_str());
            ctx.write(raw);
            ctx.write_ascii_bytes(b"${");
            self.print_expression(expr, ctx);
            ctx.write_ascii(b'}');
            // A newline *inside* the literal makes the enclosing context
            // multiline (esrap), which drives statement-margin decisions.
            if raw.contains('\n') {
                ctx.multiline = true;
            }
        }
        if let Some(last) = node.quasis.last() {
            let raw = last.value.raw.as_str();
            ctx.write(raw);
            ctx.write_ascii(b'`');
            if raw.contains('\n') {
                ctx.multiline = true;
            }
        }
    }

    fn export_specifier(node: &ExportSpecifier, ctx: &mut Context<DIRECT>) {
        if matches!(node.export_kind, ImportOrExportKind::Type) {
            ctx.write("type ");
        }
        let local = module_export_name_str(&node.local);
        let exported = module_export_name_str(&node.exported);
        ctx.write(local);
        if local != exported {
            ctx.write_ascii_bytes(b" as ");
            ctx.write(exported);
        }
    }

    /// Print a `Declaration` node (the RHS of `export <decl>` and standalone
    /// declarations). Only the variable form is wired so far.
    fn declaration(&mut self, decl: &Declaration, ctx: &mut Context<DIRECT>) {
        match decl {
            Declaration::VariableDeclaration(d) => {
                self.variable_declaration(d, ctx);
                ctx.write_ascii(b';');
            }
            Declaration::FunctionDeclaration(f) => self.function(f, ctx),
            Declaration::ClassDeclaration(c) => self.class_node(c, ctx),
            Declaration::TSTypeAliasDeclaration(d) => self.type_alias_declaration(d, ctx),
            Declaration::TSInterfaceDeclaration(d) => self.interface_declaration(d, ctx),
            Declaration::TSEnumDeclaration(d) => self.enum_declaration(d, ctx),
            Declaration::TSExternalModuleDeclaration(d) => self.external_module_declaration(d, ctx),
            Declaration::TSNamespaceDeclaration(d) => self.namespace_declaration(d, true, ctx),
            Declaration::TSGlobalDeclaration(d) => self.global_declaration(d, ctx),
            Declaration::TSImportEqualsDeclaration(d) => Self::import_equals_declaration(d, ctx),
        }
    }

    /// esrap's `FunctionDeclaration|FunctionExpression`:
    /// `[async ]function[* ] id(params) { body }`.
    fn function(&mut self, node: &Function, ctx: &mut Context<DIRECT>) {
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
                let col2 = column + usize_to_u32("async ".len());
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
            self.write_node(ctx, id.span, id.name.as_str());
        }
        if let Some(tp) = &node.type_parameters {
            self.type_parameter_declaration(tp, ctx);
        }
        ctx.write_ascii(b'(');
        // esrap: until `(returnType ?? body).loc.start`; a bodyless declare /
        // overload falls back to the node's own end.
        let until = node
            .return_type
            .as_ref()
            .map(|rt| rt.span().start)
            .or_else(|| node.body.as_ref().map(|b| b.span().start))
            .unwrap_or(node.span.end);
        self.formal_parameters_with_this(
            &node.params,
            node.this_param.as_deref(),
            Some(until),
            ctx,
        );
        ctx.write_ascii(b')');
        if let Some(rt) = &node.return_type {
            self.type_annotation(rt, ctx);
        }
        // A `declare function`/overload has no body — esrap emits `;`.
        match &node.body {
            Some(body) => {
                ctx.write_ascii(b' ');
                let span = body.span();
                self.block(&body.statements, span.start, span.end, ctx);
            }
            None => ctx.write_ascii(b';'),
        }
    }

    /// esrap's `ClassDeclaration|ClassExpression`: `class [id ][extends sup ]{…}`.
    fn class_node(&mut self, node: &Class, ctx: &mut Context<DIRECT>) {
        for decorator in &node.decorators {
            self.decorator(decorator, ctx);
        }
        self.class_node_no_decorators(node, ctx);
    }

    /// The class body sans leading decorators (already emitted by the caller —
    /// e.g. `export @dec class`, which prints decorators before `export`).
    fn class_node_no_decorators(&mut self, node: &Class, ctx: &mut Context<DIRECT>) {
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
            ctx.write_ascii(b' ');
        } else if let Some(tp) = &node.type_parameters {
            self.type_parameter_declaration(tp, ctx);
            ctx.write_ascii(b' ');
        }
        if let Some(heritage) = &node.heritage {
            ctx.write("extends ");
            self.child_with_parens(&heritage.expression, 19, ctx);
            if let Some(ta) = &heritage.type_arguments {
                self.type_parameter_instantiation(ta, ctx);
            }
            ctx.write_ascii(b' ');
        }
        if !node.implements.is_empty() {
            ctx.write("implements");
            let nodes: Vec<SeqNode<HAS_COMMENTS>> = node
                .implements
                .iter()
                .map(|imp| {
                    let span = imp.span();
                    SeqNode {
                        start: Some(span.start),
                        end: Some(span.end),
                        obj_or_array: false,
                        is_elision: false,
                        render: Box::new(
                            move |p: &mut Printer<'_, HAS_COMMENTS, false>,
                                  child: &mut Context<false>| {
                                Printer::<HAS_COMMENTS>::print_type_name(&imp.expression, child);
                                if let Some(ta) = &imp.type_arguments {
                                    p.type_parameter_instantiation(ta, child);
                                }
                            },
                        ),
                    }
                })
                .collect();
            self.sequence(nodes, Some(node.body.span().start), true, ",", true, ctx);
        }
        self.class_body(&node.body, ctx);
    }

    fn decorator(&mut self, node: &Decorator, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii(b'@');
        let map_nodes = std::mem::replace(&mut self.map_nodes, false);
        self.print_expression(&node.expression, ctx);
        self.map_nodes = map_nodes;
        ctx.newline();
    }

    fn comments_are_outer_to_class(&self, body: &ClassBody) -> bool {
        let span = body.span();
        if !self.has_loc(span.start) || !self.has_loc(span.end) {
            return false;
        }
        let mut index = self.comment_partition_point(span.start);
        for element in body
            .body
            .iter()
            .filter(|element| !matches!(element, ClassElement::TSIndexSignature(_)))
        {
            let element_span = element.span();
            if !self.has_loc(element_span.start) || !self.has_loc(element_span.end) {
                return false;
            }
            while let Some(comment) = self.comment_at(index) {
                if comment.start >= span.end || comment.end > element_span.start {
                    break;
                }
                index += 1;
            }
            if self.comment_at(index).is_some_and(|comment| {
                comment.start < element_span.end && comment.end > element_span.start
            }) {
                return false;
            }
        }
        true
    }

    fn class_comment_island(&mut self, body: &ClassBody, ctx: &mut Context<DIRECT>) {
        let span = body.span();
        self.reset_comment_index(Some(span.start));
        let mut elements = body
            .body
            .iter()
            .filter(|element| !matches!(element, ClassElement::TSIndexSignature(_)))
            .peekable();
        let mut prev: Option<(&ClassElement<'_>, bool)> = None;
        let mut last_end = None;
        while let Some(element) = elements.next() {
            let layout_mark = ctx.event_mark();
            let mut has_margin = false;
            if let Some((prev_element, prev_multiline)) = prev {
                has_margin = prev_multiline
                    || std::mem::discriminant(prev_element) != std::mem::discriminant(element);
                if has_margin {
                    ctx.margin();
                }
                ctx.newline();
            }

            let scope = ctx.begin_scope();
            self.flush_leading(ctx, element.span().start);
            self.comment_free().class_element(element, ctx);
            let multiline = ctx.end_scope(scope);
            if multiline && prev.is_some() && !has_margin {
                ctx.insert_event(layout_mark, EventKind::Margin);
            }

            let end = element.span().end;
            let next = elements.peek().map(|element| element.span().end);
            self.flush_trailing_comments(ctx, end, next);
            last_end = Some(end);
            prev = Some((element, multiline));
        }

        ctx.newline();
        self.flush_comments_until(ctx, span.end, last_end, false);
    }

    /// esrap's `BlockStatement|ClassBody`: route class members through the shared
    /// `body` machinery (one-per-line, blank line between two multiline members
    /// or a change of member kind) so leading / trailing / end-of-body comments
    /// are interleaved identically to a statement block.
    fn class_body(&mut self, body: &ClassBody, ctx: &mut Context<DIRECT>) {
        let span = body.span();
        if HAS_COMMENTS && DIRECT && self.comments_are_outer_to_class(body) {
            let has_element = body
                .body
                .iter()
                .any(|element| !matches!(element, ClassElement::TSIndexSignature(_)));
            let first_comment = self.comment_partition_point(span.start);
            let has_comment = self
                .comment_at(first_comment)
                .is_some_and(|comment| comment.start < span.end);
            if has_element || has_comment {
                ctx.write_ascii(b'{');
                ctx.indent();
                ctx.newline();
                self.class_comment_island(body, ctx);
                ctx.dedent();
                ctx.newline();
                ctx.write_ascii(b'}');
                return;
            }
        }
        ctx.write_ascii(b'{');
        let mark = ctx.event_mark();
        let scope = ctx.begin_scope();
        let elems = body
            .body
            .iter()
            // esrap's `body` only skips `EmptyStatement`; TS index signatures are
            // not statements and have no printer mapping here, so drop them.
            .filter(|e| !matches!(e, ClassElement::TSIndexSignature(_)))
            .map(BodyElem::ClassMember);
        self.body_elems(elems, Some(span.start), span.end, ctx);
        if ctx.empty() {
            ctx.discard_scope(scope);
        } else {
            ctx.end_scope(scope);
            ctx.insert_event(mark, EventKind::Newline);
            ctx.insert_event(mark, EventKind::Indent);
            ctx.dedent();
            ctx.newline();
        }
        ctx.write_ascii(b'}');
    }

    fn class_element(&mut self, element: &ClassElement, ctx: &mut Context<DIRECT>) {
        // esrap's `_` wildcard flushes any comment positioned before the member
        // (e.g. a leading JSDoc block) before visiting it.
        let start = element.span().start;
        self.flush_leading(ctx, start);
        match element {
            ClassElement::MethodDefinition(m) => self.method_definition(m, ctx),
            ClassElement::PropertyDefinition(p) => self.property_definition(p, ctx),
            ClassElement::AccessorProperty(a) => self.accessor_property(a, ctx),
            ClassElement::StaticBlock(b) => {
                self.write_keyword(ctx, b.span().start, "static", " ");
                let span = b.span();
                self.block(&b.body, span.start, span.end, ctx);
            }
            ClassElement::TSIndexSignature(_) => self.unsupported("ClassElement", ctx),
        }
    }

    fn method_definition(&mut self, node: &MethodDefinition, ctx: &mut Context<DIRECT>) {
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
            kw.write(ctx, &format!("{} ", accessibility_str(*acc)));
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
            ctx.write_ascii(b'*');
        }
        if node.computed {
            ctx.write_ascii(b'[');
            self.property_key(&node.key, ctx);
            ctx.write_ascii(b']');
        } else {
            self.property_key(&node.key, ctx);
        }
        if node.optional {
            ctx.write_ascii(b'?');
        }
        if let Some(tp) = &node.value.type_parameters {
            self.type_parameter_declaration(tp, ctx);
        }
        ctx.write_ascii(b'(');
        self.formal_parameters(&node.value.params, ctx);
        ctx.write_ascii(b')');
        if let Some(rt) = &node.value.return_type {
            self.type_annotation(rt, ctx);
        }
        ctx.write_ascii(b' ');
        // esrap: an abstract method has no body — it emits only the trailing
        // space from `context.write(' ')`, leaving `abstract get a() `.
        if let Some(body) = &node.value.body {
            let span = body.span();
            self.block(&body.statements, span.start, span.end, ctx);
        }
    }

    fn property_definition(&mut self, node: &PropertyDefinition, ctx: &mut Context<DIRECT>) {
        for decorator in &node.decorators {
            self.decorator(decorator, ctx);
        }
        if let Some(acc) = &node.accessibility {
            ctx.write(accessibility_str(*acc));
            ctx.write_ascii(b' ');
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
            ctx.write_ascii(b'[');
            self.property_key(&node.key, ctx);
            ctx.write_ascii(b']');
        } else {
            self.property_key(&node.key, ctx);
        }
        if node.optional {
            ctx.write_ascii(b'?');
        }
        if node.definite {
            ctx.write_ascii(b'!');
        }
        if let Some(ann) = &node.type_annotation {
            self.type_annotation(ann, ctx);
        }
        if let Some(value) = &node.value {
            ctx.write_ascii_bytes(b" = ");
            self.print_expression(value, ctx);
        }
        ctx.write_ascii(b';');
    }

    fn accessor_property(&mut self, node: &AccessorProperty, ctx: &mut Context<DIRECT>) {
        for decorator in &node.decorators {
            self.decorator(decorator, ctx);
        }
        if let Some(acc) = &node.accessibility {
            ctx.write(accessibility_str(*acc));
            ctx.write_ascii(b' ');
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
            ctx.write_ascii(b'[');
            self.property_key(&node.key, ctx);
            ctx.write_ascii(b']');
        } else {
            self.property_key(&node.key, ctx);
        }
        if node.definite {
            ctx.write_ascii(b'!');
        }
        if let Some(ann) = &node.type_annotation {
            self.type_annotation(ann, ctx);
        }
        if let Some(value) = &node.value {
            ctx.write_ascii_bytes(b" = ");
            self.print_expression(value, ctx);
        }
        ctx.write_ascii(b';');
    }

    fn if_statement(&mut self, node: &IfStatement, ctx: &mut Context<DIRECT>) {
        self.write_keyword(ctx, node.span().start, "if", " (");
        self.print_expression(&node.test, ctx);
        ctx.write_ascii_bytes(b") ");
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
                    ctx.write_ascii(b' ');
                }
                _ => ctx.write("else "),
            }
            self.print_statement(alternate, ctx);
        }
    }

    fn do_while_statement(&mut self, node: &DoWhileStatement, ctx: &mut Context<DIRECT>) {
        self.write_keyword(ctx, node.span().start, "do", " ");
        self.print_statement(&node.body, ctx);
        // esrap maps the trailing `while` to a computed offset (one past the body
        // end) when the test begins on the body's end line at column >= 6.
        let body_end = self.offset_to_line_col(node.body.span().end);
        let test_start = self.offset_to_line_col(node.test.span().start);
        match (body_end, test_start) {
            (Some((be_line, be_col)), Some((t_line, t_col))) if be_line == t_line && t_col >= 6 => {
                ctx.write_ascii(b' ');
                Self::write_source_keyword(ctx, be_line, be_col + 1, "while");
                ctx.write_ascii_bytes(b" (");
            }
            _ => ctx.write(" while ("),
        }
        self.print_expression(&node.test, ctx);
        ctx.write_ascii_bytes(b");");
    }

    fn for_statement(&mut self, node: &ForStatement, ctx: &mut Context<DIRECT>) {
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
        ctx.write_ascii_bytes(b"; ");
        if let Some(test) = &node.test {
            self.print_expression(test, ctx);
        }
        ctx.write_ascii_bytes(b"; ");
        if let Some(update) = &node.update {
            self.print_expression(update, ctx);
        }
        ctx.write_ascii_bytes(b") ");
        self.print_statement(&node.body, ctx);
    }

    /// The binding of a `for…in` / `for…of` head: a declaration or a target.
    fn for_statement_left(&mut self, left: &ForStatementLeft, ctx: &mut Context<DIRECT>) {
        match left {
            ForStatementLeft::VariableDeclaration(d) => self.variable_declaration(d, ctx),
            _ => match left.as_assignment_target() {
                Some(t) => self.assignment_target(t, ctx),
                None => self.unsupported("ForStatementLeft", ctx),
            },
        }
    }

    /// esrap's `TryStatement`: `try {…}` + optional `catch (p) {…}` + `finally {…}`.
    fn try_statement(&mut self, node: &TryStatement, ctx: &mut Context<DIRECT>) {
        self.write_keyword(ctx, node.span().start, "try", " ");
        let span = node.block.span();
        self.block(&node.block.body, span.start, span.end, ctx);
        if let Some(handler) = &node.handler {
            ctx.write_ascii(b' ');
            if let Some(param) = &handler.param {
                // esrap emits `catch(e)` with no space after the keyword.
                self.write_keyword(ctx, handler.span().start, "catch", "(");
                self.binding_pattern(&param.pattern, ctx);
                ctx.write_ascii_bytes(b") ");
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
                .map_or_else(|| node.block.span().end, |h| h.span().end);
            let prev = self.offset_to_line_col(prev_end);
            let fin = self.offset_to_line_col(finalizer.span().start);
            match (prev, fin) {
                (Some((p_line, p_col)), Some((f_line, f_col)))
                    if p_line == f_line && f_col >= 7 =>
                {
                    ctx.write_ascii(b' ');
                    Self::write_source_keyword(ctx, p_line, p_col + 1, "finally");
                    ctx.write_ascii(b' ');
                }
                _ => ctx.write(" finally "),
            }
            let span = finalizer.span();
            self.block(&finalizer.body, span.start, span.end, ctx);
        }
    }

    /// esrap's `SwitchStatement`: `switch (disc) {`, each case indented with a
    /// blank-line margin between cases, statements one-per-line.
    fn switch_statement(&mut self, node: &SwitchStatement, ctx: &mut Context<DIRECT>) {
        self.write_keyword(ctx, node.span().start, "switch", " (");
        self.print_expression(&node.discriminant, ctx);
        ctx.write_ascii_bytes(b") {");
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
                    ctx.write_ascii(b':');
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
        ctx.write_ascii(b'}');
    }

    fn object_pattern(&mut self, node: &ObjectPattern, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii(b'{');
        let property_len = node.properties.len();
        let n = property_len + usize::from(node.rest.is_some());
        self.sequence_indexed(
            n,
            |i| {
                let span = if i < property_len {
                    node.properties[i].span()
                } else {
                    node.rest.as_ref().unwrap().span()
                };
                SeqMeta {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                }
            },
            |p, i, child| {
                if i < property_len {
                    let prop = &node.properties[i];
                    let span = prop.span();
                    p.flush_leading(child, span.start);
                    p.binding_property(prop, child);
                } else {
                    let rest = node.rest.as_ref().unwrap();
                    let span = rest.span();
                    p.flush_leading(child, span.start);
                    child.write_ascii_bytes(b"...");
                    p.binding_pattern(&rest.argument, child);
                }
            },
            Some(node.span().end),
            true,
            ",",
            true,
            ctx,
        );
        ctx.write_ascii(b'}');
    }

    fn binding_property(&mut self, node: &BindingProperty, ctx: &mut Context<DIRECT>) {
        if node.shorthand {
            self.binding_pattern(&node.value, ctx);
            return;
        }
        if node.computed {
            ctx.write_ascii(b'[');
            self.property_key(&node.key, ctx);
            ctx.write_ascii_bytes(b"]: ");
        } else {
            self.property_key(&node.key, ctx);
            ctx.write_ascii_bytes(b": ");
        }
        self.binding_pattern(&node.value, ctx);
    }

    fn array_pattern(&mut self, node: &ArrayPattern, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii(b'[');
        let element_len = node.elements.len();
        let n = element_len + usize::from(node.rest.is_some());
        self.sequence_indexed(
            n,
            |i| {
                if i < element_len {
                    let span = node.elements[i].as_ref().map(oxc_span::GetSpan::span);
                    SeqMeta {
                        start: span.map(|s| s.start),
                        end: span.map(|s| s.end),
                        obj_or_array: false,
                        is_elision: span.is_none(),
                    }
                } else {
                    let span = node.rest.as_ref().unwrap().span();
                    SeqMeta {
                        start: Some(span.start),
                        end: Some(span.end),
                        obj_or_array: false,
                        is_elision: false,
                    }
                }
            },
            |p, i, child| {
                if i < element_len {
                    if let Some(pattern) = &node.elements[i] {
                        p.binding_pattern(pattern, child);
                    }
                } else {
                    let rest = node.rest.as_ref().unwrap();
                    child.write_ascii_bytes(b"...");
                    p.binding_pattern(&rest.argument, child);
                }
            },
            Some(node.span().end),
            false,
            ",",
            true,
            ctx,
        );
        ctx.write_ascii(b']');
    }

    /// Parameter list via esrap's `sequence` (no padding): `a, b, ...rest`.
    fn formal_parameters(&mut self, params: &FormalParameters, ctx: &mut Context<DIRECT>) {
        self.formal_parameters_with_this(params, None, Some(params.span().end), ctx);
    }

    /// As [`Self::formal_parameters`], but with a leading `this: T` parameter —
    /// esrap (from an acorn AST) sees `this` as the first ordinary parameter.
    fn formal_parameters_with_this(
        &mut self,
        params: &FormalParameters,
        this_param: Option<&TSThisParameter>,
        until: Option<u32>,
        ctx: &mut Context<DIRECT>,
    ) {
        let this_len = usize::from(this_param.is_some());
        let item_len = params.items.len();
        let n = this_len + item_len + usize::from(params.rest.is_some());
        self.sequence_indexed(
            n,
            |i| {
                let span = if i < this_len {
                    this_param.unwrap().span
                } else if i - this_len < item_len {
                    params.items[i - this_len].span()
                } else {
                    params.rest.as_ref().unwrap().span()
                };
                SeqMeta {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                }
            },
            |p, i, child| {
                if i < this_len {
                    let tp = this_param.unwrap();
                    child.write_ascii_bytes(b"this");
                    if let Some(ann) = &tp.type_annotation {
                        p.type_annotation(ann, child);
                    }
                } else if i - this_len < item_len {
                    let param = &params.items[i - this_len];
                    if let Some(acc) = &param.accessibility {
                        child.write(accessibility_str(*acc));
                        child.write_ascii(b' ');
                    }
                    if param.readonly {
                        child.write("readonly ");
                    }
                    if param.r#override {
                        child.write("override ");
                    }
                    p.binding_pattern(&param.pattern, child);
                    if param.optional {
                        child.write_ascii(b'?');
                    }
                    if let Some(ann) = &param.type_annotation {
                        p.type_annotation(ann, child);
                    }
                    if let Some(init) = &param.initializer {
                        child.write_ascii_bytes(b" = ");
                        p.print_expression(init, child);
                    }
                } else {
                    let rest = params.rest.as_ref().unwrap();
                    child.write_ascii_bytes(b"...");
                    p.binding_pattern(&rest.rest.argument, child);
                    if let Some(ann) = &rest.type_annotation {
                        p.type_annotation(ann, child);
                    }
                }
            },
            until,
            false,
            ",",
            true,
            ctx,
        );
    }

    /// esrap's `ArrowFunctionExpression`: `[async ](params) => body`, wrapping an
    /// object concise body in parens so it isn't read as a block.
    fn arrow_function(&mut self, node: &ArrowFunctionExpression, ctx: &mut Context<DIRECT>) {
        if node.r#async {
            ctx.write("async ");
        }
        if let Some(tp) = &node.type_parameters {
            self.type_parameter_declaration(tp, ctx);
        }
        ctx.write_ascii(b'(');
        // esrap runs the params sequence until `(returnType ?? body).loc.start`,
        // so a comment ahead of a located body flushes inside a synthesized
        // arrow's empty parens.
        let until = node
            .return_type
            .as_ref()
            .map_or_else(|| node.body.span().start, |rt| rt.span().start);
        self.formal_parameters_with_this(&node.params, None, Some(until), ctx);
        ctx.write_ascii(b')');
        if let Some(rt) = &node.return_type {
            self.type_annotation(rt, ctx);
        }
        ctx.write_ascii_bytes(b" => ");
        if let ArrowFunctionBody::FunctionBody(body) = &node.body {
            let span = body.span();
            self.block(&body.statements, span.start, span.end, ctx);
        } else {
            let Some(body) = node.body.as_expression() else {
                return;
            };
            if arrow_concise_body_needs_wrap(body) {
                ctx.write_ascii(b'(');
                self.print_expression(body, ctx);
                ctx.write_ascii(b')');
            } else {
                self.print_expression(body, ctx);
            }
        }
    }

    /// esrap's `BlockStatement|ClassBody`: only break a body across lines when
    /// it has real content, so an empty body stays `{}`.
    fn block(
        &mut self,
        body: &[Statement],
        body_start: u32,
        body_end: u32,
        ctx: &mut Context<DIRECT>,
    ) {
        if !HAS_COMMENTS {
            let keep_empty = self.options.keep_empty_statements;
            let has_content = body.iter().any(|statement| {
                keep_empty
                    || !matches!(statement, Statement::EmptyStatement(empty) if empty.span.end != u32::MAX)
            });
            if !has_content {
                self.write_block_brace(ctx, body_start, body_end, true);
                self.write_block_brace(ctx, body_start, body_end, false);
                return;
            }

            self.write_block_brace(ctx, body_start, body_end, true);
            ctx.indent();
            ctx.newline();
            self.body(body, body_start, body_end, ctx);
            ctx.dedent();
            ctx.newline();
            self.write_block_brace(ctx, body_start, body_end, false);
            return;
        }

        if DIRECT && self.comments_are_outer_to_block(body, body_start, body_end) {
            let keep_empty = self.options.keep_empty_statements;
            let has_statement = body.iter().any(|statement| {
                keep_empty
                    || !matches!(statement, Statement::EmptyStatement(empty) if empty.span.end != u32::MAX)
            });
            let first_comment = self.comment_partition_point(body_start);
            let has_comment = self
                .comment_at(first_comment)
                .is_some_and(|comment| comment.start < body_end);
            if has_statement || has_comment {
                self.write_block_brace(ctx, body_start, body_end, true);
                ctx.indent();
                ctx.newline();
                self.block_comment_island(body, body_start, body_end, ctx);
                ctx.dedent();
                ctx.newline();
                self.write_block_brace(ctx, body_start, body_end, false);
                return;
            }
        }

        self.write_block_brace(ctx, body_start, body_end, true);
        let mark = ctx.event_mark();
        let scope = ctx.begin_scope();
        self.body(body, body_start, body_end, ctx);
        if ctx.empty() {
            ctx.discard_scope(scope);
        } else {
            ctx.end_scope(scope);
            ctx.insert_event(mark, EventKind::Newline);
            ctx.insert_event(mark, EventKind::Indent);
            ctx.dedent();
            ctx.newline();
        }
        self.write_block_brace(ctx, body_start, body_end, false);
    }

    /// esrap's `handle_var_declaration` (not the generic `sequence`): break the
    /// declarators one-per-line — joined by `,\n` and indented — when any
    /// declarator is itself multiline (e.g. carries a leading comment) or there
    /// is more than one and they don't fit (`measure + 2*(n-1) > 50`).
    fn variable_declaration(&mut self, decl: &VariableDeclaration, ctx: &mut Context<DIRECT>) {
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

        if let [declarator] = decl.declarations.as_slice() {
            self.flush_leading(ctx, declarator.span().start);
            self.binding_pattern(&declarator.id, ctx);
            if declarator.definite {
                ctx.write_ascii(b'!');
            }
            if let Some(ann) = &declarator.type_annotation {
                self.type_annotation(ann, ctx);
            }
            if let Some(init) = &declarator.init {
                ctx.write_ascii_bytes(b" = ");
                self.print_expression(init, ctx);
            }
            return;
        }

        let n = decl.declarations.len();
        // esrap measures the whole `child_context`, which includes the keyword,
        // so the fit test sees `let `/`const ` etc. as part of the length.
        let mut total_measure = keyword.len();
        let mut any_multiline = false;
        let first = ctx.event_mark();
        let mut separators = Vec::with_capacity(n.saturating_sub(1));
        if DIRECT && n > 1 {
            ctx.indent();
        }
        for (index, declarator) in decl.declarations.iter().enumerate() {
            if index > 0 {
                ctx.write_ascii(b',');
                separators.push(ctx.event_mark());
            }
            let scope = ctx.begin_scope();
            let start = declarator.span().start;
            self.flush_leading(ctx, start);
            self.binding_pattern(&declarator.id, ctx);
            if declarator.definite {
                ctx.write_ascii(b'!');
            }
            if let Some(ann) = &declarator.type_annotation {
                self.type_annotation(ann, ctx);
            }
            if let Some(init) = &declarator.init {
                ctx.write_ascii_bytes(b" = ");
                self.print_expression(init, ctx);
            }
            total_measure += ctx.measure();
            any_multiline |= ctx.end_scope(scope);
        }

        let length = total_measure + 2 * n.saturating_sub(1);
        let multiline = any_multiline || (n > 1 && length > 50);

        if multiline {
            for separator in separators.into_iter().rev() {
                ctx.insert_event(separator, EventKind::Newline);
            }
            if n > 1 && !DIRECT {
                ctx.insert_event(first, EventKind::Indent);
            }
            if n > 1 {
                ctx.dedent();
            }
            ctx.multiline = true;
        } else {
            if DIRECT && n > 1 {
                ctx.dedent();
            }
            for separator in separators.into_iter().rev() {
                ctx.insert_event(separator, EventKind::Space);
            }
        }
    }

    fn binding_pattern(&mut self, pattern: &BindingPattern, ctx: &mut Context<DIRECT>) {
        match pattern {
            BindingPattern::BindingIdentifier(id) => {
                self.write_node(ctx, id.span, id.name.as_str());
            }
            BindingPattern::AssignmentPattern(a) => {
                self.binding_pattern(&a.left, ctx);
                ctx.write_ascii_bytes(b" = ");
                self.print_expression(&a.right, ctx);
            }
            BindingPattern::ObjectPattern(o) => self.object_pattern(o, ctx),
            BindingPattern::ArrayPattern(a) => self.array_pattern(a, ctx),
        }
    }

    // ----- expressions ------------------------------------------------------

    #[allow(clippy::too_many_lines)]
    fn print_expression(&mut self, expr: &Expression, ctx: &mut Context<DIRECT>) {
        // esrap's `_` wildcard: emit comments positioned before this node first.
        let span = expr.span();
        let start = span.start;
        self.flush_leading(ctx, start);
        if HAS_COMMENTS
            && DIRECT
            && self.has_loc(start)
            && self.has_loc(span.end)
            && self
                .comment_at(self.comment_index)
                .is_none_or(|comment| comment.start >= span.end)
        {
            self.comment_free().print_expression(expr, ctx);
            return;
        }
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
                // There is no exception. A comment leading the inner expression
                // does need bracketing (`return (/*c*/ x)`, `return (// hey\n x)`),
                // but esrap emits those parens from `ReturnStatement` — the one
                // place it parenthesizes for a comment — not from the operand, so
                // reproducing them here instead would double whatever a parent
                // adds from precedence.
                self.print_expression(&p.expression, ctx);
            }
            Expression::ChainExpression(c) => match &c.expression {
                ChainElement::CallExpression(call) => self.call_expression(call, ctx),
                ChainElement::StaticMemberExpression(m) => self.static_member(m, ctx),
                ChainElement::ComputedMemberExpression(m) => self.computed_member(m, ctx),
                ChainElement::PrivateFieldExpression(_) => {
                    self.unsupported("PrivateFieldExpression", ctx);
                }
                ChainElement::TSNonNullExpression(_) => self.unsupported("ChainElement", ctx),
            },
            Expression::Identifier(id) => self.write_node(ctx, id.span, id.name.as_str()),
            Expression::ThisExpression(_) => ctx.write_ascii_bytes(b"this"),
            Expression::BooleanLiteral(b) => {
                self.write_node(ctx, b.span, if b.value { "true" } else { "false" });
            }
            Expression::NullLiteral(n) => self.write_node(ctx, n.span, "null"),
            Expression::NumericLiteral(n) => self.write_node(
                ctx,
                n.span,
                literal_raw(n.raw.as_ref().map(oxc_ast::ast::Str::as_str), || {
                    format_compact!("{}", n.value)
                }),
            ),
            Expression::BigIntLiteral(n) => self.write_node(
                ctx,
                n.span,
                literal_raw(n.raw.as_ref().map(oxc_ast::ast::Str::as_str), || {
                    format_compact!("{}n", n.value)
                }),
            ),
            Expression::StringLiteral(s) => self.write_node(ctx, s.span, Self::string_literal(s)),
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
                ctx.write_ascii(b'#');
                ctx.write(m.field.name.as_str());
            }
            Expression::ImportMeta(_) => {
                ctx.write("import");
                ctx.write_ascii(b'.');
                ctx.write_ascii_bytes(b"meta");
            }
            Expression::NewTarget(_) => {
                ctx.write_ascii_bytes(b"new");
                ctx.write_ascii(b'.');
                ctx.write("target");
            }
            Expression::AwaitExpression(a) => {
                // esrap's `AwaitExpression`: map `await` to its source span, then
                // `' ('`/arg/`')'` when the argument is below await's precedence
                // (17), else `' '`/arg. Text is unchanged from `await ` + parens.
                let start = a.span().start;
                if expr_precedence(&a.argument) < 17 {
                    self.write_keyword(ctx, start, "await", " (");
                    self.print_expression(&a.argument, ctx);
                    ctx.write_ascii(b')');
                } else {
                    self.write_keyword(ctx, start, "await", " ");
                    self.print_expression(&a.argument, ctx);
                }
            }
            Expression::Super(_) => ctx.write("super"),
            Expression::YieldExpression(y) => {
                ctx.write(if y.delegate { "yield*" } else { "yield" });
                if let Some(arg) = &y.argument {
                    ctx.write_ascii(b' ');
                    self.print_expression(arg, ctx);
                }
            }
            Expression::RegExpLiteral(r) => match &r.raw {
                Some(raw) => ctx.write(raw.as_str()),
                None => ctx.write(format_compact!(
                    "/{}/{}",
                    r.regex.pattern.text,
                    r.regex.flags
                )),
            },
            Expression::TaggedTemplateExpression(t) => {
                self.print_expression(&t.tag, ctx);
                self.template_literal(&t.quasi, ctx);
            }
            Expression::NewExpression(n) => {
                ctx.write_ascii_bytes(b"new ");
                // `new` binds tighter than a call, so a callee whose member-spine
                // contains a CallExpression (`$.get(x).Member`) — or a
                // ChainExpression — must be parenthesized, else `new a().b(c)`
                // would parse the trailing `(c)` as the `new` arguments. Mirrors
                // esrap's `has_call_expression` clause.
                let callee = unparen(&n.callee);
                if matches!(callee, Expression::ChainExpression(_))
                    || callee_has_call_expression(callee)
                {
                    ctx.write_ascii(b'(');
                    self.print_expression(&n.callee, ctx);
                    ctx.write_ascii(b')');
                } else {
                    self.child_with_parens(&n.callee, 19, ctx);
                }
                self.call_arguments(&n.arguments, n.span().end, ctx);
            }
            Expression::UpdateExpression(u) => {
                let op = u.operator.as_str();
                if u.prefix {
                    ctx.write(op);
                    self.simple_assignment_target(&u.argument, ctx);
                } else {
                    self.simple_assignment_target(&u.argument, ctx);
                    ctx.write(op);
                }
            }
            Expression::SequenceExpression(s) => self.sequence_expression(s, ctx),
            Expression::ImportExpression(n) => {
                // esrap's `ImportExpression`: `import(source[, options])`.
                ctx.write("import(");
                self.print_expression(&n.source, ctx);
                if let Some(options) = &n.options {
                    ctx.write_ascii_bytes(b", ");
                    self.print_expression(options, ctx);
                }
                ctx.write_ascii(b')');
            }
            Expression::TSAsExpression(e) => {
                self.child_with_parens(&e.expression, 13, ctx);
                ctx.write_ascii_bytes(b" as ");
                self.print_type(&e.type_annotation, ctx);
            }
            Expression::TSSatisfiesExpression(e) => {
                self.child_with_parens(&e.expression, 13, ctx);
                ctx.write(" satisfies ");
                self.print_type(&e.type_annotation, ctx);
            }
            Expression::TSNonNullExpression(e) => {
                self.child_with_parens(&e.expression, 18, ctx);
                ctx.write_ascii(b'!');
            }
            Expression::TSTypeAssertion(e) => {
                ctx.write_ascii(b'<');
                self.print_type(&e.type_annotation, ctx);
                ctx.write_ascii(b'>');
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

    fn jsx_element(&mut self, node: &JSXElement, ctx: &mut Context<DIRECT>) {
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
            ctx.write_ascii_bytes(b"</");
            Self::jsx_element_name(&closing.name, ctx);
            ctx.write_ascii(b'>');
        }
    }

    fn jsx_fragment(&mut self, node: &JSXFragment, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii_bytes(b"<>");
        if !node.children.is_empty() {
            ctx.indent();
        }
        for child in &node.children {
            self.jsx_child(child, ctx);
        }
        if !node.children.is_empty() {
            ctx.dedent();
        }
        ctx.write_ascii_bytes(b"</>");
    }

    fn jsx_opening_element(
        &mut self,
        node: &JSXOpeningElement,
        self_closing: bool,
        ctx: &mut Context<DIRECT>,
    ) {
        ctx.write_ascii(b'<');
        Self::jsx_element_name(&node.name, ctx);
        if let Some(type_args) = &node.type_arguments {
            self.type_parameter_instantiation(type_args, ctx);
        }
        for attr in &node.attributes {
            ctx.write_ascii(b' ');
            match attr {
                JSXAttributeItem::Attribute(a) => {
                    Self::jsx_attribute_name(&a.name, ctx);
                    if let Some(value) = &a.value {
                        ctx.write_ascii(b'=');
                        self.jsx_attribute_value(value, ctx);
                    }
                }
                JSXAttributeItem::SpreadAttribute(s) => {
                    ctx.write_ascii_bytes(b"{...");
                    self.print_expression(&s.argument, ctx);
                    ctx.write_ascii(b'}');
                }
            }
        }
        if self_closing {
            ctx.write_ascii_bytes(b" /");
        }
        ctx.write_ascii(b'>');
    }

    fn jsx_child(&mut self, child: &JSXChild, ctx: &mut Context<DIRECT>) {
        match child {
            JSXChild::Text(t) => ctx.write(t.value.as_str()),
            JSXChild::Element(e) => self.jsx_element(e, ctx),
            JSXChild::Fragment(f) => self.jsx_fragment(f, ctx),
            JSXChild::ExpressionContainer(c) => self.jsx_expression_container(c, ctx),
            JSXChild::Spread(s) => {
                ctx.write_ascii_bytes(b"{...");
                self.print_expression(&s.expression, ctx);
                ctx.write_ascii(b'}');
            }
        }
    }

    fn jsx_expression_container(
        &mut self,
        node: &JSXExpressionContainer,
        ctx: &mut Context<DIRECT>,
    ) {
        ctx.write_ascii(b'{');
        // A `JSXEmptyExpression` (e.g. `{}` or `{/* comment */}`) prints nothing.
        if let Some(expr) = node.expression.as_expression() {
            self.print_expression(expr, ctx);
        }
        ctx.write_ascii(b'}');
    }

    fn jsx_attribute_value(&mut self, value: &JSXAttributeValue, ctx: &mut Context<DIRECT>) {
        match value {
            JSXAttributeValue::StringLiteral(s) => ctx.write(Self::string_literal(s)),
            JSXAttributeValue::ExpressionContainer(c) => self.jsx_expression_container(c, ctx),
            JSXAttributeValue::Element(e) => self.jsx_element(e, ctx),
            JSXAttributeValue::Fragment(f) => self.jsx_fragment(f, ctx),
        }
    }

    fn jsx_attribute_name(name: &JSXAttributeName, ctx: &mut Context<DIRECT>) {
        match name {
            JSXAttributeName::Identifier(id) => ctx.write(id.name.as_str()),
            JSXAttributeName::NamespacedName(n) => {
                ctx.write(n.namespace.name.as_str());
                ctx.write_ascii(b':');
                ctx.write(n.name.name.as_str());
            }
        }
    }

    fn jsx_element_name(name: &JSXElementName, ctx: &mut Context<DIRECT>) {
        match name {
            JSXElementName::Identifier(id) => ctx.write(id.name.as_str()),
            JSXElementName::IdentifierReference(id) => ctx.write(id.name.as_str()),
            JSXElementName::NamespacedName(n) => {
                ctx.write(n.namespace.name.as_str());
                ctx.write_ascii(b':');
                ctx.write(n.name.name.as_str());
            }
            JSXElementName::MemberExpression(m) => Self::jsx_member_expression(m, ctx),
            JSXElementName::ThisExpression(_) => ctx.write_ascii_bytes(b"this"),
        }
    }

    fn jsx_member_expression(node: &JSXMemberExpression, ctx: &mut Context<DIRECT>) {
        match &node.object {
            JSXMemberExpressionObject::IdentifierReference(id) => ctx.write(id.name.as_str()),
            JSXMemberExpressionObject::MemberExpression(m) => Self::jsx_member_expression(m, ctx),
            JSXMemberExpressionObject::ThisExpression(_) => ctx.write_ascii_bytes(b"this"),
        }
        ctx.write_ascii(b'.');
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
    fn member_object_with_parens(&mut self, object: &Expression, ctx: &mut Context<DIRECT>) {
        // oxc keeps a `ParenthesizedExpression` around the nested chain, which
        // `print_expression` would then drop — look through it as the callee
        // rule does, so the required parens are not lost.
        if matches!(unparen(object), Expression::ChainExpression(_)) {
            ctx.write_ascii(b'(');
            self.print_expression(unparen(object), ctx);
            ctx.write_ascii(b')');
        } else {
            self.child_with_parens(object, 19, ctx);
        }
    }

    /// Print `child` parenthesised iff its precedence is below `min`.
    fn child_with_parens(&mut self, child: &Expression, min: u8, ctx: &mut Context<DIRECT>) {
        if expr_precedence(child) < min {
            ctx.write_ascii(b'(');
            self.print_expression(child, ctx);
            ctx.write_ascii(b')');
        } else {
            self.print_expression(child, ctx);
        }
    }

    fn binary_expression(&mut self, node: &BinaryExpression, ctx: &mut Context<DIRECT>) {
        let op = node.operator.as_str();
        self.binary_child(&node.left, false, op, false, ctx);
        ctx.write_ascii(b' ');
        ctx.write(op);
        ctx.write_ascii(b' ');
        self.binary_child(&node.right, false, op, true, ctx);
    }

    fn logical_expression(&mut self, node: &LogicalExpression, ctx: &mut Context<DIRECT>) {
        let op = node.operator.as_str();
        self.binary_child(&node.left, true, op, false, ctx);
        ctx.write_ascii(b' ');
        ctx.write(op);
        ctx.write_ascii(b' ');
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
        ctx: &mut Context<DIRECT>,
    ) {
        if binary_needs_parens(child, parent_is_logical, parent_op, is_right) {
            ctx.write_ascii(b'(');
            self.print_expression(child, ctx);
            ctx.write_ascii(b')');
        } else {
            self.print_expression(child, ctx);
        }
    }

    fn unary_expression(&mut self, node: &UnaryExpression, ctx: &mut Context<DIRECT>) {
        let op = node.operator.as_str();
        // `typeof`/`void`/`delete` are word operators and need a trailing space.
        if matches!(
            node.operator,
            UnaryOperator::Typeof | UnaryOperator::Void | UnaryOperator::Delete
        ) {
            ctx.write(op);
            ctx.write_ascii(b' ');
        } else {
            ctx.write(op);
        }
        self.child_with_parens(&node.argument, 15, ctx);
    }

    fn call_expression(&mut self, node: &CallExpression, ctx: &mut Context<DIRECT>) {
        // Builder-created calls carry `SPAN` (zero); a nonzero span is an
        // explicit source-backed call such as a lowered directive runtime call.
        if node.span.start != 0
            && let Some((line, column)) = self.offset_to_line_col(node.span.start)
        {
            ctx.location(line, column);
        }
        // esrap's `CallExpression|NewExpression` wrap rule: parenthesize the
        // callee when it is a ChainExpression — otherwise a NON-optional call on
        // an optional-chain callee (`(a?.b)(c)`) would be mis-printed as the
        // optional-chain call `a?.b(c)`, which short-circuits differently. The
        // precedence path (`< 19`) does not catch this because a ChainExpression
        // has the same precedence (19) as a call.
        if matches!(unparen(&node.callee), Expression::ChainExpression(_)) {
            ctx.write_ascii(b'(');
            self.print_expression(unparen(&node.callee), ctx);
            ctx.write_ascii(b')');
        } else {
            self.child_with_parens(&node.callee, 19, ctx);
        }
        if node.optional {
            ctx.write_ascii_bytes(b"?.");
        }
        self.call_arguments(&node.arguments, node.span().end, ctx);
        if node.span.start != 0
            && let Some((line, column)) = self.offset_to_line_col(node.span.end)
        {
            ctx.location(line, column);
        }
    }

    fn static_member(&mut self, node: &StaticMemberExpression, ctx: &mut Context<DIRECT>) {
        self.member_object_with_parens(&node.object, ctx);
        ctx.write(if node.optional { "?." } else { "." });
        self.write_node(ctx, node.property.span, node.property.name.as_str());
    }

    fn computed_member(&mut self, node: &ComputedMemberExpression, ctx: &mut Context<DIRECT>) {
        self.member_object_with_parens(&node.object, ctx);
        if node.optional {
            ctx.write_ascii_bytes(b"?.");
        }
        ctx.write_ascii(b'[');
        self.print_expression(&node.expression, ctx);
        ctx.write_ascii(b']');
    }

    fn assignment_expression(&mut self, node: &AssignmentExpression, ctx: &mut Context<DIRECT>) {
        // esrap visits both sides without adding parens.
        self.assignment_target(&node.left, ctx);
        ctx.write_ascii(b' ');
        ctx.write(node.operator.as_str());
        ctx.write_ascii(b' ');
        self.print_expression(&node.right, ctx);
    }

    /// A `SimpleAssignmentTarget` (the operand of `++`/`--`, a subset of
    /// `AssignmentTarget`).
    fn simple_assignment_target(
        &mut self,
        target: &SimpleAssignmentTarget,
        ctx: &mut Context<DIRECT>,
    ) {
        match target {
            SimpleAssignmentTarget::AssignmentTargetIdentifier(id) => ctx.write(id.name.as_str()),
            SimpleAssignmentTarget::StaticMemberExpression(m) => self.static_member(m, ctx),
            SimpleAssignmentTarget::ComputedMemberExpression(m) => self.computed_member(m, ctx),
            SimpleAssignmentTarget::PrivateFieldExpression(m) => {
                self.child_with_parens(&m.object, 19, ctx);
                ctx.write(if m.optional { "?." } else { "." });
                ctx.write_ascii(b'#');
                ctx.write(m.field.name.as_str());
            }
            _ => self.unsupported("SimpleAssignmentTarget", ctx),
        }
    }

    fn assignment_target(&mut self, target: &AssignmentTarget, ctx: &mut Context<DIRECT>) {
        match target {
            AssignmentTarget::AssignmentTargetIdentifier(id) => ctx.write(id.name.as_str()),
            AssignmentTarget::StaticMemberExpression(m) => self.static_member(m, ctx),
            AssignmentTarget::ComputedMemberExpression(m) => self.computed_member(m, ctx),
            AssignmentTarget::PrivateFieldExpression(m) => {
                self.child_with_parens(&m.object, 19, ctx);
                ctx.write(if m.optional { "?." } else { "." });
                ctx.write_ascii(b'#');
                ctx.write(m.field.name.as_str());
            }
            AssignmentTarget::ArrayAssignmentTarget(a) => {
                ctx.write_ascii(b'[');
                let element_len = a.elements.len();
                let n = element_len + usize::from(a.rest.is_some());
                self.sequence_indexed(
                    n,
                    |i| {
                        if i < element_len {
                            let span = a.elements[i].as_ref().map(oxc_span::GetSpan::span);
                            SeqMeta {
                                start: span.map(|s| s.start),
                                end: span.map(|s| s.end),
                                obj_or_array: false,
                                is_elision: span.is_none(),
                            }
                        } else {
                            let span = a.rest.as_ref().unwrap().span();
                            SeqMeta {
                                start: Some(span.start),
                                end: Some(span.end),
                                obj_or_array: false,
                                is_elision: false,
                            }
                        }
                    },
                    |p, i, child| {
                        if i < element_len {
                            if let Some(target) = &a.elements[i] {
                                p.assignment_target_maybe_default(target, child);
                            }
                        } else {
                            let rest = a.rest.as_ref().unwrap();
                            child.write_ascii_bytes(b"...");
                            p.assignment_target(&rest.target, child);
                        }
                    },
                    Some(a.span().end),
                    false,
                    ",",
                    true,
                    ctx,
                );
                ctx.write_ascii(b']');
            }
            AssignmentTarget::ObjectAssignmentTarget(o) => {
                ctx.write_ascii(b'{');
                let property_len = o.properties.len();
                let n = property_len + usize::from(o.rest.is_some());
                self.sequence_indexed(
                    n,
                    |i| {
                        let span = if i < property_len {
                            o.properties[i].span()
                        } else {
                            o.rest.as_ref().unwrap().span()
                        };
                        SeqMeta {
                            start: Some(span.start),
                            end: Some(span.end),
                            obj_or_array: false,
                            is_elision: false,
                        }
                    },
                    |p, i, child| {
                        if i < property_len {
                            p.assignment_target_property(&o.properties[i], child);
                        } else {
                            let rest = o.rest.as_ref().unwrap();
                            child.write_ascii_bytes(b"...");
                            p.assignment_target(&rest.target, child);
                        }
                    },
                    Some(o.span().end),
                    true,
                    ",",
                    true,
                    ctx,
                );
                ctx.write_ascii(b'}');
            }
            _ => self.unsupported("AssignmentTarget", ctx),
        }
    }

    fn assignment_target_maybe_default(
        &mut self,
        target: &AssignmentTargetMaybeDefault,
        ctx: &mut Context<DIRECT>,
    ) {
        match target {
            AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(d) => {
                self.assignment_target(&d.binding, ctx);
                ctx.write_ascii_bytes(b" = ");
                self.print_expression(&d.init, ctx);
            }
            _ => match target.as_assignment_target() {
                Some(t) => self.assignment_target(t, ctx),
                None => self.unsupported("AssignmentTargetMaybeDefault", ctx),
            },
        }
    }

    fn assignment_target_property(
        &mut self,
        prop: &AssignmentTargetProperty,
        ctx: &mut Context<DIRECT>,
    ) {
        match prop {
            AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => {
                ctx.write(p.binding.name.as_str());
                if let Some(init) = &p.init {
                    ctx.write_ascii_bytes(b" = ");
                    self.print_expression(init, ctx);
                }
            }
            AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                if p.computed {
                    ctx.write_ascii(b'[');
                    self.property_key(&p.name, ctx);
                    ctx.write_ascii_bytes(b"]: ");
                } else {
                    self.property_key(&p.name, ctx);
                    ctx.write_ascii_bytes(b": ");
                }
                self.assignment_target_maybe_default(&p.binding, ctx);
            }
        }
    }

    /// esrap's `ConditionalExpression`: only the test is parenthesised (by
    /// precedence); the branches are emitted as-is. When either branch is
    /// multiline or the two together exceed 50 columns, break onto indented
    /// `? …` / `: …` lines.
    fn conditional_expression(&mut self, node: &ConditionalExpression, ctx: &mut Context<DIRECT>) {
        self.child_with_parens(&node.test, 5, ctx);

        let mut consequent = ctx.child();
        self.deferred()
            .print_expression(&node.consequent, &mut consequent);
        let mut alternate = ctx.child();
        self.deferred()
            .print_expression(&node.alternate, &mut alternate);

        let multiline = consequent.multiline
            || alternate.multiline
            || consequent.measure() + alternate.measure() > 50;

        if multiline {
            ctx.indent();
            ctx.newline();
            ctx.write_ascii_bytes(b"? ");
            ctx.append(consequent);
            ctx.newline();
            ctx.write_ascii_bytes(b": ");
            ctx.append(alternate);
            ctx.dedent();
        } else {
            ctx.write_ascii_bytes(b" ? ");
            ctx.append(consequent);
            ctx.write_ascii_bytes(b" : ");
            ctx.append(alternate);
        }
    }

    fn array_expression(&mut self, node: &ArrayExpression, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii(b'[');
        self.sequence_slice(
            &node.elements,
            |el| {
                let span = el.span();
                SeqMeta {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: matches!(el, ArrayExpressionElement::Elision(_)),
                }
            },
            |p, el, child| match el {
                ArrayExpressionElement::SpreadElement(s) => {
                    child.write_ascii_bytes(b"...");
                    p.print_expression(&s.argument, child);
                }
                ArrayExpressionElement::Elision(_) => {}
                _ => {
                    if let Some(e) = el.as_expression() {
                        p.print_expression(e, child);
                    }
                }
            },
            Some(node.span().end),
            false,
            ",",
            true,
            ctx,
        );
        ctx.write_ascii(b']');
    }

    /// esrap always parenthesizes a sequence expression (`(a, b)`), laying the
    /// comma list out with the shared `sequence` machinery.
    fn sequence_expression(&mut self, node: &SequenceExpression, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii(b'(');
        self.sequence_slice(
            &node.expressions,
            |e| {
                let span = e.span();
                SeqMeta {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                }
            },
            |p, e, child| p.print_expression(e, child),
            Some(node.span().end),
            false,
            ",",
            true,
            ctx,
        );
        ctx.write_ascii(b')');
    }

    fn object_expression(&mut self, node: &ObjectExpression, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii(b'{');
        self.sequence_slice(
            &node.properties,
            |prop| {
                let span = prop.span();
                let obj_or_array = matches!(prop, ObjectPropertyKind::ObjectProperty(p)
                if matches!(
                    &p.value,
                    Expression::ObjectExpression(_) | Expression::ArrayExpression(_)
                ));
                SeqMeta {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array,
                    is_elision: false,
                }
            },
            |p, prop, child| {
                let span = prop.span();
                p.flush_leading(child, span.start);
                match prop {
                    ObjectPropertyKind::ObjectProperty(prop) => p.object_property(prop, child),
                    ObjectPropertyKind::SpreadProperty(s) => {
                        child.write_ascii_bytes(b"...");
                        p.print_expression(&s.argument, child);
                    }
                }
            },
            Some(node.span().end),
            true,
            ",",
            true,
            ctx,
        );
        ctx.write_ascii(b'}');
    }

    fn object_property(&mut self, prop: &ObjectProperty, ctx: &mut Context<DIRECT>) {
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
                PropertyKind::Get => ctx.write_ascii_bytes(b"get "),
                PropertyKind::Set => ctx.write_ascii_bytes(b"set "),
                PropertyKind::Init => {}
            }
            if f.r#async {
                ctx.write("async ");
            }
            if f.generator {
                ctx.write_ascii(b'*');
            }
            if prop.computed {
                ctx.write_ascii(b'[');
                self.property_key(&prop.key, ctx);
                ctx.write_ascii(b']');
            } else {
                self.property_key(&prop.key, ctx);
            }
            ctx.write_ascii(b'(');
            self.formal_parameters(&f.params, ctx);
            ctx.write_ascii(b')');
            ctx.write_ascii(b' ');
            match &f.body {
                Some(body) => {
                    let span = body.span();
                    self.block(&body.statements, span.start, span.end, ctx);
                }
                None => ctx.write_ascii_bytes(b"{}"),
            }
            return;
        }
        if prop.computed {
            ctx.write_ascii(b'[');
            self.property_key(&prop.key, ctx);
            ctx.write_ascii_bytes(b"]: ");
        } else {
            self.property_key(&prop.key, ctx);
            ctx.write_ascii_bytes(b": ");
        }
        self.print_expression(&prop.value, ctx);
    }

    fn property_key(&mut self, key: &PropertyKey, ctx: &mut Context<DIRECT>) {
        match key {
            PropertyKey::StaticIdentifier(id) => ctx.write(id.name.as_str()),
            PropertyKey::PrivateIdentifier(id) => {
                ctx.write_ascii(b'#');
                ctx.write(id.name.as_str());
            }
            PropertyKey::StringLiteral(s) => ctx.write(Self::string_literal(s)),
            PropertyKey::NumericLiteral(n) => ctx.write(literal_raw(
                n.raw.as_ref().map(oxc_ast::ast::Str::as_str),
                || format_compact!("{}", n.value),
            )),
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
    #[inline]
    fn print_argument(&mut self, arg: &Argument, ctx: &mut Context<DIRECT>) {
        match arg {
            Argument::SpreadElement(spread) => {
                ctx.write_ascii_bytes(b"...");
                self.print_expression(&spread.argument, ctx);
            }
            _ => match arg.as_expression() {
                Some(expression) => self.print_expression(expression, ctx),
                None => self.unsupported("Argument", ctx),
            },
        }
    }

    #[inline]
    fn call_argument_direct(
        &mut self,
        arg: &Argument,
        next: Option<u32>,
        comma: bool,
        ctx: &mut Context<DIRECT>,
    ) -> bool {
        let scope = ctx.begin_scope();
        self.print_argument(arg, ctx);
        if comma {
            ctx.write_ascii(b',');
        }
        let emitted_line = self.flush_trailing_comments(ctx, arg.span().end, next);
        ctx.end_scope(scope) || (comma && emitted_line)
    }

    #[inline]
    fn call_argument_plain(
        &mut self,
        arg: &Argument,
        comma: bool,
        ctx: &mut Context<DIRECT>,
    ) -> bool {
        let scope = ctx.begin_scope();
        self.print_argument(arg, ctx);
        if comma {
            ctx.write_ascii(b',');
        }
        ctx.end_scope(scope)
    }

    fn call_arguments_plain(&mut self, args: &[Argument], ctx: &mut Context<DIRECT>) {
        match args {
            [] => ctx.write_ascii_bytes(b"()"),
            [arg] => {
                ctx.write_ascii(b'(');
                self.print_argument(arg, ctx);
                ctx.write_ascii(b')');
            }
            [first, last] => {
                ctx.write_ascii(b'(');
                let start = ctx.event_mark();
                if DIRECT {
                    ctx.indent();
                }
                let multiline = self.call_argument_plain(first, true, ctx);
                if DIRECT && !multiline {
                    ctx.dedent();
                }
                let separator = ctx.retro_space_mark();
                self.print_argument(last, ctx);
                if multiline {
                    ctx.insert_event(separator, EventKind::Newline);
                    ctx.insert_event(start, EventKind::Newline);
                    if !DIRECT {
                        ctx.insert_event(start, EventKind::Indent);
                    }
                    ctx.dedent();
                    ctx.newline();
                }
                ctx.write_ascii(b')');
            }
            [first, second, last] => {
                ctx.write_ascii(b'(');
                let start = ctx.event_mark();
                if DIRECT {
                    ctx.indent();
                }
                let first_multiline = self.call_argument_plain(first, true, ctx);
                if DIRECT && !first_multiline {
                    ctx.dedent();
                }
                let first_separator = ctx.retro_space_mark();
                if DIRECT && !first_multiline {
                    ctx.indent();
                }
                let second_multiline = self.call_argument_plain(second, true, ctx);
                let multiline = first_multiline || second_multiline;
                if DIRECT && !multiline {
                    ctx.dedent();
                }
                let second_separator = ctx.retro_space_mark();
                self.print_argument(last, ctx);
                if multiline {
                    ctx.insert_event(second_separator, EventKind::Newline);
                    ctx.insert_event(first_separator, EventKind::Newline);
                    ctx.insert_event(start, EventKind::Newline);
                    if !DIRECT {
                        ctx.insert_event(start, EventKind::Indent);
                    }
                    ctx.dedent();
                    ctx.newline();
                }
                ctx.write_ascii(b')');
            }
            _ => {
                ctx.write_ascii(b'(');
                let start = ctx.event_mark();
                let mut separators = Vec::with_capacity(args.len() - 1);
                let mut multiline = false;
                let mut direct_indent = false;
                for (i, arg) in args.iter().enumerate() {
                    let is_last = i == args.len() - 1;
                    if i > 0 {
                        separators.push(ctx.retro_space_mark());
                    }
                    if is_last {
                        if DIRECT && direct_indent && !multiline {
                            ctx.dedent();
                            direct_indent = false;
                        }
                        self.print_argument(arg, ctx);
                    } else {
                        if DIRECT && !direct_indent {
                            ctx.indent();
                            direct_indent = true;
                        }
                        let item_multiline = self.call_argument_plain(arg, true, ctx);
                        multiline |= item_multiline;
                        if DIRECT && !multiline {
                            ctx.dedent();
                            direct_indent = false;
                        }
                    }
                }
                if multiline {
                    for separator in separators.into_iter().rev() {
                        ctx.insert_event(separator, EventKind::Newline);
                    }
                    ctx.insert_event(start, EventKind::Newline);
                    if !DIRECT {
                        ctx.insert_event(start, EventKind::Indent);
                    }
                    ctx.dedent();
                    ctx.newline();
                }
                ctx.write_ascii(b')');
            }
        }
    }

    fn call_arguments(&mut self, args: &[Argument], call_end: u32, ctx: &mut Context<DIRECT>) {
        if !HAS_COMMENTS {
            self.call_arguments_plain(args, ctx);
            return;
        }

        let n = args.len();

        if let [arg] = args {
            let arg_start = arg
                .as_expression()
                .map_or_else(|| arg.span().start, |e| unparen(e).span().start);
            let wrap = self.comment_at(self.comment_index).is_some_and(|c| {
                c.start < arg_start && self.comment_starts_on_earlier_line(c, arg_start)
            });

            ctx.write_ascii(b'(');
            if wrap {
                ctx.indent();
                ctx.newline();
            }
            self.print_argument(arg, ctx);
            // esrap flushes the trailing comment into a child context nothing
            // is written to afterwards, so its `newline()` never reaches the
            // `)` write — the statement is NOT multiline and gets no blank-line
            // margins. Isolate the flush the same way.
            let scope = ctx.begin_scope();
            self.flush_trailing_comments(ctx, arg.span().end, Some(call_end));
            ctx.end_scope(scope);
            if wrap {
                ctx.dedent();
                ctx.newline();
            }
            ctx.write_ascii(b')');
            return;
        }

        if let [first, second] = args {
            let second_start = second
                .as_expression()
                .map_or_else(|| second.span().start, |e| unparen(e).span().start);
            let force_multiline = self.comment_at(self.comment_index).is_some_and(|c| {
                c.start < second_start && self.comment_starts_on_earlier_line(c, second_start)
            });

            ctx.write_ascii(b'(');
            let start = ctx.event_mark();
            let first_multiline =
                self.call_argument_direct(first, Some(second.span().start), true, ctx);
            let separator = ctx.event_mark();
            ctx.space();
            self.call_argument_direct(second, Some(call_end), false, ctx);

            if force_multiline || first_multiline {
                ctx.insert_event(separator, EventKind::Newline);
                ctx.insert_event(start, EventKind::Newline);
                ctx.insert_event(start, EventKind::Indent);
                ctx.dedent();
                ctx.newline();
            }
            ctx.write_ascii(b')');
            return;
        }

        if let [first, second, last] = args {
            let last_start = last
                .as_expression()
                .map_or_else(|| last.span().start, |e| unparen(e).span().start);
            let force_multiline = self.comment_at(self.comment_index).is_some_and(|c| {
                c.start < last_start && self.comment_starts_on_earlier_line(c, last_start)
            });
            ctx.write_ascii(b'(');
            let start = ctx.event_mark();
            let first_multiline =
                self.call_argument_direct(first, Some(second.span().start), true, ctx);
            let first_separator = ctx.event_mark();
            ctx.space();
            let second_multiline =
                self.call_argument_direct(second, Some(last.span().start), true, ctx);
            let second_separator = ctx.event_mark();
            ctx.space();
            self.call_argument_direct(last, Some(call_end), false, ctx);

            if force_multiline || first_multiline || second_multiline {
                ctx.insert_event(second_separator, EventKind::Newline);
                ctx.insert_event(first_separator, EventKind::Newline);
                ctx.insert_event(start, EventKind::Newline);
                ctx.insert_event(start, EventKind::Indent);
                ctx.dedent();
                ctx.newline();
            }
            ctx.write_ascii(b')');
            return;
        }

        if args.is_empty() {
            ctx.write_ascii_bytes(b"()");
            return;
        }

        ctx.write_ascii(b'(');
        let start = ctx.event_mark();
        let mut separators = Vec::with_capacity(n - 1);
        let mut force_multiline = false;
        let mut any_multiline = false;

        for (i, arg) in args.iter().enumerate() {
            let is_last = i == n - 1;
            let arg_start = arg
                .as_expression()
                .map_or_else(|| arg.span().start, |e| unparen(e).span().start);

            if is_last
                && let Some(c) = self.comment_at(self.comment_index)
                && c.start < arg_start
                && self.comment_starts_on_earlier_line(c, arg_start)
            {
                force_multiline = true;
            }

            if i > 0 {
                separators.push(ctx.event_mark());
                ctx.space();
            }
            let next = if is_last {
                Some(call_end)
            } else {
                Some(args[i + 1].span().start)
            };
            any_multiline |= self.call_argument_direct(arg, next, !is_last, ctx) && !is_last;
        }

        if force_multiline || any_multiline {
            for separator in separators.into_iter().rev() {
                ctx.insert_event(separator, EventKind::Newline);
            }
            ctx.insert_event(start, EventKind::Newline);
            ctx.insert_event(start, EventKind::Indent);
            ctx.dedent();
            ctx.newline();
        }
        ctx.write_ascii(b')');
    }

    // ----- TypeScript types -------------------------------------------------

    /// esrap's `TSTypeAnnotation`: `: ` + the type.
    fn type_annotation(&mut self, node: &TSTypeAnnotation, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii_bytes(b": ");
        self.print_type(&node.type_annotation, ctx);
    }

    /// esrap's `TSTypeParameterInstantiation`: `<a, b>`.
    fn type_parameter_instantiation(
        &mut self,
        node: &TSTypeParameterInstantiation,
        ctx: &mut Context<DIRECT>,
    ) {
        ctx.write_ascii(b'<');
        for (i, p) in node.params.iter().enumerate() {
            if i > 0 {
                ctx.write_ascii_bytes(b", ");
            }
            self.print_type(p, ctx);
        }
        ctx.write_ascii(b'>');
    }

    /// esrap's `TSTypeParameterDeclaration`: `<T, U extends V = W>`.
    fn type_parameter_declaration(
        &mut self,
        node: &TSTypeParameterDeclaration,
        ctx: &mut Context<DIRECT>,
    ) {
        ctx.write_ascii(b'<');
        for (i, p) in node.params.iter().enumerate() {
            if i > 0 {
                ctx.write_ascii_bytes(b", ");
            }
            self.type_parameter(p, ctx);
        }
        ctx.write_ascii(b'>');
    }

    fn type_parameter(&mut self, node: &TSTypeParameter, ctx: &mut Context<DIRECT>) {
        ctx.write(node.name.name.as_str());
        if let Some(constraint) = &node.constraint {
            ctx.write(" extends ");
            self.print_type(constraint, ctx);
        }
        if let Some(default) = &node.default {
            ctx.write_ascii_bytes(b" = ");
            self.print_type(default, ctx);
        }
    }

    /// esrap's `TSTypeName` (`IdentifierReference` / `TSQualifiedName`).
    fn print_type_name(name: &TSTypeName, ctx: &mut Context<DIRECT>) {
        match name {
            TSTypeName::IdentifierReference(id) => ctx.write(id.name.as_str()),
            TSTypeName::QualifiedName(q) => {
                Self::print_type_name(&q.left, ctx);
                ctx.write_ascii(b'.');
                ctx.write(q.right.name.as_str());
            }
            TSTypeName::ThisExpression(_) => ctx.write_ascii_bytes(b"this"),
        }
    }

    /// The core type dispatcher (esrap's TS type visitors).
    #[allow(clippy::too_many_lines)]
    fn print_type(&mut self, ty: &TSType, ctx: &mut Context<DIRECT>) {
        match ty {
            TSType::TSAnyKeyword(_) => ctx.write_ascii_bytes(b"any"),
            TSType::TSBigIntKeyword(_) => ctx.write("bigint"),
            TSType::TSBooleanKeyword(_) => ctx.write("boolean"),
            TSType::TSIntrinsicKeyword(_) => ctx.write("intrinsic"),
            TSType::TSNeverKeyword(_) => ctx.write("never"),
            TSType::TSNullKeyword(_) => ctx.write_ascii_bytes(b"null"),
            TSType::TSNumberKeyword(_) => ctx.write("number"),
            TSType::TSObjectKeyword(_) => ctx.write("object"),
            TSType::TSStringKeyword(_) => ctx.write("string"),
            TSType::TSSymbolKeyword(_) => ctx.write("symbol"),
            TSType::TSUndefinedKeyword(_) => ctx.write("undefined"),
            TSType::TSUnknownKeyword(_) => ctx.write("unknown"),
            TSType::TSVoidKeyword(_) => ctx.write_ascii_bytes(b"void"),
            TSType::TSThisType(_) => ctx.write_ascii_bytes(b"this"),
            TSType::TSArrayType(t) => {
                self.print_type(&t.element_type, ctx);
                ctx.write_ascii_bytes(b"[]");
            }
            TSType::TSParenthesizedType(t) => {
                ctx.write_ascii(b'(');
                self.print_type(&t.type_annotation, ctx);
                ctx.write_ascii(b')');
            }
            TSType::TSTypeReference(t) => {
                Self::print_type_name(&t.type_name, ctx);
                if let Some(ta) = &t.type_arguments {
                    self.type_parameter_instantiation(ta, ctx);
                }
            }
            TSType::TSTypeLiteral(t) => self.type_literal(t, ctx),
            TSType::TSUnionType(t) => {
                // No trailing newline so a following `=>` stays on the line.
                let nodes = Self::type_seq_nodes(&t.types);
                self.sequence(nodes, Some(t.span.end), false, " |", false, ctx);
            }
            TSType::TSIntersectionType(t) => {
                let nodes = Self::type_seq_nodes(&t.types);
                self.sequence(nodes, Some(t.span.end), false, " &", false, ctx);
            }
            TSType::TSConditionalType(t) => {
                self.print_type(&t.check_type, ctx);
                ctx.write(" extends ");
                self.print_type(&t.extends_type, ctx);
                ctx.write_ascii_bytes(b" ? ");
                self.print_type(&t.true_type, ctx);
                ctx.write_ascii_bytes(b" : ");
                self.print_type(&t.false_type, ctx);
            }
            TSType::TSIndexedAccessType(t) => {
                self.print_type(&t.object_type, ctx);
                ctx.write_ascii(b'[');
                self.print_type(&t.index_type, ctx);
                ctx.write_ascii(b']');
            }
            TSType::TSInferType(t) => {
                ctx.write("infer ");
                self.type_parameter(&t.type_parameter, ctx);
            }
            TSType::TSLiteralType(t) => self.ts_literal(&t.literal, ctx),
            TSType::TSTypeOperatorType(t) => {
                ctx.write(ts_type_operator_str(t.operator));
                ctx.write_ascii(b' ');
                self.print_type(&t.type_annotation, ctx);
            }
            TSType::TSTypeQuery(t) => {
                ctx.write("typeof ");
                match &t.expr_name {
                    TSTypeQueryExprName::TSImportType(it) => Self::import_type(it, ctx),
                    TSTypeQueryExprName::IdentifierReference(id) => ctx.write(id.name.as_str()),
                    TSTypeQueryExprName::QualifiedName(q) => {
                        Self::print_type_name(&q.left, ctx);
                        ctx.write_ascii(b'.');
                        ctx.write(q.right.name.as_str());
                    }
                    TSTypeQueryExprName::ThisExpression(_) => ctx.write_ascii_bytes(b"this"),
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
                    TSTypePredicateName::This(_) => ctx.write_ascii_bytes(b"this"),
                }
                if let Some(ann) = &t.type_annotation {
                    ctx.write_ascii_bytes(b" is ");
                    self.print_type(&ann.type_annotation, ctx);
                }
            }
            TSType::TSTupleType(t) => {
                ctx.write_ascii(b'[');
                let nodes = Self::tuple_element_seq_nodes(&t.element_types);
                self.sequence(nodes, Some(t.span.end), false, ",", true, ctx);
                ctx.write_ascii(b']');
            }
            TSType::TSNamedTupleMember(t) => self.named_tuple_member(t, ctx),
            TSType::TSFunctionType(t) => {
                if let Some(tp) = &t.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write_ascii(b'(');
                self.formal_parameters(&t.params, ctx);
                ctx.write(") => ");
                self.print_type(&t.return_type.type_annotation, ctx);
            }
            TSType::TSConstructorType(t) => {
                if t.r#abstract {
                    ctx.write("abstract ");
                }
                ctx.write_ascii_bytes(b"new ");
                if let Some(tp) = &t.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write_ascii(b'(');
                self.formal_parameters(&t.params, ctx);
                ctx.write(") => ");
                self.print_type(&t.return_type.type_annotation, ctx);
            }
            TSType::TSImportType(t) => Self::import_type(t, ctx),
            TSType::TSMappedType(t) => self.mapped_type(t, ctx),
            TSType::TSTemplateLiteralType(t) => {
                ctx.write_ascii(b'`');
                for (i, inner) in t.types.iter().enumerate() {
                    let raw = t.quasis.get(i).map_or("", |q| q.value.raw.as_str());
                    ctx.write(raw);
                    ctx.write_ascii_bytes(b"${");
                    self.print_type(inner, ctx);
                    ctx.write_ascii(b'}');
                    if raw.contains('\n') {
                        ctx.multiline = true;
                    }
                }
                if let Some(last) = t.quasis.last() {
                    ctx.write(last.value.raw.as_str());
                    ctx.write_ascii(b'`');
                }
            }
            other => self.unsupported(ts_type_kind(other), ctx),
        }
    }

    /// esrap's `TSImportType`: `import('src')[.qualifier]`. (Type-argument
    /// support is unused by the samples.)
    fn import_type(node: &TSImportType, ctx: &mut Context<DIRECT>) {
        ctx.write("import(");
        ctx.write(Self::string_literal(&node.source));
        ctx.write_ascii(b')');
        if let Some(qualifier) = &node.qualifier {
            ctx.write_ascii(b'.');
            Self::import_type_qualifier(qualifier, ctx);
        }
    }

    fn import_type_qualifier(q: &TSImportTypeQualifier, ctx: &mut Context<DIRECT>) {
        match q {
            TSImportTypeQualifier::Identifier(id) => ctx.write(id.name.as_str()),
            TSImportTypeQualifier::QualifiedName(qn) => {
                Self::import_type_qualifier(&qn.left, ctx);
                ctx.write_ascii(b'.');
                ctx.write(qn.right.name.as_str());
            }
        }
    }

    /// esrap's `TSNamedTupleMember`: `label[?]: type`.
    fn named_tuple_member(&mut self, node: &TSNamedTupleMember, ctx: &mut Context<DIRECT>) {
        ctx.write(node.label.name.as_str());
        if node.optional {
            ctx.write_ascii(b'?');
        }
        ctx.write_ascii_bytes(b": ");
        self.tuple_element(&node.element_type, ctx);
    }

    fn tuple_element(&mut self, el: &TSTupleElement, ctx: &mut Context<DIRECT>) {
        match el {
            TSTupleElement::TSOptionalType(t) => {
                self.print_type(&t.type_annotation, ctx);
                ctx.write_ascii(b'?');
            }
            TSTupleElement::TSRestType(t) => {
                ctx.write_ascii_bytes(b"...");
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
    fn mapped_type(&mut self, node: &TSMappedType, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii(b'{');
        if let Some(readonly) = node.readonly {
            ctx.write(mapped_modifier_prefix(readonly, "readonly"));
        }
        ctx.write_ascii(b'[');
        ctx.write(node.key.name.as_str());
        ctx.write_ascii_bytes(b" in ");
        self.print_type(&node.constraint, ctx);
        if let Some(name_type) = &node.name_type {
            ctx.write_ascii_bytes(b" as ");
            self.print_type(name_type, ctx);
        }
        ctx.write_ascii(b']');
        if let Some(optional) = node.optional {
            ctx.write(mapped_modifier_prefix(optional, "?"));
        }
        if let Some(ann) = &node.type_annotation {
            ctx.write_ascii_bytes(b": ");
            self.print_type(ann, ctx);
        }
        ctx.write_ascii(b'}');
    }

    /// esrap's `TSTypeLiteral`: `{ ` + `;`-separated members + ` }`.
    fn type_literal(&mut self, node: &TSTypeLiteral, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii_bytes(b"{ ");
        let nodes = Self::signature_seq_nodes(&node.members);
        self.sequence(nodes, Some(node.span.end), false, ";", true, ctx);
        ctx.write_ascii_bytes(b" }");
    }

    fn ts_literal(&mut self, lit: &TSLiteral, ctx: &mut Context<DIRECT>) {
        match lit {
            TSLiteral::BooleanLiteral(b) => ctx.write(if b.value { "true" } else { "false" }),
            TSLiteral::NumericLiteral(n) => ctx.write(literal_raw(
                n.raw.as_ref().map(oxc_ast::ast::Str::as_str),
                || format_compact!("{}", n.value),
            )),
            TSLiteral::BigIntLiteral(n) => ctx.write(literal_raw(
                n.raw.as_ref().map(oxc_ast::ast::Str::as_str),
                || format_compact!("{}n", n.value),
            )),
            TSLiteral::StringLiteral(s) => ctx.write(Self::string_literal(s)),
            TSLiteral::TemplateLiteral(t) => self.template_literal(t, ctx),
            TSLiteral::UnaryExpression(u) => self.unary_expression(u, ctx),
        }
    }

    /// Build [`SeqNode`]s for a list of types (union/intersection).
    fn type_seq_nodes<'p>(types: &'p [TSType<'p>]) -> Vec<SeqNode<'p, HAS_COMMENTS>> {
        types
            .iter()
            .map(|ty| {
                let span = ty.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(
                        move |p: &mut Printer<'_, HAS_COMMENTS, false>,
                              child: &mut Context<false>| {
                            p.print_type(ty, child);
                        },
                    ),
                }
            })
            .collect()
    }

    fn tuple_element_seq_nodes<'p>(
        els: &'p [TSTupleElement<'p>],
    ) -> Vec<SeqNode<'p, HAS_COMMENTS>> {
        els.iter()
            .map(|el| {
                let span = el.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(
                        move |p: &mut Printer<'_, HAS_COMMENTS, false>,
                              child: &mut Context<false>| {
                            p.tuple_element(el, child);
                        },
                    ),
                }
            })
            .collect()
    }

    fn signature_seq_nodes<'p>(members: &'p [TSSignature<'p>]) -> Vec<SeqNode<'p, HAS_COMMENTS>> {
        members
            .iter()
            .map(|m| {
                let span = m.span();
                SeqNode {
                    start: Some(span.start),
                    end: Some(span.end),
                    obj_or_array: false,
                    is_elision: false,
                    render: Box::new(
                        move |p: &mut Printer<'_, HAS_COMMENTS, false>,
                              child: &mut Context<false>| {
                            p.signature(m, child);
                        },
                    ),
                }
            })
            .collect()
    }

    /// esrap's `TSSignature` visitors (members of an interface / type literal).
    fn signature(&mut self, sig: &TSSignature, ctx: &mut Context<DIRECT>) {
        match sig {
            TSSignature::TSPropertySignature(s) => {
                if s.readonly {
                    ctx.write("readonly ");
                }
                if s.computed {
                    ctx.write_ascii(b'[');
                    self.property_key(&s.key, ctx);
                    ctx.write_ascii(b']');
                } else {
                    self.property_key(&s.key, ctx);
                }
                if s.optional {
                    ctx.write_ascii(b'?');
                }
                if let Some(ann) = &s.type_annotation {
                    self.type_annotation(ann, ctx);
                }
            }
            TSSignature::TSIndexSignature(s) => {
                if s.readonly {
                    ctx.write("readonly ");
                }
                ctx.write_ascii(b'[');
                ctx.write(s.parameter.name.as_str());
                self.type_annotation(&s.parameter.type_annotation, ctx);
                ctx.write_ascii(b']');
                self.type_annotation(&s.type_annotation, ctx);
            }
            TSSignature::TSMethodSignature(s) => {
                if s.computed {
                    ctx.write_ascii(b'[');
                    self.property_key(&s.key, ctx);
                    ctx.write_ascii(b']');
                } else {
                    self.property_key(&s.key, ctx);
                }
                if s.optional {
                    ctx.write_ascii(b'?');
                }
                if let Some(tp) = &s.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write_ascii(b'(');
                self.formal_parameters(&s.params, ctx);
                ctx.write_ascii(b')');
                if let Some(rt) = &s.return_type {
                    self.type_annotation(rt, ctx);
                }
            }
            TSSignature::TSCallSignatureDeclaration(s) => {
                if let Some(tp) = &s.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write_ascii(b'(');
                self.formal_parameters(&s.params, ctx);
                ctx.write_ascii(b')');
                if let Some(rt) = &s.return_type {
                    self.type_annotation(rt, ctx);
                }
            }
            TSSignature::TSConstructSignatureDeclaration(s) => {
                ctx.write_ascii_bytes(b"new");
                if let Some(tp) = &s.type_parameters {
                    self.type_parameter_declaration(tp, ctx);
                }
                ctx.write_ascii(b'(');
                self.formal_parameters(&s.params, ctx);
                ctx.write_ascii(b')');
                if let Some(rt) = &s.return_type {
                    self.type_annotation(rt, ctx);
                }
            }
        }
    }

    // ----- TypeScript declarations ------------------------------------------

    fn type_alias_declaration(&mut self, node: &TSTypeAliasDeclaration, ctx: &mut Context<DIRECT>) {
        if node.declare {
            ctx.write("declare ");
        }
        ctx.write("type ");
        ctx.write(node.id.name.as_str());
        if let Some(tp) = &node.type_parameters {
            self.type_parameter_declaration(tp, ctx);
        }
        ctx.write_ascii_bytes(b" = ");
        self.print_type(&node.type_annotation, ctx);
        ctx.write_ascii(b';');
    }

    fn interface_declaration(&mut self, node: &TSInterfaceDeclaration, ctx: &mut Context<DIRECT>) {
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
            let nodes: Vec<SeqNode<HAS_COMMENTS>> = node
                .extends
                .iter()
                .map(|h| {
                    let span = h.span();
                    SeqNode {
                        start: Some(span.start),
                        end: Some(span.end),
                        obj_or_array: false,
                        is_elision: false,
                        render: Box::new(
                            move |p: &mut Printer<'_, HAS_COMMENTS, false>,
                                  child: &mut Context<false>| {
                                Printer::<HAS_COMMENTS, false>::print_type_name(
                                    &h.type_name,
                                    child,
                                );
                                if let Some(ta) = &h.type_arguments {
                                    p.type_parameter_instantiation(ta, child);
                                }
                            },
                        ),
                    }
                })
                .collect();
            self.sequence(nodes, Some(node.body.span().start), false, ",", true, ctx);
        }
        ctx.write_ascii_bytes(b" {");
        // esrap's `TSInterfaceBody`: `;`-separated members with padding.
        let nodes = Self::signature_seq_nodes(&node.body.body);
        self.sequence(nodes, Some(node.body.span().end), true, ";", true, ctx);
        ctx.write_ascii(b'}');
    }

    fn enum_declaration(&mut self, node: &TSEnumDeclaration, ctx: &mut Context<DIRECT>) {
        if node.declare {
            ctx.write("declare ");
        }
        if node.r#const {
            ctx.write("const ");
        }
        ctx.write("enum ");
        ctx.write(node.id.name.as_str());
        ctx.write_ascii_bytes(b" {");
        ctx.indent();
        ctx.newline();
        let nodes: Vec<SeqNode<HAS_COMMENTS>> = node
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
                    render: Box::new(
                        move |p: &mut Printer<'_, HAS_COMMENTS, false>,
                              child: &mut Context<false>| {
                            p.enum_member(m, child);
                        },
                    ),
                }
            })
            .collect();
        self.sequence(nodes, Some(node.span.end), false, ",", true, ctx);
        ctx.dedent();
        ctx.newline();
        ctx.write_ascii(b'}');
    }

    fn enum_member(&mut self, node: &TSEnumMember, ctx: &mut Context<DIRECT>) {
        match &node.id {
            TSEnumMemberName::Identifier(id) => ctx.write(id.name.as_str()),
            TSEnumMemberName::String(s) => ctx.write(Self::string_literal(s)),
            TSEnumMemberName::ComputedString(s) => {
                ctx.write_ascii(b'[');
                ctx.write(Self::string_literal(s));
                ctx.write_ascii(b']');
            }
            TSEnumMemberName::ComputedTemplateString(t) => {
                ctx.write_ascii(b'[');
                self.template_literal(t, ctx);
                ctx.write_ascii(b']');
            }
        }
        if let Some(init) = &node.initializer {
            ctx.write_ascii_bytes(b" = ");
            self.print_expression(init, ctx);
        }
    }

    fn external_module_declaration(
        &mut self,
        node: &TSExternalModuleDeclaration,
        ctx: &mut Context<DIRECT>,
    ) {
        if node.declare {
            ctx.write("declare ");
        }
        ctx.write("module ");
        ctx.write(Self::string_literal(&node.id));
        if let Some(body) = &node.body {
            self.module_block(body, ctx);
        }
    }

    fn namespace_declaration(
        &mut self,
        node: &TSNamespaceDeclaration,
        include_keyword: bool,
        ctx: &mut Context<DIRECT>,
    ) {
        if include_keyword {
            if node.declare {
                ctx.write("declare ");
            }
            ctx.write(match node.kind {
                TSNamespaceDeclarationKind::Module => "module ",
                TSNamespaceDeclarationKind::Namespace => "namespace ",
            });
        }
        ctx.write(node.id.name.as_str());
        match &node.body {
            TSNamespaceDeclarationBody::TSModuleBlock(block) => self.module_block(block, ctx),
            TSNamespaceDeclarationBody::TSNamespaceDeclaration(inner) => {
                ctx.write_ascii(b'.');
                self.namespace_declaration(inner, false, ctx);
            }
        }
    }

    fn global_declaration(&mut self, node: &TSGlobalDeclaration, ctx: &mut Context<DIRECT>) {
        if node.declare {
            ctx.write("declare ");
        }
        ctx.write("global");
        self.module_block(&node.body, ctx);
    }

    /// esrap's `TSModuleBlock`: ` {` + indented body + `}`.
    fn module_block(&mut self, node: &TSModuleBlock, ctx: &mut Context<DIRECT>) {
        ctx.write_ascii_bytes(b" {");
        ctx.indent();
        ctx.newline();
        let elems = node
            .directives
            .iter()
            .map(BodyElem::Directive)
            .chain(node.body.iter().map(BodyElem::Statement));
        self.body_elems(elems, Some(node.span.start), node.span.end, ctx);
        ctx.dedent();
        ctx.newline();
        ctx.write_ascii(b'}');
    }

    fn import_equals_declaration(node: &TSImportEqualsDeclaration, ctx: &mut Context<DIRECT>) {
        ctx.write("import ");
        ctx.write(node.id.name.as_str());
        ctx.write_ascii_bytes(b" = ");
        match &node.module_reference {
            TSModuleReference::ExternalModuleReference(r) => {
                ctx.write("require(");
                ctx.write(Self::string_literal(&r.expression));
                ctx.write_ascii_bytes(b");");
            }
            TSModuleReference::IdentifierReference(id) => {
                ctx.write(id.name.as_str());
            }
            TSModuleReference::QualifiedName(q) => {
                Self::print_type_name(&q.left, ctx);
                ctx.write_ascii(b'.');
                ctx.write(q.right.name.as_str());
            }
        }
    }

    // ----- literals ---------------------------------------------------------

    fn string_literal(s: &StringLiteral) -> CompactString {
        if let Some(raw) = &s.raw {
            return raw.as_str().into();
        }
        quote(s.value.as_str())
    }
}

/// esrap prefers a literal's preserved `raw` spelling; only synthesised literals
/// fall back to a canonical rendering.
fn literal_raw(raw: Option<&str>, fallback: impl FnOnce() -> CompactString) -> CompactString {
    raw.map_or_else(fallback, Into::into)
}

/// Quote a string value in single quotes, escaping as needed.
fn quote(value: &str) -> CompactString {
    // esrap's `quote` escapes only `\`, the quote char, `\n`, and `\r` — a literal
    // tab is left as-is. Match it exactly (don't escape `\t`).
    let mut out = CompactString::with_capacity(value.len() + 2);
    out.push('\'');
    for ch in value.chars() {
        match ch {
            '\\' => out.push_str("\\\\"),
            '\'' => out.push_str("\\'"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            c => out.push(c),
        }
    }
    out.push('\'');
    out
}

/// A pre-rendered element of a comma sequence, plus the layout flags esrap's
/// `sequence` consults: whether the element itself broke across lines, and
/// whether it's a property with an object/array value (which suppresses the
/// blank-line margin between adjacent multiline elements).
struct SeqItem {
    ctx: Context<false>,
    multiline: bool,
    obj_or_array: bool,
    /// This item is an array elision (a hole, `[a, , b]`). esrap still writes
    /// the hole's separator but omits the inter-element space/newline *before*
    /// it, so consecutive holes read `,,` rather than `, ,`.
    is_elision: bool,
}

#[derive(Clone, Copy)]
struct SeqLayout {
    mark: EventMark,
    multiline: bool,
    obj_or_array: bool,
    is_elision: bool,
}

#[derive(Clone, Copy)]
struct SeqMeta {
    start: Option<u32>,
    end: Option<u32>,
    obj_or_array: bool,
    is_elision: bool,
}

/// One node of a comma sequence, as fed to [`Printer::sequence`]. Carries the
/// node's source span (so trailing comments can be flushed in source order) and
/// a closure that renders it into a child context.
type SeqRenderer<'p, const HAS_COMMENTS: bool> =
    dyn FnMut(&mut Printer<'_, HAS_COMMENTS, false>, &mut Context<false>) + 'p;

struct SeqNode<'p, const HAS_COMMENTS: bool> {
    /// Node `loc.end` byte offset, or `None` for a synthetic node without a
    /// span (no trailing-comment flush is attempted for it).
    end: Option<u32>,
    /// Node `loc.start` byte offset (the `next` boundary for the *previous*
    /// node's trailing comments).
    start: Option<u32>,
    obj_or_array: bool,
    is_elision: bool,
    render: Box<SeqRenderer<'p, HAS_COMMENTS>>,
}

const fn accessibility_str(acc: TSAccessibility) -> &'static str {
    match acc {
        TSAccessibility::Private => "private",
        TSAccessibility::Protected => "protected",
        TSAccessibility::Public => "public",
    }
}

const fn ts_type_operator_str(op: TSTypeOperatorOperator) -> &'static str {
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

const fn ts_type_kind(ty: &TSType) -> &'static str {
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

impl<'a> BodyElem<'a, '_> {
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

    /// A surviving `EmptyStatement` is half of the `;;` upstream prints for a
    /// removed `$inspect(...)`: one `ExpressionStatement` whose expression is
    /// `b.empty`. The pair must print on one line and group with an
    /// `ExpressionStatement` for esrap's margin rule.
    fn is_kept_empty(&self) -> bool {
        matches!(self, BodyElem::Statement(Statement::EmptyStatement(_)))
    }

    /// A sentinel empty has no real end, but its start is the removed
    /// statement's own start — the anchor a comment trailing it on that line
    /// needs.
    fn comment_end(&self) -> u32 {
        match self {
            BodyElem::Statement(Statement::EmptyStatement(s)) if s.span.end == u32::MAX => {
                s.span.start
            }
            _ => self.span_end(),
        }
    }

    fn span_end(&self) -> u32 {
        match self {
            BodyElem::Directive(d) => d.span.end,
            BodyElem::Statement(s) => s.span().end,
            BodyElem::ClassMember(e) => e.span().end,
        }
    }

    fn span_start(&self) -> u32 {
        match self {
            BodyElem::Directive(d) => d.span.start,
            BodyElem::Statement(s) => s.span().start,
            BodyElem::ClassMember(e) => e.span().start,
        }
    }

    /// esrap's `child.type === prev_type` margin grouping. A directive groups as
    /// its own kind (separated from a following non-directive, matching the
    /// acorn shape where `"use strict"` precedes `import`/`let`).
    fn same_kind(&self, other: &BodyElem<'a, '_>) -> bool {
        match (self, other) {
            (BodyElem::Directive(_), BodyElem::Directive(_)) => true,
            (BodyElem::Statement(a), BodyElem::Statement(b)) => same_statement_kind(a, b),
            (BodyElem::ClassMember(a), BodyElem::ClassMember(b)) => {
                std::mem::discriminant(*a) == std::mem::discriminant(*b)
            }
            _ => false,
        }
    }

    fn print<const HAS_COMMENTS: bool, const DIRECT: bool>(
        &self,
        printer: &mut Printer<'_, HAS_COMMENTS, DIRECT>,
        ctx: &mut Context<DIRECT>,
    ) {
        match self {
            BodyElem::Directive(d) => printer.print_directive(d, ctx),
            BodyElem::Statement(s) => printer.print_statement(s, ctx),
            BodyElem::ClassMember(e) => printer.class_element(e, ctx),
        }
    }
}

/// A surviving `EmptyStatement` is half of one `;;` hole (see
/// [`BodyElem::is_kept_empty`]).
const fn is_kept_empty_stmt(stmt: &Statement) -> bool {
    matches!(stmt, Statement::EmptyStatement(_))
}

/// A sentinel empty's end is `u32::MAX`; its start is the anchor a trailing
/// comment needs (see [`BodyElem::comment_end`]).
fn statement_comment_end(stmt: &Statement) -> u32 {
    match stmt {
        Statement::EmptyStatement(s) if s.span.end == u32::MAX => s.span.start,
        _ => stmt.span().end,
    }
}

/// esrap's `child.type === prev_type` margin rule. A kept `EmptyStatement` is
/// half of the `;;` upstream emits as an `ExpressionStatement`, so it groups
/// with one.
fn same_statement_kind(a: &Statement, b: &Statement) -> bool {
    const fn expression_like(s: &Statement) -> bool {
        matches!(
            s,
            Statement::EmptyStatement(_) | Statement::ExpressionStatement(_)
        )
    }
    (expression_like(a) && expression_like(b))
        || std::mem::discriminant(a) == std::mem::discriminant(b)
}

const fn expression_kind(expr: &Expression) -> &'static str {
    match expr {
        Expression::TaggedTemplateExpression(_) => "TaggedTemplateExpression",
        Expression::YieldExpression(_) => "YieldExpression",
        Expression::ImportMeta(_) | Expression::NewTarget(_) => "MetaProperty",
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
        let mut printer = Printer::<false>::new(&opts);
        let mut ctx = Context::new();
        printer.print_program(&ret.program, &mut ctx);
        (
            crate::command::print(&ctx.into_buffer(), &opts.indent, 0),
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
        let comments = build_comments(&ret.program, src, &line_starts(src));
        let mut printer = Printer::<true>::with_comments(&opts, comments, line_starts(src));
        let mut ctx = Context::new();
        printer.print_program(&ret.program, &mut ctx);
        let out = crate::command::print(&ctx.into_buffer(), &opts.indent, 0);
        assert!(
            printer.missing.is_none(),
            "unsupported node: {:?}",
            printer.missing
        );
        out
    }

    fn synthetic_sequence_deferred(n: usize, unsupported: bool) -> String {
        let opts = PrintOptions::default();
        let mut printer = Printer::<false>::new(&opts);
        let mut ctx = Context::new();
        ctx.write_ascii(b'[');
        printer.sequence_indexed(
            n,
            |_| SeqMeta {
                start: None,
                end: None,
                obj_or_array: false,
                is_elision: false,
            },
            |printer, i, child| {
                if unsupported && i + 1 == n {
                    printer.unsupported("Synthetic", child);
                }
            },
            None,
            true,
            ",",
            true,
            &mut ctx,
        );
        ctx.write_ascii(b']');
        let capacity = ctx.measure();
        crate::command::print(&ctx.into_buffer(), &opts.indent, capacity)
    }

    fn synthetic_sequence_direct(n: usize, unsupported: bool) -> String {
        let opts = PrintOptions::default();
        let mut printer = Printer::<false, true>::new(&opts);
        let mut ctx = Context::new_direct(&opts.indent, 32);
        ctx.write_ascii(b'[');
        printer.sequence_indexed(
            n,
            |_| SeqMeta {
                start: None,
                end: None,
                obj_or_array: false,
                is_elision: false,
            },
            |printer, i, child| {
                if unsupported && i + 1 == n {
                    printer.unsupported("Synthetic", child);
                }
            },
            None,
            true,
            ",",
            true,
            &mut ctx,
        );
        ctx.write_ascii(b']');
        let (buffer, _, indent, dirty) = ctx.into_direct_parts();
        crate::command::finish_direct(buffer, &indent, dirty).0
    }

    #[test]
    fn optimistic_sequence_matches_empty_and_unsupported_renderers() {
        for n in [1, 2] {
            assert_eq!(
                synthetic_sequence_direct(n, false),
                synthetic_sequence_deferred(n, false)
            );
            assert_eq!(
                synthetic_sequence_direct(n, true),
                synthetic_sequence_deferred(n, true)
            );
        }
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
    fn same_line_comment_before_later_statement_stays_trailing_on_previous() {
        assert_eq!(
            print_with_comments_ok(
                "async function f() { let y = 1; return (await $.track_reactivity_loss(/* c */ load()))()(); }"
            ),
            "async function f() {\n\tlet y = 1; /* c */\n\n\treturn (await $.track_reactivity_loss(load()))()();\n}"
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
