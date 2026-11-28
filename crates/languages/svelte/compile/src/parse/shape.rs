//! The shape of a JavaScript part as the writer writes it: its nodes with their spans and
//! parents. oxc's serializer writes a node's span after its children, so what needs a node's span
//! before its children reads it from a first pass.

/// The nodes of one JavaScript part, in the order the serializer opens them.
#[derive(Default)]
pub(super) struct Shape {
    pub(super) nodes: Vec<Shaped>,
    open: Vec<u32>,
}

pub(super) struct Shaped {
    /// Its `type`, as acorn names it.
    pub(super) kind: &'static str,
    /// In bytes of the component.
    pub(super) start: u32,
    pub(super) end: u32,
    pub(super) parent: Option<u32>,
    /// The parent's field it is in, and its place when the field is a list.
    pub(super) key: &'static str,
    pub(super) place: Option<u32>,
    /// The length of its [`listed`] list.
    pub(super) length: u32,
}

impl Shape {
    pub(super) fn open(&mut self, kind: &'static str, key: &'static str, place: Option<u32>) {
        let index = self.nodes.len() as u32;
        self.nodes.push(Shaped {
            kind,
            start: 0,
            end: 0,
            parent: self.open.last().copied(),
            key,
            place,
            length: 0,
        });
        self.open.push(index);
    }

    pub(super) fn span(&mut self, start: u32, end: u32) {
        if let Some(&node) = self.open.last() {
            let node = &mut self.nodes[node as usize];
            node.start = start;
            node.end = end;
        }
    }

    pub(super) fn close(&mut self) {
        self.open.pop();
    }

    /// The list of the open node's field `key` had `length` elements.
    pub(super) fn list(&mut self, key: &str, length: u32) {
        if let Some(&node) = self.open.last() {
            let node = &mut self.nodes[node as usize];
            if Some(key) == listed(node.kind) {
                node.length = length;
            }
        }
    }
}

/// The list of a node of `kind` whose last element takes every comment up to the node's end.
pub(super) fn listed(kind: &str) -> Option<&'static str> {
    match kind {
        "BlockStatement" | "Program" => Some("body"),
        "ArrayExpression" => Some("elements"),
        "ObjectExpression" => Some("properties"),
        _ => None,
    }
}
