//! Source-range and source-text accessors for template expressions, including
//! the TS-assertion stripping the svelte2tsx parse path has to do by scanning
//! the source (the template-expression arena isn't resolvable here).

use crate::svelte2tsx::svelte2tsx::slice_src;

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("template source offsets are represented as u32")
}

/// Get the expression source text range from an Expression.
pub fn get_expression_range(expr: &crate::ast::js::Expression) -> Option<(u32, u32)> {
    let start = expr.start()?;
    let end = expr.end()?;
    Some((start, end))
}

/// For a Svelte 5 function binding `bind:prop={getFn, setFn}`, the directive
/// value is a `SequenceExpression` of exactly two expressions (the getter and
/// the setter). Returns the source byte ranges of the getter and setter,
/// `((get_start, get_end), (set_start, set_end))`.
///
/// The template-expression arena isn't resolvable in the svelte2tsx parse
/// path (`expr.as_json()` yields no children), so the split is done on the
/// source text by scanning for the first top-level comma — the comma that
/// separates the two expressions in `getFn, setFn`. This mirrors the
/// `isGetSetBinding` branch in upstream `htmlxtojsx_v2/nodes/Binding.ts`,
/// which reads `attr.expression.expressions[0]`/`[1]`.
pub fn get_set_binding_ranges(
    expr: &crate::ast::js::Expression,
    source: &str,
) -> Option<((u32, u32), (u32, u32))> {
    if expr.node_type() != Some("SequenceExpression") {
        return None;
    }
    let (start, end) = get_expression_range(expr)?;
    let (us, ue) = (start as usize, end as usize);
    if ue > source.len() || us >= ue {
        return None;
    }
    let text = &source[us..ue];
    let bytes = text.as_bytes();
    let mut depth: i32 = 0;
    let mut string: Option<u8> = None; // active quote char: ' " `
    let mut i = 0usize;
    while i < bytes.len() {
        let c = bytes[i];
        if let Some(q) = string {
            if c == b'\\' {
                i += 2;
                continue;
            }
            if c == q {
                string = None;
            }
            i += 1;
            continue;
        }
        match c {
            b'\'' | b'"' | b'`' => string = Some(c),
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b',' if depth == 0 => {
                // Top-level comma: getter is [start, here), setter is
                // (here, end). Trim surrounding whitespace from each half so
                // the emitted ranges line up with the actual expressions.
                let get_end = us + i;
                let set_start = us + i + 1;
                let get = trim_range(source, us, get_end)?;
                let set = trim_range(source, set_start, ue)?;
                return Some((get, set));
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Trim leading/trailing ASCII whitespace from a `[start, end)` source range,
/// returning the tightened `(start, end)` (or `None` if empty after trimming).
pub fn trim_range(source: &str, mut start: usize, mut end: usize) -> Option<(u32, u32)> {
    let bytes = source.as_bytes();
    while start < end && bytes[start].is_ascii_whitespace() {
        start += 1;
    }
    while end > start && bytes[end - 1].is_ascii_whitespace() {
        end -= 1;
    }
    if start >= end {
        None
    } else {
        Some((source_offset(start), source_offset(end)))
    }
}

/// Get the expression source text from the original source.
pub fn get_expression_text<'a>(expr: &crate::ast::js::Expression, source: &'a str) -> &'a str {
    if let Some((start, end)) = get_expression_range(expr) {
        slice_src(source, start as usize, end as usize)
    } else {
        ""
    }
}

/// Mirror upstream svelte2tsx `getEnd` (`htmlxtojsx_v2/utils/node-utils.ts`):
/// for a TS assertion expression (`x as T` / `x satisfies T` / `x!`) return the
/// end offset of the INNER expression (stripping the assertion); otherwise the
/// expression's own end. Used for binding assignment LHSs, which must not carry
/// the assertion (`() => (value as never) = …` → `() => (value = …)`).
///
/// The parser now preserves the assertion wrapper in the binding expression, but
/// the svelte2tsx parse path does not resolve arena children (`as_json()` is
/// empty), so — like [`extend_expr_end_with_ts_postfix`] — the inner end is
/// found by scanning the expression's source span rather than the arena.
pub fn get_expression_end_stripping_ts(
    expr: &crate::ast::js::Expression,
    source: &str,
) -> Option<u32> {
    let (start, end) = get_expression_range(expr)?;
    let ty = expr.node_type()?;
    if !matches!(
        ty,
        "TSAsExpression"
            | "TSSatisfiesExpression"
            | "TSNonNullExpression"
            | "TSInstantiationExpression"
    ) {
        return Some(end);
    }
    let bytes = source.as_bytes();
    let (s, e) = (start as usize, end as usize);
    if e > source.len() || s >= e {
        return Some(end);
    }
    if ty == "TSNonNullExpression" {
        return Some(source_offset(strip_non_null_suffix(bytes, s, e)));
    }
    if ty == "TSInstantiationExpression" {
        return Some(source_offset(strip_instantiation_suffix(bytes, s, e)));
    }
    // `x as T` / `x satisfies T`: find the outermost (last top-level) ` as ` /
    // ` satisfies ` keyword; the inner expression ends just before it.
    let is_ident = |b: u8| b.is_ascii_alphanumeric() || b == b'_' || b == b'$';
    let mut depth: i32 = 0;
    let mut string: Option<u8> = None;
    let mut op_ws: Option<usize> = None; // index of the whitespace preceding the keyword
    let mut i = s;
    while i < e {
        let c = bytes[i];
        if let Some(q) = string {
            if c == b'\\' {
                i += 2;
                continue;
            }
            if c == q {
                string = None;
            }
            i += 1;
            continue;
        }
        match c {
            b'\'' | b'"' | b'`' => string = Some(c),
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            _ if depth == 0 && c.is_ascii_whitespace() => {
                let mut j = i;
                while j < e && bytes[j].is_ascii_whitespace() {
                    j += 1;
                }
                for (kw, kwlen) in [("as", 2usize), ("satisfies", 9usize)] {
                    if j + kwlen <= e
                        && &source[j..j + kwlen] == kw
                        && (j + kwlen == e || !is_ident(bytes[j + kwlen]))
                    {
                        op_ws = Some(i);
                    }
                }
            }
            _ => {}
        }
        i += 1;
    }
    op_ws.map_or(Some(end), |position| {
        let mut ie = position;
        while ie > s && bytes[ie - 1].is_ascii_whitespace() {
            ie -= 1;
        }
        Some(source_offset(ie))
    })
}

fn strip_non_null_suffix(bytes: &[u8], start: usize, end: usize) -> usize {
    let mut index = trim_trailing_whitespace(bytes, start, end);
    if index > start && bytes[index - 1] == b'!' {
        index -= 1;
    }
    trim_trailing_whitespace(bytes, start, index)
}

fn strip_instantiation_suffix(bytes: &[u8], start: usize, end: usize) -> usize {
    let mut index = trim_trailing_whitespace(bytes, start, end);
    if index > start && bytes[index - 1] == b'>' {
        let mut depth = 0;
        while index > start {
            match bytes[index - 1] {
                b'>' => depth += 1,
                b'<' => {
                    depth -= 1;
                    if depth == 0 {
                        index -= 1;
                        break;
                    }
                }
                _ => {}
            }
            index -= 1;
        }
    }
    trim_trailing_whitespace(bytes, start, index)
}

fn trim_trailing_whitespace(bytes: &[u8], start: usize, mut end: usize) -> usize {
    while end > start && bytes[end - 1].is_ascii_whitespace() {
        end -= 1;
    }
    end
}

/// Start offset of an expression, stripping a leading TS `<T>` type-assertion
/// prefix (`TSTypeAssertion`). For `<T>x` the assignable inner expression begins
/// after the closing `>`; every other expression keeps its own start.
pub fn get_expression_start_stripping_ts(
    expr: &crate::ast::js::Expression,
    source: &str,
) -> Option<u32> {
    let (start, end) = get_expression_range(expr)?;
    if expr.node_type()? != "TSTypeAssertion" {
        return Some(start);
    }
    let bytes = source.as_bytes();
    let (s, e) = (start as usize, end as usize);
    if e > source.len() || s >= e || bytes[s] != b'<' {
        return Some(start);
    }
    // Balance the leading `<…>` (nested generics included), then skip whitespace.
    let mut i = s;
    let mut depth: i32 = 0;
    while i < e {
        match bytes[i] {
            b'<' => depth += 1,
            b'>' => {
                depth -= 1;
                if depth == 0 {
                    i += 1;
                    break;
                }
            }
            _ => {}
        }
        i += 1;
    }
    while i < e && bytes[i].is_ascii_whitespace() {
        i += 1;
    }
    Some(source_offset(i))
}

/// Source text of a binding assignment LHS: the expression with any TS assertion
/// stripped (mirrors `[getStart(expr), getEnd(expr)]` upstream). A trailing
/// postfix (`as T` / `satisfies T` / `!` / `<T>` type args) is trimmed from the
/// end and a leading `<T>` type-assertion prefix from the start, so a cast never
/// lands on the assignment target.
pub fn get_binding_lhs_text<'a>(expr: &crate::ast::js::Expression, source: &'a str) -> &'a str {
    match (
        get_expression_start_stripping_ts(expr, source),
        get_expression_end_stripping_ts(expr, source),
    ) {
        (Some(start), Some(ge)) if start <= ge => slice_src(source, start as usize, ge as usize),
        _ => get_expression_text(expr, source),
    }
}

/// Extend an expression's end to cover a trailing TS postfix (`as T`,
/// `satisfies T`, `!`) that the parser narrowed out of the expression span.
/// `scan_end` is the enclosing `{…}` directive/attribute end; the closing `}`
/// is found by scanning back from it (so braces inside the type — `as { x }` —
/// don't confuse it). Returns the original `expr_end` when no postfix follows.
pub fn extend_expr_end_with_ts_postfix(source: &str, expr_end: u32, scan_end: u32) -> u32 {
    let bytes = source.as_bytes();
    let mut c = scan_end as usize;
    while c > expr_end as usize && bytes.get(c - 1) != Some(&b'}') {
        c -= 1;
    }
    let close = c.saturating_sub(1);
    let tail = source
        .get(expr_end as usize..close)
        .unwrap_or("")
        .trim_start();
    if close > expr_end as usize
        && (tail.starts_with("as ") || tail.starts_with("satisfies ") || tail.starts_with('!'))
    {
        source_offset(close)
    } else {
        expr_end
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extend_expr_end_covers_trailing_ts_postfix() {
        // The parser narrows the expression span to `val` (`expr_end` = index 4,
        // just after `l`); `scan_end` is the directive `}`+1. The helper scans
        // back to the `}` and, when an `as`/`satisfies`/`!` postfix sits between
        // `expr_end` and `}`, extends the end to just before `}`.

        // `{val as T}` → end at index 9 (the `}`), covering ` as T`.
        let src = "{val as T}";
        assert_eq!(extend_expr_end_with_ts_postfix(src, 4, src.len() as u32), 9);

        // `{val!}` → non-null `!` absorbed, end at index 5 (the `}`).
        let src = "{val!}";
        assert_eq!(extend_expr_end_with_ts_postfix(src, 4, src.len() as u32), 5);

        // `{val satisfies T}` → `satisfies T` absorbed.
        let src = "{val satisfies T}";
        assert_eq!(
            extend_expr_end_with_ts_postfix(src, 4, src.len() as u32),
            16
        );

        // `{val}` → no postfix, end unchanged.
        let src = "{val}";
        assert_eq!(extend_expr_end_with_ts_postfix(src, 4, src.len() as u32), 4);

        // `as { x: T }` — braces inside the cast type don't confuse the close
        // scan (it stops at the OUTER `}` nearest `scan_end`).
        let src = "{val as {x: T}}";
        assert_eq!(
            extend_expr_end_with_ts_postfix(src, 4, src.len() as u32),
            14
        );
    }
}
