//! ESTree conversion for statement AST nodes

use serde_json::{Map, Value};

/// Convert OXC Program to ESTree JSON format
pub fn convert_program(
    _program: &oxc_ast::ast::Program,
    _source: &str,
    _line_offsets: &[usize],
) -> Value {
    // TODO: Not yet implemented
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Program".to_string()));
    obj.insert("start".to_string(), Value::Number(0.into()));
    obj.insert("end".to_string(), Value::Number(0.into()));
    obj.insert("body".to_string(), Value::Array(vec![]));
    obj.insert(
        "sourceType".to_string(),
        Value::String("module".to_string()),
    );
    Value::Object(obj)
}
