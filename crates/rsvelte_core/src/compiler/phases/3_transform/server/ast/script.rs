//! AST-based server INSTANCE / MODULE script transform (Phase-3 rewrite).
//!
//! This is the additive, in-progress port of the server `VariableDeclaration` /
//! `ExpressionStatement` / `ImportDeclaration` global visitors
//! (`submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/`)
//! restricted to the **localized, non-interacting RUNES lowerings**. It parses
//! the script source slice with oxc, walks the top-level statements, classifies
//! each, then RE-PARSES the relevant source spans into the state's allocator and
//! applies the rune lowerings — no node moving across allocators, no text
//! surgery on the output.
//!
//! ## In scope (this slice)
//! - `import …` (instance) → hoisted to module scope, dropped from body.
//! - `let x = $state(e)` / `$state.raw(e)` → `let x = <e>` (no-arg → `void 0`).
//! - `let d = $derived(e)` → `let d = $.derived(() => <e>)`.
//! - `let d = $derived.by(f)` → `let d = $.derived(<f>)`.
//! - `let { … } = $props()` → `let { … } = $$props`, with the `$$slots` /
//!   `$$events` deconfliction injection for the object-WITH-rest and identifier
//!   forms (写经 `VariableDeclaration.js:33-82`; `$$slots` deconflicts to
//!   `$$slots_` when `analysis.uses_slots`).
//! - class-field runes: `count = $state(0)` → `count = 0`, `$state()` → bare
//!   field, `d = $derived(e)` → `d = $.derived(() => e)`, `$derived.by(f)` →
//!   `$.derived(f)` (写经 `PropertyDefinition.js`).
//! - `$props.id` → dropped.
//! - top-level `$effect(…)` / `$effect.pre(…)` / `$effect.root(…)` /
//!   `$inspect(…)` / `$inspect.trace(…)` expression statements → dropped.
//! - everything else → kept verbatim (re-parsed from its source span).
//!
//! ## EXPLICIT KNOWN GAPS (DEFERRED by design — the delicate single-pass the
//! main agent adds later, NOT here):
//! - derived-read wrapping, store-get (`$x` → `$.store_get`),
//!   `$state.snapshot`, `$$sanitized_props` identifier rewriting — all value
//!   expressions pass through verbatim (re-parsed source, UNCHANGED).
//! - TypeScript components (`<script lang="ts">`) — the script slice is run
//!   through `strip_typescript` BEFORE parsing, then lowered as ordinary JS
//!   (offsets stay internally consistent because `src` borrows the stripped
//!   buffer and every re-slice cuts from `src`, never from `state.source`).
//!   Template-side TS (e.g. `{x as T}`) is NOT stripped here — the OLD oracle
//!   strips TS from its final output, which this slice does not (KNOWN GAP).
//! - async `$derived` (`$derived(await …)`) under `experimental.async` →
//!   `await $.async_derived(() => <value>)` (top-level `await` stripped; nested
//!   await keeps the thunk `async`). In sync mode it stays the plain
//!   `$.derived(() => <value>)` thunk.
//! - destructured-`$state` / `$state.raw` patterns ARE expanded via
//!   `create_state_declarators` + `extract_paths` (`tmp` temp + `$$array =
//!   $.to_array(tmp, N)` for array/iterable destructures + per-leaf
//!   declarators). The `tmp` temp is deconflicted across the component (a second
//!   destructured `$state(...)` uses `tmp_1`, 写经 `scope.generate('tmp')`).
//!   KNOWN GAP: `$$array` is not yet deconflicted.

use super::ServerTransformState;
use super::comments;
use crate::ast::template::Script;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::builders::B;
use crate::compiler::phases::phase3_transform::client::expression_utils::wrap_await_with_save_in_async_derived;
use oxc_ast::ast::{Comment, Expression as OxcExpression, Statement, VariableDeclarationKind};
use oxc_ast_visit::VisitMut;
use oxc_span::{GetSpan, Span};
use regex::Regex;
use std::sync::LazyLock;

/// Sanitizes a public class-field name into a valid private-identifier name
/// (写经 analyze `ClassBody` `regex_invalid_identifier_chars`): the leading char
/// must be `[a-zA-Z_$]`, every other char `[a-zA-Z0-9_$]`; anything else → `_`.
static REGEX_INVALID_IDENTIFIER_CHARS: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(^[^a-zA-Z_$]|[^a-zA-Z0-9_$])").unwrap());

/// The rune shapes this slice recognises on a declarator init.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum DeclRune {
    /// `$state(e)` / `$state.raw(e)` — keep just the argument.
    State,
    /// `$derived(e)` — `$.derived(() => <e>)`.
    Derived,
    /// `$derived.by(f)` — `$.derived(<f>)`.
    DerivedBy,
    /// `$props()` — `<pattern> = $$props`.
    Props,
    /// `$props.id` — drop the declarator.
    PropsId,
}

/// Detect a rune on a declarator-init oxc expression by callee / member name.
/// Mirrors upstream `get_rune`: the rune is the CALLEE of a call expression
/// (`$props.id()` → `$props.id`), so every rune here is matched on a
/// `CallExpression`. Upstream parses with acorn, which builds no
/// `ParenthesizedExpression` at all, so `let v = ($state(1))` reaches `get_rune`
/// as the bare call and the parens never survive into the output (#3248).
pub(super) fn detect_decl_rune(init: &OxcExpression) -> Option<DeclRune> {
    let OxcExpression::CallExpression(call) = init.without_parentheses() else {
        return None;
    };
    match &call.callee {
        OxcExpression::Identifier(id) => match id.name.as_str() {
            "$state" => Some(DeclRune::State),
            "$derived" => Some(DeclRune::Derived),
            "$props" => Some(DeclRune::Props),
            _ => None,
        },
        OxcExpression::StaticMemberExpression(m) => {
            let OxcExpression::Identifier(obj) = &m.object else {
                return None;
            };
            match (obj.name.as_str(), m.property.name.as_str()) {
                // `$state.raw` / `$state.snapshot` / `$state.eager` as a
                // declaration INIT all fall through upstream's
                // `VariableDeclaration.js` to the generic `value = visit(args[0])`
                // path — i.e. the rune wrapper is stripped and just the first
                // argument survives (`let start = $state.snapshot(items)` → `let
                // start = items`). Only the TEMPLATE-level `CallExpression` visitor
                // rewrites `$state.snapshot(x)` → `$.snapshot(x)`; the declaration
                // init does NOT. (`$state.eager(x)` → `x` matches upstream's
                // `CallExpression` `return node.arguments[0]` too.)
                ("$state", "raw" | "snapshot" | "eager") => Some(DeclRune::State),
                ("$derived", "by") => Some(DeclRune::DerivedBy),
                // `$props.id()` — upstream skips this declarator (it is
                // re-emitted as `const <id> = $.props_id($$renderer);` via the
                // separate `analysis.props_id` assembly path). The re-emission
                // is a KNOWN GAP in this slice; we only mirror the skip.
                ("$props", "id") => Some(DeclRune::PropsId),
                _ => None,
            }
        }
        _ => None,
    }
}

/// The owned counterpart of `Expression::without_parentheses`, for the lowerings
/// that move the rune call out of its slot before reading it.
pub(super) fn take_without_parens<'a>(mut e: OxcExpression<'a>) -> OxcExpression<'a> {
    while let OxcExpression::ParenthesizedExpression(paren) = e {
        e = paren.unbox().expression;
    }
    e
}

/// The `$`-prefixed callee name of a rune-shaped call (`$state(…)` → `$state`,
/// `$state.raw(…)` → `$state`, `$props()` → `$props`), or `None` if `init` is not
/// a `$…`-callee call. Used to detect the store-rune conflict: when this exact
/// `$`-prefixed name is a declared binding (an auto-created store subscription,
/// created because the base store is read as `$state` somewhere), it is a store
/// read (`$.store_get(state, …)`), NOT the rune — mirroring upstream
/// `get_global_keypath`, whose `scope.get('$state')` finds that binding. Checking
/// the PREFIXED name (not the base) is essential: `let props = $props()` binds
/// `props` but has no `$props` store subscription, so it stays the rune.
pub(super) fn rune_callee_name<'a>(init: &OxcExpression<'a>) -> Option<&'a str> {
    let OxcExpression::CallExpression(call) = init.without_parentheses() else {
        return None;
    };
    let name = match &call.callee {
        OxcExpression::Identifier(id) => id.name.as_str(),
        OxcExpression::StaticMemberExpression(m) => match &m.object {
            OxcExpression::Identifier(obj) => obj.name.as_str(),
            _ => return None,
        },
        _ => return None,
    };
    (name.starts_with('$') && name.len() > 1).then_some(name)
}

/// Build the `$$async_hole` placeholder statement that stands in for a removed
/// `$inspect(...)` / `$effect(...)` expression statement under
/// `experimental.async`. The async-body transform (`transform_async_body`)
/// recognises any statement whose printed text contains `$$async_hole` and
/// turns it into a `() => void 0` thunk in the `$$renderer.run([...])` array,
/// keeping the `$$promises` indices of every later expression stable (写经 the
/// `/* $$async_hole */` marker in the text-based server `transform_script.rs`).
///
/// We emit a bare identifier-reference expression statement (`$$async_hole;`)
/// because it round-trips losslessly through the esrap printer — a string
/// literal would be parsed as a directive prologue (dropped from `program.body`)
/// and a bare comment marker would risk being stripped — and the printed text
/// carries the marker that `transform_async_body` matches on. The placeholder
/// never reaches the final output: it is consumed (and replaced by
/// `() => void 0`) by the async transform.
fn async_hole_placeholder<'a>(state: &ServerTransformState<'a>) -> Option<Statement<'a>> {
    state.reparse_statement("($$async_hole);")
}

/// Like [`async_hole_placeholder`], but for a removed `$inspect(...)` /
/// `$inspect(...).with(...)` (NOT `$effect`-family). The two differ in their
/// no-await SYNC-prelude fall-through: a `$effect` hole collapses to a bare
/// `b.empty()` (elided → nothing printed), whereas an `$inspect` hole collapses
/// to a `;;` pair (upstream's `ExpressionStatement` keeps its now-`EmptyStatement`
/// expression — see the removal arm). We mark it with a distinct
/// `$$inspect_hole` identifier so the no-await fall-through in `transform_instance`
/// can tell the two apart; when an actual top-level await DOES split the body,
/// `transform_async_body` treats `$$inspect_hole` exactly like `$$async_hole`
/// (both become `() => void 0` thunks — correct, per upstream's after-await
/// `$inspect` shape).
fn inspect_hole_placeholder<'a>(state: &ServerTransformState<'a>) -> Option<Statement<'a>> {
    state.reparse_statement("($$inspect_hole);")
}

/// Upstream's `get_rune` returns null once the name resolves to a binding, so a
/// legacy-mode `$effect` / `$inspect` store subscription is a plain call, not a rune.
pub(super) fn rune_names_are_store_subs(
    analysis: &crate::compiler::phases::phase2_analyze::ComponentAnalysis,
) -> bool {
    analysis.root.bindings.iter().any(|b| {
        b.kind == BindingKind::StoreSub && matches!(b.name.as_str(), "$effect" | "$inspect")
    })
}

/// Whether an expression-statement expression is a top-level effect/inspect rune
/// call that upstream's server `ExpressionStatement` visitor removes.
fn is_removed_effect_stmt(expr: &OxcExpression, rune_store_subs: bool) -> bool {
    if rune_store_subs {
        return false;
    }
    let OxcExpression::CallExpression(call) = expr.without_parentheses() else {
        return false;
    };
    match &call.callee {
        OxcExpression::Identifier(id) => matches!(id.name.as_str(), "$effect" | "$inspect"),
        OxcExpression::StaticMemberExpression(m) => {
            // Direct `$effect.pre(…)` / `$effect.root(…)` / `$inspect.trace(…)`,
            // OR the `$inspect(<args>).with(<fn>)` rune whose callee is the static
            // member `<$inspect-call>.with` (写经 `get_rune`: a `.with` member of a
            // `$inspect(...)` call resolves to the `$inspect().with` rune, which the
            // non-dev server `CallExpression` visitor removes → `b.empty`).
            if m.property.name.as_str() == "with"
                && let OxcExpression::CallExpression(inner) = &m.object
                && matches!(&inner.callee, OxcExpression::Identifier(id) if id.name.as_str() == "$inspect")
            {
                return true;
            }
            let OxcExpression::Identifier(obj) = &m.object else {
                return false;
            };
            matches!(
                (obj.name.as_str(), m.property.name.as_str()),
                ("$effect", "pre") | ("$effect", "root") | ("$inspect", "trace")
            )
        }
        _ => false,
    }
}

/// Classification of a top-level `$inspect` expression statement, used to decide
/// dev-mode lowering. Mirrors upstream's server `CallExpression` visitor
/// (`$inspect` / `$inspect().with`): in dev these become a `console.log(...)` /
/// `(fn)('init', ...)` call; otherwise they are removed (`b.empty`). `$inspect.trace`
/// is removed in BOTH modes by the `ExpressionStatement` visitor, so it is NOT an
/// inspect kind here.
enum InspectKind {
    /// `$inspect(<args>)` — dev → `console.log('$inspect(', <args>, ')')`.
    Plain,
    /// `$inspect(<args>).with(<fn>)` — dev → `(<fn>)('init', <args>)`.
    With,
}

/// Classify a top-level expression-statement expression as a dev-lowerable
/// `$inspect(...)` / `$inspect(...).with(...)` call. Returns `None` for
/// `$inspect.trace` / `$effect.*` (those are removed in every mode) and for
/// non-inspect expressions.
fn inspect_kind(expr: &OxcExpression, rune_store_subs: bool) -> Option<InspectKind> {
    if rune_store_subs {
        return None;
    }
    let OxcExpression::CallExpression(call) = expr.without_parentheses() else {
        return None;
    };
    match &call.callee {
        // `$inspect(<args>)`
        OxcExpression::Identifier(id) if id.name.as_str() == "$inspect" => Some(InspectKind::Plain),
        // `$inspect(<args>).with(<fn>)` — callee is `<$inspect-call>.with`.
        OxcExpression::StaticMemberExpression(m)
            if m.property.name.as_str() == "with"
                && matches!(
                    &m.object,
                    OxcExpression::CallExpression(inner)
                        if matches!(&inner.callee, OxcExpression::Identifier(id) if id.name.as_str() == "$inspect")
                ) =>
        {
            Some(InspectKind::With)
        }
        _ => None,
    }
}

/// The dev lowering of `expr` when it is an `$inspect(...)` /
/// `$inspect(...).with(...)` call. `text` renders one argument expression: the
/// top-level caller slices the component source, so operators and whitespace
/// survive verbatim, while a NESTED call has already been re-homed by
/// `reparse_statement` and its spans index the re-parsed slice, not `src`.
fn dev_inspect_statement<'a>(
    expr: &OxcExpression,
    rune_store_subs: bool,
    wrap_reads: bool,
    state: &ServerTransformState<'a>,
    text: &dyn Fn(&OxcExpression) -> String,
) -> Option<Statement<'a>> {
    let kind = inspect_kind(expr, rune_store_subs)?;
    let OxcExpression::CallExpression(call) = expr else {
        unreachable!("inspect_kind matched a CallExpression");
    };
    let args = |call: &oxc_ast::ast::CallExpression| {
        call.arguments
            .iter()
            .filter_map(|a| a.as_expression())
            .map(text)
            .collect::<Vec<_>>()
            .join(", ")
    };
    let (args_src, with_fn_src) = match kind {
        InspectKind::Plain => (args(call), None),
        InspectKind::With => {
            // For `<inner>.with(fn)`, the args belong to the INNER `$inspect(...)`
            // call, and `fn` is this outer call's first argument.
            let inner_args = match &call.callee {
                OxcExpression::StaticMemberExpression(m) => match &m.object {
                    OxcExpression::CallExpression(inner) => args(inner),
                    _ => String::new(),
                },
                _ => String::new(),
            };
            let fn_src = call
                .arguments
                .first()
                .and_then(|a| a.as_expression())
                .map(text);
            (inner_args, fn_src)
        }
    };
    build_dev_inspect(&kind, &args_src, with_fn_src.as_deref(), wrap_reads, state)
}

/// Replace every NESTED `$inspect(...)` expression statement in `stmt` with its
/// dev lowering. Any inspect reaching here is already below the script top
/// level: the emit loop handles a top-level one and breaks before this runs.
fn lower_nested_dev_inspect<'a>(stmt: &mut Statement<'a>, state: &ServerTransformState<'a>) {
    struct V<'s, 'a> {
        state: &'s ServerTransformState<'a>,
        rune_store_subs: bool,
    }
    impl<'s, 'a> VisitMut<'a> for V<'s, 'a> {
        fn visit_statement(&mut self, stmt: &mut Statement<'a>) {
            if let Statement::ExpressionStatement(es) = stmt
                && let Some(lowered) = dev_inspect_statement(
                    &es.expression,
                    self.rune_store_subs,
                    // The enclosing statement was re-homed and read-wrapped
                    // whole, so a derived argument already reads as `d()`.
                    false,
                    self.state,
                    &|e| self.state.expr_to_string(e),
                )
            {
                *stmt = lowered;
                return;
            }
            oxc_ast_visit::walk_mut::walk_statement(self, stmt);
        }
    }
    let mut v = V {
        state,
        rune_store_subs: rune_names_are_store_subs(state.analysis),
    };
    v.visit_statement(stmt);
}

/// Give every `$inspect(…)` / `$inspect(…).with(…)` statement BELOW `stmt` the
/// residue upstream leaves — the dev `console.log(…)` call, or the non-dev `;;`
/// pair. Upstream reaches these from a tree-wide `CallExpression` visitor, so
/// the answer cannot depend on nesting depth; rsvelte's own answer lived only in
/// the top-level arm of [`transform_script`], and everything below it was
/// deleted outright by [`ClassFieldRuneLower`] — in dev too, which silently drops
/// the logging call.
///
/// `origin` is where `stmt`'s source text starts in `src`. A verbatim statement
/// is re-parsed from its own slice, so its spans are LOCAL to that slice and an
/// argument's source text is `src[origin + span]`.
fn lower_nested_inspect<'a>(
    stmt: &mut Statement<'a>,
    src: &str,
    origin: u32,
    state: &ServerTransformState<'a>,
) {
    let mut v = NestedInspectResidue {
        b: state.b,
        rune_store_subs: rune_names_are_store_subs(state.analysis),
        src,
        origin,
        state,
    };
    v.visit_statement(stmt);
}

struct NestedInspectResidue<'a, 'b> {
    b: B<'a>,
    rune_store_subs: bool,
    src: &'b str,
    origin: u32,
    state: &'b ServerTransformState<'a>,
}

impl<'a, 'b> VisitMut<'a> for NestedInspectResidue<'a, 'b> {
    /// A `$inspect(…)` in a VALUE position — a declarator initializer, an array
    /// element — where the statement hook below never sees it. Upstream's
    /// `VariableDeclaration` allow-list omits `$inspect().with` entirely and
    /// mishandles `$inspect`, so official's own output here is a `SyntaxError`
    /// or an unrelated value; see
    /// `upstream_issues/3441-svelte-inspect-with-in-a-declarator.md`. rsvelte
    /// emits what the rune evaluates to instead of leaving the call in place,
    /// which would throw `ReferenceError: $inspect is not defined`.
    fn visit_expression(&mut self, expr: &mut OxcExpression<'a>) {
        if inspect_kind(expr, self.rune_store_subs).is_some()
            && let Some(value) = inspect_value_expr(expr, self.src, self.origin, self.state)
        {
            *expr = value;
            return;
        }
        oxc_ast_visit::walk_mut::walk_expression(self, expr);
    }

    /// The non-dev residue is TWO statements, so the substitution has to happen
    /// on the list rather than on a single-statement hook.
    fn visit_statements(&mut self, stmts: &mut oxc_allocator::Vec<'a, Statement<'a>>) {
        if stmts.iter().any(|stmt| self.is_inspect_stmt(stmt)) {
            let mut rebuilt = oxc_allocator::ArenaVec::new_in(&self.b.ab());
            for stmt in stmts.drain(..) {
                match self.residue(&stmt) {
                    Some(residue) => rebuilt.extend(residue),
                    None => rebuilt.push(stmt),
                }
            }
            *stmts = rebuilt;
        }
        oxc_ast_visit::walk_mut::walk_statements(self, stmts);
    }
}

impl<'a, 'b> NestedInspectResidue<'a, 'b> {
    fn is_inspect_stmt(&self, stmt: &Statement<'a>) -> bool {
        matches!(stmt, Statement::ExpressionStatement(es)
            if inspect_kind(&es.expression, self.rune_store_subs).is_some())
    }

    fn residue(&self, stmt: &Statement<'a>) -> Option<Vec<Statement<'a>>> {
        let Statement::ExpressionStatement(es) = stmt else {
            return None;
        };
        inspect_residue_local(
            &es.expression,
            es.span.start,
            self.src,
            self.origin,
            self.state,
        )
    }
}

/// [`inspect_residue`] for a statement whose spans are local to `origin`.
fn inspect_residue_local<'a>(
    expr: &OxcExpression<'_>,
    stmt_start: u32,
    src: &str,
    origin: u32,
    state: &ServerTransformState<'a>,
) -> Option<Vec<Statement<'a>>> {
    inspect_residue(expr, stmt_start, src.get(origin as usize..)?, state)
}

/// The statements a removed `$inspect(…)` / `$inspect(…).with(…)` expression
/// statement leaves behind for one call whose spans index into `src` — the dev
/// `console.log(…)` lowering, or the non-dev `;;` pair upstream prints for an
/// `ExpressionStatement` whose expression became `b.empty`.
fn inspect_residue<'a>(
    expr: &OxcExpression<'_>,
    stmt_start: u32,
    src: &str,
    state: &ServerTransformState<'a>,
) -> Option<Vec<Statement<'a>>> {
    let rune_store_subs = rune_names_are_store_subs(state.analysis);
    let kind = inspect_kind(expr, rune_store_subs)?;
    if !state.options.dev {
        // Upstream's `CallExpression` visitor returns `b.empty` as the *new
        // expression* of a surviving `ExpressionStatement`, which esrap prints
        // as the expression's `;` plus the statement's own `;`.
        return Some(vec![
            state.b.empty_kept(stmt_start),
            state.b.empty_kept(stmt_start + 1),
        ]);
    }
    let (args_src, with_fn_src) = inspect_call_srcs(expr, &kind, src);
    Some(
        build_dev_inspect(&kind, &args_src, with_fn_src.as_deref(), state)
            .into_iter()
            .collect(),
    )
}

/// The VALUE a removed `$inspect(…)` / `$inspect(…).with(…)` in an OPERAND slot
/// evaluates to, for a call whose spans are local to `origin`. In dev that is
/// the same lowering [`build_dev_inspect`] emits, unwrapped back to an
/// expression; outside dev the rune produces nothing, so the slot takes
/// `undefined`.
fn inspect_value_expr<'a>(
    expr: &OxcExpression<'_>,
    src: &str,
    origin: u32,
    state: &ServerTransformState<'a>,
) -> Option<OxcExpression<'a>> {
    let kind = inspect_kind(expr, rune_names_are_store_subs(state.analysis))?;
    if !state.options.dev {
        return Some(state.b.id("undefined"));
    }
    let (args_src, with_fn_src) = inspect_call_srcs(expr, &kind, src.get(origin as usize..)?);
    match build_dev_inspect(&kind, &args_src, with_fn_src.as_deref(), state)? {
        Statement::ExpressionStatement(es) => Some(es.unbox().expression),
        _ => None,
    }
}

/// Pull the verbatim argument / `.with` callback source straight from the call
/// spans — preserving operators/whitespace exactly like the text oracle's
/// slice-based extraction.
fn inspect_call_srcs(
    expr: &OxcExpression<'_>,
    kind: &InspectKind,
    src: &str,
) -> (String, Option<String>) {
    let OxcExpression::CallExpression(call) = expr else {
        unreachable!("inspect_kind matched a CallExpression");
    };
    match kind {
        InspectKind::Plain => (call_args_src(call, src), None),
        InspectKind::With => {
            // For `<inner>.with(fn)`, the args belong to the INNER `$inspect(...)`
            // call, and `fn` is this outer call's first argument.
            let inner_args = match &call.callee {
                OxcExpression::StaticMemberExpression(m) => match &m.object {
                    OxcExpression::CallExpression(inner) => call_args_src(inner, src),
                    _ => String::new(),
                },
                _ => String::new(),
            };
            let fn_src = call
                .arguments
                .first()
                .and_then(|a| a.as_expression())
                .map(|e| src[e.span().start as usize..e.span().end as usize].to_string());
            (inner_args, fn_src)
        }
    }
}

/// Build the dev-mode lowering of a `$inspect(...)` / `$inspect(...).with(...)`
/// expression statement as re-parsed statements, mirroring upstream's server
/// `CallExpression` visitor (and the text oracle's `transform_inspect_to_console_log`):
///
/// - `$inspect(args)` → `console.log('$inspect(', args, ')');`
/// - `$inspect(args).with(fn)` → `(fn)('init', args);`
///
/// `arg_slices` is the verbatim source text of each `$inspect(...)` argument
/// (joined with `, `); `with_fn` is the verbatim source of the `.with(<fn>)`
/// callback (for the `With` kind). The emitted statement gets the same whole-
/// statement read-wrap every re-homed instance statement receives, so a derived
/// argument (`$inspect(double)`) becomes `console.log('$inspect(', double(), ')')`.
fn build_dev_inspect<'a>(
    kind: &InspectKind,
    args_src: &str,
    with_fn_src: Option<&str>,
    wrap_reads: bool,
    state: &ServerTransformState<'a>,
) -> Option<Statement<'a>> {
    let text = match kind {
        InspectKind::Plain => {
            format!("console.log('$inspect(', {}, ')');", args_src.trim())
        }
        InspectKind::With => {
            format!(
                "({})('init', {});",
                with_fn_src.unwrap_or("").trim(),
                args_src.trim()
            )
        }
    };
    let mut rehomed = state.reparse_statement(&text)?;
    if wrap_reads {
        super::read_wrap::wrap_reads_in_statement(
            &mut rehomed,
            state.b,
            state.analysis,
            state.analysis.root.instance_scope_index,
        );
    }
    Some(rehomed)
}

/// Register the source region `[prev_end, region_end)` a top-level statement's
/// comments live in, so they can be replayed around whatever it lowers to.
/// `region_end` is the statement's START when only its LEADING comments can be
/// replayed, and its END when the emitted statement is a verbatim re-parse whose
/// spans can be shifted onto the region — which is what carries the INTERIOR
/// ones. Returns the region's provisional base, or `None` when it holds no
/// comment.
fn register_comment_region(
    registry: &mut comments::ChunkRegistry,
    src: &str,
    all: &[Comment],
    prev_end: u32,
    region_end: u32,
) -> Option<u32> {
    if region_end <= prev_end {
        return None;
    }
    let text = src.get(prev_end as usize..region_end as usize)?;
    let kept: Vec<Comment> = all
        .iter()
        .filter(|c| c.span.start >= prev_end && c.span.end <= region_end)
        .map(|c| {
            let mut c = *c;
            c.span = Span::new(c.span.start - prev_end, c.span.end - prev_end);
            c
        })
        .collect();
    registry.register(text, &kept)
}

/// Whether an emitted statement can carry a comment region. An `EmptyStatement`
/// cannot: a bare one is filtered out by the printer, and a kept one (`;;`) is a
/// span sentinel that [`comments::Place`] refuses to rewrite — either way the
/// region would go unreferenced and its comments die.
fn anchors_a_region(stmt: &Statement<'_>) -> bool {
    !matches!(stmt, Statement::EmptyStatement(_))
}

/// Source offset the spans of a statement re-parsed from `src[start..end]` are
/// relative to — `reparse_statement` trims its input.
fn reparse_origin(src: &str, start: u32, end: u32) -> u32 {
    let slice = &src[start as usize..end as usize];
    start + (slice.len() - slice.trim_start().len()) as u32
}

/// Return the end of comments that trail `stmt_end` on its physical line.
/// A comment before another statement belongs to that next statement instead.
fn trailing_comment_end(src: &str, all: &[Comment], stmt_end: u32) -> u32 {
    let mut end = stmt_end;
    let mut found = false;
    for comment in all {
        if comment.span.start < end {
            continue;
        }
        let gap = &src[end as usize..comment.span.start as usize];
        if gap.contains(['\n', '\r']) || !gap.trim().is_empty() {
            break;
        }
        end = comment.span.end;
        found = true;
    }
    if !found {
        return stmt_end;
    }
    let after = &src[end as usize..];
    let line_end = after.find(['\n', '\r']).unwrap_or(after.len());
    if after[..line_end].trim().is_empty() {
        end
    } else {
        stmt_end
    }
}

/// End of the comment run that follows the last statement of an instance script.
/// No emitted statement is left to flush it, so esrap's cursor keeps it pending
/// until the first template expression — or, with none, the component body's own
/// end. Returns `from` when there is nothing left.
fn script_tail_comment_end(all: &[Comment], from: u32) -> u32 {
    all.iter()
        .filter(|comment| comment.span.start >= from)
        .map(|comment| comment.span.end)
        .max()
        .unwrap_or(from)
}

/// The legacy reactive label itself may contain a block, or directly wrap an
/// `if` whose branch does. Those retained blocks are the locations that rewind
/// esrap's comment cursor after the label has been reordered.
fn reactive_body_has_direct_block(stmt: &Statement<'_>) -> bool {
    match stmt {
        Statement::BlockStatement(_) => true,
        Statement::IfStatement(if_stmt) => {
            matches!(&if_stmt.consequent, Statement::BlockStatement(_))
                || if_stmt
                    .alternate
                    .as_ref()
                    .is_some_and(|alternate| matches!(alternate, Statement::BlockStatement(_)))
        }
        _ => false,
    }
}

/// Resolve a top-level statement's registered region into the [`comments::Place`]
/// its emitted statement is stamped with. `verbatim` is the source range the
/// statement was re-parsed from, when it was re-parsed whole.
/// `include_trailing` is false when the emitted statement carries no location of
/// its own (a `$:` label), so a comment trailing it on the same line has nothing
/// to attach to and is left for the script tail instead.
fn place_on_region(
    registry: &mut comments::ChunkRegistry,
    src: &str,
    all: &[Comment],
    prev_end: u32,
    stmt: Span,
    verbatim: Option<Span>,
    include_trailing: bool,
) -> Option<comments::Place> {
    let trailing_end = if include_trailing {
        trailing_comment_end(src, all, stmt.end)
    } else {
        stmt.end
    };
    let region_end = if verbatim.is_some() || trailing_end > stmt.end {
        trailing_end
    } else {
        stmt.start
    };
    let Some(base) = register_comment_region(registry, src, all, prev_end, region_end) else {
        // Upstream keeps every source node's `loc`, so a location-less body it
        // prints before a later comment re-syncs esrap's cursor instead of
        // killing it. A statement that owns no comment still has to hold that
        // position for the template expressions printed after it.
        return place_on_position(registry, src, prev_end, stmt, verbatim);
    };
    Some(match verbatim {
        Some(v) => comments::Place::Shift(base + reparse_origin(src, v.start, v.end) - prev_end),
        None => comments::Place::At(base + stmt.start - prev_end),
    })
}

fn place_on_position(
    registry: &mut comments::ChunkRegistry,
    _src: &str,
    _prev_end: u32,
    _stmt: Span,
    _verbatim: Option<Span>,
) -> Option<comments::Place> {
    let base = registry.register_position(" ")?;
    Some(comments::Place::At(base))
}

/// Split a script's comments into the three classes the carry-over sees:
/// LEADING (inside a `[prev_end, stmt_start)` gap — the only class
/// [`register_leading_comments`] can capture), INTERIOR (inside a top-level
/// statement) and TRAILING (after the last one). The classes are exhaustive and
/// mutually exclusive, so their sum is the total — the denominator the reach
/// counters are missing.
fn classify_comments(body: &[Statement<'_>], all: &[Comment]) {
    if !super::comment_stats::enabled() {
        return;
    }
    super::comment_stats::bump::SCRIPT_COMMENTS_TOTAL(all.len() as u64);
    // Both sequences are in source order, so one pass over each suffices.
    let mut cur = 0usize;
    for c in all {
        while cur < body.len() && body[cur].span().end <= c.span.start {
            cur += 1;
        }
        match body.get(cur) {
            None => super::comment_stats::bump::SCRIPT_COMMENTS_TRAILING(1),
            Some(s) if c.span.end <= s.span().start => {
                super::comment_stats::bump::SCRIPT_COMMENTS_LEADING(1)
            }
            Some(_) => super::comment_stats::bump::SCRIPT_COMMENTS_INTERIOR(1),
        }
    }
}

/// Comments fully inside `[lo, hi]`, for attributing an INTERIOR subset to the
/// site that drops it.
fn comments_in(all: &[Comment], lo: u32, hi: u32) -> u64 {
    all.iter()
        .filter(|c| c.span.start >= lo && c.span.end <= hi)
        .count() as u64
}

/// A statement lowered without a whole-statement reparse: everything between its
/// bounds is rebuilt from sub-slices, so its comments reach no reparse counter.
/// The site count is the denominator a comment count of 0 needs.
fn count_non_reparse(all: &[Comment], span: Span) {
    super::comment_stats::bump::NON_REPARSE_SITES(1);
    super::comment_stats::bump::INTERIOR_NON_REPARSE(comments_in(all, span.start, span.end));
}

/// An `export <decl>` lowered from the declaration's span alone, which skips the
/// `export` keyword and anything between it and the declaration.
fn count_export_keyword(all: &[Comment], exp_start: u32, decl_start: u32) {
    super::comment_stats::bump::EXPORT_KEYWORD_SITES(1);
    super::comment_stats::bump::INTERIOR_EXPORT_KEYWORD(comments_in(all, exp_start, decl_start));
}

/// Parse + lower a single RUNES-mode script into transformed top-level
/// statements. `import_sink` receives instance-script imports to hoist (`None`
/// for module).
/// Phase 1 already accepted the script, so a rejection by the classification
/// parse means the TypeScript eraser produced text that is not JavaScript.
/// Returning an empty body there would ship a component whose `<script>`
/// silently did nothing — output that still parses, so no gate can see it.
fn record_classification_failure(
    state: &ServerTransformState<'_>,
    is_instance: bool,
    diagnostics: &[oxc_diagnostics::OxcDiagnostic],
) {
    let mut slot = state.reparse_failure.borrow_mut();
    if slot.is_some() {
        return;
    }
    *slot = Some(format!(
        "server {} script classification parse rejected the erased source ({} diagnostics): {}",
        if is_instance { "instance" } else { "module" },
        diagnostics.len(),
        diagnostics
            .iter()
            .map(|d| d.message.to_string())
            .collect::<Vec<_>>()
            .join("; ")
    ));
}

fn transform_script<'a>(
    script: &Script,
    state: &mut ServerTransformState<'a>,
    mut import_sink: Option<&mut Vec<Statement<'a>>>,
    is_instance: bool,
) -> Vec<Statement<'a>> {
    let (Some(start), Some(end)) = (script.content.start(), script.content.end()) else {
        return Vec::new();
    };
    let (start, end) = (start as usize, end as usize);
    if end <= start || end > state.source.len() {
        return Vec::new();
    }

    // TypeScript components: strip TS from the script SLICE before parsing, then
    // run the same JS lowering on the stripped text. `strip_typescript` returns a
    // NEW string whose byte offsets do NOT line up with `state.source`, so we must
    // make `src` borrow the stripped buffer and have EVERY downstream sub-slice /
    // reparse cut from `src` (never from `state.source`). This is already how the
    // rest of this function works: the classification parse and every span re-slice
    // index into the local `src`, and the reparse helpers copy the slice text into
    // the state allocator — none of them index `state.source` directly. So binding
    // `src` to the stripped buffer keeps offsets internally consistent.
    let stripped;
    // TS is detected COMPONENT-wide, not per-script: if EITHER script carries
    // `lang="ts"` the whole component is parsed as TS (upstream `force_typescript`),
    // so a `<script>` with no `lang` attribute can still hold TS syntax
    // (`import type …`, `satisfies …`) when a sibling `<script lang="ts">` exists.
    // Strip in that case too — mirrors the OLD oracle's component-wide `is_ts`.
    let src: &str =
        if super::super::helpers::script_is_typescript(script) || state.analysis.is_typescript {
            stripped = crate::compiler::phases::phase2_analyze::types::strip_typescript(
                &state.source[start..end],
            );
            &stripped
        } else {
            &state.source[start..end]
        };

    // Every decision below reads this text (directly, or through spans into it),
    // so the grouping parens around a rune call have to be gone first.
    let paren_stripped;
    let src: &str =
        match crate::compiler::phases::phase3_transform::shared::rune_parens::strip_rune_parens(src)
        {
            Some(stripped) => {
                paren_stripped = stripped;
                &paren_stripped
            }
            None => src,
        };

    // Parse with a FRESH allocator purely for CLASSIFICATION. We never move nodes
    // out of it; every emitted statement is re-parsed from `src` into the state
    // allocator instead.
    let alloc = oxc_allocator::Allocator::default();
    let owned = alloc.alloc_str(src);
    let ret = oxc_parser::Parser::new(&alloc, owned, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        record_classification_failure(state, is_instance, &ret.diagnostics);
        return Vec::new();
    }

    classify_comments(&ret.program.body, &ret.program.comments);

    let mut out: Vec<Statement<'a>> = Vec::new();
    // Start of the region the next EMITTED statement carries. A statement the
    // transform drops does not advance it, so its comments (leading and interior
    // alike) are re-homed onto the next survivor — upstream removes the node and
    // lets esrap's cursor flush them from the enclosing body for the same effect.
    let mut region_start: u32 = 0;

    for stmt in ret.program.body.iter() {
        let stmt_span = stmt.span();
        let out_len = out.len();
        let sink_len = import_sink.as_deref().map_or(0, Vec::len);
        // Set by every branch that re-parses the statement WHOLE from a source
        // range, to that range.
        let mut verbatim: Option<Span> = None;
        // Comment-carry for a rune-lowered VariableDeclaration: worth doing only
        // when the statement (or its trailing line) actually holds a comment.
        let trailing_end = trailing_comment_end(src, &ret.program.comments, stmt_span.end);
        let carry_wanted = ret
            .program
            .comments
            .iter()
            .any(|c| c.span.start >= stmt_span.start && c.span.end <= trailing_end);
        let mut carried = false;

        'emit: {
            match stmt {
                // Deliberately NOT `verbatim`: an import is hoisted out of the
                // component function, but upstream leaves its comments behind
                // inside it, so replaying them in place would put them in the
                // wrong function.
                Statement::ImportDeclaration(imp) => {
                    let slice = &src[imp.span.start as usize..imp.span.end as usize];
                    if let Some(rehomed) = state.reparse_statement(slice) {
                        match import_sink.as_deref_mut() {
                            Some(sink) => sink.push(rehomed),
                            None => out.push(rehomed),
                        }
                    }
                }
                Statement::VariableDeclaration(vd) => {
                    let lowered = lower_variable_declaration(
                        vd,
                        src,
                        is_instance,
                        state,
                        &mut verbatim,
                        carry_wanted,
                        &mut carried,
                    );
                    if verbatim.is_none() {
                        count_non_reparse(&ret.program.comments, vd.span);
                    }
                    out.extend(lowered);
                }
                // INSTANCE-only `ExportNamedDeclaration` override (写经 the per-instance
                // visitor added in `transform-server.js` line ~127): a declaration-less
                // `export { a, b }` (accessor / re-export) is dropped (`b.empty`); an
                // `export <decl>` unwraps to visiting the inner declaration (the
                // `export` keyword is removed). The MODULE script uses the bare
                // `global_visitors`, which has NO `ExportNamedDeclaration` visitor, so a
                // module `export class` / `export const` is kept VERBATIM (export
                // retained) — that falls through to the `other =>` catch-all below.
                Statement::ExportNamedDeclaration(_) | Statement::ExportFromDeclaration(_)
                    if is_instance =>
                {
                    // `export { count }` → removed.
                    break 'emit;
                }
                Statement::ExportDeclaration(exp) if is_instance => {
                    match &exp.declaration {
                        oxc_ast::ast::Declaration::VariableDeclaration(vd) => {
                            count_export_keyword(
                                &ret.program.comments,
                                exp.span.start,
                                vd.span.start,
                            );
                            let lowered = lower_variable_declaration(
                                vd,
                                src,
                                is_instance,
                                state,
                                &mut verbatim,
                                carry_wanted,
                                &mut carried,
                            );
                            if verbatim.is_none() {
                                count_non_reparse(&ret.program.comments, vd.span);
                            }
                            out.extend(lowered);
                        }
                        decl => {
                            // `export function` / `export class` → keep the inner
                            // declaration verbatim (re-parsed from its source span)
                            // with the same read-wrap every re-homed statement gets.
                            let span = decl.span();
                            count_export_keyword(&ret.program.comments, exp.span.start, span.start);
                            let slice = &src[span.start as usize..span.end as usize];
                            if let Some(mut rehomed) = state.reparse_statement(slice) {
                                verbatim = Some(span);
                                super::read_wrap::wrap_reads_in_statement(
                                    &mut rehomed,
                                    state.b,
                                    state.analysis,
                                    state.analysis.root.instance_scope_index,
                                );
                                out.push(rehomed);
                            }
                        }
                    }
                }
                // MODULE-script `export <decl>` (`!is_instance`): kept VERBATIM (export
                // retained — module exports are NOT instance props), but the inner
                // declaration's top-level `$state` / `$derived` runes still lower (写经
                // the tree-wide server `CallExpression` / `VariableDeclaration` visitors
                // firing on the module body). E.g. `<script module> export let route =
                // $state({})` → `export let route = {}`.
                Statement::ExportDeclaration(exp) if !is_instance => {
                    let span = exp.span();
                    let slice = &src[span.start as usize..span.end as usize];
                    if let Some(mut rehomed) = state.reparse_statement(slice) {
                        verbatim = Some(span);
                        lower_module_export_runes(&mut rehomed, state);
                        super::read_wrap::wrap_reads_in_statement(
                            &mut rehomed,
                            state.b,
                            state.analysis,
                            state.analysis.root.instance_scope_index,
                        );
                        out.push(rehomed);
                    }
                }
                Statement::ExpressionStatement(es) => {
                    // DEV mode: a top-level `$inspect(args)` / `$inspect(args).with(fn)`
                    // is NOT removed — upstream's server `CallExpression` visitor lowers
                    // it to a `console.log('$inspect(', args, ')')` / `(fn)('init', args)`
                    // call (`$inspect.trace` is still removed in dev). Detect it before
                    // the generic effect/inspect removal so we keep the call.
                    let rune_store_subs = rune_names_are_store_subs(state.analysis);
                    if state.options.dev && inspect_kind(&es.expression, rune_store_subs).is_some()
                    {
                        if let Some(stmt) = dev_inspect_statement(
                            &es.expression,
                            rune_store_subs,
                            true,
                            state,
                            &|e| src[e.span().start as usize..e.span().end as usize].to_string(),
                        ) {
                            out.push(stmt);
                        }
                        break 'emit;
                    }
                    if is_removed_effect_stmt(&es.expression, rune_store_subs) {
                        // Under `experimental.async`, a removed `$inspect(...)` /
                        // `$effect(...)` statement must leave a PLACEHOLDER behind so
                        // the async-body transform keeps its `$$promises` slot (the
                        // text-based `transform_async_body` turns the placeholder into
                        // a `() => void 0` thunk, preserving every later expression's
                        // blocker index). Mirrors upstream's `/* $$async_hole */`
                        // marker (server `transform_script.rs`). A removed `$inspect`
                        // uses a DISTINCT `$$inspect_hole` marker so that, if no
                        // top-level await actually splits the body, the fall-through
                        // can rehydrate it as `;;` (see below) instead of dropping it.
                        if state.eval_inputs.use_async {
                            let marker = if inspect_kind(&es.expression, rune_store_subs).is_some()
                            {
                                inspect_hole_placeholder(state)
                            } else {
                                async_hole_placeholder(state)
                            };
                            if let Some(marker) = marker {
                                out.push(marker);
                            }
                            break 'emit;
                        }
                        // Sync mode: a removed `$inspect(...)` / `$inspect(...).with(...)`
                        // is NOT simply dropped. Upstream's server `ExpressionStatement`
                        // visitor calls `context.next()`, and the inner `CallExpression`
                        // visitor returns `b.empty` (an `EmptyStatement`) as the *new
                        // expression* of the still-present `ExpressionStatement`. esrap
                        // prints that empty-as-expression as `;` plus the statement's own
                        // `;` → a literal `;;` per inspect (verified against every
                        // `inspect-*` server fixture). We can't model an
                        // `ExpressionStatement` wrapping an `EmptyStatement` in oxc's
                        // typed AST, so emit two *kept* sentinel empties whose printed
                        // `;\n;` canonicalizes to the same `;;`. Distinct `start`s keep
                        // the body-sequence comment-resync treating them as separate.
                        //
                        // `$effect` / `$effect.pre` / `$effect.root` / `$inspect.trace`
                        // are removed by the `ExpressionStatement` visitor itself
                        // returning `b.empty` — a *bare* `EmptyStatement` that esrap
                        // elides (prints nothing), so those keep being dropped.
                        if let Some(residue) =
                            inspect_residue(&es.expression, es.span.start, src, state)
                        {
                            out.extend(residue);
                        }
                        break 'emit;
                    }
                    let slice = &src[es.span.start as usize..es.span.end as usize];
                    if let Some(mut rehomed) = state.reparse_statement(slice) {
                        verbatim = Some(es.span);
                        // A re-parsed statement's spans are local to `slice`, which is
                        // its own verbatim source.
                        lower_nested_inspect(&mut rehomed, slice, 0, state);
                        // Read-wrap the whole statement: derived / store reads (`d` →
                        // `d()`, `$x` → `$.store_get(...)`), derived / store WRITES &
                        // UPDATES (`count++` → `$.update_derived(count)`), and private
                        // `this.#derived` reads — exactly as upstream's tree-wide
                        // server `Identifier` / `AssignmentExpression` / `UpdateExpression`
                        // / `MemberExpression` visitors fire on every instance-body node.
                        super::read_wrap::wrap_reads_in_statement(
                            &mut rehomed,
                            state.b,
                            state.analysis,
                            state.analysis.root.instance_scope_index,
                        );
                        out.push(rehomed);
                    }
                }
                other => {
                    let span = other.span();
                    let slice = &src[span.start as usize..span.end as usize];
                    if let Some(mut rehomed) = state.reparse_statement(slice) {
                        verbatim = Some(span);
                        lower_nested_inspect(&mut rehomed, slice, 0, state);
                        // Same whole-statement read-wrap for every other re-homed
                        // verbatim instance statement (function declarations, `if` /
                        // `for` / blocks, class declarations — the private-derived
                        // member wrap applies inside class bodies).
                        super::read_wrap::wrap_reads_in_statement(
                            &mut rehomed,
                            state.b,
                            state.analysis,
                            state.analysis.root.instance_scope_index,
                        );
                        out.push(rehomed);
                    }
                }
            }
        }

        let into_sink = import_sink.as_deref().is_some_and(|s| s.len() > sink_len);
        let anchor = out.iter().skip(out_len).position(anchors_a_region);
        if !into_sink && anchor.is_none() {
            continue;
        }
        if carried {
            // Every emitted statement's spans are source-absolute, so the whole
            // region shifts onto the chunk like a verbatim re-parse — including
            // the statement's interior comments.
            if let Some(base) = register_comment_region(
                &mut state.comments,
                src,
                &ret.program.comments,
                region_start,
                trailing_end,
            ) {
                let mut place = comments::Place::Shift(base - region_start);
                for emitted in out.iter_mut().skip(out_len) {
                    place.visit_statement(emitted);
                }
            }
            region_start = trailing_end;
            continue;
        }
        // Anchor the region on the first statement this source statement emitted
        // that can carry one.
        let mut place = place_on_region(
            &mut state.comments,
            src,
            &ret.program.comments,
            region_start,
            stmt_span,
            verbatim,
            true,
        );
        if place.is_none() && verbatim.is_some() && !ret.program.comments.is_empty() {
            place = place_on_position(&mut state.comments, src, region_start, stmt_span, verbatim);
        }
        if let Some(mut place) = place {
            if into_sink {
                if let Some(sink) = import_sink.as_deref_mut()
                    && let Some(first) = sink.get_mut(sink_len)
                {
                    place.visit_statement(first);
                }
            } else if let Some(first) = anchor.and_then(|i| out.get_mut(out_len + i)) {
                place.visit_statement(first);
            }
        }
        region_start = if verbatim.is_some() || trailing_end > stmt_span.end {
            trailing_end
        } else {
            stmt_span.end
        };
    }

    if is_instance {
        let tail_end = script_tail_comment_end(&ret.program.comments, region_start);
        if tail_end > region_start {
            state.defer_tail_comments(src, &ret.program.comments, region_start, tail_end);
        }
    }

    // Lower `$state` / `$derived` class-field initializers in every emitted
    // statement — class DECLARATIONS, class EXPRESSIONS (`const C = class {…}`)
    // and NESTED classes alike (写经 `PropertyDefinition.js`, a tree-wide
    // visitor). Cheap: the walk only descends, firing on `PropertyDefinition`s.
    // In dev an `$inspect(…)` is LOWERED, not removed, and upstream's
    // `CallExpression` visitor is tree-wide — so a call in a function body, a
    // bare block or a class method reaches it too. Both removals below walk
    // nested statement lists, so the lowering has to run before either.
    if state.options.dev {
        for stmt in out.iter_mut() {
            lower_nested_dev_inspect(stmt, state);
        }
    }
    for stmt in out.iter_mut() {
        lower_class_field_runes(stmt, state);
    }
    // Lower `$state` / `$derived` / `$derived.by` runes and remove `$effect` /
    // `$inspect` statements that appear NESTED inside function / block bodies
    // (e.g. a `<script module>` factory function `createCounter()` whose body
    // declares `let count = $state(0); let double = $derived(count * 2)`). The
    // top-level loop above only handles SCRIPT-LEVEL statements; upstream's
    // `VariableDeclaration` / `CallExpression` / `ExpressionStatement` /
    // `Identifier` server visitors are tree-wide zimmerframe visitors, so they
    // fire at every nesting depth. This pass descends into nested function /
    // block bodies and applies the same lowerings, tracking the set of names
    // that became `$.derived(...)` so their reads turn into `name()` calls.
    for stmt in out.iter_mut() {
        lower_nested_runes(stmt, state);
    }
    // Lower `$effect.tracking()` → `false`, `$effect.root(…)` → `() => {}`,
    // `$effect.pending()` → `0` as expression VALUES anywhere they appear in the
    // emitted instance statements (script-level `const foo = $effect.tracking()`
    // / `const cleanup = $effect.root(…)`, getters/setters, nested function
    // bodies, derived initializers — 写经 the tree-wide server `CallExpression`
    // visitor). The bare top-level `$effect(…)` / `$effect.pre(…)` STATEMENTS are
    // already removed above; this only handles the value-position runes that the
    // statement-removal path does not reach.
    for stmt in out.iter_mut() {
        lower_effect_value_runes(stmt, state);
    }
    out
}

/// Rewrite the always-noop server forms of `$effect.*` runes when they appear as
/// expression VALUES (not removed statements). Tree-wide, mirroring upstream's
/// server `CallExpression` visitor:
/// - `$effect.tracking()` → `false`
/// - `$effect.root(…)` → `() => {}` (a no-op cleanup function)
/// - `$effect.pending()` → `0`
pub(super) fn lower_effect_value_runes<'a>(
    stmt: &mut Statement<'a>,
    state: &ServerTransformState<'a>,
) {
    let mut v = EffectValueLower {
        b: state.b,
        dev: state.options.dev,
        source: state.source,
    };
    v.visit_statement(stmt);
}

/// Expression-position variant of [`lower_effect_value_runes`] used by the
/// template expression path (`visit_expr`).
pub(super) fn lower_effect_value_runes_expr<'a>(
    expr: &mut OxcExpression<'a>,
    b: B<'a>,
    dev: bool,
    source: &'a str,
) {
    let mut v = EffectValueLower { b, dev, source };
    v.visit_expression(expr);
}

/// Drop statement-position `$effect(…)` / `$effect.pre(…)` / `$inspect(…)` calls
/// that appear inside a nested function / arrow body of a TEMPLATE expression —
/// e.g. `{(() => { $effect(() => …); })()}`. Mirrors upstream's server
/// `ExpressionStatement` visitor returning `b.empty` for an effect / inspect rune
/// call, applied tree-wide below the template-expression root. Uses
/// [`NestedRuneLower`] in nested-body mode so it only touches arrow / function
/// bodies (a bare top-level template `$effect.tracking()` value-position rune is
/// handled by [`lower_effect_value_runes_expr`] instead).
pub(super) fn lower_nested_runes_in_expr<'a>(
    expr: &mut OxcExpression<'a>,
    b: B<'a>,
    rune_store_subs: bool,
) {
    let mut v = NestedRuneLower {
        b,
        derived: vec![rustc_hash::FxHashSet::default()],
        in_nested_body: false,
        // Template-expression nested bodies (effect-drop pass) never carry a
        // top-level instance `$derived(await …)`; async-derived lowering is N/A.
        use_async: false,
        rune_store_subs,
    };
    v.visit_expression(expr);
}

struct EffectValueLower<'a> {
    b: B<'a>,
    dev: bool,
    source: &'a str,
}

fn snapshot_ignore(source: &str, _start: u32) -> bool {
    source.contains("svelte-ignore state_snapshot_uncloneable")
}

impl<'a> EffectValueLower<'a> {
    /// If `expr` is a `$effect.{tracking,root,pending}(…)` call, return its
    /// server-lowered replacement expression.
    fn lowered(&self, expr: &OxcExpression<'a>) -> Option<OxcExpression<'a>> {
        let OxcExpression::CallExpression(call) = expr else {
            return None;
        };
        let OxcExpression::StaticMemberExpression(m) = &call.callee else {
            return None;
        };
        let OxcExpression::Identifier(obj) = &m.object else {
            return None;
        };
        if obj.name.as_str() != "$effect" {
            return None;
        }
        match m.property.name.as_str() {
            "tracking" => Some(self.b.bool(false)),
            "root" => Some(self.b.thunk_block(vec![], false)),
            "pending" => Some(self.b.number(0.0)),
            _ => None,
        }
    }
}

/// `$state.eager` / `$state.snapshot` call detection (server `CallExpression`).
#[derive(PartialEq, Eq)]
enum StateDotRune {
    Eager,
    Snapshot,
}

fn state_dot_rune(expr: &OxcExpression) -> Option<StateDotRune> {
    let OxcExpression::CallExpression(call) = expr else {
        return None;
    };
    let OxcExpression::StaticMemberExpression(m) = &call.callee else {
        return None;
    };
    let OxcExpression::Identifier(obj) = &m.object else {
        return None;
    };
    if obj.name.as_str() != "$state" {
        return None;
    }
    match m.property.name.as_str() {
        "eager" => Some(StateDotRune::Eager),
        "snapshot" => Some(StateDotRune::Snapshot),
        _ => None,
    }
}

/// Whether `expr` is a bare `$host()` call (the `$host` rune). `$host` is a
/// reserved rune identifier that cannot be shadowed, so any call to a bare
/// `$host` identifier is the rune.
fn is_host_rune_call(expr: &OxcExpression) -> bool {
    let OxcExpression::CallExpression(call) = expr else {
        return false;
    };
    matches!(&call.callee, OxcExpression::Identifier(id) if id.name.as_str() == "$host")
}

impl<'a> VisitMut<'a> for EffectValueLower<'a> {
    fn visit_expression(&mut self, expr: &mut OxcExpression<'a>) {
        if let Some(replacement) = self.lowered(expr) {
            *expr = replacement;
            return;
        }
        // `$host()` → `void 0` (写经 upstream server `CallExpression.js`: the
        // `$host` rune has no server meaning, so the call site collapses to
        // `void 0` — `(void 0).dispatchEvent(...)`, `const el = void 0`).
        if is_host_rune_call(expr) {
            *expr = self.b.void0();
            return;
        }
        // `$state.eager(arg)` → `arg`; `$state.snapshot(arg)` → `$.snapshot(arg)`
        // (写经 upstream server `CallExpression.js`). Applied tree-wide so it fires
        // in `{#if $state.eager(x) !== x}` tests, `$.escape($state.eager(v))`
        // template interpolations, and instance statements alike.
        if let Some(kind) = state_dot_rune(expr) {
            let (arg, ignored) = match std::mem::replace(expr, self.b.void0()) {
                OxcExpression::CallExpression(call) => {
                    let call = call.unbox();
                    let ignored = self.dev && snapshot_ignore(self.source, call.span.start);
                    (
                        call.arguments
                            .into_iter()
                            .next()
                            .and_then(|a| OxcExpression::try_from(a).ok()),
                        ignored,
                    )
                }
                _ => (None, false),
            };
            let arg = arg.unwrap_or_else(|| self.b.void0());
            *expr = match kind {
                StateDotRune::Eager => arg,
                StateDotRune::Snapshot => {
                    let mut args = vec![arg];
                    if ignored {
                        args.push(self.b.bool(true));
                    }
                    self.b.call("$.snapshot", args)
                }
            };
            // Recurse: the unwrapped/wrapped argument may itself contain runes.
            self.visit_expression(expr);
            return;
        }
        oxc_ast_visit::walk_mut::walk_expression(self, expr);
    }

    fn visit_variable_declarator(&mut self, decl: &mut oxc_ast::ast::VariableDeclarator<'a>) {
        // Upstream's server `VariableDeclaration` visitor takes `args[0] ?? void 0`
        // for a rune it does not special-case, so a declarator initializer never
        // reaches the `CallExpression` visitor that lowers `$effect.pending()`
        // to `0`. `effect_pending_ast.rs` already implements this for modules.
        if decl.init.as_ref().is_some_and(is_effect_pending_call) {
            decl.init = Some(self.b.void0());
            return;
        }
        oxc_ast_visit::walk_mut::walk_variable_declarator(self, decl);
    }
}

/// `$effect.pending(…)` as a call expression.
fn is_effect_pending_call(expr: &OxcExpression) -> bool {
    let OxcExpression::CallExpression(call) = expr else {
        return false;
    };
    let OxcExpression::StaticMemberExpression(m) = &call.callee else {
        return false;
    };
    let OxcExpression::Identifier(obj) = &m.object else {
        return false;
    };
    obj.name.as_str() == "$effect" && m.property.name.as_str() == "pending"
}

/// Tree-wide nested-rune lowering for the bodies of NESTED functions / blocks
/// (NOT the script top level, which `transform_script` already handles). Mirrors
/// upstream's tree-wide `VariableDeclaration` / `CallExpression` /
/// `ExpressionStatement` / `Identifier` server visitors operating below the
/// script root.
///
/// For every nested statement body it visits:
/// - `let x = $state(e)` → `let x = e` (no-arg → `void 0`).
/// - `let d = $derived(e)` → `let d = $.derived(() => e)`; `$derived.by(f)` →
///   `$.derived(f)`. The name `d` is recorded as derived so later reads become
///   `d()`.
/// - `$effect(…)` / `$effect.pre(…)` / `$effect.root(…)` / `$inspect(…)` /
///   `$inspect.trace(…)` / `$inspect(…).with(…)` expression statements → removed.
/// - a read of a recorded derived name `d` → `d()`.
fn lower_nested_runes<'a>(stmt: &mut Statement<'a>, state: &ServerTransformState<'a>) {
    let mut v = NestedRuneLower {
        b: state.b,
        derived: vec![rustc_hash::FxHashSet::default()],
        in_nested_body: false,
        use_async: state.eval_inputs.use_async,
        rune_store_subs: rune_names_are_store_subs(state.analysis),
    };
    v.visit_statement(stmt);
}

/// Lower the top-level `$state` / `$derived` runes in a MODULE-script
/// `export let/const/var <decl> = <rune>` declaration IN PLACE, keeping the
/// `export` keyword. The module script keeps its exports verbatim (no instance
/// prop-stripping), but upstream's tree-wide server `CallExpression` /
/// `VariableDeclaration` visitors still fire on the module body, so a module
/// `export let route = $state({})` lowers its initializer to `export let route =
/// {}`. Reuses [`NestedRuneLower::lower_var_decl`] with the nested flag forced on
/// so the declarator's rune init is expanded exactly like a nested one.
fn lower_module_export_runes<'a>(stmt: &mut Statement<'a>, state: &ServerTransformState<'a>) {
    let Statement::ExportDeclaration(exp) = stmt else {
        return;
    };
    let oxc_ast::ast::Declaration::VariableDeclaration(vd) = &mut exp.declaration else {
        return;
    };
    let mut v = NestedRuneLower {
        b: state.b,
        derived: vec![rustc_hash::FxHashSet::default()],
        in_nested_body: true,
        use_async: state.eval_inputs.use_async,
        rune_store_subs: rune_names_are_store_subs(state.analysis),
    };
    v.lower_var_decl(vd);
}

/// `VisitMut` that lowers nested-scope runes and rewrites derived reads. A scope
/// stack (`derived`) tracks the names that lowered to `$.derived(...)` so a later
/// identifier read of such a name is rewritten to a call. A `shadow`-style frame
/// is pushed per function / block so a derived name does not leak across scopes
/// it is not visible in (a nested re-declaration of the same name as a plain
/// `let` removes it from the derived set for that frame).
struct NestedRuneLower<'a> {
    b: B<'a>,
    /// Stack of frames; each frame is the set of derived binding names declared
    /// in that lexical scope.
    derived: Vec<rustc_hash::FxHashSet<String>>,
    /// Whether we are inside a nested function / block body (i.e. below the
    /// script top level). Lowering only fires when this is `true`, so the
    /// script-level statements already handled by `transform_script` are not
    /// double-processed.
    in_nested_body: bool,
    /// `experimental.async`: enables the `$derived(await X)` →
    /// `await $.async_derived(() => X)` lowering (写经
    /// `VariableDeclaration.js:87-96`). Without it (or without an `await` arg),
    /// `$derived(e)` stays the plain `$.derived(() => e)`.
    use_async: bool,
    /// See [`rune_names_are_store_subs`].
    rune_store_subs: bool,
}

impl<'a> NestedRuneLower<'a> {
    /// Whether `name` resolves to a derived binding in any enclosing frame.
    fn is_derived(&self, name: &str) -> bool {
        self.derived.iter().any(|f| f.contains(name))
    }

    /// Lower the declarators of a `let/const/var` in place when nested. Records
    /// derived names; expands `$state`/`$derived` identifier declarators.
    fn lower_var_decl(&mut self, vd: &mut oxc_ast::ast::VariableDeclaration<'a>) {
        self.lower_var_decl_inner(vd, true);
    }

    /// `register_derived` is false for a `for` head, whose bindings the
    /// script-level read wrap already resolves — registering them again wraps
    /// every read twice.
    fn lower_var_decl_inner(
        &mut self,
        vd: &mut oxc_ast::ast::VariableDeclaration<'a>,
        register_derived: bool,
    ) {
        let b = self.b;
        for d in vd.declarations.iter_mut() {
            let Some(rune) = d.init.as_ref().and_then(detect_decl_rune) else {
                // A plain re-declaration of a name shadows any outer derived
                // binding for this frame.
                if let oxc_ast::ast::BindingPattern::BindingIdentifier(id) = &d.id
                    && let Some(frame) = self.derived.last_mut()
                {
                    frame.remove(id.name.as_str());
                }
                continue;
            };
            // Only handle the identifier-pattern forms here (the destructured
            // expansions are an orthogonal axis handled at the script top level).
            let bind_name = match &d.id {
                oxc_ast::ast::BindingPattern::BindingIdentifier(id) => Some(id.name.to_string()),
                _ => None,
            };
            // Pull the first call argument expression out of the init call.
            let arg: Option<OxcExpression<'a>> = match d.init.take().map(take_without_parens) {
                Some(OxcExpression::CallExpression(call)) => {
                    let mut call = call.unbox();
                    call.arguments
                        .drain(..)
                        .next()
                        .and_then(|a| OxcExpression::try_from(a).ok())
                }
                _ => None,
            };
            match rune {
                DeclRune::State => {
                    d.init = Some(arg.unwrap_or_else(|| b.void0()));
                }
                DeclRune::Derived => {
                    d.init = arg.map(|e| {
                        // Async `$derived(await EXPR)` (写经
                        // `VariableDeclaration.js:87-96`): under `experimental.async`,
                        // a top-level `await` in the derived argument lowers the whole
                        // declarator to `await $.async_derived(() => EXPR)` (the leading
                        // `await` is stripped by the server `AwaitExpression` visitor
                        // before the thunk). A surviving NESTED await keeps the thunk
                        // `async`. Otherwise it stays the sync `$.derived(() => e)`.
                        if self.use_async
                            && let OxcExpression::AwaitExpression(await_box) = e
                        {
                            let inner = await_box.unbox().argument;
                            let nested_await = expr_has_await(&inner);
                            b.await_expr(
                                b.call("$.async_derived", vec![b.thunk(inner, nested_await)]),
                            )
                        } else {
                            b.call("$.derived", vec![b.thunk(e, false)])
                        }
                    });
                    if register_derived
                        && let Some(n) = bind_name
                        && let Some(frame) = self.derived.last_mut()
                    {
                        frame.insert(n);
                    }
                }
                DeclRune::DerivedBy => {
                    d.init = arg.map(|e| b.call("$.derived", vec![e]));
                    if register_derived
                        && let Some(n) = bind_name
                        && let Some(frame) = self.derived.last_mut()
                    {
                        frame.insert(n);
                    }
                }
                // `$props` / `$props.id` are not valid in a nested factory body in
                // any in-scope fixture; leave them untouched (init already taken,
                // restore is unnecessary because this never matches here).
                DeclRune::Props | DeclRune::PropsId => {}
            }
        }
    }
}

impl<'a> VisitMut<'a> for NestedRuneLower<'a> {
    fn visit_statement(&mut self, stmt: &mut Statement<'a>) {
        let active = self.in_nested_body;
        // Remove nested effect / inspect expression statements.
        if active
            && let Statement::ExpressionStatement(es) = stmt
            && is_removed_effect_stmt(&es.expression, self.rune_store_subs)
        {
            *stmt = self.b.empty();
            return;
        }
        if active && let Statement::VariableDeclaration(vd) = stmt {
            self.lower_var_decl(vd);
        }
        // Anything below this statement is nested by definition, so a block,
        // `if`, loop, `switch` case or class static block needs no arm of its
        // own — only its own frame, so a derived name does not outlive it.
        let prev = self.in_nested_body;
        self.in_nested_body = true;
        self.derived.push(rustc_hash::FxHashSet::default());
        oxc_ast_visit::walk_mut::walk_statement(self, stmt);
        self.derived.pop();
        self.in_nested_body = prev;
    }

    fn visit_for_statement(&mut self, it: &mut oxc_ast::ast::ForStatement<'a>) {
        // A `for` head declaration is not a `Statement`, so it never reaches
        // `visit_statement`; upstream lowers `for (let r = $state(1); …)` too.
        if self.in_nested_body
            && let Some(oxc_ast::ast::ForStatementInit::VariableDeclaration(vd)) = &mut it.init
        {
            self.lower_var_decl_inner(vd, false);
        }
        oxc_ast_visit::walk_mut::walk_for_statement(self, it);
    }

    fn visit_expression(&mut self, expr: &mut OxcExpression<'a>) {
        if self.in_nested_body
            && let OxcExpression::Identifier(id) = expr
        {
            let name = id.name.to_string();
            if self.is_derived(&name) {
                *expr = self.b.call(self.b.id(&name), vec![]);
                return;
            }
        }
        oxc_ast_visit::walk_mut::walk_expression(self, expr);
    }

    fn visit_function(
        &mut self,
        it: &mut oxc_ast::ast::Function<'a>,
        flags: oxc_syntax::scope::ScopeFlags,
    ) {
        let prev = self.in_nested_body;
        self.in_nested_body = true;
        self.derived.push(rustc_hash::FxHashSet::default());
        oxc_ast_visit::walk_mut::walk_function(self, it, flags);
        self.derived.pop();
        self.in_nested_body = prev;
    }

    fn visit_arrow_function_expression(
        &mut self,
        it: &mut oxc_ast::ast::ArrowFunctionExpression<'a>,
    ) {
        let prev = self.in_nested_body;
        self.in_nested_body = true;
        self.derived.push(rustc_hash::FxHashSet::default());
        oxc_ast_visit::walk_mut::walk_arrow_function_expression(self, it);
        self.derived.pop();
        self.in_nested_body = prev;
    }
}

/// Lower `$state` / `$state.raw` / `$derived` / `$derived.by` class-field
/// initializers in a re-homed class declaration STATEMENT, in place (写经
/// `3-transform/server/visitors/PropertyDefinition.js`).
///
/// - `count = $state(0)` → `count = 0`; `x = $state()` → `x` (value dropped to
///   `None`, i.e. a bare class field — NOT `void 0`).
/// - `d = $derived(e)` → `d = $.derived(() => e)`; `d = $derived.by(f)` →
///   `d = $.derived(f)`; `d = $derived()` → `d` (value dropped).
///
/// Only top-level (non-nested) class-field runes are handled; method bodies and
/// nested classes pass through unchanged (the `value` of a method is a
/// `Function`, not a `PropertyDefinition`, so it is untouched).
fn lower_class_field_runes<'a>(stmt: &mut Statement<'a>, state: &ServerTransformState<'a>) {
    let mut v = ClassFieldRuneLower {
        b: state.b,
        rune_store_subs: rune_names_are_store_subs(state.analysis),
    };
    v.visit_statement(stmt);
}

/// `VisitMut` that lowers every `PropertyDefinition` rune initializer it
/// encounters, recursing through the whole statement subtree. Unlike a single
/// top-level loop this reaches class fields inside a class EXPRESSION
/// (`const C = class { x = $state(0) }`), inside a NESTED class (a class
/// declared in a method body), and inside any other expression position —
/// matching upstream's `PropertyDefinition.js` zimmerframe visitor, which fires
/// on every `PropertyDefinition` in the tree.
struct ClassFieldRuneLower<'a> {
    b: B<'a>,
    /// `<svelte:options runes={false} />` makes `$effect` / `$inspect` store
    /// subscriptions, so the statement removal below must not fire.
    rune_store_subs: bool,
}

impl<'a> ClassFieldRuneLower<'a> {
    /// Lower a `$state` / `$state.raw` / `$derived` / `$derived.by` property
    /// initializer in place: `count = $state(0)` → `count = 0`, etc. Returns the
    /// detected rune (so the caller can decide whether public-`$derived` needs
    /// the private-backing-field + getter/setter rewrite).
    fn lower_property_init(
        &mut self,
        prop: &mut oxc_ast::ast::PropertyDefinition<'a>,
    ) -> Option<DeclRune> {
        let rune = prop.value.as_ref().and_then(detect_decl_rune)?;
        // Upstream's server `PropertyDefinition` handles only `$state` /
        // `$state.raw` / `$derived` / `$derived.by`. `$state.snapshot` falls
        // through to the tree-wide `CallExpression` visitor, which WRAPS it in
        // `$.snapshot(…)` — the opposite of the strip a declarator initializer
        // gets, and `detect_decl_rune` answers the declarator's question.
        if prop
            .value
            .as_ref()
            .is_some_and(|v| state_dot_rune(v) == Some(StateDotRune::Snapshot))
        {
            return None;
        }
        let b = self.b;
        // Take the `$state(...)` / `$derived(...)` call out and move its first
        // argument expression out directly (the rehomed call already lives in the
        // state allocator — no re-parse).
        if let Some(OxcExpression::CallExpression(call)) =
            prop.value.take().map(take_without_parens)
        {
            let mut call = call.unbox();
            // The emitted statement was already read-wrapped whole (the emit
            // loop / declarator paths wrap before this lowering runs), so the
            // argument must NOT be wrapped again — a derived read `e` is
            // already `e()`, and re-wrapping makes it `e()()`.
            let arg: Option<OxcExpression<'a>> = call
                .arguments
                .drain(..)
                .next()
                .and_then(|a| OxcExpression::try_from(a).ok());
            prop.value = match rune {
                // `$state(x)` → `x`; no-arg `$state()` → bare field (`None`).
                DeclRune::State => arg,
                DeclRune::Derived => arg.map(|e| b.call("$.derived", vec![b.thunk(e, false)])),
                DeclRune::DerivedBy => arg.map(|e| b.call("$.derived", vec![e])),
                // `$props` / `$props.id` are not valid class-field runes.
                DeclRune::Props | DeclRune::PropsId => None,
            };
        }
        Some(rune)
    }

    /// Lower a `$state` / `$state.raw` / `$derived` / `$derived.by` call that
    /// appears as the RHS of a constructor `this.x = …` assignment. Unlike
    /// [`Self::lower_property_init`] (which drops the value of an arg-less
    /// `$state()`), this matches upstream's `CallExpression` server visitor in
    /// assignment context: an arg-less `$state()` lowers to `void 0` (写经
    /// `CallExpression.js`: `node.arguments[0] ? visit(...) : b.void0`).
    ///
    /// Returns the lowered RHS expression to substitute, or `None` if the
    /// expression is not a recognised class-field rune (left unchanged).
    fn lower_assign_rhs(
        &mut self,
        rhs: &mut OxcExpression<'a>,
    ) -> Option<(DeclRune, OxcExpression<'a>)> {
        let rune = detect_decl_rune(rhs)?;
        let b = self.b;
        let taken = take_without_parens(std::mem::replace(rhs, b.void0()));
        let OxcExpression::CallExpression(call) = taken else {
            return None;
        };
        let mut call = call.unbox();
        // Already read-wrapped by the whole-statement pass — see
        // `lower_property_init`.
        let arg: Option<OxcExpression<'a>> = call
            .arguments
            .drain(..)
            .next()
            .and_then(|a| OxcExpression::try_from(a).ok());
        let lowered = match rune {
            // `$state(x)` → `x`; arg-less `$state()` → `void 0`.
            DeclRune::State => arg.unwrap_or_else(|| b.void0()),
            DeclRune::Derived => arg
                .map(|e| b.call("$.derived", vec![b.thunk(e, false)]))
                .unwrap_or_else(|| b.void0()),
            DeclRune::DerivedBy => arg
                .map(|e| b.call("$.derived", vec![e]))
                .unwrap_or_else(|| b.void0()),
            // `$props` / `$props.id` are not valid class-field runes.
            DeclRune::Props | DeclRune::PropsId => return None,
        };
        Some((rune, lowered))
    }

    /// Find the constructor of `class` and collect its top-level
    /// `this.<name> = $rune(…)` field declarations in statement order (写经
    /// analyze `ClassBody.js` constructor scan + server `ClassBody.js`).
    fn collect_ctor_fields(&self, class: &oxc_ast::ast::Class<'a>) -> Vec<CtorField> {
        use oxc_ast::ast::{ClassElement, Expression as E, MethodDefinitionKind, Statement};
        let mut fields = Vec::new();
        for el in class.body.body.iter() {
            let ClassElement::MethodDefinition(m) = el else {
                continue;
            };
            if m.kind != MethodDefinitionKind::Constructor {
                continue;
            }
            let Some(body) = m.value.body.as_ref() else {
                continue;
            };
            for stmt in body.statements.iter() {
                let Statement::ExpressionStatement(es) = stmt else {
                    continue;
                };
                let E::AssignmentExpression(assign) = &es.expression else {
                    continue;
                };
                let Some((name, is_private)) = ctor_target_name(&assign.left) else {
                    continue;
                };
                let Some(rune) = detect_decl_rune(&assign.right) else {
                    continue;
                };
                fields.push(CtorField {
                    name,
                    is_private,
                    rune,
                });
            }
        }
        fields
    }

    /// Rewrite the constructor's `this.<name> = $rune(…)` assignments in place:
    /// lower the RHS and (for public `$derived` / `$derived.by`) retarget the LHS
    /// to the private backing field (写经 server `AssignmentExpression.js`).
    fn rewrite_constructor_assignments(
        &mut self,
        class: &mut oxc_ast::ast::Class<'a>,
        backing: &rustc_hash::FxHashMap<String, String>,
    ) {
        use oxc_ast::ast::{
            AssignmentTarget as AT, ClassElement, Expression as E, MethodDefinitionKind, Statement,
        };
        let b = self.b;
        for el in class.body.body.iter_mut() {
            let ClassElement::MethodDefinition(m) = el else {
                continue;
            };
            if m.kind != MethodDefinitionKind::Constructor {
                continue;
            }
            let Some(body) = m.value.body.as_mut() else {
                continue;
            };
            for stmt in body.statements.iter_mut() {
                let Statement::ExpressionStatement(es) = stmt else {
                    continue;
                };
                let E::AssignmentExpression(assign) = &mut es.expression else {
                    continue;
                };
                let Some((name, is_private)) = ctor_target_name(&assign.left) else {
                    continue;
                };
                let Some((rune, lowered)) = self.lower_assign_rhs(&mut assign.right) else {
                    continue;
                };
                assign.right = lowered;

                // Retarget public `$derived` / `$derived.by` to the private backing
                // field; `$state` / `$state.raw` and private fields keep their key
                // (写经 `AssignmentExpression.js`: key stays unless public derived).
                let retarget =
                    !is_private && matches!(rune, DeclRune::Derived | DeclRune::DerivedBy);
                if retarget && let Some(backing_name) = backing.get(&name) {
                    assign.left = AT::from(
                        oxc_ast::ast::MemberExpression::new_private_field_expression(
                            oxc_span::SPAN,
                            b.this(),
                            oxc_ast::ast::PrivateIdentifier::new(
                                oxc_span::SPAN,
                                b.str(backing_name),
                                &b.ab(),
                            ),
                            false,
                            &b.ab(),
                        ),
                    );
                }
            }
        }
    }

    /// Push a `get <name>() { return this.#<backing>(); }` +
    /// `set <name>($$value) { return this.#<backing>($$value); }` accessor pair
    /// onto `new_body` (写经 server `ClassBody.js`).
    fn push_accessors(
        &self,
        new_body: &mut oxc_allocator::Vec<'a, oxc_ast::ast::ClassElement<'a>>,
        public_name: &str,
        backing: &str,
    ) {
        use oxc_ast::ast::MethodDefinitionKind;
        let b = self.b;

        let getter_body = {
            let member = b.member(b.this(), &format!("#{backing}"));
            let call = b.call(member, vec![]);
            b.body(vec![b.return_stmt(Some(call))])
        };
        let getter_fn = oxc_ast::ast::Function::boxed(
            oxc_span::SPAN,
            oxc_ast::ast::FunctionType::FunctionExpression,
            None,
            false,
            false,
            false,
            None,
            None,
            oxc_allocator::ArenaBox::new_in(b.empty_params(), &b.ab()),
            None,
            Some(oxc_allocator::ArenaBox::new_in(getter_body, &b.ab())),
            &b.ab(),
        );
        new_body.push(oxc_ast::ast::ClassElement::new_method_definition(
            oxc_span::SPAN,
            oxc_ast::ast::MethodDefinitionType::MethodDefinition,
            oxc_allocator::ArenaVec::new_in(&b.ab()),
            b.key(public_name),
            getter_fn,
            MethodDefinitionKind::Get,
            false,
            false,
            false,
            false,
            None,
            &b.ab(),
        ));

        let setter_body = {
            let member = b.member(b.this(), &format!("#{backing}"));
            let call = b.call(member, vec![b.id("$$value")]);
            b.body(vec![b.return_stmt(Some(call))])
        };
        let setter_params = b.params(vec![b.id_pat("$$value")], None);
        let setter_fn = oxc_ast::ast::Function::boxed(
            oxc_span::SPAN,
            oxc_ast::ast::FunctionType::FunctionExpression,
            None,
            false,
            false,
            false,
            None,
            None,
            oxc_allocator::ArenaBox::new_in(setter_params, &b.ab()),
            None,
            Some(oxc_allocator::ArenaBox::new_in(setter_body, &b.ab())),
            &b.ab(),
        );
        new_body.push(oxc_ast::ast::ClassElement::new_method_definition(
            oxc_span::SPAN,
            oxc_ast::ast::MethodDefinitionType::MethodDefinition,
            oxc_allocator::ArenaVec::new_in(&b.ab()),
            b.key(public_name),
            setter_fn,
            MethodDefinitionKind::Set,
            false,
            false,
            false,
            false,
            None,
            &b.ab(),
        ));
    }
}

/// A class-field rune declared inside a constructor via `this.<name> = $rune(…)`.
/// Mirrors an `AssignmentExpression`-kind entry of upstream's analyze
/// `state_fields` map (写经 `2-analyze/visitors/ClassBody.js`).
struct CtorField {
    /// Field name as `get_name` would return it: public `"foo"`, private
    /// `"#foo"`, or a computed-literal key like `"1"`.
    name: String,
    /// Whether the assignment target is a `PrivateFieldExpression` (`this.#x`).
    is_private: bool,
    /// The detected rune kind on the RHS.
    rune: DeclRune,
}

/// Extract the `get_name`-style field name from a constructor `this.<…>`
/// assignment target, plus whether it is a private field. Returns `None` for
/// non-`this` targets and for computed keys whose expression is not a literal
/// (写经 analyze `ClassBody.js`: computed non-`Literal` keys are skipped).
fn ctor_target_name(target: &oxc_ast::ast::AssignmentTarget) -> Option<(String, bool)> {
    use oxc_ast::ast::{AssignmentTarget as AT, Expression as E};
    match target {
        AT::StaticMemberExpression(m) => {
            if !matches!(m.object, E::ThisExpression(_)) {
                return None;
            }
            Some((m.property.name.as_str().to_string(), false))
        }
        AT::PrivateFieldExpression(m) => {
            if !matches!(m.object, E::ThisExpression(_)) {
                return None;
            }
            Some((format!("#{}", m.field.name.as_str()), true))
        }
        AT::ComputedMemberExpression(m) => {
            if !matches!(m.object, E::ThisExpression(_)) {
                return None;
            }
            // Only literal computed keys are state fields (写经 analyze skip).
            match &m.expression {
                E::StringLiteral(s) => Some((s.value.as_str().to_string(), false)),
                E::NumericLiteral(n) => Some((n.value.to_string(), false)),
                _ => None,
            }
        }
        _ => None,
    }
}

impl<'a> VisitMut<'a> for ClassFieldRuneLower<'a> {
    /// Rebuild a runes-mode class body so public `$derived` / `$derived.by`
    /// fields become a private backing field + `get`/`set` accessor pair (写经
    /// `3-transform/server/visitors/ClassBody.js`):
    ///
    /// ```js
    /// foo = $derived(e);
    /// // ↓
    /// #foo = $.derived(() => e);
    /// get foo() { return this.#foo(); }
    /// set foo($$value) { return this.#foo($$value); }
    /// ```
    ///
    /// `$state` / `$state.raw` fields and PRIVATE `$derived` fields keep their
    /// key and are only value-lowered (via [`Self::lower_property_init`]). The
    /// public private-key (`#foo`) is deconflicted against the class's existing
    /// private identifiers in source order, mirroring the analyze-phase
    /// `ClassBody` deconfliction.
    /// Drop `$effect` / `$effect.pre` / `$effect.root` / `$inspect.trace`
    /// expression statements anywhere below an emitted statement, mirroring
    /// upstream's global server `ExpressionStatement` visitor (`return b.empty`).
    /// A `$inspect(…)` that [`lower_nested_inspect`] already replaced is gone by
    /// the time this runs; one it could not reach is dropped here rather than
    /// surviving into the output as an undefined call.
    fn visit_statements(&mut self, stmts: &mut oxc_allocator::Vec<'a, Statement<'a>>) {
        if stmts.iter().any(|stmt| {
            matches!(stmt, Statement::ExpressionStatement(es)
                if is_removed_effect_stmt(&es.expression, self.rune_store_subs))
        }) {
            let taken: std::vec::Vec<Statement<'a>> = stmts.drain(..).collect();
            let mut kept: std::vec::Vec<Statement<'a>> =
                std::vec::Vec::with_capacity(taken.len() + 1);
            for stmt in taken {
                let Statement::ExpressionStatement(es) = &stmt else {
                    kept.push(stmt);
                    continue;
                };
                if !is_removed_effect_stmt(&es.expression, self.rune_store_subs) {
                    kept.push(stmt);
                    continue;
                }
                // A removed `$inspect(…)` leaves the SAME `;;` a top-level one
                // does: upstream's `ExpressionStatement` visitor keeps the
                // statement and replaces its expression with `b.empty`, at every
                // nesting depth. `$effect*` / `$inspect.trace` print nothing.
                if inspect_kind(&es.expression, self.rune_store_subs).is_some() {
                    let start = es.span.start;
                    kept.push(self.b.empty_kept(start));
                    kept.push(self.b.empty_kept(start + 1));
                }
            }
            stmts.extend(kept);
        }
        oxc_ast_visit::walk_mut::walk_statements(self, stmts);
    }

    fn visit_class(&mut self, class: &mut oxc_ast::ast::Class<'a>) {
        use oxc_ast::ast::ClassElement;

        let b = self.b;

        // Collect existing private identifiers in this class so the synthesized
        // `#foo` backing fields can be deconflicted against them. Mirrors analyze
        // `ClassBody.js`, which only collects PropertyDefinition / MethodDefinition
        // private keys (NOT constructor-declared private fields).
        let mut private_ids: Vec<String> = Vec::new();
        for el in class.body.body.iter() {
            let key = match el {
                ClassElement::PropertyDefinition(p) => Some(&p.key),
                ClassElement::MethodDefinition(m) => Some(&m.key),
                _ => None,
            };
            if let Some(name) = key.and_then(|k| k.private_name()) {
                private_ids.push(name.as_str().to_string());
            }
        }

        // Scan the constructor for `this.<name> = $rune(…)` field declarations,
        // in statement order (写经 analyze `ClassBody.js` constructor pass). For
        // each PUBLIC field, deconflict a private backing-field name. PropertyDefinition
        // fields are deconflicted first (in the body loop below) in upstream, but
        // for the constructor cases the body has no rune PropertyDefinitions to
        // collide with, so a constructor-first pass here is equivalent for the
        // target fixtures. We record the public-name → backing-name map so the
        // constructor assignments and the inserted accessors agree.
        let ctor_fields = self.collect_ctor_fields(class);
        let mut backing: rustc_hash::FxHashMap<String, String> = rustc_hash::FxHashMap::default();
        for cf in ctor_fields.iter() {
            if cf.is_private {
                continue;
            }
            let mut deconflicted = REGEX_INVALID_IDENTIFIER_CHARS
                .replace_all(&cf.name, "_")
                .to_string();
            while private_ids.contains(&deconflicted) {
                deconflicted = format!("_{deconflicted}");
            }
            private_ids.push(deconflicted.clone());
            backing.insert(cf.name.clone(), deconflicted);
        }

        // Take ownership of the existing body and rebuild it element-by-element.
        let old_body = std::mem::replace(
            &mut class.body.body,
            oxc_allocator::ArenaVec::new_in(&b.ab()),
        );
        let mut new_body: oxc_allocator::Vec<'a, ClassElement<'a>> =
            oxc_allocator::ArenaVec::new_in(&b.ab());

        // Insert backing fields + get/set accessors for constructor-declared PUBLIC
        // `$derived` / `$derived.by` fields, at the TOP of the body (写经 server
        // `ClassBody.js`: the constructor-AssignmentExpression loop runs before the
        // body-replacement loop).
        for cf in ctor_fields.iter() {
            if cf.is_private || !matches!(cf.rune, DeclRune::Derived | DeclRune::DerivedBy) {
                continue;
            }
            let backing_name = backing.get(&cf.name).cloned().unwrap_or_default();
            // `#<backing>;` (bare backing field — value set in the constructor)
            let private_key = oxc_ast::ast::PropertyKey::new_private_identifier(
                oxc_span::SPAN,
                b.str(&backing_name),
                &b.ab(),
            );
            new_body.push(oxc_ast::ast::ClassElement::new_property_definition(
                oxc_span::SPAN,
                oxc_ast::ast::PropertyDefinitionType::PropertyDefinition,
                oxc_allocator::ArenaVec::new_in(&b.ab()),
                private_key,
                None,
                None,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                None,
                &b.ab(),
            ));
            self.push_accessors(&mut new_body, &cf.name, &backing_name);
        }

        for el in old_body {
            let ClassElement::PropertyDefinition(mut prop_box) = el else {
                new_body.push(el);
                continue;
            };
            // Only plain (non-computed, non-static) fields carry class-field runes.
            let is_plain_field = !prop_box.computed && !prop_box.r#static;
            let is_private = prop_box.key.is_private_identifier();

            // 写经 server `ClassBody.js` (lines 53-77): a PropertyDefinition whose
            // name is a state field DECLARED ELSEWHERE (`field.node !== definition`)
            // is DROPPED. This is the bare `product;` (or `product: number;` after
            // TS strip) whose rune `this.product = $derived(...)` lives in the
            // constructor — the backing field + get/set accessors were already
            // inserted at the top of `new_body` by the constructor pass, so the
            // orphaned public field declaration must not be re-emitted. Only public
            // (non-`#`) derived constructor fields take an accessor; `$state` /
            // private constructor fields keep their declaration (they fall through).
            if is_plain_field && !is_private {
                let field_name = prop_box.key.name().map(|c| c.to_string());
                if let Some(fname) = &field_name
                    && ctor_fields.iter().any(|cf| {
                        &cf.name == fname
                            && !cf.is_private
                            && matches!(cf.rune, DeclRune::Derived | DeclRune::DerivedBy)
                    })
                {
                    // Orphaned public field redeclared by a constructor `$derived`
                    // assignment → drop (the accessor pair already owns the name).
                    // `$state` constructor fields keep their declaration (upstream
                    // `ClassBody.js` keeps `$state` / `$state.raw` definitions).
                    continue;
                }
            }

            let prop = prop_box.as_mut();
            let rune = self.lower_property_init(prop);

            let needs_accessor = is_plain_field
                && !is_private
                && matches!(rune, Some(DeclRune::Derived) | Some(DeclRune::DerivedBy));

            if !needs_accessor {
                new_body.push(ClassElement::PropertyDefinition(prop_box));
                continue;
            }

            // Public `$derived` / `$derived.by`: derive a deconflicted private
            // backing-field name from the public name (写经 analyze `ClassBody`).
            let public_name = prop_box
                .key
                .name()
                .map(|c| c.to_string())
                .unwrap_or_default();
            let mut deconflicted = REGEX_INVALID_IDENTIFIER_CHARS
                .replace_all(&public_name, "_")
                .to_string();
            while private_ids.contains(&deconflicted) {
                deconflicted = format!("_{deconflicted}");
            }
            private_ids.push(deconflicted.clone());

            // Move the lowered `$.derived(...)` value onto the private backing
            // field, keeping the original `PropertyDefinition` node (and its now
            // private key).
            let private_key = oxc_ast::ast::PropertyKey::new_private_identifier(
                oxc_span::SPAN,
                b.str(&deconflicted),
                &b.ab(),
            );
            prop_box.key = private_key;
            new_body.push(ClassElement::PropertyDefinition(prop_box));

            self.push_accessors(&mut new_body, &public_name, &deconflicted);
        }

        class.body.body = new_body;

        // Rewrite the constructor's `this.<name> = $rune(…)` assignments now that
        // the backing-field names are known (写经 server `AssignmentExpression.js`).
        if !ctor_fields.is_empty() {
            self.rewrite_constructor_assignments(class, &backing);
        }

        // Recurse so nested classes inside method bodies / `$derived(...)` thunks
        // are still lowered.
        oxc_ast_visit::walk_mut::walk_class(self, class);
    }
}

/// Re-parse a whole `VariableDeclaration` from its source span and read-wrap
/// each init, for the declarations whose lowering is otherwise nothing but a
/// re-parse of the pattern and the init. Rebuilding those from SUB-slices leaves
/// the statement's nodes with no coherent set of source positions, so the
/// comment carry-over can only collapse them onto one address and every comment
/// INTERIOR to the initializer is lost; a whole-statement re-parse keeps them.
///
/// `None` (fall back to the per-declarator rebuild) unless the declaration is a
/// single declarator of a kind the rebuild would have reproduced verbatim —
/// `using` / `await using` are rewritten to `let` there, and a multi-declarator
/// `let a = …, b = …` is split into one statement per declarator.
fn reparse_var_decl_whole<'a>(
    vd: &oxc_ast::ast::VariableDeclaration,
    src: &str,
    state: &mut ServerTransformState<'a>,
) -> Option<Statement<'a>> {
    if vd.declarations.len() != 1
        || !matches!(
            vd.kind,
            VariableDeclarationKind::Let
                | VariableDeclarationKind::Const
                | VariableDeclarationKind::Var
        )
    {
        return None;
    }
    let slice = src.get(vd.span.start as usize..vd.span.end as usize)?;
    let mut stmt = state.reparse_statement(slice)?;
    // Spans are local to `slice`, which is this declaration's own source.
    lower_nested_inspect(&mut stmt, slice, 0, state);
    let Statement::VariableDeclaration(out_vd) = &mut stmt else {
        return None;
    };
    for d in out_vd.declarations.iter_mut() {
        if let Some(init) = d.init.as_mut() {
            super::read_wrap::wrap_reads(
                init,
                state.b,
                state.analysis,
                state.analysis.root.instance_scope_index,
            );
        }
    }
    Some(stmt)
}

/// The rune a declarator's init is, if any.
///
/// Store-rune conflict: `let x = $state()` where the `$state` store subscription
/// is LEXICALLY VISIBLE at the instance scope is a store read, not the rune.
/// Upstream's `get_rune` returns null (the auto-created `$state`
/// store-subscription binding shadows the rune), so the declarator falls through
/// to the ordinary read-wrap path, which emits
/// `$.store_get(($$store_subs ??= {}), "$state", state)()`.
///
/// The lookup uses the `$`-PREFIXED callee name (`$state`), not the base
/// `state`, and requires an actual STORE-SUBSCRIPTION binding
/// (`BindingKind::StoreSub`, created only when the store is really read as
/// `$state`). This precisely distinguishes the conflict from an ordinary rune:
/// `let props = $props()` binds `props` but registers no `$props` store
/// subscription, and `let state = $state(0)` (no `$state` read anywhere)
/// registers none either — both correctly stay runes. The ancestor-or-self
/// visibility check excludes a same-named binding in a DESCENDANT scope surfaced
/// by the intentionally root-polluted scope table.
///
/// INSTANCE-only: store auto-subscriptions exist only in the instance script, so
/// a module-script `const data = $state({…})` (with an unrelated module `const
/// state`) stays the rune (`inspect-derived-2`).
fn declarator_rune(
    d: &oxc_ast::ast::VariableDeclarator,
    is_instance: bool,
    state: &ServerTransformState<'_>,
) -> Option<DeclRune> {
    let rune = d.init.as_ref().and_then(detect_decl_rune)?;
    if is_instance
        && let Some(callee) = d.init.as_ref().and_then(rune_callee_name)
        && let Some(bidx) = state
            .analysis
            .root
            .get_binding(callee, state.analysis.root.instance_scope_index)
        && matches!(
            state.analysis.root.bindings[bidx].kind,
            BindingKind::StoreSub
        )
        && state.analysis.root.is_scope_ancestor_of(
            state.analysis.root.bindings[bidx].scope_index,
            state.analysis.root.instance_scope_index,
        )
    {
        return None;
    }
    Some(rune)
}

/// Lower a single `VariableDeclaration` (runes branch). Returns the rebuilt
/// statements (ONE per top-level declarator, mirroring upstream's
/// `VariableDeclaration` visitor), or an empty vec if every declarator
/// was dropped. `verbatim` is set to the source range when the declaration was
/// re-parsed WHOLE, which is what lets its interior comments be replayed.
fn lower_variable_declaration<'a>(
    vd: &oxc_ast::ast::VariableDeclaration,
    src: &str,
    is_instance: bool,
    state: &mut ServerTransformState<'a>,
    verbatim: &mut Option<Span>,
    carry: bool,
    carried: &mut bool,
) -> Vec<Statement<'a>> {
    if vd
        .declarations
        .first()
        .is_some_and(|d| declarator_rune(d, is_instance, state).is_none())
        && let Some(stmt) = reparse_var_decl_whole(vd, src, state)
    {
        *verbatim = Some(vd.span);
        return vec![stmt];
    }
    // Comment-carry mode: every re-parsed piece is shifted onto its source
    // offset, so the whole statement can be [`comments::Place::Shift`]ed onto
    // its region like a verbatim re-parse — synthesized wrappers stay
    // location-less, which is exactly upstream's node shape.
    let mut poisoned = !carry;

    let b = state.b;
    let kind = match vd.kind {
        VariableDeclarationKind::Const => VariableDeclarationKind::Const,
        VariableDeclarationKind::Var => VariableDeclarationKind::Var,
        _ => VariableDeclarationKind::Let,
    };

    // ONE output statement per SOURCE declarator, but only for the INSTANCE
    // body. `VariableDeclaration.js` never splits — it returns one declaration
    // holding every declarator; the split comes from analyze's instance-body
    // pass (`2-analyze/index.js`, "one declarator per declaration, makes things
    // simpler"), which the module body does not go through. A single source
    // declarator that expands into multiple synthetic declarators (a
    // destructured `$state` → `tmp, $$array, x, y`) stays COMBINED either way.
    let mut out: Vec<Statement<'a>> = Vec::new();
    let combine_module = !is_instance;
    let mut combined_decls = Vec::new();

    for (di, d) in vd.declarations.iter().enumerate() {
        // Per-source-declarator pair accumulator.
        let mut decls: Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)> =
            Vec::new();
        match declarator_rune(d, is_instance, state) {
            None => {
                // Non-rune declarator: re-parse the whole declarator span as a
                // `let <decl>;` so the pattern + init survive verbatim, then
                // read-wrap the INIT so derived / store reads & updates inside it
                // become getters (`let postfix = count++` →
                // `let postfix = $.update_derived(count)`; `let x = d` →
                // `let x = d()`). Mirrors upstream's tree-wide server visitors,
                // which visit every non-rune `VariableDeclarator` init.
                let slice = &src[d.span.start as usize..d.span.end as usize];
                if let Some((mut pat, mut init)) = state.reparse_declarator(slice, kind) {
                    if carry {
                        // `reparse_declarator` wraps as `let <slice>;`, so the
                        // parsed piece starts at offset 4.
                        let mut shift = ShiftBy {
                            delta: i64::from(d.span.start) - 4,
                        };
                        shift.visit_binding_pattern(&mut pat);
                        if let Some(e) = init.as_mut() {
                            shift.visit_expression(e);
                        }
                    }
                    if let Some(e) = init.as_mut() {
                        super::read_wrap::wrap_reads(
                            e,
                            b,
                            state.analysis,
                            state.analysis.root.instance_scope_index,
                        );
                    }
                    decls.push((pat, init));
                }
            }
            Some(DeclRune::PropsId) => { /* drop */ }
            Some(DeclRune::Props) => {
                // `<pattern> = $props()` → `<expanded-pattern> = $$props`, where
                // the expansion injects `$$slots` / `$$events` deconfliction
                // properties for the object-with-rest and identifier cases
                // (写经 `VariableDeclaration.js:33-82`).
                let pat_span = d.id.span();
                let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
                let Some(mut pat) = state.reparse_pattern(pat_slice) else {
                    continue;
                };
                if carry {
                    // `reparse_pattern` wraps as `let <slice> = 0;` (offset 4).
                    ShiftBy {
                        delta: i64::from(pat_span.start) - 4,
                    }
                    .visit_binding_pattern(&mut pat);
                }
                // Strip `$bindable(<d>)` defaults: `{ x = $bindable() }` →
                // `{ x = void 0 }`, `{ x = $bindable(5) }` → `{ x = 5 }`
                // (写经 `VariableDeclaration.js:42-52` AssignmentPattern walk).
                strip_bindable_defaults(&mut pat, state);
                let pat = expand_props_pattern(pat, state);
                decls.push((pat, Some(b.id("$$props"))));
            }
            Some(rune) => {
                // Lower the init from the rune; keep the binding pattern verbatim.
                let init = d.init.as_ref().map(OxcExpression::without_parentheses);
                let new_init = lower_decl_init(&rune, init, src, state, carry, &mut poisoned);
                let pat_span = d.id.span();
                let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
                let Some(mut pat) = state.reparse_pattern(pat_slice) else {
                    continue;
                };
                if carry {
                    ShiftBy {
                        delta: i64::from(pat_span.start) - 4,
                    }
                    .visit_binding_pattern(&mut pat);
                }
                // A destructured `$state` / `$state.raw` init expands via
                // `create_state_declarators` into a `tmp` temp + (for array
                // patterns) a `$$array = $.to_array(tmp, N)` insert + one leaf
                // declarator per path (写经 `VariableDeclaration.js:229-247`).
                // Identifier patterns (and every other rune) keep the verbatim
                // single declarator. These synthetic declarators stay COMBINED in
                // one statement (the source had no top-level comma).
                if matches!(rune, DeclRune::State)
                    && !matches!(pat, oxc_ast::ast::BindingPattern::BindingIdentifier(_))
                {
                    // `state.array_counter` is the component-wide counter (not
                    // reset per statement, since this function runs once PER
                    // top-level declaration) — copy it out, thread it through the
                    // call, then write it back (mirrors `wrap_reads_in_statement_
                    // counted`'s copy-out/write-back around `self.array_counter`).
                    let mut array_counter = state.array_counter;
                    create_state_declarators(pat, new_init, state, &mut array_counter, &mut decls);
                    state.array_counter = array_counter;
                } else if matches!(rune, DeclRune::Derived | DeclRune::DerivedBy)
                    && !matches!(pat, oxc_ast::ast::BindingPattern::BindingIdentifier(_))
                {
                    // A destructured `$derived` / `$derived.by` expands into a
                    // (possibly shared) `$$d = <init>` base plus one
                    // `$.derived(() => <access>)` leaf per path and one
                    // `$$derived_array = $.derived(() => $.to_array(...))` per
                    // array sub-pattern (写经 `VariableDeclaration.js:97-156`).
                    create_derived_declarators(&rune, init, src, pat, new_init, state, &mut decls);
                } else {
                    decls.push((pat, new_init));
                }
            }
        }

        if !decls.is_empty() {
            if combine_module {
                combined_decls.extend(decls);
            } else {
                let mut stmt = b.var_decl_from_pairs(kind, decls);
                if carry && let Statement::VariableDeclaration(v) = &mut stmt {
                    // The first statement keeps the declaration keyword's own
                    // start, so a comment between `let` and the binding name
                    // still sorts after the statement and before the name.
                    v.span = if di == 0 {
                        Span::new(vd.span.start, d.span.end)
                    } else {
                        d.span
                    };
                    // One declarator in, one out: locating it is what puts a
                    // comment between the keyword and the name in that slot
                    // instead of ahead of the whole statement.
                    if v.declarations.len() == 1
                        && let Some(only) = v.declarations.first_mut()
                    {
                        only.span = d.span;
                    }
                }
                out.push(stmt);
            }
        }
    }
    if !combined_decls.is_empty() {
        let mut stmt = b.var_decl_from_pairs(kind, combined_decls);
        if carry && let Statement::VariableDeclaration(v) = &mut stmt {
            v.span = vd.span;
        }
        out.push(stmt);
    }

    *carried = !poisoned && !out.is_empty();
    out
}

/// Shift every located span of a re-parsed piece by `delta`, so its
/// coordinates become source-absolute for the comment carry-over. The `0,0`
/// SPAN placeholder of a synthesized node stays location-less.
struct ShiftBy {
    delta: i64,
}

impl VisitMut<'_> for ShiftBy {
    fn visit_span(&mut self, span: &mut Span) {
        if (span.start == 0 && span.end == 0) || span.end == u32::MAX {
            return;
        }
        span.start = (i64::from(span.start) + self.delta) as u32;
        span.end = (i64::from(span.end) + self.delta) as u32;
    }
}

/// Port of upstream `create_state_declarators` (`VariableDeclaration.js:229-247`)
/// for a destructured `$state(...)` / `$state.raw(...)` declarator.
///
/// `let [x, y] = $state([1, 2])` →
/// ```js
/// let tmp = [1, 2],
///     $$array = $.to_array(tmp, 2),
///     x = $$array[0],
///     y = $$array[1];
/// ```
/// `let { a, b } = $state({ a: 1, b: 2 })` →
/// ```js
/// let tmp = { a: 1, b: 2 }, a = tmp.a, b = tmp.b;
/// ```
/// The temp + every array-conversion insert use `scope.generate('tmp')` /
/// `scope.generate('$$array')`; here the component instance scope has no
/// `tmp` / `$$array` bindings for these fixtures, so the names are emitted
/// verbatim (KNOWN GAP: no deconfliction against user-declared `tmp`/`$$array`).
/// `array_counter` is the CALLER's array-temp counter, threaded (not reset) so a
/// SECOND destructured-declaration array pattern in the same component is named
/// `$$array_1`, not a colliding `$$array` (写経 the per-component
/// `scope.generate('$$array')`).
fn create_state_declarators<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    value: Option<OxcExpression<'a>>,
    state: &mut ServerTransformState<'a>,
    array_counter: &mut u32,
    decls: &mut Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)>,
) {
    // `let tmp = <value>` — deconflict the temp name across the component (mirrors
    // upstream `scope.generate('tmp')`), so a SECOND destructured `$state(...)`
    // declaration uses `tmp_1` rather than re-declaring `tmp` (a redeclaration
    // error). The `$$array` temps deconflict the same way.
    let tmp_name = state.next_state_tmp_name();
    let b = state.b;
    decls.push((b.id_pat(&tmp_name), value));

    let mut paths: Vec<(oxc_ast::ast::BindingPattern<'a>, OxcExpression<'a>)> = Vec::new();
    let mut array_decls: Vec<(String, OxcExpression<'a>)> = Vec::new();
    let tmp_id = b.id(&tmp_name);
    extract_paths(
        pat,
        tmp_id,
        state,
        array_counter,
        &mut paths,
        &mut array_decls,
    );

    // `$$array[_N] = $.to_array(tmp, N)` inserts (one per array sub-pattern).
    for (name, value) in array_decls {
        decls.push((state.b.id_pat(&name), Some(value)));
    }

    // Leaf declarators: `x = $$array[0]`, `a = tmp.a`, …
    for (node, expr) in paths {
        decls.push((node, Some(expr)));
    }
}

/// The property access for a destructuring key, 写経 upstream `b.member(expression,
/// prop.key, prop.computed || prop.key.type !== 'Identifier')`. The key NODE is
/// reused verbatim, so `{ 0: z }` prints `obj[0]` (not `obj['0']`) and a quoted
/// key keeps its original quoting and escapes.
///
/// `prepare_key` sees the moved key expression before it becomes the property:
/// the `$derived` lowering visits the extracted access (so a rune/store read in a
/// computed key is wrapped), while `create_state_declarators` does not.
fn prop_member_access<'a>(
    b: B<'a>,
    base: OxcExpression<'a>,
    key: oxc_ast::ast::PropertyKey<'a>,
    computed: bool,
    prepare_key: impl FnOnce(&mut OxcExpression<'a>),
) -> OxcExpression<'a> {
    use oxc_ast::ast::PropertyKey;
    match key {
        PropertyKey::StaticIdentifier(ident) if !computed => b.member(base, ident.name.as_str()),
        // A private identifier can never be a destructuring key.
        PropertyKey::PrivateIdentifier(_) => base,
        PropertyKey::StaticIdentifier(ident) => {
            b.member_computed(base, b.string(ident.name.as_str()))
        }
        key => {
            let mut key = key.into_expression();
            prepare_key(&mut key);
            b.member_computed(base, key)
        }
    }
}

/// The `$.exclude_from_object(base, [...])` entry for a non-rest property key,
/// 写経 upstream: a non-computed identifier and any literal (computed or not)
/// become a string literal of their VALUE (`0x10` → `'16'`); every other computed
/// key becomes `String(<key>)`, which the runtime resolves.
fn exclude_object_key<'a>(
    key: &oxc_ast::ast::PropertyKey<'a>,
    computed: bool,
    state: &ServerTransformState<'a>,
) -> Option<OxcExpression<'a>> {
    use oxc_allocator::CloneIn;
    use oxc_ast::ast::PropertyKey;
    let b = state.b;
    match key {
        PropertyKey::PrivateIdentifier(_) => None,
        PropertyKey::StaticIdentifier(ident) if !computed => Some(b.string(ident.name.as_str())),
        PropertyKey::BooleanLiteral(lit) => {
            Some(b.string(if lit.value { "true" } else { "false" }))
        }
        PropertyKey::StringLiteral(_)
        | PropertyKey::NumericLiteral(_)
        | PropertyKey::BigIntLiteral(_)
        | PropertyKey::RegExpLiteral(_)
        | PropertyKey::NullLiteral(_)
        | PropertyKey::StaticIdentifier(_) => key.static_name().map(|name| b.string(&name)),
        key => Some(b.call(
            "String",
            vec![key.clone_in(state.allocator).into_expression()],
        )),
    }
}

/// Port of upstream `_extract_paths` (`utils/ast.js:269-415`) over an oxc
/// `BindingPattern`. Walks the destructure tree, pushing one `(leaf_pattern,
/// access_expression)` pair per terminal binding into `paths`, and one
/// `$.to_array(...)` expression per `ArrayPattern` into `inserts` (the caller
/// names the corresponding `$$array` temp and substitutes it as the array base).
fn extract_paths<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    expression: OxcExpression<'a>,
    state: &ServerTransformState<'a>,
    array_counter: &mut u32,
    paths: &mut Vec<(oxc_ast::ast::BindingPattern<'a>, OxcExpression<'a>)>,
    array_decls: &mut Vec<(String, OxcExpression<'a>)>,
) {
    use oxc_ast::ast::BindingPattern;
    let b = state.b;
    match pat {
        BindingPattern::BindingIdentifier(_) => {
            paths.push((pat, expression));
        }
        BindingPattern::ObjectPattern(obj) => {
            let obj = obj.unbox();
            // Collect the static property keys first so an `...rest` can exclude
            // them (写经 the upstream `$.exclude_from_object(expr, [keys])` build).
            let mut exclude_keys: Vec<Option<OxcExpression<'a>>> = Vec::new();
            for prop in obj.properties {
                if let Some(key) = exclude_object_key(&prop.key, prop.computed, state) {
                    exclude_keys.push(Some(key));
                }
                let base = expression_clone(&expression, state);
                // `create_state_declarators` is NOT re-visited upstream, so a
                // computed key keeps its raw reads (`tmp[k]`, never `tmp[k()]`).
                let object_expression =
                    prop_member_access(b, base, prop.key, prop.computed, |_| {});
                extract_paths(
                    prop.value,
                    object_expression,
                    state,
                    array_counter,
                    paths,
                    array_decls,
                );
            }
            // `{ a, ...rest }` → `rest = $.exclude_from_object(expression, ['a'])`
            // (写経 `_extract_paths` ObjectPattern RestElement branch).
            if let Some(rest) = obj.rest {
                let rest = rest.unbox();
                let rest_expression = b.call(
                    "$.exclude_from_object",
                    vec![expression, b.array(exclude_keys)],
                );
                extract_paths(
                    rest.argument,
                    rest_expression,
                    state,
                    array_counter,
                    paths,
                    array_decls,
                );
            }
        }
        BindingPattern::ArrayPattern(arr) => {
            let arr = arr.unbox();
            // `$$array[_N] = $.to_array(<expression>[, <len>])` — each ArrayPattern in
            // the destructure gets a fresh `$$array` / `$$array_1` / … name (写経
            // upstream's per-scope `scope.generate('$$array')`), and the leaf accesses
            // reference THAT name. The element-count arg is OMITTED when the pattern
            // has a trailing `...rest` (an unbounded destructure).
            let len = arr.elements.len();
            let to_array = if arr.rest.is_some() {
                b.call("$.to_array", vec![expression])
            } else {
                b.call("$.to_array", vec![expression, b.number(len as f64)])
            };
            let array_name = if *array_counter == 0 {
                "$$array".to_string()
            } else {
                format!("$$array_{}", *array_counter)
            };
            *array_counter += 1;
            array_decls.push((array_name.clone(), to_array));

            for (i, element) in arr.elements.into_iter().enumerate() {
                if let Some(element) = element {
                    // `$$array[i]` / `$$array_N[i]`
                    let array_expression = b.member_computed(b.id(&array_name), b.number(i as f64));
                    extract_paths(
                        element,
                        array_expression,
                        state,
                        array_counter,
                        paths,
                        array_decls,
                    );
                }
            }
            // `[a, ...rest]` → `rest = $$array.slice(i)` where `i` is the rest's
            // position (= element count, holes included). A nested pattern argument
            // recurses; a bare identifier becomes a leaf.
            if let Some(rest) = arr.rest {
                let rest = rest.unbox();
                let rest_expression = b.call(
                    b.member(b.id(&array_name), "slice"),
                    vec![b.number(len as f64)],
                );
                extract_paths(
                    rest.argument,
                    rest_expression,
                    state,
                    array_counter,
                    paths,
                    array_decls,
                );
            }
        }
        BindingPattern::AssignmentPattern(asgn) => {
            let asgn = asgn.unbox();
            // `<left> = <default>` → wrap the access in `$.fallback(<access>, <default>)`
            // (写经 upstream `_extract_paths` AssignmentPattern → `build_fallback`).
            // The leaf then carries the fallback-bearing access; the OUTER prop fallback
            // (`build_legacy_fallback`) wraps it again for `export let` props.
            let fallback = build_destructure_fallback(state, expression, asgn.right);
            extract_paths(
                asgn.left,
                fallback,
                state,
                array_counter,
                paths,
                array_decls,
            );
        }
    }
}

/// `build_fallback(expression, default)` (写经 `utils/ast.js:585`): a "simple"
/// default emits `$.fallback(expr, default)`; anything else emits
/// `$.fallback(expr, () => default, true)`. (Async / await defaults are a KNOWN
/// GAP — not exercised by the in-scope destructure fixtures.)
fn build_destructure_fallback<'a>(
    state: &ServerTransformState<'a>,
    expression: OxcExpression<'a>,
    default_expr: OxcExpression<'a>,
) -> OxcExpression<'a> {
    let b = state.b;
    if is_simple_default(&default_expr) {
        b.call("$.fallback", vec![expression, default_expr])
    } else {
        let thunk = b.thunk(default_expr, false);
        b.call("$.fallback", vec![expression, thunk, b.id("true")])
    }
}

/// Port of upstream `VariableDeclaration.js:97-156` for a DESTRUCTURED
/// `$derived(...)` / `$derived.by(...)` declarator.
///
/// `let { foo, bar: [a, b] } = $derived(stuff)` →
/// ```js
/// let $$derived_array = $.derived(() => $.to_array(stuff.bar, 2)),
///     foo = $.derived(() => stuff.foo),
///     a = $.derived(() => $$derived_array()[0]),
///     b = $.derived(() => $$derived_array()[1]);
/// ```
///
/// The base `rhs` against which paths are extracted is either:
/// - the `$derived(<Identifier>)` argument read directly (no `$$d`), or
/// - a fresh `$$d = <init>` binding whose call `$$d()` is the base — used for
///   `$derived.by`, or `$derived(<non-identifier>)`.
///
/// Each extracted leaf becomes `name = $.derived(() => <access>)`; each
/// `ArrayPattern` becomes `$$derived_array = $.derived(() => $.to_array(...))`,
/// indexed via the temp CALL `$$derived_array()[i]`.
fn create_derived_declarators<'a>(
    rune: &DeclRune,
    init_expr: Option<&OxcExpression>,
    src: &str,
    pat: oxc_ast::ast::BindingPattern<'a>,
    new_init: Option<OxcExpression<'a>>,
    state: &mut ServerTransformState<'a>,
    decls: &mut Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)>,
) {
    let b = state.b;

    // Decide the base expression for `extract_paths`. Upstream:
    //   if (rune !== '$derived' || call.arguments[0].type !== 'Identifier') {
    //       const id = b.id(scope.generate('$$d'));
    //       rhs = b.call(id);
    //       declarations.push(b.declarator(id, init));
    //   }
    //   else: rhs = value (the visited argument)
    let arg_is_identifier = matches!(rune, DeclRune::Derived)
        && matches!(
            init_expr,
            Some(OxcExpression::CallExpression(call))
                if matches!(
                    call.arguments.first().and_then(|a| a.as_expression()),
                    Some(OxcExpression::Identifier(_))
                )
        );

    let rhs: OxcExpression<'a> = if arg_is_identifier {
        // `rhs = value` — the read-wrapped `$derived(<Identifier>)` argument.
        derived_arg_value(init_expr, src, state).unwrap_or_else(|| b.void0())
    } else {
        // `$$d = <init>`, `rhs = $$d()`.
        let name = state.next_derived_d_name();
        decls.push((b.id_pat(&name), new_init));
        b.call(b.id(&name), vec![])
    };

    let mut paths: Vec<(oxc_ast::ast::BindingPattern<'a>, OxcExpression<'a>)> = Vec::new();
    let mut inserts: Vec<(String, OxcExpression<'a>)> = Vec::new();
    extract_derived_paths(pat, rhs, state, &mut paths, &mut inserts);

    // `$$derived_array = $.derived(() => $.to_array(...))` inserts (one per
    // array sub-pattern), in extraction order.
    for (name, value) in inserts {
        let call = b.call("$.derived", vec![b.thunk(value, false)]);
        decls.push((b.id_pat(&name), Some(call)));
    }

    // Leaf declarators: `name = $.derived(() => <access>)`.
    for (node, expr) in paths {
        let call = b.call("$.derived", vec![b.thunk(expr, false)]);
        decls.push((node, Some(call)));
    }
}

/// Extract the read-wrapped first argument of a `$derived(<Identifier>)` call —
/// the base `rhs` for the no-`$$d` destructured-derived path.
fn derived_arg_value<'a>(
    init_expr: Option<&OxcExpression>,
    src: &str,
    state: &ServerTransformState<'a>,
) -> Option<OxcExpression<'a>> {
    let OxcExpression::CallExpression(call) = init_expr? else {
        return None;
    };
    let arg = call.arguments.first()?.as_expression()?;
    let s = arg.span();
    let slice = &src[s.start as usize..s.end as usize];
    let mut e = state.reparse_slice_owned(slice)?;
    super::read_wrap::wrap_reads(
        &mut e,
        state.b,
        state.analysis,
        state.analysis.root.instance_scope_index,
    );
    Some(e)
}

/// Derived-flavoured port of upstream `_extract_paths` (`utils/ast.js:269-415`).
/// Like [`extract_paths`] but: every `ArrayPattern` generates a fresh
/// `$$derived_array` temp whose value (`$.to_array(...)`) is pushed into
/// `inserts` tagged with its name, and element accesses index the temp via a
/// CALL (`$$derived_array()[i]`). Object rest → `$.exclude_from_object`,
/// array rest → `<temp>().slice(i)`. The caller wraps every `inserts` value and
/// every leaf `expression` in `$.derived(() => …)`.
fn extract_derived_paths<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    expression: OxcExpression<'a>,
    state: &mut ServerTransformState<'a>,
    paths: &mut Vec<(oxc_ast::ast::BindingPattern<'a>, OxcExpression<'a>)>,
    inserts: &mut Vec<(String, OxcExpression<'a>)>,
) {
    use oxc_ast::ast::BindingPattern;
    let b = state.b;
    match pat {
        BindingPattern::BindingIdentifier(_) => {
            paths.push((pat, expression));
        }
        BindingPattern::ObjectPattern(obj) => {
            let obj = obj.unbox();
            // Collect the key list for the `$.exclude_from_object` rest (写経
            // `_extract_paths` ObjectPattern RestElement branch) BEFORE the
            // property loop consumes `obj.properties`.
            let exclude_keys: Vec<OxcExpression<'a>> = if obj.rest.is_some() {
                obj.properties
                    .iter()
                    .filter_map(|prop| {
                        let mut key = exclude_object_key(&prop.key, prop.computed, state)?;
                        wrap_derived_key_reads(&mut key, state);
                        Some(key)
                    })
                    .collect()
            } else {
                Vec::new()
            };
            for prop in obj.properties {
                let base = expression_clone(&expression, state);
                let computed = prop.computed;
                let object_expression = prop_member_access(b, base, prop.key, computed, |key| {
                    wrap_derived_key_reads(key, state)
                });
                extract_derived_paths(prop.value, object_expression, state, paths, inserts);
            }
            if let Some(rest) = obj.rest {
                // `$.exclude_from_object(<expression>, [<keys>])` — 写经 upstream,
                // now with the collected static property keys.
                let exclude = b.call(
                    "$.exclude_from_object",
                    vec![
                        expression,
                        b.array(exclude_keys.into_iter().map(Some).collect()),
                    ],
                );
                extract_derived_paths(rest.unbox().argument, exclude, state, paths, inserts);
            }
        }
        BindingPattern::ArrayPattern(arr) => {
            let arr = arr.unbox();
            let name = state.next_derived_array_name();
            let len = arr.elements.len();
            // The element count is OMITTED when the pattern ends in a `...rest`:
            // the iterable has to be drained completely, and a length would
            // truncate it.
            let to_array = if arr.rest.is_some() {
                b.call("$.to_array", vec![expression])
            } else {
                b.call("$.to_array", vec![expression, b.number(len as f64)])
            };
            inserts.push((name.clone(), to_array));

            for (i, element) in arr.elements.into_iter().enumerate() {
                if let Some(element) = element {
                    // `$$derived_array()[i]` — index the temp CALL.
                    let base = b.call(b.id(&name), vec![]);
                    let array_expression = b.member_computed(base, b.number(i as f64));
                    extract_derived_paths(element, array_expression, state, paths, inserts);
                }
            }
            // `[a, ...rest]` → `rest = $$derived_array().slice(i)`, where `i` is
            // the rest's position (= element count, holes included).
            if let Some(rest) = arr.rest {
                let base = b.call(b.id(&name), vec![]);
                let rest_expression = b.call(b.member(base, "slice"), vec![b.number(len as f64)]);
                extract_derived_paths(
                    rest.unbox().argument,
                    rest_expression,
                    state,
                    paths,
                    inserts,
                );
            }
        }
        BindingPattern::AssignmentPattern(asgn) => {
            // 写经 upstream `_extract_paths` AssignmentPattern branch: the
            // per-leaf access is wrapped in `$.fallback(expression, default)`
            // (or a thunked form for non-simple defaults) so the destructuring
            // default survives into the SSR-derived read.
            let asgn = asgn.unbox();
            let fallback = build_derived_fallback(b, expression, asgn.right);
            extract_derived_paths(asgn.left, fallback, state, paths, inserts);
        }
    }
}

/// Read-wrap a computed destructuring key for the `$derived` lowering: upstream
/// visits every extracted access, so `{ [k]: c } = $derived(o)` reads a `$derived`
/// `k` as `k()` and a store `$k` as `$.store_get(…)`.
fn wrap_derived_key_reads<'a>(key: &mut OxcExpression<'a>, state: &ServerTransformState<'a>) {
    super::read_wrap::wrap_reads(
        key,
        state.b,
        state.analysis,
        state.analysis.root.instance_scope_index,
    );
}

/// Port of upstream `build_fallback` (`utils/ast.js`): wrap a per-leaf access in
/// `$.fallback(expression, default)` for a simple default, or
/// `$.fallback(expression, () => default, true)` for a non-simple one (which the
/// runtime lazily evaluates). The `await`-flavoured branches upstream handles for
/// async defaults are a KNOWN GAP (destructuring defaults containing `await` do
/// not appear in the corpus).
fn build_derived_fallback<'a>(
    b: B<'a>,
    expression: OxcExpression<'a>,
    default_expr: OxcExpression<'a>,
) -> OxcExpression<'a> {
    if oxc_is_simple_expression(&default_expr) {
        b.call("$.fallback", vec![expression, default_expr])
    } else {
        let thunk = b.thunk(default_expr, false);
        b.call("$.fallback", vec![expression, thunk, b.bool(true)])
    }
}

/// Port of upstream `is_simple_expression` (`utils/ast.js`): `Literal` /
/// `Identifier` / arrow / function, plus recursively-simple `Conditional` /
/// `Binary` / `Logical` expressions.
fn oxc_is_simple_expression(expr: &OxcExpression) -> bool {
    use oxc_ast::ast::Expression;
    match expr {
        Expression::ParenthesizedExpression(p) => oxc_is_simple_expression(&p.expression),
        Expression::NumericLiteral(_)
        | Expression::StringLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::Identifier(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::FunctionExpression(_) => true,
        Expression::ConditionalExpression(c) => {
            oxc_is_simple_expression(&c.test)
                && oxc_is_simple_expression(&c.consequent)
                && oxc_is_simple_expression(&c.alternate)
        }
        Expression::BinaryExpression(bin) => {
            oxc_is_simple_expression(&bin.left) && oxc_is_simple_expression(&bin.right)
        }
        Expression::LogicalExpression(l) => {
            oxc_is_simple_expression(&l.left) && oxc_is_simple_expression(&l.right)
        }
        _ => false,
    }
}

/// Deep-clone an expression into the state allocator. Used to duplicate the
/// accumulated base expression for each object-pattern property access (oxc
/// `member(...)` consumes its `object`, so each property needs its own copy).
fn expression_clone<'a>(
    expr: &OxcExpression<'a>,
    state: &ServerTransformState<'a>,
) -> OxcExpression<'a> {
    use oxc_allocator::CloneIn;
    expr.clone_in(state.allocator)
}

/// Build the lowered `init` for a detected rune. The call argument source slice
/// is re-parsed into the state allocator (value passthrough — NO read rewriting).
fn lower_decl_init<'a>(
    rune: &DeclRune,
    init: Option<&OxcExpression>,
    src: &str,
    state: &ServerTransformState<'a>,
    carry: bool,
    poisoned: &mut bool,
) -> Option<OxcExpression<'a>> {
    let b = state.b;
    if matches!(rune, DeclRune::Props) {
        return Some(b.id("$$props"));
    }

    // First call argument's source slice (if any) and its source offset.
    let first_arg_slice: Option<(&str, u32)> = match init {
        Some(OxcExpression::CallExpression(call)) => call
            .arguments
            .first()
            .and_then(|a| a.as_expression())
            .map(|e| {
                let s = e.span();
                (&src[s.start as usize..s.end as usize], s.start)
            }),
        _ => None,
    };

    let arg_expr = |state: &ServerTransformState<'a>, poisoned: &mut bool| -> OxcExpression<'a> {
        match first_arg_slice {
            Some((slice, slice_start)) => {
                let rewritten = (matches!(rune, DeclRune::Derived) && state.eval_inputs.use_async)
                    .then(|| wrap_await_with_save_in_async_derived(slice));
                let mut e = state
                    .reparse_slice_owned(rewritten.as_deref().unwrap_or(slice))
                    .unwrap_or_else(|| state.b.void0());
                if carry {
                    if rewritten.as_deref().is_some_and(|r| r != slice) {
                        // The async rewrite changes the text, so its spans no
                        // longer map onto the source region.
                        *poisoned = true;
                    } else {
                        // `reparse_slice_owned` wraps as `(<slice>)` (offset 1).
                        ShiftBy {
                            delta: i64::from(slice_start) - 1,
                        }
                        .visit_expression(&mut e);
                    }
                }
                // Read-wrap the init/thunk body so derived/store reads inside a
                // `$state(...)` / `$derived(...)` initializer become getters
                // (e.g. `$derived(a + 1)` thunk → `() => a() + 1`). Mirrors
                // routing script value expressions through `visit_expr`.
                super::read_wrap::wrap_reads(
                    &mut e,
                    state.b,
                    state.analysis,
                    state.analysis.root.instance_scope_index,
                );
                e
            }
            None => state.b.void0(),
        }
    };

    match rune {
        DeclRune::State => Some(arg_expr(state, poisoned)),
        DeclRune::Derived => {
            // Async `$derived(await EXPR)` lowering (写经
            // `3-transform/server/visitors/VariableDeclaration.js:87-96`): when the
            // derived argument carries a TOP-LEVEL `await` AND the component is
            // compiled with `experimental.async`, the derived becomes
            // `await $.async_derived(b.thunk(value, true))`. Upstream's
            // `AwaitExpression` server visitor strips the leading `await` from the
            // value before it reaches the thunk, so `$derived(await foo)` lowers to
            // `await $.async_derived(() => foo)`. A remaining NESTED await keeps the
            // thunk `async` (`async () => …`); otherwise it is an ordinary
            // `() => …` thunk. Without an await — or in sync mode — it stays the
            // plain synchronous `$.derived(() => <value>)` shape (UNCHANGED).
            let mut e = arg_expr(state, poisoned);
            // Async iff the derived argument carries a TOP-LEVEL `await` ANYWHERE
            // (not just as the direct arg) — `$derived(await foo)` AND
            // `$derived(cond ? await foo : null)` both become async deriveds. A
            // `await` nested inside a function/arrow within the arg is a separate
            // async scope and does NOT count (`expr_has_await` skips those).
            if state.eval_inputs.use_async && expr_has_await(&e) {
                // Only a DIRECT top-level `await X` arg is stripped (mirrors the
                // server `AwaitExpression` visitor returning its inner argument):
                // `$derived(await foo)` → `await $.async_derived(() => foo)`. When
                // the await lives nested inside the arg (e.g. a conditional), it is
                // KEPT and the thunk becomes `async () => …`.
                if let OxcExpression::AwaitExpression(await_box) = e {
                    e = await_box.unbox().argument;
                }
                // A surviving nested await forces an `async () => …` thunk.
                let nested_await = expr_has_await(&e);
                Some(b.await_expr(b.call("$.async_derived", vec![b.thunk(e, nested_await)])))
            } else {
                Some(b.call("$.derived", vec![b.thunk(e, false)]))
            }
        }
        DeclRune::DerivedBy => Some(b.call("$.derived", vec![arg_expr(state, poisoned)])),
        DeclRune::Props | DeclRune::PropsId => None,
    }
}

/// Whether an oxc expression contains an `AwaitExpression` anywhere in its
/// subtree (but NOT inside a nested function / arrow body — those `await`s
/// belong to a different async scope). Used to decide whether an
/// `$.async_derived(...)` thunk must stay `async` after the top-level `await`
/// has been stripped (写经 the old text pipeline's nested-await check).
fn expr_has_await(expr: &OxcExpression) -> bool {
    use oxc_ast_visit::Visit;
    struct AwaitFinder {
        found: bool,
    }
    impl<'a> Visit<'a> for AwaitFinder {
        fn visit_await_expression(&mut self, _it: &oxc_ast::ast::AwaitExpression<'a>) {
            self.found = true;
        }
        // Do NOT descend into nested function / arrow bodies: their `await`s
        // belong to a separate async scope and must not keep the outer thunk
        // async.
        fn visit_function(
            &mut self,
            _it: &oxc_ast::ast::Function<'a>,
            _flags: oxc_syntax::scope::ScopeFlags,
        ) {
        }
        fn visit_arrow_function_expression(
            &mut self,
            _it: &oxc_ast::ast::ArrowFunctionExpression<'a>,
        ) {
        }
    }
    let mut f = AwaitFinder { found: false };
    f.visit_expression(expr);
    f.found
}

/// Walk a `$props()` LHS pattern and rewrite every `$bindable(...)` default in
/// an `AssignmentPattern` to its first argument (or `void 0` for the no-arg
/// form), mirroring upstream's `VariableDeclaration.js:42-52` `AssignmentPattern`
/// walk: `node.right` is a `$bindable(...)` CallExpression → replace with
/// `node.right.arguments[0]` (visited) or `b.void0`. Any other default is left
/// untouched. The replacement argument is read-wrapped (upstream `context.visit`).
fn strip_bindable_defaults<'a>(
    pat: &mut oxc_ast::ast::BindingPattern<'a>,
    state: &ServerTransformState<'a>,
) {
    let mut v = BindableStrip {
        b: state.b,
        analysis: state.analysis,
    };
    v.visit_binding_pattern(pat);
}

/// Returns the `$bindable` replacement expression if `expr` is a `$bindable(...)`
/// call: its first argument, or `void 0` when called with no arguments.
fn bindable_default<'a>(expr: &mut OxcExpression<'a>, b: B<'a>) -> Option<OxcExpression<'a>> {
    let OxcExpression::CallExpression(call) = expr else {
        return None;
    };
    let OxcExpression::Identifier(id) = &call.callee else {
        return None;
    };
    if id.name.as_str() != "$bindable" {
        return None;
    }
    let arg = call
        .arguments
        .drain(..)
        .next()
        .and_then(|a| OxcExpression::try_from(a).ok());
    Some(arg.unwrap_or_else(|| b.void0()))
}

struct BindableStrip<'a, 'b> {
    b: B<'a>,
    analysis: &'b crate::compiler::phases::phase2_analyze::ComponentAnalysis,
}

impl<'a, 'b> VisitMut<'a> for BindableStrip<'a, 'b> {
    fn visit_assignment_pattern(&mut self, it: &mut oxc_ast::ast::AssignmentPattern<'a>) {
        if let Some(replacement) = bindable_default(&mut it.right, self.b) {
            it.right = replacement;
        }
        // Read-wrap the default expression so reads inside it get the server
        // getter transform — `{ value = $page }` → `$.store_get($$store_subs
        // ??= {}, '$page', page)` (store_sub), `= derived` → `= derived()`,
        // etc. This mirrors upstream visiting `declarator.init` (the whole
        // pattern, including AssignmentPattern defaults) through the server
        // `Identifier` visitor, and also covers the wrapped `$bindable(...)`
        // replacement above.
        super::read_wrap::wrap_reads(
            &mut it.right,
            self.b,
            self.analysis,
            self.analysis.root.instance_scope_index,
        );
        // Recurse into the (left) sub-pattern so nested destructure defaults
        // (`{ a: { b = $bindable() } }`) are also handled.
        oxc_ast_visit::walk_mut::walk_assignment_pattern(self, it);
    }
}

/// Expand a `$props()` LHS pattern with the `$$slots` / `$$events` deconfliction
/// injection (写经 `VariableDeclaration.js:33-82`).
///
/// - `{ x, ...rest }` (object pattern WITH a rest element): splice
///   `$$slots: <slots_name>` and `$$events: $$events` BEFORE the rest (so a
///   `...rest` doesn't pull in those internal props).
/// - `props` (identifier): replace with `{ $$slots: <slots_name>, $$events:
///   $$events, ...props }`.
/// - `{ x }` (object pattern WITHOUT rest) / array pattern: left verbatim.
///
/// `<slots_name>` deconflicts to `$$slots_` when the component also declares
/// `$$slots` separately (`analysis.uses_slots`).
fn expand_props_pattern<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    state: &ServerTransformState<'a>,
) -> oxc_ast::ast::BindingPattern<'a> {
    use oxc_ast::ast::BindingPattern;
    use oxc_span::SPAN;
    let b = state.b;
    let ab = b.ab();
    let slots_name = if state.analysis.uses_slots {
        "$$slots_"
    } else {
        "$$slots"
    };

    // A `{ key: value }` binding property over identifier names. `shorthand`
    // mirrors esrap/estree printing: `{ $$slots }` when key == value, but
    // `{ $$slots: $$slots_ }` when they differ (the `uses_slots` deconfliction).
    let make_prop = |key: &str, value: &str| -> oxc_ast::ast::BindingProperty<'a> {
        let k = oxc_ast::ast::PropertyKey::new_static_identifier(SPAN, b.str(key), &ab);
        let v = oxc_ast::ast::BindingPattern::new_binding_identifier(SPAN, b.str(value), &ab);
        oxc_ast::ast::BindingProperty::new(SPAN, k, v, key == value, false, &ab)
    };

    match pat {
        BindingPattern::ObjectPattern(obj) if obj.rest.is_some() => {
            let mut obj = obj.unbox();
            // The rest is a separate field in oxc; splicing the two props at the
            // END of `properties` keeps them before the (separately-printed) rest.
            obj.properties.push(make_prop("$$slots", slots_name));
            obj.properties.push(make_prop("$$events", "$$events"));
            BindingPattern::ObjectPattern(oxc_allocator::ArenaBox::new_in(obj, &ab))
        }
        BindingPattern::BindingIdentifier(id) => {
            let name = b.str(id.name.as_str());
            let mut props = oxc_allocator::ArenaVec::with_capacity_in(2, &ab);
            props.push(make_prop("$$slots", slots_name));
            props.push(make_prop("$$events", "$$events"));
            let rest_inner = oxc_ast::ast::BindingPattern::new_binding_identifier(SPAN, name, &ab);
            let rest = oxc_ast::ast::BindingRestElement::boxed(SPAN, rest_inner, &ab);
            oxc_ast::ast::BindingPattern::new_object_pattern(SPAN, props, Some(rest), &ab)
        }
        // Object pattern WITHOUT rest, or array pattern → verbatim.
        other => other,
    }
}

// ===========================================================================
// LEGACY (non-runes) branch — port of upstream's non-runes
// `VariableDeclaration` / `LabeledStatement` server visitors plus the
// `reactive_statements` hoist+append loop in `transform-server.js`.
// ===========================================================================

/// Parse + lower a single LEGACY (non-runes) script into transformed top-level
/// statements. `import_sink` receives imports to hoist (`None` for module).
///
/// Emitted forms (写经 `VariableDeclaration.js` non-runes `else` branch and
/// `transform-server.js:147-177`):
/// - `import …` → hoisted (dropped from body).
/// - `export let x` → `let x = $$props['x'];`
/// - `export let x = <d>` → `let x = $.fallback($$props['x'], <d>[, true]);`
///   where the fallback shape mirrors `build_fallback`:
///     - simple default → `$.fallback($$props['x'], <d>)`
///     - everything else → `$.fallback($$props['x'], () => <d>, true)`
///       (a no-arg fn call `() => f()` collapses to `f` via `b.thunk`).
/// - plain `let`/`const`/`var`/`function`/`class`/expr → kept (re-parsed);
///   value expressions routed through the read-wrapping pass.
/// - top-level `$: …` → label stripped-but-kept (`$: …`), the statement
///   APPENDED after all other instance statements, and a hoisted
///   `let <legacy_reactive vars>;` prepended (topologically pre-ordered by
///   Phase 2's `reactive_statements`).
fn transform_script_legacy<'a>(
    script: &Script,
    state: &mut ServerTransformState<'a>,
    mut import_sink: Option<&mut Vec<Statement<'a>>>,
    is_instance: bool,
) -> Vec<Statement<'a>> {
    let (Some(start), Some(end)) = (script.content.start(), script.content.end()) else {
        return Vec::new();
    };
    let (start, end) = (start as usize, end as usize);
    if end <= start || end > state.source.len() {
        return Vec::new();
    }

    // TypeScript components: strip TS from the slice before parsing (see the
    // matching note in `transform_script` for the offset-consistency rationale).
    let stripped;
    // TS is detected COMPONENT-wide, not per-script: if EITHER script carries
    // `lang="ts"` the whole component is parsed as TS (upstream `force_typescript`),
    // so a `<script>` with no `lang` attribute can still hold TS syntax
    // (`import type …`, `satisfies …`) when a sibling `<script lang="ts">` exists.
    // Strip in that case too — mirrors the OLD oracle's component-wide `is_ts`.
    let src: &str =
        if super::super::helpers::script_is_typescript(script) || state.analysis.is_typescript {
            stripped = crate::compiler::phases::phase2_analyze::types::strip_typescript(
                &state.source[start..end],
            );
            &stripped
        } else {
            &state.source[start..end]
        };

    // Every decision below reads this text (directly, or through spans into it),
    // so the grouping parens around a rune call have to be gone first.
    let paren_stripped;
    let src: &str =
        match crate::compiler::phases::phase3_transform::shared::rune_parens::strip_rune_parens(src)
        {
            Some(stripped) => {
                paren_stripped = stripped;
                &paren_stripped
            }
            None => src,
        };

    let alloc = oxc_allocator::Allocator::default();
    let owned = alloc.alloc_str(src);
    let ret = oxc_parser::Parser::new(&alloc, owned, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        record_classification_failure(state, is_instance, &ret.diagnostics);
        return Vec::new();
    }

    classify_comments(&ret.program.body, &ret.program.comments);

    let mut out: Vec<Statement<'a>> = Vec::new();
    // Reactive `$:` statements are appended AFTER all other statements (mirrors
    // upstream's `for (const [node] of analysis.reactive_statements) instance
    // .body.push(statement[1])`). Collected (in source order) here together with
    // their assignment/dependency binding names so they can be reordered
    // topologically (写経 `order_reactive_statements`) before being flushed.
    let mut reactive: Vec<ReactiveEntry<'a>> = Vec::new();

    // Component-wide `$$array` temp counter for destructuring-assignment lowering,
    // shared across every top-level statement (and the function bodies visited
    // within) so the second array destructure is named `$$array_1`, not `$$array`
    // (写经 the per-component `scope.generate('$$array')`).
    let mut array_counter: u32 = 0;
    // See the runes loop: a dropped statement does not advance the region, so its
    // comments are re-homed onto the next survivor instead of dying with it.
    let mut region_start: u32 = 0;
    let mut reactive_leading_comment_pending = false;
    let mut deferred_reactive_comment: Option<usize> = None;

    let body_len = ret.program.body.len();
    for (stmt_index, stmt) in ret.program.body.iter().enumerate() {
        let stmt_span = stmt.span();
        let is_last_stmt = stmt_index + 1 == body_len;
        let is_reactive = matches!(stmt, Statement::LabeledStatement(ls) if is_instance && ls.label.name.as_str() == "$");
        // Upstream rebuilds the `$` label as a loc-less `b.labeled(...)`, so
        // `body()` never flushes a comment trailing it on the same line; being the
        // last statement, nothing located is left in the script to take it either.
        let defer_reactive_tail = is_reactive && is_last_stmt;
        let reactive_leading_comment = is_reactive
            && ret.program.comments.iter().any(|comment| {
                comment.span.start >= region_start && comment.span.end <= stmt_span.start
            });
        let out_len = out.len();
        let reactive_len = reactive.len();
        let sink_len = import_sink.as_deref().map_or(0, Vec::len);
        // Set by every branch that re-parses the statement WHOLE from a source
        // range, to that range.
        let mut verbatim: Option<Span> = None;
        // Set by a branch that REBUILDS the statement but whose upstream
        // counterpart keeps the source node (and therefore its `loc`) — the
        // prop lowering of `let x` / `export let x`, where upstream only
        // rewrites the declarator's init. Such a statement is still a comment
        // flush point, which matters once a `$:` statement is reordered past it.
        let mut rebuilt_but_located = false;
        let mut defer_block_reactive_trailing = false;

        'emit: {
            match stmt {
                // Deliberately NOT `verbatim`: an import is hoisted out of the
                // component function, but upstream leaves its comments behind
                // inside it, so replaying them in place would put them in the
                // wrong function.
                Statement::ImportDeclaration(imp) => {
                    let slice = &src[imp.span.start as usize..imp.span.end as usize];
                    if let Some(rehomed) = state.reparse_statement(slice) {
                        match import_sink.as_deref_mut() {
                            Some(sink) => sink.push(rehomed),
                            None => out.push(rehomed),
                        }
                    }
                }
                Statement::ExportNamedDeclaration(_) | Statement::ExportFromDeclaration(_) => {
                    if !is_instance {
                        let span = stmt.span();
                        let slice = &src[span.start as usize..span.end as usize];
                        if let Some(rehomed) = state.reparse_statement(slice) {
                            verbatim = Some(span);
                            out.push(rehomed);
                        }
                    }
                    // INSTANCE script: `export { a, b }` → dropped (`b.empty`).
                    break 'emit;
                }
                Statement::ExportDeclaration(exp) => {
                    if !is_instance {
                        // MODULE script: `export const FOO = 1` is a REAL ES module
                        // export, not a prop — upstream's `server_module` keeps it
                        // verbatim (export keyword included). Re-parse the whole
                        // statement span.
                        let span = exp.span();
                        let slice = &src[span.start as usize..span.end as usize];
                        if let Some(rehomed) = state.reparse_statement(slice) {
                            verbatim = Some(span);
                            out.push(rehomed);
                        }
                        break 'emit;
                    }
                    // INSTANCE script: `export let x …` → props (the `export` keyword
                    // is dropped and the declaration prop-lowered, mirroring upstream's
                    // `ExportNamedDeclaration` global visitor `return
                    // context.visit(node.declaration)` feeding the non-runes
                    // `VariableDeclaration` branch).
                    match &exp.declaration {
                        oxc_ast::ast::Declaration::VariableDeclaration(vd) => {
                            count_export_keyword(
                                &ret.program.comments,
                                exp.span.start,
                                vd.span.start,
                            );
                            let lowered = lower_legacy_var_decl(
                                vd,
                                src,
                                state,
                                true,
                                &mut array_counter,
                                &mut verbatim,
                            );
                            if verbatim.is_none() {
                                rebuilt_but_located = true;
                                count_non_reparse(&ret.program.comments, vd.span);
                            }
                            out.extend(lowered);
                        }
                        other => {
                            // `export function` / `export class` → keep the inner
                            // declaration verbatim (re-parsed from its source span),
                            // but read-wrap the body so store/derived reads & writes
                            // inside an `export function f() { … $store … }` are
                            // lowered (写经 the global server visitor).
                            let is_fn =
                                matches!(other, oxc_ast::ast::Declaration::FunctionDeclaration(_));
                            let span = other.span();
                            count_export_keyword(&ret.program.comments, exp.span.start, span.start);
                            let slice = &src[span.start as usize..span.end as usize];
                            if let Some(mut rehomed) = state.reparse_statement(slice) {
                                verbatim = Some(span);
                                if is_instance && is_fn {
                                    super::read_wrap::wrap_reads_in_statement_counted(
                                        &mut rehomed,
                                        state.b,
                                        state.analysis,
                                        state.analysis.root.instance_scope_index,
                                        &mut array_counter,
                                    );
                                }
                                out.push(rehomed);
                            }
                        }
                    }
                }
                Statement::VariableDeclaration(vd) => {
                    let lowered = lower_legacy_var_decl(
                        vd,
                        src,
                        state,
                        false,
                        &mut array_counter,
                        &mut verbatim,
                    );
                    if verbatim.is_none() {
                        rebuilt_but_located = true;
                        count_non_reparse(&ret.program.comments, vd.span);
                    }
                    out.extend(lowered);
                }
                Statement::LabeledStatement(ls) if is_instance && ls.label.name.as_str() == "$" => {
                    // Top-level legacy reactive `$:` statement. Upstream keeps the
                    // `$` label (people may `break $`) and appends the body to the
                    // instance run after everything else.
                    let span = ls.span();
                    let slice = &src[span.start as usize..span.end as usize];
                    if let Some(mut rehomed) = state.reparse_statement(slice) {
                        verbatim = Some(span);
                        // Assignment targets (for the hoisted `let <name>;` decl) and
                        // read dependencies (for the topological reorder) — both keyed
                        // by instance-scope binding index (写经 the `assignments` /
                        // `dependencies` sets in `ReactiveStatement`).
                        let mut decl_names: Vec<String> = Vec::new();
                        collect_legacy_reactive_decls(&ls.body, state, &mut decl_names);
                        let assigns = reactive_assignment_indices(&ls.body, state);
                        let deps = reactive_dependency_indices(&ls.body, state, &assigns);
                        // 写经 `LabeledStatement.js`: `context.visit(node.body)` — the
                        // reactive body is visited by the global `Identifier` visitor,
                        // so every READ inside it (store `$x`, derived call, `$$props`)
                        // is wrapped exactly like any other instance statement.
                        super::read_wrap::wrap_reads_in_statement_counted(
                            &mut rehomed,
                            state.b,
                            state.analysis,
                            state.analysis.root.instance_scope_index,
                            &mut array_counter,
                        );
                        // Upstream's hoisted `let x;` reuses the `$: x = …`
                        // TARGET identifier, so the declarator keeps that source
                        // `loc` while the declaration around it has none — and
                        // the hoist is printed FIRST, which makes it the flush
                        // point for every comment written before that target.
                        let decl_anchor =
                            if decl_names.is_empty() || ret.program.comments.is_empty() {
                                None
                            } else {
                                state.comments.register_anchor()
                            };
                        reactive.push(ReactiveEntry {
                            stmt: rehomed,
                            decl_names,
                            decl_anchor,
                            assigns,
                            deps,
                        });
                        let trailing_end =
                            trailing_comment_end(src, &ret.program.comments, stmt_span.end);
                        defer_block_reactive_trailing = !defer_reactive_tail
                            && trailing_end > stmt_span.end
                            && reactive_body_has_direct_block(&ls.body)
                            && !ret.program.comments.iter().any(|comment| {
                                comment.span.start >= region_start
                                    && comment.span.end <= stmt_span.start
                            });
                        if defer_block_reactive_trailing {
                            let index = state.pending_tail_comments.len();
                            state.defer_tail_comments(
                                src,
                                &ret.program.comments,
                                stmt_span.end,
                                trailing_end,
                            );
                            deferred_reactive_comment = Some(index);
                        }
                    }
                }
                Statement::ExpressionStatement(es) => {
                    if is_removed_effect_stmt(
                        &es.expression,
                        rune_names_are_store_subs(state.analysis),
                    ) {
                        break 'emit;
                    }
                    let slice = &src[es.span.start as usize..es.span.end as usize];
                    if let Some(mut rehomed) = state.reparse_statement(slice) {
                        verbatim = Some(es.span);
                        // 写经 the global server visitor: every READ / store-or-derived
                        // WRITE inside an ordinary instance statement is lowered (e.g.
                        // top-level `$a.foo = 3` → `$.store_mutate(...)`,
                        // `({$a} = obj)` → store-set sequence).
                        if is_instance {
                            super::read_wrap::wrap_reads_in_statement_counted(
                                &mut rehomed,
                                state.b,
                                state.analysis,
                                state.analysis.root.instance_scope_index,
                                &mut array_counter,
                            );
                        }
                        out.push(rehomed);
                    }
                }
                Statement::FunctionDeclaration(_) => {
                    let span = stmt.span();
                    let slice = &src[span.start as usize..span.end as usize];
                    if let Some(mut rehomed) = state.reparse_statement(slice) {
                        verbatim = Some(span);
                        // A function BODY is visited too (`function f() { return
                        // $count; }` → `$.store_get(...)`, `$foo++` → `$.update_store`).
                        if is_instance {
                            super::read_wrap::wrap_reads_in_statement_counted(
                                &mut rehomed,
                                state.b,
                                state.analysis,
                                state.analysis.root.instance_scope_index,
                                &mut array_counter,
                            );
                        }
                        out.push(rehomed);
                    }
                }
                other => {
                    let span = other.span();
                    let slice = &src[span.start as usize..span.end as usize];
                    if let Some(mut rehomed) = state.reparse_statement(slice) {
                        verbatim = Some(span);
                        // Wrap store/derived reads inside instance-scope control-flow
                        // statements (`if ($store === …) …`, `for`, `while`, blocks…) —
                        // upstream's server visitor visits every statement, so reads
                        // become `$.store_get(...)`. The ExpressionStatement /
                        // FunctionDeclaration arms already do this; this catch-all did not.
                        if is_instance {
                            super::read_wrap::wrap_reads_in_statement_counted(
                                &mut rehomed,
                                state.b,
                                state.analysis,
                                state.analysis.root.instance_scope_index,
                                &mut array_counter,
                            );
                        }
                        out.push(rehomed);
                    }
                }
            }
        }

        if defer_block_reactive_trailing {
            if let Some(mut place) =
                place_on_position(&mut state.comments, src, region_start, stmt_span, verbatim)
                && let Some(entry) = reactive.get_mut(reactive_len)
            {
                match &mut entry.stmt {
                    Statement::LabeledStatement(ls) => place.visit_statement(&mut ls.body),
                    other => place.visit_statement(other),
                }
            }
            continue;
        }
        let into_sink = import_sink.as_deref().is_some_and(|s| s.len() > sink_len);
        let anchor = out.iter().skip(out_len).position(anchors_a_region);
        if !into_sink && anchor.is_none() && reactive.len() == reactive_len {
            continue;
        }
        // Anchor the region on the first statement this source statement emitted
        // that can carry one.
        let mut place = place_on_region(
            &mut state.comments,
            src,
            &ret.program.comments,
            region_start,
            stmt_span,
            verbatim,
            !defer_reactive_tail,
        );
        if place.is_none()
            && (verbatim.is_some() || rebuilt_but_located)
            && !ret.program.comments.is_empty()
        {
            place = place_on_position(&mut state.comments, src, region_start, stmt_span, verbatim);
        }
        if place.is_none() && reactive_leading_comment_pending && !into_sink && anchor.is_some() {
            place = place_on_position(&mut state.comments, src, region_start, stmt_span, verbatim);
        }
        if let Some(mut place) = place {
            if into_sink {
                if let Some(sink) = import_sink.as_deref_mut()
                    && let Some(first) = sink.get_mut(sink_len)
                {
                    place.visit_statement(first);
                }
            } else if let Some(first) = anchor.and_then(|i| out.get_mut(out_len + i)) {
                place.visit_statement(first);
            } else if let Some(entry) = reactive.get_mut(reactive_len) {
                // Upstream rebuilds the `$` label as a loc-less `b.labeled(...)`
                // whose body keeps the source loc, so the comments flush after
                // the `$:` rather than before it. Leaving the label out of the
                // walk is what keeps it loc-less: its span stays outside the
                // region and is blanked on the way out.
                match &mut entry.stmt {
                    Statement::LabeledStatement(ls) => {
                        place.visit_statement(&mut ls.body);
                    }
                    other => place.visit_statement(other),
                }
            }
            if let Some(index) = deferred_reactive_comment.take() {
                state.mark_deferred_tail_comment_landed(index);
            }
        }
        if is_reactive && reactive_leading_comment {
            reactive_leading_comment_pending = true;
        } else if !is_reactive && anchor.is_some() {
            reactive_leading_comment_pending = false;
        }
        let trailing_end = trailing_comment_end(src, &ret.program.comments, stmt_span.end);
        region_start = if defer_reactive_tail {
            stmt_span.end
        } else if verbatim.is_some() || trailing_end > stmt_span.end {
            trailing_end
        } else {
            stmt_span.end
        };
    }

    if is_instance {
        let tail_end = script_tail_comment_end(&ret.program.comments, region_start);
        if tail_end > region_start {
            state.defer_tail_comments(src, &ret.program.comments, region_start, tail_end);
        }
    }

    // Topologically reorder the reactive `$:` statements so each runs after the
    // statements assigning to the bindings it depends on (写经
    // `order_reactive_statements`). The hoisted `let <vars>;` declaration is then
    // built by iterating the SORTED list and pushing each entry's legacy_reactive
    // declarator names — so the hoisted-decl order tracks the topological order,
    // not source order (写经 the `for (const [node] of analysis.reactive_statements)`
    // loop that drives `legacy_reactive_declarations`).
    let reactive = topo_sort_reactive(reactive);
    let mut reactive_decl_names: Vec<(String, Option<u32>)> = Vec::new();
    for entry in &reactive {
        for name in &entry.decl_names {
            if !reactive_decl_names.iter().any(|(seen, _)| seen == name) {
                reactive_decl_names.push((name.clone(), entry.decl_anchor));
            }
        }
    }
    if !reactive_decl_names.is_empty() {
        let b = state.b;
        // The legacy-reactive hoist is emitted as ONE combined `let a, b, c;`
        // declaration (matching the server oracle): unlike the comma-split
        // upstream applies to USER declarations, the synthetic reactive-vars
        // hoist stays combined.
        let pairs: Vec<_> = reactive_decl_names
            .iter()
            .map(|(n, _)| (b.id_pat(n), None))
            .collect();
        let mut decl = b.var_decl_from_pairs(VariableDeclarationKind::Let, pairs);
        if let Statement::VariableDeclaration(vd) = &mut decl {
            for (declarator, (_, anchor)) in vd.declarations.iter_mut().zip(&reactive_decl_names) {
                if let Some(anchor) = *anchor {
                    let at = Span::new(anchor, anchor);
                    declarator.span = at;
                    if let oxc_ast::ast::BindingPattern::BindingIdentifier(id) = &mut declarator.id
                    {
                        id.span = at;
                    }
                }
            }
        }
        out.insert(0, decl);
    }
    out.extend(reactive.into_iter().map(|e| e.stmt));
    out
}

/// A collected legacy reactive `$:` statement together with the binding indices
/// it ASSIGNS to and the binding indices it READS (depends on). Used to
/// topologically order the reactive run (写経 `order_reactive_statements`).
struct ReactiveEntry<'a> {
    stmt: Statement<'a>,
    /// legacy_reactive var names assigned to by this statement (hoisted-decl).
    decl_names: Vec<String>,
    /// Comment-buffer position the hoisted declarators of `decl_names` are
    /// anchored at, standing in for the source `loc` of the `$:` assignment
    /// target upstream carries onto them.
    decl_anchor: Option<u32>,
    /// Instance-scope binding indices this statement assigns to.
    assigns: Vec<usize>,
    /// Instance-scope binding indices this statement depends on (reads), with
    /// self-assigned bindings already excluded.
    deps: Vec<usize>,
}

/// Topologically sort the reactive entries so each statement runs after the ones
/// assigning to its dependencies (faithful port of `order_reactive_statements`'s
/// dependency-first DFS). Insertion (source) order is preserved among
/// independent statements / cycles.
fn topo_sort_reactive(entries: Vec<ReactiveEntry>) -> Vec<ReactiveEntry> {
    let n = entries.len();
    if n <= 1 {
        return entries;
    }

    // binding index → statement indices that assign to it.
    let mut assign_to_stmts: rustc_hash::FxHashMap<usize, Vec<usize>> =
        rustc_hash::FxHashMap::default();
    for (i, e) in entries.iter().enumerate() {
        for &idx in &e.assigns {
            assign_to_stmts.entry(idx).or_default().push(i);
        }
    }

    // Statement i depends on statement j when i reads a binding that j assigns.
    let mut deps: Vec<Vec<usize>> = vec![Vec::new(); n];
    for (i, e) in entries.iter().enumerate() {
        for dep_idx in &e.deps {
            if let Some(producers) = assign_to_stmts.get(dep_idx) {
                for &j in producers {
                    if j != i && !deps[i].contains(&j) {
                        deps[i].push(j);
                    }
                }
            }
        }
    }

    let mut order: Vec<usize> = Vec::with_capacity(n);
    let mut visited = vec![false; n];
    let mut in_progress = vec![false; n];

    fn visit(
        i: usize,
        deps: &[Vec<usize>],
        visited: &mut [bool],
        in_progress: &mut [bool],
        order: &mut Vec<usize>,
    ) {
        if visited[i] || in_progress[i] {
            return;
        }
        in_progress[i] = true;
        for &j in &deps[i] {
            visit(j, deps, visited, in_progress, order);
        }
        in_progress[i] = false;
        visited[i] = true;
        order.push(i);
    }

    for i in 0..n {
        visit(i, &deps, &mut visited, &mut in_progress, &mut order);
    }

    // Re-materialize in sorted order (move each entry exactly once).
    let mut slots: Vec<Option<ReactiveEntry>> = entries.into_iter().map(Some).collect();
    order
        .into_iter()
        .map(|i| slots[i].take().expect("each entry visited once"))
        .collect()
}

/// Instance-scope binding indices assigned to by a reactive `$:` body — every
/// `AssignmentExpression` target AND every `UpdateExpression` (`x++` / `--x`)
/// target ANYWHERE inside the body, not just a top-level `$: a = …`. So a
/// nested `$: if (cond) { x++ }` correctly records `x` as assigned (写经 the
/// analyze `AssignmentExpression` / `UpdateExpression` visitors adding the
/// target binding to `reactive_statement.assignments` while walking the whole
/// body). Member-expression targets (`obj.x = …`) declare no binding.
fn reactive_assignment_indices(body: &Statement, state: &ServerTransformState) -> Vec<usize> {
    names_to_instance_binding_indices(&ReactiveScopedCollector::run(body).assigns, state)
}

/// Instance-scope binding indices READ anywhere inside a reactive `$:` body
/// (its dependencies), excluding bindings the statement itself assigns to —
/// mirroring `order_reactive_statements`'s `!assignments.contains(dependency)`
/// guard. 写経 `ReactiveStatement.dependencies`.
fn reactive_dependency_indices(
    body: &Statement,
    state: &ServerTransformState,
    assigns: &[usize],
) -> Vec<usize> {
    let mut out =
        names_to_instance_binding_indices(&ReactiveScopedCollector::run(body).reads, state);
    out.retain(|idx| !assigns.contains(idx));
    out
}

/// Assignment targets and read references of one reactive `$:` body, resolved
/// through the statement's own scope chain. Upstream reads them off
/// `Scope`/`Binding` objects (`scope.get(name)`), so a name declared INSIDE the
/// statement — a `catch` parameter, a block `let`, a function parameter, a
/// `function`/`class` declaration — shadows the instance binding it collides
/// with and must not become an ordering edge.
#[derive(Default)]
struct ReactiveScopedCollector {
    locals: Vec<String>,
    assigns: Vec<String>,
    reads: Vec<String>,
}

impl ReactiveScopedCollector {
    fn run(body: &Statement) -> Self {
        use oxc_ast_visit::Visit;
        let mut collector = Self::default();
        collector.visit_statement(body);
        collector
    }

    fn is_local(&self, name: &str) -> bool {
        self.locals.iter().any(|l| l == name)
    }

    fn push_read(&mut self, name: &str) {
        if !self.is_local(name) && !self.reads.iter().any(|n| n == name) {
            self.reads.push(name.to_string());
        }
    }

    fn push_assign(&mut self, name: &str) {
        if !self.is_local(name) && !self.assigns.iter().any(|n| n == name) {
            self.assigns.push(name.to_string());
        }
    }

    fn declare_pattern(&mut self, pat: &oxc_ast::ast::BindingPattern) {
        let mut names = Vec::new();
        collect_binding_pattern_idents(pat, &mut names);
        self.locals.extend(names);
    }

    /// `let` / `const` / `var` / `function` / `class` declared directly in a
    /// block bind their names for the whole block.
    fn hoist_block_declarations(&mut self, body: &[Statement]) {
        for stmt in body {
            match stmt {
                Statement::VariableDeclaration(vd) => {
                    for d in vd.declarations.iter() {
                        self.declare_pattern(&d.id);
                    }
                }
                Statement::FunctionDeclaration(f) => {
                    if let Some(id) = &f.id {
                        self.locals.push(id.name.to_string());
                    }
                }
                Statement::ClassDeclaration(c) => {
                    if let Some(id) = &c.id {
                        self.locals.push(id.name.to_string());
                    }
                }
                _ => {}
            }
        }
    }
}

impl<'a> oxc_ast_visit::Visit<'a> for ReactiveScopedCollector {
    fn visit_identifier_reference(&mut self, it: &oxc_ast::ast::IdentifierReference<'a>) {
        self.push_read(it.name.as_str());
    }

    fn visit_assignment_expression(&mut self, it: &oxc_ast::ast::AssignmentExpression<'a>) {
        let mut names = Vec::new();
        collect_assignment_target_idents(&it.left, &mut names);
        for name in names {
            self.push_assign(&name);
        }
        // Recurse so a nested assignment in the RHS is also captured.
        oxc_ast_visit::walk::walk_assignment_expression(self, it);
    }

    fn visit_update_expression(&mut self, it: &oxc_ast::ast::UpdateExpression<'a>) {
        if let oxc_ast::ast::SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &it.argument {
            self.push_assign(id.name.as_str());
        }
        oxc_ast_visit::walk::walk_update_expression(self, it);
    }

    fn visit_block_statement(&mut self, it: &oxc_ast::ast::BlockStatement<'a>) {
        let mark = self.locals.len();
        self.hoist_block_declarations(&it.body);
        oxc_ast_visit::walk::walk_block_statement(self, it);
        self.locals.truncate(mark);
    }

    /// The cases share ONE block scope; the discriminant is outside it.
    fn visit_switch_statement(&mut self, it: &oxc_ast::ast::SwitchStatement<'a>) {
        self.visit_expression(&it.discriminant);
        let mark = self.locals.len();
        for case in it.cases.iter() {
            self.hoist_block_declarations(&case.consequent);
        }
        for case in it.cases.iter() {
            self.visit_switch_case(case);
        }
        self.locals.truncate(mark);
    }

    fn visit_catch_clause(&mut self, it: &oxc_ast::ast::CatchClause<'a>) {
        let mark = self.locals.len();
        if let Some(param) = &it.param {
            self.declare_pattern(&param.pattern);
        }
        oxc_ast_visit::walk::walk_catch_clause(self, it);
        self.locals.truncate(mark);
    }

    fn visit_function(
        &mut self,
        it: &oxc_ast::ast::Function<'a>,
        flags: oxc_syntax::scope::ScopeFlags,
    ) {
        let mark = self.locals.len();
        for param in it.params.items.iter() {
            self.declare_pattern(&param.pattern);
        }
        if let Some(rest) = &it.params.rest {
            self.declare_pattern(&rest.rest.argument);
        }
        oxc_ast_visit::walk::walk_function(self, it, flags);
        self.locals.truncate(mark);
    }

    fn visit_arrow_function_expression(&mut self, it: &oxc_ast::ast::ArrowFunctionExpression<'a>) {
        let mark = self.locals.len();
        for param in it.params.items.iter() {
            self.declare_pattern(&param.pattern);
        }
        if let Some(rest) = &it.params.rest {
            self.declare_pattern(&rest.rest.argument);
        }
        oxc_ast_visit::walk::walk_arrow_function_expression(self, it);
        self.locals.truncate(mark);
    }

    fn visit_for_statement(&mut self, it: &oxc_ast::ast::ForStatement<'a>) {
        let mark = self.locals.len();
        if let Some(oxc_ast::ast::ForStatementInit::VariableDeclaration(vd)) = &it.init {
            for d in vd.declarations.iter() {
                self.declare_pattern(&d.id);
            }
        }
        oxc_ast_visit::walk::walk_for_statement(self, it);
        self.locals.truncate(mark);
    }

    fn visit_for_in_statement(&mut self, it: &oxc_ast::ast::ForInStatement<'a>) {
        // `right` is evaluated outside the loop binding's scope.
        self.visit_expression(&it.right);
        let mark = self.locals.len();
        if let oxc_ast::ast::ForStatementLeft::VariableDeclaration(vd) = &it.left {
            for d in vd.declarations.iter() {
                self.declare_pattern(&d.id);
            }
        }
        self.visit_for_statement_left(&it.left);
        self.visit_statement(&it.body);
        self.locals.truncate(mark);
    }

    fn visit_for_of_statement(&mut self, it: &oxc_ast::ast::ForOfStatement<'a>) {
        self.visit_expression(&it.right);
        let mark = self.locals.len();
        if let oxc_ast::ast::ForStatementLeft::VariableDeclaration(vd) = &it.left {
            for d in vd.declarations.iter() {
                self.declare_pattern(&d.id);
            }
        }
        self.visit_for_statement_left(&it.left);
        self.visit_statement(&it.body);
        self.locals.truncate(mark);
    }

    fn visit_class(&mut self, it: &oxc_ast::ast::Class<'a>) {
        let mark = self.locals.len();
        if let Some(id) = &it.id {
            self.locals.push(id.name.to_string());
        }
        oxc_ast_visit::walk::walk_class(self, it);
        self.locals.truncate(mark);
    }
}

/// Resolve a list of identifier names to deduped instance-scope binding indices.
fn names_to_instance_binding_indices(names: &[String], state: &ServerTransformState) -> Vec<usize> {
    let mut out: Vec<usize> = Vec::new();
    for name in names {
        if let Some(idx) = state
            .analysis
            .root
            .get_binding(name, state.analysis.root.instance_scope_index)
            && !out.contains(&idx)
        {
            out.push(idx);
        }
    }
    out
}

/// Lower a legacy `VariableDeclaration`. `is_export` marks `export let …`
/// declarators whose simple-identifier bindings are bindable props. `verbatim`
/// is set to the source range when the declaration was re-parsed WHOLE, which is
/// what lets its interior comments be replayed.
fn lower_legacy_var_decl<'a>(
    vd: &oxc_ast::ast::VariableDeclaration,
    src: &str,
    state: &mut ServerTransformState<'a>,
    is_export: bool,
    array_counter: &mut u32,
    verbatim: &mut Option<Span>,
) -> Vec<Statement<'a>> {
    if vd.declarations.first().is_some_and(|d| {
        let mut leaves: Vec<String> = Vec::new();
        collect_binding_pattern_idents(&d.id, &mut leaves);
        // A prop lowers to `$$props[…]` and a destructured state expands into a
        // temp group; a plain or identifier-state declarator does neither.
        !leaves.iter().any(|n| legacy_binding_is_prop(state, n))
            && (matches!(d.id, oxc_ast::ast::BindingPattern::BindingIdentifier(_))
                || !leaves.iter().any(|n| legacy_binding_is_state(state, n)))
    }) && let Some(stmt) = reparse_var_decl_whole(vd, src, state)
    {
        *verbatim = Some(vd.span);
        return vec![stmt];
    }

    let b = state.b;
    let kind = match vd.kind {
        VariableDeclarationKind::Const => VariableDeclarationKind::Const,
        VariableDeclarationKind::Var => VariableDeclarationKind::Var,
        _ => VariableDeclarationKind::Let,
    };

    let _ = is_export;
    // Each source declarator contributes ONE output statement (写経 upstream's
    // `VariableDeclaration` visitor, which splits TOP-LEVEL declarators apart).
    // A destructure that expands via `create_state_declarators`
    // / `create_props_destructure_declarators` into a `tmp = …, leaf = …` group
    // stays COMBINED inside that one statement.
    let mut out: Vec<Statement<'a>> = Vec::new();

    for d in vd.declarations.iter() {
        let mut decls: Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)> =
            Vec::new();
        // 写经 upstream `VariableDeclaration.js` legacy (non-runes) branch
        // (lines 142-210): the prop / state lowering is keyed on the BINDING
        // KIND of each declarator's leaves, NOT on whether the declaration
        // itself carries `export`. A binding becomes a `bindable_prop` whenever
        // it is exported — whether via `export let x` (declaration export) or a
        // separate `export { x }` specifier referring to a previously-declared
        // `let x`. Both must prop-lower identically.
        //
        //   has_props → `let x = $$props['alias']` / `$.fallback(prop, default)`
        //               (identifier) or a `tmp = init` + per-leaf-fallback
        //               expansion (destructure).
        //   has_state (and not props) → identifier kept verbatim; destructure
        //               expanded via `create_state_declarators` (`tmp = init,
        //               leaf = tmp.path, …`).
        //   neither → plain re-parse + read-wrap (unchanged).
        //
        // A `const` binding can never be a prop or reactive state, so an
        // `export const` keeps its declarator verbatim (handled by the `neither`
        // branch — its leaves are `Normal`/`Static`).
        let mut leaf_names: Vec<String> = Vec::new();
        collect_binding_pattern_idents(&d.id, &mut leaf_names);
        let has_props = leaf_names.iter().any(|n| legacy_binding_is_prop(state, n));
        let has_state = leaf_names.iter().any(|n| legacy_binding_is_state(state, n));

        if has_props {
            let pat_span = d.id.span();
            let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
            let Some(pat) = state.reparse_pattern(pat_slice) else {
                continue;
            };

            if let oxc_ast::ast::BindingPattern::BindingIdentifier(id) = &pat {
                // `let x = $$props['alias']` or `… = $.fallback($$props['alias'], …)`.
                let alias = legacy_prop_alias(state, id.name.as_str());
                let prop = b.member_computed(b.id("$$props"), b.string(&alias));
                let init = match d.init.as_ref() {
                    None => prop,
                    Some(init) => {
                        let mut default_expr = reparse_init_read_wrapped(init, src, state);
                        // 写经 `build_fallback`: the "is simple" test runs on the
                        // ALREADY-VISITED (read-wrapped) value, so `= $store`
                        // (wrapped to a `$.store_get(...)` CALL) is NOT simple and
                        // gets the `() => …, true` thunk form.
                        build_legacy_fallback(
                            state,
                            prop,
                            std::mem::replace(&mut default_expr, b.void0()),
                        )
                    }
                };
                decls.push((pat, Some(init)));
                // A single identifier declarator → one statement.
                out.push(b.var_decl_from_pairs(kind, decls));
            } else {
                // Destructured export: `export let { x: foo, z: [bar] } = …` —
                // the LEAVES are the prop names. Emit `tmp = init`, then one
                // `leaf = $.fallback($$props[alias], <access>)` per path (写经
                // `VariableDeclaration.js:155-180`). The synthetic group stays
                // COMBINED in one statement.
                let init_expr = d
                    .init
                    .as_ref()
                    .map(|init| reparse_init_read_wrapped(init, src, state));
                create_props_destructure_declarators(
                    pat,
                    init_expr,
                    state,
                    array_counter,
                    &mut decls,
                );
                out.push(b.var_decl_from_pairs(kind, decls));
            }
            continue;
        }

        if has_state {
            let pat_span = d.id.span();
            let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
            let Some(pat) = state.reparse_pattern(pat_slice) else {
                continue;
            };
            let init_expr = d
                .init
                .as_ref()
                .map(|init| reparse_init_read_wrapped(init, src, state));
            if matches!(pat, oxc_ast::ast::BindingPattern::BindingIdentifier(_)) {
                // `let x = <init>` where `x` is reactive legacy state — kept
                // verbatim (the reactivity is handled by `$:`-driven reruns).
                decls.push((pat, init_expr));
            } else {
                // Destructured reactive state: `let { a, b } = obj` →
                // `let tmp = obj, a = tmp.a, b = tmp.b;` (写経
                // `create_state_declarators`). The synthetic group stays COMBINED.
                // Reuses THIS function's already-threaded `array_counter` (shared
                // with the props-destructure and assignment-destructure `$$array`
                // temps below), so a state destructure sharing a script with
                // either still deconflicts (写経 the single per-component
                // `scope.generate('$$array')`).
                create_state_declarators(pat, init_expr, state, array_counter, &mut decls);
            }
            out.push(b.var_decl_from_pairs(kind, decls));
            continue;
        }

        // Plain declarator (no prop / no state leaves). Re-parse the whole
        // declarator and route its init through read-wrapping.
        let slice = &src[d.span.start as usize..d.span.end as usize];
        if let Some((pat, mut init)) = state.reparse_declarator(slice, kind) {
            if let Some(init) = init.as_mut() {
                super::read_wrap::wrap_reads(
                    init,
                    b,
                    state.analysis,
                    state.analysis.root.instance_scope_index,
                );
            }
            decls.push((pat, init));
            out.push(b.var_decl_from_pairs(kind, decls));
        }
    }

    out
}

/// Whether the legacy instance binding `name` is a component PROP
/// (`Prop` / `BindableProp` kind). 写经 upstream's `has_props` test
/// (`bindings.some(b => b.kind === 'bindable_prop')`): only such bindings are
/// prop-lowered to `$$props['…']`; an `export const` (a `Normal`/`Static`
/// binding) is kept verbatim.
fn legacy_binding_is_prop(state: &ServerTransformState, name: &str) -> bool {
    // Prefer an actual `prop` / `bindable_prop` binding of this name: a same-named
    // `function f(prop) {…}` parameter can be registered at the instance scope
    // index by Phase-2, so `get_binding` would return the parameter (kind
    // `normal`) and the prop would be emitted as a plain local instead of being
    // lowered to `$.fallback($$props['…'], …)`.
    if state
        .analysis
        .root
        .bindings
        .iter()
        .any(|b| b.name == name && matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp))
    {
        return true;
    }
    if let Some(idx) = state
        .analysis
        .root
        .get_binding(name, state.analysis.root.instance_scope_index)
    {
        matches!(
            state.analysis.root.bindings[idx].kind,
            BindingKind::Prop | BindingKind::BindableProp
        )
    } else {
        false
    }
}

/// Whether the legacy instance binding `name` is reactive STATE
/// (`State` / `RawState` kind — 写経 upstream's `has_state` test
/// `bindings.some(b => b.kind === 'state')`). A destructured declarator with
/// any such leaf is expanded via `create_state_declarators`.
fn legacy_binding_is_state(state: &ServerTransformState, name: &str) -> bool {
    if let Some(idx) = state
        .analysis
        .root
        .get_binding(name, state.analysis.root.instance_scope_index)
    {
        matches!(
            state.analysis.root.bindings[idx].kind,
            BindingKind::State | BindingKind::RawState
        )
    } else {
        false
    }
}

/// Collect every leaf identifier name from a `BindingPattern` (the destructure
/// leaves), ignoring object-property keys and default values. Used to classify
/// a legacy declarator's binding kinds.
fn collect_binding_pattern_idents(pat: &oxc_ast::ast::BindingPattern, out: &mut Vec<String>) {
    use oxc_ast::ast::BindingPattern as P;
    match pat {
        P::BindingIdentifier(id) => out.push(id.name.to_string()),
        P::ObjectPattern(obj) => {
            for prop in obj.properties.iter() {
                collect_binding_pattern_idents(&prop.value, out);
            }
            if let Some(rest) = &obj.rest {
                collect_binding_pattern_idents(&rest.argument, out);
            }
        }
        P::ArrayPattern(arr) => {
            for el in arr.elements.iter().flatten() {
                collect_binding_pattern_idents(el, out);
            }
            if let Some(rest) = &arr.rest {
                collect_binding_pattern_idents(&rest.argument, out);
            }
        }
        P::AssignmentPattern(asgn) => collect_binding_pattern_idents(&asgn.left, out),
    }
}

/// Re-parse a declarator init from its source span and route it through
/// instance-scope read-wrapping (store `$x` → `$.store_get(...)`, etc.).
fn reparse_init_read_wrapped<'a>(
    init: &OxcExpression,
    src: &str,
    state: &mut ServerTransformState<'a>,
) -> OxcExpression<'a> {
    let b = state.b;
    let init_span = init.span();
    let dslice = &src[init_span.start as usize..init_span.end as usize];
    let mut expr = state
        .reparse_slice_owned(dslice)
        .unwrap_or_else(|| b.void0());
    super::read_wrap::wrap_reads(
        &mut expr,
        b,
        state.analysis,
        state.analysis.root.instance_scope_index,
    );
    expr
}

/// Port of upstream `VariableDeclaration.js:155-180` for a DESTRUCTURED export
/// declarator whose leaves are props (`export let { x: foo, z: [bar] } = …`).
/// The leaves — NOT the object keys — are the prop names. Emits `tmp = init`,
/// then a `$$array = $.to_array(...)` insert per array sub-pattern, then one
/// `leaf = $.fallback($$props[alias], <access>)` per terminal path.
fn create_props_destructure_declarators<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    value: Option<OxcExpression<'a>>,
    state: &ServerTransformState<'a>,
    array_counter: &mut u32,
    decls: &mut Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)>,
) {
    let b = state.b;
    let tmp_name = "tmp";

    // `let tmp = <init>`
    decls.push((b.id_pat(tmp_name), value));

    let mut paths: Vec<(oxc_ast::ast::BindingPattern<'a>, OxcExpression<'a>)> = Vec::new();
    let mut array_decls: Vec<(String, OxcExpression<'a>)> = Vec::new();
    extract_paths(
        pat,
        b.id(tmp_name),
        state,
        array_counter,
        &mut paths,
        &mut array_decls,
    );

    for (name, value) in array_decls {
        decls.push((b.id_pat(&name), Some(value)));
    }

    for (node, access) in paths {
        // The leaf is the prop name; the access expression is its default value.
        let leaf_name = match &node {
            oxc_ast::ast::BindingPattern::BindingIdentifier(id) => id.name.to_string(),
            _ => String::new(),
        };
        let alias = legacy_prop_alias(state, &leaf_name);
        let prop = b.member_computed(b.id("$$props"), b.string(&alias));
        let init = build_legacy_fallback(state, prop, access);
        decls.push((node, Some(init)));
    }
}

/// Resolve the prop alias for an `export let <name>` binding (`prop_alias ?? name`).
fn legacy_prop_alias(state: &ServerTransformState, name: &str) -> String {
    if let Some(idx) = state
        .analysis
        .root
        .get_binding(name, state.analysis.root.instance_scope_index)
    {
        let binding = &state.analysis.root.bindings[idx];
        if let Some(alias) = &binding.prop_alias {
            return alias.clone();
        }
    }
    name.to_string()
}

/// Build the `$.fallback(...)` init for an `export let x = <default>` (写经
/// `build_fallback`): a simple default value emits `$.fallback(prop, default)`;
/// anything else emits `$.fallback(prop, () => default, true)` (the thunk
/// auto-collapses a bare no-arg call `() => f()` to `f`).
fn build_legacy_fallback<'a>(
    state: &ServerTransformState<'a>,
    prop: OxcExpression<'a>,
    default_expr: OxcExpression<'a>,
) -> OxcExpression<'a> {
    let b = state.b;
    if is_simple_default(&default_expr) {
        b.call("$.fallback", vec![prop, default_expr])
    } else {
        let thunk = b.thunk(default_expr, false);
        b.call("$.fallback", vec![prop, thunk, b.id("true")])
    }
}

/// Whether the classification-AST `init` expression is a "simple" default value
/// per upstream's `is_simple_expression` (Literal / Identifier / Arrow / Fn,
/// and Conditional / Binary / Logical recursively over simple operands).
fn is_simple_default(init: &OxcExpression) -> bool {
    use OxcExpression as E;
    match init {
        E::BooleanLiteral(_)
        | E::NullLiteral(_)
        | E::NumericLiteral(_)
        | E::BigIntLiteral(_)
        | E::RegExpLiteral(_)
        | E::StringLiteral(_)
        | E::Identifier(_)
        | E::ArrowFunctionExpression(_)
        | E::FunctionExpression(_) => true,
        E::ConditionalExpression(c) => {
            is_simple_default(&c.test)
                && is_simple_default(&c.consequent)
                && is_simple_default(&c.alternate)
        }
        E::BinaryExpression(bin) => is_simple_default(&bin.left) && is_simple_default(&bin.right),
        E::LogicalExpression(l) => is_simple_default(&l.left) && is_simple_default(&l.right),
        // Upstream parses with `preserveParens: false`, so a parenthesized
        // sub-expression like `(max - min)` is an implicit/transparent node there.
        // OXC preserves it as a `ParenthesizedExpression`, so unwrap it to match —
        // otherwise an otherwise-simple default (e.g. `min + (max - min) / 2`) is
        // wrongly treated as complex and emitted as a lazy `$.fallback(…, () => …, true)`.
        E::ParenthesizedExpression(p) => is_simple_default(&p.expression),
        _ => false,
    }
}

/// Collect the legacy_reactive var names assigned to by a `$: <name> = …` body,
/// so a hoisted `let <name>;` is emitted (写经 the `extract_identifiers` walk
/// over the assignment LHS, filtered to `binding.kind === 'legacy_reactive'`).
fn collect_legacy_reactive_decls(
    body: &Statement,
    state: &ServerTransformState,
    out: &mut Vec<String>,
) {
    let Statement::ExpressionStatement(es) = body else {
        return;
    };
    // `$: ({ a } = obj)` parses with a `ParenthesizedExpression` wrapper in oxc
    // (ESTree has none); unwrap it so the inner `AssignmentExpression` is seen
    // (写经 `node.body.expression.type === 'AssignmentExpression'`).
    let mut inner = &es.expression;
    while let OxcExpression::ParenthesizedExpression(p) = inner {
        inner = &p.expression;
    }
    let OxcExpression::AssignmentExpression(assign) = inner else {
        return;
    };
    let mut names: Vec<String> = Vec::new();
    collect_assignment_target_idents(&assign.left, &mut names);
    for name in names {
        if let Some(idx) = state
            .analysis
            .root
            .get_binding(&name, state.analysis.root.instance_scope_index)
            && state.analysis.root.bindings[idx].kind == BindingKind::LegacyReactive
            && !out.contains(&name)
        {
            out.push(name);
        }
    }
}

/// Extract identifier names from an assignment target (simple id, or destructure
/// array/object pattern leaves).
fn collect_assignment_target_idents(
    target: &oxc_ast::ast::AssignmentTarget,
    out: &mut Vec<String>,
) {
    use oxc_ast::ast::AssignmentTarget as T;
    match target {
        T::AssignmentTargetIdentifier(id) => out.push(id.name.to_string()),
        T::ArrayAssignmentTarget(arr) => {
            for el in arr.elements.iter().flatten() {
                collect_assignment_maybe_default(el, out);
            }
            if let Some(rest) = &arr.rest {
                collect_assignment_target_idents(&rest.target, out);
            }
        }
        T::ObjectAssignmentTarget(obj) => {
            for prop in obj.properties.iter() {
                match prop {
                    oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(
                        p,
                    ) => out.push(p.binding.name.to_string()),
                    oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                        collect_assignment_maybe_default(&p.binding, out);
                    }
                }
            }
            if let Some(rest) = &obj.rest {
                collect_assignment_target_idents(&rest.target, out);
            }
        }
        // A member-expression target (`obj.x = …`) declares nothing.
        _ => {}
    }
}

/// Handle an `AssignmentTargetMaybeDefault` element (`x` or `x = default`).
fn collect_assignment_maybe_default(
    el: &oxc_ast::ast::AssignmentTargetMaybeDefault,
    out: &mut Vec<String>,
) {
    use oxc_ast::ast::AssignmentTargetMaybeDefault as M;
    match el {
        M::AssignmentTargetWithDefault(d) => collect_assignment_target_idents(&d.binding, out),
        other => {
            if let Some(t) = other.as_assignment_target() {
                collect_assignment_target_idents(t, out);
            }
        }
    }
}

/// Public entry: transform the instance script into component-body statements,
/// pushing any imports onto `state.hoisted`.
pub fn transform_instance<'a>(
    ast: &crate::ast::template::Root,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let Some(script) = ast.instance.as_deref() else {
        return Vec::new();
    };
    let mut imports: Vec<Statement<'a>> = Vec::new();
    let body = if state.analysis.runes {
        transform_script(script, state, Some(&mut imports), true)
    } else {
        transform_script_legacy(script, state, Some(&mut imports), true)
    };
    for imp in imports {
        state.hoisted.push(imp);
    }

    // Async instance-body splitting (Stage 1). When `experimental.async` is on
    // (`state.eval_inputs.use_async`) AND the transformed instance body contains
    // a top-level `await`, upstream rewrites the body into a sync prelude +
    // `var $$promises = $$renderer.run([…thunks])` (写经
    // `transform-server.js` async branch → `shared/transform-async.js`).
    //
    // We REUSE the proven text-based `transform_async_body` (which does all the
    // statement classification, consecutive-sync-statement grouping, `$inspect`
    // → `() => void 0` thunking, and `$$promises[N]` indexing): print the
    // already-lowered oxc body to text, run the transform, then re-parse its
    // output back into oxc statements. The transform is a no-op (returns `None`)
    // when there is no top-level await, so a plain async-flagged component with
    // only sync instance statements falls through unchanged. `use_async` is
    // false for every ordinary component, so this never touches sync output.
    if state.eval_inputs.use_async && !body.is_empty() {
        use crate::compiler::phases::phase3_transform::profile;
        let _t = profile::timer_start();
        let body_text = state.b.program(body_clone(state, &body)).pipe_print();
        let print_elapsed = profile::timer_elapsed(_t);
        if let Some(result) =
            crate::compiler::phases::phase3_transform::shared::async_body::transform_async_body_dev(
                body_text.trim(),
                "$$renderer.run",
                state.options.dev,
            )
        {
            let _t = profile::timer_start();
            let reparsed = state.reparse_program(result.output.trim());
            profile::record_esrap_pipe(print_elapsed, profile::timer_elapsed(_t));
            if !reparsed.is_empty() {
                return reparsed;
            }
        } else {
            profile::record_esrap_pipe(print_elapsed, std::time::Duration::ZERO);
        }
    }

    // No top-level await ⇒ `transform_async_body` did not run. Any placeholder
    // left behind for a removed `$inspect(...)` / `$effect(...)` statement must
    // collapse here (the async-body transform would have rewritten the marker
    // when an await actually split the body). Without this, `$$async_hole;` /
    // `$$inspect_hole;` would leak into the SSR output of an
    // async-flagged-but-await-free component.
    //
    //   * `$$async_hole`  ($effect-family)  → `b.empty()` (a bare `EmptyStatement`,
    //     elided by esrap → prints nothing — matches upstream's `ExpressionStatement`
    //     visitor returning `b.empty`).
    //   * `$$inspect_hole` ($inspect / $inspect().with) → a `;;` pair, mirroring the
    //     sync-prelude path (upstream keeps the `ExpressionStatement`, its
    //     expression replaced by the `CallExpression` visitor's `b.empty`).
    //
    // A `$$inspect_hole` expands to TWO statements, so rebuild the body rather
    // than edit in place.
    let mut rebuilt: Vec<Statement<'a>> = Vec::with_capacity(body.len());
    for stmt in body.into_iter() {
        if is_inspect_hole_stmt(&stmt) {
            let start = stmt.span().start;
            rebuilt.push(state.b.empty_kept(start));
            rebuilt.push(state.b.empty_kept(start + 1));
        } else if is_async_hole_stmt(&stmt) {
            rebuilt.push(state.b.empty());
        } else {
            rebuilt.push(stmt);
        }
    }

    rebuilt
}

/// True when `stmt` is the `($$inspect_hole);` placeholder expression statement.
fn is_inspect_hole_stmt(stmt: &Statement) -> bool {
    use oxc_ast::ast::Expression;
    let Statement::ExpressionStatement(es) = stmt else {
        return false;
    };
    let mut expr = &es.expression;
    while let Expression::ParenthesizedExpression(p) = expr {
        expr = &p.expression;
    }
    matches!(expr, Expression::Identifier(id) if id.name == "$$inspect_hole")
}

/// True when `stmt` is the `($$async_hole);` placeholder expression statement
/// (an identifier reference to `$$async_hole`, optionally parenthesized).
fn is_async_hole_stmt(stmt: &Statement) -> bool {
    use oxc_ast::ast::Expression;
    let Statement::ExpressionStatement(es) = stmt else {
        return false;
    };
    let mut expr = &es.expression;
    while let Expression::ParenthesizedExpression(p) = expr {
        expr = &p.expression;
    }
    matches!(expr, Expression::Identifier(id) if id.name == "$$async_hole")
}

/// Print a slice of oxc statements to JS source text via the esrap printer
/// (used to round-trip the lowered instance body through the text-based
/// `transform_async_body`). Consumes a freshly-cloned copy so the original
/// statements stay usable.
trait PipePrint {
    fn pipe_print(self) -> String;
}
impl<'a> PipePrint for oxc_ast::ast::Program<'a> {
    fn pipe_print(self) -> String {
        rsvelte_esrap::print(&self, "")
    }
}

/// Deep-clone a slice of statements into the state allocator. `transform_async_body`
/// needs the body as TEXT; cloning lets us print a throwaway copy while keeping
/// the originals available for the non-async fall-through path.
fn body_clone<'a>(state: &ServerTransformState<'a>, body: &[Statement<'a>]) -> Vec<Statement<'a>> {
    use oxc_allocator::CloneIn;
    body.iter().map(|s| s.clone_in(state.allocator)).collect()
}

/// Public entry: transform the module script into module-scope statements.
pub fn transform_module<'a>(
    ast: &crate::ast::template::Root,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let Some(script) = ast.module.as_deref() else {
        return Vec::new();
    };
    let mut body = if state.analysis.runes {
        transform_script(script, state, None, false)
    } else {
        // Module (non-runes): no instance-scope props / reactive `$:` (a
        // top-level `$:` in a module body is NOT a reactive statement), so
        // `is_instance = false`.
        transform_script_legacy(script, state, None, false)
    };
    // A top-level `$:` in a `<script module>` is an INVALID reactive declaration
    // (module scope has no per-instance reactivity); upstream warns
    // (`reactive_declaration_module_script_dependency`) and drops it from output.
    body.retain(|s| !matches!(s, Statement::LabeledStatement(l) if l.label.name == "$"));
    body
}
