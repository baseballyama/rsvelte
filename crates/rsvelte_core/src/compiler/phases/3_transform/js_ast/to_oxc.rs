//! Convert the internal `js_ast` IR (`JsProgram`) into an oxc
//! [`oxc_ast::ast::Program`] so it can be printed by [`rsvelte_esrap`].
//!
//! This is the foundation of the "Phase-3 Step 1+3 direct-AST" pipeline: a
//! prior experiment proved that printing the handwritten codegen output and
//! esrap-printing the same logical AST are byte-identical, so a faithful
//! converter feeding `rsvelte_esrap::print` reproduces the existing output
//! exactly.
//!
//! # Partial coverage is always safe
//!
//! The converter is intentionally incomplete. Every sub-conversion returns
//! `Option`, and a single unhandled node bubbles `None` up to the whole
//! program via the `?` operator. The caller falls back to the existing
//! string-based codegen whenever conversion yields `None`, so this module can
//! grow its coverage one node kind at a time without ever risking incorrect
//! output.
//!
//! **CRITICAL RULE:** return `None` on ANY variant not explicitly handled
//! here.
//!
//! The text-carrying variants are handled, not excluded, and each has its own
//! route:
//!
//!   * `JsStatement::Raw` / `JsStatement::RawMapped` — source text that
//!     `parse_raw_statements` re-parses into real oxc statements, with
//!     `expand_stmt` flattening a multi-statement chunk inline at
//!     statement-list sites. A whole module body emitted as one `Raw` converts.
//!   * `JsExpr::Raw` — opaque expression text, re-parsed by
//!     `parse_raw_expression`.
//!   * `JsExpr::Spanned` — not raw text at all: a real inner expression carrying
//!     the original-source byte span, converted normally and then stamped so
//!     `print_with_map` maps it back to the user's source.
//!
//! Re-parsing **fails loudly when the text does not parse** (`chunk-parse`) and
//! **can differ silently when it does**: `restore_legacy_pre_effect_deps`
//! and `restore_single_target_destructure_sequences` exist precisely
//! because a round-trip that parses can still print differently from the text it
//! came from.
//!
//! # Comments and the unified coordinate space
//!
//! Synthesized nodes use the dummy [`oxc_span::SPAN`]: esrap formats
//! structurally, so their spans do not affect output. Comments are the one
//! exception — esrap places them *positionally*, and a program reassembled from
//! independently-parsed `Raw` chunks has no shared coordinate space to place
//! them in.
//!
//! `Synth` builds one. Each comment-bearing chunk is re-parsed from a
//! `pad + chunk` buffer so its spans (and its comments') land in a private,
//! monotonically increasing region of a unified buffer above `loc_base`;
//! container nodes get the span of the region their children consumed. Spans
//! below `loc_base` — synthesized nodes, and the original-source spans stamped
//! by `Spanned`/`RawMapped` — read as "no location" to the printer, mirroring
//! esrap's `if (node.loc)` guards.

use super::arena::{ExprId, JsArena};
use super::nodes::*;
use crate::ast::oxc_program::RetainedProgram;
use oxc_allocator::{ArenaBox, ArenaVec, GetAllocator, ReplaceWith};
use oxc_ast::ast::*;
use oxc_ast::builder::AstBuilder;
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::{GetSpanMut, SPAN, Span};
use oxc_syntax::number::{BigintBase, NumberBase};
use oxc_syntax::operator::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};
use std::cell::RefCell;

/// A converted program plus the comment coordinate space it needs to be printed
/// in (see the module docs). `comment_source` is `None` for the common
/// comment-free program, which prints exactly as before.
pub struct Converted<'a> {
    pub program: oxc_ast::ast::Program<'a>,
    pub comment_source: Option<String>,
    pub loc_base: u32,
    pub loc_map: Vec<(u32, u32, Option<u32>)>,
}

/// A retained source program to clone into the final OXC allocator.
pub struct AstIsland<'source> {
    pub program: &'source RetainedProgram<'source>,
    pub source_offset: u32,
}

thread_local! {
    static FALLBACK_REASON: std::cell::Cell<&'static str> =
        const { std::cell::Cell::new(UNSUPPORTED) };
}

/// The default: some node kind this converter does not handle bubbled `None`.
const UNSUPPORTED: &str = "unsupported";

fn note_fallback(reason: &'static str) {
    FALLBACK_REASON.with(|c| c.set(reason));
}

/// Why the last [`program_to_oxc`] returned `None`, for the fallback debug log.
pub fn take_fallback_reason() -> &'static str {
    FALLBACK_REASON.with(|c| c.replace(UNSUPPORTED))
}

/// Convert a whole [`JsProgram`] into an oxc [`oxc_ast::ast::Program`].
///
/// Returns `None` if any node in the program is not handled by this converter
/// (see the module docs). The returned program borrows `allocator`, so the
/// allocator must outlive the program (and any `rsvelte_esrap::print` of it).
///
/// Runs as a probe pass followed, only when a chunk turned out to carry
/// comments, by a second pass that knows where to put the comment coordinate
/// space — it has to sit above every span the first pass produced.
pub fn program_to_oxc<'a>(
    program: &JsProgram,
    arena: &JsArena,
    allocator: &'a oxc_allocator::Allocator,
) -> Option<Converted<'a>> {
    program_to_oxc_with_islands(program, arena, allocator, &[])
}

/// Convert an IR program while inserting retained source ASTs directly.
pub fn program_to_oxc_with_islands<'a, 'source>(
    program: &JsProgram,
    arena: &JsArena,
    allocator: &'a oxc_allocator::Allocator,
    islands: &[AstIsland<'source>],
) -> Option<Converted<'a>> {
    note_fallback(UNSUPPORTED);
    let (probe, synth) = convert_once(program, arena, allocator, islands, None)?;
    if !synth.saw_comments {
        return Some(probe);
    }
    let loc_base = synth.max_span.saturating_add(2);
    let (converted, synth) = convert_once(program, arena, allocator, islands, Some(loc_base))?;
    // Every span the pass produced outside a chunk region must stay below
    // `loc_base`, or the printer would mistake it for a real location.
    if synth.max_span >= loc_base {
        note_fallback("loc-base");
        return None;
    }
    Some(converted)
}

fn convert_once<'a, 'source>(
    program: &JsProgram,
    arena: &JsArena,
    allocator: &'a oxc_allocator::Allocator,
    islands: &[AstIsland<'source>],
    loc_base: Option<u32>,
) -> Option<(Converted<'a>, Synth)> {
    let cx = Cx {
        ab: AstBuilder::new(allocator),
        arena,
        islands,
        synth: RefCell::new(Synth::new(loc_base)),
    };

    // Collect, flattening multi-statement `Raw` blobs inline. A single None
    // (parse failure / unhandled node) bails the whole program.
    let (body, span) = cx.consumed(|| {
        let mut body: Vec<Statement<'a>> = Vec::with_capacity(program.body.len());
        for s in &program.body {
            body.extend(cx.expand_stmt(s)?);
        }
        Some(body)
    })?;

    let synth = cx.synth.into_inner();
    let ab = AstBuilder::new(allocator);
    let body = ArenaVec::from_iter_in(body, &ab);
    let comments = ArenaVec::from_iter_in(synth.comments.iter().cloned(), &ab);
    let program = Program::new(
        span,
        oxc_span::SourceType::mjs(),
        "",
        comments,
        None,
        ArenaVec::new_in(&ab),
        body,
        &ab,
    );
    let converted = Converted {
        program,
        comment_source: synth.enabled.then(|| synth.source.clone()),
        loc_base: synth.loc_base,
        loc_map: synth.loc_map.clone(),
    };
    Some((converted, synth))
}

/// Moves a chunk's parsed spans into the chunk's region of the unified buffer.
/// `visit_span` is the one hook every generated walker routes each node's span
/// through, so overriding it covers the whole subtree.
struct ShiftSpans(u32);

impl<'a> VisitMut<'a> for ShiftSpans {
    fn visit_span(&mut self, span: &mut Span) {
        span.start += self.0;
        span.end += self.0;
    }
}

/// The client transform rebuilds effect calls but retains their callback from
/// the source AST. Keep that split when a raw chunk is reparsed: the callback
/// remains located for comment placement while the generated call does not.
struct GeneratedEffectCallUnlocator;

struct SpanUnlocator;

impl<'a> VisitMut<'a> for SpanUnlocator {
    fn visit_span(&mut self, span: &mut Span) {
        *span = SPAN;
    }
}

impl<'a> VisitMut<'a> for GeneratedEffectCallUnlocator {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        walk_mut::walk_expression(self, expr);
        let Expression::CallExpression(call) = expr else {
            return;
        };
        if is_dollar_call(&call.callee, "inspect") {
            call.span = SPAN;
            if let Some(Argument::ArrowFunctionExpression(first)) = call.arguments.first_mut() {
                first.span = SPAN;
                if let Some(Expression::ArrayExpression(array)) = first.get_expression_mut() {
                    array.span = SPAN;
                }
            }
            let mut unlocator = SpanUnlocator;
            for arg in call.arguments.iter_mut().skip(1) {
                unlocator.visit_argument(arg);
            }
        } else if is_dollar_call(&call.callee, "user_effect")
            || is_dollar_call(&call.callee, "user_pre_effect")
            || is_dollar_call(&call.callee, "effect_root")
        {
            call.span = SPAN;
        }
    }
}

fn erase_generated_effect_call_locs(stmts: &mut [Statement<'_>]) {
    let mut unlocator = GeneratedEffectCallUnlocator;
    for stmt in stmts {
        unlocator.visit_statement(stmt);
    }
}

/// Rebuilds any `SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER(expr)` call — however
/// deeply nested — into a one-element `SequenceExpression`. See the marker's doc
/// comment and [`Cx::restore_single_target_destructure_sequences`].
struct SingleTargetSequenceRebuilder<'a, 'x> {
    ab: &'x AstBuilder<'a>,
}

impl<'a, 'x> VisitMut<'a> for SingleTargetSequenceRebuilder<'a, 'x> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        let is_marker_call = matches!(
            expr,
            Expression::CallExpression(call)
                if call.arguments.len() == 1
                    && !call.arguments[0].is_spread()
                    && matches!(
                        &call.callee,
                        Expression::Identifier(id)
                            if id.name == SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER
                    )
        );
        if !is_marker_call {
            return;
        }

        expr.replace_with(|e| {
            let Expression::CallExpression(mut call) = e else {
                unreachable!()
            };
            let arg = call.arguments.pop().unwrap();
            // `is_spread()` was checked above, so this conversion cannot fail.
            let inner =
                Expression::try_from(arg).unwrap_or_else(|()| unreachable!("checked above"));
            Expression::SequenceExpression(SequenceExpression::boxed(
                SPAN,
                ArenaVec::from_value_in(inner, self.ab),
                self.ab,
            ))
        });
    }
}

/// The unified comment coordinate space for a reassembled program.
struct Synth {
    /// Whether this pass places comments (`false` for the probe pass).
    enabled: bool,
    /// The buffer comment spans index into. Starts as a `loc_base`-long pad so
    /// the first chunk's region begins at `loc_base`; each comment-bearing chunk
    /// is appended verbatim, followed by a newline.
    source: String,
    loc_base: u32,
    comments: Vec<Comment>,
    /// Per-chunk `(start, end, original-source offset)`, for source maps.
    loc_map: Vec<(u32, u32, Option<u32>)>,
    /// Region the chunk just parsed occupies, consumed by the caller that knows
    /// the chunk's original-source offset.
    pending_region: Option<(u32, u32)>,
    /// Original-source offset of the last comment-bearing chunk, so an anchor
    /// can tell whether it sits after those comments in the *source* (which is
    /// the order upstream compares in) and not merely after them in the buffer.
    last_region_source: Option<u32>,
    last_region_ends_with_removed_inspect_comment: bool,
    saw_comments: bool,
    /// Upper bound on every span produced outside a chunk region.
    max_span: u32,
}

impl Synth {
    fn new(loc_base: Option<u32>) -> Self {
        let loc_base = loc_base.unwrap_or(0);
        let mut source = String::new();
        if loc_base > 0 {
            // Pad ends with a newline so a comment on the chunk's first line
            // sees an empty indentation prefix, as it would unpadded.
            source.push_str(&" ".repeat(loc_base as usize - 1));
            source.push('\n');
        }
        Self {
            enabled: loc_base > 0,
            source,
            loc_base,
            comments: Vec::new(),
            loc_map: Vec::new(),
            pending_region: None,
            last_region_source: None,
            last_region_ends_with_removed_inspect_comment: false,
            saw_comments: false,
            max_span: 0,
        }
    }

    /// The offset the next chunk region would start at.
    fn cursor(&self) -> u32 {
        self.source.len() as u32
    }

    fn note_span(&mut self, end: u32) {
        self.max_span = self.max_span.max(end);
    }
}

/// Marker callee wrapping a single-target destructuring-assignment collapse
/// (`({ a } = obj)` → `a = obj.a`) so the "this must reprint as a
/// `SequenceExpression`" decision survives the raw-text reparse. Upstream's
/// `visit_assignment_expression` (`shared/assignments.js`) always lowers a
/// destructuring assignment through `b.sequence(assignments)` — an ESTree
/// `SequenceExpression` *unconditionally*, even for a single assignment — and
/// esrap's `SequenceExpression` printer always self-parenthesizes, `(expr)`,
/// regardless of element count. rsvelte's client transform generates this
/// lowering as plain source text; a single-assignment collapse re-parses to a
/// bare (non-sequence) expression, which every downstream printer correctly
/// treats as redundantly parenthesized (matching upstream's behavior for any
/// plain, user-written `(x = 1)`, where the parens really are dropped) and
/// removes — silently losing upstream's parens for the destructuring case.
/// Wrapping the single assignment in a call to this marker keeps the
/// "force sequence" decision attached to the generated text itself;
/// [`Cx::restore_single_target_destructure_sequences`] finds the marker call
/// after reparse and rebuilds the real single-element `SequenceExpression`.
pub(crate) const SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER: &str = "__rsvelte_seq1";

/// Conversion context: holds the oxc [`AstBuilder`] and the IR arena used to
/// resolve [`ExprId`] handles.
struct Cx<'a, 'arena, 'source> {
    ab: AstBuilder<'a>,
    arena: &'arena JsArena,
    islands: &'arena [AstIsland<'source>],
    synth: RefCell<Synth>,
}

impl<'a, 'arena, 'source> Cx<'a, 'arena, 'source> {
    /// Allocate a string into the oxc arena and return it as an `&'a str`,
    /// which satisfies the `Into<Atom<'a>>` / `Into<Str<'a>>` bounds used by
    /// the builder helpers.
    #[inline]
    fn str(&self, s: &str) -> &'a str {
        self.ab.allocator().alloc_str(s)
    }

    /// Resolve an `ExprId` handle and convert the pointed-to expression.
    #[inline]
    fn expr_id(&self, id: ExprId) -> Option<Expression<'a>> {
        self.expr(self.arena.get_expr(id))
    }

    /// Run `f` and report the comment-buffer region it consumed, so a container
    /// node can span the comments its children carry (esrap brackets a body's
    /// leading/trailing comments by the body's own `loc`). [`SPAN`] when the
    /// subtree consumed nothing, i.e. carries no comments.
    fn consumed<T>(&self, f: impl FnOnce() -> Option<T>) -> Option<(T, Span)> {
        let before = self.synth.borrow().cursor();
        let value = f()?;
        let after = self.synth.borrow().cursor();
        let span = if after > before {
            Span::new(before, after)
        } else {
            SPAN
        };
        Some((value, span))
    }

    /// Record a span the printer must NOT read as a chunk location.
    #[inline]
    fn note_span(&self, end: u32) {
        self.synth.borrow_mut().note_span(end);
    }

    /// Attach the region the chunk just parsed occupies to its original-source
    /// offset (for source maps). Returns the region, if any.
    fn take_chunk_region(&self, source_offset: Option<u32>) -> Option<(u32, u32)> {
        let mut synth = self.synth.borrow_mut();
        let region = synth.pending_region.take()?;
        synth.loc_map.push((region.0, region.1, source_offset));
        synth.last_region_source = source_offset;
        Some(region)
    }

    /// The comment-space position of a generated node that upstream anchors to
    /// `source_offset` (esrap's `if (node.loc)` flush point). Sits at the buffer
    /// cursor — past the preceding chunk's region and its closing newline, so a
    /// comment left dangling at that chunk's end is flushed here and followed by
    /// a line break, exactly as upstream flushes it at the next located node.
    /// [`SPAN`] (no location) unless the anchor really does follow the pending
    /// comments in the source, which is the order upstream compares in.
    fn comment_anchor(&self, source_offset: Option<u32>) -> Span {
        let Some(anchor) = source_offset else {
            return SPAN;
        };
        let synth = self.synth.borrow();
        if !synth.enabled || synth.last_region_source.is_none_or(|chunk| anchor <= chunk) {
            return SPAN;
        }
        let at = synth.cursor();
        Span::new(at, at)
    }

    fn trailing_comment_anchor(&self, source_offset: Option<u32>) -> Span {
        let Some(anchor) = source_offset else {
            return SPAN;
        };
        let synth = self.synth.borrow();
        if !synth.enabled
            || !synth.last_region_ends_with_removed_inspect_comment
            || synth.last_region_source.is_none_or(|chunk| anchor <= chunk)
        {
            return SPAN;
        }
        let at = synth.cursor();
        Span::new(at, at)
    }

    // -- statements ---------------------------------------------------------

    fn stmt(&self, stmt: &JsStatement) -> Option<Statement<'a>> {
        match stmt {
            JsStatement::Expression(e) => {
                let expr = self.expr_id(e.expression)?;
                Some(Statement::ExpressionStatement(ExpressionStatement::boxed(
                    SPAN, expr, &self.ab,
                )))
            }
            JsStatement::Return(r) => {
                let arg = match r.argument {
                    Some(id) => Some(self.expr_id(id)?),
                    None => None,
                };
                Some(Statement::ReturnStatement(ReturnStatement::boxed(
                    SPAN, arg, &self.ab,
                )))
            }
            JsStatement::VariableDeclaration(decl) => self.variable_declaration(decl),
            JsStatement::Block(b) => {
                let (stmts, span) = self.statements(&b.body)?;
                Some(Statement::BlockStatement(BlockStatement::boxed(
                    span, stmts, &self.ab,
                )))
            }
            JsStatement::Empty => Some(Statement::EmptyStatement(EmptyStatement::boxed(
                SPAN, &self.ab,
            ))),
            JsStatement::Debugger => Some(Statement::DebuggerStatement(DebuggerStatement::boxed(
                SPAN, &self.ab,
            ))),
            JsStatement::Throw(id) => {
                let arg = self.expr_id(*id)?;
                Some(Statement::ThrowStatement(ThrowStatement::boxed(
                    SPAN, arg, &self.ab,
                )))
            }
            JsStatement::Break(label) => {
                let label = self.label(label.as_deref());
                Some(Statement::BreakStatement(BreakStatement::boxed(
                    SPAN, label, &self.ab,
                )))
            }
            JsStatement::Continue(label) => {
                let label = self.label(label.as_deref());
                Some(Statement::ContinueStatement(ContinueStatement::boxed(
                    SPAN, label, &self.ab,
                )))
            }
            JsStatement::If(if_stmt) => {
                let test = self.expr_id(if_stmt.test)?;
                let consequent = self.stmt(self.arena.get_stmt(if_stmt.consequent))?;
                let alternate = match if_stmt.alternate {
                    Some(id) => Some(self.stmt(self.arena.get_stmt(id))?),
                    None => None,
                };
                Some(Statement::IfStatement(IfStatement::boxed(
                    SPAN, test, consequent, alternate, &self.ab,
                )))
            }
            JsStatement::Import(import) => self.import_declaration(import),
            JsStatement::ExportNamed(export) => self.export_named(export),
            JsStatement::ExportDefault(export) => self.export_default(export),
            JsStatement::FunctionDeclaration(func) => {
                let func = self.build_function(func, FunctionType::FunctionDeclaration)?;
                let decl = oxc_ast::ast::Declaration::FunctionDeclaration(func);
                Some(Statement::from(decl))
            }
            JsStatement::For(for_stmt) => self.for_statement(for_stmt),
            JsStatement::ForOf(for_of) => self.for_of_statement(for_of),
            JsStatement::While(w) => {
                let test = self.expr_id(w.test)?;
                let body = self.stmt(self.arena.get_stmt(w.body))?;
                Some(Statement::WhileStatement(WhileStatement::boxed(
                    SPAN, test, body, &self.ab,
                )))
            }
            JsStatement::DoWhile(d) => {
                let body = self.stmt(self.arena.get_stmt(d.body))?;
                let test = self.expr_id(d.test)?;
                Some(Statement::DoWhileStatement(DoWhileStatement::boxed(
                    SPAN, body, test, &self.ab,
                )))
            }
            JsStatement::Switch(s) => self.switch_statement(s),
            JsStatement::Labeled(l) => {
                let label = LabelIdentifier::new(SPAN, self.str(&l.label), &self.ab);
                let body = self.stmt(self.arena.get_stmt(l.body))?;
                Some(Statement::LabeledStatement(LabeledStatement::boxed(
                    SPAN, label, body, &self.ab,
                )))
            }
            JsStatement::Try(t) => self.try_statement(t),
            // Raw statements at a SINGLE-statement site (if / while / for
            // body): parse the text; a lone statement is returned directly, a
            // multi-statement blob is wrapped in a block. (Statement-LIST sites
            // use `expand_stmt` instead, which flattens inline.)
            JsStatement::Raw(code) => self.raw_single_statement(code, None, false),
            JsStatement::RawEffect(code) => self.raw_single_statement(code, None, true),
            JsStatement::RawMapped {
                code,
                source_offset,
            } => self.raw_single_statement(code, Some(*source_offset), false),
            JsStatement::RawMappedEffect {
                code,
                source_offset,
            } => self.raw_single_statement(code, Some(*source_offset), true),
            JsStatement::RetainedAst { .. } => None,
        }
    }

    /// Convert a `Raw` statement at a single-statement position: one parsed
    /// statement is returned as-is; several are wrapped in a `{ … }` block.
    fn raw_single_statement(
        &self,
        code: &str,
        source_offset: Option<u32>,
        unlocate_effect_calls: bool,
    ) -> Option<Statement<'a>> {
        let stmts = self.parse_raw_statements(code, unlocate_effect_calls)?;
        let region = self.take_chunk_region(source_offset);
        if stmts.len() == 1 {
            stmts.into_iter().next()
        } else {
            let span = region.map_or(SPAN, |(a, b)| Span::new(a, b));
            Some(Statement::BlockStatement(BlockStatement::boxed(
                span,
                ArenaVec::from_iter_in(stmts, &self.ab),
                &self.ab,
            )))
        }
    }

    /// Build a `for (init; test; update) body` statement. Bails on init forms
    /// that cannot be faithfully mapped (e.g. destructuring var-decl bindings).
    fn for_statement(&self, for_stmt: &JsForStatement) -> Option<Statement<'a>> {
        let init = match &for_stmt.init {
            None => None,
            Some(JsForInit::Variable(decl)) => {
                let var_decl = self.variable_declaration_node(decl)?;
                Some(ForStatementInit::VariableDeclaration(var_decl))
            }
            Some(JsForInit::Expression(id)) => {
                let expr = self.expr_id(*id)?;
                Some(ForStatementInit::from(expr))
            }
        };
        let test = match for_stmt.test {
            Some(id) => Some(self.expr_id(id)?),
            None => None,
        };
        let update = match for_stmt.update {
            Some(id) => Some(self.expr_id(id)?),
            None => None,
        };
        let body = self.stmt(self.arena.get_stmt(for_stmt.body))?;
        Some(Statement::ForStatement(ForStatement::boxed(
            SPAN, init, test, update, body, &self.ab,
        )))
    }

    /// Build a `for (left of right)` / `for await (left of right)` statement,
    /// or a `for (left in right)` statement when `is_for_in` is set. Bails on
    /// destructuring / complex left-hand sides.
    fn for_of_statement(&self, for_of: &JsForOfStatement) -> Option<Statement<'a>> {
        let left = match &for_of.left {
            JsForOfLeft::Variable(decl) => {
                let mut var_decl = self.variable_declaration_node(decl)?;
                // A `for (… in/of …)` binding cannot carry an initializer. The IR
                // declarator may hold a spurious `null` init (which the string
                // codegen drops in this position); strip it so we emit
                // `for (const k in obj)`, not `for (const k = null in obj)`.
                for d in var_decl.declarations.iter_mut() {
                    d.init = None;
                }
                ForStatementLeft::VariableDeclaration(var_decl)
            }
            JsForOfLeft::Pattern(pattern) => {
                // Only a plain identifier / simple member assignment target is
                // representable; reuse the assignment-target helper which bails
                // on anything else.
                let target = match pattern {
                    JsPattern::Identifier(name) => {
                        SimpleAssignmentTarget::new_assignment_target_identifier(
                            SPAN,
                            self.str(name),
                            &self.ab,
                        )
                    }
                    _ => return None,
                };
                let assignment_target = oxc_ast::ast::AssignmentTarget::from(target);
                ForStatementLeft::from(assignment_target)
            }
        };
        let right = self.expr_id(for_of.right)?;
        let body = self.stmt(self.arena.get_stmt(for_of.body))?;
        if for_of.is_for_in {
            // `for await (… in …)` is not valid syntax; bail if it appears.
            if for_of.is_await {
                return None;
            }
            Some(Statement::ForInStatement(ForInStatement::boxed(
                SPAN, left, right, body, &self.ab,
            )))
        } else {
            Some(Statement::ForOfStatement(ForOfStatement::boxed(
                SPAN,
                for_of.is_await,
                left,
                right,
                body,
                &self.ab,
            )))
        }
    }

    /// Build a `switch (disc) { case … }` statement.
    fn switch_statement(&self, s: &JsSwitchStatement) -> Option<Statement<'a>> {
        let discriminant = self.expr_id(s.discriminant)?;
        let mut cases = ArenaVec::with_capacity_in(s.cases.len(), &self.ab);
        for case in &s.cases {
            let test = match case.test {
                Some(id) => Some(self.expr_id(id)?),
                None => None,
            };
            let (consequent, span) = self.statements(&case.consequent)?;
            cases.push(SwitchCase::new(span, test, consequent, &self.ab));
        }
        Some(Statement::SwitchStatement(SwitchStatement::boxed(
            SPAN,
            discriminant,
            cases,
            &self.ab,
        )))
    }

    /// Build a `try { } catch (e) { } finally { }` statement. Bails on a
    /// destructuring catch parameter.
    fn try_statement(&self, t: &JsTryStatement) -> Option<Statement<'a>> {
        let (block_stmts, block_span) = self.statements(&t.block.body)?;
        let block = BlockStatement::boxed(block_span, block_stmts, &self.ab);

        let handler = match &t.handler {
            None => None,
            Some(catch) => {
                let param = match &catch.param {
                    None => None,
                    Some(pat) => {
                        let pattern = self.binding_pattern(pat)?;
                        Some(CatchParameter::new(SPAN, pattern, None, &self.ab))
                    }
                };
                let (body_stmts, body_span) = self.statements(&catch.body.body)?;
                let body = BlockStatement::boxed(body_span, body_stmts, &self.ab);
                Some(CatchClause::boxed(body_span, param, body, &self.ab))
            }
        };

        let finalizer = match &t.finalizer {
            None => None,
            Some(block) => {
                let (stmts, span) = self.statements(&block.body)?;
                Some(BlockStatement::boxed(span, stmts, &self.ab))
            }
        };

        Some(Statement::TryStatement(TryStatement::boxed(
            SPAN, block, handler, finalizer, &self.ab,
        )))
    }

    /// Build a module-source `StringLiteral`. Codegen emits the source verbatim
    /// between single quotes with **no escaping** (see `emit_import` /
    /// `emit_export_named`), so we set `raw` to the exact `'source'` spelling to
    /// make esrap reproduce it byte-for-byte regardless of quote options.
    fn module_source(&self, source: &str) -> oxc_ast::ast::StringLiteral<'a> {
        #[cfg(feature = "measure-module-source")]
        crate::measure_module_source::record(source.len());
        // The quoted spelling is built straight into the arena and the unquoted
        // value is a subslice of it, so neither string is copied twice.
        let raw = oxc_allocator::StringBuilder::from_strs_array_in(
            ["'", source, "'"],
            self.ab.allocator(),
        )
        .into_str();
        StringLiteral::new(SPAN, &raw[1..raw.len() - 1], Some(raw.into()), &self.ab)
    }

    /// Build a `ModuleExportName::IdentifierName` from a plain name.
    fn module_export_name(&self, name: &str) -> oxc_ast::ast::ModuleExportName<'a> {
        ModuleExportName::new_identifier_name(SPAN, self.str(name), &self.ab)
    }

    fn import_declaration(&self, import: &JsImportDeclaration) -> Option<Statement<'a>> {
        // A bare side-effect import (`import 'x'`) has no specifiers section.
        // Codegen treats the specifier list as empty when it is empty OR its
        // first entry is `SideEffect`; mirror that to decide `None` vs `Some`.
        let has_specifiers = !import.specifiers.is_empty()
            && !matches!(import.specifiers[0], JsImportSpecifier::SideEffect);

        let specifiers = if has_specifiers {
            let mut specs = ArenaVec::with_capacity_in(import.specifiers.len(), &self.ab);
            for spec in &import.specifiers {
                match spec {
                    JsImportSpecifier::Default(name) => {
                        let local = BindingIdentifier::new(SPAN, self.str(name), &self.ab);
                        specs.push(ImportDeclarationSpecifier::new_import_default_specifier(
                            SPAN, local, &self.ab,
                        ));
                    }
                    JsImportSpecifier::Namespace(name) => {
                        let local = BindingIdentifier::new(SPAN, self.str(name), &self.ab);
                        specs.push(ImportDeclarationSpecifier::new_import_namespace_specifier(
                            SPAN, local, &self.ab,
                        ));
                    }
                    JsImportSpecifier::Named { imported, local } => {
                        let imported = self.module_export_name(imported);
                        let local = BindingIdentifier::new(SPAN, self.str(local), &self.ab);
                        specs.push(ImportDeclarationSpecifier::new_import_specifier(
                            SPAN,
                            imported,
                            local,
                            ImportOrExportKind::Value,
                            &self.ab,
                        ));
                    }
                    // A `SideEffect` specifier alongside real ones would mean
                    // `has_specifiers` is true but a bare side-effect entry is
                    // present; that mixed shape is not representable, so bail.
                    JsImportSpecifier::SideEffect => return None,
                }
            }
            Some(specs)
        } else {
            None
        };

        let source = self.module_source(&import.source);
        let decl = ModuleDeclaration::new_import_declaration(
            SPAN,
            specifiers,
            source,
            None,
            None,
            ImportOrExportKind::Value,
            &self.ab,
        );
        Some(Statement::from(decl))
    }

    fn export_named(&self, export: &JsExportNamed) -> Option<Statement<'a>> {
        // The declaration form (`export const/let/var …`) and the specifier
        // form (`export { a, b as c }`) are mutually exclusive in the IR (only
        // a variable declaration is representable as the declaration form).
        let specifiers = if let Some(decl) = &export.declaration {
            let var_decl = self.variable_declaration_node(decl)?;
            let declaration = oxc_ast::ast::Declaration::VariableDeclaration(var_decl);
            let decl = ModuleDeclaration::new_export_declaration(SPAN, declaration, &self.ab);
            return Some(Statement::from(decl));
        } else {
            let mut specs = ArenaVec::with_capacity_in(export.specifiers.len(), &self.ab);
            for spec in &export.specifiers {
                let local = self.module_export_name(&spec.local);
                let exported = self.module_export_name(&spec.exported);
                specs.push(ExportSpecifier::new(
                    SPAN,
                    local,
                    exported,
                    ImportOrExportKind::Value,
                    &self.ab,
                ));
            }
            specs
        };

        // The IR has no re-export source (`export { x } from 'y'`).
        let decl = ModuleDeclaration::new_export_named_declaration(
            SPAN,
            specifiers,
            ImportOrExportKind::Value,
            &self.ab,
        );
        Some(Statement::from(decl))
    }

    fn export_default(&self, export: &JsExportDefault) -> Option<Statement<'a>> {
        let kind = match &export.declaration {
            JsExportDefaultDeclaration::Function(func) => {
                let func = self.build_function(func, FunctionType::FunctionDeclaration)?;
                oxc_ast::ast::ExportDefaultDeclarationKind::FunctionDeclaration(func)
            }
            JsExportDefaultDeclaration::Expression(id) => {
                let expr = self.expr_id(*id)?;
                oxc_ast::ast::ExportDefaultDeclarationKind::from(expr)
            }
        };
        let decl = ModuleDeclaration::new_export_default_declaration(SPAN, kind, &self.ab);
        Some(Statement::from(decl))
    }

    /// Build a boxed `Function` node from an IR function declaration. Shared by
    /// the `FunctionDeclaration` statement arm and the `export default function`
    /// path. Reuses [`formal_params`] (which bails on destructuring) and
    /// [`statements`] for the body, mirroring the [`function`] expression helper.
    fn build_function(
        &self,
        func: &JsFunctionDeclaration,
        func_type: FunctionType,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::Function<'a>>> {
        let id = func
            .id
            .as_ref()
            .map(|name| BindingIdentifier::new(SPAN, self.str(name), &self.ab));
        let params = self.formal_params(&func.params)?;
        let (stmts, span) = self.statements(&func.body.body)?;
        let body = FunctionBody::new(span, ArenaVec::new_in(&self.ab), stmts, &self.ab);
        Some(Function::boxed(
            SPAN,
            func_type,
            id,
            func.is_generator,
            func.is_async,
            false,
            None,
            None,
            ArenaBox::new_in(params, &self.ab),
            None,
            Some(ArenaBox::new_in(body, &self.ab)),
            &self.ab,
        ))
    }

    /// Convert a slice of IR statements into an arena `Vec`, bailing on any
    /// unhandled statement. The span is the comment-buffer region the statements
    /// consumed, which their container must carry (see [`Cx::consumed`]).
    fn statements(&self, body: &[JsStatement]) -> Option<(ArenaVec<'a, Statement<'a>>, Span)> {
        self.consumed(|| {
            let mut v: Vec<Statement<'a>> = Vec::with_capacity(body.len());
            for s in body {
                v.extend(self.expand_stmt(s)?);
            }
            Some(ArenaVec::from_iter_in(v, &self.ab))
        })
    }

    /// Build an optional `LabelIdentifier` for `break`/`continue` labels.
    fn label(&self, name: Option<&str>) -> Option<oxc_ast::ast::LabelIdentifier<'a>> {
        name.map(|n| LabelIdentifier::new(SPAN, self.str(n), &self.ab))
    }

    fn variable_declaration(&self, decl: &JsVariableDeclaration) -> Option<Statement<'a>> {
        let var_decl = self.variable_declaration_node(decl)?;
        Some(Statement::VariableDeclaration(var_decl))
    }

    /// Build a boxed [`VariableDeclaration`] node from the IR. Shared by the
    /// `VariableDeclaration` statement arm, the `ExportNamed` declaration path,
    /// and the `for (let … ; …)` / `for (… of …)` loop initializers. Bails on
    /// destructuring binding patterns (only plain identifiers handled here).
    fn variable_declaration_node(
        &self,
        decl: &JsVariableDeclaration,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::VariableDeclaration<'a>>> {
        let kind = match decl.kind {
            JsVariableKind::Var => VariableDeclarationKind::Var,
            JsVariableKind::Let => VariableDeclarationKind::Let,
            JsVariableKind::Const => VariableDeclarationKind::Const,
        };

        let mut declarators = ArenaVec::with_capacity_in(decl.declarations.len(), &self.ab);
        let declaration_span = self.trailing_comment_anchor(
            decl.declarations
                .first()
                .and_then(|declarator| declarator.comment_anchor),
        );
        for d in &decl.declarations {
            // Identifier or destructuring binding pattern; `binding_pattern`
            // bails on anything it cannot faithfully reproduce.
            let binding = self.binding_pattern(&d.id)?;
            let init = match d.init {
                Some(id) => Some(self.expr_id(id)?),
                None => None,
            };
            let span = if declaration_span == SPAN {
                self.comment_anchor(d.comment_anchor)
            } else {
                SPAN
            };
            declarators.push(VariableDeclarator::new(
                span, binding, None, init, false, &self.ab,
            ));
        }

        Some(VariableDeclaration::boxed(
            declaration_span,
            kind,
            declarators,
            false,
            &self.ab,
        ))
    }

    // -- binding patterns ---------------------------------------------------

    /// Build an oxc [`BindingPattern`] from an IR [`JsPattern`], recursing into
    /// object / array / assignment / rest sub-patterns. Returns `None` (so the
    /// whole conversion falls back to string codegen) on anything that cannot be
    /// faithfully reproduced: a top-level bare `Rest` (only valid nested inside
    /// an object / array, handled there), a rest property/element that is not
    /// last, or any computed object-pattern key (which we cannot reconstruct
    /// structurally).
    fn binding_pattern(&self, pat: &JsPattern) -> Option<oxc_ast::ast::BindingPattern<'a>> {
        match pat {
            JsPattern::Identifier(name) => Some(BindingPattern::new_binding_identifier(
                SPAN,
                self.str(name),
                &self.ab,
            )),
            JsPattern::Object(obj) => {
                let mut props = ArenaVec::with_capacity_in(obj.properties.len(), &self.ab);
                let mut rest: Option<oxc_allocator::Box<'a, oxc_ast::ast::BindingRestElement<'a>>> =
                    None;
                let last = obj.properties.len().saturating_sub(1);
                for (i, member) in obj.properties.iter().enumerate() {
                    match member {
                        JsObjectPatternProperty::Property {
                            key,
                            value,
                            computed,
                            shorthand,
                        } => {
                            let key = if *computed {
                                // A computed key holds an arbitrary expression;
                                // only `JsPropertyKey::Computed` is meaningful.
                                match key {
                                    JsPropertyKey::Computed(id) => {
                                        let expr = self.expr_id(*id)?;
                                        PropertyKey::from(expr)
                                    }
                                    _ => return None,
                                }
                            } else {
                                self.property_key(key)?
                            };
                            let value = self.binding_pattern(value)?;
                            props.push(BindingProperty::new(
                                SPAN, key, value, *shorthand, *computed, &self.ab,
                            ));
                        }
                        JsObjectPatternProperty::Rest(inner) => {
                            // A rest property must be the last entry.
                            if i != last {
                                return None;
                            }
                            let inner = self.binding_pattern(inner)?;
                            rest = Some(BindingRestElement::boxed(SPAN, inner, &self.ab));
                        }
                    }
                }
                Some(BindingPattern::new_object_pattern(
                    SPAN, props, rest, &self.ab,
                ))
            }
            JsPattern::Array(arr) => {
                let mut elements = ArenaVec::with_capacity_in(arr.elements.len(), &self.ab);
                let mut rest: Option<oxc_allocator::Box<'a, oxc_ast::ast::BindingRestElement<'a>>> =
                    None;
                let last = arr.elements.len().saturating_sub(1);
                for (i, el) in arr.elements.iter().enumerate() {
                    match el {
                        None => elements.push(None),
                        Some(JsPattern::Rest(inner)) => {
                            // A rest element must be the last element.
                            if i != last {
                                return None;
                            }
                            let inner = self.binding_pattern(inner)?;
                            rest = Some(BindingRestElement::boxed(SPAN, inner, &self.ab));
                        }
                        Some(el) => elements.push(Some(self.binding_pattern(el)?)),
                    }
                }
                Some(BindingPattern::new_array_pattern(
                    SPAN, elements, rest, &self.ab,
                ))
            }
            JsPattern::Assignment(JsAssignmentPattern { left, right }) => {
                let left = self.binding_pattern(left)?;
                let right = self.expr_id(*right)?;
                Some(BindingPattern::new_assignment_pattern(
                    SPAN, left, right, &self.ab,
                ))
            }
            // A bare `Rest` only ever appears nested inside an object / array
            // pattern (handled above) or as the last function parameter (handled
            // in `formal_params`); reaching it directly is not representable.
            JsPattern::Rest(_) => None,
        }
    }

    // -- expressions --------------------------------------------------------

    fn expr(&self, expr: &JsExpr) -> Option<Expression<'a>> {
        match expr {
            JsExpr::Identifier(name) => {
                Some(Expression::new_identifier(SPAN, self.str(name), &self.ab))
            }
            JsExpr::OpaqueIdentifier(name) => {
                Some(Expression::new_identifier(SPAN, self.str(name), &self.ab))
            }
            JsExpr::Literal(lit) => self.literal(lit),
            JsExpr::This => Some(Expression::ThisExpression(ThisExpression::boxed(
                SPAN, &self.ab,
            ))),
            JsExpr::Super => Some(Expression::Super(Super::boxed(SPAN, &self.ab))),
            JsExpr::MetaProperty(meta, _property) => {
                // oxc 0.141 split `MetaProperty` into `ImportMeta` / `NewTarget`;
                // the meta keyword (`import` vs `new`) selects the variant.
                Some(if meta.as_str() == "new" {
                    Expression::new_new_target(SPAN, &self.ab)
                } else {
                    Expression::new_import_meta(SPAN, &self.ab)
                })
            }
            JsExpr::Member(m) => self.member(m),
            JsExpr::Call(c) => {
                let callee = self.expr_id(c.callee)?;
                let args = self.arguments(&c.arguments)?;
                Some(Expression::CallExpression(CallExpression::boxed(
                    SPAN, callee, None, args, c.optional, &self.ab,
                )))
            }
            JsExpr::New(n) => {
                let callee = self.expr_id(n.callee)?;
                let args = self.arguments(&n.arguments)?;
                Some(Expression::NewExpression(NewExpression::boxed(
                    SPAN, callee, None, args, &self.ab,
                )))
            }
            JsExpr::Binary(b) => {
                let left = self.expr_id(b.left)?;
                let right = self.expr_id(b.right)?;
                Some(Expression::BinaryExpression(BinaryExpression::boxed(
                    SPAN,
                    left,
                    binary_op(b.operator),
                    right,
                    &self.ab,
                )))
            }
            JsExpr::Logical(l) => {
                let left = self.expr_id(l.left)?;
                let right = self.expr_id(l.right)?;
                Some(Expression::LogicalExpression(LogicalExpression::boxed(
                    SPAN,
                    left,
                    logical_op(l.operator),
                    right,
                    &self.ab,
                )))
            }
            JsExpr::Unary(u) => {
                let arg = self.expr_id(u.argument)?;
                Some(Expression::UnaryExpression(UnaryExpression::boxed(
                    SPAN,
                    unary_op(u.operator),
                    arg,
                    &self.ab,
                )))
            }
            JsExpr::Conditional(c) => {
                let test = self.expr_id(c.test)?;
                let consequent = self.expr_id(c.consequent)?;
                let alternate = self.expr_id(c.alternate)?;
                Some(Expression::ConditionalExpression(
                    ConditionalExpression::boxed(SPAN, test, consequent, alternate, &self.ab),
                ))
            }
            JsExpr::Sequence(s) => {
                let mut exprs = ArenaVec::with_capacity_in(s.expressions.len(), &self.ab);
                for e in &s.expressions {
                    exprs.push(self.expr(e)?);
                }
                Some(Expression::SequenceExpression(SequenceExpression::boxed(
                    SPAN, exprs, &self.ab,
                )))
            }
            JsExpr::Array(a) => {
                let mut elements = ArenaVec::with_capacity_in(a.elements.len(), &self.ab);
                for el in &a.elements {
                    let element = match el {
                        None => ArrayExpressionElement::new_elision(SPAN, &self.ab),
                        Some(JsExpr::Spread(inner)) => {
                            // `[...x]` — spread element inside an array.
                            let inner = self.expr_id(*inner)?;
                            ArrayExpressionElement::SpreadElement(SpreadElement::boxed(
                                SPAN, inner, &self.ab,
                            ))
                        }
                        Some(e) => ArrayExpressionElement::from(self.expr(e)?),
                    };
                    elements.push(element);
                }
                Some(Expression::ArrayExpression(ArrayExpression::boxed(
                    SPAN, elements, &self.ab,
                )))
            }
            JsExpr::Object(o) => self.object(o),
            JsExpr::Spread(inner) => {
                // A bare spread expression is only valid as an array element or
                // argument, which are handled at their use sites. Reaching this
                // arm means a spread appeared in an unexpected position; bail.
                let _ = inner;
                None
            }
            JsExpr::Await(id) => {
                let arg = self.expr_id(*id)?;
                Some(Expression::AwaitExpression(AwaitExpression::boxed(
                    SPAN, arg, &self.ab,
                )))
            }
            JsExpr::Void(id) => {
                let arg = self.expr_id(*id)?;
                Some(Expression::UnaryExpression(UnaryExpression::boxed(
                    SPAN,
                    UnaryOperator::Void,
                    arg,
                    &self.ab,
                )))
            }
            JsExpr::Arrow(arrow) => self.arrow(arrow),
            JsExpr::TemplateLiteral(tpl) => {
                let tpl = self.template_literal(tpl)?;
                Some(Expression::TemplateLiteral(ArenaBox::new_in(tpl, &self.ab)))
            }
            JsExpr::TaggedTemplate(t) => {
                let tag = self.expr_id(t.tag)?;
                let quasi = self.template_literal(&t.quasi)?;
                Some(Expression::TaggedTemplateExpression(
                    TaggedTemplateExpression::boxed(SPAN, tag, None, quasi, &self.ab),
                ))
            }
            JsExpr::Assignment(a) => {
                let left = self.assignment_target(self.arena.get_expr(a.left))?;
                let right = self.expr_id(a.right)?;
                Some(Expression::AssignmentExpression(
                    AssignmentExpression::boxed(
                        SPAN,
                        assignment_op(a.operator),
                        left,
                        right,
                        &self.ab,
                    ),
                ))
            }
            JsExpr::Update(u) => {
                let target = self.simple_assignment_target(self.arena.get_expr(u.argument))?;
                Some(Expression::UpdateExpression(UpdateExpression::boxed(
                    SPAN,
                    update_op(u.operator),
                    u.prefix,
                    target,
                    &self.ab,
                )))
            }
            JsExpr::Chain(chain) => self.chain(chain),
            JsExpr::ImportExpression { source, options } => {
                let source = self.expr_id(*source)?;
                let options = match options {
                    Some(id) => Some(self.expr_id(*id)?),
                    None => None,
                };
                // `phase` (`import.defer` / `import.source`) is not represented
                // in the IR; pass `None`.
                Some(Expression::ImportExpression(ImportExpression::boxed(
                    SPAN, source, options, None, &self.ab,
                )))
            }
            JsExpr::Function(func) => self.function(func),
            JsExpr::Yield(y) => {
                let argument = match y.argument {
                    Some(id) => Some(self.expr_id(id)?),
                    None => None,
                };
                Some(Expression::YieldExpression(YieldExpression::boxed(
                    SPAN, y.delegate, argument, &self.ab,
                )))
            }
            JsExpr::Class(class) => self.class(class),
            // `Spanned` wraps a real inner expression with the original-source
            // byte span (start, end). Convert the inner expression and stamp its
            // span so esrap's `print_with_map` maps it back to the user source.
            JsExpr::Spanned(inner, start, end) => {
                let mut e = self.expr_id(*inner)?;
                *e.span_mut() = Span::new(*start, *end);
                self.note_span(*end);
                Some(e)
            }
            // `Raw` carries opaque JS expression text. Parse it into a real oxc
            // expression so esrap can print it canonically (the text is
            // semantically what the official compiler emits, so the round-trip is
            // byte-identical after esrap normalization).
            JsExpr::Raw(code) => self.parse_raw_expression(code),
        }
    }

    /// Parse a raw JS expression source string into an oxc [`Expression`].
    /// Wraps in `( … )` so a leading `{`/`function` parses as an expression, then
    /// strips the synthetic parens. Returns `None` on a parse error.
    fn parse_raw_expression(&self, code: &str) -> Option<Expression<'a>> {
        let wrapped = format!("({})", code.trim());
        let mut stmts = self.parse_chunk(&wrapped)?;
        self.restore_single_target_destructure_sequences(&mut stmts);
        // The synthetic parens are part of the chunk text, so the region already
        // covers them; no caller needs it for an expression.
        self.take_chunk_region(None);
        for stmt in stmts {
            if let Statement::ExpressionStatement(es) = stmt {
                let e = es.unbox().expression;
                // Strip exactly ONE layer — the wrapper added above. Any further
                // `ParenthesizedExpression` belongs to the chunk text itself.
                return Some(match e {
                    Expression::ParenthesizedExpression(p) => p.unbox().expression,
                    other => other,
                });
            }
        }
        None
    }

    /// Parse a raw JS statement source string into a vec of oxc [`Statement`]s
    /// (`Raw` may hold several statements). Returns `None` on a parse error.
    fn parse_raw_statements(
        &self,
        code: &str,
        unlocate_effect_calls: bool,
    ) -> Option<Vec<Statement<'a>>> {
        let mut stmts = self.parse_chunk(code.trim())?;
        self.restore_legacy_pre_effect_deps(&mut stmts);
        self.restore_single_target_destructure_sequences(&mut stmts);
        if unlocate_effect_calls {
            erase_generated_effect_call_locs(&mut stmts);
        }
        Some(stmts)
    }

    /// Upstream builds the `$.legacy_pre_effect` dependency thunk as
    /// `b.thunk(b.sequence(deps))`, and esrap prints a `SequenceExpression` with
    /// parentheses even for a single element — so a one-dependency thunk prints
    /// as `() => (dep)`. Re-parsing that generated text yields a
    /// `ParenthesizedExpression`, which the printer drops (as esrap must, since
    /// acorn elides source parens); rebuild the sequence so the parens survive.
    fn restore_legacy_pre_effect_deps(&self, stmts: &mut [Statement<'a>]) {
        for stmt in stmts {
            let Statement::ExpressionStatement(es) = stmt else {
                continue;
            };
            let Expression::CallExpression(call) = &mut es.expression else {
                continue;
            };
            if !is_dollar_call(&call.callee, "legacy_pre_effect") {
                continue;
            }
            let Some(Argument::ArrowFunctionExpression(arrow)) = call.arguments.first_mut() else {
                continue;
            };
            let Some(body) = arrow.get_expression_mut() else {
                continue;
            };
            // A multi-dependency thunk re-parses as `Paren(Sequence)`, which the
            // printer already prints with the sequence's own parens.
            let single = matches!(&*body, Expression::ParenthesizedExpression(p)
                if !matches!(p.expression, Expression::SequenceExpression(_)));
            if !single {
                continue;
            }
            // `SPAN` mirrors upstream, where this node is builder-made and so
            // carries no `loc` for the printer to place comments against.
            body.replace_with(|e| {
                let Expression::ParenthesizedExpression(p) = e else {
                    unreachable!()
                };
                Expression::SequenceExpression(SequenceExpression::boxed(
                    SPAN,
                    ArenaVec::from_value_in(p.unbox().expression, &self.ab),
                    &self.ab,
                ))
            });
        }
    }

    /// See [`SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER`]. Unlike
    /// [`Cx::restore_legacy_pre_effect_deps`] (which only ever sits at the top
    /// of its own dedicated chunk), a destructuring-assignment collapse can be
    /// nested arbitrarily deep (inside a function body, a block, another
    /// expression, …), so this walks the whole chunk rather than just its
    /// top-level statements.
    fn restore_single_target_destructure_sequences(&self, stmts: &mut [Statement<'a>]) {
        let mut rebuilder = SingleTargetSequenceRebuilder { ab: &self.ab };
        for stmt in stmts {
            rebuilder.visit_statement(stmt);
        }
    }

    /// Parse one opaque chunk of generated JS. A comment-free chunk parses in
    /// place, exactly as before. A comment-bearing chunk is re-parsed from a
    /// `pad + text` buffer so its spans land at the chunk's own region of the
    /// unified comment buffer, and its comments are collected there.
    fn parse_chunk(&self, text: &str) -> Option<Vec<Statement<'a>>> {
        let removed_inspect = text.contains("/* $$inspect_removed$$ */");
        let text = text.replace("/* $$inspect_removed$$ */", "");
        let owned = self.ab.allocator().alloc_str(&text);
        let ret = oxc_parser::Parser::new(self.ab.allocator(), owned, oxc_span::SourceType::mjs())
            .parse();
        if !ret.diagnostics.is_empty() {
            note_fallback("chunk-parse");
            return None;
        }
        if ret.program.comments.is_empty() {
            // Chunk-local spans stay below `loc_base`, so they read as "no
            // location"; record the bound the second pass has to clear.
            self.note_span(text.len() as u32);
            return Some(ret.program.body.into_iter().collect());
        }
        self.synth.borrow_mut().saw_comments = true;
        if !self.synth.borrow().enabled {
            // Probe pass: the comments are dropped here, but the result is
            // discarded — it only tells the driver a second pass is needed.
            self.note_span(text.len() as u32);
            return Some(ret.program.body.into_iter().collect());
        }

        // `base` is at least `loc_base` (>= 2): this path only runs once
        // placement is enabled, and `Synth::new` seeded `source` with the pad.
        let base = self.synth.borrow().cursor();
        // One byte of pad reproduces the lexical context the chunk has in the
        // unified buffer — its region always starts right after a newline — and
        // the spans are moved into that region below. Padding with `base` real
        // spaces instead would make every chunk re-lex the whole buffer before
        // it, which is quadratic in the generated code size.
        let mut padded = String::with_capacity(1 + text.len());
        padded.push('\n');
        padded.push_str(&text);
        let owned = self.ab.allocator().alloc_str(&padded);
        let ret = oxc_parser::Parser::new(self.ab.allocator(), owned, oxc_span::SourceType::mjs())
            .parse();
        if !ret.diagnostics.is_empty() {
            note_fallback("chunk-parse");
            return None;
        }
        let shift = base - 1;
        let mut stmts: Vec<Statement<'a>> = ret.program.body.into_iter().collect();
        let mut shifter = ShiftSpans(shift);
        for stmt in &mut stmts {
            shifter.visit_statement(stmt);
        }
        let mut synth = self.synth.borrow_mut();
        synth.source.push_str(&text);
        synth.source.push('\n');
        synth
            .comments
            .extend(ret.program.comments.iter().map(|comment| {
                let mut comment = *comment;
                comment.span.start += shift;
                comment.span.end += shift;
                comment.attached_to += shift;
                comment
            }));
        synth.pending_region = Some((base, base + text.len() as u32));
        synth.last_region_ends_with_removed_inspect_comment = removed_inspect
            && ret
                .program
                .comments
                .last()
                .is_some_and(|comment| text[comment.span.end as usize - 1..].trim().is_empty());
        drop(synth);
        Some(stmts)
    }

    /// Expand one IR statement into its oxc statements — a `Raw`/`RawMapped`
    /// expands to (possibly several) parsed statements, every other variant to a
    /// single converted statement. Used at statement-LIST sites (program body,
    /// block bodies) so a multi-statement `Raw` flattens inline.
    fn expand_stmt(&self, stmt: &JsStatement) -> Option<Vec<Statement<'a>>> {
        match stmt {
            JsStatement::RetainedAst { index, .. } => {
                let island = self.islands.get(*index)?;
                if !island.program.program().comments.is_empty() {
                    return None;
                }
                let program = island
                    .program
                    .clone_program_into_at(self.ab.allocator(), island.source_offset);
                Some(program.body.into_iter().collect())
            }
            JsStatement::Raw(code) => {
                let stmts = self.parse_raw_statements(code, false)?;
                self.take_chunk_region(None);
                Some(stmts)
            }
            JsStatement::RawEffect(code) => {
                let stmts = self.parse_raw_statements(code, true)?;
                self.take_chunk_region(None);
                Some(stmts)
            }
            JsStatement::RawMapped {
                code,
                source_offset,
            } => {
                let mut stmts = self.parse_raw_statements(code, false)?;
                if self.take_chunk_region(Some(*source_offset)).is_some() {
                    // The chunk's own spans are its comment anchors; the source
                    // offset is carried by the region's `loc_map` entry instead.
                    return Some(stmts);
                }
                // Stamp each statement with the original-source offset so esrap's
                // `print_with_map` maps the (transformed) instance-script lines
                // back to the user source — mirroring the text codegen's
                // per-block `source_offset` line mapping.
                let sp = Span::new(*source_offset, *source_offset);
                for s in &mut stmts {
                    *s.span_mut() = sp;
                }
                self.note_span(*source_offset);
                Some(stmts)
            }
            JsStatement::RawMappedEffect {
                code,
                source_offset,
            } => {
                let mut stmts = self.parse_raw_statements(code, true)?;
                if self.take_chunk_region(Some(*source_offset)).is_some() {
                    return Some(stmts);
                }
                let sp = Span::new(*source_offset, *source_offset);
                for s in &mut stmts {
                    *s.span_mut() = sp;
                }
                self.note_span(*source_offset);
                Some(stmts)
            }
            other => Some(vec![self.stmt(other)?]),
        }
    }

    /// Build a `class … { … }` expression from the IR. Mirrors codegen's
    /// [`emit_class_expression`] / [`emit_class_member`] exactly so the esrap
    /// output stays byte-identical.
    ///
    /// Handles the `id`, `extends` (super class), method members (constructor /
    /// method / getter / setter, static or instance, computed or plain keys),
    /// and field members (`static`/instance, computed or plain, with or without
    /// an initializer). **Bails** (`None`) on static blocks (codegen emits them
    /// but the structural printer cannot reproduce them faithfully here) and on
    /// any computed key shape or member value that cannot be faithfully mapped.
    fn class(&self, class: &JsClassExpression) -> Option<Expression<'a>> {
        use oxc_ast::ast::{
            ClassType, MethodDefinitionKind, MethodDefinitionType, PropertyDefinitionType,
        };

        let id = class
            .id
            .as_ref()
            .map(|name| BindingIdentifier::new(SPAN, self.str(name), &self.ab));

        let super_class = match class.super_class {
            Some(id) => Some(self.expr_id(id)?),
            None => None,
        };

        let mut elements = ArenaVec::with_capacity_in(class.body.body.len(), &self.ab);
        for member in &class.body.body {
            match member {
                JsClassMember::Method(method) => {
                    let kind = match method.kind {
                        JsMethodKind::Constructor => MethodDefinitionKind::Constructor,
                        JsMethodKind::Method => MethodDefinitionKind::Method,
                        JsMethodKind::Get => MethodDefinitionKind::Get,
                        JsMethodKind::Set => MethodDefinitionKind::Set,
                    };
                    let key = self.class_member_key(&method.key, method.computed)?;
                    // The method value is a (non-arrow) function expression; build
                    // a boxed `Function` with `FunctionType::FunctionExpression`,
                    // bailing on any param / body shape that cannot be reproduced.
                    let value = self.method_function(&method.value)?;
                    elements.push(ClassElement::new_method_definition(
                        SPAN,
                        MethodDefinitionType::MethodDefinition,
                        ArenaVec::new_in(&self.ab),
                        key,
                        value,
                        kind,
                        method.computed,
                        method.is_static,
                        false,
                        false,
                        None,
                        &self.ab,
                    ));
                }
                JsClassMember::Property(prop) => {
                    let key = self.class_member_key(&prop.key, prop.computed)?;
                    let value = match prop.value {
                        Some(id) => Some(self.expr_id(id)?),
                        None => None,
                    };
                    elements.push(ClassElement::new_property_definition(
                        SPAN,
                        PropertyDefinitionType::PropertyDefinition,
                        ArenaVec::new_in(&self.ab),
                        key,
                        None,
                        value,
                        prop.computed,
                        prop.is_static,
                        false,
                        false,
                        false,
                        false,
                        false,
                        None,
                        &self.ab,
                    ));
                }
                // Static blocks (and any future member kind) are not reproducible
                // by the structural printer; bail the whole class.
                JsClassMember::StaticBlock(_) => return None,
            }
        }

        let body = ClassBody::boxed(SPAN, elements, &self.ab);
        Some(Expression::ClassExpression(Class::boxed(
            SPAN,
            ClassType::ClassExpression,
            ArenaVec::new_in(&self.ab),
            id,
            None,
            super_class.map(|expression| ClassHeritage {
                expression,
                type_arguments: None,
            }),
            ArenaVec::new_in(&self.ab),
            body,
            false,
            false,
            &self.ab,
        )))
    }

    /// Build a class member's [`PropertyKey`]. A computed key holds an arbitrary
    /// expression (only `JsPropertyKey::Computed` is meaningful there); a plain
    /// key reuses [`property_key`] (identifier / literal). Bails on a computed
    /// shape that is not a `Computed` expression.
    fn class_member_key(&self, key: &JsPropertyKey, computed: bool) -> Option<PropertyKey<'a>> {
        if computed {
            match key {
                JsPropertyKey::Computed(id) => {
                    let expr = self.expr_id(*id)?;
                    Some(PropertyKey::from(expr))
                }
                _ => None,
            }
        } else {
            self.property_key(key)
        }
    }

    /// Build a boxed `Function` from an IR [`JsFunctionExpression`] used as a
    /// class method value. Mirrors [`function`] but returns the boxed node the
    /// method-definition builder expects. Bails (via [`formal_params`] /
    /// [`statements`]) on any param or body shape that cannot be reproduced.
    fn method_function(
        &self,
        func: &JsFunctionExpression,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::Function<'a>>> {
        let id = func
            .id
            .as_ref()
            .map(|name| BindingIdentifier::new(SPAN, self.str(name), &self.ab));
        let params = self.formal_params(&func.params)?;
        let (stmts, span) = self.statements(&func.body.body)?;
        let body = FunctionBody::new(span, ArenaVec::new_in(&self.ab), stmts, &self.ab);
        Some(Function::boxed(
            SPAN,
            FunctionType::FunctionExpression,
            id,
            func.is_generator,
            func.is_async,
            false,
            None,
            None,
            ArenaBox::new_in(params, &self.ab),
            None,
            Some(ArenaBox::new_in(body, &self.ab)),
            &self.ab,
        ))
    }

    fn literal(&self, lit: &JsLiteral) -> Option<Expression<'a>> {
        match lit {
            JsLiteral::String(s) => Some(Expression::new_string_literal(
                SPAN,
                self.str(s),
                None,
                &self.ab,
            )),
            JsLiteral::Number(n) => Some(Expression::new_numeric_literal(
                SPAN,
                *n,
                None,
                NumberBase::Decimal,
                &self.ab,
            )),
            JsLiteral::RawString { value, raw } => Some(Expression::new_string_literal(
                SPAN,
                self.str(value),
                Some(self.str(raw).into()),
                &self.ab,
            )),
            JsLiteral::RawNumber { value, raw } => Some(Expression::new_numeric_literal(
                SPAN,
                *value,
                Some(self.str(raw).into()),
                NumberBase::Decimal,
                &self.ab,
            )),
            JsLiteral::BigInt(raw) => {
                // The IR stores the raw source spelling including the trailing
                // `n` (e.g. `123n`). esrap prints from the raw text, but the
                // builder's `value` field expects base-10 digits with no
                // suffix; strip the trailing `n` for the value.
                let value = raw.strip_suffix('n').unwrap_or(raw);
                Some(Expression::new_big_int_literal(
                    SPAN,
                    self.str(value),
                    None,
                    BigintBase::Decimal,
                    &self.ab,
                ))
            }
            JsLiteral::Boolean(b) => Some(Expression::new_boolean_literal(SPAN, *b, &self.ab)),
            JsLiteral::Null => Some(Expression::new_null_literal(SPAN, &self.ab)),
            JsLiteral::Undefined => Some(Expression::new_identifier(SPAN, "undefined", &self.ab)),
            JsLiteral::Regex { pattern, flags } => {
                // Build the flags bitset faithfully from the source spelling;
                // bail on any unrecognised flag character so we never guess.
                let mut flag_bits = RegExpFlags::empty();
                for ch in flags.chars() {
                    flag_bits |= RegExpFlags::try_from(ch).ok()?;
                }
                let regex = RegExp {
                    pattern: RegExpPattern {
                        text: self.str(pattern).into(),
                        pattern: None,
                    },
                    flags: flag_bits,
                };
                // esrap prints `raw` verbatim when present, so emit the exact
                // `/pattern/flags` source spelling.
                let raw = self.str(&format!("/{pattern}/{flags}"));
                Some(Expression::new_reg_exp_literal(
                    SPAN,
                    regex,
                    Some(raw.into()),
                    &self.ab,
                ))
            }
        }
    }

    fn member(&self, m: &JsMemberExpression) -> Option<Expression<'a>> {
        Some(Expression::from(self.member_expr(m)?))
    }

    /// Build a [`MemberExpression`] node from the IR member expression. Shared
    /// by the `Member` expression arm and the assignment-target helper.
    fn member_expr(&self, m: &JsMemberExpression) -> Option<oxc_ast::ast::MemberExpression<'a>> {
        let object = self.expr_id(m.object)?;
        let member = match &m.property {
            JsMemberProperty::Identifier(name) => {
                let property = IdentifierName::new(SPAN, self.str(name), &self.ab);
                MemberExpression::StaticMemberExpression(StaticMemberExpression::boxed(
                    SPAN, object, property, m.optional, &self.ab,
                ))
            }
            JsMemberProperty::Expression(id) => {
                let property = self.expr_id(*id)?;
                MemberExpression::ComputedMemberExpression(ComputedMemberExpression::boxed(
                    SPAN, object, property, m.optional, &self.ab,
                ))
            }
            JsMemberProperty::PrivateIdentifier(name) => {
                // The IR stores the bare name (no leading `#`, matching the
                // ESTree `PrivateIdentifier.name` convention); codegen and the
                // esrap printer both add the `#`, so pass the name verbatim.
                let field = PrivateIdentifier::new(SPAN, self.str(name), &self.ab);
                MemberExpression::new_private_field_expression(
                    SPAN, object, field, m.optional, &self.ab,
                )
            }
        };
        Some(member)
    }

    /// Build a [`TemplateLiteral`] node from the IR template literal. Shared by
    /// the `TemplateLiteral` and `TaggedTemplate` expression arms.
    fn template_literal(
        &self,
        tpl: &JsTemplateLiteral,
    ) -> Option<oxc_ast::ast::TemplateLiteral<'a>> {
        let mut quasis = ArenaVec::with_capacity_in(tpl.quasis.len(), &self.ab);
        for q in &tpl.quasis {
            let value = oxc_ast::ast::TemplateElementValue {
                raw: self.str(&q.raw).into(),
                cooked: Some(self.str(&q.cooked).into()),
            };
            quasis.push(TemplateElement::new(SPAN, value, q.tail, &self.ab));
        }
        let mut expressions = ArenaVec::with_capacity_in(tpl.expressions.len(), &self.ab);
        for e in &tpl.expressions {
            expressions.push(self.expr(e)?);
        }
        Some(TemplateLiteral::new(SPAN, quasis, expressions, &self.ab))
    }

    /// Build a [`SimpleAssignmentTarget`] from an IR expression used as an
    /// assignment / update target. Only a plain identifier or a simple
    /// (non-optional) member expression are supported; bail on anything else.
    fn simple_assignment_target(
        &self,
        expr: &JsExpr,
    ) -> Option<oxc_ast::ast::SimpleAssignmentTarget<'a>> {
        match expr {
            JsExpr::Identifier(name) => {
                Some(SimpleAssignmentTarget::new_assignment_target_identifier(
                    SPAN,
                    self.str(name),
                    &self.ab,
                ))
            }
            JsExpr::Member(m) if !m.optional => {
                let member = self.member_expr(m)?;
                Some(oxc_ast::ast::SimpleAssignmentTarget::from(member))
            }
            _ => None,
        }
    }

    /// Build a full [`AssignmentTarget`] from an IR expression used as an
    /// assignment / for-of left-hand side. This is a SEPARATE type system from
    /// binding patterns: identifiers and members reuse [`simple_assignment_target`],
    /// while `[a, b] = …` / `{ a } = …` destructuring lowers to the dedicated
    /// `ArrayAssignmentTarget` / `ObjectAssignmentTarget` pattern variants.
    ///
    /// The IR represents the destructuring LHS as a `JsExpr::Array` /
    /// `JsExpr::Object` used in pattern position (codegen just `emit_expression`s
    /// it), with holes as `None` array elements, rest as `JsExpr::Spread`, and
    /// defaults as a nested `JsExpr::Assignment`. **Bails** (`None`) on anything
    /// that cannot be faithfully reproduced: a non-last rest, a spread inside an
    /// object target, a computed object-pattern key we cannot reconstruct, a
    /// getter / setter / method object member, or any nested target shape that
    /// itself bails.
    fn assignment_target(&self, expr: &JsExpr) -> Option<oxc_ast::ast::AssignmentTarget<'a>> {
        match expr {
            JsExpr::Array(arr) => {
                let mut elements = ArenaVec::with_capacity_in(arr.elements.len(), &self.ab);
                let mut rest: Option<
                    oxc_allocator::Box<'a, oxc_ast::ast::AssignmentTargetRest<'a>>,
                > = None;
                let last = arr.elements.len().saturating_sub(1);
                for (i, el) in arr.elements.iter().enumerate() {
                    match el {
                        None => elements.push(None),
                        Some(JsExpr::Spread(inner)) => {
                            // A rest element must be the last element.
                            if i != last {
                                return None;
                            }
                            let target = self.assignment_target(self.arena.get_expr(*inner))?;
                            rest = Some(AssignmentTargetRest::boxed(SPAN, target, &self.ab));
                        }
                        Some(e) => elements.push(Some(self.assignment_target_maybe_default(e)?)),
                    }
                }
                let array = ArrayAssignmentTarget::boxed(SPAN, elements, rest, &self.ab);
                Some(oxc_ast::ast::AssignmentTarget::ArrayAssignmentTarget(array))
            }
            JsExpr::Object(obj) => {
                let mut props = ArenaVec::with_capacity_in(obj.properties.len(), &self.ab);
                let mut rest: Option<
                    oxc_allocator::Box<'a, oxc_ast::ast::AssignmentTargetRest<'a>>,
                > = None;
                let last = obj.properties.len().saturating_sub(1);
                for (i, member) in obj.properties.iter().enumerate() {
                    match member {
                        JsObjectMember::SpreadElement(id) => {
                            // A rest property must be the last entry.
                            if i != last {
                                return None;
                            }
                            let target = self.assignment_target(self.arena.get_expr(*id))?;
                            rest = Some(AssignmentTargetRest::boxed(SPAN, target, &self.ab));
                        }
                        JsObjectMember::Property(p) => {
                            // Only plain `key: value` / shorthand `{ key }` /
                            // `{ key = default }` are representable as object
                            // assignment targets — never get/set/method.
                            if !matches!(p.kind, JsPropertyKind::Init) || p.method {
                                return None;
                            }
                            let prop = self.assignment_target_property(p)?;
                            props.push(prop);
                        }
                    }
                }
                let object = ObjectAssignmentTarget::boxed(SPAN, props, rest, &self.ab);
                Some(oxc_ast::ast::AssignmentTarget::ObjectAssignmentTarget(
                    object,
                ))
            }
            // Plain identifier / simple member: reuse the simple-target helper.
            _ => {
                let simple = self.simple_assignment_target(expr)?;
                Some(oxc_ast::ast::AssignmentTarget::from(simple))
            }
        }
    }

    /// Build an [`AssignmentTargetMaybeDefault`] for an array element or object
    /// property value. A nested `JsExpr::Assignment` with the plain `=` operator
    /// is a default (`[a = 1] = …`); anything else is a bare nested target.
    fn assignment_target_maybe_default(
        &self,
        expr: &JsExpr,
    ) -> Option<oxc_ast::ast::AssignmentTargetMaybeDefault<'a>> {
        if let JsExpr::Assignment(a) = expr
            && matches!(a.operator, JsAssignmentOp::Assign)
        {
            let binding = self.assignment_target(self.arena.get_expr(a.left))?;
            let init = self.expr_id(a.right)?;
            return Some(
                AssignmentTargetMaybeDefault::new_assignment_target_with_default(
                    SPAN, binding, init, &self.ab,
                ),
            );
        }
        let target = self.assignment_target(expr)?;
        Some(oxc_ast::ast::AssignmentTargetMaybeDefault::from(target))
    }

    /// Build an [`AssignmentTargetProperty`] from an IR object property used in
    /// an object assignment target. Shorthand `{ a }` / `{ a = 1 }` lowers to
    /// `AssignmentTargetPropertyIdentifier`; an explicit `key: value` (with an
    /// optional default on the value) lowers to `AssignmentTargetPropertyProperty`.
    /// Bails on a computed key that is not a `Computed` expression.
    fn assignment_target_property(
        &self,
        p: &JsProperty,
    ) -> Option<oxc_ast::ast::AssignmentTargetProperty<'a>> {
        // Shorthand: `{ a }` or `{ a = default }`. The IR value is the bare
        // identifier (or an `a = default` assignment) and the key matches it.
        if p.shorthand && !p.computed {
            let value = self.arena.get_expr(p.value);
            let (name, init) = match value {
                JsExpr::Identifier(name) => (name.as_str(), None),
                JsExpr::Assignment(a) if matches!(a.operator, JsAssignmentOp::Assign) => {
                    match self.arena.get_expr(a.left) {
                        JsExpr::Identifier(name) => (name.as_str(), Some(self.expr_id(a.right)?)),
                        _ => return None,
                    }
                }
                _ => return None,
            };
            let binding = IdentifierReference::new(SPAN, self.str(name), &self.ab);
            return Some(
                oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(
                    AssignmentTargetPropertyIdentifier::boxed(SPAN, binding, init, &self.ab),
                ),
            );
        }

        // Explicit `key: value` (value may carry a default).
        let key = self.class_member_key(&p.key, p.computed)?;
        let binding = self.assignment_target_maybe_default(self.arena.get_expr(p.value))?;
        Some(
            oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(
                AssignmentTargetPropertyProperty::boxed(SPAN, key, binding, p.computed, &self.ab),
            ),
        )
    }

    fn object(&self, o: &JsObjectExpression) -> Option<Expression<'a>> {
        let mut props = ArenaVec::with_capacity_in(o.properties.len(), &self.ab);
        for member in &o.properties {
            match member {
                JsObjectMember::SpreadElement(id) => {
                    let arg = self.expr_id(*id)?;
                    props.push(ObjectPropertyKind::SpreadProperty(SpreadElement::boxed(
                        SPAN, arg, &self.ab,
                    )));
                }
                JsObjectMember::Property(p) => {
                    let prop = self.object_property(p)?;
                    props.push(ObjectPropertyKind::ObjectProperty(prop));
                }
            }
        }
        Some(Expression::ObjectExpression(ObjectExpression::boxed(
            SPAN, props, &self.ab,
        )))
    }

    /// Build a boxed [`ObjectProperty`] from an IR [`JsProperty`].
    ///
    /// Handles plain `key: value`, computed keys (`[expr]: value`), method
    /// shorthand (`key() {}`), and getter / setter accessors (`get key() {}` /
    /// `set key() {}`). Mirrors codegen's [`emit_object_member`] exactly so the
    /// esrap output stays byte-identical: in particular codegen's `auto_method`
    /// heuristic treats any non-computed `Init` property whose value is a
    /// (non-arrow) function expression as a method shorthand, so we set
    /// `method: true` for that shape too — without it esrap would print
    /// `key: function() {}` instead of the `key() {}` codegen emits.
    fn object_property(
        &self,
        p: &JsProperty,
    ) -> Option<oxc_allocator::Box<'a, oxc_ast::ast::ObjectProperty<'a>>> {
        let kind = match p.kind {
            JsPropertyKind::Init => PropertyKind::Init,
            JsPropertyKind::Get => PropertyKind::Get,
            JsPropertyKind::Set => PropertyKind::Set,
        };

        // A getter / setter / method renders from `kind` + `method` + a bare
        // function value (esrap emits the concise method form, not `key:
        // function(){}`). For all of these the value MUST be a non-arrow
        // function expression; bail otherwise. Additionally, mirror codegen's
        // `auto_method`: a non-computed `Init` property with a function value is
        // emitted as a method shorthand even when `method` is false.
        let value_is_function = matches!(self.arena.get_expr(p.value), JsExpr::Function(_));
        let is_accessor = !matches!(p.kind, JsPropertyKind::Init);
        let auto_method =
            !p.computed && matches!(p.kind, JsPropertyKind::Init) && value_is_function;
        let method = p.method || auto_method;

        if (is_accessor || method) && !value_is_function {
            // `get`/`set`/method shape requires a function value to be faithful.
            return None;
        }

        let key = if p.computed {
            match &p.key {
                JsPropertyKey::Computed(id) => {
                    let expr = self.expr_id(*id)?;
                    PropertyKey::from(expr)
                }
                // A computed key that is structurally an identifier or literal
                // (`[name]: …` / `[0]: …`): build the key from that expression.
                JsPropertyKey::Identifier(name) => {
                    let expr = Expression::new_identifier(SPAN, self.str(name), &self.ab);
                    PropertyKey::from(expr)
                }
                JsPropertyKey::Literal(lit) => {
                    let expr = self.literal(lit)?;
                    PropertyKey::from(expr)
                }
            }
        } else {
            self.property_key(&p.key)?
        };

        let value = self.expr_id(p.value)?;

        Some(ObjectProperty::boxed(
            SPAN,
            kind,
            key,
            value,
            method,
            p.shorthand,
            p.computed,
            &self.ab,
        ))
    }

    fn property_key(&self, key: &JsPropertyKey) -> Option<PropertyKey<'a>> {
        match key {
            JsPropertyKey::Identifier(name) => Some(PropertyKey::new_static_identifier(
                SPAN,
                self.str(name),
                &self.ab,
            )),
            JsPropertyKey::Literal(lit) => {
                // A literal key is the literal expression in key position.
                let expr = self.literal(lit)?;
                Some(PropertyKey::from(expr))
            }
            // Computed keys are bailed on in `object` already (non-computed
            // only), so this is unreachable for object properties, but handle
            // defensively by bailing.
            JsPropertyKey::Computed(_) => None,
        }
    }

    fn arrow(&self, arrow: &JsArrowFunction) -> Option<Expression<'a>> {
        let params = self.formal_params(&arrow.params)?;
        let body = match &arrow.body {
            JsArrowBody::Expression(id) => ArrowFunctionBody::from(self.expr_id(*id)?),
            JsArrowBody::Block(block) => {
                let (stmts, span) = self.statements(&block.body)?;
                ArrowFunctionBody::FunctionBody(FunctionBody::boxed(
                    span,
                    ArenaVec::new_in(&self.ab),
                    stmts,
                    &self.ab,
                ))
            }
        };

        Some(Expression::ArrowFunctionExpression(
            ArrowFunctionExpression::boxed(
                SPAN,
                arrow.is_async,
                None,
                ArenaBox::new_in(params, &self.ab),
                None,
                body,
                &self.ab,
            ),
        ))
    }

    /// Build an optional-chaining wrapper (`a?.b`, `a?.()`). The inner IR
    /// expression must be a member or call expression (one of which carries the
    /// `optional: true` somewhere in the chain); bail on anything else.
    fn chain(&self, chain: &JsChainExpression) -> Option<Expression<'a>> {
        let inner = self.arena.get_expr(chain.expression);
        let element: ChainElement<'a> = match inner {
            JsExpr::Member(m) => {
                let member = self.member_expr(m)?;
                ChainElement::from(member)
            }
            JsExpr::Call(c) => {
                let callee = self.expr_id(c.callee)?;
                let args = self.arguments(&c.arguments)?;
                let call = CallExpression::boxed(SPAN, callee, None, args, c.optional, &self.ab);
                ChainElement::CallExpression(call)
            }
            _ => return None,
        };
        Some(Expression::ChainExpression(ChainExpression::boxed(
            SPAN, element, &self.ab,
        )))
    }

    /// Build a function expression. Reuses [`formal_params`] (which bails on
    /// destructuring params) and [`statements`] for the body.
    fn function(&self, func: &JsFunctionExpression) -> Option<Expression<'a>> {
        let id = func
            .id
            .as_ref()
            .map(|name| BindingIdentifier::new(SPAN, self.str(name), &self.ab));
        let params = self.formal_params(&func.params)?;
        let (stmts, span) = self.statements(&func.body.body)?;
        let body = FunctionBody::new(span, ArenaVec::new_in(&self.ab), stmts, &self.ab);
        Some(Expression::FunctionExpression(Function::boxed(
            SPAN,
            FunctionType::FunctionExpression,
            id,
            func.is_generator,
            func.is_async,
            false,
            None,
            None,
            ArenaBox::new_in(params, &self.ab),
            None,
            Some(ArenaBox::new_in(body, &self.ab)),
            &self.ab,
        )))
    }

    /// Convert function parameters, handling destructuring patterns and a
    /// trailing rest param (`...args`). Bails (via `binding_pattern`) on any
    /// pattern that cannot be faithfully reproduced, or on a rest param that is
    /// not the last parameter.
    fn formal_params(&self, params: &[JsPattern]) -> Option<oxc_ast::ast::FormalParameters<'a>> {
        let mut items = ArenaVec::with_capacity_in(params.len(), &self.ab);
        let mut rest: Option<oxc_allocator::Box<'a, oxc_ast::ast::FormalParameterRest<'a>>> = None;
        let last = params.len().saturating_sub(1);
        for (i, p) in params.iter().enumerate() {
            if let JsPattern::Rest(inner) = p {
                // A rest parameter must be the last parameter and lives in the
                // dedicated `rest` slot, not the `items` list.
                if i != last {
                    return None;
                }
                let pattern = self.binding_pattern(inner)?;
                let rest_el = BindingRestElement::new(SPAN, pattern, &self.ab);
                rest = Some(FormalParameterRest::boxed(
                    SPAN,
                    ArenaVec::new_in(&self.ab),
                    rest_el,
                    None,
                    &self.ab,
                ));
                continue;
            }
            let pattern = self.binding_pattern(p)?;
            items.push(FormalParameter::new(
                SPAN,
                ArenaVec::new_in(&self.ab),
                pattern,
                None,
                None,
                false,
                None,
                false,
                false,
                &self.ab,
            ));
        }
        Some(FormalParameters::new(
            SPAN,
            FormalParameterKind::ArrowFormalParameters,
            items,
            rest,
            &self.ab,
        ))
    }

    /// Convert call/new arguments, supporting spread arguments (`f(...x)`).
    fn arguments(&self, args: &[JsExpr]) -> Option<ArenaVec<'a, Argument<'a>>> {
        let mut out = ArenaVec::with_capacity_in(args.len(), &self.ab);
        for arg in args {
            let argument = match arg {
                JsExpr::Spread(inner) => {
                    let inner = self.expr_id(*inner)?;
                    Argument::new_spread_element(SPAN, inner, &self.ab)
                }
                other => Argument::from(self.expr(other)?),
            };
            out.push(argument);
        }
        Some(out)
    }
}

// -- operator mapping -------------------------------------------------------

fn binary_op(op: JsBinaryOp) -> BinaryOperator {
    match op {
        JsBinaryOp::Add => BinaryOperator::Addition,
        JsBinaryOp::Sub => BinaryOperator::Subtraction,
        JsBinaryOp::Mul => BinaryOperator::Multiplication,
        JsBinaryOp::Div => BinaryOperator::Division,
        JsBinaryOp::Mod => BinaryOperator::Remainder,
        JsBinaryOp::Pow => BinaryOperator::Exponential,
        JsBinaryOp::Eq => BinaryOperator::Equality,
        JsBinaryOp::Ne => BinaryOperator::Inequality,
        JsBinaryOp::StrictEq => BinaryOperator::StrictEquality,
        JsBinaryOp::StrictNe => BinaryOperator::StrictInequality,
        JsBinaryOp::Lt => BinaryOperator::LessThan,
        JsBinaryOp::Le => BinaryOperator::LessEqualThan,
        JsBinaryOp::Gt => BinaryOperator::GreaterThan,
        JsBinaryOp::Ge => BinaryOperator::GreaterEqualThan,
        JsBinaryOp::BitAnd => BinaryOperator::BitwiseAnd,
        JsBinaryOp::BitOr => BinaryOperator::BitwiseOR,
        JsBinaryOp::BitXor => BinaryOperator::BitwiseXOR,
        JsBinaryOp::Shl => BinaryOperator::ShiftLeft,
        JsBinaryOp::Shr => BinaryOperator::ShiftRight,
        JsBinaryOp::UShr => BinaryOperator::ShiftRightZeroFill,
        JsBinaryOp::In => BinaryOperator::In,
        JsBinaryOp::InstanceOf => BinaryOperator::Instanceof,
    }
}

fn logical_op(op: JsLogicalOp) -> LogicalOperator {
    match op {
        JsLogicalOp::And => LogicalOperator::And,
        JsLogicalOp::Or => LogicalOperator::Or,
        JsLogicalOp::NullishCoalescing => LogicalOperator::Coalesce,
    }
}

fn assignment_op(op: JsAssignmentOp) -> AssignmentOperator {
    match op {
        JsAssignmentOp::Assign => AssignmentOperator::Assign,
        JsAssignmentOp::AddAssign => AssignmentOperator::Addition,
        JsAssignmentOp::SubAssign => AssignmentOperator::Subtraction,
        JsAssignmentOp::MulAssign => AssignmentOperator::Multiplication,
        JsAssignmentOp::DivAssign => AssignmentOperator::Division,
        JsAssignmentOp::ModAssign => AssignmentOperator::Remainder,
        JsAssignmentOp::PowAssign => AssignmentOperator::Exponential,
        JsAssignmentOp::ShlAssign => AssignmentOperator::ShiftLeft,
        JsAssignmentOp::ShrAssign => AssignmentOperator::ShiftRight,
        JsAssignmentOp::UShrAssign => AssignmentOperator::ShiftRightZeroFill,
        JsAssignmentOp::BitAndAssign => AssignmentOperator::BitwiseAnd,
        JsAssignmentOp::BitOrAssign => AssignmentOperator::BitwiseOR,
        JsAssignmentOp::BitXorAssign => AssignmentOperator::BitwiseXOR,
        JsAssignmentOp::AndAssign => AssignmentOperator::LogicalAnd,
        JsAssignmentOp::OrAssign => AssignmentOperator::LogicalOr,
        JsAssignmentOp::NullishAssign => AssignmentOperator::LogicalNullish,
    }
}

fn update_op(op: JsUpdateOp) -> UpdateOperator {
    match op {
        JsUpdateOp::Increment => UpdateOperator::Increment,
        JsUpdateOp::Decrement => UpdateOperator::Decrement,
    }
}

/// Whether `callee` is `$.<name>` — the runtime-namespace call shape the client
/// codegen emits.
fn is_dollar_call(callee: &Expression, name: &str) -> bool {
    let Expression::StaticMemberExpression(m) = callee else {
        return false;
    };
    matches!(&m.object, Expression::Identifier(id) if id.name == "$") && m.property.name == name
}

fn unary_op(op: JsUnaryOp) -> UnaryOperator {
    match op {
        JsUnaryOp::Minus => UnaryOperator::UnaryNegation,
        JsUnaryOp::Plus => UnaryOperator::UnaryPlus,
        JsUnaryOp::Not => UnaryOperator::LogicalNot,
        JsUnaryOp::BitNot => UnaryOperator::BitwiseNot,
        JsUnaryOp::TypeOf => UnaryOperator::Typeof,
        JsUnaryOp::Void => UnaryOperator::Void,
        JsUnaryOp::Delete => UnaryOperator::Delete,
    }
}

#[cfg(test)]
mod tests {
    use super::{AstIsland, program_to_oxc_with_islands};
    use crate::ast::oxc_program::RetainedProgram;
    use crate::compiler::phases::phase3_transform::js_ast::{JsArena, JsProgram, JsStatement};
    use oxc_allocator::Allocator;
    use oxc_span::GetSpan;

    #[test]
    fn retained_island_keeps_absolute_source_spans() {
        let retained = RetainedProgram::parse("let value = 1;", false);
        let program = JsProgram::with_body(vec![JsStatement::RetainedAst {
            index: 0,
            fallback: "let value = 1;".into(),
            source_offset: 12,
            has_effect_rune: false,
        }]);
        let arena = JsArena::new();
        let allocator = Allocator::default();
        let converted = program_to_oxc_with_islands(
            &program,
            &arena,
            &allocator,
            &[AstIsland {
                program: &retained,
                source_offset: 12,
            }],
        )
        .expect("retained AST is supported");

        assert_eq!(converted.program.body[0].span().start, 12);
        assert_eq!(converted.program.body[0].span().end, 26);
    }
}
