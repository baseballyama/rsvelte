//! The esrap command buffer and its flattening driver.
//!
//! A faithful port of the command model in esrap's `src/index.js` /
//! `src/context.js`. Visitors don't write strings directly; they push
//! [`Command`]s onto a buffer, and [`print`] flattens that buffer into the
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
    /// Literal output.
    Str(String),
    /// A nested buffer, spliced in place (esrap's nested command arrays).
    Nested(Vec<Command>),
    /// A source-map anchor (1-based line, 0-based column) for a following
    /// string. Carried through the buffer but not yet consumed — source-map
    /// emission is a later step; for now it only forces the same pending-newline
    /// flush a string would, matching upstream ordering.
    Location { line: u32, column: u32 },
}

/// Flatten `commands` into source text, using `indent` (e.g. `"\t"` or a run
/// of spaces) for each indentation level. Faithful port of the `run`/`append`
/// loop in esrap's `print`.
pub fn print(commands: &[Command], indent: &str) -> String {
    let mut driver = Driver {
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

struct Driver<'a> {
    code: String,
    /// The whitespace emitted on a newline: `"\n"` plus one `indent` per active
    /// level. `Indent`/`Dedent` mutate this in place.
    current_newline: String,
    indent: &'a str,
    needs_newline: bool,
    needs_margin: bool,
    needs_space: bool,
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
                let len = self.current_newline.len() - self.indent.len();
                self.current_newline.truncate(len);
            }
            Command::Str(s) => {
                self.flush_pending();
                self.code.push_str(s);
            }
            Command::Location { .. } => {
                // Anchors flush pending whitespace just like a string would, so
                // that adding source-map support later doesn't shift output.
                self.flush_pending();
            }
        }
    }

    /// Emit any pending newline/space before the next string. A pending newline
    /// supersedes a pending space; a pending margin adds one blank line ahead of
    /// the newline.
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
