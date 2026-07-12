//! The visitor-facing command builder.
//!
//! A port of esrap's `Context` (`src/context.js`). A [`Context`] accumulates
//! [`Command`]s and tracks whether it has gone multiline, which is the signal
//! visitors use to decide between a one-line and a broken-out layout. Unlike
//! upstream, dispatch (`visit`) lives in the printer (a `match` over oxc node
//! kinds), so `Context` is purely the buffer API: `write`, the whitespace
//! sentinels, `append` (splice a child buffer), `measure`, and `empty`.

use crate::command::Command;
use std::borrow::Cow;

/// Accumulates commands for one syntactic unit. Build a child with
/// [`Context::child`], fill it, then [`Context::append`] it into the parent.
#[derive(Default)]
pub struct Context {
    commands: Vec<Command>,
    has_newline: bool,
    /// `true` once this context (or an appended child) emitted a newline.
    /// Visitors read it to pick a layout.
    pub multiline: bool,
}

impl Context {
    /// A fresh, empty context.
    pub fn new() -> Self {
        Self::default()
    }

    /// A fresh child context. Named `child` rather than mirroring esrap's `new`
    /// because in this port it carries no shared visitor table.
    pub fn child(&self) -> Context {
        Context::new()
    }

    /// Grow the newline indentation by one level for subsequent newlines.
    pub fn indent(&mut self) {
        self.commands.push(Command::Indent);
    }

    /// Shrink the newline indentation by one level.
    pub fn dedent(&mut self) {
        self.commands.push(Command::Dedent);
    }

    /// Request a blank line ahead of the next newline.
    pub fn margin(&mut self) {
        self.commands.push(Command::Margin);
    }

    /// Emit an indentation-aware newline before the next write. Marks the
    /// context multiline.
    pub fn newline(&mut self) {
        self.has_newline = true;
        self.commands.push(Command::Newline);
    }

    /// Emit a single space before the next write.
    pub fn space(&mut self) {
        self.commands.push(Command::Space);
    }

    /// Append literal `content`. If a newline is already pending in this
    /// context, writing after it makes the context multiline (mirrors esrap).
    pub fn write(&mut self, content: impl Into<Cow<'static, str>>) {
        self.commands.push(Command::Str(content.into()));
        if self.has_newline {
            self.multiline = true;
        }
    }

    /// Record a source-map anchor (1-based line, 0-based column).
    pub fn location(&mut self, line: u32, column: u32) {
        self.commands.push(Command::Location { line, column });
    }

    /// Splice `child`'s commands in place, propagating its multiline state.
    pub fn append(&mut self, child: Context) {
        let child_multiline = child.multiline;
        self.commands.push(Command::Nested(child.commands));
        if self.has_newline || child_multiline {
            self.multiline = true;
        }
    }

    /// `true` when nothing with visible content has been written.
    pub fn empty(&self) -> bool {
        !self.commands.iter().any(has_content)
    }

    /// Total length of the literal strings in this context, ignoring whitespace
    /// sentinels — esrap's `measure`, used to decide if a layout fits on a line.
    pub fn measure(&self) -> usize {
        measure(&self.commands)
    }

    /// Consume the context, yielding its raw command buffer (for the top-level
    /// [`print`](crate::command::print) call).
    pub fn into_commands(self) -> Vec<Command> {
        self.commands
    }
}

fn measure(commands: &[Command]) -> usize {
    let mut total = 0;
    for command in commands {
        match command {
            Command::Str(s) => total += s.len(),
            Command::Nested(inner) => total += measure(inner),
            _ => {}
        }
    }
    total
}

fn has_content(command: &Command) -> bool {
    match command {
        Command::Str(s) => !s.is_empty(),
        Command::Nested(inner) => inner.iter().any(has_content),
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::print;

    #[test]
    fn measure_counts_only_strings() {
        let mut ctx = Context::new();
        ctx.write("abc");
        ctx.space();
        ctx.newline();
        ctx.write("de");
        assert_eq!(ctx.measure(), 5);
    }

    #[test]
    fn empty_ignores_whitespace_sentinels() {
        let mut ctx = Context::new();
        ctx.space();
        ctx.newline();
        ctx.indent();
        assert!(ctx.empty());
        ctx.write("x");
        assert!(!ctx.empty());
    }

    #[test]
    fn append_propagates_multiline() {
        let mut parent = Context::new();
        let mut child = parent.child();
        child.newline();
        child.write("x");
        assert!(child.multiline);
        parent.write("a");
        parent.append(child);
        assert!(parent.multiline);
    }

    #[test]
    fn append_splices_child_output() {
        let mut parent = Context::new();
        parent.write("(");
        let mut child = parent.child();
        child.write("x");
        child.space();
        child.write("y");
        parent.append(child);
        parent.write(")");
        assert_eq!(print(&parent.into_commands(), "\t"), "(x y)");
    }
}
