//! Server READ-WRAPPING single pass (Phase-3 rewrite).
//!
//! After `ServerTransformState::visit_expr` produces an oxc [`Expression`],
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
    /// Stack of name-sets shadowed by enclosing function / arrow parameters AND
    /// by block / function-body local declarations. A name present in ANY frame
    /// resolves to a LOCAL binding, so it is never wrapped (mirrors upstream's
    /// `context.state.scope.get(name)` returning the nearest enclosing
    /// declaration rather than the component store_sub / derived binding).
    shadowed: Vec<FxHashSet<String>>,
    /// Names of LOCAL async `{const … = $derived(await …)}` bindings in scope.
    /// The instance/root scope used for `get_binding` is "polluted" with every
    /// block-scoped declaration, so a name with TWO bindings (e.g. a boundary
    /// `{const {length} = await …}` plain async const AND a nested `{const length
    /// = $derived(await …)}` derived) may resolve to the WRONG (non-derived) one.
    /// A name in this set is a known local derived → read as a CALL `name()`,
    /// winning over the ambiguous `get_binding` result. Scoped per fragment by the
    /// caller (saved/restored in `build_fragment_body`).
    local_derived: FxHashSet<String>,
    /// Stack of private-field-name sets (`#doubled`, …) that resolve to a
    /// `$derived` / `$derived.by` class field in the enclosing class. A member
    /// expression `<obj>.#name` whose private property is in the top frame is
    /// read-wrapped to a CALL `<obj>.#name()` (写经 server `MemberExpression.js`).
    /// Empty when not inside a runes-mode class with derived private fields.
    private_derived: Vec<FxHashSet<String>>,
    /// Set true while visiting the DIRECT expression of an `ExpressionStatement`,
    /// so a destructuring assignment that is the whole statement is treated as
    /// "standalone" (写経 upstream's `context.path.at(-1).type.endsWith('Statement')`
    /// — a standalone destructure-assignment IIFE omits the trailing `return $$value`).
    standalone_assign: bool,
    /// Component-wide `$$array` temp counter (写经 `scope.generate('$$array')`).
    /// `extract_paths` array-insert names are generated for EVERY destructuring
    /// assignment with an array sub-pattern, even one that ends up unchanged, so
    /// the counter must persist across assignments (the first array destructure
    /// takes `$$array`, the next `$$array_1`, …).
    array_counter: u32,
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
        // A known local async-`$derived` const wins over the ambiguous polluted
        // `get_binding` (which may resolve a same-named non-derived sibling).
        if self.local_derived.contains(name) {
            return ReadKind::DerivedCall;
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

    /// Whether `expr` is a member expression `<obj>.#field` whose private
    /// property resolves to a `$derived` / `$derived.by` field of the enclosing
    /// class (写经 server `MemberExpression.js`: runes-mode + `PrivateIdentifier`
    /// property + `state_fields.get('#name')` is `$derived` / `$derived.by`).
    fn is_private_derived_member(&self, expr: &Expression<'a>) -> bool {
        let Expression::PrivateFieldExpression(m) = expr else {
            return false;
        };
        let name = m.field.name.as_str();
        self.private_derived
            .last()
            .is_some_and(|frame| frame.contains(name))
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
        // Consume the standalone flag: it applies ONLY to the direct expression
        // of a statement. Any non-destructure assignment (or a nested RHS) clears
        // it so an inner destructure-assignment is correctly NON-standalone.
        let is_standalone = std::mem::replace(&mut self.standalone_assign, false);

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
            return self.lower_destructure_assignment(expr, is_standalone);
        }

        // Private-derived field WRITE: `this.#x = value` (a non-declaration write
        // to a `$derived` private field) → `this.#x(build_assignment_value(...))`
        // (写经 server `AssignmentExpression.js::build_assignment`, the
        // `field.type === '$derived'` + `PrivateIdentifier` branch). A constructor
        // field DECLARATION (`this.#x = $derived(...)`) is left as an assignment.
        if let AssignmentTarget::PrivateFieldExpression(pf) = &assign.left
            && matches!(pf.object, oxc_ast::ast::Expression::ThisExpression(_))
            && self
                .private_derived
                .last()
                .is_some_and(|frame| frame.contains(pf.field.name.as_str()))
            && !callee_is_field_rune_expr(&assign.right)
        {
            let field_name = format!("#{}", pf.field.name.as_str());
            let op = assign.operator;
            let taken = std::mem::replace(expr, b.void0()).into_assignment_expression()?;
            let mut taken = taken.unbox();
            self.visit_expression(&mut taken.right);
            // `build_assignment_value`: for compound ops the LHS read is the
            // already-call-wrapped private member (`this.#x()`).
            let left = b.call(b.member(b.this(), &field_name), vec![]);
            let value = self.build_assignment_value(op, left, taken.right);
            return Some(b.call(b.member(b.this(), &field_name), vec![value]));
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

    /// Lower a destructuring assignment whose targets include `$store` /
    /// `$derived` leaves (写经 `shared/assignments.js::visit_assignment_expression`).
    ///
    /// - An identifier RHS (`{$a} = obj`) needs no `$$value` cache; the result
    ///   is a sequence expression `( …, … )`.
    /// - A non-identifier RHS (`{$a} = {…}`) is cached in `$$value` and wrapped
    ///   in an IIFE `(($$value) => { …; [return $$value;] })(<rhs>)` — the
    ///   trailing `return $$value` is added only when the assignment is part of
    ///   an expression (NOT a standalone statement).
    /// - Array sub-patterns introduce `var $$array_N = $.to_array(<base>, <len>)`
    ///   inserts indexed by the leaf paths (写经 `extract_paths` `inserts`).
    fn lower_destructure_assignment(
        &mut self,
        expr: &mut Expression<'a>,
        is_standalone: bool,
    ) -> Option<Expression<'a>> {
        let b = self.b;
        // Bail to the default walk for any unsupported destructure shape
        // (defaults / rest / computed keys). A probe with a throwaway counter
        // first determines supportability + whether any leaf is a store/derived.
        let (supported, changed) = {
            let Expression::AssignmentExpression(assign) = expr else {
                return None;
            };
            let mut probe: Vec<(String, AccessPath)> = Vec::new();
            let mut probe_inserts: Vec<ArrayInsert> = Vec::new();
            let mut probe_next = 0u32;
            let ok = collect_destructure_paths(
                &assign.left,
                AccessPath::root_named("$$value"),
                &mut probe,
                &mut probe_inserts,
                &mut probe_next,
            );
            let changed = ok
                && probe.iter().any(|(n, _)| {
                    matches!(
                        self.classify_write(n),
                        WriteKind::StoreSub | WriteKind::Derived
                    )
                });
            (ok, changed)
        };
        if !supported {
            return None;
        }

        // Take ownership of the assignment so the RHS can be moved out + visited
        // (its own store reads / nested destructure-assignments are lowered).
        // 写经 upstream: the RHS is visited BEFORE `extract_paths` runs, so any
        // nested destructure-assignment in the RHS allocates its `$$array` temps
        // first (the outer left's temps come after).
        let taken = std::mem::replace(expr, b.void0()).into_assignment_expression()?;
        let mut taken = taken.unbox();
        let mut rhs = taken.right;
        self.visit_expression(&mut rhs);

        // `should_cache = value.type !== 'Identifier'`: a non-identifier RHS is
        // cached in `$$value` and the whole thing wraps in an IIFE; an identifier
        // RHS can be referenced directly and the result is a sequence expression.
        let should_cache = !matches!(rhs, Expression::Identifier(_));
        let rhs_name = if should_cache {
            "$$value".to_string()
        } else if let Expression::Identifier(id) = &rhs {
            id.name.to_string()
        } else {
            unreachable!()
        };

        // `extract_paths(node.left, rhs)` — its array-insert temps are named from
        // the persistent component-wide `$$array` counter. This runs even when the
        // assignment is unchanged, so the counter advances either way (写经
        // `scope.generate('$$array')` being called unconditionally).
        let mut leaves: Vec<(String, AccessPath)> = Vec::new();
        let mut inserts: Vec<ArrayInsert> = Vec::new();
        let mut next_array = self.array_counter;
        collect_destructure_paths(
            &taken.left,
            AccessPath::root_named(&rhs_name),
            &mut leaves,
            &mut inserts,
            &mut next_array,
        );
        self.array_counter = next_array;

        // Unchanged (no store/derived leaf) → keep the assignment with the
        // visited RHS (the counter advance above is preserved). 写经 upstream's
        // `if (!changed) return null`, but we must keep the already-visited node.
        if !changed {
            taken.right = rhs;
            return Some(Expression::AssignmentExpression(b.ab.alloc(taken)));
        }

        let assignments: Vec<Expression<'a>> = leaves
            .iter()
            .map(|(leaf_name, path)| {
                let value = path.build(b);
                match self.classify_write(leaf_name) {
                    WriteKind::StoreSub => {
                        let store = &leaf_name[1..];
                        b.call("$.store_set", vec![b.id(store), value])
                    }
                    WriteKind::Derived => b.call(b.id(leaf_name), vec![value]),
                    WriteKind::None => {
                        b.assignment(AssignmentOperator::Assign, b.id(leaf_name), value)
                    }
                }
            })
            .collect();

        // `var $$array_N = $.to_array(<base>, <len>);` inserts precede the
        // assignments inside the IIFE / sequence.
        let insert_decls: Vec<(oxc_ast::ast::BindingPattern<'a>, Expression<'a>)> = inserts
            .iter()
            .map(|ins| {
                let base = ins.base.build(b);
                let to_array = b.call("$.to_array", vec![base, b.number(ins.len as f64)]);
                (b.id_pat(&ins.name), to_array)
            })
            .collect();

        if should_cache || !insert_decls.is_empty() {
            // `(($$value) => { var $$array_N = …; <assignments>; [return $$value;] })(<rhs>)`.
            let mut stmts: Vec<Statement<'a>> = Vec::new();
            for (pat, init) in insert_decls {
                stmts.push(b.var_decl_from_pairs(
                    oxc_ast::ast::VariableDeclarationKind::Var,
                    vec![(pat, Some(init))],
                ));
            }
            stmts.extend(assignments.into_iter().map(|a| b.stmt(a)));
            if !is_standalone {
                stmts.push(b.return_stmt(Some(b.id(&rhs_name))));
            }
            let params = b.params(vec![b.id_pat(&rhs_name)], None);
            let body = b.body(stmts);
            let arrow = b.arrow(params, body, false, false);
            Some(b.call(arrow, vec![rhs]))
        } else {
            // Identifier RHS, no array inserts → sequence `( … , … )`.
            let mut seq = assignments;
            if !is_standalone {
                seq.push(b.id(&rhs_name));
            }
            Some(b.sequence(seq))
        }
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

    /// Collect parameter binding names from a `FormalParameters` (or arrow
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

/// Collect the names DECLARED directly within a list of statements (a block /
/// function body) so they shadow any same-named component-level derived / store
/// binding within that scope. Mirrors upstream `state.scope.get(name)` resolving
/// to the nearest enclosing declaration: a local `let value = 0` inside a
/// `$.derived(() => …)` thunk must NOT be read-wrapped as `value()`.
///
/// We collect `let`/`const`/`var`/`function`/`class` declaration names. `var` and
/// `function` are function-scoped, `let`/`const`/`class` block-scoped, but for the
/// purpose of "is this name a local declaration that shadows the instance binding"
/// collecting all of them at every block boundary is conservatively correct: any
/// name declared anywhere in the enclosing function body chain shadows.
fn collect_block_decl_names(stmts: &[Statement], out: &mut FxHashSet<String>) {
    for stmt in stmts {
        match stmt {
            Statement::VariableDeclaration(vd) => {
                for d in vd.declarations.iter() {
                    collect_binding_pattern_names(&d.id, out);
                }
            }
            Statement::FunctionDeclaration(f) => {
                if let Some(id) = &f.id {
                    out.insert(id.name.to_string());
                }
            }
            Statement::ClassDeclaration(c) => {
                if let Some(id) = &c.id {
                    out.insert(id.name.to_string());
                }
            }
            _ => {}
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
    /// The base identifier this access is rooted at — either the RHS root
    /// (`$$value` / the identifier RHS) or a synthesized `$$array_N` temp
    /// introduced by an enclosing array sub-pattern (写经 upstream's
    /// `extract_paths` reseating array children at the `$$array` insert id).
    root: String,
    segs: Vec<AccessSeg>,
}

impl AccessPath {
    fn root_named(name: &str) -> Self {
        AccessPath {
            root: name.to_string(),
            segs: Vec::new(),
        }
    }
    fn push_prop(&self, name: &str) -> Self {
        let mut segs = self.segs.clone();
        segs.push(AccessSeg::Prop(name.to_string()));
        AccessPath {
            root: self.root.clone(),
            segs,
        }
    }
    fn push_index(&self, i: u32) -> Self {
        let mut segs = self.segs.clone();
        segs.push(AccessSeg::Index(i));
        AccessPath {
            root: self.root.clone(),
            segs,
        }
    }
    fn build<'a>(&self, b: B<'a>) -> Expression<'a> {
        let mut expr = b.id(&self.root);
        for seg in &self.segs {
            expr = match seg {
                AccessSeg::Prop(p) => b.member(expr, p),
                AccessSeg::Index(i) => b.member_computed(expr, b.number(*i as f64)),
            };
        }
        expr
    }
}

/// One `var $$array_N = $.to_array(<base>, <len>)` insert produced when a
/// destructuring assignment contains an array sub-pattern (写経 upstream
/// `extract_paths` `inserts`).
struct ArrayInsert {
    name: String,
    base: AccessPath,
    len: u32,
}

/// Walk a destructuring `AssignmentTarget` collecting `(leaf_name, access_path)`
/// leaf pairs and `$.to_array(...)` array inserts. `next_array` names successive
/// `$$array` temps (`$$array`, `$$array_1`, …) matching the oracle's scope
/// generator. Returns `false` for unsupported shapes (defaults, rest, computed
/// keys) so the caller falls back to the default walk.
fn collect_destructure_paths(
    target: &AssignmentTarget,
    path: AccessPath,
    out: &mut Vec<(String, AccessPath)>,
    inserts: &mut Vec<ArrayInsert>,
    next_array: &mut u32,
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
                        if !collect_maybe_default(&p.binding, sub, out, inserts, next_array) {
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
            // `var $$array_N = $.to_array(<path>, <len>)`, then index children at
            // the new temp (写经 `extract_paths` ArrayPattern branch).
            let array_name = if *next_array == 0 {
                "$$array".to_string()
            } else {
                format!("$$array_{}", *next_array)
            };
            *next_array += 1;
            inserts.push(ArrayInsert {
                name: array_name.clone(),
                base: path,
                len: arr.elements.len() as u32,
            });
            let array_root = AccessPath::root_named(&array_name);
            for (i, el) in arr.elements.iter().enumerate() {
                let Some(el) = el else {
                    continue;
                };
                let sub = array_root.push_index(i as u32);
                if !collect_maybe_default(el, sub, out, inserts, next_array) {
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
    inserts: &mut Vec<ArrayInsert>,
    next_array: &mut u32,
) -> bool {
    use oxc_ast::ast::AssignmentTargetMaybeDefault as M;
    match el {
        // A default (`x = 1`) is not supported in this focused port.
        M::AssignmentTargetWithDefault(_) => false,
        other => {
            if let Some(t) = other.as_assignment_target() {
                collect_destructure_paths(t, path, out, inserts, next_array)
            } else {
                false
            }
        }
    }
}

/// Whether `init` is a `$derived(...)` / `$derived.by(...)` call in EITHER the
/// pre-lowering rune shape (`$derived`) or the post-lowering helper shape
/// (`$.derived`). Used to identify private-`$derived` class fields regardless of
/// whether the class-field lowering has already run.
fn is_derived_call(init: &Expression) -> bool {
    let Expression::CallExpression(call) = init else {
        return false;
    };
    callee_is_derived(&call.callee)
}

/// Whether a callee names `$derived` / `$derived.by` (pre-lowering) or
/// `$.derived` (post-lowering).
fn callee_is_derived(callee: &Expression) -> bool {
    match callee {
        Expression::Identifier(id) => id.name == "$derived",
        Expression::StaticMemberExpression(m) => {
            // `$derived.by` or `$.derived`.
            match &m.object {
                Expression::Identifier(o) if o.name == "$derived" => m.property.name == "by",
                Expression::Identifier(o) if o.name == "$" => m.property.name == "derived",
                _ => false,
            }
        }
        _ => false,
    }
}

/// Whether a callee names a rune that DECLARES a class field value (`$state` /
/// `$state.raw` / `$derived` / `$derived.by`) — used to distinguish a constructor
/// field DECLARATION (`this.#x = $derived(...)`, keep as assignment) from a plain
/// WRITE to a derived field (`this.#x = 3`, lower to a call).
fn callee_is_field_rune(callee: &Expression) -> bool {
    match callee {
        Expression::Identifier(id) => id.name == "$state" || id.name == "$derived",
        Expression::StaticMemberExpression(m) => {
            matches!(&m.object, Expression::Identifier(o) if o.name == "$state" || o.name == "$derived")
                || matches!(&m.object, Expression::Identifier(o) if o.name == "$")
                    && (m.property.name == "derived" || m.property.name == "state")
        }
        _ => false,
    }
}

/// Whether `init` is a class-field-rune CALL (`$state(...)` / `$derived(...)` /
/// the lowered `$.derived(...)` / `$.state(...)`). Used to keep a constructor
/// field DECLARATION assignment as-is rather than lowering it to a derived call.
fn callee_is_field_rune_expr(init: &Expression) -> bool {
    match init {
        Expression::CallExpression(call) => callee_is_field_rune(&call.callee),
        _ => false,
    }
}

/// Collect the PRIVATE field names (`#doubled`, …) that are `$derived` /
/// `$derived.by` in `class`, from both `PropertyDefinition` initializers
/// (`#x = $derived(...)`) and constructor `this.#x = $derived(...)` assignments
/// (写经 analyze `ClassBody` `state_fields` + server `MemberExpression.js` lookup
/// keyed by `#name`). Detection is shape-based so it works whether or not the
/// class-field lowering (`$derived` → `$.derived`) has already run.
fn collect_private_derived_fields(class: &oxc_ast::ast::Class, out: &mut FxHashSet<String>) {
    use oxc_ast::ast::{ClassElement, Expression as E, MethodDefinitionKind, Statement as S};
    for el in class.body.body.iter() {
        match el {
            ClassElement::PropertyDefinition(p) => {
                if let Some(name) = p.key.private_name()
                    && let Some(init) = &p.value
                    && is_derived_call(init)
                {
                    out.insert(name.as_str().to_string());
                }
            }
            ClassElement::MethodDefinition(m) if m.kind == MethodDefinitionKind::Constructor => {
                let Some(body) = m.value.body.as_ref() else {
                    continue;
                };
                for stmt in body.statements.iter() {
                    let S::ExpressionStatement(es) = stmt else {
                        continue;
                    };
                    let E::AssignmentExpression(assign) = &es.expression else {
                        continue;
                    };
                    if let AssignmentTarget::PrivateFieldExpression(pf) = &assign.left
                        && matches!(pf.object, E::ThisExpression(_))
                        && is_derived_call(&assign.right)
                    {
                        out.insert(pf.field.name.as_str().to_string());
                    }
                }
            }
            _ => {}
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

/// Whether `expr` is a `$state.eager(<arg>)` call. The read-wrap pass leaves its
/// argument unvisited (写经 the server `CallExpression` visitor returning
/// `node.arguments[0]` without visiting), so the eager read stays bare.
fn is_state_eager_call(expr: &Expression<'_>) -> bool {
    let Expression::CallExpression(call) = expr else {
        return false;
    };
    let Expression::StaticMemberExpression(m) = &call.callee else {
        return false;
    };
    let Expression::Identifier(obj) = &m.object else {
        return false;
    };
    obj.name.as_str() == "$state" && m.property.name.as_str() == "eager"
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
            // A member read `<obj>.#field` whose private property resolves to a
            // `$derived` class field → wrap as a CALL (写经 `MemberExpression.js`).
            // The object is still walked so `<obj>` reads (e.g. a `self` alias) are
            // unaffected and any nested members are handled.
            Expression::StaticMemberExpression(_)
            | Expression::ComputedMemberExpression(_)
            | Expression::PrivateFieldExpression(_) => {
                if self.is_private_derived_member(expr) {
                    oxc_ast_visit::walk_mut::walk_expression(self, expr);
                    let taken = std::mem::replace(expr, self.b.void0());
                    *expr = self.b.call(taken, vec![]);
                } else {
                    oxc_ast_visit::walk_mut::walk_expression(self, expr);
                }
            }
            // `$state.eager(<arg>)`: upstream's server `CallExpression` visitor
            // returns `node.arguments[0]` WITHOUT visiting it, so the eager read
            // is NOT derived-wrapped (`$state.eager(derivedCount)` stays a bare
            // `derivedCount`, later unwrapped by `lower_effect_value_runes_expr`).
            // Skip recursion here so the argument's derived/store reads are left
            // bare — otherwise it would wrap to `derivedCount()` before the
            // unwrap, yielding the wrong `derivedCount() !== derivedCount()`.
            Expression::CallExpression(_) if is_state_eager_call(expr) => {}
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
        if let Some(body) = it.body.as_ref() {
            collect_block_decl_names(&body.statements, &mut frame);
        }
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
        collect_block_decl_names(&it.body.statements, &mut frame);
        self.shadowed.push(frame);
        oxc_ast_visit::walk_mut::walk_arrow_function_expression(self, it);
        self.shadowed.pop();
    }

    fn visit_block_statement(&mut self, it: &mut oxc_ast::ast::BlockStatement<'a>) {
        let mut frame = FxHashSet::default();
        collect_block_decl_names(&it.body, &mut frame);
        self.shadowed.push(frame);
        oxc_ast_visit::walk_mut::walk_block_statement(self, it);
        self.shadowed.pop();
    }

    fn visit_class(&mut self, it: &mut oxc_ast::ast::Class<'a>) {
        let mut frame = FxHashSet::default();
        collect_private_derived_fields(it, &mut frame);
        self.private_derived.push(frame);
        oxc_ast_visit::walk_mut::walk_class(self, it);
        self.private_derived.pop();
    }

    fn visit_expression_statement(&mut self, it: &mut oxc_ast::ast::ExpressionStatement<'a>) {
        // The direct expression of a statement is "standalone" — a destructure
        // assignment that is the whole statement omits the trailing `return $$value`
        // in its IIFE. The flag is consumed (cleared) by `lower_destructure_assignment`
        // before recursing, so nested assignments don't inherit standalone-ness.
        let prev = self.standalone_assign;
        // `$: ({…} = obj)` parses with a `ParenthesizedExpression` wrapper in oxc;
        // a standalone assignment may be directly under it.
        if matches!(
            &it.expression,
            Expression::AssignmentExpression(_) | Expression::ParenthesizedExpression(_)
        ) {
            self.standalone_assign = true;
        }
        oxc_ast_visit::walk_mut::walk_expression_statement(self, it);
        self.standalone_assign = prev;
    }

    fn visit_parenthesized_expression(
        &mut self,
        it: &mut oxc_ast::ast::ParenthesizedExpression<'a>,
    ) {
        // Preserve standalone-ness through a single paren wrapper (`($: (… = …))`).
        oxc_ast_visit::walk_mut::walk_parenthesized_expression(self, it);
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
    wrap_reads_with_shadows(expr, b, analysis, scope_idx, FxHashSet::default());
}

/// Like [`wrap_reads`], but with an initial frame of `shadowed` names — bindings
/// declared by enclosing snippet / scoped-slot parameters that shadow a same-named
/// component-level `$derived` / `$store` binding. A name in `shadowed` is read as
/// itself (never call-/store-wrapped), mirroring upstream's `context.state.scope`
/// resolving to the nearest enclosing parameter declaration.
pub fn wrap_reads_with_shadows<'a>(
    expr: &mut Expression<'a>,
    b: B<'a>,
    analysis: &ComponentAnalysis,
    scope_idx: usize,
    shadowed: FxHashSet<String>,
) {
    wrap_reads_with_shadows_and_local_derived(
        expr,
        b,
        analysis,
        scope_idx,
        shadowed,
        FxHashSet::default(),
    );
}

/// Like [`wrap_reads_with_shadows`], but also threads the set of in-scope LOCAL
/// async-`$derived` const names so an ambiguous read resolves to a CALL `name()`
/// (see `ReadWrap::local_derived`).
pub fn wrap_reads_with_shadows_and_local_derived<'a>(
    expr: &mut Expression<'a>,
    b: B<'a>,
    analysis: &ComponentAnalysis,
    scope_idx: usize,
    shadowed: FxHashSet<String>,
    local_derived: FxHashSet<String>,
) {
    let mut frames = Vec::new();
    if !shadowed.is_empty() {
        frames.push(shadowed);
    }
    let mut visitor = ReadWrap {
        b,
        analysis,
        scope_idx,
        shadowed: frames,
        local_derived,
        private_derived: Vec::new(),
        standalone_assign: false,
        array_counter: 0,
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
    let mut counter = 0u32;
    wrap_reads_in_statement_counted(stmt, b, analysis, scope_idx, &mut counter);
}

/// Like [`wrap_reads_in_statement`], but threads a PERSISTENT `$$array` temp
/// counter so destructuring-assignment array temps are uniquely named across the
/// WHOLE instance script (写经 the component-wide `scope.generate('$$array')`).
/// The legacy instance loop shares one counter across every top-level statement
/// (and the function bodies it visits), so a second array destructure gets
/// `$$array_1`, not a fresh `$$array`.
pub fn wrap_reads_in_statement_counted<'a>(
    stmt: &mut Statement<'a>,
    b: B<'a>,
    analysis: &ComponentAnalysis,
    scope_idx: usize,
    array_counter: &mut u32,
) {
    let mut visitor = ReadWrap {
        b,
        analysis,
        scope_idx,
        shadowed: Vec::new(),
        local_derived: FxHashSet::default(),
        private_derived: Vec::new(),
        standalone_assign: false,
        array_counter: *array_counter,
    };
    visitor.visit_statement(stmt);
    *array_counter = visitor.array_counter;
}
