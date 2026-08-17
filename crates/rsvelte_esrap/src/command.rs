//! Flat text and layout-event buffers used by the printer.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum EventKind {
    Margin,
    Newline,
    Indent,
    Dedent,
    Space,
    Flush,
    Location { line: u32, column: u32 },
    LocationOffset { offset: u32 },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) struct Event {
    pub offset: u32,
    pub kind: EventKind,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) struct LayoutSpan {
    pub start: u32,
    pub raw_len: u32,
    pub depth: u32,
    pub newline: bool,
    pub margin: bool,
    pub dirty: bool,
}

#[derive(Default)]
pub(crate) struct Buffer {
    pub text: String,
    pub events: Vec<Event>,
    pub layouts: Vec<LayoutSpan>,
}

impl Buffer {
    pub fn event(&mut self, kind: EventKind) {
        self.events.push(Event {
            offset: u32::try_from(self.text.len()).expect("esrap output exceeds u32"),
            kind,
        });
    }

    pub fn append(&mut self, child: &mut Self) {
        let base = u32::try_from(self.text.len()).expect("esrap output exceeds u32");
        self.text.push_str(&child.text);
        self.events.extend(child.events.drain(..).map(|event| {
            Event {
                offset: base
                    .checked_add(event.offset)
                    .expect("esrap output exceeds u32"),
                kind: event.kind,
            }
        }));
        child.text.clear();
    }
}

pub(crate) fn finish_direct(mut buffer: Buffer, indent: &str, dirty: bool) -> (String, Buffer) {
    if dirty {
        patch_layouts(&mut buffer.text, &buffer.layouts, indent);
    }
    buffer.layouts.clear();
    let text = std::mem::take(&mut buffer.text);
    (text, buffer)
}

fn patch_layouts(text: &mut String, layouts: &[LayoutSpan], indent: &str) {
    let old_len = text.len();
    let new_len = layouts
        .iter()
        .filter(|span| span.dirty)
        .fold(old_len, |len, span| {
            let growth = rendered_layout_len(*span, indent.len())
                .checked_sub(span.raw_len as usize)
                .expect("retroactive layout edits only grow");
            len.checked_add(growth).expect("esrap output exceeds usize")
        });
    debug_assert!(new_len >= old_len);
    text.reserve(new_len - old_len);

    // SAFETY: ordered non-overlapping spans only grow during the reverse rewrite.
    unsafe {
        let bytes = text.as_mut_vec();
        bytes.resize(new_len, 0);
        let ptr = bytes.as_mut_ptr();
        let mut src = old_len;
        let mut dst = new_len;

        for span in layouts.iter().rev().filter(|span| span.dirty) {
            let start = span.start as usize;
            let end = start + span.raw_len as usize;
            debug_assert!(end <= src);

            let trailing = src - end;
            dst -= trailing;
            std::ptr::copy(ptr.add(end), ptr.add(dst), trailing);

            let rendered_len = rendered_layout_len(*span, indent.len());
            dst -= rendered_len;
            write_layout(ptr.add(dst), *span, indent);
            src = start;
        }

        debug_assert_eq!(dst, src);
    }
}

fn rendered_layout_len(span: LayoutSpan, indent_len: usize) -> usize {
    if span.newline {
        1 + usize::from(span.margin) + span.depth as usize * indent_len
    } else {
        1
    }
}

unsafe fn write_layout(mut dst: *mut u8, span: LayoutSpan, indent: &str) {
    if !span.newline {
        // SAFETY: caller reserved one byte for the space.
        unsafe { dst.write(b' ') };
        return;
    }
    if span.margin {
        // SAFETY: caller reserved the rendered layout length.
        unsafe { dst.write(b'\n') };
        // SAFETY: the margin byte is within that reserved range.
        dst = unsafe { dst.add(1) };
    }
    // SAFETY: caller reserved the rendered layout length.
    unsafe { dst.write(b'\n') };
    // SAFETY: the newline byte is within that reserved range.
    dst = unsafe { dst.add(1) };
    for _ in 0..span.depth {
        // SAFETY: caller reserved the rendered layout length and indent is valid bytes.
        unsafe { std::ptr::copy_nonoverlapping(indent.as_ptr(), dst, indent.len()) };
        // SAFETY: each indent copy advances within that reserved range.
        dst = unsafe { dst.add(indent.len()) };
    }
}

/// One source-map entry: a generated position and the source position it came from, all 0-based.
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

pub(crate) fn print(buffer: &Buffer, indent: &str, capacity: usize) -> String {
    let layout_capacity = buffer
        .events
        .len()
        .saturating_mul(indent.len().saturating_add(2));
    let mut code = String::with_capacity(capacity.saturating_add(layout_capacity));
    let mut current_newline = String::from("\n");
    let mut needs_newline = false;
    let mut needs_margin = false;
    let mut needs_space = false;
    let mut cursor = 0;

    macro_rules! flush_pending {
        () => {{
            if needs_newline {
                if needs_margin {
                    code.push('\n');
                }
                code.push_str(&current_newline);
            } else if needs_space {
                code.push(' ');
            }
            needs_newline = false;
            needs_margin = false;
            needs_space = false;
        }};
    }

    for item in &buffer.events {
        let offset = item.offset as usize;
        if offset > cursor {
            flush_pending!();
            code.push_str(&buffer.text[cursor..offset]);
            cursor = offset;
        }
        match item.kind {
            EventKind::Newline => needs_newline = true,
            EventKind::Margin => needs_margin = true,
            EventKind::Space => needs_space = true,
            EventKind::Indent => current_newline.push_str(indent),
            EventKind::Dedent => {
                let len = current_newline.len().saturating_sub(indent.len());
                current_newline.truncate(len);
            }
            EventKind::Flush | EventKind::Location { .. } | EventKind::LocationOffset { .. } => {
                flush_pending!()
            }
        }
    }
    if cursor < buffer.text.len() {
        if needs_newline {
            if needs_margin {
                code.push('\n');
            }
            code.push_str(&current_newline);
        } else if needs_space {
            code.push(' ');
        }
        code.push_str(&buffer.text[cursor..]);
    }
    code
}

pub(crate) fn flatten_with_map(
    buffer: &Buffer,
    indent: &str,
    capacity: usize,
    source_line_starts: &[u32],
) -> (String, Vec<Mapping>) {
    let mut driver = Driver {
        code: String::with_capacity(
            capacity.saturating_add(
                buffer
                    .events
                    .len()
                    .saturating_mul(indent.len().saturating_add(2)),
            ),
        ),
        current_newline: String::from("\n"),
        indent,
        needs_newline: false,
        needs_margin: false,
        needs_space: false,
        current_line: 0,
        current_column: 0,
        source_line_starts,
        last_source_line: 0,
        // Only Location events emit a mapping, so every event is a safe upper
        // bound that avoids repeatedly growing this hot output vector.
        mappings: Vec::with_capacity(buffer.events.len()),
    };
    drive(buffer, |text, event| {
        if !text.is_empty() {
            driver.append_text(text);
        }
        if let Some(event) = event {
            driver.event(event);
        }
    });
    (driver.code, driver.mappings)
}

fn drive(buffer: &Buffer, mut visit: impl FnMut(&str, Option<EventKind>)) {
    let mut cursor = 0;
    for item in &buffer.events {
        let offset = item.offset as usize;
        if offset > cursor {
            visit(&buffer.text[cursor..offset], Some(item.kind));
            cursor = offset;
        } else {
            visit("", Some(item.kind));
        }
    }
    if cursor < buffer.text.len() {
        visit(&buffer.text[cursor..], None);
    }
}

struct Driver<'a> {
    code: String,
    current_newline: String,
    indent: &'a str,
    needs_newline: bool,
    needs_margin: bool,
    needs_space: bool,
    current_line: u32,
    current_column: u32,
    source_line_starts: &'a [u32],
    /// 1-based line most recently resolved from a source offset. A token's two
    /// anchors, and consecutive tokens, almost always share it.
    last_source_line: u32,
    mappings: Vec<Mapping>,
}

impl Driver<'_> {
    fn event(&mut self, event: EventKind) {
        match event {
            EventKind::Newline => self.needs_newline = true,
            EventKind::Margin => self.needs_margin = true,
            EventKind::Space => self.needs_space = true,
            EventKind::Indent => self.current_newline.push_str(self.indent),
            EventKind::Dedent => {
                let len = self.current_newline.len().saturating_sub(self.indent.len());
                self.current_newline.truncate(len);
            }
            EventKind::Flush => self.flush_pending(),
            EventKind::Location { line, column } => {
                self.flush_pending();
                self.push_mapping(line - 1, column);
            }
            EventKind::LocationOffset { offset } => {
                self.flush_pending();
                let line = self.source_line_of(offset);
                if line == 0 {
                    return;
                }
                self.push_mapping(
                    (line - 1) as u32,
                    offset - self.source_line_starts[line - 1],
                );
            }
        }
    }

    /// 1-based source line containing `offset`, or 0 if it precedes the first
    /// line start.
    fn source_line_of(&mut self, offset: u32) -> usize {
        let starts = self.source_line_starts;
        let cached = self.last_source_line as usize;
        if cached > 0
            && cached <= starts.len()
            && starts[cached - 1] <= offset
            && starts.get(cached).is_none_or(|&next| offset < next)
        {
            return cached;
        }
        let line = starts.partition_point(|&start| start <= offset);
        self.last_source_line = line as u32;
        line
    }

    /// An anchor describes the text that follows it, so when two land on the
    /// same generated position with nothing written between them, the later one
    /// is the only meaningful origin.
    fn push_mapping(&mut self, source_line: u32, source_column: u32) {
        let mapping = Mapping {
            gen_line: self.current_line,
            gen_column: self.current_column,
            source_line,
            source_column,
        };
        match self.mappings.last_mut() {
            Some(last)
                if last.gen_line == mapping.gen_line && last.gen_column == mapping.gen_column =>
            {
                *last = mapping;
            }
            _ => self.mappings.push(mapping),
        }
    }

    fn append_text(&mut self, text: &str) {
        self.flush_pending();
        self.append(text);
    }

    fn append(&mut self, text: &str) {
        self.code.push_str(text);
        if text.is_ascii() {
            let bytes = text.as_bytes();
            let newline_count = bytes.iter().filter(|&&byte| byte == b'\n').count() as u32;
            if let Some(last_newline) = bytes.iter().rposition(|&byte| byte == b'\n') {
                self.current_line += newline_count;
                self.current_column = (bytes.len() - last_newline - 1) as u32;
            } else {
                self.current_column += bytes.len() as u32;
            }
            return;
        }
        for ch in text.chars() {
            if ch == '\n' {
                self.current_line += 1;
                self.current_column = 0;
            } else {
                self.current_column += 1;
            }
        }
    }

    fn flush_pending(&mut self) {
        if self.needs_newline {
            if self.needs_margin {
                self.append("\n");
            }
            let newline = std::mem::take(&mut self.current_newline);
            self.append(&newline);
            self.current_newline = newline;
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

    enum TestCommand<'a> {
        Text(&'a str),
        Event(EventKind),
        Nested(Vec<Self>),
    }

    fn buffer(commands: Vec<TestCommand<'_>>) -> Buffer {
        fn add(buffer: &mut Buffer, commands: Vec<TestCommand<'_>>) {
            for command in commands {
                match command {
                    TestCommand::Text(text) => buffer.text.push_str(text),
                    TestCommand::Event(event) => buffer.event(event),
                    TestCommand::Nested(commands) => add(buffer, commands),
                }
            }
        }
        let mut buffer = Buffer::default();
        add(&mut buffer, commands);
        buffer
    }

    fn output(commands: Vec<TestCommand<'_>>) -> String {
        print(&buffer(commands), "\t", 0)
    }

    #[test]
    fn plain_strings_concatenate() {
        assert_eq!(
            output(vec![TestCommand::Text("a"), TestCommand::Text("b")]),
            "ab"
        );
    }

    #[test]
    fn space_separates_only_before_next_text() {
        assert_eq!(
            output(vec![
                TestCommand::Text("a"),
                TestCommand::Event(EventKind::Space),
                TestCommand::Text("b"),
                TestCommand::Event(EventKind::Space),
            ]),
            "a b"
        );
    }

    #[test]
    fn newline_supersedes_space() {
        assert_eq!(
            output(vec![
                TestCommand::Text("a"),
                TestCommand::Event(EventKind::Space),
                TestCommand::Event(EventKind::Newline),
                TestCommand::Text("b")
            ]),
            "a\nb"
        );
    }

    #[test]
    fn margin_adds_blank_line_before_newline() {
        assert_eq!(
            output(vec![
                TestCommand::Text("a"),
                TestCommand::Event(EventKind::Margin),
                TestCommand::Event(EventKind::Newline),
                TestCommand::Text("b")
            ]),
            "a\n\nb"
        );
    }

    #[test]
    fn margin_without_newline_does_nothing() {
        assert_eq!(
            output(vec![
                TestCommand::Text("a"),
                TestCommand::Event(EventKind::Margin),
                TestCommand::Text("b")
            ]),
            "ab"
        );
    }

    #[test]
    fn nested_text_splices_in_place() {
        assert_eq!(
            output(vec![
                TestCommand::Text("("),
                TestCommand::Nested(vec![
                    TestCommand::Text("x"),
                    TestCommand::Event(EventKind::Space),
                    TestCommand::Text("y"),
                ]),
                TestCommand::Text(")"),
            ]),
            "(x y)"
        );
    }

    #[test]
    fn unbalanced_dedent_is_saturating() {
        assert_eq!(
            output(vec![
                TestCommand::Event(EventKind::Dedent),
                TestCommand::Event(EventKind::Newline),
                TestCommand::Text("x")
            ]),
            "x"
        );
    }

    #[test]
    fn newline_uses_indent_prefix() {
        assert_eq!(
            output(vec![
                TestCommand::Text("{"),
                TestCommand::Event(EventKind::Indent),
                TestCommand::Event(EventKind::Newline),
                TestCommand::Text("x"),
                TestCommand::Event(EventKind::Dedent),
                TestCommand::Event(EventKind::Newline),
                TestCommand::Text("}"),
            ]),
            "{\n\tx\n}"
        );
    }

    #[test]
    fn multi_level_indent() {
        assert_eq!(
            output(vec![
                TestCommand::Event(EventKind::Indent),
                TestCommand::Event(EventKind::Indent),
                TestCommand::Event(EventKind::Newline),
                TestCommand::Text("x"),
            ]),
            "\n\t\tx"
        );
    }

    #[test]
    fn mapping_and_plain_drivers_match() {
        let buffer = buffer(vec![
            TestCommand::Event(EventKind::Location { line: 1, column: 0 }),
            TestCommand::Text("const"),
            TestCommand::Event(EventKind::Space),
            TestCommand::Event(EventKind::Location { line: 1, column: 6 }),
            TestCommand::Text("π"),
            TestCommand::Event(EventKind::Newline),
            TestCommand::Text("x"),
        ]);
        assert_eq!(
            print(&buffer, "  ", 0),
            flatten_with_map(&buffer, "  ", 0, &[]).0
        );
    }

    #[test]
    fn ascii_mapping_tracks_the_last_line_column() {
        let buffer = buffer(vec![
            TestCommand::Text("ab\ncd"),
            TestCommand::Event(EventKind::Location { line: 3, column: 4 }),
        ]);
        let (_, mappings) = flatten_with_map(&buffer, "\t", 0, &[]);
        assert_eq!(
            mappings,
            vec![Mapping {
                gen_line: 1,
                gen_column: 2,
                source_line: 2,
                source_column: 4,
            }]
        );
    }
}
