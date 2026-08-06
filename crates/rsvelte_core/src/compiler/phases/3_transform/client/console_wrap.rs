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

use oxc_ast::ast::{
    BindingIdentifier, BindingPattern, Program, VariableDeclarationKind, VariableDeclarator,
};
use oxc_ast_visit::{Visit, walk};
use rustc_hash::FxHashMap;
use serde_json::Value;

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase3_transform::server::evaluate::EvalCtx;

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
            arg.get("type").and_then(|t| t.as_str()) == Some("SpreadElement")
                || ctx.evaluate_estree(arg, 0).has_unknown()
        })
    })
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
    /// Names declared exactly once in the whole program by a `const` declarator
    /// with an initializer, mapped to that initializer's verdict. A name
    /// declared more than once is absent: the text alone cannot say which
    /// declaration a reference reaches.
    verdicts: FxHashMap<String, bool>,
}

pub(super) fn collect_local_consts(
    program: &Program<'_>,
    analysis: Option<&ComponentAnalysis>,
) -> LocalConsts {
    let mut collector = ConstCollector {
        analysis,
        counts: FxHashMap::default(),
        verdicts: FxHashMap::default(),
    };
    collector.visit_program(program);
    let ConstCollector {
        counts,
        mut verdicts,
        ..
    } = collector;
    verdicts.retain(|name, _| counts.get(name) == Some(&1));
    LocalConsts { verdicts }
}

struct ConstCollector<'an> {
    analysis: Option<&'an ComponentAnalysis>,
    counts: FxHashMap<String, u32>,
    verdicts: FxHashMap<String, bool>,
}

impl<'a> Visit<'a> for ConstCollector<'_> {
    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'a>) {
        *self.counts.entry(it.name.to_string()).or_insert(0) += 1;
    }

    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        walk::walk_variable_declarator(self, it);
        if !matches!(it.kind, VariableDeclarationKind::Const) {
            return;
        }
        let BindingPattern::BindingIdentifier(id) = &it.id else {
            return;
        };
        let Some(init) = &it.init else {
            return;
        };
        // No `locals` while building the index: a chained `const a = b` stays
        // unresolved rather than depending on visit order.
        self.verdicts.insert(
            id.name.to_string(),
            shape_can_be_unknown(init, self.analysis, None),
        );
    }
}

/// Whether a bare identifier left in generated code can still evaluate to
/// `UNKNOWN`. Shadowing declarations are left to `evaluate_identifier`, whose
/// agreement rule unions the candidates' value sets — so a name the generated
/// text cannot resolve stays unknown, which is the direction that keeps a wrap
/// upstream emits.
fn identifier_can_be_unknown(
    name: &str,
    analysis: Option<&ComponentAnalysis>,
    locals: Option<&LocalConsts>,
) -> bool {
    if name == "undefined" {
        return false;
    }
    if let Some(&verdict) = locals.and_then(|l| l.verdicts.get(name)) {
        return verdict;
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
        E::Identifier(id) => identifier_can_be_unknown(&id.name, analysis, locals),
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
        E::CallExpression(call) => match state_read_operand(call) {
            Some(name) => identifier_can_be_unknown(name, analysis, locals),
            None => !is_never_unknown_call(&call.callee),
        },
        _ => true,
    }
}

/// The declaration name behind a lowered reactive read (`$.get(count)` /
/// `$.safe_get(count)`), which upstream evaluated as the bare identifier.
fn state_read_operand<'a>(call: &'a oxc_ast::ast::CallExpression<'_>) -> Option<&'a str> {
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
        E::Identifier(id) => Some(id.name.as_str()),
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
