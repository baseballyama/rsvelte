//! Script visitor for JavaScript AST traversal.
//!
//! This module provides functionality to walk JavaScript AST nodes
//! and build the js_path for proper rune placement validation.

use super::VisitorContext;
use crate::ast::js::Expression;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::utils::extract_svelte_ignore;
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
        context.js_path.push(super::JsPathEntry::new(script_ast));

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

    // Process leadingComments for svelte-ignore directives.
    // This mirrors the official Svelte compiler's universal `_` visitor (2-analyze/index.js L117-131)
    // which extracts svelte-ignore codes from JS comments and pushes them to the ignore stack.
    let mut has_ignores = false;
    if let Some(comments) = node.get("leadingComments").and_then(|c| c.as_array()) {
        let mut ignores = Vec::new();
        for comment in comments {
            if let Some(value) = comment.get("value").and_then(|v| v.as_str()) {
                ignores.extend(extract_svelte_ignore(value, context.analysis.runes));
            }
        }
        if !ignores.is_empty() {
            context.push_ignore(ignores);
            has_ignores = true;
        }
    }

    // Push to JS path
    context.js_path.push(super::JsPathEntry::new(node));

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

    // Pop ignores from leadingComments (after visiting children)
    if has_ignores {
        context.pop_ignore();
    }

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

/// Walk a JavaScript expression (typed `&Expression`).
///
/// Convenience function that dispatches to `walk_js_node_typed` for `Typed` expressions
/// and falls back to `walk_js_node` for `Value` expressions.
pub fn walk_expression(
    expr: &Expression,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Always use walk_js_node with the JSON representation for now.
    // walk_js_node_typed is available for future optimization once
    // all individual JS visitors are converted to accept JsNode directly.
    walk_js_node(expr.as_json(), context)
}

/// Recursively walk typed JavaScript AST nodes.
///
/// This is the typed equivalent of `walk_js_node`. It pattern-matches on `JsNode`
/// variants for direct field access instead of doing `serde_json::Value` field lookups.
///
/// For node types with specific visitors, it converts to `&Value` via `to_value()` to
/// call the existing visitor functions. For child traversal, it directly accesses fields.
pub fn walk_js_node_typed(
    node: &JsNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // leadingComments are not stored in JsNode variants (only in Raw/Value),
    // so we skip that processing for typed nodes. The Raw fallback handles it.

    // Convert to Value once. We store it locally so visitors can borrow it
    // independently of `context`, avoiding borrow-checker conflicts.
    let value = node.to_value();

    // Push a borrowed pointer to our local value onto js_path.
    // SAFETY: `value` lives until after the pop at the end of this function.
    context.js_path.push(super::JsPathEntry::new(&value));

    // Visit specific node types by pattern matching.
    // We pass `&value` directly to avoid borrowing from context.js_path.
    match node {
        JsNode::CallExpression { .. } => {
            super::call_expression::visit(&value, context)?;
        }
        JsNode::VariableDeclarator { .. } => {
            super::variable_declarator::visit(&value, context)?;
        }
        JsNode::FunctionDeclaration { .. } => {
            super::function_declaration::visit(&value, context)?;
        }
        JsNode::FunctionExpression { .. } | JsNode::ArrowFunctionExpression { .. } => {
            super::function_expression::visit(&value, context)?;
        }
        JsNode::ClassDeclaration { .. } => {
            super::class_declaration::visit(&value, context)?;
        }
        JsNode::ClassBody { .. } => {
            super::class_body::visit(&value, context)?;
        }
        JsNode::PropertyDefinition { .. } => {
            super::property_definition::visit(&value, context)?;
        }
        JsNode::AssignmentExpression { .. } => {
            super::assignment_expression::visit(&value, context)?;
        }
        JsNode::AwaitExpression { .. } => {
            super::await_expression::visit(&value, context)?;
        }
        JsNode::ExpressionStatement { .. } => {
            super::expression_statement::visit(&value, context)?;
        }
        JsNode::Identifier { .. } => {
            super::identifier::visit(&value, context)?;
        }
        JsNode::Literal { .. } => {
            super::literal::visit(&value, context)?;
        }
        JsNode::TemplateElement { .. } => {
            super::template_element::visit(&value, context)?;
        }
        JsNode::MemberExpression { .. } => {
            super::member_expression::visit(&value, context)?;
        }
        JsNode::NewExpression { .. } => {
            super::new_expression::visit(&value, context)?;
        }
        JsNode::UpdateExpression { .. } => {
            super::update_expression::visit(&value, context)?;
        }
        JsNode::LabeledStatement { .. } => {
            super::labeled_statement::visit(&value, context)?;
        }
        JsNode::ExportDefaultDeclaration { .. } => {
            super::export_default_declaration::visit(&value, context)?;
        }
        JsNode::ExportNamedDeclaration { .. } => {
            super::export_named_declaration::visit(&value, context)?;
        }
        JsNode::ImportDeclaration { .. } => {
            super::import_declaration::visit(&value, context)?;
        }
        _ => {
            // For other node types, just visit their children
        }
    }

    // Visit children using typed traversal
    visit_children_typed(node, context)?;

    // Pop from JS path
    context.js_path.pop();

    Ok(())
}

/// Visit children of a typed JavaScript AST node.
///
/// Uses pattern matching on `JsNode` variants to directly access child fields
/// instead of doing `serde_json::Value` field lookups.
fn visit_children_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    match node {
        // Types that handle their own child traversal
        JsNode::CallExpression { .. }
        | JsNode::VariableDeclarator { .. }
        | JsNode::FunctionDeclaration { .. }
        | JsNode::FunctionExpression { .. }
        | JsNode::ArrowFunctionExpression { .. }
        | JsNode::ClassDeclaration { .. }
        | JsNode::ClassBody { .. }
        | JsNode::PropertyDefinition { .. }
        | JsNode::AssignmentExpression { .. }
        | JsNode::AwaitExpression { .. }
        | JsNode::ExpressionStatement { .. }
        | JsNode::MemberExpression { .. }
        | JsNode::NewExpression { .. }
        | JsNode::UpdateExpression { .. }
        | JsNode::LabeledStatement { .. }
        | JsNode::ExportDefaultDeclaration { .. }
        | JsNode::ExportNamedDeclaration { .. }
        | JsNode::ImportDeclaration { .. } => Ok(()),

        // Block-like with body array
        JsNode::BlockStatement { body, .. }
        | JsNode::Program { body, .. }
        | JsNode::StaticBlock { body, .. } => {
            for child in body {
                walk_js_node_typed(child, context)?;
            }
            Ok(())
        }

        // Binary/Logical: left + right
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            walk_js_node_typed(left, context)?;
            walk_js_node_typed(right, context)?;
            Ok(())
        }

        // Unary: argument
        JsNode::UnaryExpression { argument, .. }
        | JsNode::SpreadElement { argument, .. }
        | JsNode::RestElement { argument, .. } => {
            walk_js_node_typed(argument, context)?;
            Ok(())
        }

        // Conditional: test + consequent + alternate
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            walk_js_node_typed(test, context)?;
            walk_js_node_typed(consequent, context)?;
            walk_js_node_typed(alternate, context)?;
            Ok(())
        }

        // IfStatement
        JsNode::IfStatement {
            test,
            consequent,
            alternate,
            ..
        } => {
            walk_js_node_typed(test, context)?;
            walk_js_node_typed(consequent, context)?;
            if let Some(alt) = alternate {
                walk_js_node_typed(alt, context)?;
            }
            Ok(())
        }

        // Objects: properties
        JsNode::ObjectExpression { properties, .. } | JsNode::ObjectPattern { properties, .. } => {
            for prop in properties {
                walk_js_node_typed(prop, context)?;
            }
            Ok(())
        }

        // ArrayExpression
        JsNode::ArrayExpression { elements, .. } => {
            for e in elements.iter().flatten() {
                walk_js_node_typed(e, context)?;
            }
            Ok(())
        }

        // ArrayPattern
        JsNode::ArrayPattern { elements, .. } => {
            for e in elements.iter().flatten() {
                walk_js_node_typed(e, context)?;
            }
            Ok(())
        }

        // Property: key (if computed) + value
        JsNode::Property {
            key,
            value,
            computed,
            ..
        } => {
            if *computed {
                walk_js_node_typed(key, context)?;
            }
            walk_js_node_typed(value, context)?;
            Ok(())
        }

        // MethodDefinition: key (if computed) + value
        JsNode::MethodDefinition {
            key,
            value,
            computed,
            ..
        } => {
            if *computed {
                walk_js_node_typed(key, context)?;
            }
            walk_js_node_typed(value, context)?;
            Ok(())
        }

        // SequenceExpression: expressions
        JsNode::SequenceExpression { expressions, .. } => {
            for expr in expressions {
                walk_js_node_typed(expr, context)?;
            }
            Ok(())
        }

        // TemplateLiteral: quasis + expressions
        JsNode::TemplateLiteral {
            quasis,
            expressions,
            ..
        } => {
            for quasi in quasis {
                walk_js_node_typed(quasi, context)?;
            }
            for expr in expressions {
                walk_js_node_typed(expr, context)?;
            }
            Ok(())
        }

        // TaggedTemplateExpression: tag + quasi
        JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
            walk_js_node_typed(tag, context)?;
            walk_js_node_typed(quasi, context)?;
            Ok(())
        }

        // ForStatement
        JsNode::ForStatement {
            init,
            test,
            update,
            body,
            ..
        } => {
            if let Some(init) = init {
                walk_js_node_typed(init, context)?;
            }
            if let Some(test) = test {
                walk_js_node_typed(test, context)?;
            }
            if let Some(update) = update {
                walk_js_node_typed(update, context)?;
            }
            walk_js_node_typed(body, context)?;
            Ok(())
        }

        // WhileStatement
        JsNode::WhileStatement { test, body, .. } => {
            walk_js_node_typed(test, context)?;
            walk_js_node_typed(body, context)?;
            Ok(())
        }

        // DoWhileStatement
        JsNode::DoWhileStatement { test, body, .. } => {
            walk_js_node_typed(test, context)?;
            walk_js_node_typed(body, context)?;
            Ok(())
        }

        // ReturnStatement
        JsNode::ReturnStatement { argument, .. } => {
            if let Some(arg) = argument {
                walk_js_node_typed(arg, context)?;
            }
            Ok(())
        }

        // ThrowStatement
        JsNode::ThrowStatement { argument, .. } => {
            walk_js_node_typed(argument, context)?;
            Ok(())
        }

        // VariableDeclaration: declarations
        JsNode::VariableDeclaration { declarations, .. } => {
            for decl in declarations {
                walk_js_node_typed(decl, context)?;
            }
            Ok(())
        }

        // AssignmentPattern: left + right
        JsNode::AssignmentPattern { left, right, .. } => {
            walk_js_node_typed(left, context)?;
            walk_js_node_typed(right, context)?;
            Ok(())
        }

        // ChainExpression
        JsNode::ChainExpression { expression, .. } => {
            walk_js_node_typed(expression, context)?;
            Ok(())
        }

        // ImportExpression
        JsNode::ImportExpression { source, .. } => {
            walk_js_node_typed(source, context)?;
            Ok(())
        }

        // YieldExpression
        JsNode::YieldExpression { argument, .. } => {
            if let Some(arg) = argument {
                walk_js_node_typed(arg, context)?;
            }
            Ok(())
        }

        // ForOfStatement / ForInStatement
        JsNode::ForOfStatement {
            left, right, body, ..
        }
        | JsNode::ForInStatement {
            left, right, body, ..
        } => {
            walk_js_node_typed(left, context)?;
            walk_js_node_typed(right, context)?;
            walk_js_node_typed(body, context)?;
            Ok(())
        }

        // SwitchStatement
        JsNode::SwitchStatement {
            discriminant,
            cases,
            ..
        } => {
            walk_js_node_typed(discriminant, context)?;
            for case in cases {
                walk_js_node_typed(case, context)?;
            }
            Ok(())
        }

        // SwitchCase
        JsNode::SwitchCase {
            test, consequent, ..
        } => {
            if let Some(t) = test {
                walk_js_node_typed(t, context)?;
            }
            for stmt in consequent {
                walk_js_node_typed(stmt, context)?;
            }
            Ok(())
        }

        // TryStatement
        JsNode::TryStatement {
            block,
            handler,
            finalizer,
            ..
        } => {
            walk_js_node_typed(block, context)?;
            if let Some(h) = handler {
                walk_js_node_typed(h, context)?;
            }
            if let Some(f) = finalizer {
                walk_js_node_typed(f, context)?;
            }
            Ok(())
        }

        // CatchClause
        JsNode::CatchClause { param, body, .. } => {
            if let Some(p) = param {
                walk_js_node_typed(p, context)?;
            }
            walk_js_node_typed(body, context)?;
            Ok(())
        }

        // ClassExpression: super_class + body
        JsNode::ClassExpression {
            super_class, body, ..
        } => {
            if let Some(sc) = super_class {
                walk_js_node_typed(sc, context)?;
            }
            walk_js_node_typed(body, context)?;
            Ok(())
        }

        // MetaProperty: meta + property
        JsNode::MetaProperty { meta, property, .. } => {
            walk_js_node_typed(meta, context)?;
            walk_js_node_typed(property, context)?;
            Ok(())
        }

        // Raw(Value) fallback - use the original visit_children
        JsNode::Raw(value) => {
            // For Raw nodes, also handle leadingComments
            let mut has_ignores = false;
            if let Some(comments) = value.get("leadingComments").and_then(|c| c.as_array()) {
                let mut ignores = Vec::new();
                for comment in comments {
                    if let Some(val) = comment.get("value").and_then(|v| v.as_str()) {
                        ignores.extend(extract_svelte_ignore(val, context.analysis.runes));
                    }
                }
                if !ignores.is_empty() {
                    context.push_ignore(ignores);
                    has_ignores = true;
                }
            }
            let result = visit_children(value, context);
            if has_ignores {
                context.pop_ignore();
            }
            result
        }

        // Leaf nodes (Identifier, Literal, TemplateElement, ThisExpression, Super, etc.)
        _ => Ok(()),
    }
}
