//! The single decision point for dev-mode `console.METHOD(...)` wrapping.
//!
//! Upstream (`3-transform/client/visitors/CallExpression.js`) wraps a console
//! call only when
//!
//! ```js
//! node.arguments.some(
//!   (arg) => arg.type === 'SpreadElement' || context.state.scope.evaluate(arg).has_unknown
//! )
//! ```
//!
//! `scope.evaluate` is the `Evaluation` lattice already ported for the server
//! transform, so the template path — which still holds the original estree
//! nodes and the analysis — reuses it verbatim.
//!
//! The script paths rewrite *generated* JS text, where an identifier has
//! already been lowered (`n` → `$.get(n)`) and the original scope is gone. They
//! get [`shape_can_be_unknown`], the scope-free half of the same lattice: every
//! operator branch that upstream resolves to a `STRING` / `NUMBER` / boolean
//! value set without consulting a binding.

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    ArrayExpressionElement, BindingIdentifier, BindingPattern, IdentifierReference, Program,
    Statement, VariableDeclarator,
};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use rustc_hash::{FxHashMap, FxHashSet};
use serde_json::Value;

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase3_transform::server::evaluate as server_evaluate;
use crate::compiler::phases::phase3_transform::server::evaluate::EvalCtx;
use crate::compiler::phases::phase3_transform::shared::json_field::Field;

pub(super) const CONSOLE_METHODS: &[&str] = &[
    "debug",
    "dir",
    "error",
    "group",
    "groupCollapsed",
    "info",
    "log",
    "trace",
    "warn",
];

/// Run `f` with an `EvalCtx` wired to `analysis` — the client transform has no
/// `{@const}` table, no async blockers and no single render position, so every
/// other field is inert.
fn with_eval_ctx<R>(
    analysis: &ComponentAnalysis,
    current_scope_index: Option<usize>,
    f: impl FnOnce(&EvalCtx<'_>) -> R,
) -> R {
    let constant_vars = rustc_hash::FxHashMap::default();
    let blocker_map = rustc_hash::FxHashMap::default();
    let template_scopes_cache = std::cell::OnceCell::new();
    f(&EvalCtx {
        analysis: Some(analysis),
        constant_vars: &constant_vars,
        source: &analysis.source,
        use_async: false,
        top_level_blocker_map: &blocker_map,
        current_scope_index,
        template_scopes_cache: &template_scopes_cache,
    })
}

/// Upstream's `arguments.some(...)` test, evaluated against the original
/// estree arguments with binding resolution.
pub(super) fn args_need_wrap(args: &[Value], analysis: &ComponentAnalysis) -> bool {
    if args.is_empty() {
        return false;
    }
    with_eval_ctx(analysis, None, |ctx| {
        args.iter().any(|arg| {
            arg.field("type").and_then(|t| t.as_str()) == Some("SpreadElement")
                || ctx.evaluate_estree(arg, 0).has_unknown()
        })
    })
}

/// Upstream's `arguments.some(...)` test applied to an argument list that is
/// only available as text — the fallback the fragment path takes when oxc
/// rejects the whole statement.
///
/// `Some(verdict)` when the list parses; `None` when it does not, which is the
/// caller's cue to keep its own heuristic. Parsing the arguments as an array
/// literal maps them one-to-one onto elements, spreads included, without
/// needing the statement around them to be well-formed.
pub(super) fn args_text_need_wrap(
    args: &str,
    is_ts: bool,
    analysis: Option<&ComponentAnalysis>,
) -> Option<bool> {
    let source = format!("[{args}]");
    let source_type = if is_ts {
        SourceType::ts()
    } else {
        SourceType::mjs()
    };
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &source, source_type).parse();
    if !parsed.diagnostics.is_empty() {
        return None;
    }
    let [Statement::ExpressionStatement(stmt)] = parsed.program.body.as_slice() else {
        return None;
    };
    let oxc_ast::ast::Expression::ArrayExpression(array) = &stmt.expression else {
        return None;
    };
    Some(array.elements.iter().any(|element| {
        match element {
            ArrayExpressionElement::SpreadElement(_) => true,
            ArrayExpressionElement::Elision(_) => true,
            other => other
                .as_expression()
                .is_none_or(|expr| shape_can_be_unknown(expr, analysis, None)),
        }
    }))
}

/// The generated program's own `const` declarations, indexed by name.
///
/// `analysis` only carries root / instance / template bindings, so a name bound
/// inside a nested function — the common case in a `.svelte.(js|ts)` module —
/// resolves nowhere and errs toward `UNKNOWN`. Upstream's `scope.get(name)`
/// reaches it, so the text passes rebuild the same reach from the parsed
/// program.
#[derive(Default)]
pub(super) struct LocalConsts {
    /// Declarator verdicts keyed by the SYMBOL they declare. Keying by name
    /// drops every duplicated name, and the fallback for a missing verdict is
    /// `UNKNOWN` — so `let c = 0` at the root and `let c = 1` in a function
    /// silenced each other and both wrapped, where upstream resolves each
    /// reference to its own declaration.
    verdicts: FxHashMap<oxc_semantic::SymbolId, bool>,
    /// Reference start -> the symbol it resolves to, for every reference that
    /// resolves at all. A reference below the generated program's root scope
    /// must not fall through to a same-named instance binding: a parameter or
    /// local declaration shadows it exactly as it does upstream.
    resolved: FxHashMap<u32, oxc_semantic::SymbolId>,
    /// The subset of `resolved` whose symbol is declared below the root scope.
    local_references: FxHashSet<u32>,
}

pub(super) fn collect_local_consts(
    program: &Program<'_>,
    analysis: Option<&ComponentAnalysis>,
) -> LocalConsts {
    let semantic_ret = SemanticBuilder::new().build(program);
    let semantic = &semantic_ret.semantic;
    let mut references = LocalReferenceCollector {
        semantic,
        resolved: FxHashMap::default(),
        starts: FxHashSet::default(),
    };
    references.visit_program(program);
    let mut writes = LoweredWriteCollector {
        semantic,
        written: FxHashSet::default(),
    };
    writes.visit_program(program);
    // The index is built with the reference sets but no verdicts: whether a name is
    // locally BOUND is what disqualifies a global keypath (`const Math = …` shadows
    // `Math.random()`), and unlike a verdict that answer does not depend on visit
    // order. A chained `const a = b` still stays unresolved.
    let index_locals = LocalConsts {
        verdicts: FxHashMap::default(),
        resolved: references.resolved,
        local_references: references.starts,
    };
    let mut collector = ConstCollector {
        analysis,
        semantic,
        lowered_writes: &writes.written,
        running: index_locals,
    };
    collector.visit_program(program);
    collector.running
}

struct LocalReferenceCollector<'sem> {
    semantic: &'sem Semantic<'sem>,
    resolved: FxHashMap<u32, oxc_semantic::SymbolId>,
    starts: FxHashSet<u32>,
}

impl<'a> Visit<'a> for LocalReferenceCollector<'_> {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        let Some(reference_id) = it.reference_id.get() else {
            return;
        };
        let scoping = self.semantic.scoping();
        let Some(symbol_id) = scoping.get_reference(reference_id).symbol_id() else {
            return;
        };
        self.resolved.insert(it.span.start, symbol_id);
        if scoping.symbol_scope_id(symbol_id) != scoping.root_scope_id() {
            self.starts.insert(it.span.start);
        }
    }
}

/// Symbols a lowered write names. `c = 1` reaches this pass as `$.set(c, 1)`,
/// so oxc scores the only occurrence of `c` a READ and `is_never_written` says
/// yes — where upstream, which sees the source, has `binding.updated` set and
/// evaluates the declaration to `UNKNOWN`. The helper names are the oracle's
/// own: `$.set` for every assignment operator, `$.update` for a postfix and
/// `$.update_pre` for a prefix update.
struct LoweredWriteCollector<'sem> {
    semantic: &'sem Semantic<'sem>,
    written: FxHashSet<oxc_semantic::SymbolId>,
}

impl<'a> Visit<'a> for LoweredWriteCollector<'_> {
    fn visit_call_expression(&mut self, it: &oxc_ast::ast::CallExpression<'a>) {
        walk::walk_call_expression(self, it);
        let oxc_ast::ast::Expression::StaticMemberExpression(member) = &it.callee else {
            return;
        };
        let oxc_ast::ast::Expression::Identifier(obj) = &member.object else {
            return;
        };
        if obj.name != "$"
            || !matches!(
                member.property.name.as_str(),
                "set" | "update" | "update_pre"
            )
        {
            return;
        }
        let Some(oxc_ast::ast::Expression::Identifier(target)) =
            it.arguments.first().and_then(|a| a.as_expression())
        else {
            return;
        };
        if let Some(reference_id) = target.reference_id.get()
            && let Some(symbol_id) = self
                .semantic
                .scoping()
                .get_reference(reference_id)
                .symbol_id()
        {
            self.written.insert(symbol_id);
        }
    }
}

struct ConstCollector<'an, 'sem> {
    analysis: Option<&'an ComponentAnalysis>,
    semantic: &'sem Semantic<'sem>,
    lowered_writes: &'sem FxHashSet<oxc_semantic::SymbolId>,
    /// The verdicts collected so far, consulted while collecting the next one.
    /// A declarator's initializer can name an earlier declaration
    /// (`let d = $.derived(() => c)`), and upstream resolves that chain because
    /// it evaluates the ORIGINAL binding's initial; carrying the map forward
    /// reproduces it for every reference a `let`/`const` can legally make,
    /// which is one declared above it.
    running: LocalConsts,
}

impl<'a> Visit<'a> for ConstCollector<'_, '_> {
    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        walk::walk_variable_declarator(self, it);
        let BindingPattern::BindingIdentifier(id) = &it.id else {
            return;
        };
        let Some(init) = &it.init else {
            return;
        };
        let Some(symbol_id) = id.symbol_id.get() else {
            return;
        };
        // Upstream evaluates a binding's initializer when `!binding.updated` —
        // the test is whether the name is ever written, not whether it is `const`.
        if !self.is_never_written(id) {
            return;
        }
        let verdict = shape_can_be_unknown(init, self.analysis, Some(&self.running));
        self.running.verdicts.insert(symbol_id, verdict);
    }
}

impl ConstCollector<'_, '_> {
    fn is_never_written(&self, id: &BindingIdentifier<'_>) -> bool {
        let Some(symbol_id) = id.symbol_id.get() else {
            return false;
        };
        if self.lowered_writes.contains(&symbol_id) {
            return false;
        }
        !self
            .semantic
            .scoping()
            .get_resolved_references(symbol_id)
            .any(oxc_semantic::Reference::is_write)
    }
}

/// Whether a bare identifier left in generated code can still evaluate to
/// `UNKNOWN`. Shadowing declarations are left to `evaluate_identifier`, whose
/// agreement rule unions the candidates' value sets — so a name the generated
/// text cannot resolve stays unknown, which is the direction that keeps a wrap
/// upstream emits.
fn identifier_can_be_unknown(
    name: &str,
    reference_start: u32,
    analysis: Option<&ComponentAnalysis>,
    locals: Option<&LocalConsts>,
) -> bool {
    if name == "undefined" {
        return false;
    }
    // The declaration this reference actually resolves to, which is the
    // question upstream's `scope.get(name)` asks. A parameter and every other
    // binding with no evaluated initializer has no verdict and stays UNKNOWN.
    if let Some(l) = locals
        && let Some(symbol_id) = l.resolved.get(&reference_start)
    {
        return l.verdicts.get(symbol_id).copied().unwrap_or(true);
    }
    if locals.is_some_and(|l| l.local_references.contains(&reference_start)) {
        return true;
    }
    let Some(analysis) = analysis else {
        return true;
    };
    // Resolve from the instance scope: this pass only ever sees script text, so
    // a same-named template binding (an each item, say) is not in scope.
    with_eval_ctx(analysis, Some(analysis.root.instance_scope_index), |ctx| {
        ctx.evaluate_identifier(name, 0).has_unknown()
    })
}

/// The scope-free half of `scope.evaluate(...).has_unknown`: `true` when the
/// expression *shape* alone cannot rule `UNKNOWN` out.
///
/// Every operator upstream models contributes only `STRING` / `NUMBER` /
/// boolean / a folded constant to the value set, never `UNKNOWN` — so a
/// template literal, any binary or (modelled) unary operator, and any function
/// expression are never wrapped whatever their operands resolve to. Identifiers
/// and calls need a binding, which a generated-text pass no longer has, so they
/// stay unknown — the same direction the predicate already erred in.
pub(super) fn shape_can_be_unknown(
    expr: &oxc_ast::ast::Expression<'_>,
    analysis: Option<&ComponentAnalysis>,
    locals: Option<&LocalConsts>,
) -> bool {
    use oxc_ast::ast::Expression as E;
    use oxc_syntax::operator::UnaryOperator;

    let recur = |e: &E<'_>| shape_can_be_unknown(e, analysis, locals);
    match expr {
        E::StringLiteral(_)
        | E::NumericLiteral(_)
        | E::BooleanLiteral(_)
        | E::NullLiteral(_)
        | E::BigIntLiteral(_)
        | E::RegExpLiteral(_)
        | E::TemplateLiteral(_)
        | E::BinaryExpression(_)
        | E::ArrowFunctionExpression(_)
        | E::FunctionExpression(_)
        | E::ClassExpression(_) => false,
        E::Identifier(id) => identifier_can_be_unknown(&id.name, id.span.start, analysis, locals),
        E::UnaryExpression(u) => !matches!(
            u.operator,
            UnaryOperator::LogicalNot
                | UnaryOperator::Delete
                | UnaryOperator::UnaryPlus
                | UnaryOperator::UnaryNegation
                | UnaryOperator::BitwiseNot
                | UnaryOperator::Typeof
                | UnaryOperator::Void
        ),
        E::ConditionalExpression(c) => recur(&c.consequent) || recur(&c.alternate),
        E::LogicalExpression(l) => recur(&l.left) || recur(&l.right),
        E::ParenthesizedExpression(p) => recur(&p.expression),
        E::TSAsExpression(e) => recur(&e.expression),
        E::TSSatisfiesExpression(e) => recur(&e.expression),
        E::TSNonNullExpression(e) => recur(&e.expression),
        E::TSTypeAssertion(e) => recur(&e.expression),
        // rsvelte lowers `a === b` / `a == b` to these helpers *after* upstream
        // has already evaluated the original `BinaryExpression` to `{true,
        // false}`, and reads of a `$state` declaration to `$.get(name)`.
        E::CallExpression(call) => match rune_operand(call) {
            // Upstream's `CallExpression` rune arm evaluates the ARGUMENT of
            // `$state` / `$state.raw` / `$derived`, so a declaration this pass
            // still sees in its rune or lowered spelling must be unwrapped
            // rather than read as an opaque call.
            Some(RuneOperand::Expr(inner)) => recur(inner),
            Some(RuneOperand::Undefined) => false,
            None => match state_read_operand(call) {
                Some(id) => identifier_can_be_unknown(&id.name, id.span.start, analysis, locals),
                // A call upstream's `globals` table types contributes NUMBER or
                // STRING to the value set even when it folds nothing (`Math.random()`),
                // so it is never UNKNOWN.
                None => {
                    !is_never_unknown_call(&call.callee)
                        && !global_keypath(&call.callee, analysis, locals)
                            .is_some_and(|k| server_evaluate::is_global_keypath(&k))
                }
            },
        },
        // `Math.PI` and its siblings are `global_constants` upstream: a known value.
        E::StaticMemberExpression(_) => global_keypath(expr, analysis, locals)
            .is_none_or(|k| server_evaluate::global_constant(&k).is_none()),
        _ => true,
    }
}

/// Upstream's `get_global_keypath`: a dotted chain of plain identifiers whose base
/// resolves to no binding. Only the base needs the lookup — a property name is not
/// a reference.
fn global_keypath(
    expr: &oxc_ast::ast::Expression<'_>,
    analysis: Option<&ComponentAnalysis>,
    locals: Option<&LocalConsts>,
) -> Option<String> {
    use oxc_ast::ast::Expression as E;
    let mut joined = String::new();
    let mut node = expr;
    while let E::StaticMemberExpression(member) = node {
        joined = format!(".{}{}", member.property.name, joined);
        node = &member.object;
    }
    let E::Identifier(base) = node else {
        return None;
    };
    if binding_exists(&base.name, base.span.start, analysis, locals) {
        return None;
    }
    Some(format!("{}{joined}", base.name))
}

/// Whether this reference resolves to a declaration — upstream's
/// `scope.get(name) !== null`, which disqualifies a shadowed `Math` / `Number`.
/// `local_references` holds reference POSITIONS, so a `const Math` in one function
/// does not disqualify `Math.random()` in another; the name-keyed verdict map
/// would, which is the same shadow-by-name hazard this file is full of.
fn binding_exists(
    name: &str,
    reference_start: u32,
    analysis: Option<&ComponentAnalysis>,
    locals: Option<&LocalConsts>,
) -> bool {
    if locals.is_some_and(|l| l.local_references.contains(&reference_start)) {
        return true;
    }
    // Phase 2 records function-locals in `root.bindings` too, so the name lookup
    // has to be confined to the scopes a generated script's ROOT can see —
    // otherwise a `const Math` in one function disqualifies `Math.random()` in
    // every other. `local_references` already covers everything below that.
    analysis.is_some_and(|a| {
        a.root.bindings.iter().any(|b| {
            b.name == name && (b.scope_index == 0 || b.scope_index == a.root.instance_scope_index)
        })
    })
}

/// What a rune call contributes to the value set: its argument, or `undefined`
/// for the argument-less `$state()`.
enum RuneOperand<'a> {
    Expr(&'a oxc_ast::ast::Expression<'a>),
    Undefined,
}

/// `$state(x)` / `$state.raw(x)` / `$derived(x)`, and the shapes rsvelte lowers
/// them to before this text pass runs (`$.state(x)`, `$.derived(() => x)`,
/// `$.tag(inner, 'name')`). Upstream evaluates all of them by evaluating the
/// argument; this pass sees whichever spelling its caller's pipeline stage has
/// reached, so both are inverted here.
fn rune_operand<'a>(call: &'a oxc_ast::ast::CallExpression<'a>) -> Option<RuneOperand<'a>> {
    use oxc_ast::ast::Expression as E;

    let arg = |i: usize| call.arguments.get(i).and_then(|a| a.as_expression());
    let first_or_undefined = || match arg(0) {
        Some(e) => Some(RuneOperand::Expr(e)),
        None => Some(RuneOperand::Undefined),
    };

    match &call.callee {
        // `$state(x)`, `$derived(x)`
        E::Identifier(id) if matches!(id.name.as_str(), "$state" | "$derived") => {
            first_or_undefined()
        }
        E::StaticMemberExpression(member) => {
            let E::Identifier(obj) = &member.object else {
                return None;
            };
            match (obj.name.as_str(), member.property.name.as_str()) {
                // `$state.raw(x)`
                ("$state", "raw") => first_or_undefined(),
                // `$derived.by(() => x)` — upstream only unwraps an expression
                // body; a block body stays UNKNOWN, which is the default here.
                ("$derived", "by") => match arg(0) {
                    Some(E::ArrowFunctionExpression(a)) => {
                        a.get_expression().map(RuneOperand::Expr)
                    }
                    _ => None,
                },
                // The lowered spellings.
                ("$", "state") => first_or_undefined(),
                ("$", "derived" | "derived_safe_equal") => match arg(0) {
                    Some(E::ArrowFunctionExpression(a)) => {
                        a.get_expression().map(RuneOperand::Expr)
                    }
                    _ => None,
                },
                // `$.tag(inner, 'name')` only names the value it wraps.
                ("$", "tag") => arg(0).map(RuneOperand::Expr),
                _ => None,
            }
        }
        _ => None,
    }
}

/// The declaration name behind a lowered reactive read (`$.get(count)` /
/// `$.safe_get(count)`), which upstream evaluated as the bare identifier.
fn state_read_operand<'a>(
    call: &'a oxc_ast::ast::CallExpression<'_>,
) -> Option<&'a IdentifierReference<'a>> {
    use oxc_ast::ast::Expression as E;
    let E::StaticMemberExpression(member) = &call.callee else {
        return None;
    };
    let E::Identifier(obj) = &member.object else {
        return None;
    };
    if obj.name != "$" || !matches!(member.property.name.as_str(), "get" | "safe_get") {
        return None;
    }
    let [arg] = call.arguments.as_slice() else {
        return None;
    };
    match arg.as_expression()? {
        E::Identifier(id) => Some(id),
        _ => None,
    }
}

/// Calls upstream's lattice resolves to a value set with no `UNKNOWN`:
/// `$effect.tracking()` (boolean) and `$props.id()` (`STRING`), plus the dev
/// lowerings of expressions it had already evaluated (`a === b` →
/// `$.strict_equals(a, b)`).
fn is_never_unknown_call(callee: &oxc_ast::ast::Expression<'_>) -> bool {
    use oxc_ast::ast::Expression as E;
    let E::StaticMemberExpression(member) = callee else {
        return false;
    };
    let E::Identifier(obj) = &member.object else {
        return false;
    };
    match obj.name.as_str() {
        "$" => matches!(
            member.property.name.as_str(),
            "strict_equals" | "equals" | "effect_tracking"
        ),
        "$effect" => member.property.name == "tracking",
        "$props" => member.property.name == "id",
        _ => false,
    }
}
