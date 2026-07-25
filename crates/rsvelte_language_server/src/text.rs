//! Conversion between LSP positions and UTF-8 byte offsets.
//!
//! LSP addresses text as `(0-based line, 0-based UTF-16 code unit)`, while
//! every rsvelte engine works in UTF-8 byte offsets. Every position crossing
//! the protocol boundary goes through here, so non-ASCII text (accents,
//! emoji, anything outside the BMP) lands on the right byte.

use lsp_types::Position;

/// Byte offset of the start of every line in a source string.
#[derive(Debug, Clone)]
pub struct LineIndex {
    line_starts: Vec<u32>,
}

impl LineIndex {
    pub fn new(text: &str) -> Self {
        let bytes = text.as_bytes();
        let mut line_starts = Vec::with_capacity(bytes.len() / 32 + 1);
        line_starts.push(0);
        let mut i = 0;
        while i < bytes.len() {
            match bytes[i] {
                b'\n' => line_starts.push(i as u32 + 1),
                // A lone `\r` also terminates a line in the LSP text model.
                b'\r' => {
                    if bytes.get(i + 1) == Some(&b'\n') {
                        i += 1;
                    }
                    line_starts.push(i as u32 + 1);
                }
                _ => {}
            }
            i += 1;
        }
        Self { line_starts }
    }

    /// The number of lines in the indexed text.
    pub fn line_count(&self) -> usize {
        self.line_starts.len()
    }

    /// The byte offset `position` refers to. Out-of-range lines clamp to the
    /// end of the text and out-of-range characters to the end of their line's
    /// content; a character landing inside a surrogate pair rounds down to the
    /// start of that character.
    pub fn offset(&self, text: &str, position: Position) -> usize {
        let line = position.line as usize;
        let Some(&start) = self.line_starts.get(line) else {
            return text.len();
        };
        let start = start as usize;
        let end = self
            .line_starts
            .get(line + 1)
            .map_or(text.len(), |&n| n as usize);
        let content = strip_line_terminator(&text[start..end]);

        let mut utf16 = 0u32;
        for (i, c) in content.char_indices() {
            if utf16 + c.len_utf16() as u32 > position.character {
                return start + i;
            }
            utf16 += c.len_utf16() as u32;
        }
        start + content.len()
    }

    /// The position of byte `offset`. An offset past the end of the text, or
    /// inside a multi-byte character, is clamped down to a character boundary.
    pub fn position(&self, text: &str, offset: usize) -> Position {
        let offset = floor_char_boundary(text, offset);
        let line = match self.line_starts.binary_search(&(offset as u32)) {
            Ok(i) => i,
            Err(i) => i - 1,
        };
        let start = self.line_starts[line] as usize;
        let character = text[start..offset]
            .chars()
            .map(|c| c.len_utf16() as u32)
            .sum();
        Position::new(line as u32, character)
    }
}

/// The largest char boundary `<= offset`, clamped to the length of `text`.
fn floor_char_boundary(text: &str, offset: usize) -> usize {
    if offset >= text.len() {
        return text.len();
    }
    let mut offset = offset;
    while offset > 0 && !text.is_char_boundary(offset) {
        offset -= 1;
    }
    offset
}

fn strip_line_terminator(line: &str) -> &str {
    match line.strip_suffix('\n') {
        Some(rest) => rest.strip_suffix('\r').unwrap_or(rest),
        None => line.strip_suffix('\r').unwrap_or(line),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn offset(text: &str, line: u32, character: u32) -> usize {
        LineIndex::new(text).offset(text, Position::new(line, character))
    }

    fn position(text: &str, offset: usize) -> Position {
        LineIndex::new(text).position(text, offset)
    }

    #[test]
    fn ascii_round_trip() {
        let text = "abc\ndef\n";
        assert_eq!(offset(text, 0, 0), 0);
        assert_eq!(offset(text, 0, 3), 3);
        assert_eq!(offset(text, 1, 2), 6);
        assert_eq!(position(text, 6), Position::new(1, 2));
        assert_eq!(position(text, 8), Position::new(2, 0));
    }

    #[test]
    fn astral_chars_count_as_two_code_units() {
        // "💡" is 4 UTF-8 bytes and 2 UTF-16 code units.
        let text = "a💡b";
        assert_eq!(offset(text, 0, 1), 1);
        assert_eq!(offset(text, 0, 3), 5);
        assert_eq!(position(text, 5), Position::new(0, 3));
        assert_eq!(position(text, 6), Position::new(0, 4));
    }

    #[test]
    fn position_inside_a_surrogate_pair_rounds_down() {
        let text = "a💡b";
        assert_eq!(offset(text, 0, 2), 1);
    }

    #[test]
    fn multi_byte_bmp_chars() {
        // "é" and "あ" are 2 and 3 UTF-8 bytes but one UTF-16 code unit each.
        let text = "éあx";
        assert_eq!(offset(text, 0, 1), 2);
        assert_eq!(offset(text, 0, 2), 5);
        assert_eq!(position(text, 5), Position::new(0, 2));
    }

    #[test]
    fn columns_are_relative_to_the_line_after_astral_text() {
        let text = "💡\nx💡y";
        assert_eq!(offset(text, 1, 0), 5);
        assert_eq!(offset(text, 1, 3), 10);
        assert_eq!(position(text, 10), Position::new(1, 3));
    }

    #[test]
    fn crlf_and_lone_cr_terminate_lines() {
        let text = "a\r\nb\rc";
        let index = LineIndex::new(text);
        assert_eq!(index.line_count(), 3);
        assert_eq!(index.offset(text, Position::new(1, 0)), 3);
        assert_eq!(index.offset(text, Position::new(2, 0)), 5);
        // A character past the line's content clamps before the terminator.
        assert_eq!(index.offset(text, Position::new(0, 99)), 1);
    }

    #[test]
    fn out_of_range_positions_clamp() {
        let text = "ab\ncd";
        assert_eq!(offset(text, 99, 0), text.len());
        assert_eq!(offset(text, 1, 99), text.len());
        assert_eq!(position(text, 999), Position::new(1, 2));
        // Mid-character offsets round down rather than panic.
        assert_eq!(position("💡", 2), Position::new(0, 0));
    }

    #[test]
    fn empty_text() {
        assert_eq!(offset("", 0, 0), 0);
        assert_eq!(position("", 0), Position::new(0, 0));
    }
}
