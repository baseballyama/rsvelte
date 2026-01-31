//! Utility functions for component transformation.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.

use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

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
    match expr {
        JsExpr::Identifier(name) => {
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
            let transformed_object = apply_transforms_to_expression(&member.object, context);

            let transformed_property = match &member.property {
                JsMemberProperty::Expression(prop_expr) if member.computed => {
                    // For computed properties, also apply transforms
                    JsMemberProperty::Expression(Box::new(apply_transforms_to_expression(
                        prop_expr, context,
                    )))
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

            // Apply transforms to callee and arguments
            let transformed_callee = apply_transforms_to_expression(&call.callee, context);
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
                        apply_transforms_to_expression(arg, context)
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
            let transformed_left = apply_transforms_to_expression(&binary.left, context);
            let transformed_right = apply_transforms_to_expression(&binary.right, context);

            JsExpr::Binary(JsBinaryExpression {
                operator: binary.operator,
                left: Box::new(transformed_left),
                right: Box::new(transformed_right),
            })
        }

        JsExpr::Logical(logical) => {
            let transformed_left = apply_transforms_to_expression(&logical.left, context);
            let transformed_right = apply_transforms_to_expression(&logical.right, context);

            JsExpr::Logical(JsLogicalExpression {
                operator: logical.operator,
                left: Box::new(transformed_left),
                right: Box::new(transformed_right),
            })
        }

        JsExpr::Unary(unary) => {
            let transformed_arg = apply_transforms_to_expression(&unary.argument, context);

            JsExpr::Unary(JsUnaryExpression {
                operator: unary.operator,
                argument: Box::new(transformed_arg),
                prefix: unary.prefix,
            })
        }

        JsExpr::Conditional(cond) => {
            let transformed_test = apply_transforms_to_expression(&cond.test, context);
            let transformed_consequent = apply_transforms_to_expression(&cond.consequent, context);
            let transformed_alternate = apply_transforms_to_expression(&cond.alternate, context);

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
                .map(|elem| {
                    elem.as_ref()
                        .map(|e| apply_transforms_to_expression(e, context))
                })
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
                        let transformed_value = apply_transforms_to_expression(&p.value, context);

                        let transformed_key = match &p.key {
                            JsPropertyKey::Computed(key_expr) => JsPropertyKey::Computed(Box::new(
                                apply_transforms_to_expression(key_expr, context),
                            )),
                            other => other.clone(),
                        };

                        JsObjectMember::Property(JsProperty {
                            key: transformed_key,
                            value: Box::new(transformed_value),
                            kind: p.kind,
                            computed: p.computed,
                            shorthand: p.shorthand,
                        })
                    }
                    JsObjectMember::SpreadElement(spread_expr) => JsObjectMember::SpreadElement(
                        Box::new(apply_transforms_to_expression(spread_expr, context)),
                    ),
                })
                .collect();

            JsExpr::Object(JsObjectExpression {
                properties: transformed_properties,
            })
        }

        JsExpr::Arrow(arrow) => {
            // Transform arrow function bodies - state variable transforms should apply
            // inside inline arrow functions (like event handlers)
            let transformed_body = match &arrow.body {
                JsArrowBody::Expression(expr_box) => JsArrowBody::Expression(Box::new(
                    apply_transforms_to_expression(expr_box, context),
                )),
                JsArrowBody::Block(block) => {
                    // Transform statements in the block
                    let transformed_body: Vec<JsStatement> = block
                        .body
                        .iter()
                        .map(|stmt| apply_transforms_to_statement(stmt, context))
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
            // Transform function expression bodies
            let transformed_body: Vec<JsStatement> = func
                .body
                .body
                .iter()
                .map(|stmt| apply_transforms_to_statement(stmt, context))
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
            if let JsExpr::Identifier(name) = assign.left.as_ref()
                && let Some(transform) = context.state.transform.get(name)
                && let Some(assign_fn) = transform.assign
            {
                // Transform the right side first
                let transformed_right = apply_transforms_to_expression(&assign.right, context);

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
                // The third parameter (needs_proxy) should be true for:
                // - Object literals
                // - Array literals
                // - Function calls (could return objects)
                // This is because $.set() needs to know if it should proxify the value
                // However, if skip_proxy is set (e.g., for $state.raw), never use proxy
                let needs_proxy = !transform.skip_proxy
                    && matches!(
                        assign.right.as_ref(),
                        JsExpr::Object(_) | JsExpr::Array(_) | JsExpr::Call(_)
                    );

                return assign_fn(JsExpr::Identifier(name.clone()), final_value, needs_proxy);
            }

            // Check for mutation case: when assigning to a member expression where
            // the base object has a mutate transform (e.g., $store.prop = value)
            // This corresponds to the mutation case in AssignmentExpression.js
            if let JsExpr::Member(_) = assign.left.as_ref() {
                // Find the base object of the member expression
                let base_object = get_base_object(assign.left.as_ref());

                if let JsExpr::Identifier(name) = base_object
                    && let Some(transform) = context.state.transform.get(&name)
                    && let Some(mutate_fn) = transform.mutate
                {
                    // DO NOT apply read transforms to the left side here!
                    // The mutate function (e.g., store_sub_mutate) is responsible for
                    // replacing the base identifier with $.untrack($store) as needed.
                    // We only transform the right side of the assignment.
                    let transformed_right = apply_transforms_to_expression(&assign.right, context);

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
            let transformed_right = apply_transforms_to_expression(&assign.right, context);

            // For the left side, only transform if it's a member expression object
            let transformed_left = match assign.left.as_ref() {
                JsExpr::Member(member) => {
                    let transformed_object =
                        apply_transforms_to_expression(&member.object, context);

                    let transformed_property = match &member.property {
                        JsMemberProperty::Expression(prop_expr) if member.computed => {
                            JsMemberProperty::Expression(Box::new(apply_transforms_to_expression(
                                prop_expr, context,
                            )))
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
            let transformed_exprs: Vec<JsExpr> = seq
                .expressions
                .iter()
                .map(|e| apply_transforms_to_expression(e, context))
                .collect();

            JsExpr::Sequence(JsSequenceExpression {
                expressions: transformed_exprs,
            })
        }

        JsExpr::New(new_expr) => {
            let transformed_callee = apply_transforms_to_expression(&new_expr.callee, context);
            let transformed_args: Vec<JsExpr> = new_expr
                .arguments
                .iter()
                .map(|arg| apply_transforms_to_expression(arg, context))
                .collect();

            JsExpr::New(JsNewExpression {
                callee: Box::new(transformed_callee),
                arguments: transformed_args,
            })
        }

        JsExpr::Await(inner) => {
            let transformed = apply_transforms_to_expression(inner, context);
            JsExpr::Await(Box::new(transformed))
        }

        JsExpr::Yield(yield_expr) => {
            let transformed_arg = yield_expr
                .argument
                .as_ref()
                .map(|arg| Box::new(apply_transforms_to_expression(arg, context)));

            JsExpr::Yield(JsYieldExpression {
                argument: transformed_arg,
                delegate: yield_expr.delegate,
            })
        }

        JsExpr::Spread(inner) => {
            let transformed = apply_transforms_to_expression(inner, context);
            JsExpr::Spread(Box::new(transformed))
        }

        JsExpr::Update(update) => {
            // For update expressions, check if the argument has an update transform
            if let JsExpr::Identifier(name) = update.argument.as_ref()
                && let Some(transform) = context.state.transform.get(name)
                && let Some(update_fn) = transform.update
            {
                return update_fn(
                    update.operator,
                    JsExpr::Identifier(name.clone()),
                    update.prefix,
                );
            }
            // Otherwise just transform the argument
            let transformed_arg = apply_transforms_to_expression(&update.argument, context);

            JsExpr::Update(JsUpdateExpression {
                operator: update.operator,
                argument: Box::new(transformed_arg),
                prefix: update.prefix,
            })
        }

        JsExpr::TemplateLiteral(template) => {
            let transformed_exprs: Vec<JsExpr> = template
                .expressions
                .iter()
                .map(|e| apply_transforms_to_expression(e, context))
                .collect();

            JsExpr::TemplateLiteral(JsTemplateLiteral {
                quasis: template.quasis.clone(),
                expressions: transformed_exprs,
            })
        }

        JsExpr::TaggedTemplate(tagged) => {
            // Transform both the tag and the expressions in the quasi
            let transformed_tag = apply_transforms_to_expression(&tagged.tag, context);
            let transformed_exprs: Vec<JsExpr> = tagged
                .quasi
                .expressions
                .iter()
                .map(|e| apply_transforms_to_expression(e, context))
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
/// a state reference as its first argument (e.g., $.set, $.update, $.update_pre).
///
/// These functions should NOT have their first argument transformed with $.get()
/// because they expect the raw state reference, not the value.
fn is_svelte_runtime_set_call(callee: &JsExpr) -> bool {
    // Check for $.set, $.update, $.update_pre patterns
    if let JsExpr::Member(member) = callee
        && let JsExpr::Identifier(obj_name) = member.object.as_ref()
        && obj_name == "$"
        && let JsMemberProperty::Identifier(prop_name) = &member.property
    {
        return matches!(prop_name.as_str(), "set" | "update" | "update_pre");
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
fn apply_transforms_to_statement(stmt: &JsStatement, context: &ComponentContext) -> JsStatement {
    match stmt {
        JsStatement::Expression(expr_stmt) => JsStatement::Expression(JsExpressionStatement {
            expression: Box::new(apply_transforms_to_expression(
                &expr_stmt.expression,
                context,
            )),
        }),

        JsStatement::Return(ret_stmt) => JsStatement::Return(JsReturnStatement {
            argument: ret_stmt
                .argument
                .as_ref()
                .map(|arg| Box::new(apply_transforms_to_expression(arg, context))),
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
                        .map(|init| Box::new(apply_transforms_to_expression(init, context))),
                })
                .collect();

            JsStatement::VariableDeclaration(JsVariableDeclaration {
                kind: var_decl.kind,
                declarations: transformed_declarations,
            })
        }

        JsStatement::If(if_stmt) => JsStatement::If(JsIfStatement {
            test: Box::new(apply_transforms_to_expression(&if_stmt.test, context)),
            consequent: Box::new(apply_transforms_to_statement(&if_stmt.consequent, context)),
            alternate: if_stmt
                .alternate
                .as_ref()
                .map(|alt| Box::new(apply_transforms_to_statement(alt, context))),
        }),

        JsStatement::Block(block) => {
            let transformed_body: Vec<JsStatement> = block
                .body
                .iter()
                .map(|s| apply_transforms_to_statement(s, context))
                .collect();
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
    //
    // Also skip legacy reactivity when experimental.async is enabled, as this uses
    // Svelte 5's reactivity model even for non-runes components.
    if context.state.analysis.runes
        || context.state.analysis.maybe_runes
        || context.state.options.experimental_async
    {
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
    //
    // For now, we look for state getters that were transformed in the expression
    // and extract them as the leading dependencies in the sequence.
    let mut sequence_exprs = Vec::new();

    // Collect state dependencies from the transformed expression
    collect_state_getters(&value, &mut sequence_exprs);

    if sequence_exprs.is_empty() {
        // No state dependencies found, return value as-is
        return value;
    }

    // Wrap the value in $.untrack(() => value)
    let thunk = b::arrow(vec![], value);
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

    let mut expression = b::id(parts[0]);

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

                    // Check if the expression references reactive state, contains calls, or has member expressions
                    let expr_has_state =
                        expression_has_reactive_state(&expr_tag.expression, context);
                    let expr_has_call = expression_has_call(&expr_tag.expression);
                    let expr_has_member = expression_has_member(&expr_tag.expression);

                    // Build the expression with transforms applied (e.g., $.get() wrapping)
                    let mut expr_metadata = ExpressionMetadata::default();
                    expr_metadata.set_has_state(expr_has_state);
                    expr_metadata.set_has_call(expr_has_call);
                    expr_metadata.set_has_member_expression(expr_has_member);

                    let built_expr = build_expression(context, &converted_expr, &expr_metadata);

                    // Memoize if expression contains a call
                    // This matches Svelte's behavior of replacing function calls with $0, $1, etc.
                    let value = context.state.memoizer.add_memoized(
                        built_expr,
                        expr_has_call,
                        false, // has_await
                        false, // memoize_if_state
                        expr_has_state,
                    );

                    // Track if any expression has state or call (need reactive update)
                    if expr_has_state || expr_has_call {
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
fn get_literal_value(
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
                        _ => None,
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
/// - Known non-nullable bindings
fn is_expression_defined(expr: &crate::ast::js::Expression, context: &ComponentContext) -> bool {
    use crate::ast::js::Expression;
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    match expr {
        Expression::Value(json_value) => {
            let Some(obj) = json_value.as_object() else {
                return false;
            };
            let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
                return false;
            };

            match expr_type {
                "Identifier" => {
                    if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                        // First, check if there's a transform with is_defined flag
                        // This is how we track EachIndex within each block scope
                        if let Some(transform) = context.state.transform.get(name)
                            && transform.is_defined
                        {
                            return true;
                        }

                        // Fall back to checking the binding kind
                        if let Some(binding) = context.state.get_binding(name) {
                            // EachIndex is always a number, never null/undefined
                            return matches!(binding.kind, BindingKind::EachIndex);
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
                "BinaryExpression" | "UnaryExpression" => {
                    // Arithmetic operations always produce defined results
                    true
                }
                "TemplateLiteral" => {
                    // Template literals are always strings (defined)
                    true
                }
                _ => false,
            }
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
                    return binding.kind.is_reactive();
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

            // For non-pure functions (user-defined), assume the result could be reactive
            // because the function may return values derived from reactive state
            true
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
        "Literal" => {
            // Literals are never reactive
            false
        }
        _ => {
            // Unknown expression type - conservatively assume non-reactive
            false
        }
    }
}

/// Check if an expression contains a function call.
///
/// Returns true if the expression contains a CallExpression at any level.
#[inline]
pub fn expression_has_call(expr: &crate::ast::js::Expression) -> bool {
    use crate::ast::js::Expression;

    match expr {
        Expression::Value(json_value) => has_call_json(json_value),
    }
}

/// Internal helper that processes JSON values directly, avoiding serde_json::from_value overhead.
#[inline]
fn has_call_json(json_value: &serde_json::Value) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "CallExpression" => true,
        "MemberExpression" => {
            if let Some(object) = obj.get("object") {
                return has_call_json(object);
            }
            false
        }
        "BinaryExpression" | "LogicalExpression" => {
            if let Some(left) = obj.get("left")
                && has_call_json(left)
            {
                return true;
            }
            if let Some(right) = obj.get("right")
                && has_call_json(right)
            {
                return true;
            }
            false
        }
        "UnaryExpression" => {
            if let Some(argument) = obj.get("argument") {
                return has_call_json(argument);
            }
            false
        }
        "ConditionalExpression" => {
            for field in ["test", "consequent", "alternate"] {
                if let Some(val) = obj.get(field)
                    && has_call_json(val)
                {
                    return true;
                }
            }
            false
        }
        "TemplateLiteral" => {
            if let Some(exprs) = obj.get("expressions").and_then(|v| v.as_array()) {
                for expr_val in exprs {
                    if has_call_json(expr_val) {
                        return true;
                    }
                }
            }
            false
        }
        "ArrayExpression" => {
            if let Some(elements) = obj.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if has_call_json(elem) {
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
                        && has_call_json(value)
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
}
