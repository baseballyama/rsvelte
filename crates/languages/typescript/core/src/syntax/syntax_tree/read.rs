use super::{
    AssignmentOperator, Atom, BinaryOperator, Kind, LogicalOperator, NodeIdentifier,
    SourceLocation, SyntaxTree, Tag, UnaryOperator, UpdateOperator, flag,
};

impl SyntaxTree {
    #[inline]
    #[must_use]
    pub fn is_identifier(&self, identifier: NodeIdentifier) -> bool {
        self.tag(identifier) == Tag::Identifier
    }

    #[inline]
    #[must_use]
    pub fn tag(&self, identifier: NodeIdentifier) -> Tag {
        self.tags[identifier.index()]
    }

    #[inline]
    #[must_use]
    pub fn flags(&self, identifier: NodeIdentifier) -> u8 {
        self.flags[identifier.index()]
    }

    #[inline]
    #[must_use]
    pub fn source_location(&self, identifier: NodeIdentifier) -> SourceLocation {
        self.source_locations[identifier.index()]
    }

    #[inline]
    pub(super) fn d(&self, identifier: NodeIdentifier) -> [u32; 2] {
        self.data[identifier.index()]
    }

    /// The raw `data` pair; for in-source strings and template elements, the value's byte range.
    #[inline]
    #[must_use]
    pub fn raw_data(&self, identifier: NodeIdentifier) -> [u32; 2] {
        self.data[identifier.index()]
    }

    #[inline]
    pub(super) const fn nid(v: u32) -> NodeIdentifier {
        NodeIdentifier(v)
    }

    pub(super) fn list_at(&self, at: u32) -> &[NodeIdentifier] {
        let len = self.extra[at as usize].0 as usize;
        &self.extra[at as usize + 1..at as usize + 1 + len]
    }

    pub(super) fn rec(&self, at: u32, i: usize) -> NodeIdentifier {
        self.extra[at as usize + i]
    }

    /// # Panics
    ///
    /// Panics if `identifier` does not refer to a node in this tree.
    #[must_use]
    #[expect(clippy::too_many_lines, reason = "one arm per node tag")]
    pub fn kind(&self, identifier: NodeIdentifier) -> Kind<'_> {
        let [a, b] = self.d(identifier);
        let f = self.flags(identifier);
        let opt = |v: u32| NodeIdentifier(v).opt();
        match self.tag(identifier) {
            Tag::ImportExpression => Kind::ImportExpression {
                source: Self::nid(a),
                options: opt(b),
            },
            Tag::MetaProperty => Kind::MetaProperty {
                meta: Self::nid(a),
                property: Self::nid(b),
            },
            Tag::BigInt => Kind::BigInt,
            Tag::Class => Kind::Class(self.class_kind(identifier)),
            Tag::Super => Kind::Super,
            Tag::Yield => Kind::Yield {
                argument: opt(a),
                delegate: f != 0,
            },
            Tag::Control => Kind::Control(self.control_kind(identifier)),
            Tag::Program => Kind::Program(self.list_at(a)),
            Tag::VariableDeclaration => Kind::VariableDeclaration {
                kind: f,
                declarations: self.list_at(a),
            },
            Tag::Declarator => Kind::Declarator {
                identifier: Self::nid(a),
                initializer: opt(b),
            },
            Tag::ExpressionStatement => Kind::ExpressionStatement(Self::nid(a)),
            Tag::FunctionDeclaration | Tag::FunctionExpression => Kind::Function {
                name: self.rec(a, 0).opt(),
                parameters: self.list_at(self.rec(a, 1).0),
                body: self.rec(a, 2),
                is_async: f & flag::ASYNC != 0,
                declaration: self.tag(identifier) == Tag::FunctionDeclaration,
            },
            Tag::Return => Kind::Return(opt(a)),
            Tag::If => Kind::If {
                test: self.rec(a, 0),
                consequent: self.rec(a, 1),
                alternate: self.rec(a, 2).opt(),
            },
            Tag::For => Kind::For {
                initializer: self.rec(a, 0).opt(),
                test: self.rec(a, 1).opt(),
                update: self.rec(a, 2).opt(),
                body: self.rec(a, 3),
            },
            Tag::Block => Kind::Block(self.list_at(a)),
            Tag::Empty => Kind::Empty,
            Tag::Import => Kind::Import {
                specifiers: self.list_at(if f & flag::IMPORT_ATTRIBUTES != 0 {
                    self.rec(a, 0).0
                } else {
                    a
                }),
                source: if f & flag::IMPORT_ATTRIBUTES != 0 {
                    self.rec(a, 1)
                } else {
                    Self::nid(b)
                },
                type_only: f & flag::TYPE_ONLY != 0,
                attributes: (f & flag::IMPORT_ATTRIBUTES != 0).then(|| self.rec(a, 2)),
            },
            Tag::ImportDefault => Kind::ImportDefault(Self::nid(a)),
            Tag::ImportNamed => Kind::ImportNamed {
                imported: Self::nid(a),
                local: Self::nid(b),
            },
            Tag::ImportNamespace => Kind::ImportNamespace(Self::nid(a)),
            Tag::ExportNamed => Kind::ExportNamed(Self::nid(a)),
            Tag::ExportDefault => Kind::ExportDefault(Self::nid(a)),
            Tag::TypeScriptDeclaration => Kind::TypeScriptDeclaration,
            Tag::TypeScriptInterface => Kind::TypeScriptInterface {
                name: Self::nid(a),
                members: self.list_at(b),
            },
            Tag::TypeScriptPropertySignature => Kind::TypeScriptPropertySignature {
                key: Self::nid(a),
                optional: f & flag::OPTIONAL != 0,
            },
            Tag::Identifier => Kind::Identifier(Atom(a)),
            Tag::Number => Kind::Number(f64::from_bits(u64::from(a) | (u64::from(b) << 32))),
            Tag::String => Kind::String,
            Tag::Regex => Kind::Regex {
                pattern: super::Span::new(a, b),
                flags: super::Span::new(
                    b + 1,
                    self.source_location(identifier)
                        .span()
                        .expect("a source literal")
                        .end_offset,
                ),
            },
            Tag::Boolean => Kind::Boolean(a != 0),
            Tag::Null => Kind::Null,
            Tag::This => Kind::This,
            Tag::Template => Kind::Template {
                quasis: self.list_at(a),
                expressions: self.list_at(b),
            },
            Tag::TemplateElement => Kind::TemplateElement {
                tail: f & flag::TAIL != 0,
            },
            Tag::Array => Kind::Array(self.list_at(a)),
            Tag::Object => Kind::Object(self.list_at(a)),
            Tag::Property => Kind::Property {
                key: Self::nid(a),
                value: Self::nid(b),
                shorthand: f & flag::SHORTHAND != 0,
                computed: f & flag::COMPUTED != 0,
                method: f & flag::METHOD != 0,
                getter: f & flag::GETTER != 0,
                setter: f & flag::SETTER != 0,
            },
            Tag::Spread => Kind::Spread(Self::nid(a)),
            Tag::Member => Kind::Member {
                object: Self::nid(a),
                property: Self::nid(b),
                computed: f & flag::COMPUTED != 0,
                optional: f & flag::OPTIONAL != 0,
            },
            Tag::Call => Kind::Call {
                callee: Self::nid(a),
                arguments: self.list_at(b),
                optional: f & flag::OPTIONAL != 0,
                pure: f & flag::PURE != 0,
            },
            Tag::New => Kind::New {
                callee: Self::nid(a),
                arguments: self.list_at(b),
            },
            Tag::Arrow => Kind::Arrow {
                parameters: self.list_at(a),
                body: Self::nid(b),
                is_async: f & flag::ASYNC != 0,
                expression_body: f & flag::EXPRESSION_BODY != 0,
            },
            Tag::Unary => Kind::Unary(UnaryOperator::from_u8(f), Self::nid(a)),
            Tag::Update => Kind::Update {
                op: UpdateOperator::from_u8(f & !flag::PREFIX),
                prefix: f & flag::PREFIX != 0,
                arg: Self::nid(a),
            },
            Tag::Binary => Kind::Binary(BinaryOperator::from_u8(f), Self::nid(a), Self::nid(b)),
            Tag::Logical => Kind::Logical(LogicalOperator::from_u8(f), Self::nid(a), Self::nid(b)),
            Tag::Conditional => Kind::Conditional {
                test: self.rec(a, 0),
                consequent: self.rec(a, 1),
                alternate: self.rec(a, 2),
            },
            Tag::Assign => Kind::Assign(AssignmentOperator::from_u8(f), Self::nid(a), Self::nid(b)),
            Tag::Sequence => Kind::Sequence(self.list_at(a)),
            Tag::Await => Kind::Await(Self::nid(a)),
            Tag::ObjectPattern => Kind::ObjectPattern(self.list_at(a)),
            Tag::ArrayPattern => Kind::ArrayPattern(self.list_at(a)),
            Tag::AssignPattern => Kind::AssignPattern(Self::nid(a), Self::nid(b)),
            Tag::Rest => Kind::Rest(Self::nid(a)),
            Tag::Hole => Kind::Hole,
        }
    }
}
