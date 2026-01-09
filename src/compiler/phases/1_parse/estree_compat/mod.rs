//! ESTree互換形式への変換層
//!
//! このモジュールは、Rustコンパイラが使用する独自のAST構造を、
//! 公式Svelteコンパイラ（JavaScript）が出力するESTree形式のJSONに変換します。
//!
//! ## 目的
//!
//! - **テスト互換性**: 公式Svelteコンパイラのテストスイートとの比較
//! - **レガシー互換性**: 既存ツールとの統合
//!
//! ## 重要な注意事項
//!
//! このモジュールは**コンパイラのコア機能には不要**です。
//! Rustコンパイラは独自のAST構造を使ってSvelteファイルをJSコードにコンパイルします。
//! ESTree形式への変換は、テスト目的でのみ使用されます。
//!
//! ## アーキテクチャ
//!
//! ```
//! OXC AST (Rust構造体)
//!     ↓
//! [estree_compat 変換層] ← このモジュール
//!     ↓
//! ESTree JSON (serde_json::Value)
//!     ↓
//! テストフィクスチャとの比較
//! ```

pub mod expression;
pub mod pattern;
pub mod statement;
pub mod typescript;
pub mod utils;

use serde_json::Value;

/// OXC ASTをESTree互換のJSON形式に変換する公開API
///
/// # 引数
///
/// * `ast` - OXCパーサーから得られたAST
/// * `source` - 元のソースコード（コメント処理に使用）
/// * `offset` - ソースコード内のオフセット（部分パース時）
/// * `line_offsets` - 行オフセットテーブル（位置情報計算用）
///
/// # 戻り値
///
/// ESTree形式のJSON（serde_json::Value）
///
/// # 使用例
///
/// ```ignore
/// use oxc_parser::Parser;
/// use oxc_allocator::Allocator;
///
/// let source = "const x = 1 + 2;";
/// let allocator = Allocator::default();
/// let parser = Parser::new(&allocator, source, SourceType::default());
/// let result = parser.parse();
///
/// let line_offsets = compute_line_offsets(source);
/// let estree_json = convert_expression_to_estree(
///     &result.program.body[0].expression,
///     source,
///     0,
///     &line_offsets
/// );
/// ```
pub fn convert_expression_to_estree(
    expr: &oxc_ast::ast::Expression,
    source: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    expression::convert_expression(expr, source, offset, line_offsets)
}

/// プログラム全体をESTree互換のJSON形式に変換
pub fn convert_program_to_estree(
    program: &oxc_ast::ast::Program,
    source: &str,
    line_offsets: &[usize],
) -> Value {
    statement::convert_program(program, source, line_offsets)
}

/// 行オフセットテーブルを計算
///
/// ESTreeは行番号と列番号を要求しますが、OXCはバイトオフセットのみを提供します。
/// この関数は、バイトオフセットから行番号と列番号を計算するためのテーブルを構築します。
pub fn compute_line_offsets(source: &str) -> Vec<usize> {
    utils::compute_line_offsets(source)
}
