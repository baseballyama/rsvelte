//! The visitor-facing output builder.
//!
//! A port of esrap's `Context` (`src/context.js`). A [`Context`] accumulates
//! literal text and deferred layout events while tracking whether it has gone multiline, the signal
//! visitors use to decide between a one-line and a broken-out layout. Unlike
//! upstream, dispatch (`visit`) lives in the printer (a `match` over oxc node
//! kinds), so `Context` is purely the output API: `write`, whitespace events,
//! `append` (splice a child buffer), `measure`, and `empty`.

use crate::command::{Buffer, EventKind};

/// Accumulates output for one syntactic unit. Build a child with
/// [`Context::child`], fill it, then [`Context::append`] it into the parent.
#[derive(Default)]
pub struct Context {
    buffer: Buffer,
    has_newline: bool,
    /// `true` once this context (or an appended child) emitted a newline.
    /// Visitors read it to pick a layout.
    pub multiline: bool,
}

impl Context {
    /// A fresh, empty context.
    pub fn new() -> Self {
        Self {
            buffer: crate::pool::take(),
            ..Self::default()
        }
    }

    /// A fresh child context. Named `child` rather than mirroring esrap's `new`
    /// because in this port it carries no shared visitor table.
    pub fn child() -> Self {
        Self::new()
    }

    /// Grow the newline indentation by one level for subsequent newlines.
    pub fn indent(&mut self) {
        self.buffer.event(EventKind::Indent);
    }

    /// Shrink the newline indentation by one level.
    pub fn dedent(&mut self) {
        self.buffer.event(EventKind::Dedent);
    }

    /// Request a blank line ahead of the next newline.
    pub fn margin(&mut self) {
        self.buffer.event(EventKind::Margin);
    }

    /// Emit an indentation-aware newline before the next write. Marks the
    /// context multiline.
    pub fn newline(&mut self) {
        self.has_newline = true;
        self.buffer.event(EventKind::Newline);
    }

    /// Emit a single space before the next write.
    pub fn space(&mut self) {
        self.buffer.event(EventKind::Space);
    }

    /// Append literal `content`. If a newline is already pending in this
    /// context, writing after it makes the context multiline (mirrors esrap).
    pub fn write(&mut self, content: impl AsRef<str>) {
        let content = content.as_ref();
        if content.is_empty() {
            self.buffer.event(EventKind::Flush);
        } else {
            self.buffer.text.push_str(content);
        }
        if self.has_newline {
            self.multiline = true;
        }
    }

    /// Record a source-map anchor (1-based line, 0-based column).
    pub fn location(&mut self, line: u32, column: u32) {
        self.buffer.event(EventKind::Location { line, column });
    }

    /// Splice `child`'s output in place, propagating its multiline state.
    pub fn append(&mut self, child: Self) {
        let child_multiline = child.multiline;
        self.buffer.append(child.buffer);
        if self.has_newline || child_multiline {
            self.multiline = true;
        }
    }

    /// `true` when nothing with visible content has been written.
    pub const fn empty(&self) -> bool {
        self.buffer.text.is_empty()
    }

    /// Total length of the literal strings in this context, ignoring whitespace
    /// sentinels — esrap's `measure`, used to decide if a layout fits on a line.
    pub const fn measure(&self) -> usize {
        self.buffer.text.len()
    }

    /// Consume the context, yielding its flat output buffer (for the top-level
    /// [`print`](crate::command::print) call).
    pub(crate) fn into_buffer(self) -> Buffer {
        self.buffer
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
        let mut child = Context::child();
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
        let mut child = Context::child();
        child.write("x");
        child.space();
        child.write("y");
        parent.append(child);
        parent.write(")");
        assert_eq!(print(&parent.into_buffer(), "\t", 0), "(x y)");
    }

    #[test]
    fn adjacent_writes_share_the_text_buffer() {
        let mut ctx = Context::new();
        ctx.write("const");
        ctx.write(" ");
        ctx.write("x");
        assert_eq!(ctx.buffer.text, "const x");
        assert_eq!(print(&ctx.into_buffer(), "\t", 0), "const x");
    }

    #[test]
    fn empty_write_flushes_pending_whitespace() {
        let mut ctx = Context::new();
        ctx.space();
        ctx.write("");
        assert_eq!(print(&ctx.into_buffer(), "\t", 0), " ");
    }
}
