use super::{NodeIdentifier, SourceLocation, SyntaxTree, Tag};

#[derive(Clone, Copy, Debug)]
pub enum Class<'a> {
    Definition {
        name: Option<NodeIdentifier>,
        superclass: Option<NodeIdentifier>,
        members: &'a [NodeIdentifier],
        declaration: bool,
    },
    Method {
        key: NodeIdentifier,
        function: NodeIdentifier,
        computed: bool,
        is_static: bool,
        getter: bool,
        setter: bool,
    },
    Field {
        key: NodeIdentifier,
        value: Option<NodeIdentifier>,
        computed: bool,
        is_static: bool,
    },
    StaticBlock(NodeIdentifier),
}
const DEFINITION: u8 = 0;
const EXPRESSION: u8 = 1;
const METHOD: u8 = 2;
const FIELD: u8 = 3;
const STATIC_BLOCK: u8 = 4;
const COMPUTED: u8 = 8;
const STATIC: u8 = 16;
const GETTER: u8 = 32;
const SETTER: u8 = 128;

impl SyntaxTree {
    pub fn class(&mut self, class: Class<'_>, span: impl Into<SourceLocation>) -> NodeIdentifier {
        let (tag, data) = match class {
            Class::Definition {
                name,
                superclass,
                members,
                declaration,
            } => {
                let members = self.list(members);
                (
                    if declaration { DEFINITION } else { EXPRESSION },
                    [
                        self.record(&[
                            name.unwrap_or(NodeIdentifier::NONE),
                            superclass.unwrap_or(NodeIdentifier::NONE),
                            NodeIdentifier(members),
                        ]),
                        0,
                    ],
                )
            }
            Class::Method {
                key,
                function,
                computed,
                is_static,
                getter,
                setter,
            } => (
                METHOD
                    | if computed { COMPUTED } else { 0 }
                    | if is_static { STATIC } else { 0 }
                    | if getter { GETTER } else { 0 }
                    | if setter { SETTER } else { 0 },
                [key.0, function.0],
            ),
            Class::Field {
                key,
                value,
                computed,
                is_static,
            } => (
                FIELD | if computed { COMPUTED } else { 0 } | if is_static { STATIC } else { 0 },
                [key.0, value.unwrap_or(NodeIdentifier::NONE).0],
            ),
            Class::StaticBlock(body) => (STATIC_BLOCK, [body.0, 0]),
        };
        self.push(Tag::Class, tag, data, span)
    }

    pub(super) fn class_kind(&self, node: NodeIdentifier) -> Class<'_> {
        let [a, b] = self.d(node);
        let flags = self.flags(node);
        match flags & 7 {
            DEFINITION | EXPRESSION => Class::Definition {
                name: self.rec(a, 0).opt(),
                superclass: self.rec(a, 1).opt(),
                members: self.list_at(self.rec(a, 2).0),
                declaration: flags & 7 == DEFINITION,
            },
            METHOD => Class::Method {
                key: NodeIdentifier(a),
                function: NodeIdentifier(b),
                computed: flags & COMPUTED != 0,
                is_static: flags & STATIC != 0,
                getter: flags & GETTER != 0,
                setter: flags & SETTER != 0,
            },
            FIELD => Class::Field {
                key: NodeIdentifier(a),
                value: NodeIdentifier(b).opt(),
                computed: flags & COMPUTED != 0,
                is_static: flags & STATIC != 0,
            },
            STATIC_BLOCK => Class::StaticBlock(NodeIdentifier(a)),
            _ => unreachable!("a class tag is set by its constructor"),
        }
    }
}
