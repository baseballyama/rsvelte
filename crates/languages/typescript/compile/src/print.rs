//! Printing a JavaScript tree with `oxc_codegen`.
//!
//! The corpus compares output as syntax trees, so the printer's layout is free.

use oxc_ast::ast::Program;
pub use oxc_codegen::Expansion;
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment, StatementExpansion};
use rsvelte_kernel::output::emitter::{Emitter, Mapping};
use rsvelte_kernel::source::positions::{LineBreaks, LineIndex};

mod comments;
#[cfg(test)]
mod tests;

use comments::CommentCursor;

/// How the program's own comments print.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Comments {
    /// Before the node each one is attached to, as `oxc_codegen` does.
    Attached,
    /// Where upstream's printer puts them, by the source positions the printed nodes keep.
    Placed,
}

fn codegen<'a>(program: &Program<'a>, options: CodegenOptions, comments: Comments) -> Codegen<'a> {
    // Without comments both ways print the same, and the cursor would only cost allocations.
    if comments == Comments::Attached || program.comments.is_empty() {
        return Codegen::new().with_options(options);
    }
    let cursor = CommentCursor::new(program.source_text, &program.comments);
    Codegen::new()
        .with_options(CodegenOptions {
            comments: CommentOptions {
                normal: false,
                jsdoc: false,
                legal: LegalComment::None,
                ..CommentOptions::default()
            },
            ..options
        })
        .with_comment_hook(Box::new(cursor))
}

thread_local! {
    static BUFFER: std::cell::RefCell<String> = const { std::cell::RefCell::new(String::new()) };
}

/// One buffer per thread grows once; each program gets a copy of exactly its output's length,
/// which starts with `head`.
fn printed<'a>(
    codegen: Codegen<'a>,
    program: &Program<'a>,
    head: &[&str],
) -> oxc_codegen::CodegenReturn<'a> {
    let buffer = BUFFER.with_borrow_mut(std::mem::take);
    let mut printed = codegen.with_buffer(buffer).build(program);
    let mut code = String::with_capacity(head_len(head) + printed.code.len());
    code.extend(head.iter().copied());
    code.push_str(&printed.code);
    BUFFER.with_borrow_mut(|b| *b = std::mem::replace(&mut printed.code, code));
    printed
}

#[must_use]
pub fn print(program: &Program<'_>) -> String {
    print_with(program, Comments::Attached)
}

#[must_use]
pub fn print_with(program: &Program<'_>, comments: Comments) -> String {
    printed(codegen(program, options(), comments), program, &[]).code
}

/// [`print()`], with what `expand` returns printed in place of a statement.
#[must_use]
pub fn print_expanding<'a>(program: &Program<'a>, expand: StatementExpansion<'a>) -> String {
    let codegen = Codegen::new()
        .with_options(options())
        .with_statement_expansion(expand);
    printed(codegen, program, &[]).code
}

/// Upstream's printer keeps a template literal's text as written, `</script` too, and a number's.
fn options() -> CodegenOptions {
    CodegenOptions {
        escape_script_close_tag: false,
        numbers_as_written: true,
        ..CodegenOptions::default()
    }
}

/// [`print_with()`]; with `lines`, which indexes `program.source_text` by `\n`, also a point
/// mapping wherever the printer maps a node back into the source.
#[must_use]
pub fn emit_with(program: &Program<'_>, lines: Option<&LineIndex>, comments: Comments) -> Emitter {
    emit_after(&[], program, lines, comments)
}

/// [`emit_with()`], with the pieces of `head` written before the program and mapped nowhere.
#[must_use]
pub fn emit_after(
    head: &[&str],
    program: &Program<'_>,
    lines: Option<&LineIndex>,
    comments: Comments,
) -> Emitter {
    lines.map_or_else(
        || Emitter {
            out: printed(codegen(program, options(), comments), program, head).code,
            ..Emitter::default()
        },
        |lines| print_mapped_with(head, program, lines, comments),
    )
}

fn head_len(head: &[&str]) -> usize {
    head.iter().map(|piece| piece.len()).sum()
}

fn print_mapped_with(
    head: &[&str],
    program: &Program<'_>,
    lines: &LineIndex,
    comments: Comments,
) -> Emitter {
    // The printer counts ECMAScript's line breaks, which differ from `\n` only at a lone CR, LS or
    // PS.
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
    let options = CodegenOptions {
        source_map_path: Some("source".into()),
        ..options()
    };
    let printed = printed(codegen(program, options, comments), program, head);
    let mut emitter = Emitter::default();
    if let Some(map) = printed.map {
        let start = head_len(head);
        let mut generated = Cursor::new(&printed.code[start..]);
        emitter.mappings = map
            .get_tokens()
            .filter_map(|token| {
                Some(Mapping {
                    generated: start as u32
                        + generated.seek(token.get_dst_line(), token.get_dst_col())?,
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
