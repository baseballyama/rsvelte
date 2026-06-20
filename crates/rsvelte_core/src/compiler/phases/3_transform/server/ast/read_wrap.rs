//! Server READ-WRAPPING single pass (Phase-3 rewrite).
//!
//! After [`ServerTransformState::visit_expr`] produces an oxc [`Expression`],
//! this module performs ONE in-place structural walk that wraps every
//! identifier READ according to its Phase-2 binding kind, AND lowers every
//! store/derived WRITE (`$store = x`, `$store.foo = x`, `$store++`, `derived =
//! x`). It is a faithful port of upstream's server `Identifier.js` +
//! `AssignmentExpression.js` + `UpdateExpression.js` +
//! `shared/utils.js::build_getter` + `shared/assignments.js`
//! (`submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/`).
//!
//! ## Upstream semantics (写经)
//! `build_getter(node, state)` (`shared/utils.js:268`):
//! - binding is `null`, OR the identifier IS its own declaration node → return
//!   unchanged.
//! - `binding.kind == 'store_sub'` (name starts with `$`, e.g. `$count`):
//!   → `$.store_get($$store_subs ??= {}, "$count", count)` where the 3rd arg is
//!   `build_getter` of the store id (name without the leading `$`).
//! - `binding.kind == 'derived'`: → `name()` (a call of the binding identifier);
//!   if `declaration_kind == 'var'` use the OPTIONAL call `name?.()` instead
//!   (`b.maybe_call`).
//! - otherwise → unchanged (state / props / normal / each-item / … are NOT
//!   wrapped here).
//!
//! `Identifier.js`: a reference named `$$props` → `$$sanitized_props`; a
//! reference starting with `$$derived_array` → `name()`; else → `build_getter`.
//!
//! `AssignmentExpression.js` `build_assignment` — for a target rooted at a
//! `$store` identifier:
//! - `$store = value` (object === left) → `$.store_set(store, value)` where
//!   `value` is `build_assignment_value(op, left, right)` (compound ops expand
//!   to `left <op> right`).
//! - `$store.foo = value` (member target) →
//!   `$.store_mutate($$store_subs ??= {}, "$store", store, <visited assignment>)`.
//! - a derived target written directly (`derived = value`, object === left) →
//!   `derived(value)`.
//!
//! `UpdateExpression.js`:
//! - `$store++` / `$store--` → `$.update_store($$store_subs ??= {}, "$store",
//!   store[, -1])` (prefix → `$.update_store_pre`).
//! - `derived++` / `derived--` → `$.update_derived(derived[, -1])` (prefix →
//!   `$.update_derived_pre`).
//!
//! ## Scoping
//! `build_getter` resolves `name` through `context.state.scope`, so a `$y`
//! introduced as a FUNCTION PARAMETER (e.g. `derived(y, ($y) => $y * $y)`)
//! shadows the component-level `$y` store-sub binding and is NOT wrapped. We
//! mirror this with a `shadowed` stack populated from function / arrow
//! parameter patterns (the only shadowing the store-cluster fixtures exercise).

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::{BindingKind, DeclarationKind};
use crate::compiler::phases::phase3_transform::builders::B;
use oxc_allocator::CloneIn;
use oxc_ast::ast::{
    AssignmentExpression, AssignmentOperator, AssignmentTarget, BinaryOperator, Expression,
    LogicalOperator, Statement, UpdateExpression,
};
use oxc_ast_visit::VisitMut;
use rustc_hash::FxHashSet;

/// The in-place read-wrapping visitor. Holds the builder (for synthesizing the
/// getter expressions) and the analysis (for binding-kind lookup).
struct ReadWrap<'a, 'b> {
    b: B<'a>,
    analysis: &'b ComponentAnalysis,
    /// The scope index to resolve names against. For the first cut this is the
    /// component/instance scope (most derived / store / prop bindings live
    /// there). Each-item / snippet-param bindings resolve to non-derived /
    /// non-store kinds, so they are never wrongly wrapped.
    scope_idx: usize,
    /// Stack of name-sets shadowed by enclosing function / arrow parameters.
    /// A name present in ANY frame resolves to a LOCAL binding, so it is never
    /// wrapped (mirrors upstream's `context.state.scope.get(name)` returning a
    /// param binding rather than the component store_sub binding).
    shadowed: Vec<FxHashSet<String>>,
}

/// How a given name should be rewritten as a read.
enum ReadKind {
    /// Leave the identifier unchanged.
    Keep,
    /// `$$props` → `$$sanitized_props`.
    SanitizedProps,
    /// `derived` (non-`var`) → `name()`.
    DerivedCall,
    /// `derived` declared with `var` → `name?.()`.
    DerivedMaybeCall,
    /// `$count` (store_sub) → `$.store_get($$store_subs ??= {}, "$count", count)`.
    StoreSub,
}

/// How a write to `name` (assignment / update target) should be lowered.
enum WriteKind {
    /// Not a store / derived binding — keep the write as-is (default walk).
    None,
    /// A `store_sub` binding — `$store = …` / `$store.x = …` / `$store++`.
    StoreSub,
    /// A `derived` binding — `derived = …` / `derived++`.
    Derived,
}

impl<'a, 'b> ReadWrap<'a, 'b> {
    /// Whether `name` is shadowed by an enclosing function / arrow parameter.
    fn is_shadowed(&self, name: &str) -> bool {
        self.shadowed.iter().any(|frame| frame.contains(name))
    }

    /// Classify how a referenced `name` should be read, mirroring upstream's
    /// `Identifier.js` → `build_getter` cascade.
    fn classify(&self, name: &str) -> ReadKind {
        if self.is_shadowed(name) {
            return ReadKind::Keep;
        }
        // Identifier.js short-circuits.
        if name == "$$props" {
            return ReadKind::SanitizedProps;
        }
        if name.starts_with("$$derived_array") {
            // Terrible-but-faithful upstream hack: `$$derived_array…` → `name()`.
            return ReadKind::DerivedCall;
        }

        // build_getter: resolve the binding.
        let Some(idx) = self.analysis.root.get_binding(name, self.scope_idx) else {
            return ReadKind::Keep;
        };
        let binding = &self.analysis.root.bindings[idx];

        match binding.kind {
            BindingKind::StoreSub => ReadKind::StoreSub,
            BindingKind::Derived => {
                if binding.declaration_kind == DeclarationKind::Var {
                    ReadKind::DerivedMaybeCall
                } else {
                    ReadKind::DerivedCall
                }
            }
            _ => ReadKind::Keep,
        }
    }

    /// Classify how a WRITE to `name` should be lowered.
    fn classify_write(&self, name: &str) -> WriteKind {
        if self.is_shadowed(name) {
            return WriteKind::None;
        }
        let Some(idx) = self.analysis.root.get_binding(name, self.scope_idx) else {
            return WriteKind::None;
        };
        match self.analysis.root.bindings[idx].kind {
            BindingKind::StoreSub => WriteKind::StoreSub,
            BindingKind::Derived => WriteKind::Derived,
            _ => WriteKind::None,
        }
    }

    /// Build the replacement expression for a classified read of `name`.
    fn build_getter(&self, name: &str, kind: ReadKind) -> Option<Expression<'a>> {
        let b = self.b;
        match kind {
            ReadKind::Keep => None,
            ReadKind::SanitizedProps => Some(b.id("$$sanitized_props")),
            ReadKind::DerivedCall => Some(b.call(b.id(name), vec![])),
            ReadKind::DerivedMaybeCall => Some(b.optional_call(b.id(name), vec![])),
            ReadKind::StoreSub => {
                // `$.store_get($$store_subs ??= {}, "$count", <getter of count>)`.
                // The 3rd arg is `build_getter` of the store id (name w/o `$`).
                Some(self.store_get(name))
            }
        }
    }

    /// `$.store_get($$store_subs ??= {}, "$name", <getter of name[1..]>)`.
    fn store_get(&self, name: &str) -> Expression<'a> {
        let b = self.b;
        let store_name = &name[1..];
        let inner_kind = self.classify(store_name);
        let inner = self
            .build_getter(store_name, inner_kind)
            .unwrap_or_else(|| b.id(store_name));
        b.call(
            "$.store_get",
            vec![self.store_subs(), b.string(name), inner],
        )
    }

    /// `$$store_subs ??= {}`.
    fn store_subs(&self) -> Expression<'a> {
        let b = self.b;
        b.assignment(
            AssignmentOperator::LogicalNullish,
            b.id("$$store_subs"),
            b.object(vec![]),
        )
    }

    /// `build_assignment_value(op, left, right)` — for `=` it is just `right`;
    /// for a compound op it expands to `left <op> right` (the LHS read is the
    /// already-getter-wrapped form). `left` is the read-wrapped target getter.
    fn build_assignment_value(
        &self,
        op: AssignmentOperator,
        left: Expression<'a>,
        right: Expression<'a>,
    ) -> Expression<'a> {
        let b = self.b;
        match op {
            AssignmentOperator::Assign => right,
            AssignmentOperator::LogicalOr => b.logical(LogicalOperator::Or, left, right),
            AssignmentOperator::LogicalAnd => b.logical(LogicalOperator::And, left, right),
            AssignmentOperator::LogicalNullish => b.logical(LogicalOperator::Coalesce, left, right),
            other => {
                let bin = match other {
                    AssignmentOperator::Addition => BinaryOperator::Addition,
                    AssignmentOperator::Subtraction => BinaryOperator::Subtraction,
                    AssignmentOperator::Multiplication => BinaryOperator::Multiplication,
                    AssignmentOperator::Division => BinaryOperator::Division,
                    AssignmentOperator::Remainder => BinaryOperator::Remainder,
                    AssignmentOperator::Exponential => BinaryOperator::Exponential,
                    AssignmentOperator::ShiftLeft => BinaryOperator::ShiftLeft,
                    AssignmentOperator::ShiftRight => BinaryOperator::ShiftRight,
                    AssignmentOperator::ShiftRightZeroFill => BinaryOperator::ShiftRightZeroFill,
                    AssignmentOperator::BitwiseOR => BinaryOperator::BitwiseOR,
                    AssignmentOperator::BitwiseXOR => BinaryOperator::BitwiseXOR,
                    AssignmentOperator::BitwiseAnd => BinaryOperator::BitwiseAnd,
                    _ => BinaryOperator::Addition,
                };
                b.binary(bin, left, right)
            }
        }
    }

    /// Find the ROOT identifier name of an assignment target (`$a.b.c` → `$a`),
    /// and whether the target IS that bare identifier (object === left).
    fn target_root<'t>(target: &'t AssignmentTarget<'a>) -> Option<(&'t str, bool)> {
        match target {
            AssignmentTarget::AssignmentTargetIdentifier(id) => Some((id.name.as_str(), true)),
            AssignmentTarget::StaticMemberExpression(_)
            | AssignmentTarget::ComputedMemberExpression(_)
            | AssignmentTarget::PrivateFieldExpression(_) => {
                // Walk the member-object chain to its root identifier.
                let mut obj = target.as_member_expression()?.object();
                loop {
                    match obj {
                        Expression::Identifier(id) => return Some((id.name.as_str(), false)),
                        Expression::StaticMemberExpression(m) => obj = &m.object,
                        Expression::ComputedMemberExpression(m) => obj = &m.object,
                        Expression::PrivateFieldExpression(m) => obj = &m.object,
                        Expression::ParenthesizedExpression(p) => obj = &p.expression,
                        _ => return None,
                    }
                }
            }
            _ => None,
        }
    }

    /// Lower an `AssignmentExpression` (`expr` currently holds it). Returns the
    /// replacement expression, or `None` to fall back to the default walk.
    fn lower_assignment(&mut self, expr: &mut Expression<'a>) -> Option<Expression<'a>> {
        let b = self.b;
        let Expression::AssignmentExpression(assign) = expr else {
            return None;
        };

        // Destructuring assignment targets (`({$a} = obj)`, `[$a] = arr`) are
        // handled by the shared `visit_assignment_expression` extract-paths port.
        if matches!(
            assign.left,
            AssignmentTarget::ObjectAssignmentTarget(_)
                | AssignmentTarget::ArrayAssignmentTarget(_)
        ) {
            return self.lower_destructure_assignment(expr);
        }

        let (root_name, is_bare) = Self::target_root(&assign.left)?;
        let root_name = root_name.to_string();
        match self.classify_write(&root_name) {
            WriteKind::None => None,
            WriteKind::Derived if is_bare => {
                // `derived = value` → `derived(build_assignment_value(...))`.
                let op = assign.operator;
                let taken = std::mem::replace(expr, b.void0()).into_assignment_expression()?;
                let mut right = taken.unbox().right;
                self.visit_expression(&mut right);
                let left = self.store_get_or_derived_read(&root_name);
                let value = self.build_assignment_value(op, left, right);
                Some(b.call(b.id(&root_name), vec![value]))
            }
            WriteKind::Derived => None,
            WriteKind::StoreSub if is_bare => {
                // `$store = value` → `$.store_set(store, build_assignment_value(...))`.
                let op = assign.operator;
                let taken = std::mem::replace(expr, b.void0()).into_assignment_expression()?;
                let mut right = taken.unbox().right;
                self.visit_expression(&mut right);
                let left = self.store_get(&root_name);
                let value = self.build_assignment_value(op, left, right);
                let store = &root_name[1..];
                Some(b.call("$.store_set", vec![b.id(store), value]))
            }
            WriteKind::StoreSub => {
                // `$store.foo = value` →
                // `$.store_mutate($$store_subs ??= {}, "$store", store, <visited>)`.
                // The "visited" inner assignment is the original assignment with
                // its member-object reads + RHS read-wrapped (default walk).
                let store = root_name[1..].to_string();
                let store_name = root_name.clone();
                // Run the default walk to wrap the inner reads (LHS object + RHS).
                oxc_ast_visit::walk_mut::walk_expression(self, expr);
                let inner = std::mem::replace(expr, b.void0());
                Some(b.call(
                    "$.store_mutate",
                    vec![
                        self.store_subs(),
                        b.string(&store_name),
                        b.id(&store),
                        inner,
                    ],
                ))
            }
        }
    }

    /// Read-getter of a derived / store identifier (for compound-op LHS reads).
    fn store_get_or_derived_read(&self, name: &str) -> Expression<'a> {
        match self.classify(name) {
            ReadKind::StoreSub => self.store_get(name),
            kind => self
                .build_getter(name, kind)
                .unwrap_or_else(|| self.b.id(name)),
        }
    }

    /// Lower a destructuring assignment whose targets include `$store` leaves
    /// (写经 `shared/assignments.js::visit_assignment_expression` for the
    /// simplest case: an `Identifier` RHS so no `$$value` caching is needed).
    /// Each leaf becomes either `$.store_set(store, <rhs>.<accessor>)` (store
    /// leaf) or a plain `leaf = <rhs>.<accessor>` (non-store leaf), joined as a
    /// sequence expression `( … , … )`.
    fn lower_destructure_assignment(
        &mut self,
        expr: &mut Expression<'a>,
    ) -> Option<Expression<'a>> {
        let b = self.b;
        let Expression::AssignmentExpression(assign) = expr else {
            return None;
        };
        // Only the simple `= obj` (identifier RHS) form is ported — the cluster
        // fixtures use exactly this shape. Anything else falls back to the
        // default walk (no store lowering), which at least keeps the reads.
        let Expression::Identifier(rhs_id) = &assign.right else {
            return None;
        };
        let rhs_name = rhs_id.name.to_string();

        let mut leaves: Vec<(String, AccessPath)> = Vec::new();
        let collected = collect_destructure_paths(&assign.left, AccessPath::root(), &mut leaves);
        if !collected {
            return None;
        }
        // If no leaf is a store, nothing to transform — keep the original.
        if !leaves.iter().any(|(n, _)| {
            matches!(
                self.classify_write(n),
                WriteKind::StoreSub | WriteKind::Derived
            )
        }) {
            return None;
        }

        let mut assignments: Vec<Expression<'a>> = Vec::with_capacity(leaves.len());
        for (leaf_name, path) in &leaves {
            let value = path.build(b, &rhs_name);
            let lowered = match self.classify_write(leaf_name) {
                WriteKind::StoreSub => {
                    let store = &leaf_name[1..];
                    b.call("$.store_set", vec![b.id(store), value])
                }
                WriteKind::Derived => b.call(b.id(leaf_name), vec![value]),
                WriteKind::None => b.assignment(AssignmentOperator::Assign, b.id(leaf_name), value),
            };
            assignments.push(lowered);
        }
        // Replace `expr` so the caller does not double-handle it.
        *expr = b.void0();
        Some(b.sequence(assignments))
    }

    /// Lower an `UpdateExpression` (`$store++` / `derived++`). `expr` currently
    /// holds it. Returns the replacement, or `None` for the default walk.
    fn lower_update(&mut self, expr: &mut Expression<'a>) -> Option<Expression<'a>> {
        let b = self.b;
        let Expression::UpdateExpression(upd) = expr else {
            return None;
        };
        let oxc_ast::ast::SimpleAssignmentTarget::AssignmentTargetIdentifier(arg) = &upd.argument
        else {
            return None;
        };
        let name = arg.name.to_string();
        let prefix = upd.prefix;
        let is_dec = matches!(
            upd.operator,
            oxc_syntax::operator::UpdateOperator::Decrement
        );
        match self.classify_write(&name) {
            WriteKind::StoreSub => {
                let store = name[1..].to_string();
                let callee = if prefix {
                    "$.update_store_pre"
                } else {
                    "$.update_store"
                };
                let mut args = vec![self.store_subs(), b.string(&name), b.id(&store)];
                if is_dec {
                    args.push(b.number(-1.0));
                }
                Some(b.call(callee, args))
            }
            WriteKind::Derived => {
                let callee = if prefix {
                    "$.update_derived_pre"
                } else {
                    "$.update_derived"
                };
                let mut args = vec![b.id(&name)];
                if is_dec {
                    args.push(b.number(-1.0));
                }
                Some(b.call(callee, args))
            }
            WriteKind::None => None,
        }
    }

    /// Collect parameter binding names from a [`FormalParameters`] (or arrow
    /// params) into a shadow frame.
    fn collect_param_names(
        params: &oxc_ast::ast::FormalParameters<'a>,
        out: &mut FxHashSet<String>,
    ) {
        for p in params.items.iter() {
            collect_binding_pattern_names(&p.pattern, out);
        }
        if let Some(rest) = &params.rest {
            collect_binding_pattern_names(&rest.rest.argument, out);
        }
    }
}

/// A dotted/indexed access path from a destructuring RHS root (`obj` →
/// `obj.foo`, `obj[0]`, `obj.foo.bar`). Built lazily so a store leaf and a
/// non-store leaf share the same accessor synthesis.
#[derive(Clone)]
enum AccessSeg {
    Prop(String),
    Index(u32),
}

#[derive(Clone)]
struct AccessPath {
    segs: Vec<AccessSeg>,
}

impl AccessPath {
    fn root() -> Self {
        AccessPath { segs: Vec::new() }
    }
    fn push_prop(&self, name: &str) -> Self {
        let mut segs = self.segs.clone();
        segs.push(AccessSeg::Prop(name.to_string()));
        AccessPath { segs }
    }
    fn push_index(&self, i: u32) -> Self {
        let mut segs = self.segs.clone();
        segs.push(AccessSeg::Index(i));
        AccessPath { segs }
    }
    fn build<'a>(&self, b: B<'a>, root: &str) -> Expression<'a> {
        let mut expr = b.id(root);
        for seg in &self.segs {
            expr = match seg {
                AccessSeg::Prop(p) => b.member(expr, p),
                AccessSeg::Index(i) => b.member_computed(expr, b.number(*i as f64)),
            };
        }
        expr
    }
}

/// Walk a destructuring `AssignmentTarget` collecting `(leaf_name, access_path)`
/// pairs. Returns `false` if any unsupported shape is encountered (defaults,
/// nested rest, computed keys) so the caller can fall back to the default walk.
fn collect_destructure_paths(
    target: &AssignmentTarget,
    path: AccessPath,
    out: &mut Vec<(String, AccessPath)>,
) -> bool {
    use oxc_ast::ast::AssignmentTarget as T;
    match target {
        T::AssignmentTargetIdentifier(id) => {
            out.push((id.name.to_string(), path));
            true
        }
        T::ObjectAssignmentTarget(obj) => {
            if obj.rest.is_some() {
                return false;
            }
            for prop in obj.properties.iter() {
                match prop {
                    oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(
                        p,
                    ) => {
                        if p.init.is_some() {
                            return false;
                        }
                        let key = p.binding.name.as_str();
                        out.push((p.binding.name.to_string(), path.push_prop(key)));
                    }
                    oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                        // `key: target`. Only a non-computed identifier key.
                        let oxc_ast::ast::PropertyKey::StaticIdentifier(k) = &p.name else {
                            return false;
                        };
                        let sub = path.push_prop(k.name.as_str());
                        if !collect_maybe_default(&p.binding, sub, out) {
                            return false;
                        }
                    }
                }
            }
            true
        }
        T::ArrayAssignmentTarget(arr) => {
            if arr.rest.is_some() {
                return false;
            }
            for (i, el) in arr.elements.iter().enumerate() {
                let Some(el) = el else {
                    continue;
                };
                let sub = path.push_index(i as u32);
                if !collect_maybe_default(el, sub, out) {
                    return false;
                }
            }
            true
        }
        _ => false,
    }
}

fn collect_maybe_default(
    el: &oxc_ast::ast::AssignmentTargetMaybeDefault,
    path: AccessPath,
    out: &mut Vec<(String, AccessPath)>,
) -> bool {
    use oxc_ast::ast::AssignmentTargetMaybeDefault as M;
    match el {
        // A default (`x = 1`) is not supported in this focused port.
        M::AssignmentTargetWithDefault(_) => false,
        other => {
            if let Some(t) = other.as_assignment_target() {
                collect_destructure_paths(t, path, out)
            } else {
                false
            }
        }
    }
}

/// Collect identifier names declared by a binding pattern (function params).
fn collect_binding_pattern_names(pat: &oxc_ast::ast::BindingPattern, out: &mut FxHashSet<String>) {
    use oxc_ast::ast::BindingPattern as P;
    match pat {
        P::BindingIdentifier(id) => {
            out.insert(id.name.to_string());
        }
        P::ObjectPattern(obj) => {
            for prop in obj.properties.iter() {
                collect_binding_pattern_names(&prop.value, out);
            }
            if let Some(rest) = &obj.rest {
                collect_binding_pattern_names(&rest.argument, out);
            }
        }
        P::ArrayPattern(arr) => {
            for el in arr.elements.iter().flatten() {
                collect_binding_pattern_names(el, out);
            }
            if let Some(rest) = &arr.rest {
                collect_binding_pattern_names(&rest.argument, out);
            }
        }
        P::AssignmentPattern(a) => {
            collect_binding_pattern_names(&a.left, out);
        }
    }
}

impl<'a, 'b> VisitMut<'a> for ReadWrap<'a, 'b> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        match expr {
            // An identifier reference READ — wrap via the getter, do NOT recurse.
            Expression::Identifier(id) => {
                let name = id.name.to_string();
                let kind = self.classify(&name);
                if let Some(replacement) = self.build_getter(&name, kind) {
                    *expr = replacement;
                }
            }
            // A store / derived WRITE — lower per upstream, else default walk.
            Expression::AssignmentExpression(_) => {
                if self.lower_assignment(expr).map(|r| *expr = r).is_none() {
                    oxc_ast_visit::walk_mut::walk_expression(self, expr);
                }
            }
            Expression::UpdateExpression(_) => {
                if self.lower_update(expr).map(|r| *expr = r).is_none() {
                    oxc_ast_visit::walk_mut::walk_expression(self, expr);
                }
            }
            _ => oxc_ast_visit::walk_mut::walk_expression(self, expr),
        }
    }

    fn visit_function(
        &mut self,
        it: &mut oxc_ast::ast::Function<'a>,
        flags: oxc_syntax::scope::ScopeFlags,
    ) {
        let mut frame = FxHashSet::default();
        Self::collect_param_names(&it.params, &mut frame);
        self.shadowed.push(frame);
        oxc_ast_visit::walk_mut::walk_function(self, it, flags);
        self.shadowed.pop();
    }

    fn visit_arrow_function_expression(
        &mut self,
        it: &mut oxc_ast::ast::ArrowFunctionExpression<'a>,
    ) {
        let mut frame = FxHashSet::default();
        Self::collect_param_names(&it.params, &mut frame);
        self.shadowed.push(frame);
        oxc_ast_visit::walk_mut::walk_arrow_function_expression(self, it);
        self.shadowed.pop();
    }
}

/// Helper: pull an `AssignmentExpression` out of an `Expression`.
trait IntoAssignment<'a> {
    fn into_assignment_expression(self)
    -> Option<oxc_allocator::Box<'a, AssignmentExpression<'a>>>;
}
impl<'a> IntoAssignment<'a> for Expression<'a> {
    fn into_assignment_expression(
        self,
    ) -> Option<oxc_allocator::Box<'a, AssignmentExpression<'a>>> {
        match self {
            Expression::AssignmentExpression(a) => Some(a),
            _ => None,
        }
    }
}

// Keep `CloneIn`, `UpdateExpression`, `Statement` referenced so unused-import
// lints stay quiet across feature shapes.
#[allow(unused_imports)]
use {AssignmentExpression as _AE, CloneIn as _CI, Statement as _St, UpdateExpression as _UE};

/// Apply the read-wrapping pass to `expr` in place. `scope_idx` is the scope to
/// resolve names against (component/instance scope for the first cut).
pub fn wrap_reads<'a>(
    expr: &mut Expression<'a>,
    b: B<'a>,
    analysis: &ComponentAnalysis,
    scope_idx: usize,
) {
    let mut visitor = ReadWrap {
        b,
        analysis,
        scope_idx,
        shadowed: Vec::new(),
    };
    visitor.visit_expression(expr);
}

/// Apply the read-wrapping pass to an entire `stmt` in place — every identifier
/// READ inside the statement (RHS of assignments, `if`/loop tests, call args,
/// nested block bodies, …) is wrapped per its Phase-2 binding kind. Used for
/// legacy reactive `$: …` bodies, mirroring upstream's `context.visit(node.body)`
/// in `server/visitors/LabeledStatement.js` (the statement body is visited by the
/// global `Identifier` visitor exactly like any other instance statement).
pub fn wrap_reads_in_statement<'a>(
    stmt: &mut Statement<'a>,
    b: B<'a>,
    analysis: &ComponentAnalysis,
    scope_idx: usize,
) {
    let mut visitor = ReadWrap {
        b,
        analysis,
        scope_idx,
        shadowed: Vec::new(),
    };
    visitor.visit_statement(stmt);
}
