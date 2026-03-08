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
            names.insert(name.to_string());
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
                    scope.add_local_var(name.to_string(), init_kind);
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
            // Also check ancestor each-block index names (for nested each blocks).
            // When an ancestor's index variable is used inside a nested each block body,
            // we need to mark the ancestor's index as used too.
            for (ancestor_idx_name, ancestor_used_flag) in &context.state.ancestor_each_index_names
            {
                if name == ancestor_idx_name {
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
                    .find(|ctx| ctx.item_name == *name && ctx.item_reassigned)
            {
                // Build collection[$$index] access
                // Note: We do NOT set each_item_assign_or_mutate here - that's only for
                // writes (assign/mutate). The read transform just redirects to arr[$$index].
                return build_reassigned_item_read(each_ctx);
            }
            // Check if there's a transform registered for this identifier
            if let Some(transform) = context.state.transform.get(name.as_str()) {
                // Handle @const destructuring: read_source means this identifier
                // is part of a destructured @const declaration, so reads become
                // $.get(computed_const).identifier_name
                if let Some(ref source_var) = transform.read_source {
                    return b::member(
                        b::svelte_call("get", vec![JsExpr::Identifier(source_var.clone().into())]),
                        name.clone(),
                    );
                }
                if let Some(read_fn) = transform.read {
                    // If this transform has a replacement_id, use it instead of the original name.
                    // This is used for legacy reactive imports where `numbers` -> `$$_import_numbers()`.
                    let input_id = if let Some(ref replacement) = transform.replacement_id {
                        JsExpr::Identifier(replacement.clone().into())
                    } else {
                        JsExpr::Identifier(name.clone())
                    };
                    return read_fn(input_id);
                }
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

            // Check if this is $.update_store/$.update_pre_store - transform first arg only
            let is_store_update = is_svelte_runtime_store_update_call(&call.callee);

            // Check if this is a store subscription SETTER call where the callee should NOT be transformed:
            // - Store setter call: `$store(value)` - callee should stay as `$store`, not `$store()`
            //   because store subscriptions use a different setter pattern.
            //
            // For Prop/BindableProp, the callee ALWAYS needs the read transform applied.
            // When a prop identifier is used as a function callee, it's a GETTER read:
            // `callback(arg)` should become `callback()(arg)` where the first () is the
            // prop getter and the second () is the function invocation.
            // The prop SETTER pattern `prop(value)` is only generated explicitly in the
            // JsExpr::Assignment arm using JsExpr::Raw, not through JsExpr::Call.
            //
            // IMPORTANT: This does NOT apply to state variables ($state, $derived, etc.)!
            // For state variables, `read` wraps `x` -> `$.get(x)`, which is different from props/stores
            // that wrap `x` -> `x()`. State variable calls like `saySomething('Tama')` SHOULD become
            // `$.get(saySomething)('Tama')`, not `saySomething('Tama')`.
            let skip_callee_transform = if let JsExpr::Identifier(name) = call.callee.as_ref()
                && !local_scope.contains(name)
                && let Some(transform) = context.state.transform.get(name.as_str())
            {
                // Only skip callee transform for StoreSub setter calls (calls with arguments).
                // Prop/BindableProp calls should ALWAYS have the callee transformed.
                let binding = context.state.get_binding(name);
                let is_store_sub = binding
                    .map(|b| matches!(b.kind, BindingKind::StoreSub))
                    .unwrap_or(false);

                // Only skip for store subscriptions with setter calls (calls with arguments).
                // For zero-arg calls, the callee should be transformed so that
                // source `name()` becomes `name()()` (getter + invocation).
                is_store_sub && transform.assign.is_some() && !call.arguments.is_empty()
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
                    // 3. For $.update_store/$.update_pre_store: transform first arg (may need $.get()),
                    //    skip second+ args ($store() already constructed)
                    if skip_args_transform
                        || (is_svelte_set_call && i == 0)
                        || (is_store_update && i >= 1)
                    {
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
                            method: p.method,
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
                && let Some(transform) = context.state.transform.get(name.as_str())
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
                    JsAssignmentOp::PowAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::Pow, current, transformed_right)
                    }
                    JsAssignmentOp::BitAndAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::BitAnd, current, transformed_right)
                    }
                    JsAssignmentOp::BitOrAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::BitOr, current, transformed_right)
                    }
                    JsAssignmentOp::BitXorAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::BitXor, current, transformed_right)
                    }
                    JsAssignmentOp::ShlAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::Shl, current, transformed_right)
                    }
                    JsAssignmentOp::ShrAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::Shr, current, transformed_right)
                    }
                    JsAssignmentOp::UShrAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::binary(JsBinaryOp::UShr, current, transformed_right)
                    }
                    JsAssignmentOp::OrAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::or(current, transformed_right)
                    }
                    JsAssignmentOp::AndAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::and(current, transformed_right)
                    }
                    JsAssignmentOp::NullishAssign => {
                        let read_fn = transform.read.unwrap_or(|e| e);
                        let current = read_fn(JsExpr::Identifier(name.clone()));
                        b::nullish(current, transformed_right)
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
            //
            // For legacy mode (non-runes), also transform the assignment to use
            // collection[$$index] and append $.invalidate_inner_signals().
            // This mirrors the official compiler's `assign` transform registered in EachBlock.js:
            //   assign: (_, value) => {
            //     uses_index = true;
            //     const left = b.member(collection, index, true);
            //     return b.sequence([b.assignment('=', left, value), ...sequence]);
            //   }
            if let JsExpr::Identifier(name) = assign.left.as_ref()
                && !local_scope.contains(name)
                && context.state.each_item_names.contains(name)
            {
                context.state.each_item_assign_or_mutate.set(true);

                // In legacy mode, transform the assignment to use collection[$$index]
                // and append the invalidation sequence.
                if !context.state.analysis.runes
                    && let Some(each_ctx) = context
                        .state
                        .each_binding_context
                        .iter()
                        .rev()
                        .find(|ctx| ctx.item_name == *name)
                        .cloned()
                {
                    let collection_access = build_reassigned_item_read(&each_ctx);

                    // Build the assignment value. For compound operators (o *= 2),
                    // we need to expand to: collection[$$index] = collection[$$index] * 2
                    // For simple assignment (o = 5), just use the right side.
                    let transformed_right = recurse!(&assign.right);
                    let assign_value = if matches!(assign.operator, JsAssignmentOp::Assign) {
                        transformed_right
                    } else {
                        // Expand compound assignment: collection[$$index] OP right
                        // e.g., *= becomes collection[$$index] * right
                        let binary_op = match assign.operator {
                            JsAssignmentOp::AddAssign => "+",
                            JsAssignmentOp::SubAssign => "-",
                            JsAssignmentOp::MulAssign => "*",
                            JsAssignmentOp::DivAssign => "/",
                            JsAssignmentOp::ModAssign => "%",
                            JsAssignmentOp::PowAssign => "**",
                            JsAssignmentOp::BitAndAssign => "&",
                            JsAssignmentOp::BitOrAssign => "|",
                            JsAssignmentOp::BitXorAssign => "^",
                            JsAssignmentOp::ShlAssign => "<<",
                            JsAssignmentOp::ShrAssign => ">>",
                            JsAssignmentOp::UShrAssign => ">>>",
                            JsAssignmentOp::OrAssign => "||",
                            JsAssignmentOp::AndAssign => "&&",
                            JsAssignmentOp::NullishAssign => "??",
                            _ => "=",
                        };
                        // Generate: collection[$$index] OP right
                        let collection_read = build_reassigned_item_read(&each_ctx);
                        let collection_str = crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(&collection_read);
                        let right_str = crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(&transformed_right);
                        JsExpr::Raw(
                            format!("{} {} {}", collection_str, binary_op, right_str).into(),
                        )
                    };

                    // Build: collection[$$index] = value
                    let assignment = JsExpr::Assignment(JsAssignmentExpression {
                        operator: JsAssignmentOp::Assign,
                        left: Box::new(collection_access),
                        right: Box::new(assign_value),
                    });

                    // Build the invalidation sequence
                    let invalidation_exprs = each_ctx.invalidation_exprs.clone();
                    let mut seq_exprs = vec![assignment];
                    if !invalidation_exprs.is_empty() {
                        let invalidate_inner = build_invalidate_inner_signals(&invalidation_exprs);
                        seq_exprs.push(invalidate_inner);
                    }

                    // Add store invalidation if needed
                    if let Some(ref store_name) = each_ctx.store_to_invalidate {
                        seq_exprs.push(b::call(
                            b::member_path("$.invalidate_store"),
                            vec![b::id("$$stores"), b::string(store_name)],
                        ));
                    }

                    return b::sequence(seq_exprs);
                }
            }

            // Check for mutation case: when assigning to a member expression where
            // the base object has a mutate transform (e.g., $store.prop = value)
            // This corresponds to the mutation case in AssignmentExpression.js
            if let JsExpr::Member(_) = assign.left.as_ref() {
                // Find the base object of the member expression
                let base_object = get_base_object(assign.left.as_ref());

                // Track each item mutation for uses_index detection.
                // Also handle legacy mode each item mutation: append $.invalidate_inner_signals()
                if let JsExpr::Identifier(name) = &base_object
                    && !local_scope.contains(name)
                    && context.state.each_item_names.contains(name)
                {
                    context.state.each_item_assign_or_mutate.set(true);

                    // In legacy mode, wrap the mutation with $.invalidate_inner_signals()
                    // This mirrors the official compiler's `mutate` transform on each items:
                    //   mutate: (_, mutation) => {
                    //     uses_index = true;
                    //     return b.sequence([mutation, ...sequence]);
                    //   }
                    if !context.state.analysis.runes
                        && let Some(each_ctx) = context
                            .state
                            .each_binding_context
                            .iter()
                            .rev()
                            .find(|ctx| ctx.item_name == *name)
                            .cloned()
                        && !each_ctx.invalidation_exprs.is_empty()
                    {
                        // Transform the full assignment (apply read transforms to both sides)
                        let transformed_left = recurse!(&assign.left);
                        let transformed_right = recurse!(&assign.right);
                        let mutation = JsExpr::Assignment(JsAssignmentExpression {
                            operator: assign.operator,
                            left: Box::new(transformed_left),
                            right: Box::new(transformed_right),
                        });

                        let invalidation_exprs = each_ctx.invalidation_exprs.clone();
                        let mut seq_exprs = vec![mutation];
                        let invalidate_inner = build_invalidate_inner_signals(&invalidation_exprs);
                        seq_exprs.push(invalidate_inner);

                        if let Some(ref store_name) = each_ctx.store_to_invalidate {
                            seq_exprs.push(b::call(
                                b::member_path("$.invalidate_store"),
                                vec![b::id("$$stores"), b::string(store_name)],
                            ));
                        }

                        return b::sequence(seq_exprs);
                    }
                }

                // If the left side's base chain already goes through a Call node,
                // the read transform was already applied by expression_converter.rs
                // (e.g., items()[0].clicked). The mutation wrapping was also already done
                // by try_transform_assignment. We must NOT recurse into the left side again
                // (which would double-apply read transforms), and must NOT mutation-wrap again.
                // Just transform the right side and return.
                if has_call_in_base_chain(assign.left.as_ref()) {
                    let transformed_right = recurse!(&assign.right);
                    return JsExpr::Assignment(JsAssignmentExpression {
                        operator: assign.operator,
                        left: assign.left.clone(),
                        right: Box::new(transformed_right),
                    });
                }

                if let JsExpr::Identifier(name) = base_object
                    && !local_scope.contains(&name)
                    && let Some(transform) = context.state.transform.get(name.as_str())
                    && let Some(mutate_fn) = transform.mutate
                {
                    let transformed_right = recurse!(&assign.right);

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
                        Box::new(recurse!(&assign.left))
                    } else if is_store_sub {
                        // Store subscriptions: keep original left side for store_sub_mutate to handle
                        // Recursing would turn `$store` into `$store()` which is wrong
                        assign.left.clone()
                    } else {
                        // State/mutable source bindings: transform computed property indices
                        // so that reactive each-item variables inside brackets get $.get() wrappers.
                        // e.g., `list[key] = $$value` → mutation_left = `list[$.get(key)] = $$value`
                        // then mutate_value_legacy replaces `list` → `$.get(list)` to get:
                        //   `$.get(list)[$.get(key)] = $$value`
                        Box::new(transform_computed_indices_only(
                            &assign.left,
                            context,
                            local_scope,
                        ))
                    };

                    let full_assignment = JsExpr::Assignment(JsAssignmentExpression {
                        operator: assign.operator,
                        left: mutation_left,
                        right: Box::new(transformed_right),
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

                    return mutate_fn(mutate_target, full_assignment);
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
                && let Some(transform) = context.state.transform.get(name.as_str())
                && let Some(update_fn) = transform.update
            {
                return update_fn(
                    update.operator,
                    JsExpr::Identifier(name.clone()),
                    update.prefix,
                );
            }

            // Track each item update (++ or --) for uses_index detection.
            // For reassigned each items in legacy mode, transform `n++` into
            // `collection[$$index]++, $.invalidate_inner_signals(() => collection)`
            // This mirrors the official Svelte compiler's `mutate` transform on each items:
            //   mutate: (_, mutation) => {
            //     uses_index = true;
            //     return b.sequence([mutation, ...sequence]);
            //   }
            if let JsExpr::Identifier(name) = update.argument.as_ref()
                && !local_scope.contains(name)
                && context.state.each_item_names.contains(name)
            {
                context.state.each_item_assign_or_mutate.set(true);

                // For reassigned each items in legacy mode, we need to transform `n++` to
                // `collection[$$index]++, $.invalidate_inner_signals(() => collection)`
                if !context.state.analysis.runes
                    && let Some(binding) = context.state.get_binding(name)
                    && binding.reassigned
                    && let Some(each_ctx) = context.state.each_binding_context.last()
                    && each_ctx.item_name == *name
                {
                    let collection_access = build_reassigned_item_read(each_ctx);
                    let update_expr = b::update(update.operator, collection_access, update.prefix);

                    // Build the invalidation sequence expressions
                    let invalidation_exprs = each_ctx.invalidation_exprs.clone();
                    let mut seq_exprs = vec![update_expr];
                    if !invalidation_exprs.is_empty() {
                        let invalidate_inner = build_invalidate_inner_signals(&invalidation_exprs);
                        seq_exprs.push(invalidate_inner);
                    }
                    return b::sequence(seq_exprs);
                }
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
                // Also handle legacy mode each item mutation: append $.invalidate_inner_signals()
                if let JsExpr::Identifier(name) = &base_object
                    && !local_scope.contains(name)
                    && context.state.each_item_names.contains(name)
                {
                    context.state.each_item_assign_or_mutate.set(true);

                    // In legacy mode, wrap the update with $.invalidate_inner_signals()
                    if !context.state.analysis.runes
                        && let Some(each_ctx) = context
                            .state
                            .each_binding_context
                            .iter()
                            .rev()
                            .find(|ctx| ctx.item_name == *name)
                            .cloned()
                        && !each_ctx.invalidation_exprs.is_empty()
                    {
                        // Transform the update expression (apply read transforms)
                        let transformed_arg = recurse!(&update.argument);
                        let mutation = JsExpr::Update(JsUpdateExpression {
                            operator: update.operator,
                            argument: Box::new(transformed_arg),
                            prefix: update.prefix,
                        });

                        let invalidation_exprs = each_ctx.invalidation_exprs.clone();
                        let mut seq_exprs = vec![mutation];
                        let invalidate_inner = build_invalidate_inner_signals(&invalidation_exprs);
                        seq_exprs.push(invalidate_inner);

                        if let Some(ref store_name) = each_ctx.store_to_invalidate {
                            seq_exprs.push(b::call(
                                b::member_path("$.invalidate_store"),
                                vec![b::id("$$stores"), b::string(store_name)],
                            ));
                        }

                        return b::sequence(seq_exprs);
                    }
                }

                if let JsExpr::Identifier(name) = base_object
                    && !local_scope.contains(&name)
                    && let Some(transform) = context.state.transform.get(name.as_str())
                    && let Some(mutate_fn) = transform.mutate
                {
                    // Transform the argument so that reactive reads inside the
                    // update expression get wrapped properly, e.g. `global.value.count++`
                    // becomes `$$_import_global().value.count++` for reactive imports.
                    let transformed_arg = recurse!(&update.argument);
                    let full_update = JsExpr::Update(JsUpdateExpression {
                        operator: update.operator,
                        argument: Box::new(transformed_arg),
                        prefix: update.prefix,
                    });

                    // Use replacement_id if set (e.g., reactive imports: global -> $$_import_global)
                    let mutate_target = if let Some(ref replacement) = transform.replacement_id {
                        JsExpr::Identifier(replacement.clone().into())
                    } else {
                        JsExpr::Identifier(name.clone())
                    };

                    return mutate_fn(mutate_target, full_update);
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
            "set"
                | "update"
                | "update_pre"
                | "get"
                | "safe_get"
                | "mutate"
                | "update_prop"
                | "update_pre_prop"
        );
    }
    false
}

/// Check if a callee expression represents a Svelte runtime function that should
/// skip transformation of ALL its arguments (e.g., $.untrack, $.store_mutate).
///
/// - `$.untrack()` takes a getter function that should not be invoked
/// - `$.store_mutate()` has pre-constructed arguments with $.untrack() calls
fn is_svelte_runtime_skip_args_transform(callee: &JsExpr) -> bool {
    if let JsExpr::Member(member) = callee
        && let JsExpr::Identifier(obj_name) = member.object.as_ref()
        && obj_name == "$"
        && let JsMemberProperty::Identifier(prop_name) = &member.property
    {
        return matches!(prop_name.as_str(), "untrack" | "store_mutate");
    }
    false
}

/// Check if a callee expression represents $.update_store or $.update_pre_store.
/// These calls should transform the first argument (store reference which may need $.get())
/// but skip the second argument onwards ($store() call that's already constructed).
fn is_svelte_runtime_store_update_call(callee: &JsExpr) -> bool {
    if let JsExpr::Member(member) = callee
        && let JsExpr::Identifier(obj_name) = member.object.as_ref()
        && obj_name == "$"
        && let JsMemberProperty::Identifier(prop_name) = &member.property
    {
        return matches!(prop_name.as_str(), "update_store" | "update_pre_store");
    }
    false
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
fn build_reassigned_item_read(
    each_ctx: &crate::compiler::phases::phase3_transform::client::types::EachBindingContext,
) -> JsExpr {
    // Build the collection expression (either $$array() or the collection itself)
    let collection_expr = if let Some(ref coll_id) = each_ctx.collection_id {
        // Computed: $$array()
        b::call(b::id(coll_id), vec![])
    } else {
        // Raw collection expression string (already has transforms applied, e.g., $.get(arr))
        JsExpr::Raw(each_ctx.collection_expr.clone().into())
    };

    // Build the index expression (either $.get($$index) for reactive or just $$index)
    let index_expr = if each_ctx.index_reactive {
        b::call(b::member_path("$.get"), vec![b::id(&each_ctx.index_name)])
    } else {
        b::id(&each_ctx.index_name)
    };

    // Build the computed member expression: collection[index]
    b::member_computed(collection_expr, index_expr)
}

/// Build a `$.invalidate_inner_signals(() => (expr1, expr2, ...))` call.
///
/// This mirrors the invalidation sequence used by the official Svelte compiler
/// when mutating each block items in legacy mode.
fn build_invalidate_inner_signals(invalidation_exprs: &[String]) -> JsExpr {
    let exprs: Vec<JsExpr> = invalidation_exprs
        .iter()
        .map(|s| JsExpr::Raw(s.clone().into()))
        .collect();

    // Always wrap in sequence parens, even for a single expression.
    // The official compiler always produces `() => (expr)` not `() => expr`.
    let inner = b::sequence(exprs);

    b::call(
        b::member_path("$.invalidate_inner_signals"),
        vec![b::thunk(inner)],
    )
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

/// Check if the chain from the expression to its base Identifier goes through
/// a read-transform Call node. This indicates the base object has already been
/// read-transformed (e.g., `items()` for a prop), meaning the mutation wrapping
/// was already applied by expression_converter.rs and should NOT be applied again.
///
/// Only detects calls where the callee is a simple Identifier (e.g., `items()`),
/// which indicates a prop read transform. Method calls like `list.at(-1)` where
/// the callee is a Member expression are NOT considered read transforms.
fn has_call_in_base_chain(expr: &JsExpr) -> bool {
    match expr {
        JsExpr::Member(member) => has_call_in_base_chain(&member.object),
        JsExpr::Call(call) => {
            // Only consider it a read-transform if the callee is a simple Identifier.
            // Method calls like `list.at()` have a Member callee and should not count.
            matches!(call.callee.as_ref(), JsExpr::Identifier(_))
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
fn transform_computed_indices_only(
    expr: &JsExpr,
    context: &ComponentContext,
    local_scope: &LocalScope,
) -> JsExpr {
    match expr {
        JsExpr::Member(member) => {
            // Recurse into object (but still only transform computed indices there too)
            let transformed_object =
                transform_computed_indices_only(&member.object, context, local_scope);

            // For computed properties, apply full transforms to the index expression
            let transformed_property = match &member.property {
                JsMemberProperty::Expression(prop_expr) if member.computed => {
                    JsMemberProperty::Expression(Box::new(
                        apply_transforms_to_expression_with_shadowed(
                            prop_expr,
                            context,
                            local_scope,
                        ),
                    ))
                }
                other => other.clone(),
            };

            JsExpr::Member(JsMemberExpression {
                object: Box::new(transformed_object),
                property: transformed_property,
                computed: member.computed,
                optional: member.optional,
            })
        }
        // For non-member expressions (like an identifier at the root), keep as-is
        other => other.clone(),
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
                            init: d.init.as_ref().map(|e| {
                                // Init expressions in the for-loop header are evaluated in
                                // the OUTER scope (before the loop var is in scope), but for
                                // simplicity we use for_scope here since the init variable
                                // shadowing itself in its own initializer is a no-op anyway.
                                Box::new(apply_transforms_to_expression_with_shadowed(
                                    e, context, &for_scope,
                                ))
                            }),
                        })
                        .collect();
                    JsForInit::Variable(JsVariableDeclaration {
                        kind: decl.kind,
                        declarations: transformed_decls,
                    })
                }
                JsForInit::Expression(expr) => JsForInit::Expression(Box::new(
                    apply_transforms_to_expression_with_shadowed(expr, context, &for_scope),
                )),
            });
            let transformed_test = for_stmt.test.as_ref().map(|t| {
                Box::new(apply_transforms_to_expression_with_shadowed(
                    t, context, &for_scope,
                ))
            });
            let transformed_update = for_stmt.update.as_ref().map(|u| {
                Box::new(apply_transforms_to_expression_with_shadowed(
                    u, context, &for_scope,
                ))
            });
            let transformed_body = Box::new(apply_transforms_to_statement_with_shadowed(
                &for_stmt.body,
                context,
                &for_scope,
            ));
            JsStatement::For(JsForStatement {
                init: transformed_init,
                test: transformed_test,
                update: transformed_update,
                body: transformed_body,
            })
        }

        JsStatement::While(while_stmt) => JsStatement::While(JsWhileStatement {
            test: Box::new(transform_expr(&while_stmt.test)),
            body: Box::new(transform_stmt(&while_stmt.body)),
        }),

        JsStatement::DoWhile(do_while) => JsStatement::DoWhile(JsDoWhileStatement {
            body: Box::new(transform_stmt(&do_while.body)),
            test: Box::new(transform_expr(&do_while.test)),
        }),

        JsStatement::Throw(expr) => JsStatement::Throw(Box::new(transform_expr(expr))),

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
    let thunk = b::thunk(value.clone());
    let untracked = b::call(b::member_path("$.untrack"), vec![thunk]);

    // Add the untracked value as the last expression in the sequence
    sequence_exprs.push(untracked);

    // Return a sequence expression: (dep1, dep2, ..., $.untrack(() => value))
    // If sequence has just one element (only $.untrack), it simplifies to ($.untrack(...))
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
                .find(|ctx| ctx.item_name == *name && ctx.item_reassigned)
        {
            let reassigned_read = build_reassigned_item_read(each_ctx);
            getters.push(reassigned_read);
            continue;
        }

        // Build the getter by applying the read transform if one exists
        // (mirrors build_getter in the official compiler)
        let getter = if let Some(transform) = context.state.transform.get(name.as_str()) {
            if let Some(ref read_source) = transform.read_source {
                // read_source is set for destructured @const and let directive bindings.
                // The getter should be $.get(read_source).name instead of $.get(name).
                b::member(
                    b::call(b::member_path("$.get"), vec![b::id(read_source)]),
                    name,
                )
            } else if let Some(read_fn) = transform.read {
                let input_id = if let Some(ref replacement) = transform.replacement_id {
                    JsExpr::Identifier(replacement.clone().into())
                } else {
                    JsExpr::Identifier(name.clone().into())
                };
                read_fn(input_id)
            } else {
                JsExpr::Identifier(name.clone().into())
            }
        } else {
            // No transform registered (e.g., imports) - use the identifier directly
            JsExpr::Identifier(name.clone().into())
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
        let needs_deep_read = if name == "$$props" || name == "$$restProps" {
            true
        } else {
            matches!(
                binding.kind,
                BindingKind::BindableProp
                    | BindingKind::Template
                    | BindingKind::AwaitThen
                    | BindingKind::AwaitCatch
                    | BindingKind::Let
            ) || (binding.kind == BindingKind::EachIndex && has_read_transform)
                || binding.declaration_kind == DeclarationKind::Import
        };

        let final_getter = if needs_deep_read {
            b::svelte_call("deep_read_state", vec![getter])
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
                    .find(|ctx| ctx.item_name == *name && ctx.item_reassigned)
            {
                let reassigned_read = build_reassigned_item_read(each_ctx);
                getters.push(reassigned_read);
                return;
            }

            // Build the getter by applying the read transform if one exists
            // (mirrors build_getter in the official compiler)
            let has_read_transform = context
                .state
                .transform
                .get(name.as_str())
                .is_some_and(|t| t.read.is_some());
            let getter = if let Some(transform) = context.state.transform.get(name.as_str()) {
                if let Some(ref read_source) = transform.read_source {
                    // read_source is set for destructured @const and let directive bindings.
                    // The getter should be $.get(read_source).name instead of $.get(name).
                    b::member(
                        b::call(b::member_path("$.get"), vec![b::id(read_source)]),
                        name.clone(),
                    )
                } else if let Some(read_fn) = transform.read {
                    // If this transform has a replacement_id, use it instead of the original name.
                    // This is used for legacy reactive imports where `numbers` -> `$$_import_numbers()`.
                    let input_id = if let Some(ref replacement) = transform.replacement_id {
                        JsExpr::Identifier(replacement.clone().into())
                    } else {
                        JsExpr::Identifier(name.clone())
                    };
                    read_fn(input_id)
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
            //
            // NOTE: In the official compiler, keyed each block indices have kind 'template'
            // while non-keyed have kind 'static'. Our Rust code uses EachIndex for both.
            // We distinguish by checking if a transform was registered: keyed indices have
            // a $.get() transform, non-keyed indices don't.
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
                ) || (binding.kind == BindingKind::EachIndex && has_read_transform)
                    || binding.declaration_kind == DeclarationKind::Import
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
            // However, arrow parameter names shadow outer reactive references and must be
            // excluded. For example, in `switches.filter(s => !!s.on)`, the `s` parameter
            // shadows the each-block `s` and should NOT be collected as a dependency.
            let mut param_names = HashSet::new();
            for param in &arrow.params {
                extract_pattern_names(param, &mut param_names);
            }
            // Add parameter names to seen set to prevent them from being collected
            for name in &param_names {
                seen.insert(name.clone());
            }
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
            // Remove parameter names from seen set so they don't affect sibling expressions
            for name in &param_names {
                seen.remove(name);
            }
        }

        JsExpr::Function(func) => {
            // Also process function bodies, excluding function parameter names
            let mut param_names = HashSet::new();
            for param in &func.params {
                extract_pattern_names(param, &mut param_names);
            }
            for name in &param_names {
                seen.insert(name.clone());
            }
            for stmt in &func.body.body {
                collect_reactive_references_from_statement(stmt, context, getters, seen);
            }
            for name in &param_names {
                seen.remove(name);
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
    // Use expression body for single expression statements, block body otherwise
    let effect_fn = if statements.len() == 1
        && let JsStatement::Expression(expr_stmt) = &statements[0]
    {
        b::arrow(vec![], (*expr_stmt.expression).clone())
    } else {
        b::arrow_block(vec![], statements)
    };

    if let Some(deps) = dependencies {
        // $.template_effect_with_values(() => { ... }, [deps])
        b::stmt(b::call(
            b::member_path("$.template_effect_with_values"),
            vec![effect_fn, b::array(deps)],
        ))
    } else {
        // $.template_effect(() => expr) or $.template_effect(() => { stmts })
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
            JsExpr::Identifier(name) => return Some(name.to_string()),
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
                let transform = context.state.transform.get(name.as_str());

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
                    path.push(b::string(name.clone()));
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
                path.push(b::string(name.clone()));
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
    /// Blocker indices from expressions that reference blocker_map variables.
    /// Even when expression values are evaluated to literals at compile time,
    /// they may reference variables that depend on async operations and need
    /// to be blocked until those operations complete.
    pub blocker_indices: Vec<usize>,
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
                if let Some(lit_value) = get_literal_value(&expr_tag.expression, context) {
                    if let Some(val) = lit_value {
                        let last_quasi = quasis.last_mut().unwrap();
                        last_quasi.raw.push_str(&val);
                        last_quasi.cooked.push_str(&val);
                    }
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

                    // Check if the expression references reactive state, contains calls, member expressions, or await
                    // in a single pass over the AST, instead of 4 separate walks.
                    // Special case: $effect.pending() is inherently reactive (has_state=true)
                    // but NOT a "call" for memoization. This matches the official Svelte compiler's
                    // phase 2 analysis where $effect.pending() explicitly sets has_state = true
                    // but does NOT set has_call (because is_pure returns true for the callee).
                    let is_pending_rune = is_effect_pending_expr(&expr_tag.expression);
                    let expr_props = analyze_expression_properties(&expr_tag.expression, context);
                    let expr_has_state = expr_props.has_state || is_pending_rune;
                    // $effect.pending() is treated as a pure call by the official compiler,
                    // so it should NOT have has_call=true. This prevents it from being memoized.
                    let expr_has_call = if is_pending_rune {
                        false
                    } else {
                        expr_props.has_call
                    };
                    let expr_has_member = expr_props.has_member;
                    let expr_has_await = expr_props.has_await;

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
                        return TemplateChunkResult {
                            value,
                            has_state,
                            blocker_indices,
                        };
                    }

                    // Check if the expression is guaranteed to be non-null.
                    // This corresponds to Svelte's `state.scope.evaluate(value).is_defined` check.
                    //
                    // We use a two-step approach:
                    // 1. Check the ORIGINAL expression with full binding context (knows EachIndex
                    //    is always a number, const bindings with defined values, etc.)
                    // 2. If the original was defined, check if a transform made it potentially
                    //    undefined by wrapping it in $.get() (which returns a Call expression).
                    //
                    // This correctly handles:
                    // - Non-keyed each index `i`: original=defined, built=Identifier => defined
                    // - Keyed each index `$.get(index)`: original=defined, built=Call => NOT defined
                    // - Normal variables: original=not defined => NOT defined
                    // Determine defined-ness by checking the built (transformed) expression.
                    //
                    // For simple identifiers that weren't transformed (like non-keyed each
                    // index `i`), we check the original expression which has binding context
                    // (knows EachIndex is always a number). For everything else, we check
                    // the built JsExpr.
                    let is_defined = if let JsExpr::Identifier(_) = &value {
                        // Value is still a plain identifier (no $.get() wrapping).
                        // Use the original expression check which has binding context.
                        is_expression_defined(&expr_tag.expression, context)
                    } else {
                        // Value was transformed. Check the built expression.
                        is_js_expr_defined(&value)
                    };

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
fn collect_expression_identifiers_for_blockers(expr: &crate::ast::js::Expression) -> Vec<String> {
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

    {
        let json_value = expr.as_json();
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
                // 1. Not updated (reassigned or mutated)
                // 2. Not a prop (props come from outside and can change)
                // This matches Svelte's scope.js evaluate() logic:
                // if (!binding.updated && binding.initial !== null && !is_prop)
                // Note: reactive bindings like $state('hello') CAN be folded if not updated,
                // because their initial value is still known at compile time.
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
            "BinaryExpression" => {
                let operator = obj.get("operator").and_then(|v| v.as_str())?;
                let left = obj.get("left")?;
                let right = obj.get("right")?;
                let left_expr = serde_json::from_value::<Expression>(left.clone()).ok()?;
                let right_expr = serde_json::from_value::<Expression>(right.clone()).ok()?;

                let left_val = get_literal_value(&left_expr, context)?;
                let right_val = get_literal_value(&right_expr, context)?;

                // Try numeric comparison first
                let left_num = left_val.as_ref().and_then(|s| s.parse::<f64>().ok());
                let right_num = right_val.as_ref().and_then(|s| s.parse::<f64>().ok());

                if let (Some(l), Some(r)) = (left_num, right_num) {
                    let result: Option<String> = match operator {
                        "===" | "==" => Some(format!("{}", l == r)),
                        "!==" | "!=" => Some(format!("{}", l != r)),
                        "<" => Some(format!("{}", l < r)),
                        ">" => Some(format!("{}", l > r)),
                        "<=" => Some(format!("{}", l <= r)),
                        ">=" => Some(format!("{}", l >= r)),
                        "+" => {
                            let res = l + r;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        "-" => {
                            let res = l - r;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        "*" => {
                            let res = l * r;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        "/" if r != 0.0 => {
                            let res = l / r;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        "%" if r != 0.0 => {
                            let res = l % r;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        _ => None,
                    };
                    return result.map(Some);
                }

                // String comparison for === and !==
                if let (Some(l), Some(r)) = (&left_val, &right_val) {
                    match operator {
                        "===" => return Some(Some(format!("{}", l == r))),
                        "!==" => return Some(Some(format!("{}", l != r))),
                        "+" => return Some(Some(format!("{}{}", l, r))),
                        _ => {}
                    }
                }

                None
            }
            "UnaryExpression" => {
                let operator = obj.get("operator").and_then(|v| v.as_str())?;
                let argument = obj.get("argument")?;
                let arg_expr = serde_json::from_value::<Expression>(argument.clone()).ok()?;
                let arg_val = get_literal_value(&arg_expr, context)?;

                match operator {
                    "!" => {
                        // Logical NOT
                        match arg_val.as_deref() {
                            Some("true") => Some(Some("false".to_string())),
                            Some("false") | Some("0") | Some("") | None => {
                                Some(Some("true".to_string()))
                            }
                            Some(s) => {
                                // Any non-empty, non-zero string is truthy
                                if s.parse::<f64>().ok() != Some(0.0) {
                                    Some(Some("false".to_string()))
                                } else {
                                    Some(Some("true".to_string()))
                                }
                            }
                        }
                    }
                    "-" => {
                        let val = arg_val?;
                        let n = val.parse::<f64>().ok()?;
                        let res = -n;
                        if res.fract() == 0.0 {
                            Some(Some(format!("{}", res as i64)))
                        } else {
                            Some(Some(res.to_string()))
                        }
                    }
                    "+" => {
                        let val = arg_val?;
                        let n = val.parse::<f64>().ok()?;
                        if n.fract() == 0.0 {
                            Some(Some(format!("{}", n as i64)))
                        } else {
                            Some(Some(n.to_string()))
                        }
                    }
                    "typeof" => match arg_val.as_deref() {
                        None => Some(Some("undefined".to_string())),
                        Some(s) => {
                            if s == "true" || s == "false" {
                                Some(Some("boolean".to_string()))
                            } else if s.parse::<f64>().is_ok() {
                                Some(Some("number".to_string()))
                            } else {
                                Some(Some("string".to_string()))
                            }
                        }
                    },
                    _ => None,
                }
            }
            _ => None,
        }
    }
}

/// Check if a BUILT JsExpr is guaranteed to be defined (non-null/undefined).
///
/// This evaluates the transformed expression (after build_expression), matching
/// the official Svelte compiler's `scope.evaluate(value).is_defined` behavior.
/// Function calls (like `$.get(index)`) are NOT considered defined because they
/// could theoretically return undefined.
fn is_js_expr_defined(expr: &JsExpr) -> bool {
    match expr {
        JsExpr::Literal(lit) => match lit {
            JsLiteral::Null | JsLiteral::Undefined => false,
            _ => true, // String, Number, Boolean are always defined
        },
        JsExpr::Identifier(_) => false,     // Could be undefined
        JsExpr::Call(_) => false,           // Function calls could return undefined
        JsExpr::TemplateLiteral(_) => true, // Always a string
        JsExpr::Binary(_) => true,          // Always produces a result
        JsExpr::Unary(u) => !matches!(u.operator, JsUnaryOp::Void),
        JsExpr::Logical(log) => {
            // Check both sides
            is_js_expr_defined(&log.left) && is_js_expr_defined(&log.right)
        }
        JsExpr::Conditional(cond) => {
            is_js_expr_defined(&cond.consequent) && is_js_expr_defined(&cond.alternate)
        }
        _ => false,
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

/// Result of analyzing multiple expression properties in a single AST walk.
pub struct ExpressionProperties {
    pub has_state: bool,
    pub has_call: bool,
    pub has_member: bool,
    pub has_await: bool,
}

/// Analyze an expression for reactive state, calls, member expressions, and await
/// expressions in a single pass over the JSON AST.
///
/// This is equivalent to calling `expression_has_reactive_state`, `expression_has_call`,
/// `expression_has_member`, and `expression_has_await` individually, but avoids
/// walking the tree 4 times.
pub fn analyze_expression_properties(
    expr: &crate::ast::js::Expression,
    context: &ComponentContext,
) -> ExpressionProperties {
    let mut props = ExpressionProperties {
        has_state: false,
        has_call: false,
        has_member: false,
        has_await: false,
    };

    {
        let json_value = expr.as_json();
        analyze_props_json(json_value, context, &mut props);
    }

    props
}

/// Internal recursive helper for `analyze_expression_properties`.
///
/// Walks the JSON AST once, setting flags for reactive state, calls, member expressions,
/// and await expressions. Once all flags are set to true, stops recursing (short-circuit).
fn analyze_props_json(
    json_value: &serde_json::Value,
    context: &ComponentContext,
    props: &mut ExpressionProperties,
) {
    // Short-circuit: if all flags are already true, no need to walk further
    if props.has_state && props.has_call && props.has_member && props.has_await {
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
            // has_call: no (identifiers are not calls)
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

            // has_call: check object subtree
            if !props.has_call
                && let Some(object) = obj.get("object")
            {
                props.has_call = has_call_json(object, context);
            }

            // has_await: check object subtree
            if !props.has_await
                && let Some(object) = obj.get("object")
            {
                props.has_await = has_await_json(object);
            }
        }
        "CallExpression" | "TaggedTemplateExpression" => {
            // has_call: use existing logic (involves is_pure + has_reactive_state checks)
            if !props.has_call {
                props.has_call = has_call_json(json_value, context);
            }

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
        "AwaitExpression" => {
            // has_await: always true
            props.has_await = true;
            // has_state: AwaitExpression is always reactive
            props.has_state = true;
            // has_member/has_call: not directly, but don't need to recurse for state/await
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
            // has_state: check right side
            if !props.has_state
                && let Some(right) = obj.get("right")
            {
                props.has_state = has_reactive_state_json(right, context);
            }
            // has_call: check right side
            if !props.has_call
                && let Some(right) = obj.get("right")
            {
                props.has_call = has_call_json(right, context);
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
                    if let Some(prop_obj) = prop.as_object() {
                        if let Some(value) = prop_obj.get("value") {
                            analyze_props_json(value, context, props);
                        }
                        // has_call also checks computed keys
                        if !props.has_call
                            && prop_obj.get("computed").and_then(|v| v.as_bool()) == Some(true)
                            && let Some(key) = prop_obj.get("key")
                            && has_call_json(key, context)
                        {
                            props.has_call = true;
                        }
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
        }
        "Literal" | "BooleanLiteral" | "NumericLiteral" | "StringLiteral" | "NullLiteral"
        | "BigIntLiteral" | "RegExpLiteral" => {
            // No flags to set for literals
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
#[inline]
pub fn expression_has_reactive_state(
    expr: &crate::ast::js::Expression,
    context: &ComponentContext,
) -> bool {
    has_reactive_state_json(expr.as_json(), context)
}

/// Check if an expression is a `$effect.pending()` rune call.
///
/// The official Svelte compiler treats `$effect.pending()` as inherently reactive
/// (has_state = true) in phase 2 analysis, but it does NOT set has_call = true
/// (since the callee is a pure global). This function detects this rune call
/// so the caller can set has_state = true without affecting has_call.
#[inline]
pub fn is_effect_pending_expr(expr: &crate::ast::js::Expression) -> bool {
    let json_value = expr.as_json();
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    if obj.get("type").and_then(|v| v.as_str()) != Some("CallExpression") {
        return false;
    }
    let Some(callee) = obj.get("callee").and_then(|c| c.as_object()) else {
        return false;
    };
    if callee.get("type").and_then(|t| t.as_str()) != Some("MemberExpression") {
        return false;
    }
    if callee.get("computed").and_then(|v| v.as_bool()) == Some(true) {
        return false;
    }
    let is_pending = callee
        .get("property")
        .and_then(|p| p.as_object())
        .is_some_and(|p_obj| {
            p_obj.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                && p_obj.get("name").and_then(|n| n.as_str()) == Some("pending")
        });
    let is_effect_obj = callee
        .get("object")
        .and_then(|o| o.as_object())
        .is_some_and(|o_obj| {
            o_obj.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                && o_obj.get("name").and_then(|n| n.as_str()) == Some("$effect")
        });
    is_pending && is_effect_obj
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
                //
                // EXCEPTION: Derived bindings always have transforms (for $.get() wrapping),
                // but their reactivity depends on whether their dependencies are known constants.
                // For Derived bindings, skip this early return and fall through to the
                // detailed binding kind check below.
                if let Some(transform) = context.state.transform.get(name) {
                    // Check if this is a Derived binding - if so, skip the early return
                    // and fall through to the detailed binding kind check below.
                    let is_derived = context.state.get_binding(name).is_some_and(|b| {
                        matches!(
                            b.kind,
                            crate::compiler::phases::phase2_analyze::scope::BindingKind::Derived
                        )
                    });
                    if !is_derived {
                        // For Template bindings (@const), check if the initial value is known
                        // instead of blindly using transform.is_reactive.
                        // This matches the official Svelte compiler's scope.evaluate() behavior.
                        if let Some(binding) = context.state.get_binding(name)
                            && matches!(
                                binding.kind,
                                crate::compiler::phases::phase2_analyze::scope::BindingKind::Template
                            )
                        {
                            if let Some(ref initial_str) = binding.initial
                                && let Ok(initial_json) =
                                    serde_json::from_str::<serde_json::Value>(initial_str)
                            {
                                return !is_expression_known_json(&initial_json, context);
                            }
                            // No initial stored → conservatively treat as reactive
                            return true;
                        }
                        // Use the is_reactive flag from the transform
                        // Non-reactive transforms (like unkeyed each block index) should not be treated as reactive
                        return transform.is_reactive;
                    }
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
                        // If the binding has a stored initial expression (the $derived argument),
                        // parse it as JSON and check if it can be evaluated at compile time.
                        // This approximates scope.evaluate().is_known from the official compiler.
                        if let Some(ref initial_str) = binding.initial
                            && let Ok(initial_json) =
                                serde_json::from_str::<serde_json::Value>(initial_str)
                        {
                            // Check if the expression is "known" (compile-time evaluable)
                            // If known, the derived value is effectively constant → not reactive
                            return !is_expression_known_json(&initial_json, context);
                        }
                        // If no initial or couldn't parse, conservatively treat as reactive
                        return true;
                    }

                    // For Template bindings (@const tag), apply the same scope.evaluate()
                    // logic as Derived bindings. @const values are wrapped in
                    // $.derived_safe_equal() and accessed via $.get(), but their reactivity
                    // depends on whether their initial expression depends on reactive state.
                    // E.g., `@const bar = 'world'` → is_known=true (non-reactive)
                    //        `@const doubled = count * 2` → is_known depends on `count`
                    if matches!(binding.kind, BindingKind::Template) {
                        if let Some(ref initial_str) = binding.initial
                            && let Ok(initial_json) =
                                serde_json::from_str::<serde_json::Value>(initial_str)
                        {
                            return !is_expression_known_json(&initial_json, context);
                        }
                        // If no initial or couldn't parse, conservatively treat as reactive
                        return true;
                    }

                    // For State/RawState bindings in runes mode (immutable=true) with no initial
                    // value (i.e., `$state()` called with no args):
                    // - is_state_source = false (not reassigned)
                    // - initial_is_defined = false (no initial value → compiles to `void 0`)
                    // - The binding effectively compiles to `undefined`, which is a known constant.
                    // → treat as non-reactive (is_known = true).
                    //
                    // Note: We don't apply this for State with an initial value (like
                    // `$state([1,2,3])`) because even when is_state_source=false, the array
                    // is wrapped in $.proxy() and IS reactive through proxy semantics.
                    if matches!(binding.kind, BindingKind::State | BindingKind::RawState)
                        && !binding.initial_is_defined
                    {
                        use crate::compiler::phases::phase3_transform::client::utils::is_state_source;
                        if !is_state_source(binding, context.state.analysis) {
                            return false;
                        }
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
                        //   is_initial_value_literal_or_known handles None → false.
                        let is_known = matches!(
                            binding.declaration_kind,
                            DeclarationKind::Const | DeclarationKind::Let
                        ) && !binding.reassigned
                            && !binding.mutated
                            && is_initial_value_literal_or_known(&binding.initial);

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
    has_call_json(expr.as_json(), context)
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
        "CallExpression" | "TaggedTemplateExpression" => {
            // Match official Svelte compiler: has_call is true when:
            // 1. The callee is not pure (calls local functions), OR
            // 2. The expression has any reactive dependencies (even for pure calls like
            //    JSON.stringify(reactiveVar))
            // We check both: pure call status and whether the entire containing expression
            // has reactive state references.
            if !is_pure_json(json_value, context) {
                return true;
            }
            // For pure calls, check if the expression contains any reactive state references
            // This matches the official `context.state.expression.dependencies.size > 0` check
            has_reactive_state_json(json_value, context)
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
        "AssignmentExpression" => {
            if let Some(right) = obj.get("right") {
                return has_call_json(right, context);
            }
            false
        }
        "SpreadElement" => {
            if let Some(argument) = obj.get("argument") {
                return has_call_json(argument, context);
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
    has_member_json(expr.as_json())
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
    has_await_json(expr.as_json())
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

    // Check for `undefined` identifier in AST JSON form:
    // {"type":"Identifier","name":"undefined",...}
    if s.contains("Identifier") && s.contains("\"undefined\"") {
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

/// Check if a JSON expression is "known" (can be evaluated at compile time).
///
/// This approximates the official Svelte compiler's `scope.evaluate().is_known` check.
/// An expression is "known" if it evaluates to exactly one concrete value at compile time.
///
/// Key differences from `has_reactive_state_json`:
/// - `has_reactive_state_json` checks if identifiers reference reactive bindings
/// - `is_expression_known_json` checks if the expression can be compile-time evaluated
///   (e.g., function calls to local functions are UNKNOWN even if the callee is non-reactive)
fn is_expression_known_json(json_value: &serde_json::Value, context: &ComponentContext) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "Literal" => true,

        "Identifier" => {
            if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                if name == "undefined" {
                    return true;
                }
                if let Some(binding) = context.state.get_binding(name) {
                    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

                    // Props are never known (external values)
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
                        return false;
                    }

                    // Updated bindings are not known
                    if binding.reassigned || binding.mutated {
                        return false;
                    }

                    // For State bindings, check if state source
                    if matches!(binding.kind, BindingKind::State | BindingKind::RawState) {
                        use crate::compiler::phases::phase3_transform::client::utils::is_state_source;
                        if is_state_source(binding, context.state.analysis) {
                            return false;
                        }
                        // Non-state-source with known initial → known
                        return is_initial_value_literal_or_known(&binding.initial);
                    }

                    // For Derived bindings, recursively check the initial
                    if matches!(binding.kind, BindingKind::Derived) {
                        if let Some(ref initial_str) = binding.initial
                            && let Ok(initial_json) =
                                serde_json::from_str::<serde_json::Value>(initial_str)
                        {
                            return is_expression_known_json(&initial_json, context);
                        }
                        return false;
                    }

                    // For Template bindings (@const), recursively check the initial
                    if matches!(binding.kind, BindingKind::Template) {
                        if let Some(ref initial_str) = binding.initial
                            && let Ok(initial_json) =
                                serde_json::from_str::<serde_json::Value>(initial_str)
                        {
                            return is_expression_known_json(&initial_json, context);
                        }
                        return false;
                    }

                    // For Normal bindings: known if never updated with known initial
                    // Functions are always "known" (they're defined)
                    if binding.is_function() {
                        return true;
                    }
                    return is_initial_value_literal_or_known(&binding.initial);
                }
                // Unknown identifier - not known (could be a global)
                false
            } else {
                false
            }
        }

        "BinaryExpression" => {
            // Both operands must be known
            if let (Some(left), Some(right)) = (obj.get("left"), obj.get("right")) {
                is_expression_known_json(left, context) && is_expression_known_json(right, context)
            } else {
                false
            }
        }

        "UnaryExpression" => {
            if let Some(arg) = obj.get("argument") {
                is_expression_known_json(arg, context)
            } else {
                false
            }
        }

        "ConditionalExpression" => {
            // All three parts must be known
            if let (Some(test), Some(consequent), Some(alternate)) =
                (obj.get("test"), obj.get("consequent"), obj.get("alternate"))
            {
                is_expression_known_json(test, context)
                    && is_expression_known_json(consequent, context)
                    && is_expression_known_json(alternate, context)
            } else {
                false
            }
        }

        "TemplateLiteral" => {
            // Known only if all expressions are known
            if let Some(expressions) = obj.get("expressions").and_then(|e| e.as_array()) {
                expressions
                    .iter()
                    .all(|e| is_expression_known_json(e, context))
            } else {
                true // No expressions = just a string
            }
        }

        // Function calls are generally NOT known (can't evaluate at compile time)
        // except for some pure global functions
        "CallExpression" => false,

        // Arrow/function expressions are "known" (they evaluate to a function)
        "ArrowFunctionExpression" | "FunctionExpression" => true,

        // Member expressions are generally not known
        "MemberExpression" => false,

        // Default: not known
        _ => false,
    }
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
