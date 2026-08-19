//! Byte-offset → (line, column) conversion, built once per file.
//!
//! Matches the compiler's convention (`byte_offset_to_position` in
//! `rsvelte_core::compiler`): **line is 1-indexed, column is 0-indexed in
//! UTF-16 code units** so emoji and other astral characters line up with
//! JavaScript/LSP tooling. Building the line table once and binary-searching it
//! avoids the per-probe linear rescan the JS stack pays.

/// Precomputed line-start table over a source string.
pub struct LineIndex<'a> {
    source: &'a str,
    /// Byte offset of the first character of each line. `line_starts[0] == 0`.
    line_starts: Vec<u32>,
    /// The same table under JavaScript's line-terminator set, which adds U+2028
    /// and U+2029. `None` when the source contains neither, where the two tables
    /// are equal. See [`LineIndex::position_js`].
    js_line_starts: Option<Vec<u32>>,
}

/// The line table under JavaScript's terminator set, or `None` when the source
/// has no U+2028/U+2029 and the two tables would be identical.
fn js_line_starts(source: &str, line_starts: &[u32]) -> Option<Vec<u32>> {
    let bytes = source.as_bytes();
    if !bytes
        .windows(3)
        .any(|w| w[0] == 0xE2 && w[1] == 0x80 && matches!(w[2], 0xA8 | 0xA9))
    {
        return None;
    }
    let mut out: Vec<u32> = line_starts.to_vec();
    for (i, w) in bytes.windows(3).enumerate() {
        if w[0] == 0xE2 && w[1] == 0x80 && matches!(w[2], 0xA8 | 0xA9) {
            out.push(source_offset(i + 3));
        }
    }
    out.sort_unstable();
    Some(out)
}

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

impl<'a> LineIndex<'a> {
    #[must_use]
    pub fn new(source: &'a str) -> Self {
        let bytes = source.as_bytes();
        let mut line_starts = Vec::with_capacity(bytes.len() / 32 + 1);
        line_starts.push(0);
        let mut i = 0;
        while i < bytes.len() {
            match bytes[i] {
                b'\n' => line_starts.push(source_offset(i) + 1),
                // A lone `\r` also terminates a line, matching ESLint/the LSP text model.
                b'\r' => {
                    if bytes.get(i + 1) == Some(&b'\n') {
                        i += 1;
                    }
                    line_starts.push(source_offset(i) + 1);
                }
                _ => {}
            }
            i += 1;
        }
        let js_line_starts = js_line_starts(source, &line_starts);
        Self {
            source,
            line_starts,
            js_line_starts,
        }
    }

    /// Returns `(line, column)` where line is 1-indexed and column is the
    /// 0-indexed UTF-16 code-unit offset from the line start.
    #[must_use]
    pub fn position(&self, offset: u32) -> (u32, u32) {
        let offset = (offset as usize).min(self.source.len());
        // Index of the last line start <= offset.
        let offset_u32 = source_offset(offset);
        let line_idx = match self.line_starts.binary_search(&offset_u32) {
            Ok(i) => i,
            Err(i) => i - 1,
        };
        let line_start = self.line_starts[line_idx] as usize;
        // UTF-16 width of the text between the line start and the offset.
        let column: usize = self.source[line_start..offset]
            .chars()
            .map(char::len_utf16)
            .sum();
        (source_offset(line_idx) + 1, source_offset(column))
    }

    /// `position` under JavaScript's line-terminator set, which counts U+2028
    /// and U+2029 as well.
    ///
    /// eslint-plugin-svelte does not use one convention: a rule that reports an
    /// AST node's `loc` gets svelte-eslint-parser's lines (CR/LF only), while a
    /// rule that builds its `loc` from `sourceCode.getLocFromIndex` gets
    /// ESLint's, whose line pattern is `/\r\n|[\r\n\u2028\u2029]/u`. Both
    /// appear in the same file, so matching upstream means picking per rule.
    #[must_use]
    pub fn position_js(&self, offset: u32) -> (u32, u32) {
        let Some(starts) = self.js_line_starts.as_deref() else {
            return self.position(offset);
        };
        let offset = (offset as usize).min(self.source.len());
        let offset_u32 = source_offset(offset);
        let line_idx = match starts.binary_search(&offset_u32) {
            Ok(i) => i,
            Err(i) => i - 1,
        };
        let line_start = starts[line_idx] as usize;
        let column: usize = self.source[line_start..offset]
            .chars()
            .map(char::len_utf16)
            .sum();
        (source_offset(line_idx) + 1, source_offset(column))
    }

    /// The 1-indexed line number containing `offset`. Cheap helper used by the
    /// suppression scanner.
    #[must_use]
    pub fn line(&self, offset: u32) -> u32 {
        self.position(offset).0
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn js_line_separators_split_only_the_js_table() {
        // U+2028 / U+2029 terminate a line for ESLint's `SourceCode` and not
        // for svelte-eslint-parser, and both conventions are reachable in one
        // file — so the two tables must disagree here.
        let li = super::LineIndex::new("a\u{2028}b\u{2029}c\nd");
        assert_eq!(li.position(4).0, 1);
        assert_eq!(li.position_js(4).0, 2);
        assert_eq!(li.position(8).0, 1);
        assert_eq!(li.position_js(8).0, 3);
        // The last line is after a plain LF: both tables agree.
        assert_eq!(li.position(10).0, 2);
        assert_eq!(li.position_js(10).0, 4);
    }

    #[test]
    fn js_table_is_absent_without_separators() {
        let li = super::LineIndex::new("a\nb");
        assert_eq!(li.position(2), li.position_js(2));
    }

    use super::*;

    #[test]
    fn first_line_is_one() {
        let idx = LineIndex::new("abc\ndef");
        assert_eq!(idx.position(0), (1, 0));
        assert_eq!(idx.position(1), (1, 1));
    }

    #[test]
    fn second_line_column_resets() {
        let idx = LineIndex::new("abc\ndef");
        assert_eq!(idx.position(4), (2, 0)); // 'd'
        assert_eq!(idx.position(6), (2, 2)); // 'f'
    }

    #[test]
    fn astral_char_counts_as_two_utf16_units() {
        // "💡x" — the bulb is 4 UTF-8 bytes, 2 UTF-16 units.
        let src = "💡x";
        let idx = LineIndex::new(src);
        let x_off = source_offset("💡".len());
        assert_eq!(idx.position(x_off), (1, 2));
    }

    #[test]
    fn lf_terminates_lines() {
        let idx = LineIndex::new("a\nb\nc");
        assert_eq!(idx.position(0), (1, 0)); // 'a'
        assert_eq!(idx.position(2), (2, 0)); // 'b'
        assert_eq!(idx.position(4), (3, 0)); // 'c'
    }

    #[test]
    fn crlf_terminates_lines() {
        let idx = LineIndex::new("a\r\nb\r\nc");
        assert_eq!(idx.position(0), (1, 0)); // 'a'
        assert_eq!(idx.position(3), (2, 0)); // 'b'
        assert_eq!(idx.position(6), (3, 0)); // 'c'
    }

    #[test]
    fn lone_cr_terminates_lines() {
        // Classic Mac line endings: a lone `\r` (not followed by `\n`) still
        // starts a new line, matching ESLint/eslint-plugin-svelte.
        let idx = LineIndex::new("a\rb\rc");
        assert_eq!(idx.position(0), (1, 0)); // 'a'
        assert_eq!(idx.position(2), (2, 0)); // 'b'
        assert_eq!(idx.position(4), (3, 0)); // 'c'
    }

    #[test]
    fn issue_1793_reproduction() {
        // From #1793: three lone-CR-terminated tags; the `{@html v}` offset
        // must land on line 3, not be swallowed into line 1.
        let src = "<p>aaa</p>\r<p>bbb</p>\r<div>{@html v}</div>\r";
        let idx = LineIndex::new(src);
        let html_offset = source_offset(src.find("{@html").unwrap());
        assert_eq!(idx.position(html_offset), (3, 5));
    }
}
