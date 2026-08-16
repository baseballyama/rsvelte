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
const PENDING_OPTIMISTIC_SPACE: u8 = 1 << 3;
const FAST_INDENT_BYTES: usize = 32;

#[inline(always)]
fn push_str_small(text: &mut String, value: &str) {
    let len = value.len();
    if len == 0 {
        return;
    }
    if text.capacity() - text.len() < len {
        reserve_str_slow(text, len);
    }

    let old_len = text.len();
    // SAFETY: capacity was ensured above, the ranges do not overlap, and value is valid UTF-8.
    unsafe {
        let bytes = text.as_mut_vec();
        let dst = bytes.as_mut_ptr().add(old_len);
        let src = value.as_ptr();
        if len <= 4 {
            match len {
                1 => dst.write(src.read()),
                2 => (dst.cast::<u16>()).write_unaligned((src.cast::<u16>()).read_unaligned()),
                3 => {
                    (dst.cast::<u16>()).write_unaligned((src.cast::<u16>()).read_unaligned());
                    dst.add(2).write(src.add(2).read());
                }
                4 => (dst.cast::<u32>()).write_unaligned((src.cast::<u32>()).read_unaligned()),
                _ => unreachable!(),
            }
        } else if len < 8 {
            (dst.cast::<u32>()).write_unaligned((src.cast::<u32>()).read_unaligned());
            (dst.add(len - 4).cast::<u32>())
                .write_unaligned((src.add(len - 4).cast::<u32>()).read_unaligned());
        } else if len == 8 {
            (dst.cast::<u64>()).write_unaligned((src.cast::<u64>()).read_unaligned());
        } else if len < 16 {
            (dst.cast::<u64>()).write_unaligned((src.cast::<u64>()).read_unaligned());
            (dst.add(len - 8).cast::<u64>())
                .write_unaligned((src.add(len - 8).cast::<u64>()).read_unaligned());
        } else if len == 16 {
            (dst.cast::<u128>()).write_unaligned((src.cast::<u128>()).read_unaligned());
        } else {
            std::ptr::copy_nonoverlapping(src, dst, len);
        }
        bytes.set_len(old_len + len);
    }
}

#[cold]
#[inline(never)]
fn reserve_str_slow(text: &mut String, additional: usize) {
    text.reserve(additional);
}

/// Accumulates output for one syntactic unit. Build a child with
/// [`Context::child`], fill it, then [`Context::append`] it into the parent.
#[repr(C)]
pub struct Context<const DIRECT: bool = false> {
    buffer: Buffer,
    returned: Rc<RefCell<Vec<Buffer>>>,
    indent: String,
    indent_depth: u32,
    layout_bytes: usize,
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
    layout_bytes: usize,
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
            layout_bytes: 0,
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
            layout_bytes: 0,
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
            layout_bytes: 0,
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

    pub(crate) fn optimistic_space(&mut self) {
        debug_assert!(DIRECT);
        self.pending |= PENDING_OPTIMISTIC_SPACE;
    }

    pub(crate) fn cancel_optimistic_space(&mut self) {
        debug_assert!(DIRECT);
        self.pending &= !PENDING_OPTIMISTIC_SPACE;
    }

    /// Append literal `content`. If a newline is already pending in this
    /// context, writing after it makes the context multiline (mirrors esrap).
    pub fn write(&mut self, content: impl AsRef<str>) {
        let content = content.as_ref();
        if DIRECT {
            if content.is_empty() {
                self.flush_non_optimistic();
            } else {
                self.flush_direct();
            }
            if !content.is_empty() {
                push_str_small(&mut self.buffer.text, content);
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

    #[inline(always)]
    pub(crate) fn write_ascii(&mut self, byte: u8) {
        assert!(byte.is_ascii());
        if DIRECT {
            self.flush_direct();
        }
        // SAFETY: the byte is ASCII, so appending it preserves UTF-8 validity.
        unsafe { self.buffer.text.as_mut_vec().push(byte) };
        if self.has_newline {
            self.multiline = true;
        }
    }

    #[inline(always)]
    pub(crate) fn write_ascii_bytes<const N: usize>(&mut self, bytes: &[u8; N]) {
        assert!(bytes.is_ascii());
        if DIRECT {
            self.flush_direct();
        }
        // SAFETY: the bytes are ASCII, so they are valid UTF-8.
        self.buffer
            .text
            .push_str(unsafe { std::str::from_utf8_unchecked(bytes) });
        if self.has_newline {
            self.multiline = true;
        }
    }

    /// Record a source-map anchor (1-based line, 0-based column).
    pub fn location(&mut self, line: u32, column: u32) {
        if DIRECT {
            self.flush_non_optimistic();
        } else {
            self.buffer.event(EventKind::Location { line, column });
        }
    }

    pub(crate) fn location_offset(&mut self, offset: u32) {
        self.buffer.event(EventKind::LocationOffset { offset });
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
            layout_bytes: self.layout_bytes,
            indent_depth: self.indent_depth,
            pending: self.pending,
            direct_dirty: self.direct_dirty,
            has_newline: self.has_newline,
            multiline: self.multiline,
        };
        self.measure_base = if DIRECT {
            self.buffer.text.len() - self.layout_bytes
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
        self.layout_bytes = scope.layout_bytes;
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

    pub(crate) fn retro_space_mark(&mut self) -> EventMark {
        let mark = self.event_mark();
        if DIRECT && self.pending == 0 {
            let start = mark.offset;
            self.buffer.text.push(' ');
            self.layout_bytes += 1;
            self.buffer.layouts.push(LayoutSpan {
                start,
                raw_len: 1,
                depth: 0,
                newline: false,
                margin: false,
                dirty: false,
            });
        } else {
            self.space();
        }
        mark
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
            self.buffer.text.len() - self.layout_bytes == self.measure_base
        } else {
            self.buffer.text.len() == self.measure_base
        }
    }

    /// Total length of the literal strings in this context, ignoring whitespace
    /// sentinels — esrap's `measure`, used to decide if a layout fits on a line.
    pub const fn measure(&self) -> usize {
        if DIRECT {
            self.buffer.text.len() - self.layout_bytes - self.measure_base
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
    }

    fn direct_event(&mut self, kind: EventKind) {
        match kind {
            EventKind::Margin => self.pending |= PENDING_MARGIN,
            EventKind::Newline => self.pending |= PENDING_NEWLINE,
            EventKind::Indent => self.indent_depth += 1,
            EventKind::Dedent => self.indent_depth = self.indent_depth.saturating_sub(1),
            EventKind::Space => self.pending |= PENDING_SPACE,
            EventKind::Flush | EventKind::Location { .. } | EventKind::LocationOffset { .. } => {
                self.flush_non_optimistic()
            }
        }
    }

    fn write_direct_text(&mut self, text: &str) {
        self.flush_direct();
        push_str_small(&mut self.buffer.text, text);
    }

    #[inline(always)]
    fn flush_direct(&mut self) {
        if self.pending == 0 {
            return;
        }
        if self.try_flush_direct_newline() {
            return;
        }
        self.flush_direct_slow();
    }

    #[inline(always)]
    fn flush_non_optimistic(&mut self) {
        if self.pending & !PENDING_OPTIMISTIC_SPACE == 0 {
            return;
        }
        if self.try_flush_direct_newline() {
            return;
        }
        self.flush_direct_slow();
    }

    #[inline(never)]
    fn try_flush_direct_newline(&mut self) -> bool {
        let depth = self.indent_depth as usize;
        if self.pending & PENDING_NEWLINE == 0
            || self.pending & PENDING_MARGIN != 0
            || self.indent.as_bytes() != b"\t"
            || depth > FAST_INDENT_BYTES
            || self.buffer.text.capacity() - self.buffer.text.len() < FAST_INDENT_BYTES + 1
            || self.buffer.layouts.len() == self.buffer.layouts.capacity()
        {
            return false;
        }

        let text_len = self.buffer.text.len();
        let start = u32::try_from(text_len).expect("esrap output exceeds u32");
        let raw_len = depth + 1;
        // SAFETY: the fast-path capacity check leaves room for the fixed write.
        unsafe {
            let bytes = self.buffer.text.as_mut_vec();
            let dst = bytes.as_mut_ptr().add(text_len);
            dst.write(b'\n');
            dst.add(1)
                .cast::<[u8; FAST_INDENT_BYTES]>()
                .write([b'\t'; FAST_INDENT_BYTES]);
            bytes.set_len(text_len + raw_len);
        }
        self.layout_bytes += raw_len;
        self.buffer.layouts.push(LayoutSpan {
            start,
            raw_len: raw_len as u32,
            depth: self.indent_depth,
            newline: true,
            margin: false,
            dirty: false,
        });
        self.pending = 0;
        true
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
            self.layout_bytes += raw_len as usize;
            self.buffer.layouts.push(LayoutSpan {
                start,
                raw_len,
                depth: self.indent_depth,
                newline: true,
                margin: self.pending & PENDING_MARGIN != 0,
                dirty: false,
            });
        } else if self.pending & (PENDING_SPACE | PENDING_OPTIMISTIC_SPACE) != 0 {
            self.buffer.text.push(' ');
            self.layout_bytes += 1;
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
        ctx.write_ascii_bytes(b"abc");
        ctx.space();
        ctx.newline();
        ctx.write_ascii_bytes(b"de");
        assert_eq!(ctx.measure(), 5);
    }

    #[test]
    fn empty_ignores_whitespace_sentinels() {
        let mut ctx = Context::new();
        ctx.space();
        ctx.newline();
        ctx.indent();
        assert!(ctx.empty());
        ctx.write_ascii(b'x');
        assert!(!ctx.empty());
    }

    #[test]
    fn append_propagates_multiline() {
        let mut parent = Context::new();
        let mut child = parent.child();
        child.newline();
        child.write_ascii(b'x');
        assert!(child.multiline);
        parent.write_ascii(b'a');
        parent.append(child);
        assert!(parent.multiline);
    }

    #[test]
    fn append_splices_child_output() {
        let mut parent = Context::new();
        parent.write_ascii(b'(');
        let mut child = parent.child();
        child.write_ascii(b'x');
        child.space();
        child.write_ascii(b'y');
        parent.append(child);
        parent.write_ascii(b')');
        assert_eq!(print(&parent.into_buffer(), "\t", 0), "(x y)");
    }

    #[test]
    fn adjacent_writes_share_the_text_buffer() {
        let mut ctx = Context::new();
        ctx.write("const");
        ctx.write_ascii(b' ');
        ctx.write_ascii(b'x');
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
    fn optimistic_space_waits_for_visible_text() {
        let mut ctx = Context::new_direct("\t", 0);
        ctx.optimistic_space();
        ctx.write("");
        ctx.cancel_optimistic_space();
        assert_eq!(direct_output(ctx), "");

        let mut ctx = Context::new_direct("\t", 0);
        ctx.optimistic_space();
        ctx.write_ascii(b'x');
        assert_eq!(direct_output(ctx), " x");
    }

    #[test]
    fn real_layout_supersedes_optimistic_space() {
        let mut ctx = Context::new_direct("\t", 0);
        ctx.optimistic_space();
        ctx.newline();
        ctx.write("");
        ctx.cancel_optimistic_space();
        assert_eq!(direct_output(ctx), "\n");
    }

    #[test]
    fn direct_fast_newline_preserves_layout_span() {
        let mut ctx = Context::new_direct("\t", 64);
        ctx.buffer.layouts.reserve(1);
        for _ in 0..FAST_INDENT_BYTES {
            ctx.indent();
        }
        ctx.newline();
        ctx.write_ascii(b'x');

        assert_eq!(ctx.buffer.text, format!("\n{}x", "\t".repeat(32)));
        assert_eq!(ctx.layout_bytes, 33);
        assert_eq!(
            ctx.buffer.layouts,
            [LayoutSpan {
                start: 0,
                raw_len: 33,
                depth: 32,
                newline: true,
                margin: false,
                dirty: false,
            }]
        );
    }

    #[test]
    fn direct_fast_newline_falls_back_for_other_layouts() {
        let mut custom = Context::new_direct("  ", 64);
        custom.buffer.layouts.reserve(1);
        custom.indent();
        custom.newline();
        custom.write_ascii(b'x');
        assert_eq!(direct_output(custom), "\n  x");

        let mut margin = Context::new_direct("\t", 64);
        margin.buffer.layouts.reserve(1);
        margin.indent();
        margin.margin();
        margin.newline();
        margin.write_ascii(b'x');
        assert_eq!(direct_output(margin), "\n\n\tx");

        let mut deep = Context::new_direct("\t", 128);
        deep.buffer.layouts.reserve(1);
        for _ in 0..=FAST_INDENT_BYTES {
            deep.indent();
        }
        deep.newline();
        deep.write_ascii(b'x');
        assert_eq!(direct_output(deep), format!("\n{}x", "\t".repeat(33)));

        let mut growth = Context::new_direct("\t", 0);
        growth.buffer.text = String::new();
        growth.buffer.layouts = Vec::new();
        growth.indent();
        growth.newline();
        growth.write_ascii(b'x');
        assert_eq!(direct_output(growth), "\n\tx");
    }

    #[test]
    fn scope_tracks_local_layout_without_a_child_buffer() {
        let mut ctx = Context::new();
        ctx.write_ascii(b'a');
        let mark = ctx.event_mark();
        ctx.newline();
        let scope = ctx.begin_scope();
        ctx.write_ascii_bytes(b"bc");
        assert_eq!(ctx.measure(), 2);
        ctx.newline();
        ctx.write_ascii(b'd');
        assert!(ctx.end_scope(scope));
        ctx.insert_event(mark, EventKind::Margin);
        assert_eq!(print(&ctx.into_buffer(), "\t", 0), "a\n\nbc\nd");
    }

    #[test]
    fn discarded_scope_removes_text_and_layout_events() {
        let mut ctx = Context::new();
        ctx.write_ascii(b'a');
        let scope = ctx.begin_scope();
        ctx.newline();
        ctx.write_ascii_bytes(b"bc");
        ctx.discard_scope(scope);
        ctx.write_ascii(b'd');
        assert_eq!(print(&ctx.into_buffer(), "\t", 0), "ad");
    }

    #[test]
    fn direct_parent_space_is_superseded_by_child_newline() {
        let mut parent = Context::new_direct("\t", 0);
        parent.space();
        let mut child = parent.child();
        child.newline();
        child.write_ascii(b'x');
        parent.append(child);
        assert_eq!(direct_output(parent), "\nx");
    }

    #[test]
    fn direct_parent_margin_combines_with_child_newline() {
        let mut parent = Context::new_direct("\t", 0);
        parent.margin();
        let mut child = parent.child();
        child.newline();
        child.write_ascii(b'x');
        parent.append(child);
        assert_eq!(direct_output(parent), "\n\nx");
    }
}
