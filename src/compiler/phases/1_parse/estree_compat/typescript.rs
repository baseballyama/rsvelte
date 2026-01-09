//! TypeScript型アノテーションのESTree変換

use serde_json::Value;

/// OXC TSTypeをESTree JSON形式に変換
pub fn convert_ts_type(
    _ts_type: &oxc_ast::ast::TSType,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}

/// OXC TSTypeAnnotationをESTree JSON形式に変換
pub fn convert_type_annotation(
    _type_annotation: &oxc_ast::ast::TSTypeAnnotation,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}
