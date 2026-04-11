//! AST-based state variable transformation.
//!
//! Replaces the text-based `transform_state_in_expr` and `transform_state_assignments`
//! with a single OXC parse + AST walk, eliminating O(M*N) text scanning.
//!
//! The main entry point is [`transform_state_vars_ast`], which:
//! 1. Parses the script text once with OXC (using a thread-local allocator)
//! 2. Walks the AST to find ALL identifier references and assignments to state variables
//! 3. Collects replacements as (byte_start, byte_end, replacement_string)
//! 4. Applies all replacements in a single pass (right-to-left to preserve offsets)

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_syntax::operator::{AssignmentOperator, UpdateOperator};
use oxc_syntax::scope::ScopeFlags;
use oxc_syntax::scope::ScopeId;
use rustc_hash::FxHashSet;

use super::VAR_STATE_VARS;

thread_local! {
    static AST_TRANSFORM_ALLOCATOR: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based should_proxy check, mirroring the official Svelte compiler's `should_proxy()`.
/// Returns `false` for expression types that are known to produce non-proxyable values:
///  - Literal, TemplateLiteral, ArrowFunctionExpression, FunctionExpression
///  - UnaryExpression, BinaryExpression
///  - Identifier named "undefined"
///
/// For Identifier nodes, looks up the non_proxy_vars list (which contains variables
/// with known non-proxyable initial values).
/// For all other expression types (CallExpression, MemberExpression, etc.), returns `true`.
fn should_proxy_ast(expr: &Expression<'_>, non_proxy_vars: &[String]) -> bool {
    match expr {
        Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::StringLiteral(_) => false,
        Expression::TemplateLiteral(_) => false,
        Expression::ArrowFunctionExpression(_) => false,
        Expression::FunctionExpression(_) => false,
        Expression::UnaryExpression(_) => false,
        Expression::BinaryExpression(_) => false,
        // TypeScript casts: unwrap and recurse on the inner expression.
        Expression::TSAsExpression(e) => should_proxy_ast(&e.expression, non_proxy_vars),
        Expression::TSSatisfiesExpression(e) => should_proxy_ast(&e.expression, non_proxy_vars),
        Expression::TSNonNullExpression(e) => should_proxy_ast(&e.expression, non_proxy_vars),
        Expression::TSTypeAssertion(e) => should_proxy_ast(&e.expression, non_proxy_vars),
        Expression::TSInstantiationExpression(e) => should_proxy_ast(&e.expression, non_proxy_vars),
        Expression::Identifier(ident) => {
            if ident.name == "undefined" {
                return false;
            }
            // Check if this identifier is in the non-proxy vars list
            if non_proxy_vars.iter().any(|v| v == ident.name.as_str()) {
                return false;
            }
            true
        }
        // ParenthesizedExpression: check inner expression
        Expression::ParenthesizedExpression(paren) => {
            should_proxy_ast(&paren.expression, non_proxy_vars)
        }
        // SequenceExpression (comma): check last expression
        Expression::SequenceExpression(seq) => {
            if let Some(last) = seq.expressions.last() {
                should_proxy_ast(last, non_proxy_vars)
            } else {
                true
            }
        }
        // Everything else (CallExpression, MemberExpression, etc.) might need proxy
        _ => true,
    }
}

/// Execute a closure with a freshly-reset thread-local OXC allocator.
fn with_ast_transform_allocator<F, R>(f: F) -> R
where
    F: FnOnce(&Allocator) -> R,
{
    AST_TRANSFORM_ALLOCATOR.with(|cell| {
        let mut alloc = cell.borrow_mut();
        alloc.reset();
        f(&alloc)
    })
}

/// A replacement to apply to the source text.
#[derive(Debug)]
struct Replacement {
    /// Byte offset start (inclusive) in the original source.
    start: u32,
    /// Byte offset end (exclusive) in the original source.
    end: u32,
    /// The replacement text.
    text: String,
}

/// Collect all state variable references and assignments from the AST.
struct StateVarCollector<'a, 's> {
    /// The original source text, needed to extract sub-expressions.
    source: &'s str,
    /// Set of state variable names that need $.get()/ $.set() transforms.
    state_vars: &'a FxHashSet<&'a str>,
    /// Variables explicitly marked as non-reactive (skip $.get() wrapping).
    non_reactive_vars: &'a FxHashSet<&'a str>,
    /// Variables declared with `$state.raw()` (never need proxy wrapping).
    raw_state_vars: &'a FxHashSet<&'a str>,
    /// Variables declared with `$derived()` / `$derived.by()` — assignments should never proxy.
    derived_vars: FxHashSet<String>,
    /// Variables known to not need proxy wrapping (literals, non-object types).
    non_proxy_vars: &'a [String],
    /// Whether the component is in runes mode.
    is_runes: bool,
    /// Var-declared state vars that need $.safe_get() instead of $.get().
    var_state_vars: Vec<String>,
    /// Collected replacements.
    replacements: Vec<Replacement>,
    /// Stack of scoped variable sets for shadowing detection.
    /// Each scope level tracks variables declared in that scope
    /// (function params, let/const/var declarations, catch params, for-loop vars).
    scoped_vars: Vec<FxHashSet<String>>,
    /// Stack tracking whether we're currently inside a shorthand property.
    /// When inside a shorthand property like `{ foo }`, the IdentifierReference
    /// for `foo` needs special handling: `{ foo: $.get(foo) }`.
    in_shorthand_property: bool,

    // --- Phase A-2 fields ---
    /// Prop source variables that need getter/setter wrapping: `prop` -> `prop()`.
    prop_source_vars: FxHashSet<String>,
    /// Non-bindable prop vars (no member mutation wrapping).
    non_bindable_prop_vars: FxHashSet<String>,
    /// Store subscription variables ($count, $store, etc.).
    store_sub_vars: FxHashSet<String>,
    /// Read-only props: (local_name, prop_alias) pairs -> `name` -> `$$props.propAlias`.
    read_only_props: Vec<(String, String)>,
    /// Read-only prop local names for O(1) lookup.
    read_only_prop_names: FxHashSet<String>,
    /// Rest prop variable names -> `others.x` -> `$$props.x`.
    rest_prop_vars: FxHashSet<String>,
    /// State vars needed for store access pattern (store base is a reactive state var).
    state_vars_for_store: FxHashSet<String>,
    /// Prop vars needed for store access pattern (store base is a prop).
    prop_vars_for_store: FxHashSet<String>,
    /// When visiting inside a ParenthesizedExpression, stores the outer span (start, end).
    /// This allows inner expression transforms (e.g., assignment -> $.set) to extend their
    /// replacement span to cover the redundant parens.
    paren_expr_span: Option<(u32, u32)>,
}

impl<'a, 's> StateVarCollector<'a, 's> {
    #[allow(clippy::too_many_arguments)]
    fn new(
        source: &'s str,
        state_vars: &'a FxHashSet<&'a str>,
        non_reactive_vars: &'a FxHashSet<&'a str>,
        raw_state_vars: &'a FxHashSet<&'a str>,
        derived_vars: &[String],
        non_proxy_vars: &'a [String],
        is_runes: bool,
        prop_source_vars: &[String],
        non_bindable_prop_vars: &[String],
        store_sub_vars: &[String],
        read_only_props: &[(String, String)],
        rest_prop_vars: &[String],
        prop_assignment_transform_vars: &[String],
    ) -> Self {
        let var_state_vars = VAR_STATE_VARS.with(|v| v.borrow().clone());
        let read_only_prop_names: FxHashSet<String> =
            read_only_props.iter().map(|(n, _)| n.clone()).collect();
        let prop_source_set: FxHashSet<String> = prop_source_vars.iter().cloned().collect();
        let non_bindable_set: FxHashSet<String> = non_bindable_prop_vars.iter().cloned().collect();
        let store_sub_set: FxHashSet<String> = store_sub_vars.iter().cloned().collect();
        let rest_prop_set: FxHashSet<String> = rest_prop_vars.iter().cloned().collect();
        // For store access patterns: determine if the store's base var is a prop or state var
        let state_set_for_store: FxHashSet<String> =
            state_vars.iter().map(|s| s.to_string()).collect();
        let prop_set_for_store: FxHashSet<String> =
            prop_assignment_transform_vars.iter().cloned().collect();
        Self {
            source,
            state_vars,
            non_reactive_vars,
            raw_state_vars,
            derived_vars: derived_vars.iter().cloned().collect(),
            non_proxy_vars,
            is_runes,
            var_state_vars,
            replacements: Vec::new(),
            scoped_vars: vec![FxHashSet::default()],
            in_shorthand_property: false,
            prop_source_vars: prop_source_set,
            non_bindable_prop_vars: non_bindable_set,
            store_sub_vars: store_sub_set,
            read_only_props: read_only_props.to_vec(),
            read_only_prop_names,
            rest_prop_vars: rest_prop_set,
            state_vars_for_store: state_set_for_store,
            prop_vars_for_store: prop_set_for_store,
            paren_expr_span: None,
        }
    }

    /// Check if a name is a state variable that should be transformed,
    /// considering non-reactive exclusions and scope shadowing.
    fn is_active_state_var(&self, name: &str) -> bool {
        self.state_vars.contains(name)
            && !self.non_reactive_vars.contains(name)
            && !self.is_shadowed(name)
    }

    /// Check if a name is a state variable (including non-reactive),
    /// used for assignment transforms which apply to all state vars.
    fn is_any_state_var(&self, name: &str) -> bool {
        self.state_vars.contains(name) && !self.is_shadowed(name)
    }

    /// Check if a variable is shadowed by any enclosing scope.
    fn is_shadowed(&self, name: &str) -> bool {
        self.scoped_vars
            .iter()
            .rev()
            .any(|scope| scope.contains(name))
    }

    /// Declare a variable in the current scope.
    fn declare_in_current_scope(&mut self, name: &str) {
        if let Some(scope) = self.scoped_vars.last_mut() {
            scope.insert(name.to_string());
        }
    }

    /// If inside a ParenthesizedExpression, return (and consume) its span.
    /// Otherwise return the given (start, end) as-is.
    fn effective_span(&mut self, start: u32, end: u32) -> (u32, u32) {
        if let Some((ps, pe)) = self.paren_expr_span.take() {
            (ps, pe)
        } else {
            (start, end)
        }
    }

    /// Push a new scope level.
    fn push_scope(&mut self) {
        self.scoped_vars.push(FxHashSet::default());
    }

    /// Pop the current scope level.
    fn pop_scope(&mut self) {
        self.scoped_vars.pop();
    }

    /// Get the appropriate getter function for a state variable.
    fn getter_for(&self, name: &str) -> &'static str {
        if self.var_state_vars.iter().any(|s| s.as_str() == name) {
            "$.safe_get"
        } else {
            "$.get"
        }
    }

    /// Check if a name is an active prop source var (needs getter/setter wrapping).
    /// Prop source vars that are also read-only should NOT get prop() wrapping.
    fn is_active_prop_var(&self, name: &str) -> bool {
        self.prop_source_vars.contains(name)
            && !self.read_only_prop_names.contains(name)
            && !self.rest_prop_vars.contains(name)
            && !self.is_shadowed(name)
    }

    /// Check if a name is a store subscription variable.
    fn is_active_store_sub(&self, name: &str) -> bool {
        self.store_sub_vars.contains(name) && !self.is_shadowed(name)
    }

    /// Check if a name is a read-only prop.
    fn is_active_read_only_prop(&self, name: &str) -> bool {
        self.read_only_prop_names.contains(name) && !self.is_shadowed(name)
    }

    /// Check if a name is a rest prop variable.
    fn is_active_rest_prop(&self, name: &str) -> bool {
        self.rest_prop_vars.contains(name) && !self.is_shadowed(name)
    }

    /// Get the prop alias for a read-only prop.
    fn get_read_only_prop_alias(&self, name: &str) -> Option<&str> {
        self.read_only_props
            .iter()
            .find(|(n, _)| n == name)
            .map(|(_, alias)| alias.as_str())
    }

    /// Get the store access expression for a store's base variable.
    /// For `$count`, the base is `count`. The access depends on whether
    /// `count` is a prop, state var, or plain variable.
    fn store_access_for(&self, store_sub: &str) -> String {
        let store_name = &store_sub[1..]; // Strip leading $
        if self.prop_vars_for_store.contains(store_name) {
            format!("{}()", store_name) // prop getter
        } else if self.state_vars_for_store.contains(store_name)
            && !self.non_reactive_vars.contains(store_name)
        {
            format!("$.get({})", store_name) // reactive state getter
        } else {
            store_name.to_string() // regular variable
        }
    }

    /// Check if a call expression is an already-transformed `$.*()` helper call
    /// whose first argument is a state variable name (and should not be re-wrapped).
    /// Only matches calls where the first arg is a bare state variable identifier:
    /// $.get(x), $.safe_get(x), $.set(x, ...), $.update(x, ...), $.update_pre(x, ...),
    /// $.update_prop(x, ...), $.update_pre_prop(x, ...), $.store_set(x, ...),
    /// $.store_mutate(x, ...), $.update_store(x, ...), $.update_pre_store(x, ...)
    /// Does NOT match $.state(), $.derived(), etc. where args are expressions/callbacks.
    fn is_dollar_helper_call(&self, expr: &CallExpression<'_>) -> bool {
        if expr.arguments.is_empty() {
            return false;
        }
        // Check that the first argument is a simple identifier that's a state variable
        // OR a prop variable OR a store access
        let first_arg_is_known_var = matches!(
            &expr.arguments[0],
            Argument::Identifier(ident) if self.state_vars.contains(ident.name.as_str())
                || self.prop_source_vars.contains(ident.name.as_str())
        );
        if let Expression::StaticMemberExpression(member) = &expr.callee
            && let Expression::Identifier(obj) = &member.object
            && obj.name == "$"
        {
            let method = member.property.name.as_str();
            if first_arg_is_known_var {
                return matches!(
                    method,
                    "get"
                        | "safe_get"
                        | "set"
                        | "update"
                        | "update_pre"
                        | "update_prop"
                        | "update_pre_prop"
                );
            }
            // For store helpers, the first arg can be a complex expression (store access)
            return matches!(
                method,
                "store_set" | "store_mutate" | "update_store" | "update_pre_store"
            );
        }
        false
    }

    /// Check if a variable declarator is a known transform variable declaration.
    /// This includes state variables ($.state, $.derived, etc.) as well as
    /// prop declarations ($.prop, $.rest_props) and store subscriptions ($.store_get).
    /// These are the already-transformed rune calls (e.g., `$state()` -> `$.state()`).
    fn is_known_transform_declaration(&self, declarator: &VariableDeclarator<'_>) -> bool {
        if let Some(ref init) = declarator.init {
            let init_start = init.span().start as usize;
            let init_end = init.span().end as usize;
            if init_end <= self.source.len() {
                let init_text = &self.source[init_start..init_end];
                return init_text.starts_with("$.state(")
                    || init_text.starts_with("$.state.raw(")
                    || init_text.starts_with("$.derived(")
                    || init_text.starts_with("$.derived_by(")
                    || init_text.starts_with("await $.async_derived(")
                    || init_text.starts_with("$.prop(")
                    || init_text.starts_with("$.prop_source(")
                    || init_text.starts_with("$.rest_props(")
                    || init_text.starts_with("$.store_get(");
            }
        }
        false
    }

    /// Add a replacement.
    fn add_replacement(&mut self, start: u32, end: u32, text: String) {
        self.replacements.push(Replacement { start, end, text });
    }

    /// Apply any pending replacements that fall within [range_start, range_end)
    /// to the given source text, remove them from the replacements list, and
    /// return the transformed substring.
    ///
    /// This is used when an outer replacement (e.g., assignment) needs the
    /// already-transformed text of an inner region (e.g., the RHS expression).
    fn apply_and_drain_inner_replacements(&mut self, range_start: u32, range_end: u32) -> String {
        // Partition: collect inner replacements, keep the rest
        let (inner, outer): (Vec<Replacement>, Vec<Replacement>) = self
            .replacements
            .drain(..)
            .partition(|r| r.start >= range_start && r.end <= range_end);

        self.replacements = outer;

        if inner.is_empty() {
            return self.source[range_start as usize..range_end as usize].to_string();
        }

        // Sort inner replacements right-to-left and apply to the substring
        let mut sorted_inner = inner;
        sorted_inner.sort_by_key(|r| std::cmp::Reverse(r.start));

        let mut result = self.source[range_start as usize..range_end as usize].to_string();
        for rep in &sorted_inner {
            let local_start = (rep.start - range_start) as usize;
            let local_end = (rep.end - range_start) as usize;
            result.replace_range(local_start..local_end, &rep.text);
        }

        result
    }

    /// Collect all binding identifiers from a BindingPattern into the current scope.
    fn collect_binding_names(&mut self, pattern: &BindingPattern<'_>) {
        self.collect_binding_names_inner(pattern, false);
    }

    /// Like `collect_binding_names`, but skips names that are state variables.
    /// Used at the program scope level where state variable declarations live -
    /// registering them would incorrectly shadow the very variables we want to transform.
    fn collect_binding_names_skip_state(&mut self, pattern: &BindingPattern<'_>) {
        self.collect_binding_names_inner(pattern, true);
    }

    /// Check if a name is any known transform variable (state, prop, store, read-only, rest-prop)
    /// that should not be registered as shadowed at program scope.
    fn is_any_known_transform_var(&self, name: &str) -> bool {
        self.state_vars.contains(name)
            || self.prop_source_vars.contains(name)
            || self.store_sub_vars.contains(name)
            || self.read_only_prop_names.contains(name)
            || self.rest_prop_vars.contains(name)
    }

    /// Check if a binding pattern contains any name that is a non-reactive variable.
    /// Used to detect when a nested $.state() declaration shadows a non-reactive outer variable.
    fn has_non_reactive_binding_name(&self, pattern: &BindingPattern<'_>) -> bool {
        match pattern {
            BindingPattern::BindingIdentifier(id) => {
                self.non_reactive_vars.contains(id.name.as_str())
            }
            BindingPattern::ObjectPattern(obj) => {
                obj.properties
                    .iter()
                    .any(|prop| self.has_non_reactive_binding_name(&prop.value))
                    || obj
                        .rest
                        .as_ref()
                        .is_some_and(|r| self.has_non_reactive_binding_name(&r.argument))
            }
            BindingPattern::ArrayPattern(arr) => {
                arr.elements
                    .iter()
                    .flatten()
                    .any(|elem| self.has_non_reactive_binding_name(elem))
                    || arr
                        .rest
                        .as_ref()
                        .is_some_and(|r| self.has_non_reactive_binding_name(&r.argument))
            }
            BindingPattern::AssignmentPattern(assign) => {
                self.has_non_reactive_binding_name(&assign.left)
            }
        }
    }

    /// Inner implementation for collecting binding names.
    /// When `skip_state_vars` is true, names that are in `self.state_vars` are not registered.
    fn collect_binding_names_inner(&mut self, pattern: &BindingPattern<'_>, skip_state_vars: bool) {
        match pattern {
            BindingPattern::BindingIdentifier(id) => {
                if skip_state_vars && self.is_any_known_transform_var(&id.name) {
                    // Don't register - this is a known transform variable at program scope
                } else {
                    self.declare_in_current_scope(&id.name);
                }
            }
            BindingPattern::ObjectPattern(obj) => {
                for prop in &obj.properties {
                    self.collect_binding_names_inner(&prop.value, skip_state_vars);
                }
                if let Some(rest) = &obj.rest {
                    self.collect_binding_names_inner(&rest.argument, skip_state_vars);
                }
            }
            BindingPattern::ArrayPattern(arr) => {
                for elem in arr.elements.iter().flatten() {
                    self.collect_binding_names_inner(elem, skip_state_vars);
                }
                if let Some(rest) = &arr.rest {
                    self.collect_binding_names_inner(&rest.argument, skip_state_vars);
                }
            }
            BindingPattern::AssignmentPattern(assign) => {
                self.collect_binding_names_inner(&assign.left, skip_state_vars);
            }
        }
    }
}

impl<'a, 's, 'ast> Visit<'ast> for StateVarCollector<'a, 's> {
    fn enter_scope(&mut self, _flags: ScopeFlags, _scope_id: &std::cell::Cell<Option<ScopeId>>) {
        self.push_scope();
    }

    fn leave_scope(&mut self) {
        self.pop_scope();
    }

    fn visit_expression(&mut self, expr: &Expression<'ast>) {
        // When we encounter a ParenthesizedExpression that directly wraps an
        // assignment or update expression, record its span so that the inner
        // transform can extend its replacement to cover the redundant outer parens.
        // The official Svelte compiler uses AST-based printing (esrap) which
        // automatically strips unnecessary parens; we need to handle it here
        // because our AST transform replaces source spans directly.
        //
        // Only set paren_expr_span when the inner expression is directly an
        // assignment or update expression. For other cases (e.g., arrow functions,
        // call expressions), don't set it to avoid incorrectly consuming parens
        // that wrap complex expressions like `(async () => { ... })([...])`.
        if let Expression::ParenthesizedExpression(paren) = expr {
            let inner = &paren.expression;
            let is_direct_transform_target = matches!(
                inner.without_parentheses(),
                Expression::AssignmentExpression(_) | Expression::UpdateExpression(_)
            );
            if is_direct_transform_target {
                let saved = self.paren_expr_span;
                self.paren_expr_span = Some((paren.span.start, paren.span.end));
                self.visit_expression(inner);
                self.paren_expr_span = saved;
            } else {
                self.visit_expression(inner);
            }
            return;
        }
        walk::walk_expression(self, expr);
    }

    // -----------------------------------------------------------------------
    // Track variable declarations for shadowing
    // -----------------------------------------------------------------------

    fn visit_variable_declaration(&mut self, decl: &VariableDeclaration<'ast>) {
        // Register declared names in the current scope for shadowing detection.
        // For each declarator, check if it's a state variable declaration
        // (initialized with $.state(), $.derived(), etc.). If so, skip registering
        // the name - it IS the state variable we want to transform, and registering
        // it would cause is_shadowed() to return true, preventing all transforms.
        // Regular declarations with the same name (e.g., `let count = 0` inside
        // a nested function) correctly shadow the outer state variable.
        //
        // EXCEPTION: When we're in a nested scope and the variable name is ALREADY
        // a non-reactive state variable (in non_reactive_vars), this inner declaration
        // SHADOWS the outer one. In this case, register it normally so that references
        // within the inner scope are not transformed with $.get()/$.set().
        for declarator in &decl.declarations {
            let is_state_decl = self.is_known_transform_declaration(declarator);
            if is_state_decl {
                // Check if any declared name in this declarator is a non-reactive var.
                // Non-reactive vars are already stripped of $.state() by the rune transform,
                // so they don't need transforms. If a same-named $.state() declaration
                // appears in a nested scope, it's shadowing the outer non-reactive var
                // and should be treated as a regular (shadowing) declaration.
                let is_shadowing_non_reactive = self.scoped_vars.len() > 1
                    && self.has_non_reactive_binding_name(&declarator.id);
                if is_shadowing_non_reactive {
                    self.collect_binding_names(&declarator.id);
                } else {
                    self.collect_binding_names_skip_state(&declarator.id);
                }
            } else {
                self.collect_binding_names(&declarator.id);
            }
        }
        // Then walk the declaration normally (to visit initializers, etc.)
        walk::walk_variable_declaration(self, decl);
    }

    fn visit_formal_parameters(&mut self, params: &FormalParameters<'ast>) {
        // Register parameter names in the current scope before walking
        for param in &params.items {
            self.collect_binding_names(&param.pattern);
        }
        if let Some(rest) = &params.rest {
            self.collect_binding_names(&rest.rest.argument);
        }
        walk::walk_formal_parameters(self, params);
    }

    fn visit_catch_parameter(&mut self, param: &CatchParameter<'ast>) {
        // Register catch parameter in current scope
        self.collect_binding_names(&param.pattern);
        walk::walk_catch_parameter(self, param);
    }

    // -----------------------------------------------------------------------
    // Handle shorthand object properties: { foo } -> { foo: $.get(foo) }
    // -----------------------------------------------------------------------

    fn visit_object_property(&mut self, prop: &ObjectProperty<'ast>) {
        if prop.shorthand {
            // For shorthand properties, visit the key (IdentifierName - won't trigger
            // our IdentifierReference handler), then handle the value specially.
            // The value in a shorthand is an IdentifierReference with the same name.
            // We need to transform `{ foo }` -> `{ foo: $.get(foo) }`.
            let was_shorthand = self.in_shorthand_property;
            self.in_shorthand_property = true;

            // Visit the key first (IdentifierName, no transform needed)
            // Then visit value - this will hit visit_identifier_reference
            walk::walk_object_property(self, prop);

            self.in_shorthand_property = was_shorthand;
        } else if prop.method {
            // Method shorthand: don't transform the key identifier
            // But DO walk into the value (the function expression body)
            walk::walk_object_property(self, prop);
        } else {
            walk::walk_object_property(self, prop);
        }
    }

    // -----------------------------------------------------------------------
    // Skip already-transformed $.get/$.set/$.update calls
    // -----------------------------------------------------------------------

    fn visit_call_expression(&mut self, expr: &CallExpression<'ast>) {
        // Check if this is an already-transformed $.*() call where the first argument
        // is a state variable name that should NOT be re-wrapped.
        // This handles cases where rune transforms (e.g., $derived) already applied
        // $.get() wrapping before the AST transform runs.
        if self.is_dollar_helper_call(expr) {
            // Skip the first argument (the state variable name) but visit remaining args.
            // For $.get(count) - skip entirely (no other args to visit)
            // For $.set(count, value) - skip count, visit value
            // For $.set(count, value, true) - skip count, visit value and true
            for (i, arg) in expr.arguments.iter().enumerate() {
                if i == 0 {
                    continue; // Skip the state variable name argument
                }
                self.visit_argument(arg);
            }
            return;
        }

        // Store sub calls: $store(arg) -> $store()(arg)
        // When a store subscription is used as a function call, insert getter call.
        if let Expression::Identifier(callee_ident) = &expr.callee {
            let name = callee_ident.name.as_str();
            if self.is_active_store_sub(name) {
                // This is `$store(args...)` - we need to transform it to `$store()(args...)`
                // The callee `$store` becomes `$store()`, then the original args follow.
                let callee_start = callee_ident.span.start;
                let callee_end = callee_ident.span.end;
                // Replace just the callee identifier with `$store()`
                self.add_replacement(callee_start, callee_end, format!("{}()", name));
                // Visit arguments normally
                for arg in &expr.arguments {
                    self.visit_argument(arg);
                }
                return;
            }
        }

        // Normal call expression - walk as usual
        walk::walk_call_expression(self, expr);
    }

    // -----------------------------------------------------------------------
    // Transform identifier references: foo -> $.get(foo)
    // -----------------------------------------------------------------------

    fn visit_identifier_reference(&mut self, ident: &IdentifierReference<'ast>) {
        let name = ident.name.as_str();
        let start = ident.span.start;
        let end = ident.span.end;

        // 1. State variable reads: foo -> $.get(foo)
        if self.is_active_state_var(name) {
            let getter = self.getter_for(name);
            if self.in_shorthand_property {
                self.add_replacement(start, end, format!("{}: {}({})", name, getter, name));
            } else {
                self.add_replacement(start, end, format!("{}({})", getter, name));
            }
            return;
        }

        // 2. Read-only prop reads: name -> $$props.propAlias
        if self.is_active_read_only_prop(name) {
            if let Some(alias) = self.get_read_only_prop_alias(name).map(|s| s.to_string()) {
                let use_bracket = !is_valid_js_identifier(&alias);
                if self.in_shorthand_property {
                    if use_bracket {
                        self.add_replacement(start, end, format!("{}: $$props['{}']", name, alias));
                    } else {
                        self.add_replacement(start, end, format!("{}: $$props.{}", name, alias));
                    }
                } else if use_bracket {
                    self.add_replacement(start, end, format!("$$props['{}']", alias));
                } else {
                    self.add_replacement(start, end, format!("$$props.{}", alias));
                }
            }
            return;
        }

        // 3. Prop source reads: prop -> prop()
        if self.is_active_prop_var(name) {
            // Exception: if this identifier is the sole argument to `$.derived(`,
            // it's the unthunk optimization where the prop getter IS the derived
            // function — do NOT append `()`.
            let before_start = start as usize;
            let trimmed_before = self.source[..before_start].trim_end();
            let is_sole_derived_arg = if trimmed_before.ends_with("$.derived(") {
                let after_end = end as usize;
                let after = &self.source[after_end..];
                let trimmed_after = after.trim_start();
                trimmed_after.starts_with(')')
            } else {
                false
            };
            if is_sole_derived_arg {
                return;
            }
            if self.in_shorthand_property {
                self.add_replacement(start, end, format!("{}: {}()", name, name));
            } else {
                self.add_replacement(start, end, format!("{}()", name));
            }
            return;
        }

        // 4. Store subscription reads: $store -> $store()
        if self.is_active_store_sub(name) {
            // Don't transform inside $.untrack() or $.derived() context
            // (checked by looking at the source text immediately before)
            let before_start = start as usize;
            let trimmed_before = self.source[..before_start].trim_end();
            let in_getter_context =
                trimmed_before.ends_with("$.untrack(") || trimmed_before.ends_with("$.derived(");
            if !in_getter_context {
                if self.in_shorthand_property {
                    self.add_replacement(start, end, format!("{}: {}()", name, name));
                } else {
                    self.add_replacement(start, end, format!("{}()", name));
                }
            }
        }

        // No need to call walk - IdentifierReference is a leaf node
    }

    // -----------------------------------------------------------------------
    // Transform assignments: foo = expr -> $.set(foo, expr)
    // -----------------------------------------------------------------------

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        // Check if the left side is a simple identifier
        if let AssignmentTarget::AssignmentTargetIdentifier(ident) = &expr.left {
            let name = ident.name.as_str();

            // --- State variable assignments ---
            if self.is_any_state_var(name) {
                // Use effective_span to cover any enclosing ParenthesizedExpression
                let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);
                let rhs_start = expr.right.span().start;
                let rhs_end = expr.right.span().end;

                let _original_rhs_text = &self.source[rhs_start as usize..rhs_end as usize];

                self.visit_expression(&expr.right);
                let rhs_text = self.apply_and_drain_inner_replacements(rhs_start, rhs_end);

                match expr.operator {
                    AssignmentOperator::Assign => {
                        let is_raw = self.raw_state_vars.contains(name);
                        // In JS compiler, derived bindings never proxy their assigned values
                        // (see AssignmentExpression.js `binding.kind !== 'derived'` check).
                        let is_derived = self.derived_vars.contains(name);
                        let needs_proxy = self.is_runes
                            && !is_raw
                            && !is_derived
                            && should_proxy_ast(&expr.right, self.non_proxy_vars);

                        let replacement = if needs_proxy {
                            format!("$.set({}, {}, true)", name, rhs_text)
                        } else {
                            format!("$.set({}, {})", name, rhs_text)
                        };
                        self.add_replacement(full_start, full_end, replacement);
                    }
                    op if op != AssignmentOperator::Assign => {
                        let getter = self.getter_for(name);
                        let op_str = compound_op_to_binary(op);
                        let rhs_trimmed = rhs_text.trim();

                        let rhs_str = if needs_compound_parens(rhs_trimmed, op_str) {
                            format!("({})", rhs_trimmed)
                        } else {
                            rhs_trimmed.to_string()
                        };

                        let replacement = format!(
                            "$.set({}, {}({}) {} {})",
                            name, getter, name, op_str, rhs_str
                        );
                        self.add_replacement(full_start, full_end, replacement);
                    }
                    _ => unreachable!(),
                }
                return;
            }

            // --- Prop assignments ---
            if self.is_active_prop_var(name) {
                let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);
                let rhs_start = expr.right.span().start;
                let rhs_end = expr.right.span().end;

                self.visit_expression(&expr.right);
                let rhs_text = self.apply_and_drain_inner_replacements(rhs_start, rhs_end);

                match expr.operator {
                    AssignmentOperator::Assign => {
                        // prop = expr -> prop(expr)
                        let replacement = format!("{}({})", name, rhs_text.trim());
                        self.add_replacement(full_start, full_end, replacement);
                    }
                    op if op != AssignmentOperator::Assign => {
                        // prop += expr -> prop(prop() + (expr))
                        let op_str = compound_op_to_binary(op);
                        let rhs_trimmed = rhs_text.trim();
                        let replacement =
                            format!("{}({}() {} ({}))", name, name, op_str, rhs_trimmed);
                        self.add_replacement(full_start, full_end, replacement);
                    }
                    _ => unreachable!(),
                }
                return;
            }

            // --- Store subscription assignments ---
            if self.is_active_store_sub(name) {
                let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);
                let rhs_start = expr.right.span().start;
                let rhs_end = expr.right.span().end;
                let store_access = self.store_access_for(name);

                self.visit_expression(&expr.right);
                let rhs_text = self.apply_and_drain_inner_replacements(rhs_start, rhs_end);

                match expr.operator {
                    AssignmentOperator::Assign => {
                        // $count = expr -> $.store_set(access, expr)
                        let replacement =
                            format!("$.store_set({}, {})", store_access, rhs_text.trim());
                        self.add_replacement(full_start, full_end, replacement);
                    }
                    op if op != AssignmentOperator::Assign => {
                        // $count += expr -> $.store_set(access, $count() + expr)
                        let op_str = compound_op_to_binary(op);
                        let rhs_trimmed = rhs_text.trim();
                        let replacement = format!(
                            "$.store_set({}, {}() {} {})",
                            store_access, name, op_str, rhs_trimmed
                        );
                        self.add_replacement(full_start, full_end, replacement);
                    }
                    _ => unreachable!(),
                }
                return;
            }
        }

        // --- Prop member mutations (for bindable props) ---
        // e.g., prop.x = y -> prop(prop().x = y, true)
        // Only for bindable props (not in non_bindable_prop_vars)
        if let Some(member_target) = self.extract_simple_member_target(&expr.left) {
            let obj_name = member_target.as_str();
            if self.is_active_prop_var(obj_name) && !self.non_bindable_prop_vars.contains(obj_name)
            {
                let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);

                // Walk both sides to transform inner reads (e.g., state vars, read-only props,
                // store subs, and the prop getter in the LHS itself)
                walk::walk_assignment_expression(self, expr);

                // Get the full expression text with inner replacements applied
                let full_text = self.apply_and_drain_inner_replacements(full_start, full_end);

                // The full_text is like `rows()[$$props.row] = ''` - wrap it:
                // `rows(rows()[$$props.row] = '', true)`
                let replacement = format!("{}({}, true)", obj_name, full_text);
                self.add_replacement(full_start, full_end, replacement);
                return;
            }
        }

        // --- Store member mutations ---
        // e.g., $store.prop = expr -> $.store_mutate(access, $.untrack($store).prop = expr, $.untrack($store))
        if let Some(store_name) = self.extract_store_member_target(&expr.left)
            && self.is_active_store_sub(&store_name)
        {
            let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);
            let store_access = self.store_access_for(&store_name);

            // Walk the right side to transform inner reads
            self.visit_expression(&expr.right);

            // Get the full expression text with inner replacements applied
            let full_text = self.apply_and_drain_inner_replacements(full_start, full_end);

            // Replace the first occurrence of $store with $.untrack($store) in mutation
            let untracked_expr =
                full_text.replacen(&store_name, &format!("$.untrack({})", store_name), 1);

            let replacement = format!(
                "$.store_mutate({}, {}, $.untrack({}))",
                store_access, untracked_expr, store_name
            );
            self.add_replacement(full_start, full_end, replacement);
            return;
        }

        // --- Rest-prop direct member assignment: prevent rest-prop transform on direct LHS ---
        // For `rest.x = y`, the LHS is StaticMemberExpression(Identifier(rest), x).
        // We must NOT transform `rest` to `$$props` in this case.
        // But for `rest.x.y = z`, the LHS object is StaticMemberExpression(rest, x),
        // which should be transformed (and it will be via visit_static_member_expression).
        if self.is_rest_prop_direct_member_assignment(&expr.left) {
            // Only visit the RHS, skip the LHS entirely
            self.visit_expression(&expr.right);
            return;
        }

        // Destructuring LHS: for patterns like `({ x } = obj)` or `[x] = arr`,
        // walking the LHS would incorrectly transform the binding identifiers (e.g.,
        // `{ x }` -> `{ x: $.get(x) }`). Svelte's compiler decomposes these into
        // individual assignments. For now, we skip transforming the LHS bindings
        // but still visit any default (init) expressions inside, and visit the RHS.
        if matches!(
            &expr.left,
            AssignmentTarget::ObjectAssignmentTarget(_)
                | AssignmentTarget::ArrayAssignmentTarget(_)
        ) {
            self.visit_assignment_target_defaults_only(&expr.left);
            self.visit_expression(&expr.right);
            return;
        }

        // Not a known assignment target - walk normally
        walk::walk_assignment_expression(self, expr);
    }

    // -----------------------------------------------------------------------
    // Transform update expressions: ++foo -> $.update_pre(foo), foo++ -> $.update(foo)
    // -----------------------------------------------------------------------

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(ident) = &expr.argument {
            let name = ident.name.as_str();
            let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);

            // --- State variable updates ---
            if self.is_any_state_var(name) {
                match (expr.prefix, expr.operator) {
                    (true, UpdateOperator::Increment) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_pre({})", name),
                        );
                    }
                    (true, UpdateOperator::Decrement) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_pre({}, -1)", name),
                        );
                    }
                    (false, UpdateOperator::Increment) => {
                        self.add_replacement(full_start, full_end, format!("$.update({})", name));
                    }
                    (false, UpdateOperator::Decrement) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update({}, -1)", name),
                        );
                    }
                }
                return;
            }

            // --- Prop updates ---
            if self.is_active_prop_var(name) {
                match (expr.prefix, expr.operator) {
                    (true, UpdateOperator::Increment) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_pre_prop({})", name),
                        );
                    }
                    (true, UpdateOperator::Decrement) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_pre_prop({}, -1)", name),
                        );
                    }
                    (false, UpdateOperator::Increment) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_prop({})", name),
                        );
                    }
                    (false, UpdateOperator::Decrement) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_prop({}, -1)", name),
                        );
                    }
                }
                return;
            }

            // --- Store updates ---
            if self.is_active_store_sub(name) {
                let store_access = self.store_access_for(name);
                match (expr.prefix, expr.operator) {
                    (true, UpdateOperator::Increment) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_pre_store({}, {}())", store_access, name),
                        );
                    }
                    (true, UpdateOperator::Decrement) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_pre_store({}, {}(), -1)", store_access, name),
                        );
                    }
                    (false, UpdateOperator::Increment) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_store({}, {}())", store_access, name),
                        );
                    }
                    (false, UpdateOperator::Decrement) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_store({}, {}(), -1)", store_access, name),
                        );
                    }
                }
                return;
            }
        }

        // --- Store member update expressions ---
        // e.g., $store.prop++ -> $.store_mutate(access, $.untrack($store).prop++, $.untrack($store))
        if let Some(store_name) = self.extract_store_member_target_from_update(&expr.argument)
            && self.is_active_store_sub(&store_name)
        {
            let full_start = expr.span.start;
            let full_end = expr.span.end;
            let store_access = self.store_access_for(&store_name);

            let full_text = &self.source[full_start as usize..full_end as usize];
            let untracked_expr =
                full_text.replacen(&store_name, &format!("$.untrack({})", store_name), 1);

            let replacement = format!(
                "$.store_mutate({}, {}, $.untrack({}))",
                store_access, untracked_expr, store_name
            );
            self.add_replacement(full_start, full_end, replacement);
            return;
        }

        // Not a known variable update - walk normally
        walk::walk_update_expression(self, expr);
    }

    // -----------------------------------------------------------------------
    // Transform rest-prop member access: others.x -> $$props.x
    // -----------------------------------------------------------------------

    fn visit_static_member_expression(&mut self, expr: &StaticMemberExpression<'ast>) {
        // rest_prop.x -> $$props.x (only for non-computed, non-assignment-target access)
        // Unwrap parentheses and TS wrappers (e.g., `(props as any).x`) to find the
        // underlying identifier; replace the entire wrapped expression with `$$props`.
        // Unwrap ParenthesizedExpression, TSAsExpression, TSNonNullExpression, etc.
        let mut unwrapped = expr.object.without_parentheses();
        loop {
            match unwrapped {
                Expression::TSAsExpression(e) => unwrapped = e.expression.without_parentheses(),
                Expression::TSNonNullExpression(e) => {
                    unwrapped = e.expression.without_parentheses()
                }
                Expression::TSSatisfiesExpression(e) => {
                    unwrapped = e.expression.without_parentheses()
                }
                Expression::TSTypeAssertion(e) => unwrapped = e.expression.without_parentheses(),
                Expression::TSInstantiationExpression(e) => {
                    unwrapped = e.expression.without_parentheses()
                }
                _ => break,
            }
        }
        if let Expression::Identifier(obj) = unwrapped
            && self.is_active_rest_prop(obj.name.as_str())
        {
            // Replace the entire object span (including wrappers/parens) with $$props
            let obj_start = expr.object.span().start;
            let obj_end = expr.object.span().end;
            self.add_replacement(obj_start, obj_end, "$$props".to_string());
            // Don't walk further - the object is replaced and property is just a name
            return;
        }

        // Walk normally
        walk::walk_static_member_expression(self, expr);
    }
}

impl<'a, 's> StateVarCollector<'a, 's> {
    /// Visit the default (init) expressions inside a destructuring LHS without
    /// transforming the binding identifiers themselves. Used by the override
    /// for `visit_assignment_expression` when the LHS is a destructuring pattern.
    fn visit_assignment_target_defaults_only<'ast>(&mut self, target: &AssignmentTarget<'ast>) {
        match target {
            AssignmentTarget::ObjectAssignmentTarget(obj) => {
                for prop in &obj.properties {
                    match prop {
                        AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => {
                            if let Some(init) = &p.init {
                                self.visit_expression(init);
                            }
                        }
                        AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                            if !matches!(&p.name, PropertyKey::StaticIdentifier(_)) {
                                self.visit_property_key(&p.name);
                            }
                            self.visit_assignment_target_maybe_default_defaults_only(&p.binding);
                        }
                    }
                }
                if let Some(rest) = &obj.rest
                    && matches!(
                        &rest.target,
                        AssignmentTarget::ObjectAssignmentTarget(_)
                            | AssignmentTarget::ArrayAssignmentTarget(_)
                    )
                {
                    self.visit_assignment_target_defaults_only(&rest.target);
                }
            }
            AssignmentTarget::ArrayAssignmentTarget(arr) => {
                for el in arr.elements.iter().flatten() {
                    self.visit_assignment_target_maybe_default_defaults_only(el);
                }
                if let Some(rest) = &arr.rest
                    && matches!(
                        &rest.target,
                        AssignmentTarget::ObjectAssignmentTarget(_)
                            | AssignmentTarget::ArrayAssignmentTarget(_)
                    )
                {
                    self.visit_assignment_target_defaults_only(&rest.target);
                }
            }
            _ => {}
        }
    }

    fn visit_assignment_target_maybe_default_defaults_only<'ast>(
        &mut self,
        mb: &AssignmentTargetMaybeDefault<'ast>,
    ) {
        match mb {
            AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(wd) => {
                self.visit_expression(&wd.init);
                if matches!(
                    &wd.binding,
                    AssignmentTarget::ObjectAssignmentTarget(_)
                        | AssignmentTarget::ArrayAssignmentTarget(_)
                ) {
                    self.visit_assignment_target_defaults_only(&wd.binding);
                }
            }
            AssignmentTargetMaybeDefault::AssignmentTargetIdentifier(_) => {
                // Bare identifier binding: skip
            }
            _ => {
                // Member expression or nested pattern: recurse for nested patterns only.
                // Converting through as_assignment_target() handles the remaining variants.
                // We use pattern matching directly on the enum here.
                // The safe approach: only recurse when it's a nested destructuring target.
            }
        }
    }

    /// Check if an assignment target is a direct rest-prop member assignment.
    /// Returns true for `rest.x = y` (where rest is a rest-prop and x is a direct property),
    /// but NOT for `rest.x.y = z` (where the inner `rest.x` is not the direct assignment target).
    fn is_rest_prop_direct_member_assignment(&self, target: &AssignmentTarget<'_>) -> bool {
        match target {
            AssignmentTarget::StaticMemberExpression(member) => {
                if let Expression::Identifier(obj) = &member.object {
                    return self.is_active_rest_prop(obj.name.as_str());
                }
                false
            }
            AssignmentTarget::ComputedMemberExpression(member) => {
                if let Expression::Identifier(obj) = &member.object {
                    return self.is_active_rest_prop(obj.name.as_str());
                }
                false
            }
            _ => false,
        }
    }

    /// Extract the object name from an assignment target that is a member expression.
    /// Returns Some(obj_name) if the target is like `prop.x`, `prop.x.y`, etc.
    fn extract_simple_member_target(&self, target: &AssignmentTarget<'_>) -> Option<String> {
        match target {
            AssignmentTarget::StaticMemberExpression(member) => {
                // Direct: prop.x = y
                if let Expression::Identifier(obj) = &member.object {
                    return Some(obj.name.to_string());
                }
                // Chained: prop.x.y = z -> need root object
                if let Expression::StaticMemberExpression(inner) = &member.object {
                    return self.extract_root_object_from_static_member(inner);
                }
                // Chained with computed: prop[i].y = z -> need root object
                if let Expression::ComputedMemberExpression(inner) = &member.object {
                    return Self::extract_root_object_from_expr(&inner.object);
                }
                if let Expression::CallExpression(call) = &member.object
                    && let Expression::Identifier(obj) = &call.callee
                {
                    return Some(obj.name.to_string());
                }
                None
            }
            AssignmentTarget::ComputedMemberExpression(member) => {
                if let Expression::Identifier(obj) = &member.object {
                    return Some(obj.name.to_string());
                }
                // Chained with static: prop.x[i] = z -> need root object
                if let Expression::StaticMemberExpression(inner) = &member.object {
                    return self.extract_root_object_from_static_member(inner);
                }
                // Chained with computed: prop[i][j] = z -> need root object
                if let Expression::ComputedMemberExpression(inner) = &member.object {
                    return Self::extract_root_object_from_expr(&inner.object);
                }
                if let Expression::CallExpression(call) = &member.object
                    && let Expression::Identifier(obj) = &call.callee
                {
                    return Some(obj.name.to_string());
                }
                None
            }
            _ => None,
        }
    }

    /// Walk an arbitrary expression down to its root identifier, if any.
    fn extract_root_object_from_expr(expr: &Expression<'_>) -> Option<String> {
        match expr {
            Expression::Identifier(ident) => Some(ident.name.to_string()),
            Expression::StaticMemberExpression(m) => Self::extract_root_object_from_expr(&m.object),
            Expression::ComputedMemberExpression(m) => {
                Self::extract_root_object_from_expr(&m.object)
            }
            Expression::CallExpression(call) => {
                if let Expression::Identifier(ident) = &call.callee {
                    Some(ident.name.to_string())
                } else {
                    Self::extract_root_object_from_expr(&call.callee)
                }
            }
            _ => None,
        }
    }

    /// Extract the root object name from a static member expression chain.
    #[allow(clippy::only_used_in_recursion)]
    fn extract_root_object_from_static_member(
        &self,
        member: &StaticMemberExpression<'_>,
    ) -> Option<String> {
        match &member.object {
            Expression::Identifier(obj) => Some(obj.name.to_string()),
            Expression::StaticMemberExpression(inner) => {
                self.extract_root_object_from_static_member(inner)
            }
            Expression::CallExpression(call) => {
                if let Expression::Identifier(obj) = &call.callee {
                    Some(obj.name.to_string())
                } else {
                    None
                }
            }
            _ => None,
        }
    }

    /// Extract the store subscription name from an assignment target that is a member expression.
    /// Returns Some("$storeName") if the target is like `$store.prop`.
    fn extract_store_member_target(&self, target: &AssignmentTarget<'_>) -> Option<String> {
        let obj_name = self.extract_simple_member_target(target)?;
        if obj_name.starts_with('$') && self.store_sub_vars.contains(&obj_name) {
            Some(obj_name)
        } else {
            None
        }
    }

    /// Extract the store subscription name from an update expression's argument.
    fn extract_store_member_target_from_update(
        &self,
        target: &SimpleAssignmentTarget<'_>,
    ) -> Option<String> {
        match target {
            SimpleAssignmentTarget::StaticMemberExpression(m) => {
                if let Expression::Identifier(obj) = &m.object {
                    let name = obj.name.to_string();
                    if name.starts_with('$') && self.store_sub_vars.contains(&name) {
                        return Some(name);
                    }
                }
                // Chained member: $store.a.b++
                if let Expression::StaticMemberExpression(inner) = &m.object
                    && let Some(root) = self.extract_root_object_from_static_member(inner)
                    && root.starts_with('$')
                    && self.store_sub_vars.contains(&root)
                {
                    return Some(root);
                }
                None
            }
            SimpleAssignmentTarget::ComputedMemberExpression(m) => {
                if let Expression::Identifier(obj) = &m.object {
                    let name = obj.name.to_string();
                    if name.starts_with('$') && self.store_sub_vars.contains(&name) {
                        return Some(name);
                    }
                }
                None
            }
            _ => None,
        }
    }
}

/// Convert a compound AssignmentOperator to its binary operator string.
/// e.g., `+=` -> `+`, `??=` -> `??`
fn compound_op_to_binary(op: AssignmentOperator) -> &'static str {
    match op {
        AssignmentOperator::Addition => "+",
        AssignmentOperator::Subtraction => "-",
        AssignmentOperator::Multiplication => "*",
        AssignmentOperator::Division => "/",
        AssignmentOperator::Remainder => "%",
        AssignmentOperator::Exponential => "**",
        AssignmentOperator::ShiftLeft => "<<",
        AssignmentOperator::ShiftRight => ">>",
        AssignmentOperator::ShiftRightZeroFill => ">>>",
        AssignmentOperator::BitwiseOR => "|",
        AssignmentOperator::BitwiseXOR => "^",
        AssignmentOperator::BitwiseAnd => "&",
        AssignmentOperator::LogicalOr => "||",
        AssignmentOperator::LogicalAnd => "&&",
        AssignmentOperator::LogicalNullish => "??",
        AssignmentOperator::Assign => "=", // shouldn't happen
    }
}

/// Check if the RHS expression of a compound assignment needs parentheses
/// for correct precedence when expanded. Simple expressions (identifiers,
/// literals, function calls, member expressions) don't need them.
fn needs_compound_parens(expr: &str, _op: &str) -> bool {
    let trimmed = expr.trim();
    if trimmed.is_empty() {
        return false;
    }

    // Simple identifiers never need parens
    if trimmed
        .chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
    {
        return false;
    }

    // Numeric literals (including negative)
    if trimmed.parse::<f64>().is_ok() {
        return false;
    }

    // String literals
    if (trimmed.starts_with('"') && trimmed.ends_with('"'))
        || (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('`') && trimmed.ends_with('`'))
    {
        return false;
    }

    // Check for binary operators at the top level (not inside parens/brackets)
    let mut depth = 0i32;
    let chars: Vec<char> = trimmed.chars().collect();
    for (i, &c) in chars.iter().enumerate() {
        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '+' | '-' if depth == 0 && i > 0 => {
                // Check it's not a unary operator at the start
                // and not part of ++ or --
                let prev = chars.get(i.wrapping_sub(1));
                let next = chars.get(i + 1);
                if prev != Some(&c) && next != Some(&c) {
                    return true;
                }
            }
            '*' | '/' | '%' | '&' | '|' | '^' if depth == 0 && i > 0 => {
                return true;
            }
            '?' if depth == 0 && i > 0 => {
                // Ternary or nullish coalescing
                if chars.get(i + 1) != Some(&'.') {
                    return true;
                }
            }
            _ => {}
        }
    }

    false
}

/// Check if a string is a valid JavaScript identifier.
fn is_valid_js_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Transform state variable references and assignments in a script text using
/// AST-based analysis instead of text scanning.
///
/// Returns `Some(transformed_text)` if transformations were applied,
/// or `None` if no transformations are needed or if parsing fails
/// (caller should fall back to text-based transforms).
///
/// # Arguments
///
/// * `script` - The JavaScript source text to transform
/// * `state_vars` - Names of state variables (declared with $state, $derived, etc.)
/// * `non_reactive_vars` - Variables that should NOT get $.get() wrapping
/// * `raw_state_vars` - Variables declared with $state.raw() (never need proxy)
/// * `non_proxy_vars` - Variables known to not need proxy wrapping
/// * `is_runes` - Whether the component is in runes mode
/// * `prop_source_vars` - Prop variables that are sources (need getter/setter)
/// * `prop_assignment_transform_vars` - Props needing assignment transforms (excludes RestProp)
/// * `non_bindable_prop_vars` - Props that are non-bindable (no member mutation wrapping)
/// * `store_sub_vars` - Store subscription variables ($count, $store, etc.)
/// * `read_only_props` - (local_name, prop_alias) pairs
/// * `rest_prop_vars` - Rest prop variable names
pub(super) struct AstTransformConfig<'a> {
    pub state_vars: &'a [String],
    pub non_reactive_vars: &'a [String],
    pub raw_state_vars: &'a [String],
    pub derived_vars: &'a [String],
    pub non_proxy_vars: &'a [String],
    pub is_runes: bool,
    pub prop_source_vars: &'a [String],
    pub prop_assignment_transform_vars: &'a [String],
    pub non_bindable_prop_vars: &'a [String],
    pub store_sub_vars: &'a [String],
    pub read_only_props: &'a [(String, String)],
    pub rest_prop_vars: &'a [String],
}

#[allow(dead_code)]
pub(super) fn transform_state_vars_ast(
    script: &str,
    config: &AstTransformConfig,
) -> Option<String> {
    let state_vars = config.state_vars;
    let non_reactive_vars = config.non_reactive_vars;
    let raw_state_vars = config.raw_state_vars;
    let derived_vars = config.derived_vars;
    let non_proxy_vars = config.non_proxy_vars;
    let is_runes = config.is_runes;
    let prop_source_vars = config.prop_source_vars;
    let prop_assignment_transform_vars = config.prop_assignment_transform_vars;
    let non_bindable_prop_vars = config.non_bindable_prop_vars;
    let store_sub_vars = config.store_sub_vars;
    let read_only_props = config.read_only_props;
    let rest_prop_vars = config.rest_prop_vars;
    // Check if there's anything to transform at all
    let has_state = !state_vars.is_empty();
    let has_props = !prop_assignment_transform_vars.is_empty();
    let has_stores = !store_sub_vars.is_empty();
    let has_read_only = !read_only_props.is_empty();
    let has_rest = !rest_prop_vars.is_empty();

    if !has_state && !has_props && !has_stores && !has_read_only && !has_rest {
        return None;
    }

    // Quick check: if none of the variable names appear as identifiers in the text, skip.
    // Uses O(text_len) identifier extraction instead of O(N*text_len) substring searches.
    let script_ids = {
        let bytes = script.as_bytes();
        let len = bytes.len();
        let mut set = FxHashSet::default();
        let mut i = 0;
        while i < len {
            let b = bytes[i];
            if !(b.is_ascii_alphabetic() || b == b'_' || b == b'$') {
                i += 1;
                continue;
            }
            let start = i;
            i += 1;
            while i < len
                && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
            {
                i += 1;
            }
            let word = unsafe { std::str::from_utf8_unchecked(&bytes[start..i]) };
            set.insert(word);
        }
        set
    };
    let has_any_match = (has_state && state_vars.iter().any(|v| script_ids.contains(v.as_str())))
        || (has_props
            && prop_assignment_transform_vars
                .iter()
                .any(|v| script_ids.contains(v.as_str())))
        || (has_stores
            && store_sub_vars
                .iter()
                .any(|v| script_ids.contains(v.as_str())))
        || (has_read_only
            && read_only_props
                .iter()
                .any(|(n, _)| script_ids.contains(n.as_str())))
        || (has_rest
            && rest_prop_vars
                .iter()
                .any(|v| script_ids.contains(v.as_str())));

    if !has_any_match {
        return None;
    }

    let var_set: FxHashSet<&str> = state_vars.iter().map(|s| s.as_str()).collect();
    let non_reactive_set: FxHashSet<&str> = non_reactive_vars.iter().map(|s| s.as_str()).collect();
    let raw_set: FxHashSet<&str> = raw_state_vars.iter().map(|s| s.as_str()).collect();

    with_ast_transform_allocator(|alloc| {
        let source_type = SourceType::mjs();
        let parsed = Parser::new(alloc, script, source_type).parse();

        if parsed.panicked || !parsed.errors.is_empty() {
            // Parse error - fall back to text-based transform
            return None;
        }

        let mut collector = StateVarCollector::new(
            script,
            &var_set,
            &non_reactive_set,
            &raw_set,
            derived_vars,
            non_proxy_vars,
            is_runes,
            prop_source_vars,
            non_bindable_prop_vars,
            store_sub_vars,
            read_only_props,
            rest_prop_vars,
            prop_assignment_transform_vars,
        );
        collector.visit_program(&parsed.program);

        if collector.replacements.is_empty() {
            return None;
        }

        // Sort replacements by start position descending (right-to-left)
        // so that applying them doesn't invalidate earlier positions
        collector
            .replacements
            .sort_by_key(|r| std::cmp::Reverse(r.start));

        // Apply replacements
        let mut result = script.to_string();
        for rep in &collector.replacements {
            result.replace_range(rep.start as usize..rep.end as usize, &rep.text);
        }

        Some(result)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper to run transform with default options
    fn transform(script: &str, state_vars: &[&str]) -> String {
        let sv: Vec<String> = state_vars.iter().map(|s| s.to_string()).collect();
        let config = AstTransformConfig {
            state_vars: &sv,
            non_reactive_vars: &[],
            raw_state_vars: &[],
            derived_vars: &[],
            non_proxy_vars: &[],
            is_runes: true,
            prop_source_vars: &[],
            prop_assignment_transform_vars: &[],
            non_bindable_prop_vars: &[],
            store_sub_vars: &[],
            read_only_props: &[],
            rest_prop_vars: &[],
        };
        transform_state_vars_ast(script, &config).unwrap_or_else(|| script.to_string())
    }

    /// Helper to run transform with non-reactive vars
    fn transform_with_non_reactive(
        script: &str,
        state_vars: &[&str],
        non_reactive: &[&str],
    ) -> String {
        let sv: Vec<String> = state_vars.iter().map(|s| s.to_string()).collect();
        let nrv: Vec<String> = non_reactive.iter().map(|s| s.to_string()).collect();
        let config = AstTransformConfig {
            state_vars: &sv,
            non_reactive_vars: &nrv,
            raw_state_vars: &[],
            derived_vars: &[],
            non_proxy_vars: &[],
            is_runes: true,
            prop_source_vars: &[],
            prop_assignment_transform_vars: &[],
            non_bindable_prop_vars: &[],
            store_sub_vars: &[],
            read_only_props: &[],
            rest_prop_vars: &[],
        };
        transform_state_vars_ast(script, &config).unwrap_or_else(|| script.to_string())
    }

    // -----------------------------------------------------------------------
    // Basic $.get() wrapping
    // -----------------------------------------------------------------------

    #[test]
    fn test_simple_get_wrapping() {
        assert_eq!(transform("count", &["count"]), "$.get(count)");
    }

    #[test]
    fn test_get_wrapping_in_expression() {
        assert_eq!(transform("count + 1", &["count"]), "$.get(count) + 1");
    }

    #[test]
    fn test_get_wrapping_multiple_vars() {
        assert_eq!(transform("a + b", &["a", "b"]), "$.get(a) + $.get(b)");
    }

    #[test]
    fn test_no_transform_for_non_state_var() {
        assert_eq!(transform("x + 1", &["count"]), "x + 1");
    }

    #[test]
    fn test_no_transform_for_property_access() {
        // obj.count should NOT transform count
        assert_eq!(transform("obj.count", &["count"]), "obj.count");
    }

    #[test]
    fn test_no_transform_for_non_reactive() {
        assert_eq!(
            transform_with_non_reactive("count + 1", &["count"], &["count"]),
            "count + 1"
        );
    }

    // -----------------------------------------------------------------------
    // Shorthand object properties
    // -----------------------------------------------------------------------

    #[test]
    fn test_shorthand_property() {
        assert_eq!(
            transform("let obj = { count }", &["count"]),
            "let obj = { count: $.get(count) }"
        );
    }

    #[test]
    fn test_non_shorthand_property() {
        assert_eq!(
            transform("let obj = { count: count }", &["count"]),
            "let obj = { count: $.get(count) }"
        );
    }

    // -----------------------------------------------------------------------
    // Assignment transforms
    // -----------------------------------------------------------------------

    #[test]
    fn test_simple_assignment() {
        assert_eq!(transform("count = 5", &["count"]), "$.set(count, 5)");
    }

    #[test]
    fn test_compound_addition() {
        assert_eq!(
            transform("count += 1", &["count"]),
            "$.set(count, $.get(count) + 1)"
        );
    }

    #[test]
    fn test_compound_subtraction() {
        assert_eq!(
            transform("count -= 1", &["count"]),
            "$.set(count, $.get(count) - 1)"
        );
    }

    #[test]
    fn test_compound_nullish() {
        assert_eq!(
            transform("count ??= fallback", &["count"]),
            "$.set(count, $.get(count) ?? fallback)"
        );
    }

    #[test]
    fn test_compound_nullish_with_state_rhs() {
        // When the RHS is also a state var, it should get $.get() wrapping
        assert_eq!(
            transform("count ??= fallback", &["count", "fallback"]),
            "$.set(count, $.get(count) ?? $.get(fallback))"
        );
    }

    // -----------------------------------------------------------------------
    // Update expression transforms
    // -----------------------------------------------------------------------

    #[test]
    fn test_prefix_increment() {
        assert_eq!(transform("++count", &["count"]), "$.update_pre(count)");
    }

    #[test]
    fn test_prefix_decrement() {
        assert_eq!(transform("--count", &["count"]), "$.update_pre(count, -1)");
    }

    #[test]
    fn test_postfix_increment() {
        assert_eq!(transform("count++", &["count"]), "$.update(count)");
    }

    #[test]
    fn test_postfix_decrement() {
        assert_eq!(transform("count--", &["count"]), "$.update(count, -1)");
    }

    // -----------------------------------------------------------------------
    // Scoping / shadowing
    // -----------------------------------------------------------------------

    #[test]
    fn test_function_param_shadows() {
        assert_eq!(
            transform("function f(count) { return count; }", &["count"]),
            "function f(count) { return count; }"
        );
    }

    #[test]
    fn test_arrow_param_shadows() {
        assert_eq!(
            transform("(count) => count + 1", &["count"]),
            "(count) => count + 1"
        );
    }

    #[test]
    fn test_let_declaration_shadows() {
        // The let declaration introduces a new binding that shadows the state var
        assert_eq!(
            transform("{ let count = 0; count + 1; }", &["count"]),
            "{ let count = 0; count + 1; }"
        );
    }

    #[test]
    fn test_for_loop_var_shadows() {
        assert_eq!(
            transform("for (let count = 0; count < 10; count++) {}", &["count"]),
            "for (let count = 0; count < 10; count++) {}"
        );
    }

    #[test]
    fn test_catch_param_shadows() {
        assert_eq!(
            transform("try {} catch (count) { count }", &["count"]),
            "try {} catch (count) { count }"
        );
    }

    #[test]
    fn test_no_shadow_outer_scope() {
        // count outside the function should still be transformed
        assert_eq!(
            transform("count; function f(count) { count; }", &["count"]),
            "$.get(count); function f(count) { count; }"
        );
    }

    // -----------------------------------------------------------------------
    // Declaration left-side (should NOT transform)
    // -----------------------------------------------------------------------

    #[test]
    fn test_no_transform_declaration() {
        // In `let count = 0`, count on the left of a declarator should not be transformed
        assert_eq!(transform("let count = 0", &["count"]), "let count = 0");
    }

    // -----------------------------------------------------------------------
    // No state vars - returns None
    // -----------------------------------------------------------------------

    fn empty_config() -> AstTransformConfig<'static> {
        AstTransformConfig {
            state_vars: &[],
            non_reactive_vars: &[],
            raw_state_vars: &[],
            derived_vars: &[],
            non_proxy_vars: &[],
            is_runes: true,
            prop_source_vars: &[],
            prop_assignment_transform_vars: &[],
            non_bindable_prop_vars: &[],
            store_sub_vars: &[],
            read_only_props: &[],
            rest_prop_vars: &[],
        }
    }

    #[test]
    fn test_empty_state_vars() {
        let config = empty_config();
        let result = transform_state_vars_ast("count + 1", &config);
        assert_eq!(result, None);
    }

    #[test]
    fn test_no_matching_vars() {
        let sv = vec!["count".to_string()];
        let mut config = empty_config();
        config.state_vars = &sv;
        let result = transform_state_vars_ast("x + 1", &config);
        assert_eq!(result, None);
    }

    // -----------------------------------------------------------------------
    // Complex expressions
    // -----------------------------------------------------------------------

    #[test]
    fn test_ternary_with_state() {
        assert_eq!(
            transform("count > 0 ? count : 0", &["count"]),
            "$.get(count) > 0 ? $.get(count) : 0"
        );
    }

    #[test]
    fn test_function_call_with_state_arg() {
        assert_eq!(
            transform("console.log(count)", &["count"]),
            "console.log($.get(count))"
        );
    }

    #[test]
    fn test_template_literal_with_state() {
        assert_eq!(
            transform("`count is ${count}`", &["count"]),
            "`count is ${$.get(count)}`"
        );
    }

    #[test]
    fn test_assignment_in_rhs_wraps_state_read() {
        // `count = count + 1` should become `$.set(count, $.get(count) + 1)`
        assert_eq!(
            transform("count = count + 1", &["count"]),
            "$.set(count, $.get(count) + 1)"
        );
    }

    #[test]
    fn test_multiple_assignments() {
        // Both a and b are state vars, both assigned
        assert_eq!(
            transform("a = 1; b = 2", &["a", "b"]),
            "$.set(a, 1); $.set(b, 2)"
        );
    }

    #[test]
    fn test_nested_function_scoping() {
        // Only the outer `count` should be transformed, inner one is shadowed
        let input = "count; function outer() { let count = 0; return count; }";
        let expected = "$.get(count); function outer() { let count = 0; return count; }";
        assert_eq!(transform(input, &["count"]), expected);
    }

    // -----------------------------------------------------------------------
    // State variable declarations (should not self-shadow)
    // -----------------------------------------------------------------------

    #[test]
    fn test_state_var_declaration_does_not_shadow() {
        // `let count = $.state(0)` is the state var declaration itself.
        // It should NOT cause `count` references elsewhere to be treated as shadowed.
        let input = "let count = $.state(0);\ncount += 2;";
        let expected = "let count = $.state(0);\n$.set(count, $.get(count) + 2);";
        assert_eq!(transform(input, &["count"]), expected);
    }

    #[test]
    fn test_derived_var_declaration_does_not_shadow() {
        // `let double = $.derived(...)` should not prevent transforms of `double`
        // Note: The input has `count` (not `$.get(count)`) inside $.derived() because
        // the AST transform is responsible for adding $.get() wrapping.
        let input =
            "let count = $.state(0);\nlet double = $.derived(count * 2);\nconsole.log(double);";
        let expected = "let count = $.state(0);\nlet double = $.derived($.get(count) * 2);\nconsole.log($.get(double));";
        assert_eq!(transform(input, &["count", "double"]), expected);
    }

    #[test]
    fn test_inner_state_var_does_not_shadow_itself() {
        // State variables inside nested functions should also not self-shadow
        let input = "function wrap(initial) {\nlet _value = $.state(initial);\nreturn _value;\n}";
        let expected =
            "function wrap(initial) {\nlet _value = $.state(initial);\nreturn $.get(_value);\n}";
        assert_eq!(transform(input, &["_value"]), expected);
    }

    #[test]
    fn test_non_state_declaration_does_shadow() {
        // A regular `let count = 0` inside a function SHOULD shadow
        let input = "let count = $.state(0);\nfunction f() { let count = 0; return count; }";
        let expected = "let count = $.state(0);\nfunction f() { let count = 0; return count; }";
        assert_eq!(transform(input, &["count"]), expected);
    }
}
