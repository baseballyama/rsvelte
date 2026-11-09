//! Type syntax and the declarations made of it, as [`Tag::Type`] nodes.
//!
//! No value node has a type node as a child ([`SyntaxTree::for_each_child`] never yields one), so
//! scope analysis and compilation never meet them. A type is reached from the value node it
//! belongs to: through [`super::TypeScriptSyntax::syntax`], [`SyntaxTree::declaration`], or a
//! [`super::TypeScriptKind::Member`] of a class. Names, keys, parameters and enum initializers
//! inside a type are value nodes; a parameter's annotation is in [`SyntaxTree::typescript`].

use super::{NodeIdentifier, SourceLocation, SyntaxTree, Tag};

/// One node of type syntax.
#[derive(Clone, Copy, Debug)]
pub enum Type<'a> {
    /// A keyword (`string`, `void`, `this`, …), a literal, or a template literal type without
    /// substitutions.
    Leaf,
    /// `A`, `A.B<C>`, `const` in `as const`. The name is an identifier or a [`Type::Qualified`].
    Reference {
        name: NodeIdentifier,
        arguments: Option<NodeIdentifier>,
    },
    /// `A.B`: `left` is an identifier or a qualified name, `right` an identifier.
    Qualified {
        left: NodeIdentifier,
        right: NodeIdentifier,
    },
    /// `<A, B>` after a name or an expression.
    Arguments(&'a [NodeIdentifier]),
    /// `<T extends U = V>` of a declaration.
    Parameters(&'a [NodeIdentifier]),
    /// One type parameter; `name` is an identifier.
    Parameter {
        name: NodeIdentifier,
        constraint: Option<NodeIdentifier>,
        default: Option<NodeIdentifier>,
    },
    Signature(Signature<'a>),
    Union(&'a [NodeIdentifier]),
    Intersection(&'a [NodeIdentifier]),
    /// `T[]`.
    Array(NodeIdentifier),
    /// `T?` in a tuple.
    Optional(NodeIdentifier),
    /// `...T` in a tuple.
    Rest(NodeIdentifier),
    /// `T!`.
    NonNull(NodeIdentifier),
    /// `label: T` or `label?: T` in a tuple.
    Named {
        label: NodeIdentifier,
        element: NodeIdentifier,
        optional: bool,
    },
    Tuple(&'a [NodeIdentifier]),
    /// `A[B]`.
    Indexed {
        object: NodeIdentifier,
        index: NodeIdentifier,
    },
    Conditional {
        check: NodeIdentifier,
        extends: NodeIdentifier,
        consequent: NodeIdentifier,
        alternate: NodeIdentifier,
    },
    /// `infer U`, of a [`Type::Parameter`].
    Infer(NodeIdentifier),
    /// `keyof T`, `unique T`, `readonly T`.
    Operator(NodeIdentifier),
    /// `typeof a.b<T>`: the name is an identifier, a qualified name or a [`Type::Import`].
    Query {
        name: NodeIdentifier,
        arguments: Option<NodeIdentifier>,
    },
    /// `import('a').B<C>`; the source is a string literal.
    Import {
        source: NodeIdentifier,
        qualifier: Option<NodeIdentifier>,
        arguments: Option<NodeIdentifier>,
    },
    /// `` `a${T}b` ``: the types of its substitutions.
    TemplateLiteral(&'a [NodeIdentifier]),
    /// `{ a: T; m(): U }`: its members.
    Object(&'a [NodeIdentifier]),
    /// `{ [K in T as U]: V }`; the parameter holds `K` and its constraint `T`.
    Mapped {
        parameter: NodeIdentifier,
        name_type: Option<NodeIdentifier>,
        value: Option<NodeIdentifier>,
    },
    /// `x is T`, `asserts x`, `asserts this is T`: the name is an identifier or a `this` leaf.
    Predicate {
        name: NodeIdentifier,
        annotation: Option<NodeIdentifier>,
        asserts: bool,
    },
    /// `key?: T` of an object type, an interface, or an erased class field.
    Property {
        key: NodeIdentifier,
        value: Option<NodeIdentifier>,
        computed: bool,
        optional: bool,
    },
    /// `[key: K]: T`; the parameters are value parameters.
    Index {
        parameters: &'a [NodeIdentifier],
        value: Option<NodeIdentifier>,
    },
    /// `extends A, B` of an interface or `implements A, B` of a class: references.
    Heritage(&'a [NodeIdentifier]),
    /// `type Name<P> = value`.
    Alias {
        name: NodeIdentifier,
        parameters: Option<NodeIdentifier>,
        value: NodeIdentifier,
    },
    Interface {
        name: NodeIdentifier,
        parameters: Option<NodeIdentifier>,
        heritage: Option<NodeIdentifier>,
        body: &'a [NodeIdentifier],
    },
    Enum {
        name: NodeIdentifier,
        members: &'a [NodeIdentifier],
    },
    /// The initializer is a value expression.
    EnumMember {
        name: NodeIdentifier,
        initializer: Option<NodeIdentifier>,
    },
    /// `namespace A.B { … }`, `module "m" { … }`, `declare global { … }`; the name is an
    /// identifier, a qualified name or a string literal, the body its statements.
    Module {
        name: NodeIdentifier,
        body: Option<&'a [NodeIdentifier]>,
    },
    /// `import name = reference`: a qualified name, an identifier or a [`Type::External`].
    ImportEquals {
        name: NodeIdentifier,
        reference: NodeIdentifier,
    },
    /// `require("m")`, of a string literal.
    External(NodeIdentifier),
    /// `export = expression`.
    ExportAssignment(NodeIdentifier),
    /// `export as namespace Name`.
    NamespaceExport(NodeIdentifier),
}

/// A call signature, of a function type, a method in a type, or a call or construct signature.
#[derive(Clone, Copy, Debug)]
pub struct Signature<'a> {
    pub kind: SignatureKind,
    /// The key of a method; `None` for every other kind.
    pub key: Option<NodeIdentifier>,
    pub computed: bool,
    pub optional: bool,
    pub type_parameters: Option<NodeIdentifier>,
    /// Value parameters.
    pub parameters: &'a [NodeIdentifier],
    /// The return type; a function or constructor type always has one.
    pub returns: Option<NodeIdentifier>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum SignatureKind {
    /// `(a: A) => R`.
    Function,
    /// `new (a: A) => R`, `abstract new () => R`.
    Constructor,
    /// `(a: A): R` in an object type.
    Call,
    /// `new (a: A): R` in an object type.
    Construct,
    Method,
    Getter,
    Setter,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u8)]
enum TypeTag {
    Leaf,
    Reference,
    Qualified,
    Arguments,
    Parameters,
    Parameter,
    Signature,
    Union,
    Intersection,
    Array,
    Optional,
    Rest,
    NonNull,
    Named,
    NamedOptional,
    Tuple,
    Indexed,
    Conditional,
    Infer,
    Operator,
    Query,
    Import,
    TemplateLiteral,
    Object,
    Mapped,
    Predicate,
    AssertsPredicate,
    Property,
    Index,
    Heritage,
    Alias,
    Interface,
    Enum,
    EnumMember,
    Module,
    ImportEquals,
    External,
    ExportAssignment,
    NamespaceExport,
}

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

const KINDS: [SignatureKind; 7] = [
    SignatureKind::Function,
    SignatureKind::Constructor,
    SignatureKind::Call,
    SignatureKind::Construct,
    SignatureKind::Method,
    SignatureKind::Getter,
    SignatureKind::Setter,
];

/// Bits of a [`Type::Property`] or a [`Signature`], above a signature's kind.
const COMPUTED: u32 = 0x100;
const OPTIONAL: u32 = 0x200;

const fn opt(n: Option<NodeIdentifier>) -> NodeIdentifier {
    match n {
        Some(n) => n,
        None => NodeIdentifier::NONE,
    }
}

impl SyntaxTree {
    #[expect(clippy::too_many_lines, reason = "one arm per type syntax")]
    pub fn type_node(&mut self, ty: Type<'_>, span: impl Into<SourceLocation>) -> NodeIdentifier {
        let (tag, data) = match ty {
            Type::Leaf => (TypeTag::Leaf, [0, 0]),
            Type::Reference { name, arguments } => (TypeTag::Reference, [name.0, opt(arguments).0]),
            Type::Qualified { left, right } => (TypeTag::Qualified, [left.0, right.0]),
            Type::Arguments(l) => (TypeTag::Arguments, [self.list(l), 0]),
            Type::Parameters(l) => (TypeTag::Parameters, [self.list(l), 0]),
            Type::Parameter {
                name,
                constraint,
                default,
            } => (
                TypeTag::Parameter,
                [self.record(&[name, opt(constraint), opt(default)]), 0],
            ),
            Type::Signature(s) => {
                let parameters = NodeIdentifier(self.list(s.parameters));
                let at = self.record(&[
                    opt(s.key),
                    opt(s.type_parameters),
                    parameters,
                    opt(s.returns),
                ]);
                let bits = s.kind as u32
                    | if s.computed { COMPUTED } else { 0 }
                    | if s.optional { OPTIONAL } else { 0 };
                (TypeTag::Signature, [at, bits])
            }
            Type::Union(l) => (TypeTag::Union, [self.list(l), 0]),
            Type::Intersection(l) => (TypeTag::Intersection, [self.list(l), 0]),
            Type::Array(e) => (TypeTag::Array, [e.0, 0]),
            Type::Optional(e) => (TypeTag::Optional, [e.0, 0]),
            Type::Rest(e) => (TypeTag::Rest, [e.0, 0]),
            Type::NonNull(e) => (TypeTag::NonNull, [e.0, 0]),
            Type::Named {
                label,
                element,
                optional,
            } => (
                if optional {
                    TypeTag::NamedOptional
                } else {
                    TypeTag::Named
                },
                [label.0, element.0],
            ),
            Type::Tuple(l) => (TypeTag::Tuple, [self.list(l), 0]),
            Type::Indexed { object, index } => (TypeTag::Indexed, [object.0, index.0]),
            Type::Conditional {
                check,
                extends,
                consequent,
                alternate,
            } => (
                TypeTag::Conditional,
                [self.record(&[check, extends, consequent, alternate]), 0],
            ),
            Type::Infer(p) => (TypeTag::Infer, [p.0, 0]),
            Type::Operator(e) => (TypeTag::Operator, [e.0, 0]),
            Type::Query { name, arguments } => (TypeTag::Query, [name.0, opt(arguments).0]),
            Type::Import {
                source,
                qualifier,
                arguments,
            } => (
                TypeTag::Import,
                [self.record(&[source, opt(qualifier), opt(arguments)]), 0],
            ),
            Type::TemplateLiteral(l) => (TypeTag::TemplateLiteral, [self.list(l), 0]),
            Type::Object(l) => (TypeTag::Object, [self.list(l), 0]),
            Type::Mapped {
                parameter,
                name_type,
                value,
            } => (
                TypeTag::Mapped,
                [self.record(&[parameter, opt(name_type), opt(value)]), 0],
            ),
            Type::Predicate {
                name,
                annotation,
                asserts,
            } => (
                if asserts {
                    TypeTag::AssertsPredicate
                } else {
                    TypeTag::Predicate
                },
                [name.0, opt(annotation).0],
            ),
            Type::Property {
                key,
                value,
                computed,
                optional,
            } => (
                TypeTag::Property,
                [
                    self.record(&[key, opt(value)]),
                    if computed { COMPUTED } else { 0 } | if optional { OPTIONAL } else { 0 },
                ],
            ),
            Type::Index { parameters, value } => {
                (TypeTag::Index, [self.list(parameters), opt(value).0])
            }
            Type::Heritage(l) => (TypeTag::Heritage, [self.list(l), 0]),
            Type::Alias {
                name,
                parameters,
                value,
            } => (
                TypeTag::Alias,
                [self.record(&[name, opt(parameters), value]), 0],
            ),
            Type::Interface {
                name,
                parameters,
                heritage,
                body,
            } => {
                let body = NodeIdentifier(self.list(body));
                (
                    TypeTag::Interface,
                    [
                        self.record(&[name, opt(parameters), opt(heritage), body]),
                        0,
                    ],
                )
            }
            Type::Enum { name, members } => (TypeTag::Enum, [name.0, self.list(members)]),
            Type::EnumMember { name, initializer } => {
                (TypeTag::EnumMember, [name.0, opt(initializer).0])
            }
            Type::Module { name, body } => (
                TypeTag::Module,
                [name.0, body.map_or(u32::MAX, |b| self.list(b))],
            ),
            Type::ImportEquals { name, reference } => {
                (TypeTag::ImportEquals, [name.0, reference.0])
            }
            Type::External(s) => (TypeTag::External, [s.0, 0]),
            Type::ExportAssignment(e) => (TypeTag::ExportAssignment, [e.0, 0]),
            Type::NamespaceExport(n) => (TypeTag::NamespaceExport, [n.0, 0]),
        };
        self.push(Tag::Type, tag as u8, data, span)
    }
}

mod read;
