//! Utility functions for component transformation.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.

use std::collections::{HashMap, HashSet};

use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

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
    vars: HashMap<String, Option<JsExprKind>>,
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

impl LocalScope {
    fn new() -> Self {
        Self {
            vars: HashMap::new(),
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
fn extract_pattern_names(pattern: &JsPattern, names: &mut HashSet<String>) {
    match pattern {
        JsPattern::Identifier(name) => {
            names.insert(name.clone());
        }
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

/// Extract all identifier names from a pattern and add them to a LocalScope as shadowed.
fn extract_pattern_names_to_scope(pattern: &JsPattern, scope: &mut LocalScope) {
    let mut names = HashSet::new();
    extract_pattern_names(pattern, &mut names);
    for name in names {
        scope.add_shadowed(name);
    }
}

/// Scan a block body for variable declarations and register them in the local scope.
/// This tracks local `const`/`let`/`var` declarations so that should_proxy() can
/// check their init expression types when they're referenced in assignments.
fn register_block_local_vars(block: &[JsStatement], scope: &mut LocalScope) {
    for stmt in block {
        if let JsStatement::VariableDeclaration(var_decl) = stmt {
            for decl in &var_decl.declarations {
                if let JsPattern::Identifier(name) = &decl.id {
                    let init_kind = decl.init.as_ref().map(|init_expr| classify_expr(init_expr));
                    scope.add_local_var(name.clone(), init_kind);
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

            // Then check the analysis scope (component-level bindings)
            if let Some(binding) = context.state.get_binding(name) {
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
                        _ => {
                            // Recursively check if initial value type should be proxied
                            return should_proxy_node_type(initial_type);
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
/// the official compiler, where `null` scope prevents further identifier lookups.
fn should_proxy_node_type(node_type: &str) -> bool {
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
    // Use internal function with empty local scope
    apply_transforms_to_expression_with_shadowed(expr, context, &LocalScope::new())
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

    match expr {
        JsExpr::Identifier(name) => {
            // Skip transforms for shadowed variables (function parameters, local vars)
            if local_scope.contains(name) {
                return expr.clone();
            }
            // Track each block index usage for proper callback parameter generation.
            // When the index variable is referenced during body traversal, we need
            // to include it in the render callback parameters.
            if let Some(ref idx_name) = context.state.each_index_name
                && name == idx_name
            {
                context.state.each_index_used.set(true);
            }
            // Check if there's a transform registered for this identifier
            if let Some(transform) = context.state.transform.get(name)
                && let Some(read_fn) = transform.read
            {
                return read_fn(JsExpr::Identifier(name.clone()));
            }
            expr.clone()
        }

        JsExpr::Member(member) => {
            // Apply transform to the object, but not the property (unless computed)
            let transformed_object = recurse!(&member.object);

            let transformed_property = match &member.property {
                JsMemberProperty::Expression(prop_expr) if member.computed => {
                    // For computed properties, also apply transforms
                    JsMemberProperty::Expression(Box::new(recurse!(prop_expr)))
                }
                _ => member.property.clone(),
            };

            JsExpr::Member(JsMemberExpression {
                object: Box::new(transformed_object),
                property: transformed_property,
                computed: member.computed,
                optional: member.optional,
            })
        }

        JsExpr::Call(call) => {
            // Check if this is a $.set() or $.update() call - these have a state reference
            // as the first argument that should NOT be transformed with $.get()
            let is_svelte_set_call = is_svelte_runtime_set_call(&call.callee);

            // Check if this is a function that should skip all argument transformations
            // (e.g., $.untrack, $.store_mutate - these have pre-constructed arguments)
            let skip_args_transform = is_svelte_runtime_skip_args_transform(&call.callee);

            // Check if this is a prop/store call where the callee should NOT be transformed:
            // 1. Prop setter call: `propName(value)` - callee should stay as `propName`, not `propName()`
            // 2. Prop getter call: `propName()` - callee should stay as `propName`, not `propName()()`
            // 3. Store subscription: `$store()` - callee should stay as `$store`, not `$store()()`
            //
            // IMPORTANT: This does NOT apply to state variables ($state, $derived, etc.)!
            // For state variables, `read` wraps `x` -> `$.get(x)`, which is different from props/stores
            // that wrap `x` -> `x()`. State variable calls like `saySomething('Tama')` SHOULD become
            // `$.get(saySomething)('Tama')`, not `saySomething('Tama')`.
            let skip_callee_transform = if let JsExpr::Identifier(name) = call.callee.as_ref()
                && !local_scope.contains(name)
                && let Some(transform) = context.state.transform.get(name)
            {
                // Check if this is a prop or store subscription binding
                // Only those use the "call as getter" pattern (x -> x())
                let binding = context.state.get_binding(name);
                let is_prop_or_store = binding
                    .map(|b| {
                        matches!(
                            b.kind,
                            BindingKind::Prop | BindingKind::BindableProp | BindingKind::StoreSub
                        )
                    })
                    .unwrap_or(false);

                // Skip callee transform only for props/stores, not for state
                is_prop_or_store
                    && (transform.read.is_some()
                        || (transform.assign.is_some() && !call.arguments.is_empty()))
            } else {
                false
            };

            // Apply transforms to callee and arguments
            // Skip callee transform for prop getter/setter calls to avoid double transformation
            let transformed_callee = if skip_callee_transform {
                call.callee.as_ref().clone()
            } else {
                recurse!(&call.callee)
            };

            let transformed_args: Vec<JsExpr> = call
                .arguments
                .iter()
                .enumerate()
                .map(|(i, arg)| {
                    // Skip transforming arguments that shouldn't have transforms applied:
                    // 1. ALL arguments of $.untrack(), $.store_mutate(), etc.
                    // 2. First argument of $.set(), $.update(), $.update_pre() (state reference)
                    if skip_args_transform || (is_svelte_set_call && i == 0) {
                        arg.clone()
                    } else {
                        recurse!(arg)
                    }
                })
                .collect();

            JsExpr::Call(JsCallExpression {
                callee: Box::new(transformed_callee),
                arguments: transformed_args,
                optional: call.optional,
            })
        }

        JsExpr::Binary(binary) => {
            let transformed_left = recurse!(&binary.left);
            let transformed_right = recurse!(&binary.right);

            JsExpr::Binary(JsBinaryExpression {
                operator: binary.operator,
                left: Box::new(transformed_left),
                right: Box::new(transformed_right),
            })
        }

        JsExpr::Logical(logical) => {
            let transformed_left = recurse!(&logical.left);
            let transformed_right = recurse!(&logical.right);

            JsExpr::Logical(JsLogicalExpression {
                operator: logical.operator,
                left: Box::new(transformed_left),
                right: Box::new(transformed_right),
            })
        }

        JsExpr::Unary(unary) => {
            let transformed_arg = recurse!(&unary.argument);

            JsExpr::Unary(JsUnaryExpression {
                operator: unary.operator,
                argument: Box::new(transformed_arg),
                prefix: unary.prefix,
            })
        }

        JsExpr::Conditional(cond) => {
            let transformed_test = recurse!(&cond.test);
            let transformed_consequent = recurse!(&cond.consequent);
            let transformed_alternate = recurse!(&cond.alternate);

            JsExpr::Conditional(JsConditionalExpression {
                test: Box::new(transformed_test),
                consequent: Box::new(transformed_consequent),
                alternate: Box::new(transformed_alternate),
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
                        let transformed_value = recurse!(&p.value);

                        let transformed_key = match &p.key {
                            JsPropertyKey::Computed(key_expr) => {
                                JsPropertyKey::Computed(Box::new(recurse!(key_expr)))
                            }
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
                            value: Box::new(transformed_value),
                            kind: p.kind,
                            computed: p.computed,
                            shorthand: is_shorthand,
                        })
                    }
                    JsObjectMember::SpreadElement(spread_expr) => {
                        JsObjectMember::SpreadElement(Box::new(recurse!(spread_expr)))
                    }
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
                JsArrowBody::Expression(expr_box) => JsArrowBody::Expression(Box::new(
                    apply_transforms_to_expression_with_shadowed(expr_box, context, &new_scope),
                )),
                JsArrowBody::Block(block) => {
                    // Scan the block for local variable declarations before transforming
                    // so that should_proxy() can look up their init expression types
                    register_block_local_vars(&block.body, &mut new_scope);

                    // Transform statements in the block
                    let transformed_body: Vec<JsStatement> = block
                        .body
                        .iter()
                        .map(|stmt| {
                            apply_transforms_to_statement_with_shadowed(stmt, context, &new_scope)
                        })
                        .collect();
                    JsArrowBody::Block(JsBlockStatement {
                        body: transformed_body,
                    })
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
            for param in &func.params {
                extract_pattern_names_to_scope(param, &mut new_scope);
            }

            // Scan the function body for local variable declarations
            register_block_local_vars(&func.body.body, &mut new_scope);

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
                body: JsBlockStatement {
                    body: transformed_body,
                },
                is_async: func.is_async,
                is_generator: func.is_generator,
            })
        }

        JsExpr::Assignment(assign) => {
            // For assignments, check if the left side is a state variable that needs transform
            // Skip if the identifier is in local scope (function parameter or local declaration)
            if let JsExpr::Identifier(name) = assign.left.as_ref()
                && !local_scope.contains(name)
                && let Some(transform) = context.state.transform.get(name)
                && let Some(assign_fn) = transform.assign
            {
                // Transform the right side first
                let transformed_right = recurse!(&assign.right);

                // Handle compound assignment operators (+=, -=, etc.)
                let final_value = match assign.operator {
                    JsAssignmentOp::Assign => transformed_right,
                    JsAssignmentOp::AddAssign => {
                        // count += 1 -> $.set(count, $.get(count) + 1)
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::Add, current, transformed_right)
                    }
                    JsAssignmentOp::SubAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::Sub, current, transformed_right)
                    }
                    JsAssignmentOp::MulAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::Mul, current, transformed_right)
                    }
                    JsAssignmentOp::DivAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::Div, current, transformed_right)
                    }
                    JsAssignmentOp::ModAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::Mod, current, transformed_right)
                    }
                    _ => {
                        // For other operators, just use the right side
                        transformed_right
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
                    && should_proxy_with_context(&assign.right, context, local_scope);

                return assign_fn(JsExpr::Identifier(name.clone()), final_value, needs_proxy);
            }

            // Track each item assignment for uses_index detection.
            // In the official Svelte compiler, the assign transform callback on the each item
            // sets `uses_index = true`. Since Rust uses fn pointers (not closures), we track
            // this via a shared flag on the state.
            if let JsExpr::Identifier(name) = assign.left.as_ref()
                && !local_scope.contains(name)
                && context.state.each_item_names.contains(name)
            {
                context.state.each_item_assign_or_mutate.set(true);
            }

            // Check for mutation case: when assigning to a member expression where
            // the base object has a mutate transform (e.g., $store.prop = value)
            // This corresponds to the mutation case in AssignmentExpression.js
            if let JsExpr::Member(_) = assign.left.as_ref() {
                // Find the base object of the member expression
                let base_object = get_base_object(assign.left.as_ref());

                // Track each item mutation for uses_index detection.
                if let JsExpr::Identifier(name) = &base_object
                    && !local_scope.contains(name)
                    && context.state.each_item_names.contains(name)
                {
                    context.state.each_item_assign_or_mutate.set(true);
                }

                if let JsExpr::Identifier(name) = base_object
                    && !local_scope.contains(&name)
                    && let Some(transform) = context.state.transform.get(&name)
                    && let Some(mutate_fn) = transform.mutate
                {
                    // DO NOT apply read transforms to the left side here!
                    // The mutate function (e.g., store_sub_mutate) is responsible for
                    // replacing the base identifier with $.untrack($store) as needed.
                    // We only transform the right side of the assignment.
                    let transformed_right = recurse!(&assign.right);

                    // Create the assignment expression with the original left side
                    // and the transformed right side. The mutate function will handle
                    // replacing the store reference with $.untrack($store).
                    let full_assignment = JsExpr::Assignment(JsAssignmentExpression {
                        operator: assign.operator,
                        left: assign.left.clone(),
                        right: Box::new(transformed_right),
                    });

                    // Apply the mutate transform
                    // e.g., $store.prop = value -> $.store_mutate(store, $.untrack($store).prop = value, $.untrack($store))
                    return mutate_fn(JsExpr::Identifier(name.clone()), full_assignment);
                }
            }

            // For non-state variables, transform the right side
            let transformed_right = recurse!(&assign.right);

            // For the left side, only transform if it's a member expression object
            let transformed_left = match assign.left.as_ref() {
                JsExpr::Member(member) => {
                    let transformed_object = recurse!(&member.object);

                    let transformed_property = match &member.property {
                        JsMemberProperty::Expression(prop_expr) if member.computed => {
                            JsMemberProperty::Expression(Box::new(recurse!(prop_expr)))
                        }
                        _ => member.property.clone(),
                    };

                    JsExpr::Member(JsMemberExpression {
                        object: Box::new(transformed_object),
                        property: transformed_property,
                        computed: member.computed,
                        optional: member.optional,
                    })
                }
                // Don't transform identifier on the left side of assignment
                _ => assign.left.as_ref().clone(),
            };

            JsExpr::Assignment(JsAssignmentExpression {
                operator: assign.operator,
                left: Box::new(transformed_left),
                right: Box::new(transformed_right),
            })
        }

        JsExpr::Sequence(seq) => {
            let transformed_exprs: Vec<JsExpr> =
                seq.expressions.iter().map(|e| recurse!(e)).collect();

            JsExpr::Sequence(JsSequenceExpression {
                expressions: transformed_exprs,
            })
        }

        JsExpr::New(new_expr) => {
            let transformed_callee = recurse!(&new_expr.callee);
            let transformed_args: Vec<JsExpr> =
                new_expr.arguments.iter().map(|arg| recurse!(arg)).collect();

            JsExpr::New(JsNewExpression {
                callee: Box::new(transformed_callee),
                arguments: transformed_args,
            })
        }

        JsExpr::Await(inner) => {
            let transformed = recurse!(inner);
            JsExpr::Await(Box::new(transformed))
        }

        JsExpr::Yield(yield_expr) => {
            let transformed_arg = yield_expr
                .argument
                .as_ref()
                .map(|arg| Box::new(recurse!(arg)));

            JsExpr::Yield(JsYieldExpression {
                argument: transformed_arg,
                delegate: yield_expr.delegate,
            })
        }

        JsExpr::Spread(inner) => {
            let transformed = recurse!(inner);
            JsExpr::Spread(Box::new(transformed))
        }

        JsExpr::Update(update) => {
            // For update expressions, check if the argument has an update transform
            // Skip if the identifier is in local scope
            if let JsExpr::Identifier(name) = update.argument.as_ref()
                && !local_scope.contains(name)
                && let Some(transform) = context.state.transform.get(name)
                && let Some(update_fn) = transform.update
            {
                return update_fn(
                    update.operator,
                    JsExpr::Identifier(name.clone()),
                    update.prefix,
                );
            }

            // Track each item update (++ or --) for uses_index detection.
            if let JsExpr::Identifier(name) = update.argument.as_ref()
                && !local_scope.contains(name)
                && context.state.each_item_names.contains(name)
            {
                context.state.each_item_assign_or_mutate.set(true);
            }

            // Check for mutation case: when updating a member expression where
            // the base object has a mutate transform registered.
            // This handles:
            // - Store subscriptions: $store[0].value++ -> $.store_mutate(...)
            // - Legacy state: name.value++ -> $.mutate(name, $.get(name).value++)
            // - Runes state: name.value++ -> $.get(name).value++
            if let JsExpr::Member(_) = update.argument.as_ref() {
                let base_object = get_base_object(update.argument.as_ref());

                // Track each item member update for uses_index detection.
                if let JsExpr::Identifier(name) = &base_object
                    && !local_scope.contains(name)
                    && context.state.each_item_names.contains(name)
                {
                    context.state.each_item_assign_or_mutate.set(true);
                }

                if let JsExpr::Identifier(name) = base_object
                    && !local_scope.contains(&name)
                    && let Some(transform) = context.state.transform.get(&name)
                    && let Some(mutate_fn) = transform.mutate
                {
                    // Keep the original update expression, the mutate function
                    // will handle replacing the base identifier as needed:
                    // - store_sub_mutate: replaces with $.untrack($store)
                    // - mutate_value_legacy: wraps in $.mutate(name, ...)
                    // - mutate_value_runes: replaces name with $.get(name)
                    let full_update = JsExpr::Update(JsUpdateExpression {
                        operator: update.operator,
                        argument: update.argument.clone(),
                        prefix: update.prefix,
                    });

                    return mutate_fn(JsExpr::Identifier(name.clone()), full_update);
                }
            }

            // Otherwise just transform the argument
            let transformed_arg = recurse!(&update.argument);

            JsExpr::Update(JsUpdateExpression {
                operator: update.operator,
                argument: Box::new(transformed_arg),
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
            let transformed_tag = recurse!(&tagged.tag);
            let transformed_exprs: Vec<JsExpr> = tagged
                .quasi
                .expressions
                .iter()
                .map(|e| recurse!(e))
                .collect();

            JsExpr::TaggedTemplate(JsTaggedTemplate {
                tag: Box::new(transformed_tag),
                quasi: JsTemplateLiteral {
                    quasis: tagged.quasi.quasis.clone(),
                    expressions: transformed_exprs,
                },
            })
        }

        // Expressions that don't need transformation
        JsExpr::Literal(_)
        | JsExpr::This
        | JsExpr::Raw(_)
        | JsExpr::Class(_)
        | JsExpr::Chain(_)
        | JsExpr::Void(_) => expr.clone(),
    }
}

/// Check if a callee expression represents a Svelte runtime function that takes
/// a state reference as its first argument (e.g., $.set, $.update, $.update_pre, $.get).
///
/// These functions should NOT have their first argument transformed with $.get()
/// because they expect the raw state reference, not the value.
fn is_svelte_runtime_set_call(callee: &JsExpr) -> bool {
    // Check for $.set, $.update, $.update_pre, $.get, $.safe_get, $.mutate patterns
    // These all take a state reference as the first argument that should NOT be
    // wrapped with $.get()
    if let JsExpr::Member(member) = callee
        && let JsExpr::Identifier(obj_name) = member.object.as_ref()
        && obj_name == "$"
        && let JsMemberProperty::Identifier(prop_name) = &member.property
    {
        return matches!(
            prop_name.as_str(),
            "set" | "update" | "update_pre" | "get" | "safe_get" | "mutate"
        );
    }
    false
}

/// Check if a callee expression represents a Svelte runtime function that should
/// skip transformation of ALL its arguments (e.g., $.untrack, $.store_mutate).
///
/// - `$.untrack()` takes a getter function that should not be invoked
/// - `$.store_mutate()` has pre-constructed arguments with $.untrack() calls
/// - `$.update_store()` and `$.update_pre_store()` have a $store() call as second argument
///   that should not have additional transforms applied
fn is_svelte_runtime_skip_args_transform(callee: &JsExpr) -> bool {
    if let JsExpr::Member(member) = callee
        && let JsExpr::Identifier(obj_name) = member.object.as_ref()
        && obj_name == "$"
        && let JsMemberProperty::Identifier(prop_name) = &member.property
    {
        return matches!(
            prop_name.as_str(),
            "untrack" | "store_mutate" | "update_store" | "update_pre_store"
        );
    }
    false
}

/// Get the base object of a member expression.
///
/// For example, for `a.b.c.d`, returns `a`.
/// For nested member expressions like `$store().users['gary'].value`,
/// returns `$store`.
fn get_base_object(expr: &JsExpr) -> JsExpr {
    match expr {
        JsExpr::Member(member) => get_base_object(&member.object),
        JsExpr::Call(call) => get_base_object(&call.callee),
        _ => expr.clone(),
    }
}

/// Apply transforms to a statement recursively.
///
/// This handles statements that contain expressions, applying transforms
/// to all expressions within.
#[allow(dead_code)]
fn apply_transforms_to_statement(stmt: &JsStatement, context: &ComponentContext) -> JsStatement {
    apply_transforms_to_statement_with_shadowed(stmt, context, &LocalScope::new())
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
            expression: Box::new(transform_expr(&expr_stmt.expression)),
        }),

        JsStatement::Return(ret_stmt) => JsStatement::Return(JsReturnStatement {
            argument: ret_stmt
                .argument
                .as_ref()
                .map(|arg| Box::new(transform_expr(arg))),
        }),

        JsStatement::VariableDeclaration(var_decl) => {
            let transformed_declarations: Vec<JsVariableDeclarator> = var_decl
                .declarations
                .iter()
                .map(|decl| JsVariableDeclarator {
                    id: decl.id.clone(),
                    init: decl
                        .init
                        .as_ref()
                        .map(|init| Box::new(transform_expr(init))),
                })
                .collect();

            JsStatement::VariableDeclaration(JsVariableDeclaration {
                kind: var_decl.kind,
                declarations: transformed_declarations,
            })
        }

        JsStatement::If(if_stmt) => JsStatement::If(JsIfStatement {
            test: Box::new(transform_expr(&if_stmt.test)),
            consequent: Box::new(transform_stmt(&if_stmt.consequent)),
            alternate: if_stmt
                .alternate
                .as_ref()
                .map(|alt| Box::new(transform_stmt(alt))),
        }),

        JsStatement::Block(block) => {
            let transformed_body: Vec<JsStatement> =
                block.body.iter().map(transform_stmt).collect();
            JsStatement::Block(JsBlockStatement {
                body: transformed_body,
            })
        }

        // Statements that don't need transformation
        JsStatement::Empty
        | JsStatement::Break(_)
        | JsStatement::Continue(_)
        | JsStatement::Debugger
        | JsStatement::Raw(_) => stmt.clone(),

        // For other statement types, just clone for now
        // TODO: Add more comprehensive handling as needed
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

    // Collect state dependencies from the original (pre-transform) expression.
    // For each identifier with a registered transform, we build a getter.
    // For props/templates/imports, we wrap in $.deep_read_state().
    collect_reactive_references(expression, context, &mut sequence_exprs);

    if sequence_exprs.is_empty() {
        // No state dependencies found, return value as-is
        return value;
    }

    // Wrap the value in $.untrack(() => value)
    // b::thunk applies the unthunk optimization: () => func() -> func
    let thunk = b::thunk(value);
    let untracked = b::call(b::member_path("$.untrack"), vec![thunk]);

    // Add the untracked value as the last expression in the sequence
    sequence_exprs.push(untracked);

    // Return a sequence expression: (dep1, dep2, ..., $.untrack(() => value))
    b::sequence(sequence_exprs)
}

/// Collect state getter calls from an expression.
///
/// This walks the expression tree and collects any `$.get(x)` calls,
/// which represent reads of reactive state variables.
#[allow(dead_code)]
fn collect_state_getters(expr: &JsExpr, getters: &mut Vec<JsExpr>) {
    match expr {
        JsExpr::Call(call) => {
            // Check if this is a $.get() call
            if let JsExpr::Member(member) = call.callee.as_ref()
                && let JsExpr::Identifier(obj) = member.object.as_ref()
                && obj == "$"
                && let JsMemberProperty::Identifier(prop) = &member.property
                && prop == "get"
            {
                // Found a $.get() call - add it as a dependency
                getters.push(JsExpr::Call(call.clone()));
                return;
            }
            // Recurse into call arguments
            for arg in &call.arguments {
                collect_state_getters(arg, getters);
            }
            // Recurse into callee
            collect_state_getters(call.callee.as_ref(), getters);
        }
        JsExpr::Member(member) => {
            collect_state_getters(&member.object, getters);
            if let JsMemberProperty::Expression(prop) = &member.property {
                collect_state_getters(prop, getters);
            }
        }
        JsExpr::Binary(binary) => {
            collect_state_getters(&binary.left, getters);
            collect_state_getters(&binary.right, getters);
        }
        JsExpr::Logical(logical) => {
            collect_state_getters(&logical.left, getters);
            collect_state_getters(&logical.right, getters);
        }
        JsExpr::Conditional(cond) => {
            collect_state_getters(&cond.test, getters);
            collect_state_getters(&cond.consequent, getters);
            collect_state_getters(&cond.alternate, getters);
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_state_getters(e, getters);
            }
        }
        JsExpr::Object(obj) => {
            for prop in &obj.properties {
                match prop {
                    JsObjectMember::Property(p) => {
                        collect_state_getters(&p.value, getters);
                    }
                    JsObjectMember::SpreadElement(s) => {
                        collect_state_getters(s, getters);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_state_getters(&assign.left, getters);
            collect_state_getters(&assign.right, getters);
        }
        JsExpr::Unary(unary) => {
            collect_state_getters(&unary.argument, getters);
        }
        JsExpr::Update(update) => {
            collect_state_getters(&update.argument, getters);
        }
        JsExpr::Sequence(seq) => {
            for expr in &seq.expressions {
                collect_state_getters(expr, getters);
            }
        }
        JsExpr::TemplateLiteral(template) => {
            for expr in &template.expressions {
                collect_state_getters(expr, getters);
            }
        }
        JsExpr::Arrow(_) | JsExpr::Function(_) => {
            // Don't collect from function bodies - they're lazily evaluated
        }
        // Terminal nodes or nodes that don't contain expressions
        JsExpr::Identifier(_)
        | JsExpr::Literal(_)
        | JsExpr::This
        | JsExpr::Raw(_)
        | JsExpr::Spread(_)
        | JsExpr::New(_)
        | JsExpr::Class(_)
        | JsExpr::Yield(_)
        | JsExpr::Await(_)
        | JsExpr::TaggedTemplate(_)
        | JsExpr::Chain(_)
        | JsExpr::Void(_) => {}
    }
}

/// Collect reactive references from an expression for legacy mode reactivity.
///
/// This walks the original (pre-transform) expression and collects identifiers
/// that have registered transforms. For each, it builds the appropriate getter:
/// - For props/templates/imports: `$.deep_read_state(getter)`
/// - For other reactive bindings: just the getter (e.g., `$.get(x)`)
///
/// This corresponds to the logic in `build_expression` in the official Svelte compiler:
/// ```javascript
/// for (const binding of metadata.references) {
///     if (binding.kind === 'normal' && binding.declaration_kind !== 'import') {
///         continue;
///     }
///     var getter = build_getter({ ...binding.node }, state);
///     if (binding.kind === 'bindable_prop' || binding.kind === 'template' ||
///         binding.declaration_kind === 'import' || ...) {
///         getter = b.call('$.deep_read_state', getter);
///     }
///     sequence.expressions.push(getter);
/// }
/// ```
fn collect_reactive_references(
    expr: &JsExpr,
    context: &ComponentContext,
    getters: &mut Vec<JsExpr>,
) {
    // Track already-seen identifiers to avoid duplicates
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    collect_reactive_references_inner(expr, context, getters, &mut seen);
}

/// Inner recursive function for collecting reactive references.
fn collect_reactive_references_inner(
    expr: &JsExpr,
    context: &ComponentContext,
    getters: &mut Vec<JsExpr>,
    seen: &mut std::collections::HashSet<String>,
) {
    match expr {
        JsExpr::Identifier(name) => {
            // Skip if we've already processed this identifier
            if seen.contains(name) {
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
            let binding_info = context.state.get_binding(name);

            // Determine if this identifier should be included based on binding kind
            let should_include = if name == "$$props" || name == "$$restProps" {
                true
            } else if let Some(binding) = binding_info {
                use crate::compiler::phases::phase2_analyze::scope::{
                    BindingKind, DeclarationKind,
                };
                // Skip normal bindings unless they are imports
                // (matches: binding.kind === 'normal' && binding.declaration_kind !== 'import' -> continue)
                !(binding.kind == BindingKind::Normal
                    && binding.declaration_kind != DeclarationKind::Import)
            } else if context.state.transform.get(name).is_some() {
                // Has a transform registered (could be a synthetic binding)
                true
            } else {
                false
            };

            if !should_include {
                return;
            }

            seen.insert(name.clone());

            // Build the getter by applying the read transform if one exists
            // (mirrors build_getter in the official compiler)
            let getter = if let Some(transform) = context.state.transform.get(name) {
                if let Some(read_fn) = transform.read {
                    read_fn(JsExpr::Identifier(name.clone()))
                } else {
                    JsExpr::Identifier(name.clone())
                }
            } else {
                // No transform registered (e.g., imports) - use the identifier directly
                JsExpr::Identifier(name.clone())
            };

            // Check if we need to wrap in $.deep_read_state()
            // This is needed for:
            // - bindable_prop (props that are sources)
            // - template bindings
            // - imports (declaration_kind === 'import')
            // - $$props / $$restProps
            let needs_deep_read = if name == "$$props" || name == "$$restProps" {
                true
            } else if let Some(binding) = binding_info {
                use crate::compiler::phases::phase2_analyze::scope::{
                    BindingKind, DeclarationKind,
                };
                // In the official compiler, 'template' kind covers: await then/catch values,
                // let directive bindings, const tag declarations, and keyed each indices.
                // Our Rust impl splits these into separate BindingKind variants.
                // Note: 'each' kind (EachItem) and 'snippet' kind (SnippetParam) are NOT
                // wrapped in deep_read_state - they are included as plain getters.
                matches!(
                    binding.kind,
                    BindingKind::BindableProp
                        | BindingKind::Template
                        | BindingKind::AwaitThen
                        | BindingKind::AwaitCatch
                        | BindingKind::Let
                ) || binding.declaration_kind == DeclarationKind::Import
            } else {
                false
            };

            let final_getter = if needs_deep_read {
                b::svelte_call("deep_read_state", vec![getter])
            } else {
                getter
            };

            getters.push(final_getter);
        }

        JsExpr::Call(call) => {
            // Recurse into callee and arguments
            collect_reactive_references_inner(&call.callee, context, getters, seen);
            for arg in &call.arguments {
                collect_reactive_references_inner(arg, context, getters, seen);
            }
        }

        JsExpr::Member(member) => {
            collect_reactive_references_inner(&member.object, context, getters, seen);
            if let JsMemberProperty::Expression(prop) = &member.property {
                collect_reactive_references_inner(prop, context, getters, seen);
            }
        }

        JsExpr::Binary(binary) => {
            collect_reactive_references_inner(&binary.left, context, getters, seen);
            collect_reactive_references_inner(&binary.right, context, getters, seen);
        }

        JsExpr::Logical(logical) => {
            collect_reactive_references_inner(&logical.left, context, getters, seen);
            collect_reactive_references_inner(&logical.right, context, getters, seen);
        }

        JsExpr::Conditional(cond) => {
            collect_reactive_references_inner(&cond.test, context, getters, seen);
            collect_reactive_references_inner(&cond.consequent, context, getters, seen);
            collect_reactive_references_inner(&cond.alternate, context, getters, seen);
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
                        collect_reactive_references_inner(&p.value, context, getters, seen);
                    }
                    JsObjectMember::SpreadElement(s) => {
                        collect_reactive_references_inner(s, context, getters, seen);
                    }
                }
            }
        }

        JsExpr::Assignment(assign) => {
            collect_reactive_references_inner(&assign.left, context, getters, seen);
            collect_reactive_references_inner(&assign.right, context, getters, seen);
        }

        JsExpr::Unary(unary) => {
            collect_reactive_references_inner(&unary.argument, context, getters, seen);
        }

        JsExpr::Update(update) => {
            collect_reactive_references_inner(&update.argument, context, getters, seen);
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
            match &arrow.body {
                JsArrowBody::Expression(body_expr) => {
                    collect_reactive_references_inner(body_expr, context, getters, seen);
                }
                JsArrowBody::Block(block) => {
                    for stmt in &block.body {
                        collect_reactive_references_from_statement(stmt, context, getters, seen);
                    }
                }
            }
        }

        JsExpr::Function(func) => {
            // Also process function bodies
            for stmt in &func.body.body {
                collect_reactive_references_from_statement(stmt, context, getters, seen);
            }
        }

        // Terminal nodes or nodes that don't contain expressions
        JsExpr::Literal(_)
        | JsExpr::This
        | JsExpr::Raw(_)
        | JsExpr::Spread(_)
        | JsExpr::New(_)
        | JsExpr::Class(_)
        | JsExpr::Yield(_)
        | JsExpr::Await(_)
        | JsExpr::TaggedTemplate(_)
        | JsExpr::Chain(_)
        | JsExpr::Void(_) => {}
    }
}

/// Helper to collect reactive references from statements.
fn collect_reactive_references_from_statement(
    stmt: &JsStatement,
    context: &ComponentContext,
    getters: &mut Vec<JsExpr>,
    seen: &mut std::collections::HashSet<String>,
) {
    match stmt {
        JsStatement::Expression(expr_stmt) => {
            collect_reactive_references_inner(&expr_stmt.expression, context, getters, seen);
        }
        JsStatement::Return(ret_stmt) => {
            if let Some(arg) = &ret_stmt.argument {
                collect_reactive_references_inner(arg, context, getters, seen);
            }
        }
        JsStatement::VariableDeclaration(var_decl) => {
            for decl in &var_decl.declarations {
                if let Some(init) = &decl.init {
                    collect_reactive_references_inner(init, context, getters, seen);
                }
            }
        }
        JsStatement::If(if_stmt) => {
            collect_reactive_references_inner(&if_stmt.test, context, getters, seen);
            collect_reactive_references_from_statement(&if_stmt.consequent, context, getters, seen);
            if let Some(alt) = &if_stmt.alternate {
                collect_reactive_references_from_statement(alt, context, getters, seen);
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

/// Build bind:this directive.
///
/// Corresponds to `build_bind_this` in utils.js.
///
/// # Arguments
///
/// * `expression` - The bind expression (getter/setter pair or simple identifier)
/// * `value` - The value to bind (usually an element reference)
/// * `context` - The component context
///
/// # Returns
///
/// Returns a call to `$.bind_this()` with appropriate getter/setter.
pub fn build_bind_this(
    expression: BindExpression,
    value: JsExpr,
    _context: &mut ComponentContext,
) -> JsExpr {
    match expression {
        BindExpression::Simple(expr) => {
            // Simple identifier: just pass it as both getter and setter
            // $.bind_this(value, () => expr, (v) => { expr = v })
            let getter = b::arrow(vec![], expr.clone());
            let setter = b::arrow_block(
                vec![b::id_pattern("$$value")],
                vec![b::stmt(b::assign(expr, b::id("$$value")))],
            );

            b::call(b::member_path("$.bind_this"), vec![value, getter, setter])
        }

        BindExpression::Sequence(getter_expr, setter_expr) => {
            // Already have getter/setter pair
            b::call(
                b::member_path("$.bind_this"),
                vec![value, getter_expr, setter_expr],
            )
        }
    }
}

/// Validate a binding in dev mode.
///
/// In development mode, this adds validation to ensure bindings
/// are used correctly.
pub fn validate_binding(
    _state: &mut ComponentClientTransformState,
    _binding: &BindDirective,
    _expression: &JsMemberExpression,
) {
    // TODO: Implement dev mode validation
    // This would check:
    // - Binding is to a valid target
    // - Target is not read-only
    // - etc.
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
pub fn add_svelte_meta(expression: JsExpr) -> JsStatement {
    // TODO: Check if in dev mode and add source location metadata
    b::stmt(expression)
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
    statements: Vec<JsStatement>,
    dependencies: Option<Vec<JsExpr>>,
) -> JsStatement {
    let effect_fn = b::arrow_block(vec![], statements);

    if let Some(deps) = dependencies {
        // $.template_effect_with_values(() => { ... }, [deps])
        b::stmt(b::call(
            b::member_path("$.template_effect_with_values"),
            vec![effect_fn, b::array(deps)],
        ))
    } else {
        // $.template_effect(() => { ... })
        b::stmt(b::call(
            b::member_path("$.template_effect"),
            vec![effect_fn],
        ))
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
pub fn build_render_statement(statements: Vec<JsStatement>) -> JsExpr {
    build_render_statement_with_memoizer(statements, vec![], None, None, None)
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
        b::arrow(param_patterns, (*expr_stmt.expression).clone())
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
        args.push(b::undefined());
    }

    // Add async values if present
    if let Some(async_vals) = async_values {
        args.push(async_vals);
    } else if blockers.is_some() {
        args.push(b::undefined());
    }

    // Add blockers if present
    if let Some(block) = blockers {
        args.push(block);
    }

    b::call(b::member_path("$.template_effect"), args)
}

/// Bind expression types.
#[derive(Debug, Clone)]
pub enum BindExpression {
    /// Simple identifier binding (e.g., bind:this={myRef})
    Simple(JsExpr),

    /// Getter/setter pair (e.g., for complex member expressions)
    Sequence(JsExpr, JsExpr),
}

/// Bind directive metadata.
///
/// Placeholder for bind directive information.
/// TODO: Replace with actual BindDirective from AST when available.
#[derive(Debug, Clone)]
pub struct BindDirective {
    /// The name of the property being bound
    pub name: String,

    /// The expression being bound to
    pub expression: JsExpr,
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
pub fn parse_directive_name(name: &str) -> JsExpr {
    let parts: Vec<&str> = name.split('.').collect();

    if parts.is_empty() {
        return b::id("unknown");
    }

    // Check if the first part is a store reference (starts with $)
    // If so, we need to call it as a function: $store -> $store()
    // This is because store subscriptions are generated as getter functions:
    //   const $store = () => $.store_get(store, '$store', $$stores);
    let first_part = parts[0];
    let mut expression = if first_part.starts_with('$') && first_part.len() > 1 {
        // It's a store reference - call it as a function to get the value
        b::call(b::id(first_part), vec![])
    } else {
        b::id(first_part)
    };

    for part in &parts[1..] {
        // Check if the part is a valid identifier
        let computed = !is_valid_identifier(part);

        if computed {
            expression = b::member_computed(expression, b::string(*part));
        } else {
            expression = b::member(expression, *part);
        }
    }

    expression
}

/// Check if a string is a valid JavaScript identifier.
fn is_valid_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }

    // First character must be a letter, underscore, or dollar sign
    let first_char = s.chars().next().unwrap();
    if !first_char.is_alphabetic() && first_char != '_' && first_char != '$' {
        return false;
    }

    // Remaining characters must be alphanumeric, underscore, or dollar sign
    s.chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Validate a mutation in dev mode.
///
/// In development mode, this adds validation to ensure mutations
/// to props are tracked correctly.
///
/// Corresponds to `validate_mutation` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.
///
/// # Arguments
///
/// * `node` - The original assignment/update node
/// * `context` - The component transformation context
/// * `expression` - The transformed expression
///
/// # Returns
///
/// Returns the expression, potentially wrapped with ownership validation.
///
/// # Implementation
///
/// The JavaScript implementation:
/// ```javascript
/// export function validate_mutation(node, context, expression) {
///     let left = node.type === 'AssignmentExpression' ? node.left : node.argument;
///
///     if (!dev || left.type !== 'MemberExpression' || is_ignored(node, 'ownership_invalid_mutation')) {
///         return expression;
///     }
///
///     const name = object(left);
///     if (!name) return expression;
///
///     const binding = context.state.scope.get(name.name);
///     if (binding?.kind !== 'prop' && binding?.kind !== 'bindable_prop') return expression;
///
///     const state = context.state;
///     state.analysis.needs_mutation_validation = true;
///
///     const path = [];
///
///     while (left.type === 'MemberExpression') {
///         if (left.property.type === 'Literal') {
///             path.unshift(left.property);
///         } else if (left.property.type === 'Identifier') {
///             const transform = context.state.transform[left.property.name];
///             if (left.computed) {
///                 path.unshift(transform?.read ? transform.read(left.property) : left.property);
///             } else {
///                 path.unshift(b.literal(left.property.name));
///             }
///         } else {
///             return expression;
///         }
///
///         left = left.object;
///     }
///
///     path.unshift(b.literal(name.name));
///
///     const loc = locator(left.start);
///
///     return b.call(
///         '$$ownership_validator.mutation',
///         b.literal(binding.prop_alias),
///         b.array(path),
///         expression,
///         loc && b.literal(loc.line),
///         loc && b.literal(loc.column)
///     );
/// }
/// ```
pub fn validate_mutation(
    node: &JsAssignmentExpression,
    context: &ComponentContext,
    expression: JsExpr,
) -> JsExpr {
    // Early return if not in dev mode
    if !context.state.dev {
        return expression;
    }

    // Only validate member expressions
    let member_expr = match node.left.as_ref() {
        JsExpr::Member(m) => m,
        _ => return expression,
    };

    // Get the root object of the member expression
    let root_name = match get_root_object(member_expr) {
        Some(name) => name,
        None => return expression,
    };

    // Get the binding for the root object
    let binding = match context.state.get_binding(&root_name) {
        Some(b) => b,
        None => return expression,
    };

    // Only validate mutations to props
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;
    if !matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp) {
        return expression;
    }

    // Build the property path array
    let path = build_member_path(member_expr, context);

    // Prepend the root name to the path
    let mut full_path = vec![b::string(&root_name)];
    full_path.extend(path);

    // Build the validation call
    let prop_alias = binding.prop_alias.as_ref().unwrap_or(&binding.name).clone();

    let args = vec![b::string(&prop_alias), b::array(full_path), expression];

    // TODO: Add source location when available
    // if let Some((line, column)) = loc {
    //     args.push(b::literal_number(line as f64));
    //     args.push(b::literal_number(column as f64));
    // }

    b::call(b::member_path("$ownership_validator.mutation"), args)
}

/// Get the root object identifier from a member expression chain.
///
/// For example, `obj.foo.bar` returns `"obj"`.
fn get_root_object(mut expr: &JsMemberExpression) -> Option<String> {
    loop {
        match expr.object.as_ref() {
            JsExpr::Identifier(name) => return Some(name.clone()),
            JsExpr::Member(m) => expr = m,
            _ => return None,
        }
    }
}

/// Build the property path for a member expression.
///
/// Returns a list of property accessors (as strings or expressions).
fn build_member_path(mut expr: &JsMemberExpression, context: &ComponentContext) -> Vec<JsExpr> {
    let mut path = Vec::new();

    loop {
        // Add the current property to the path
        match &expr.property {
            JsMemberProperty::Identifier(name) => {
                // Check if there's a transform for this identifier
                let transform = context.state.transform.get(name);

                if expr.computed {
                    // Computed property: use the transform's read if available
                    if let Some(t) = transform {
                        if let Some(read_fn) = t.read {
                            path.push(read_fn(JsExpr::Identifier(name.clone())));
                        } else {
                            path.push(JsExpr::Identifier(name.clone()));
                        }
                    } else {
                        path.push(JsExpr::Identifier(name.clone()));
                    }
                } else {
                    // Non-computed property: use as literal string
                    path.push(b::string(name));
                }
            }
            JsMemberProperty::Expression(expr_box) => {
                match expr_box.as_ref() {
                    JsExpr::Literal(lit) => {
                        path.push(JsExpr::Literal(lit.clone()));
                    }
                    _ => {
                        // Complex expression - can't build static path
                        break;
                    }
                }
            }
            JsMemberProperty::PrivateIdentifier(name) => {
                // Private identifier: use as literal string
                path.push(b::string(name));
            }
        }

        // Move to the parent object
        match expr.object.as_ref() {
            JsExpr::Member(m) => expr = m,
            _ => break,
        }
    }

    // Reverse the path since we built it from leaf to root
    path.reverse();
    path
}

/// Get source location (line, column) from a position.
///
/// TODO: This needs access to the source code to calculate line/column.
/// For now, returns None as a placeholder.
#[allow(dead_code)]
fn get_source_location(_pos: u32) -> Option<(usize, usize)> {
    // TODO: Implement proper source location lookup
    // This would require:
    // 1. Access to the original source code
    // 2. A line/column mapping (similar to source maps)
    // 3. Converting u32 position to (line, column)
    None
}

/// Check if a node has an ignore annotation comment.
///
/// TODO: This needs to check for comments like `// @ts-ignore ownership_invalid_mutation`
/// For now, always returns false.
#[allow(dead_code)]
fn is_ignored<T>(_node: &T, _check: &str) -> bool {
    // TODO: Implement comment annotation checking
    // This would require:
    // 1. Access to comments attached to the node
    // 2. Parsing the comment text for @ts-ignore or similar
    // 3. Checking if the specific check is mentioned
    false
}

/// Result of building a template chunk.
pub struct TemplateChunkResult {
    /// The generated expression (template literal or string)
    pub value: JsExpr,
    /// Whether the chunk contains reactive state
    pub has_state: bool,
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
    values: &[crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::TextOrExpr],
    context: &mut ComponentContext,
) -> TemplateChunkResult {
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
    use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::TextOrExpr;

    let mut expressions: Vec<JsExpr> = Vec::new();
    let mut quasi = b::quasi("", false);
    let mut quasis = vec![quasi.clone()];

    let mut has_state = false;

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
                if let Some(lit_value) = get_literal_value(&expr_tag.expression, context) {
                    if let Some(val) = lit_value {
                        let last_quasi = quasis.last_mut().unwrap();
                        last_quasi.raw.push_str(&val);
                        last_quasi.cooked.push_str(&val);
                    }
                } else {
                    // Convert Expression to JsExpr using the proper converter
                    let converted_expr = convert_expression(&expr_tag.expression, context);

                    // Check if the expression references reactive state, contains calls, member expressions, or await
                    let expr_has_state =
                        expression_has_reactive_state(&expr_tag.expression, context);
                    let expr_has_call = expression_has_call(&expr_tag.expression, context);
                    let expr_has_member = expression_has_member(&expr_tag.expression);
                    let expr_has_await = expression_has_await(&expr_tag.expression);

                    // Build the expression with transforms applied (e.g., $.get() wrapping)
                    let mut expr_metadata = ExpressionMetadata::default();
                    expr_metadata.set_has_state(expr_has_state);
                    expr_metadata.set_has_call(expr_has_call);
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

                    // Track if any expression has state, call, or await (need reactive update).
                    // In the official Svelte compiler, has_call is only set for non-pure calls
                    // (calls to local functions, not globals like console.log), and when set,
                    // it also sets has_state. So has_call contributes to reactivity.
                    if expr_has_state || expr_has_call || expr_has_await {
                        has_state = true;
                    }

                    // For single expression, return directly
                    if values.len() == 1 {
                        return TemplateChunkResult { value, has_state };
                    }

                    // Check if expression is guaranteed to be non-null (like each block index)
                    // This corresponds to Svelte's `state.scope.evaluate(value).is_defined` check
                    let is_defined = is_expression_defined(&expr_tag.expression, context);

                    // Add ?? '' where necessary (only if not guaranteed to be defined)
                    let final_value = if is_defined {
                        value
                    } else {
                        b::logical_str("??", value, b::string(""))
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
        q.raw = sanitize_template_string(&q.cooked);
    }

    // Build final expression
    let value = if !expressions.is_empty() {
        b::template(quasis, expressions)
    } else {
        let last_quasi = quasis.last().unwrap();
        b::string(&last_quasi.cooked)
    };

    TemplateChunkResult { value, has_state }
}

/// Get literal value from an expression if it can be evaluated at compile time.
///
/// Returns:
/// - `Some(Some(value))` - expression evaluates to a non-null/undefined string value
/// - `Some(None)` - expression evaluates to null/undefined (should be omitted)
/// - `None` - expression cannot be evaluated at compile time
pub(crate) fn get_literal_value(
    expr: &crate::ast::js::Expression,
    context: &ComponentContext,
) -> Option<Option<String>> {
    use crate::ast::js::Expression;

    match expr {
        Expression::Value(json_value) => {
            let obj = json_value.as_object()?;
            let expr_type = obj.get("type").and_then(|v| v.as_str())?;

            match expr_type {
                "Literal" => {
                    if let Some(value) = obj.get("value") {
                        if let Some(s) = value.as_str() {
                            return Some(Some(s.to_string()));
                        } else if let Some(n) = value.as_f64() {
                            // Format integers without decimal point
                            if n.fract() == 0.0 {
                                return Some(Some(format!("{}", n as i64)));
                            }
                            return Some(Some(n.to_string()));
                        } else if let Some(b_val) = value.as_bool() {
                            return Some(Some(b_val.to_string()));
                        } else if value.is_null() {
                            return Some(None);
                        }
                    }
                    None
                }
                "Identifier" => {
                    let name = obj.get("name").and_then(|v| v.as_str())?;
                    if name == "undefined" {
                        return Some(None);
                    }

                    // If there's a transform registered for this identifier (e.g., from let: directive),
                    // it's been overridden in the current scope and should not be folded as a literal
                    if context.state.transform.contains_key(name) {
                        return None;
                    }

                    // Check if the identifier is a constant binding
                    let binding = context.state.get_binding(name)?;

                    // Only fold if:
                    // 1. Not a reactive binding ($state, $derived, store, etc.)
                    // 2. Not updated (reassigned or mutated)
                    // 3. Not a prop (props come from outside and can change)
                    // This matches Svelte's scope.js evaluate() logic:
                    // if (!binding.updated && binding.initial !== null && !is_prop)
                    if binding.kind.is_reactive() {
                        return None;
                    }
                    if binding.is_updated() {
                        return None;
                    }
                    let is_prop = matches!(
                        binding.kind,
                        crate::compiler::phases::phase2_analyze::scope::BindingKind::Prop
                            | crate::compiler::phases::phase2_analyze::scope::BindingKind::BindableProp
                            | crate::compiler::phases::phase2_analyze::scope::BindingKind::RestProp
                    );
                    if is_prop {
                        return None;
                    }

                    // Check if we have a known initial value (stored as source string)
                    let init = binding.initial.as_ref()?;
                    // Parse simple string literals like 'world' or "world"
                    let trimmed = init.trim();
                    let is_string_literal = (trimmed.starts_with('\'') && trimmed.ends_with('\''))
                        || (trimmed.starts_with('"') && trimmed.ends_with('"'));
                    if is_string_literal && trimmed.len() >= 2 {
                        return Some(Some(trimmed[1..trimmed.len() - 1].to_string()));
                    }
                    // Parse number literals
                    if let Ok(n) = trimmed.parse::<f64>() {
                        if n.fract() == 0.0 {
                            return Some(Some(format!("{}", n as i64)));
                        }
                        return Some(Some(n.to_string()));
                    }
                    // Handle boolean and null literals
                    match trimmed {
                        "true" => Some(Some("true".to_string())),
                        "false" => Some(Some("false".to_string())),
                        "null" | "undefined" => Some(None),
                        _ => {
                            // Check for TemplateLiteral JSON format (from binding.initial)
                            // Template literals without expressions are known compile-time values
                            if init.contains("\"type\":\"TemplateLiteral\"")
                                && init.contains("\"expressions\":[]")
                            {
                                // Extract the cooked value from the quasis
                                // Format: {"type":"TemplateLiteral",...,"quasis":[{"value":{"cooked":"..."}}]}
                                let quasis = serde_json::from_str::<serde_json::Value>(init)
                                    .ok()
                                    .and_then(|parsed| {
                                        parsed.get("quasis").and_then(|q| q.as_array().cloned())
                                    });

                                if let Some(quasis) = quasis {
                                    // Collect all cooked values from quasis
                                    let mut result = String::new();
                                    for quasi in quasis {
                                        if let Some(cooked) = quasi
                                            .get("value")
                                            .and_then(|v| v.get("cooked"))
                                            .and_then(|c| c.as_str())
                                        {
                                            result.push_str(cooked);
                                        }
                                    }
                                    return Some(Some(result));
                                }
                            }
                            None
                        }
                    }
                }
                "LogicalExpression" => {
                    // Handle ?? (nullish coalescing) operator
                    let operator = obj.get("operator").and_then(|v| v.as_str())?;
                    if operator != "??" {
                        return None;
                    }

                    let left = obj.get("left")?;
                    let left_expr = serde_json::from_value::<Expression>(left.clone()).ok()?;

                    match get_literal_value(&left_expr, context) {
                        Some(Some(val)) => {
                            // Left side has non-null value, return it
                            Some(Some(val))
                        }
                        Some(None) => {
                            // Left side is null/undefined, evaluate right side
                            let right = obj.get("right")?;
                            let right_expr =
                                serde_json::from_value::<Expression>(right.clone()).ok()?;
                            get_literal_value(&right_expr, context)
                        }
                        None => {
                            // Left side cannot be evaluated at compile time
                            None
                        }
                    }
                }
                "CallExpression" => {
                    // Handle pure Math functions with constant arguments
                    let callee = obj.get("callee").and_then(|v| v.as_object())?;
                    let callee_type = callee.get("type").and_then(|t| t.as_str())?;

                    if callee_type == "MemberExpression" {
                        let obj_node = callee.get("object").and_then(|o| o.as_object())?;
                        let prop_node = callee.get("property").and_then(|p| p.as_object())?;

                        let obj_type = obj_node.get("type").and_then(|t| t.as_str())?;
                        let obj_name = obj_node.get("name").and_then(|n| n.as_str())?;
                        let prop_name = prop_node.get("name").and_then(|n| n.as_str())?;

                        if obj_type == "Identifier" && obj_name == "Math" {
                            let args = obj.get("arguments").and_then(|a| a.as_array())?;

                            // Evaluate all arguments
                            let mut arg_values: Vec<f64> = Vec::new();
                            for arg in args {
                                let arg_expr =
                                    serde_json::from_value::<Expression>(arg.clone()).ok()?;
                                let arg_val = get_literal_value(&arg_expr, context)??;
                                let num = arg_val.parse::<f64>().ok()?;
                                arg_values.push(num);
                            }

                            let result = match prop_name {
                                "max" if !arg_values.is_empty() => {
                                    arg_values.iter().cloned().fold(f64::NEG_INFINITY, f64::max)
                                }
                                "min" if !arg_values.is_empty() => {
                                    arg_values.iter().cloned().fold(f64::INFINITY, f64::min)
                                }
                                "floor" if arg_values.len() == 1 => arg_values[0].floor(),
                                "ceil" if arg_values.len() == 1 => arg_values[0].ceil(),
                                "round" if arg_values.len() == 1 => arg_values[0].round(),
                                "abs" if arg_values.len() == 1 => arg_values[0].abs(),
                                "sqrt" if arg_values.len() == 1 => arg_values[0].sqrt(),
                                "pow" if arg_values.len() == 2 => arg_values[0].powf(arg_values[1]),
                                _ => return None,
                            };

                            // Format result
                            if result.fract() == 0.0 && result.abs() < i64::MAX as f64 {
                                return Some(Some(format!("{}", result as i64)));
                            }
                            return Some(Some(result.to_string()));
                        }
                    }
                    None
                }
                _ => None,
            }
        }
    }
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
    is_expression_defined_json(expr.as_json(), context)
}

/// Internal helper for checking if a JSON expression is defined.
fn is_expression_defined_json(json_value: &serde_json::Value, context: &ComponentContext) -> bool {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "Identifier" => {
            if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                // Special identifiers
                if name == "undefined" {
                    return false;
                }

                // First, check if there's a transform with is_defined flag
                // This is how we track EachIndex within each block scope
                if let Some(transform) = context.state.transform.get(name)
                    && transform.is_defined
                {
                    return true;
                }

                // Check the binding
                if let Some(binding) = context.state.get_binding(name) {
                    // EachIndex is always a number, never null/undefined
                    if matches!(binding.kind, BindingKind::EachIndex) {
                        return true;
                    }
                    // For Normal const bindings with defined initial value
                    if matches!(binding.kind, BindingKind::Normal)
                        && !binding.reassigned
                        && matches!(
                            binding.declaration_kind,
                            crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Const
                        )
                        && binding.initial_is_defined
                    {
                        return true;
                    }
                }
            }
            false
        }
        "Literal" => {
            // Literals are defined unless they're null/undefined
            if let Some(value) = obj.get("value") {
                return !value.is_null();
            }
            // If no value field but raw exists, it's likely a valid literal
            obj.get("raw").is_some()
        }
        "BinaryExpression" => {
            // Binary expressions always produce defined results (booleans, numbers, strings)
            true
        }
        "UnaryExpression" => {
            // Check the operator - most produce defined results
            if let Some(op) = obj.get("operator").and_then(|v| v.as_str()) {
                // void operator produces undefined
                if op == "void" {
                    return false;
                }
            }
            true
        }
        "LogicalExpression" => {
            // Logical expressions might return undefined if right side is undefined
            // For safety, check both operands
            if let (Some(left), Some(right)) = (obj.get("left"), obj.get("right")) {
                return is_expression_defined_json(left, context)
                    && is_expression_defined_json(right, context);
            }
            false
        }
        "ConditionalExpression" => {
            // Ternary: check both consequent and alternate
            if let (Some(consequent), Some(alternate)) =
                (obj.get("consequent"), obj.get("alternate"))
            {
                return is_expression_defined_json(consequent, context)
                    && is_expression_defined_json(alternate, context);
            }
            false
        }
        "TemplateLiteral" => {
            // Template literals are always strings (defined)
            true
        }
        "ArrayExpression" | "ObjectExpression" => {
            // Array/object literals are always defined
            true
        }
        "ArrowFunctionExpression" | "FunctionExpression" => {
            // Functions are always defined
            true
        }
        "CallExpression" | "MemberExpression" => {
            // These could return undefined, so we can't guarantee they're defined
            false
        }
        _ => false,
    }
}

/// Check if an expression references any reactive state.
///
/// Returns true if the expression contains identifiers that reference
/// reactive bindings ($state, $derived, props, stores, etc.).
#[inline]
pub fn expression_has_reactive_state(
    expr: &crate::ast::js::Expression,
    context: &ComponentContext,
) -> bool {
    use crate::ast::js::Expression;

    match expr {
        Expression::Value(json_value) => has_reactive_state_json(json_value, context),
    }
}

/// Internal helper that processes JSON values directly, avoiding serde_json::from_value overhead.
/// This eliminates expensive cloning and deserialization in recursive calls.
#[inline]
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
                // Check if identifier has a transform registered (e.g., @const, snippet parameter)
                // Identifiers with transforms are derived values that need reactive tracking,
                // BUT only if the transform has is_reactive=true.
                // This check comes FIRST because @const creates both a binding (Normal) and a transform,
                // but the transform indicates it's a derived value needing reactive tracking.
                if let Some(transform) = context.state.transform.get(name) {
                    // Use the is_reactive flag from the transform
                    // Non-reactive transforms (like unkeyed each block index) should not be treated as reactive
                    return transform.is_reactive;
                }
                if let Some(binding) = context.state.get_binding(name) {
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
                    // Derived bindings are always reactive because their value depends
                    // on other reactive sources that may change.
                    if matches!(
                        binding.kind,
                        BindingKind::Prop
                            | BindingKind::BindableProp
                            | BindingKind::RestProp
                            | BindingKind::Store
                            | BindingKind::StoreSub
                            | BindingKind::EachItem
                            | BindingKind::SnippetParam
                            | BindingKind::Derived
                    ) {
                        return true;
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
                        // - Have an initial value that's defined
                        // - Have an initial value that's a literal or known value
                        let is_known = matches!(
                            binding.declaration_kind,
                            DeclarationKind::Const | DeclarationKind::Let
                        ) && !binding.reassigned
                            && !binding.mutated
                            && binding.initial_is_defined
                            && is_initial_value_literal_or_known(&binding.initial);

                        // has_state is true when the value is NOT known at compile time
                        return !is_known;
                    }

                    return false;
                }
                // Unknown identifier - conservatively assume non-reactive
                // (could be a global or module-level binding)
                return false;
            }
            false
        }
        "MemberExpression" => {
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
                    // List of known pure global functions
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
                {
                    const PURE_OBJECTS: &[&str] =
                        &["Math", "JSON", "Object", "Array", "String", "Number"];
                    if PURE_OBJECTS.contains(&obj_name) {
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
            // Check all property values
            if let Some(properties) = obj.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
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
        _ => {
            // Unknown expression type - conservatively assume reactive
            // (using set_text for a static expression is safe but slower,
            //  using textContent for a reactive expression is a correctness bug)
            true
        }
    }
}

/// Check if an expression contains a non-pure function call.
///
/// Matches the official Svelte compiler's behavior: a call is only considered
/// "has_call" if the callee is NOT pure. Pure callees are global identifiers
/// (no local binding) like console.log, Math.max, and literals.
/// Pure calls with only pure arguments are not counted.
#[inline]
pub fn expression_has_call(expr: &crate::ast::js::Expression, context: &ComponentContext) -> bool {
    use crate::ast::js::Expression;

    match expr {
        Expression::Value(json_value) => has_call_json(json_value, context),
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
                // Svelte rune identifiers are NOT pure ($effect, $state, etc.)
                // In particular, $effect.tracking() is reactive
                if name.starts_with('$')
                    && matches!(
                        name,
                        "$effect" | "$state" | "$derived" | "$props" | "$bindable" | "$inspect"
                    )
                {
                    return false;
                }
                // Check if it has a local binding - globals are pure
                context.state.get_binding(name).is_none()
                    && !context.state.transform.contains_key(name)
            } else {
                true
            }
        }
        "MemberExpression" => {
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

/// Internal helper that processes JSON values directly, avoiding serde_json::from_value overhead.
/// Only returns true for non-pure calls (calls to local functions or with reactive arguments).
#[inline]
fn has_call_json(json_value: &serde_json::Value, context: &ComponentContext) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "CallExpression" | "TaggedTemplateExpression" => {
            // Check if this call is pure (callee is global, all args are pure/global)
            // Pure calls like console.log('rendering') should NOT set has_call
            !is_pure_json(json_value, context)
        }
        "MemberExpression" => {
            if let Some(object) = obj.get("object") {
                return has_call_json(object, context);
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
                    if let Some(value) = prop.as_object().and_then(|p| p.get("value"))
                        && has_call_json(value, context)
                    {
                        return true;
                    }
                }
            }
            false
        }
        _ => false,
    }
}

/// Check if an expression contains a member expression.
///
/// Returns true if the expression contains a MemberExpression at any level.
#[inline]
pub fn expression_has_member(expr: &crate::ast::js::Expression) -> bool {
    use crate::ast::js::Expression;

    match expr {
        Expression::Value(json_value) => has_member_json(json_value),
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
        "CallExpression" => {
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
        _ => false,
    }
}

/// Check if an expression contains an await expression.
///
/// Returns true if the expression contains an AwaitExpression at any level.
#[inline]
pub fn expression_has_await(expr: &crate::ast::js::Expression) -> bool {
    use crate::ast::js::Expression;

    match expr {
        Expression::Value(json_value) => has_await_json(json_value),
    }
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
        "CallExpression" => {
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

/// Check if a binding's initial value is a literal or known compile-time constant.
///
/// This approximates Svelte's `scope.evaluate(node).is_known` by checking
/// if the initial value string represents a literal value like:
/// - Number literals: "5", "3.14"
/// - String literals: "'hello'", "\"world\""
/// - Boolean literals: "true", "false"
/// - null literal: "null"
/// - Array/Object literals: "[]", "{}"
///
/// This is a heuristic since we only have the string representation.
#[inline]
fn is_initial_value_literal_or_known(initial: &Option<String>) -> bool {
    let Some(s) = initial else {
        return false;
    };

    // The initial string can be either:
    // 1. A raw literal value like "'world'", "42", "true", "null"
    // 2. An AST JSON string containing "Literal" type

    // Check for AST JSON format (contains "Literal" type)
    if s.contains("Literal") && !s.contains("TemplateLiteral") {
        // Literal types (NumericLiteral, StringLiteral, BooleanLiteral, NullLiteral)
        return true;
    }

    // Check for TemplateLiteral without expressions (pure string template)
    // A TemplateLiteral with no expressions is a known value at compile time
    if s.contains("TemplateLiteral") && s.contains("\"expressions\":[]") {
        return true;
    }

    // Check for raw literal formats
    let trimmed = s.trim();

    // String literal: starts and ends with quotes
    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        return true;
    }

    // Number literal: all digits (possibly with decimal)
    if trimmed.parse::<f64>().is_ok() {
        return true;
    }

    // Boolean/null literals
    if matches!(trimmed, "true" | "false" | "null" | "undefined") {
        return true;
    }

    // Empty array/object literals from AST format
    if s.contains("ArrayExpression") || s.contains("ObjectExpression") {
        // These are known but might contain reactive values - be conservative
        // Only treat empty ones as known
        if s.contains("\"elements\":[]") || s.contains("\"properties\":[]") {
            return true;
        }
    }

    false
}

/// Sanitize a template string by escaping special characters.
fn sanitize_template_string(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('`', "\\`")
        .replace("${", "\\${")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_directive_name_simple() {
        let expr = parse_directive_name("fade");
        match expr {
            JsExpr::Identifier(name) => assert_eq!(name, "fade"),
            _ => panic!("Expected identifier"),
        }
    }

    #[test]
    fn test_parse_directive_name_member() {
        let expr = parse_directive_name("custom.animation");
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
        let statements = vec![b::stmt(b::call(
            b::id("console.log"),
            vec![b::string("test")],
        ))];

        let effect = build_template_effect(statements, None);

        // Should generate $.template_effect(() => { ... })
        match effect {
            JsStatement::Expression(expr) => {
                let JsExpressionStatement { expression } = expr;
                match *expression {
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
        let statements = vec![b::stmt(b::call(b::id("console.log"), vec![b::id("count")]))];

        let deps = vec![b::id("count")];

        let effect = build_template_effect(statements, Some(deps));

        // Should generate $.template_effect_with_values(() => { ... }, [count])
        match effect {
            JsStatement::Expression(expr) => {
                let JsExpressionStatement { expression } = expr;
                match *expression {
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
    fn test_is_initial_value_literal_or_known() {
        // Test string literal
        assert!(is_initial_value_literal_or_known(&Some(
            "'hello'".to_string()
        )));
        assert!(is_initial_value_literal_or_known(&Some(
            "\"world\"".to_string()
        )));

        // Test number literal
        assert!(is_initial_value_literal_or_known(&Some("42".to_string())));
        assert!(is_initial_value_literal_or_known(&Some("3.14".to_string())));

        // Test boolean literal
        assert!(is_initial_value_literal_or_known(&Some("true".to_string())));
        assert!(is_initial_value_literal_or_known(&Some(
            "false".to_string()
        )));

        // Test null/undefined
        assert!(is_initial_value_literal_or_known(&Some("null".to_string())));
        assert!(is_initial_value_literal_or_known(&Some(
            "undefined".to_string()
        )));

        // Test TemplateLiteral without expressions (JSON format)
        let template_literal_json = r#"{"type":"TemplateLiteral","expressions":[],"quasis":[{"type":"TemplateElement","value":{"raw":"hello","cooked":"hello"}}]}"#;
        assert!(is_initial_value_literal_or_known(&Some(
            template_literal_json.to_string()
        )));

        // Test TemplateLiteral WITH expressions - should be false
        let template_literal_with_expr = r#"{"type":"TemplateLiteral","expressions":[{"type":"Identifier","name":"foo"}],"quasis":[]}"#;
        assert!(!is_initial_value_literal_or_known(&Some(
            template_literal_with_expr.to_string()
        )));

        // Test None
        assert!(!is_initial_value_literal_or_known(&None));

        // Test regular identifier - should be false
        assert!(!is_initial_value_literal_or_known(&Some("foo".to_string())));
    }
}
