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

use std::borrow::Cow;

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
    /// Literal output. A `Cow` so static literals (the overwhelming majority of
    /// writes) borrow with zero allocation, while dynamic text still owns.
    Str(Cow<'static, str>),
    /// A nested buffer, spliced in place (esrap's nested command arrays).
    Nested(Vec<Command>),
    /// A source-map anchor (1-based line, 0-based column) for a following
    /// string. Carried through the buffer but not yet consumed — source-map
    /// emission is a later step; for now it only forces the same pending-newline
    /// flush a string would, matching upstream ordering.
    Location { line: u32, column: u32 },
}

/// One source-map segment: `[generated_column, source_index, source_line_0based,
/// source_column_0based]`. The source index is always `0` (esrap only ever maps a
/// single source), matching upstream's emitted shape.
pub type Segment = [i64; 4];

/// Flatten `commands` into source text, using `indent` (e.g. `"\t"` or a run
/// of spaces) for each indentation level. Faithful port of the `run`/`append`
/// loop in esrap's `print`.
pub fn print(commands: &[Command], indent: &str) -> String {
    flatten_with_map(commands, indent).0
}

/// Flatten `commands` into both the source text and its source-map `mappings`
/// (an array-of-lines, each line an array of [`Segment`]s). A faithful port of
/// esrap's `print` driver, which threads `current_column` through `append` and
/// pushes a segment on every `Location` command.
///
/// Note on columns: esrap segments carry ESTree columns (UTF-16 code-unit
/// indices). This port derives source columns from byte offsets, so the two
/// agree for ASCII / BMP source (which covers the keyword sites). Generated
/// columns are likewise tracked in `char`s of the emitted code.
pub fn flatten_with_map(commands: &[Command], indent: &str) -> (String, Vec<Vec<Segment>>) {
    let mut driver = Driver {
        code: String::new(),
        current_newline: String::from("\n"),
        indent,
        needs_newline: false,
        needs_margin: false,
        needs_space: false,
        current_column: 0,
        mappings: Vec::new(),
        current_line: Vec::new(),
    };
    for command in commands {
        driver.run(command);
    }
    // esrap pushes the final (possibly empty) line once the buffer is drained.
    driver
        .mappings
        .push(std::mem::take(&mut driver.current_line));
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
    /// Current 0-based generated column (in `char`s), reset on each `\n`.
    current_column: i64,
    /// Completed generated lines of segments.
    mappings: Vec<Vec<Segment>>,
    /// Segments accumulated for the generated line currently being built.
    current_line: Vec<Segment>,
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
                // segment at the current generated column. Mirrors esrap's
                // `command.type === 'Location'` branch in `run`.
                self.flush_pending();
                self.current_line.push([
                    self.current_column,
                    0, // source index is always zero
                    *line as i64 - 1,
                    *column as i64,
                ]);
            }
        }
    }

    /// Append literal text to the output, advancing `current_column` per char
    /// and rolling over `current_line`/`mappings` on each `\n`. A faithful port
    /// of esrap's `append`.
    fn append(&mut self, str: &str) {
        self.code.push_str(str);
        for ch in str.chars() {
            if ch == '\n' {
                self.mappings.push(std::mem::take(&mut self.current_line));
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

    fn cmds(v: Vec<Command>) -> String {
        print(&v, "\t")
    }

    #[test]
    fn plain_strings_concatenate() {
        assert_eq!(
            cmds(vec![Command::Str("a".into()), Command::Str("b".into())]),
            "ab"
        );
    }

    #[test]
    fn space_separates_only_before_next_string() {
        // A trailing Space with no following string emits nothing.
        assert_eq!(
            cmds(vec![
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
            cmds(vec![
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
            cmds(vec![
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
            cmds(vec![
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
            cmds(vec![
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
            cmds(vec![
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
            cmds(vec![
                Command::Dedent,
                Command::Newline,
                Command::Str("x".into()),
            ]),
            "x"
        );
    }

    #[test]
    fn multi_level_indent() {
        assert_eq!(
            cmds(vec![
                Command::Indent,
                Command::Indent,
                Command::Newline,
                Command::Str("x".into()),
            ]),
            "\n\t\tx"
        );
    }
}
