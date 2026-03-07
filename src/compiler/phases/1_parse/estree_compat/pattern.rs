//! ESTree conversion for pattern AST nodes
//!
//! Handles conversion of patterns (BindingPattern) used in variable declarations, parameters, etc.

use serde_json::Value;

/// Convert OXC BindingPattern to ESTree JSON format
pub fn convert_binding_pattern(
    _pattern: &oxc_ast::ast::BindingPattern,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: Not yet implemented
    Value::Null
}
