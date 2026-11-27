//! The `ESTree` of a JavaScript part as the official parser writes it: acorn's, with the nodes of
//! `@sveltejs/acorn-typescript` for types, positions in UTF-16 code units and a `loc` on every
//! node.
//!
//! oxc's serializer walks the tree and writes its fields through [`Writer`], which renames, moves
//! and leaves out the fields where acorn's tree differs from oxc's.

use oxc_data_structures::code_buffer::{CodeBuffer, IndentChar};
use oxc_estree::{CompactFormatter, ESTree};
use oxc_parser::Token;

use super::Lines;
use super::comments::{Attached, Comment, attach};
use super::parentheses::parenthesized;
use super::shape::Shape;

/// Writes the AST's JSON: the component's nodes through its own methods, and each JavaScript
/// part through oxc's serializer.
pub(super) struct Writer<'w> {
    buffer: CodeBuffer,
    formatter: CompactFormatter,
    /// acorn counts lines at every ECMAScript line terminator.
    lines: &'w Lines,
    /// svelte's locator counts lines at `\n`, and gives a script's program its `loc`.
    svelte_lines: &'w Lines,
    typescript: bool,
    /// The position of the next `Program`, which svelte sets itself.
    program: Option<ProgramPosition>,
    /// A field's value, written apart, to read it before the field is kept.
    scratch: Vec<CodeBuffer>,
    /// Whether each open object or array has an entry yet.
    open: Vec<bool>,
    source: &'w str,
    /// Every JavaScript comment, in document order.
    comments: &'w [Comment],
    /// The shape of the part being written, on the first of the two passes over a part with
    /// comments.
    shape: Option<Shape>,
    /// The comments of the nodes of the part being written, on the second pass.
    attached: Option<Attached>,
    /// The text of the HTML comment before the script whose program is being written.
    program_comment: Option<&'w str>,
    /// The tokens of the program being written, which place the parentheses of its types.
    tokens: &'w [Token],
    /// The types of the part being written in parentheses, on the second pass.
    parentheses: Vec<(u32, Vec<[u32; 2]>)>,
    /// How many nodes of the part were opened.
    seen: u32,
    /// The field the next node is in, and its place when the field is a list.
    slot: (&'static str, Option<u32>),
}

#[derive(Clone, Copy)]
struct ProgramPosition {
    start: u32,
    end: u32,
    /// The script's tag, `<script` to `</script>`.
    tag: [u32; 2],
    /// Where acorn's program ends, in bytes: at the end of the script's content.
    content_end: u32,
}

impl<'w> Writer<'w> {
    pub(super) fn new(
        source: &'w str,
        comments: &'w [Comment],
        lines: &'w Lines,
        svelte_lines: &'w Lines,
        typescript: bool,
    ) -> Self {
        Self {
            source,
            comments,
            shape: None,
            attached: None,
            program_comment: None,
            tokens: &[],
            parentheses: Vec::new(),
            seen: 0,
            slot: ("", None),
            buffer: CodeBuffer::new(),
            formatter: CompactFormatter,
            lines,
            svelte_lines,
            typescript,
            program: None,
            scratch: Vec::new(),
            open: Vec::new(),
        }
    }

    pub(super) fn finish(self) -> String {
        self.buffer.into_string()
    }

    pub(super) fn object(&mut self) -> &mut Self {
        self.buffer.print_ascii_byte(b'{');
        self.open.push(false);
        self
    }

    pub(super) fn end(&mut self) -> &mut Self {
        self.open.pop();
        self.buffer.print_ascii_byte(b'}');
        self
    }

    pub(super) fn array(&mut self) -> &mut Self {
        self.buffer.print_ascii_byte(b'[');
        self.open.push(false);
        self
    }

    pub(super) fn end_array(&mut self) -> &mut Self {
        self.open.pop();
        self.buffer.print_ascii_byte(b']');
        self
    }

    fn separate(&mut self) {
        if let Some(entry) = self.open.last_mut() {
            if *entry {
                self.buffer.print_ascii_byte(b',');
            }
            *entry = true;
        }
    }

    /// Before an element of the open array.
    pub(super) fn element(&mut self) -> &mut Self {
        self.separate();
        self
    }

    pub(super) fn key(&mut self, key: &str) -> &mut Self {
        self.separate();
        self.buffer.print_ascii_byte(b'"');
        self.buffer.print_str(key);
        self.buffer.print_str("\":");
        self
    }

    pub(super) fn string(&mut self, text: &str) {
        text.serialize(&mut *self);
    }

    pub(super) fn number(&mut self, number: u32) {
        number.serialize(&mut *self);
    }

    pub(super) fn boolean(&mut self, value: bool) {
        value.serialize(&mut *self);
    }

    pub(super) fn null(&mut self) {
        self.buffer.print_str("null");
    }

    pub(super) fn raw(&mut self, json: &str) {
        self.buffer.print_str(json);
    }

    /// A JavaScript part, with the `candidates` of [`Self::comments`] svelte attaches to it.
    pub(super) fn javascript(&mut self, node: &impl ESTree, candidates: std::ops::Range<usize>) {
        // A part with comments, or with types that may be in parentheses, needs its shape.
        if !candidates.is_empty() || (self.typescript && !self.tokens.is_empty()) {
            self.shape = Some(Shape::default());
            self.seen = 0;
            let program = self.program;
            let written = self.apart(node);
            self.give_back(written);
            self.program = program;
            let shape = self.shape.take().expect("set above");
            if !candidates.is_empty() {
                self.attached = Some(attach(&shape, self.comments, candidates, self.source));
            }
            if self.typescript {
                self.parentheses = parenthesized(&shape, self.tokens);
            }
        }
        self.seen = 0;
        node.serialize(&mut *self);
        self.attached = None;
        self.parentheses.clear();
    }

    /// A comment as svelte attaches it to a node.
    fn attached_comment(&mut self, comment: usize) {
        self.comment_fields(comment);
        self.buffer.print_ascii_byte(b'}');
    }

    /// A comment's object, without its closing brace.
    fn comment_fields(&mut self, comment: usize) {
        let comments = self.comments;
        let comment = &comments[comment];
        self.buffer.print_str("{\"type\":");
        self.buffer.print_str(if comment.block {
            "\"Block\""
        } else {
            "\"Line\""
        });
        self.buffer.print_str(",\"value\":");
        comment.value.as_str().serialize(&mut *self);
        let (start, end) = (
            self.lines.line_column(comment.span.start_offset),
            self.lines.line_column(comment.span.end_offset),
        );
        self.buffer.print_str(",\"start\":");
        start.character.serialize(&mut *self);
        self.buffer.print_str(",\"end\":");
        end.character.serialize(&mut *self);
    }

    /// Every comment, as the root lists them.
    pub(super) fn comments(&mut self) {
        let comments = self.comments;
        self.buffer.print_ascii_byte(b'[');
        for (index, comment) in comments.iter().enumerate() {
            if index > 0 {
                self.buffer.print_ascii_byte(b',');
            }
            self.comment_fields(index);
            // svelte's locator places a comment it reads itself; acorn the others.
            let lines = if comment.in_tag {
                self.svelte_lines
            } else {
                self.lines
            };
            self.buffer.print_str(",\"loc\":{");
            for (key, byte) in [
                ("start", comment.span.start_offset),
                ("end", comment.span.end_offset),
            ] {
                let at = lines.line_column(byte);
                if key == "end" {
                    self.buffer.print_ascii_byte(b',');
                }
                self.buffer.print_str("\"");
                self.buffer.print_str(key);
                self.buffer.print_str("\":{\"line\":");
                at.line.serialize(&mut *self);
                self.buffer.print_str(",\"column\":");
                at.column.serialize(&mut *self);
                if comment.in_tag {
                    self.buffer.print_str(",\"character\":");
                    at.character.serialize(&mut *self);
                }
                self.buffer.print_ascii_byte(b'}');
            }
            self.buffer.print_str("}}");
        }
        self.buffer.print_ascii_byte(b']');
    }

    /// The comments the node opened `index`-th gets, before its closing brace.
    fn node_comments(&mut self, index: u32) {
        let Some(attached) = self.attached.take() else {
            return;
        };
        for (key, list) in [
            ("leadingComments", &attached.leading[index as usize]),
            ("trailingComments", &attached.trailing[index as usize]),
        ] {
            if list.is_empty() {
                continue;
            }
            self.buffer.print_str(",\"");
            self.buffer.print_str(key);
            self.buffer.print_str("\":[");
            for (at, &comment) in list.iter().enumerate() {
                if at > 0 {
                    self.buffer.print_ascii_byte(b',');
                }
                self.attached_comment(comment);
            }
            self.buffer.print_ascii_byte(b']');
        }
        self.attached = Some(attached);
    }

    /// A script's program, which svelte places from the script's content to its end, with the
    /// `loc` of the whole tag.
    #[expect(
        clippy::too_many_arguments,
        reason = "each is one fact svelte places it by"
    )]
    pub(super) fn program(
        &mut self,
        program: &impl ESTree,
        typescript: bool,
        start: u32,
        end: u32,
        tag: rsvelte_kernel::source::positions::Span,
        content_end: u32,
        candidates: std::ops::Range<usize>,
        markup_comment: Option<&'w str>,
        tokens: &'w [Token],
    ) {
        let outer = std::mem::replace(&mut self.typescript, typescript);
        self.program = Some(ProgramPosition {
            start,
            end,
            tag: [tag.start_offset, tag.end_offset],
            content_end,
        });
        self.program_comment = markup_comment;
        self.tokens = tokens;
        self.javascript(program, candidates);
        self.program = None;
        self.program_comment = None;
        self.tokens = &[];
        self.typescript = outer;
    }

    /// `start`, `end` and `loc` of `[start, end)`, in bytes of the component.
    fn position(&mut self, start: u32, end: u32) {
        let (start, end) = (self.lines.line_column(start), self.lines.line_column(end));
        self.buffer.print_str("\"start\":");
        start.character.serialize(&mut *self);
        self.buffer.print_str(",\"end\":");
        end.character.serialize(&mut *self);
        self.buffer.print_str(",\"loc\":{\"start\":{\"line\":");
        start.line.serialize(&mut *self);
        self.buffer.print_str(",\"column\":");
        start.column.serialize(&mut *self);
        self.buffer.print_str("},\"end\":{\"line\":");
        end.line.serialize(&mut *self);
        self.buffer.print_str(",\"column\":");
        end.column.serialize(&mut *self);
        self.buffer.print_str("}}");
    }

    fn program_position(&mut self, program: ProgramPosition) {
        let lines = self.svelte_lines;
        let (start, end) = (
            lines.line_column(program.tag[0]),
            lines.line_column(program.tag[1]),
        );
        self.buffer.print_str("\"start\":");
        program.start.serialize(&mut *self);
        self.buffer.print_str(",\"end\":");
        program.end.serialize(&mut *self);
        self.buffer.print_str(",\"loc\":{\"start\":{\"line\":");
        start.line.serialize(&mut *self);
        self.buffer.print_str(",\"column\":");
        start.column.serialize(&mut *self);
        self.buffer.print_str("},\"end\":{\"line\":");
        end.line.serialize(&mut *self);
        self.buffer.print_str(",\"column\":");
        end.column.serialize(&mut *self);
        self.buffer.print_str("}}");
    }

    /// `value` as JSON, apart from the output.
    fn apart(&mut self, value: &(impl ESTree + ?Sized)) -> CodeBuffer {
        let outer = std::mem::replace(&mut self.buffer, self.scratch.pop().unwrap_or_default());
        value.serialize(&mut *self);
        std::mem::replace(&mut self.buffer, outer)
    }

    fn give_back(&mut self, buffer: CodeBuffer) {
        let memory = buffer.into_string();
        self.scratch.push(CodeBuffer::with_buffer_and_indent(
            memory,
            IndentChar::Space,
            0,
        ));
    }
}

mod serializer;
