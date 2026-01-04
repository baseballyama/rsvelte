//! JavaScript expression parsing using oxc.
//!
//! This module handles parsing JavaScript expressions from Svelte templates
//! and converts them to a serde_json::Value format compatible with Svelte's AST.

use oxc_allocator::Allocator;
use oxc_ast::ast::Expression as OxcExpression;
use oxc_parser::Parser as OxcParser;
use oxc_span::{GetSpan, SourceType};
use serde_json::{Map, Value};

use crate::ast::js::Expression;

/// Parse a JavaScript expression and return it as an Expression.
pub fn parse_expression(content: &str, offset: usize, line_offsets: &[usize]) -> Expression {
    let allocator = Allocator::default();
    let source_type = SourceType::mjs();

    // Try to parse as an expression by wrapping it
    let wrapped = format!("({})", content);
    let parser = OxcParser::new(&allocator, &wrapped, source_type);
    let result = parser.parse();

    if result.errors.is_empty() {
        if let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
            result.program.body.first()
        {
            // Adjust positions: subtract 1 for the opening paren we added
            return convert_expression(&expr_stmt.expression, offset, line_offsets);
        }
    }

    // Fallback: return as simple identifier if parsing fails
    create_identifier(content, offset, offset + content.len(), line_offsets)
}

/// Convert an oxc Expression to our JSON-based Expression format.
fn convert_expression(expr: &OxcExpression, offset: usize, line_offsets: &[usize]) -> Expression {
    match expr {
        OxcExpression::Identifier(id) => {
            let start = offset + id.span.start as usize - 1; // -1 for the paren we added
            let end = offset + id.span.end as usize - 1;
            create_identifier(&id.name, start, end, line_offsets)
        }
        OxcExpression::BinaryExpression(bin) => {
            let start = offset + bin.span.start as usize - 1;
            let end = offset + bin.span.end as usize - 1;
            create_binary_expression(
                &bin.left,
                &bin.operator,
                &bin.right,
                start,
                end,
                offset,
                line_offsets,
            )
        }
        OxcExpression::NumericLiteral(num) => {
            let start = offset + num.span.start as usize - 1;
            let end = offset + num.span.end as usize - 1;
            let raw = num.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_numeric_literal(num.value, raw, start, end, line_offsets)
        }
        OxcExpression::StringLiteral(str_lit) => {
            let start = offset + str_lit.span.start as usize - 1;
            let end = offset + str_lit.span.end as usize - 1;
            let raw = str_lit.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_string_literal(&str_lit.value, raw, start, end, line_offsets)
        }
        OxcExpression::BooleanLiteral(bool_lit) => {
            let start = offset + bool_lit.span.start as usize - 1;
            let end = offset + bool_lit.span.end as usize - 1;
            let raw = if bool_lit.value { "true" } else { "false" };
            create_literal(Value::Bool(bool_lit.value), raw, start, end, line_offsets)
        }
        OxcExpression::NullLiteral(null_lit) => {
            let start = offset + null_lit.span.start as usize - 1;
            let end = offset + null_lit.span.end as usize - 1;
            create_literal(Value::Null, "null", start, end, line_offsets)
        }
        OxcExpression::CallExpression(call) => {
            let start = offset + call.span.start as usize - 1;
            let end = offset + call.span.end as usize - 1;
            create_call_expression(call, start, end, offset, line_offsets)
        }
        OxcExpression::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_static_member_expression(member, start, end, offset, line_offsets)
        }
        OxcExpression::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_computed_member_expression(member, start, end, offset, line_offsets)
        }
        OxcExpression::ParenthesizedExpression(paren) => {
            // For parenthesized expressions, just return the inner expression
            convert_expression(&paren.expression, offset, line_offsets)
        }
        OxcExpression::LogicalExpression(logical) => {
            let start = offset + logical.span.start as usize - 1;
            let end = offset + logical.span.end as usize - 1;
            create_logical_expression(logical, start, end, offset, line_offsets)
        }
        OxcExpression::UnaryExpression(unary) => {
            let start = offset + unary.span.start as usize - 1;
            let end = offset + unary.span.end as usize - 1;
            create_unary_expression(unary, start, end, offset, line_offsets)
        }
        OxcExpression::ConditionalExpression(cond) => {
            let start = offset + cond.span.start as usize - 1;
            let end = offset + cond.span.end as usize - 1;
            create_conditional_expression(cond, start, end, offset, line_offsets)
        }
        OxcExpression::ArrayExpression(arr) => {
            let start = offset + arr.span.start as usize - 1;
            let end = offset + arr.span.end as usize - 1;
            create_array_expression(arr, start, end, offset, line_offsets)
        }
        OxcExpression::ObjectExpression(obj) => {
            let start = offset + obj.span.start as usize - 1;
            let end = offset + obj.span.end as usize - 1;
            create_object_expression(obj, start, end, offset, line_offsets)
        }
        OxcExpression::ArrowFunctionExpression(arrow) => {
            let start = offset + arrow.span.start as usize - 1;
            let end = offset + arrow.span.end as usize - 1;
            create_arrow_function(arrow, start, end, offset, line_offsets)
        }
        OxcExpression::TemplateLiteral(template) => {
            let start = offset + template.span.start as usize - 1;
            let end = offset + template.span.end as usize - 1;
            create_template_literal(template, start, end, offset, line_offsets)
        }
        // Add more expression types as needed
        _ => {
            // Fallback for unsupported expression types
            let span = expr.span();
            let start = offset + span.start as usize - 1;
            let end = offset + span.end as usize - 1;
            create_identifier("unknown", start, end, line_offsets)
        }
    }
}

fn create_identifier(name: &str, start: usize, end: usize, line_offsets: &[usize]) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Identifier".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("name".to_string(), Value::String(name.to_string()));
    Expression::Value(Value::Object(obj))
}

fn create_literal(
    value: Value,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("value".to_string(), value);
    obj.insert("raw".to_string(), Value::String(raw.to_string()));
    Expression::Value(Value::Object(obj))
}

fn create_numeric_literal(
    value: f64,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    // Use integer if it's a whole number
    if value.fract() == 0.0 && value.abs() < i64::MAX as f64 {
        obj.insert("value".to_string(), Value::Number((value as i64).into()));
    } else {
        obj.insert(
            "value".to_string(),
            serde_json::Number::from_f64(value)
                .map(Value::Number)
                .unwrap_or(Value::Null),
        );
    }
    obj.insert("raw".to_string(), Value::String(raw.to_string()));
    Expression::Value(Value::Object(obj))
}

fn create_string_literal(
    value: &str,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("value".to_string(), Value::String(value.to_string()));
    obj.insert("raw".to_string(), Value::String(raw.to_string()));
    Expression::Value(Value::Object(obj))
}

fn create_binary_expression(
    left: &OxcExpression,
    operator: &oxc_ast::ast::BinaryOperator,
    right: &OxcExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("BinaryExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let left_expr = convert_expression(left, offset, line_offsets);
    let right_expr = convert_expression(right, offset, line_offsets);

    obj.insert("left".to_string(), left_expr.as_json().clone());
    obj.insert(
        "operator".to_string(),
        Value::String(binary_operator_to_string(operator)),
    );
    obj.insert("right".to_string(), right_expr.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn create_logical_expression(
    logical: &oxc_ast::ast::LogicalExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("LogicalExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let left_expr = convert_expression(&logical.left, offset, line_offsets);
    let right_expr = convert_expression(&logical.right, offset, line_offsets);

    obj.insert("left".to_string(), left_expr.as_json().clone());
    obj.insert(
        "operator".to_string(),
        Value::String(logical_operator_to_string(&logical.operator)),
    );
    obj.insert("right".to_string(), right_expr.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn create_unary_expression(
    unary: &oxc_ast::ast::UnaryExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("UnaryExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert(
        "operator".to_string(),
        Value::String(unary_operator_to_string(&unary.operator)),
    );
    obj.insert("prefix".to_string(), Value::Bool(true));

    let argument = convert_expression(&unary.argument, offset, line_offsets);
    obj.insert("argument".to_string(), argument.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn create_conditional_expression(
    cond: &oxc_ast::ast::ConditionalExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ConditionalExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let test = convert_expression(&cond.test, offset, line_offsets);
    let consequent = convert_expression(&cond.consequent, offset, line_offsets);
    let alternate = convert_expression(&cond.alternate, offset, line_offsets);

    obj.insert("test".to_string(), test.as_json().clone());
    obj.insert("consequent".to_string(), consequent.as_json().clone());
    obj.insert("alternate".to_string(), alternate.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn create_call_expression(
    call: &oxc_ast::ast::CallExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("CallExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let callee = convert_expression(&call.callee, offset, line_offsets);
    obj.insert("callee".to_string(), callee.as_json().clone());

    let args: Vec<Value> = call
        .arguments
        .iter()
        .filter_map(|arg| {
            match arg {
                oxc_ast::ast::Argument::SpreadElement(_) => None, // Simplified
                _ => {
                    let expr = arg.to_expression();
                    Some(
                        convert_expression(expr, offset, line_offsets)
                            .as_json()
                            .clone(),
                    )
                }
            }
        })
        .collect();
    obj.insert("arguments".to_string(), Value::Array(args));
    obj.insert("optional".to_string(), Value::Bool(call.optional));

    Expression::Value(Value::Object(obj))
}

fn create_static_member_expression(
    member: &oxc_ast::ast::StaticMemberExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("MemberExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let object = convert_expression(&member.object, offset, line_offsets);
    obj.insert("object".to_string(), object.as_json().clone());

    let prop_start = offset + member.property.span.start as usize - 1;
    let prop_end = offset + member.property.span.end as usize - 1;
    let property = create_identifier(&member.property.name, prop_start, prop_end, line_offsets);
    obj.insert("property".to_string(), property.as_json().clone());
    obj.insert("computed".to_string(), Value::Bool(false));
    obj.insert("optional".to_string(), Value::Bool(member.optional));

    Expression::Value(Value::Object(obj))
}

fn create_computed_member_expression(
    member: &oxc_ast::ast::ComputedMemberExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("MemberExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let object = convert_expression(&member.object, offset, line_offsets);
    obj.insert("object".to_string(), object.as_json().clone());

    let property = convert_expression(&member.expression, offset, line_offsets);
    obj.insert("property".to_string(), property.as_json().clone());
    obj.insert("computed".to_string(), Value::Bool(true));
    obj.insert("optional".to_string(), Value::Bool(member.optional));

    Expression::Value(Value::Object(obj))
}

fn create_array_expression(
    arr: &oxc_ast::ast::ArrayExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrayExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let elements: Vec<Value> = arr
        .elements
        .iter()
        .map(|elem| match elem {
            oxc_ast::ast::ArrayExpressionElement::SpreadElement(_) => Value::Null,
            oxc_ast::ast::ArrayExpressionElement::Elision(_) => Value::Null,
            _ => {
                let expr = elem.to_expression();
                convert_expression(expr, offset, line_offsets)
                    .as_json()
                    .clone()
            }
        })
        .collect();
    obj.insert("elements".to_string(), Value::Array(elements));

    Expression::Value(Value::Object(obj))
}

fn create_object_expression(
    _obj_expr: &oxc_ast::ast::ObjectExpression,
    start: usize,
    end: usize,
    _offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ObjectExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Simplified: just return empty properties
    obj.insert("properties".to_string(), Value::Array(Vec::new()));

    Expression::Value(Value::Object(obj))
}

fn create_arrow_function(
    arrow: &oxc_ast::ast::ArrowFunctionExpression,
    start: usize,
    end: usize,
    _offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrowFunctionExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("async".to_string(), Value::Bool(arrow.r#async));
    obj.insert("expression".to_string(), Value::Bool(arrow.expression));
    obj.insert("params".to_string(), Value::Array(Vec::new())); // Simplified
    obj.insert("body".to_string(), Value::Null); // Simplified

    Expression::Value(Value::Object(obj))
}

fn create_template_literal(
    _template: &oxc_ast::ast::TemplateLiteral,
    start: usize,
    end: usize,
    _offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TemplateLiteral".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("quasis".to_string(), Value::Array(Vec::new())); // Simplified
    obj.insert("expressions".to_string(), Value::Array(Vec::new())); // Simplified

    Expression::Value(Value::Object(obj))
}

fn binary_operator_to_string(op: &oxc_ast::ast::BinaryOperator) -> String {
    use oxc_ast::ast::BinaryOperator::*;
    match op {
        Equality => "==",
        Inequality => "!=",
        StrictEquality => "===",
        StrictInequality => "!==",
        LessThan => "<",
        LessEqualThan => "<=",
        GreaterThan => ">",
        GreaterEqualThan => ">=",
        Addition => "+",
        Subtraction => "-",
        Multiplication => "*",
        Division => "/",
        Remainder => "%",
        Exponential => "**",
        BitwiseAnd => "&",
        BitwiseOR => "|",
        BitwiseXOR => "^",
        ShiftLeft => "<<",
        ShiftRight => ">>",
        ShiftRightZeroFill => ">>>",
        In => "in",
        Instanceof => "instanceof",
    }
    .to_string()
}

fn logical_operator_to_string(op: &oxc_ast::ast::LogicalOperator) -> String {
    use oxc_ast::ast::LogicalOperator::*;
    match op {
        And => "&&",
        Or => "||",
        Coalesce => "??",
    }
    .to_string()
}

fn unary_operator_to_string(op: &oxc_ast::ast::UnaryOperator) -> String {
    use oxc_ast::ast::UnaryOperator::*;
    match op {
        UnaryNegation => "-",
        UnaryPlus => "+",
        LogicalNot => "!",
        BitwiseNot => "~",
        Typeof => "typeof",
        Void => "void",
        Delete => "delete",
    }
    .to_string()
}

fn create_loc(start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let start_loc = get_line_column(start, line_offsets);
    let end_loc = get_line_column(end, line_offsets);

    let mut loc = Map::new();

    let mut start_obj = Map::new();
    start_obj.insert(
        "line".to_string(),
        Value::Number((start_loc.0 as i64).into()),
    );
    start_obj.insert(
        "column".to_string(),
        Value::Number((start_loc.1 as i64).into()),
    );

    let mut end_obj = Map::new();
    end_obj.insert("line".to_string(), Value::Number((end_loc.0 as i64).into()));
    end_obj.insert(
        "column".to_string(),
        Value::Number((end_loc.1 as i64).into()),
    );

    loc.insert("start".to_string(), Value::Object(start_obj));
    loc.insert("end".to_string(), Value::Object(end_obj));

    Value::Object(loc)
}

fn get_line_column(pos: usize, line_offsets: &[usize]) -> (u32, u32) {
    let line = line_offsets
        .partition_point(|&offset| offset <= pos)
        .saturating_sub(1);
    let line_start = line_offsets.get(line).copied().unwrap_or(0);
    let column = pos - line_start;
    ((line + 1) as u32, column as u32)
}
