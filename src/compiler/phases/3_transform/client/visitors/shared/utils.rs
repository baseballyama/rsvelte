//! Utility functions for component transformation.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.

use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use std::collections::HashMap;

/// Build an expression with legacy reactivity handling.
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
/// Returns a transformed expression with reactivity tracking if needed.
pub fn build_expression(
    context: &mut ComponentContext,
    expression: &JsExpr,
    metadata: &ExpressionMetadata,
) -> JsExpr {
    // In runes mode, expressions are already reactive
    if context.state.analysis.runes || context.state.analysis.maybe_runes {
        return expression.clone();
    }

    // Legacy mode: wrap in reactivity tracking if the expression references state
    if metadata.has_state {
        // TODO: Implement legacy reactivity wrapping
        // For now, return the expression as-is
        return expression.clone();
    }

    expression.clone()
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
pub fn add_svelte_meta(
    expression: JsExpr,
    _node: &TemplateNode,
    _block_type: &str,
    _additional: Option<HashMap<String, String>>,
) -> JsStatement {
    // TODO: Check if in dev mode
    // TODO: Get location from node
    // TODO: Wrap in $.add_svelte_meta call

    // For now, just return the expression as a statement
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
/// Wraps statements in a render function for conditional or repeated rendering.
pub fn build_render_statement(statements: Vec<JsStatement>) -> JsExpr {
    b::arrow_block(vec![], statements)
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
