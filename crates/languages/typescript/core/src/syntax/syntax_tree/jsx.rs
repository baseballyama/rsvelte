//! JSX, as [`Tag::Jsx`] nodes. An element's name is an identifier, a member expression or a
//! [`Jsx::Namespaced`] name; only a name that refers to a binding is a child in scope order.

use super::{Kind, NodeIdentifier, SourceLocation, SyntaxTree, Tag};

#[derive(Clone, Copy, Debug)]
pub enum Jsx<'a> {
    /// `<a b={c}>…</a>`, `<a />`; a fragment `<>…</>` has no name.
    Element {
        name: Option<NodeIdentifier>,
        attributes: &'a [NodeIdentifier],
        children: &'a [NodeIdentifier],
    },
    /// `b`, `b="c"`, `b={c}`, `b=<c />`.
    Attribute {
        name: NodeIdentifier,
        value: Option<NodeIdentifier>,
    },
    /// `{...a}` as an attribute or a child.
    Spread(NodeIdentifier),
    /// `{a}`, or `{}` and `{/* … */}` without an expression.
    Container(Option<NodeIdentifier>),
    /// Text between tags, kept as written.
    Text,
    /// `a:b`.
    Namespaced {
        namespace: NodeIdentifier,
        name: NodeIdentifier,
    },
}

const ELEMENT: u8 = 0;
const ATTRIBUTE: u8 = 1;
const SPREAD: u8 = 2;
const CONTAINER: u8 = 3;
const TEXT: u8 = 4;
const NAMESPACED: u8 = 5;

impl SyntaxTree {
    pub fn jsx(&mut self, jsx: Jsx<'_>, span: impl Into<SourceLocation>) -> NodeIdentifier {
        let none = NodeIdentifier::NONE;
        let (tag, data) = match jsx {
            Jsx::Element {
                name,
                attributes,
                children,
            } => {
                let attributes = NodeIdentifier(self.list(attributes));
                let children = NodeIdentifier(self.list(children));
                (
                    ELEMENT,
                    [name.unwrap_or(none).0, self.record(&[attributes, children])],
                )
            }
            Jsx::Attribute { name, value } => (ATTRIBUTE, [name.0, value.unwrap_or(none).0]),
            Jsx::Spread(argument) => (SPREAD, [argument.0, 0]),
            Jsx::Container(expression) => (CONTAINER, [expression.unwrap_or(none).0, 0]),
            Jsx::Text => (TEXT, [0, 0]),
            Jsx::Namespaced { namespace, name } => (NAMESPACED, [namespace.0, name.0]),
        };
        self.push(Tag::Jsx, tag, data, span)
    }

    pub(super) fn jsx_kind(&self, node: NodeIdentifier) -> Jsx<'_> {
        let [a, b] = self.d(node);
        match self.flags(node) {
            ELEMENT => Jsx::Element {
                name: NodeIdentifier(a).opt(),
                attributes: self.list_at(self.rec(b, 0).0),
                children: self.list_at(self.rec(b, 1).0),
            },
            ATTRIBUTE => Jsx::Attribute {
                name: NodeIdentifier(a),
                value: NodeIdentifier(b).opt(),
            },
            SPREAD => Jsx::Spread(NodeIdentifier(a)),
            CONTAINER => Jsx::Container(NodeIdentifier(a).opt()),
            TEXT => Jsx::Text,
            NAMESPACED => Jsx::Namespaced {
                namespace: NodeIdentifier(a),
                name: NodeIdentifier(b),
            },
            _ => unreachable!("a JSX tag is set by its constructor"),
        }
    }

    /// The children of a JSX node in source order; an element's name only when it refers to a
    /// binding, as `<Component>` and `<a.b>` do and `<div>` does not.
    pub(super) fn for_each_jsx_child(&self, jsx: Jsx<'_>, f: &mut impl FnMut(NodeIdentifier)) {
        match jsx {
            Jsx::Element {
                name,
                attributes,
                children,
            } => {
                if let Some(name) = name
                    && self.names_a_component(name)
                {
                    f(name);
                }
                attributes.iter().chain(children).copied().for_each(f);
            }
            Jsx::Attribute { value, .. } => value.into_iter().for_each(f),
            Jsx::Spread(argument) => f(argument),
            Jsx::Container(expression) => expression.into_iter().for_each(f),
            Jsx::Text | Jsx::Namespaced { .. } => {}
        }
    }

    /// JSX's rule: a member expression, or an identifier that does not start with a lowercase
    /// letter and has no `-`.
    fn names_a_component(&self, name: NodeIdentifier) -> bool {
        match self.kind(name) {
            Kind::Member { .. } => true,
            Kind::Identifier(_) => {
                let name = self.name(name);
                !name.starts_with(|c: char| c.is_ascii_lowercase()) && !name.contains('-')
            }
            _ => false,
        }
    }
}
