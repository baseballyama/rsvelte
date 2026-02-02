//! Script visitor for JavaScript AST traversal.
//!
//! This module provides functionality to walk JavaScript AST nodes
//! and build the js_path for proper rune placement validation.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a JavaScript script content.
///
/// This walks the JavaScript AST and calls appropriate visitors for each node type.
///
/// # Arguments
///
/// * `script_ast` - The JavaScript AST (Program node)
/// * `context` - The visitor context
pub fn visit_script(script_ast: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Script content should be a Program node
    if let Some(node_type) = script_ast.get("type").and_then(|t| t.as_str())
        && node_type == "Program"
    {
        // Push Program node to js_path so placement checks can find it
        context.js_path.push(script_ast.clone());

        // Visit the program body
        if let Some(body) = script_ast.get("body").and_then(|b| b.as_array()) {
            for statement in body {
                walk_js_node(statement, context)?;
            }
        }

        // Pop Program node
        context.js_path.pop();
    }

    Ok(())
}

/// Recursively walk JavaScript AST nodes.
///
/// This function pushes the current node to js_path, visits it,
/// and then pops it when done.
///
/// # Arguments
///
/// * `node` - The JavaScript AST node
/// * `context` - The visitor context
pub fn walk_js_node(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let node_type = node.get("type").and_then(|t| t.as_str());

    // Push to JS path
    context.js_path.push(node.clone());

    // Visit specific node types
    match node_type {
        Some("CallExpression") => {
            super::call_expression::visit(node, context)?;
        }
        Some("VariableDeclarator") => {
            super::variable_declarator::visit(node, context)?;
        }
        Some("FunctionDeclaration") => {
            super::function_declaration::visit(node, context)?;
        }
        Some("FunctionExpression") | Some("ArrowFunctionExpression") => {
            super::function_expression::visit(node, context)?;
        }
        Some("ClassDeclaration") => {
            super::class_declaration::visit(node, context)?;
        }
        Some("ClassBody") => {
            super::class_body::visit(node, context)?;
        }
        Some("PropertyDefinition") => {
            super::property_definition::visit(node, context)?;
        }
        Some("AssignmentExpression") => {
            super::assignment_expression::visit(node, context)?;
        }
        Some("AwaitExpression") => {
            super::await_expression::visit(node, context)?;
        }
        Some("ExpressionStatement") => {
            super::expression_statement::visit(node, context)?;
        }
        Some("Identifier") => {
            super::identifier::visit(node, context)?;
        }
        Some("Literal") => {
            super::literal::visit(node, context)?;
        }
        Some("TemplateElement") => {
            super::template_element::visit(node, context)?;
        }
        Some("MemberExpression") => {
            super::member_expression::visit(node, context)?;
        }
        Some("NewExpression") => {
            super::new_expression::visit(node, context)?;
        }
        Some("UpdateExpression") => {
            super::update_expression::visit(node, context)?;
        }
        Some("LabeledStatement") => {
            super::labeled_statement::visit(node, context)?;
        }
        Some("ExportDefaultDeclaration") => {
            super::export_default_declaration::visit(node, context)?;
        }
        Some("ExportNamedDeclaration") => {
            super::export_named_declaration::visit(node, context)?;
        }
        Some("ImportDeclaration") => {
            super::import_declaration::visit(node, context)?;
        }
        _ => {
            // For other node types, just visit their children
        }
    }

    // Visit children (common fields)
    visit_children(node, context)?;

    // Pop from JS path
    context.js_path.pop();

    Ok(())
}

/// Visit common child nodes of a JavaScript AST node.
///
/// This handles common fields like body, expression, arguments, etc.
///
/// # Arguments
///
/// * `node` - The JavaScript AST node
/// * `context` - The visitor context
fn visit_children(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let node_type = node.get("type").and_then(|t| t.as_str());

    // Skip visiting children for certain node types that handle their own traversal
    match node_type {
        Some("CallExpression")
        | Some("VariableDeclarator")
        | Some("FunctionDeclaration")
        | Some("FunctionExpression")
        | Some("ArrowFunctionExpression")
        | Some("ClassDeclaration")
        | Some("ClassBody")
        | Some("PropertyDefinition")
        | Some("AssignmentExpression")
        | Some("AwaitExpression")
        | Some("ExpressionStatement")
        | Some("MemberExpression")
        | Some("NewExpression")
        | Some("UpdateExpression")
        | Some("LabeledStatement")
        | Some("ExportDefaultDeclaration")
        | Some("ExportNamedDeclaration")
        | Some("ImportDeclaration") => {
            // These visitors handle their own child traversal
            return Ok(());
        }
        _ => {}
    }

    // Visit body (array or single node)
    if let Some(body) = node.get("body") {
        if let Some(body_array) = body.as_array() {
            for child in body_array {
                walk_js_node(child, context)?;
            }
        } else {
            walk_js_node(body, context)?;
        }
    }

    // Visit expression
    if let Some(expression) = node.get("expression") {
        walk_js_node(expression, context)?;
    }

    // Visit declarations
    if let Some(declarations) = node.get("declarations").and_then(|d| d.as_array()) {
        for decl in declarations {
            walk_js_node(decl, context)?;
        }
    }

    // Visit arguments
    if let Some(arguments) = node.get("arguments").and_then(|a| a.as_array()) {
        for arg in arguments {
            walk_js_node(arg, context)?;
        }
    }

    // Visit consequent and alternate (if statement)
    if let Some(consequent) = node.get("consequent") {
        walk_js_node(consequent, context)?;
    }
    if let Some(alternate) = node.get("alternate") {
        walk_js_node(alternate, context)?;
    }

    // Visit test (if, while, etc.)
    if let Some(test) = node.get("test") {
        walk_js_node(test, context)?;
    }

    // Visit init, update (for loop)
    if let Some(init) = node.get("init") {
        walk_js_node(init, context)?;
    }
    if let Some(update) = node.get("update") {
        walk_js_node(update, context)?;
    }

    // Visit value (MethodDefinition, Property, etc.)
    if let Some(value) = node.get("value") {
        walk_js_node(value, context)?;
    }

    // Visit key for computed properties
    let computed = node
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);
    if computed && let Some(key) = node.get("key") {
        walk_js_node(key, context)?;
    }

    // Visit properties (ObjectExpression, ObjectPattern)
    if let Some(properties) = node.get("properties").and_then(|p| p.as_array()) {
        for prop in properties {
            walk_js_node(prop, context)?;
        }
    }

    // Visit elements (ArrayExpression, ArrayPattern)
    if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
        for elem in elements {
            if !elem.is_null() {
                walk_js_node(elem, context)?;
            }
        }
    }

    // Visit left and right (BinaryExpression, LogicalExpression, AssignmentExpression)
    if let Some(left) = node.get("left") {
        walk_js_node(left, context)?;
    }
    if let Some(right) = node.get("right") {
        walk_js_node(right, context)?;
    }

    // Visit object and property (MemberExpression)
    // Note: MemberExpression visitor doesn't visit children, so we need to handle it here
    if node_type == Some("MemberExpression") {
        if let Some(object) = node.get("object") {
            walk_js_node(object, context)?;
        }
        if let Some(property) = node.get("property") {
            // Only visit property if computed (dynamic property access)
            if computed {
                walk_js_node(property, context)?;
            }
        }
    }

    // Visit argument (UnaryExpression, UpdateExpression, SpreadElement, etc.)
    if let Some(argument) = node.get("argument") {
        walk_js_node(argument, context)?;
    }

    // Visit expressions (SequenceExpression, TemplateLiteral)
    if let Some(expressions) = node.get("expressions").and_then(|e| e.as_array()) {
        for expr in expressions {
            walk_js_node(expr, context)?;
        }
    }

    // Visit quasis (TemplateLiteral)
    if let Some(quasis) = node.get("quasis").and_then(|q| q.as_array()) {
        for quasi in quasis {
            walk_js_node(quasi, context)?;
        }
    }

    // Visit callee (CallExpression, NewExpression)
    // Note: These should be handled by their own visitors, but add fallback
    if node_type != Some("CallExpression")
        && node_type != Some("NewExpression")
        && let Some(callee) = node.get("callee")
    {
        walk_js_node(callee, context)?;
    }

    // Visit params (FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)
    // Note: Parameters should be in scope, but we need to walk default values
    if let Some(params) = node.get("params").and_then(|p| p.as_array()) {
        for param in params {
            // Walk default values in AssignmentPattern
            if let Some(right) = param.get("right") {
                walk_js_node(right, context)?;
            }
        }
    }

    Ok(())
}
