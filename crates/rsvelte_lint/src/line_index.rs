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
}

impl<'a> LineIndex<'a> {
    pub fn new(source: &'a str) -> Self {
        let mut line_starts = Vec::with_capacity(source.len() / 32 + 1);
        line_starts.push(0);
        for (i, b) in source.bytes().enumerate() {
            if b == b'\n' {
                line_starts.push(i as u32 + 1);
            }
        }
        Self {
            source,
            line_starts,
        }
    }

    /// Returns `(line, column)` where line is 1-indexed and column is the
    /// 0-indexed UTF-16 code-unit offset from the line start.
    pub fn position(&self, offset: u32) -> (u32, u32) {
        let offset = (offset as usize).min(self.source.len());
        // Index of the last line start <= offset.
        let line_idx = match self.line_starts.binary_search(&(offset as u32)) {
            Ok(i) => i,
            Err(i) => i - 1,
        };
        let line_start = self.line_starts[line_idx] as usize;
        // UTF-16 width of the text between the line start and the offset.
        let column: usize = self.source[line_start..offset]
            .chars()
            .map(|c| c.len_utf16())
            .sum();
        (line_idx as u32 + 1, column as u32)
    }

    /// The 1-indexed line number containing `offset`. Cheap helper used by the
    /// suppression scanner.
    pub fn line(&self, offset: u32) -> u32 {
        self.position(offset).0
    }
}

#[cfg(test)]
mod tests {
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
        let x_off = "💡".len() as u32;
        assert_eq!(idx.position(x_off), (1, 2));
    }
}
