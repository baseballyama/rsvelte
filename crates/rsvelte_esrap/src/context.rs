//! The visitor-facing output builder.
//!
//! A port of esrap's `Context` (`src/context.js`). A [`Context`] accumulates
//! literal text and deferred layout events while tracking whether it has gone multiline, the signal
//! visitors use to decide between a one-line and a broken-out layout. Unlike
//! upstream, dispatch (`visit`) lives in the printer (a `match` over oxc node
//! kinds), so `Context` is purely the output API: `write`, whitespace events,
//! `append` (splice a child buffer), `measure`, and `empty`.

use std::{cell::RefCell, rc::Rc};

use crate::command::{Buffer, EventKind, LayoutSpan};

const PENDING_NEWLINE: u8 = 1 << 0;
const PENDING_MARGIN: u8 = 1 << 1;
const PENDING_SPACE: u8 = 1 << 2;

/// Accumulates output for one syntactic unit. Build a child with
/// [`Context::child`], fill it, then [`Context::append`] it into the parent.
#[repr(C)]
pub struct Context<const DIRECT: bool = false> {
    buffer: Buffer,
    returned: Rc<RefCell<Vec<Buffer>>>,
    indent: String,
    indent_depth: u32,
    literal_len: usize,
    measure_base: usize,
    has_newline: bool,
    pending: u8,
    direct_dirty: bool,
    /// `true` once this context (or an appended child) emitted a newline.
    /// Visitors read it to pick a layout.
    pub multiline: bool,
}

pub(crate) struct Scope {
    measure_base: usize,
    event_len: usize,
    text_len: usize,
    layout_len: usize,
    literal_len: usize,
    indent_depth: u32,
    pending: u8,
    direct_dirty: bool,
    has_newline: bool,
    multiline: bool,
}

#[derive(Clone, Copy)]
pub(crate) struct EventMark {
    index: usize,
    offset: u32,
}

impl Context<false> {
    /// A fresh, empty context.
    pub fn new() -> Self {
        let returned = Rc::new(RefCell::new(crate::pool::take()));
        let buffer = returned.borrow_mut().pop().unwrap_or_default();
        Self {
            buffer,
            returned,
            indent: String::new(),
            indent_depth: 0,
            literal_len: 0,
            measure_base: 0,
            has_newline: false,
            pending: 0,
            direct_dirty: false,
            multiline: false,
        }
    }
}

impl Context<true> {
    pub(crate) fn new_direct(indent: &str, capacity: usize) -> Self {
        let returned = Rc::new(RefCell::new(crate::pool::take()));
        let mut buffer = returned.borrow_mut().pop().unwrap_or_default();
        buffer
            .text
            .reserve(capacity.saturating_sub(buffer.text.capacity()));
        Self {
            buffer,
            returned,
            indent: indent.to_owned(),
            indent_depth: 0,
            literal_len: 0,
            measure_base: 0,
            has_newline: false,
            pending: 0,
            direct_dirty: false,
            multiline: false,
        }
    }
}

impl<const DIRECT: bool> Context<DIRECT> {
    /// A fresh child context. Named `child` rather than mirroring esrap's `new`
    /// because in this port it carries no shared visitor table.
    pub fn child(&self) -> Context<false> {
        let buffer = self.returned.borrow_mut().pop().unwrap_or_default();
        Context {
            buffer,
            returned: Rc::clone(&self.returned),
            indent: String::new(),
            indent_depth: 0,
            literal_len: 0,
            measure_base: 0,
            has_newline: false,
            pending: 0,
            direct_dirty: false,
            multiline: false,
        }
    }

    /// Grow the newline indentation by one level for subsequent newlines.
    pub fn indent(&mut self) {
        if DIRECT {
            self.indent_depth += 1;
        } else {
            self.buffer.event(EventKind::Indent);
        }
    }

    /// Shrink the newline indentation by one level.
    pub fn dedent(&mut self) {
        if DIRECT {
            self.indent_depth = self.indent_depth.saturating_sub(1);
        } else {
            self.buffer.event(EventKind::Dedent);
        }
    }

    /// Request a blank line ahead of the next newline.
    pub fn margin(&mut self) {
        if DIRECT {
            self.pending |= PENDING_MARGIN;
        } else {
            self.buffer.event(EventKind::Margin);
        }
    }

    /// Emit an indentation-aware newline before the next write. Marks the
    /// context multiline.
    pub fn newline(&mut self) {
        self.has_newline = true;
        if DIRECT {
            self.pending |= PENDING_NEWLINE;
        } else {
            self.buffer.event(EventKind::Newline);
        }
    }

    /// Emit a single space before the next write.
    pub fn space(&mut self) {
        if DIRECT {
            self.pending |= PENDING_SPACE;
        } else {
            self.buffer.event(EventKind::Space);
        }
    }

    /// Append literal `content`. If a newline is already pending in this
    /// context, writing after it makes the context multiline (mirrors esrap).
    pub fn write(&mut self, content: impl AsRef<str>) {
        let content = content.as_ref();
        if DIRECT {
            self.flush_direct();
            if !content.is_empty() {
                self.buffer.text.push_str(content);
                self.literal_len += content.len();
            }
        } else if content.is_empty() {
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
        if DIRECT {
            self.flush_direct();
        } else {
            self.buffer.event(EventKind::Location { line, column });
        }
    }

    /// Splice `child`'s output in place, propagating its multiline state.
    pub fn append(&mut self, child: Context<false>) {
        let child_multiline = child.multiline;
        let mut child_buffer = child.buffer;
        if DIRECT {
            self.append_deferred(&child_buffer);
            child_buffer.text.clear();
            child_buffer.events.clear();
        } else {
            self.buffer.append(&mut child_buffer);
        }
        self.returned.borrow_mut().push(child_buffer);
        if self.has_newline || child_multiline {
            self.multiline = true;
        }
    }

    pub(crate) fn begin_scope(&mut self) -> Scope {
        let scope = Scope {
            measure_base: self.measure_base,
            event_len: self.buffer.events.len(),
            text_len: self.buffer.text.len(),
            layout_len: self.buffer.layouts.len(),
            literal_len: self.literal_len,
            indent_depth: self.indent_depth,
            pending: self.pending,
            direct_dirty: self.direct_dirty,
            has_newline: self.has_newline,
            multiline: self.multiline,
        };
        self.measure_base = if DIRECT {
            self.literal_len
        } else {
            self.buffer.text.len()
        };
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
        self.buffer.text.truncate(if DIRECT {
            scope.text_len
        } else {
            self.measure_base
        });
        self.buffer.events.truncate(scope.event_len);
        self.buffer.layouts.truncate(scope.layout_len);
        self.literal_len = scope.literal_len;
        self.indent_depth = scope.indent_depth;
        self.pending = scope.pending;
        self.direct_dirty = scope.direct_dirty;
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
        if DIRECT {
            self.insert_direct(mark.offset, kind);
            return;
        }
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
        if DIRECT {
            self.literal_len == self.measure_base
        } else {
            self.buffer.text.len() == self.measure_base
        }
    }

    /// Total length of the literal strings in this context, ignoring whitespace
    /// sentinels — esrap's `measure`, used to decide if a layout fits on a line.
    pub const fn measure(&self) -> usize {
        if DIRECT {
            self.literal_len - self.measure_base
        } else {
            self.buffer.text.len() - self.measure_base
        }
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

    pub(crate) fn into_direct_parts(self) -> (Buffer, Vec<Buffer>, String, bool) {
        debug_assert!(DIRECT);
        let indent = self.indent;
        let dirty = self.direct_dirty;
        let returned = match Rc::try_unwrap(self.returned) {
            Ok(returned) => returned.into_inner(),
            Err(_) => unreachable!("all child contexts must be consumed before printing"),
        };
        (self.buffer, returned, indent, dirty)
    }

    fn append_deferred(&mut self, child: &Buffer) {
        let child_literal_len = child.text.len();
        let mut cursor = 0;
        for event in &child.events {
            let offset = event.offset as usize;
            if offset > cursor {
                self.write_direct_text(&child.text[cursor..offset]);
                cursor = offset;
            }
            self.direct_event(event.kind);
        }
        if cursor < child.text.len() {
            self.write_direct_text(&child.text[cursor..]);
        }
        self.literal_len += child_literal_len;
    }

    fn direct_event(&mut self, kind: EventKind) {
        match kind {
            EventKind::Margin => self.pending |= PENDING_MARGIN,
            EventKind::Newline => self.pending |= PENDING_NEWLINE,
            EventKind::Indent => self.indent_depth += 1,
            EventKind::Dedent => self.indent_depth = self.indent_depth.saturating_sub(1),
            EventKind::Space => self.pending |= PENDING_SPACE,
            EventKind::Flush | EventKind::Location { .. } => self.flush_direct(),
        }
    }

    fn write_direct_text(&mut self, text: &str) {
        self.flush_direct();
        self.buffer.text.push_str(text);
    }

    #[inline(always)]
    fn flush_direct(&mut self) {
        if self.pending == 0 {
            return;
        }
        self.flush_direct_slow();
    }

    #[cold]
    #[inline(never)]
    fn flush_direct_slow(&mut self) {
        let start = u32::try_from(self.buffer.text.len()).expect("esrap output exceeds u32");
        if self.pending & PENDING_NEWLINE != 0 {
            if self.pending & PENDING_MARGIN != 0 {
                self.buffer.text.push('\n');
            }
            self.buffer.text.push('\n');
            for _ in 0..self.indent_depth {
                self.buffer.text.push_str(&self.indent);
            }
            let raw_len = u32::try_from(self.buffer.text.len() - start as usize)
                .expect("esrap output exceeds u32");
            self.buffer.layouts.push(LayoutSpan {
                start,
                raw_len,
                depth: self.indent_depth,
                newline: true,
                margin: self.pending & PENDING_MARGIN != 0,
                dirty: false,
            });
        } else if self.pending & PENDING_SPACE != 0 {
            self.buffer.text.push(' ');
            self.buffer.layouts.push(LayoutSpan {
                start,
                raw_len: 1,
                depth: 0,
                newline: false,
                margin: false,
                dirty: false,
            });
        }
        self.pending = 0;
    }

    fn insert_direct(&mut self, offset: u32, kind: EventKind) {
        match kind {
            EventKind::Space => {
                if self.layout_at(offset).is_none() {
                    self.insert_layout(offset, false);
                }
            }
            EventKind::Newline => {
                if let Some(index) = self.layout_at(offset) {
                    if !self.buffer.layouts[index].newline {
                        self.buffer.layouts[index].newline = true;
                        self.buffer.layouts[index].depth = self.indent_depth;
                        self.buffer.layouts[index].dirty = true;
                        self.direct_dirty = true;
                    }
                } else {
                    self.insert_layout(offset, true);
                }
            }
            EventKind::Margin => {
                if let Some(index) = self.layout_at(offset)
                    && self.buffer.layouts[index].newline
                    && !self.buffer.layouts[index].margin
                {
                    self.buffer.layouts[index].margin = true;
                    self.buffer.layouts[index].dirty = true;
                    self.direct_dirty = true;
                }
            }
            EventKind::Indent => {
                for layout in self
                    .buffer
                    .layouts
                    .iter_mut()
                    .filter(|layout| layout.start >= offset && layout.newline)
                {
                    layout.depth += 1;
                    layout.dirty = true;
                }
                self.indent_depth += 1;
                self.direct_dirty = true;
            }
            _ => unreachable!("plain retroactive insertion only uses layout events"),
        }
    }

    fn layout_at(&self, offset: u32) -> Option<usize> {
        self.buffer
            .layouts
            .binary_search_by_key(&offset, |layout| layout.start)
            .ok()
    }

    fn insert_layout(&mut self, offset: u32, newline: bool) {
        let index = self
            .buffer
            .layouts
            .partition_point(|layout| layout.start < offset);
        self.buffer.layouts.insert(
            index,
            LayoutSpan {
                start: offset,
                raw_len: 0,
                depth: self.indent_depth,
                newline,
                margin: false,
                dirty: true,
            },
        );
        self.direct_dirty = true;
    }

    #[cfg(test)]
    pub(crate) fn into_buffer(self) -> Buffer {
        self.into_parts().0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::command::{finish_direct, print};

    fn direct_output(ctx: Context<true>) -> String {
        let (buffer, _, indent, dirty) = ctx.into_direct_parts();
        finish_direct(buffer, &indent, dirty).0
    }

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

    #[test]
    fn direct_parent_space_is_superseded_by_child_newline() {
        let mut parent = Context::new_direct("\t", 0);
        parent.space();
        let mut child = parent.child();
        child.newline();
        child.write("x");
        parent.append(child);
        assert_eq!(direct_output(parent), "\nx");
    }

    #[test]
    fn direct_parent_margin_combines_with_child_newline() {
        let mut parent = Context::new_direct("\t", 0);
        parent.margin();
        let mut child = parent.child();
        child.newline();
        child.write("x");
        parent.append(child);
        assert_eq!(direct_output(parent), "\n\nx");
    }
}
