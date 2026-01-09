//! Statement系ASTノードのESTree変換

use serde_json::{Map, Value};

/// OXC ProgramをESTree JSON形式に変換
pub fn convert_program(
    _program: &oxc_ast::ast::Program,
    _source: &str,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
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
