//! Print-width measurement shared by every fit / wrap decision.
//!
//! Prettier measures a line in two pieces. Its indentation is accounted by
//! `generateIndent`, whose `addTabs` charges `options.tabWidth` columns per tab;
//! everything else goes through `getStringWidth`, which counts East Asian Wide /
//! Fullwidth scalars as two columns and control characters as zero.
//! [`UnicodeWidthStr::width`] alone reproduces only the second half, so under
//! `useTabs` a depth-`n` indent under-counts by `(tabWidth - 1) * n` columns and
//! every fit decision fires late (#2119). [`VisualWidth::visual_width`] applies
//! both rules at once, which is exact for the formatter's own output because a
//! tab can only ever reach it as indentation.

use unicode_width::UnicodeWidthStr;

use crate::options::FormatOptions;

/// Columns a tab occupies: prettier's `tabWidth`, which doubles as the
/// space-indent width. Zero-guarded so a degenerate config can't collapse every
/// indent to nothing.
pub fn tab_width(options: &FormatOptions) -> usize {
    match options.js.indent_width.value() as usize {
        0 => 1,
        w => w,
    }
}

/// Width of `s` ignoring tabs, with a fast path for the printable-ASCII case
/// that dominates markup (where one byte is exactly one column).
pub fn text_width(s: &str) -> usize {
    if s.bytes().all(|b| (0x20..0x7f).contains(&b)) {
        s.len()
    } else {
        s.width()
    }
}

pub trait VisualWidth {
    /// Display width of `self`, charging every tab `tab_width` columns.
    fn visual_width(&self, tab_width: usize) -> usize;
}

impl VisualWidth for str {
    fn visual_width(&self, tab_width: usize) -> usize {
        // Printable ASCII (which excludes `\t`) is one column per byte — the same
        // single scan `text_width` would do, so the hot path costs nothing extra.
        let bytes = self.as_bytes();
        if bytes.iter().all(|b| (0x20..0x7f).contains(b)) {
            return bytes.len();
        }
        if !bytes.contains(&b'\t') {
            return self.width();
        }
        let mut segments = 0;
        let mut width = 0;
        for segment in self.split('\t') {
            segments += 1;
            width += text_width(segment);
        }
        width + (segments - 1) * tab_width
    }
}

/// One indentation level: the string it appends and the columns prettier charges
/// for it. Bundled so a printer can never pair a tab unit with a one-column
/// measurement.
#[derive(Clone, Copy)]
pub struct IndentUnit<'a> {
    unit: &'a str,
    columns: usize,
    tab_width: usize,
}

impl<'a> IndentUnit<'a> {
    pub(crate) fn new(unit: &'a str, tab_width: usize) -> Self {
        Self {
            unit,
            columns: unit.visual_width(tab_width),
            tab_width,
        }
    }

    pub(crate) const fn as_str(&self) -> &'a str {
        self.unit
    }

    pub(crate) const fn columns(&self) -> usize {
        self.columns
    }

    pub(crate) const fn tab_width(&self) -> usize {
        self.tab_width
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tabs_cost_tab_width_and_other_scalars_keep_prettier_widths() {
        assert_eq!("".visual_width(4), 0);
        assert_eq!("abc".visual_width(4), 3);
        assert_eq!("\t".visual_width(4), 4);
        assert_eq!("\t\t\t".visual_width(4), 12);
        assert_eq!("\t\tabc".visual_width(2), 7);
        // East Asian Wide scalars still count two columns.
        assert_eq!("\t日本".visual_width(4), 8);
    }
}
