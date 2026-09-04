use super::reformat_content_at_width;
use crate::doc::RawExprSource;
use crate::width::{VisualWidth, tab_width};

/// Build a `RawExpr`'s broken lines at a width budget.
///
/// `budget` is the columns the continuation lines actually get; `usize::MAX`
/// reproduces the column-unaware shape, which is what a doc builder can know.
pub(crate) fn broken_lines(src: &RawExprSource, budget: usize) -> Option<Vec<String>> {
    let tw = tab_width(&src.options);
    let flat_inner =
        reformat_content_at_width(&src.expr, &src.options, u16::MAX as usize, 0).ok()?;
    if flat_inner.contains('\n') {
        return None;
    }
    let width = flat_inner
        .visual_width(tw)
        .saturating_sub(1)
        .min(budget)
        .max(1);
    let broken_inner = reformat_content_at_width(&src.expr, &src.options, width, 0).ok()?;
    if !broken_inner.contains('\n') {
        return None;
    }
    let mut lines: Vec<String> = broken_inner.split('\n').map(str::to_string).collect();
    let last = lines.len() - 1;
    lines[0] = format!("{{{}{}", src.prefix, lines[0]);
    lines[last] = format!("{}}}", lines[last]);
    Some(lines)
}
