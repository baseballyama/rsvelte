//! The visitor-facing output builder.
//!
//! A port of esrap's `Context` (`src/context.js`). A [`Context`] accumulates
//! literal text and deferred layout events while tracking whether it has gone multiline, the signal
//! visitors use to decide between a one-line and a broken-out layout. Unlike
//! upstream, dispatch (`visit`) lives in the printer (a `match` over oxc node
//! kinds), so `Context` is purely the output API: `write`, whitespace events,
//! `append` (splice a child buffer), `measure`, and `empty`.

use std::{cell::RefCell, rc::Rc};

use crate::command::{Buffer, EventKind};

/// Accumulates output for one syntactic unit. Build a child with
/// [`Context::child`], fill it, then [`Context::append`] it into the parent.
pub struct Context {
    buffer: Buffer,
    returned: Rc<RefCell<Vec<Buffer>>>,
    measure_base: usize,
    has_newline: bool,
    /// `true` once this context (or an appended child) emitted a newline.
    /// Visitors read it to pick a layout.
    pub multiline: bool,
}

pub(crate) struct Scope {
    measure_base: usize,
    event_len: usize,
    has_newline: bool,
    multiline: bool,
}

#[derive(Clone, Copy)]
pub(crate) struct EventMark {
    index: usize,
    offset: u32,
}

impl Context {
    /// A fresh, empty context.
    pub fn new() -> Self {
        let returned = Rc::new(RefCell::new(crate::pool::take()));
        let buffer = returned.borrow_mut().pop().unwrap_or_default();
        Self {
            buffer,
            returned,
            measure_base: 0,
            has_newline: false,
            multiline: false,
        }
    }

    /// A fresh child context. Named `child` rather than mirroring esrap's `new`
    /// because in this port it carries no shared visitor table.
    pub fn child(&self) -> Self {
        let buffer = self.returned.borrow_mut().pop().unwrap_or_default();
        Self {
            buffer,
            returned: Rc::clone(&self.returned),
            measure_base: 0,
            has_newline: false,
            multiline: false,
        }
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
        let mut child_buffer = child.buffer;
        self.buffer.append(&mut child_buffer);
        self.returned.borrow_mut().push(child_buffer);
        if self.has_newline || child_multiline {
            self.multiline = true;
        }
    }

    pub(crate) fn begin_scope(&mut self) -> Scope {
        let scope = Scope {
            measure_base: self.measure_base,
            event_len: self.buffer.events.len(),
            has_newline: self.has_newline,
            multiline: self.multiline,
        };
        self.measure_base = self.buffer.text.len();
        self.has_newline = false;
        self.multiline = false;
        scope
    }

    pub(crate) fn end_scope(&mut self, scope: Scope) -> bool {
        let child_multiline = self.multiline;
        self.measure_base = scope.measure_base;
        self.has_newline = scope.has_newline;
        self.multiline = scope.multiline || scope.has_newline || child_multiline;
        child_multiline
    }

    pub(crate) fn discard_scope(&mut self, scope: Scope) {
        self.buffer.text.truncate(self.measure_base);
        self.buffer.events.truncate(scope.event_len);
        self.measure_base = scope.measure_base;
        self.has_newline = scope.has_newline;
        self.multiline = scope.multiline;
    }

    pub(crate) fn event_mark(&self) -> EventMark {
        EventMark {
            index: self.buffer.events.len(),
            offset: u32::try_from(self.buffer.text.len()).expect("esrap output exceeds u32"),
        }
    }

    pub(crate) fn insert_event(&mut self, mark: EventMark, kind: EventKind) {
        self.buffer.events.insert(
            mark.index,
            crate::command::Event {
                offset: mark.offset,
                kind,
            },
        );
    }

    /// `true` when nothing with visible content has been written.
    pub const fn empty(&self) -> bool {
        self.buffer.text.len() == self.measure_base
    }

    /// Total length of the literal strings in this context, ignoring whitespace
    /// sentinels — esrap's `measure`, used to decide if a layout fits on a line.
    pub const fn measure(&self) -> usize {
        self.buffer.text.len() - self.measure_base
    }

    /// Consume the context, yielding its flat output buffer (for the top-level
    /// [`print`](crate::command::print) call).
    pub(crate) fn into_parts(self) -> (Buffer, Vec<Buffer>) {
        let returned = match Rc::try_unwrap(self.returned) {
            Ok(returned) => returned.into_inner(),
            Err(_) => unreachable!("all child contexts must be consumed before printing"),
        };
        (self.buffer, returned)
    }

    #[cfg(test)]
    pub(crate) fn into_buffer(self) -> Buffer {
        self.into_parts().0
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

    #[test]
    fn scope_tracks_local_layout_without_a_child_buffer() {
        let mut ctx = Context::new();
        ctx.write("a");
        let mark = ctx.event_mark();
        ctx.newline();
        let scope = ctx.begin_scope();
        ctx.write("bc");
        assert_eq!(ctx.measure(), 2);
        ctx.newline();
        ctx.write("d");
        assert!(ctx.end_scope(scope));
        ctx.insert_event(mark, EventKind::Margin);
        assert_eq!(print(&ctx.into_buffer(), "\t", 0), "a\n\nbc\nd");
    }

    #[test]
    fn discarded_scope_removes_text_and_layout_events() {
        let mut ctx = Context::new();
        ctx.write("a");
        let scope = ctx.begin_scope();
        ctx.newline();
        ctx.write("bc");
        ctx.discard_scope(scope);
        ctx.write("d");
        assert_eq!(print(&ctx.into_buffer(), "\t", 0), "ad");
    }
}
