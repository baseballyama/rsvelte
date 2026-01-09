//! ESTree変換用のユーティリティ関数

use serde_json::{Map, Value};

/// 行オフセットテーブルを計算
///
/// ソースコード内の各行の開始位置（バイトオフセット）を記録します。
/// これにより、バイトオフセットから行番号と列番号を効率的に計算できます。
///
/// # 例
///
/// ```ignore
/// let source = "line1\nline2\nline3";
/// let offsets = compute_line_offsets(source);
/// // offsets = [0, 6, 12] (各行の開始位置)
/// ```
pub fn compute_line_offsets(source: &str) -> Vec<usize> {
    let mut offsets = vec![0];
    for (i, ch) in source.char_indices() {
        if ch == '\n' {
            offsets.push(i + 1);
        }
    }
    offsets
}

/// バイトオフセットから行番号と列番号を計算
///
/// # 引数
///
/// * `pos` - バイトオフセット
/// * `line_offsets` - 行オフセットテーブル
///
/// # 戻り値
///
/// (行番号, 列番号) のタプル（1-indexed）
pub fn get_line_column(pos: usize, line_offsets: &[usize]) -> (u32, u32) {
    let line = line_offsets
        .partition_point(|&offset| offset <= pos)
        .saturating_sub(1);
    let line_start = line_offsets.get(line).copied().unwrap_or(0);
    let column = pos - line_start;
    ((line + 1) as u32, column as u32)
}

/// ESTree形式のloc（位置情報）オブジェクトを作成
///
/// # 引数
///
/// * `start` - 開始バイトオフセット
/// * `end` - 終了バイトオフセット
/// * `line_offsets` - 行オフセットテーブル
///
/// # 戻り値
///
/// ```json
/// {
///   "start": { "line": 1, "column": 0 },
///   "end": { "line": 1, "column": 5 }
/// }
/// ```
pub fn create_loc(start: usize, end: usize, line_offsets: &[usize]) -> Value {
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

/// ESTree形式のloc（character付き）オブジェクトを作成
///
/// Svelte固有の拡張で、locオブジェクトにcharacter（バイトオフセット）フィールドを追加します。
/// スニペット名などのSvelteレベルの識別子に使用されます。
pub fn create_loc_with_character(start: usize, end: usize, line_offsets: &[usize]) -> Value {
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
    start_obj.insert(
        "character".to_string(),
        Value::Number((start as i64).into()),
    );

    let mut end_obj = Map::new();
    end_obj.insert("line".to_string(), Value::Number((end_loc.0 as i64).into()));
    end_obj.insert(
        "column".to_string(),
        Value::Number((end_loc.1 as i64).into()),
    );
    end_obj.insert("character".to_string(), Value::Number((end as i64).into()));

    loc.insert("start".to_string(), Value::Object(start_obj));
    loc.insert("end".to_string(), Value::Object(end_obj));

    Value::Object(loc)
}

/// ブロックコメントのインデント正規化
///
/// 複数行にまたがるブロックコメントから、共通の先頭インデントを削除します。
/// これはSvelteの動作と一致します。
///
/// # 引数
///
/// * `value` - コメントテキスト（/* と */ を除く）
/// * `source` - 完全なソースコード
/// * `comment_start` - ソースコード内のコメント開始位置
pub fn normalize_block_comment_indentation(
    value: &str,
    source: &str,
    comment_start: usize,
) -> String {
    // 改行を含まない場合は正規化不要
    if !value.contains('\n') {
        return value.to_string();
    }

    // コメントが開始する行の先頭を見つける
    let mut line_start = comment_start;
    while line_start > 0 && source.as_bytes().get(line_start - 1) != Some(&b'\n') {
        line_start -= 1;
    }

    // 行の先頭の空白を収集
    let mut indent_end = line_start;
    while indent_end < source.len() {
        match source.as_bytes().get(indent_end) {
            Some(b' ') | Some(b'\t') => indent_end += 1,
            _ => break,
        }
    }

    let indentation = &source[line_start..indent_end];
    if indentation.is_empty() {
        return value.to_string();
    }

    // コメント内の各行からこのインデントを削除
    let pattern = format!("\n{}", indentation);
    value.replace(&pattern, "\n")
}

/// コメント値の抽出（デリミタを除去）
///
/// # 引数
///
/// * `raw` - 生のコメントテキスト（// や /* */ を含む）
/// * `kind` - コメントの種類
pub fn extract_comment_value(raw: &str, kind: oxc_ast::ast::CommentKind) -> String {
    match kind {
        oxc_ast::ast::CommentKind::Line => raw.strip_prefix("//").unwrap_or(raw).to_string(),
        oxc_ast::ast::CommentKind::SingleLineBlock | oxc_ast::ast::CommentKind::MultiLineBlock => {
            let stripped = raw.strip_prefix("/*").unwrap_or(raw);
            stripped.strip_suffix("*/").unwrap_or(stripped).to_string()
        }
    }
}

/// ESTree形式のコメントオブジェクトを作成
pub fn create_comment_object(
    kind: oxc_ast::ast::CommentKind,
    value: String,
    start: usize,
    end: usize,
) -> Value {
    let mut obj = Map::new();

    let comment_type = match kind {
        oxc_ast::ast::CommentKind::Line => "Line",
        oxc_ast::ast::CommentKind::SingleLineBlock | oxc_ast::ast::CommentKind::MultiLineBlock => {
            "Block"
        }
    };

    obj.insert("type".to_string(), Value::String(comment_type.to_string()));
    obj.insert("value".to_string(), Value::String(value));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));

    Value::Object(obj)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_line_offsets() {
        let source = "line1\nline2\nline3";
        let offsets = compute_line_offsets(source);
        assert_eq!(offsets, vec![0, 6, 12]);
    }

    #[test]
    fn test_get_line_column() {
        let source = "line1\nline2\nline3";
        let offsets = compute_line_offsets(source);

        // "line1" の 'l' (位置0)
        assert_eq!(get_line_column(0, &offsets), (1, 0));

        // "line2" の 'l' (位置6)
        assert_eq!(get_line_column(6, &offsets), (2, 0));

        // "line2" の '2' (位置10)
        assert_eq!(get_line_column(10, &offsets), (2, 4));
    }

    #[test]
    fn test_normalize_block_comment_indentation() {
        let source = "  /* comment\n     line2 */";
        let value = " comment\n     line2 ";
        let result = normalize_block_comment_indentation(value, source, 2);
        assert_eq!(result, " comment\n   line2 ");
    }
}
