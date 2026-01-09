//! JavaScript AST builder functions.
//!
//! These functions provide a convenient API for constructing JavaScript AST nodes,
//! similar to Svelte's `builders.js`.

use super::nodes::*;

// ============================================================================
// Identifiers and Literals
// ============================================================================

/// Create an identifier expression.
pub fn id(name: impl Into<String>) -> JsExpr {
    JsExpr::Identifier(name.into())
}

/// Create an identifier pattern.
pub fn id_pattern(name: impl Into<String>) -> JsPattern {
    JsPattern::Identifier(name.into())
}

/// Create a string literal.
pub fn string(value: impl Into<String>) -> JsExpr {
    JsExpr::Literal(JsLiteral::String(value.into()))
}

/// Create a number literal.
pub fn number(value: f64) -> JsExpr {
    JsExpr::Literal(JsLiteral::Number(value))
}

/// Create a boolean literal.
pub fn boolean(value: bool) -> JsExpr {
    JsExpr::Literal(JsLiteral::Boolean(value))
}

/// Create a null literal.
pub fn null() -> JsExpr {
    JsExpr::Literal(JsLiteral::Null)
}

/// Create a generic literal from JsLiteral.
pub fn literal(value: JsLiteral) -> JsExpr {
    JsExpr::Literal(value)
}

/// Create an undefined literal (void 0).
pub fn undefined() -> JsExpr {
    JsExpr::Void(Box::new(number(0.0)))
}

/// Create the `true` literal.
pub fn true_literal() -> JsExpr {
    boolean(true)
}

/// Create the `false` literal.
pub fn false_literal() -> JsExpr {
    boolean(false)
}

/// Create a `this` expression.
pub fn this() -> JsExpr {
    JsExpr::This
}

// ============================================================================
// Template Literals
// ============================================================================

/// Create a template literal.
pub fn template(quasis: Vec<JsTemplateElement>, expressions: Vec<JsExpr>) -> JsExpr {
    JsExpr::TemplateLiteral(JsTemplateLiteral {
        quasis,
        expressions,
    })
}

/// Create a template element.
pub fn quasi(raw: impl Into<String>, tail: bool) -> JsTemplateElement {
    let raw = raw.into();
    let cooked = raw.clone();
    JsTemplateElement { raw, cooked, tail }
}

/// Create a simple template literal from a string (no expressions).
pub fn template_string(s: impl Into<String>) -> JsExpr {
    template(vec![quasi(s, true)], vec![])
}

// ============================================================================
// Arrays and Objects
// ============================================================================

/// Create an array expression.
pub fn array(elements: Vec<JsExpr>) -> JsExpr {
    JsExpr::Array(JsArrayExpression {
        elements: elements.into_iter().map(Some).collect(),
    })
}

/// Create an array expression with possible holes.
pub fn array_with_holes(elements: Vec<Option<JsExpr>>) -> JsExpr {
    JsExpr::Array(JsArrayExpression { elements })
}

/// Create an empty array.
pub fn empty_array() -> JsExpr {
    array(vec![])
}

/// Create an object expression.
pub fn object(properties: Vec<JsObjectMember>) -> JsExpr {
    JsExpr::Object(JsObjectExpression { properties })
}

/// Create an empty object.
pub fn empty_object() -> JsExpr {
    object(vec![])
}

/// Create an object property (init).
pub fn prop(key: impl Into<String>, value: JsExpr) -> JsObjectMember {
    let key_str = key.into();
    JsObjectMember::Property(JsProperty {
        key: JsPropertyKey::Identifier(key_str),
        value: Box::new(value),
        kind: JsPropertyKind::Init,
        computed: false,
        shorthand: false,
    })
}

/// Create a shorthand object property.
pub fn prop_shorthand(name: impl Into<String>) -> JsObjectMember {
    let name = name.into();
    JsObjectMember::Property(JsProperty {
        key: JsPropertyKey::Identifier(name.clone()),
        value: Box::new(id(name)),
        kind: JsPropertyKind::Init,
        computed: false,
        shorthand: true,
    })
}

/// Create a computed property.
pub fn prop_computed(key: JsExpr, value: JsExpr) -> JsObjectMember {
    JsObjectMember::Property(JsProperty {
        key: JsPropertyKey::Computed(Box::new(key)),
        value: Box::new(value),
        kind: JsPropertyKind::Init,
        computed: true,
        shorthand: false,
    })
}

/// Create a getter property.
pub fn getter(name: impl Into<String>, body: Vec<JsStatement>) -> JsObjectMember {
    JsObjectMember::Property(JsProperty {
        key: JsPropertyKey::Identifier(name.into()),
        value: Box::new(JsExpr::Function(JsFunctionExpression {
            id: None,
            params: vec![],
            body: JsBlockStatement::with_body(body),
            is_async: false,
            is_generator: false,
        })),
        kind: JsPropertyKind::Get,
        computed: false,
        shorthand: false,
    })
}

/// Create a setter property.
pub fn setter(
    name: impl Into<String>,
    param: impl Into<String>,
    body: Vec<JsStatement>,
) -> JsObjectMember {
    JsObjectMember::Property(JsProperty {
        key: JsPropertyKey::Identifier(name.into()),
        value: Box::new(JsExpr::Function(JsFunctionExpression {
            id: None,
            params: vec![id_pattern(param)],
            body: JsBlockStatement::with_body(body),
            is_async: false,
            is_generator: false,
        })),
        kind: JsPropertyKind::Set,
        computed: false,
        shorthand: false,
    })
}

/// Create a spread element in an object.
pub fn spread(expr: JsExpr) -> JsObjectMember {
    JsObjectMember::SpreadElement(Box::new(expr))
}

/// Create a spread expression.
pub fn spread_expr(expr: JsExpr) -> JsExpr {
    JsExpr::Spread(Box::new(expr))
}

// ============================================================================
// Functions
// ============================================================================

/// Create an arrow function with expression body.
pub fn arrow(params: Vec<JsPattern>, body: JsExpr) -> JsExpr {
    JsExpr::Arrow(JsArrowFunction {
        params,
        body: JsArrowBody::Expression(Box::new(body)),
        is_async: false,
    })
}

/// Create an arrow function with block body.
pub fn arrow_block(params: Vec<JsPattern>, body: Vec<JsStatement>) -> JsExpr {
    JsExpr::Arrow(JsArrowFunction {
        params,
        body: JsArrowBody::Block(JsBlockStatement::with_body(body)),
        is_async: false,
    })
}

/// Create an async arrow function with expression body.
pub fn async_arrow(params: Vec<JsPattern>, body: JsExpr) -> JsExpr {
    JsExpr::Arrow(JsArrowFunction {
        params,
        body: JsArrowBody::Expression(Box::new(body)),
        is_async: true,
    })
}

/// Create an async arrow function with block body.
pub fn async_arrow_block(params: Vec<JsPattern>, body: Vec<JsStatement>) -> JsExpr {
    JsExpr::Arrow(JsArrowFunction {
        params,
        body: JsArrowBody::Block(JsBlockStatement::with_body(body)),
        is_async: true,
    })
}

/// Create a thunk (arrow function with no params that returns the expression).
pub fn thunk(expr: JsExpr) -> JsExpr {
    arrow(vec![], expr)
}

/// Create a thunk with a block body.
pub fn thunk_block(statements: Vec<JsStatement>) -> JsExpr {
    arrow_block(vec![], statements)
}

/// Create an async thunk.
pub fn async_thunk(expr: JsExpr) -> JsExpr {
    async_arrow(vec![], expr)
}

/// Create a function expression.
pub fn function_expr(id: Option<String>, params: Vec<JsPattern>, body: Vec<JsStatement>) -> JsExpr {
    JsExpr::Function(JsFunctionExpression {
        id,
        params,
        body: JsBlockStatement::with_body(body),
        is_async: false,
        is_generator: false,
    })
}

/// Create a function declaration.
pub fn function_decl(
    name: impl Into<String>,
    params: Vec<JsPattern>,
    body: Vec<JsStatement>,
) -> JsStatement {
    JsStatement::FunctionDeclaration(JsFunctionDeclaration {
        id: Some(name.into()),
        params,
        body: JsBlockStatement::with_body(body),
        is_async: false,
        is_generator: false,
    })
}

/// Create an async function declaration.
pub fn async_function_decl(
    name: impl Into<String>,
    params: Vec<JsPattern>,
    body: Vec<JsStatement>,
) -> JsStatement {
    JsStatement::FunctionDeclaration(JsFunctionDeclaration {
        id: Some(name.into()),
        params,
        body: JsBlockStatement::with_body(body),
        is_async: true,
        is_generator: false,
    })
}

// ============================================================================
// Calls and Member Access
// ============================================================================

/// Create a call expression.
pub fn call(callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::Call(JsCallExpression {
        callee: Box::new(callee),
        arguments,
        optional: false,
    })
}

/// Create an optional call expression.
pub fn optional_call(callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::Call(JsCallExpression {
        callee: Box::new(callee),
        arguments,
        optional: true,
    })
}

/// Create a new expression.
pub fn new_expr(callee: JsExpr, arguments: Vec<JsExpr>) -> JsExpr {
    JsExpr::New(JsNewExpression {
        callee: Box::new(callee),
        arguments,
    })
}

/// Create a member expression with identifier property.
pub fn member(object: JsExpr, property: impl Into<String>) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: Box::new(object),
        property: JsMemberProperty::Identifier(property.into()),
        computed: false,
        optional: false,
    })
}

/// Create a computed member expression.
pub fn member_computed(object: JsExpr, property: JsExpr) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: Box::new(object),
        property: JsMemberProperty::Expression(Box::new(property)),
        computed: true,
        optional: false,
    })
}

/// Create an optional member expression.
pub fn optional_member(object: JsExpr, property: impl Into<String>) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: Box::new(object),
        property: JsMemberProperty::Identifier(property.into()),
        computed: false,
        optional: true,
    })
}

/// Create a member path from a dot-separated string (e.g., "$.template").
pub fn member_path(path: &str) -> JsExpr {
    let parts: Vec<&str> = path.split('.').collect();
    let mut expr = id(parts[0]);
    for part in parts.iter().skip(1) {
        expr = member(expr, *part);
    }
    expr
}

// ============================================================================
// Operators
// ============================================================================

/// Create a binary expression.
pub fn binary(op: impl Into<JsBinaryOp>, left: JsExpr, right: JsExpr) -> JsExpr {
    JsExpr::Binary(JsBinaryExpression {
        operator: op.into(),
        left: Box::new(left),
        right: Box::new(right),
    })
}

/// Create a binary expression from an operator string.
pub fn binary_str(op: &str, left: JsExpr, right: JsExpr) -> JsExpr {
    let operator = match op {
        "==" => JsBinaryOp::Eq,
        "!=" => JsBinaryOp::Ne,
        "===" => JsBinaryOp::StrictEq,
        "!==" => JsBinaryOp::StrictNe,
        "<" => JsBinaryOp::Lt,
        "<=" => JsBinaryOp::Le,
        ">" => JsBinaryOp::Gt,
        ">=" => JsBinaryOp::Ge,
        "<<" => JsBinaryOp::Shl,
        ">>" => JsBinaryOp::Shr,
        ">>>" => JsBinaryOp::UShr,
        "+" => JsBinaryOp::Add,
        "-" => JsBinaryOp::Sub,
        "*" => JsBinaryOp::Mul,
        "/" => JsBinaryOp::Div,
        "%" => JsBinaryOp::Mod,
        "**" => JsBinaryOp::Pow,
        "|" => JsBinaryOp::BitOr,
        "^" => JsBinaryOp::BitXor,
        "&" => JsBinaryOp::BitAnd,
        "in" => JsBinaryOp::In,
        "instanceof" => JsBinaryOp::InstanceOf,
        _ => JsBinaryOp::Add, // Default to addition
    };
    binary(operator, left, right)
}

/// Create a logical expression.
pub fn logical(op: JsLogicalOp, left: JsExpr, right: JsExpr) -> JsExpr {
    JsExpr::Logical(JsLogicalExpression {
        operator: op,
        left: Box::new(left),
        right: Box::new(right),
    })
}

/// Create an AND expression.
pub fn and(left: JsExpr, right: JsExpr) -> JsExpr {
    logical(JsLogicalOp::And, left, right)
}

/// Create an OR expression.
pub fn or(left: JsExpr, right: JsExpr) -> JsExpr {
    logical(JsLogicalOp::Or, left, right)
}

/// Create a nullish coalescing expression.
pub fn nullish(left: JsExpr, right: JsExpr) -> JsExpr {
    logical(JsLogicalOp::NullishCoalescing, left, right)
}

/// Create a unary expression.
pub fn unary(op: JsUnaryOp, argument: JsExpr) -> JsExpr {
    JsExpr::Unary(JsUnaryExpression {
        operator: op,
        argument: Box::new(argument),
        prefix: true,
    })
}

/// Create a NOT expression.
pub fn not(expr: JsExpr) -> JsExpr {
    unary(JsUnaryOp::Not, expr)
}

/// Create a typeof expression.
pub fn type_of(expr: JsExpr) -> JsExpr {
    unary(JsUnaryOp::TypeOf, expr)
}

/// Create an update expression.
pub fn update(op: JsUpdateOp, argument: JsExpr, prefix: bool) -> JsExpr {
    JsExpr::Update(JsUpdateExpression {
        operator: op,
        argument: Box::new(argument),
        prefix,
    })
}

/// Create an increment expression.
pub fn increment(expr: JsExpr, prefix: bool) -> JsExpr {
    update(JsUpdateOp::Increment, expr, prefix)
}

/// Create a decrement expression.
pub fn decrement(expr: JsExpr, prefix: bool) -> JsExpr {
    update(JsUpdateOp::Decrement, expr, prefix)
}

/// Create an assignment expression.
pub fn assignment(op: JsAssignmentOp, left: JsExpr, right: JsExpr) -> JsExpr {
    JsExpr::Assignment(JsAssignmentExpression {
        operator: op,
        left: Box::new(left),
        right: Box::new(right),
    })
}

/// Create a simple assignment expression.
pub fn assign(left: JsExpr, right: JsExpr) -> JsExpr {
    assignment(JsAssignmentOp::Assign, left, right)
}

/// Create an assignment expression from an operator string.
pub fn assign_op(op: &str, left: JsExpr, right: JsExpr) -> JsExpr {
    let operator = match op {
        "=" => JsAssignmentOp::Assign,
        "+=" => JsAssignmentOp::AddAssign,
        "-=" => JsAssignmentOp::SubAssign,
        "*=" => JsAssignmentOp::MulAssign,
        "/=" => JsAssignmentOp::DivAssign,
        "%=" => JsAssignmentOp::ModAssign,
        "**=" => JsAssignmentOp::PowAssign,
        "<<=" => JsAssignmentOp::ShlAssign,
        ">>=" => JsAssignmentOp::ShrAssign,
        ">>>=" => JsAssignmentOp::UShrAssign,
        "|=" => JsAssignmentOp::BitOrAssign,
        "^=" => JsAssignmentOp::BitXorAssign,
        "&=" => JsAssignmentOp::BitAndAssign,
        "||=" => JsAssignmentOp::OrAssign,
        "&&=" => JsAssignmentOp::AndAssign,
        "??=" => JsAssignmentOp::NullishAssign,
        _ => JsAssignmentOp::Assign, // Default to simple assignment
    };
    assignment(operator, left, right)
}

/// Create a conditional (ternary) expression.
pub fn conditional(test: JsExpr, consequent: JsExpr, alternate: JsExpr) -> JsExpr {
    JsExpr::Conditional(JsConditionalExpression {
        test: Box::new(test),
        consequent: Box::new(consequent),
        alternate: Box::new(alternate),
    })
}

/// Create a sequence expression.
pub fn sequence(expressions: Vec<JsExpr>) -> JsExpr {
    JsExpr::Sequence(JsSequenceExpression { expressions })
}

/// Create an await expression.
pub fn await_expr(argument: JsExpr) -> JsExpr {
    JsExpr::Await(Box::new(argument))
}

// ============================================================================
// Statements
// ============================================================================

/// Create an expression statement.
pub fn stmt(expression: JsExpr) -> JsStatement {
    JsStatement::Expression(JsExpressionStatement {
        expression: Box::new(expression),
    })
}

/// Create a return statement.
pub fn return_stmt(argument: Option<JsExpr>) -> JsStatement {
    JsStatement::Return(JsReturnStatement {
        argument: argument.map(Box::new),
    })
}

/// Create a return statement with a value.
pub fn return_value(value: JsExpr) -> JsStatement {
    return_stmt(Some(value))
}

/// Create an if statement.
pub fn if_stmt(
    test: JsExpr,
    consequent: JsStatement,
    alternate: Option<JsStatement>,
) -> JsStatement {
    JsStatement::If(JsIfStatement {
        test: Box::new(test),
        consequent: Box::new(consequent),
        alternate: alternate.map(Box::new),
    })
}

/// Create a block statement.
pub fn block(body: Vec<JsStatement>) -> JsStatement {
    JsStatement::Block(JsBlockStatement::with_body(body))
}

/// Create a for statement.
pub fn for_stmt(
    init: Option<JsForInit>,
    test: Option<JsExpr>,
    update: Option<JsExpr>,
    body: JsStatement,
) -> JsStatement {
    JsStatement::For(JsForStatement {
        init,
        test: test.map(Box::new),
        update: update.map(Box::new),
        body: Box::new(body),
    })
}

/// Create a for-of statement.
pub fn for_of(left: JsForOfLeft, right: JsExpr, body: JsStatement, is_await: bool) -> JsStatement {
    JsStatement::ForOf(JsForOfStatement {
        left,
        right: Box::new(right),
        body: Box::new(body),
        is_await,
    })
}

/// Create a while statement.
pub fn while_stmt(test: JsExpr, body: JsStatement) -> JsStatement {
    JsStatement::While(JsWhileStatement {
        test: Box::new(test),
        body: Box::new(body),
    })
}

/// Create a do-while statement.
pub fn do_while(body: JsStatement, test: JsExpr) -> JsStatement {
    JsStatement::DoWhile(JsDoWhileStatement {
        body: Box::new(body),
        test: Box::new(test),
    })
}

/// Create a throw statement.
pub fn throw(expr: JsExpr) -> JsStatement {
    JsStatement::Throw(Box::new(expr))
}

/// Create a throw error statement.
pub fn throw_error(message: impl Into<String>) -> JsStatement {
    throw(new_expr(id("Error"), vec![string(message)]))
}

/// Create a labeled statement.
pub fn labeled(label: impl Into<String>, body: JsStatement) -> JsStatement {
    JsStatement::Labeled(JsLabeledStatement {
        label: label.into(),
        body: Box::new(body),
    })
}

/// Create a break statement.
pub fn break_stmt(label: Option<String>) -> JsStatement {
    JsStatement::Break(label)
}

/// Create a continue statement.
pub fn continue_stmt(label: Option<String>) -> JsStatement {
    JsStatement::Continue(label)
}

/// Create a debugger statement.
pub fn debugger() -> JsStatement {
    JsStatement::Debugger
}

/// Create an empty statement.
pub fn empty() -> JsStatement {
    JsStatement::Empty
}

// ============================================================================
// Declarations
// ============================================================================

/// Create a const declaration.
pub fn const_decl(name: impl Into<String>, init: JsExpr) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Const,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: Some(Box::new(init)),
        }],
    })
}

/// Create a let declaration.
pub fn let_decl(name: impl Into<String>, init: Option<JsExpr>) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Let,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: init.map(Box::new),
        }],
    })
}

/// Create a var declaration.
pub fn var_decl(name: impl Into<String>, init: Option<JsExpr>) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind: JsVariableKind::Var,
        declarations: vec![JsVariableDeclarator {
            id: id_pattern(name),
            init: init.map(Box::new),
        }],
    })
}

/// Create a variable declaration with pattern.
pub fn var_decl_pattern(
    kind: JsVariableKind,
    pattern: JsPattern,
    init: Option<JsExpr>,
) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind,
        declarations: vec![JsVariableDeclarator {
            id: pattern,
            init: init.map(Box::new),
        }],
    })
}

/// Create a multi-variable declaration.
pub fn var_decl_multi(
    kind: JsVariableKind,
    declarations: Vec<(JsPattern, Option<JsExpr>)>,
) -> JsStatement {
    JsStatement::VariableDeclaration(JsVariableDeclaration {
        kind,
        declarations: declarations
            .into_iter()
            .map(|(id, init)| JsVariableDeclarator {
                id,
                init: init.map(Box::new),
            })
            .collect(),
    })
}

// ============================================================================
// Imports and Exports
// ============================================================================

/// Create a side-effect import.
pub fn import_side_effect(source: impl Into<String>) -> JsStatement {
    JsStatement::Import(JsImportDeclaration {
        source: source.into(),
        specifiers: vec![JsImportSpecifier::SideEffect],
    })
}

/// Create a namespace import (import * as name from 'source').
pub fn import_namespace(name: impl Into<String>, source: impl Into<String>) -> JsStatement {
    JsStatement::Import(JsImportDeclaration {
        source: source.into(),
        specifiers: vec![JsImportSpecifier::Namespace(name.into())],
    })
}

/// Create a default import.
pub fn import_default(name: impl Into<String>, source: impl Into<String>) -> JsStatement {
    JsStatement::Import(JsImportDeclaration {
        source: source.into(),
        specifiers: vec![JsImportSpecifier::Default(name.into())],
    })
}

/// Create a named import.
pub fn import_named(
    specifiers: Vec<(impl Into<String>, impl Into<String>)>,
    source: impl Into<String>,
) -> JsStatement {
    JsStatement::Import(JsImportDeclaration {
        source: source.into(),
        specifiers: specifiers
            .into_iter()
            .map(|(imported, local)| JsImportSpecifier::Named {
                imported: imported.into(),
                local: local.into(),
            })
            .collect(),
    })
}

/// Create an export default function declaration.
pub fn export_default_function(
    name: impl Into<String>,
    params: Vec<JsPattern>,
    body: Vec<JsStatement>,
) -> JsStatement {
    JsStatement::ExportDefault(JsExportDefault {
        declaration: JsExportDefaultDeclaration::Function(JsFunctionDeclaration {
            id: Some(name.into()),
            params,
            body: JsBlockStatement::with_body(body),
            is_async: false,
            is_generator: false,
        }),
    })
}

/// Create an export default expression.
pub fn export_default(expr: JsExpr) -> JsStatement {
    JsStatement::ExportDefault(JsExportDefault {
        declaration: JsExportDefaultDeclaration::Expression(Box::new(expr)),
    })
}

// ============================================================================
// Patterns
// ============================================================================

/// Create an array pattern.
pub fn array_pattern(elements: Vec<Option<JsPattern>>) -> JsPattern {
    JsPattern::Array(JsArrayPattern { elements })
}

/// Create an object pattern.
pub fn object_pattern(properties: Vec<JsObjectPatternProperty>) -> JsPattern {
    JsPattern::Object(JsObjectPattern { properties })
}

/// Create a rest pattern.
pub fn rest_pattern(argument: JsPattern) -> JsPattern {
    JsPattern::Rest(Box::new(argument))
}

/// Create an assignment pattern (default value).
pub fn assignment_pattern(left: JsPattern, right: JsExpr) -> JsPattern {
    JsPattern::Assignment(JsAssignmentPattern {
        left: Box::new(left),
        right: Box::new(right),
    })
}

/// Create an object pattern property.
pub fn object_prop_pattern(
    key: impl Into<String>,
    value: JsPattern,
    shorthand: bool,
) -> JsObjectPatternProperty {
    JsObjectPatternProperty::Property {
        key: JsPropertyKey::Identifier(key.into()),
        value,
        computed: false,
        shorthand,
    }
}

// ============================================================================
// Svelte Runtime Helpers
// ============================================================================

/// Create a call to a Svelte runtime function ($.xxx).
pub fn svelte_call(method: &str, args: Vec<JsExpr>) -> JsExpr {
    call(member(id("$"), method), args)
}

/// Create $.template(html).
pub fn svelte_template(html: impl Into<String>) -> JsExpr {
    svelte_call("template", vec![template_string(html)])
}

/// Create $.from_html(html) or $.from_html(html, flags).
pub fn svelte_from_html(html: impl Into<String>, flags: Option<i32>) -> JsExpr {
    let mut args = vec![template_string(html)];
    if let Some(f) = flags {
        args.push(number(f as f64));
    }
    svelte_call("from_html", args)
}

/// Create $.first_child(node).
pub fn svelte_first_child(node: JsExpr) -> JsExpr {
    svelte_call("first_child", vec![node])
}

/// Create $.sibling(node) or $.sibling(node, count).
pub fn svelte_sibling(node: JsExpr, count: Option<i32>) -> JsExpr {
    let mut args = vec![node];
    if let Some(c) = count {
        args.push(number(c as f64));
    }
    svelte_call("sibling", args)
}

/// Create $.child(node) or $.child(node, true) for preserving whitespace.
pub fn svelte_child(node: JsExpr, preserve_whitespace: Option<bool>) -> JsExpr {
    let mut args = vec![node];
    if let Some(true) = preserve_whitespace {
        args.push(boolean(true));
    }
    svelte_call("child", args)
}

/// Create $.text() or $.text(content).
pub fn svelte_text(content: Option<JsExpr>) -> JsExpr {
    let args = content.map(|c| vec![c]).unwrap_or_default();
    svelte_call("text", args)
}

/// Create $.comment().
pub fn svelte_comment() -> JsExpr {
    svelte_call("comment", vec![])
}

/// Create $.append(anchor, node).
pub fn svelte_append(anchor: JsExpr, node: JsExpr) -> JsExpr {
    svelte_call("append", vec![anchor, node])
}

/// Create $.template_effect(fn).
pub fn svelte_template_effect(callback: JsExpr) -> JsExpr {
    svelte_call("template_effect", vec![callback])
}

/// Create $.template_effect(fn, values).
pub fn svelte_template_effect_with_values(callback: JsExpr, values: JsExpr) -> JsExpr {
    svelte_call("template_effect", vec![callback, values])
}

/// Create $.set_text(node, text).
pub fn svelte_set_text(node: JsExpr, text: JsExpr) -> JsExpr {
    svelte_call("set_text", vec![node, text])
}

/// Create $.get(source).
pub fn svelte_get(source: JsExpr) -> JsExpr {
    svelte_call("get", vec![source])
}

/// Create $.set(source, value).
pub fn svelte_set(source: JsExpr, value: JsExpr) -> JsExpr {
    svelte_call("set", vec![source, value])
}

/// Create $.set(source, value, true).
pub fn svelte_set_sync(source: JsExpr, value: JsExpr) -> JsExpr {
    svelte_call("set", vec![source, value, true_literal()])
}

/// Create $.state(value).
pub fn svelte_state(value: JsExpr) -> JsExpr {
    svelte_call("state", vec![value])
}

/// Create $.proxy(value).
pub fn svelte_proxy(value: JsExpr) -> JsExpr {
    svelte_call("proxy", vec![value])
}

/// Create $.derived(() => expr).
pub fn svelte_derived(expr: JsExpr) -> JsExpr {
    svelte_call("derived", vec![thunk(expr)])
}

/// Create $.effect(fn).
pub fn svelte_effect(callback: JsExpr) -> JsExpr {
    svelte_call("effect", vec![callback])
}

/// Create $.push(props, runes).
pub fn svelte_push(props: JsExpr, runes: bool) -> JsExpr {
    svelte_call("push", vec![props, boolean(runes)])
}

/// Create $.pop().
pub fn svelte_pop() -> JsExpr {
    svelte_call("pop", vec![])
}

/// Create $.each(anchor, flags, () => collection, key_fn, (anchor, item, index) => { ... }).
pub fn svelte_each(
    anchor: JsExpr,
    flags: i32,
    collection: JsExpr,
    key_fn: JsExpr,
    callback: JsExpr,
) -> JsExpr {
    svelte_call(
        "each",
        vec![
            anchor,
            number(flags as f64),
            thunk(collection),
            key_fn,
            callback,
        ],
    )
}

/// Create $.await(anchor, () => promise, pending_fn, then_fn).
pub fn svelte_await(
    anchor: JsExpr,
    promise_getter: JsExpr,
    pending_fn: Option<JsExpr>,
    then_fn: JsExpr,
) -> JsExpr {
    svelte_call(
        "await",
        vec![
            anchor,
            promise_getter,
            pending_fn.unwrap_or_else(null),
            then_fn,
        ],
    )
}

/// Create $.if(anchor, () => condition, consequent_fn, alternate_fn).
pub fn svelte_if(
    anchor: JsExpr,
    condition_getter: JsExpr,
    consequent_fn: JsExpr,
    alternate_fn: Option<JsExpr>,
) -> JsExpr {
    let mut args = vec![anchor, condition_getter, consequent_fn];
    if let Some(alt) = alternate_fn {
        args.push(alt);
    }
    svelte_call("if", args)
}

/// Create $.element(anchor, tag, is_svg).
pub fn svelte_element(anchor: JsExpr, tag: JsExpr, is_svg: bool) -> JsExpr {
    svelte_call("element", vec![anchor, tag, boolean(is_svg)])
}

/// Create $.delegate(events).
pub fn svelte_delegate(events: Vec<String>) -> JsExpr {
    svelte_call(
        "delegate",
        vec![array(events.into_iter().map(string).collect())],
    )
}

/// Create $.bind_value(element, getter, setter).
pub fn svelte_bind_value(element: JsExpr, getter: JsExpr, setter: JsExpr) -> JsExpr {
    svelte_call("bind_value", vec![element, getter, setter])
}

/// Create $.bind_this(element, setter, getter).
pub fn svelte_bind_this(element: JsExpr, setter: JsExpr, getter: JsExpr) -> JsExpr {
    svelte_call("bind_this", vec![element, setter, getter])
}

/// Create $.prop(props, name, flags, fallback).
pub fn svelte_prop(
    props: JsExpr,
    name: impl Into<String>,
    flags: i32,
    fallback: Option<JsExpr>,
) -> JsExpr {
    let mut args = vec![props, string(name), number(flags as f64)];
    if let Some(fb) = fallback {
        args.push(fb);
    }
    svelte_call("prop", args)
}

/// Create $.rest_props(props, exclude).
pub fn svelte_rest_props(props: JsExpr, exclude: Vec<String>) -> JsExpr {
    svelte_call(
        "rest_props",
        vec![props, array(exclude.into_iter().map(string).collect())],
    )
}

/// Create $.update(source) or $.update(source, delta).
pub fn svelte_update(source: JsExpr, delta: Option<i32>) -> JsExpr {
    let mut args = vec![source];
    if let Some(d) = delta {
        args.push(number(d as f64));
    }
    svelte_call("update", args)
}

/// Create $.reset(element).
pub fn svelte_reset(element: JsExpr) -> JsExpr {
    svelte_call("reset", vec![element])
}

/// Create $.next().
pub fn svelte_next(count: Option<i32>) -> JsExpr {
    let args = if let Some(c) = count {
        vec![number(c as f64)]
    } else {
        vec![]
    };
    svelte_call("next", args)
}

/// Create $.attr(element, name, value).
pub fn svelte_attr(element: JsExpr, name: impl Into<String>, value: JsExpr) -> JsExpr {
    svelte_call("attr", vec![element, string(name), value])
}

/// Create $.set_attribute(element, name, value).
pub fn svelte_set_attribute(element: JsExpr, name: impl Into<String>, value: JsExpr) -> JsExpr {
    svelte_call("set_attribute", vec![element, string(name), value])
}

/// Create $.remove_input_defaults(element).
pub fn svelte_remove_input_defaults(element: JsExpr) -> JsExpr {
    svelte_call("remove_input_defaults", vec![element])
}

/// Create $.index (reference to the index key function).
pub fn svelte_index() -> JsExpr {
    member(id("$"), "index")
}

/// Create $.autofocus(element, value).
pub fn svelte_autofocus(element: JsExpr, value: bool) -> JsExpr {
    svelte_call("autofocus", vec![element, boolean(value)])
}

/// Create $.set_custom_element_data(element, name, value).
pub fn svelte_set_custom_element_data(
    element: JsExpr,
    name: impl Into<String>,
    value: JsExpr,
) -> JsExpr {
    svelte_call(
        "set_custom_element_data",
        vec![element, string(name), value],
    )
}

/// Create $.html(node, fn).
pub fn svelte_html(node: JsExpr, getter: JsExpr) -> JsExpr {
    svelte_call("html", vec![node, getter])
}

/// Create $.set_class(element, flags, class_attr, class_binding, class_map, class_directives).
pub fn svelte_set_class(
    element: JsExpr,
    flags: JsExpr,
    class_attr: JsExpr,
    class_binding: JsExpr,
    class_map: JsExpr,
    class_directives: JsExpr,
) -> JsExpr {
    svelte_call(
        "set_class",
        vec![
            element,
            flags,
            class_attr,
            class_binding,
            class_map,
            class_directives,
        ],
    )
}

/// Create $.set_style(element, style_attr, style_binding, style_directives).
pub fn svelte_set_style(
    element: JsExpr,
    style_attr: JsExpr,
    style_binding: JsExpr,
    style_directives: JsExpr,
) -> JsExpr {
    svelte_call(
        "set_style",
        vec![element, style_attr, style_binding, style_directives],
    )
}

// ============================================================================
// DOM Manipulation Helpers
// ============================================================================

/// Create element.textContent = value assignment.
pub fn set_text_content(element: JsExpr, value: JsExpr) -> JsExpr {
    assign(member(element, "textContent"), value)
}

/// Create option.value = option.__value = value assignment.
pub fn set_option_value(option: JsExpr, value: JsExpr) -> JsExpr {
    // option.value = option.__value = value
    assign(
        member(option.clone(), "value"),
        assign(member(option, "__value"), value),
    )
}

/// Create element.prop = value assignment for a property.
pub fn set_property(element: JsExpr, prop: impl Into<String>, value: JsExpr) -> JsExpr {
    assign(member(element, prop), value)
}

// ============================================================================
// Program Building
// ============================================================================

/// Create a new program.
pub fn program(body: Vec<JsStatement>) -> JsProgram {
    JsProgram::with_body(body)
}

/// Create a raw JavaScript expression.
///
/// This creates a Raw node containing arbitrary JavaScript code.
/// Use with caution - the string should be valid JavaScript.
pub fn raw(code: impl Into<String>) -> JsExpr {
    JsExpr::Raw(code.into())
}

/// Alias for `number` to match JavaScript builder API.
pub fn literal_number(value: f64) -> JsExpr {
    number(value)
}
