//! Reading [`Type`] nodes back from the columns.

use super::{COMPUTED, OPTIONAL, Signature, SignatureKind, Type, TypeTag, opt};
use crate::syntax_tree::{NodeIdentifier, SyntaxTree};

/// Each [`TypeTag`] by the number it is stored as.
const TAGS: [TypeTag; 39] = [
    TypeTag::Leaf,
    TypeTag::Reference,
    TypeTag::Qualified,
    TypeTag::Arguments,
    TypeTag::Parameters,
    TypeTag::Parameter,
    TypeTag::Signature,
    TypeTag::Union,
    TypeTag::Intersection,
    TypeTag::Array,
    TypeTag::Optional,
    TypeTag::Rest,
    TypeTag::NonNull,
    TypeTag::Named,
    TypeTag::NamedOptional,
    TypeTag::Tuple,
    TypeTag::Indexed,
    TypeTag::Conditional,
    TypeTag::Infer,
    TypeTag::Operator,
    TypeTag::Query,
    TypeTag::Import,
    TypeTag::TemplateLiteral,
    TypeTag::Object,
    TypeTag::Mapped,
    TypeTag::Predicate,
    TypeTag::AssertsPredicate,
    TypeTag::Property,
    TypeTag::Index,
    TypeTag::Heritage,
    TypeTag::Alias,
    TypeTag::Interface,
    TypeTag::Enum,
    TypeTag::EnumMember,
    TypeTag::Module,
    TypeTag::ImportEquals,
    TypeTag::External,
    TypeTag::ExportAssignment,
    TypeTag::NamespaceExport,
];

/// Each [`SignatureKind`] by the number it is stored as.
const KINDS: [SignatureKind; 7] = [
    SignatureKind::Function,
    SignatureKind::Constructor,
    SignatureKind::Call,
    SignatureKind::Construct,
    SignatureKind::Method,
    SignatureKind::Getter,
    SignatureKind::Setter,
];

impl SyntaxTree {
    #[expect(clippy::too_many_lines, reason = "one arm per type syntax")]
    pub(in crate::syntax_tree) fn type_kind(&self, node: NodeIdentifier) -> Type<'_> {
        let [a, b] = self.d(node);
        let n = NodeIdentifier;
        let o = |v: u32| NodeIdentifier(v).opt();
        match TAGS[self.flags(node) as usize] {
            TypeTag::Leaf => Type::Leaf,
            TypeTag::Reference => Type::Reference {
                name: n(a),
                arguments: o(b),
            },
            TypeTag::Qualified => Type::Qualified {
                left: n(a),
                right: n(b),
            },
            TypeTag::Arguments => Type::Arguments(self.list_at(a)),
            TypeTag::Parameters => Type::Parameters(self.list_at(a)),
            TypeTag::Parameter => Type::Parameter {
                name: self.rec(a, 0),
                constraint: self.rec(a, 1).opt(),
                default: self.rec(a, 2).opt(),
            },
            TypeTag::Signature => Type::Signature(Signature {
                kind: KINDS[(b & 0xFF) as usize],
                key: self.rec(a, 0).opt(),
                computed: b & COMPUTED != 0,
                optional: b & OPTIONAL != 0,
                type_parameters: self.rec(a, 1).opt(),
                parameters: self.list_at(self.rec(a, 2).0),
                returns: self.rec(a, 3).opt(),
            }),
            TypeTag::Union => Type::Union(self.list_at(a)),
            TypeTag::Intersection => Type::Intersection(self.list_at(a)),
            TypeTag::Array => Type::Array(n(a)),
            TypeTag::Optional => Type::Optional(n(a)),
            TypeTag::Rest => Type::Rest(n(a)),
            TypeTag::NonNull => Type::NonNull(n(a)),
            tag @ (TypeTag::Named | TypeTag::NamedOptional) => Type::Named {
                label: n(a),
                element: n(b),
                optional: tag == TypeTag::NamedOptional,
            },
            TypeTag::Tuple => Type::Tuple(self.list_at(a)),
            TypeTag::Indexed => Type::Indexed {
                object: n(a),
                index: n(b),
            },
            TypeTag::Conditional => Type::Conditional {
                check: self.rec(a, 0),
                extends: self.rec(a, 1),
                consequent: self.rec(a, 2),
                alternate: self.rec(a, 3),
            },
            TypeTag::Infer => Type::Infer(n(a)),
            TypeTag::Operator => Type::Operator(n(a)),
            TypeTag::Query => Type::Query {
                name: n(a),
                arguments: o(b),
            },
            TypeTag::Import => Type::Import {
                source: self.rec(a, 0),
                qualifier: self.rec(a, 1).opt(),
                arguments: self.rec(a, 2).opt(),
            },
            TypeTag::TemplateLiteral => Type::TemplateLiteral(self.list_at(a)),
            TypeTag::Object => Type::Object(self.list_at(a)),
            TypeTag::Mapped => Type::Mapped {
                parameter: self.rec(a, 0),
                name_type: self.rec(a, 1).opt(),
                value: self.rec(a, 2).opt(),
            },
            tag @ (TypeTag::Predicate | TypeTag::AssertsPredicate) => Type::Predicate {
                name: n(a),
                annotation: o(b),
                asserts: tag == TypeTag::AssertsPredicate,
            },
            TypeTag::Property => Type::Property {
                key: self.rec(a, 0),
                value: self.rec(a, 1).opt(),
                computed: b & COMPUTED != 0,
                optional: b & OPTIONAL != 0,
            },
            TypeTag::Index => Type::Index {
                parameters: self.list_at(a),
                value: o(b),
            },
            TypeTag::Heritage => Type::Heritage(self.list_at(a)),
            TypeTag::Alias => Type::Alias {
                name: self.rec(a, 0),
                parameters: self.rec(a, 1).opt(),
                value: self.rec(a, 2),
            },
            TypeTag::Interface => Type::Interface {
                name: self.rec(a, 0),
                parameters: self.rec(a, 1).opt(),
                heritage: self.rec(a, 2).opt(),
                body: self.list_at(self.rec(a, 3).0),
            },
            TypeTag::Enum => Type::Enum {
                name: n(a),
                members: self.list_at(b),
            },
            TypeTag::EnumMember => Type::EnumMember {
                name: n(a),
                initializer: o(b),
            },
            TypeTag::Module => Type::Module {
                name: n(a),
                body: (b != u32::MAX).then(|| self.list_at(b)),
            },
            TypeTag::ImportEquals => Type::ImportEquals {
                name: n(a),
                reference: n(b),
            },
            TypeTag::External => Type::External(n(a)),
            TypeTag::ExportAssignment => Type::ExportAssignment(n(a)),
            TypeTag::NamespaceExport => Type::NamespaceExport(n(a)),
        }
    }

    /// Calls `f` on each child of a type node, in source order: type nodes and the value nodes
    /// (names, keys, parameters, initializers, statements) it holds.
    pub fn for_each_type_child(&self, node: NodeIdentifier, mut f: impl FnMut(NodeIdentifier)) {
        let mut each = |nodes: &[NodeIdentifier]| Self::visit_present_nodes(nodes, &mut f);
        let o = |n: Option<NodeIdentifier>| opt(n);
        match self.type_kind(node) {
            Type::Leaf => {}
            Type::Reference {
                name: a,
                arguments: b,
            }
            | Type::Query {
                name: a,
                arguments: b,
            }
            | Type::Predicate {
                name: a,
                annotation: b,
                ..
            }
            | Type::EnumMember {
                name: a,
                initializer: b,
            } => each(&[a, o(b)]),
            Type::Qualified { left, right } => each(&[left, right]),
            Type::Indexed { object, index } => each(&[object, index]),
            Type::Named { label, element, .. } => each(&[label, element]),
            Type::ImportEquals { name, reference } => each(&[name, reference]),
            Type::Arguments(l)
            | Type::Parameters(l)
            | Type::Union(l)
            | Type::Intersection(l)
            | Type::Tuple(l)
            | Type::TemplateLiteral(l)
            | Type::Object(l)
            | Type::Heritage(l) => each(l),
            Type::Parameter {
                name,
                constraint,
                default,
            } => each(&[name, o(constraint), o(default)]),
            Type::Signature(s) => {
                each(&[o(s.key), o(s.type_parameters)]);
                each(s.parameters);
                each(&[o(s.returns)]);
            }
            Type::Array(e)
            | Type::Optional(e)
            | Type::Rest(e)
            | Type::NonNull(e)
            | Type::Infer(e)
            | Type::Operator(e)
            | Type::External(e)
            | Type::ExportAssignment(e)
            | Type::NamespaceExport(e) => each(&[e]),
            Type::Conditional {
                check,
                extends,
                consequent,
                alternate,
            } => each(&[check, extends, consequent, alternate]),
            Type::Import {
                source,
                qualifier,
                arguments,
            } => each(&[source, o(qualifier), o(arguments)]),
            Type::Mapped {
                parameter,
                name_type,
                value,
            } => each(&[parameter, o(name_type), o(value)]),
            Type::Property { key, value, .. } => each(&[key, o(value)]),
            Type::Index { parameters, value } => {
                each(parameters);
                each(&[o(value)]);
            }
            Type::Alias {
                name,
                parameters,
                value,
            } => each(&[name, o(parameters), value]),
            Type::Interface {
                name,
                parameters,
                heritage,
                body,
            } => {
                each(&[name, o(parameters), o(heritage)]);
                each(body);
            }
            Type::Enum { name, members } => {
                each(&[name]);
                each(members);
            }
            Type::Module { name, body } => {
                each(&[name]);
                each(body.unwrap_or_default());
            }
        }
    }
}
