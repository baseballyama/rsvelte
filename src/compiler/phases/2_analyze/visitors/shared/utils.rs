//! General utility functions for visitors.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/utils.js`.

use super::super::super::{Binding, BindingKind, DeclarationKind, Scope, errors, warnings};
use super::super::{AnalysisError, VisitorContext};
use crate::ast::template::{Fragment, TemplateNode};
use crate::ast::typed_expr::{JsNode, LiteralValue};
use lazy_static::lazy_static;
use regex::Regex;
use serde_json::Value;

lazy_static! {
    /// Regular expression for illegal attribute characters.
    ///
    /// Pattern: /^[0-9-.]|[\^$@%&#?!|()[\]{}^*+~;]/
    /// - Matches if name starts with digit, hyphen, or dot
    /// - Or contains any of: ^$@%&#?!|()[]{}*+~;
    ///
    /// Corresponds to `regex_illegal_attribute_character` in patterns.js.
    pub static ref REGEX_ILLEGAL_ATTRIBUTE_CHARACTER: Regex =
        Regex::new(r"(^[0-9\-.])|([\^$@%&#?!|()\[\]{}*+~;])").unwrap();
}

/// Check if there's a variable declaration for the given name in the current function's
/// scope chain by looking at the JS AST path.
///
/// This walks the js_path looking for FunctionDeclaration/FunctionExpression/ArrowFunctionExpression
/// nodes and checks if their bodies contain a VariableDeclaration with the given name.
///
/// This is used to detect if a component-level constant is being shadowed by a local variable.
fn has_shadowing_declaration_in_path(js_path: &[super::super::JsPathEntry], name: &str) -> bool {
    // Walk the path from innermost to outermost
    for node in js_path.iter().rev() {
        let node_type = node.get("type").and_then(|t| t.as_str());

        match node_type {
            Some("FunctionDeclaration")
            | Some("FunctionExpression")
            | Some("ArrowFunctionExpression") => {
                // Check if this function declares a variable with the given name
                if let Some(body) = node.get("body")
                    && has_variable_declaration(body, name)
                {
                    return true;
                }
                // Also check function parameters
                if let Some(params) = node.get("params").and_then(|p| p.as_array()) {
                    for param in params {
                        if param_declares_name(param, name) {
                            return true;
                        }
                    }
                }
            }
            _ => {}
        }
    }
    false
}

/// Check if a function body (BlockStatement or Expression) declares a variable with the given name.
fn has_variable_declaration(body: &Value, name: &str) -> bool {
    let body_type = body.get("type").and_then(|t| t.as_str());

    if body_type == Some("BlockStatement") {
        // Check all statements in the body
        if let Some(statements) = body.get("body").and_then(|b| b.as_array()) {
            for stmt in statements {
                if statement_declares_name(stmt, name) {
                    return true;
                }
            }
        }
    }
    // Arrow function with expression body - no variable declarations
    false
}

/// Check if a statement declares a variable with the given name (only let/var, not const).
fn statement_declares_name(stmt: &Value, name: &str) -> bool {
    let stmt_type = stmt.get("type").and_then(|t| t.as_str());

    match stmt_type {
        Some("VariableDeclaration") => {
            // Only check let and var (not const, which shouldn't shadow)
            let kind = stmt.get("kind").and_then(|k| k.as_str());
            if (kind == Some("let") || kind == Some("var"))
                && let Some(decls) = stmt.get("declarations").and_then(|d| d.as_array())
            {
                for decl in decls {
                    if declarator_declares_name(decl, name) {
                        return true;
                    }
                }
            }
        }
        Some("FunctionDeclaration") => {
            // Named function declarations also create bindings
            if let Some(id) = stmt.get("id")
                && let Some(n) = id.get("name").and_then(|n| n.as_str())
                && n == name
            {
                return true;
            }
            // But don't recurse into the function body - that's a different scope
        }
        Some("BlockStatement")
        | Some("IfStatement")
        | Some("ForStatement")
        | Some("ForInStatement")
        | Some("ForOfStatement")
        | Some("WhileStatement")
        | Some("DoWhileStatement")
        | Some("TryStatement")
        | Some("SwitchStatement") => {
            // Check nested statements, but this is a simplified check
            // For proper scoping we'd need to respect block scopes for let/const
            if let Some(body) = stmt.get("body") {
                if let Some(stmts) = body.as_array() {
                    for s in stmts {
                        if statement_declares_name(s, name) {
                            return true;
                        }
                    }
                } else if statement_declares_name(body, name) {
                    return true;
                }
            }
            // For if statements, check consequent and alternate
            if let Some(consequent) = stmt.get("consequent")
                && statement_declares_name(consequent, name)
            {
                return true;
            }
            if let Some(alternate) = stmt.get("alternate")
                && statement_declares_name(alternate, name)
            {
                return true;
            }
            // For try statements, check block, handler, and finalizer
            if let Some(block) = stmt.get("block")
                && statement_declares_name(block, name)
            {
                return true;
            }
            if let Some(handler) = stmt.get("handler")
                && let Some(handler_body) = handler.get("body")
                && statement_declares_name(handler_body, name)
            {
                return true;
            }
            if let Some(finalizer) = stmt.get("finalizer")
                && statement_declares_name(finalizer, name)
            {
                return true;
            }
            // For switch statements, check cases
            if let Some(cases) = stmt.get("cases").and_then(|c| c.as_array()) {
                for case in cases {
                    if let Some(consequent) = case.get("consequent").and_then(|c| c.as_array()) {
                        for s in consequent {
                            if statement_declares_name(s, name) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        _ => {}
    }
    false
}

/// Check if a variable declarator declares a variable with the given name.
fn declarator_declares_name(decl: &Value, name: &str) -> bool {
    if let Some(id) = decl.get("id") {
        return pattern_declares_name(id, name);
    }
    false
}

/// Check if a pattern (Identifier, ObjectPattern, ArrayPattern) declares a variable with the given name.
fn pattern_declares_name(pattern: &Value, name: &str) -> bool {
    let pattern_type = pattern.get("type").and_then(|t| t.as_str());

    match pattern_type {
        Some("Identifier") => pattern.get("name").and_then(|n| n.as_str()) == Some(name),
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    if let Some(value) = prop.get("value")
                        && pattern_declares_name(value, name)
                    {
                        return true;
                    }
                }
            }
            false
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() && pattern_declares_name(elem, name) {
                        return true;
                    }
                }
            }
            false
        }
        Some("AssignmentPattern") => {
            // let { foo = default } = obj; - check the left side
            if let Some(left) = pattern.get("left") {
                return pattern_declares_name(left, name);
            }
            false
        }
        Some("RestElement") => {
            // let [...rest] = arr; - check the argument
            if let Some(argument) = pattern.get("argument") {
                return pattern_declares_name(argument, name);
            }
            false
        }
        _ => false,
    }
}

/// Check if a function parameter declares a variable with the given name.
fn param_declares_name(param: &Value, name: &str) -> bool {
    pattern_declares_name(param, name)
}

/// Get the name from an AST node (Identifier, Literal, or PrivateIdentifier).
///
/// Corresponds to `get_name` in nodes.js.
///
/// # Arguments
///
/// * `node` - The AST node (Identifier, Literal, or PrivateIdentifier)
///
/// # Returns
///
/// The name as a string, or None if the node type is not supported
fn get_name(node: &Value) -> Option<String> {
    match node.get("type").and_then(|t| t.as_str()) {
        Some("Literal") => {
            // Return the literal value as a string
            node.get("value").map(|value| value.to_string())
        }
        Some("PrivateIdentifier") => {
            // Return '#' + name
            node.get("name")
                .and_then(|n| n.as_str())
                .map(|name| format!("#{}", name))
        }
        Some("Identifier") => {
            // Return the identifier name
            node.get("name").and_then(|n| n.as_str()).map(String::from)
        }
        _ => None,
    }
}

/// Get a parent node from the path, handling TypeScript wrapper nodes.
///
/// Corresponds to `get_parent` in utils/ast.js.
///
/// # Arguments
///
/// * `path` - The AST path (stack of nodes)
/// * `at` - The index to access (supports negative indexing)
///
/// # Returns
///
/// The parent node at the given index, skipping TypeScript wrapper nodes
fn get_parent(path: &[super::super::JsPathEntry], at: isize) -> Option<&Value> {
    let len = path.len() as isize;
    let index = if at < 0 { len + at } else { at };

    if index < 0 || index >= len {
        return None;
    }

    let node = &path[index as usize];

    // Skip TypeScript wrapper nodes
    match node.get("type").and_then(|t| t.as_str()) {
        Some("TSNonNullExpression") | Some("TSAsExpression") => {
            // Get the next node in the appropriate direction
            let next_index = if at < 0 { at - 1 } else { at + 1 };
            get_parent(path, next_index)
        }
        _ => Some(node),
    }
}

/// Get the rune name from a CallExpression node.
///
/// Wrapper around the phase 3 get_rune implementation that works with JSON values.
/// Corresponds to `get_rune` in scope.js.
///
/// # Arguments
///
/// * `node` - The CallExpression node
/// * `scope` - The current scope
///
/// # Returns
///
/// The rune name (e.g., "$state", "$derived.by", "$effect.tracking") or None
fn get_rune_from_json(node: &Value, scope: &Scope) -> Option<String> {
    // Check if node is a CallExpression
    if node.get("type").and_then(|t| t.as_str()) != Some("CallExpression") {
        return None;
    }

    let callee = node.get("callee")?;
    let keypath = get_global_keypath(callee, scope)?;

    // Check if it's a valid rune
    if !super::function::is_rune(&keypath) {
        return None;
    }

    Some(keypath)
}

/// Get the global keypath for an expression (e.g., "$state", "$derived.by", "$effect.tracking").
///
/// Corresponds to `get_global_keypath` in scope.js.
///
/// # Arguments
///
/// * `node` - The expression node
/// * `scope` - The current scope
///
/// # Returns
///
/// The keypath string or None if not a global
fn get_global_keypath(node: &Value, scope: &Scope) -> Option<String> {
    let mut n = node;
    // Collect parts in reverse order to avoid repeated format! prepending
    let mut parts: Vec<&str> = Vec::new();

    // Traverse MemberExpression chain
    while n.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        // Must be non-computed
        if n.get("computed").and_then(|c| c.as_bool()).unwrap_or(false) {
            return None;
        }

        // Property must be Identifier
        let property = n.get("property")?;
        if property.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }

        let property_name = property.get("name").and_then(|n| n.as_str())?;
        parts.push(property_name);

        n = n.get("object")?;
    }

    // Handle CallExpression() pattern
    let has_call = n.get("type").and_then(|t| t.as_str()) == Some("CallExpression")
        && n.get("callee")
            .and_then(|c| c.get("type"))
            .and_then(|t| t.as_str())
            == Some("Identifier");
    if has_call {
        n = n.get("callee")?;
    }

    // Must end with an Identifier
    if n.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return None;
    }

    let name = n.get("name").and_then(|n| n.as_str())?;

    // Check if it's shadowed by a local binding
    if scope.declarations.contains_key(name) {
        return None;
    }

    // Build the keypath string
    let mut result = String::with_capacity(name.len() + parts.len() * 8);
    result.push_str(name);
    if has_call {
        result.push_str("()");
    }
    for part in parts.iter().rev() {
        result.push('.');
        result.push_str(part);
    }

    Some(result)
}

/// Validate an assignment or update expression.
///
/// Corresponds to `validate_assignment` in utils.js.
///
/// # Arguments
///
/// * `node` - The assignment/update/bind node
/// * `argument` - The target being assigned to (Pattern or Expression)
/// * `context` - The visitor context
/// * `is_bind_directive` - Whether this is a bind: directive
pub fn validate_assignment(
    argument: &Value,
    context: &VisitorContext,
    is_bind_directive: bool,
) -> Result<(), AnalysisError> {
    // First validate that we're not assigning to constants
    validate_no_const_assignment(argument, context, is_bind_directive)?;

    // Handle Identifier assignments
    if let Some(name) = argument.get("name").and_then(|n| n.as_str()) {
        // Use scope chain lookup to find the binding (respects lexical scoping)
        // This is important for snippet parameters which are declared in child scopes
        let binding_idx = context
            .analysis
            .root
            .get_binding(name, context.scope)
            .or_else(|| {
                // Fallback to searching all scopes when scope tracking isn't available
                // This handles cases like snippet parameters where context.scope may not
                // be properly updated during template analysis
                context.analysis.root.find_binding_any_scope(name)
            });

        if let Some(binding_idx) = binding_idx {
            let binding = &context.analysis.root.bindings[binding_idx];

            // Check for $props.id() assignment
            if context.analysis.runes
                && let Some(ref props_id) = context.analysis.props_id
                && &binding.name == props_id
            {
                return Err(errors::constant_assignment("$props.id()"));
            }

            // Check for each block item assignment (only in runes mode)
            // In legacy mode, binding to each items is allowed
            if context.analysis.runes && binding.kind == BindingKind::EachItem {
                return Err(errors::each_item_invalid_assignment());
            }

            // Check for snippet parameter assignment
            if matches!(binding.kind, BindingKind::SnippetParam) {
                return Err(errors::snippet_parameter_assignment());
            }
        }
    }

    // Handle MemberExpression with 'this' (state field assignments)
    if argument.get("type").and_then(|t| t.as_str()) == Some("MemberExpression")
        && argument
            .get("object")
            .and_then(|o| o.get("type"))
            .and_then(|t| t.as_str())
            == Some("ThisExpression")
    {
        // Get the property name
        let name = if argument
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false)
            && argument
                .get("property")
                .and_then(|p| p.get("type"))
                .and_then(|t| t.as_str())
                != Some("Literal")
        {
            None
        } else {
            argument.get("property").and_then(get_name)
        };

        // Check if this is a state field
        if let Some(ref field_name) = name
            && let Some(field) = context.state_fields.get(field_name)
            && field.node.get("type").and_then(|t| t.as_str()) == Some("AssignmentExpression")
        {
            // Check we're not assigning to a state field before its declaration in the constructor
            // Walk up the path to find if we're in a constructor
            let mut i = context.js_path.len();
            while i > 0 {
                i -= 1;
                let parent = &context.js_path[i];
                let parent_type = parent.get("type").and_then(|t| t.as_str());

                if matches!(
                    parent_type,
                    Some("FunctionDeclaration")
                        | Some("FunctionExpression")
                        | Some("ArrowFunctionExpression")
                ) {
                    // Get the grandparent
                    if let Some(grandparent) = get_parent(&context.js_path, (i as isize) - 1)
                        && grandparent.get("type").and_then(|t| t.as_str())
                            == Some("MethodDefinition")
                        && grandparent.get("kind").and_then(|k| k.as_str()) == Some("constructor")
                    {
                        // We're in a constructor - check if assignment is before field declaration
                        let node_start = argument.get("start").and_then(|s| s.as_u64());
                        let field_start = field.node.get("start").and_then(|s| s.as_u64());

                        if let (Some(node_start), Some(field_start)) = (node_start, field_start)
                            && node_start < field_start
                        {
                            return Err(errors::state_field_invalid_assignment());
                        }
                    }

                    break;
                }
            }
        }
    }

    Ok(())
}

/// Validate that we're not assigning to a constant.
///
/// Corresponds to `validate_no_const_assignment` in utils.js.
///
/// # Arguments
///
/// * `argument` - The target being assigned to
/// * `context` - The visitor context
/// * `is_binding` - Whether this is a bind: directive
pub fn validate_no_const_assignment(
    argument: &Value,
    context: &VisitorContext,
    is_binding: bool,
) -> Result<(), AnalysisError> {
    let arg_type = argument.get("type").and_then(|t| t.as_str());

    match arg_type {
        Some("ArrayPattern") => {
            if let Some(elements) = argument.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        validate_no_const_assignment(element, context, is_binding)?;
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = argument.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if property.get("type").and_then(|t| t.as_str()) == Some("Property")
                        && let Some(value) = property.get("value")
                    {
                        validate_no_const_assignment(value, context, is_binding)?;
                    }
                }
            }
        }
        Some("Identifier") => {
            if let Some(name) = argument.get("name").and_then(|n| n.as_str()) {
                // Use scope chain lookup to find the correct binding
                // This respects lexical scoping - inner bindings shadow outer ones
                //
                // First try current scope, then fall back to instance scope, then root scope
                let binding_idx = context
                    .analysis
                    .root
                    .get_binding(name, context.scope)
                    .or_else(|| {
                        // Fallback to instance scope (template expressions can access instance bindings)
                        let instance_scope_idx = context.analysis.root.instance_scope_index;
                        if instance_scope_idx > 0 {
                            context.analysis.root.get_binding(name, instance_scope_idx)
                        } else {
                            None
                        }
                    })
                    .or_else(|| {
                        // Fallback to root scope declarations
                        context.analysis.root.scope.declarations.get(name).copied()
                    });

                if let Some(idx) = binding_idx {
                    let binding = &context.analysis.root.bindings[idx];

                    // Check for snippet parameter assignment - must come before const check
                    // Corresponds to Svelte's: if (binding?.kind === 'snippet') { e.snippet_parameter_assignment(node); }
                    if binding.kind == BindingKind::SnippetParam {
                        return Err(errors::snippet_parameter_assignment());
                    }

                    // When inside a nested function (function_depth > 1), check if there's
                    // a local binding shadowing this one in the current function's scope chain.
                    //
                    // Our scope tracking doesn't accurately follow function scopes during AST
                    // traversal, so when we look up a binding by name, we might find a
                    // component-level binding when there's actually a function-local binding
                    // that shadows it.
                    //
                    // Example:
                    //   function foo() { let x = 1; x = 2; }  // function-local x
                    //   const x = foo();                       // component-level const x
                    //
                    // When validating `x = 2` inside foo, we find the outer const x, but we
                    // should skip validation because there's a local let x that shadows it.
                    //
                    // We detect this by walking the js_path (AST ancestors) looking for a
                    // function that declares a variable with the same name.
                    if context.function_depth > 1 {
                        // Check if there's a shadowing binding in the current function's scope
                        // by looking for variable declarations in ancestor function bodies.
                        // This handles cases where a const in an outer function is shadowed by
                        // a let/var in a nested loop within the current function.
                        let has_local_shadowing =
                            has_shadowing_declaration_in_path(&context.js_path, name);
                        if has_local_shadowing {
                            // Skip validation - there's a local variable that shadows the const
                            return Ok(());
                        }
                    }

                    if binding.declaration_kind == DeclarationKind::Import
                        || (binding.declaration_kind == DeclarationKind::Const
                            && binding.kind != BindingKind::EachItem)
                    {
                        let thing = if binding.declaration_kind == DeclarationKind::Import {
                            "import"
                        } else {
                            "constant"
                        };

                        if is_binding {
                            return Err(errors::constant_binding(thing));
                        } else {
                            return Err(errors::constant_assignment(thing));
                        }
                    }
                }
            }
        }
        _ => {}
    }

    Ok(())
}

/// Validate that a control flow block opening is correct.
///
/// Corresponds to `validate_opening_tag` in utils.js.
///
/// In legacy mode, whitespace is allowed between `{` and the expected character.
/// In Svelte 5, it must be `{` immediately followed by the expected character.
///
/// # Arguments
///
/// * `start` - Start position of the block
/// * `source` - The source code
/// * `expected` - Expected character after `{`
pub fn validate_opening_tag(
    start: usize,
    source: &str,
    expected: char,
) -> Result<(), AnalysisError> {
    if start + 1 < source.len() {
        let chars: Vec<char> = source[start..].chars().collect();
        if chars.len() > 1 && chars[1] != expected {
            return Err(errors::block_unexpected_character(&expected.to_string()));
        }
    }
    Ok(())
}

/// Validate that a block is not empty (warn if only whitespace).
///
/// Corresponds to `validate_block_not_empty` in utils.js.
///
/// Returns Some(warning) if the block is "empty" (only whitespace), None otherwise.
///
/// # Arguments
///
/// * `fragment` - The fragment to check
pub fn validate_block_not_empty(
    fragment: Option<&Fragment>,
) -> Result<Option<warnings::AnalysisWarning>, AnalysisError> {
    if let Some(fragment) = fragment {
        // If the block has exactly one text node that's only whitespace, warn
        if fragment.nodes.len() == 1
            && let TemplateNode::Text(text) = &fragment.nodes[0]
            && !text.raw.is_empty()
            && text.raw.trim().is_empty()
        {
            return Ok(Some(warnings::block_empty()));
        }
    }
    Ok(None)
}

/// Ensure that a variable declaration doesn't conflict with module imports.
///
/// Corresponds to `ensure_no_module_import_conflict` in utils.js.
///
/// # Arguments
///
/// * `id` - The variable declarator pattern (Identifier, ArrayPattern, ObjectPattern)
/// * `context` - The visitor context
pub fn ensure_no_module_import_conflict(
    node: &Value,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    // Only check in instance script at top-level instance scope
    // Corresponds to: state.ast_type === 'instance' && state.scope === state.analysis.instance.scope
    // Instance script starts at function_depth 1, nested functions are >= 2
    if !matches!(context.ast_type, super::super::AstType::Instance) || context.function_depth != 1 {
        return Ok(());
    }

    // Extract identifiers from the pattern
    let id = node.get("id").unwrap_or(node);
    let identifiers = extract_identifiers(id);

    for name in identifiers {
        // Check if this name conflicts with a module import
        if context
            .analysis
            .module_scope_declarations
            .contains_key(&name)
        {
            return Err(errors::declaration_duplicate_module_import());
        }
    }

    Ok(())
}

/// Extract all identifier names from a pattern.
pub fn extract_identifiers(pattern: &Value) -> Vec<String> {
    let mut names = Vec::new();

    match pattern.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        names.extend(extract_identifiers(element));
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if let Some(value) = property.get("value") {
                        names.extend(extract_identifiers(value));
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                names.extend(extract_identifiers(left));
            }
        }
        Some("RestElement") => {
            if let Some(argument) = pattern.get("argument") {
                names.extend(extract_identifiers(argument));
            }
        }
        _ => {}
    }

    names
}

/// Check if an identifier expression is "safe" (doesn't require component context).
///
/// Corresponds to `is_safe_identifier` in utils.js.
///
/// A "safe" identifier means the `foo` in `foo.bar` or `foo()` will not call
/// functions that require component context to exist.
///
/// # Arguments
///
/// * `expression` - The expression to check
/// * `context` - The visitor context
pub fn is_safe_identifier(expression: &Value, context: &VisitorContext) -> bool {
    // Navigate to the base identifier through MemberExpression chain
    let mut node = expression;
    while node.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if let Some(object) = node.get("object") {
            node = object;
        } else {
            break;
        }
    }

    // Must be an Identifier at the base
    if node.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return false;
    }

    let name = match node.get("name").and_then(|n| n.as_str()) {
        Some(n) => n,
        None => return false,
    };

    // Look up the binding - use current scope for proper lexical scoping
    // This respects function parameter shadowing: if a function parameter shadows
    // a prop/bindable_prop, we should find the parameter binding (which is safe),
    // not the outer prop binding (which would be unsafe and set needs_context incorrectly).
    // Using get_binding(name, context.scope) walks up the parent chain from the current scope,
    // matching the behavior of Svelte's scope.get(name) in is_safe_identifier.
    let binding_idx = if context.scope > 0 {
        context.analysis.root.get_binding(name, context.scope)
    } else {
        // Fall back to root scope lookup for backward compat
        context.analysis.root.find_binding_any_scope(name)
    };
    let binding = match binding_idx {
        Some(idx) => &context.analysis.root.bindings[idx],
        None => return true, // No binding means it's a global, which is safe
    };

    // Check if it's a store subscription ($store)
    if binding.kind == BindingKind::StoreSub {
        // Recursively check the underlying store (remove $)
        if let Some(store_name) = name.strip_prefix('$')
            && context
                .analysis
                .root
                .scope
                .declarations
                .contains_key(store_name)
        {
            // Create a synthetic identifier for the store
            let store_expr = serde_json::json!({
                "type": "Identifier",
                "name": store_name
            });
            return is_safe_identifier(&store_expr, context);
        }
    }

    // Safe if it's not an import, prop, bindable_prop, or rest_prop
    binding.declaration_kind != DeclarationKind::Import
        && !matches!(
            binding.kind,
            BindingKind::Prop | BindingKind::BindableProp | BindingKind::RestProp
        )
}

/// Check if an expression is pure (has no side effects).
///
/// Corresponds to `is_pure` in utils.js.
///
/// # Arguments
///
/// * `node` - The expression to check
/// * `context` - The visitor context
pub fn is_pure(node: &Value, context: &VisitorContext) -> bool {
    let node_type = match node.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return false,
    };

    // Literals are always pure
    if node_type == "Literal" {
        return true;
    }

    // Check CallExpression
    if node_type == "CallExpression" {
        // Check if callee is pure
        if let Some(callee) = node.get("callee") {
            if !is_pure(callee, context) {
                return false;
            }
        } else {
            return false;
        }

        // Check if all arguments are pure
        if let Some(arguments) = node.get("arguments").and_then(|a| a.as_array()) {
            for arg in arguments {
                let arg_to_check =
                    if arg.get("type").and_then(|t| t.as_str()) == Some("SpreadElement") {
                        arg.get("argument").unwrap_or(arg)
                    } else {
                        arg
                    };

                if !is_pure(arg_to_check, context) {
                    return false;
                }
            }
        }

        return true;
    }

    // Must be Identifier or MemberExpression
    if node_type != "Identifier" && node_type != "MemberExpression" {
        return false;
    }

    // Check if it's $effect.tracking (not pure)
    // Instead of creating a synthetic CallExpression, check the keypath directly
    if let Some(keypath) = get_global_keypath(node, &context.analysis.root.scope)
        && keypath == "$effect.tracking"
    {
        return false;
    }

    // Navigate to the leftmost node
    let mut left = node;
    while left.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if let Some(object) = left.get("object") {
            left = object;
        } else {
            break;
        }
    }

    // Check if base is an Identifier
    if left.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        if let Some(name) = left.get("name").and_then(|n| n.as_str()) {
            // Use find_binding_any_scope to look up bindings in ALL scopes (root + instance + others).
            // This is needed because template expressions may reference variables declared in the
            // instance scope, which is a child of the root scope.
            // The official Svelte compiler uses context.state.scope.get(name) which traverses
            // the full scope chain - we replicate that here by searching all scopes.
            let binding = context.analysis.root.find_binding_any_scope(name);
            if binding.is_none() {
                return true; // Globals are assumed to be safe
            }
        }
    } else if is_pure(left, context) {
        return true;
    }

    false
}

/// Validate an identifier name (check for invalid $ prefixes).
///
/// Corresponds to `validate_identifier_name` in utils.js.
///
/// # Arguments
///
/// * `binding` - The binding to validate
/// * `function_depth` - The current function depth (for legacy mode compatibility)
pub fn validate_identifier_name(
    binding: &Binding,
    function_depth: Option<usize>,
) -> Result<(), AnalysisError> {
    let declaration_kind = binding.declaration_kind;

    // Only validate if not synthetic, param, rest_param, and at appropriate depth
    if declaration_kind != DeclarationKind::Synthetic
        && declaration_kind != DeclarationKind::Param
        && declaration_kind != DeclarationKind::RestParam
        && function_depth.is_none_or(|depth| depth <= 1)
    {
        let name = &binding.name;

        // Check for bare '$'
        if name == "$" {
            return Err(errors::dollar_binding_invalid());
        }

        // Check for names starting with '$'
        if name.starts_with('$') {
            // TODO: Filter out type imports in migration script
            // For now, allow all $ prefixed names
            return Err(errors::dollar_prefix_invalid());
        }
    }

    Ok(())
}

/// Validate an export statement.
///
/// Corresponds to `validate_export` in utils.js.
///
/// Checks that the exported name is not a derived or reassigned state variable.
///
/// # Arguments
///
/// * `name` - The exported name
/// * `context` - The visitor context
pub fn validate_export(name: &str, context: &VisitorContext) -> Result<(), AnalysisError> {
    if let Some(binding_idx) = context.analysis.root.scope.declarations.get(name) {
        let binding = &context.analysis.root.bindings[*binding_idx];

        // Cannot export derived state
        if binding.kind == BindingKind::Derived {
            return Err(errors::derived_invalid_export());
        }

        // Cannot export reassigned state
        if matches!(binding.kind, BindingKind::State | BindingKind::RawState) && binding.reassigned
        {
            return Err(errors::state_invalid_export());
        }
    }

    Ok(())
}

// Utility functions for context checking (already present in the file)

/// Check if the current context is inside a specific block type.
pub fn is_inside_block(context: &VisitorContext, block_type: &str) -> bool {
    context.path.iter().any(|node| {
        matches!(
            (node, block_type),
            (TemplateNode::IfBlock(_), "if")
                | (TemplateNode::EachBlock(_), "each")
                | (TemplateNode::AwaitBlock(_), "await")
                | (TemplateNode::KeyBlock(_), "key")
                | (TemplateNode::SnippetBlock(_), "snippet")
        )
    })
}

/// Check if the current context is inside a component.
pub fn is_inside_component(context: &VisitorContext) -> bool {
    context.path.iter().any(|node| {
        matches!(
            node,
            TemplateNode::Component(_)
                | TemplateNode::SvelteComponent(_)
                | TemplateNode::SvelteSelf(_)
        )
    })
}

/// Check if the current context is inside an element.
pub fn is_inside_element(context: &VisitorContext) -> bool {
    context.path.iter().any(|node| {
        matches!(
            node,
            TemplateNode::RegularElement(_) | TemplateNode::SvelteElement(_)
        )
    })
}

/// Get the closest ancestor element name.
pub fn get_closest_element<'a>(context: &'a VisitorContext<'a>) -> Option<&'a str> {
    for node in context.path.iter().rev() {
        if let TemplateNode::RegularElement(element) = node {
            return Some(&element.name);
        }
    }
    None
}

/// Check if a name is a valid JavaScript identifier.
pub fn is_valid_identifier(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }

    let first = name.chars().next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }

    name.chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Check if an element is a void element (self-closing).
pub fn is_void_element(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

/// Check if an element is an SVG element.
pub fn is_svg_element(name: &str) -> bool {
    matches!(
        name,
        "svg"
            | "g"
            | "path"
            | "rect"
            | "circle"
            | "ellipse"
            | "line"
            | "polyline"
            | "polygon"
            | "text"
            | "tspan"
            | "textPath"
            | "image"
            | "use"
            | "defs"
            | "symbol"
            | "clipPath"
            | "mask"
            | "pattern"
            | "marker"
            | "linearGradient"
            | "radialGradient"
            | "stop"
            | "filter"
            | "feBlend"
            | "feColorMatrix"
            | "feComponentTransfer"
            | "feComposite"
            | "feConvolveMatrix"
            | "feDiffuseLighting"
            | "feDisplacementMap"
            | "feFlood"
            | "feGaussianBlur"
            | "feImage"
            | "feMerge"
            | "feMergeNode"
            | "feMorphology"
            | "feOffset"
            | "feSpecularLighting"
            | "feTile"
            | "feTurbulence"
            | "animate"
            | "animateMotion"
            | "animateTransform"
            | "set"
            | "foreignObject"
    )
}

/// Check if an element is a MathML element.
pub fn is_mathml_element(name: &str) -> bool {
    matches!(
        name,
        "math"
            | "mi"
            | "mn"
            | "mo"
            | "ms"
            | "mspace"
            | "mtext"
            | "menclose"
            | "merror"
            | "mfenced"
            | "mfrac"
            | "mpadded"
            | "mphantom"
            | "mroot"
            | "mrow"
            | "msqrt"
            | "mstyle"
            | "mmultiscripts"
            | "mover"
            | "mprescripts"
            | "msub"
            | "msubsup"
            | "msup"
            | "munder"
            | "munderover"
            | "mtable"
            | "mtd"
            | "mtr"
            | "maction"
            | "annotation"
            | "annotation-xml"
            | "semantics"
    )
}

/// Determine whether an AST node is a reference.
///
/// Corresponds to the `is-reference` npm package.
///
/// A reference is an identifier that is being read from (as opposed to written to,
/// or being used as a property key, etc).
///
/// # Arguments
///
/// * `node` - The AST node to check
/// * `parent` - The parent AST node
///
/// # Returns
///
/// `true` if the node is a reference, `false` otherwise
pub fn is_reference(node: &Value, parent: Option<&Value>) -> bool {
    let node_type = node.get("type").and_then(|t| t.as_str());

    // Handle MemberExpression
    if node_type == Some("MemberExpression") {
        let computed = node
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false);
        if !computed && let Some(object) = node.get("object") {
            return is_reference(object, Some(node));
        }
        return false;
    }

    // Only Identifier nodes can be references
    if node_type != Some("Identifier") {
        return false;
    }

    // No parent means it's a reference
    let parent = match parent {
        Some(p) => p,
        None => return true,
    };

    let parent_type = parent.get("type").and_then(|t| t.as_str());

    match parent_type {
        // Disregard `bar` in `foo.bar`
        Some("MemberExpression") => {
            let computed = parent
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed {
                return true;
            }
            // Check if node is the object (not the property)
            if let Some(object) = parent.get("object") {
                return nodes_equal(node, object);
            }
            false
        }

        // Disregard the `foo` in `class {foo(){}}` but keep it in `class {[foo](){}}`
        Some("MethodDefinition") => parent
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false),

        // Disregard the `meta` in `import.meta`
        Some("MetaProperty") => {
            if let Some(meta) = parent.get("meta") {
                nodes_equal(meta, node)
            } else {
                false
            }
        }

        // Disregard the `foo` in `class {foo=bar}` but keep it in `class {[foo]=bar}` and `class {bar=foo}`
        Some("PropertyDefinition") => {
            let computed = parent
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed {
                return true;
            }
            // Check if node is the value (not the key)
            if let Some(value) = parent.get("value") {
                return nodes_equal(node, value);
            }
            false
        }

        // Disregard the `bar` in `{ bar: foo }`, but keep it in `{ [bar]: foo }`
        Some("Property") => {
            let computed = parent
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed {
                return true;
            }
            // Check if node is the value (not the key)
            if let Some(value) = parent.get("value") {
                return nodes_equal(node, value);
            }
            false
        }

        // Disregard the `bar` in `export { foo as bar }` or
        // the foo in `import { foo as bar }`
        Some("ExportSpecifier") | Some("ImportSpecifier") => {
            if let Some(local) = parent.get("local") {
                nodes_equal(node, local)
            } else {
                false
            }
        }

        // Disregard the `foo` in `foo: while (...) { ... break foo; ... continue foo;}`
        Some("LabeledStatement") | Some("BreakStatement") | Some("ContinueStatement") => false,

        // Default: it's a reference
        _ => true,
    }
}

/// Check if two JSON AST nodes are equal by comparing their identity.
///
/// This is a simplified version that compares the name field for Identifiers.
fn nodes_equal(a: &Value, b: &Value) -> bool {
    // For simplicity, compare by pointer address if available
    // Otherwise, compare by name for Identifiers
    if let (Some(a_name), Some(b_name)) = (
        a.get("name").and_then(|n| n.as_str()),
        b.get("name").and_then(|n| n.as_str()),
    ) {
        return a_name == b_name;
    }

    // For other nodes, we can't reliably compare equality
    // In the JavaScript version, this uses object reference equality
    false
}

/// Check if an Identifier node is a reference, using typed `JsPathEntry` accessors.
///
/// This is a specialized version of `is_reference` for Identifier nodes that avoids
/// converting `JsPathEntry` to `Value`. It uses `get_type_str()`, `get_field_bool()`,
/// and position-based child field comparison.
///
/// `ident_start` is the `start` position of the Identifier node.
pub fn is_reference_for_identifier_typed(
    ident_start: u32,
    parent: Option<&super::super::JsPathEntry>,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    let parent = match parent {
        Some(p) => p,
        None => return true,
    };

    let parent_type = parent.get_type_str();

    match parent_type {
        // Disregard `bar` in `foo.bar`
        Some("MemberExpression") => {
            let computed = parent.get_field_bool("computed").unwrap_or(false);
            if computed {
                return true;
            }
            // Check if identifier is the object (not the property)
            parent
                .get_child_field_start("object", arena)
                .is_some_and(|obj_start| ident_start == obj_start)
        }

        // Disregard the `foo` in `class {foo(){}}` but keep it in `class {[foo](){}}`
        Some("MethodDefinition") => parent.get_field_bool("computed").unwrap_or(false),

        // Disregard the `meta` in `import.meta`
        Some("MetaProperty") => parent
            .get_child_field_start("meta", arena)
            .is_some_and(|meta_start| ident_start == meta_start),

        // Disregard the `foo` in `class {foo=bar}` but keep in `class {[foo]=bar}` and `class {bar=foo}`
        Some("PropertyDefinition") => {
            let computed = parent.get_field_bool("computed").unwrap_or(false);
            if computed {
                return true;
            }
            // Check if identifier is the value (not the key)
            parent
                .get_child_field_start("value", arena)
                .is_some_and(|val_start| ident_start == val_start)
        }

        // Disregard the `bar` in `{ bar: foo }`, but keep it in `{ [bar]: foo }`
        Some("Property") => {
            let computed = parent.get_field_bool("computed").unwrap_or(false);
            if computed {
                return true;
            }
            // Check if identifier is the value (not the key)
            parent
                .get_child_field_start("value", arena)
                .is_some_and(|val_start| ident_start == val_start)
        }

        // Disregard the `bar` in `export { foo as bar }` or
        // the foo in `import { foo as bar }`
        Some("ExportSpecifier") | Some("ImportSpecifier") => parent
            .get_child_field_start("local", arena)
            .is_some_and(|local_start| ident_start == local_start),

        // Disregard the `foo` in `foo: while (...) { ... break foo; ... continue foo;}`
        Some("LabeledStatement") | Some("BreakStatement") | Some("ContinueStatement") => false,

        // Default: it's a reference
        _ => true,
    }
}

/// Validate an attribute name.
///
/// Checks for:
/// - Invalid characters (numbers/hyphen/dot at start, special chars)
/// - Illegal colons (except XML namespaces and Svelte directives)
///
/// Corresponds to `validate_attribute_name` in shared/attribute.js.
///
/// # Arguments
///
/// * `name` - The attribute name to validate
///
/// # Returns
///
/// Ok if valid, Err with appropriate warning/error otherwise
pub fn validate_attribute_name(
    name: &str,
) -> Result<(), crate::compiler::phases::phase2_analyze::warnings::AnalysisWarning> {
    use crate::compiler::phases::phase2_analyze::warnings;

    // Check for illegal colon (excluding XML namespaces)
    // Svelte directives (on:, bind:, etc.) are not regular attributes,
    // so they won't be validated here
    if name.contains(':')
        && !name.starts_with("xmlns:")
        && !name.starts_with("xlink:")
        && !name.starts_with("xml:")
    {
        return Err(warnings::attribute_illegal_colon());
    }

    Ok(())
}

/// Check if an attribute name contains invalid characters.
///
/// Returns true if the name:
/// - Starts with a digit, hyphen, or dot
/// - Contains special characters: ^$@%&#?!|()[]{}*+~;
///
/// Corresponds to checking `regex_illegal_attribute_character` in element.js.
///
/// # Arguments
///
/// * `name` - The attribute name to check
pub fn is_invalid_attribute_name(name: &str) -> bool {
    REGEX_ILLEGAL_ATTRIBUTE_CHARACTER.is_match(name)
}

/// Extract the identifier name from a parameter node.
///
/// Handles simple identifiers and patterns (extracting the first identifier).
fn extract_identifier_name(param: &Value) -> Option<String> {
    match param.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => param.get("name").and_then(|n| n.as_str()).map(String::from),
        Some("AssignmentPattern") => {
            // Default parameter: param = defaultValue
            if let Some(left) = param.get("left") {
                extract_identifier_name(left)
            } else {
                None
            }
        }
        Some("RestElement") => {
            // Rest parameter: ...param
            if let Some(argument) = param.get("argument") {
                extract_identifier_name(argument)
            } else {
                None
            }
        }
        // For object/array destructuring, we don't extract individual names
        // as they're more complex patterns
        _ => None,
    }
}

/// Collect all identifier names from a pattern (identifier, object, array, rest, assignment).
/// Used to register local variable declarations that shadow outer scope bindings.
fn collect_all_identifier_names_from_pattern(pattern: &Value, names: &mut Vec<String>) {
    match pattern.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    if prop.get("type").and_then(|t| t.as_str()) == Some("RestElement") {
                        if let Some(argument) = prop.get("argument") {
                            collect_all_identifier_names_from_pattern(argument, names);
                        }
                    } else if let Some(value) = prop.get("value") {
                        collect_all_identifier_names_from_pattern(value, names);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        collect_all_identifier_names_from_pattern(elem, names);
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                collect_all_identifier_names_from_pattern(left, names);
            }
        }
        Some("RestElement") => {
            if let Some(argument) = pattern.get("argument") {
                collect_all_identifier_names_from_pattern(argument, names);
            }
        }
        _ => {}
    }
}

/// Get the rune name from a callee expression, if it's a rune call.
///
/// Returns Some(rune_name) for runes like "$state", "$derived", "$state.raw", etc.
/// Returns None if not a rune.
fn get_rune_name(callee: &Value, context: &VisitorContext) -> Option<String> {
    // Handle simple identifier runes like $state, $derived
    if callee.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        if let Some(name) = callee.get("name").and_then(|n| n.as_str()) {
            // Check if it starts with $ and is a known rune
            if super::function::is_rune(name) {
                // Make sure it's not shadowed by a binding
                if !context.analysis.root.scope.declarations.contains_key(name) {
                    return Some(name.to_string());
                }
            }
        }
        return None;
    }

    // Handle member expression runes like $state.raw, $derived.by
    if callee.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        // Must not be computed
        if callee
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false)
        {
            return None;
        }

        // Get the object and property
        let object = callee.get("object")?;
        let property = callee.get("property")?;

        // Object must be an Identifier
        if object.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }

        let obj_name = object.get("name").and_then(|n| n.as_str())?;

        // Property must be an Identifier
        if property.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }

        let prop_name = property.get("name").and_then(|n| n.as_str())?;

        // Form the full rune name
        let full_name = format!("{}.{}", obj_name, prop_name);

        // Check if it's a known rune
        if super::function::is_rune(&full_name) {
            // Make sure the base is not shadowed
            if !context
                .analysis
                .root
                .scope
                .declarations
                .contains_key(obj_name)
            {
                return Some(full_name);
            }
        }
    }

    None
}

/// Visit a JavaScript expression and track identifier references.
///
/// Corresponds to walking expressions in Svelte's utils.js.
///
/// # Arguments
///
/// * `expression` - The JavaScript expression to visit
/// * `context` - The visitor context
/// * `metadata` - Expression metadata to populate
pub fn walk_template_expression(
    expr: &crate::ast::js::Expression,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    match expr {
        crate::ast::js::Expression::Typed(te) => {
            walk_js_expression_node(&te.node, context, metadata)
        }
        _ => walk_js_expression(expr.as_json(), context, metadata),
    }
}

pub fn walk_js_expression(
    expression: &Value,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let expr_type = expression.get("type").and_then(|t| t.as_str());

    match expr_type {
        Some("Identifier") => {
            if let Some(name) = expression.get("name").and_then(|n| n.as_str()) {
                // Handle legacy mode special variables ($$props, $$restProps) early,
                // because these may not have registered bindings in scope.
                // This mirrors the detection in identifier::visit.
                if !context.analysis.runes {
                    if name == "$$props" {
                        context.analysis.uses_props = true;
                    }
                    if name == "$$restProps" {
                        context.analysis.uses_rest_props = true;
                    }
                }
                // $$slots works in both runes and legacy mode
                if name == "$$slots" {
                    context.analysis.uses_slots = true;
                }

                // Check for store scoped subscription errors
                // When we see a $xxx identifier inside a function, check if xxx
                // refers to a locally-scoped variable that shadows an outer store
                //
                // Note: The root.scope.declarations lookup returns the OUTER binding
                // (module/instance scope) due to how declarations are collected.
                // We only error if the only binding for the store name is in a nested scope
                // (scope_index > 1). If there's an outer store binding, the $store reference
                // in the template is valid because it refers to that outer binding.
                // The shadowing check for references INSIDE nested functions is handled by
                // the Identifier visitor with proper context.
                if name.starts_with('$') && !name.starts_with("$$") && name != "$" {
                    let store_name = &name[1..];
                    if !store_name.is_empty()
                        && !super::function::is_rune(name)
                        && context.function_depth > 0
                    {
                        // Check if the store binding is in a nested scope
                        // This catches cases where the ONLY binding for store_name is nested
                        // (e.g., {#each items as item}{$item}{/each} where item is EachItem)
                        if let Some(&binding_idx) =
                            context.analysis.root.scope.declarations.get(store_name)
                        {
                            let binding = &context.analysis.root.bindings[binding_idx];
                            // If the binding's scope_index is > 1 (deeper than instance scope),
                            // AND we're inside that nested scope, it's a shadowing error
                            // Scope 0 = module, Scope 1 = instance, Scope 2+ = nested
                            //
                            // We need to check if we're actually inside the scope where this
                            // binding is declared. function_depth gives us an approximation:
                            // - In template: function_depth = 0
                            // - In event handler (first level function): function_depth = 1
                            // - In nested function: function_depth >= 2
                            // Only error if scope_index > 1 AND we're deep enough to be in that scope
                            if binding.scope_index > 1
                                && binding.scope_index <= context.function_depth + 1
                            {
                                return Err(
                                    super::super::super::errors::store_invalid_scoped_subscription(
                                    ),
                                );
                            }
                        }
                    }
                }

                // Look up binding using proper scope chain traversal.
                // Template expressions can reference variables from the instance scope,
                // each block scopes, or any parent scope. The official Svelte compiler uses
                // context.state.scope.get(name) which traverses the full scope chain.
                // We replicate this by using get_binding with the current scope index.
                if let Some(binding_idx) = context
                    .analysis
                    .root
                    .get_binding(name, context.scope)
                    .or_else(|| context.analysis.root.find_binding_any_scope(name))
                {
                    // Register the template reference on the binding
                    // This is critical for legacy state promotion (promote_legacy_state_bindings)
                    // which checks if bindings have template references to decide whether to
                    // promote Normal bindings to State bindings.
                    let (start, end) = expression
                        .get("start")
                        .and_then(|s| s.as_u64())
                        .zip(expression.get("end").and_then(|e| e.as_u64()))
                        .unwrap_or((0, 0));
                    let is_template_reference =
                        matches!(context.ast_type, super::super::AstType::Template);
                    // Template expression references are not reactive declaration
                    // or style directive references
                    context.analysis.root.bindings[binding_idx].add_reference(
                        start as u32,
                        end as u32,
                        is_template_reference,
                        false,
                        false,
                    );

                    // Mark direct template read when in template scope and not inside a function
                    // This is used by non_reactive_update warning to distinguish direct template
                    // reads from event handler callback reads
                    if is_template_reference && context.function_depth == 0 {
                        context.analysis.root.bindings[binding_idx].has_direct_template_read = true;
                    }

                    let binding = &context.analysis.root.bindings[binding_idx];

                    // Add to references (skip in runes mode - only used by legacy build_expression)
                    if !context.analysis.runes {
                        metadata.references.insert(binding_idx);
                    }

                    // Check if it's state
                    if matches!(
                        binding.kind,
                        BindingKind::State | BindingKind::RawState | BindingKind::Derived
                    ) {
                        metadata.set_has_state(true);
                    }

                    // Add to dependencies
                    metadata.dependencies.insert(binding_idx);
                }
            }
        }
        Some("MemberExpression") => {
            // Set has_member_expression flag.
            // Corresponds to MemberExpression.js line 19:
            //   context.state.expression.has_member_expression = true;
            metadata.set_has_member_expression(true);

            // Set has_state if the member expression is not pure.
            // Corresponds to MemberExpression.js line 20:
            //   context.state.expression.has_state ||= !is_pure(node, context);
            if !is_pure(expression, context) {
                metadata.set_has_state(true);
            }

            // Check if this identifier is "safe" (doesn't require component context)
            // If it's not safe, we need to track that this component needs context
            // Corresponds to MemberExpression.js line 23-24
            if !is_safe_identifier(expression, context) {
                context.analysis.needs_context = true;
            }

            // In non-runes (legacy) mode, $$props and $$restProps member accesses
            // always require component context ($$renderer.component() wrapper).
            // The official Svelte compiler registers $$props/$$restProps as synthetic
            // 'rest_prop' bindings which makes is_safe_identifier return false.
            // We replicate this behavior explicitly since we don't add synthetic bindings.
            if !context.analysis.runes {
                let mut base = expression;
                while base.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
                    if let Some(obj) = base.get("object") {
                        base = obj;
                    } else {
                        break;
                    }
                }
                if base.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
                    let name = base.get("name").and_then(|n| n.as_str()).unwrap_or("");
                    if name == "$$props" || name == "$$restProps" {
                        context.analysis.needs_context = true;
                    }
                }
            }

            // Recursively visit object and property
            if let Some(object) = expression.get("object") {
                walk_js_expression(object, context, metadata)?;
            }
            if let Some(property) = expression.get("property")
                && expression
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false)
            {
                walk_js_expression(property, context, metadata)?;
            }
        }
        Some("CallExpression") => {
            // Check if the callee is safe (doesn't require component context)
            // Corresponds to CallExpression.js line 30-33
            if let Some(callee) = expression.get("callee") {
                // Check if this is a rune call
                let rune_name = get_rune_name(callee, context);

                // Validate rune placement for state/derived runes inside {@const} tags.
                // These runes are always invalid in {@const} context since {@const} is not
                // a proper variable declaration initializer.
                // Other rune validations are handled by call_expression.rs during the script
                // visitor walk.
                if let Some(ref rn) = rune_name
                    && matches!(
                        rn.as_str(),
                        "$state" | "$state.raw" | "$derived" | "$derived.by"
                    )
                    && context.in_const_tag
                {
                    return Err(errors::state_invalid_placement(rn));
                }

                if rune_name.is_none() && !is_safe_identifier(callee, context) {
                    context.analysis.needs_context = true;
                }

                walk_js_expression(callee, context, metadata)?;
            }
            if let Some(arguments) = expression.get("arguments").and_then(|a| a.as_array()) {
                for arg in arguments {
                    walk_js_expression(arg, context, metadata)?;
                }
            }

            // Set has_call and has_state flags after visiting children.
            // Corresponds to CallExpression.js lines 264-273:
            //   if (context.state.expression) {
            //     if (!is_pure(node.callee, context) || context.state.expression.dependencies.size > 0) {
            //       context.state.expression.has_call = true;
            //       context.state.expression.has_state = true;
            //     }
            //   }
            let callee_is_pure = expression
                .get("callee")
                .map(|c| is_pure(c, context))
                .unwrap_or(false);
            if !callee_is_pure || !metadata.dependencies.is_empty() {
                metadata.set_has_call(true);
                metadata.set_has_state(true);
            }
        }
        Some("BinaryExpression") | Some("LogicalExpression") => {
            // Visit left and right
            if let Some(left) = expression.get("left") {
                walk_js_expression(left, context, metadata)?;
            }
            if let Some(right) = expression.get("right") {
                walk_js_expression(right, context, metadata)?;
            }
        }
        Some("UnaryExpression") => {
            // Visit argument
            if let Some(argument) = expression.get("argument") {
                walk_js_expression(argument, context, metadata)?;
            }
        }
        Some("AwaitExpression") => {
            // Mark expression as containing await
            metadata.set_has_await(true);
            // Visit argument
            if let Some(argument) = expression.get("argument") {
                walk_js_expression(argument, context, metadata)?;
            }
        }
        Some("UpdateExpression") => {
            // Validate assignment before visiting argument
            // Use validate_assignment to catch snippet parameter assignments and other errors
            if let Some(argument) = expression.get("argument") {
                validate_assignment(argument, context, false)?;
                walk_js_expression(argument, context, metadata)?;
            }
        }
        Some("ConditionalExpression") => {
            // Visit test, consequent, and alternate
            if let Some(test) = expression.get("test") {
                walk_js_expression(test, context, metadata)?;
            }
            if let Some(consequent) = expression.get("consequent") {
                walk_js_expression(consequent, context, metadata)?;
            }
            if let Some(alternate) = expression.get("alternate") {
                walk_js_expression(alternate, context, metadata)?;
            }
        }
        Some("ArrayExpression") => {
            // Visit elements
            if let Some(elements) = expression.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        walk_js_expression(element, context, metadata)?;
                    }
                }
            }
        }
        Some("ObjectExpression") => {
            // Visit properties
            if let Some(properties) = expression.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if let Some(value) = property.get("value") {
                        walk_js_expression(value, context, metadata)?;
                    }
                    if let Some(key) = property.get("key")
                        && property
                            .get("computed")
                            .and_then(|c| c.as_bool())
                            .unwrap_or(false)
                    {
                        walk_js_expression(key, context, metadata)?;
                    }
                }
            }
        }
        Some("SequenceExpression") => {
            // Visit expressions
            if let Some(expressions) = expression.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    walk_js_expression(expr, context, metadata)?;
                }
            }
        }
        Some("AssignmentExpression") => {
            // Validate assignment before visiting
            // Use validate_assignment to catch snippet parameter assignments and other errors
            if let Some(left) = expression.get("left") {
                validate_assignment(left, context, false)?;
                // Track mutations for all bindings being assigned to
                // This is important for legacy mode state promotion
                super::super::assignment_expression::mark_binding_mutation(left, context);
                walk_js_expression(left, context, metadata)?;
            }
            if let Some(right) = expression.get("right") {
                walk_js_expression(right, context, metadata)?;
            }
            // Mark expression as having assignment
            metadata.set_has_assignment(true);
        }
        Some("ArrowFunctionExpression")
        | Some("FunctionExpression")
        | Some("FunctionDeclaration") => {
            // Increment function depth for nested functions
            // This is important for detecting scoped store subscriptions
            context.function_depth += 1;

            // Save a snapshot of the declarations map before entering the function scope.
            // This ensures that both parameter shadowing AND local variable declarations
            // inside the function body are properly scoped and restored when we exit.
            // Without this, `const bar = baz` inside a callback would permanently
            // shadow the outer `bar` binding in the declarations map.
            let saved_declarations = context.analysis.root.scope.declarations.clone();

            // Create a temporary scope in all_scopes for the function parameters.
            // This ensures that parameter names properly shadow bindings from outer
            // scopes (e.g., each-block items, await-then values) during identifier
            // resolution via get_binding() which traverses all_scopes.
            let saved_scope = context.scope;
            let temp_scope_idx = context.analysis.root.all_scopes.len();
            let temp_scope =
                crate::compiler::phases::phase2_analyze::scope::Scope::new(Some(context.scope));
            context.analysis.root.all_scopes.push(temp_scope);
            context.scope = temp_scope_idx;

            // Extract parameters and register them as temporary scoped bindings
            // This allows us to detect when $store refers to a local parameter
            // AND ensures proper shadowing of outer-scope bindings (each items, etc.)
            if let Some(params) = expression.get("params").and_then(|p| p.as_array()) {
                for param in params {
                    // Collect ALL identifier names from the parameter pattern (including
                    // destructuring patterns like { a, b } or [x, y])
                    let mut param_names = Vec::new();
                    collect_all_identifier_names_from_pattern(param, &mut param_names);

                    for param_name in param_names {
                        // Create a temporary binding for the parameter at non-root scope
                        // We use function_depth + 1 as scope_index so that even the first
                        // level of function nesting (function_depth = 1) creates a binding
                        // with scope_index = 2, which is > 1 (nested scope).
                        // This ensures $store references inside functions that shadow
                        // the store variable will trigger store_invalid_scoped_subscription.
                        let temp_binding_idx = context.analysis.root.bindings.len();
                        let temp_binding =
                            crate::compiler::phases::phase2_analyze::Binding::with_declaration_kind(
                                param_name.clone(),
                                crate::compiler::phases::phase2_analyze::BindingKind::Normal,
                                crate::compiler::phases::phase2_analyze::DeclarationKind::Param,
                                context.function_depth + 1, // +1 ensures first level nesting (depth=1) creates scope_index=2
                            );
                        context.analysis.root.bindings.push(temp_binding);

                        // Add to the temporary scope so get_binding() finds it first
                        context.analysis.root.all_scopes[temp_scope_idx]
                            .declarations
                            .insert(param_name.clone(), temp_binding_idx);

                        // Also add to the root scope declarations for backward compatibility
                        // with $store scoped subscription checks
                        context
                            .analysis
                            .root
                            .scope
                            .declarations
                            .insert(param_name.clone(), temp_binding_idx);
                    }
                }
            }

            // CRITICAL: When entering a function scope, clear the expression context.
            // The official Svelte compiler (2-analyze/visitors/shared/function.js) sets
            // expression: null when entering a function. This means has_call, has_assignment,
            // has_member_expression etc. from inside the function body do NOT propagate to
            // the parent expression metadata.
            // Instead, only references to outer-scope bindings are collected.
            // Reference: svelte/src/compiler/phases/2-analyze/visitors/shared/function.js L19-23
            let saved_expression = context.expression;
            context.expression = None;

            // Visit function body with expression context cleared
            if let Some(body) = expression.get("body") {
                // Use a temporary metadata to capture references from the function body.
                // Only references (not has_call/has_assignment/etc.) are propagated to parent.
                let mut inner_metadata = crate::ast::template::ExpressionMetadata::default();
                walk_js_expression(body, context, &mut inner_metadata)?;

                // Propagate references and dependencies from the inner function to the
                // parent metadata. These represent captured variables from outer scopes.
                // This mirrors the official compiler's function.js which adds references
                // for bindings from outer function depths.
                if !context.analysis.runes {
                    for ref_idx in &inner_metadata.references {
                        metadata.references.insert(*ref_idx);
                    }
                }
                for dep_idx in &inner_metadata.dependencies {
                    metadata.dependencies.insert(*dep_idx);
                }
                // Propagate has_state if the inner function captures state variables
                if inner_metadata.has_state() {
                    metadata.set_has_state(true);
                }
            }

            // Restore expression context
            context.expression = saved_expression;

            // Restore scope
            context.scope = saved_scope;

            // Restore the declarations map to the state before entering this function scope.
            // This undoes both parameter shadows and any local variable declarations
            // that were registered inside the function body.
            context.analysis.root.scope.declarations = saved_declarations;

            // Restore function depth
            context.function_depth -= 1;
        }
        Some("BlockStatement") => {
            // Visit statements in block
            if let Some(body) = expression.get("body").and_then(|b| b.as_array()) {
                for stmt in body {
                    walk_js_statement(stmt, context, metadata)?;
                }
            }
        }
        Some("ExpressionStatement") => {
            // Visit expression
            if let Some(expr) = expression.get("expression") {
                walk_js_expression(expr, context, metadata)?;
            }
        }
        Some("SpreadElement") => {
            // Visit argument (e.g., ...foo => visit foo)
            if let Some(argument) = expression.get("argument") {
                walk_js_expression(argument, context, metadata)?;
            }
        }
        Some("TemplateLiteral") => {
            // Visit template literal expressions (e.g., `hello ${name}`)
            if let Some(expressions) = expression.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    walk_js_expression(expr, context, metadata)?;
                }
            }
        }
        Some("TaggedTemplateExpression") => {
            // Visit tag and quasi (e.g., tag`hello ${name}`)
            if let Some(tag) = expression.get("tag") {
                walk_js_expression(tag, context, metadata)?;
            }
            if let Some(quasi) = expression.get("quasi") {
                walk_js_expression(quasi, context, metadata)?;
            }
        }
        Some("NewExpression") => {
            // Mark that we need context for new expressions
            // Corresponds to NewExpression.js line 14
            context.analysis.needs_context = true;

            // Visit callee and arguments (e.g., new Foo(bar))
            if let Some(callee) = expression.get("callee") {
                walk_js_expression(callee, context, metadata)?;
            }
            if let Some(arguments) = expression.get("arguments").and_then(|a| a.as_array()) {
                for arg in arguments {
                    walk_js_expression(arg, context, metadata)?;
                }
            }
        }
        Some("ChainExpression") => {
            // Visit expression (e.g., a?.b?.c)
            if let Some(expr) = expression.get("expression") {
                walk_js_expression(expr, context, metadata)?;
            }
        }
        // Literals and other leaf nodes - no recursion needed
        _ => {}
    }

    Ok(())
}

/// Visit a JavaScript statement and track identifier references.
///
/// Helper for walk_js_expression when encountering BlockStatement.
pub fn walk_js_statement(
    statement: &Value,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let stmt_type = statement.get("type").and_then(|t| t.as_str());

    match stmt_type {
        Some("ExpressionStatement") => {
            if let Some(expr) = statement.get("expression") {
                walk_js_expression(expr, context, metadata)?;
            }
        }
        Some("ReturnStatement") => {
            if let Some(argument) = statement.get("argument") {
                walk_js_expression(argument, context, metadata)?;
            }
        }
        Some("IfStatement") => {
            if let Some(test) = statement.get("test") {
                walk_js_expression(test, context, metadata)?;
            }
            if let Some(consequent) = statement.get("consequent") {
                walk_js_statement(consequent, context, metadata)?;
            }
            if let Some(alternate) = statement.get("alternate") {
                walk_js_statement(alternate, context, metadata)?;
            }
        }
        Some("BlockStatement") => {
            if let Some(body) = statement.get("body").and_then(|b| b.as_array()) {
                for stmt in body {
                    walk_js_statement(stmt, context, metadata)?;
                }
            }
        }
        Some("VariableDeclaration") => {
            if let Some(declarations) = statement.get("declarations").and_then(|d| d.as_array()) {
                for decl in declarations {
                    // First, walk the init expression (before registering the binding,
                    // since the init can reference the outer binding)
                    if let Some(init) = decl.get("init") {
                        walk_js_expression(init, context, metadata)?;
                    }

                    // Register the declared variable as a temporary binding to shadow
                    // any outer scope binding for subsequent references in the same block.
                    // This prevents e.g. `const bar = baz` inside a function body from
                    // causing the outer `bar` binding to appear in metadata.references
                    // when `bar` is referenced later in the same function.
                    // The parent function/arrow scope cleanup will restore the original
                    // bindings when the function scope ends.
                    if let Some(id) = decl.get("id") {
                        let mut names = Vec::new();
                        collect_all_identifier_names_from_pattern(id, &mut names);
                        for name in names {
                            let temp_binding_idx = context.analysis.root.bindings.len();
                            let temp_binding = crate::compiler::phases::phase2_analyze::Binding::with_declaration_kind(
                                name.clone(),
                                crate::compiler::phases::phase2_analyze::BindingKind::Normal,
                                crate::compiler::phases::phase2_analyze::DeclarationKind::Let,
                                context.function_depth + 1,
                            );
                            context.analysis.root.bindings.push(temp_binding);

                            // Add to the current scope in all_scopes so get_binding()
                            // finds it during scope chain traversal
                            if let Some(scope) =
                                context.analysis.root.all_scopes.get_mut(context.scope)
                            {
                                scope.declarations.insert(name.clone(), temp_binding_idx);
                            }

                            // Also add to root scope declarations for backward compatibility
                            context
                                .analysis
                                .root
                                .scope
                                .declarations
                                .insert(name, temp_binding_idx);
                        }
                    }
                }
            }
        }
        Some("ForStatement") | Some("ForInStatement") | Some("ForOfStatement") => {
            if let Some(body) = statement.get("body") {
                walk_js_statement(body, context, metadata)?;
            }
        }
        Some("WhileStatement") | Some("DoWhileStatement") => {
            if let Some(test) = statement.get("test") {
                walk_js_expression(test, context, metadata)?;
            }
            if let Some(body) = statement.get("body") {
                walk_js_statement(body, context, metadata)?;
            }
        }
        Some("FunctionDeclaration") => {
            // Walk function declarations like function expressions
            // This is needed to validate assignments inside nested functions
            // (e.g., function inner() { foo = 1; } where foo is a const)
            walk_js_expression(statement, context, metadata)?;
        }
        Some("SwitchStatement") => {
            if let Some(discriminant) = statement.get("discriminant") {
                walk_js_expression(discriminant, context, metadata)?;
            }
            if let Some(cases) = statement.get("cases").and_then(|c| c.as_array()) {
                for case in cases {
                    if let Some(test) = case.get("test") {
                        walk_js_expression(test, context, metadata)?;
                    }
                    if let Some(consequent) = case.get("consequent").and_then(|c| c.as_array()) {
                        for stmt in consequent {
                            walk_js_statement(stmt, context, metadata)?;
                        }
                    }
                }
            }
        }
        Some("TryStatement") => {
            if let Some(block) = statement.get("block") {
                walk_js_statement(block, context, metadata)?;
            }
            if let Some(handler) = statement.get("handler")
                && let Some(body) = handler.get("body")
            {
                walk_js_statement(body, context, metadata)?;
            }
            if let Some(finalizer) = statement.get("finalizer") {
                walk_js_statement(finalizer, context, metadata)?;
            }
        }
        _ => {}
    }

    Ok(())
}

/// Extract the object from a member expression chain.
///
/// For `a.b.c`, returns the identifier `a`.
/// For non-member expressions, returns the node itself if it's an Identifier.
///
/// Corresponds to `object` in ast.js.
///
/// # Arguments
///
/// * `expression` - The expression node
///
/// # Returns
///
/// The outermost identifier, or None if not found
pub fn object(expression: &Value) -> Option<Value> {
    let mut current = expression.clone();

    // Walk up the member expression chain
    while current.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if let Some(obj) = current.get("object") {
            current = obj.clone();
        } else {
            break;
        }
    }

    // Return the identifier if found
    if current.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        Some(current)
    } else {
        None
    }
}

// =============================================================================
// JsNode-based helper functions (mirrors of JSON-based functions above)
// =============================================================================

/// JsNode version of `object`. Gets the leftmost identifier name from a MemberExpression chain.
/// Returns None if not found or base is not an Identifier.
pub fn object_node(expression: &JsNode, arena: &crate::ast::arena::ParseArena) -> Option<String> {
    let mut current = expression;
    while let JsNode::MemberExpression { object, .. } = current {
        current = arena.get_js_node(*object);
    }
    if let JsNode::Identifier { name, .. } = current {
        Some(name.to_string())
    } else {
        None
    }
}

/// JsNode version of `get_name`.
/// Extracts the name from an Identifier, PrivateIdentifier, or Literal node.
fn get_name_node(node: &JsNode) -> Option<String> {
    match node {
        JsNode::Literal { value, .. } => match value {
            LiteralValue::String(s) => Some(s.to_string()),
            LiteralValue::Number(n) => Some(n.to_string()),
            LiteralValue::Bool(b) => Some(b.to_string()),
            LiteralValue::Null => Some("null".to_string()),
            LiteralValue::Regex(r) => Some(format!("/{}/{}", r.pattern, r.flags)),
        },
        JsNode::PrivateIdentifier { name, .. } => Some(format!("#{}", name)),
        JsNode::Identifier { name, .. } => Some(name.to_string()),
        JsNode::Raw(value) => get_name(value),
        _ => None,
    }
}

/// JsNode version of `get_global_keypath`.
/// Get the global keypath for an expression (e.g., "$state", "$derived.by", "$effect.tracking").
fn get_global_keypath_node(
    node: &JsNode,
    scope: &Scope,
    arena: &crate::ast::arena::ParseArena,
) -> Option<String> {
    match node {
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            if *computed {
                return None;
            }
            // Property must be Identifier
            let prop_node = arena.get_js_node(*property);
            let property_name = match prop_node {
                JsNode::Identifier { name, .. } => name.as_str(),
                _ => return None,
            };

            // Recurse on object, then append .property
            let obj_node = arena.get_js_node(*object);
            let mut base = get_global_keypath_node(obj_node, scope, arena)?;
            base.push('.');
            base.push_str(property_name);
            Some(base)
        }
        JsNode::CallExpression { callee, .. } => {
            // For CallExpression, check if callee is an Identifier
            if let JsNode::Identifier { name, .. } = arena.get_js_node(*callee) {
                if scope.declarations.contains_key(name.as_str()) {
                    return None;
                }
                let mut result = String::with_capacity(name.len() + 2);
                result.push_str(name);
                result.push_str("()");
                Some(result)
            } else {
                None
            }
        }
        JsNode::Identifier { name, .. } => {
            if scope.declarations.contains_key(name.as_str()) {
                None
            } else {
                Some(name.to_string())
            }
        }
        JsNode::Raw(value) => get_global_keypath(value, scope),
        _ => None,
    }
}

/// JsNode version of `get_rune_from_json`.
/// Get the rune name from a CallExpression node, if it's a rune call.
pub fn get_rune_from_node(
    node: &JsNode,
    scope: &Scope,
    arena: &crate::ast::arena::ParseArena,
) -> Option<String> {
    match node {
        JsNode::CallExpression { callee, .. } => {
            let callee_node = arena.get_js_node(*callee);
            let keypath = get_global_keypath_node(callee_node, scope, arena)?;
            if !super::function::is_rune(&keypath) {
                return None;
            }
            Some(keypath)
        }
        JsNode::Raw(value) => get_rune_from_json(value, scope),
        _ => None,
    }
}

/// JsNode version of `is_pure`.
/// Check if an expression is pure (has no side effects).
pub fn is_pure_node(node: &JsNode, context: &VisitorContext) -> bool {
    let arena = context.parse_arena;
    match node {
        JsNode::Literal { .. } => true,
        JsNode::CallExpression {
            callee, arguments, ..
        } => {
            if !is_pure_node(arena.get_js_node(*callee), context) {
                return false;
            }
            for arg in arena.get_js_children(*arguments) {
                let arg_to_check = match arg {
                    JsNode::SpreadElement { argument, .. } => arena.get_js_node(*argument),
                    other => other,
                };
                if !is_pure_node(arg_to_check, context) {
                    return false;
                }
            }
            true
        }
        JsNode::Identifier { name, .. } => {
            // Check if it's $effect.tracking (not pure) - not applicable for bare Identifier
            // Check if base is a global (no binding means safe)
            let binding = context.analysis.root.find_binding_any_scope(name.as_str());
            binding.is_none()
        }
        JsNode::MemberExpression { object, .. } => {
            // Check if it's $effect.tracking (not pure)
            if let Some(keypath) =
                get_global_keypath_node(node, &context.analysis.root.scope, arena)
                && keypath == "$effect.tracking"
            {
                return false;
            }

            // Navigate to the leftmost node
            let mut left: &JsNode = arena.get_js_node(*object);
            while let JsNode::MemberExpression {
                object: inner_obj, ..
            } = left
            {
                left = arena.get_js_node(*inner_obj);
            }

            if let JsNode::Identifier { name, .. } = left {
                let binding = context.analysis.root.find_binding_any_scope(name.as_str());
                binding.is_none()
            } else {
                is_pure_node(left, context)
            }
        }
        JsNode::Raw(value) => is_pure(value, context),
        _ => false,
    }
}

/// JsNode version of `is_safe_identifier`.
/// Check if an identifier expression is "safe" (doesn't require component context).
pub fn is_safe_identifier_node(expression: &JsNode, context: &VisitorContext) -> bool {
    let arena = context.parse_arena;
    // Navigate to the base identifier through MemberExpression chain
    let mut node = expression;
    while let JsNode::MemberExpression { object, .. } = node {
        node = arena.get_js_node(*object);
    }

    // Must be an Identifier at the base
    let name = match node {
        JsNode::Identifier { name, .. } => name.as_str(),
        JsNode::Raw(value) => return is_safe_identifier(value, context),
        _ => return false,
    };

    // Look up the binding
    let binding_idx = if context.scope > 0 {
        context.analysis.root.get_binding(name, context.scope)
    } else {
        context.analysis.root.find_binding_any_scope(name)
    };
    let binding = match binding_idx {
        Some(idx) => &context.analysis.root.bindings[idx],
        None => return true,
    };

    // Check if it's a store subscription ($store)
    if binding.kind == BindingKind::StoreSub
        && let Some(store_name) = name.strip_prefix('$')
        && context
            .analysis
            .root
            .scope
            .declarations
            .contains_key(store_name)
    {
        let store_expr = serde_json::json!({
            "type": "Identifier",
            "name": store_name
        });
        return is_safe_identifier(&store_expr, context);
    }

    // Safe if it's not an import, prop, bindable_prop, or rest_prop
    binding.declaration_kind != DeclarationKind::Import
        && !matches!(
            binding.kind,
            BindingKind::Prop | BindingKind::BindableProp | BindingKind::RestProp
        )
}

/// JsNode version of `validate_no_const_assignment`.
pub fn validate_no_const_assignment_node(
    argument: &JsNode,
    context: &VisitorContext,
    is_binding: bool,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    match argument {
        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements.iter().flatten() {
                validate_no_const_assignment_node(elem, context, is_binding)?;
            }
        }
        JsNode::ObjectPattern { properties, .. } => {
            for property in arena.get_js_children(*properties) {
                match property {
                    JsNode::Property { value, .. } => {
                        validate_no_const_assignment_node(
                            arena.get_js_node(*value),
                            context,
                            is_binding,
                        )?;
                    }
                    JsNode::RestElement { argument, .. } => {
                        validate_no_const_assignment_node(
                            arena.get_js_node(*argument),
                            context,
                            is_binding,
                        )?;
                    }
                    _ => {}
                }
            }
        }
        JsNode::Identifier { name, .. } => {
            let binding_idx = context
                .analysis
                .root
                .get_binding(name, context.scope)
                .or_else(|| {
                    let instance_scope_idx = context.analysis.root.instance_scope_index;
                    if instance_scope_idx > 0 {
                        context.analysis.root.get_binding(name, instance_scope_idx)
                    } else {
                        None
                    }
                })
                .or_else(|| {
                    context
                        .analysis
                        .root
                        .scope
                        .declarations
                        .get(name.as_str())
                        .copied()
                });

            if let Some(idx) = binding_idx {
                let binding = &context.analysis.root.bindings[idx];

                if binding.kind == BindingKind::SnippetParam {
                    return Err(errors::snippet_parameter_assignment());
                }

                if context.function_depth > 1 {
                    let has_local_shadowing =
                        has_shadowing_declaration_in_path(&context.js_path, name);
                    if has_local_shadowing {
                        return Ok(());
                    }
                }

                if binding.declaration_kind == DeclarationKind::Import
                    || (binding.declaration_kind == DeclarationKind::Const
                        && binding.kind != BindingKind::EachItem)
                {
                    let thing = if binding.declaration_kind == DeclarationKind::Import {
                        "import"
                    } else {
                        "constant"
                    };

                    if is_binding {
                        return Err(errors::constant_binding(thing));
                    } else {
                        return Err(errors::constant_assignment(thing));
                    }
                }
            }
        }
        JsNode::Raw(value) => {
            return validate_no_const_assignment(value, context, is_binding);
        }
        _ => {}
    }

    Ok(())
}

/// JsNode version of `validate_assignment`.
pub fn validate_assignment_node(
    argument: &JsNode,
    context: &VisitorContext,
    is_bind_directive: bool,
) -> Result<(), AnalysisError> {
    validate_no_const_assignment_node(argument, context, is_bind_directive)?;

    // Handle Identifier assignments
    if let Some(name) = argument.name() {
        let binding_idx = context
            .analysis
            .root
            .get_binding(name, context.scope)
            .or_else(|| context.analysis.root.find_binding_any_scope(name));

        if let Some(binding_idx) = binding_idx {
            let binding = &context.analysis.root.bindings[binding_idx];

            if context.analysis.runes
                && let Some(ref props_id) = context.analysis.props_id
                && &binding.name == props_id
            {
                return Err(errors::constant_assignment("$props.id()"));
            }

            if context.analysis.runes && binding.kind == BindingKind::EachItem {
                return Err(errors::each_item_invalid_assignment());
            }

            if matches!(binding.kind, BindingKind::SnippetParam) {
                return Err(errors::snippet_parameter_assignment());
            }
        }
    }

    let arena = context.parse_arena;

    // Handle MemberExpression with 'this' (state field assignments)
    if let JsNode::MemberExpression {
        object,
        property,
        computed,
        ..
    } = argument
        && matches!(arena.get_js_node(*object), JsNode::ThisExpression { .. })
    {
        let prop_node = arena.get_js_node(*property);
        let name = if *computed && !matches!(prop_node, JsNode::Literal { .. }) {
            None
        } else {
            get_name_node(prop_node)
        };

        if let Some(ref field_name) = name
            && let Some(field) = context.state_fields.get(field_name)
            && field.node.get("type").and_then(|t| t.as_str()) == Some("AssignmentExpression")
        {
            let mut i = context.js_path.len();
            while i > 0 {
                i -= 1;
                let parent = &context.js_path[i];
                let parent_type = parent.get("type").and_then(|t| t.as_str());

                if matches!(
                    parent_type,
                    Some("FunctionDeclaration")
                        | Some("FunctionExpression")
                        | Some("ArrowFunctionExpression")
                ) {
                    if let Some(grandparent) = get_parent(&context.js_path, (i as isize) - 1)
                        && grandparent.get("type").and_then(|t| t.as_str())
                            == Some("MethodDefinition")
                        && grandparent.get("kind").and_then(|k| k.as_str()) == Some("constructor")
                    {
                        let node_start = argument.start();
                        let field_start = field
                            .node
                            .get("start")
                            .and_then(|s| s.as_u64())
                            .map(|n| n as u32);

                        if let (Some(ns), Some(fs)) = (node_start, field_start)
                            && ns < fs
                        {
                            return Err(errors::state_field_invalid_assignment());
                        }
                    }
                    break;
                }
            }
        }
    }

    // Handle Raw fallback
    if let JsNode::Raw(value) = argument {
        return validate_assignment(value, context, is_bind_directive);
    }

    Ok(())
}

/// JsNode version of `extract_identifiers`.
/// Extract all identifier names from a pattern.
pub fn extract_identifiers_node(
    pattern: &JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> Vec<String> {
    let mut names = Vec::new();

    match pattern {
        JsNode::Identifier { name, .. } => {
            names.push(name.to_string());
        }
        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements.iter().flatten() {
                names.extend(extract_identifiers_node(elem, arena));
            }
        }
        JsNode::ObjectPattern { properties, .. } => {
            for property in arena.get_js_children(*properties) {
                if let Some(value_id) = property.value_node() {
                    names.extend(extract_identifiers_node(arena.get_js_node(value_id), arena));
                }
                // Handle RestElement in object pattern
                if let JsNode::RestElement { argument, .. } = property {
                    names.extend(extract_identifiers_node(
                        arena.get_js_node(*argument),
                        arena,
                    ));
                }
            }
        }
        JsNode::AssignmentPattern { left, .. } => {
            names.extend(extract_identifiers_node(arena.get_js_node(*left), arena));
        }
        JsNode::RestElement { argument, .. } => {
            names.extend(extract_identifiers_node(
                arena.get_js_node(*argument),
                arena,
            ));
        }
        JsNode::Raw(value) => {
            return extract_identifiers(value);
        }
        _ => {}
    }

    names
}

/// JsNode version of `collect_all_identifier_names_from_pattern`.
/// Collect all identifier names from a pattern (identifier, object, array, rest, assignment).
pub fn collect_all_identifier_names_from_pattern_node(
    pattern: &JsNode,
    names: &mut Vec<String>,
    arena: &crate::ast::arena::ParseArena,
) {
    match pattern {
        JsNode::Identifier { name, .. } => {
            names.push(name.to_string());
        }
        JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                match prop {
                    JsNode::RestElement { argument, .. } => {
                        collect_all_identifier_names_from_pattern_node(
                            arena.get_js_node(*argument),
                            names,
                            arena,
                        );
                    }
                    JsNode::Property { value, .. } => {
                        collect_all_identifier_names_from_pattern_node(
                            arena.get_js_node(*value),
                            names,
                            arena,
                        );
                    }
                    _ => {}
                }
            }
        }
        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements.iter().flatten() {
                collect_all_identifier_names_from_pattern_node(elem, names, arena);
            }
        }
        JsNode::AssignmentPattern { left, .. } => {
            collect_all_identifier_names_from_pattern_node(arena.get_js_node(*left), names, arena);
        }
        JsNode::RestElement { argument, .. } => {
            collect_all_identifier_names_from_pattern_node(
                arena.get_js_node(*argument),
                names,
                arena,
            );
        }
        JsNode::Raw(value) => {
            collect_all_identifier_names_from_pattern(value, names);
        }
        _ => {}
    }
}

/// JsNode version of `get_rune_name`.
/// Get the rune name from a callee expression, if it's a rune call.
fn get_rune_name_node(callee: &JsNode, context: &VisitorContext) -> Option<String> {
    let arena = context.parse_arena;
    match callee {
        JsNode::Identifier { name, .. } => {
            if super::function::is_rune(name)
                && !context
                    .analysis
                    .root
                    .scope
                    .declarations
                    .contains_key(name.as_str())
            {
                return Some(name.to_string());
            }
            None
        }
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            if *computed {
                return None;
            }
            let obj_name = match arena.get_js_node(*object) {
                JsNode::Identifier { name, .. } => name.as_str(),
                _ => return None,
            };
            let prop_name = match arena.get_js_node(*property) {
                JsNode::Identifier { name, .. } => name.as_str(),
                _ => return None,
            };
            let full_name = format!("{}.{}", obj_name, prop_name);
            if super::function::is_rune(&full_name)
                && !context
                    .analysis
                    .root
                    .scope
                    .declarations
                    .contains_key(obj_name)
            {
                return Some(full_name);
            }
            None
        }
        JsNode::Raw(value) => get_rune_name(value, context),
        _ => None,
    }
}

// =============================================================================
// JsNode-based walker functions (WITH Raw fallback fix)
// =============================================================================

/// JsNode version of `walk_js_expression`.
/// Visit a JavaScript expression (typed JsNode) and track identifier references.
///
/// CRITICAL: JsNode::Raw arms fall back to the JSON-based walker, which ensures
/// that nodes stored as raw JSON inside ArrowFunctionExpression bodies (etc.)
/// are still fully walked.
pub fn walk_js_expression_node(
    expression: &JsNode,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    match expression {
        JsNode::Identifier {
            name, start, end, ..
        } => {
            // Handle legacy mode special variables
            if !context.analysis.runes {
                if name == "$$props" {
                    context.analysis.uses_props = true;
                }
                if name == "$$restProps" {
                    context.analysis.uses_rest_props = true;
                }
            }
            if name == "$$slots" {
                context.analysis.uses_slots = true;
            }

            // Bare `$` and `$$xxx` (other than the reserved `$$props` /
            // `$$restProps` / `$$slots`) are illegal as variable names.
            // Mirrors `visit_identifier_inner` for the JS-side identifier
            // visitor, but we re-check here because template
            // ExpressionTags walk straight through `walk_js_expression_node`
            // and never hit the JS identifier visitor.
            if name == "$"
                || (name.starts_with("$$")
                    && name != "$$props"
                    && name != "$$restProps"
                    && name != "$$slots")
            {
                return Err(super::super::super::errors::global_reference_invalid(name));
            }

            // Check for store scoped subscription errors
            if name.starts_with('$') && !name.starts_with("$$") && name != "$" {
                let store_name = &name[1..];
                if !store_name.is_empty()
                    && !super::function::is_rune(name)
                    && context.function_depth > 0
                    && let Some(&binding_idx) =
                        context.analysis.root.scope.declarations.get(store_name)
                {
                    let binding = &context.analysis.root.bindings[binding_idx];
                    if binding.scope_index > 1 && binding.scope_index <= context.function_depth + 1
                    {
                        return Err(
                            super::super::super::errors::store_invalid_scoped_subscription(),
                        );
                    }
                }
            }

            // Look up binding
            if let Some(binding_idx) = context
                .analysis
                .root
                .get_binding(name, context.scope)
                .or_else(|| context.analysis.root.find_binding_any_scope(name))
            {
                let is_template_reference =
                    matches!(context.ast_type, super::super::AstType::Template);
                context.analysis.root.bindings[binding_idx].add_reference(
                    *start,
                    *end,
                    is_template_reference,
                    false,
                    false,
                );

                if is_template_reference && context.function_depth == 0 {
                    context.analysis.root.bindings[binding_idx].has_direct_template_read = true;
                }

                let binding = &context.analysis.root.bindings[binding_idx];
                // Skip references in runes mode - only used by legacy build_expression
                if !context.analysis.runes {
                    metadata.references.insert(binding_idx);
                }

                if matches!(
                    binding.kind,
                    BindingKind::State | BindingKind::RawState | BindingKind::Derived
                ) {
                    metadata.set_has_state(true);
                }

                metadata.dependencies.insert(binding_idx);
            }
        }
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            metadata.set_has_member_expression(true);

            if !is_pure_node(expression, context) {
                metadata.set_has_state(true);
            }

            if !is_safe_identifier_node(expression, context) {
                context.analysis.needs_context = true;
            }

            // Legacy mode $$props/$$restProps check
            if !context.analysis.runes {
                let mut base: &JsNode = expression;
                while let JsNode::MemberExpression { object: obj, .. } = base {
                    base = arena.get_js_node(*obj);
                }
                if let JsNode::Identifier { name, .. } = base
                    && (name == "$$props" || name == "$$restProps")
                {
                    context.analysis.needs_context = true;
                }
            }

            // Recursively visit object and property
            walk_js_expression_node(arena.get_js_node(*object), context, metadata)?;
            if *computed {
                walk_js_expression_node(arena.get_js_node(*property), context, metadata)?;
            }
        }
        JsNode::CallExpression {
            callee, arguments, ..
        } => {
            let callee_node = arena.get_js_node(*callee);
            let rune_name = get_rune_name_node(callee_node, context);

            if let Some(ref rn) = rune_name
                && matches!(
                    rn.as_str(),
                    "$state" | "$state.raw" | "$derived" | "$derived.by"
                )
                && context.in_const_tag
            {
                return Err(errors::state_invalid_placement(rn));
            }

            if rune_name.is_none() && !is_safe_identifier_node(callee_node, context) {
                context.analysis.needs_context = true;
            }

            walk_js_expression_node(callee_node, context, metadata)?;
            for arg in arena.get_js_children(*arguments) {
                walk_js_expression_node(arg, context, metadata)?;
            }

            let callee_is_pure = is_pure_node(callee_node, context);
            if !callee_is_pure || !metadata.dependencies.is_empty() {
                metadata.set_has_call(true);
                metadata.set_has_state(true);
            }
        }
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            walk_js_expression_node(arena.get_js_node(*left), context, metadata)?;
            walk_js_expression_node(arena.get_js_node(*right), context, metadata)?;
        }
        JsNode::UnaryExpression { argument, .. } => {
            walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
        }
        JsNode::AwaitExpression { argument, .. } => {
            metadata.set_has_await(true);
            walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
        }
        JsNode::UpdateExpression { argument, .. } => {
            let arg_node = arena.get_js_node(*argument);
            validate_assignment_node(arg_node, context, false)?;
            walk_js_expression_node(arg_node, context, metadata)?;
        }
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*test), context, metadata)?;
            walk_js_expression_node(arena.get_js_node(*consequent), context, metadata)?;
            walk_js_expression_node(arena.get_js_node(*alternate), context, metadata)?;
        }
        JsNode::ArrayExpression { elements, .. } => {
            for elem in elements.iter().flatten() {
                walk_js_expression_node(elem, context, metadata)?;
            }
        }
        JsNode::ObjectExpression { properties, .. } => {
            for property in arena.get_js_children(*properties) {
                if let Some(value_id) = property.value_node() {
                    walk_js_expression_node(arena.get_js_node(value_id), context, metadata)?;
                }
                if let Some(key_id) = property.key()
                    && property.computed()
                {
                    walk_js_expression_node(arena.get_js_node(key_id), context, metadata)?;
                }
                // Handle SpreadElement in object (rest/spread)
                if let JsNode::SpreadElement { argument, .. } = property {
                    walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
                }
            }
        }
        JsNode::SequenceExpression { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                walk_js_expression_node(expr, context, metadata)?;
            }
        }
        JsNode::AssignmentExpression { left, right, .. } => {
            let left_node = arena.get_js_node(*left);
            let right_node = arena.get_js_node(*right);
            validate_assignment_node(left_node, context, false)?;
            super::super::assignment_expression::mark_binding_mutation_node(left_node, context);
            walk_js_expression_node(left_node, context, metadata)?;
            walk_js_expression_node(right_node, context, metadata)?;
            metadata.set_has_assignment(true);
        }
        JsNode::ArrowFunctionExpression { params, body, .. }
        | JsNode::FunctionExpression {
            params,
            body: Some(body),
            ..
        }
        | JsNode::FunctionDeclaration {
            params,
            body: Some(body),
            ..
        } => {
            context.function_depth += 1;

            let saved_declarations = context.analysis.root.scope.declarations.clone();

            let saved_scope = context.scope;
            let temp_scope_idx = context.analysis.root.all_scopes.len();
            let temp_scope =
                crate::compiler::phases::phase2_analyze::scope::Scope::new(Some(context.scope));
            context.analysis.root.all_scopes.push(temp_scope);
            context.scope = temp_scope_idx;

            // Register parameters
            for param in arena.get_js_children(*params) {
                let mut param_names = Vec::new();
                collect_all_identifier_names_from_pattern_node(param, &mut param_names, arena);

                for param_name in param_names {
                    let temp_binding_idx = context.analysis.root.bindings.len();
                    let temp_binding =
                        crate::compiler::phases::phase2_analyze::Binding::with_declaration_kind(
                            param_name.clone(),
                            crate::compiler::phases::phase2_analyze::BindingKind::Normal,
                            crate::compiler::phases::phase2_analyze::DeclarationKind::Param,
                            context.function_depth + 1,
                        );
                    context.analysis.root.bindings.push(temp_binding);

                    context.analysis.root.all_scopes[temp_scope_idx]
                        .declarations
                        .insert(param_name.clone(), temp_binding_idx);

                    context
                        .analysis
                        .root
                        .scope
                        .declarations
                        .insert(param_name.clone(), temp_binding_idx);
                }
            }

            let saved_expression = context.expression;
            context.expression = None;

            // Visit function body
            let mut inner_metadata = crate::ast::template::ExpressionMetadata::default();
            walk_js_expression_node(arena.get_js_node(*body), context, &mut inner_metadata)?;

            // Propagate references and dependencies
            if !context.analysis.runes {
                for ref_idx in &inner_metadata.references {
                    metadata.references.insert(*ref_idx);
                }
            }
            for dep_idx in &inner_metadata.dependencies {
                metadata.dependencies.insert(*dep_idx);
            }
            if inner_metadata.has_state() {
                metadata.set_has_state(true);
            }

            context.expression = saved_expression;
            context.scope = saved_scope;
            context.analysis.root.scope.declarations = saved_declarations;
            context.function_depth -= 1;
        }
        JsNode::FunctionExpression { body: None, .. }
        | JsNode::FunctionDeclaration { body: None, .. } => {
            // No body - nothing to walk
        }
        JsNode::BlockStatement { body, .. } => {
            for stmt in arena.get_js_children(*body) {
                walk_js_statement_node(stmt, context, metadata)?;
            }
        }
        JsNode::ExpressionStatement {
            expression: expr, ..
        } => {
            walk_js_expression_node(arena.get_js_node(*expr), context, metadata)?;
        }
        JsNode::SpreadElement { argument, .. } => {
            walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
        }
        JsNode::TemplateLiteral { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                walk_js_expression_node(expr, context, metadata)?;
            }
        }
        JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
            walk_js_expression_node(arena.get_js_node(*tag), context, metadata)?;
            walk_js_expression_node(arena.get_js_node(*quasi), context, metadata)?;
        }
        JsNode::NewExpression {
            callee, arguments, ..
        } => {
            context.analysis.needs_context = true;
            walk_js_expression_node(arena.get_js_node(*callee), context, metadata)?;
            for arg in arena.get_js_children(*arguments) {
                walk_js_expression_node(arg, context, metadata)?;
            }
        }
        JsNode::ChainExpression {
            expression: expr, ..
        } => {
            walk_js_expression_node(arena.get_js_node(*expr), context, metadata)?;
        }
        JsNode::ImportExpression { source, .. } => {
            walk_js_expression_node(arena.get_js_node(*source), context, metadata)?;
        }
        JsNode::YieldExpression {
            argument: Some(arg),
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*arg), context, metadata)?;
        }
        JsNode::YieldExpression { argument: None, .. } => {}
        // Raw fallback: delegate to JSON-based walker
        JsNode::Raw(value) => {
            walk_js_expression(value, context, metadata)?;
        }
        // Literals and other leaf nodes - no recursion needed
        _ => {}
    }

    Ok(())
}

/// JsNode version of `walk_js_statement`.
/// Visit a JavaScript statement (typed JsNode) and track identifier references.
///
/// CRITICAL: JsNode::Raw arms fall back to the JSON-based walker.
pub fn walk_js_statement_node(
    statement: &JsNode,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    match statement {
        JsNode::ExpressionStatement { expression, .. } => {
            walk_js_expression_node(arena.get_js_node(*expression), context, metadata)?;
        }
        JsNode::ReturnStatement {
            argument: Some(arg),
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*arg), context, metadata)?;
        }
        JsNode::ReturnStatement { argument: None, .. } => {}
        JsNode::IfStatement {
            test,
            consequent,
            alternate,
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*test), context, metadata)?;
            walk_js_statement_node(arena.get_js_node(*consequent), context, metadata)?;
            if let Some(alt) = alternate {
                walk_js_statement_node(arena.get_js_node(*alt), context, metadata)?;
            }
        }
        JsNode::BlockStatement { body, .. } => {
            for stmt in arena.get_js_children(*body) {
                walk_js_statement_node(stmt, context, metadata)?;
            }
        }
        JsNode::VariableDeclaration { declarations, .. } => {
            for decl in arena.get_js_children(*declarations) {
                // Walk init before registering the binding
                if let Some(init_id) = decl.init() {
                    walk_js_expression_node(arena.get_js_node(init_id), context, metadata)?;
                }

                // Register declared variables as temporary bindings
                if let Some(id_id) = decl.id() {
                    let mut names = Vec::new();
                    collect_all_identifier_names_from_pattern_node(
                        arena.get_js_node(id_id),
                        &mut names,
                        arena,
                    );
                    for name in names {
                        let temp_binding_idx = context.analysis.root.bindings.len();
                        let temp_binding =
                            crate::compiler::phases::phase2_analyze::Binding::with_declaration_kind(
                                name.clone(),
                                crate::compiler::phases::phase2_analyze::BindingKind::Normal,
                                crate::compiler::phases::phase2_analyze::DeclarationKind::Let,
                                context.function_depth + 1,
                            );
                        context.analysis.root.bindings.push(temp_binding);

                        if let Some(scope) = context.analysis.root.all_scopes.get_mut(context.scope)
                        {
                            scope.declarations.insert(name.clone(), temp_binding_idx);
                        }

                        context
                            .analysis
                            .root
                            .scope
                            .declarations
                            .insert(name, temp_binding_idx);
                    }
                }
            }
        }
        JsNode::ForStatement { body, .. }
        | JsNode::ForInStatement { body, .. }
        | JsNode::ForOfStatement { body, .. } => {
            walk_js_statement_node(arena.get_js_node(*body), context, metadata)?;
        }
        JsNode::WhileStatement { test, body, .. } | JsNode::DoWhileStatement { test, body, .. } => {
            walk_js_expression_node(arena.get_js_node(*test), context, metadata)?;
            walk_js_statement_node(arena.get_js_node(*body), context, metadata)?;
        }
        JsNode::FunctionDeclaration { .. } => {
            // Walk function declarations like function expressions
            walk_js_expression_node(statement, context, metadata)?;
        }
        JsNode::SwitchStatement {
            discriminant,
            cases,
            ..
        } => {
            walk_js_expression_node(arena.get_js_node(*discriminant), context, metadata)?;
            for case in arena.get_js_children(*cases) {
                if let Some(test_id) = case.test() {
                    walk_js_expression_node(arena.get_js_node(test_id), context, metadata)?;
                }
                for stmt in arena.get_js_children(case.consequent_stmts()) {
                    walk_js_statement_node(stmt, context, metadata)?;
                }
            }
        }
        JsNode::TryStatement {
            block,
            handler,
            finalizer,
            ..
        } => {
            walk_js_statement_node(arena.get_js_node(*block), context, metadata)?;
            if let Some(handler_id) = handler {
                let handler_node = arena.get_js_node(*handler_id);
                if let Some(body_id) = handler_node.body_node() {
                    walk_js_statement_node(arena.get_js_node(body_id), context, metadata)?;
                }
            }
            if let Some(fin) = finalizer {
                walk_js_statement_node(arena.get_js_node(*fin), context, metadata)?;
            }
        }
        JsNode::ThrowStatement { argument, .. } => {
            walk_js_expression_node(arena.get_js_node(*argument), context, metadata)?;
        }
        // Raw fallback: delegate to JSON-based walker
        JsNode::Raw(value) => {
            walk_js_statement(value, context, metadata)?;
        }
        _ => {}
    }

    Ok(())
}
