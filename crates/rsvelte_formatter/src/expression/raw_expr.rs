use super::{reformat_content_at_width, reformat_content_layout};
use crate::doc::RawExprSource;
use crate::width::{VisualWidth, tab_width};

/// Build a `RawExpr`'s broken lines at a width budget.
///
/// `budget` is the columns the continuation lines actually get; `usize::MAX`
/// reproduces the column-unaware shape, which is what a doc builder can know.
pub(crate) fn broken_lines(src: &RawExprSource, budget: usize) -> Option<Vec<String>> {
    broken_lines_at(src, budget, 0, 0)
}

/// [`broken_lines`] at the column the printer reached: the first line pays
/// `first_line_offset` columns (what precedes the expression on its line,
/// the `{prefix` head included) and the last line pays `last_line_suffix`
/// (the closing `}` and whatever follows it up to the next break
/// opportunity), the way prettier measures a mustache's groups in place.
pub(crate) fn broken_lines_at(
    src: &RawExprSource,
    budget: usize,
    first_line_offset: usize,
    last_line_suffix: usize,
) -> Option<Vec<String>> {
    let tw = tab_width(&src.options);
    let flat_inner =
        reformat_content_at_width(&src.expr, &src.options, u16::MAX as usize, 0).ok()?;
    if flat_inner.contains('\n') {
        return None;
    }
    // One column short of the flat form's whole line, so the outermost group
    // breaks even when the continuation budget would hold it: a `RawExpr` is
    // only rebuilt in break mode, where the flat form did not fit in place.
    let width = (first_line_offset + flat_inner.visual_width(tw) + last_line_suffix)
        .saturating_sub(1)
        .min(budget)
        .max(1);
    let broken_inner = reformat_content_layout(
        &src.expr,
        &src.options,
        width,
        0,
        first_line_offset,
        last_line_suffix,
    )
    .ok()?;
    if !broken_inner.contains('\n') {
        return None;
    }
    let mut lines: Vec<String> = broken_inner.split('\n').map(str::to_string).collect();
    let last = lines.len() - 1;
    lines[0] = format!("{{{}{}", src.prefix, lines[0]);
    lines[last] = format!("{}}}", lines[last]);
    Some(lines)
}
