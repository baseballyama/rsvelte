//! The esrap command buffer and its flattening driver.
//!
//! A faithful port of the command model in esrap's `src/index.js` /
//! `src/context.js`. Visitors don't write strings directly; they push
//! [`Command`]s onto a buffer, and the [`print()`] function flattens that buffer into the
//! final source text. The indirection is what lets a visitor build a child
//! layout, [`measure`](crate::context::Context::measure) it, and only then
//! decide whether to emit it on one line or break it across several — esrap's
//! whole layout strategy falls out of this.
//!
//! The sentinels (`Newline`/`Margin`/`Space`/`Indent`/`Dedent`) mirror the
//! integer constants esrap pushes onto the same array as strings. `Indent` and
//! `Dedent` don't emit anything immediately; they grow/shrink the whitespace
//! prefix that a later `Newline` will emit, exactly as upstream mutates its
//! `current_newline` string.

use compact_str::CompactString;

/// One entry in the command buffer. Strings are literal output; the sentinels
/// defer whitespace decisions until the next string is emitted.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Command {
    /// An extra blank line before the next newline (only meaningful when a
    /// `Newline` is also pending).
    Margin,
    /// Emit the current indentation-aware newline before the next string.
    Newline,
    /// Grow the newline prefix by one indent level.
    Indent,
    /// Shrink the newline prefix by one indent level.
    Dedent,
    /// Emit a single space before the next string (unless a newline supersedes
    /// it).
    Space,
    /// Literal output. A `CompactString` so the fragments the printer emits —
    /// punctuation, keywords, identifiers, nearly all under the 24-byte inline
    /// limit — live in the command itself instead of a heap allocation.
    Str(CompactString),
    /// A nested buffer, spliced in place (esrap's nested command arrays).
    Nested(Vec<Self>),
    /// A source-map anchor (1-based line, 0-based column) for a following
    /// string. `Driver::run` consumes it into a [`Mapping`] at the current
    /// generated position (see [`flatten_with_map`]); like a string, it also
    /// flushes pending whitespace first, matching upstream ordering.
    Location { line: u32, column: u32 },
}

/// One source-map entry: a generated position and the source position it came from, all 0-based.
///
/// Flat rather than grouped per generated line — grouping
/// cost one `Vec` allocation for every line of output. esrap only ever maps a
/// single source, so there is no source index.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Mapping {
    /// 0-based line in the generated output.
    pub gen_line: u32,
    /// 0-based column in the generated output.
    pub gen_column: u32,
    /// 0-based line in the original source.
    pub source_line: u32,
    /// 0-based column in the original source.
    pub source_column: u32,
}

/// Flatten `commands` into source text, using `indent` (e.g. `"\t"` or a run
/// of spaces) for each indentation level. Faithful port of the `run`/`append`
/// loop in esrap's `print`.
pub fn print(commands: &[Command], indent: &str) -> String {
    flatten_without_map(commands, indent)
}

fn flatten_without_map(commands: &[Command], indent: &str) -> String {
    let mut driver = CodeDriver {
        code: String::new(),
        current_newline: String::from("\n"),
        indent,
        needs_newline: false,
        needs_margin: false,
        needs_space: false,
    };
    for command in commands {
        driver.run(command);
    }
    driver.code
}

struct CodeDriver<'a> {
    code: String,
    current_newline: String,
    indent: &'a str,
    needs_newline: bool,
    needs_margin: bool,
    needs_space: bool,
}

impl CodeDriver<'_> {
    fn run(&mut self, command: &Command) {
        match command {
            Command::Nested(inner) => {
                for command in inner {
                    self.run(command);
                }
            }
            Command::Newline => self.needs_newline = true,
            Command::Margin => self.needs_margin = true,
            Command::Space => self.needs_space = true,
            Command::Indent => self.current_newline.push_str(self.indent),
            Command::Dedent => {
                let len = self.current_newline.len().saturating_sub(self.indent.len());
                self.current_newline.truncate(len);
            }
            Command::Str(string) => {
                self.flush_pending();
                self.code.push_str(string);
            }
            Command::Location { .. } => self.flush_pending(),
        }
    }

    fn flush_pending(&mut self) {
        if self.needs_newline {
            if self.needs_margin {
                self.code.push('\n');
            }
            self.code.push_str(&self.current_newline);
        } else if self.needs_space {
            self.code.push(' ');
        }
        self.needs_newline = false;
        self.needs_margin = false;
        self.needs_space = false;
    }
}

/// Flatten `commands` into both the source text and its source-map [`Mapping`]s.
/// A faithful port of esrap's `print` driver, which threads the generated
/// position through `append` and records a mapping on every `Location` command.
///
/// Note on columns: esrap segments carry `ESTree` columns (UTF-16 code-unit
/// indices). This port derives source columns from byte offsets, so the two
/// agree for ASCII / BMP source (which covers the keyword sites). Generated
/// columns are likewise tracked in `char`s of the emitted code.
pub fn flatten_with_map(commands: &[Command], indent: &str) -> (String, Vec<Mapping>) {
    let mut driver = Driver {
        code: String::new(),
        current_newline: String::from("\n"),
        indent,
        needs_newline: false,
        needs_margin: false,
        needs_space: false,
        current_line: 0,
        current_column: 0,
        mappings: Vec::new(),
    };
    for command in commands {
        driver.run(command);
    }
    (driver.code, driver.mappings)
}

struct Driver<'a> {
    code: String,
    /// The whitespace emitted on a newline: `"\n"` plus one `indent` per active
    /// level. `Indent`/`Dedent` mutate this in place.
    current_newline: String,
    indent: &'a str,
    needs_newline: bool,
    needs_margin: bool,
    needs_space: bool,
    /// Current 0-based generated line, advanced on each `\n`.
    current_line: u32,
    /// Current 0-based generated column (in `char`s), reset on each `\n`.
    current_column: u32,
    mappings: Vec<Mapping>,
}

impl Driver<'_> {
    fn run(&mut self, command: &Command) {
        match command {
            Command::Nested(inner) => {
                for c in inner {
                    self.run(c);
                }
            }
            Command::Newline => self.needs_newline = true,
            Command::Margin => self.needs_margin = true,
            Command::Space => self.needs_space = true,
            Command::Indent => self.current_newline.push_str(self.indent),
            Command::Dedent => {
                let len = self.current_newline.len().saturating_sub(self.indent.len());
                self.current_newline.truncate(len);
            }
            Command::Str(s) => {
                self.flush_pending();
                self.append(s);
            }
            Command::Location { line, column } => {
                // Anchors flush pending whitespace just like a string would (so
                // adding source-map support doesn't shift output), then record a
                // mapping at the current generated position. Mirrors esrap's
                // `command.type === 'Location'` branch in `run`.
                self.flush_pending();
                self.mappings.push(Mapping {
                    gen_line: self.current_line,
                    gen_column: self.current_column,
                    // `line` is 1-based, as ESTree `loc` reports it.
                    source_line: *line - 1,
                    source_column: *column,
                });
            }
        }
    }

    /// Append literal text to the output, advancing the generated position per
    /// char and rolling over to the next line on each `\n`. A faithful port of
    /// esrap's `append`.
    fn append(&mut self, str: &str) {
        self.code.push_str(str);
        for ch in str.chars() {
            if ch == '\n' {
                self.current_line += 1;
                self.current_column = 0;
            } else {
                self.current_column += 1;
            }
        }
    }

    /// Emit any pending newline/space before the next string. A pending newline
    /// supersedes a pending space; a pending margin adds one blank line ahead of
    /// the newline.
    fn flush_pending(&mut self) {
        if self.needs_newline {
            if self.needs_margin {
                self.append("\n");
            }
            let nl = std::mem::take(&mut self.current_newline);
            self.append(&nl);
            self.current_newline = nl;
        } else if self.needs_space {
            self.append(" ");
        }
        self.needs_newline = false;
        self.needs_margin = false;
        self.needs_space = false;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn cmds(v: &[Command]) -> String {
        print(v, "\t")
    }

    #[test]
    fn plain_strings_concatenate() {
        assert_eq!(
            cmds(&[Command::Str("a".into()), Command::Str("b".into())]),
            "ab"
        );
    }

    #[test]
    fn space_separates_only_before_next_string() {
        // A trailing Space with no following string emits nothing.
        assert_eq!(
            cmds(&[
                Command::Str("a".into()),
                Command::Space,
                Command::Str("b".into()),
                Command::Space,
            ]),
            "a b"
        );
    }

    #[test]
    fn newline_uses_indent_prefix() {
        assert_eq!(
            cmds(&[
                Command::Str("{".into()),
                Command::Indent,
                Command::Newline,
                Command::Str("x".into()),
                Command::Dedent,
                Command::Newline,
                Command::Str("}".into()),
            ]),
            "{\n\tx\n}"
        );
    }

    #[test]
    fn newline_supersedes_space() {
        assert_eq!(
            cmds(&[
                Command::Str("a".into()),
                Command::Space,
                Command::Newline,
                Command::Str("b".into()),
            ]),
            "a\nb"
        );
    }

    #[test]
    fn margin_adds_blank_line_before_newline() {
        assert_eq!(
            cmds(&[
                Command::Str("a".into()),
                Command::Margin,
                Command::Newline,
                Command::Str("b".into()),
            ]),
            "a\n\nb"
        );
    }

    #[test]
    fn margin_without_newline_does_nothing() {
        assert_eq!(
            cmds(&[
                Command::Str("a".into()),
                Command::Margin,
                Command::Str("b".into())
            ]),
            "ab"
        );
    }

    #[test]
    fn nested_commands_splice_in_place() {
        assert_eq!(
            cmds(&[
                Command::Str("(".into()),
                Command::Nested(vec![
                    Command::Str("x".into()),
                    Command::Space,
                    Command::Str("y".into())
                ]),
                Command::Str(")".into()),
            ]),
            "(x y)"
        );
    }

    #[test]
    fn unbalanced_dedent_does_not_panic() {
        // A Dedent with no matching Indent (unbalanced buffer) must floor the
        // newline prefix at 0 rather than underflow-panic on the subtraction.
        // The prefix (including the leading "\n") collapses to empty.
        assert_eq!(
            cmds(&[Command::Dedent, Command::Newline, Command::Str("x".into()),]),
            "x"
        );
    }

    #[test]
    fn multi_level_indent() {
        assert_eq!(
            cmds(&[
                Command::Indent,
                Command::Indent,
                Command::Newline,
                Command::Str("x".into()),
            ]),
            "\n\t\tx"
        );
    }

    #[test]
    fn no_map_output_matches_mapping_driver() {
        let commands = vec![
            Command::Location { line: 1, column: 0 },
            Command::Str("const".into()),
            Command::Space,
            Command::Location { line: 1, column: 6 },
            Command::Str("π".into()),
            Command::Space,
            Command::Str("=".into()),
            Command::Nested(vec![
                Command::Indent,
                Command::Margin,
                Command::Newline,
                Command::Location { line: 2, column: 0 },
                Command::Str("\"line 1\\nline 2\"".into()),
                Command::Dedent,
            ]),
            Command::Newline,
            Command::Str(";".into()),
            Command::Space,
        ];

        assert_eq!(
            flatten_without_map(&commands, "  "),
            flatten_with_map(&commands, "  ").0
        );
    }
}
