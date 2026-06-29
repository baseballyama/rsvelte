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
            if let JsNode::Program {
                body,
                ignore_comment_map,
                ..
            } = &te.node
            {
                // Install this program's svelte-ignore map for the duration of the body
                // walk, so the typed walker can surface statement-level svelte-ignore
                // suppression without the nodes being materialized as `JsNode::Raw`.
                // Save/restore the previous map (module vs instance scripts each set
                // their own; template walks expect an empty map).
                let saved_ignores = std::mem::take(&mut context.script_ignore_comments);
                context.script_ignore_comments = ignore_comment_map.iter().cloned().collect();

                // Fast path: push a lazily-computed Value for js_path, then walk body typed
                let program_value = te.as_json();
                context.js_path.push(super::JsPathEntry::new(program_value));

                let arena = context.parse_arena;
                let mut result = Ok(());
                for stmt in arena.get_js_children(*body) {
                    let step = walk_js_node_typed(stmt, context);
                    if step.is_err() {
                        result = step;
                        break;
                    }
                }

                context.js_path.pop();
                context.script_ignore_comments = saved_ignores;
                result
            } else {
                // Not a Program - fall back to JSON path
                visit_script(script_expr.as_json(), context)
            }
        }
        Expression::Lazy { .. } => panic!("Expression::Lazy must be resolved before analysis"),
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
    // Count Value-walker entries. The typed walker only reaches here by
    // delegating a genuinely-`JsNode::Raw` subtree, so a nonzero delta across a
    // typed subtree walk signals that the subtree contained a `Raw` node (see
    // `function_declaration::visit_typed`'s `new `-keyword fallback gate).
    context.raw_walk_count = context.raw_walk_count.saturating_add(1);

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
    let mut ignores = Vec::new();
    if let Some(comments) = obj.get("leadingComments").and_then(|c| c.as_array()) {
        for comment in comments {
            if let Some(value) = comment.get("value").and_then(|v| v.as_str()) {
                ignores.extend(extract_svelte_ignore(value, context.analysis.runes));
            }
        }
    }
    // Fallback to the harvested svelte-ignore map (keyed by absolute node start).
    // This covers statements nested inside a genuinely-`JsNode::Raw` subtree — e.g.
    // a function-expression / block-bodied arrow / class body — which are walked here
    // via the Value walker and no longer carry `leadingComments` on their Value (the
    // parser harvests those texts into `script_ignore_comments` instead of wrapping the
    // whole owning statement as Raw). The map is empty outside a script body walk and
    // in the pure Value-path analysis, so this is a no-op there.
    if ignores.is_empty() && !context.script_ignore_comments.is_empty() {
        let runes = context.analysis.runes;
        if let Some(start) = obj.get("start").and_then(|s| s.as_u64())
            && let Some(values) = context.script_ignore_comments.get(&(start as u32))
        {
            for value in values {
                ignores.extend(extract_svelte_ignore(value, runes));
            }
        }
    }
    if !ignores.is_empty() {
        context.push_ignore(ignores);
        has_ignores = true;
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
        "SpreadElement" => {
            // `[...x]` is treated like `[...x.values()]` — spreading triggers
            // the iterator protocol so it counts as both a call and a state
            // read for blocker / async tracking.
            // Corresponds to SpreadElement.js in the official compiler.
            if let Some(expression) = context.current_expression() {
                expression.set_has_call(true);
                expression.set_has_state(true);
            }
            if let Some(argument) = node.get("argument") {
                walk_js_node(argument, context)?;
            }
        }
        "ReturnStatement" | "ThrowStatement" | "UnaryExpression" | "YieldExpression"
        | "RestElement" => {
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
            // `tag\`...\`` invokes `tag(strings, ...exprs)` — it counts as a
            // call (and therefore reads state) unless the tag itself is a
            // pure reference.
            // Corresponds to TaggedTemplateExpression.js in the official compiler.
            let tag_is_pure = node
                .get("tag")
                .map(|tag| super::shared::utils::is_pure(tag, context))
                .unwrap_or(false);
            if !tag_is_pure && let Some(expression) = context.current_expression() {
                expression.set_has_call(true);
                expression.set_has_state(true);
            }
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
    match expr {
        Expression::Typed(te) => walk_js_node_typed(&te.node, context),
        _ => walk_js_node(expr.as_json(), context),
    }
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
    // Process svelte-ignore directives attached to this node as leading comments.
    // The parser harvests those comment texts into the Program's `ignore_comment_map`
    // (keyed by absolute node start) instead of materializing the node as `JsNode::Raw`,
    // so we consult that map here. This mirrors `walk_js_node`'s leadingComments handling:
    // push the ignore codes before visiting children, pop after.
    let mut has_ignores = false;
    if !context.script_ignore_comments.is_empty()
        && let Some(start) = node.start()
        && let Some(values) = context.script_ignore_comments.get(&start)
    {
        let runes = context.analysis.runes;
        let mut ignores = Vec::new();
        for value in values {
            ignores.extend(extract_svelte_ignore(value, runes));
        }
        if !ignores.is_empty() {
            context.push_ignore(ignores);
            has_ignores = true;
        }
    }

    // Push a TypedNode entry onto js_path. The Value will be lazily materialized
    // only if code inspects this entry through Deref (which most entries never need).
    // SAFETY: `node` lives until after the pop at the end of this function.
    context.js_path.push(super::JsPathEntry::new_typed(node));

    // Convert to Value lazily: only visitors that need the full JSON representation
    // will call node.to_value() internally. Most visitors now accept &JsNode directly.
    //
    // For visitors that still need &Value (complex ones with deep JSON introspection),
    // they call node.to_value() themselves, which is still faster than converting
    // unconditionally for every node.
    match node {
        JsNode::CallExpression { .. } => {
            super::call_expression::visit_typed(node, context)?;
        }
        JsNode::VariableDeclarator { .. } => {
            super::variable_declarator::visit_typed(node, context)?;
        }
        JsNode::FunctionDeclaration { .. } => {
            super::function_declaration::visit_typed(node, context)?;
        }
        JsNode::FunctionExpression { .. } | JsNode::ArrowFunctionExpression { .. } => {
            super::function_expression::visit_typed(node, context)?;
        }
        JsNode::ClassDeclaration { .. } => {
            super::class_declaration::visit_typed(node, context)?;
        }
        JsNode::ClassBody { .. } => {
            super::class_body::visit_typed(node, context)?;
        }
        JsNode::PropertyDefinition { .. } => {
            super::property_definition::visit_typed(node, context)?;
        }
        JsNode::AssignmentExpression { .. } => {
            super::assignment_expression::visit_typed(node, context)?;
        }
        JsNode::AwaitExpression { .. } => {
            super::await_expression::visit_typed(node, context)?;
        }
        JsNode::ExpressionStatement { .. } => {
            super::expression_statement::visit_typed(node, context)?;
        }
        JsNode::Identifier { .. } => {
            super::identifier::visit_typed(node, context)?;
        }
        JsNode::Literal { .. } => {
            super::literal::visit_typed(node, context)?;
        }
        JsNode::TemplateElement { .. } => {
            super::template_element::visit_typed(node, context)?;
        }
        JsNode::MemberExpression { .. } => {
            super::member_expression::visit_typed(node, context)?;
        }
        JsNode::NewExpression { .. } => {
            super::new_expression::visit_typed(node, context)?;
        }
        JsNode::UpdateExpression { .. } => {
            super::update_expression::visit_typed(node, context)?;
        }
        JsNode::LabeledStatement { .. } => {
            super::labeled_statement::visit_typed(node, context)?;
        }
        JsNode::ExportDefaultDeclaration { .. } => {
            super::export_default_declaration::visit_typed(node, context)?;
        }
        JsNode::ExportNamedDeclaration { .. } => {
            super::export_named_declaration::visit_typed(node, context)?;
        }
        JsNode::ImportDeclaration { .. } => {
            super::import_declaration::visit_typed(node, context)?;
        }
        _ => {
            // For other node types, just visit their children
        }
    }

    // Visit children using typed traversal
    visit_children_typed(node, context)?;

    // Pop from JS path
    context.js_path.pop();

    // Pop svelte-ignore codes (after visiting children), mirroring walk_js_node.
    if has_ignores {
        context.pop_ignore();
    }

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

        // Block-like with body array (IdRange). For a BlockStatement, enter the
        // block's lexical scope (registered by scope_builder) so block-local `let`s
        // shadow outer bindings of the same name during mutation/reference
        // resolution — mirroring scope_builder. Program/StaticBlock keep the scope.
        JsNode::BlockStatement { body, .. } => {
            let saved_scope = context.scope;
            if let Some(start) = node.start()
                && let Some(&scope_idx) = context.analysis.root.function_scope_map.get(&start)
            {
                context.scope = scope_idx;
            }
            for child in arena.get_js_children(*body) {
                walk_js_node_typed(child, context)?;
            }
            context.scope = saved_scope;
            Ok(())
        }
        JsNode::Program { body, .. } | JsNode::StaticBlock { body, .. } => {
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

        // SpreadElement: `[...x]` is treated like `[...x.values()]` — the
        // spread itself is a call/state read for blocker tracking.
        JsNode::SpreadElement { argument, .. } => {
            if let Some(expression) = context.current_expression() {
                expression.set_has_call(true);
                expression.set_has_state(true);
            }
            walk_js_node_typed(arena.get_js_node(*argument), context)?;
            Ok(())
        }

        // Unary: argument (JsNodeId)
        JsNode::UnaryExpression { argument, .. } | JsNode::RestElement { argument, .. } => {
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

        // TaggedTemplateExpression: tag + quasi (JsNodeId).
        // `tag\`...\`` invokes `tag(strings, ...exprs)` — counts as a call
        // and state read unless the tag is a pure reference.
        JsNode::TaggedTemplateExpression { tag, quasi, .. } => {
            let tag_node = arena.get_js_node(*tag);
            if !super::shared::utils::is_pure_node(tag_node, context)
                && let Some(expression) = context.current_expression()
            {
                expression.set_has_call(true);
                expression.set_has_state(true);
            }
            walk_js_node_typed(tag_node, context)?;
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

        // Leaf nodes (Identifier, Literal, TemplateElement, ThisExpression, Super, etc.)
        _ => Ok(()),
    }
}
