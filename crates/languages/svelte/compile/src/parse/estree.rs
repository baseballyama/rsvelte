//! The `ESTree` of a JavaScript part as the official parser writes it: acorn's, with the nodes of
//! `@sveltejs/acorn-typescript` for types, positions in UTF-16 code units and a `loc` on every
//! node.
//!
//! oxc's serializer walks the tree and writes its fields through [`Writer`], which renames, moves
//! and leaves out the fields where acorn's tree differs from oxc's.

use oxc_data_structures::code_buffer::{CodeBuffer, IndentChar};
use oxc_estree::{
    CompactFormatter, ConfigNoFixes, ESTree, ESTreeSpan, SequenceSerializer, Serializer,
    StructSerializer,
};
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
        html_comment: Option<&'w str>,
        tokens: &'w [Token],
    ) {
        let outer = std::mem::replace(&mut self.typescript, typescript);
        self.program = Some(ProgramPosition {
            start,
            end,
            tag: [tag.start_offset, tag.end_offset],
            content_end,
        });
        self.program_comment = html_comment;
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

impl<'s, 'w> Serializer for &'s mut Writer<'w> {
    type Formatter = CompactFormatter;
    type SequenceSerializer = List<'s, 'w>;
    type StructSerializer = Node<'s, 'w>;

    fn include_ts_fields(&self) -> bool {
        self.typescript
    }

    fn ranges(&self) -> bool {
        false
    }

    fn serialize_struct(self) -> Node<'s, 'w> {
        self.buffer.print_ascii_byte(b'{');
        Node {
            writer: self,
            kind: "",
            fields: 0,
            tail: false,
            typed: false,
            index: None,
            parenthesized: None,
        }
    }

    fn serialize_sequence(self) -> List<'s, 'w> {
        self.buffer.print_ascii_byte(b'[');
        let key = self.slot.0;
        List {
            writer: self,
            elements: 0,
            key,
        }
    }

    fn record_fix_path(&mut self) {}

    fn buffer_mut(&mut self) -> &mut CodeBuffer {
        &mut self.buffer
    }

    fn buffer_and_formatter_mut(&mut self) -> (&mut CodeBuffer, &mut CompactFormatter) {
        (&mut self.buffer, &mut self.formatter)
    }
}

/// One node, or another object, as oxc writes it.
pub(super) struct Node<'s, 'w> {
    writer: &'s mut Writer<'w>,
    /// The node's `type`, as acorn names it; empty before the field.
    kind: &'static str,
    fields: u32,
    /// A `TemplateElement`'s `tail`, which decides its span.
    tail: bool,
    /// Type arguments were written, after which acorn-typescript leaves a call's `optional` out.
    typed: bool,
    /// Its order among the part's nodes; absent for an object that is not a node.
    index: Option<u32>,
    /// Its place in [`Writer::parentheses`], when it is a type in parentheses.
    parenthesized: Option<usize>,
}

impl Node<'_, '_> {
    fn key(&mut self, key: &str) {
        let buffer = &mut self.writer.buffer;
        if self.fields > 0 {
            buffer.print_ascii_byte(b',');
        }
        self.fields += 1;
        buffer.print_ascii_byte(b'"');
        buffer.print_str(key);
        buffer.print_str("\":");
    }
}

impl StructSerializer for Node<'_, '_> {
    type Config = ConfigNoFixes;
    type Formatter = CompactFormatter;

    fn serialize_field<T: ESTree + ?Sized>(&mut self, key: &'static str, value: &T) {
        if key == "type" {
            let written = self.writer.apart(value);
            let oxc = written.as_str().trim_matches('"');
            self.kind = acorn_type(oxc).unwrap_or_else(|| leak(oxc));
            self.writer.give_back(written);
            let writer = &mut *self.writer;
            self.index = Some(writer.seen);
            writer.seen += 1;
            if let Some(shape) = &mut writer.shape {
                shape.open(self.kind, writer.slot.0, writer.slot.1);
            } else if let Ok(at) = writer
                .parentheses
                .binary_search_by_key(&(writer.seen - 1), |&(node, _)| node)
            {
                // Each pair becomes a node around it, outermost first.
                self.parenthesized = Some(at);
                for _ in &writer.parentheses[at].1 {
                    writer
                        .buffer
                        .print_str("\"type\":\"TSParenthesizedType\",\"typeAnnotation\":{");
                }
            }
            self.key("type");
            let buffer = &mut self.writer.buffer;
            buffer.print_ascii_byte(b'"');
            buffer.print_str(self.kind);
            buffer.print_ascii_byte(b'"');
            return;
        }
        self.writer.slot = (key, None);
        if key == "tail" && self.kind == "TemplateElement" {
            let written = self.writer.apart(value);
            self.tail = written.as_str() == "true";
            self.key(key);
            self.writer.buffer.print_str(written.as_str());
            self.writer.give_back(written);
            return;
        }
        if key == "optional" && self.typed || (self.kind, key) == ("TSModuleDeclaration", "kind") {
            return;
        }
        if (self.kind, key) == ("TSTypeParameter", "name") {
            // acorn-typescript names a type parameter with a string.
            let written = self.writer.apart(value);
            self.key(key);
            self.writer
                .buffer
                .print_str(identifier_name(written.as_str()));
            self.writer.give_back(written);
            return;
        }
        if absent_when_empty(self.kind, key, self.writer.typescript) {
            let written = self.writer.apart(value);
            let empty = matches!(written.as_str(), "null" | "false" | "[]");
            if key == "typeArguments" && !empty {
                self.typed = true;
            }
            if empty {
                // Left out.
            } else if self.kind == "ImportExpression" && key == "options" {
                // acorn-typescript keeps `import()`'s second argument in a list.
                self.key("arguments");
                let buffer = &mut self.writer.buffer;
                buffer.print_ascii_byte(b'[');
                buffer.print_str(written.as_str());
                buffer.print_ascii_byte(b']');
            } else {
                self.key(acorn_key(self.kind, key));
                self.writer.buffer.print_str(written.as_str());
            }
            self.writer.give_back(written);
            return;
        }
        self.key(acorn_key(self.kind, key));
        value.serialize(&mut *self.writer);
    }

    fn serialize_js_field<T: ESTree + ?Sized>(&mut self, key: &'static str, value: &T) {
        if !self.writer.typescript {
            self.serialize_field(key, value);
        }
    }

    fn serialize_ts_field<T: ESTree + ?Sized>(&mut self, key: &'static str, value: &T) {
        if self.writer.typescript {
            self.serialize_field(key, value);
        }
    }

    fn serialize_span<S: ESTreeSpan>(&mut self, span: S) {
        let [mut start, mut end] = span.range();
        if self.kind == "TemplateElement" && self.writer.typescript {
            // oxc widens it over the delimiters for TypeScript ESLint; acorn does not.
            start += 1;
            end -= if self.tail { 1 } else { 2 };
        }
        if let Some(shape) = &mut self.writer.shape {
            match self.writer.program {
                // acorn's program starts at the start of the text it reads.
                Some(program) if self.kind == "Program" => shape.span(0, program.content_end),
                _ => shape.span(start, end),
            }
        }
        if self.fields > 0 {
            self.writer.buffer.print_ascii_byte(b',');
        }
        self.fields += 1;
        if self.kind == "Program"
            && let Some(program) = self.writer.program.take()
        {
            self.writer.program_position(program);
            return;
        }
        self.writer.position(start, end);
    }

    fn end(self) {
        if let Some(index) = self.index {
            if let Some(shape) = &mut self.writer.shape {
                shape.close();
            } else {
                self.writer.node_comments(index);
                if self.kind == "Program"
                    && let Some(comment) = self.writer.program_comment.take()
                {
                    // svelte gives the program the HTML comment before its script.
                    self.writer
                        .buffer
                        .print_str(",\"leadingComments\":[{\"type\":\"Line\",\"value\":");
                    comment.serialize(&mut *self.writer);
                    self.writer.buffer.print_str("}]");
                }
            }
        }
        if let Some(at) = self.parenthesized {
            let pairs = std::mem::take(&mut self.writer.parentheses[at].1);
            for &[start, end] in &pairs {
                self.writer.buffer.print_str("},");
                self.writer.position(start, end);
            }
            self.writer.parentheses[at].1 = pairs;
        }
        self.writer.buffer.print_ascii_byte(b'}');
    }

    fn include_ts_fields(&self) -> bool {
        self.writer.typescript
    }

    fn ranges(&self) -> bool {
        false
    }
}

pub(super) struct List<'s, 'w> {
    writer: &'s mut Writer<'w>,
    elements: u32,
    /// The field it is the value of.
    key: &'static str,
}

impl SequenceSerializer for List<'_, '_> {
    fn serialize_element<T: ESTree + ?Sized>(&mut self, value: &T) {
        if self.elements > 0 {
            self.writer.buffer.print_ascii_byte(b',');
        }
        self.writer.slot = (self.key, Some(self.elements));
        self.elements += 1;
        value.serialize(&mut *self.writer);
    }

    fn end(self) {
        if let Some(shape) = &mut self.writer.shape {
            shape.list(self.key, self.elements);
        }
        self.writer.buffer.print_ascii_byte(b']');
    }
}

/// The JSON string of the `name` of an identifier written as JSON.
fn identifier_name(json: &str) -> &str {
    let Some(at) = json.find("\"name\":\"") else {
        return "null";
    };
    let name = &json[at + "\"name\":".len()..];
    let mut escaped = false;
    for (index, byte) in name.bytes().enumerate().skip(1) {
        match byte {
            b'\\' if !escaped => escaped = true,
            b'"' if !escaped => return &name[..=index],
            _ => escaped = false,
        }
    }
    "null"
}

/// A `type` that oxc writes for few nodes, kept for the life of the program.
fn leak(oxc: &str) -> &'static str {
    use std::collections::HashSet;
    use std::sync::{LazyLock, Mutex};
    static NAMES: LazyLock<Mutex<HashSet<&'static str>>> = LazyLock::new(Mutex::default);
    let mut names = NAMES
        .lock()
        .unwrap_or_else(std::sync::PoisonError::into_inner);
    if let Some(name) = names.get(oxc) {
        return name;
    }
    let name: &'static str = Box::leak(oxc.to_owned().into_boxed_str());
    names.insert(name);
    name
}

/// The `type` acorn-typescript gives the node oxc calls `oxc`, where the two differ.
fn acorn_type(oxc: &str) -> Option<&'static str> {
    Some(match oxc {
        "TSInterfaceHeritage" | "TSClassImplements" => "TSExpressionWithTypeArguments",
        "TSEmptyBodyFunctionExpression" => "TSDeclareMethod",
        _ => return None,
    })
}

/// acorn-typescript's name of the field oxc calls `key` on a node of `kind`.
fn acorn_key(kind: &str, key: &'static str) -> &'static str {
    match (kind, key) {
        (
            "TSFunctionType"
            | "TSConstructorType"
            | "TSMethodSignature"
            | "TSCallSignatureDeclaration"
            | "TSConstructSignatureDeclaration",
            "params",
        ) => "parameters",
        (
            "TSFunctionType"
            | "TSConstructorType"
            | "TSMethodSignature"
            | "TSCallSignatureDeclaration"
            | "TSConstructSignatureDeclaration",
            "returnType",
        ) => "typeAnnotation",
        ("TSExpressionWithTypeArguments", "typeArguments") => "typeParameters",
        ("TSImportType", "source") => "argument",
        ("ClassDeclaration" | "ClassExpression", "superTypeArguments") => "superTypeParameters",
        _ => key,
    }
}

/// Whether acorn-typescript leaves out a field that oxc writes as `null`, `false` or `[]`.
fn absent_when_empty(kind: &str, key: &str, typescript: bool) -> bool {
    match key {
        // Plain acorn writes them empty; acorn-typescript leaves them out.
        "attributes" | "options" => typescript,
        "optional" => !matches!(kind, "CallExpression" | "MemberExpression"),
        "decorators" | "typeAnnotation" | "typeArguments" | "typeParameters" | "returnType"
        | "declare" | "definite" | "accessibility" | "override" | "phase" | "hashbang"
        | "directive" | "superTypeArguments" | "implements" | "qualifier" => true,
        "readonly" => kind != "TSMappedType",
        "static" => matches!(
            kind,
            "TSPropertySignature" | "TSIndexSignature" | "TSMethodSignature"
        ),
        "abstract" => matches!(kind, "ClassDeclaration" | "ClassExpression"),
        "in" | "out" | "const" | "default" | "constraint" => kind == "TSTypeParameter",
        "global" => kind == "TSModuleDeclaration",
        "value" => kind == "RestElement",
        "extends" => kind == "TSInterfaceDeclaration",
        "body" => matches!(kind, "TSDeclareFunction" | "TSDeclareMethod"),
        _ => false,
    }
}
