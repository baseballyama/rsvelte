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

/// Visit a JavaScript script content from an Expression.
///
/// For `Typed(JsNode::Program)` expressions, this iterates the body directly
/// via typed dispatch, avoiding the JSON Map construction and `.get("type")` lookups
/// on the Program node itself.
///
/// Falls back to the JSON-based path for `Value` expressions.
///
/// # Arguments
///
/// * `script_expr` - The script Expression (should be a Program)
/// * `context` - The visitor context
pub fn visit_script_expr(
    script_expr: &Expression,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    match script_expr {
        Expression::Typed(te) => {
            if let JsNode::Program { body, .. } = &te.node {
                // Fast path: push a lazily-computed Value for js_path, then walk body typed
                let program_value = te.as_json();
                context
                    .js_path
                    .push(super::JsPathEntry::new(&program_value));

                let arena = context.parse_arena;
                for stmt in arena.get_js_children(*body) {
                    match stmt {
                        // For Raw nodes (statements with leadingComments attached),
                        // use the Value-based walker which handles all node types
                        // via string matching and processes leadingComments properly.
                        JsNode::Raw(value) => {
                            walk_js_node(value, context)?;
                        }
                        // For typed nodes, use the typed walker for direct field access.
                        _ => {
                            walk_js_node_typed(stmt, context)?;
                        }
                    }
                }

                context.js_path.pop();
                Ok(())
            } else {
                // Not a Program - fall back to JSON path
                visit_script(&script_expr.as_json(), context)
            }
        }
        Expression::Value(_) => visit_script(&script_expr.as_json(), context),
    }
}

/// Visit a JavaScript script content (JSON-based path).
///
/// This walks the JavaScript AST and calls appropriate visitors for each node type.
///
/// # Arguments
///
/// * `script_ast` - The JavaScript AST (Program node) as a JSON Value
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
    // Fast path: skip non-object values (primitives, arrays, nulls)
    let obj = match node {
        Value::Object(obj) => obj,
        _ => return Ok(()),
    };

    let node_type = obj.get("type").and_then(|t| t.as_str());

    // Process leadingComments for svelte-ignore directives.
    // This mirrors the official Svelte compiler's universal `_` visitor (2-analyze/index.js L117-131)
    // which extracts svelte-ignore codes from JS comments and pushes them to the ignore stack.
    // Most nodes don't have leadingComments, so check existence first.
    let mut has_ignores = false;
    if let Some(comments) = obj.get("leadingComments").and_then(|c| c.as_array()) {
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

    // Visit specific node types and determine if the visitor handles its own children
    // Unwrap Option once to avoid repeated Some() matching overhead on every arm
    let self_traversal = if let Some(nt) = node_type {
        match nt {
            "CallExpression" => {
                super::call_expression::visit(node, context)?;
                true
            }
            "VariableDeclarator" => {
                super::variable_declarator::visit(node, context)?;
                true
            }
            "FunctionDeclaration" => {
                super::function_declaration::visit(node, context)?;
                true
            }
            "FunctionExpression" | "ArrowFunctionExpression" => {
                super::function_expression::visit(node, context)?;
                true
            }
            "ClassDeclaration" => {
                super::class_declaration::visit(node, context)?;
                true
            }
            "ClassBody" => {
                super::class_body::visit(node, context)?;
                true
            }
            "PropertyDefinition" => {
                super::property_definition::visit(node, context)?;
                true
            }
            "AssignmentExpression" => {
                super::assignment_expression::visit(node, context)?;
                true
            }
            "AwaitExpression" => {
                super::await_expression::visit(node, context)?;
                true
            }
            "ExpressionStatement" => {
                super::expression_statement::visit(node, context)?;
                true
            }
            "Identifier" => {
                super::identifier::visit(node, context)?;
                false
            }
            "Literal" => {
                super::literal::visit(node, context)?;
                false
            }
            "TemplateElement" => {
                super::template_element::visit(node, context)?;
                false
            }
            "MemberExpression" => {
                super::member_expression::visit(node, context)?;
                true
            }
            "NewExpression" => {
                super::new_expression::visit(node, context)?;
                true
            }
            "UpdateExpression" => {
                super::update_expression::visit(node, context)?;
                true
            }
            "LabeledStatement" => {
                super::labeled_statement::visit(node, context)?;
                true
            }
            "ExportDefaultDeclaration" => {
                super::export_default_declaration::visit(node, context)?;
                true
            }
            "ExportNamedDeclaration" => {
                super::export_named_declaration::visit(node, context)?;
                true
            }
            "ImportDeclaration" => {
                super::import_declaration::visit(node, context)?;
                true
            }
            _ => false,
        }
    } else {
        false
    };

    // Visit children (common fields) - pass node_type to avoid re-reading it
    if !self_traversal {
        visit_children(node, node_type, context)?;
    }

    // Pop from JS path
    context.js_path.pop();

    // Pop ignores from leadingComments (after visiting children)
    if has_ignores {
        context.pop_ignore();
    }

    Ok(())
}

/// Walk the "body" field of a node (array or single node).
#[inline]
fn walk_body(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let Some(body) = node.get("body") {
        if let Some(body_array) = body.as_array() {
            for child in body_array {
                walk_js_node(child, context)?;
            }
        } else {
            walk_js_node(body, context)?;
        }
    }
    Ok(())
}

/// Fallback child visitor for unknown node types.
/// Instead of probing ~25 specific field names (each a HashMap miss for most nodes),
/// iterate all values of the JSON object and visit any that are objects or arrays of objects.
fn visit_children_fallback(
    node: &Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    if let Value::Object(map) = node {
        for (key, value) in map {
            // Skip metadata fields that are never AST child nodes
            match key.as_str() {
                "type" | "start" | "end" | "loc" | "range" | "raw" | "name" | "operator"
                | "prefix" | "computed" | "optional" | "shorthand" | "method" | "kind"
                | "async" | "generator" | "static" | "declare" | "abstract" | "override"
                | "definite" | "readonly" | "accessibility" | "delegate" | "regex" | "bigint"
                | "leadingComments" | "trailingComments" | "innerComments" | "sourceType"
                | "await" => continue,
                // For params, we need special handling (only visit "right" of default params)
                "params" => {
                    if let Some(arr) = value.as_array() {
                        for param in arr {
                            if let Some(right) = param.get("right") {
                                walk_js_node(right, context)?;
                            }
                        }
                    }
                }
                _ => match value {
                    Value::Object(_) => {
                        walk_js_node(value, context)?;
                    }
                    Value::Array(arr) => {
                        for item in arr {
                            if item.is_object() {
                                walk_js_node(item, context)?;
                            }
                        }
                    }
                    _ => {}
                },
            }
        }
    }
    Ok(())
}

/// Visit common child nodes of a JavaScript AST node.
///
/// Dispatches based on node type to minimize HashMap lookups per node.
/// Known node types only check the fields relevant to them (typically 1-3).
/// Unknown node types fall back to iterating all object values.
///
/// The `node_type` parameter is passed from the caller to avoid re-reading
/// `node.get("type")` which was already done in `walk_js_node`.
///
/// # Arguments
///
/// * `node` - The JavaScript AST node
/// * `node_type` - The already-extracted type string (avoids double HashMap lookup)
/// * `context` - The visitor context
fn visit_children(
    node: &Value,
    node_type: Option<&str>,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Dispatch based on node type to minimize HashMap lookups
    // Unwrap Option once to avoid repeated Some() matching overhead
    let Some(nt) = node_type else {
        return visit_children_fallback(node, context);
    };
    match nt {
        "Program" | "BlockStatement" => {
            // body[]
            walk_body(node, context)?;
        }
        "VariableDeclaration" => {
            // declarations[]
            if let Some(declarations) = node.get("declarations").and_then(|d| d.as_array()) {
                for decl in declarations {
                    walk_js_node(decl, context)?;
                }
            }
        }
        "IfStatement" => {
            // test, consequent, alternate
            if let Some(test) = node.get("test") {
                walk_js_node(test, context)?;
            }
            if let Some(consequent) = node.get("consequent") {
                walk_js_node(consequent, context)?;
            }
            if let Some(alternate) = node.get("alternate") {
                walk_js_node(alternate, context)?;
            }
        }
        "ForStatement" => {
            // init, test, update, body
            if let Some(init) = node.get("init") {
                walk_js_node(init, context)?;
            }
            if let Some(test) = node.get("test") {
                walk_js_node(test, context)?;
            }
            if let Some(update) = node.get("update") {
                walk_js_node(update, context)?;
            }
            walk_body(node, context)?;
        }
        "ForInStatement" | "ForOfStatement" => {
            // left, right, body
            if let Some(left) = node.get("left") {
                walk_js_node(left, context)?;
            }
            if let Some(right) = node.get("right") {
                walk_js_node(right, context)?;
            }
            walk_body(node, context)?;
        }
        "WhileStatement" | "DoWhileStatement" => {
            // test, body
            if let Some(test) = node.get("test") {
                walk_js_node(test, context)?;
            }
            walk_body(node, context)?;
        }
        "SwitchStatement" => {
            // discriminant, cases[]
            if let Some(discriminant) = node.get("discriminant") {
                walk_js_node(discriminant, context)?;
            }
            if let Some(cases) = node.get("cases").and_then(|c| c.as_array()) {
                for case in cases {
                    walk_js_node(case, context)?;
                }
            }
        }
        "SwitchCase" => {
            // test, consequent[]
            if let Some(test) = node.get("test") {
                walk_js_node(test, context)?;
            }
            if let Some(consequent) = node.get("consequent").and_then(|c| c.as_array()) {
                for stmt in consequent {
                    walk_js_node(stmt, context)?;
                }
            }
        }
        "TryStatement" => {
            // block, handler, finalizer
            if let Some(block) = node.get("block") {
                walk_js_node(block, context)?;
            }
            if let Some(handler) = node.get("handler") {
                walk_js_node(handler, context)?;
            }
            if let Some(finalizer) = node.get("finalizer") {
                walk_js_node(finalizer, context)?;
            }
        }
        "CatchClause" => {
            // param, body
            if let Some(param) = node.get("param") {
                walk_js_node(param, context)?;
            }
            walk_body(node, context)?;
        }
        "ReturnStatement" | "ThrowStatement" | "SpreadElement" | "UnaryExpression"
        | "YieldExpression" | "RestElement" => {
            // argument
            if let Some(argument) = node.get("argument") {
                walk_js_node(argument, context)?;
            }
        }
        "BinaryExpression" | "LogicalExpression" => {
            // left, right
            if let Some(left) = node.get("left") {
                walk_js_node(left, context)?;
            }
            if let Some(right) = node.get("right") {
                walk_js_node(right, context)?;
            }
        }
        "ConditionalExpression" => {
            // test, consequent, alternate
            if let Some(test) = node.get("test") {
                walk_js_node(test, context)?;
            }
            if let Some(consequent) = node.get("consequent") {
                walk_js_node(consequent, context)?;
            }
            if let Some(alternate) = node.get("alternate") {
                walk_js_node(alternate, context)?;
            }
        }
        "ObjectExpression" | "ObjectPattern" => {
            // properties[]
            if let Some(properties) = node.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    walk_js_node(prop, context)?;
                }
            }
        }
        "ArrayExpression" | "ArrayPattern" => {
            // elements[]
            if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        walk_js_node(elem, context)?;
                    }
                }
            }
        }
        "Property" => {
            // key (if computed), value
            if node
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false)
                && let Some(key) = node.get("key")
            {
                walk_js_node(key, context)?;
            }
            if let Some(value) = node.get("value") {
                walk_js_node(value, context)?;
            }
        }
        "SequenceExpression" => {
            // expressions[]
            if let Some(expressions) = node.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    walk_js_node(expr, context)?;
                }
            }
        }
        "TemplateLiteral" => {
            // expressions[], quasis[]
            if let Some(expressions) = node.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    walk_js_node(expr, context)?;
                }
            }
            if let Some(quasis) = node.get("quasis").and_then(|q| q.as_array()) {
                for quasi in quasis {
                    walk_js_node(quasi, context)?;
                }
            }
        }
        "TaggedTemplateExpression" => {
            // tag, quasi
            if let Some(tag) = node.get("tag") {
                walk_js_node(tag, context)?;
            }
            if let Some(quasi) = node.get("quasi") {
                walk_js_node(quasi, context)?;
            }
        }
        "AssignmentPattern" => {
            // left, right
            if let Some(left) = node.get("left") {
                walk_js_node(left, context)?;
            }
            if let Some(right) = node.get("right") {
                walk_js_node(right, context)?;
            }
        }
        "MethodDefinition" => {
            // key (if computed), value
            if node
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false)
                && let Some(key) = node.get("key")
            {
                walk_js_node(key, context)?;
            }
            if let Some(value) = node.get("value") {
                walk_js_node(value, context)?;
            }
        }
        "ExportAllDeclaration"
        | "Identifier"
        | "Literal"
        | "TemplateElement"
        | "ThisExpression"
        | "Super"
        | "BreakStatement"
        | "ContinueStatement"
        | "EmptyStatement"
        | "DebuggerStatement" => {
            // Leaf nodes - no children to walk
        }
        "ImportExpression" => {
            // source
            if let Some(source) = node.get("source") {
                walk_js_node(source, context)?;
            }
        }
        "ChainExpression" | "ParenthesizedExpression" => {
            // expression
            if let Some(expression) = node.get("expression") {
                walk_js_node(expression, context)?;
            }
        }
        _ => {
            // Fallback for unknown node types: check all common fields
            visit_children_fallback(node, context)?;
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
    walk_js_node(&expr.as_json(), context)
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
    let arena = context.parse_arena;
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

        // Block-like with body array (IdRange)
        JsNode::BlockStatement { body, .. }
        | JsNode::Program { body, .. }
        | JsNode::StaticBlock { body, .. } => {
            for child in arena.get_js_children(*body) {
                walk_js_node_typed(child, context)?;
            }
            Ok(())
        }

        // Binary/Logical: left + right (JsNodeId)
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            walk_js_node_typed(arena.get_js_node(*left), context)?;
            walk_js_node_typed(arena.get_js_node(*right), context)?;
            Ok(())
        }

        // Unary: argument (JsNodeId)
        JsNode::UnaryExpression { argument, .. }
        | JsNode::SpreadElement { argument, .. }
        | JsNode::RestElement { argument, .. } => {
            walk_js_node_typed(arena.get_js_node(*argument), context)?;
            Ok(())
        }

        // Conditional: test + consequent + alternate (all JsNodeId)
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            walk_js_node_typed(arena.get_js_node(*test), context)?;
            walk_js_node_typed(arena.get_js_node(*consequent), context)?;
            walk_js_node_typed(arena.get_js_node(*alternate), context)?;
            Ok(())
        }

        // IfStatement: test + consequent (JsNodeId), alternate (Option<JsNodeId>)
        JsNode::IfStatement {
            test,
            consequent,
            alternate,
            ..
        } => {
            walk_js_node_typed(arena.get_js_node(*test), context)?;
            walk_js_node_typed(arena.get_js_node(*consequent), context)?;
            if let Some(alt) = alternate {
                walk_js_node_typed(arena.get_js_node(*alt), context)?;
            }
            Ok(())
        }

        // Objects: properties (IdRange)
        JsNode::ObjectExpression { properties, .. } | JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                walk_js_node_typed(prop, context)?;
            }
            Ok(())
        }

        // ArrayExpression: elements is Vec<Option<JsNode>> - kept as-is (not IdRange)
        JsNode::ArrayExpression { elements, .. } => {
            for e in elements.iter().flatten() {
                walk_js_node_typed(e, context)?;
            }
            Ok(())
        }

        // ArrayPattern: elements is Vec<Option<JsNode>> - kept as-is (not IdRange)
        JsNode::ArrayPattern { elements, .. } => {
            for e in elements.iter().flatten() {
                walk_js_node_typed(e, context)?;
            }
            Ok(())
        }

        // Property: key + value (JsNodeId)
        JsNode::Property {
            key,
            value,
            computed,
            ..
        } => {
            if *computed {
                walk_js_node_typed(arena.get_js_node(*key), context)?;
            }
            walk_js_node_typed(arena.get_js_node(*value), context)?;
            Ok(())
        }

        // MethodDefinition: key + value (JsNodeId)
        JsNode::MethodDefinition {
            key,
            value,
            computed,
            ..
        } => {
            if *computed {
                walk_js_node_typed(arena.get_js_node(*key), context)?;
            }
            walk_js_node_typed(arena.get_js_node(*value), context)?;
            Ok(())
        }

        // SequenceExpression: expressions (IdRange)
        JsNode::SequenceExpression { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                walk_js_node_typed(expr, context)?;
            }
            Ok(())
        }

        // TemplateLiteral: quasis + expressions (IdRange)
        JsNode::TemplateLiteral {
            quasis,
            expressions,
            ..
        } => {
            for quasi in arena.get_js_children(*quasis) {
                walk_js_node_typed(quasi, context)?;
            }
            for expr in arena.get_js_children(*expressions) {
                walk_js_node_typed(expr, context)?;
            }
            Ok(())
        }

        // TaggedTemplateExpression: tag + quasi (JsNodeId)
        JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
            walk_js_node_typed(arena.get_js_node(*tag), context)?;
            walk_js_node_typed(arena.get_js_node(*quasi), context)?;
            Ok(())
        }

        // ForStatement: init/test/update (Option<JsNodeId>), body (JsNodeId)
        JsNode::ForStatement {
            init,
            test,
            update,
            body,
            ..
        } => {
            if let Some(init) = init {
                walk_js_node_typed(arena.get_js_node(*init), context)?;
            }
            if let Some(test) = test {
                walk_js_node_typed(arena.get_js_node(*test), context)?;
            }
            if let Some(update) = update {
                walk_js_node_typed(arena.get_js_node(*update), context)?;
            }
            walk_js_node_typed(arena.get_js_node(*body), context)?;
            Ok(())
        }

        // WhileStatement: test + body (JsNodeId)
        JsNode::WhileStatement { test, body, .. } => {
            walk_js_node_typed(arena.get_js_node(*test), context)?;
            walk_js_node_typed(arena.get_js_node(*body), context)?;
            Ok(())
        }

        // DoWhileStatement: test + body (JsNodeId)
        JsNode::DoWhileStatement { test, body, .. } => {
            walk_js_node_typed(arena.get_js_node(*test), context)?;
            walk_js_node_typed(arena.get_js_node(*body), context)?;
            Ok(())
        }

        // ReturnStatement: argument (Option<JsNodeId>)
        JsNode::ReturnStatement { argument, .. } => {
            if let Some(arg) = argument {
                walk_js_node_typed(arena.get_js_node(*arg), context)?;
            }
            Ok(())
        }

        // ThrowStatement: argument (JsNodeId)
        JsNode::ThrowStatement { argument, .. } => {
            walk_js_node_typed(arena.get_js_node(*argument), context)?;
            Ok(())
        }

        // VariableDeclaration: declarations (IdRange)
        JsNode::VariableDeclaration { declarations, .. } => {
            for decl in arena.get_js_children(*declarations) {
                walk_js_node_typed(decl, context)?;
            }
            Ok(())
        }

        // AssignmentPattern: left + right (JsNodeId)
        JsNode::AssignmentPattern { left, right, .. } => {
            walk_js_node_typed(arena.get_js_node(*left), context)?;
            walk_js_node_typed(arena.get_js_node(*right), context)?;
            Ok(())
        }

        // ChainExpression: expression (JsNodeId)
        JsNode::ChainExpression { expression, .. } => {
            walk_js_node_typed(arena.get_js_node(*expression), context)?;
            Ok(())
        }

        // ImportExpression: source (JsNodeId)
        JsNode::ImportExpression { source, .. } => {
            walk_js_node_typed(arena.get_js_node(*source), context)?;
            Ok(())
        }

        // YieldExpression: argument (Option<JsNodeId>)
        JsNode::YieldExpression { argument, .. } => {
            if let Some(arg) = argument {
                walk_js_node_typed(arena.get_js_node(*arg), context)?;
            }
            Ok(())
        }

        // ForOfStatement / ForInStatement: left + right + body (JsNodeId)
        JsNode::ForOfStatement {
            left, right, body, ..
        }
        | JsNode::ForInStatement {
            left, right, body, ..
        } => {
            walk_js_node_typed(arena.get_js_node(*left), context)?;
            walk_js_node_typed(arena.get_js_node(*right), context)?;
            walk_js_node_typed(arena.get_js_node(*body), context)?;
            Ok(())
        }

        // SwitchStatement: discriminant (JsNodeId), cases (IdRange)
        JsNode::SwitchStatement {
            discriminant,
            cases,
            ..
        } => {
            walk_js_node_typed(arena.get_js_node(*discriminant), context)?;
            for case in arena.get_js_children(*cases) {
                walk_js_node_typed(case, context)?;
            }
            Ok(())
        }

        // SwitchCase: test (Option<JsNodeId>), consequent (IdRange)
        JsNode::SwitchCase {
            test, consequent, ..
        } => {
            if let Some(t) = test {
                walk_js_node_typed(arena.get_js_node(*t), context)?;
            }
            for stmt in arena.get_js_children(*consequent) {
                walk_js_node_typed(stmt, context)?;
            }
            Ok(())
        }

        // TryStatement: block (JsNodeId), handler/finalizer (Option<JsNodeId>)
        JsNode::TryStatement {
            block,
            handler,
            finalizer,
            ..
        } => {
            walk_js_node_typed(arena.get_js_node(*block), context)?;
            if let Some(h) = handler {
                walk_js_node_typed(arena.get_js_node(*h), context)?;
            }
            if let Some(f) = finalizer {
                walk_js_node_typed(arena.get_js_node(*f), context)?;
            }
            Ok(())
        }

        // CatchClause: param (Option<JsNodeId>), body (JsNodeId)
        JsNode::CatchClause { param, body, .. } => {
            if let Some(p) = param {
                walk_js_node_typed(arena.get_js_node(*p), context)?;
            }
            walk_js_node_typed(arena.get_js_node(*body), context)?;
            Ok(())
        }

        // ClassExpression: super_class (Option<JsNodeId>), body (JsNodeId)
        JsNode::ClassExpression {
            super_class, body, ..
        } => {
            if let Some(sc) = super_class {
                walk_js_node_typed(arena.get_js_node(*sc), context)?;
            }
            walk_js_node_typed(arena.get_js_node(*body), context)?;
            Ok(())
        }

        // MetaProperty: meta + property (JsNodeId)
        JsNode::MetaProperty { meta, property, .. } => {
            walk_js_node_typed(arena.get_js_node(*meta), context)?;
            walk_js_node_typed(arena.get_js_node(*property), context)?;
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
            let raw_type = value.get("type").and_then(|t| t.as_str());
            let result = visit_children(value, raw_type, context);
            if has_ignores {
                context.pop_ignore();
            }
            result
        }

        // Leaf nodes (Identifier, Literal, TemplateElement, ThisExpression, Super, etc.)
        _ => Ok(()),
    }
}
