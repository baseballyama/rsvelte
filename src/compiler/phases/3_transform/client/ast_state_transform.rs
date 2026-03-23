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
use super::expression_utils::expression_needs_proxy_with_scope;

thread_local! {
    static AST_TRANSFORM_ALLOCATOR: RefCell<Allocator> = RefCell::new(Allocator::default());
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
}

impl<'a, 's> StateVarCollector<'a, 's> {
    fn new(
        source: &'s str,
        state_vars: &'a FxHashSet<&'a str>,
        non_reactive_vars: &'a FxHashSet<&'a str>,
        raw_state_vars: &'a FxHashSet<&'a str>,
        non_proxy_vars: &'a [String],
        is_runes: bool,
    ) -> Self {
        let var_state_vars = VAR_STATE_VARS.with(|v| v.borrow().clone());
        Self {
            source,
            state_vars,
            non_reactive_vars,
            raw_state_vars,
            non_proxy_vars,
            is_runes,
            var_state_vars,
            replacements: Vec::new(),
            scoped_vars: vec![FxHashSet::default()],
            in_shorthand_property: false,
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

    /// Check if a call expression is an already-transformed `$.*()` helper call
    /// whose first argument is a state variable name (and should not be re-wrapped).
    /// Only matches calls where the first arg is a bare state variable identifier:
    /// $.get(x), $.safe_get(x), $.set(x, ...), $.update(x, ...), $.update_pre(x, ...)
    /// Does NOT match $.state(), $.derived(), etc. where args are expressions/callbacks.
    fn is_dollar_helper_call(&self, expr: &CallExpression<'_>) -> bool {
        if expr.arguments.is_empty() {
            return false;
        }
        // Check that the first argument is a simple identifier that's a state variable
        let first_arg_is_state_var = matches!(
            &expr.arguments[0],
            Argument::Identifier(ident) if self.state_vars.contains(ident.name.as_str())
        );
        if !first_arg_is_state_var {
            return false;
        }
        if let Expression::StaticMemberExpression(member) = &expr.callee
            && let Expression::Identifier(obj) = &member.object
            && obj.name == "$"
        {
            let method = member.property.name.as_str();
            return matches!(method, "get" | "safe_get" | "set" | "update" | "update_pre");
        }
        false
    }

    /// Check if a variable declarator is a state variable declaration.
    /// A state variable declaration has an initializer that is a call to
    /// `$.state()`, `$.derived()`, `$.derived_by()`, `$.state.raw()`,
    /// or `await $.async_derived()`.
    /// These are the already-transformed rune calls (e.g., `$state()` -> `$.state()`).
    fn is_state_var_declaration(&self, declarator: &VariableDeclarator<'_>) -> bool {
        if let Some(ref init) = declarator.init {
            let init_start = init.span().start as usize;
            let init_end = init.span().end as usize;
            if init_end <= self.source.len() {
                let init_text = &self.source[init_start..init_end];
                return init_text.starts_with("$.state(")
                    || init_text.starts_with("$.state.raw(")
                    || init_text.starts_with("$.derived(")
                    || init_text.starts_with("$.derived_by(")
                    || init_text.starts_with("await $.async_derived(");
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
        sorted_inner.sort_by(|a, b| b.start.cmp(&a.start));

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

    /// Inner implementation for collecting binding names.
    /// When `skip_state_vars` is true, names that are in `self.state_vars` are not registered.
    fn collect_binding_names_inner(&mut self, pattern: &BindingPattern<'_>, skip_state_vars: bool) {
        match pattern {
            BindingPattern::BindingIdentifier(id) => {
                if skip_state_vars && self.state_vars.contains(id.name.as_str()) {
                    // Don't register - this is a state variable declaration at program scope
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
        for declarator in &decl.declarations {
            let is_state_decl = self.is_state_var_declaration(declarator);
            if is_state_decl {
                self.collect_binding_names_skip_state(&declarator.id);
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

        // Normal call expression - walk as usual
        walk::walk_call_expression(self, expr);
    }

    // -----------------------------------------------------------------------
    // Transform identifier references: foo -> $.get(foo)
    // -----------------------------------------------------------------------

    fn visit_identifier_reference(&mut self, ident: &IdentifierReference<'ast>) {
        let name = ident.name.as_str();

        if self.is_active_state_var(name) {
            let start = ident.span.start;
            let end = ident.span.end;
            let getter = self.getter_for(name);

            if self.in_shorthand_property {
                // Shorthand property: { foo } -> { foo: $.get(foo) }
                self.add_replacement(start, end, format!("{}: {}({})", name, getter, name));
            } else {
                // Normal reference: foo -> $.get(foo)
                self.add_replacement(start, end, format!("{}({})", getter, name));
            }
        }

        // No need to call walk - IdentifierReference is a leaf node
    }

    // -----------------------------------------------------------------------
    // Transform assignments: foo = expr -> $.set(foo, expr)
    // -----------------------------------------------------------------------

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        // Check if the left side is a simple identifier targeting a state variable
        if let AssignmentTarget::AssignmentTargetIdentifier(ident) = &expr.left {
            let name = ident.name.as_str();
            if self.is_any_state_var(name) {
                let full_start = expr.span.start;
                let full_end = expr.span.end;
                let rhs_start = expr.right.span().start;
                let rhs_end = expr.right.span().end;

                // Check proxy needs on the ORIGINAL source text before any $.get() transforms,
                // since expression_needs_proxy_with_scope doesn't understand $.get() wrappers.
                let original_rhs_text = &self.source[rhs_start as usize..rhs_end as usize];

                // Walk the RIGHT side only to transform any state var reads in it.
                // We do NOT walk the left side (the assignment target identifier).
                self.visit_expression(&expr.right);

                // Apply any inner replacements (e.g., $.get() for state vars in the RHS)
                // and get the transformed RHS text. This prevents overlapping replacements.
                let rhs_text = self.apply_and_drain_inner_replacements(rhs_start, rhs_end);

                match expr.operator {
                    AssignmentOperator::Assign => {
                        // Simple assignment: foo = expr -> $.set(foo, expr)
                        let is_raw = self.raw_state_vars.contains(name);
                        let needs_proxy = self.is_runes
                            && !is_raw
                            && expression_needs_proxy_with_scope(
                                original_rhs_text.trim(),
                                self.non_proxy_vars,
                            );

                        let replacement = if needs_proxy {
                            format!("$.set({}, {}, true)", name, rhs_text)
                        } else {
                            format!("$.set({}, {})", name, rhs_text)
                        };
                        self.add_replacement(full_start, full_end, replacement);
                    }
                    op if op != AssignmentOperator::Assign => {
                        // Compound assignment: foo += expr -> $.set(foo, $.get(foo) + (expr))
                        let getter = self.getter_for(name);
                        let op_str = compound_op_to_binary(op);
                        let rhs_trimmed = rhs_text.trim();

                        // Determine if parens are needed around the rhs
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

                // Don't call walk - we already visited the right side
                return;
            }
        }

        // Not a state variable assignment - walk normally
        walk::walk_assignment_expression(self, expr);
    }

    // -----------------------------------------------------------------------
    // Transform update expressions: ++foo -> $.update_pre(foo), foo++ -> $.update(foo)
    // -----------------------------------------------------------------------

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(ident) = &expr.argument {
            let name = ident.name.as_str();
            if self.is_any_state_var(name) {
                let full_start = expr.span.start;
                let full_end = expr.span.end;

                match (expr.prefix, expr.operator) {
                    // ++foo -> $.update_pre(foo)
                    (true, UpdateOperator::Increment) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_pre({})", name),
                        );
                    }
                    // --foo -> $.update_pre(foo, -1)
                    (true, UpdateOperator::Decrement) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update_pre({}, -1)", name),
                        );
                    }
                    // foo++ -> $.update(foo)
                    (false, UpdateOperator::Increment) => {
                        self.add_replacement(full_start, full_end, format!("$.update({})", name));
                    }
                    // foo-- -> $.update(foo, -1)
                    (false, UpdateOperator::Decrement) => {
                        self.add_replacement(
                            full_start,
                            full_end,
                            format!("$.update({}, -1)", name),
                        );
                    }
                }

                // Don't walk - we handled it
                return;
            }
        }

        // Not a state variable update - walk normally
        walk::walk_update_expression(self, expr);
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
#[allow(dead_code)]
pub(super) fn transform_state_vars_ast(
    script: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
    raw_state_vars: &[String],
    non_proxy_vars: &[String],
    is_runes: bool,
) -> Option<String> {
    if state_vars.is_empty() {
        return None;
    }

    // Quick check: if none of the state var names appear in the text at all, skip
    if !state_vars.iter().any(|v| script.contains(v.as_str())) {
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
            non_proxy_vars,
            is_runes,
        );
        collector.visit_program(&parsed.program);

        if collector.replacements.is_empty() {
            return None;
        }

        // Sort replacements by start position descending (right-to-left)
        // so that applying them doesn't invalidate earlier positions
        collector.replacements.sort_by(|a, b| b.start.cmp(&a.start));

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
        transform_state_vars_ast(script, &sv, &[], &[], &[], true)
            .unwrap_or_else(|| script.to_string())
    }

    /// Helper to run transform with non-reactive vars
    fn transform_with_non_reactive(
        script: &str,
        state_vars: &[&str],
        non_reactive: &[&str],
    ) -> String {
        let sv: Vec<String> = state_vars.iter().map(|s| s.to_string()).collect();
        let nrv: Vec<String> = non_reactive.iter().map(|s| s.to_string()).collect();
        transform_state_vars_ast(script, &sv, &nrv, &[], &[], true)
            .unwrap_or_else(|| script.to_string())
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

    #[test]
    fn test_empty_state_vars() {
        let result = transform_state_vars_ast("count + 1", &[], &[], &[], &[], true);
        assert_eq!(result, None);
    }

    #[test]
    fn test_no_matching_vars() {
        let sv = vec!["count".to_string()];
        let result = transform_state_vars_ast("x + 1", &sv, &[], &[], &[], true);
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
