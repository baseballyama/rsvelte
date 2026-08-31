//! Utility functions for component transformation.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.

use rustc_hash::{FxHashMap, FxHashSet};

use crate::compiler::phases::phase2_analyze::scope::{Binding, BindingKind};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::assignment_helpers::build_assignment_value;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::builders::is_valid_identifier;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
// The `scope.evaluate` port lives with the server transform, but it is the one
// shared model of a folded JS value used by Phase 2 and both transforms.
use crate::compiler::phases::phase3_transform::server::evaluate::{
    EvalScope, EvalValue, Evaluation, evaluate_binding_initial, evaluate_estree, to_js_string,
};

/// Local scope information for tracking shadowed variables and their init expression types.
///
/// This is used during expression transformation to:
/// 1. Prevent transforms on shadowed variables (function parameters, local declarations)
/// 2. Provide local variable init expression types for should_proxy() lookups
///    (since the analysis scope doesn't include function-local variables)
#[derive(Debug, Clone, Default)]
pub struct LocalScope {
    /// Variables that are shadowed (should not be transformed).
    /// Maps variable name -> optional JsExpr type of the init value.
    /// For parameters, the value is None.
    /// For const/let declarations, the value is the JsExpr discriminant string
    /// (e.g., "Binary", "Literal", "Arrow", etc.)
    vars: FxHashMap<String, Option<JsExprKind>>,
}

/// A simplified classification of JsExpr types for should_proxy() decisions.
#[derive(Debug, Clone, PartialEq, Eq)]
enum JsExprKind {
    Literal,
    TemplateLiteral,
    Arrow,
    Function,
    Unary,
    Binary,
    Other,
}

/// Resolve an each binding by lexical ownership, preferring the innermost block.
/// The optional path is the writable source location for a destructured binding.
fn find_each_binding_context<'a>(
    contexts: &'a [EachBindingContext],
    name: &str,
) -> Option<(&'a EachBindingContext, Option<&'a str>)> {
    contexts.iter().rev().find_map(|each_ctx| {
        if each_ctx.item_name == name {
            Some((each_ctx, None))
        } else {
            each_ctx
                .destructured_update_paths
                .get(name)
                .map(|path| (each_ctx, Some(path.as_str())))
        }
    })
}

/// Mark the lexically owning identifier-context each block as assigned or mutated.
/// Destructured contexts do not register a flag because their transforms do not
/// force the callback's index parameter in the official compiler.
fn mark_each_item_assigned_or_mutated(state: &ComponentClientTransformState<'_>, name: &str) {
    if let Some((_, flag)) = state
        .each_item_name_flags
        .iter()
        .rev()
        .find(|(item_name, _)| item_name.as_str() == name)
    {
        flag.set(true);
    }
}

/// Rest bindings are values computed from the item, not locations within it.
/// Writing to the generated call expression is both semantically wrong and, for
/// a direct assignment, invalid JavaScript (upstream issue #3306).
fn is_writable_destructured_path(path: &str) -> bool {
    !path.contains(".slice(") && !path.starts_with("$.exclude_from_object(")
}

fn append_each_invalidation(
    each_ctx: &EachBindingContext,
    mutation: JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let mut expressions = vec![mutation];

    if !each_ctx.invalidation_exprs.is_empty() {
        expressions.push(build_invalidate_inner_signals(
            &each_ctx.invalidation_exprs,
            arena,
        ));
    }

    if let Some(store_name) = &each_ctx.store_to_invalidate {
        expressions.push(b::call(
            arena,
            b::member_path(arena, "$.invalidate_store"),
            vec![b::id("$$stores"), b::string(store_name)],
        ));
    }

    b::sequence(expressions)
}

impl LocalScope {
    pub(crate) fn new() -> Self {
        Self {
            vars: FxHashMap::default(),
        }
    }

    /// Create a LocalScope from a set of shadowed variable names.
    pub fn from_shadowed(names: impl Iterator<Item = String>) -> Self {
        let mut scope = Self::new();
        for name in names {
            scope.add_shadowed(name);
        }
        scope
    }

    fn contains(&self, name: &str) -> bool {
        self.vars.contains_key(name)
    }

    fn add_shadowed(&mut self, name: String) {
        self.vars.insert(name, None);
    }

    fn add_local_var(&mut self, name: String, init_kind: Option<JsExprKind>) {
        self.vars.insert(name, init_kind);
    }

    /// Check if a variable's init expression type indicates it doesn't need proxy.
    /// Returns Some(false) if definitely no proxy needed, None if unknown.
    fn should_proxy_for_var(&self, name: &str) -> Option<bool> {
        if let Some(Some(kind)) = self.vars.get(name) {
            Some(!matches!(
                kind,
                JsExprKind::Literal
                    | JsExprKind::TemplateLiteral
                    | JsExprKind::Arrow
                    | JsExprKind::Function
                    | JsExprKind::Unary
                    | JsExprKind::Binary
            ))
        } else {
            None // Unknown - not in local scope or no init info
        }
    }
}

/// Is `expr` a `$.state(…)` / `$.derived(…)` call — the two shapes a lowered
/// rune declaration produces, and the only ones that make a local a signal?
/// `$.tag(…)` wraps either of them in dev mode.
fn is_signal_source_call(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> bool {
    let JsExpr::Call(call) = expr else {
        return false;
    };
    let JsExpr::Member(member) = arena.get_expr(call.callee) else {
        return false;
    };
    if !matches!(arena.get_expr(member.object), JsExpr::Identifier(o) if o.as_str() == "$") {
        return false;
    }
    let JsMemberProperty::Identifier(property) = &member.property else {
        return false;
    };
    match property.as_str() {
        "state" | "derived" => true,
        "tag" => call
            .arguments
            .first()
            .is_some_and(|arg| is_signal_source_call(arg, arena)),
        _ => false,
    }
}

/// Classify a JsExpr into a JsExprKind for proxy decisions.
fn classify_expr(expr: &JsExpr) -> JsExprKind {
    match expr {
        JsExpr::Literal(_) => JsExprKind::Literal,
        JsExpr::TemplateLiteral(_) => JsExprKind::TemplateLiteral,
        JsExpr::Arrow(_) => JsExprKind::Arrow,
        JsExpr::Function(_) => JsExprKind::Function,
        JsExpr::Unary(_) => JsExprKind::Unary,
        JsExpr::Binary(_) => JsExprKind::Binary,
        _ => JsExprKind::Other,
    }
}

/// Extract all identifier names from a pattern.
///
/// This is used to find function parameter names that should shadow
/// outer variable transforms.
fn extract_pattern_names(pattern: &JsPattern, names: &mut FxHashSet<String>) {
    match pattern {
        JsPattern::Identifier(name) | JsPattern::SpannedIdentifier { name, .. } => {
            names.insert(name.to_string());
        }
        JsPattern::SourceAnchored(anchor) => extract_pattern_names(&anchor.inner, names),
        JsPattern::Array(array) => {
            for p in array.elements.iter().flatten() {
                extract_pattern_names(p, names);
            }
        }
        JsPattern::Object(object) => {
            for prop in &object.properties {
                match prop {
                    JsObjectPatternProperty::Property { value, .. } => {
                        extract_pattern_names(value, names);
                    }
                    JsObjectPatternProperty::Rest(rest) => {
                        extract_pattern_names(rest, names);
                    }
                }
            }
        }
        JsPattern::Rest(inner) => {
            extract_pattern_names(inner, names);
        }
        JsPattern::Assignment(assign) => {
            extract_pattern_names(&assign.left, names);
        }
    }
}

fn collect_pattern_evaluations(
    pattern: &JsPattern,
    context: &ComponentContext,
    getters: &mut Vec<JsExpr>,
    seen: &mut FxHashSet<String>,
) {
    match pattern {
        JsPattern::Assignment(assign) => {
            collect_pattern_evaluations(&assign.left, context, getters, seen);
            collect_reactive_references_inner(
                context.arena.get_expr(assign.right),
                context,
                getters,
                seen,
            );
        }
        JsPattern::Rest(inner) => collect_pattern_evaluations(inner, context, getters, seen),
        JsPattern::Array(array) => {
            for element in array.elements.iter().flatten() {
                collect_pattern_evaluations(element, context, getters, seen);
            }
        }
        JsPattern::Object(object) => {
            for property in &object.properties {
                match property {
                    JsObjectPatternProperty::Property { key, value, .. } => {
                        if let JsPropertyKey::Computed(key) = key {
                            collect_reactive_references_inner(
                                context.arena.get_expr(*key),
                                context,
                                getters,
                                seen,
                            );
                        }
                        collect_pattern_evaluations(value, context, getters, seen);
                    }
                    JsObjectPatternProperty::Rest(rest) => {
                        collect_pattern_evaluations(rest, context, getters, seen);
                    }
                }
            }
        }
        JsPattern::Identifier(_) | JsPattern::SpannedIdentifier { .. } => {}
        JsPattern::SourceAnchored(anchor) => {
            collect_pattern_evaluations(&anchor.inner, context, getters, seen)
        }
    }
}

/// Extract all identifier names from a pattern and add them to a LocalScope as shadowed.
fn extract_pattern_names_to_scope(pattern: &JsPattern, scope: &mut LocalScope) {
    let mut names = FxHashSet::default();
    extract_pattern_names(pattern, &mut names);
    for name in names {
        scope.add_shadowed(name);
    }
}

/// Every `var` declaration reachable from `stmt` without crossing into a nested
/// function or class body, which open a `var` scope of their own. The oxc-AST twin
/// of this walk is `shared::hoisted_vars`; this one reads the phase-3 IR.
fn collect_hoisted_var_declarations<'x>(
    stmt: &'x JsStatement,
    arena: &'x crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    out: &mut Vec<&'x JsVariableDeclaration>,
) {
    let descend = |id, out: &mut Vec<&'x JsVariableDeclaration>| {
        collect_hoisted_var_declarations(arena.get_stmt(id), arena, out)
    };
    match stmt {
        JsStatement::VariableDeclaration(decl) if matches!(decl.kind, JsVariableKind::Var) => {
            out.push(decl)
        }
        JsStatement::Block(block) => {
            for stmt in &block.body {
                collect_hoisted_var_declarations(stmt, arena, out);
            }
        }
        JsStatement::If(stmt) => {
            descend(stmt.consequent, out);
            if let Some(alternate) = stmt.alternate {
                descend(alternate, out);
            }
        }
        JsStatement::For(stmt) => {
            if let Some(JsForInit::Variable(decl)) = &stmt.init
                && matches!(decl.kind, JsVariableKind::Var)
            {
                out.push(decl);
            }
            descend(stmt.body, out);
        }
        JsStatement::ForOf(stmt) => {
            if let JsForOfLeft::Variable(decl) = &stmt.left
                && matches!(decl.kind, JsVariableKind::Var)
            {
                out.push(decl);
            }
            descend(stmt.body, out);
        }
        JsStatement::While(stmt) => descend(stmt.body, out),
        JsStatement::DoWhile(stmt) => descend(stmt.body, out),
        JsStatement::Labeled(stmt) => descend(stmt.body, out),
        JsStatement::Try(stmt) => {
            for stmt in &stmt.block.body {
                collect_hoisted_var_declarations(stmt, arena, out);
            }
            if let Some(handler) = &stmt.handler {
                for stmt in &handler.body.body {
                    collect_hoisted_var_declarations(stmt, arena, out);
                }
            }
            if let Some(finalizer) = &stmt.finalizer {
                for stmt in &finalizer.body {
                    collect_hoisted_var_declarations(stmt, arena, out);
                }
            }
        }
        JsStatement::Switch(stmt) => {
            for case in &stmt.cases {
                for stmt in &case.consequent {
                    collect_hoisted_var_declarations(stmt, arena, out);
                }
            }
        }
        _ => {}
    }
}

/// Scan a block body for the names it declares and register them in the local scope.
/// This tracks local `const`/`let`/`var` declarations so that should_proxy() can
/// check their init expression types when they're referenced in assignments, and a
/// `function` / `class` declaration, which binds a name in the block exactly as
/// `let` does.
fn register_block_local_vars(
    block: &[JsStatement],
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    scope: &mut LocalScope,
) {
    // A `var` is function-scoped, so one declared in a nested block, loop head or
    // `case` arm binds here too; the loop below only sees this list's own statements.
    let mut hoisted = Vec::new();
    for stmt in block {
        collect_hoisted_var_declarations(stmt, arena, &mut hoisted);
    }
    for decl in hoisted {
        for d in &decl.declarations {
            extract_pattern_names_to_scope(&d.id, scope);
        }
    }
    for stmt in block {
        match stmt {
            JsStatement::FunctionDeclaration(JsFunctionDeclaration { id: Some(id), .. })
            | JsStatement::ClassDeclaration {
                class: JsClassExpression { id: Some(id), .. },
                ..
            } => scope.add_shadowed(id.to_string()),
            _ => {}
        }
        if let JsStatement::VariableDeclaration(var_decl) = stmt {
            for decl in &var_decl.declarations {
                if let JsPattern::Identifier(name) = &decl.id {
                    // A local the converter just turned into a signal
                    // (`let x = $.state(…)` / `$.derived(…)`, from a rune written
                    // inside a template expression's function body) is not a plain
                    // shadow: its reads still have to go through `$.get`. Only a
                    // local that shadows an outer transform gets registered here.
                    if decl
                        .init
                        .as_ref()
                        .is_some_and(|init| is_signal_source_call(arena.get_expr(*init), arena))
                    {
                        continue;
                    }
                    let init_kind = decl
                        .init
                        .as_ref()
                        .map(|init_expr| classify_expr(arena.get_expr(*init_expr)));
                    scope.add_local_var(name.to_string(), init_kind);
                } else {
                    // Destructuring declarations (`const [x, y] = …` / `const { a } = …`)
                    // also bind locals that shadow outer transforms. Register every
                    // bound name so neither the pattern targets nor later reads are
                    // wrongly wrapped — otherwise a prop/derived `x` leaks its getter
                    // into the pattern, producing invalid `const [x(), y()] = …`.
                    extract_pattern_names_to_scope(&decl.id, scope);
                }
            }
        }
    }
}

/// Determine if a value should be wrapped in $.proxy() for deep reactivity.
///
/// This mirrors the official Svelte compiler's `should_proxy` function from
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`.
///
/// Returns `false` for expressions that are known to be primitives or functions:
/// - Literals (strings, numbers, booleans, null)
/// - Template literals (strings)
/// - Arrow functions and function expressions
/// - Unary expressions (e.g., !x, -x, typeof x)
/// - Binary expressions (e.g., a + b, a && b)
/// - The `undefined` identifier
///
/// Returns `true` for everything else, conservatively assuming it could be an object.
/// This is because even an identifier could reference an object (e.g., each block loop var).
fn should_proxy_expr(expr: &JsExpr) -> bool {
    match expr {
        // Primitives don't need proxy
        JsExpr::Literal(_) => false,

        // Template literals are strings (primitives)
        JsExpr::TemplateLiteral(_) => false,

        // Functions don't need proxy
        JsExpr::Arrow(_) | JsExpr::Function(_) => false,

        // Unary and binary expressions result in primitives
        JsExpr::Unary(_) | JsExpr::Binary(_) => false,

        // Note: Logical expressions (||, &&, ??) are NOT excluded because they
        // return one of their operands, which could be an object. This matches
        // the official Svelte compiler's should_proxy() behavior.

        // `undefined` identifier doesn't need proxy
        JsExpr::Identifier(name) if name == "undefined" => false,

        // Everything else might need proxy:
        // - Identifiers (could reference objects, arrays, or each block variables)
        // - Object expressions
        // - Array expressions
        // - Call expressions (could return objects)
        // - Member expressions (could be object properties)
        // - Conditional expressions (could return objects)
        // etc.
        _ => true,
    }
}

/// Determine if a value should be wrapped in $.proxy(), with scope-aware identifier lookup.
///
/// This mirrors the official Svelte compiler's `should_proxy` function from
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`.
///
/// For identifiers, it looks up the binding in scope and recursively checks the
/// binding's initial value type. This handles cases like:
/// ```ignore
/// const next = count + 1; // BinaryExpression -> no proxy
/// count = next;           // next resolves to BinaryExpression -> no proxy
/// ```
fn should_proxy_with_context(
    expr: &JsExpr,
    context: &ComponentContext,
    local_scope: &LocalScope,
) -> bool {
    match expr {
        JsExpr::Identifier(name) if name != "undefined" => {
            // First, check local scope (function-local variables)
            // This handles cases like:
            //   (e) => { const next = count + 1; count = next; }
            // where `next` is a local const with BinaryExpression init
            if let Some(proxy_needed) = local_scope.should_proxy_for_var(name) {
                return proxy_needed;
            }

            // Then check the analysis scope (component-level bindings).
            // For template @const bindings, prefer the one with a known initial type
            // since phase3 doesn't track precise lexical scope inside each blocks.
            let mut found_binding = context.state.get_binding(name);
            if found_binding
                .map(|b| b.initial_node_type.is_none())
                .unwrap_or(true)
            {
                // Look for a template binding with this name (from {@const ...})
                for scope in &context.state.scope_root.all_scopes {
                    if let Some(&idx) = scope.declarations.get(name.as_str())
                        && let Some(b) = context.state.scope_root.bindings.get(idx)
                        && matches!(
                            b.kind,
                            crate::compiler::phases::phase2_analyze::scope::BindingKind::Template
                        )
                        && b.initial_node_type.is_some()
                    {
                        found_binding = Some(b);
                        break;
                    }
                }
            }
            if let Some(binding) = found_binding {
                // Only trace through if the binding is not reassigned and has an initial value.
                // This matches the official compiler's check:
                //   binding !== null && !binding.reassigned && binding.initial !== null
                if !binding.reassigned
                    && let Some(ref initial_type) = binding.initial_node_type
                {
                    // Don't look through these declaration types
                    // (they represent bindings, not value expressions)
                    match initial_type.as_str() {
                        "FunctionDeclaration"
                        | "ClassDeclaration"
                        | "ImportDeclaration"
                        | "EachBlock"
                        | "SnippetBlock" => {
                            return true;
                        }
                        "Identifier" => {
                            // When the initial value is an Identifier, check if it's `undefined`
                            // which is the only identifier that should NOT be proxied.
                            // This matches: should_proxy(binding.initial, null) in the official compiler
                            return binding.initial_identifier_name.as_deref() != Some("undefined");
                        }
                        _ => {
                            // Recursively check if initial value type should be proxied.
                            // The `Identifier` arm above already answered that case.
                            return should_proxy_node_type(initial_type, None);
                        }
                    }
                }
            }
            // Fallback: unknown identifier or no initial value, conservatively proxy
            true
        }
        _ => should_proxy_expr(expr),
    }
}

/// Check if a node type (from binding.initial_node_type) should be proxied.
///
/// Returns `false` for types known to produce primitive values or functions.
/// This is the equivalent of calling `should_proxy(binding.initial, null)` in
/// the official compiler, where `null` scope prevents further identifier lookups
/// — which is also why a bare `undefined` still answers `false` here while every
/// other identifier answers `true`.
pub(in crate::compiler::phases::phase3_transform::client) fn should_proxy_node_type(
    node_type: &str,
    identifier_name: Option<&str>,
) -> bool {
    if node_type == "Identifier" && identifier_name == Some("undefined") {
        return false;
    }
    !matches!(
        node_type,
        "Literal"
            | "TemplateLiteral"
            | "ArrowFunctionExpression"
            | "FunctionExpression"
            | "UnaryExpression"
            | "BinaryExpression"
    )
}

/// Apply registered transforms to an expression recursively.
///
/// This function walks through the expression tree and applies any registered
/// transforms from `context.state.transform` to identifiers it encounters.
///
/// # Arguments
///
/// * `expr` - The expression to transform
/// * `context` - The component context containing transform rules
///
/// # Returns
///
/// Returns the transformed expression with all applicable transforms applied.
pub fn apply_transforms_to_expression(expr: &JsExpr, context: &ComponentContext) -> JsExpr {
    // Fast path: if there are no transforms registered AND no each-block tracking is active,
    // the expression cannot be changed by the recursive walk. Return a clone directly.
    if context.state.transform.is_empty()
        && context.state.each_index_name.is_none()
        && context.state.each_item_names.is_empty()
        && context.state.each_binding_context.is_empty()
    {
        return expr.clone();
    }
    let transformed =
        apply_transforms_to_expression_with_shadowed(expr, context, &LocalScope::new());
    if idempotency_check_enabled() {
        assert_transform_is_idempotent(&transformed, context);
    }
    transformed
}

/// The store a `$.store_set` / `$.store_mutate` writes to is read through its own
/// binding's transform — a prop reads as the getter call `store()`, a state source
/// as `$.get(store)` — mirroring upstream's `get_store()` =
/// `context.visit(b.id(store_name))`. The context-free store transforms emit the
/// bare name, so resolve it here where `context` is available.
fn resolve_store_source_arg(
    expr: JsExpr,
    store_sub_name: &str,
    context: &ComponentContext,
) -> JsExpr {
    let Some(store_name) = store_sub_name.strip_prefix('$') else {
        return expr;
    };
    let JsExpr::Call(mut call) = expr else {
        return expr;
    };
    if let Some(first) = call.arguments.first_mut()
        && matches!(first, JsExpr::Identifier(n) if n.as_str() == store_name)
        && let Some(read_fn) = context.state.transform.get(store_name).and_then(|t| t.read)
    {
        *first = read_fn(&context.arena, b::id(store_name));
    }
    JsExpr::Call(call)
}

/// Is `RSVELTE_ASSERT_TRANSFORM_IDEMPOTENT` set?
fn idempotency_check_enabled() -> bool {
    static ON: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
    *ON.get_or_init(|| std::env::var_os("RSVELTE_ASSERT_TRANSFORM_IDEMPOTENT").is_some())
}

thread_local! {
    static IN_IDEMPOTENCY_CHECK: std::cell::Cell<bool> = const { std::cell::Cell::new(false) };
}

/// Marker the harness requires before it may report a clean run.
///
/// A binary with no check compiled in emits nothing, which is indistinguishable from a
/// tree that satisfies the property — a `main` binding measured 0 violations for exactly
/// that reason. Printed once per process from inside the comparison, so it also proves
/// the comparison was reached, not just that the variable was read.
fn announce_idempotency_check_armed() {
    static ANNOUNCED: std::sync::Once = std::sync::Once::new();
    ANNOUNCED.call_once(|| eprintln!("RSVELTE_IDEMPOTENCY_ARMED"));
}

/// Does every bracket in `s` close?
fn is_balanced(s: &str) -> bool {
    let mut depth = 0i32;
    for b in s.bytes() {
        match b {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            _ => {}
        }
        if depth < 0 {
            return false;
        }
    }
    depth == 0
}

/// Report when transforming an already-transformed expression changes it.
///
/// A transform whose output the next pass can transform again is #3026's defect class:
/// `try_transform_assignment` hands a converted subtree back to the outer walk, so any
/// read whose output is re-readable is applied twice. Shape cannot carry provenance, so
/// the property has to be asserted rather than inspected. Off unless the env var is set —
/// it doubles the walk and prints through the fallback text printer, which renders
/// `Raw` nodes opaquely and so can only miss a divergence, never invent one.
fn assert_transform_is_idempotent(transformed: &JsExpr, context: &ComponentContext) {
    if IN_IDEMPOTENCY_CHECK.with(|c| c.get()) {
        return;
    }
    IN_IDEMPOTENCY_CHECK.with(|c| c.set(true));
    let again =
        apply_transforms_to_expression_with_shadowed(transformed, context, &LocalScope::new());
    IN_IDEMPOTENCY_CHECK.with(|c| c.set(false));

    use crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr;
    announce_idempotency_check_armed();
    let once = generate_expr(transformed, &context.arena);
    let twice = generate_expr(&again, &context.arena);
    if let Some(line) = idempotency_report(&once, &twice) {
        // A panic would abort the process (`panic = "abort"` in release), which turns a
        // sweep into a bisect; the harness greps for this marker instead.
        eprintln!("{line}");
    }
}

/// The marker line for a pair of prints, or `None` when they agree.
///
/// Split out so the reporting rule — including the truncated-print skip — is reachable
/// from a test; a comparison that silently stopped reporting would otherwise read as a
/// clean sweep.
fn idempotency_report(once: &str, twice: &str) -> Option<String> {
    // The fallback text printer truncates the nodes it cannot render, and a truncated
    // print differs from its twin for a reason that is not the transform.
    if once == twice || !is_balanced(once) || !is_balanced(twice) {
        return None;
    }
    Some(format!("RSVELTE_NON_IDEMPOTENT_TRANSFORM\t{once}\t{twice}"))
}

#[cfg(test)]
mod idempotency_report_tests {
    use super::idempotency_report;

    #[test]
    fn reports_a_doubled_getter_and_skips_a_truncated_print() {
        assert_eq!(
            idempotency_report("p().a", "p()().a").as_deref(),
            Some("RSVELTE_NON_IDEMPOTENT_TRANSFORM\tp().a\tp()().a")
        );
        assert_eq!(idempotency_report("p().a", "p().a"), None);
        // Either side truncated by the printer: not a transform difference.
        assert_eq!(idempotency_report("() => {", ""), None);
        assert_eq!(idempotency_report("{ a: p() }", "{"), None);
    }
}

/// Apply transforms while treating specified variables as shadowed (preventing transformation).
pub fn apply_transforms_to_expression_with_shadowed(
    expr: &JsExpr,
    context: &ComponentContext,
    local_scope: &LocalScope,
) -> JsExpr {
    // Helper macro for recursive calls with current local scope
    macro_rules! recurse {
        ($e:expr) => {
            apply_transforms_to_expression_with_shadowed($e, context, local_scope)
        };
    }

    // A source span sitting directly on an identifier travels *into* the read
    // transform, because upstream stamps the location on the identifier node and
    // builds the read wrapper (`foo()`, `$.get(foo)`) around it unlocated — so a
    // map segment covers the name, not the whole generated call.
    let spanned_identifier = expr;
    let (expr, identifier_span) = match expr {
        JsExpr::Spanned(inner, start, end)
            if matches!(context.arena.get_expr(*inner), JsExpr::Identifier(_)) =>
        {
            (context.arena.get_expr(*inner), Some((*start, *end)))
        }
        other => (other, None),
    };
    let respan = |e: JsExpr| match identifier_span {
        Some((start, end)) => JsExpr::Spanned(context.arena.alloc_expr(e), start, end),
        None => e,
    };
    // An identifier no transform rewrote keeps the wrapper it arrived in, which
    // costs no arena node: `respan` would allocate a second one holding the same
    // span over a clone of the same identifier.
    let unchanged = || spanned_identifier.clone();

    match expr {
        JsExpr::Identifier(name) => {
            // `Identifier.js` short-circuits on the NAME before any binding is
            // resolved, so a local `$$props` (an each item, a snippet
            // parameter) is renamed too. Upstream only ever visits USER
            // expressions; the `$$props` object rsvelte's own prop reads are
            // built on has no binding, which is what separates the two here.
            if name.as_str() == "$$props" && context.state.get_binding(name).is_some() {
                return JsExpr::Identifier("$$sanitized_props".into());
            }
            // Skip transforms for shadowed variables (function parameters, local vars)
            if local_scope.contains(name) {
                return unchanged();
            }
            // Track each block index usage for proper callback parameter generation.
            // When the index variable is referenced during body traversal, we need
            // to include it in the render callback parameters.
            // A `{@const}` / snippet parameter of the same name shadows the index,
            // so this is not a read of it and the callback parameter stays off.
            let shadowed = context
                .state
                .each_shadowing_names
                .contains_key(name.as_str());
            let current_idx_name = context.state.each_index_name.as_deref();
            if current_idx_name == Some(name.as_str()) && !shadowed {
                context.state.each_index_used.set(true);
            }
            // Also check ancestor each-block index names (for nested each blocks).
            // When an ancestor's index variable is used inside a nested each block body,
            // we need to mark the ancestor's index as used too — UNLESS the current
            // each shadows that ancestor with the same index name (e.g.
            // `{#each a as x, i (i)}{#each b as y, i (i)}…{/each}{/each}`): a read of
            // `i` in the inner body refers to the inner `i` only, so the outer `i`
            // (still on the ancestor stack under the same name) must NOT be marked.
            for (ancestor_idx_name, ancestor_used_flag) in &context.state.ancestor_each_index_names
            {
                if name == ancestor_idx_name
                    && Some(ancestor_idx_name.as_str()) != current_idx_name
                    && !shadowed
                {
                    ancestor_used_flag.set(true);
                }
            }
            // For reassigned each item identifiers in legacy mode, the read transform should
            // return `collection[$$index]` instead of `$.get(n)`. This matches the official
            // Svelte compiler's behavior:
            //   read: (node) => {
            //     if (binding.reassigned) {
            //       return b.member(collection_id ? b.call(collection_id) : collection, index, true);
            //     }
            //     return (flags & EACH_ITEM_REACTIVE) !== 0 ? get_value(node) : node;
            //   }
            //
            // Note: We check all ancestor each_binding_contexts (not just the innermost one),
            // because a reassigned item from an outer each block may be referenced inside an
            // inner each block. For example, in {#each selected_array as selected} containing
            // {#each values as value} with bind:group={selected}, `selected` is from the outer
            // each block, and should use selected_array()[$$index_1] when read inside the inner.
            // Check if this identifier is a reassigned each-block item.
            // Use each_binding_context.item_reassigned (not get_binding().reassigned) because
            // get_binding() may return the wrong binding when an outer variable has the same name
            // (e.g., `{#each a as a}` where outer `a` is State and inner EachItem `a` is reassigned).
            if !context.state.analysis.runes
                && let Some(each_ctx) = context
                    .state
                    .each_binding_context
                    .iter()
                    .rev()
                    .find(|ctx| ctx.item_name == *name && ctx.item_reassigned)
            {
                // Build collection[$$index] access
                // Note: We do NOT set each_item_assign_or_mutate here - that's only for
                // writes (assign/mutate). The read transform just redirects to arr[$$index].
                return respan(build_reassigned_item_read(each_ctx, &context.arena));
            }
            // Check if there's a transform registered for this identifier
            if let Some(transform) = context.state.transform.get(name.as_str()) {
                // Handle @const destructuring: read_source means this identifier
                // is part of a destructured @const declaration, so reads become
                // $.get(computed_const).identifier_name
                if let Some(ref source_var) = transform.read_source {
                    return respan(b::member(
                        &context.arena,
                        b::svelte_call(
                            &context.arena,
                            "get",
                            vec![JsExpr::Identifier(source_var.clone().into())],
                        ),
                        name.clone(),
                    ));
                }
                if let Some(read_fn) = transform.read {
                    // If this transform has a replacement_id, use it instead of the original name.
                    // This is used for legacy reactive imports where `numbers` -> `$$_import_numbers()`.
                    let input_id = if let Some(ref replacement) = transform.replacement_id {
                        JsExpr::Identifier(replacement.clone().into())
                    } else {
                        JsExpr::Identifier(name.clone())
                    };
                    return read_fn(&context.arena, respan(input_id));
                }
            }
            unchanged()
        }

        JsExpr::Member(member) => {
            // Apply transform to the object, but not the property (unless computed)
            let transformed_object = recurse!(context.arena.get_expr(member.object));

            let transformed_property = match &member.property {
                JsMemberProperty::Expression(prop_expr) if member.computed => {
                    // For computed properties, also apply transforms
                    JsMemberProperty::Expression(
                        context
                            .arena
                            .alloc_expr(recurse!(context.arena.get_expr(*prop_expr))),
                    )
                }
                _ => member.property.clone(),
            };

            JsExpr::Member(JsMemberExpression {
                object: context.arena.alloc_expr(transformed_object),
                property: transformed_property,
                computed: member.computed,
                optional: member.optional,
            })
        }

        JsExpr::Call(call) => {
            // Classify the callee once to determine argument transform behavior.
            // This replaces three separate function calls that each matched the same callee.
            let callee_kind =
                classify_svelte_runtime_callee(context.arena.get_expr(call.callee), &context.arena);
            let is_svelte_set_call = matches!(callee_kind, SvelteCalleeKind::SetLike);
            let skip_args_transform = matches!(callee_kind, SvelteCalleeKind::SkipAllArgs);
            let is_store_update = matches!(callee_kind, SvelteCalleeKind::StoreUpdate);

            // For Prop/BindableProp, the callee ALWAYS needs the read transform applied.
            // When a prop identifier is used as a function callee, it's a GETTER read:
            // `callback(arg)` should become `callback()(arg)` where the first () is the
            // prop getter and the second () is the function invocation.
            // The prop SETTER pattern `prop(value)` is only generated explicitly in the
            // JsExpr::Assignment arm using JsExpr::Raw, not through JsExpr::Call.
            //
            // For state variables ($state, $derived, etc.) `read` wraps `x` -> `$.get(x)`.
            // State variable calls like `saySomething('Tama')` become
            // `$.get(saySomething)('Tama')` correctly via the standard recursion below.
            let transformed_callee = recurse!(context.arena.get_expr(call.callee));

            let mut transformed_args: Vec<JsExpr> = Vec::with_capacity(call.arguments.len());
            for (i, arg) in call.arguments.iter().enumerate() {
                // Skip transforming arguments that shouldn't have transforms applied:
                // 1. ALL arguments of $.untrack(), $.store_mutate(), etc.
                // 2. First argument of $.set(), $.update(), $.update_pre() (state reference)
                // 3. For $.update_store/$.update_pre_store: transform first arg (may need $.get()),
                //    skip second+ args ($store() already constructed)
                if skip_args_transform
                    || (is_svelte_set_call && i == 0)
                    || (is_store_update && i >= 1)
                {
                    transformed_args.push(arg.clone());
                } else {
                    transformed_args.push(recurse!(arg));
                }
            }

            JsExpr::Call(JsCallExpression {
                callee: context.arena.alloc_expr(transformed_callee),
                arguments: transformed_args,
                optional: call.optional,
            })
        }

        JsExpr::Binary(binary) => {
            let transformed_left = recurse!(context.arena.get_expr(binary.left));
            let transformed_right = recurse!(context.arena.get_expr(binary.right));

            JsExpr::Binary(JsBinaryExpression {
                operator: binary.operator,
                left: context.arena.alloc_expr(transformed_left),
                right: context.arena.alloc_expr(transformed_right),
            })
        }

        JsExpr::Logical(logical) => {
            let transformed_left = recurse!(context.arena.get_expr(logical.left));
            let transformed_right = recurse!(context.arena.get_expr(logical.right));

            JsExpr::Logical(JsLogicalExpression {
                operator: logical.operator,
                left: context.arena.alloc_expr(transformed_left),
                right: context.arena.alloc_expr(transformed_right),
            })
        }

        JsExpr::Unary(unary) => {
            let transformed_arg = recurse!(context.arena.get_expr(unary.argument));

            JsExpr::Unary(JsUnaryExpression {
                operator: unary.operator,
                argument: context.arena.alloc_expr(transformed_arg),
                prefix: unary.prefix,
            })
        }

        JsExpr::Conditional(cond) => {
            let transformed_test = recurse!(context.arena.get_expr(cond.test));
            let transformed_consequent = recurse!(context.arena.get_expr(cond.consequent));
            let transformed_alternate = recurse!(context.arena.get_expr(cond.alternate));

            JsExpr::Conditional(JsConditionalExpression {
                test: context.arena.alloc_expr(transformed_test),
                consequent: context.arena.alloc_expr(transformed_consequent),
                alternate: context.arena.alloc_expr(transformed_alternate),
            })
        }

        JsExpr::Array(array) => {
            let transformed_elements: Vec<Option<JsExpr>> = array
                .elements
                .iter()
                .map(|elem| elem.as_ref().map(|e| recurse!(e)))
                .collect();

            JsExpr::Array(JsArrayExpression {
                elements: transformed_elements,
            })
        }

        JsExpr::Object(obj) => {
            let transformed_properties: Vec<JsObjectMember> = obj
                .properties
                .iter()
                .map(|prop| match prop {
                    JsObjectMember::Property(p) => {
                        let transformed_value = recurse!(context.arena.get_expr(p.value));

                        let transformed_key = match &p.key {
                            JsPropertyKey::Computed(key_expr) => JsPropertyKey::Computed(
                                context
                                    .arena
                                    .alloc_expr(recurse!(context.arena.get_expr(*key_expr))),
                            ),
                            other => other.clone(),
                        };

                        // If the property was shorthand but the value was transformed,
                        // we can't use shorthand syntax anymore.
                        // For example, `{ count }` where count is state becomes `{ count: $.get(count) }`
                        // A shorthand property originally has an Identifier value matching the key.
                        // If the transformed value is no longer a simple Identifier with the same name,
                        // we must use the full property syntax.
                        let is_shorthand = if p.shorthand {
                            // Check if the transformed value is still a simple identifier matching the key
                            if let JsExpr::Identifier(name) = &transformed_value {
                                if let JsPropertyKey::Identifier(key_name) = &p.key {
                                    name == key_name
                                } else {
                                    false
                                }
                            } else {
                                false
                            }
                        } else {
                            false
                        };

                        JsObjectMember::Property(JsProperty {
                            key: transformed_key,
                            value: context.arena.alloc_expr(transformed_value),
                            kind: p.kind,
                            computed: p.computed,
                            shorthand: is_shorthand,
                            method: p.method,
                        })
                    }
                    JsObjectMember::SpreadElement(spread_expr) => JsObjectMember::SpreadElement(
                        context
                            .arena
                            .alloc_expr(recurse!(context.arena.get_expr(*spread_expr))),
                    ),
                })
                .collect();

            JsExpr::Object(JsObjectExpression {
                properties: transformed_properties,
            })
        }

        JsExpr::Arrow(arrow) => {
            // Extract parameter names - these shadow any outer transforms
            let mut new_scope = local_scope.clone();
            for param in &arrow.params {
                extract_pattern_names_to_scope(param, &mut new_scope);
            }

            // Transform arrow function bodies with updated local scope
            let transformed_body = match &arrow.body {
                JsArrowBody::Expression(expr_id) => {
                    JsArrowBody::Expression(context.arena.alloc_expr(
                        apply_transforms_to_expression_with_shadowed(
                            context.arena.get_expr(*expr_id),
                            context,
                            &new_scope,
                        ),
                    ))
                }
                JsArrowBody::Block(block) => {
                    // Scan the block for local variable declarations before transforming
                    // so that should_proxy() can look up their init expression types
                    register_block_local_vars(&block.body, &context.arena, &mut new_scope);

                    // Transform statements in the block
                    let transformed_body: Vec<JsStatement> = block
                        .body
                        .iter()
                        .map(|stmt| {
                            apply_transforms_to_statement_with_shadowed(stmt, context, &new_scope)
                        })
                        .collect();
                    JsArrowBody::Block(JsBlockStatement::with_body(transformed_body))
                }
            };

            JsExpr::Arrow(JsArrowFunction {
                params: arrow.params.clone(),
                body: transformed_body,
                is_async: arrow.is_async,
            })
        }

        JsExpr::Function(func) => {
            // Extract parameter names - these shadow any outer transforms
            let mut new_scope = local_scope.clone();
            // A named function expression binds its own name inside its body.
            if let Some(id) = &func.id {
                new_scope.add_shadowed(id.to_string());
            }
            for param in &func.params {
                extract_pattern_names_to_scope(param, &mut new_scope);
            }

            // Scan the function body for local variable declarations
            register_block_local_vars(&func.body.body, &context.arena, &mut new_scope);

            // Transform function expression bodies with updated local scope
            let transformed_body: Vec<JsStatement> = func
                .body
                .body
                .iter()
                .map(|stmt| apply_transforms_to_statement_with_shadowed(stmt, context, &new_scope))
                .collect();

            JsExpr::Function(JsFunctionExpression {
                id: func.id.clone(),
                params: func.params.clone(),
                body: JsBlockStatement::with_body(transformed_body),
                is_async: func.is_async,
                is_generator: func.is_generator,
            })
        }

        JsExpr::Assignment(assign) => {
            // For assignments, check if the left side is a state variable that needs transform
            // Skip if the identifier is in local scope (function parameter or local declaration)
            let mut assignment_target = context.arena.get_expr(assign.left);
            while let JsExpr::Spanned(inner, _, _) = assignment_target {
                assignment_target = context.arena.get_expr(*inner);
            }
            if let JsExpr::Identifier(name) = assignment_target
                && !local_scope.contains(name)
                && let Some(transform) = context.state.transform.get(name.as_str())
                && let Some(assign_fn) = transform.assign
            {
                // Transform the right side first
                let transformed_right = recurse!(context.arena.get_expr(assign.right));

                // Handle compound assignment operators (+=, -=, etc.)
                let final_value = match assign.operator {
                    JsAssignmentOp::Assign => transformed_right,
                    JsAssignmentOp::AddAssign => {
                        // count += 1 -> $.set(count, $.get(count) + 1)
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(&context.arena, JsBinaryOp::Add, current, transformed_right)
                    }
                    JsAssignmentOp::SubAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(&context.arena, JsBinaryOp::Sub, current, transformed_right)
                    }
                    JsAssignmentOp::MulAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(&context.arena, JsBinaryOp::Mul, current, transformed_right)
                    }
                    JsAssignmentOp::DivAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(&context.arena, JsBinaryOp::Div, current, transformed_right)
                    }
                    JsAssignmentOp::ModAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(&context.arena, JsBinaryOp::Mod, current, transformed_right)
                    }
                    JsAssignmentOp::PowAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(&context.arena, JsBinaryOp::Pow, current, transformed_right)
                    }
                    JsAssignmentOp::BitAndAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(
                            &context.arena,
                            JsBinaryOp::BitAnd,
                            current,
                            transformed_right,
                        )
                    }
                    JsAssignmentOp::BitOrAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(
                            &context.arena,
                            JsBinaryOp::BitOr,
                            current,
                            transformed_right,
                        )
                    }
                    JsAssignmentOp::BitXorAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(
                            &context.arena,
                            JsBinaryOp::BitXor,
                            current,
                            transformed_right,
                        )
                    }
                    JsAssignmentOp::ShlAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(&context.arena, JsBinaryOp::Shl, current, transformed_right)
                    }
                    JsAssignmentOp::ShrAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(&context.arena, JsBinaryOp::Shr, current, transformed_right)
                    }
                    JsAssignmentOp::UShrAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::binary(&context.arena, JsBinaryOp::UShr, current, transformed_right)
                    }
                    JsAssignmentOp::OrAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::or(&context.arena, current, transformed_right)
                    }
                    JsAssignmentOp::AndAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::and(&context.arena, current, transformed_right)
                    }
                    JsAssignmentOp::NullishAssign => {
                        let read_fn = transform.read.unwrap_or(|_arena, e| e);
                        let current = read_fn(&context.arena, JsExpr::Identifier(name.clone()));
                        b::nullish(&context.arena, current, transformed_right)
                    }
                };

                // Use the assign transform to wrap in $.set()
                // The third parameter (needs_proxy) determines if the value should be proxified.
                //
                // This follows the official Svelte compiler's should_proxy() logic:
                // - Returns false for: Literal, TemplateLiteral, ArrowFunction, FunctionExpression,
                //   UnaryExpression, BinaryExpression, and `undefined` identifier
                // - Returns true for everything else (conservatively assumes it could be an object)
                //
                // However, we also check additional conditions from AssignmentExpression.js:
                // - Skip proxy if transform.skip_proxy is true (e.g., for $state.raw)
                // - Skip proxy for prop, bindable_prop, derived, store_sub bindings
                let binding = context.state.get_binding(name);
                let binding_kind_excludes_proxy = binding
                    .map(|b| {
                        matches!(
                            b.kind,
                            BindingKind::Prop
                                | BindingKind::BindableProp
                                | BindingKind::Derived
                                | BindingKind::StoreSub
                                | BindingKind::RawState
                        )
                    })
                    .unwrap_or(false);

                // Determine if proxy is needed based on:
                // 1. Not skipped (not $state.raw)
                // 2. Binding kind doesn't exclude proxy (not Derived, Prop, etc.)
                // 3. In runes mode
                // 4. Non-coercive operator (=, ||=, &&=, ??=)
                // 5. Right side should be proxied (not a primitive)
                let is_non_coercive = matches!(
                    assign.operator,
                    JsAssignmentOp::Assign
                        | JsAssignmentOp::OrAssign
                        | JsAssignmentOp::AndAssign
                        | JsAssignmentOp::NullishAssign
                );

                let needs_proxy = !transform.skip_proxy
                    && !binding_kind_excludes_proxy
                    && context.state.analysis.runes
                    && is_non_coercive
                    && should_proxy_with_context(
                        context.arena.get_expr(assign.right),
                        context,
                        local_scope,
                    );

                let assigned = assign_fn(
                    transform,
                    &context.arena,
                    JsExpr::Identifier(name.clone()),
                    final_value,
                    needs_proxy,
                );
                let is_store_sub = context
                    .state
                    .get_binding(name)
                    .is_some_and(|b| b.kind == BindingKind::StoreSub);
                return if is_store_sub {
                    resolve_store_source_arg(assigned, name.as_str(), context)
                } else {
                    assigned
                };
            }

            // Transform writes through the lexically owning each item. Identifier contexts
            // write through collection[$$index] in legacy mode and force the callback index;
            // destructured contexts write through their path into $$item in both modes.
            // This mirrors the official compiler's `assign` transform registered in EachBlock.js:
            //   assign: (_, value) => {
            //     uses_index = true;
            //     const left = b.member(collection, index, true);
            //     return b.sequence([b.assignment('=', left, value), ...sequence]);
            //   }
            if let JsExpr::Identifier(name) =
                unspanned_expr(context.arena.get_expr(assign.left), &context.arena)
                && !local_scope.contains(name)
                && let Some((each_ctx, destructured_path)) =
                    find_each_binding_context(&context.state.each_binding_context, name)
                        .map(|(each_ctx, path)| (each_ctx.clone(), path.map(str::to_owned)))
                && destructured_path
                    .as_deref()
                    .is_none_or(is_writable_destructured_path)
            {
                let transformed_right = recurse!(context.arena.get_expr(assign.right));

                let (assignment_target, current_value) = if let Some(path) = &destructured_path {
                    let current_value = context
                        .state
                        .transform
                        .get(name.as_str())
                        .and_then(|transform| transform.read)
                        .map_or_else(
                            || JsExpr::Identifier(name.clone()),
                            |read| read(&context.arena, b::id(name.as_str())),
                        );
                    (b::raw(path.as_str()), current_value)
                } else {
                    // Only identifier-context transforms set uses_index. A destructured
                    // path writes directly through $$item and needs no index argument.
                    mark_each_item_assigned_or_mutated(&context.state, name);
                    if context.state.analysis.runes {
                        (b::id(name.as_str()), b::id(name.as_str()))
                    } else {
                        (
                            build_reassigned_item_read(&each_ctx, &context.arena),
                            build_reassigned_item_read(&each_ctx, &context.arena),
                        )
                    }
                };

                if destructured_path.is_some() || !context.state.analysis.runes {
                    let value = build_assignment_value(
                        &context.arena,
                        assign.operator.as_str(),
                        &current_value,
                        &transformed_right,
                    );
                    let assignment = JsExpr::Assignment(JsAssignmentExpression {
                        operator: JsAssignmentOp::Assign,
                        left: context.arena.alloc_expr(assignment_target),
                        right: context.arena.alloc_expr(value),
                    });

                    return append_each_invalidation(&each_ctx, assignment, &context.arena);
                }
            }

            // Check for mutation case: when assigning to a member expression where
            // the base object has a mutate transform (e.g., $store.prop = value)
            // This corresponds to the mutation case in AssignmentExpression.js
            if let JsExpr::Member(_) =
                unspanned_expr(context.arena.get_expr(assign.left), &context.arena)
            {
                // Find the base object of the member expression
                let base_object =
                    get_base_object(context.arena.get_expr(assign.left), &context.arena);

                // Track each item mutation for uses_index detection.
                // Also handle legacy mode each item mutation: append $.invalidate_inner_signals()
                if let JsExpr::Identifier(name) = &base_object
                    && !local_scope.contains(name)
                    && let Some((each_ctx, destructured_path)) =
                        find_each_binding_context(&context.state.each_binding_context, name)
                            .map(|(each_ctx, path)| (each_ctx.clone(), path.map(str::to_owned)))
                {
                    if destructured_path.is_none() {
                        mark_each_item_assigned_or_mutated(&context.state, name);
                    }

                    // In legacy mode, wrap the mutation with $.invalidate_inner_signals()
                    // This mirrors the official compiler's `mutate` transform on each items:
                    //   mutate: (_, mutation) => {
                    //     uses_index = true;
                    //     return b.sequence([mutation, ...sequence]);
                    //   }
                    if destructured_path.is_some() || !context.state.analysis.runes {
                        // Transform the full assignment (apply read transforms to both sides)
                        let transformed_left = recurse!(context.arena.get_expr(assign.left));
                        let transformed_right = recurse!(context.arena.get_expr(assign.right));
                        let mutation = JsExpr::Assignment(JsAssignmentExpression {
                            operator: assign.operator,
                            left: context.arena.alloc_expr(transformed_left),
                            right: context.arena.alloc_expr(transformed_right),
                        });

                        return append_each_invalidation(&each_ctx, mutation, &context.arena);
                    }
                }

                // If the left side's base chain already goes through a Call node,
                // the read transform was already applied by expression_converter.rs
                // (e.g., items()[0].clicked). The mutation wrapping was also already done
                // by try_transform_assignment. We must NOT recurse into the left side again
                // (which would double-apply read transforms), and must NOT mutation-wrap again.
                // Just transform the right side and return.
                if has_call_in_base_chain(context.arena.get_expr(assign.left), &context.arena) {
                    let transformed_right = recurse!(context.arena.get_expr(assign.right));
                    return JsExpr::Assignment(JsAssignmentExpression {
                        operator: assign.operator,
                        left: assign.left,
                        right: context.arena.alloc_expr(transformed_right),
                    });
                }

                if let JsExpr::Identifier(name) = base_object
                    && !local_scope.contains(&name)
                    && let Some(transform) = context.state.transform.get(name.as_str())
                    && let Some(mutate_fn) = transform.mutate
                {
                    let transformed_right = recurse!(context.arena.get_expr(assign.right));

                    // For prop bindings (Prop/BindableProp), we need to apply read transforms
                    // to the left side so that prop calls appear in the mutation expression.
                    // e.g., `selected[0] = $$value` -> `selected(selected()[0] = $$value, true)`
                    // The left side `selected[0]` must become `selected()[0]` inside the mutation.
                    //
                    // For store subscriptions, we do NOT recurse the left side because
                    // store_sub_mutate handles the replacement with $.untrack($store) internally.
                    // Recursing would turn `$store` into `$store()` which is wrong there.
                    let is_prop_binding = {
                        use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                        context
                            .state
                            .get_binding(&name)
                            .map(|b| {
                                matches!(b.kind, BindingKind::Prop | BindingKind::BindableProp)
                            })
                            .unwrap_or(false)
                    };

                    let is_store_sub = {
                        use crate::compiler::phases::phase2_analyze::scope::BindingKind;
                        context
                            .state
                            .get_binding(&name)
                            .map(|b| matches!(b.kind, BindingKind::StoreSub))
                            .unwrap_or(false)
                    };

                    let is_reactive_import = transform.replacement_id.is_some();

                    let mutation_left = if is_prop_binding || is_reactive_import {
                        // Prop bindings and reactive imports: recurse full left side so
                        // the base read transform is applied.
                        // e.g., `selected[0] = $$value` -> `selected(selected()[0] = $$value, true)`
                        // e.g., `handler.value = log_b` -> `$$_import_handler($$_import_handler().value = log_b)`
                        context
                            .arena
                            .alloc_expr(recurse!(context.arena.get_expr(assign.left)))
                    } else if is_store_sub {
                        // Store subscriptions: preserve the root for store_sub_mutate, but
                        // still transform reactive reads inside computed property indices.
                        // e.g. `$values[$key]` must become
                        // `$.untrack($values)[$key()] = value`, not
                        // `$.untrack($values)[$key] = value`.
                        context.arena.alloc_expr(transform_computed_indices_only(
                            context.arena.get_expr(assign.left),
                            context,
                            local_scope,
                        ))
                    } else {
                        // State/mutable source bindings: transform computed property indices
                        // so that reactive each-item variables inside brackets get $.get() wrappers.
                        // e.g., `list[key] = $$value` → mutation_left = `list[$.get(key)] = $$value`
                        // then mutate_value_legacy replaces `list` → `$.get(list)` to get:
                        //   `$.get(list)[$.get(key)] = $$value`
                        context.arena.alloc_expr(transform_computed_indices_only(
                            context.arena.get_expr(assign.left),
                            context,
                            local_scope,
                        ))
                    };

                    let full_assignment = JsExpr::Assignment(JsAssignmentExpression {
                        operator: assign.operator,
                        left: mutation_left,
                        right: context.arena.alloc_expr(transformed_right),
                    });

                    // Apply the mutate transform
                    // e.g., $store.prop = value -> $.store_mutate(store, $.untrack($store).prop = value, $.untrack($store))
                    // e.g., selected[0] = value -> selected(selected()[0] = value, true)
                    // Use replacement_id if set (e.g., reactive imports: handler -> $$_import_handler)
                    let mutate_target = if let Some(ref replacement) = transform.replacement_id {
                        JsExpr::Identifier(replacement.clone().into())
                    } else {
                        JsExpr::Identifier(name.clone())
                    };

                    let mutated =
                        mutate_fn(transform, &context.arena, mutate_target, full_assignment);

                    if is_store_sub {
                        return resolve_store_source_arg(mutated, name.as_str(), context);
                    }

                    return mutated;
                }
            }

            // For non-state variables, transform the right side
            let transformed_right = recurse!(context.arena.get_expr(assign.right));

            // For the left side, only transform if it's a member expression object
            let transformed_left = match context.arena.get_expr(assign.left) {
                JsExpr::Member(member) => {
                    let transformed_object = recurse!(context.arena.get_expr(member.object));

                    let transformed_property = match &member.property {
                        JsMemberProperty::Expression(prop_expr) if member.computed => {
                            JsMemberProperty::Expression(
                                context
                                    .arena
                                    .alloc_expr(recurse!(context.arena.get_expr(*prop_expr))),
                            )
                        }
                        _ => member.property.clone(),
                    };

                    JsExpr::Member(JsMemberExpression {
                        object: context.arena.alloc_expr(transformed_object),
                        property: transformed_property,
                        computed: member.computed,
                        optional: member.optional,
                    })
                }
                // Don't transform identifier on the left side of assignment
                _ => context.arena.get_expr(assign.left).clone(),
            };

            JsExpr::Assignment(JsAssignmentExpression {
                operator: assign.operator,
                left: context.arena.alloc_expr(transformed_left),
                right: context.arena.alloc_expr(transformed_right),
            })
        }

        JsExpr::Sequence(seq) => {
            // JavaScript source cannot contain a one-element SequenceExpression;
            // this shape is synthesized by transforms such as the each-item
            // mutation path. Its child has already been transformed, so walking
            // it again would wrap the same mutation in another sequence.
            if seq.expressions.len() == 1 {
                return JsExpr::Sequence(seq.clone());
            }

            let transformed_exprs: Vec<JsExpr> =
                seq.expressions.iter().map(|e| recurse!(e)).collect();

            JsExpr::Sequence(JsSequenceExpression {
                expressions: transformed_exprs,
            })
        }

        JsExpr::New(new_expr) => {
            let transformed_callee = recurse!(context.arena.get_expr(new_expr.callee));
            let transformed_args: Vec<JsExpr> =
                new_expr.arguments.iter().map(|arg| recurse!(arg)).collect();

            JsExpr::New(JsNewExpression {
                callee: context.arena.alloc_expr(transformed_callee),
                arguments: transformed_args,
            })
        }

        JsExpr::Await(inner) => {
            let transformed = recurse!(context.arena.get_expr(*inner));
            JsExpr::Await(context.arena.alloc_expr(transformed))
        }

        JsExpr::Yield(yield_expr) => {
            let transformed_arg = yield_expr.argument.as_ref().map(|arg| {
                context
                    .arena
                    .alloc_expr(recurse!(context.arena.get_expr(*arg)))
            });

            JsExpr::Yield(JsYieldExpression {
                argument: transformed_arg,
                delegate: yield_expr.delegate,
            })
        }

        JsExpr::Spread(inner) => {
            let transformed = recurse!(context.arena.get_expr(*inner));
            JsExpr::Spread(context.arena.alloc_expr(transformed))
        }

        JsExpr::Update(update) => {
            // For update expressions, check if the argument has an update transform
            // Skip if the identifier is in local scope
            if let JsExpr::Identifier(name) =
                unspanned_expr(context.arena.get_expr(update.argument), &context.arena)
                && !local_scope.contains(name)
                && let Some(transform) = context.state.transform.get(name.as_str())
                && let Some(update_fn) = transform.update
            {
                return update_fn(
                    transform,
                    &context.arena,
                    update.operator,
                    JsExpr::Identifier(name.clone()),
                    update.prefix,
                );
            }

            // Track each item update (++ or --) for uses_index detection.
            // Identifier contexts update collection[$$index] in legacy mode and force the
            // callback index; destructured contexts update their path into $$item.
            // This mirrors the official Svelte compiler's `mutate` transform on each items:
            //   mutate: (_, mutation) => {
            //     uses_index = true;
            //     return b.sequence([mutation, ...sequence]);
            //   }
            if let JsExpr::Identifier(name) =
                unspanned_expr(context.arena.get_expr(update.argument), &context.arena)
                && !local_scope.contains(name)
                && let Some((each_ctx, destructured_path)) =
                    find_each_binding_context(&context.state.each_binding_context, name)
                        .map(|(each_ctx, path)| (each_ctx.clone(), path.map(str::to_owned)))
                && destructured_path
                    .as_deref()
                    .is_none_or(is_writable_destructured_path)
            {
                if destructured_path.is_none() {
                    mark_each_item_assigned_or_mutated(&context.state, name);
                }

                // For reassigned each items in legacy mode, we need to transform `n++` to
                // `collection[$$index]++, $.invalidate_inner_signals(() => collection)`
                if destructured_path.is_some()
                    || (!context.state.analysis.runes && each_ctx.item_reassigned)
                {
                    let update_target = destructured_path.as_deref().map_or_else(
                        || build_reassigned_item_read(&each_ctx, &context.arena),
                        b::raw,
                    );
                    let update_expr = b::update(
                        &context.arena,
                        update.operator,
                        update_target,
                        update.prefix,
                    );

                    return append_each_invalidation(&each_ctx, update_expr, &context.arena);
                }
            }

            // Check for mutation case: when updating a member expression where
            // the base object has a mutate transform registered.
            // This handles:
            // - Store subscriptions: $store[0].value++ -> $.store_mutate(...)
            // - Legacy state: name.value++ -> $.mutate(name, $.get(name).value++)
            // - Runes state: name.value++ -> $.get(name).value++
            if let JsExpr::Member(_) =
                unspanned_expr(context.arena.get_expr(update.argument), &context.arena)
            {
                let base_object =
                    get_base_object(context.arena.get_expr(update.argument), &context.arena);

                // Track each item member update for uses_index detection.
                // Also handle legacy mode each item mutation: append $.invalidate_inner_signals()
                if let JsExpr::Identifier(name) = &base_object
                    && !local_scope.contains(name)
                    && let Some((each_ctx, destructured_path)) =
                        find_each_binding_context(&context.state.each_binding_context, name)
                            .map(|(each_ctx, path)| (each_ctx.clone(), path.map(str::to_owned)))
                {
                    if destructured_path.is_none() {
                        mark_each_item_assigned_or_mutated(&context.state, name);
                    }

                    // In legacy mode, wrap the update with $.invalidate_inner_signals()
                    if destructured_path.is_some() || !context.state.analysis.runes {
                        // Transform the update expression (apply read transforms)
                        let transformed_arg = recurse!(context.arena.get_expr(update.argument));
                        let mutation = JsExpr::Update(JsUpdateExpression {
                            operator: update.operator,
                            argument: context.arena.alloc_expr(transformed_arg),
                            prefix: update.prefix,
                        });

                        return append_each_invalidation(&each_ctx, mutation, &context.arena);
                    }
                }

                if let JsExpr::Identifier(name) = base_object
                    && !local_scope.contains(&name)
                    && let Some(transform) = context.state.transform.get(name.as_str())
                    && let Some(mutate_fn) = transform.mutate
                    // If the argument chain already contains a read-transform Call node
                    // (e.g., count().a from a prop read transform), the mutation wrapping
                    // was already applied by expression_converter.rs. Skip to avoid
                    // double-wrapping (which would generate count(count(count().a++, true), true)).
                    && !has_call_in_base_chain(context.arena.get_expr(update.argument), &context.arena)
                {
                    // Transform the argument so that reactive reads inside the
                    // update expression get wrapped properly, e.g. `global.value.count++`
                    // becomes `$$_import_global().value.count++` for reactive imports.
                    let transformed_arg = recurse!(context.arena.get_expr(update.argument));
                    let full_update = JsExpr::Update(JsUpdateExpression {
                        operator: update.operator,
                        argument: context.arena.alloc_expr(transformed_arg),
                        prefix: update.prefix,
                    });

                    // Use replacement_id if set (e.g., reactive imports: global -> $$_import_global)
                    let mutate_target = if let Some(ref replacement) = transform.replacement_id {
                        JsExpr::Identifier(replacement.clone().into())
                    } else {
                        JsExpr::Identifier(name.clone())
                    };

                    return mutate_fn(transform, &context.arena, mutate_target, full_update);
                }
            }

            // Otherwise just transform the argument
            let transformed_arg = recurse!(context.arena.get_expr(update.argument));

            JsExpr::Update(JsUpdateExpression {
                operator: update.operator,
                argument: context.arena.alloc_expr(transformed_arg),
                prefix: update.prefix,
            })
        }

        JsExpr::TemplateLiteral(template) => {
            let transformed_exprs: Vec<JsExpr> =
                template.expressions.iter().map(|e| recurse!(e)).collect();

            JsExpr::TemplateLiteral(JsTemplateLiteral {
                quasis: template.quasis.clone(),
                expressions: transformed_exprs,
            })
        }

        JsExpr::TaggedTemplate(tagged) => {
            // Transform both the tag and the expressions in the quasi
            let transformed_tag = recurse!(context.arena.get_expr(tagged.tag));
            let transformed_exprs: Vec<JsExpr> = tagged
                .quasi
                .expressions
                .iter()
                .map(|e| recurse!(e))
                .collect();

            JsExpr::TaggedTemplate(JsTaggedTemplate {
                tag: context.arena.alloc_expr(transformed_tag),
                quasi: JsTemplateLiteral {
                    quasis: tagged.quasi.quasis.clone(),
                    expressions: transformed_exprs,
                },
            })
        }

        JsExpr::Class(class) => {
            // The class binding name is in scope inside its own body.
            let mut class_scope = local_scope.clone();
            if let Some(id) = &class.id {
                class_scope.add_shadowed(id.to_string());
            }
            JsExpr::Class(JsClassExpression {
                id: class.id.clone(),
                super_class: class.super_class.map(|sc| {
                    context
                        .arena
                        .alloc_expr(apply_transforms_to_expression_with_shadowed(
                            context.arena.get_expr(sc),
                            context,
                            &class_scope,
                        ))
                }),
                body: JsClassBody {
                    body: class
                        .body
                        .body
                        .iter()
                        .map(|member| {
                            apply_transforms_to_class_member(member, context, &class_scope)
                        })
                        .collect(),
                },
            })
        }

        // Expressions that don't need transformation. `Chain` and `Void` are only
        // ever synthesized by the builders around already-transformed subtrees,
        // never produced from user source, so recursing would transform twice.
        JsExpr::Literal(_)
        | JsExpr::This
        | JsExpr::Super
        | JsExpr::MetaProperty(_, _)
        | JsExpr::ImportExpression { .. }
        | JsExpr::Raw(_)
        | JsExpr::OpaqueIdentifier(_)
        | JsExpr::Chain(_)
        | JsExpr::Void(_) => expr.clone(),

        // Spanned expressions: transform the inner expression, preserving the span
        JsExpr::Spanned(inner, start, end) => {
            let transformed = apply_transforms_to_expression_with_shadowed(
                context.arena.get_expr(*inner),
                context,
                local_scope,
            );
            JsExpr::Spanned(context.arena.alloc_expr(transformed), *start, *end)
        }

        JsExpr::SourceAnchored(anchor) => {
            let transformed = apply_transforms_to_expression_with_shadowed(
                context.arena.get_expr(anchor.inner),
                context,
                local_scope,
            );
            let mut anchor = anchor.clone();
            anchor.inner = context.arena.alloc_expr(transformed);
            JsExpr::SourceAnchored(anchor)
        }
    }
}

/// Classification of Svelte runtime callee for argument transform decisions.
/// Computed once to avoid triple-matching the callee expression.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum SvelteCalleeKind {
    /// Not a recognized Svelte runtime call; transform normally.
    Normal,
    /// $.set, $.update, $.update_pre, $.get, $.safe_get, $.mutate, $.update_prop, $.update_pre_prop
    /// First argument is a state reference that should NOT be transformed.
    SetLike,
    /// $.untrack, $.store_mutate - skip ALL argument transformations.
    SkipAllArgs,
    /// $.update_store, $.update_pre_store - transform first arg, skip rest.
    StoreUpdate,
}

/// Classify a callee expression into a SvelteCalleeKind with a single match.
#[inline]
fn classify_svelte_runtime_callee(
    callee: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> SvelteCalleeKind {
    if let JsExpr::Member(member) = callee
        && let JsExpr::Identifier(obj_name) = arena.get_expr(member.object)
        && obj_name == "$"
        && let JsMemberProperty::Identifier(prop_name)
        | JsMemberProperty::SpannedIdentifier {
            name: prop_name, ..
        } = &member.property
    {
        return match prop_name.as_str() {
            "set" | "update" | "update_pre" | "get" | "safe_get" | "mutate" | "update_prop"
            | "update_pre_prop" => SvelteCalleeKind::SetLike,
            "untrack" | "store_mutate" => SvelteCalleeKind::SkipAllArgs,
            "update_store" | "update_pre_store" => SvelteCalleeKind::StoreUpdate,
            _ => SvelteCalleeKind::Normal,
        };
    }
    SvelteCalleeKind::Normal
}

/// Build the `collection[$$index]` member expression for a reassigned each item.
///
/// This mirrors the official Svelte compiler's read transform for reassigned each items:
/// ```js
/// if (binding.reassigned) {
///   return b.member(
///     collection_id ? b.call(collection_id) : collection,
///     (flags & EACH_INDEX_REACTIVE) !== 0 ? get_value(index) : index,
///     true  // computed
///   );
/// }
/// ```
pub(crate) fn build_reassigned_item_read(
    each_ctx: &crate::compiler::phases::phase3_transform::client::types::EachBindingContext,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    // Build the index expression (either $.get($$index) for reactive or just $$index)
    let index_expr = if each_ctx.index_reactive {
        b::call(
            arena,
            b::member_path(arena, "$.get"),
            vec![b::id(&each_ctx.index_name)],
        )
    } else {
        b::id(&each_ctx.index_name)
    };

    // Build the computed member expression: collection[index]
    let collection = b::close_optional_chain(arena, each_ctx.collection_expr.clone());
    b::member_computed(arena, collection, index_expr)
}

/// Build a `$.invalidate_inner_signals(() => (expr1, expr2, ...))` call.
///
/// This mirrors the invalidation sequence used by the official Svelte compiler
/// when mutating each block items in legacy mode.
fn build_invalidate_inner_signals(
    invalidation_exprs: &[String],
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let exprs: Vec<JsExpr> = invalidation_exprs
        .iter()
        .map(|s| JsExpr::Raw(s.clone().into()))
        .collect();

    // Always wrap in sequence parens, even for a single expression.
    // The official compiler always produces `() => (expr)` not `() => expr`.
    let inner = b::sequence(exprs);

    b::call(
        arena,
        b::member_path(arena, "$.invalidate_inner_signals"),
        vec![b::thunk(arena, inner)],
    )
}

/// Get the base object of a member expression.
///
/// For example, for `a.b.c.d`, returns `a`.
/// For nested member expressions like `$store().users['gary'].value`,
/// returns `$store`.
fn get_base_object(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    match expr {
        JsExpr::Spanned(inner, _, _) => get_base_object(arena.get_expr(*inner), arena),
        JsExpr::Member(member) => get_base_object(arena.get_expr(member.object), arena),
        JsExpr::Call(call) => get_base_object(arena.get_expr(call.callee), arena),
        _ => expr.clone(),
    }
}

fn unspanned_expr<'a>(
    mut expr: &'a JsExpr,
    arena: &'a crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> &'a JsExpr {
    while let JsExpr::Spanned(inner, _, _) = expr {
        expr = arena.get_expr(*inner);
    }
    expr
}

/// Check if the chain from the expression to its base Identifier goes through
/// a read-transform Call node. This indicates the base object has already been
/// read-transformed (e.g., `items()` for a prop), meaning the mutation wrapping
/// was already applied by expression_converter.rs and should NOT be applied again.
///
/// Only detects calls where the callee is a simple Identifier (e.g., `items()`),
/// which indicates a prop read transform. Method calls like `list.at(-1)` where
/// the callee is a Member expression are NOT considered read transforms.
fn has_call_in_base_chain(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> bool {
    match expr {
        JsExpr::Member(member) => has_call_in_base_chain(arena.get_expr(member.object), arena),
        JsExpr::Call(call) => {
            // Only consider it a read-transform if the callee is a simple Identifier.
            // Method calls like `list.at()` have a Member callee and should not count.
            matches!(arena.get_expr(call.callee), JsExpr::Identifier(_))
        }
        _ => false,
    }
}

/// Transform only the computed property indices in a member expression, leaving the root identifier alone.
///
/// This is used for state/mutable-source mutation left sides. For example:
/// `list[key]` → `list[$.get(key)]` (transforms `key` to `$.get(key)` but leaves `list` as-is)
///
/// This allows `mutate_value_legacy` to then replace `list` with `$.get(list)`,
/// resulting in the correct: `$.get(list)[$.get(key)] = $$value`
pub(crate) fn transform_computed_indices_only(
    expr: &JsExpr,
    context: &ComponentContext,
    local_scope: &LocalScope,
) -> JsExpr {
    match expr {
        JsExpr::Member(member) => {
            // Recurse into object (but still only transform computed indices there too)
            let transformed_object = transform_computed_indices_only(
                context.arena.get_expr(member.object),
                context,
                local_scope,
            );

            // For computed properties, apply full transforms to the index expression
            let transformed_property = match &member.property {
                JsMemberProperty::Expression(prop_expr) if member.computed => {
                    JsMemberProperty::Expression(context.arena.alloc_expr(
                        apply_transforms_to_expression_with_shadowed(
                            context.arena.get_expr(*prop_expr),
                            context,
                            local_scope,
                        ),
                    ))
                }
                other => other.clone(),
            };

            JsExpr::Member(JsMemberExpression {
                object: context.arena.alloc_expr(transformed_object),
                property: transformed_property,
                computed: member.computed,
                optional: member.optional,
            })
        }
        // For non-member expressions (like an identifier at the root), keep as-is
        other => other.clone(),
    }
}

/// Apply transforms to a class member (field initializer, method, static block).
fn apply_transforms_to_class_member(
    member: &JsClassMember,
    context: &ComponentContext,
    local_scope: &LocalScope,
) -> JsClassMember {
    let transform_key = |key: &JsPropertyKey, computed: bool| match key {
        JsPropertyKey::Computed(key_expr) if computed => {
            JsPropertyKey::Computed(context.arena.alloc_expr(
                apply_transforms_to_expression_with_shadowed(
                    context.arena.get_expr(*key_expr),
                    context,
                    local_scope,
                ),
            ))
        }
        other => other.clone(),
    };

    match member {
        JsClassMember::Method(method) => {
            let mut method_scope = local_scope.clone();
            for param in &method.value.params {
                extract_pattern_names_to_scope(param, &mut method_scope);
            }
            register_block_local_vars(&method.value.body.body, &context.arena, &mut method_scope);
            JsClassMember::Method(JsMethodDefinition {
                key: transform_key(&method.key, method.computed),
                value: JsFunctionExpression {
                    id: method.value.id.clone(),
                    params: method.value.params.clone(),
                    body: JsBlockStatement::with_body(
                        method
                            .value
                            .body
                            .body
                            .iter()
                            .map(|s| {
                                apply_transforms_to_statement_with_shadowed(
                                    s,
                                    context,
                                    &method_scope,
                                )
                            })
                            .collect(),
                    ),
                    is_async: method.value.is_async,
                    is_generator: method.value.is_generator,
                },
                kind: method.kind,
                computed: method.computed,
                is_static: method.is_static,
            })
        }
        JsClassMember::Property(prop) => JsClassMember::Property(JsPropertyDefinition {
            key: transform_key(&prop.key, prop.computed),
            value: prop.value.map(|v| {
                context
                    .arena
                    .alloc_expr(apply_transforms_to_expression_with_shadowed(
                        context.arena.get_expr(v),
                        context,
                        local_scope,
                    ))
            }),
            computed: prop.computed,
            is_static: prop.is_static,
        }),
        JsClassMember::StaticBlock(block) => {
            let mut block_scope = local_scope.clone();
            register_block_local_vars(&block.body, &context.arena, &mut block_scope);
            JsClassMember::StaticBlock(JsBlockStatement::with_body(
                block
                    .body
                    .iter()
                    .map(|s| apply_transforms_to_statement_with_shadowed(s, context, &block_scope))
                    .collect(),
            ))
        }
    }
}

/// Apply transforms to a statement recursively with local scope tracking.
fn apply_transforms_to_statement_with_shadowed(
    stmt: &JsStatement,
    context: &ComponentContext,
    local_scope: &LocalScope,
) -> JsStatement {
    // Helper for expression transforms
    let transform_expr =
        |e: &JsExpr| apply_transforms_to_expression_with_shadowed(e, context, local_scope);

    // Helper for recursive statement transforms
    let transform_stmt =
        |s: &JsStatement| apply_transforms_to_statement_with_shadowed(s, context, local_scope);

    match stmt {
        JsStatement::Expression(expr_stmt) => JsStatement::Expression(JsExpressionStatement {
            expression: context
                .arena
                .alloc_expr(transform_expr(context.arena.get_expr(expr_stmt.expression))),
            comment_anchor: expr_stmt.comment_anchor,
        }),

        JsStatement::Return(ret_stmt) => JsStatement::Return(JsReturnStatement {
            argument: ret_stmt.argument.map(|arg| {
                context
                    .arena
                    .alloc_expr(transform_expr(context.arena.get_expr(arg)))
            }),
        }),

        JsStatement::VariableDeclaration(var_decl) => {
            let transformed_declarations: Vec<JsVariableDeclarator> = var_decl
                .declarations
                .iter()
                .map(|decl| JsVariableDeclarator {
                    id: decl.id.clone(),
                    init: decl.init.map(|init| {
                        context
                            .arena
                            .alloc_expr(transform_expr(context.arena.get_expr(init)))
                    }),
                    comment_anchor: None,
                })
                .collect();

            JsStatement::VariableDeclaration(JsVariableDeclaration {
                kind: var_decl.kind,
                declarations: transformed_declarations,
            })
        }

        JsStatement::If(if_stmt) => JsStatement::If(JsIfStatement {
            test: context
                .arena
                .alloc_expr(transform_expr(context.arena.get_expr(if_stmt.test))),
            consequent: {
                let s = context.arena.get_stmt(if_stmt.consequent).clone();
                context.arena.alloc_stmt(transform_stmt(&s))
            },
            alternate: if_stmt.alternate.map(|alt| {
                let s = context.arena.get_stmt(alt).clone();
                context.arena.alloc_stmt(transform_stmt(&s))
            }),
        }),

        JsStatement::Block(block) => {
            // Create a new scope with block-local variable declarations so that
            // locally-declared names (e.g. `const children = ...`) shadow outer
            // transforms and are not rewritten to `$$props.children`.
            let mut block_scope = local_scope.clone();
            register_block_local_vars(&block.body, &context.arena, &mut block_scope);
            let transformed_body: Vec<JsStatement> = block
                .body
                .iter()
                .map(|s| apply_transforms_to_statement_with_shadowed(s, context, &block_scope))
                .collect();
            JsStatement::Block(JsBlockStatement::with_body(transformed_body))
        }

        JsStatement::For(for_stmt) => {
            // For `for (let/const x = ...; ...; ...) { ... }`, the init variables
            // should shadow outer transforms within the test, update, and body.
            // `var` declarations are hoisted and don't create block scope.
            let mut for_scope = local_scope.clone();
            let needs_scope = matches!(
                &for_stmt.init,
                Some(JsForInit::Variable(decl))
                if !matches!(decl.kind, JsVariableKind::Var)
            );
            if needs_scope && let Some(JsForInit::Variable(decl)) = &for_stmt.init {
                for d in &decl.declarations {
                    extract_pattern_names_to_scope(&d.id, &mut for_scope);
                }
            }

            let transformed_init = for_stmt.init.as_ref().map(|init| match init {
                JsForInit::Variable(decl) => {
                    // Transform the init expressions but keep declarations as-is
                    // (the variable names are local, only initializer exprs need transform)
                    let transformed_decls: Vec<JsVariableDeclarator> = decl
                        .declarations
                        .iter()
                        .map(|d| JsVariableDeclarator {
                            id: d.id.clone(),
                            init: d.init.map(|e| {
                                // Init expressions in the for-loop header are evaluated in
                                // the OUTER scope (before the loop var is in scope), but for
                                // simplicity we use for_scope here since the init variable
                                // shadowing itself in its own initializer is a no-op anyway.
                                context.arena.alloc_expr(
                                    apply_transforms_to_expression_with_shadowed(
                                        context.arena.get_expr(e),
                                        context,
                                        &for_scope,
                                    ),
                                )
                            }),
                            comment_anchor: None,
                        })
                        .collect();
                    JsForInit::Variable(JsVariableDeclaration {
                        kind: decl.kind,
                        declarations: transformed_decls,
                    })
                }
                JsForInit::Expression(expr_id) => JsForInit::Expression(context.arena.alloc_expr(
                    apply_transforms_to_expression_with_shadowed(
                        context.arena.get_expr(*expr_id),
                        context,
                        &for_scope,
                    ),
                )),
            });
            let transformed_test = for_stmt.test.map(|t| {
                context
                    .arena
                    .alloc_expr(apply_transforms_to_expression_with_shadowed(
                        context.arena.get_expr(t),
                        context,
                        &for_scope,
                    ))
            });
            let transformed_update = for_stmt.update.map(|u| {
                context
                    .arena
                    .alloc_expr(apply_transforms_to_expression_with_shadowed(
                        context.arena.get_expr(u),
                        context,
                        &for_scope,
                    ))
            });
            let transformed_body = {
                let s = context.arena.get_stmt(for_stmt.body).clone();
                context
                    .arena
                    .alloc_stmt(apply_transforms_to_statement_with_shadowed(
                        &s, context, &for_scope,
                    ))
            };
            JsStatement::For(JsForStatement {
                init: transformed_init,
                test: transformed_test,
                update: transformed_update,
                body: transformed_body,
            })
        }

        JsStatement::Switch(switch_stmt) => {
            // All cases share one lexical scope, so `let`/`const` declared in any
            // consequent shadows outer transforms for the whole switch body.
            let mut switch_scope = local_scope.clone();
            for case in &switch_stmt.cases {
                register_block_local_vars(&case.consequent, &context.arena, &mut switch_scope);
            }
            let transform_in_switch = |e: &JsExpr| {
                apply_transforms_to_expression_with_shadowed(e, context, &switch_scope)
            };
            JsStatement::Switch(JsSwitchStatement {
                // The discriminant is evaluated in the enclosing scope.
                discriminant: context.arena.alloc_expr(transform_expr(
                    context.arena.get_expr(switch_stmt.discriminant),
                )),
                cases: switch_stmt
                    .cases
                    .iter()
                    .map(|case| JsSwitchCase {
                        test: case.test.map(|t| {
                            context
                                .arena
                                .alloc_expr(transform_in_switch(context.arena.get_expr(t)))
                        }),
                        consequent: case
                            .consequent
                            .iter()
                            .map(|s| {
                                apply_transforms_to_statement_with_shadowed(
                                    s,
                                    context,
                                    &switch_scope,
                                )
                            })
                            .collect(),
                    })
                    .collect(),
            })
        }

        JsStatement::While(while_stmt) => JsStatement::While(JsWhileStatement {
            test: context
                .arena
                .alloc_expr(transform_expr(context.arena.get_expr(while_stmt.test))),
            body: {
                let s = context.arena.get_stmt(while_stmt.body).clone();
                context.arena.alloc_stmt(transform_stmt(&s))
            },
        }),

        JsStatement::DoWhile(do_while) => JsStatement::DoWhile(JsDoWhileStatement {
            body: {
                let s = context.arena.get_stmt(do_while.body).clone();
                context.arena.alloc_stmt(transform_stmt(&s))
            },
            test: context
                .arena
                .alloc_expr(transform_expr(context.arena.get_expr(do_while.test))),
        }),

        JsStatement::Throw(expr_id) => JsStatement::Throw(
            context
                .arena
                .alloc_expr(transform_expr(context.arena.get_expr(*expr_id))),
        ),

        JsStatement::Try(try_stmt) => {
            let transformed_block = JsBlockStatement::with_body(
                try_stmt.block.body.iter().map(transform_stmt).collect(),
            );
            let transformed_handler = try_stmt.handler.as_ref().map(|handler| {
                // The catch parameter shadows outer transforms
                let mut catch_scope = local_scope.clone();
                if let Some(param) = &handler.param {
                    extract_pattern_names_to_scope(param, &mut catch_scope);
                }
                JsCatchClause {
                    param: handler.param.clone(),
                    body: JsBlockStatement::with_body(
                        handler
                            .body
                            .body
                            .iter()
                            .map(|s| {
                                apply_transforms_to_statement_with_shadowed(
                                    s,
                                    context,
                                    &catch_scope,
                                )
                            })
                            .collect(),
                    ),
                }
            });
            let transformed_finalizer = try_stmt.finalizer.as_ref().map(|finalizer| {
                JsBlockStatement::with_body(finalizer.body.iter().map(transform_stmt).collect())
            });
            JsStatement::Try(JsTryStatement {
                block: transformed_block,
                handler: transformed_handler,
                finalizer: transformed_finalizer,
            })
        }

        JsStatement::ForOf(for_of) => {
            // The loop variable shadows outer transforms
            let mut for_of_scope = local_scope.clone();
            match &for_of.left {
                JsForOfLeft::Variable(decl) => {
                    for d in &decl.declarations {
                        extract_pattern_names_to_scope(&d.id, &mut for_of_scope);
                    }
                }
                JsForOfLeft::Pattern(pat) => {
                    extract_pattern_names_to_scope(pat, &mut for_of_scope);
                }
            }
            let transformed_right = context
                .arena
                .alloc_expr(transform_expr(context.arena.get_expr(for_of.right)));
            let transformed_body = {
                let s = context.arena.get_stmt(for_of.body).clone();
                context
                    .arena
                    .alloc_stmt(apply_transforms_to_statement_with_shadowed(
                        &s,
                        context,
                        &for_of_scope,
                    ))
            };
            JsStatement::ForOf(JsForOfStatement {
                left: for_of.left.clone(),
                right: transformed_right,
                body: transformed_body,
                is_await: for_of.is_await,
                is_for_in: for_of.is_for_in,
            })
        }

        JsStatement::Labeled(labeled) => {
            let s = context.arena.get_stmt(labeled.body).clone();
            JsStatement::Labeled(JsLabeledStatement {
                label: labeled.label.clone(),
                body: context.arena.alloc_stmt(transform_stmt(&s)),
            })
        }

        JsStatement::FunctionDeclaration(func_decl) => {
            // Function parameters shadow outer transforms
            let mut func_scope = local_scope.clone();
            for param in &func_decl.params {
                extract_pattern_names_to_scope(param, &mut func_scope);
            }
            // Also add the function name itself to scope (function declarations are hoisted)
            if let Some(ref id) = func_decl.id {
                func_scope.vars.insert(id.to_string(), None);
            }
            register_block_local_vars(&func_decl.body.body, &context.arena, &mut func_scope);
            let transformed_body = JsBlockStatement::with_body(
                func_decl
                    .body
                    .body
                    .iter()
                    .map(|s| apply_transforms_to_statement_with_shadowed(s, context, &func_scope))
                    .collect(),
            );
            JsStatement::FunctionDeclaration(JsFunctionDeclaration {
                id: func_decl.id.clone(),
                params: func_decl.params.clone(),
                body: transformed_body,
                is_async: func_decl.is_async,
                is_generator: func_decl.is_generator,
            })
        }

        // Statements that don't need transformation
        JsStatement::Empty
        | JsStatement::Break(_)
        | JsStatement::Continue(_)
        | JsStatement::Debugger
        | JsStatement::Raw(_) => stmt.clone(),

        // For other statement types, just clone for now
        _ => stmt.clone(),
    }
}

/// Build an expression with transform application and legacy reactivity handling.
///
/// Corresponds to `build_expression` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.
///
/// # Arguments
///
/// * `context` - The component context
/// * `expression` - The JS expression to build
/// * `metadata` - Expression metadata (dependencies, state references, etc.)
///
/// # Returns
///
/// Returns a transformed expression with all transforms applied and
/// reactivity tracking if needed.
pub fn build_expression(
    context: &mut ComponentContext,
    expression: &JsExpr,
    metadata: &ExpressionMetadata,
) -> JsExpr {
    // Apply identifier transforms to the expression
    let value = apply_transforms_to_expression(expression, context);

    // In runes mode, expressions are already reactive (after transform application)
    // Components not explicitly in legacy mode might be expected to be in runes mode
    // (especially since we didn't adjust this behavior until recently, which broke
    // people's existing components), so we also bail in this case.
    // Kind of an in-between-mode.
    if context.state.analysis.runes || context.state.analysis.maybe_runes {
        return value;
    }

    // Legacy mode: check if we need reactivity wrapping
    // This is needed when the expression contains:
    // - Function calls (has_call)
    // - Member expressions (has_member_expression)
    // - Assignments (has_assignment)
    //
    // Legacy reactivity is coarse-grained, looking at the statically visible dependencies.
    // We replicate that by reading the state dependencies first, then wrapping the
    // actual value access in $.untrack() to avoid double-tracking.
    if !metadata.has_call() && !metadata.has_member_expression() && !metadata.has_assignment() {
        return value;
    }

    // Build a sequence expression: (deps..., $.untrack(() => value))
    // The dependencies are read first to establish reactivity tracking,
    // then the actual value is computed inside $.untrack() to avoid
    // establishing additional dependencies.
    let mut sequence_exprs = Vec::new();

    // Collect state dependencies using metadata.references from phase 2 analysis.
    // This mirrors the official Svelte compiler's build_expression which iterates
    // over metadata.references (a Set<Binding>) rather than walking the expression tree.
    //
    // If references are available from phase 2 analysis, use them (preferred/correct).
    // Otherwise, fall back to the expression tree walking approach.
    if !metadata.references.is_empty() {
        collect_reactive_references_from_metadata(metadata, context, &mut sequence_exprs);
    } else {
        collect_reactive_references(expression, context, &mut sequence_exprs);
    }

    // Wrap the value in $.untrack(() => value)
    // b::thunk applies the unthunk optimization: () => func() -> func
    // NOTE: We always wrap with $.untrack even if there are no reactive dependencies,
    // matching the official Svelte compiler behavior in build_expression:
    // sequence.expressions.push(b.call('$.untrack', b.thunk(value)));
    // return sequence;
    let thunk = b::thunk(&context.arena, value.clone());
    let untracked = b::call(
        &context.arena,
        b::member_path(&context.arena, "$.untrack"),
        vec![thunk],
    );

    // Add the untracked value as the last expression in the sequence
    sequence_exprs.push(untracked);

    // Return a sequence expression: (dep1, dep2, ..., $.untrack(() => value))
    // If sequence has just one element (only $.untrack), it simplifies to ($.untrack(...))
    b::sequence(sequence_exprs)
}

/// Collect reactive references from metadata.references for legacy mode reactivity.
///
/// This uses the binding indices from phase 2 analysis (metadata.references) to determine
/// which bindings need dependency tracking, exactly matching the official Svelte compiler's
/// `build_expression` which iterates over `metadata.references` (a Set<Binding>).
///
/// For each referenced binding:
/// - Skip normal bindings that are not imports
/// - Build a getter by looking up the transform for the binding's name
/// - Wrap in `$.deep_read_state()` if the binding is a prop, template, import, or $$props/$$restProps
///
/// This is more accurate than the expression tree walking approach because
/// metadata.references correctly identifies which scope-level bindings are
/// referenced in the expression (handling shadowed variables, function parameters, etc.).
fn collect_reactive_references_from_metadata(
    metadata: &ExpressionMetadata,
    context: &ComponentContext,
    getters: &mut Vec<JsExpr>,
) {
    use crate::compiler::phases::phase2_analyze::scope::{BindingKind, DeclarationKind};

    for &binding_index in &metadata.references {
        let binding = match context.state.scope_root.bindings.get(binding_index) {
            Some(b) => b,
            None => continue,
        };

        // Skip normal bindings unless they are imports
        // (matches: binding.kind === 'normal' && binding.declaration_kind !== 'import' -> continue)
        if binding.kind == BindingKind::Normal
            && binding.declaration_kind != DeclarationKind::Import
        {
            continue;
        }

        let name = &binding.name;

        // For reassigned each-block items in legacy mode, the dependency getter
        // should use collection[$$index] instead of $.get(item).
        if !context.state.analysis.runes
            && let Some(each_ctx) = context
                .state
                .each_binding_context
                .iter()
                .rev()
                .find(|ctx| ctx.item_name == *name && ctx.item_reassigned)
        {
            let reassigned_read = build_reassigned_item_read(each_ctx, &context.arena);
            getters.push(reassigned_read);
            continue;
        }

        let declaration_start = binding.declaration_start.or_else(|| {
            binding
                .references
                .iter()
                .find(|reference| reference.is_self_declaration)
                .map(|reference| reference.start)
        });
        let span_declaration_identifier = |identifier: JsExpr| match declaration_start {
            Some(start) => JsExpr::Spanned(
                context.arena.alloc_expr(identifier),
                start,
                start.saturating_add(name.len() as u32),
            ),
            None => identifier,
        };

        // Build the getter by applying the read transform if one exists
        // (mirrors build_getter in the official compiler). The source location
        // belongs to the identifier passed to the transform, not the call or
        // member expression the transform builds around it.
        let getter = if let Some(transform) = context.state.transform.get(name.as_str()) {
            if let Some(ref read_source) = transform.read_source {
                // read_source is set for destructured @const and let directive bindings.
                // The getter should be $.get(read_source).name instead of $.get(name).
                span_declaration_identifier(b::member(
                    &context.arena,
                    b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.get"),
                        vec![b::id(read_source)],
                    ),
                    name,
                ))
            } else if let Some(read_fn) = transform.read {
                let input_id = if let Some(ref replacement) = transform.replacement_id {
                    JsExpr::Identifier(replacement.clone().into())
                } else {
                    JsExpr::Identifier(name.clone().into())
                };
                read_fn(&context.arena, span_declaration_identifier(input_id))
            } else {
                span_declaration_identifier(JsExpr::Identifier(name.clone().into()))
            }
        } else {
            // No transform registered (e.g., imports) - use the identifier directly
            span_declaration_identifier(JsExpr::Identifier(name.clone().into()))
        };

        // Check if we need to wrap in $.deep_read_state()
        // Matches the official compiler's check at utils.js lines 466-474:
        //   binding.kind === 'bindable_prop' || binding.kind === 'template' ||
        //   binding.declaration_kind === 'import' ||
        //   binding.node.name === '$$props' || binding.node.name === '$$restProps'
        //
        // NOTE: In the official compiler, keyed each block indices have kind 'template'
        // while non-keyed have kind 'static'. Our Rust code uses EachIndex for both.
        // We distinguish by checking if a read transform was registered: keyed (reactive)
        // indices have a $.get() read transform, non-keyed (static) indices don't.
        let has_read_transform = context
            .state
            .transform
            .get(name.as_str())
            .is_some_and(|t| t.read.is_some());
        let deep_read_marked = context
            .state
            .transform_deep_read
            .contains_key(name.as_str());
        let needs_deep_read = if name == "$$props" || name == "$$restProps" || deep_read_marked {
            true
        } else {
            matches!(
                binding.kind,
                BindingKind::Template
                    | BindingKind::AwaitThen
                    | BindingKind::AwaitCatch
                    | BindingKind::Let
            )
                // A bindable_prop deep-reads UNLESS shadowed by a local read
                // transform (an each-item/snippet of the same name resolved via
                // get_binding to the outer prop). A genuine prop is recorded in
                // `transform_deep_read` (the branch above), so gating on
                // `!has_read_transform` only suppresses the shadowed case —
                // mirroring the `Import` arm.
                || (binding.kind == BindingKind::BindableProp && !has_read_transform)
                || (binding.kind == BindingKind::EachIndex && has_read_transform)
                || binding.declaration_kind == DeclarationKind::Import
        };

        let final_getter = if needs_deep_read {
            b::svelte_call(&context.arena, "deep_read_state", vec![getter])
        } else {
            getter
        };

        getters.push(final_getter);
    }
}

/// Collect reactive references from an expression for legacy mode reactivity.
///
/// This walks the original (pre-transform) expression and collects identifiers
/// that have registered transforms. For each, it builds the appropriate getter:
/// - For props/templates/imports: `$.deep_read_state(getter)`
/// - For other reactive bindings: just the getter (e.g., `$.get(x)`)
///
/// NOTE: This is the fallback approach used when metadata.references is not available.
/// The preferred approach is `collect_reactive_references_from_metadata` which uses
/// the binding indices from phase 2 analysis.
fn collect_reactive_references(
    expr: &JsExpr,
    context: &ComponentContext,
    getters: &mut Vec<JsExpr>,
) {
    // Track already-seen identifiers to avoid duplicates
    let mut seen: rustc_hash::FxHashSet<String> = rustc_hash::FxHashSet::default();
    collect_reactive_references_inner(expr, context, getters, &mut seen);
}

/// Inner recursive function for collecting reactive references.
/// Collect the names bound by top-level `const`/`let`/`var` declarations in a
/// block body. Used to treat a nested function's local declarations as locals
/// (not dependencies) during reactive-reference collection.
fn collect_block_local_decl_names(body: &[JsStatement], out: &mut rustc_hash::FxHashSet<String>) {
    for stmt in body {
        if let JsStatement::VariableDeclaration(var_decl) = stmt {
            for decl in &var_decl.declarations {
                extract_pattern_names(&decl.id, out);
            }
        }
    }
}

fn collect_reactive_references_inner(
    expr: &JsExpr,
    context: &ComponentContext,
    getters: &mut Vec<JsExpr>,
    seen: &mut rustc_hash::FxHashSet<String>,
) {
    match expr {
        JsExpr::Identifier(name) => {
            // Skip if we've already processed this identifier
            if seen.contains(name.as_str()) {
                return;
            }

            // Mirror the official Svelte compiler's build_expression logic:
            //
            // for (const binding of metadata.references) {
            //     if (binding.kind === 'normal' && binding.declaration_kind !== 'import') {
            //         continue;
            //     }
            //     var getter = build_getter({ ...binding.node }, state);
            //     if (binding.kind === 'bindable_prop' || binding.kind === 'template' ||
            //         binding.declaration_kind === 'import' || binding.node.name === '$$props' ||
            //         binding.node.name === '$$restProps') {
            //         getter = b.call('$.deep_read_state', getter);
            //     }
            //     sequence.expressions.push(getter);
            // }

            // First, look up the binding for this identifier
            // Use the transform map as primary source of truth for reactive bindings.
            // Note: get_binding() may return a binding from a different scope (e.g., a function
            // parameter named `item` when inside an {#each items as item} block).
            // The transform map, however, is set up correctly per-scope by each block and
            // other block visitors, so it correctly identifies which bindings are reactive.
            let has_transform = context.state.transform.get(name.as_str()).is_some();
            let binding_info = context.state.get_binding(name);

            // Determine if this identifier should be included based on binding kind.
            // If a transform is registered, ALWAYS include - the transform represents the
            // correct scope-aware reactive binding (e.g., EachItem, not a same-named function param).
            // This mirrors the official Svelte compiler which uses metadata.references (scope-aware).
            let should_include = if name == "$$props" || name == "$$restProps" {
                true
            } else if has_transform {
                // Transform registered means this identifier is reactive in the current scope
                true
            } else if let Some(binding) = binding_info {
                use crate::compiler::phases::phase2_analyze::scope::{
                    BindingKind, DeclarationKind,
                };
                // Skip normal bindings unless they are imports
                // (matches: binding.kind === 'normal' && binding.declaration_kind !== 'import' -> continue)
                !(binding.kind == BindingKind::Normal
                    && binding.declaration_kind != DeclarationKind::Import)
            } else {
                false
            };

            if !should_include {
                return;
            }

            seen.insert(name.to_string());

            // For reassigned each-block items in legacy mode, the dependency getter
            // should use collection[$$index] instead of $.get(item).
            // Use each_binding_context.item_reassigned (not binding_info.reassigned) because
            // get_binding() may return the wrong binding when an outer variable has the same name.
            // We check ALL ancestor each_binding_contexts (not just the innermost), so that
            // items from outer each blocks (e.g., `selected` in nested {#each}) are handled.
            if !context.state.analysis.runes
                && let Some(each_ctx) = context
                    .state
                    .each_binding_context
                    .iter()
                    .rev()
                    .find(|ctx| ctx.item_name == *name && ctx.item_reassigned)
            {
                let reassigned_read = build_reassigned_item_read(each_ctx, &context.arena);
                getters.push(reassigned_read);
                return;
            }

            let declaration_start = binding_info.and_then(|binding| {
                binding.declaration_start.or_else(|| {
                    binding
                        .references
                        .iter()
                        .find(|reference| reference.is_self_declaration)
                        .map(|reference| reference.start)
                })
            });
            let span_declaration_identifier = |identifier: JsExpr| match declaration_start {
                Some(start) => JsExpr::Spanned(
                    context.arena.alloc_expr(identifier),
                    start,
                    start.saturating_add(name.len() as u32),
                ),
                None => identifier,
            };

            // Build the getter by applying the read transform if one exists
            // (mirrors build_getter in the official compiler). Keep the source
            // span on the identifier consumed by the transform.
            let has_read_transform = context
                .state
                .transform
                .get(name.as_str())
                .is_some_and(|t| t.read.is_some());
            let getter = if let Some(transform) = context.state.transform.get(name.as_str()) {
                if let Some(ref read_source) = transform.read_source {
                    // read_source is set for destructured @const and let directive bindings.
                    // The getter should be $.get(read_source).name instead of $.get(name).
                    span_declaration_identifier(b::member(
                        &context.arena,
                        b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.get"),
                            vec![b::id(read_source)],
                        ),
                        name.clone(),
                    ))
                } else if let Some(read_fn) = transform.read {
                    // If this transform has a replacement_id, use it instead of the original name.
                    // This is used for legacy reactive imports where `numbers` -> `$$_import_numbers()`.
                    let input_id = if let Some(ref replacement) = transform.replacement_id {
                        JsExpr::Identifier(replacement.clone().into())
                    } else {
                        JsExpr::Identifier(name.clone())
                    };
                    read_fn(&context.arena, span_declaration_identifier(input_id))
                } else {
                    span_declaration_identifier(JsExpr::Identifier(name.clone()))
                }
            } else {
                // No transform registered (e.g., imports) - use the identifier directly
                span_declaration_identifier(JsExpr::Identifier(name.clone()))
            };

            // Check if we need to wrap in $.deep_read_state().
            //
            // `transform_deep_read` is the authoritative scope-aware source:
            // visitors record names here when they install a template-kind /
            // let-directive / `{@const}` transform, and clear them when an
            // inner shadowing binding (each item/index, snippet param) is
            // installed. This fixes cases where a sibling each-block and an
            // inner `{@const}` share the same name — `get_binding()` alone
            // cannot distinguish them because it walks the static scope tree
            // while the transform map is actually scoped via save/restore.
            //
            // For bindings that aren't managed by the transform map (plain
            // imports, bindable props that didn't go through the const/let
            // path, etc.) we fall back to the binding-kind check mirroring
            // the official compiler.
            let deep_read_marked = context
                .state
                .transform_deep_read
                .contains_key(name.as_str());
            let needs_deep_read = if name == "$$props" || name == "$$restProps" || deep_read_marked
            {
                true
            } else if let Some(binding) = binding_info {
                use crate::compiler::phases::phase2_analyze::scope::{
                    BindingKind, DeclarationKind,
                };
                matches!(
                    binding.kind,
                    BindingKind::Template
                        | BindingKind::AwaitThen
                        | BindingKind::AwaitCatch
                        | BindingKind::Let
                )
                    // A bindable_prop deep-reads UNLESS shadowed by a local read
                    // transform (an each-item/snippet of the same name); a genuine
                    // prop is recorded in `transform_deep_read` (handled above), so
                    // this only suppresses the shadowed case — like the Import arm.
                    || (binding.kind == BindingKind::BindableProp && !has_read_transform)
                    || (binding.kind == BindingKind::EachIndex && has_read_transform)
                    // A direct import read is deep-read-wrapped — UNLESS the name
                    // has a local read transform, which means it is shadowed by a
                    // local binding (each-item / each-index / snippet param) that
                    // happens to share an import's name. The reference then
                    // resolves to that local (not the import), so it gets a plain
                    // `$.get(...)` like any each-item, matching upstream's
                    // scope-resolved `metadata.references`.
                    || (binding.declaration_kind == DeclarationKind::Import
                        && !has_read_transform)
            } else {
                false
            };

            let final_getter = if needs_deep_read {
                b::svelte_call(&context.arena, "deep_read_state", vec![getter])
            } else {
                getter
            };

            getters.push(final_getter);
        }

        JsExpr::Call(call) => {
            // A read transform's getter call carries an opaque callee so a second
            // transform pass cannot read it again; the dependency it stands for is
            // still that identifier.
            let callee = unspanned_expr(context.arena.get_expr(call.callee), &context.arena);
            if call.arguments.is_empty()
                && let JsExpr::OpaqueIdentifier(name) = callee
            {
                collect_reactive_references_inner(
                    &JsExpr::Identifier(name.clone()),
                    context,
                    getters,
                    seen,
                );
            } else {
                collect_reactive_references_inner(
                    context.arena.get_expr(call.callee),
                    context,
                    getters,
                    seen,
                );
            }
            for arg in &call.arguments {
                collect_reactive_references_inner(arg, context, getters, seen);
            }
        }

        JsExpr::Member(member) => {
            collect_reactive_references_inner(
                context.arena.get_expr(member.object),
                context,
                getters,
                seen,
            );
            if let JsMemberProperty::Expression(prop) = &member.property {
                collect_reactive_references_inner(
                    context.arena.get_expr(*prop),
                    context,
                    getters,
                    seen,
                );
            }
        }

        JsExpr::Binary(binary) => {
            collect_reactive_references_inner(
                context.arena.get_expr(binary.left),
                context,
                getters,
                seen,
            );
            collect_reactive_references_inner(
                context.arena.get_expr(binary.right),
                context,
                getters,
                seen,
            );
        }

        JsExpr::Logical(logical) => {
            collect_reactive_references_inner(
                context.arena.get_expr(logical.left),
                context,
                getters,
                seen,
            );
            collect_reactive_references_inner(
                context.arena.get_expr(logical.right),
                context,
                getters,
                seen,
            );
        }

        JsExpr::Conditional(cond) => {
            collect_reactive_references_inner(
                context.arena.get_expr(cond.test),
                context,
                getters,
                seen,
            );
            collect_reactive_references_inner(
                context.arena.get_expr(cond.consequent),
                context,
                getters,
                seen,
            );
            collect_reactive_references_inner(
                context.arena.get_expr(cond.alternate),
                context,
                getters,
                seen,
            );
        }

        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_reactive_references_inner(e, context, getters, seen);
            }
        }

        JsExpr::Object(obj) => {
            for prop in &obj.properties {
                match prop {
                    JsObjectMember::Property(p) => {
                        collect_reactive_references_inner(
                            context.arena.get_expr(p.value),
                            context,
                            getters,
                            seen,
                        );
                    }
                    JsObjectMember::SpreadElement(s) => {
                        collect_reactive_references_inner(
                            context.arena.get_expr(*s),
                            context,
                            getters,
                            seen,
                        );
                    }
                }
            }
        }

        JsExpr::Assignment(assign) => {
            collect_reactive_references_inner(
                context.arena.get_expr(assign.left),
                context,
                getters,
                seen,
            );
            collect_reactive_references_inner(
                context.arena.get_expr(assign.right),
                context,
                getters,
                seen,
            );
        }

        JsExpr::Unary(unary) => {
            collect_reactive_references_inner(
                context.arena.get_expr(unary.argument),
                context,
                getters,
                seen,
            );
        }

        JsExpr::Update(update) => {
            collect_reactive_references_inner(
                context.arena.get_expr(update.argument),
                context,
                getters,
                seen,
            );
        }

        JsExpr::Sequence(seq) => {
            for expr in &seq.expressions {
                collect_reactive_references_inner(expr, context, getters, seen);
            }
        }

        JsExpr::TemplateLiteral(template) => {
            for expr in &template.expressions {
                collect_reactive_references_inner(expr, context, getters, seen);
            }
        }

        JsExpr::Arrow(arrow) => {
            // For arrow functions, we need to process the body to find reactive references
            // This is important for expressions like: tags.find(t => t.name === tag.name)
            // However, arrow parameter names shadow outer reactive references and must be
            // excluded. For example, in `switches.filter(s => !!s.on)`, the `s` parameter
            // shadows the each-block `s` and should NOT be collected as a dependency.
            let mut local_names = FxHashSet::default();
            for param in &arrow.params {
                extract_pattern_names(param, &mut local_names);
            }
            // Block-local declarations (`const`/`let`/`var`) inside the arrow body
            // are LOCALS, not external dependencies — the official filters
            // references by function_depth, so a binding declared inside this
            // nested function is never an eager dep. Add their names too, so a
            // later read of e.g. `const seriesTooltipData = …` inside the arrow is
            // not wrongly collected as `$.deep_read_state(seriesTooltipData)`.
            if let JsArrowBody::Block(block) = &arrow.body {
                collect_block_local_decl_names(&block.body, &mut local_names);
            }
            // Add only the names we actually introduce (so we don't clobber an
            // outer same-named dependency on restore).
            let newly_added: Vec<String> = local_names
                .iter()
                .filter(|n| seen.insert((*n).clone()))
                .cloned()
                .collect();
            for param in &arrow.params {
                collect_pattern_evaluations(param, context, getters, seen);
            }
            match &arrow.body {
                JsArrowBody::Expression(body_expr) => {
                    collect_reactive_references_inner(
                        context.arena.get_expr(*body_expr),
                        context,
                        getters,
                        seen,
                    );
                }
                JsArrowBody::Block(block) => {
                    for stmt in &block.body {
                        collect_reactive_references_from_statement(stmt, context, getters, seen);
                    }
                }
            }
            // Restore: only remove the names we introduced.
            for name in &newly_added {
                seen.remove(name);
            }
        }

        JsExpr::Function(func) => {
            // Also process function bodies, excluding params AND block-local decls.
            let mut local_names = FxHashSet::default();
            for param in &func.params {
                extract_pattern_names(param, &mut local_names);
            }
            collect_block_local_decl_names(&func.body.body, &mut local_names);
            let newly_added: Vec<String> = local_names
                .iter()
                .filter(|n| seen.insert((*n).clone()))
                .cloned()
                .collect();
            for param in &func.params {
                collect_pattern_evaluations(param, context, getters, seen);
            }
            for stmt in &func.body.body {
                collect_reactive_references_from_statement(stmt, context, getters, seen);
            }
            for name in &newly_added {
                seen.remove(name);
            }
        }

        // A spread (`[...x]`, `f(...x)`) READS its argument — recurse so the
        // dependency is collected (upstream iterates `metadata.references`, which
        // already includes spread reads; this fallback walker must mirror it).
        JsExpr::Spread(inner) => {
            collect_reactive_references_inner(
                context.arena.get_expr(*inner),
                context,
                getters,
                seen,
            );
        }

        // Terminal nodes or nodes that don't contain expressions
        JsExpr::Literal(_)
        | JsExpr::This
        | JsExpr::Super
        | JsExpr::MetaProperty(_, _)
        | JsExpr::Raw(_)
        | JsExpr::OpaqueIdentifier(_)
        | JsExpr::New(_)
        | JsExpr::Class(_)
        | JsExpr::Yield(_)
        | JsExpr::Await(_)
        | JsExpr::TaggedTemplate(_)
        | JsExpr::ImportExpression { .. }
        | JsExpr::Chain(_)
        | JsExpr::Void(_) => {}
        JsExpr::SourceAnchored(anchor) => {
            collect_reactive_references_inner(
                context.arena.get_expr(anchor.inner),
                context,
                getters,
                seen,
            );
        }
        JsExpr::Spanned(inner, _, _) => {
            collect_reactive_references_inner(
                context.arena.get_expr(*inner),
                context,
                getters,
                seen,
            );
        }
    }
}

/// Helper to collect reactive references from statements.
fn collect_reactive_references_from_statement(
    stmt: &JsStatement,
    context: &ComponentContext,
    getters: &mut Vec<JsExpr>,
    seen: &mut rustc_hash::FxHashSet<String>,
) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_reactive_references_inner(
                context.arena.get_expr(expr_stmt.expression),
                context,
                getters,
                seen,
            );
        }
        JsStatement::Return(ret_stmt) => {
            if let Some(arg) = ret_stmt.argument {
                collect_reactive_references_inner(
                    context.arena.get_expr(arg),
                    context,
                    getters,
                    seen,
                );
            }
        }
        JsStatement::VariableDeclaration(var_decl) => {
            for decl in &var_decl.declarations {
                if let Some(init) = decl.init {
                    collect_reactive_references_inner(
                        context.arena.get_expr(init),
                        context,
                        getters,
                        seen,
                    );
                }
            }
        }
        JsStatement::If(if_stmt) => {
            collect_reactive_references_inner(
                context.arena.get_expr(if_stmt.test),
                context,
                getters,
                seen,
            );
            collect_reactive_references_from_statement(
                context.arena.get_stmt(if_stmt.consequent),
                context,
                getters,
                seen,
            );
            if let Some(alt) = if_stmt.alternate {
                collect_reactive_references_from_statement(
                    context.arena.get_stmt(alt),
                    context,
                    getters,
                    seen,
                );
            }
        }
        JsStatement::Block(block) => {
            for s in &block.body {
                collect_reactive_references_from_statement(s, context, getters, seen);
            }
        }
        _ => {}
    }
}

/// Add Svelte metadata for dev mode.
///
/// Wraps an expression with metadata about its source location
/// for better debugging in development mode.
///
/// Note: Currently a no-op that just wraps the expression in a statement.
/// The dev mode metadata parameters have been removed to avoid unnecessary
/// template node cloning. These will be re-added when dev mode is implemented.
#[inline]
pub fn add_svelte_meta(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    expression: JsExpr,
) -> JsStatement {
    // Non-dev mode or when called without meta info: just wrap in statement
    b::stmt(arena, expression)
}

/// Add svelte meta wrapper for dev mode with source location and type info.
/// In dev mode, wraps the expression with $.add_svelte_meta() for debugging
/// and ownership tracking.
///
/// Reference: utils.js add_svelte_meta function
pub fn add_svelte_meta_dev(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    expression: JsExpr,
    meta_type: &str,
    component_name: &str,
    line: usize,
    column: usize,
    additional: Option<Vec<(String, JsExpr)>>,
    dev: bool,
) -> JsStatement {
    if !dev {
        return b::stmt(arena, expression);
    }

    let mut args: Vec<JsExpr> = vec![
        b::arrow(arena, vec![], expression),
        b::string(meta_type),
        b::id(component_name),
        b::literal_number(line as f64),
        b::literal_number(column as f64),
    ];

    if let Some(entries) = additional {
        let props: Vec<JsObjectMember> = entries
            .into_iter()
            .map(|(k, v)| b::prop(arena, &k, v))
            .collect();
        args.push(b::object(props));
    }

    b::stmt(
        arena,
        b::call(arena, b::member_path(arena, "$.add_svelte_meta"), args),
    )
}

/// Build a template effect.
///
/// Template effects run when their dependencies change and update the DOM.
///
/// # Arguments
///
/// * `statements` - The statements to run in the effect
/// * `dependencies` - Optional list of dependencies
///
/// # Returns
///
/// Returns a call to `$.template_effect()` or `$.template_effect_with_values()`.
pub fn build_template_effect(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    statements: Vec<JsStatement>,
    dependencies: Option<Vec<JsExpr>>,
) -> JsStatement {
    // Use expression body for single expression statements, block body otherwise
    let effect_fn = if statements.len() == 1
        && let JsStatement::Expression(expr_stmt) = &statements[0]
    {
        b::arrow(arena, vec![], arena.get_expr(expr_stmt.expression).clone())
    } else {
        b::arrow_block(vec![], statements)
    };

    if let Some(deps) = dependencies {
        // $.template_effect_with_values(() => { ... }, [deps])
        b::stmt(
            arena,
            b::call(
                arena,
                b::member_path(arena, "$.template_effect_with_values"),
                vec![effect_fn, b::array(deps)],
            ),
        )
    } else {
        // $.template_effect(() => expr) or $.template_effect(() => { stmts })
        b::stmt(
            arena,
            b::call(
                arena,
                b::member_path(arena, "$.template_effect"),
                vec![effect_fn],
            ),
        )
    }
}

/// Build a render statement.
///
/// Wraps statements in a template_effect call for reactive updates.
///
/// Corresponds to `build_render_statement` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.
///
/// # Arguments
///
/// * `statements` - The update statements to wrap
///
/// # Returns
///
/// Returns a call to `$.template_effect(() => { ... })`
pub fn build_render_statement(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    statements: Vec<JsStatement>,
) -> JsExpr {
    build_render_statement_with_memoizer(arena, statements, vec![], None, None, None)
}

/// Build a render statement with memoization support.
///
/// Generates: `$.template_effect(($0, $1) => { ... }, [() => expr1, () => expr2])`
///
/// # Arguments
///
/// * `statements` - The update statements to wrap
/// * `params` - Memoizer parameter names ($0, $1, etc.)
/// * `sync_values` - Sync memoized values array
/// * `async_values` - Async memoized values array (optional)
/// * `blockers` - Blocker expressions (optional)
///
/// # Returns
///
/// Returns a call to `$.template_effect(...)` with appropriate parameters.
pub fn build_render_statement_with_memoizer(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    statements: Vec<JsStatement>,
    params: Vec<JsExpr>,
    sync_values: Option<JsExpr>,
    async_values: Option<JsExpr>,
    blockers: Option<JsExpr>,
) -> JsExpr {
    // Convert params to patterns
    let param_patterns: Vec<JsPattern> = params
        .iter()
        .filter_map(|p| {
            if let JsExpr::Identifier(name) = p {
                Some(JsPattern::Identifier(name.clone()))
            } else {
                None
            }
        })
        .collect();

    // Build the arrow function body
    let effect_fn = if statements.len() == 1
        && let JsStatement::Expression(expr_stmt) = &statements[0]
    {
        // Single expression - use expression body
        b::arrow(
            arena,
            param_patterns,
            arena.get_expr(expr_stmt.expression).clone(),
        )
    } else {
        // Multiple statements - use block body
        b::arrow_block(param_patterns, statements)
    };

    // Build arguments list
    let mut args = vec![effect_fn];

    // Add sync values if present
    if let Some(sync) = sync_values {
        args.push(sync);
    } else if async_values.is_some() || blockers.is_some() {
        // Need placeholder if we have async_values or blockers
        args.push(b::undefined(arena));
    }

    // Add async values if present
    if let Some(async_vals) = async_values {
        args.push(async_vals);
    } else if blockers.is_some() {
        args.push(b::undefined(arena));
    }

    // Add blockers if present
    if let Some(block) = blockers {
        args.push(block);
    }

    b::call(arena, b::member_path(arena, "$.template_effect"), args)
}

/// Parse a directive name into a member expression.
///
/// This allows for accessing members of an object.
/// For example, "fade.in" becomes `fade.in`, and "custom" becomes `custom`.
///
/// Corresponds to `parse_directive_name` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.
///
/// # Arguments
///
/// * `name` - The directive name (e.g., "fade", "custom.animation")
///
/// # Returns
///
/// Returns a member expression or identifier.
/// Upstream lowercases an HTML element/attribute name with JS `toLowerCase`,
/// which is not limited to ASCII; only the no-op fast path is.
pub fn html_lowercase(name: &str) -> String {
    let needs_lowering = if name.is_ascii() {
        name.bytes().any(|b| b.is_ascii_uppercase())
    } else {
        name.chars().any(|c| c.to_lowercase().next() != Some(c))
    };
    if needs_lowering {
        name.to_lowercase()
    } else {
        name.to_string()
    }
}

pub fn parse_directive_name(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    name: &str,
) -> JsExpr {
    let parts: Vec<&str> = name.split('.').collect();

    if parts.is_empty() {
        return b::id("unknown");
    }

    // Return just an identifier for the first part, including store references.
    // The caller is responsible for calling apply_transforms_to_expression()
    // which will apply the store read transform ($store -> $store()) automatically.
    // We must NOT pre-call store references here, or the later transform would
    // double-call them ($store()()).
    let first_part = parts[0];
    let mut expression = b::id(first_part);

    for part in &parts[1..] {
        // Check if the part is a valid identifier
        let computed = !is_valid_identifier(part);

        if computed {
            expression = b::member_computed(arena, expression, b::string(*part));
        } else {
            expression = b::member(arena, expression, *part);
        }
    }

    expression
}

/// Result of building a template chunk.
pub struct TemplateChunkResult {
    /// The generated expression (template literal or string)
    pub value: JsExpr,
    /// Whether the chunk contains reactive state
    pub has_state: bool,
    /// Blocker indices from expressions that reference blocker_map variables.
    /// Even when expression values are evaluated to literals at compile time,
    /// they may reference variables that depend on async operations and need
    /// to be blocked until those operations complete.
    pub blocker_indices: Vec<usize>,
}

/// The JS comments inside `source[start..end]`, as absolute `(start, end)`
/// pairs. The `/` probe keeps the re-parse off every comment-free template
/// expression, which is nearly all of them; a real parse is what tells a
/// comment apart from a division or a regex literal.
fn interior_comment_spans(source: &str, start: usize, end: usize) -> Vec<(usize, usize)> {
    if start >= end || end > source.len() {
        return Vec::new();
    }
    let slice = &source[start..end];
    if memchr::memchr(b'/', slice.as_bytes()).is_none() {
        return Vec::new();
    }
    let allocator = oxc_allocator::Allocator::default();
    let owned = allocator.alloc_str(slice);
    let ret = oxc_parser::Parser::new(&allocator, owned, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return Vec::new();
    }
    ret.program
        .comments
        .iter()
        .map(|comment| {
            (
                start + comment.span.start as usize,
                start + comment.span.end as usize,
            )
        })
        .collect()
}

/// Upstream's comment cursor hands a comment to whichever LOCATED node comes
/// next, so a constant-folded tag — which leaves no node behind — does not
/// swallow the one written inside it. Re-emit it as an opaque chunk at its
/// source position; it parses to zero statements and one comment, so the next
/// generated node that carries a source anchor flushes it, exactly as upstream's
/// cursor does.
fn push_folded_tag_comments(tag_start: u32, tag_end: u32, context: &mut ComponentContext) {
    let (Some(start), Some(end)) = (tag_start.checked_add(1), tag_end.checked_sub(1)) else {
        return;
    };
    // Upstream's component block borrows the instance script's `loc`
    // (`component_block.loc = instance.loc`), and `reset_comment_index` then
    // parks the cursor at the first comment that is not before it: with no
    // `<script>` there is no `loc`, the cursor starts dead, and every comment in
    // the file is dropped — as is every comment written ahead of the script.
    let Some(cursor_start) = context
        .state
        .analysis
        .instance_script_content
        .as_ref()
        .map(|script| script.start as usize)
    else {
        return;
    };
    let spans =
        interior_comment_spans(&context.state.analysis.source, start as usize, end as usize);
    for (start, end) in spans {
        if start < cursor_start {
            continue;
        }
        let code = context.state.analysis.source[start..end].to_string();
        context.state.init.push(JsStatement::RawMapped {
            code: code.into(),
            source_offset: start as u32,
            comment_anchor: None,
            copied_spans: Vec::new(),
        });
    }
}

/// Drop the opaque chunks `push_folded_tag_comments` emitted for the tag in
/// `[tag_start, tag_end)`. A generated node anchored on the same source region
/// carries those comments itself, and keeping both prints each one twice.
pub fn drop_folded_tag_comments(
    state: &mut crate::compiler::phases::phase3_transform::client::types::ComponentClientTransformState<'_>,
    tag_start: u32,
    tag_end: u32,
) {
    state.init.retain(|stmt| match stmt {
        JsStatement::RawMapped {
            code,
            source_offset,
            ..
        } => {
            !(*source_offset >= tag_start
                && *source_offset < tag_end
                && (code.starts_with("//") || code.starts_with("/*")))
        }
        _ => true,
    });
}

/// Build a template chunk from text/expression nodes.
///
/// Corresponds to `build_template_chunk` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.
///
/// # Arguments
///
/// * `values` - Array of Text or ExpressionTag nodes
/// * `context` - Component transformation context
///
/// # Returns
///
/// Returns a TemplateChunkResult with the generated expression and state flag.
pub fn build_template_chunk(
    values: &[crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::TextOrExpr<'_>],
    context: &mut ComponentContext,
) -> TemplateChunkResult {
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
    use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::TextOrExpr;

    let mut expressions: Vec<JsExpr> = Vec::with_capacity(values.len());
    let mut quasi = b::quasi("", false);
    let mut quasis = Vec::with_capacity(values.len() + 1);
    quasis.push(quasi.clone());

    let mut has_state = false;
    let mut blocker_indices: Vec<usize> = Vec::new();

    for (i, node) in values.iter().enumerate() {
        match node {
            TextOrExpr::Text(text) => {
                // Add text data to current quasi
                let last_quasi = quasis.last_mut().unwrap();
                last_quasi.raw.push_str(&text.data);
                last_quasi.cooked.push_str(&text.data);
            }
            TextOrExpr::Expr(expr_tag) => {
                // Check if it's a literal or can be evaluated at compile time
                if let Some(lit_value) =
                    get_literal_value(&expr_tag.expression, &expr_tag.metadata.expression, context)
                {
                    if let Some(val) = lit_value {
                        let last_quasi = quasis.last_mut().unwrap();
                        last_quasi.raw.push_str(&val);
                        last_quasi.cooked.push_str(&val);
                    }
                    push_folded_tag_comments(expr_tag.start, expr_tag.end, context);
                    // Even when the expression evaluates to a literal, check if it
                    // references variables in the blocker_map. This corresponds to
                    // the official compiler's `has_blockers()` check in build_template_chunk:
                    //   has_await ||= node.metadata.expression.has_blockers();
                    //   has_state ||= has_await || ...;
                    {
                        let map = context.state.blocker_map.borrow();
                        if !map.is_empty() {
                            let expr_ids =
                                collect_expression_identifiers_for_blockers(&expr_tag.expression);
                            for name in &expr_ids {
                                if let Some(&idx) = map.get(name.as_str()) {
                                    if !blocker_indices.contains(&idx) {
                                        blocker_indices.push(idx);
                                    }
                                    has_state = true;
                                }
                            }
                        }
                    }
                } else {
                    // Convert Expression to JsExpr using the proper converter
                    let converted_expr = convert_expression(&expr_tag.expression, context);

                    // Keep the remaining Phase 3 property checks in one pass. `has_call`
                    // comes from Phase 2, matching upstream's metadata consumer.
                    // Special case: $effect.pending() is inherently reactive (has_state=true)
                    // but NOT a "call" for memoization. This matches the official Svelte compiler's
                    // phase 2 analysis where $effect.pending() explicitly sets has_state = true
                    // but does NOT set has_call (because is_pure returns true for the callee).
                    let is_pending_rune =
                        is_effect_pending_expr(&expr_tag.expression, context.state.parse_arena);
                    let expr_props = analyze_expression_properties(&expr_tag.expression, context);
                    let expr_has_state = expr_props.has_state || is_pending_rune;
                    let expr_has_member = expr_props.has_member;
                    let expr_has_await = expr_props.has_await;

                    // Build the expression with transforms applied (e.g., $.get() wrapping)
                    let expr_has_call = expr_tag.metadata.expression.has_call();
                    // Preserve the scope-resolved binding references collected in
                    // Phase 2. The name-based fallback in `build_expression` cannot
                    // distinguish a template-local binding from a same-named binding
                    // in another scope, so rebuilding this metadata from flags alone
                    // drops the dependency reads that legacy expressions need before
                    // their `$.untrack(...)` value.
                    let mut expr_metadata =
                        ExpressionMetadata::from_template_metadata(&expr_tag.metadata.expression);
                    expr_metadata.set_has_state(expr_has_state);
                    expr_metadata.set_has_member_expression(expr_has_member);
                    expr_metadata.set_has_await(expr_has_await);

                    let built_expr = build_expression(context, &converted_expr, &expr_metadata);

                    // Memoize if expression contains a call or await
                    // This matches Svelte's behavior of replacing function calls with $0, $1, etc.
                    let value = context.state.memoizer.add_memoized(
                        built_expr,
                        expr_has_call,
                        expr_has_await,
                        false, // memoize_if_state
                        expr_has_state,
                    );

                    {
                        let map = context.state.blocker_map.borrow();
                        for name in
                            collect_expression_identifiers_for_blockers(&expr_tag.expression)
                        {
                            if let Some(&idx) = map.get(&name) {
                                if !blocker_indices.contains(&idx) {
                                    blocker_indices.push(idx);
                                }
                                has_state = true;
                            }
                        }
                    }

                    // Track if any expression has state, call, or await (need reactive update).
                    // In the official Svelte compiler, has_call is only set for non-pure calls
                    // (calls to local functions, not globals like console.log), and when set,
                    // it also sets has_state. So has_call contributes to reactivity.
                    if expr_has_state || expr_has_call || expr_has_await {
                        has_state = true;
                    }

                    // For single expression, return directly
                    if values.len() == 1 {
                        return TemplateChunkResult {
                            value,
                            has_state,
                            blocker_indices,
                        };
                    }

                    let is_defined =
                        template_chunk_value_is_defined(&value, &expr_tag.expression, context);

                    // Add ?? '' where necessary (only if not guaranteed to be defined)
                    let final_value = if is_defined {
                        value
                    } else {
                        b::logical_str(&context.arena, "??", value, b::string(""))
                    };

                    expressions.push(final_value);

                    // Start new quasi
                    let tail = i + 1 == values.len();
                    quasi = b::quasi("", tail);
                    quasis.push(quasi.clone());
                }
            }
        }
    }

    // Sanitize template strings
    for q in &mut quasis {
        q.raw = sanitize_template_string(q.cooked.as_str()).into();
    }

    // Build final expression
    let value = if !expressions.is_empty() {
        b::template(quasis, expressions)
    } else {
        let last_quasi = quasis.last().unwrap();
        b::string(last_quasi.clone().cooked)
    };

    TemplateChunkResult {
        value,
        has_state,
        blocker_indices,
    }
}

/// Collect identifiers from an AST Expression for blocker map checking.
/// This walks the JSON AST to find all Identifier nodes.
pub(crate) fn collect_expression_identifiers_for_blockers(
    expr: &crate::ast::js::Expression,
) -> Vec<String> {
    let mut names = Vec::new();
    let val = expr.as_json();
    collect_expr_ids_recursive(val, &mut names);
    names
}

fn collect_expr_ids_recursive(val: &serde_json::Value, names: &mut Vec<String>) {
    match val {
        serde_json::Value::Object(obj) => {
            let node_type = obj.get("type").and_then(|v| v.as_str()).unwrap_or("");
            if node_type == "Identifier" {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str())
                    && !names.contains(&name.to_string())
                {
                    names.push(name.to_string());
                }
            } else {
                for (key, value) in obj {
                    if key == "type" || key == "start" || key == "end" || key == "loc" {
                        continue;
                    }
                    collect_expr_ids_recursive(value, names);
                }
            }
        }
        serde_json::Value::Array(arr) => {
            for item in arr {
                collect_expr_ids_recursive(item, names);
            }
        }
        _ => {}
    }
}

/// Cook a string literal's raw inner text: resolve every JS escape sequence to
/// the character it denotes, the way upstream's `scope.evaluate` yields the
/// literal's `value`. The result is a *value*, not source — whoever emits it
/// re-escapes for the quoting it lands in (`sanitize_template_string` for a
/// quasi, the printer for a string literal), so leaving an escape undecoded
/// here escapes it a second time.
pub(crate) fn cook_string_literal(s: &str) -> String {
    if !s.contains('\\') {
        return s.to_string();
    }
    let bytes = s.as_bytes();
    let mut out = String::with_capacity(s.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'\\' && i + 1 < bytes.len() {
            match bytes[i + 1] {
                b'u' if i + 2 < bytes.len() && bytes[i + 2] == b'{' => {
                    if let Some(close) = s[i + 3..].find('}') {
                        let hex = &s[i + 3..i + 3 + close];
                        if let Ok(cp) = u32::from_str_radix(hex, 16)
                            && let Some(c) = char::from_u32(cp)
                        {
                            out.push(c);
                            i = i + 3 + close + 1;
                            continue;
                        }
                    }
                    out.push('\\');
                    i += 1;
                    continue;
                }
                b'u' if i + 6 <= bytes.len() => {
                    if let Ok(cp) = u32::from_str_radix(&s[i + 2..i + 6], 16) {
                        if let Some(c) = char::from_u32(cp) {
                            out.push(c);
                            i += 6;
                            continue;
                        }
                        // A lone surrogate has no `char`; only a well-formed pair
                        // does, and Rust cannot hold the unpaired half either way.
                        if (0xD800..=0xDBFF).contains(&cp)
                            && i + 12 <= bytes.len()
                            && bytes[i + 6] == b'\\'
                            && bytes[i + 7] == b'u'
                            && let Ok(lo) = u32::from_str_radix(&s[i + 8..i + 12], 16)
                            && (0xDC00..=0xDFFF).contains(&lo)
                            && let Some(c) =
                                char::from_u32(0x10000 + ((cp - 0xD800) << 10) + (lo - 0xDC00))
                        {
                            out.push(c);
                            i += 12;
                            continue;
                        }
                    }
                    out.push('\\');
                    i += 1;
                    continue;
                }
                b'x' if i + 4 <= bytes.len() => {
                    let hex = &s[i + 2..i + 4];
                    if let Ok(cp) = u32::from_str_radix(hex, 16)
                        && let Some(c) = char::from_u32(cp)
                    {
                        out.push(c);
                        i += 4;
                        continue;
                    }
                    out.push('\\');
                    i += 1;
                    continue;
                }
                b'\n' => {
                    // Line continuation — contributes nothing to the value.
                    i += 2;
                    continue;
                }
                b'\r' => {
                    i += if bytes.get(i + 2) == Some(&b'\n') {
                        3
                    } else {
                        2
                    };
                    continue;
                }
                // Legacy octal is a syntax error in the module goal, so `\0` is
                // NUL only when no digit follows.
                b'0' if !bytes.get(i + 2).is_some_and(u8::is_ascii_digit) => {
                    out.push('\0');
                    i += 2;
                    continue;
                }
                b'1'..=b'7' => {
                    out.push('\\');
                    i += 1;
                    continue;
                }
                c => {
                    out.push(match c {
                        b'n' => '\n',
                        b'r' => '\r',
                        b't' => '\t',
                        b'b' => '\u{8}',
                        b'f' => '\u{c}',
                        b'v' => '\u{b}',
                        _ => {
                            // `\<anything else>` is that character verbatim, and it
                            // may be multi-byte (`\é`).
                            let mut next = i + 2;
                            while next < bytes.len() && !s.is_char_boundary(next) {
                                next += 1;
                            }
                            out.push_str(&s[i + 1..next]);
                            i = next;
                            continue;
                        }
                    });
                    i += 2;
                    continue;
                }
            }
        }
        let mut next = i + 1;
        while next < bytes.len() && !s.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&s[i..next]);
        i = next;
    }
    out
}

/// Get literal value from an expression if it can be evaluated at compile time.
///
/// Returns:
/// - `Some(Some(value))` - expression evaluates to a non-null/undefined string value
/// - `Some(None)` - expression evaluates to null/undefined (should be omitted)
/// - `None` - expression cannot be evaluated at compile time
pub(crate) fn get_literal_value(
    expr: &crate::ast::js::Expression,
    metadata: &crate::ast::template::ExpressionMetadata,
    context: &ComponentContext,
) -> Option<Option<String>> {
    if legacy_build_expression_wraps(expr, metadata, context) {
        return None;
    }
    eval_value_text(&get_literal_value_json(expr.as_json(), context)?)
}

/// Whether `build_expression` will wrap this chunk in legacy reactivity.
///
/// Upstream's `build_template_chunk` evaluates the value it BUILT, and in legacy
/// mode that value is a `SequenceExpression` whenever the expression has a call,
/// a member or an assignment. `scope.evaluate` has no `SequenceExpression` case,
/// so such a chunk is never known however constant the source reads.
fn legacy_build_expression_wraps(
    expr: &crate::ast::js::Expression,
    metadata: &crate::ast::template::ExpressionMetadata,
    context: &ComponentContext,
) -> bool {
    if context.state.analysis.runes || context.state.analysis.maybe_runes {
        return false;
    }
    if metadata.has_call() || metadata.has_member_expression() || metadata.has_assignment() {
        return true;
    }
    // Some directive paths drop the structural flags in phase 2, and the sites
    // that build this chunk repair them before `build_expression` reads them —
    // so the fold has to see the repaired answer or the two disagree about one
    // tree.
    let props = analyze_expression_properties(expr, context);
    props.has_member || props.has_assignment || has_call_json(expr.as_json(), context)
}

/// A folded value as the inlining callers consume it: `None` for a nullish
/// value they omit, `Some(text)` for anything they can write into the template.
fn eval_value_text(v: &EvalValue) -> Option<Option<String>> {
    if v.is_nullish()? {
        Some(None)
    } else {
        to_js_string(v).map(Some)
    }
}

/// A folded value only when it is a concrete one — a marker (`NUMBER`,
/// `STRING`, `UNKNOWN`) means the fold failed.
/// Fold a template expression through the shared port of upstream
/// `scope.evaluate`.
fn get_literal_value_json(jv: &serde_json::Value, context: &ComponentContext) -> Option<EvalValue> {
    let expr_type = jv.get("type").and_then(|t| t.as_str())?;

    // `build_template_chunk` memoizes first. A call-bearing chunk is therefore
    // an opaque temporary by the time upstream evaluates it, while recursion
    // into a binding initializer is not memoized.
    if matches!(
        expr_type,
        "CallExpression"
            | "BinaryExpression"
            | "LogicalExpression"
            | "ConditionalExpression"
            | "UnaryExpression"
            | "TemplateLiteral"
            | "MemberExpression"
            | "SequenceExpression"
            | "ChainExpression"
    ) && has_call_json(jv, context)
    {
        return None;
    }

    // The template converter has already replaced this read. Evaluating its
    // source binding would evaluate a different expression.
    if expr_type == "Identifier"
        && jv
            .get("name")
            .and_then(|name| name.as_str())
            .is_some_and(|name| context.state.transform.contains_key(name))
    {
        return None;
    }

    evaluate_estree(
        &ClientEvalScope {
            context,
            converted: true,
        },
        jv,
        0,
    )
    .known_value()
    .cloned()
}

/// Check if a BUILT JsExpr is guaranteed to be defined (non-null/undefined).
///
/// This evaluates the transformed expression (after build_expression), matching
/// the official Svelte compiler's `scope.evaluate(value).is_defined` behavior.
/// Function calls (like `$.get(index)`) are NOT considered defined because they
/// could theoretically return undefined.
/// Build the dotted keypath of a static `JsExpr` callee (`Math.round` →
/// `"Math.round"`). Returns `None` for computed members, calls, or anything
/// that isn't a plain identifier / identifier-member chain.
pub(crate) fn js_expr_keypath(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> Option<String> {
    match expr {
        JsExpr::Spanned(inner, _, _) => js_expr_keypath(arena.get_expr(*inner), arena),
        JsExpr::Identifier(name) => Some(name.to_string()),
        JsExpr::Member(m) if !m.computed => {
            let prop = match &m.property {
                crate::compiler::phases::phase3_transform::js_ast::nodes::JsMemberProperty::Identifier(prop)
                | crate::compiler::phases::phase3_transform::js_ast::nodes::JsMemberProperty::SpannedIdentifier {
                    name: prop,
                    ..
                } => prop,
                _ => return None,
            };
            {
                let base = js_expr_keypath(arena.get_expr(m.object), arena)?;
                Some(format!("{base}.{prop}"))
            }
        }
        _ => None,
    }
}

pub(crate) use crate::compiler::phases::phase2_analyze::scope::is_known_defined_global_call;
/// Does the call carry a `...spread` argument? Upstream's `globals` branch
/// requires it not to.
pub(crate) fn js_call_has_spread(
    call: &crate::compiler::phases::phase3_transform::js_ast::nodes::JsCallExpression,
) -> bool {
    call.arguments
        .iter()
        .any(|arg| matches!(arg, JsExpr::Spread(_)))
}

/// Upstream `scope.evaluate`'s `global_constants` table.
pub(crate) fn is_global_constant(keypath: &str) -> bool {
    matches!(
        keypath,
        "Math.PI"
            | "Math.E"
            | "Math.LN10"
            | "Math.LN2"
            | "Math.LOG10E"
            | "Math.LOG2E"
            | "Math.SQRT2"
            | "Math.SQRT1_2"
    )
}

/// Upstream `build_template_chunk` / `TitleElement` both ask
/// `state.scope.evaluate(value).is_defined` of the BUILT value, never of the
/// source expression — a legacy prop read becomes a `SequenceExpression`, which
/// upstream's `evaluate` has no case for, so it is never `is_defined`. The
/// original is consulted only where the transform left a bare identifier, which
/// is the one shape whose binding context survives it.
pub(crate) fn template_chunk_value_is_defined(
    value: &JsExpr,
    original: &crate::ast::js::Expression,
    context: &ComponentContext,
) -> bool {
    let mut built = value;
    while let JsExpr::Spanned(inner, _, _) = built {
        built = context.arena.get_expr(*inner);
    }
    if let JsExpr::Identifier(name) = built {
        // A memoizer parameter (`$0`) is unknown to the component scope.
        if name.starts_with('$') && name[1..].chars().all(|c| c.is_ascii_digit()) {
            false
        } else {
            is_expression_defined(original, context)
        }
    } else {
        is_js_expr_defined(built, &context.arena, context)
    }
}

pub(crate) fn is_js_expr_defined(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    context: &ComponentContext,
) -> bool {
    match expr {
        JsExpr::Spanned(inner, _, _) => is_js_expr_defined(arena.get_expr(*inner), arena, context),
        JsExpr::Literal(lit) => match lit {
            JsLiteral::Null | JsLiteral::Undefined => false,
            _ => true, // String, Number, Boolean are always defined
        },
        // Upstream `scope.evaluate` resolves identifiers through the scope even
        // on the built (transformed) AST: a non-reactive binding that survives
        // transformation as a bare identifier (reactive reads become `$.get(x)`
        // CallExpressions instead) still resolves to its binding's evaluation.
        // Mirror that so e.g. `cond ? iconAsc : iconDesc` (legacy string lets)
        // reads bare. Synthetic memo ids (`$0`) have no binding → false.
        JsExpr::Identifier(name) => identifier_is_defined(name, context),
        JsExpr::Call(call) => {
            // Upstream `scope.evaluate` knows the global `Math.*` / `Number` /
            // `Number.*` / `String` / `String.from*` / `BigInt` functions return
            // a NUMBER or STRING — never null/undefined — so a call to one is
            // `is_defined` and gets no `?? ''`. (A shadowing local binding would
            // have been wrapped — e.g. `$.get(Math).round(...)` — so the bare
            // global keypath only matches the real globals.)
            js_expr_keypath(arena.get_expr(call.callee), arena)
                .as_deref()
                .is_some_and(|keypath| {
                    is_known_defined_global_call(keypath, js_call_has_spread(call))
                })
        }
        JsExpr::TemplateLiteral(_) => true, // Always a string
        JsExpr::Function(_) | JsExpr::Arrow(_) => true,
        JsExpr::Binary(_) => true, // Always produces a result
        JsExpr::Unary(u) => !matches!(u.operator, JsUnaryOp::Void),
        JsExpr::Logical(log) => {
            // Check both sides
            is_js_expr_defined(arena.get_expr(log.left), arena, context)
                && is_js_expr_defined(arena.get_expr(log.right), arena, context)
        }
        JsExpr::Conditional(cond) => {
            is_js_expr_defined(arena.get_expr(cond.consequent), arena, context)
                && is_js_expr_defined(arena.get_expr(cond.alternate), arena, context)
        }
        JsExpr::Raw(s) => {
            // Raw expressions that are string/number literals are defined.
            // e.g., Raw("\"show\""), Raw("42"), Raw("true"), Raw("false")
            let trimmed = s.trim();
            (trimmed.starts_with('"') && trimmed.ends_with('"'))
                || (trimmed.starts_with('\'') && trimmed.ends_with('\''))
                || trimmed == "true"
                || trimmed == "false"
                || trimmed.parse::<f64>().is_ok()
        }
        // Upstream's `scope.evaluate` has no `SequenceExpression` case, so it
        // falls to `default` and adds UNKNOWN — never `is_defined`, whatever
        // the last element evaluates to.
        _ => false,
    }
}

/// Upstream's `scope.evaluate(<identifier>).is_defined`, for an identifier that
/// survived transformation bare. The walk is the shared one, so the built-value
/// path and the source-expression path cannot answer this differently.
fn identifier_is_defined(name: &str, context: &ComponentContext) -> bool {
    if name == "undefined" {
        return false;
    }

    // A transform carries template-local knowledge the component scope does not
    // — an each index inside its own block — so it wins where it is set.
    if let Some(transform) = context.state.transform.get(name)
        && transform.is_defined
    {
        return true;
    }

    // Everything else is upstream's `scope.evaluate(<identifier>)`, which
    // recurses into the binding's initializer. Answering it here from a table of
    // binding shapes made this the second, weaker port of that walk.
    context.state.get_binding(name).is_some_and(|binding| {
        evaluate_binding_initial(
            &ClientEvalScope {
                context,
                converted: false,
            },
            binding,
            0,
        )
        .is_defined()
    })
}

/// Check if an expression is guaranteed to be defined (non-null/undefined).
///
/// This corresponds to Svelte's `state.scope.evaluate(value).is_defined` check.
/// Returns true for expressions that are known to never be null/undefined, such as:
/// - Each block indices (always numbers)
/// - Numeric/boolean literals
/// - Binary/unary expressions (always produce defined results)
/// - Non-updated const bindings with defined initial values
pub(crate) fn is_expression_defined(
    expr: &crate::ast::js::Expression,
    context: &ComponentContext,
) -> bool {
    evaluate_estree(
        &ClientEvalScope {
            context,
            converted: false,
        },
        expr.as_json(),
        0,
    )
    .is_defined()
}

/// Dotted keypath of a static estree-JSON callee (`Math.round` → `"Math.round"`).
pub(crate) fn json_keypath(node: &serde_json::Value) -> Option<String> {
    let obj = node.as_object()?;
    match obj.get("type").and_then(|t| t.as_str())? {
        "Identifier" => obj.get("name").and_then(|n| n.as_str()).map(String::from),
        "MemberExpression" if obj.get("computed").and_then(|c| c.as_bool()) != Some(true) => {
            let prop = obj.get("property")?.as_object()?;
            if prop.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
                return None;
            }
            let prop_name = prop.get("name").and_then(|n| n.as_str())?;
            let base = json_keypath(obj.get("object")?)?;
            Some(format!("{base}.{prop_name}"))
        }
        _ => None,
    }
}

/// Result of analyzing multiple expression properties in a single AST walk.
pub struct ExpressionProperties {
    pub has_state: bool,
    pub has_member: bool,
    pub has_await: bool,
    pub has_assignment: bool,
}

/// Analyze an expression for reactive state, member expressions, and await
/// expressions in a single pass over the JSON AST.
///
/// This is equivalent to computing the reactive-state, member-expression, and
/// await properties separately, but avoids walking the tree 3 times.
pub fn analyze_expression_properties(
    expr: &crate::ast::js::Expression,
    context: &ComponentContext,
) -> ExpressionProperties {
    let mut props = ExpressionProperties {
        has_state: false,
        has_member: false,
        has_await: false,
        has_assignment: false,
    };

    {
        let json_value = expr.as_json();
        analyze_props_json(json_value, context, &mut props);
    }

    props
}

/// Internal recursive helper for `analyze_expression_properties`.
///
/// Walks the JSON AST once, setting flags for reactive state, member expressions,
/// and await expressions. Once all flags are set to true, stops recursing (short-circuit).
fn analyze_props_json(
    json_value: &serde_json::Value,
    context: &ComponentContext,
    props: &mut ExpressionProperties,
) {
    // Short-circuit: if all flags are already true, no need to walk further
    if props.has_state && props.has_member && props.has_await && props.has_assignment {
        return;
    }

    let Some(obj) = json_value.as_object() else {
        return;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return;
    };

    match expr_type {
        "Identifier" => {
            // has_member: no
            // has_await: no
            // has_state: check bindings/transforms
            if !props.has_state && obj.get("name").and_then(|v| v.as_str()).is_some() {
                props.has_state = has_reactive_state_json(json_value, context);
            }
        }
        "MemberExpression" => {
            // has_member: always true for MemberExpression
            props.has_member = true;

            // has_state: delegate to has_reactive_state_json (complex MemberExpression logic)
            if !props.has_state {
                props.has_state = has_reactive_state_json(json_value, context);
            }

            // has_await: check object subtree
            if !props.has_await
                && let Some(object) = obj.get("object")
            {
                props.has_await = has_await_json(object);
            }
        }
        "CallExpression" | "TaggedTemplateExpression" => {
            // has_state: use existing logic (complex CallExpression handling)
            if !props.has_state {
                props.has_state = has_reactive_state_json(json_value, context);
            }

            // has_member: check callee and arguments
            if !props.has_member {
                if let Some(callee) = obj.get("callee")
                    && has_member_json(callee)
                {
                    props.has_member = true;
                }
                if !props.has_member
                    && let Some(args) = obj.get("arguments").and_then(|v| v.as_array())
                {
                    for arg in args {
                        if has_member_json(arg) {
                            props.has_member = true;
                            break;
                        }
                    }
                }
            }

            // has_await: check callee and arguments
            if !props.has_await {
                if let Some(callee) = obj.get("callee")
                    && has_await_json(callee)
                {
                    props.has_await = true;
                }
                if !props.has_await
                    && let Some(args) = obj.get("arguments").and_then(|v| v.as_array())
                {
                    for arg in args {
                        if has_await_json(arg) {
                            props.has_await = true;
                            break;
                        }
                    }
                }
            }
        }
        "NewExpression" => {
            // Upstream's `NewExpression` visitor only calls `context.next()`, so a
            // `new` contributes no flag of its own — every flag comes from the
            // callee and the arguments.
            if let Some(callee) = obj.get("callee") {
                analyze_props_json(callee, context, props);
            }
            if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                for arg in args {
                    analyze_props_json(arg, context, props);
                }
            }
        }
        "AwaitExpression" => {
            // has_await: always true
            props.has_await = true;
            // has_state: AwaitExpression is always reactive
            props.has_state = true;
            // has_member: not directly, but don't need to recurse for state/await
        }
        "BinaryExpression" | "LogicalExpression" => {
            if let Some(left) = obj.get("left") {
                analyze_props_json(left, context, props);
            }
            if let Some(right) = obj.get("right") {
                analyze_props_json(right, context, props);
            }
        }
        "UnaryExpression" => {
            if let Some(argument) = obj.get("argument") {
                analyze_props_json(argument, context, props);
            }
        }
        "ConditionalExpression" => {
            for field in ["test", "consequent", "alternate"] {
                if let Some(val) = obj.get(field) {
                    analyze_props_json(val, context, props);
                }
            }
        }
        "TemplateLiteral" => {
            if let Some(exprs) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in exprs {
                    analyze_props_json(expr_val, context, props);
                }
            }
        }
        "ChainExpression" => {
            if let Some(expression) = obj.get("expression") {
                analyze_props_json(expression, context, props);
            }
        }
        "SequenceExpression" => {
            if let Some(expressions) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in expressions {
                    analyze_props_json(expr_val, context, props);
                }
            }
        }
        "AssignmentExpression" => {
            props.has_assignment = true;
            // has_member: check both left and right
            if !props.has_member {
                for field in ["left", "right"] {
                    if let Some(val) = obj.get(field)
                        && has_member_json(val)
                    {
                        props.has_member = true;
                        break;
                    }
                }
            }
            // has_state: check BOTH sides. Upstream's AssignmentExpression
            // visitor walks `left` and `right`, so the LHS member object is read
            // too: `dataAttribute.value = []` reads `dataAttribute`, making the
            // text `{(dataAttribute.value = [])}` reactive (→ `$.template_effect`,
            // not a static `nodeValue =`) when `dataAttribute` is a reactive
            // prop/state.
            if !props.has_state {
                for field in ["left", "right"] {
                    if let Some(v) = obj.get(field)
                        && has_reactive_state_json(v, context)
                    {
                        props.has_state = true;
                        break;
                    }
                }
            }
            // has_await: not checked for AssignmentExpression by has_await_json
        }
        "ArrayExpression" => {
            if let Some(elements) = obj.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    analyze_props_json(elem, context, props);
                }
            }
        }
        "ObjectExpression" => {
            if let Some(properties) = obj.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
                    if let Some(prop_obj) = prop.as_object()
                        && let Some(value) = prop_obj.get("value")
                    {
                        analyze_props_json(value, context, props);
                    }
                }
            }
        }
        "SpreadElement" => {
            if let Some(argument) = obj.get("argument") {
                analyze_props_json(argument, context, props);
            }
        }
        "UpdateExpression" => {
            // has_state: always true (mutations are reactive)
            props.has_state = true;
            props.has_assignment = true;
        }
        "Literal" | "BooleanLiteral" | "NumericLiteral" | "StringLiteral" | "NullLiteral"
        | "BigIntLiteral" | "RegExpLiteral" => {
            // No flags to set for literals
        }
        "MetaProperty" | "ThisExpression" => {
            // Leaves upstream: it has no visitor for either, and `is_reference`
            // rejects both halves of `import.meta`, so nothing here is a read.
            // A MEMBER of one is still dynamic — that is the `MemberExpression`
            // arm, whose leftmost object is then not an `Identifier`.
        }
        "ImportExpression" => {
            // Upstream has no visitor either, so `import(x)` is not a call —
            // only what it is given can be reactive.
            if let Some(source) = obj.get("source") {
                analyze_props_json(source, context, props);
            }
            if let Some(options) = obj.get("options") {
                analyze_props_json(options, context, props);
            }
        }
        "ArrowFunctionExpression" | "FunctionExpression" => {
            // Function definitions don't affect these flags
        }
        _ => {
            // Unknown expression type - conservatively assume reactive (matches has_reactive_state_json)
            props.has_state = true;
        }
    }
}

/// Check if an expression references any reactive state.
///
/// Returns true if the expression contains identifiers that reference
/// reactive bindings ($state, $derived, props, stores, etc.).
///
/// The answer is taken off the typed nodes whenever `typed_has_reactive_state`
/// recognises every shape it meets, so the common case never materializes
/// `as_json()`. Everything else falls through to the JSON walk.
#[inline]
pub fn expression_has_reactive_state(
    expr: &crate::ast::js::Expression,
    context: &ComponentContext,
) -> bool {
    if let Some(node) = expr.try_as_node_ref() {
        use crate::ast::typed_expr::JsNode;
        let typed = match node {
            // Leaves answer without an arena; every deeper shape needs one to
            // resolve child ids.
            JsNode::Identifier { name, start, .. } => Some(identifier_has_reactive_state(
                name.as_str(),
                Some(*start),
                context,
            )),
            JsNode::Literal { .. } => Some(false),
            _ => crate::ast::arena::try_with_current_serialize_arena(|arena| {
                typed_has_reactive_state(node, arena, context)
            })
            .flatten(),
        };
        if let Some(answer) = typed {
            return answer;
        }
    }
    has_reactive_state_json(expr.as_json(), context)
}

/// Check if an expression is a `$effect.pending()` rune call.
///
/// The official Svelte compiler treats `$effect.pending()` as inherently reactive
/// (has_state = true) in phase 2 analysis, but it does NOT set has_call = true
/// (since the callee is a pure global). This function detects this rune call
/// so the caller can set has_state = true without affecting has_call.
#[inline]
pub fn is_effect_pending_expr(
    expr: &crate::ast::js::Expression,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::typed_expr::JsNode;
    // Must be a CallExpression
    if expr.node_type() != Some("CallExpression") {
        return false;
    }
    // Check callee is $effect.pending (MemberExpression, not computed)
    let Some(callee_id) = expr.callee() else {
        return false;
    };
    let callee = arena.get_js_node(callee_id);
    match callee {
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            if *computed {
                return false;
            }
            let prop_node = arena.get_js_node(*property);
            let obj_node = arena.get_js_node(*object);
            let is_pending =
                matches!(prop_node, JsNode::Identifier { name, .. } if name.as_str() == "pending");
            let is_effect_obj =
                matches!(obj_node, JsNode::Identifier { name, .. } if name.as_str() == "$effect");
            is_pending && is_effect_obj
        }
        _ => false,
    }
}

/// True when a binding's stored initializer (`init_expr_json`, an interpolated
/// template literal) is compile-time known.
fn initial_is_non_reactive(binding: &Binding, context: &ComponentContext) -> bool {
    is_binding_initial_known(binding, context)
}

/// Resolve the binding a template identifier read actually refers to,
/// correcting for `get_binding`'s root-scope pollution (see its own doc
/// comment) when a block-local `{#snippet}` shadows a same-named outer
/// binding that is NOT a prop — a plain script-level `function` / `let`, or a
/// `$derived`. `shadow_snippet_declarations` (`client::utils`) already
/// records every such shadowed name in `shadowed_prop_names` (despite the
/// name, it covers ANY outer binding a fragment's snippets shadow, not just
/// props) and strips it from `transform`, so a shadowed prop/store still
/// resolves correctly here via the "always reactive" `BindingKind` branch
/// below. A shadowed plain function does not: `get_binding` returns the
/// outer function's binding, whose `is_function()` is `true`, so the read
/// wrongly skips the `$.template_effect` wrap that the local snippet (whose
/// `is_function()` is always `false`, matching upstream's
/// `Binding#is_function`) requires.
///
/// `ScopeRoot::binding_at_reference` (added for #2060/#2143) covers this same
/// class of bug more precisely, by replaying Phase 2's scope-correct
/// resolution for the exact reference position — prefer it wherever a source
/// position is available (see `has_reactive_state_json` /
/// `is_expression_known_json`). This name-based fallback remains the only
/// option for `build_event_handler` (`shared/events.rs`, `attribute.rs`),
/// which resolve an already-converted `JsExpr::Identifier` that carries no
/// source position.
pub fn resolve_shadowing_snippet_binding<'a>(
    name: &str,
    context: &'a ComponentContext,
) -> Option<&'a Binding> {
    let direct = context.state.get_binding(name);
    let is_snippet_binding = |b: &Binding| {
        matches!(b.kind, BindingKind::Normal)
            && b.initial_node_type.as_deref() == Some("SnippetBlock")
    };
    if direct.is_some_and(is_snippet_binding) || !context.state.shadowed_prop_names.contains(name) {
        return direct;
    }
    context
        .state
        .scope_root
        .bindings_by_name
        .get(name)
        .and_then(|idxs| {
            idxs.iter().rev().find_map(|&i| {
                let b = context.state.scope_root.bindings.get(i as usize)?;
                is_snippet_binding(b).then_some(b)
            })
        })
        .or(direct)
}

/// The `"Identifier"` case of `has_reactive_state_json`, lifted out so the typed
/// front end of `expression_has_reactive_state` can answer a bare identifier
/// without materializing the expression as JSON. `start` is the identifier's
/// source offset, used only to replay Phase 2's scope-correct resolution.
fn identifier_has_reactive_state(
    name: &str,
    start: Option<u32>,
    context: &ComponentContext,
) -> bool {
    // An enclosing `{#each … as <item>[, <index>]}` loop variable shadows
    // any outer binding of the same name; inside the block it is the loop
    // variable, not the outer constant. `get_binding` below walks
    // `self.scope`, which is NOT switched to the each scope during the body
    // transform, so a shadowed name would resolve to the outer (possibly
    // non-reactive) binding and wrongly report the text as static. Mirror the
    // `get_literal_value` each-shadow guard: an each ITEM is always reactive
    // (matching the `BindingKind::EachItem` rule below); an each INDEX uses
    // its analyzer-computed reactivity. Innermost context wins (rev()).
    //
    // A `{@const}` or snippet parameter in the block being visited shadows the
    // loop variable in the other direction, and this loop is keyed by name too.
    if !context.state.each_shadowing_names.contains_key(name) {
        for c in context.state.each_binding_context.iter().rev() {
            if c.item_name == name {
                return true;
            }
            if !c.index_name.is_empty() && c.index_name == name {
                return c.index_reactive;
            }
        }
    }

    // A name assigned after a top-level `await` is written inside the `$.run`
    // block, so it holds nothing at first render however constant its
    // initializer is. Upstream models this as `binding.blocker` and keeps the
    // `template_effect` (with the `$$promises[n]` dependency) rather than
    // folding the read into a one-shot write.
    if context.state.blocker_map.borrow().contains_key(name)
        || context.state.const_blocker_map.borrow().contains_key(name)
    {
        return true;
    }

    // Replay Phase 2's scope-correct resolution for this reference.
    // A template declaration (`{@const}` / `{#await}`) that shadows a
    // component-scope binding is invisible to the name-based lookups
    // below, which would report the outer (reactive) binding and
    // force an unnecessary template_effect. `let:` bindings are
    // excluded: their reactivity is decided by whether the directive's
    // transform is installed (see the `BindingKind::Let` arm below),
    // not by the binding itself.
    let by_position = start
        .and_then(|start| context.state.scope_root.binding_at_reference(name, start))
        .filter(|b| {
            !matches!(
                b.kind,
                crate::compiler::phases::phase2_analyze::scope::BindingKind::Let
            )
        });

    // Check if identifier has a transform registered (e.g., @const, snippet parameter)
    // Identifiers with transforms are derived values that need reactive tracking,
    // BUT only if the transform has is_reactive=true.
    // This check comes FIRST because @const creates both a binding (Normal) and a transform,
    // but the transform indicates it's a derived value needing reactive tracking.
    //
    // EXCEPTION: Derived bindings always have transforms (for $.get() wrapping),
    // but their reactivity depends on whether their dependencies are known constants.
    // For Derived bindings, skip this early return and fall through to the
    // detailed binding kind check below. State/RawState are excepted for the
    // same reason: upstream decides the READ from `scope.evaluate`, never from
    // the lowered declaration form, so `accessors` (which `customElement` turns
    // on) must not make a never-written `$state(1)` read reactive.
    if let Some(transform) = context.state.transform.get(name) {
        use crate::compiler::phases::phase2_analyze::scope::BindingKind;

        // Resolve the binding this reference actually refers to. `get_binding`
        // walks the root-scope-polluted map, which prefers an OUTER same-named
        // binding; when an in-scope `{@const}` shadows it, that resolves to the
        // outer binding instead of the `{@const}`.
        let resolved = by_position.or_else(|| context.state.get_binding(name));

        // Check if this is a Derived/State binding - if so, skip the early
        // return and fall through to the detailed binding kind check below.
        let is_derived = resolved.is_some_and(|b| {
            matches!(
                b.kind,
                BindingKind::Derived | BindingKind::State | BindingKind::RawState
            )
        });
        if !is_derived {
            // For Template bindings (@const), check if the initial value is known
            // instead of blindly using transform.is_reactive.
            // This matches the official Svelte compiler's scope.evaluate() behavior.
            if let Some(binding) = resolved
                && matches!(binding.kind, BindingKind::Template)
            {
                // A function-valued `{@const}` (`{@const f = (e) => …}`)
                // mirrors upstream's `!binding.is_function()` term in
                // Identifier.js: reading it is not reactive state, so a
                // component prop `onclick={f}` is emitted as a plain
                // `onclick: $.get(f)` value rather than a getter.
                if binding.is_function() {
                    return false;
                }
                if let Some(initial_json) = binding.initial_json() {
                    return !is_expression_known_json(initial_json, context);
                }
                // No initial stored → conservatively treat as reactive
                return true;
            }
            // Use the is_reactive flag from the transform
            // Non-reactive transforms (like unkeyed each block index) should not be treated as reactive
            return transform.is_reactive;
        }
    }
    if let Some(binding) = by_position.or_else(|| context.state.get_binding(name)) {
        use crate::compiler::phases::phase2_analyze::scope::BindingKind;

        // Match Svelte's logic from Identifier.js (lines 95-101):
        // has_state ||= binding.kind !== 'static' &&
        //     (binding.kind === 'prop' || ... || !binding.is_function()) &&
        //     !context.state.scope.evaluate(node).is_known;

        // Static bindings are never reactive
        if matches!(binding.kind, BindingKind::Static) {
            return false;
        }

        // Bindings that are always reactive (props, stores, each items, etc.)
        // These don't go through the is_known check because their values
        // are inherently dynamic/external.
        if matches!(
            binding.kind,
            BindingKind::Prop
                | BindingKind::BindableProp
                | BindingKind::RestProp
                | BindingKind::Store
                | BindingKind::StoreSub
                | BindingKind::EachItem
                | BindingKind::SnippetParam
        ) {
            return true;
        }

        // Let directive bindings (let:thing) are only reactive when
        // they have a corresponding transform registered. If there's
        // no transform, it means we're in a context where the let
        // directive doesn't apply (e.g., a named slot), so the binding
        // is effectively an undefined/static reference.
        if matches!(binding.kind, BindingKind::Let) {
            return context.state.transform.contains_key(name);
        }

        // For Derived bindings, check if the derived value is "known"
        // (i.e., its dependencies are all non-reactive constants).
        // This matches the official Svelte compiler's scope.evaluate() behavior
        // where $derived(expr) is known if `expr` only depends on known values.
        if matches!(binding.kind, BindingKind::Derived) {
            if binding.reassigned || binding.mutated {
                return true;
            }
            // The stored `$derived` argument approximates scope.evaluate().is_known:
            // a known value is effectively constant → not reactive.
            return !is_binding_initial_known(binding, context);
        }

        // For Template bindings (@const tag), apply the same scope.evaluate()
        // logic as Derived bindings. @const values are wrapped in
        // $.derived_safe_equal() and accessed via $.get(), but their reactivity
        // depends on whether their initial expression depends on reactive state.
        // E.g., `@const bar = 'world'` → is_known=true (non-reactive)
        //        `@const doubled = count * 2` → is_known depends on `count`
        if matches!(binding.kind, BindingKind::Template) {
            // Function-valued `{@const}` mirrors upstream's
            // `!binding.is_function()` term (see the Template branch
            // above): a read of it is not reactive state.
            if binding.is_function() {
                return false;
            }
            if let Some(initial_json) = binding.initial_json() {
                return !is_expression_known_json(initial_json, context);
            }
            // If no initial or couldn't parse, conservatively treat as reactive
            return true;
        }

        // For State/RawState bindings in runes mode (immutable=true) with no initial
        // value AT ALL (i.e., `$state()` called with no args):
        // - is_state_source = false (not reassigned)
        // - initial_node_type = None (no arg expression → compiles to `void 0`)
        // - The binding effectively compiles to `undefined`, which is a known constant.
        // → treat as non-reactive (is_known = true).
        //
        // IMPORTANT: Only apply when initial_node_type is None (no argument),
        // NOT when initial_is_defined is false. The latter can be false for
        // `$state(member.expr)` where the arg might evaluate to undefined at
        // runtime, but the binding is still reactive via $.proxy() wrapping.
        // A `$state()` with no argument compiles to `void 0`, which
        // `scope.evaluate` reports as a known value, so its read is not reactive
        // state unless the binding is written. Reading `is_state_source` here
        // instead makes the answer depend on how the DECLARATION was lowered,
        // and `accessors` — which `customElement` forces on — sets it for every
        // `$state`. Only `initial_node_type == None` qualifies, not
        // `initial_is_defined == false`, which also holds for `$state(m.x)`.
        if matches!(binding.kind, BindingKind::State | BindingKind::RawState)
            && binding.initial_node_type.is_none()
            && !binding.reassigned
            && !binding.mutated
        {
            return false;
        }

        // For State, RawState, Derived, and Normal bindings:
        // Match Svelte's logic: has_state is true when:
        //   binding.kind !== 'static' &&
        //   (binding.kind === 'prop' || ... || !binding.is_function()) &&
        //   !context.state.scope.evaluate(node).is_known
        //
        // The official compiler uses scope.evaluate() to determine if a
        // binding's value is "known" at compile time. Even $state bindings
        // can be "known" if they're never updated (reassigned/mutated) and
        // their initial value is a known literal. For example:
        //   let y = $state('y1')  // never reassigned -> is_known = true
        //   let x = $state('x1')  // reassigned via x = 'x2' -> is_known = false
        //
        // We approximate scope.evaluate().is_known by checking:
        // 1. For const/let declarations with literal initial values -> is_known = true if never reassigned/mutated
        // 2. For imports -> is_known = false (we don't know what they'll return)
        if !binding.is_function() {
            use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;

            // Check if this is a declaration with a known value
            // (approximation of scope.evaluate().is_known)
            // Both const and let declarations can be "known" if they:
            // - Are never reassigned
            // - Are never mutated
            // - Have an initial value that's a literal or known value
            //   (includes undefined identifier: `let x = undefined`)
            //   Note: initial_is_defined is NOT required here because
            //   `undefined` is a compile-time constant even if it's falsy.
            //   The shared evaluator handles a missing initializer as unknown.
            let decl_known_eligible = matches!(
                binding.declaration_kind,
                DeclarationKind::Const | DeclarationKind::Let
            ) && !binding.reassigned
                && !binding.mutated;
            let is_known = decl_known_eligible && initial_is_non_reactive(binding, context);

            // has_state is true when the value is NOT known at compile time
            return !is_known;
        }

        return false;
    }
    // $$props and $$restProps are always reactive - they change when props change.
    // They don't have bindings or transforms because they are generated variables,
    // but they reference reactive state (component props).
    if name == "$$props" || name == "$$restProps" {
        return true;
    }

    // Unknown identifier - conservatively assume non-reactive
    // (could be a global or module-level binding)
    false
}

/// Global functions whose result depends only on their arguments.
const PURE_GLOBALS: &[&str] = &[
    "encodeURIComponent",
    "decodeURIComponent",
    "encodeURI",
    "decodeURI",
    "parseInt",
    "parseFloat",
    "isNaN",
    "isFinite",
    "String",
    "Number",
    "Boolean",
    "Array",
    "Object",
    "JSON",
];

/// Objects whose methods depend only on their arguments (`Math.max(…)`).
const PURE_OBJECTS: &[&str] = &["Math", "JSON", "Object", "Array", "String", "Number"];

/// Typed counterpart of `has_reactive_state_json`, arm for arm, so the answer
/// can be given without materializing the expression as JSON.
///
/// `None` means the walk met a shape it has no typed answer for — the caller
/// falls back to the JSON walk for the whole expression rather than guessing.
fn typed_has_reactive_state(
    node: &crate::ast::typed_expr::JsNode,
    arena: &crate::ast::arena::ParseArena,
    context: &ComponentContext,
) -> Option<bool> {
    use crate::ast::typed_expr::JsNode;

    match node {
        JsNode::Identifier { name, start, .. } => Some(identifier_has_reactive_state(
            name.as_str(),
            Some(*start),
            context,
        )),
        JsNode::Literal { .. } => Some(false),
        // Serializes to a bare JSON `null`, which the JSON walk rejects before
        // it reads a type.
        JsNode::Null => Some(false),
        // `this` is a pure, non-reactive leaf; a member read rooted at it is
        // therefore governed by the property expression alone.
        JsNode::ThisExpression { .. } => Some(false),
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            // Upstream's MemberExpression visitor is `has_state ||= !is_pure(node)`.
            if !typed_is_pure(node, arena, context) {
                return Some(true);
            }
            let object = arena.get_js_node(*object);
            if typed_has_reactive_state(object, arena, context)? {
                return Some(true);
            }
            // A property of a local variable may be reactive itself (a class
            // instance with `$state` fields), which is not visible from here.
            if let JsNode::Identifier { name, .. } = object
                && context.state.get_binding(name.as_str()).is_some()
            {
                return Some(true);
            }
            if *computed && typed_has_reactive_state(arena.get_js_node(*property), arena, context)?
            {
                return Some(true);
            }
            Some(false)
        }
        JsNode::CallExpression {
            callee, arguments, ..
        } => {
            let callee = arena.get_js_node(*callee);
            let arguments = arena.get_js_children(*arguments);
            match callee {
                JsNode::Identifier { name, .. } => {
                    let name = name.as_str();
                    if PURE_GLOBALS.contains(&name) {
                        return typed_any_has_reactive_state(arguments, arena, context);
                    }
                    if let Some(binding) = context.state.get_binding(name) {
                        if binding.kind.is_reactive() {
                            return Some(true);
                        }
                    } else if context.state.transform.contains_key(name) {
                        return Some(true);
                    } else {
                        return typed_any_has_reactive_state(arguments, arena, context);
                    }
                }
                JsNode::MemberExpression { object, .. } => {
                    if let JsNode::Identifier { name, .. } = arena.get_js_node(*object)
                        && PURE_OBJECTS.contains(&name.as_str())
                    {
                        return typed_any_has_reactive_state(arguments, arena, context);
                    }
                }
                _ => {}
            }
            if typed_has_reactive_state(callee, arena, context)? {
                return Some(true);
            }
            typed_any_has_reactive_state(arguments, arena, context)
        }
        JsNode::NewExpression {
            callee, arguments, ..
        } => {
            if typed_has_reactive_state(arena.get_js_node(*callee), arena, context)? {
                return Some(true);
            }
            typed_any_has_reactive_state(arena.get_js_children(*arguments), arena, context)
        }
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            if typed_has_reactive_state(arena.get_js_node(*left), arena, context)? {
                return Some(true);
            }
            typed_has_reactive_state(arena.get_js_node(*right), arena, context)
        }
        JsNode::UnaryExpression { argument, .. } => {
            typed_has_reactive_state(arena.get_js_node(*argument), arena, context)
        }
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            for id in [test, consequent, alternate] {
                if typed_has_reactive_state(arena.get_js_node(*id), arena, context)? {
                    return Some(true);
                }
            }
            Some(false)
        }
        JsNode::TemplateLiteral { expressions, .. }
        | JsNode::SequenceExpression { expressions, .. } => {
            typed_any_has_reactive_state(arena.get_js_children(*expressions), arena, context)
        }
        JsNode::ChainExpression { expression, .. } => {
            typed_has_reactive_state(arena.get_js_node(*expression), arena, context)
        }
        // Only the right-hand side, matching the JSON walk.
        JsNode::AssignmentExpression { right, .. } => {
            typed_has_reactive_state(arena.get_js_node(*right), arena, context)
        }
        JsNode::ObjectExpression { properties, .. } => {
            for property in arena.get_js_children(*properties) {
                match property {
                    JsNode::SpreadElement { .. } => return Some(true),
                    JsNode::Property { value, .. } => {
                        if typed_has_reactive_state(arena.get_js_node(*value), arena, context)? {
                            return Some(true);
                        }
                    }
                    _ => return None,
                }
            }
            Some(false)
        }
        JsNode::ArrayExpression { elements, .. } => {
            for element in elements.iter().flatten() {
                if typed_has_reactive_state(element, arena, context)? {
                    return Some(true);
                }
            }
            Some(false)
        }
        JsNode::AwaitExpression { .. }
        | JsNode::UpdateExpression { .. }
        | JsNode::SpreadElement { .. } => Some(true),
        JsNode::ArrowFunctionExpression { .. } | JsNode::FunctionExpression { .. } => Some(false),
        _ => None,
    }
}

/// True as soon as any of `nodes` references reactive state; `None` propagates
/// the first shape the typed walk could not answer.
fn typed_any_has_reactive_state(
    nodes: &[crate::ast::typed_expr::JsNode],
    arena: &crate::ast::arena::ParseArena,
    context: &ComponentContext,
) -> Option<bool> {
    for node in nodes {
        if typed_has_reactive_state(node, arena, context)? {
            return Some(true);
        }
    }
    Some(false)
}

/// Internal helper that processes JSON values directly, avoiding serde_json::from_value overhead.
/// This eliminates expensive cloning and deserialization in recursive calls.
fn has_reactive_state_json(json_value: &serde_json::Value, context: &ComponentContext) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "Identifier" => {
            // Check if identifier is a reactive binding
            if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                let start = obj.get("start").and_then(|v| v.as_u64()).map(|v| v as u32);
                return identifier_has_reactive_state(name, start, context);
            }
            false
        }
        "MemberExpression" => {
            // Upstream's MemberExpression visitor is `has_state ||= !is_pure(node)`,
            // so a member read whose leftmost object is neither a literal nor an
            // unbound global (`[1, 2].length`, `({ a: 1 }).a`) is reactive.
            if !is_pure_json(json_value, context) {
                return true;
            }
            // Check the object part - recurse directly with JSON reference
            if let Some(object) = obj.get("object") {
                // First check if the object itself references reactive state
                if has_reactive_state_json(object, context) {
                    return true;
                }

                // If the object is an identifier that's a local variable (not a reactive binding),
                // the property access might still be reactive (e.g., `obj.value` where `value` is $state).
                // Since we can't statically determine if the property is reactive,
                // conservatively treat all member expressions on local variables as potentially reactive.
                if let Some(obj_inner) = object.as_object()
                    && obj_inner.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                    && let Some(name) = obj_inner.get("name").and_then(|n| n.as_str())
                {
                    // Check if this is a local binding (not a global)
                    if context.state.get_binding(name).is_some() {
                        // Local variable - property might be reactive (e.g., class instance with $state fields)
                        return true;
                    }
                }
            }
            // A computed member access (`obj[key]`, `({…})[key]`) evaluates its
            // property at runtime, which may itself read reactive state — so a
            // `{ … }[size]` where `size` is a reactive prop is reactive even
            // though the object literal is not. (The object-only check above
            // misses this.)
            if obj.get("computed").and_then(|v| v.as_bool()) == Some(true)
                && let Some(property) = obj.get("property")
                && has_reactive_state_json(property, context)
            {
                return true;
            }
            false
        }
        "CallExpression" => {
            // Check if callee is a pure global function that doesn't depend on reactive state
            // Pure functions like Math.*, encodeURIComponent, etc. are not reactive
            if let Some(callee) = obj.get("callee").and_then(|v| v.as_object()) {
                let callee_type = callee.get("type").and_then(|t| t.as_str());

                // Check for pure global functions like Math.max, encodeURIComponent, etc.
                if callee_type == Some("Identifier")
                    && let Some(name) = callee.get("name").and_then(|n| n.as_str())
                {
                    if PURE_GLOBALS.contains(&name) {
                        // Check if any arguments are reactive - recurse with JSON reference
                        if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                            for arg in args {
                                if has_reactive_state_json(arg, context) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    // Check if it's a binding or has a transform registered
                    // (snippet parameters have transforms but not bindings)
                    if let Some(binding) = context.state.get_binding(name) {
                        // Binding exists - check if reactive
                        if binding.kind.is_reactive() {
                            return true;
                        }
                    } else if context.state.transform.contains_key(name) {
                        // Has a transform (e.g., snippet parameter) - treat as reactive
                        return true;
                    } else {
                        // Unknown identifier without transform - could be a global, check arguments only
                        if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                            for arg in args {
                                if has_reactive_state_json(arg, context) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }
                // Check for pure member expressions like Math.max, Math.min, etc.
                if callee_type == Some("MemberExpression")
                    && let Some(object) = callee.get("object").and_then(|o| o.as_object())
                    && let Some("Identifier") = object.get("type").and_then(|t| t.as_str())
                    && let Some(obj_name) = object.get("name").and_then(|n| n.as_str())
                    && PURE_OBJECTS.contains(&obj_name)
                {
                    // Check if any arguments are reactive - recurse with JSON reference
                    if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                        for arg in args {
                            if has_reactive_state_json(arg, context) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            }

            // For other call expressions, check callee and arguments recursively.
            // A call is only reactive if the callee or arguments reference reactive state.
            // This handles cases like console.log('rendering') which should NOT be reactive.
            if let Some(callee) = obj.get("callee")
                && has_reactive_state_json(callee, context)
            {
                return true;
            }
            if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                for arg in args {
                    if has_reactive_state_json(arg, context) {
                        return true;
                    }
                }
            }
            false
        }
        "BinaryExpression" | "LogicalExpression" => {
            // Check left and right - recurse with JSON reference
            if let Some(left) = obj.get("left")
                && has_reactive_state_json(left, context)
            {
                return true;
            }
            if let Some(right) = obj.get("right")
                && has_reactive_state_json(right, context)
            {
                return true;
            }
            false
        }
        "UnaryExpression" => {
            if let Some(argument) = obj.get("argument") {
                return has_reactive_state_json(argument, context);
            }
            false
        }
        "ConditionalExpression" => {
            for field in ["test", "consequent", "alternate"] {
                if let Some(val) = obj.get(field)
                    && has_reactive_state_json(val, context)
                {
                    return true;
                }
            }
            false
        }
        "TemplateLiteral" => {
            if let Some(exprs) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in exprs {
                    if has_reactive_state_json(expr_val, context) {
                        return true;
                    }
                }
            }
            false
        }
        "ChainExpression" => {
            // Optional chaining (e.g., `item?.name`) - recurse into inner expression
            if let Some(expression) = obj.get("expression") {
                return has_reactive_state_json(expression, context);
            }
            false
        }
        "SequenceExpression" => {
            // Comma expressions (e.g., `(a, b)`) - check all sub-expressions
            if let Some(expressions) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in expressions {
                    if has_reactive_state_json(expr_val, context) {
                        return true;
                    }
                }
            }
            false
        }
        "AssignmentExpression" => {
            // Assignments (e.g., `a = b`) - check right side
            if let Some(right) = obj.get("right") {
                return has_reactive_state_json(right, context);
            }
            false
        }
        "Literal" => {
            // Literals are never reactive
            false
        }
        "AwaitExpression" => {
            // Await expressions are always treated as reactive (async)
            true
        }
        "ArrowFunctionExpression" | "FunctionExpression" => {
            // Function definitions are not reactive by themselves
            false
        }
        "ObjectExpression" => {
            // Check all property values. A spread member (`...rest`) has no
            // `value` field; upstream's SpreadElement visitor unconditionally
            // marks the enclosing expression `has_state` (it treats `{...x}`
            // like `{...x.values()}`), so a spread always makes the object
            // reactive.
            if let Some(properties) = obj.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
                    if prop.get("type").and_then(|t| t.as_str()) == Some("SpreadElement") {
                        return true;
                    }
                    if let Some(value) = prop.as_object().and_then(|p| p.get("value"))
                        && has_reactive_state_json(value, context)
                    {
                        return true;
                    }
                }
            }
            false
        }
        "ArrayExpression" => {
            // Check all elements
            if let Some(elements) = obj.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if has_reactive_state_json(elem, context) {
                        return true;
                    }
                }
            }
            false
        }
        "UpdateExpression" => {
            // ++, -- are always reactive (they mutate state)
            true
        }
        "NewExpression" => {
            // `new Foo(args)` — reactive only if the constructor or any argument
            // references reactive state. This mirrors the official Svelte compiler,
            // where NewExpression does not set has_call/has_state by itself.
            if let Some(callee) = obj.get("callee")
                && has_reactive_state_json(callee, context)
            {
                return true;
            }
            if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                for arg in args {
                    if has_reactive_state_json(arg, context) {
                        return true;
                    }
                }
            }
            false
        }
        "SpreadElement" => {
            // Upstream's SpreadElement analyze visitor unconditionally sets
            // `has_state = true` (and `has_call = true`) — `[...x]` is treated
            // like `[...x.values()]`, whose result is unknown at compile time.
            true
        }
        "MetaProperty" | "ThisExpression" => {
            // Leaves upstream: `is_reference` rejects both halves of
            // `import.meta`, and `this` is not a reference at all.
            false
        }
        "ImportExpression" => {
            // Not a call upstream — only its operands can be reactive.
            if let Some(source) = obj.get("source")
                && has_reactive_state_json(source, context)
            {
                return true;
            }
            if let Some(options) = obj.get("options")
                && has_reactive_state_json(options, context)
            {
                return true;
            }
            false
        }
        _ => {
            // Unknown expression type - conservatively assume reactive
            // (using set_text for a static expression is safe but slower,
            //  using textContent for a reactive expression is a correctness bug)
            true
        }
    }
}

/// Check if an expression (or its callee) is "pure" in the Svelte sense.
/// Pure means: the expression doesn't reference any local bindings.
/// Globals (identifiers without scope bindings) are pure.
/// Literals are pure.
/// MemberExpressions on pure objects are pure.
/// CallExpressions with pure callees and pure arguments are pure.
#[inline]
fn is_pure_json(json_value: &serde_json::Value, context: &ComponentContext) -> bool {
    let Some(obj) = json_value.as_object() else {
        // Primitives (strings, numbers, booleans, null) are pure
        return true;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return true;
    };

    match expr_type {
        "Literal" | "BooleanLiteral" | "NumericLiteral" | "StringLiteral" | "NullLiteral"
        | "BigIntLiteral" | "RegExpLiteral" => true,
        "Identifier" => {
            if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                // Rune identifiers ($effect, $state, etc.) are globals with no scope
                // binding, so they are treated as pure. This matches the official
                // Svelte compiler's is_pure() which considers globals (binding === null)
                // as safe. The $effect.tracking exception is in the MemberExpression case.
                // Check if it has a local binding - globals are pure
                context.state.get_binding(name).is_none()
                    && !context.state.transform.contains_key(name)
            } else {
                true
            }
        }
        "MemberExpression" => {
            // Special case: $effect.tracking is NOT pure, matching the official compiler's
            // check in is_pure(). This ensures $effect.tracking() gets has_call=true.
            if obj.get("computed").and_then(|v| v.as_bool()) != Some(true) {
                let is_tracking =
                    obj.get("property")
                        .and_then(|p| p.as_object())
                        .is_some_and(|p_obj| {
                            p_obj.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                                && p_obj.get("name").and_then(|n| n.as_str()) == Some("tracking")
                        });
                let is_effect_obj =
                    obj.get("object")
                        .and_then(|o| o.as_object())
                        .is_some_and(|o_obj| {
                            o_obj.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                                && o_obj.get("name").and_then(|n| n.as_str()) == Some("$effect")
                        });
                if is_tracking && is_effect_obj {
                    return false;
                }
            }

            // Walk to the leftmost object
            let mut left = json_value;
            while let Some(left_obj) = left.as_object()
                && left_obj.get("type").and_then(|t| t.as_str()) == Some("MemberExpression")
                && let Some(object) = left_obj.get("object")
            {
                left = object;
            }
            is_pure_json(left, context)
        }
        "CallExpression" => {
            // A call is pure if callee is pure and all args are pure
            if let Some(callee) = obj.get("callee")
                && !is_pure_json(callee, context)
            {
                return false;
            }
            if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                for arg in args {
                    let arg_val = if let Some(arg_obj) = arg.as_object()
                        && arg_obj.get("type").and_then(|t| t.as_str()) == Some("SpreadElement")
                    {
                        arg_obj.get("argument").unwrap_or(arg)
                    } else {
                        arg
                    };
                    if !is_pure_json(arg_val, context) {
                        return false;
                    }
                }
            }
            true
        }
        _ => false,
    }
}

/// Typed counterpart of [`is_pure_json`], arm for arm, so a member read's purity
/// can be decided without materializing the expression as JSON.
fn typed_is_pure(
    node: &crate::ast::typed_expr::JsNode,
    arena: &crate::ast::arena::ParseArena,
    context: &ComponentContext,
) -> bool {
    use crate::ast::typed_expr::JsNode;

    match node {
        JsNode::Literal { .. } | JsNode::Null => true,
        JsNode::Identifier { name, .. } => {
            context.state.get_binding(name.as_str()).is_none()
                && !context.state.transform.contains_key(name.as_str())
        }
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            if !*computed
                && let JsNode::Identifier { name: prop, .. } = arena.get_js_node(*property)
                && prop.as_str() == "tracking"
                && let JsNode::Identifier { name: base, .. } = arena.get_js_node(*object)
                && base.as_str() == "$effect"
            {
                return false;
            }
            let mut left = arena.get_js_node(*object);
            while let JsNode::MemberExpression { object, .. } = left {
                left = arena.get_js_node(*object);
            }
            typed_is_pure(left, arena, context)
        }
        JsNode::CallExpression {
            callee, arguments, ..
        } => {
            if !typed_is_pure(arena.get_js_node(*callee), arena, context) {
                return false;
            }
            arena.get_js_children(*arguments).iter().all(|argument| {
                let argument = match argument {
                    JsNode::SpreadElement { argument, .. } => arena.get_js_node(*argument),
                    other => other,
                };
                typed_is_pure(argument, arena, context)
            })
        }
        _ => false,
    }
}

/// Returns true if the JSON expression tree contains any Identifier that resolves to
/// a `State` or `RawState` binding.
///
/// Used by `has_call_json` to prevent compile-time folding of calls like
/// `Math.round(y)` where `y = $state(0)`. Although the binding has a known literal
/// initial value, it is runtime-reactive (e.g. updated via `bind:scrollY={y}`).
/// Upstream avoids the fold because Phase-2 adds every binding to
/// `expression.dependencies`, so `dependencies.size > 0` → `has_call = true`.
fn arg_contains_state_or_raw_state_binding(
    json_value: &serde_json::Value,
    context: &ComponentContext,
) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "Identifier" => {
            if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                return context.state.get_binding(name).is_some_and(|b| {
                    matches!(
                        b.kind,
                        crate::compiler::phases::phase2_analyze::scope::BindingKind::State
                            | crate::compiler::phases::phase2_analyze::scope::BindingKind::RawState
                    )
                });
            }
            false
        }
        _ => {
            // Recursively walk all JSON children.
            for (_key, val) in obj {
                if val.is_object() && arg_contains_state_or_raw_state_binding(val, context) {
                    return true;
                }
                if let Some(arr) = val.as_array() {
                    for item in arr {
                        if arg_contains_state_or_raw_state_binding(item, context) {
                            return true;
                        }
                    }
                }
            }
            false
        }
    }
}

/// Upstream's `dependencies.size > 0` term of the `has_call` rule: Phase 2 adds
/// every resolved identifier reference to `expression.dependencies`, so a call
/// with a pure callee is still reactive when the expression reads any binding —
/// even one whose value is a compile-time-known constant.
fn references_any_binding_json(json_value: &serde_json::Value, context: &ComponentContext) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "Identifier" => obj
            .get("name")
            .and_then(|v| v.as_str())
            .is_some_and(|name| context.state.get_binding(name).is_some()),
        // A non-computed member/key names a property, not a reference.
        "MemberExpression" | "Property" => {
            let (value_key, name_key) = if expr_type == "MemberExpression" {
                ("object", "property")
            } else {
                ("value", "key")
            };
            if let Some(value) = obj.get(value_key)
                && references_any_binding_json(value, context)
            {
                return true;
            }
            obj.get("computed").and_then(|v| v.as_bool()) == Some(true)
                && obj
                    .get(name_key)
                    .is_some_and(|name| references_any_binding_json(name, context))
        }
        _ => {
            for (_key, val) in obj {
                if val.is_object() && references_any_binding_json(val, context) {
                    return true;
                }
                if let Some(arr) = val.as_array()
                    && arr
                        .iter()
                        .any(|item| references_any_binding_json(item, context))
                {
                    return true;
                }
            }
            false
        }
    }
}

/// Internal helper that processes JSON values directly, avoiding serde_json::from_value overhead.
/// Returns true for calls that have reactive dependencies, matching the official Svelte compiler
/// behavior from CallExpression.js:
/// `if (!is_pure(node.callee, context) || context.state.expression.dependencies.size > 0)`
/// This means: a call has_call=true if the callee is non-pure OR if there are any dependencies
/// in the expression (even for pure calls like JSON.stringify(reactiveVar)).
#[inline]
fn has_call_json(json_value: &serde_json::Value, context: &ComponentContext) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "TaggedTemplateExpression" => {
            // Upstream TaggedTemplateExpression.js: has_call iff the TAG is not
            // pure — unlike CallExpression there is NO dependencies term, so
            // `String.raw`…${state}…`` stays unmemoized.
            if let Some(tag) = obj.get("tag")
                && !is_pure_json(tag, context)
            {
                return true;
            }
            if let Some(quasi) = obj.get("quasi")
                && has_call_json(quasi, context)
            {
                return true;
            }
            false
        }
        "CallExpression" => {
            // Match official Svelte compiler (CallExpression.js lines 264-273):
            //   if (!is_pure(node.callee, context) || context.state.expression.dependencies.size > 0) {
            //       context.state.expression.has_call = true;
            //   }
            // Only the CALLEE's purity matters — arguments are not part of this check.
            // A call is reactive if either:
            //   1. The callee references a local binding (not pure), or
            //   2. The containing expression has any reactive dependencies.
            if let Some(callee) = obj.get("callee")
                && !is_pure_json(callee, context)
            {
                return true;
            }
            // Even for pure callees, reactive dependencies in arguments make has_call true.
            // This includes State/RawState bindings even when their initial is a known literal,
            // because they are runtime-reactive (can change via bindings/effects at runtime).
            // Corresponds to upstream's `context.state.expression.dependencies.size > 0` check:
            // Phase-2 adds every binding reference to `dependencies`, so a pure call whose
            // argument is a $state variable still gets has_call=true upstream.
            has_reactive_state_json(json_value, context)
                || arg_contains_state_or_raw_state_binding(json_value, context)
                || references_any_binding_json(json_value, context)
        }
        "MemberExpression" => {
            if let Some(object) = obj.get("object")
                && has_call_json(object, context)
            {
                return true;
            }
            // Computed member (e.g. `arr[index_expr]`) — the computed key may contain calls.
            if obj.get("computed").and_then(|v| v.as_bool()) == Some(true)
                && let Some(property) = obj.get("property")
                && has_call_json(property, context)
            {
                return true;
            }
            false
        }
        "BinaryExpression" | "LogicalExpression" => {
            if let Some(left) = obj.get("left")
                && has_call_json(left, context)
            {
                return true;
            }
            if let Some(right) = obj.get("right")
                && has_call_json(right, context)
            {
                return true;
            }
            false
        }
        "UnaryExpression" => {
            if let Some(argument) = obj.get("argument") {
                return has_call_json(argument, context);
            }
            false
        }
        "ConditionalExpression" => {
            for field in ["test", "consequent", "alternate"] {
                if let Some(val) = obj.get(field)
                    && has_call_json(val, context)
                {
                    return true;
                }
            }
            false
        }
        "TemplateLiteral" => {
            if let Some(exprs) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in exprs {
                    if has_call_json(expr_val, context) {
                        return true;
                    }
                }
            }
            false
        }
        "ArrayExpression" => {
            if let Some(elements) = obj.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if has_call_json(elem, context) {
                        return true;
                    }
                }
            }
            false
        }
        "ObjectExpression" => {
            if let Some(properties) = obj.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
                    // A spread member (`...x`) is treated like `...x.values()`:
                    // upstream's SpreadElement visitor marks `has_call = true`.
                    if prop.get("type").and_then(|t| t.as_str()) == Some("SpreadElement") {
                        return true;
                    }
                    if let Some(prop_obj) = prop.as_object() {
                        // Check property value for calls
                        if let Some(value) = prop_obj.get("value")
                            && has_call_json(value, context)
                        {
                            return true;
                        }
                        // Check computed property key for calls (e.g., [createAttachmentKey()])
                        if prop_obj.get("computed").and_then(|v| v.as_bool()) == Some(true)
                            && let Some(key) = prop_obj.get("key")
                            && has_call_json(key, context)
                        {
                            return true;
                        }
                    }
                }
            }
            false
        }
        "SequenceExpression" => {
            // Check all expressions in the sequence for calls
            // e.g., (bar, $effect.tracking()) should return true because of the call
            if let Some(exprs) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in exprs {
                    if has_call_json(expr_val, context) {
                        return true;
                    }
                }
            }
            false
        }
        "NewExpression" => {
            // A `new` is not itself a call upstream, but its callee and arguments
            // are still walked, so `new Foo(bar())` does carry `has_call`.
            if let Some(callee) = obj.get("callee")
                && has_call_json(callee, context)
            {
                return true;
            }
            if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                for arg in args {
                    if has_call_json(arg, context) {
                        return true;
                    }
                }
            }
            false
        }
        "AssignmentExpression" => {
            if let Some(right) = obj.get("right") {
                return has_call_json(right, context);
            }
            false
        }
        "SpreadElement" => {
            // Upstream's SpreadElement visitor unconditionally sets
            // `has_call = true` (`[...x]` ≡ `[...x.values()]`).
            true
        }
        "ChainExpression" => {
            if let Some(expression) = obj.get("expression") {
                return has_call_json(expression, context);
            }
            false
        }
        _ => false,
    }
}

/// Internal helper that checks for MemberExpression in JSON values.
#[inline]
fn has_member_json(json_value: &serde_json::Value) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "MemberExpression" => true,
        "CallExpression" | "NewExpression" => {
            if let Some(callee) = obj.get("callee")
                && has_member_json(callee)
            {
                return true;
            }
            if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                for arg in args {
                    if has_member_json(arg) {
                        return true;
                    }
                }
            }
            false
        }
        "BinaryExpression" | "LogicalExpression" => {
            if let Some(left) = obj.get("left")
                && has_member_json(left)
            {
                return true;
            }
            if let Some(right) = obj.get("right")
                && has_member_json(right)
            {
                return true;
            }
            false
        }
        "UnaryExpression" => {
            if let Some(argument) = obj.get("argument") {
                return has_member_json(argument);
            }
            false
        }
        "ConditionalExpression" => {
            for field in ["test", "consequent", "alternate"] {
                if let Some(val) = obj.get(field)
                    && has_member_json(val)
                {
                    return true;
                }
            }
            false
        }
        "TemplateLiteral" => {
            if let Some(exprs) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in exprs {
                    if has_member_json(expr_val) {
                        return true;
                    }
                }
            }
            false
        }
        "ArrayExpression" => {
            if let Some(elements) = obj.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if has_member_json(elem) {
                        return true;
                    }
                }
            }
            false
        }
        "ObjectExpression" => {
            if let Some(properties) = obj.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
                    if let Some(value) = prop.as_object().and_then(|p| p.get("value"))
                        && has_member_json(value)
                    {
                        return true;
                    }
                }
            }
            false
        }
        "SequenceExpression" => {
            if let Some(exprs) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in exprs {
                    if has_member_json(expr_val) {
                        return true;
                    }
                }
            }
            false
        }
        "AssignmentExpression" => {
            for field in ["left", "right"] {
                if let Some(val) = obj.get(field)
                    && has_member_json(val)
                {
                    return true;
                }
            }
            false
        }
        _ => false,
    }
}

/// Check if an expression contains an await expression.
///
/// Returns true if the expression contains an AwaitExpression at any level.
#[inline]
pub fn expression_has_await(expr: &crate::ast::js::Expression) -> bool {
    // Leaf short-circuit avoids materializing a typed leaf as JSON.
    if is_call_member_await_free_leaf(expr) {
        return false;
    }
    has_await_json(expr.as_json())
}

/// Type-dispatch fast path used by expression-property queries to skip the
/// full `as_json()` serialization for expressions that can't
/// possibly contain a CallExpression / MemberExpression /
/// AwaitExpression.
///
/// Only types listed here are leaves in *all three* predicates — a
/// `MemberExpression` for instance is a leaf for `has_call` /
/// `has_await` but not for `has_member`, so it's intentionally
/// excluded.
///
/// `node_type()` is O(1) for both `Expression::Typed` (enum dispatch)
/// and `Expression::Value` (single HashMap lookup) — no allocation.
#[inline]
fn is_call_member_await_free_leaf(expr: &crate::ast::js::Expression) -> bool {
    matches!(
        expr.node_type(),
        Some(
            "Identifier"
                | "PrivateIdentifier"
                | "Literal"
                | "ThisExpression"
                | "Super"
                | "MetaProperty"
        )
    )
}

/// Internal helper that checks for AwaitExpression in JSON values.
#[inline]
fn has_await_json(json_value: &serde_json::Value) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "AwaitExpression" => true,
        "CallExpression" | "NewExpression" => {
            if let Some(callee) = obj.get("callee")
                && has_await_json(callee)
            {
                return true;
            }
            if let Some(args) = obj.get("arguments").and_then(|v| v.as_array()) {
                for arg in args {
                    if has_await_json(arg) {
                        return true;
                    }
                }
            }
            false
        }
        "MemberExpression" => {
            if let Some(object) = obj.get("object") {
                return has_await_json(object);
            }
            false
        }
        "BinaryExpression" | "LogicalExpression" => {
            if let Some(left) = obj.get("left")
                && has_await_json(left)
            {
                return true;
            }
            if let Some(right) = obj.get("right")
                && has_await_json(right)
            {
                return true;
            }
            false
        }
        "UnaryExpression" => {
            if let Some(argument) = obj.get("argument") {
                return has_await_json(argument);
            }
            false
        }
        "ConditionalExpression" => {
            for field in ["test", "consequent", "alternate"] {
                if let Some(val) = obj.get(field)
                    && has_await_json(val)
                {
                    return true;
                }
            }
            false
        }
        "TemplateLiteral" => {
            if let Some(exprs) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in exprs {
                    if has_await_json(expr_val) {
                        return true;
                    }
                }
            }
            false
        }
        "ArrayExpression" => {
            if let Some(elements) = obj.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if has_await_json(elem) {
                        return true;
                    }
                }
            }
            false
        }
        "ObjectExpression" => {
            if let Some(properties) = obj.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
                    if let Some(value) = prop.as_object().and_then(|p| p.get("value"))
                        && has_await_json(value)
                    {
                        return true;
                    }
                }
            }
            false
        }
        "SequenceExpression" => {
            if let Some(expressions) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in expressions {
                    if has_await_json(expr_val) {
                        return true;
                    }
                }
            }
            false
        }
        _ => false,
    }
}

/// Is a binding's stored initializer a compile-time known value — upstream's
/// `scope.evaluate(binding.initial).is_known`?
///
/// `Binding::initial` carries two encodings: the initializer node's JSON, or —
/// when that initializer is a literal — the literal's own source text. A parse
/// that does not yield an object is therefore the literal form, not a failure,
/// and a literal is known by construction (#3228).
fn is_binding_initial_known(
    binding: &crate::compiler::phases::phase2_analyze::scope::Binding,
    context: &ComponentContext,
) -> bool {
    evaluate_binding_initial(
        &ClientEvalScope {
            context,
            converted: false,
        },
        binding,
        0,
    )
    .is_known()
}

/// `EvalScope` for the client transform: the same `scope.evaluate` walk the
/// server runs, with Phase 2's reference-position resolution in place of the
/// server's scope-index chain.
struct ClientEvalScope<'a, 'b> {
    context: &'a ComponentContext<'b>,
    converted: bool,
}

impl EvalScope for ClientEvalScope<'_, '_> {
    fn evaluate_override(&self, node: &serde_json::Value, _depth: u8) -> Option<Evaluation> {
        if self.converted
            && self.context.state.options.dev
            && node.get("type").and_then(|ty| ty.as_str()) == Some("BinaryExpression")
            && node
                .get("operator")
                .and_then(|operator| operator.as_str())
                .is_some_and(|operator| matches!(operator, "===" | "!==" | "==" | "!="))
        {
            // The client visitor has already lowered a dev equality to a
            // runtime helper call, which upstream's evaluator cannot fold.
            return Some(Evaluation::unknown());
        }
        None
    }

    fn identifier_has_binding(&self, name: &str) -> bool {
        self.context.state.get_binding(name).is_some()
            || self.context.state.transform.contains_key(name)
    }

    fn evaluate_identifier(&self, node: &serde_json::Value, name: &str, depth: u8) -> Evaluation {
        // The converted template expression reads the transform's runtime
        // value, not the source binding's initializer. Keep this guard inside
        // the evaluator so it also covers transformed identifiers nested in a
        // unary, binary or template expression. Initializers are evaluated
        // with `converted: false` below and therefore still recurse normally.
        if self.converted && self.context.state.transform.contains_key(name) {
            return Evaluation::unknown();
        }

        // An enclosing `{#each … as item, index}` shadows any outer binding of
        // the same name, and the loop scope is not on `state.scope`.
        for c in self.context.state.each_binding_context.iter().rev() {
            if c.item_name == name {
                return Evaluation::unknown();
            }
            if !c.index_name.is_empty() && c.index_name == name {
                return Evaluation::single(EvalValue::NumberMarker);
            }
        }
        let reference_binding = node
            .get("start")
            .and_then(|v| v.as_u64())
            .and_then(|start| {
                self.context
                    .state
                    .scope_root
                    .binding_at_reference(name, start as u32)
            })
            .filter(|binding| {
                !self
                    .context
                    .state
                    .scope_is_within_snippet(binding.scope_index)
                    || self.context.state.scope_chain_contains(binding.scope_index)
            });
        let binding = match reference_binding {
            // Phase 2 resolves children of a component against its `let:`
            // scope before Phase 3 separates those children by slot. A named
            // slot does not inherit the component's `let:` binding, which the
            // client visitor represents by omitting its transform. In that
            // case the active client scope (typically the instance binding
            // shadowed by the default slot) is the same scope upstream
            // evaluates. Keep position-based resolution for active `let:`
            // transforms and every other template-local binding.
            Some(binding)
                if self.converted
                    && binding.kind
                        == crate::compiler::phases::phase2_analyze::scope::BindingKind::Let
                    && !self.context.state.transform.contains_key(name) =>
            {
                self.context
                    .state
                    .get_binding(name)
                    .filter(|candidate| {
                        candidate.kind
                            != crate::compiler::phases::phase2_analyze::scope::BindingKind::Let
                    })
                    .or(Some(binding))
            }
            Some(binding) => Some(binding),
            None => {
                // A converted/synthesized identifier may have lost its source
                // position. Name lookup is safe only when there is one binding:
                // `get_binding` deliberately falls back across every scope and
                // can otherwise substitute an outer constant for a `let:` or
                // another same-named template-local binding.
                self.context
                    .state
                    .scope_root
                    .bindings_by_name
                    .get(name)
                    .filter(|bindings| bindings.len() == 1)
                    .and_then(|_| self.context.state.get_binding(name))
                    .filter(|binding| {
                        self.context
                            .state
                            .evaluation_scope_contains(binding.scope_index)
                    })
            }
        };
        match binding {
            // `build_expression` converts the template expression, but an
            // initializer reached through scope resolution is still its source
            // AST. In particular, dev equality lowering does not apply inside
            // that initializer (#3570).
            Some(b) => evaluate_binding_initial(
                &ClientEvalScope {
                    context: self.context,
                    converted: false,
                },
                b,
                depth,
            ),
            None if name == "undefined" => Evaluation::single(EvalValue::Undefined),
            None => Evaluation::unknown(),
        }
    }

    fn binding_initial_is_props_id(&self, name: &str) -> bool {
        self.context.state.analysis.props_id.as_deref() == Some(name)
    }
}

/// Upstream's `scope.evaluate(node).is_known`.
fn is_expression_known_json(json_value: &serde_json::Value, context: &ComponentContext) -> bool {
    evaluate_estree(
        &ClientEvalScope {
            context,
            converted: false,
        },
        json_value,
        0,
    )
    .is_known()
}

/// Sanitize a template string by escaping special characters.
fn sanitize_template_string(s: &str) -> String {
    if !s.contains('\\') && !s.contains('`') && memchr::memmem::find(s.as_bytes(), b"${").is_none()
    {
        return s.to_string();
    }
    let result = s.replace('\\', "\\\\").replace('`', "\\`");
    if memchr::memmem::find(result.as_bytes(), b"${").is_some() {
        result.replace("${", "\\${")
    } else {
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;

    #[test]
    fn test_parse_directive_name_simple() {
        let arena = JsArena::new();
        let expr = parse_directive_name(&arena, "fade");
        match expr {
            JsExpr::Identifier(name) => assert_eq!(name, "fade"),
            _ => panic!("Expected identifier"),
        }
    }

    #[test]
    fn test_parse_directive_name_member() {
        let arena = JsArena::new();
        let expr = parse_directive_name(&arena, "custom.animation");
        match expr {
            JsExpr::Member(_) => {
                // Success - generated a member expression
            }
            _ => panic!("Expected member expression"),
        }
    }

    #[test]
    fn test_is_valid_identifier() {
        assert!(is_valid_identifier("foo"));
        assert!(is_valid_identifier("_bar"));
        assert!(is_valid_identifier("$baz"));
        assert!(is_valid_identifier("foo123"));
        assert!(!is_valid_identifier("123foo"));
        assert!(!is_valid_identifier("foo-bar"));
        assert!(!is_valid_identifier(""));
    }

    #[test]
    fn test_build_template_effect_simple() {
        let arena = JsArena::new();
        let statements = vec![b::stmt(
            &arena,
            b::call(&arena, b::id("console.log"), vec![b::string("test")]),
        )];

        let effect = build_template_effect(&arena, statements, None);

        // Should generate $.template_effect(() => { ... })
        match effect {
            JsStatement::Expression(expr) => {
                let JsExpressionStatement { expression, .. } = expr;
                match arena.get_expr(expression) {
                    JsExpr::Call(_) => {
                        // Success - generated a call expression
                    }
                    _ => panic!("Expected call expression"),
                }
            }
            _ => panic!("Expected expression statement"),
        }
    }

    #[test]
    fn test_build_template_effect_with_deps() {
        let arena = JsArena::new();
        let statements = vec![b::stmt(
            &arena,
            b::call(&arena, b::id("console.log"), vec![b::id("count")]),
        )];

        let deps = vec![b::id("count")];

        let effect = build_template_effect(&arena, statements, Some(deps));

        // Should generate $.template_effect_with_values(() => { ... }, [count])
        match effect {
            JsStatement::Expression(expr) => {
                let JsExpressionStatement { expression, .. } = expr;
                match arena.get_expr(expression) {
                    JsExpr::Call(_) => {
                        // Success - generated a call expression
                    }
                    _ => panic!("Expected call expression"),
                }
            }
            _ => panic!("Expected expression statement"),
        }
    }

    /// A reactive `count`, a compile-time-known `konst`, and a `Static` binding —
    /// enough for the identifier fast path to return both answers rather than a
    /// constant.
    fn reactive_state_bindings() -> Vec<Binding> {
        use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;

        let mut count = Binding::with_declaration_kind(
            "count".to_string(),
            BindingKind::State,
            DeclarationKind::Let,
            0,
        );
        // A `$state` with an initial node skips the "no argument at all" branch;
        // being reassigned makes it not compile-time known → reactive.
        count.initial_node_type = Some("Literal".to_string());
        count.reassigned = true;

        let mut konst = Binding::with_declaration_kind(
            "konst".to_string(),
            BindingKind::Normal,
            DeclarationKind::Const,
            0,
        );
        konst.initial = Some("42".to_string());

        let stat = Binding::new("stat".to_string(), BindingKind::Static, 0);

        vec![count, konst, stat]
    }

    /// Run `f` on the expression in `<Test a={…} />` with a context carrying
    /// `reactive_state_bindings`, under the serialize arena both walks resolve
    /// child ids through.
    fn with_reactive_state_context<R>(
        expr_src: &str,
        f: impl FnOnce(&crate::ast::js::Expression, &ComponentContext) -> R,
    ) -> R {
        use crate::compiler::ComponentAnalysis;
        use crate::compiler::phases::phase2_analyze::scope::{Scope, ScopeRoot};
        use std::rc::Rc;

        let input = format!("<Test a={{{expr_src}}} />");
        let allocator = oxc_allocator::Allocator::default();
        let mut result = crate::parse(&input, &allocator, Default::default()).unwrap();
        // `parse()` may leave attribute expressions deferred; both paths need a
        // resolved `Expression::Typed`.
        assert!(
            crate::compiler::phases::phase1_parse::resolve_lazy::resolve_lazy_expressions(
                &mut result,
                &input,
            )
            .is_none(),
            "`{expr_src}` should parse"
        );

        let expr = result
            .fragment
            .nodes
            .iter()
            .find_map(|node| match node {
                crate::ast::template::TemplateNode::Component(comp) => {
                    comp.attributes.iter().find_map(|attr| match attr {
                        crate::ast::template::Attribute::Attribute(a) => match &a.value {
                            crate::ast::template::AttributeValue::Expression(tag) => {
                                Some(&tag.expression)
                            }
                            _ => None,
                        },
                        _ => None,
                    })
                }
                _ => None,
            })
            .expect("expression attribute");

        let analysis = ComponentAnalysis::new("", &Default::default());
        let scope = Scope::new(None);
        let mut scope_root = ScopeRoot::new();
        for binding in reactive_state_bindings() {
            let name = binding.name.clone();
            let idx = scope_root.push_binding(binding);
            scope_root.scope.declarations.insert(name, idx);
        }
        let state = ComponentClientTransformState::new(
            &result.arena,
            &scope,
            &scope_root,
            &analysis,
            b::id("node"),
            Rc::new(TransformOptions::default()),
        );
        let context = ComponentContext::new(state, |_, _, _| TransformResult::None);

        crate::ast::arena::with_serialize_arena(&result.arena, || f(expr, &context))
    }

    /// `(typed, json)` answers of `expression_has_reactive_state` /
    /// `has_reactive_state_json`.
    fn both_has_reactive_state(expr_src: &str) -> (bool, bool) {
        with_reactive_state_context(expr_src, |expr, context| {
            (
                expression_has_reactive_state(expr, context),
                has_reactive_state_json(expr.as_json(), context),
            )
        })
    }

    /// Whether answering `expression_has_reactive_state` materialized the
    /// expression as JSON — i.e. whether it fell back to the JSON walk.
    fn typed_walk_materialized_json(expr_src: &str) -> bool {
        with_reactive_state_context(expr_src, |expr, context| {
            expression_has_reactive_state(expr, context);
            expr.json_is_materialized()
        })
    }

    #[test]
    fn typed_reactive_state_front_end_agrees_with_the_json_walk() {
        // (expression, expected answer) — expectations are spelled out as well
        // as compared, so a front end that always says `false` can't pass by
        // agreeing with an equally broken oracle.
        let cases: &[(&str, bool)] = &[
            // Identifier fast path — reactive binding.
            ("count", true),
            // Identifier fast path — compile-time-known binding.
            ("konst", false),
            // Identifier fast path — `Static` binding and unknown global.
            ("stat", false),
            ("Math", false),
            // Identifier fast path — the generated props objects.
            ("$$props", true),
            ("$$restProps", true),
            // Literal fast path (string / number / boolean / null).
            ("5", false),
            ("'text'", false),
            ("true", false),
            ("null", false),
            // MemberExpression — reactive object.
            ("count.foo", true),
            // MemberExpression — a non-reactive local binding, whose property
            // may still be reactive.
            ("konst.foo", true),
            ("stat.foo", true),
            // MemberExpression — no local binding at all.
            ("Math.PI", false),
            ("unknown.foo", false),
            // A member read whose leftmost object is an object / array /
            // function literal is impure, so upstream's `!is_pure(node)` makes
            // it reactive whatever the property is.
            ("({ a: 1 })[count]", true),
            ("({ a: 1 })[konst]", true),
            ("({ a: 1 }).count", true),
            ("[1, 2].length", true),
            ("(() => 1).name", true),
            // A LITERAL leftmost object is pure — the other side of that rule.
            ("'ab'.length", false),
            ("(1).toFixed", false),
            // Optional chaining wraps the member.
            ("count?.foo", true),
            // CallExpression — pure global / pure object callee, reactive only
            // through its arguments.
            ("String(count)", true),
            ("parseInt(konst)", false),
            ("Math.max(count, 1)", true),
            ("Math.max(1, 2)", false),
            // CallExpression — reactive binding as callee.
            ("count(1)", true),
            // CallExpression — non-reactive binding / unknown global callee.
            ("konst(1)", false),
            ("unknownFn(count)", true),
            ("unknownFn(1)", false),
            // NewExpression.
            ("new Foo(count)", true),
            ("new Foo(1)", false),
            // Operators and groupings.
            ("count + konst", true),
            ("konst + konst", false),
            ("!count", true),
            ("count ? 1 : 2", true),
            ("konst ? 1 : 2", false),
            ("(konst, count)", true),
            ("`${count}`", true),
            ("`${konst}`", false),
            // Only the right-hand side of an assignment is read.
            ("(count = 1)", false),
            ("(konst = count)", true),
            ("count++", true),
            ("await count", true),
            // Function bodies are not read.
            ("() => count", false),
            ("(function () { return count; })", false),
            // Object / array literals, including a spread and an array hole.
            ("({ a: count })", true),
            ("({ a: konst })", false),
            ("({ ...konst })", true),
            ("[konst, konst]", false),
            ("[, count]", true),
            ("[...konst]", true),
            // The leaf is non-reactive, but a member rooted at `this` is not
            // pure and therefore follows the dynamic member-expression path.
            ("this.foo", true),
            // Shapes the typed walk deliberately does NOT answer — these reach
            // the JSON fallback, so they agree by construction.
            ("tag`x`", true),
            ("(class {})", true),
        ];

        for (src, expected) in cases {
            let (typed, json) = both_has_reactive_state(src);
            assert_eq!(typed, json, "typed and JSON paths disagree on `{src}`");
            assert_eq!(
                &typed, expected,
                "unexpected has_reactive_state for `{src}`"
            );
        }
    }

    #[test]
    fn the_typed_walk_answers_covered_shapes_without_materializing_json() {
        for src in [
            "count",
            "5",
            "count.foo",
            "Math.max(count, 1)",
            "`${konst}`",
            "({ a: count })",
            "konst ? 1 : 2",
        ] {
            assert!(
                !typed_walk_materialized_json(src),
                "`{src}` should be answered off the typed AST"
            );
        }
        // Negative control: a shape the typed walk does not cover still
        // materializes, so the assertions above are measuring something.
        for src in ["tag`x`", "(class {})"] {
            assert!(
                typed_walk_materialized_json(src),
                "`{src}` should fall back to the JSON walk"
            );
        }
    }
}
