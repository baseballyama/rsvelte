//! oxc's serializer, writing through [`Writer`] with acorn's names and fields.

use oxc_data_structures::code_buffer::CodeBuffer;
use oxc_estree::{
    CompactFormatter, ConfigNoFixes, ESTree, ESTreeSpan, SequenceSerializer, Serializer,
    StructSerializer,
};

use super::Writer;

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
pub(in crate::parse) struct Node<'s, 'w> {
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

pub(in crate::parse) struct List<'s, 'w> {
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
