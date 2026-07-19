//! Script visitor for JavaScript AST traversal.
//!
//! This module provides functionality to walk JavaScript AST nodes
//! and build the js_path for proper rune placement validation.

use super::VisitorContext;
use crate::ast::js::Expression;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::utils::extract_svelte_ignore;

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
                unreachable!("script Expression must be a Typed Program")
            }
        }
        Expression::Lazy { .. } => panic!("Expression::Lazy must be resolved before analysis"),
    }
}

/// Walk a JavaScript expression (typed `&Expression`).
///
/// Dispatches to `walk_js_node_typed` for `Typed` expressions.
pub fn walk_expression(
    expr: &Expression,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    match expr {
        Expression::Typed(te) => walk_js_node_typed(&te.node, context),
        Expression::Lazy { .. } => panic!("Expression::Lazy must be resolved before analysis"),
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
            // Enter the for-loop's lexical scope (registered by scope_builder when the
            // init declares `let`/`const`) so the loop variable shadows outer bindings
            // during mutation/reference resolution — an `i++` in the update clause must
            // resolve to the loop's own `let i`, not a same-named `const` in a sibling
            // scope (which would falsely trip `constant_assignment`).
            let saved_scope = context.scope;
            if let Some(start) = node.start()
                && let Some(&scope_idx) = context.analysis.root.function_scope_map.get(&start)
            {
                context.scope = scope_idx;
            }
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
            context.scope = saved_scope;
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
            // The iterable (`right`) is evaluated in the enclosing scope, so walk it
            // first. Then enter the loop's lexical scope (registered by scope_builder
            // when `left` declares `let`/`const`) for `left`/`body` so the loop binding
            // resolves within the loop rather than to a same-named sibling binding.
            walk_js_node_typed(arena.get_js_node(*right), context)?;
            let saved_scope = context.scope;
            if let Some(start) = node.start()
                && let Some(&scope_idx) = context.analysis.root.function_scope_map.get(&start)
            {
                context.scope = scope_idx;
            }
            walk_js_node_typed(arena.get_js_node(*left), context)?;
            walk_js_node_typed(arena.get_js_node(*body), context)?;
            context.scope = saved_scope;
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
