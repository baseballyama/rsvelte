//! Expression系ASTノードのESTree変換
//!
//! このモジュールは、OXCのExpression ASTノードをESTree互換のJSON形式に変換します。

use oxc_ast::ast::Expression as OxcExpression;
use oxc_span::GetSpan;
use serde_json::{Map, Value};

use super::utils::create_loc;

/// OXC ExpressionをESTree JSON形式に変換
///
/// # 引数
///
/// * `expr` - OXC Expression
/// * `source` - ソースコード（raw値の取得に使用）
/// * `offset` - ドキュメント内のオフセット
/// * `line_offsets` - 行オフセットテーブル
pub fn convert_expression(
    expr: &OxcExpression,
    source: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + expr.span().start as usize;
    let end = offset + expr.span().end as usize;

    match expr {
        OxcExpression::Identifier(id) => create_identifier(&id.name, start, end, line_offsets),
        OxcExpression::NumericLiteral(num) => {
            create_numeric_literal(num, start, end, source, line_offsets)
        }
        OxcExpression::StringLiteral(str_lit) => {
            create_string_literal(&str_lit.value, start, end, source, line_offsets)
        }
        OxcExpression::BooleanLiteral(bool_lit) => {
            create_boolean_literal(bool_lit.value, start, end, line_offsets)
        }
        OxcExpression::NullLiteral(_) => create_null_literal(start, end, line_offsets),
        OxcExpression::BinaryExpression(bin) => {
            convert_binary_expression(bin, source, offset, line_offsets)
        }
        OxcExpression::LogicalExpression(logical) => {
            convert_logical_expression(logical, source, offset, line_offsets)
        }
        OxcExpression::UnaryExpression(unary) => {
            convert_unary_expression(unary, source, offset, line_offsets)
        }
        OxcExpression::ConditionalExpression(cond) => {
            convert_conditional_expression(cond, source, offset, line_offsets)
        }
        OxcExpression::CallExpression(call) => {
            convert_call_expression(call, source, offset, line_offsets)
        }
        OxcExpression::StaticMemberExpression(member) => {
            convert_static_member_expression(member, source, offset, line_offsets)
        }
        OxcExpression::ComputedMemberExpression(member) => {
            convert_computed_member_expression(member, source, offset, line_offsets)
        }
        OxcExpression::ArrayExpression(arr) => {
            convert_array_expression(arr, source, offset, line_offsets)
        }
        OxcExpression::ObjectExpression(obj) => {
            convert_object_expression(obj, source, offset, line_offsets)
        }
        OxcExpression::AssignmentExpression(assign) => {
            convert_assignment_expression(assign, source, offset, line_offsets)
        }
        OxcExpression::UpdateExpression(update) => {
            convert_update_expression(update, source, offset, line_offsets)
        }
        OxcExpression::SequenceExpression(seq) => {
            convert_sequence_expression(seq, source, offset, line_offsets)
        }
        OxcExpression::ArrowFunctionExpression(arrow) => {
            convert_arrow_function(arrow, source, offset, line_offsets)
        }
        OxcExpression::ParenthesizedExpression(paren) => {
            // 括弧は展開する
            convert_expression(&paren.expression, source, offset, line_offsets)
        }
        _ => {
            // 未実装のノードタイプは警告を出してプレースホルダーを返す
            eprintln!("Warning: Unimplemented expression type in ESTree conversion");
            create_identifier("__UNIMPLEMENTED__", start, end, line_offsets)
        }
    }
}

// ============================================================================
// Identifier
// ============================================================================

fn create_identifier(name: &str, start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Identifier".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("name".to_string(), Value::String(name.to_string()));
    Value::Object(obj)
}

// ============================================================================
// Literals
// ============================================================================

fn create_numeric_literal(
    num: &oxc_ast::ast::NumericLiteral,
    start: usize,
    end: usize,
    source: &str,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    if let Some(num_value) = serde_json::Number::from_f64(num.value) {
        obj.insert("value".to_string(), Value::Number(num_value));
    }

    let raw = &source[start..end];
    obj.insert("raw".to_string(), Value::String(raw.to_string()));

    Value::Object(obj)
}

fn create_string_literal(
    value: &str,
    start: usize,
    end: usize,
    source: &str,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("value".to_string(), Value::String(value.to_string()));

    let raw = &source[start..end];
    obj.insert("raw".to_string(), Value::String(raw.to_string()));

    Value::Object(obj)
}

fn create_boolean_literal(value: bool, start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("value".to_string(), Value::Bool(value));
    obj.insert("raw".to_string(), Value::String(value.to_string()));
    Value::Object(obj)
}

fn create_null_literal(start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("value".to_string(), Value::Null);
    obj.insert("raw".to_string(), Value::String("null".to_string()));
    Value::Object(obj)
}

// ============================================================================
// Binary and Logical Expressions
// ============================================================================

fn convert_binary_expression(
    bin: &oxc_ast::ast::BinaryExpression,
    source: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + bin.span.start as usize;
    let end = offset + bin.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("BinaryExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert(
        "operator".to_string(),
        Value::String(bin.operator.as_str().to_string()),
    );
    obj.insert(
        "left".to_string(),
        convert_expression(&bin.left, source, offset, line_offsets),
    );
    obj.insert(
        "right".to_string(),
        convert_expression(&bin.right, source, offset, line_offsets),
    );

    Value::Object(obj)
}

fn convert_logical_expression(
    logical: &oxc_ast::ast::LogicalExpression,
    source: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + logical.span.start as usize;
    let end = offset + logical.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("LogicalExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert(
        "operator".to_string(),
        Value::String(logical.operator.as_str().to_string()),
    );
    obj.insert(
        "left".to_string(),
        convert_expression(&logical.left, source, offset, line_offsets),
    );
    obj.insert(
        "right".to_string(),
        convert_expression(&logical.right, source, offset, line_offsets),
    );

    Value::Object(obj)
}

// ============================================================================
// Placeholder implementations (to be completed)
// ============================================================================

fn convert_unary_expression(
    _unary: &oxc_ast::ast::UnaryExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_conditional_expression(
    _cond: &oxc_ast::ast::ConditionalExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_call_expression(
    _call: &oxc_ast::ast::CallExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_static_member_expression(
    _member: &oxc_ast::ast::StaticMemberExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_computed_member_expression(
    _member: &oxc_ast::ast::ComputedMemberExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_array_expression(
    _arr: &oxc_ast::ast::ArrayExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_object_expression(
    _obj: &oxc_ast::ast::ObjectExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_assignment_expression(
    _assign: &oxc_ast::ast::AssignmentExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_update_expression(
    _update: &oxc_ast::ast::UpdateExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_sequence_expression(
    _seq: &oxc_ast::ast::SequenceExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

fn convert_arrow_function(
    _arrow: &oxc_ast::ast::ArrowFunctionExpression,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}
