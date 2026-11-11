//! Printing a JavaScript tree with `oxc_codegen`.
//!
//! The corpus compares output as syntax trees, so the printer's layout is free.

use oxc_ast::ast::Program;
use oxc_codegen::{Codegen, CodegenOptions};
use rsvelte_kernel::output::emitter::{Emitter, Mapping};
use rsvelte_kernel::source::positions::{LineBreaks, LineIndex};

#[cfg(test)]
mod tests;

#[must_use]
pub fn print(program: &Program<'_>) -> String {
    Codegen::new().with_options(options()).build(program).code
}

/// Upstream's printer keeps a template literal's text as written, `</script` too.
fn options() -> CodegenOptions {
    CodegenOptions {
        escape_script_close_tag: false,
        ..CodegenOptions::default()
    }
}

/// [`print`], with a point mapping wherever the printer maps a node back into
/// `program.source_text`, which `lines` indexes by `\n`.
#[must_use]
pub fn print_mapped(program: &Program<'_>, lines: &LineIndex) -> Emitter {
    // The printer counts ECMAScript's line breaks, which differ from `\n` only at a lone CR, LS or PS.
    let text = program.source_text;
    // Single-character searches, which are fast; a pattern of several characters is not.
    let other_breaks = text.contains('\u{2028}')
        || text.contains('\u{2029}')
        || (text.match_indices('\r')).any(|(i, _)| text.as_bytes().get(i + 1) != Some(&b'\n'));
    let ecmascript;
    let source = if other_breaks {
        ecmascript = LineIndex::with_breaks(text, LineBreaks::Ecmascript);
        &ecmascript
    } else {
        lines
    };
    let printed = Codegen::new()
        .with_options(CodegenOptions {
            source_map_path: Some("source".into()),
            ..options()
        })
        .build(program);
    let mut emitter = Emitter::new();
    if let Some(map) = printed.map {
        let mut generated = Cursor::new(&printed.code);
        emitter.mappings = map
            .get_tokens()
            .filter_map(|token| {
                Some(Mapping {
                    generated: generated.seek(token.get_dst_line(), token.get_dst_col())?,
                    source_text: source.offset(token.get_src_line() + 1, token.get_src_col())?,
                    len: 0,
                })
            })
            .collect();
    }
    emitter.out = printed.code;
    emitter
}

/// The byte offsets of 0-based (line, UTF-16 column) positions met in increasing order, as the
/// printer emits them: one pass over the text instead of an index of it.
struct Cursor<'t> {
    text: &'t str,
    byte: usize,
    line: u32,
    column: u32,
}

impl<'t> Cursor<'t> {
    const fn new(text: &'t str) -> Self {
        Self {
            text,
            byte: 0,
            line: 0,
            column: 0,
        }
    }

    fn seek(&mut self, line: u32, column: u32) -> Option<u32> {
        let bytes = self.text.as_bytes();
        // The printer's line breaks: `\n`, `\r`, `\r\n`, LS and PS (E2 80 A8, E2 80 A9).
        while self.line < line {
            let at = self.byte
                + (bytes[self.byte..].iter()).position(|&b| matches!(b, b'\n' | b'\r' | 0xE2))?;
            self.byte = at + 1;
            match bytes[at] {
                b'\r' if bytes.get(at + 1) == Some(&b'\n') => self.byte += 1,
                0xE2 if matches!(bytes.get(at + 1..at + 3), Some([0x80, 0xA8 | 0xA9])) => {
                    self.byte += 2;
                }
                0xE2 => continue,
                _ => {}
            }
            self.line += 1;
            self.column = 0;
        }
        while self.line == line && self.column < column {
            let b = *bytes.get(self.byte)?;
            if b.is_ascii() {
                if matches!(b, b'\n' | b'\r') {
                    return None;
                }
                self.byte += 1;
                self.column += 1;
            } else {
                let c = self.text[self.byte..].chars().next()?;
                if matches!(c, '\u{2028}' | '\u{2029}') {
                    return None;
                }
                self.byte += c.len_utf8();
                self.column += c.len_utf16() as u32;
            }
        }
        ((self.line, self.column) == (line, column)).then_some(self.byte as u32)
    }
}
