//! AST-based state variable transformation.
//!
//! Replaces the text-based `transform_state_in_expr` and `transform_state_assignments`
//! with a single OXC parse + AST walk, eliminating O(M*N) text scanning.
//!
//! The entry points parse script text or accept a retained OXC program, then walk the AST,
//! collect replacements, and apply them right-to-left to preserve offsets.

use std::cell::RefCell;
use std::fmt::Write as _;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::Parser;
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_span::Span;
use oxc_syntax::operator::{AssignmentOperator, BinaryOperator, UpdateOperator};
use oxc_syntax::scope::ScopeFlags;
use oxc_syntax::scope::ScopeId;
use rustc_hash::{FxHashMap, FxHashSet};

use super::async_derived_dev::{
    AsyncDerivedLocations, destructured_label, dev_args, first_bound_name,
};
use super::destructure_transforms::{
    ArrayHelperRead, build_fallback_string, extract_destructure_paths, js_number_to_string,
    unthunk_string,
};
use super::expression_utils::{
    contains_direct_await_in_expression, extract_enclosing_function_name, extract_trace_call_label,
    find_trace_source_location, strip_top_level_await_from_expr,
    wrap_await_with_save_in_async_derived,
};
use super::props_transforms::transform_props_destructuring;
use super::rune_transforms::{process_derived_destructuring_pattern, wrap_state_value};
use super::{DERIVED_TMP_COUNTER, SCRIPT_ARRAY_COUNTER, STATE_TMP_COUNTER, VAR_STATE_VARS};
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::types::ScriptProjection;
use crate::compiler::phases::phase3_transform::js_ast::to_oxc::SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER;
use crate::compiler::phases::phase3_transform::shared::js_scan::find_code_from;
use crate::compiler::phases::phase3_transform::shared::template::escape_js_string;

thread_local! {
    static AST_TRANSFORM_ALLOCATOR: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Recursively collect every `BindingIdentifier` name reachable inside a
/// `BindingPattern`. Used by the props-destructure handler to emit the
/// `/* $$async_noop:name1,name2 */` async-mode placeholder.
fn collect_binding_identifier_names(pattern: &BindingPattern<'_>, out: &mut Vec<String>) {
    match pattern {
        BindingPattern::BindingIdentifier(id) => out.push(id.name.to_string()),
        BindingPattern::ObjectPattern(obj) => {
            for prop in &obj.properties {
                collect_binding_identifier_names(&prop.value, out);
            }
            if let Some(rest) = &obj.rest {
                collect_binding_identifier_names(&rest.argument, out);
            }
        }
        BindingPattern::ArrayPattern(arr) => {
            for elem in arr.elements.iter().flatten() {
                collect_binding_identifier_names(elem, out);
            }
            if let Some(rest) = &arr.rest {
                collect_binding_identifier_names(&rest.argument, out);
            }
        }
        BindingPattern::AssignmentPattern(assign) => {
            collect_binding_identifier_names(&assign.left, out);
        }
    }
}

/// Label the leaf declarators of a destructured `$derived` with their own
/// binding names. The `$$array` temps are already labelled by pattern kind at
/// their emit site, and the `$$d` source temp upstream leaves bare, so both are
/// skipped here.
fn tag_derived_leaves(declarations: &mut [String], dev: bool) {
    if !dev {
        return;
    }
    for decl in declarations.iter_mut() {
        let Some((name, init)) = decl.split_once(" = ") else {
            continue;
        };
        if name.starts_with("$$array") || name.starts_with("$$d") || !init.starts_with("$.derived(")
        {
            continue;
        }
        *decl = format!("{} = $.tag({}, '{}')", name, init, name);
    }
}

/// The `$$array` label for a destructured `$derived`. Upstream reads the kind
/// off the *top-level* declarator, so `let { a: [x] } = $derived(o)` says
/// "object" even for the inner array (`VariableDeclaration.js:176-186`).
fn derived_insert_label(dev: bool, pattern_text: &str) -> Option<&'static str> {
    dev.then(|| {
        if pattern_text.trim_start().starts_with('[') {
            "[$derived iterable]"
        } else {
            "[$derived object]"
        }
    })
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
///
/// `dev` reflects whether the caller decides on the *visited* expression, as
/// `create_state_declarator` does — by then the dev equality rewrite has turned
/// an `a === b` initializer into a `$.strict_equals(...)` call.
fn should_proxy_ast(expr: &Expression<'_>, non_proxy_vars: &[String], dev: bool) -> bool {
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
        Expression::BinaryExpression(binary) => {
            use oxc_syntax::operator::BinaryOperator;
            dev && matches!(
                binary.operator,
                BinaryOperator::StrictEquality
                    | BinaryOperator::StrictInequality
                    | BinaryOperator::Equality
                    | BinaryOperator::Inequality
            )
        }
        // TypeScript casts: unwrap and recurse on the inner expression.
        Expression::TSAsExpression(e) => should_proxy_ast(&e.expression, non_proxy_vars, dev),
        Expression::TSSatisfiesExpression(e) => {
            should_proxy_ast(&e.expression, non_proxy_vars, dev)
        }
        Expression::TSNonNullExpression(e) => should_proxy_ast(&e.expression, non_proxy_vars, dev),
        Expression::TSTypeAssertion(e) => should_proxy_ast(&e.expression, non_proxy_vars, dev),
        Expression::TSInstantiationExpression(e) => {
            should_proxy_ast(&e.expression, non_proxy_vars, dev)
        }
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
            should_proxy_ast(&paren.expression, non_proxy_vars, dev)
        }
        // SequenceExpression (comma): upstream `should_proxy` does NOT whitelist
        // SequenceExpression, so it falls through to `return true` — a comma
        // expression like `(void 0, 1)` IS proxied. (Do not recurse into the
        // last operand: that would wrongly skip the proxy for a literal tail.)
        Expression::SequenceExpression(_) => true,
        // Everything else (CallExpression, MemberExpression, etc.) might need proxy
        _ => true,
    }
}

/// A declarator initializer with its redundant parentheses peeled off, paired
/// with the span a rewrite of it must cover.
///
/// Upstream parses with acorn, which builds no `ParenthesizedExpression` at
/// all, so `let v = ($state(1))` reaches `get_rune` as the bare call and the
/// parens never survive into the output. Matching only the bare
/// `CallExpression` here left the rune unlowered instead (#3248).
fn init_without_parens<'x, 'ast>(init: &'x Expression<'ast>) -> (&'x Expression<'ast>, Span) {
    (init.without_parentheses(), init.span())
}

/// Execute a closure with a freshly-reset thread-local OXC allocator.
fn with_ast_transform_allocator<F, R>(f: F) -> R
where
    F: FnOnce(&Allocator) -> R,
{
    // `reset` keeps the chunks it already owns, so one outsized component would
    // otherwise pin its peak arena on this thread for the rest of the process.
    const MAX_RETAINED_BYTES: usize = 16 * 1024 * 1024;

    AST_TRANSFORM_ALLOCATOR.with(|cell| {
        let mut alloc = cell.borrow_mut();
        alloc.reset();
        let out = f(&alloc);
        if alloc.capacity() > MAX_RETAINED_BYTES {
            *alloc = Allocator::default();
        }
        out
    })
}

/// A replacement to apply to the source text.
#[derive(Debug)]
/// See [`StateVarCollector::trailing_update_comment`].
struct TrailingUpdateComment {
    comment: String,
    is_line: bool,
    new_end: u32,
    indent: String,
    line_start: u32,
    stmt_starts_line: bool,
}

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
    /// Used for the `$state(arg)` INITIALIZER proxy decision — must NOT contain
    /// props (a `$state(prop)` initializer always proxies the getter-call value).
    non_proxy_vars: &'a [String],
    /// Like `non_proxy_vars` but additionally includes props whose default value
    /// is a non-proxy primitive. Used ONLY for the REASSIGNMENT proxy decision
    /// (`state = prop` → `$.set(state, prop(), proxy)`), where upstream traces the
    /// prop's default and omits the proxy for a primitive default.
    reassign_non_proxy_vars: &'a [String],
    /// Whether the component is in runes mode.
    is_runes: bool,
    /// Whether dev-mode rewrites should fire (currently used by the
    /// `$inspect(...)` and `$inspect.trace(...)` AST migrations; non-dev
    /// behaviour for those calls stays in the text path).
    dev: bool,
    /// Original component source for `$inspect.trace()` label suffix
    /// generation. See `AstTransformConfig::analysis_source`.
    analysis_source: Option<&'s str>,
    /// Component filename for `$inspect.trace()` label suffix generation.
    /// See `AstTransformConfig::filename`.
    filename: Option<&'s str>,
    /// Label inherited by an anonymous function from its immediate AST parent.
    trace_parent_label: Option<String>,
    /// Upstream's `get_function_label` answer for the current function.
    trace_function_label: Option<String>,
    /// Whether the current function is async. Upstream reads this from the
    /// parent Function node when lowering its traced BlockStatement.
    trace_function_is_async: bool,
    /// Whether the current Function node is the value of a class method.
    trace_in_class_method: bool,
    /// Set by `visit_method_definition` for the Function child it is about to walk.
    trace_next_function_is_class_method: bool,
    /// See `AstTransformConfig::async_derived_locations`.
    async_derived_locations: Option<&'a AsyncDerivedLocations>,
    /// Var-declared state vars that need $.safe_get() instead of $.get().
    var_state_vars: Vec<String>,
    /// Collected replacements.
    replacements: Vec<Replacement>,
    /// Whether `replacements` is still ordered by ascending `start`. Holds for
    /// every source-order walk; when a handler pushes out of order,
    /// `take_inner_replacements` falls back to a full scan.
    replacements_sorted: bool,
    /// Stack of scoped variable sets for shadowing detection.
    /// Each scope level tracks variables declared in that scope
    /// (function params, let/const/var declarations, catch params, for-loop vars).
    scoped_vars: Vec<FxHashSet<String>>,
    active_state_vars: Vec<FxHashSet<String>>,
    /// Stack tracking whether we're currently inside a shorthand property.
    /// When inside a shorthand property like `{ foo }`, the IdentifierReference
    /// for `foo` needs special handling: `{ foo: $.get(foo) }`.
    in_shorthand_property: bool,
    /// Subtrees carrying a `svelte-ignore await_reactivity_loss`.
    await_ignore_ranges: super::await_reactivity_loss_ast::AwaitIgnoreRanges,
    /// Comment runs the `await` wrap has to carry inside the call.
    await_comment_runs: super::await_reactivity_loss_ast::AwaitCommentRuns,
    /// Starts of `await` expressions that are a whole statement relying on ASI.
    /// Statement start → end of the statement a `;` has to separate it from.
    await_separators: FxHashMap<u32, u32>,

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
    /// Start offsets of `rest.x` StaticMemberExpressions that are a DIRECT operand
    /// of an Assignment/Update expression, so their `rest -> $$props` rewrite must
    /// be suppressed. Mirrors upstream Identifier.js, which skips the optimization
    /// when the member access's grandparent is an Assignment/Update expression
    /// (e.g. `ctx.globalAlpha *= rest.opacity` keeps `rest.opacity`). Populated when
    /// visiting the parent assignment/update (before the member itself is visited).
    rest_operand_member_starts: FxHashSet<u32>,
    /// State vars needed for store access pattern (store base is a reactive state var).
    state_vars_for_store: FxHashSet<String>,
    /// Prop vars needed for store access pattern (store base is a prop).
    prop_vars_for_store: FxHashSet<String>,
    /// When visiting inside a ParenthesizedExpression, stores the outer span (start, end).
    /// This allows inner expression transforms (e.g., assignment -> $.set) to extend their
    /// replacement span to cover the redundant parens.
    paren_expr_span: Option<(u32, u32)>,

    /// Component analysis — threaded through so the props-destructure AST
    /// handler can call `transform_props_destructuring` (which reads
    /// `analysis.immutable`, `analysis.runes`, `analysis.accessors`,
    /// `analysis.custom_element`, plus `analysis.root.bindings`).
    analysis: Option<&'a ComponentAnalysis>,
    /// Re-exported binding names — used by the props-destructure handler
    /// to decide whether to emit `$.prop()` for read-only prop reads
    /// that need export visibility.
    exported_names: &'a [String],
    /// Original `prop_source_vars` slice (the AST visitor stores a set
    /// for O(1) lookups; the text helper takes a slice).
    prop_source_vars_slice: &'a [String],

    /// Nesting depth of enclosing function declarations / expressions /
    /// arrow functions. The top-level instance script body is depth 0;
    /// entering any `function`/`async function`/`() => …` increments this.
    ///
    /// Mirrors the upstream `context.state.scope.function_depth > 1` check
    /// used by `VariableDeclaration.js` to decide whether
    /// `$derived(await …)` should lower to `(await $.save($.async_derived(…)))()`
    /// (depth > 1, instance script) versus the plain `await $.async_derived(…)`
    /// shape used at the instance script root and in module scripts.
    /// rsvelte's instance-script visitor sits at the equivalent of upstream's
    /// component-function body (depth 1), so we trigger the `$.save(...)`
    /// wrap when our `function_depth >= 1`.
    function_depth: u32,
    /// A named function expression's own name, declared once its scope is entered.
    pending_fn_expr_name: Option<String>,
    /// Per scope, whether it is a `var` boundary (a function, an arrow, or the
    /// program). A `var` declared in a nested block belongs to the nearest one.
    scope_is_var_boundary: Vec<bool>,

    /// Semantic for the parsed script, set after construction. Enables
    /// per-site resolution of a bare-identifier assignment RHS (upstream
    /// `should_proxy` consults the scope at the assignment; the name-list
    /// cannot distinguish two same-named inner bindings).
    semantic: Option<&'a oxc_semantic::Semantic<'a>>,
}

impl<'a, 's> StateVarCollector<'a, 's> {
    /// Per-site proxy decision for a bare-identifier assignment RHS that
    /// resolves to a function-local declaration (see
    /// `state_assigns_combined_ast::ident_rhs_needs_proxy`). `None` defers
    /// to the name-list `should_proxy_ast` fallback.
    fn ident_rhs_site_decision(&self, rhs: &Expression<'_>) -> Option<bool> {
        let Expression::Identifier(rhs_id) = rhs.get_inner_expression() else {
            return None;
        };
        super::state_assigns_combined_ast::ident_rhs_needs_proxy(self.semantic?, rhs_id)
    }

    fn new(
        source: &'s str,
        state_vars: &'a FxHashSet<&'a str>,
        non_reactive_vars: &'a FxHashSet<&'a str>,
        raw_state_vars: &'a FxHashSet<&'a str>,
        derived_vars: &[String],
        non_proxy_vars: &'a [String],
        reassign_non_proxy_vars: &'a [String],
        is_runes: bool,
        dev: bool,
        analysis_source: Option<&'s str>,
        filename: Option<&'s str>,
        async_derived_locations: Option<&'a AsyncDerivedLocations>,
        prop_source_vars: &'a [String],
        non_bindable_prop_vars: &[String],
        store_sub_vars: &[String],
        read_only_props: &[(String, String)],
        rest_prop_vars: &[String],
        prop_assignment_transform_vars: &[String],
        analysis: Option<&'a ComponentAnalysis>,
        exported_names: &'a [String],
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
            reassign_non_proxy_vars,
            is_runes,
            dev,
            analysis_source,
            filename,
            trace_parent_label: None,
            trace_function_label: None,
            trace_function_is_async: false,
            trace_in_class_method: false,
            trace_next_function_is_class_method: false,
            async_derived_locations,
            var_state_vars,
            replacements: Vec::new(),
            replacements_sorted: true,
            scoped_vars: vec![FxHashSet::default()],
            active_state_vars: vec![FxHashSet::default()],
            in_shorthand_property: false,
            await_ignore_ranges: Default::default(),
            await_comment_runs: Default::default(),
            await_separators: FxHashMap::default(),
            prop_source_vars: prop_source_set,
            non_bindable_prop_vars: non_bindable_set,
            store_sub_vars: store_sub_set,
            read_only_props: read_only_props.to_vec(),
            read_only_prop_names,
            rest_prop_vars: rest_prop_set,
            rest_operand_member_starts: FxHashSet::default(),
            state_vars_for_store: state_set_for_store,
            prop_vars_for_store: prop_set_for_store,
            paren_expr_span: None,
            analysis,
            exported_names,
            prop_source_vars_slice: prop_source_vars,
            function_depth: 0,
            pending_fn_expr_name: None,
            scope_is_var_boundary: Vec::new(),
            semantic: None,
        }
    }

    /// Check if a name is a state variable that should be transformed,
    /// considering non-reactive exclusions and scope shadowing.
    fn is_active_state_var(&self, name: &str) -> bool {
        !self.non_reactive_vars.contains(name)
            && (self.resolves_to_local_state(name)
                || (self.state_vars.contains(name) && !self.is_state_var_shadowed(name)))
    }

    /// Check if a name is a state variable (including non-reactive),
    /// used for assignment transforms which apply to all state vars.
    fn is_any_state_var(&self, name: &str) -> bool {
        self.resolves_to_local_state(name)
            || (self.state_vars.contains(name) && !self.is_state_var_shadowed(name))
    }

    /// Resolve a locally declared rune binding independently of the root
    /// analysis name set. The root declaration map keeps the outer binding on
    /// a collision, so an inner `$derived` named like an outer prop is absent
    /// from `state_vars` even though reads in that scope are reactive.
    fn resolves_to_local_state(&self, name: &str) -> bool {
        for (state_scope, scope) in self
            .active_state_vars
            .iter()
            .rev()
            .zip(self.scoped_vars.iter().rev())
        {
            if state_scope.contains(name) {
                return true;
            }
            if scope.contains(name) {
                return false;
            }
        }
        false
    }

    fn is_state_var_shadowed(&self, name: &str) -> bool {
        for (state_scope, scope) in self
            .active_state_vars
            .iter()
            .rev()
            .zip(self.scoped_vars.iter().rev())
        {
            if state_scope.contains(name) {
                return false;
            }
            if scope.contains(name) {
                return true;
            }
        }
        false
    }

    /// Check if a variable is shadowed by any enclosing scope.
    fn is_shadowed(&self, name: &str) -> bool {
        self.scoped_vars
            .iter()
            .rev()
            .any(|scope| scope.contains(name))
    }

    /// Check whether a non-state transform binding (prop/store/rest) is hidden
    /// by a local declaration. Reactive declarations live in
    /// `active_state_vars`, rather than `scoped_vars`, so that their own reads
    /// still receive `$.get(...)`. They nevertheless shadow an outer prop (for
    /// example an inner `const ref = $derived(...)` shadowing a bindable `ref`
    /// prop), and must participate in resolving every other binding kind.
    fn is_non_state_binding_shadowed(&self, name: &str) -> bool {
        self.is_shadowed(name)
            || self
                .active_state_vars
                .iter()
                .rev()
                .any(|scope| scope.contains(name))
    }

    /// Register the names a variable declaration binds, classified the way a state
    /// declaration has to be: it must not register its own names, or `is_shadowed`
    /// would return true and suppress every transform for them.
    fn register_declaration_names(&mut self, decl: &VariableDeclaration<'_>) {
        if self.is_props_destructuring_declaration(decl) {
            return;
        }
        for declarator in &decl.declarations {
            if self.is_known_transform_declaration(declarator) {
                if self.is_reactive_transform_declaration(declarator) {
                    self.collect_active_state_binding_names(&declarator.id);
                } else {
                    self.collect_binding_names_skip_state(&declarator.id);
                }
            } else {
                self.collect_binding_names(&declarator.id);
            }
        }
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
        self.active_state_vars.push(FxHashSet::default());
    }

    /// Pop the current scope level.
    fn pop_scope(&mut self) {
        self.scoped_vars.pop();
        self.active_state_vars.pop();
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
            && !self.is_non_state_binding_shadowed(name)
    }

    /// Check if a name is a store subscription variable.
    fn is_active_store_sub(&self, name: &str) -> bool {
        self.store_sub_vars.contains(name) && !self.is_non_state_binding_shadowed(name)
    }

    /// Check if a name is a read-only prop.
    fn is_active_read_only_prop(&self, name: &str) -> bool {
        self.read_only_prop_names.contains(name) && !self.is_non_state_binding_shadowed(name)
    }

    /// Check if a name is a rest prop variable.
    fn is_active_rest_prop(&self, name: &str) -> bool {
        self.rest_prop_vars.contains(name) && !self.is_non_state_binding_shadowed(name)
    }

    /// If `expr` is a bare single-level `rest.x` StaticMemberExpression on an active
    /// rest-prop identifier (no parentheses / TS wrappers, non-computed), return the
    /// member expression's start offset. Used to suppress the `rest -> $$props`
    /// rewrite when such a member is a direct Assignment/Update operand, mirroring
    /// upstream's `grand_parent.type !== 'AssignmentExpression' | 'UpdateExpression'`.
    fn direct_rest_member_operand_start(&self, expr: &Expression<'_>) -> Option<u32> {
        if let Expression::StaticMemberExpression(member) = expr
            && let Expression::Identifier(obj) = &member.object
            && self.is_active_rest_prop(obj.name.as_str())
        {
            return Some(member.span.start);
        }
        None
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
        use crate::compiler::phases::phase2_analyze::scope::BindingKind;
        use crate::compiler::phases::phase3_transform::client::utils::is_prop_source;
        let store_name = &store_sub[1..]; // Strip leading $
        if self.prop_vars_for_store.contains(store_name) {
            format!("{}()", store_name) // prop getter
        } else if self.state_vars_for_store.contains(store_name)
            && !self.non_reactive_vars.contains(store_name)
        {
            format!("$.get({})", store_name) // reactive state getter
        } else if let Some(analysis) = self.analysis
            && let Some(idx) = analysis.root.find_binding_any_scope(store_name)
            && let Some(binding) = analysis.root.bindings.get(idx)
            && matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp)
            && !is_prop_source(binding, analysis)
        {
            // Non-source prop store (`const { store } = $props()`): the store
            // object is the prop value, read via `$$props.store` /
            // `$$props['alias']` — mirrors the store-getter declaration.
            match binding.prop_alias.as_deref().filter(|a| *a != store_name) {
                Some(alias) => format!("$$props[\"{}\"]", alias),
                None => format!("$$props.{}", store_name),
            }
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
    ///
    /// Also recognises yet-untransformed rune calls that the AST pass rewrites
    /// here (currently `$state.raw(...)` and `$state.frozen(...)`). Recognising
    /// them means the declarator name is *not* registered as a local shadow,
    /// which would otherwise prevent state-var transforms inside any later
    /// references to the same name.
    fn is_known_transform_declaration(&self, declarator: &VariableDeclarator<'_>) -> bool {
        if let Some(ref init) = declarator.init {
            let init_start = init.span().start as usize;
            let init_end = init.span().end as usize;
            if init_end <= self.source.len() {
                let init_text = &self.source[init_start..init_end];
                if init_text.starts_with("$.state(")
                    || init_text.starts_with("$.state.raw(")
                    || init_text.starts_with("$.derived(")
                    || init_text.starts_with("$.derived_by(")
                    || init_text.starts_with("await $.async_derived(")
                    || init_text.starts_with("$.prop(")
                    || init_text.starts_with("$.prop_source(")
                    || init_text.starts_with("$.rest_props(")
                    || init_text.starts_with("$.store_get(")
                {
                    return true;
                }
            }
            // AST-level recognition of `$state(...)` / `$state.raw(...)` /
            // `$state.frozen(...)` / `$derived(...)` / `$derived.by(...)`
            // declarators that this pass rewrites in
            // `visit_variable_declarator`.
            if self.is_state_call_init(init)
                || self.is_state_raw_or_frozen_init(init)
                || self.is_derived_call_init(init)
                || self.is_derived_by_init(init)
            {
                return true;
            }
        }
        false
    }

    /// Whether a known transform declaration introduces a reactive binding,
    /// rather than a prop/store helper binding. This distinction matters when
    /// root analysis retained an outer same-named prop declaration.
    fn is_reactive_transform_declaration(&self, declarator: &VariableDeclarator<'_>) -> bool {
        let Some(init) = &declarator.init else {
            return false;
        };
        let init_start = init.span().start as usize;
        let init_end = init.span().end as usize;
        if init_end <= self.source.len() {
            let init_text = &self.source[init_start..init_end];
            if init_text.starts_with("$.state(")
                || init_text.starts_with("$.state.raw(")
                || init_text.starts_with("$.derived(")
                || init_text.starts_with("$.derived_by(")
                || init_text.starts_with("await $.async_derived(")
            {
                return true;
            }
        }
        self.is_state_call_init(init)
            || self.is_state_raw_or_frozen_init(init)
            || self.is_derived_call_init(init)
            || self.is_derived_by_init(init)
    }

    /// Returns true if `init` is a plain `$derived(...)` CallExpression whose
    /// `$derived` reference is the rune (not shadowed, not a store sub).
    fn is_derived_call_init(&self, init: &Expression<'_>) -> bool {
        if !self.is_runes
            || self.is_shadowed("$derived")
            || self.store_sub_vars.contains("$derived")
        {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        let Expression::Identifier(ident) = &call.callee else {
            return false;
        };
        ident.name == "$derived"
    }

    /// Returns true if `init` is a plain `$state(...)` CallExpression whose
    /// `$state` reference is the rune (not shadowed, not a store sub).
    fn is_state_call_init(&self, init: &Expression<'_>) -> bool {
        if !self.is_runes || self.is_shadowed("$state") || self.store_sub_vars.contains("$state") {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        let Expression::Identifier(ident) = &call.callee else {
            return false;
        };
        ident.name == "$state"
    }

    /// Returns true if `init` is a `$state.raw(...)` / `$state.frozen(...)`
    /// CallExpression whose `$state` reference is the rune (not shadowed).
    fn is_state_raw_or_frozen_init(&self, init: &Expression<'_>) -> bool {
        if !self.is_runes || self.is_shadowed("$state") {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        let Expression::StaticMemberExpression(member) = &call.callee else {
            return false;
        };
        let Expression::Identifier(obj) = &member.object else {
            return false;
        };
        if obj.name != "$state" {
            return false;
        }
        matches!(member.property.name.as_str(), "raw" | "frozen")
    }

    /// Returns true if `init` is a `$derived.by(...)` CallExpression whose
    /// `$derived` reference is the rune (not shadowed, not a store sub).
    fn is_derived_by_init(&self, init: &Expression<'_>) -> bool {
        if !self.is_runes
            || self.is_shadowed("$derived")
            || self.store_sub_vars.contains("$derived")
        {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        let Expression::StaticMemberExpression(member) = &call.callee else {
            return false;
        };
        let Expression::Identifier(obj) = &member.object else {
            return false;
        };
        if obj.name != "$derived" {
            return false;
        }
        member.property.name == "by"
    }

    /// A same-line comment trailing a whole-statement `x++;` / `x--;`.
    /// Upstream rewrites the update by REUSING the argument node (with loc),
    /// so esrap's comment cursor pulls the trailing comment INSIDE the
    /// `$.update(...)` call; the text splice has to reproduce that placement.
    fn trailing_update_comment(&self, start: u32, end: u32) -> Option<TrailingUpdateComment> {
        let src = self.source.as_bytes();
        // Forward from `end`: horizontal ws, `;`, horizontal ws, then a comment
        // that is the last thing on the line.
        let mut j = end as usize;
        while j < src.len() && matches!(src[j], b' ' | b'\t') {
            j += 1;
        }
        if j >= src.len() || src[j] != b';' {
            return None;
        }
        j += 1;
        while j < src.len() && matches!(src[j], b' ' | b'\t') {
            j += 1;
        }
        let (comment, is_line, mut new_end) = if self.source[j..].starts_with("//") {
            let line_end = memchr::memchr(b'\n', &src[j..]).map_or(src.len(), |p| j + p);
            (
                self.source[j..line_end].trim_end().to_string(),
                true,
                line_end,
            )
        } else if self.source[j..].starts_with("/*") {
            let close = memchr::memmem::find(&src[j + 2..], b"*/")? + j + 4;
            let line_end = memchr::memchr(b'\n', &src[close..]).map_or(src.len(), |p| close + p);
            if !self.source[close..line_end].trim().is_empty() {
                return None;
            }
            (self.source[j..close].to_string(), false, close)
        } else {
            return None;
        };
        if is_line {
            new_end = new_end.min(src.len());
        }
        // Statement position: the last CODE byte before `start` (comment- and
        // string-aware) must end a statement or open a block. Run only after
        // the forward check succeeded — the prefix scan is O(prefix).
        let mut last_code: Option<u8> = None;
        for (_, c) in crate::compiler::phases::phase3_transform::shared::js_scan::code_bytes(
            &src[..start as usize],
        ) {
            if !c.is_ascii_whitespace() {
                last_code = Some(c);
            }
        }
        if !matches!(last_code, None | Some(b'{') | Some(b'}') | Some(b';')) {
            return None;
        }
        let line_start = memchr::memrchr(b'\n', &src[..start as usize]).map_or(0, |p| p + 1);
        let prefix = &self.source[line_start..start as usize];
        let indent: String = prefix
            .chars()
            .take_while(|c| *c == ' ' || *c == '\t')
            .collect();
        Some(TrailingUpdateComment {
            comment,
            is_line,
            new_end: new_end as u32,
            indent,
            line_start: line_start as u32,
            stmt_starts_line: prefix.trim().is_empty(),
        })
    }

    /// Comment spans inside the trivia region `source[from..to]` (between two
    /// code tokens, so only whitespace and comments can occur there).
    fn trivia_comment_spans(&self, from: u32, to: u32) -> Vec<(u32, u32)> {
        let mut spans = Vec::new();
        if from >= to || to as usize > self.source.len() {
            return spans;
        }
        let bytes = self.source.as_bytes();
        let mut i = from as usize;
        let end = to as usize;
        while i < end {
            if bytes[i].is_ascii_whitespace() {
                i += 1;
            } else if bytes[i] == b'/' && i + 1 < end && bytes[i + 1] == b'/' {
                let stop = memchr::memchr(b'\n', &bytes[i..end]).map_or(end, |p| i + p);
                spans.push((i as u32, stop as u32));
                i = stop;
            } else if bytes[i] == b'/' && i + 1 < end && bytes[i + 1] == b'*' {
                let Some(close) = memchr::memmem::find(&bytes[i + 2..end], b"*/") else {
                    return spans;
                };
                let stop = i + 2 + close + 2;
                spans.push((i as u32, stop as u32));
                i = stop;
            } else {
                break;
            }
        }
        spans
    }

    /// Render `spans` the way esrap's `flush_comments_until` does before the
    /// node starting at `to`: each comment is followed by a newline when the
    /// source has one before `to`, else by a space when `pad`.
    fn flush_trivia_comments(&self, spans: &[(u32, u32)], to: u32, pad: bool) -> String {
        let mut out = String::new();
        for &(start, end) in spans {
            out.push_str(&self.source[start as usize..end as usize]);
            if self.source[end as usize..to as usize].contains('\n') {
                out.push('\n');
            } else if pad {
                out.push(' ');
            }
        }
        out
    }

    /// The comments a rune call holds around its single argument: (everything
    /// between the callee and the argument — the `(` does not divide them —
    /// and everything between the argument and `)`).
    fn rune_call_comment_slots(
        &self,
        call: &CallExpression<'_>,
        arg_span: Span,
        init_span: Span,
    ) -> (Vec<(u32, u32)>, Vec<(u32, u32)>) {
        let callee_end = call.callee.span().end;
        let open = self
            .trivia_code_start(callee_end, arg_span.start)
            .filter(|&p| self.source.as_bytes().get(p as usize) == Some(&b'('))
            .map(|p| p + 1);
        // A comment between redundant parens and the callee (`(/* c */ $state(1))`)
        // is flushed before the value just like one inside the call's own parens.
        let mut pre = Vec::new();
        if init_span.start < call.span.start {
            let region =
                &self.source.as_bytes()[init_span.start as usize..call.span.start as usize];
            if let Some(last_open) = region.iter().rposition(|&b| b == b'(') {
                let from = init_span.start + last_open as u32 + 1;
                pre.extend(self.trivia_comment_spans(from, call.span.start));
            }
        }
        pre.extend(self.trivia_comment_spans(callee_end, arg_span.start));
        if let Some(open) = open {
            pre.extend(self.trivia_comment_spans(open, arg_span.start));
        }
        let post = self.trivia_comment_spans(arg_span.end, call.span.end.saturating_sub(1));
        (pre, post)
    }

    /// First code byte at/after `from` (skipping whitespace and comments),
    /// bounded by `to`.
    fn trivia_code_start(&self, from: u32, to: u32) -> Option<u32> {
        let bytes = self.source.as_bytes();
        let mut i = from as usize;
        let end = (to as usize).min(bytes.len());
        while i < end {
            if bytes[i].is_ascii_whitespace() {
                i += 1;
            } else if bytes[i] == b'/' && i + 1 < end && bytes[i + 1] == b'/' {
                i = memchr::memchr(b'\n', &bytes[i..end]).map_or(end, |p| i + p);
            } else if bytes[i] == b'/' && i + 1 < end && bytes[i + 1] == b'*' {
                let close = memchr::memmem::find(&bytes[i + 2..end], b"*/")?;
                i = i + 2 + close + 2;
            } else {
                return Some(i as u32);
            }
        }
        None
    }

    /// The comment run written between a declarator's binding and its rune
    /// call. Any code byte restarts the run, so a comment inside a type
    /// annotation — which is not adjacent to the call — is not one of them.
    ///
    /// Upstream never leaves these ahead of the declarator: the lowered call
    /// either inherits the source callee's `loc` (`$state`) or hands the
    /// argument to a node esrap flushes them inside, so they end up within the
    /// wrapper rather than before it.
    fn declarator_lead_comment_spans(&self, from: u32, to: u32) -> Vec<(u32, u32)> {
        let bytes = self.source.as_bytes();
        let mut i = from as usize;
        let end = (to as usize).min(bytes.len());
        let mut run: Vec<(u32, u32)> = Vec::new();
        while i < end {
            match bytes[i] {
                b if b.is_ascii_whitespace() => i += 1,
                b'/' if bytes.get(i + 1) == Some(&b'/') && i + 1 < end => {
                    let stop = memchr::memchr(b'\n', &bytes[i..end]).map_or(end, |p| i + p);
                    run.push((i as u32, stop as u32));
                    i = stop;
                }
                b'/' if bytes.get(i + 1) == Some(&b'*') && i + 1 < end => {
                    let Some(close) = memchr::memmem::find(&bytes[i + 2..end], b"*/") else {
                        return Vec::new();
                    };
                    let stop = i + 2 + close + 2;
                    run.push((i as u32, stop as u32));
                    i = stop;
                }
                quote @ (b'\'' | b'"' | b'`') => {
                    run.clear();
                    i += 1;
                    while i < end && bytes[i] != quote {
                        i += if bytes[i] == b'\\' { 2 } else { 1 };
                    }
                    i += 1;
                }
                _ => {
                    run.clear();
                    i += 1;
                }
            }
        }
        run
    }

    /// Same-line trailing comments (esrap's `flush_trailing_comments`): each is
    /// emitted after a space; a `//` comment forces a newline so it cannot
    /// swallow what the caller appends. Comments past the first newline are not
    /// trailing and are returned in `rest`.
    fn split_trailing_comments(
        &self,
        spans: &[(u32, u32)],
        prev_end: u32,
    ) -> (String, Vec<(u32, u32)>) {
        let mut out = String::new();
        let mut rest = Vec::new();
        let mut broken = false;
        for &(start, end) in spans {
            let same_line = !self.source[prev_end as usize..start as usize].contains('\n');
            if broken || !same_line {
                broken = true;
                rest.push((start, end));
                continue;
            }
            out.push(' ');
            out.push_str(&self.source[start as usize..end as usize]);
            if self.source[start as usize..].starts_with("//") {
                out.push('\n');
                broken = true;
            }
        }
        (out, rest)
    }

    /// Append comments that follow the rune argument to the statement, after
    /// the source `;` when there is one — the placement esrap gives them once
    /// the wrapper call that held them is gone. Returns the (possibly extended)
    /// replacement end.
    fn append_comments_past_semicolon(
        &self,
        spans: &[(u32, u32)],
        call_end: u32,
        replacement: &mut String,
    ) -> u32 {
        if spans.is_empty() {
            return call_end;
        }
        let bytes = self.source.as_bytes();
        let mut j = call_end as usize;
        while j < bytes.len() && matches!(bytes[j], b' ' | b'\t') {
            j += 1;
        }
        let end = if j < bytes.len() && bytes[j] == b';' {
            replacement.push(';');
            (j + 1) as u32
        } else {
            call_end
        };
        // A comment the source put on its own line becomes a leading comment of
        // the next statement, so esrap prints it after the statement break.
        let indent = self.line_indent(call_end);
        for &(start, cend) in spans {
            if starts_its_own_line(bytes, start as usize) {
                replacement.push_str("\n\n");
                replacement.push_str(indent);
            } else {
                replacement.push(' ');
            }
            replacement.push_str(&self.source[start as usize..cend as usize]);
        }
        end
    }

    /// The leading whitespace of the line `offset` sits on.
    fn line_indent(&self, offset: u32) -> &str {
        let head = &self.source[..offset as usize];
        let line_start = head.rfind('\n').map_or(0, |p| p + 1);
        let rest = &self.source[line_start..];
        &rest[..rest.len() - rest.trim_start_matches([' ', '\t']).len()]
    }

    /// Whether a blank line separates well: previous non-ws char before
    /// `line_start` opens a block or the previous line is already blank.
    fn margin_before_allowed(&self, line_start: u32) -> bool {
        let head = self.source[..line_start as usize].trim_end();
        !head.ends_with('{') && !self.source[head.len()..line_start as usize].contains("\n\n")
    }

    fn margin_after_allowed(&self, new_end: u32) -> bool {
        let tail = &self.source[new_end as usize..];
        let after_line = tail.strip_prefix('\n').unwrap_or(tail);
        let next = after_line.trim_start();
        !next.starts_with('}') && !next.is_empty() && !after_line.starts_with('\n')
    }

    /// Add a replacement.
    fn add_replacement(&mut self, start: u32, end: u32, text: String) {
        if self
            .replacements
            .last()
            .is_some_and(|last| last.start > start)
        {
            self.replacements_sorted = false;
        }
        self.replacements.push(Replacement { start, end, text });
    }

    /// Dev-mode `$.tag(...)` / `$.tag_proxy(...)` wrap for `let name = $.X(...)`
    /// rune-declarator outputs. Mirrors the byte-shape match
    /// `wrap_state_derived_with_tag` performed over the text-pipeline result —
    /// when the produced replacement leads with `$.state(` / `$.derived(` /
    /// `$.proxy(`, fold in the tag wrap here. Other shapes (bare arg,
    /// `void 0`, `await $.async_derived(...)`, etc.) are left untagged to
    /// match the text-path behaviour exactly.
    ///
    /// Folding the tag wrap into the declarator handlers means the post-AST
    /// `wrap_state_derived_with_tag` re-scan in `transform_client`
    /// no longer has to walk the script in dev mode, eliminating one
    /// O(text_len) buffer pass per component.
    fn maybe_tag_declarator(&self, var_name: &str, replacement: String) -> String {
        self.maybe_tag_declarator_with_lead(var_name, replacement, "")
            .0
    }

    /// [`Self::maybe_tag_declarator`], with the declarator's leading comment run
    /// placed just inside the tag call and a flag saying whether a wrap
    /// happened — the caller needs it to decide whether its replacement span
    /// has to swallow those comments.
    ///
    /// `lead` only belongs inside the wrap for `$.state(`: upstream builds that
    /// callee with the source `$state` callee's `loc`, so esrap flushes the
    /// comments right before it. `$.proxy(` is built with a plain string callee
    /// and carries no `loc`, which puts the comments before its argument
    /// instead — its caller folds them into the argument text rather than
    /// passing them here.
    fn maybe_tag_declarator_with_lead(
        &self,
        var_name: &str,
        replacement: String,
        lead: &str,
    ) -> (String, bool) {
        if !self.dev {
            return (replacement, false);
        }
        let head = replacement.as_str();
        if head.starts_with("$.state(") || head.starts_with("$.derived(") {
            (format!("$.tag({lead}{replacement}, '{var_name}')"), true)
        } else if head.starts_with("$.proxy(") {
            (format!("$.tag_proxy({replacement}, '{var_name}')"), true)
        } else {
            (replacement, false)
        }
    }

    /// AST replacement for `$state.raw(value)` / `$state.frozen(value)` rune
    /// declarators. Mirrors the text-pipeline rewrite that used to live in
    /// `rune_transforms::transform_client_runes_with_skip_and_state`:
    /// - Non-reactive binding (in `non_reactive_vars`): replace the whole call
    ///   span with the argument text (or `void 0` for empty calls).
    /// - Reactive binding: replace with `$.state(arg)`.
    ///
    /// Returns `true` when this declarator matched and was handled — the caller
    /// then skips the default walk so the init expression is not re-visited
    /// (which would double-add inner replacements). Returns `false` for
    /// destructured patterns and for any other declarator shape; those still
    /// walk normally (and destructured cases are handled by the upstream text
    /// pipeline's `transform_state_destructuring` helper).
    fn try_rewrite_state_raw_or_frozen_declarator(
        &mut self,
        declarator: &VariableDeclarator<'_>,
    ) -> bool {
        let Some(init) = &declarator.init else {
            return false;
        };
        let (init, init_span) = init_without_parens(init);
        if !self.is_state_raw_or_frozen_init(init) {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        // Only simple `let name = $state.raw(...)` bindings — destructured
        // patterns are handled by the upstream text path's
        // `transform_state_destructuring` (which produces already-`$.state(…)`
        // output that we leave untouched).
        let BindingPattern::BindingIdentifier(id) = &declarator.id else {
            return false;
        };
        if call.arguments.len() > 1 {
            return false;
        }

        let var_name = id.name.as_str();
        let is_non_reactive = self.non_reactive_vars.contains(var_name);

        // Walk the (optional) argument first so any inner state-var refs get
        // `$.get(...)` wrapping, then drain those inner replacements and bake
        // them into the outer text — matching the behaviour the text pipeline
        // produced indirectly (it emitted `$.state(arg)` which the AST then
        // visited and rewrote inner refs of).
        let mut pre_comments = String::new();
        let mut post_comments: Vec<(u32, u32)> = Vec::new();
        let mut arg_end = call.span.end;
        let arg_text = if let Some(arg) = call.arguments.first() {
            self.visit_argument(arg);
            let arg_span = arg.span();
            let (pre, post) = self.rune_call_comment_slots(call, arg_span, init_span);
            pre_comments = self.flush_trivia_comments(&pre, arg_span.start, true);
            post_comments = post;
            arg_end = arg_span.end;
            let transformed = self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);
            if transformed.trim().is_empty() {
                "void 0".to_string()
            } else {
                transformed
            }
        } else {
            "void 0".to_string()
        };
        let arg_text = format!("{pre_comments}{arg_text}");

        let (trailing, spilled) = if is_non_reactive {
            (String::new(), post_comments)
        } else {
            self.split_trailing_comments(&post_comments, arg_end)
        };

        let replacement = if is_non_reactive {
            arg_text
        } else {
            format!("$.state({arg_text}{trailing})")
        };

        let lead_spans = self.declarator_lead_comment_spans(id.span().end, call.span.start);
        let lead = self.flush_trivia_comments(&lead_spans, call.span.start, true);
        let (mut replacement, tagged) =
            self.maybe_tag_declarator_with_lead(var_name, replacement, &lead);
        let start = match lead_spans.first() {
            Some(&(first, _)) if tagged => first,
            _ => call.span.start,
        };
        let end = self.append_comments_past_semicolon(&spilled, call.span.end, &mut replacement);
        self.add_replacement(start, end, replacement);
        true
    }

    /// AST replacement for plain `$state(value)` rune declarators. Mirrors the
    /// text-pipeline rewrite that used to live in
    /// `rune_transforms::transform_client_runes_with_skip_and_state`:
    ///
    /// |                    | non-reactive (in `non_reactive_vars`)        | reactive                                      |
    /// | `$state()` (empty) | `void 0`                                     | `$.state(void 0)`                             |
    /// | `$state(prim)`     | `prim`                                       | `$.state(prim)`                               |
    /// | `$state(undefined)`| `undefined` (source spelling kept, #3049)    | `$.state(undefined)` (literal kept)           |
    /// | `$state(obj/arr/…)`| `$.proxy(obj/arr/…)` if `should_proxy_ast`   | `$.state($.proxy(obj/arr/…))`                 |
    ///
    /// Proxy decision uses `should_proxy_ast(arg, &[])` — the text pipeline
    /// it replaces used a scope-less `expression_needs_proxy(...)` here, so
    /// we pass an empty `non_proxy_vars` to keep behaviour byte-identical.
    fn try_rewrite_state_call_declarator(&mut self, declarator: &VariableDeclarator<'_>) -> bool {
        let Some(init) = &declarator.init else {
            return false;
        };
        let (init, init_span) = init_without_parens(init);
        if !self.is_state_call_init(init) {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        // Only simple `let name = $state(...)` bindings — destructured
        // patterns are handled by the upstream text path's
        // `transform_state_destructuring` (which produces already-`$.state(…)`
        // output that we leave untouched).
        let BindingPattern::BindingIdentifier(id) = &declarator.id else {
            return false;
        };
        if call.arguments.len() > 1 {
            return false;
        }

        let var_name = id.name.as_str();
        let is_non_reactive = self.non_reactive_vars.contains(var_name);

        // Snapshot a few facts from the original argument AST *before* walking,
        // because the walk drains/replaces inner spans that we want to query
        // by node kind here (not by post-rewrite text).
        let needs_proxy = if let Some(arg) = call.arguments.first() {
            arg.as_expression()
                .map(|e| should_proxy_ast(e, self.non_proxy_vars, self.dev))
                .unwrap_or(false)
        } else {
            false
        };

        // Walk the argument first so any inner state-var refs get `$.get(...)`
        // wrapping, then drain those inner replacements and bake them into
        // the outer text. This matches the behaviour the old text path
        // produced indirectly: it emitted `$.state(arg)` (or `$.proxy(arg)`)
        // which the existing AST pass then re-visited and rewrote inner
        // refs of.
        let mut pre_comments = String::new();
        let mut post_comments: Vec<(u32, u32)> = Vec::new();
        let mut arg_end = call.span.end;
        let arg_text = if let Some(arg) = call.arguments.first() {
            self.visit_argument(arg);
            let arg_span = arg.span();
            let (pre, post) = self.rune_call_comment_slots(call, arg_span, init_span);
            pre_comments = self.flush_trivia_comments(&pre, arg_span.start, true);
            post_comments = post;
            arg_end = arg_span.end;
            let transformed = self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);
            if transformed.trim().is_empty() {
                "void 0".to_string()
            } else {
                transformed
            }
        } else {
            "void 0".to_string()
        };
        // `$.proxy` is the only wrapper here built with a plain string callee,
        // so it carries no `loc` and the declarator's leading comments flush
        // before its ARGUMENT rather than before the call.
        let lead_spans = self.declarator_lead_comment_spans(id.span().end, call.span.start);
        let proxy_is_head = is_non_reactive && needs_proxy;
        let lead_before_arg = if proxy_is_head {
            self.flush_trivia_comments(&lead_spans, call.span.start, true)
        } else {
            String::new()
        };
        let arg_text = format!("{lead_before_arg}{pre_comments}{arg_text}");

        let bare = is_non_reactive && !needs_proxy;
        // A wrapper call keeps same-line trailing comments inside its parens
        // (the argument node still precedes a `)`); the bare-argument form has
        // no node after them, so they land after the statement's `;`.
        let (trailing, spilled) = if bare {
            (String::new(), post_comments)
        } else {
            self.split_trailing_comments(&post_comments, arg_end)
        };

        let replacement = if is_non_reactive {
            if needs_proxy {
                format!("$.proxy({arg_text}{trailing})")
            } else {
                // Upstream keeps the spelling the source used — an explicit
                // `$state(undefined)` stays `undefined`, never `void 0` (#3049).
                arg_text
            }
        } else if needs_proxy {
            format!("$.state($.proxy({arg_text}{trailing}))")
        } else {
            format!("$.state({arg_text}{trailing})")
        };

        let lead_before_call = if proxy_is_head {
            String::new()
        } else {
            self.flush_trivia_comments(&lead_spans, call.span.start, true)
        };
        let (mut replacement, tagged) =
            self.maybe_tag_declarator_with_lead(var_name, replacement, &lead_before_call);
        let start = match lead_spans.first() {
            Some(&(first, _)) if proxy_is_head || tagged => first,
            _ => call.span.start,
        };
        let end = self.append_comments_past_semicolon(&spilled, call.span.end, &mut replacement);
        self.add_replacement(start, end, replacement);
        true
    }

    /// AST replacement for destructured `$state(...)` / `$state.raw(...)` rune
    /// declarators. Mirrors `rune_transforms::transform_state_destructuring`:
    ///
    /// - `let { a, b } = $state(expr)` →
    ///   `let tmp = wrapped_expr, a = $.state($.proxy(tmp.a)), b = $.state($.proxy(tmp.b))`
    /// - `let { a: b } = $state(expr)` (renamed) →
    ///   `let tmp = wrapped_expr, b = $.state($.proxy(tmp.a))`
    /// - `let [a, b] = $state(expr)` →
    ///   `let tmp = wrapped_expr, $$array = $.derived(() => $.to_array(tmp, 2)), a = $.state($.proxy($.get($$array)[0])), b = ...`
    /// - `$state.raw(...)` skips the inner `$.proxy(...)` wrap (raw → reactive
    ///   but not proxied; raw + skip → just the member access).
    ///
    /// Returns `true` if matched; the caller then skips the default walk so
    /// the init expression is not re-visited.
    fn try_rewrite_state_destructuring_declarator(
        &mut self,
        declarator: &VariableDeclarator<'_>,
    ) -> bool {
        let Some(init) = &declarator.init else {
            return false;
        };
        let (init, init_span) = init_without_parens(init);

        // Determine $state vs $state.raw (text path doesn't handle frozen
        // destructuring, so we match the same shapes only).
        let (is_raw, call) = if self.is_state_call_init(init) {
            let Expression::CallExpression(c) = init else {
                return false;
            };
            (false, c)
        } else if self.is_state_raw_init(init) {
            let Expression::CallExpression(c) = init else {
                return false;
            };
            (true, c)
        } else {
            return false;
        };

        if call.arguments.len() > 1 {
            return false;
        }

        // Destructured pattern only — simple BindingIdentifier is handled by
        // try_rewrite_state_call_declarator / try_rewrite_state_raw_or_frozen_declarator.
        let is_destructured = matches!(
            &declarator.id,
            BindingPattern::ObjectPattern(_) | BindingPattern::ArrayPattern(_)
        );
        if !is_destructured {
            return false;
        }

        // Walk source so inner state-var refs get `$.get(...)` wraps, then
        // drain those inner replacements into the source substring we'll
        // embed in the tmp declaration.
        let source_text = if let Some(arg) = call.arguments.first() {
            self.visit_argument(arg);
            let arg_span = arg.span();
            self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end)
        } else {
            "void 0".to_string()
        };

        let tmp_idx = STATE_TMP_COUNTER.with(|c| {
            let cur = c.get();
            c.set(cur + 1);
            cur
        });
        let tmp_name = if tmp_idx == 0 {
            "tmp".to_string()
        } else {
            format!("tmp_{}", tmp_idx)
        };

        let mut declarations = vec![format!("{} = {}", tmp_name, source_text.trim())];

        match &declarator.id {
            BindingPattern::ObjectPattern(obj) => {
                if !self.collect_state_object_pattern(obj, &tmp_name, is_raw, &mut declarations) {
                    return false;
                }
            }
            BindingPattern::ArrayPattern(arr) => {
                if !self.collect_state_array_pattern(arr, &tmp_name, is_raw, &mut declarations) {
                    return false;
                }
            }
            _ => return false,
        }

        if declarations.len() <= 1 {
            return false;
        }

        let replacement = declarations.join(", ");
        let start = declarator.id.span().start;
        let end = init_span.end;
        self.add_replacement(start, end, replacement);
        true
    }

    /// Returns true if `init` is a `$state.raw(...)` CallExpression (not
    /// `$state.frozen(...)`) — the destructuring text path only matched
    /// `$state.raw(` so the destructuring AST migration narrows to the same.
    fn is_state_raw_init(&self, init: &Expression<'_>) -> bool {
        if !self.is_runes || self.is_shadowed("$state") {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        let Expression::StaticMemberExpression(member) = &call.callee else {
            return false;
        };
        let Expression::Identifier(obj) = &member.object else {
            return false;
        };
        obj.name == "$state" && member.property.name == "raw"
    }

    /// Walk an ObjectPattern and append `name = $.state(...)` declarations
    /// for each property. Returns false if any property is unsupported
    /// (nested pattern beyond simple identifier targets, etc.) so the caller
    /// can bail back to the text path.
    fn collect_state_object_pattern(
        &mut self,
        obj: &ObjectPattern<'_>,
        tmp_name: &str,
        is_raw: bool,
        declarations: &mut Vec<String>,
    ) -> bool {
        for prop in &obj.properties {
            // Inner target must be a plain BindingIdentifier; nested
            // destructuring inside state isn't supported by the text path
            // either (it only handles flat patterns).
            let value_pattern = match &prop.value {
                BindingPattern::BindingIdentifier(_) => &prop.value,
                BindingPattern::AssignmentPattern(_) => &prop.value,
                _ => return false,
            };
            let (var_ident, default_span) = match value_pattern {
                BindingPattern::BindingIdentifier(id) => (id, None),
                BindingPattern::AssignmentPattern(assign) => match &assign.left {
                    BindingPattern::BindingIdentifier(id) => (id, Some(assign.right.span())),
                    _ => return false,
                },
                _ => return false,
            };
            let var_name = var_ident.name.as_str();

            let is_skip = self.is_state_destructure_skip(var_name);
            let member_access = self.state_key_access(tmp_name, prop);
            let access = self.apply_pattern_default(member_access, default_span);
            let value_expr = wrap_state_value(&access, is_raw, is_skip);
            let value_expr = self.maybe_tag_declarator(var_name, value_expr);
            declarations.push(format!("{} = {}", var_name, value_expr));
        }

        if let Some(rest) = &obj.rest {
            let var_ident = match &rest.argument {
                BindingPattern::BindingIdentifier(id) => id,
                _ => return false,
            };
            let var_name = var_ident.name.as_str();
            let is_skip = self.is_state_destructure_skip(var_name);
            let keys: Vec<String> = obj
                .properties
                .iter()
                .map(|prop| self.state_exclude_key_literal(prop))
                .collect();
            let access = format!("$.exclude_from_object({}, [{}])", tmp_name, keys.join(", "));
            let value_expr = if is_raw {
                access
            } else if is_skip {
                format!("$.proxy({})", access)
            } else {
                format!("$.state($.proxy({}))", access)
            };
            let value_expr = self.maybe_tag_declarator(var_name, value_expr);
            declarations.push(format!("{} = {}", var_name, value_expr));
        }
        true
    }

    /// Member access for a destructured `$state` property key, mirroring
    /// upstream's
    /// `b.member(expression, prop.key, prop.computed || prop.key.type !== 'Identifier')`.
    /// The key's source text is reused verbatim so a literal keeps its original
    /// quoting, as upstream's printer does.
    fn state_key_access(&self, tmp_name: &str, prop: &BindingProperty<'_>) -> String {
        if !prop.computed
            && let PropertyKey::StaticIdentifier(id) = &prop.key
        {
            return format!("{}.{}", tmp_name, id.name);
        }
        let span = prop.key.span();
        format!(
            "{}[{}]",
            tmp_name,
            self.source[span.start as usize..span.end as usize].trim()
        )
    }

    /// The `$.exclude_from_object(tmp, [...])` entry for a non-rest property key.
    /// Upstream turns identifier and `Literal` keys into string literals and every
    /// other computed key into `String(<expr>)`, so the rest subtracts it at runtime.
    fn state_exclude_key_literal(&self, prop: &BindingProperty<'_>) -> String {
        if !prop.computed
            && let PropertyKey::StaticIdentifier(id) = &prop.key
        {
            return format!("'{}'", escape_js_string(id.name.as_str()));
        }
        match &prop.key {
            PropertyKey::StringLiteral(s) => format!("'{}'", escape_js_string(s.value.as_str())),
            PropertyKey::NumericLiteral(n) => format!("'{}'", js_number_to_string(n.value)),
            key => {
                let span = key.span();
                format!(
                    "String({})",
                    self.source[span.start as usize..span.end as usize].trim()
                )
            }
        }
    }

    /// Wrap a destructured access in `$.fallback(...)` when the pattern element
    /// carried a default, mirroring upstream's `AssignmentPattern` →
    /// `build_fallback` step in `extract_paths`.
    fn apply_pattern_default(&self, access: String, default_span: Option<Span>) -> String {
        match default_span {
            Some(span) => build_fallback_string(
                &access,
                self.source[span.start as usize..span.end as usize].trim(),
            ),
            None => access,
        }
    }

    /// Walk an ArrayPattern and append the `$$array = $.derived(() => $.to_array(...))`
    /// helper plus per-element declarations. Mirrors
    /// `process_state_array_pattern` in the text path.
    fn collect_state_array_pattern(
        &mut self,
        arr: &ArrayPattern<'_>,
        tmp_name: &str,
        is_raw: bool,
        declarations: &mut Vec<String>,
    ) -> bool {
        let has_rest = arr.rest.is_some();
        let element_count = arr.elements.len();
        let global_counter = SCRIPT_ARRAY_COUNTER.with(|c| {
            let cur = c.get();
            c.set(cur + 1);
            cur
        });
        let array_var = if global_counter == 0 {
            "$$array".to_string()
        } else {
            format!("$$array_{}", global_counter)
        };

        let to_array_args = if has_rest {
            format!("$.to_array({})", tmp_name)
        } else {
            format!("$.to_array({}, {})", tmp_name, element_count)
        };
        // The temp holding the iterable is labelled by pattern kind, not by a
        // binding name — it has none. `collect_state_array_pattern` only ever
        // runs for a top-level array pattern, so the kind is fixed; the sibling
        // form upstream can emit is `'[$state object]'`.
        let array_init = if self.dev {
            format!(
                "$.tag($.derived(() => {}), '[$state iterable]')",
                to_array_args
            )
        } else {
            format!("$.derived(() => {})", to_array_args)
        };
        declarations.push(format!("{} = {}", array_var, array_init));

        for (index, elem_opt) in arr.elements.iter().enumerate() {
            let Some(elem) = elem_opt else { continue };
            let (var_ident, default_span) = match elem {
                BindingPattern::BindingIdentifier(id) => (id, None),
                BindingPattern::AssignmentPattern(assign) => match &assign.left {
                    BindingPattern::BindingIdentifier(id) => (id, Some(assign.right.span())),
                    _ => return false,
                },
                _ => return false,
            };
            let var_name = var_ident.name.as_str();
            let is_skip = self.is_state_destructure_skip(var_name);
            let element_access = format!("$.get({})[{}]", array_var, index);
            let element_access = self.apply_pattern_default(element_access, default_span);
            let value_expr = wrap_state_value(&element_access, is_raw, is_skip);
            let value_expr = self.maybe_tag_declarator(var_name, value_expr);
            declarations.push(format!("{} = {}", var_name, value_expr));
        }

        if let Some(rest) = &arr.rest {
            let var_ident = match &rest.argument {
                BindingPattern::BindingIdentifier(id) => id,
                _ => return false,
            };
            let var_name = var_ident.name.as_str();
            let is_skip = self.is_state_destructure_skip(var_name);
            let access = format!("$.get({}).slice({})", array_var, element_count);
            let value_expr = wrap_state_value(&access, is_raw, is_skip);
            let value_expr = self.maybe_tag_declarator(var_name, value_expr);
            declarations.push(format!("{} = {}", var_name, value_expr));
        }
        true
    }

    /// The text destructuring helper passes the `skip_state_vars` list as
    /// `non_reactive_state_vars` — vars whose binding kind is RawState (i.e.
    /// non-proxied state). We reuse the same `non_reactive_vars` source the
    /// rest of the visitor uses.
    fn is_state_destructure_skip(&self, name: &str) -> bool {
        self.non_reactive_vars.contains(name)
    }

    /// AST replacement for destructured `$derived(...)` rune declarators.
    /// Mirrors `rune_transforms::transform_derived_destructuring` — uses the
    /// shared text-based pattern processor `process_derived_destructuring_pattern`
    /// for the recursive pattern walk (which itself only operates on strings,
    /// not the script), but performs detection and source-argument walking
    /// at the AST level so we avoid scanning the whole script for
    /// `let|const|var ... = $derived(...)` shapes.
    ///
    /// Output shape depends on the source expression:
    ///   - simple identifier `name` → `base_expr` is just `wrapped_name`
    ///     (no `$$d` temp needed)
    ///   - top-level `await` → `$$d = await $.async_derived(...)`, base
    ///     becomes `$.get($$d)`
    ///   - object literal → `$$d = $.derived(() => (obj))`,
    ///     base = `$.get($$d)`
    ///   - default → `$$d = $.derived(unthunked)`, base = `$.get($$d)`
    ///
    /// The pattern (object or array) is then processed by the shared text
    /// helper, which recursively emits `name = $.derived(() => base.key)`,
    /// `$$array = $.derived(() => $.to_array(base, count))` for nested
    /// array patterns, and the `$.exclude_from_object(...)` form for rest
    /// elements.
    fn try_rewrite_derived_destructuring_declarator(
        &mut self,
        declarator: &VariableDeclarator<'_>,
    ) -> bool {
        let Some(init) = &declarator.init else {
            return false;
        };
        let (init, init_span) = init_without_parens(init);
        if !self.is_derived_call_init(init) {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        // Destructured pattern only — simple BindingIdentifier is handled by
        // try_rewrite_derived_call_declarator.
        let is_destructured = matches!(
            &declarator.id,
            BindingPattern::ObjectPattern(_) | BindingPattern::ArrayPattern(_)
        );
        if !is_destructured {
            return false;
        }
        if call.arguments.len() != 1 {
            return false;
        }

        // Snapshot the original (pre-walk) source-text shape — the text
        // version inspects the raw bytes to decide which init shape to
        // emit. We reuse that.
        let arg = &call.arguments[0];
        let arg_span = arg.span();
        let source_orig = self.source[arg_span.start as usize..arg_span.end as usize].to_string();
        let source_orig_trimmed = source_orig.trim();
        let source_is_identifier = !source_orig_trimmed.is_empty()
            && source_orig_trimmed
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
        let contains_await = contains_direct_await_in_expression(source_orig_trimmed);

        // Walk the source argument so inner state-var refs get `$.get(...)`
        // wraps; drain those into the wrapped source text we embed in the
        // generated declarations.
        self.visit_argument(arg);
        let wrapped_source = self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);

        // Extract the destructured pattern's source text — the recursive
        // text helper walks this string. Walk it first so a default value
        // carries the same rewrites any other expression would (the dev
        // equality instrumentation, above all); binding names are visited as
        // declarations, not references, so they stay untouched.
        let pattern_span = declarator.id.span();
        self.visit_binding_pattern(&declarator.id);
        let pattern_text =
            self.apply_and_drain_inner_replacements(pattern_span.start, pattern_span.end);
        let pattern_text = pattern_text.trim().to_string();

        let mut declarations: Vec<String> = Vec::new();

        let d_name = if source_is_identifier {
            String::new()
        } else {
            DERIVED_TMP_COUNTER.with(|c| {
                let n = c.get();
                c.set(n + 1);
                if n == 0 {
                    "$$d".to_string()
                } else {
                    format!("$$d_{}", n)
                }
            })
        };

        let base_expr = if source_is_identifier {
            wrapped_source.clone()
        } else if contains_await {
            // Async derived destructuring — mirror the text path's
            // `await $.async_derived(...)` emission. Upstream's
            // `VariableDeclaration.js` passes the value through unchanged; only
            // `create_derived` (`{@const}`) wraps it in `$.save(...)`.
            let saved_content = wrap_await_with_save_in_async_derived(wrapped_source.trim());
            let inner_expr = strip_top_level_await_from_expr(&saved_content);
            let inner_has_nested_await = contains_direct_await_in_expression(&inner_expr);
            let is_array_pattern = matches!(&declarator.id, BindingPattern::ArrayPattern(_));
            let label = destructured_label(is_array_pattern);
            let lookup_name = first_bound_name(&declarator.id).unwrap_or_default();
            let dev_tail = dev_args(self.async_derived_locations, label, &lookup_name);

            if inner_has_nested_await {
                let is_object = saved_content.trim().starts_with('{');
                let stmt = if is_object {
                    format!(
                        "{d_name} = await $.async_derived(async () => ({saved_content}){dev_tail})"
                    )
                } else {
                    format!(
                        "{d_name} = await $.async_derived(async () => {saved_content}{dev_tail})"
                    )
                };
                declarations.push(stmt);
            } else {
                let inner_trimmed = inner_expr.trim();
                let inner_is_object = inner_trimmed.starts_with('{');
                if inner_is_object {
                    declarations.push(format!(
                        "{d_name} = await $.async_derived(() => ({inner_expr}){dev_tail})"
                    ));
                } else {
                    let thunk_arg = unthunk_string(&inner_expr);
                    declarations.push(format!(
                        "{d_name} = await $.async_derived({thunk_arg}{dev_tail})"
                    ));
                }
            }
            format!("$.get({})", d_name)
        } else {
            // Object literal needs paren-wrap so the arrow body isn't
            // parsed as a block.
            if wrapped_source.trim_start().starts_with('{') {
                declarations.push(format!(
                    "{} = $.derived(() => ({}))",
                    d_name, wrapped_source
                ));
            } else {
                let derived_arg = unthunk_string(&wrapped_source);
                declarations.push(format!("{} = $.derived({})", d_name, derived_arg));
            }
            format!("$.get({})", d_name)
        };

        // When destructuring `$derived(props)` where `props` is a `...rest`
        // binding (`$.rest_props($$props, …)`), named members read straight from
        // `$$props` — mirroring upstream's rest-prop member rewrite
        // (`props.ssr` → `$$props.ssr`) — while the top-level `...rest` element
        // keeps `props` for `$.exclude_from_object(props, …)`.
        let member_base = if source_is_identifier && self.is_active_rest_prop(source_orig_trimmed) {
            "$$props".to_string()
        } else {
            base_expr.clone()
        };

        let insert_label = derived_insert_label(self.dev, &pattern_text);
        let mut array_counter: usize = 0;
        if process_derived_destructuring_pattern(
            &pattern_text,
            &base_expr,
            &member_base,
            &mut declarations,
            &mut array_counter,
            insert_label,
            "$$array",
        )
        .is_none()
        {
            return false;
        }
        if declarations.is_empty() {
            return false;
        }
        tag_derived_leaves(&mut declarations, self.dev);

        // Replacement covers [pattern_start, init_end] so the keyword and
        // optional trailing pieces of the VariableDeclaration remain.
        let replacement = declarations.join(",\n\t");
        let start = pattern_span.start;
        let end = init_span.end;
        self.add_replacement(start, end, replacement);
        true
    }

    /// AST replacement for destructured `$derived.by(fn)` rune declarators.
    /// Mirrors `rune_transforms::transform_derived_by_destructuring`.
    ///
    /// Unlike plain `$derived(expr)` which has multiple init shapes,
    /// `$derived.by(fn)` always allocates a fresh `$$d` temp and passes
    /// the callback directly to `$.derived(...)` — the callback is
    /// already a function so no arrow wrap is needed. The shared
    /// recursive `process_derived_destructuring_pattern` then emits the
    /// per-key/element `name = $.derived(() => $.get($$d).key)` lines.
    fn try_rewrite_derived_by_destructuring_declarator(
        &mut self,
        declarator: &VariableDeclarator<'_>,
    ) -> bool {
        let Some(init) = &declarator.init else {
            return false;
        };
        let (init, init_span) = init_without_parens(init);
        if !self.is_derived_by_init(init) {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        let is_destructured = matches!(
            &declarator.id,
            BindingPattern::ObjectPattern(_) | BindingPattern::ArrayPattern(_)
        );
        if !is_destructured {
            return false;
        }
        if call.arguments.len() != 1 {
            return false;
        }

        // Walk the callback so inner state-var refs get `$.get(...)`
        // wrapping inside the embedded source text, then drain.
        let arg = &call.arguments[0];
        let arg_span = arg.span();
        self.visit_argument(arg);
        let wrapped_source = self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);

        let pattern_span = declarator.id.span();
        let pattern_text =
            self.source[pattern_span.start as usize..pattern_span.end as usize].to_string();
        let pattern_text = pattern_text.trim().to_string();

        let d_name = DERIVED_TMP_COUNTER.with(|c| {
            let n = c.get();
            c.set(n + 1);
            if n == 0 {
                "$$d".to_string()
            } else {
                format!("$$d_{}", n)
            }
        });

        let mut declarations: Vec<String> =
            vec![format!("{} = $.derived({})", d_name, wrapped_source)];
        let base_expr = format!("$.get({})", d_name);
        let insert_label = derived_insert_label(self.dev, &pattern_text);
        let mut array_counter: usize = 0;
        if process_derived_destructuring_pattern(
            &pattern_text,
            &base_expr,
            &base_expr,
            &mut declarations,
            &mut array_counter,
            insert_label,
            "$$array",
        )
        .is_none()
        {
            return false;
        }
        if declarations.is_empty() {
            return false;
        }
        tag_derived_leaves(&mut declarations, self.dev);

        let replacement = declarations.join(",\n\t");
        let start = pattern_span.start;
        let end = init_span.end;
        self.add_replacement(start, end, replacement);
        true
    }

    /// AST replacement for `let { x, y } = $props()` (and the simple
    /// `let props = $props()` identifier form). Detection happens at the
    /// AST level; the heavy lifting — flag computation (PROPS_IS_RUNES /
    /// IMMUTABLE / UPDATED / BINDABLE / LAZY_INITIAL), `$.prop()` /
    /// `$.rest_props()` emission, comment / default-value handling — is
    /// delegated to the shared `transform_props_destructuring` text helper,
    /// which depends on `ComponentAnalysis` for per-binding flags. The
    /// detection replaces the per-statement byte scan
    /// `memmem::find(result.as_bytes(), b"$props()")` that used to live
    /// in `transform_client_runes_with_skip_and_state`.
    /// Whether `try_rewrite_props_destructuring_declaration` owns this declaration,
    /// and so whether it registers no names. Shared with the hoisting pre-pass, which
    /// must skip exactly the same declarations or it shadows the props themselves.
    fn is_props_destructuring_declaration(&self, decl: &VariableDeclaration<'_>) -> bool {
        if decl.declarations.len() != 1 {
            return false;
        }
        let declarator = &decl.declarations[0];
        let Some(init) = &declarator.init else {
            return false;
        };
        let (init, _) = init_without_parens(init);
        let Expression::CallExpression(call) = init else {
            return false;
        };
        if !call.arguments.is_empty() {
            return false;
        }
        let Expression::Identifier(ident) = &call.callee else {
            return false;
        };
        if ident.name != "$props" || self.is_shadowed("$props") {
            return false;
        }
        // The text helper needs `ComponentAnalysis` for binding-kind / accessor /
        // immutable lookups. Unit-test paths construct the visitor with
        // `analysis: None` and therefore bypass this migration.
        if self.analysis.is_none() {
            return false;
        }
        matches!(
            &declarator.id,
            BindingPattern::BindingIdentifier(_) | BindingPattern::ObjectPattern(_)
        )
    }

    fn try_rewrite_props_destructuring_declaration(
        &mut self,
        decl: &VariableDeclaration<'_>,
    ) -> bool {
        if !self.is_props_destructuring_declaration(decl) {
            return false;
        }
        let declarator = &decl.declarations[0];
        let Some(init) = &declarator.init else {
            return false;
        };
        let (init, init_span) = init_without_parens(init);
        let Expression::CallExpression(call) = init else {
            return false;
        };
        let Some(analysis) = self.analysis else {
            return false;
        };

        // Walk inner expressions (default-value sub-trees, etc.) so any
        // state-var refs register their `$.get(...)` replacements. We
        // then drain those into the source substring we feed to the
        // text helper — `state1` inside `let { x = state1 } = $props()`
        // becomes `$.get(state1)` in the helper input, and the helper
        // copies it verbatim into the emitted `$.prop(...)` default arg.
        walk::walk_variable_declarator(self, declarator);
        // The shared text helper matches `= $props()`, so redundant parens
        // around the call are dropped here rather than in the helper — esrap
        // reprints the declaration and never keeps them either (#3248).
        if init_span != call.span {
            self.add_replacement(init_span.start, call.span.start, String::new());
            self.add_replacement(call.span.end, init_span.end, String::new());
        }
        let decl_span = decl.span;
        let walked_source = self.apply_and_drain_inner_replacements(decl_span.start, decl_span.end);

        let Some(transformed) = transform_props_destructuring(
            &walked_source,
            self.prop_source_vars_slice,
            self.exported_names,
            analysis,
            &self.read_only_props,
            self.dev,
        ) else {
            // Helper bailed (e.g., shape it doesn't recognize). Re-walk
            // is unnecessary since we already walked above; the inner
            // replacements were drained, so we add them back as the
            // declaration's bare text plus the walked subspans applied.
            // Simpler: re-emit the walked text so the AST pass output
            // matches what the visitor would have produced via normal
            // walking. This path is rare.
            self.add_replacement(decl_span.start, decl_span.end, walked_source);
            return true;
        };

        // Do NOT register the destructured names in `scoped_vars`.
        // The text helper either deletes the declaration (read-only
        // props without defaults — handled by the read-only-prop
        // mapping in `visit_identifier_reference`) or emits a new
        // `let name = $.prop(...)` whose references should still be
        // transformed via `prop_source_vars` (prop getter) /
        // `rest_prop_vars` (rest access) / `read_only_props`. If we
        // registered them here, `is_shadowed(name)` would return
        // true and block those rewrites.

        // Helper output is statement-shaped and ends with `;\n` (or is
        // empty for read-only-only destructures). Our replacement
        // needs to also consume the source's trailing `;` so we
        // don't double up — when the helper returns the empty string
        // for a read-only-only destructure, leaving the source `;`
        // in place produces a stray empty statement (`;`) where the
        // text-pipeline path produced just whitespace.
        let mut end = decl_span.end as usize;
        let bytes = self.source.as_bytes();
        while end < bytes.len() && bytes[end] == b' ' {
            end += 1;
        }
        if end < bytes.len() && bytes[end] == b';' {
            end += 1;
        }
        // The replacement has to terminate itself: the range above swallowed the
        // source's `;`, and what follows is a line break only when the next
        // statement is on the next line.
        let mut stripped = transformed.trim_end_matches('\n').to_string();

        // When the helper returns an empty replacement (read-only
        // `{ name } = $props()` with no defaults), and the component
        // is compiled in `experimental.async` mode, emit a
        // `/* $$async_noop:name1,name2 */;` placeholder so the async
        // body builder hoists the names as `var name1, name2;` and
        // allocates an empty thunk slot. This mirrors the per-statement
        // text-path's `process_accumulated` branch in mod.rs that used
        // to handle this case when the text helper returned empty.
        if stripped.trim().is_empty() && analysis.experimental_async {
            let mut names: Vec<String> = Vec::new();
            collect_binding_identifier_names(&declarator.id, &mut names);
            stripped = if names.is_empty() {
                "/* $$async_noop */;".to_string()
            } else {
                format!("/* $$async_noop:{} */;", names.join(","))
            };
        }

        self.add_replacement(decl_span.start, end as u32, stripped);
        true
    }

    /// AST replacement for `$derived.by(fn)` rune declarators. Mirrors the
    /// text-pipeline rewrite that lived in
    /// `transform_client_runes_with_skip_and_state`'s `$derived.by` loop.
    ///
    /// `$derived.by(fn)` becomes `$.derived(fn)` — the function is passed
    /// through, no arrow wrap is added (unlike plain `$derived(expr)`,
    /// which wraps the expression in an arrow and is handled by a later
    /// migration).
    ///
    /// Inner state-var refs inside the function body still get `$.get(...)`
    /// wrapping via the visitor's normal walk; we drain those inner
    /// replacements before emitting the outer span replacement to avoid
    /// the outer replacement clobbering them.
    fn try_rewrite_derived_by_declarator(&mut self, declarator: &VariableDeclarator<'_>) -> bool {
        let Some(init) = &declarator.init else {
            return false;
        };
        let (init, init_span) = init_without_parens(init);
        if !self.is_derived_by_init(init) {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        // Only simple `let name = $derived.by(...)` bindings — destructured
        // patterns are still handled by the upstream text helper
        // `transform_derived_by_destructuring`.
        let BindingPattern::BindingIdentifier(id) = &declarator.id else {
            return false;
        };
        if call.arguments.len() != 1 {
            return false;
        }
        let var_name = id.name.as_str();

        // Walk the function arg so any state-var refs inside the callback
        // body get `$.get(...)` wrapping, then drain those inner
        // replacements and bake them into the outer text. The argument
        // itself is typically an ArrowFunctionExpression or
        // FunctionExpression; the walker descends into its body for us.
        let arg = &call.arguments[0];
        self.visit_argument(arg);
        let arg_span = arg.span();
        let (mut pre_spans, post_spans) = self.rune_call_comment_slots(call, arg_span, init_span);
        // `$.derived` is built with a plain string callee and takes the user's
        // own function unchanged, so the declarator's leading comments flush
        // before that argument just like the ones written inside the parens.
        let lead_spans = self.declarator_lead_comment_spans(id.span().end, call.span.start);
        let start = lead_spans
            .first()
            .map_or(call.span.start, |&(first, _)| first);
        pre_spans.splice(0..0, lead_spans);
        let lead_comments = self.flush_trivia_comments(&pre_spans, arg_span.start, true);
        let transformed_arg = self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);

        // No thunk is synthesized here, so the argument stays the last located
        // node inside the call and esrap flushes its trailing comment there.
        let (trail, spilled) = self.split_trailing_comments(&post_spans, arg_span.end);
        let replacement = format!("$.derived({lead_comments}{transformed_arg}{trail})");
        let mut replacement = self.maybe_tag_declarator(var_name, replacement);
        let end = self.append_comments_past_semicolon(&spilled, call.span.end, &mut replacement);
        self.add_replacement(start, end, replacement);
        true
    }

    /// AST replacement for plain `$derived(expr)` rune declarators. Mirrors
    /// the per-rune text loop that previously lived in
    /// `transform_client_runes_with_skip_and_state`:
    ///
    /// The argument shapes we have to keep behaviour-identical with:
    ///
    /// 1. Existing function/arrow: `$derived(() => expr)` /
    ///    `$derived(async () => expr)` / `$derived(function(){…})` —
    ///    wrapped *again* in a thunk to match the official compiler's
    ///    `b.thunk()` treatment, giving `$.derived(() => () => expr)`.
    /// 2. Top-level `await` somewhere in the expression (async derived):
    ///    rewritten to `await $.async_derived(…)`. Whether the inner
    ///    thunk is `async () => (…)` or `() => (…)` (and whether the
    ///    inner is paren-wrapped) is decided by `strip_top_level_await_from_expr`
    ///    plus a second `contains_direct_await_in_expression` probe.
    /// 3. Object literal: `$.derived(() => (obj))` — parens required so
    ///    `() => { … }` is not parsed as a block.
    /// 4. Bare store-subscription or prop-source identifier: passed
    ///    through, `$.derived(name)` — store subs and prop getters are
    ///    already callable, no thunk needed.
    /// 5. Anything else: `unthunk_string` is applied (`() => name()`
    ///    -> `name`, `() => $.foo()` -> `$.foo`); the result is what
    ///    goes inside `$.derived(...)`.
    ///
    /// We use the existing text helpers (`contains_direct_await_in_expression`,
    /// `strip_top_level_await_from_expr`, `unthunk_string`) on the post-walk
    /// argument text to keep byte-identical output with the old text loop.
    fn try_rewrite_derived_call_declarator(&mut self, declarator: &VariableDeclarator<'_>) -> bool {
        let Some(init) = &declarator.init else {
            return false;
        };
        let (init, init_span) = init_without_parens(init);
        if !self.is_derived_call_init(init) {
            return false;
        }
        let Expression::CallExpression(call) = init else {
            return false;
        };
        // Destructured patterns are still handled by the text helper
        // `transform_derived_destructuring`. Only simple `BindingIdentifier`
        // targets are migrated here.
        let BindingPattern::BindingIdentifier(id) = &declarator.id else {
            return false;
        };
        if call.arguments.len() != 1 {
            return false;
        }
        let var_name = id.name.as_str();

        let arg = &call.arguments[0];
        let arg_expr_opt = arg.as_expression();
        let arg_span = arg.span();

        // Snapshot the original *source-level* arg text before any walk —
        // both the await probe and the function-shape check are run against
        // the original (pre-`$.get(...)`-wrap) tokens to match the text path.
        let arg_source_text =
            self.source[arg_span.start as usize..arg_span.end as usize].to_string();
        let arg_source_trimmed = arg_source_text.trim();

        // Drop a trailing comma inside `$derived(expr,)` — the old text
        // path stripped it because `() => (expr,)` is a SyntaxError.
        let arg_for_check = arg_source_trimmed
            .strip_suffix(',')
            .map_or(arg_source_trimmed, |s| s.trim_end());

        // Comments between the call's `(` and the argument ride along: into the
        // synthesized thunk's empty parameter parens (where esrap flushes them
        // — the params sequence runs until the body's start), or straight
        // before the argument when no thunk is added. The ones written between
        // the declarator's `=` and `$derived(` reach the same slot, because
        // upstream builds `$.derived` with a plain string callee that carries
        // no `loc` of its own.
        let (mut pre_spans, post_spans) = self.rune_call_comment_slots(call, arg_span, init_span);
        let lead_spans = self.declarator_lead_comment_spans(id.span().end, call.span.start);
        let start = lead_spans
            .first()
            .map_or(call.span.start, |&(first, _)| first);
        pre_spans.splice(0..0, lead_spans);
        let param_comments = self.flush_trivia_comments(&pre_spans, arg_span.start, false);
        let lead_comments = self.flush_trivia_comments(&pre_spans, arg_span.start, true);

        // Walk the argument once so inner state-var refs get `$.get(...)`,
        // then drain those inner replacements into a transformed string we
        // can feed to the text helpers (mirroring `wrap_state_vars_in_expr`
        // in the old path).
        self.visit_argument(arg);
        let walked_arg = self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);
        let walked_trimmed = walked_arg.trim();
        let walked_for_emit = walked_trimmed
            .strip_suffix(',')
            .map_or(walked_trimmed, |s| s.trim_end());

        // Case 1: arg is already a function/arrow. The old text path's
        // condition was `starts_with("()") || starts_with("function")`,
        // which is broader than just `Expression::ArrowFunctionExpression`
        // (it also catches e.g. `(x) => x` because that starts with `(`).
        // Mirror the old check on the original source bytes so we stay
        // byte-identical in edge cases.
        let starts_as_function =
            arg_source_trimmed.starts_with("()") || arg_source_trimmed.starts_with("function");
        // A synthesized thunk ends the call with an unlocated node, so esrap
        // carries the argument's trailing comment past the statement's `;`;
        // without one the comment stays inside the call.
        if starts_as_function {
            let replacement = format!("$.derived(({param_comments}) => {walked_for_emit})");
            let mut replacement = self.maybe_tag_declarator(var_name, replacement);
            let end =
                self.append_comments_past_semicolon(&post_spans, call.span.end, &mut replacement);
            self.add_replacement(start, end, replacement);
            return true;
        }

        // Case 2: top-level `await` somewhere in the expression → async derived.
        // The text-path `wrap_state_derived_with_tag` did not tag
        // `$.async_derived(...)` declarations (its byte-pattern list only
        // covers `$.state(`, `$.derived(`, `$.proxy(`), so we don't tag
        // here either — `maybe_tag_declarator` rejects the
        // `await $.async_derived(...)` prefix.
        if contains_direct_await_in_expression(arg_for_check) {
            let saved_for_emit = wrap_await_with_save_in_async_derived(walked_for_emit);
            let inner_expr = strip_top_level_await_from_expr(&saved_for_emit);
            let inner_trimmed = inner_expr.trim();
            let inner_has_nested_await = contains_direct_await_in_expression(inner_trimmed);
            // Svelte 5.56.0 (#18299 commit `0da9f9e2a` "fix: disallow effect
            // creation after `await`") removed the `should_save` branch from
            // VariableDeclaration.js entirely — every `$derived(await ...)`
            // now lowers to a plain `await $.async_derived(...)` regardless of
            // function depth. The old `(await $.save($.async_derived(...)))()`
            // wrap (5.55.9-era) is gone; effects scheduled after an await
            // boundary inside a deriver are now an error rather than a
            // silently-restored context. Keep `should_save = false` for parity.
            let should_save = false;
            let dev_tail = dev_args(self.async_derived_locations, var_name, var_name);
            let async_derived_call = if inner_has_nested_await {
                let is_obj = saved_for_emit.starts_with('{');
                if is_obj {
                    format!("$.async_derived(async () => ({saved_for_emit}){dev_tail})")
                } else {
                    format!("$.async_derived(async () => {saved_for_emit}{dev_tail})")
                }
            } else {
                let inner_is_object = inner_trimmed.starts_with('{');
                if inner_is_object {
                    format!("$.async_derived(() => ({inner_expr}){dev_tail})")
                } else {
                    let thunk_arg = unthunk_string(&inner_expr);
                    format!("$.async_derived({thunk_arg}{dev_tail})")
                }
            };
            let mut replacement = if should_save {
                // Unreachable post-5.56.0; kept inert to mirror the upstream
                // structure of `should_save ? save(call) : b.await(call)`.
                format!("(await $.save({}))()", async_derived_call)
            } else {
                format!("await {}", async_derived_call)
            };
            let end =
                self.append_comments_past_semicolon(&post_spans, call.span.end, &mut replacement);
            // The async form drops the thunk parens the leading comments would
            // have gone into, so they keep their source position here.
            self.add_replacement(call.span.start, end, replacement);
            return true;
        }

        // Case 3: object literal — paren-wrap so the body isn't parsed as a block.
        if matches!(arg_expr_opt, Some(Expression::ObjectExpression(_))) {
            let replacement = format!("$.derived(({param_comments}) => ({walked_for_emit}))");
            let mut replacement = self.maybe_tag_declarator(var_name, replacement);
            let end =
                self.append_comments_past_semicolon(&post_spans, call.span.end, &mut replacement);
            self.add_replacement(start, end, replacement);
            return true;
        }

        // Case 4: bare store-sub / prop-source identifier — already callable.
        // Pass the bare identifier name directly (not the walked version which would be `name()`),
        // because store-sub / prop-source vars are already getter functions.
        // This mirrors upstream's `b.thunk(test())` → `unthunk(() => test())` → `test` collapsing.
        if let Some(Expression::Identifier(ident)) = arg_expr_opt {
            let name = ident.name.as_str();
            if self.store_sub_vars.contains(name) || self.prop_source_vars.contains(name) {
                let (trail, spilled) = self.split_trailing_comments(&post_spans, arg_span.end);
                let replacement = format!("$.derived({lead_comments}{name}{trail})");
                let mut replacement = self.maybe_tag_declarator(var_name, replacement);
                let end =
                    self.append_comments_past_semicolon(&spilled, call.span.end, &mut replacement);
                self.add_replacement(start, end, replacement);
                return true;
            }
        }

        // Case 5: default — unthunk if the walked arg is a `name()` /
        // `$.foo()` shape, otherwise wrap in a thunk.
        let derived_arg = unthunk_string(walked_for_emit);
        let (thunked, derived_arg) = if let Some(body) = derived_arg.strip_prefix("() => ") {
            (true, format!("({param_comments}) => {body}"))
        } else {
            (false, format!("{lead_comments}{derived_arg}"))
        };
        let (trail, spilled) = if thunked {
            (String::new(), post_spans)
        } else {
            self.split_trailing_comments(&post_spans, arg_span.end)
        };
        let replacement = format!("$.derived({derived_arg}{trail})");
        let mut replacement = self.maybe_tag_declarator(var_name, replacement);
        let end = self.append_comments_past_semicolon(&spilled, call.span.end, &mut replacement);
        self.add_replacement(start, end, replacement);
        true
    }

    /// Detect a `$inspect.trace(...)`-leading function body and emit the
    /// dev-mode `{ return $.trace(thunk, () => { ...remaining... }); }`
    /// block rewrite. Mirrors the dev-mode arm of the text-path loop in
    /// `transform_client_runes_with_skip_and_state`.
    fn try_rewrite_inspect_trace_function_body(&mut self, body: &FunctionBody<'_>) -> bool {
        if !self.dev
            || !self.is_runes
            || self.is_shadowed("$inspect")
            || self.store_sub_vars.contains("$inspect")
        {
            return false;
        }
        let Some(first_stmt) = body.statements.first() else {
            return false;
        };
        // The trace call must be the *first* statement of the block, used
        // as an expression statement (`$inspect.trace(...);`).
        let Statement::ExpressionStatement(expr_stmt) = first_stmt else {
            return false;
        };
        let Expression::CallExpression(call) = &expr_stmt.expression else {
            return false;
        };
        let Expression::StaticMemberExpression(member) = &call.callee else {
            return false;
        };
        let Expression::Identifier(obj) = &member.object else {
            return false;
        };
        if obj.name != "$inspect" || member.property.name != "trace" {
            return false;
        }
        if call.arguments.len() > 1 {
            return false;
        }

        // Walk the whole body so state-var refs in both the trace
        // argument and the remaining statements get `$.get(...)` wraps,
        // then drain those replacements out of the trace-arg range and
        // the remaining-stmts range so the outer rewrite below carries
        // the wrapped text.
        walk::walk_function_body(self, body);

        // Drain trace-arg replacements.
        let trace_arg_walked = if let Some(arg) = call.arguments.first() {
            let span = arg.span();
            let txt = self.apply_and_drain_inner_replacements(span.start, span.end);
            Some(txt)
        } else {
            None
        };

        // Drain anything else collected inside the trace statement
        // (callee identifier, etc.) — those go to /dev/null because the
        // statement itself is being removed.
        let trace_stmt_span = expr_stmt.span;
        let _ = self.apply_and_drain_inner_replacements(trace_stmt_span.start, trace_stmt_span.end);

        // Drain remaining statements (everything after the trace stmt,
        // up to — but not including — the closing `}`). `body.span.end`
        // is the byte *after* the `}`, so we use `end - 1`.
        let remaining_start = trace_stmt_span.end;
        let remaining_end = body.span.end.saturating_sub(1);
        let remaining_walked = if remaining_start < remaining_end {
            self.apply_and_drain_inner_replacements(remaining_start, remaining_end)
        } else {
            String::new()
        };
        let remaining_trimmed = remaining_walked.trim();

        // Build the trace thunk. Non-empty arg → `() => arg`. Empty arg →
        // fall back to the official compiler's `get_function_label()`
        // heuristic. When we don't have the original source available we
        // emit just the bare label without the `(filename:line:col)`
        // suffix.
        let trace_thunk = if let Some(arg_txt) = trace_arg_walked
            && !arg_txt.trim().is_empty()
        {
            format!("() => {}", arg_txt.trim())
        } else {
            let before_block_post = &self.source[..body.span.start as usize];
            let trace_pos = self.trace_source_position(before_block_post);
            let default_label_owned = self
                .trace_function_label
                .clone()
                .or_else(|| extract_enclosing_function_name(before_block_post).map(str::to_string))
                .or_else(|| {
                    self.analysis_source
                        .zip(trace_pos)
                        .and_then(|(src, trace_pos)| {
                            extract_trace_call_label(src, trace_pos).map(str::to_string)
                        })
                })
                .unwrap_or_else(|| "trace".to_string());
            let default_label = default_label_owned.as_str();
            let source_pos = self
                .analysis_source
                .zip(trace_pos)
                .and_then(|(src, trace_pos)| {
                    find_trace_source_location(src, trace_pos, self.trace_in_class_method)
                });
            match (source_pos, self.filename) {
                (Some((line, col)), Some(filename)) => {
                    // `locate_node()` runs the path through `sanitize_location()`.
                    let filename = filename.replace('/', "/\u{200b}");
                    format!("() => '{} ({}:{}:{})'", default_label, filename, line, col)
                }
                _ => format!("() => '{}'", default_label),
            }
        };

        let (awaited, asyncness) = if self.trace_function_is_async {
            ("await ", "async ")
        } else {
            ("", "")
        };
        let replacement = format!(
            "{{return {awaited}$.trace({trace_thunk}, {asyncness}() => {{\n{remaining_trimmed}\n}});\n}}"
        );
        self.add_replacement(body.span.start, body.span.end, replacement);
        true
    }

    /// Match the trace call in the transformed script to the same code-only
    /// occurrence in the original instance script. The original-source offset
    /// is what `locate_node` measures; transformed AST spans may have shifted.
    fn trace_source_position(&self, before_block: &str) -> Option<usize> {
        const TRACE: &[u8] = b"$inspect.trace(";
        let mut ordinal = 0;
        let mut from = 0;
        while let Some(at) = find_code_from(before_block.as_bytes(), TRACE, from) {
            ordinal += 1;
            from = at + TRACE.len();
        }

        let source = self.analysis_source?;
        let script = self.analysis?.instance_script_content.as_ref()?;
        let start = script.start as usize;
        let end = script.end as usize;
        let bytes = source.get(start..end)?.as_bytes();
        let mut from = 0;
        for _ in 0..ordinal {
            let at = find_code_from(bytes, TRACE, from)?;
            from = at + TRACE.len();
        }
        find_code_from(bytes, TRACE, from).map(|at| start + at)
    }

    /// Dev-mode rewrite of the four equality BinaryExpressions into their
    /// instrumented calls — `$.strict_equals` for `===` / `!==`, `$.equals`
    /// for `==` / `!=`, with a trailing `false` argument marking the negated
    /// forms. Mirrors the official Svelte compiler's `BinaryExpression`
    /// visitor — runtime hook that surfaces signal-vs-proxy comparison
    /// footguns to the user. Replaces the text-based pass formerly in
    /// `rune_transforms::transform_strict_equals` for component instance
    /// scripts. Returns `true` when the expression was rewritten.
    fn try_rewrite_strict_equals_binary(&mut self, expr: &BinaryExpression<'_>) -> bool {
        if !self.dev {
            return false;
        }
        let (helper, negated) = match expr.operator {
            BinaryOperator::StrictEquality => ("$.strict_equals", false),
            BinaryOperator::StrictInequality => ("$.strict_equals", true),
            BinaryOperator::Equality => ("$.equals", false),
            BinaryOperator::Inequality => ("$.equals", true),
            _ => return false,
        };

        // Walk both operands so inner state-var refs (and nested
        // equality rewrites) register their replacements, then
        // drain those into the operand-local text. Each drain yields
        // the fully-transformed operand substring that the outer
        // replacement carries verbatim.
        self.visit_expression(&expr.left);
        self.visit_expression(&expr.right);

        let left_span = expr.left.span();
        let right_span = expr.right.span();
        let left_text = self.apply_and_drain_inner_replacements(left_span.start, left_span.end);
        let right_text = self.apply_and_drain_inner_replacements(right_span.start, right_span.end);

        let replacement = format!(
            "{}({}, {}{})",
            helper,
            left_text.trim(),
            right_text.trim(),
            if negated { ", false" } else { "" }
        );

        self.add_replacement(expr.span.start, expr.span.end, replacement);
        true
    }

    /// Dev-mode rewrite of `await X` to `(await $.track_reactivity_loss(X))()`,
    /// mirroring the official compiler's `AwaitExpression` visitor: values read
    /// inside a reactive expression are noted but not tracked across the await
    /// boundary. Suppressed by a leading `svelte-ignore await_reactivity_loss`.
    /// Returns `true` when the expression was rewritten.
    fn try_rewrite_await_reactivity_loss(&mut self, expr: &AwaitExpression<'_>) -> bool {
        if !self.dev
            || self.is_await_reactivity_loss_ignored(expr.span.start)
            || super::await_reactivity_loss_ast::is_save_call(&expr.argument)
            || super::await_reactivity_loss_ast::is_destructuring_iife_call(&expr.argument)
        {
            return false;
        }

        // Walk the argument so inner state-var refs (and nested awaits)
        // register their replacements, then drain them into the argument text.
        self.visit_expression(&expr.argument);
        // Copy from just past the `await` keyword, not from the argument's own
        // start: the trivia between them holds comments upstream keeps inside
        // the call. Widening only the start is safe because the drained inner
        // replacements are re-based on whatever start is passed here.
        let arg_start = expr.span.start + "await".len() as u32;
        let arg_text = self.apply_and_drain_inner_replacements(arg_start, expr.span.end);

        let wrap = |argument: &str| format!("(await $.track_reactivity_loss({argument}))()");
        // The `;` rides inside this replacement rather than being appended to
        // the statement before it, which may have no replacement of its own.
        let (start, replacement) = match self.await_separators.get(&expr.span.start) {
            Some(&prev_end) => (
                prev_end,
                format!(
                    ";{}{}",
                    &self.source[prev_end as usize..expr.span.start as usize],
                    wrap(arg_text.trim())
                ),
            ),
            // A statement whose own start is the `await` is exactly the shape
            // that keeps its leading comments outside, so the two never mix.
            None => match self
                .await_comment_runs
                .relocatable_run(self.source, expr.span.start)
            {
                Some((run_start, parens, comments)) => (
                    run_start,
                    format!(
                        "{parens}{}",
                        wrap(&format!("{comments}{}", arg_text.trim()))
                    ),
                ),
                None => (expr.span.start, wrap(arg_text.trim())),
            },
        };
        self.add_replacement(start, expr.span.end, replacement);
        true
    }

    /// Dev-mode rewrite of `for await (… of X)` to
    /// `for await (… of $.for_await_track_reactivity_loss(X))`, mirroring the
    /// official compiler's `ForOfStatement` visitor. Returns `true` when the
    /// statement was rewritten (the caller then skips the default walk).
    fn try_rewrite_for_await_reactivity_loss(&mut self, stmt: &ForOfStatement<'_>) -> bool {
        if !self.dev
            || !super::await_reactivity_loss_ast::is_for_await_instrumentable(
                stmt,
                self.analysis.is_some_and(|a| a.experimental_async),
                self.is_await_reactivity_loss_ignored(stmt.span.start),
            )
        {
            return false;
        }

        self.visit_for_statement_left(&stmt.left);
        self.visit_expression(&stmt.right);
        let right_span = stmt.right.span();
        let right_text = self.apply_and_drain_inner_replacements(right_span.start, right_span.end);
        self.add_replacement(
            right_span.start,
            right_span.end,
            super::await_reactivity_loss_ast::for_await_track_reactivity_loss_wrap(
                right_text.trim(),
            ),
        );
        self.visit_statement(&stmt.body);
        true
    }

    fn is_await_reactivity_loss_ignored(&self, offset: u32) -> bool {
        self.await_ignore_ranges.contains(offset)
    }

    fn collect_await_ignore_ranges(&mut self, program: &Program<'_>) {
        if !self.dev || !super::await_reactivity_loss_ast::source_has_await(self.source) {
            return;
        }
        self.await_ignore_ranges = super::await_reactivity_loss_ast::collect_await_ignore_ranges(
            program,
            self.source,
            self.is_runes,
        );
        self.await_comment_runs =
            super::await_reactivity_loss_ast::AwaitCommentRuns::collect(program);
    }

    /// Walk every argument of a `CallExpression` so inner state-var refs
    /// get `$.get(...)` wrapping, then drain the inner replacements and
    /// return the comma-joined transformed text — the contents that
    /// would have been inside the original `(...)` if the call were
    /// preserved verbatim. Used by `$inspect(args)` etc. where we want
    /// the args as a list expression `[arg, arg, ...]`.
    fn walk_and_drain_args_as_text(&mut self, call: &CallExpression<'_>) -> String {
        if call.arguments.is_empty() {
            return String::new();
        }
        for arg in &call.arguments {
            self.visit_argument(arg);
        }
        // Source spans of each argument; join their transformed text with
        // `, ` so the result is a valid argument list.
        let mut parts: Vec<String> = Vec::with_capacity(call.arguments.len());
        for arg in &call.arguments {
            let span = arg.span();
            parts.push(self.apply_and_drain_inner_replacements(span.start, span.end));
        }
        parts.join(", ")
    }

    fn inspect_args_with_trailing_comment(&self, end: u32, args: String) -> (u32, String) {
        let tail = &self.source[end as usize..];
        let spaces = tail.len() - tail.trim_start_matches([' ', '\t']).len();
        let tail = &tail[spaces..];
        let Some(after_semicolon) = tail.strip_prefix(';') else {
            return (end, args);
        };
        let spaces_after_semicolon =
            after_semicolon.len() - after_semicolon.trim_start_matches([' ', '\t']).len();
        let comment = &after_semicolon[spaces_after_semicolon..];
        if let Some(line) = comment.strip_prefix("//") {
            let len = line.find('\n').unwrap_or(line.len());
            let comment_end = end as usize + spaces + 1 + spaces_after_semicolon + 2 + len;
            return (comment_end as u32, format!("{args}, //{}\n", &line[..len]));
        }
        if let Some(block) = comment.strip_prefix("/*")
            && let Some(close) = block.find("*/")
        {
            let comment_end = end as usize + spaces + 1 + spaces_after_semicolon + 2 + close + 2;
            return (
                comment_end as u32,
                format!("{args} /*{}*/", &block[..close]),
            );
        }
        (end, args)
    }

    /// Apply any pending replacements that fall within [range_start, range_end)
    /// to the given source text, remove them from the replacements list, and
    /// return the transformed substring.
    ///
    /// This is used when an outer replacement (e.g., assignment) needs the
    /// already-transformed text of an inner region (e.g., the RHS expression).
    fn apply_and_drain_inner_replacements(&mut self, range_start: u32, range_end: u32) -> String {
        let inner = self.take_inner_replacements(range_start, range_end);

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

    /// Remove every pending replacement contained in `[range_start, range_end]`
    /// and return them, preserving the relative order of both the removed and
    /// the retained entries.
    ///
    /// Walking in source order keeps `replacements` sorted by `start`, so the
    /// contained entries are one contiguous window that binary search locates
    /// without touching the entries before it. Rescanning the whole list on
    /// every call is quadratic in a component's rune declaration count.
    fn take_inner_replacements(&mut self, range_start: u32, range_end: u32) -> Vec<Replacement> {
        let contained = |r: &Replacement| r.start >= range_start && r.end <= range_end;

        if !self.replacements_sorted {
            let (inner, outer): (Vec<Replacement>, Vec<Replacement>) =
                self.replacements.drain(..).partition(contained);
            self.replacements = outer;
            self.replacements_sorted = self.replacements.is_sorted_by_key(|r| r.start);
            return inner;
        }

        let lo = self.replacements.partition_point(|r| r.start < range_start);
        let hi = lo + self.replacements[lo..].partition_point(|r| r.start <= range_end);
        if lo == hi {
            return Vec::new();
        }
        let (inner, kept): (Vec<Replacement>, Vec<Replacement>) =
            self.replacements.drain(lo..hi).partition(contained);
        if !kept.is_empty() {
            self.replacements.splice(lo..lo, kept);
        }
        inner
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

    fn collect_active_state_binding_names(&mut self, pattern: &BindingPattern<'_>) {
        match pattern {
            BindingPattern::BindingIdentifier(id) => {
                self.active_state_vars
                    .last_mut()
                    .expect("scope stacks stay aligned")
                    .insert(id.name.to_string());
            }
            BindingPattern::ObjectPattern(object) => {
                for property in &object.properties {
                    self.collect_active_state_binding_names(&property.value);
                }
                if let Some(rest) = &object.rest {
                    self.collect_active_state_binding_names(&rest.argument);
                }
            }
            BindingPattern::ArrayPattern(array) => {
                for element in array.elements.iter().flatten() {
                    self.collect_active_state_binding_names(element);
                }
                if let Some(rest) = &array.rest {
                    self.collect_active_state_binding_names(&rest.argument);
                }
            }
            BindingPattern::AssignmentPattern(assignment) => {
                self.collect_active_state_binding_names(&assignment.left);
            }
        }
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

    /// Inner implementation for collecting binding names.
    /// When `skip_state_vars` is true, names that are in `self.state_vars` are not registered.
    fn collect_binding_names_inner(&mut self, pattern: &BindingPattern<'_>, skip_state_vars: bool) {
        match pattern {
            BindingPattern::BindingIdentifier(id) => {
                // A destructuring pattern can mix reactive and non-reactive
                // bindings, so the shadow decision has to be per name.
                let shadows_non_reactive =
                    self.scoped_vars.len() > 1 && self.non_reactive_vars.contains(id.name.as_str());
                if skip_state_vars
                    && self.is_any_known_transform_var(&id.name)
                    && !shadows_non_reactive
                {
                    if self.state_vars.contains(id.name.as_str()) {
                        self.active_state_vars
                            .last_mut()
                            .expect("scope stacks stay aligned")
                            .insert(id.name.to_string());
                    }
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
    fn enter_scope(&mut self, flags: ScopeFlags, _scope_id: &std::cell::Cell<Option<ScopeId>>) {
        self.scope_is_var_boundary
            .push(flags.intersects(ScopeFlags::Function | ScopeFlags::Top));
        self.push_scope();
    }

    fn leave_scope(&mut self) {
        self.scope_is_var_boundary.pop();
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
        // `$props()` declarations (`let { x, y } = $props()` or
        // `let props = $props()`) are handled whole-declaration by the
        // shared text helper `transform_props_destructuring`, which
        // computes per-prop `$.prop()` flags from `ComponentAnalysis`.
        // Detection happens here so we can skip the default walk —
        // the helper output already contains all the per-prop declarators
        // we need.
        if self.try_rewrite_props_destructuring_declaration(decl) {
            return;
        }

        self.register_declaration_names(decl);
        // Then walk the declaration normally (to visit initializers, etc.)
        walk::walk_variable_declaration(self, decl);
    }

    fn visit_variable_declarator(&mut self, declarator: &VariableDeclarator<'ast>) {
        // Try the rune-declarator rewrites first. When one matches, the
        // helper walks into the argument (so inner state-var refs still
        // get `$.get()` wrapping) and consumes those inner replacements
        // before emitting the outer span replacement. We then skip the
        // default walk so `visit_expression(init)` doesn't add the inner
        // replacements a second time.
        //
        // Destructured `$state(...)` / `$state.raw(...)` / `$derived(...)` /
        // `$derived.by(...)` are checked first — the other rune-declarator
        // handlers bail for non-Identifier binding patterns, so the
        // destructure matchers catch them.
        if self.try_rewrite_state_destructuring_declarator(declarator) {
            return;
        }
        if self.try_rewrite_derived_destructuring_declarator(declarator) {
            return;
        }
        if self.try_rewrite_derived_by_destructuring_declarator(declarator) {
            return;
        }
        if self.try_rewrite_state_raw_or_frozen_declarator(declarator) {
            return;
        }
        if self.try_rewrite_state_call_declarator(declarator) {
            return;
        }
        if self.try_rewrite_derived_by_declarator(declarator) {
            return;
        }
        if self.try_rewrite_derived_call_declarator(declarator) {
            return;
        }
        let saved = self.trace_parent_label.take();
        self.trace_parent_label = declarator
            .id
            .get_binding_identifier()
            .map(|id| id.name.to_string());
        walk::walk_variable_declarator(self, declarator);
        self.trace_parent_label = saved;
    }

    fn visit_function_body(&mut self, body: &FunctionBody<'ast>) {
        // `$inspect.trace(arg)` *dev mode* block rewrite (non-dev removal
        // remains in the text path because the standalone-line whitespace/
        // semicolon trimming is statement-shaped). The rune call is always
        // the first statement of its enclosing function body; we detect
        // that here and emit a whole-body replacement of the form
        //   { return $.trace(thunk, () => { …remaining body… }); }
        if !self.try_rewrite_inspect_trace_function_body(body) {
            walk::walk_function_body(self, body);
        }
    }

    fn visit_class(&mut self, it: &oxc_ast::ast::Class<'ast>) {
        // A `class Foo {}` DECLARATION binds `Foo` in the ENCLOSING scope exactly
        // as a function declaration does. A class EXPRESSION binds its name only
        // inside its own body, which upstream mis-lowers, so it is left alone.
        if it.r#type == oxc_ast::ast::ClassType::ClassDeclaration
            && let Some(id) = &it.id
        {
            self.declare_in_current_scope(&id.name);
        }
        walk::walk_class(self, it);
    }

    fn visit_function(&mut self, it: &Function<'ast>, flags: ScopeFlags) {
        // A `function foo()` DECLARATION binds `foo` in the ENCLOSING scope,
        // shadowing any same-named prop/state var for references elsewhere — so
        // `executing.then(enter)` (where a local `async function enter()` shadows
        // an `enter` prop) must stay bare, not become `enter()`. Register it before
        // walk_function pushes the function's own scope. Named function EXPRESSIONS
        // bind only in their own scope, so they are excluded.
        if it.r#type == oxc_ast::ast::FunctionType::FunctionDeclaration
            && let Some(id) = &it.id
        {
            self.declare_in_current_scope(&id.name);
        }
        // A named function EXPRESSION binds its own name inside its body, so it
        // is declared once the function's scope has been entered — which the
        // parameter walk is the first hook inside.
        let saved_fn_expr_name = self.pending_fn_expr_name.take();
        if it.r#type == oxc_ast::ast::FunctionType::FunctionExpression
            && let Some(id) = &it.id
        {
            self.pending_fn_expr_name = Some(id.name.to_string());
        }
        // Track enclosing function depth so the `$derived(await …)`
        // declarator handler can choose between `await $.async_derived(…)`
        // (top-level instance script, depth 0) and
        // `(await $.save($.async_derived(…)))()` (nested function, depth ≥ 1)
        // — mirrors upstream `context.state.scope.function_depth > 1`.
        self.function_depth += 1;
        let saved_label = self.trace_function_label.take();
        let saved_async = self.trace_function_is_async;
        let saved_class_method = self.trace_in_class_method;
        self.trace_in_class_method = self.trace_next_function_is_class_method;
        self.trace_next_function_is_class_method = false;
        self.trace_function_label = it
            .id
            .as_ref()
            .map(|id| id.name.to_string())
            .or_else(|| self.trace_parent_label.clone());
        self.trace_function_is_async = it.r#async;
        walk::walk_function(self, it, flags);
        self.pending_fn_expr_name = saved_fn_expr_name;
        self.trace_function_label = saved_label;
        self.trace_function_is_async = saved_async;
        self.trace_in_class_method = saved_class_method;
        self.function_depth -= 1;
    }

    fn visit_arrow_function_expression(&mut self, it: &ArrowFunctionExpression<'ast>) {
        self.function_depth += 1;
        let saved_label = self.trace_function_label.take();
        let saved_async = self.trace_function_is_async;
        let saved_class_method = self.trace_in_class_method;
        self.trace_in_class_method = false;
        self.trace_function_label = self.trace_parent_label.clone();
        self.trace_function_is_async = it.r#async;
        walk::walk_arrow_function_expression(self, it);
        self.trace_function_label = saved_label;
        self.trace_function_is_async = saved_async;
        self.trace_in_class_method = saved_class_method;
        self.function_depth -= 1;
    }

    fn visit_method_definition(&mut self, it: &MethodDefinition<'ast>) {
        let saved_parent_label = self.trace_parent_label.take();
        let saved_next_class_method = self.trace_next_function_is_class_method;
        self.trace_next_function_is_class_method = true;
        walk::walk_method_definition(self, it);
        self.trace_next_function_is_class_method = saved_next_class_method;
        self.trace_parent_label = saved_parent_label;
    }

    fn visit_binary_expression(&mut self, expr: &BinaryExpression<'ast>) {
        // Dev-mode `===` / `!==` rewrite. When matched the helper walks
        // and drains inner replacements itself, so we skip the default
        // walk to avoid double-visiting the operands.
        if !self.try_rewrite_strict_equals_binary(expr) {
            walk::walk_binary_expression(self, expr);
        }
    }

    fn visit_statements(&mut self, stmts: &oxc_allocator::Vec<'ast, Statement<'ast>>) {
        self.await_separators
            .extend(super::await_reactivity_loss_ast::separator_positions(
                stmts,
                self.source,
            ));
        // Upstream resolves a reference against a scope that already holds every
        // declaration of its block, so a name shadows above its own declaration too.
        // Registering only on the way past the declarator left
        // `const r = typeof v; function v() {}` reading the component's binding.
        for stmt in stmts {
            match stmt {
                Statement::VariableDeclaration(decl) => self.register_declaration_names(decl),
                Statement::FunctionDeclaration(func) => {
                    if let Some(id) = &func.id {
                        self.declare_in_current_scope(&id.name);
                    }
                }
                Statement::ClassDeclaration(class) => {
                    if let Some(id) = &class.id {
                        self.declare_in_current_scope(&id.name);
                    }
                }
                _ => {}
            }
        }
        // A `var` is function-scoped, so `{ var v = 2; } typeof v` resolves to the
        // local after the block ends — which the per-block pass above cannot see.
        if self.scope_is_var_boundary.last().copied().unwrap_or(false) {
            let mut hoisted = Vec::new();
            crate::compiler::phases::phase3_transform::shared::hoisted_vars::collect_in_list(
                stmts,
                &mut hoisted,
            );
            for decl in hoisted {
                self.register_declaration_names(decl);
            }
        }
        walk::walk_statements(self, stmts);
    }

    fn visit_await_expression(&mut self, expr: &AwaitExpression<'ast>) {
        // Same contract as the binary hook: the helper walks and drains the
        // argument itself when it matches.
        if !self.try_rewrite_await_reactivity_loss(expr) {
            walk::walk_await_expression(self, expr);
        }
    }

    fn visit_for_of_statement(&mut self, stmt: &ForOfStatement<'ast>) {
        if !self.try_rewrite_for_await_reactivity_loss(stmt) {
            walk::walk_for_of_statement(self, stmt);
        }
    }

    fn visit_formal_parameters(&mut self, params: &FormalParameters<'ast>) {
        if let Some(name) = self.pending_fn_expr_name.take() {
            self.declare_in_current_scope(&name);
        }
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

        // $effect rune family. The runes are valid only when `$effect` is the
        // global rune binding (not shadowed by a local declaration, function
        // parameter, or store subscription).
        //
        //   $effect(fn)            -> $.user_effect(fn)
        //   $effect.pre(fn)        -> $.user_pre_effect(fn)
        //   $effect.root(fn)       -> $.effect_root(fn)
        //   $effect.tracking()     -> $.effect_tracking()
        //   $effect.pending()      -> $.eager(() => $.pending())  (whole-call rewrite)
        //
        // The visitor's `scoped_vars` already tracks function/catch parameters
        // and let/const/var declarations, so `is_shadowed("$effect")` is the
        // precise replacement for the old statement-wide
        // `is_function_parameter_in_statement` check used by the text pipeline.
        if self.is_runes && !self.store_sub_vars.contains("$effect") && !self.is_shadowed("$effect")
        {
            match &expr.callee {
                Expression::Identifier(callee_ident) if callee_ident.name == "$effect" => {
                    let start = callee_ident.span.start;
                    let end = callee_ident.span.end;
                    self.add_replacement(start, end, "$.user_effect".to_string());
                    for arg in &expr.arguments {
                        self.visit_argument(arg);
                    }
                    return;
                }
                Expression::StaticMemberExpression(member) => {
                    if let Expression::Identifier(obj) = &member.object
                        && obj.name == "$effect"
                    {
                        let prop = member.property.name.as_str();
                        match prop {
                            "pre" | "root" => {
                                let replacement = if prop == "pre" {
                                    "$.user_pre_effect"
                                } else {
                                    "$.effect_root"
                                };
                                self.add_replacement(
                                    member.span.start,
                                    member.span.end,
                                    replacement.to_string(),
                                );
                                for arg in &expr.arguments {
                                    self.visit_argument(arg);
                                }
                                return;
                            }
                            "tracking" if expr.arguments.is_empty() => {
                                self.add_replacement(
                                    member.span.start,
                                    member.span.end,
                                    "$.effect_tracking".to_string(),
                                );
                                return;
                            }
                            "pending" if expr.arguments.is_empty() => {
                                // Whole-call rewrite. Upstream builds
                                // `b.thunk(b.call('$.pending'))`, and `thunk`
                                // unthunks a zero-argument call of an identifier,
                                // so the argument is the bare reference.
                                self.add_replacement(
                                    expr.span.start,
                                    expr.span.end,
                                    "$.eager($.pending)".to_string(),
                                );
                                return;
                            }
                            _ => {}
                        }
                    }
                }
                _ => {}
            }
        }

        // `$state.snapshot(x)` -> `$.snapshot(x)`. Only the callee identifier
        // is rewritten; arguments are visited normally so any inner
        // state-var refs still get `$.get()` wrapping. The dev-mode
        // svelte-ignore handler (`mod.rs`) scans the per-statement output
        // for `$state.snapshot(` and prepends a second `true` argument
        // *before* this AST rewrite runs, so by the time we get here the
        // call shape is either `$state.snapshot(x)` or
        // `$state.snapshot(x, true)` — in both cases we only need to
        // rename the callee.
        if self.is_runes
            && !self.is_shadowed("$state")
            && !self.store_sub_vars.contains("$state")
            && let Expression::StaticMemberExpression(member) = &expr.callee
            && let Expression::Identifier(obj) = &member.object
            && obj.name == "$state"
            && member.property.name == "snapshot"
        {
            self.add_replacement(member.span.start, member.span.end, "$.snapshot".to_string());
            for arg in &expr.arguments {
                self.visit_argument(arg);
            }
            return;
        }

        // `$props.id()` -> `$.props_id()`. Zero-arg rune call, callee
        // rename only.
        if self.is_runes
            && !self.is_shadowed("$props")
            && !self.store_sub_vars.contains("$props")
            && expr.arguments.is_empty()
            && let Expression::StaticMemberExpression(member) = &expr.callee
            && let Expression::Identifier(obj) = &member.object
            && obj.name == "$props"
            && member.property.name == "id"
        {
            self.add_replacement(member.span.start, member.span.end, "$.props_id".to_string());
            return;
        }

        // `$host()` -> `$$props.$$host`. Whole-call replacement.
        // Reference: 3-transform/client/visitors/CallExpression.js `case '$host'`.
        if self.is_runes
            && !self.is_shadowed("$host")
            && !self.store_sub_vars.contains("$host")
            && expr.arguments.is_empty()
            && let Expression::Identifier(callee) = &expr.callee
            && callee.name == "$host"
        {
            self.add_replacement(expr.span.start, expr.span.end, "$$props.$$host".to_string());
            return;
        }

        // `$state.eager(x)` -> `$.eager(() => x)`. Whole-call rewrite that
        // wraps the single argument in a thunk; inner state-var refs in
        // the argument still need `$.get(...)` wrapping, so we walk the
        // arg first, drain those inner replacements, and bake them into
        // the outer replacement.
        if self.is_runes
            && !self.is_shadowed("$state")
            && !self.store_sub_vars.contains("$state")
            && expr.arguments.len() == 1
            && let Expression::StaticMemberExpression(member) = &expr.callee
            && let Expression::Identifier(obj) = &member.object
            && obj.name == "$state"
            && member.property.name == "eager"
        {
            let arg = &expr.arguments[0];
            self.visit_argument(arg);
            let arg_span = arg.span();
            let transformed_arg =
                self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);
            self.add_replacement(
                expr.span.start,
                expr.span.end,
                format!(
                    "$.eager({})",
                    super::destructure_transforms::unthunk_string(&transformed_arg)
                ),
            );
            return;
        }

        // `$inspect(args)` / `$inspect(args).with(cb)` — *dev mode only*.
        // Non-dev mode still uses the text path in
        // `transform_client_runes_with_skip_and_state`, because the
        // standalone-statement detection (which produces the
        // `/* $$async_hole:... */` marker in async mode) is statement-
        // shaped rather than expression-shaped and is awkward to do at
        // the AST level.
        //
        // Output shapes:
        //   $inspect(args)              -> $.inspect(() => [args], (...$$args) => console.log(...$$args), true)
        //   $inspect(args).with(cb)     -> $.inspect(() => [args], (...$$args) => (cb)(...$$args))
        //
        // We match the *outer* `$inspect(...).with(cb)` call first so a
        // chained pattern isn't double-rewritten by the inner-call branch.
        if self.dev
            && self.is_runes
            && !self.is_shadowed("$inspect")
            && !self.store_sub_vars.contains("$inspect")
        {
            // Outer: `$inspect(args).with(cb)` — CallExpression whose
            // callee is `<$inspect(args)>.with`.
            if expr.arguments.len() == 1
                && let Expression::StaticMemberExpression(member) = &expr.callee
                && member.property.name == "with"
                && let Expression::CallExpression(inner) = &member.object
                && let Expression::Identifier(inner_callee) = &inner.callee
                && inner_callee.name == "$inspect"
            {
                let args_text = self.walk_and_drain_args_as_text(inner);
                let cb_arg = &expr.arguments[0];
                self.visit_argument(cb_arg);
                let cb_span = cb_arg.span();
                let cb_text = self.apply_and_drain_inner_replacements(cb_span.start, cb_span.end);
                let inspector = if cb_arg
                    .as_expression()
                    .is_none_or(super::inspect_rune_ast::needs_parens)
                {
                    format!("({cb_text})")
                } else {
                    cb_text
                };
                let (replacement_end, args_text) =
                    self.inspect_args_with_trailing_comment(expr.span.end, args_text);
                let suffix = if replacement_end == expr.span.end {
                    ""
                } else {
                    ";"
                };
                self.add_replacement(
                    expr.span.start,
                    replacement_end,
                    format!(
                        "$.inspect(() => [{args_text}], (...$$args) => {inspector}(...$$args)){suffix}"
                    ),
                );
                return;
            }

            // Inner / simple: `$inspect(args)` — CallExpression with
            // identifier callee `$inspect`.
            if let Expression::Identifier(callee_ident) = &expr.callee
                && callee_ident.name == "$inspect"
            {
                let args_text = self.walk_and_drain_args_as_text(expr);
                let (replacement_end, args_text) =
                    self.inspect_args_with_trailing_comment(expr.span.end, args_text);
                let suffix = if replacement_end == expr.span.end {
                    ""
                } else {
                    ";"
                };
                self.add_replacement(
                    expr.span.start,
                    replacement_end,
                    format!(
                        "$.inspect(() => [{}], (...$$args) => console.log(...$$args), true){suffix}",
                        args_text
                    ),
                );
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
            // (checked by looking at the source text immediately before).
            // Also accept the *raw* `$derived(` / `untrack(` shapes — after
            // the `$derived(...)` and `$.untrack(...)` text replaces moved
            // into this AST pass, the source we see here may still have the
            // pre-rewrite tokens around the store-sub reference.
            let before_start = start as usize;
            let trimmed_before = self.source[..before_start].trim_end();
            let prefix_is_getter_call = trimmed_before.ends_with("$.untrack(")
                || trimmed_before.ends_with("$.derived(")
                || trimmed_before.ends_with("$derived(")
                || trimmed_before.ends_with("untrack(");
            // Only keep the store reference bare when it is the SOLE argument to
            // the getter-context call (`$derived($store)` / `untrack($store)`) —
            // i.e. the store getter IS the derivation/untrack function. When the
            // store read is merely part of a larger expression
            // (`$derived($store.x / 2)`), it must still be wrapped to `$store()`.
            // Mirrors the `is_sole_derived_arg` check in the prop-source branch.
            let in_getter_context = prefix_is_getter_call && {
                let after = &self.source[end as usize..];
                after.trim_start().starts_with(')')
            };
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
        // Suppress the `rest.x -> $$props.x` rewrite for a RHS that is itself a bare
        // single-level `rest.x` member — its grandparent is this assignment, so
        // upstream keeps `rest.x` (e.g. `ctx.globalAlpha *= rest.opacity`). Recorded
        // before any child is visited so it is seen when the member is reached.
        if let Some(start) = self.direct_rest_member_operand_start(&expr.right) {
            self.rest_operand_member_starts.insert(start);
        }

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
                            && self
                                .ident_rhs_site_decision(&expr.right)
                                .unwrap_or_else(|| {
                                    should_proxy_ast(
                                        &expr.right,
                                        self.reassign_non_proxy_vars,
                                        false,
                                    )
                                });

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

                        // Non-coercive logical compound operators (`||=`, `&&=`,
                        // `??=`) can store the RHS value as-is, so — like a plain
                        // `=` — the assigned value must be proxied when proxiable.
                        // Coercive operators (`+=`, `*=`, …) always coerce to a
                        // primitive, so never proxy. Mirrors upstream's
                        // `is_non_coercive_operator` gate on `should_proxy` in
                        // AssignmentExpression.js / build_assignment_value.
                        let is_logical = matches!(
                            op,
                            AssignmentOperator::LogicalOr
                                | AssignmentOperator::LogicalAnd
                                | AssignmentOperator::LogicalNullish
                        );
                        let is_raw = self.raw_state_vars.contains(name);
                        let is_derived = self.derived_vars.contains(name);
                        let needs_proxy = is_logical
                            && self.is_runes
                            && !is_raw
                            && !is_derived
                            && self
                                .ident_rhs_site_decision(&expr.right)
                                .unwrap_or_else(|| {
                                    should_proxy_ast(
                                        &expr.right,
                                        self.reassign_non_proxy_vars,
                                        false,
                                    )
                                });

                        let replacement = if needs_proxy {
                            format!(
                                "$.set({}, {}({}) {} {}, true)",
                                name, getter, name, op_str, rhs_str
                            )
                        } else {
                            format!(
                                "$.set({}, {}({}) {} {})",
                                name, getter, name, op_str, rhs_str
                            )
                        };
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

        // Destructuring LHS: for patterns like `({ x } = obj)` or `[x] = arr`.
        // Svelte's compiler decomposes these into individual reactive assignments.
        if let AssignmentTarget::ObjectAssignmentTarget(obj) = &expr.left
            && obj.rest.is_none()
            && expr.operator == AssignmentOperator::Assign
            && let Some(replacement) =
                self.try_build_object_destructure_prop_assignment(obj, &expr.right)
        {
            let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);
            self.add_replacement(full_start, full_end, replacement);
            return;
        }
        if let AssignmentTarget::ArrayAssignmentTarget(arr) = &expr.left
            && arr.rest.is_none()
            && expr.operator == AssignmentOperator::Assign
            && let Some(replacement) =
                self.try_build_array_destructure_prop_assignment(arr, &expr.right)
        {
            let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);
            self.add_replacement(full_start, full_end, replacement);
            return;
        }
        // Nested/keyed/defaulted patterns the two narrow helpers above don't
        // cover (e.g. `({ b: o.p } = src)`, `({ a: { value } } = src)`).
        if matches!(
            &expr.left,
            AssignmentTarget::ObjectAssignmentTarget(_)
                | AssignmentTarget::ArrayAssignmentTarget(_)
        ) && expr.operator == AssignmentOperator::Assign
            && let Some(replacement) =
                self.try_build_nested_destructure_prop_assignment(&expr.left, &expr.right)
        {
            let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);
            self.add_replacement(full_start, full_end, replacement);
            return;
        }
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
        // `rest.x++` keeps `rest.x` (member grandparent is the UpdateExpression).
        if let SimpleAssignmentTarget::StaticMemberExpression(member) = &expr.argument
            && let Expression::Identifier(obj) = &member.object
            && self.is_active_rest_prop(obj.name.as_str())
        {
            self.rest_operand_member_starts.insert(member.span.start);
        }

        // --- Prop member updates (bindable props): `p.a++` →
        // `p(p().a++, true)`, mirroring the assignment branch (#3048). ---
        let member_object = match &expr.argument {
            SimpleAssignmentTarget::StaticMemberExpression(m) => Some(&m.object),
            SimpleAssignmentTarget::ComputedMemberExpression(m) => Some(&m.object),
            _ => None,
        };
        if let Some(object) = member_object
            && let Some(obj_name) = Self::extract_root_object_from_expr(object)
            && self.is_active_prop_var(&obj_name)
            && !self.non_bindable_prop_vars.contains(&obj_name)
        {
            let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);
            walk::walk_update_expression(self, expr);
            let full_text = self.apply_and_drain_inner_replacements(full_start, full_end);
            let replacement = format!("{}({}, true)", obj_name, full_text);
            self.add_replacement(full_start, full_end, replacement);
            return;
        }

        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(ident) = &expr.argument {
            let name = ident.name.as_str();
            let (full_start, full_end) = self.effective_span(expr.span.start, expr.span.end);

            // --- State variable updates ---
            if self.is_any_state_var(name) {
                let callee = if expr.prefix {
                    "$.update_pre"
                } else {
                    "$.update"
                };
                let decrement = expr.operator == UpdateOperator::Decrement;
                if let Some(tc) = self.trailing_update_comment(full_start, full_end) {
                    let text = match (decrement, tc.is_line) {
                        (false, false) => format!("{callee}({name} {});", tc.comment),
                        (true, false) => format!("{callee}({name}, {} -1);", tc.comment),
                        (false, true) => {
                            format!("{callee}({name} {}\n{});", tc.comment, tc.indent)
                        }
                        (true, true) => {
                            // Multiline argument list; esrap puts a blank line
                            // on each side of a multiline statement.
                            if tc.stmt_starts_line && self.margin_before_allowed(tc.line_start) {
                                self.add_replacement(tc.line_start, tc.line_start, "\n".into());
                            }
                            let margin_after = if self.margin_after_allowed(tc.new_end) {
                                "\n"
                            } else {
                                ""
                            };
                            format!(
                                "{callee}(\n{i}\t{name}, {}\n{i}\t-1\n{i});{margin_after}",
                                tc.comment,
                                i = tc.indent
                            )
                        }
                    };
                    self.add_replacement(full_start, tc.new_end, text);
                    return;
                }
                let text = match decrement {
                    false => format!("{callee}({name})"),
                    true => format!("{callee}({name}, -1)"),
                };
                self.add_replacement(full_start, full_end, text);
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
            // Suppressed when this `rest.x` is a direct Assignment/Update operand
            // (upstream keeps `rest.x` there, e.g. `ctx.globalAlpha *= rest.opacity`).
            && !self.rest_operand_member_starts.contains(&expr.span.start)
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

    fn visit_new_expression(&mut self, expr: &NewExpression<'ast>) {
        // A `new X.Y(args)` whose callee member-spine bottoms out in a reactive
        // getter gains a CallExpression after transformation:
        //
        //   state.Y       -> $.get(state).Y
        //   prop.Y        -> prop().Y
        //   $store.Y      -> $store().Y
        //
        // The callee must therefore be parenthesised — `new (prop().Y)(args)` —
        // else `(args)` parses as arguments to the newly introduced getter call.
        // esrap/codegen apply this for proper AST `new` nodes, but this Raw-text
        // path can't, so insert the parens here. The inserts are added AFTER the
        // walk so the inner getter replacement (which shares the callee start
        // offset) is applied first; the right-to-left, stable-sorted apply then
        // places `(` immediately before the rewritten callee.
        let mut leftmost = &expr.callee;
        let wrap = loop {
            match leftmost {
                Expression::StaticMemberExpression(m) => leftmost = &m.object,
                Expression::ComputedMemberExpression(m) => leftmost = &m.object,
                Expression::Identifier(id) => {
                    let name = id.name.as_str();
                    break self.is_active_state_var(name)
                        || self.is_active_prop_var(name)
                        || self.is_active_store_sub(name);
                }
                _ => break false,
            }
        };
        walk::walk_new_expression(self, expr);
        if wrap {
            let s = expr.callee.span();
            self.add_replacement(s.start, s.start, "(".to_string());
            self.add_replacement(s.end, s.end, ")".to_string());
        }
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

    /// Try to rewrite an array destructuring assignment whose LHS elements
    /// target bindable props, e.g.
    ///   `[foo, obj[i]] = rhs;` =>
    ///   `(($$value) => { var $$array = $.to_array($$value, 2); foo($$array[0]); obj(obj()[i] = $$array[1], true); })(rhs);`
    ///
    /// Each non-null element must be either:
    ///   * a simple identifier that is a prop_source_var (without default), or
    ///   * a StaticMemberExpression / ComputedMemberExpression whose root object
    ///     identifier is a prop_source_var.
    fn try_build_array_destructure_prop_assignment<'ast>(
        &mut self,
        arr: &ArrayAssignmentTarget<'ast>,
        rhs: &Expression<'ast>,
    ) -> Option<String> {
        use super::SCRIPT_ARRAY_COUNTER;

        if arr.elements.is_empty() {
            return None;
        }

        // Collect element targets. Each entry describes how to assign the Nth element
        // of the resolved array back to its target. We require at least one prop target
        // for the rewrite to fire.
        enum ArrayTarget {
            Null, // hole — skip
            Prop(String),
            MemberOnProp {
                prop_name: String,
                full_text: String, // original text of the member expression
            },
        }

        let mut targets: Vec<ArrayTarget> = Vec::with_capacity(arr.elements.len());
        let mut any_prop = false;
        let source = self.source;

        for element in &arr.elements {
            let Some(element) = element else {
                targets.push(ArrayTarget::Null);
                continue;
            };
            // No default values supported here (rare and requires more care).
            if matches!(
                element,
                AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(_)
            ) {
                return None;
            }
            let target = element.as_assignment_target()?;
            match target {
                AssignmentTarget::AssignmentTargetIdentifier(id) => {
                    let name = id.name.as_str();
                    if !self.is_active_prop_var(name) {
                        return None;
                    }
                    any_prop = true;
                    targets.push(ArrayTarget::Prop(name.to_string()));
                }
                AssignmentTarget::StaticMemberExpression(member) => {
                    let root = Self::root_identifier_of_static_member(member)?;
                    if !self.is_active_prop_var(root) {
                        return None;
                    }
                    let span = member.span;
                    let text = source[span.start as usize..span.end as usize].to_string();
                    any_prop = true;
                    targets.push(ArrayTarget::MemberOnProp {
                        prop_name: root.to_string(),
                        full_text: text,
                    });
                }
                AssignmentTarget::ComputedMemberExpression(member) => {
                    let root = Self::root_identifier_of_computed_member(member)?;
                    if !self.is_active_prop_var(root) {
                        return None;
                    }
                    let span = member.span;
                    let text = source[span.start as usize..span.end as usize].to_string();
                    any_prop = true;
                    targets.push(ArrayTarget::MemberOnProp {
                        prop_name: root.to_string(),
                        full_text: text,
                    });
                }
                _ => return None,
            }
        }

        if !any_prop {
            return None;
        }

        // Convert the RHS with inner replacements applied (so reactive state refs
        // become getter calls, etc.).
        let rhs_start = rhs.span().start;
        let rhs_end = rhs.span().end;
        self.visit_expression(rhs);
        let rhs_text = self.apply_and_drain_inner_replacements(rhs_start, rhs_end);

        // Transform the LHS MemberOnProp entries: their `full_text` contains the
        // original source (e.g., `potentialMergePeople[index]`). We need to run
        // those through a nested ast_state_transform so that the prop getter
        // becomes `potentialMergePeople()` etc. We do a lightweight text rewrite:
        // wrap each prop identifier reference with `()` when it occurs as the
        // root object of the member expression.
        let transformed_member_texts: Vec<Option<String>> = targets
            .iter()
            .map(|t| {
                if let ArrayTarget::MemberOnProp {
                    prop_name,
                    full_text,
                } = t
                {
                    // Replace leading `prop_name` with `prop_name()` (getter) for the
                    // reference used inside the member assignment. This mirrors how
                    // prop reads are transformed in the final emitted script text.
                    if let Some(stripped) = full_text.strip_prefix(prop_name.as_str()) {
                        Some(format!("{}(){}", prop_name, stripped))
                    } else {
                        Some(full_text.clone())
                    }
                } else {
                    None
                }
            })
            .collect();

        // Generate unique $$array name using the shared counter.
        let array_name = SCRIPT_ARRAY_COUNTER.with(|c| {
            let n = c.get();
            c.set(n + 1);
            if n == 0 {
                "$$array".to_string()
            } else {
                format!("$$array_{}", n)
            }
        });

        let length = arr.elements.len();
        let mut body = String::new();
        let _ = writeln!(
            body,
            "\t\t\tvar {} = $.to_array($$value, {});",
            array_name, length
        );

        for (i, target) in targets.iter().enumerate() {
            match target {
                ArrayTarget::Null => {}
                ArrayTarget::Prop(name) => {
                    let _ = writeln!(body, "\t\t\t{}({}[{}]);", name, array_name, i);
                }
                ArrayTarget::MemberOnProp { prop_name, .. } => {
                    let member_text = transformed_member_texts[i].as_ref().unwrap();
                    let _ = writeln!(
                        body,
                        "\t\t\t{}({} = {}[{}], true);",
                        prop_name, member_text, array_name, i
                    );
                }
            }
        }

        Some(format!(
            "(($$value) => {{\n{}\t\t}})({})",
            body,
            rhs_text.trim()
        ))
    }

    fn root_identifier_of_static_member<'ast>(
        member: &StaticMemberExpression<'ast>,
    ) -> Option<&'ast str> {
        let mut cur = &member.object;
        loop {
            match cur {
                Expression::Identifier(id) => return Some(id.name.as_str()),
                Expression::StaticMemberExpression(m) => cur = &m.object,
                Expression::ComputedMemberExpression(m) => cur = &m.object,
                _ => return None,
            }
        }
    }

    fn root_identifier_of_computed_member<'ast>(
        member: &ComputedMemberExpression<'ast>,
    ) -> Option<&'ast str> {
        let mut cur = &member.object;
        loop {
            match cur {
                Expression::Identifier(id) => return Some(id.name.as_str()),
                Expression::StaticMemberExpression(m) => cur = &m.object,
                Expression::ComputedMemberExpression(m) => cur = &m.object,
                _ => return None,
            }
        }
    }

    /// Try to rewrite a simple object destructuring assignment whose LHS has
    /// shorthand property identifiers bound to bindable props, e.g.
    ///   `({ foo, bar } = rhs);`  =>  `(foo(rhs.foo), bar(rhs.bar));`
    ///
    /// Only fires when:
    ///   * the LHS is an ObjectAssignmentTarget with no rest element,
    ///   * every property is a simple shorthand identifier that resolves to a
    ///     prop_source_var (and is not shadowed),
    ///   * no default (`=`) initializers are present.
    ///
    /// If the RHS is not a plain identifier, it is cached in `$$value` and the
    /// resulting expression is wrapped in `(($$value) => ...)(rhs)`.
    fn try_build_object_destructure_prop_assignment<'ast>(
        &mut self,
        obj: &ObjectAssignmentTarget<'ast>,
        rhs: &Expression<'ast>,
    ) -> Option<String> {
        if obj.properties.is_empty() {
            return None;
        }

        // Collect (prop_name, shorthand) pairs. Only shorthand bindings
        // targeting bindable props are supported here.
        let mut targets: Vec<String> = Vec::with_capacity(obj.properties.len());
        for prop in &obj.properties {
            match prop {
                AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(ident_prop) => {
                    if ident_prop.init.is_some() {
                        return None;
                    }
                    let name = ident_prop.binding.name.as_str();
                    if !self.is_active_prop_var(name) {
                        return None;
                    }
                    targets.push(name.to_string());
                }
                _ => return None,
            }
        }
        if targets.is_empty() {
            return None;
        }

        // Determine the RHS access expression. Simple identifiers can be used
        // directly; everything else is cached via $$value inside an IIFE.
        let rhs_start = rhs.span().start;
        let rhs_end = rhs.span().end;
        self.visit_expression(rhs);
        let rhs_text = self.apply_and_drain_inner_replacements(rhs_start, rhs_end);
        let rhs_trimmed = rhs_text.trim();

        let is_simple_ident = matches!(rhs, Expression::Identifier(_));
        let access_base: String = if is_simple_ident {
            rhs_trimmed.to_string()
        } else {
            "$$value".to_string()
        };

        let assignments: Vec<String> = targets
            .iter()
            .map(|name| format!("{}({}.{})", name, access_base, name))
            .collect();

        if is_simple_ident {
            if assignments.len() == 1 {
                // Upstream always lowers through `b.sequence(assignments)` — a real
                // `SequenceExpression`, unconditionally, even with one element — and
                // esrap always self-parenthesizes a `SequenceExpression`. The marker
                // call keeps that "must be a sequence" decision alive across the
                // eventual raw-text reparse. See
                // `SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER`.
                Some(format!(
                    "{}({})",
                    SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER,
                    assignments.into_iter().next().unwrap()
                ))
            } else {
                Some(format!("({})", assignments.join(", ")))
            }
        } else {
            // Non-identifier RHS: generate an IIFE that caches it in $$value.
            let body = assignments
                .iter()
                .map(|a| format!("\t\t\t{};", a))
                .collect::<Vec<_>>()
                .join("\n");
            Some(format!(
                "(($$value) => {{\n{}\n\t\t\treturn $$value;\n\t\t}})({})",
                body, rhs_trimmed
            ))
        }
    }

    /// Fallback for destructuring-assignment targets the two narrow helpers
    /// above don't cover — nested patterns, renamed (`{ a: b }`) properties,
    /// and defaults. Reuses the shared text-based `extract_destructure_paths`
    /// pattern-walker (the same one the declaration-lowering path uses) to get
    /// one `(target, initializer)` pair per bound leaf, then wraps prop-var
    /// leaves in `name(...)` calls the way the narrow helpers above do — this
    /// function's output is spliced in as final text and never re-walked, so
    /// prop writes must be wrapped here rather than left for a later pass.
    fn try_build_nested_destructure_prop_assignment<'ast>(
        &mut self,
        target: &AssignmentTarget<'ast>,
        rhs: &Expression<'ast>,
    ) -> Option<String> {
        let target_span = target.span();
        let pattern_text =
            self.source[target_span.start as usize..target_span.end as usize].to_string();

        let rhs_start = rhs.span().start;
        let rhs_end = rhs.span().end;
        self.visit_expression(rhs);
        let rhs_text = self.apply_and_drain_inner_replacements(rhs_start, rhs_end);
        let rhs_trimmed = rhs_text.trim();

        let is_simple_ident = matches!(rhs, Expression::Identifier(_));
        let access_base: String = if is_simple_ident {
            rhs_trimmed.to_string()
        } else {
            "$$value".to_string()
        };

        let mut paths: Vec<(String, String)> = Vec::new();
        let mut inserts: Vec<(String, String)> = Vec::new();
        extract_destructure_paths(
            &pattern_text,
            &access_base,
            ArrayHelperRead::Value,
            &mut paths,
            &mut inserts,
        );

        if paths.is_empty() {
            return None;
        }

        // Only fire when at least one bound leaf is a prop var — otherwise
        // there's nothing for this pass to rewrite, and the untransformed
        // fallback (which leaves non-reactive destructuring verbatim) is correct.
        let mut changed = false;
        let assignments: Vec<String> = paths
            .iter()
            .map(|(target_text, init_text)| {
                if !target_text.contains('.')
                    && !target_text.contains('[')
                    && self.is_active_prop_var(target_text)
                {
                    changed = true;
                    format!("{}({})", target_text, init_text)
                } else {
                    format!("{} = {}", target_text, init_text)
                }
            })
            .collect();

        if !changed {
            return None;
        }

        if inserts.is_empty() && is_simple_ident {
            return Some(if assignments.len() == 1 {
                // See the sequence-marker comment on the shorthand helper above —
                // the same "always a real SequenceExpression" rule applies here.
                format!(
                    "{}({})",
                    SINGLE_TARGET_DESTRUCTURE_SEQUENCE_MARKER,
                    assignments.into_iter().next().unwrap()
                )
            } else {
                format!("({})", assignments.join(", "))
            });
        }

        let mut body = String::new();
        for (var_name, init) in &inserts {
            let _ = writeln!(body, "\t\t\tvar {} = {};", var_name, init);
        }
        for assignment in &assignments {
            let _ = writeln!(body, "\t\t\t{};", assignment);
        }
        if !is_simple_ident {
            let _ = writeln!(body, "\t\t\treturn $$value;");
        }
        Some(format!(
            "(($$value) => {{\n{}\t\t}})({})",
            body, rhs_trimmed
        ))
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

/// Whether a string / template literal opening `text` is closed by its LAST
/// byte, i.e. the whole text is that one literal.
fn ends_own_quote(text: &str) -> bool {
    let bytes = text.as_bytes();
    let quote = bytes[0];
    let mut i = 1;
    while i < bytes.len() {
        match bytes[i] {
            b'\\' => i += 2,
            b if b == quote => return i == bytes.len() - 1,
            _ => i += 1,
        }
    }
    false
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

    // A string literal — but only when the closing quote is the one that opens
    // it. `'a' + x + 'b'` also starts and ends with a quote, and returning here
    // dropped the parens the expansion needs.
    if matches!(trimmed.as_bytes().first(), Some(b'"' | b'\'' | b'`')) && ends_own_quote(trimmed) {
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
            '?' if depth == 0 && i > 0
                // Ternary or nullish coalescing
                && chars.get(i + 1) != Some(&'.') =>
            {
                return true;
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
    /// `non_proxy_vars` + props with a non-proxy primitive default — used ONLY for
    /// the reassignment proxy decision (see `StateVarCollector::reassign_non_proxy_vars`).
    pub reassign_non_proxy_vars: &'a [String],
    pub is_runes: bool,
    /// Whether dev-mode rune rewrites should fire (e.g. the `$inspect(...)`
    /// expansion into `$.inspect(() => [args], ...)` — non-dev removal of
    /// the same call remains in the text path).
    pub dev: bool,
    /// The original component source (pre-transform). Used by the
    /// `$inspect.trace()` empty-arg label builder, which needs to compute
    /// line/column relative to the user's source (not the in-flight
    /// post-rune-transform script the visitor walks). `None` disables the
    /// `(filename:line:col)` suffix and falls back to the bare label.
    pub analysis_source: Option<&'a str>,
    /// The component filename (used in the `$inspect.trace()` label
    /// suffix together with `analysis_source`).
    pub filename: Option<&'a str>,
    /// Dev-mode `$.async_derived(thunk, label, location)` locations, keyed by
    /// bound name. `None` outside dev, where upstream emits neither argument.
    pub async_derived_locations: Option<&'a AsyncDerivedLocations>,
    pub prop_source_vars: &'a [String],
    pub prop_assignment_transform_vars: &'a [String],
    pub non_bindable_prop_vars: &'a [String],
    pub store_sub_vars: &'a [String],
    pub read_only_props: &'a [(String, String)],
    pub rest_prop_vars: &'a [String],
    /// Component analysis. Threaded through so the props-destructure AST
    /// handler can call `transform_props_destructuring` (which reads
    /// `analysis.immutable`, `analysis.runes`, `analysis.accessors`,
    /// `analysis.custom_element`, plus `analysis.root.bindings`).
    pub analysis: Option<&'a ComponentAnalysis>,
    /// Names re-exported via `export { ... }` — used by the props-destructure
    /// handler.
    pub exported_names: &'a [String],
}

fn has_state_transform_candidate(script: &str, config: &AstTransformConfig) -> bool {
    let state_vars = config.state_vars;
    let is_runes = config.is_runes;
    let prop_assignment_transform_vars = config.prop_assignment_transform_vars;
    let store_sub_vars = config.store_sub_vars;
    let read_only_props = config.read_only_props;
    let rest_prop_vars = config.rest_prop_vars;
    // Check if there's anything to transform at all
    let has_state = !state_vars.is_empty();
    let has_props = !prop_assignment_transform_vars.is_empty();
    let has_stores = !store_sub_vars.is_empty();
    let has_read_only = !read_only_props.is_empty();
    let has_rest = !rest_prop_vars.is_empty();
    // `$effect` rune transforms and `$state(…)` / `$state.raw(…)` /
    // `$state.frozen(…)` declarator rewrites also live in this AST pass.
    // They are only valid when `is_runes` is true *and* the rune name is
    // not used as a store subscription. The visitor performs the full
    // per-call shadowing check; here we just need a cheap script-wide
    // byte probe to avoid the OXC parse when there is provably nothing
    // to do.
    let has_effect_calls = is_runes
        && !store_sub_vars.iter().any(|v| v == "$effect")
        && memchr::memmem::find(script.as_bytes(), b"$effect").is_some();
    let has_state_calls = is_runes
        && !store_sub_vars.iter().any(|v| v == "$state")
        && memchr::memmem::find(script.as_bytes(), b"$state").is_some();
    let has_derived_calls = is_runes
        && !store_sub_vars.iter().any(|v| v == "$derived")
        && memchr::memmem::find(script.as_bytes(), b"$derived").is_some();
    let has_props_calls = is_runes
        && !store_sub_vars.iter().any(|v| v == "$props")
        && memchr::memmem::find(script.as_bytes(), b"$props").is_some();
    // `$host()` → `$$props.$$host` (custom elements).
    let has_host_calls = is_runes
        && !store_sub_vars.iter().any(|v| v == "$host")
        && memchr::memmem::find(script.as_bytes(), b"$host").is_some();
    // Dev-mode equality → `$.strict_equals(...)` / `$.equals(...)` rewrite
    // (formerly `rune_transforms::transform_strict_equals`). The visitor walks
    // every BinaryExpression so we only need a byte probe to know
    // whether to enter the AST pass at all.
    let has_strict_equals = config.dev && super::strict_equals_ast::source_has_equality_op(script);
    // Dev-mode `await X` → `(await $.track_reactivity_loss(X))()` rewrite.
    let has_await = config.dev && memchr::memmem::find(script.as_bytes(), b"await").is_some();
    // Dev-mode `$inspect(...)` → `$.inspect(...)`; without its own probe the
    // rewrite only fires once some other rune has opened the pass.
    let has_inspect =
        config.dev && config.is_runes && super::inspect_rune_ast::source_has_inspect_rune(script);

    if !has_state
        && !has_props
        && !has_stores
        && !has_read_only
        && !has_rest
        && !has_effect_calls
        && !has_state_calls
        && !has_derived_calls
        && !has_props_calls
        && !has_host_calls
        && !has_strict_equals
        && !has_await
        && !has_inspect
    {
        return false;
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
            // SAFETY: `bytes` come from `script.as_bytes()`. The slice spans
            // `start..i`, a run that begins at an ASCII ident-start byte and
            // continues only over ASCII ident-continue bytes, so it is
            // entirely ASCII and therefore valid UTF-8 on char boundaries.
            let word = unsafe { std::str::from_utf8_unchecked(&bytes[start..i]) };
            set.insert(word);
        }
        set
    };
    (has_state && state_vars.iter().any(|v| script_ids.contains(v.as_str())))
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
                .any(|v| script_ids.contains(v.as_str())))
        || (has_effect_calls && script_ids.contains("$effect"))
        || (has_state_calls && script_ids.contains("$state"))
        || (has_derived_calls && script_ids.contains("$derived"))
        || (has_props_calls && script_ids.contains("$props"))
        || (has_host_calls && script_ids.contains("$host"))
        || has_strict_equals
        // `await` is a keyword, not an identifier, so it can only be carried by
        // its own probe here.
        || has_await
        || has_inspect
}

fn state_assignment_needs_semantic(program: &Program<'_>, state_vars: &FxHashSet<&str>) -> bool {
    if state_vars.is_empty() {
        return false;
    }

    struct Finder<'a> {
        state_vars: &'a FxHashSet<&'a str>,
        found: bool,
    }

    impl<'a, 'ast> Visit<'ast> for Finder<'a> {
        fn visit_assignment_expression(&mut self, expression: &AssignmentExpression<'ast>) {
            if self.found {
                return;
            }
            let AssignmentTarget::AssignmentTargetIdentifier(target) = &expression.left else {
                walk::walk_assignment_expression(self, expression);
                return;
            };
            let needs_site_resolution = matches!(
                expression.operator,
                AssignmentOperator::Assign
                    | AssignmentOperator::LogicalOr
                    | AssignmentOperator::LogicalAnd
                    | AssignmentOperator::LogicalNullish
            ) && matches!(
                expression.right.get_inner_expression(),
                Expression::Identifier(_)
            );
            if needs_site_resolution && self.state_vars.contains(target.name.as_str()) {
                self.found = true;
                return;
            }
            walk::walk_assignment_expression(self, expression);
        }
    }

    let mut finder = Finder {
        state_vars,
        found: false,
    };
    finder.visit_program(program);
    finder.found
}

fn projected_statement_is_type_only(statement: &Statement<'_>) -> bool {
    match statement {
        Statement::ImportDeclaration(_)
        | Statement::TSTypeAliasDeclaration(_)
        | Statement::TSInterfaceDeclaration(_)
        | Statement::TSEnumDeclaration(_)
        | Statement::TSExternalModuleDeclaration(_)
        | Statement::TSNamespaceDeclaration(_) => true,
        Statement::VariableDeclaration(declaration) => declaration.declare,
        Statement::FunctionDeclaration(function) => {
            function.r#type == FunctionType::TSDeclareFunction
                || function.declare
                || function.body.is_none()
        }
        Statement::ClassDeclaration(class) => class.declare,
        Statement::ExportNamedDeclaration(export) => export.export_kind == ImportOrExportKind::Type,
        Statement::ExportFromDeclaration(export) => export.export_kind == ImportOrExportKind::Type,
        Statement::ExportDeclaration(export) => {
            let declaration = &export.declaration;
            // oxc derives this from the declaration instead of storing it.
            export.export_kind() == ImportOrExportKind::Type
                || matches!(
                    declaration,
                    Declaration::TSTypeAliasDeclaration(_)
                        | Declaration::TSInterfaceDeclaration(_)
                        | Declaration::TSEnumDeclaration(_)
                        | Declaration::TSExternalModuleDeclaration(_)
                        | Declaration::TSNamespaceDeclaration(_)
                )
                || matches!(
                    declaration,
                    Declaration::FunctionDeclaration(function)
                        if function.r#type == FunctionType::TSDeclareFunction
                            || function.declare
                            || function.body.is_none()
                )
                || matches!(
                    declaration,
                    Declaration::VariableDeclaration(declaration) if declaration.declare
                )
                || matches!(
                    declaration,
                    Declaration::ClassDeclaration(class) if class.declare
                )
        }
        Statement::ExportDefaultDeclaration(export) => {
            matches!(
                &export.declaration,
                ExportDefaultDeclarationKind::TSInterfaceDeclaration(_)
            ) || matches!(
                &export.declaration,
                ExportDefaultDeclarationKind::FunctionDeclaration(function)
                    if function.r#type == FunctionType::TSDeclareFunction
                        || function.declare
                        || function.body.is_none()
            ) || matches!(
                &export.declaration,
                ExportDefaultDeclarationKind::ClassDeclaration(class) if class.declare
            )
        }
        Statement::ExportAllDeclaration(export) => export.export_kind == ImportOrExportKind::Type,
        _ => false,
    }
}

fn projected_state_transform_requires_fallback(
    program: &Program<'_>,
    state_vars: &[String],
    projection: &ScriptProjection,
) -> bool {
    struct Finder<'a> {
        state_vars: &'a [String],
        projection: &'a ScriptProjection,
        found: bool,
    }

    impl Finder<'_> {
        fn target_crosses_omitted_source(&self, start: u32, end: u32) -> bool {
            let source = start..end;
            self.projection
                .output_range_for_source(source.clone())
                .is_none()
                && self
                    .projection
                    .copied_chunks
                    .iter()
                    .any(|chunk| source.start < chunk.source.end && source.end > chunk.source.start)
        }
    }

    impl<'a, 'ast> Visit<'ast> for Finder<'a> {
        fn visit_assignment_expression(&mut self, expression: &AssignmentExpression<'ast>) {
            if self.found {
                return;
            }
            let target_span = expression.left.span();
            if self.target_crosses_omitted_source(target_span.start, target_span.end) {
                self.found = true;
                return;
            }
            if let AssignmentTarget::AssignmentTargetIdentifier(target) = &expression.left {
                let needs_site_resolution = matches!(
                    expression.operator,
                    AssignmentOperator::Assign
                        | AssignmentOperator::LogicalOr
                        | AssignmentOperator::LogicalAnd
                        | AssignmentOperator::LogicalNullish
                ) && matches!(
                    expression.right.get_inner_expression(),
                    Expression::Identifier(_)
                );
                if needs_site_resolution
                    && self
                        .state_vars
                        .iter()
                        .any(|name| name == target.name.as_str())
                {
                    self.found = true;
                    return;
                }
            }
            walk::walk_assignment_expression(self, expression);
        }

        fn visit_update_expression(&mut self, expression: &UpdateExpression<'ast>) {
            if self.found {
                return;
            }
            let target_span = expression.argument.span();
            if self.target_crosses_omitted_source(target_span.start, target_span.end) {
                self.found = true;
                return;
            }
            walk::walk_update_expression(self, expression);
        }

        fn visit_variable_declarator(&mut self, declarator: &VariableDeclarator<'ast>) {
            if self.found {
                return;
            }
            let Some(init) = &declarator.init else {
                return;
            };

            // A line comment between `=` and `$props()` can make the script
            // projection omit part of the declaration while still mapping
            // later identifier replacements. Silently dropping the whole-
            // declaration replacement then returns a partially transformed
            // script. Reparse the emitted script whenever that replacement
            // cannot be projected as one source range.
            if let Expression::CallExpression(call) = init.get_inner_expression()
                && matches!(
                    &call.callee,
                    Expression::Identifier(identifier) if identifier.name == "$props"
                )
                && self.target_crosses_omitted_source(declarator.span.start, declarator.span.end)
            {
                self.found = true;
                return;
            }

            if !matches!(
                init,
                Expression::TSAsExpression(_)
                    | Expression::TSSatisfiesExpression(_)
                    | Expression::TSNonNullExpression(_)
                    | Expression::TSTypeAssertion(_)
                    | Expression::TSInstantiationExpression(_)
            ) {
                walk::walk_variable_declarator(self, declarator);
                return;
            }
            let Expression::CallExpression(call) = init.get_inner_expression() else {
                walk::walk_variable_declarator(self, declarator);
                return;
            };
            let rune_name = match &call.callee {
                Expression::Identifier(identifier) => Some(identifier.name.as_str()),
                Expression::StaticMemberExpression(member) => match &member.object {
                    Expression::Identifier(object) => Some(object.name.as_str()),
                    _ => None,
                },
                _ => None,
            };
            self.found = rune_name
                .is_some_and(|name| matches!(name, "$state" | "$derived" | "$props" | "$bindable"));
            if !self.found {
                walk::walk_variable_declarator(self, declarator);
            }
        }
    }

    let mut finder = Finder {
        state_vars,
        projection,
        found: false,
    };
    finder.visit_program(program);
    finder.found
}

pub(super) fn transform_state_vars_ast(
    script: &str,
    config: &AstTransformConfig,
) -> Option<String> {
    if !has_state_transform_candidate(script, config) {
        return None;
    }

    with_ast_transform_allocator(|alloc| {
        let source_type = SourceType::mjs();
        let _pt = super::super::profile::timer_start();
        let parsed = Parser::new(alloc, script, source_type).parse();
        super::super::profile::record_direct_parse(
            super::super::profile::timer_elapsed(_pt),
            script.len(),
        );

        if parsed.panicked || !parsed.diagnostics.is_empty() {
            // Parse error - fall back to text-based transform
            return None;
        }

        transform_state_vars_ast_from_program_unchecked(
            script,
            &parsed.program,
            0..script.len(),
            config,
        )
    })
}

#[cfg(test)]
pub(super) fn transform_state_vars_ast_from_program(
    script: &str,
    program: &Program<'_>,
    config: &AstTransformConfig,
) -> Option<String> {
    debug_assert_eq!(script, program.source_text);
    if !has_state_transform_candidate(script, config) {
        return None;
    }

    transform_state_vars_ast_from_program_unchecked(script, program, 0..script.len(), config)
}

pub(super) fn transform_state_vars_ast_range_from_program(
    script: &str,
    program: &Program<'_>,
    candidate: &str,
    output_range: std::ops::Range<usize>,
    config: &AstTransformConfig,
) -> Option<String> {
    debug_assert_eq!(script, program.source_text);
    if !has_state_transform_candidate(candidate, config) {
        return None;
    }

    transform_state_vars_ast_from_program_unchecked(script, program, output_range, config)
}

pub(super) fn transform_state_vars_ast_projected_from_program(
    script: &str,
    program: &Program<'_>,
    candidate: &str,
    projection: &ScriptProjection,
    projection_output_range: std::ops::Range<usize>,
    config: &AstTransformConfig,
) -> Result<Option<String>, ()> {
    debug_assert_eq!(script, program.source_text);
    if !has_state_transform_candidate(candidate, config) {
        return Ok(None);
    }
    if projection.source_len as usize != script.len()
        || projection_output_range.end > projection.output_len as usize
        || projection_output_range.end - projection_output_range.start != candidate.len()
    {
        return Err(());
    }

    if projected_state_transform_requires_fallback(program, config.state_vars, projection) {
        return Err(());
    }

    let mut mapped = Vec::new();
    for replacement in collect_state_var_replacements_without_semantic_scan(script, program, config)
    {
        let source_range = replacement.start..replacement.end;
        if let Some(output_range) = projection.output_range_for_source(source_range.clone()) {
            let output_start = output_range.start as usize;
            let output_end = output_range.end as usize;
            if output_end <= projection_output_range.start
                || output_start >= projection_output_range.end
            {
                continue;
            }
            if output_start < projection_output_range.start
                || output_end > projection_output_range.end
            {
                return Err(());
            }
            let candidate_start = output_start - projection_output_range.start;
            let candidate_end = output_end - projection_output_range.start;
            if script.get(source_range.start as usize..source_range.end as usize)
                != candidate.get(candidate_start..candidate_end)
            {
                return Err(());
            }
            mapped.push(Replacement {
                start: candidate_start as u32,
                end: candidate_end as u32,
                text: replacement.text,
            });
            continue;
        }

        let overlaps_copied_source = projection.copied_chunks.iter().any(|chunk| {
            source_range.start < chunk.source.end && source_range.end > chunk.source.start
        });
        if source_range.is_empty() || overlaps_copied_source {
            return Err(());
        }
    }

    if mapped.is_empty() {
        return Ok(None);
    }
    mapped.sort_by_key(|replacement| std::cmp::Reverse(replacement.start));
    let mut output = candidate.to_string();
    for replacement in mapped {
        output.replace_range(
            replacement.start as usize..replacement.end as usize,
            &replacement.text,
        );
    }
    Ok(Some(output))
}

fn transform_state_vars_ast_from_program_unchecked(
    script: &str,
    program: &Program<'_>,
    output_range: std::ops::Range<usize>,
    config: &AstTransformConfig,
) -> Option<String> {
    let mut replacements = collect_state_var_replacements(script, program, config);
    replacements.retain(|replacement| {
        replacement.start as usize >= output_range.start
            && replacement.end as usize <= output_range.end
    });
    if replacements.is_empty() {
        return None;
    }

    replacements.sort_by_key(|r| std::cmp::Reverse(r.start));

    let mut result = script[output_range.clone()].to_string();
    for rep in &replacements {
        result.replace_range(
            rep.start as usize - output_range.start..rep.end as usize - output_range.start,
            &rep.text,
        );
    }

    Some(result)
}

fn collect_state_var_replacements(
    script: &str,
    program: &Program<'_>,
    config: &AstTransformConfig,
) -> Vec<Replacement> {
    let var_set: FxHashSet<&str> = config.state_vars.iter().map(String::as_str).collect();
    let non_reactive_set: FxHashSet<&str> = config
        .non_reactive_vars
        .iter()
        .map(String::as_str)
        .collect();
    let raw_set: FxHashSet<&str> = config.raw_state_vars.iter().map(String::as_str).collect();
    let semantic_ret = state_assignment_needs_semantic(program, &var_set).then(|| {
        super::super::profile::semantic_build(
            super::super::profile::SEM_AST_STATE_TRANSFORM,
            program.source_text.len(),
            || {
                oxc_semantic::SemanticBuilder::new()
                    .with_build_nodes(true)
                    .build(program)
            },
        )
    });

    let mut collector = StateVarCollector::new(
        script,
        &var_set,
        &non_reactive_set,
        &raw_set,
        config.derived_vars,
        config.non_proxy_vars,
        config.reassign_non_proxy_vars,
        config.is_runes,
        config.dev,
        config.analysis_source,
        config.filename,
        config.async_derived_locations,
        config.prop_source_vars,
        config.non_bindable_prop_vars,
        config.store_sub_vars,
        config.read_only_props,
        config.rest_prop_vars,
        config.prop_assignment_transform_vars,
        config.analysis,
        config.exported_names,
    );
    collector.semantic = semantic_ret.as_ref().map(|ret| &ret.semantic);
    collector.collect_await_ignore_ranges(program);
    collector.visit_program(program);
    collector.replacements
}

fn collect_state_var_replacements_without_semantic_scan(
    script: &str,
    program: &Program<'_>,
    config: &AstTransformConfig,
) -> Vec<Replacement> {
    let var_set: FxHashSet<&str> = config.state_vars.iter().map(String::as_str).collect();
    let non_reactive_set: FxHashSet<&str> = config
        .non_reactive_vars
        .iter()
        .map(String::as_str)
        .collect();
    let raw_set: FxHashSet<&str> = config.raw_state_vars.iter().map(String::as_str).collect();
    let mut collector = StateVarCollector::new(
        script,
        &var_set,
        &non_reactive_set,
        &raw_set,
        config.derived_vars,
        config.non_proxy_vars,
        config.reassign_non_proxy_vars,
        config.is_runes,
        config.dev,
        config.analysis_source,
        config.filename,
        config.async_derived_locations,
        config.prop_source_vars,
        config.non_bindable_prop_vars,
        config.store_sub_vars,
        config.read_only_props,
        config.rest_prop_vars,
        config.prop_assignment_transform_vars,
        config.analysis,
        config.exported_names,
    );
    collector.collect_await_ignore_ranges(program);
    for statement in &program.body {
        if !projected_statement_is_type_only(statement) {
            collector.visit_statement(statement);
        }
    }
    collector.replacements
}

/// Is the byte at `at` the first non-whitespace on its line?
fn starts_its_own_line(bytes: &[u8], at: usize) -> bool {
    let mut i = at;
    while i > 0 {
        i -= 1;
        if bytes[i] == b'\n' {
            return true;
        }
        if !bytes[i].is_ascii_whitespace() {
            return false;
        }
    }
    true
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
            reassign_non_proxy_vars: &[],
            is_runes: true,
            dev: false,
            analysis_source: None,
            filename: None,
            async_derived_locations: None,
            prop_source_vars: &[],
            prop_assignment_transform_vars: &[],
            non_bindable_prop_vars: &[],
            store_sub_vars: &[],
            read_only_props: &[],
            rest_prop_vars: &[],
            analysis: None,
            exported_names: &[],
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
            reassign_non_proxy_vars: &[],
            is_runes: true,
            dev: false,
            analysis_source: None,
            filename: None,
            async_derived_locations: None,
            prop_source_vars: &[],
            prop_assignment_transform_vars: &[],
            non_bindable_prop_vars: &[],
            store_sub_vars: &[],
            read_only_props: &[],
            rest_prop_vars: &[],
            analysis: None,
            exported_names: &[],
        };
        transform_state_vars_ast(script, &config).unwrap_or_else(|| script.to_string())
    }

    fn transform_with_reactive_getters(
        script: &str,
        prop_vars: &[&str],
        store_vars: &[&str],
    ) -> String {
        let prop_vars: Vec<String> = prop_vars.iter().map(|s| s.to_string()).collect();
        let store_vars: Vec<String> = store_vars.iter().map(|s| s.to_string()).collect();
        let config = AstTransformConfig {
            state_vars: &[],
            non_reactive_vars: &[],
            raw_state_vars: &[],
            derived_vars: &[],
            non_proxy_vars: &[],
            reassign_non_proxy_vars: &[],
            is_runes: true,
            dev: false,
            analysis_source: None,
            filename: None,
            async_derived_locations: None,
            prop_source_vars: &prop_vars,
            prop_assignment_transform_vars: &prop_vars,
            non_bindable_prop_vars: &[],
            store_sub_vars: &store_vars,
            read_only_props: &[],
            rest_prop_vars: &[],
            analysis: None,
            exported_names: &[],
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
    fn comment_between_state_declaration_and_read_keeps_reactivity() {
        let script = "const multiplier = () => {\n\tlet multiplier = $state(2);\n\t// } comment\n\tlet multiple = $derived(count * multiplier);\n\treturn multiple;\n};";
        let output = transform(script, &["multiplier"]);
        assert!(output.contains("$.get(multiplier)"), "{output}");
    }

    #[test]
    fn destructured_async_derived_saves_non_final_awaits() {
        let output = transform("const { a, b } = $derived((await p) + (await q));", &[]);

        assert!(
            output.contains("$.save(p)") && output.contains("await q"),
            "non-final await must preserve reactive context: {output}"
        );
        assert!(
            !output.contains("$.save(q)"),
            "the final await must not be save-wrapped: {output}"
        );
    }

    #[test]
    fn async_derived_saves_non_final_awaits() {
        let output = transform("const a = $derived((await p) + (await q));", &[]);

        assert!(
            output.contains("$.save(p)") && output.contains("await q"),
            "non-final await must preserve reactive context: {output}"
        );
        assert!(
            !output.contains("$.save(q)"),
            "the final await must not be save-wrapped: {output}"
        );
    }

    #[test]
    fn retained_program_matches_reparsed_output_and_whitespace() {
        let script = "\n\nlet count = $state(0);\nconst read = () => count;\n\n";
        let state_vars = vec!["count".to_string()];
        let config = AstTransformConfig {
            state_vars: &state_vars,
            non_reactive_vars: &[],
            raw_state_vars: &[],
            derived_vars: &[],
            non_proxy_vars: &[],
            reassign_non_proxy_vars: &[],
            is_runes: true,
            dev: false,
            analysis_source: None,
            filename: None,
            async_derived_locations: None,
            prop_source_vars: &[],
            prop_assignment_transform_vars: &[],
            non_bindable_prop_vars: &[],
            store_sub_vars: &[],
            read_only_props: &[],
            rest_prop_vars: &[],
            analysis: None,
            exported_names: &[],
        };
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, script, SourceType::mjs()).parse();
        assert!(parsed.diagnostics.is_empty());

        let retained =
            transform_state_vars_ast_from_program(script, &parsed.program, &config).unwrap();
        let reparsed = transform_state_vars_ast(script, &config).unwrap();

        assert_eq!(retained, reparsed);
        assert!(retained.starts_with("\n\n"));
        assert!(retained.ends_with("\n\n"));
    }

    #[test]
    fn projected_typescript_type_declaration_does_not_shadow_runtime_state() {
        let script = "type count = number;\nenum Removed { Value = count }\nlet count = $state(0);\nconst read = () => count;\n";
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, script, SourceType::ts()).parse();
        assert!(parsed.diagnostics.is_empty());
        let (candidate, projection) =
            crate::compiler::phases::phase2_analyze::types::strip_typescript_from_program_with_projection(
                script,
                &parsed.program,
            );
        let projection = projection.expect("type declaration must be omitted");
        let state_vars = vec!["count".to_string()];
        let config = AstTransformConfig {
            state_vars: &state_vars,
            non_reactive_vars: &[],
            raw_state_vars: &[],
            derived_vars: &[],
            non_proxy_vars: &[],
            reassign_non_proxy_vars: &[],
            is_runes: true,
            dev: false,
            analysis_source: None,
            filename: None,
            async_derived_locations: None,
            prop_source_vars: &[],
            prop_assignment_transform_vars: &[],
            non_bindable_prop_vars: &[],
            store_sub_vars: &[],
            read_only_props: &[],
            rest_prop_vars: &[],
            analysis: None,
            exported_names: &[],
        };
        let runtime_start = script.find("let count").unwrap() as u32;
        assert!(
            collect_state_var_replacements_without_semantic_scan(script, &parsed.program, &config)
                .iter()
                .all(|replacement| replacement.start >= runtime_start),
            "removed enum initializers must not participate in runtime state transforms"
        );

        let transformed = transform_state_vars_ast_projected_from_program(
            script,
            &parsed.program,
            &candidate,
            &projection,
            0..candidate.len(),
            &config,
        )
        .expect("type-only omission is safe to project")
        .expect("runtime state references must be transformed");

        assert_eq!(
            transformed,
            "\n\nlet count = $.state(0);\nconst read = () => $.get(count);\n"
        );
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

    #[test]
    fn new_callee_parenthesises_prop_getter_call() {
        assert_eq!(
            transform_with_reactive_getters(
                "const instance = new Constructor({ value: 1 });",
                &["Constructor"],
                &[],
            ),
            "const instance = new (Constructor())({ value: 1 });"
        );
    }

    #[test]
    fn new_member_callee_parenthesises_store_getter_call() {
        assert_eq!(
            transform_with_reactive_getters(
                "const instance = new $constructors.Current();",
                &[],
                &["$constructors"],
            ),
            "const instance = new ($constructors().Current)();"
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
    fn test_bare_assignment_rhs_uses_site_semantics() {
        let local = transform(
            r#"items.forEach((item) => {
                const id = `${item}`;
                highlighted = id;
            });"#,
            &["highlighted"],
        );
        assert!(local.contains("$.set(highlighted, id)"));
        assert!(!local.contains("$.set(highlighted, id, true)"));

        let parameter = transform(
            "const handler = (id) => { highlighted = id; };",
            &["highlighted"],
        );
        assert!(parameter.contains("$.set(highlighted, id, true)"));
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
        // Non-coercive logical operators proxy the assigned value (`, true`),
        // matching upstream `is_non_coercive_operator` + `should_proxy`.
        assert_eq!(
            transform("count ??= fallback", &["count"]),
            "$.set(count, $.get(count) ?? fallback, true)"
        );
    }

    #[test]
    fn test_compound_nullish_with_state_rhs() {
        // When the RHS is also a state var, it should get $.get() wrapping
        assert_eq!(
            transform("count ??= fallback", &["count", "fallback"]),
            "$.set(count, $.get(count) ?? $.get(fallback), true)"
        );
    }

    #[test]
    fn test_compound_logical_or_proxies() {
        assert_eq!(
            transform("count ||= other", &["count"]),
            "$.set(count, $.get(count) || other, true)"
        );
    }

    #[test]
    fn test_compound_logical_and_proxies() {
        assert_eq!(
            transform("count &&= other", &["count"]),
            "$.set(count, $.get(count) && other, true)"
        );
    }

    #[test]
    fn test_compound_addition_does_not_proxy() {
        // Coercive operators always produce a primitive — no proxy flag.
        assert_eq!(
            transform("count += other", &["count"]),
            "$.set(count, $.get(count) + other)"
        );
    }

    #[test]
    fn test_compound_nullish_literal_rhs_no_proxy() {
        // A primitive literal RHS is never proxied even for logical operators.
        assert_eq!(
            transform("count ??= 5", &["count"]),
            "$.set(count, $.get(count) ?? 5)"
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
            reassign_non_proxy_vars: &[],
            is_runes: true,
            dev: false,
            analysis_source: None,
            filename: None,
            async_derived_locations: None,
            prop_source_vars: &[],
            prop_assignment_transform_vars: &[],
            non_bindable_prop_vars: &[],
            store_sub_vars: &[],
            read_only_props: &[],
            rest_prop_vars: &[],
            analysis: None,
            exported_names: &[],
        }
    }

    #[test]
    fn test_empty_state_vars() {
        let config = empty_config();
        let result = transform_state_vars_ast("count + 1", &config);
        assert_eq!(result, None);
    }

    #[test]
    fn inspect_moves_a_trailing_comment_into_its_observed_array() {
        let mut config = empty_config();
        config.dev = true;
        let result =
            transform_state_vars_ast("$inspect(a); // c\nconsole.log(2);", &config).unwrap();
        assert_eq!(
            result,
            "$.inspect(() => [a, // c\n], (...$$args) => console.log(...$$args), true);\nconsole.log(2);"
        );
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
    fn local_derived_shadows_same_named_outer_prop() {
        let prop_vars = vec!["ref".to_string()];
        let config = AstTransformConfig {
            state_vars: &[],
            non_reactive_vars: &[],
            raw_state_vars: &[],
            derived_vars: &[],
            non_proxy_vars: &[],
            reassign_non_proxy_vars: &[],
            is_runes: true,
            dev: false,
            analysis_source: None,
            filename: None,
            async_derived_locations: None,
            prop_source_vars: &prop_vars,
            prop_assignment_transform_vars: &prop_vars,
            non_bindable_prop_vars: &[],
            store_sub_vars: &[],
            read_only_props: &[],
            rest_prop_vars: &[],
            analysis: None,
            exported_names: &[],
        };
        let input = "function setup(value) { const ref = $derived(value); return ref; } ref;";
        let expected = "function setup(value) { const ref = $.derived(() => value); return $.get(ref); } ref();";

        assert_eq!(transform_state_vars_ast(input, &config).unwrap(), expected);
    }

    #[test]
    fn test_non_state_declaration_does_shadow() {
        // A regular `let count = 0` inside a function SHOULD shadow
        let input = "let count = $.state(0);\nfunction f() { let count = 0; return count; }";
        let expected = "let count = $.state(0);\nfunction f() { let count = 0; return count; }";
        assert_eq!(transform(input, &["count"]), expected);
    }
}
