//! Pattern系ASTノードのESTree変換
//!
//! 変数宣言やパラメータなどで使用されるパターン（BindingPattern）の変換を扱います。

use serde_json::Value;

/// OXC BindingPatternをESTree JSON形式に変換
pub fn convert_binding_pattern(
    _pattern: &oxc_ast::ast::BindingPattern,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}
