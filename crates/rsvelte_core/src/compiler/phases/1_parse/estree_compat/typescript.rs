//! ESTree conversion for TypeScript type annotations

use serde_json::Value;

/// Convert OXC TSType to ESTree JSON format
pub fn convert_ts_type(
    _ts_type: &oxc_ast::ast::TSType,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: Not yet implemented
    Value::Null
}

/// Convert OXC TSTypeAnnotation to ESTree JSON format
pub fn convert_type_annotation(
    _type_annotation: &oxc_ast::ast::TSTypeAnnotation,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: Not yet implemented
    Value::Null
}
