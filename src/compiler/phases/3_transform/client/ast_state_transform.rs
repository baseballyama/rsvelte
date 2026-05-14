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
use oxc_syntax::operator::{AssignmentOperator, BinaryOperator, UpdateOperator};
use oxc_syntax::scope::ScopeFlags;
use oxc_syntax::scope::ScopeId;
use rustc_hash::FxHashSet;

use super::destructure_transforms::unthunk_string;
use super::expression_utils::{
    contains_direct_await_in_expression, extract_enclosing_function_name, extract_trace_call_label,
    find_trace_source_location, strip_top_level_await_from_expr,
    wrap_await_with_save_in_async_derived,
};
use super::rune_transforms::{process_derived_destructuring_pattern, wrap_state_value};
use super::{DERIVED_TMP_COUNTER, SCRIPT_ARRAY_COUNTER, STATE_TMP_COUNTER, VAR_STATE_VARS};

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
        dev: bool,
        analysis_source: Option<&'s str>,
        filename: Option<&'s str>,
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
            dev,
            analysis_source,
            filename,
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

    /// Add a replacement.
    fn add_replacement(&mut self, start: u32, end: u32, text: String) {
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
    /// `wrap_state_derived_with_tag` re-scan in `transform_client_with_visitors`
    /// no longer has to walk the script in dev mode, eliminating one
    /// O(text_len) buffer pass per component.
    fn maybe_tag_declarator(&self, var_name: &str, replacement: String) -> String {
        if !self.dev {
            return replacement;
        }
        let head = replacement.as_str();
        if head.starts_with("$.state(") || head.starts_with("$.derived(") {
            format!("$.tag({}, '{}')", replacement, var_name)
        } else if head.starts_with("$.proxy(") {
            format!("$.tag_proxy({}, '{}')", replacement, var_name)
        } else {
            replacement
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
        let arg_text = if let Some(arg) = call.arguments.first() {
            self.visit_argument(arg);
            let arg_span = arg.span();
            let transformed = self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);
            if transformed.trim().is_empty() {
                "void 0".to_string()
            } else {
                transformed
            }
        } else {
            "void 0".to_string()
        };

        let replacement = if is_non_reactive {
            arg_text
        } else {
            format!("$.state({})", arg_text)
        };

        let replacement = self.maybe_tag_declarator(var_name, replacement);
        self.add_replacement(call.span.start, call.span.end, replacement);
        true
    }

    /// AST replacement for plain `$state(value)` rune declarators. Mirrors the
    /// text-pipeline rewrite that used to live in
    /// `rune_transforms::transform_client_runes_with_skip_and_state`:
    ///
    /// |                    | non-reactive (in `non_reactive_vars`)        | reactive                                      |
    /// | `$state()` (empty) | `void 0`                                     | `$.state(void 0)`                             |
    /// | `$state(prim)`     | `prim`                                       | `$.state(prim)`                               |
    /// | `$state(undefined)`| `void 0` (special case, matches text)        | `$.state(undefined)` (literal kept)           |
    /// | `$state(obj/arr/…)`| `$.proxy(obj/arr/…)` if `should_proxy_ast`   | `$.state($.proxy(obj/arr/…))`                 |
    ///
    /// Proxy decision uses `should_proxy_ast(arg, &[])` — the text pipeline
    /// it replaces used a scope-less `expression_needs_proxy(...)` here, so
    /// we pass an empty `non_proxy_vars` to keep behaviour byte-identical.
    fn try_rewrite_state_call_declarator(&mut self, declarator: &VariableDeclarator<'_>) -> bool {
        let Some(init) = &declarator.init else {
            return false;
        };
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
        let (needs_proxy, is_explicit_undefined) = if let Some(arg) = call.arguments.first() {
            let arg_expr = arg.as_expression();
            let needs_proxy = arg_expr.map(|e| should_proxy_ast(e, &[])).unwrap_or(false);
            let is_undef = matches!(
                arg_expr,
                Some(Expression::Identifier(id)) if id.name == "undefined"
            );
            (needs_proxy, is_undef)
        } else {
            (false, false)
        };

        // Walk the argument first so any inner state-var refs get `$.get(...)`
        // wrapping, then drain those inner replacements and bake them into
        // the outer text. This matches the behaviour the old text path
        // produced indirectly: it emitted `$.state(arg)` (or `$.proxy(arg)`)
        // which the existing AST pass then re-visited and rewrote inner
        // refs of.
        let arg_text = if let Some(arg) = call.arguments.first() {
            self.visit_argument(arg);
            let arg_span = arg.span();
            let transformed = self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);
            if transformed.trim().is_empty() {
                "void 0".to_string()
            } else {
                transformed
            }
        } else {
            "void 0".to_string()
        };

        let replacement = if is_non_reactive {
            if needs_proxy {
                format!("$.proxy({})", arg_text)
            } else if is_explicit_undefined {
                // Special case from the old text path: in the non-reactive
                // branch, `$state(undefined)` → `void 0` (not `undefined`).
                // The reactive branch keeps the literal as-is, so we only
                // apply this rewrite when non-reactive.
                "void 0".to_string()
            } else {
                arg_text
            }
        } else if needs_proxy {
            format!("$.state($.proxy({}))", arg_text)
        } else {
            format!("$.state({})", arg_text)
        };

        let replacement = self.maybe_tag_declarator(var_name, replacement);
        self.add_replacement(call.span.start, call.span.end, replacement);
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
        let end = call.span.end;
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
    /// (computed key, nested pattern beyond simple identifier targets,
    /// etc.) so the caller can bail back to the text path.
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
            // Drop AssignmentPattern wrapper — the text path ignores the
            // default value, only using the left-hand identifier.
            let var_ident = match value_pattern {
                BindingPattern::BindingIdentifier(id) => id,
                BindingPattern::AssignmentPattern(assign) => match &assign.left {
                    BindingPattern::BindingIdentifier(id) => id,
                    _ => return false,
                },
                _ => return false,
            };
            let var_name = var_ident.name.as_str();

            // Resolve the source-side key text.
            let key_text = match &prop.key {
                PropertyKey::StaticIdentifier(id) => id.name.as_str().to_string(),
                PropertyKey::StringLiteral(s) => s.value.as_str().to_string(),
                _ => return false,
            };

            let is_skip = self.is_state_destructure_skip(var_name);
            let member_access = format!("{}.{}", tmp_name, key_text);
            let value_expr = wrap_state_value(&member_access, is_raw, is_skip);
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
            let access = format!("{}.{}", tmp_name, var_name);
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
        declarations.push(format!(
            "{} = $.derived(() => {})",
            array_var, to_array_args
        ));

        for (index, elem_opt) in arr.elements.iter().enumerate() {
            let Some(elem) = elem_opt else { continue };
            let var_ident = match elem {
                BindingPattern::BindingIdentifier(id) => id,
                BindingPattern::AssignmentPattern(assign) => match &assign.left {
                    BindingPattern::BindingIdentifier(id) => id,
                    _ => return false,
                },
                _ => return false,
            };
            let var_name = var_ident.name.as_str();
            let is_skip = self.is_state_destructure_skip(var_name);
            let element_access = format!("$.get({})[{}]", array_var, index);
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
        // text helper walks this string.
        let pattern_span = declarator.id.span();
        let pattern_text =
            self.source[pattern_span.start as usize..pattern_span.end as usize].to_string();
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
            // `await $.async_derived(...)` emission.
            let saved_content = wrap_await_with_save_in_async_derived(wrapped_source.trim());
            let inner_expr = strip_top_level_await_from_expr(&saved_content);
            let inner_has_nested_await = contains_direct_await_in_expression(&inner_expr);

            if inner_has_nested_await {
                let is_object = saved_content.trim().starts_with('{');
                let stmt = if is_object {
                    format!(
                        "{} = await $.async_derived(async () => ({}))",
                        d_name, saved_content
                    )
                } else {
                    format!(
                        "{} = await $.async_derived(async () => {})",
                        d_name, saved_content
                    )
                };
                declarations.push(stmt);
            } else {
                let inner_trimmed = inner_expr.trim();
                let inner_is_object = inner_trimmed.starts_with('{');
                if inner_is_object {
                    declarations.push(format!(
                        "{} = await $.async_derived(() => ({}))",
                        d_name, inner_expr
                    ));
                } else {
                    let thunk_arg = unthunk_string(&inner_expr);
                    declarations.push(format!("{} = await $.async_derived({})", d_name, thunk_arg));
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

        let mut array_counter: usize = 0;
        if process_derived_destructuring_pattern(
            &pattern_text,
            &base_expr,
            &mut declarations,
            &mut array_counter,
        )
        .is_none()
        {
            return false;
        }
        if declarations.is_empty() {
            return false;
        }

        // Replacement covers [pattern_start, init_end] so the keyword and
        // optional trailing pieces of the VariableDeclaration remain.
        let replacement = declarations.join(",\n\t");
        let start = pattern_span.start;
        let end = call.span.end;
        self.add_replacement(start, end, replacement);
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
        let transformed_arg = self.apply_and_drain_inner_replacements(arg_span.start, arg_span.end);

        let replacement = format!("$.derived({})", transformed_arg);
        let replacement = self.maybe_tag_declarator(var_name, replacement);
        self.add_replacement(call.span.start, call.span.end, replacement);
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
        if starts_as_function {
            let replacement = format!("$.derived(() => {})", walked_for_emit);
            let replacement = self.maybe_tag_declarator(var_name, replacement);
            self.add_replacement(call.span.start, call.span.end, replacement);
            return true;
        }

        // Case 2: top-level `await` somewhere in the expression → async derived.
        // The text-path `wrap_state_derived_with_tag` did not tag
        // `$.async_derived(...)` declarations (its byte-pattern list only
        // covers `$.state(`, `$.derived(`, `$.proxy(`), so we don't tag
        // here either — `maybe_tag_declarator` rejects the
        // `await $.async_derived(...)` prefix.
        if contains_direct_await_in_expression(arg_for_check) {
            let inner_expr = strip_top_level_await_from_expr(walked_for_emit);
            let inner_trimmed = inner_expr.trim();
            let inner_has_nested_await = contains_direct_await_in_expression(inner_trimmed);
            let replacement = if inner_has_nested_await {
                let is_obj = walked_for_emit.starts_with('{');
                if is_obj {
                    format!("await $.async_derived(async () => ({}))", walked_for_emit)
                } else {
                    format!("await $.async_derived(async () => {})", walked_for_emit)
                }
            } else {
                let inner_is_object = inner_trimmed.starts_with('{');
                if inner_is_object {
                    format!("await $.async_derived(() => ({}))", inner_expr)
                } else {
                    let thunk_arg = unthunk_string(&inner_expr);
                    format!("await $.async_derived({})", thunk_arg)
                }
            };
            self.add_replacement(call.span.start, call.span.end, replacement);
            return true;
        }

        // Case 3: object literal — paren-wrap so the body isn't parsed as a block.
        if matches!(arg_expr_opt, Some(Expression::ObjectExpression(_))) {
            let replacement = format!("$.derived(() => ({}))", walked_for_emit);
            let replacement = self.maybe_tag_declarator(var_name, replacement);
            self.add_replacement(call.span.start, call.span.end, replacement);
            return true;
        }

        // Case 4: bare store-sub / prop-source identifier — already callable.
        if let Some(Expression::Identifier(ident)) = arg_expr_opt {
            let name = ident.name.as_str();
            if self.store_sub_vars.contains(name) || self.prop_source_vars.contains(name) {
                let replacement = format!("$.derived({})", walked_for_emit);
                let replacement = self.maybe_tag_declarator(var_name, replacement);
                self.add_replacement(call.span.start, call.span.end, replacement);
                return true;
            }
        }

        // Case 5: default — unthunk if the walked arg is a `name()` /
        // `$.foo()` shape, otherwise wrap in a thunk.
        let derived_arg = unthunk_string(walked_for_emit);
        let replacement = format!("$.derived({})", derived_arg);
        let replacement = self.maybe_tag_declarator(var_name, replacement);
        self.add_replacement(call.span.start, call.span.end, replacement);
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
            let default_label_owned = extract_enclosing_function_name(before_block_post)
                .map(str::to_string)
                .or_else(|| {
                    self.analysis_source.and_then(|src| {
                        extract_trace_call_label(before_block_post, src).map(str::to_string)
                    })
                })
                .unwrap_or_else(|| "trace".to_string());
            let default_label = default_label_owned.as_str();
            let source_pos = self
                .analysis_source
                .and_then(|src| find_trace_source_location(before_block_post, src, default_label));
            match (source_pos, self.filename) {
                (Some((line, col)), Some(filename)) => {
                    format!("() => '{} ({}:{}:{})'", default_label, filename, line, col)
                }
                _ => format!("() => '{}'", default_label),
            }
        };

        let replacement = format!(
            "{{return $.trace({}, () => {{\n{}\n}});\n}}",
            trace_thunk, remaining_trimmed
        );
        self.add_replacement(body.span.start, body.span.end, replacement);
        true
    }

    /// Dev-mode rewrite of `a === b` / `a !== b` BinaryExpressions to
    /// `$.strict_equals(a, b)` / `!$.strict_equals(a, b)`. Mirrors the
    /// official Svelte compiler's `BinaryExpression` visitor — runtime
    /// hook that surfaces signal-vs-proxy comparison footguns to the user.
    /// Replaces the text-based pass formerly in
    /// `rune_transforms::transform_strict_equals` for component instance
    /// scripts. Returns `true` when the expression was rewritten.
    fn try_rewrite_strict_equals_binary(&mut self, expr: &BinaryExpression<'_>) -> bool {
        if !self.dev {
            return false;
        }
        let is_neq = match expr.operator {
            BinaryOperator::StrictEquality => false,
            BinaryOperator::StrictInequality => true,
            _ => return false,
        };

        // Walk both operands so inner state-var refs (and nested
        // `===` / `!==` rewrites) register their replacements, then
        // drain those into the operand-local text. Each drain yields
        // the fully-transformed operand substring that the outer
        // replacement carries verbatim.
        self.visit_expression(&expr.left);
        self.visit_expression(&expr.right);

        let left_span = expr.left.span();
        let right_span = expr.right.span();
        let left_text = self.apply_and_drain_inner_replacements(left_span.start, left_span.end);
        let right_text = self.apply_and_drain_inner_replacements(right_span.start, right_span.end);

        let replacement = if is_neq {
            format!(
                "!$.strict_equals({}, {})",
                left_text.trim(),
                right_text.trim()
            )
        } else {
            format!(
                "$.strict_equals({}, {})",
                left_text.trim(),
                right_text.trim()
            )
        };

        self.add_replacement(expr.span.start, expr.span.end, replacement);
        true
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

    fn visit_variable_declarator(&mut self, declarator: &VariableDeclarator<'ast>) {
        // Try the rune-declarator rewrites first. When one matches, the
        // helper walks into the argument (so inner state-var refs still
        // get `$.get()` wrapping) and consumes those inner replacements
        // before emitting the outer span replacement. We then skip the
        // default walk so `visit_expression(init)` doesn't add the inner
        // replacements a second time.
        //
        // Destructured `$state(...)` / `$state.raw(...)` / `$derived(...)`
        // are checked first — the other rune-declarator handlers bail for
        // non-Identifier binding patterns, so the destructure matchers
        // catch them.
        if self.try_rewrite_state_destructuring_declarator(declarator) {
            return;
        }
        if self.try_rewrite_derived_destructuring_declarator(declarator) {
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
        walk::walk_variable_declarator(self, declarator);
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

    fn visit_binary_expression(&mut self, expr: &BinaryExpression<'ast>) {
        // Dev-mode `===` / `!==` rewrite. When matched the helper walks
        // and drains inner replacements itself, so we skip the default
        // walk to avoid double-visiting the operands.
        if !self.try_rewrite_strict_equals_binary(expr) {
            walk::walk_binary_expression(self, expr);
        }
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

        // $effect rune family. The runes are valid only when `$effect` is the
        // global rune binding (not shadowed by a local declaration, function
        // parameter, or store subscription).
        //
        //   $effect(fn)            -> $.user_effect(fn)
        //   $effect.pre(fn)        -> $.user_pre_effect(fn)
        //   $effect.root(fn)       -> $.effect_root(fn)
        //   $effect.tracking()     -> $.effect_tracking()
        //   $effect.pending()      -> $.eager($.pending)        (whole-call rewrite)
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
                                // Whole-call rewrite: `$effect.pending()` becomes
                                // `$.eager($.pending)`. The empty-arg call is
                                // restructured into a different call shape, so we
                                // replace the entire CallExpression span.
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
                format!("$.eager(() => {})", transformed_arg),
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
                self.add_replacement(
                    expr.span.start,
                    expr.span.end,
                    format!(
                        "$.inspect(() => [{}], (...$$args) => ({})(...$$args))",
                        args_text, cb_text
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
                self.add_replacement(
                    expr.span.start,
                    expr.span.end,
                    format!(
                        "$.inspect(() => [{}], (...$$args) => console.log(...$$args), true)",
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
            let in_getter_context = trimmed_before.ends_with("$.untrack(")
                || trimmed_before.ends_with("$.derived(")
                || trimmed_before.ends_with("$derived(")
                || trimmed_before.ends_with("untrack(");
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
        body.push_str(&format!(
            "\t\t\tvar {} = $.to_array($$value, {});\n",
            array_name, length
        ));

        for (i, target) in targets.iter().enumerate() {
            match target {
                ArrayTarget::Null => {}
                ArrayTarget::Prop(name) => {
                    body.push_str(&format!("\t\t\t{}({}[{}]);\n", name, array_name, i));
                }
                ArrayTarget::MemberOnProp { prop_name, .. } => {
                    let member_text = transformed_member_texts[i].as_ref().unwrap();
                    body.push_str(&format!(
                        "\t\t\t{}({} = {}[{}], true);\n",
                        prop_name, member_text, array_name, i
                    ));
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
                Some(assignments.into_iter().next().unwrap())
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
    // Dev-mode `===` / `!==` → `$.strict_equals(...)` rewrite (formerly
    // `rune_transforms::transform_strict_equals`). The visitor walks
    // every BinaryExpression so we only need a byte probe to know
    // whether to enter the AST pass at all.
    let has_strict_equals = config.dev
        && (memchr::memmem::find(script.as_bytes(), b"===").is_some()
            || memchr::memmem::find(script.as_bytes(), b"!==").is_some());

    if !has_state
        && !has_props
        && !has_stores
        && !has_read_only
        && !has_rest
        && !has_effect_calls
        && !has_state_calls
        && !has_derived_calls
        && !has_props_calls
        && !has_strict_equals
    {
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
                .any(|v| script_ids.contains(v.as_str())))
        || (has_effect_calls && script_ids.contains("$effect"))
        || (has_state_calls && script_ids.contains("$state"))
        || (has_derived_calls && script_ids.contains("$derived"))
        || (has_props_calls && script_ids.contains("$props"))
        || has_strict_equals;

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
            config.dev,
            config.analysis_source,
            config.filename,
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
            dev: false,
            analysis_source: None,
            filename: None,
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
            dev: false,
            analysis_source: None,
            filename: None,
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
            dev: false,
            analysis_source: None,
            filename: None,
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
