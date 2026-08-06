//! Minimal lexical skipping for the line-based class transforms.
//!
//! Those passes count brackets and hunt for statement terminators in raw text.
//! A `}`, `)` or `;` inside a comment, string, template or regex literal is
//! text, not code, and reading it as code truncated a value mid-comment and
//! spliced an injected `)` into the comment body (#907, #2253). Every such
//! scanner steps over opaque runs with `skip_opaque` first.

/// Iterator over the *code* bytes of `bytes`: every byte that is not inside a
/// string, template literal, regex literal or comment, as `(byte index, byte)`.
///
/// Multi-byte UTF-8 sequences are yielded byte by byte; every continuation byte
/// is `>= 0x80`, so a scanner matching ASCII delimiters is unaffected and the
/// indices stay valid `str` boundaries at the delimiters it does match.
pub(crate) fn code_bytes(bytes: &[u8]) -> CodeBytes<'_> {
    code_bytes_from(bytes, 0)
}

/// `code_bytes`, resuming at `start`. The byte at `start` is treated as the
/// first byte of a fresh token, so a `/` there reads as a regex literal.
pub(crate) fn code_bytes_from(bytes: &[u8], start: usize) -> CodeBytes<'_> {
    CodeBytes {
        bytes,
        i: start.min(bytes.len()),
        prev: None,
    }
}

pub(crate) struct CodeBytes<'a> {
    bytes: &'a [u8],
    i: usize,
    prev: Option<u8>,
}

impl Iterator for CodeBytes<'_> {
    type Item = (usize, u8);

    fn next(&mut self) -> Option<(usize, u8)> {
        while self.i < self.bytes.len() {
            if let Some((next, is_comment)) = skip_opaque(self.bytes, self.i, self.prev) {
                if !is_comment {
                    self.prev = Some(b'x');
                }
                self.i = next;
                continue;
            }
            let c = self.bytes[self.i];
            let at = self.i;
            self.i += 1;
            if !c.is_ascii_whitespace() {
                self.prev = Some(c);
            }
            return Some((at, c));
        }
        None
    }
}

/// Does a `/` following `prev` (the last significant code byte) open a regex
/// literal rather than a division?
pub(crate) fn slash_starts_regex(prev: Option<u8>) -> bool {
    !matches!(prev, Some(c) if c.is_ascii_alphanumeric()
        || matches!(c, b'_' | b'$' | b')' | b']' | b'}' | b'\'' | b'"' | b'`'))
}

/// If a string, template literal, regex literal or comment starts at `i`,
/// return `(byte just past it, was_a_comment)`. `prev` is the last significant
/// code byte, needed to tell a regex literal from a division.
pub(crate) fn skip_opaque(bytes: &[u8], i: usize, prev: Option<u8>) -> Option<(usize, bool)> {
    match bytes[i] {
        quote @ (b'\'' | b'"' | b'`') => {
            let mut j = i + 1;
            while j < bytes.len() {
                match bytes[j] {
                    b'\\' => j += 2,
                    b if b == quote => {
                        j += 1;
                        break;
                    }
                    _ => j += 1,
                }
            }
            Some((j.min(bytes.len()), false))
        }
        b'/' if bytes.get(i + 1) == Some(&b'/') => {
            let mut j = i + 2;
            while j < bytes.len() && bytes[j] != b'\n' {
                j += 1;
            }
            Some((j, true))
        }
        b'/' if bytes.get(i + 1) == Some(&b'*') => {
            let mut j = i + 2;
            while j + 1 < bytes.len() && !(bytes[j] == b'*' && bytes[j + 1] == b'/') {
                j += 1;
            }
            Some(((j + 2).min(bytes.len()), true))
        }
        b'/' if slash_starts_regex(prev) => {
            let mut j = i + 1;
            let mut in_class = false;
            while j < bytes.len() {
                match bytes[j] {
                    b'\\' => j += 2,
                    b'[' => {
                        in_class = true;
                        j += 1;
                    }
                    b']' if in_class => {
                        in_class = false;
                        j += 1;
                    }
                    b'/' if !in_class => {
                        j += 1;
                        break;
                    }
                    // An unterminated "regex" is really a division — leave the
                    // bytes to the caller rather than swallowing the line.
                    b'\n' => return None,
                    _ => j += 1,
                }
            }
            while j < bytes.len() && bytes[j].is_ascii_alphabetic() {
                j += 1;
            }
            Some((j.min(bytes.len()), false))
        }
        _ => None,
    }
}
