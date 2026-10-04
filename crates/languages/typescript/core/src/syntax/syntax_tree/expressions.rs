use super::{
    AssignmentOperator, Atom, BinaryOperator, LogicalOperator, NodeIdentifier, SourceLocation,
    Span, SyntaxTree, Tag, UnaryOperator, UpdateOperator, flag,
};

impl SyntaxTree {
    pub fn ident_atom(
        &mut self,
        atom: Atom,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Identifier, 0, [atom.0, 0], source_location)
    }

    pub fn ident(
        &mut self,
        name: &str,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let a = self.atoms.intern(name);
        self.ident_atom(a, source_location)
    }

    /// A synthesized identifier.
    pub fn identifier(&mut self, name: &str) -> NodeIdentifier {
        self.ident(name, SourceLocation::SYNTHETIC)
    }

    pub fn write_number(
        &mut self,
        v: f64,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let bits = v.to_bits();
        self.push(
            Tag::Number,
            0,
            [bits as u32, (bits >> 32) as u32],
            source_location,
        )
    }

    /// A string literal whose value is the source bytes `value` (no escapes in between).
    pub fn str_in_source(
        &mut self,
        value: Span,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::String,
            0,
            [value.start_offset, value.end_offset],
            source_location,
        )
    }

    pub fn str_owned(
        &mut self,
        value: &str,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let d = self.own_str(value);
        self.push(Tag::String, flag::OWNED, d, source_location)
    }

    pub fn write_string(&mut self, value: &str) -> NodeIdentifier {
        self.str_owned(value, SourceLocation::SYNTHETIC)
    }

    pub fn regex(&mut self, pattern: Span, flags: Span) -> NodeIdentifier {
        let span = Span::new(pattern.start_offset - 1, flags.end_offset);
        self.push(
            Tag::Regex,
            0,
            [pattern.start_offset, pattern.end_offset],
            span,
        )
    }

    pub fn write_boolean(
        &mut self,
        v: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Boolean, 0, [u32::from(v), 0], source_location)
    }

    pub fn null(&mut self, source_location: impl Into<SourceLocation>) -> NodeIdentifier {
        self.push(Tag::Null, 0, [0, 0], source_location)
    }

    pub fn this(&mut self, source_location: impl Into<SourceLocation>) -> NodeIdentifier {
        self.push(Tag::This, 0, [0, 0], source_location)
    }

    pub fn template(
        &mut self,
        quasis: &[NodeIdentifier],
        expressions: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        debug_assert_eq!(
            quasis.len(),
            expressions.len() + 1,
            "a template has one more quasi than expressions"
        );
        let q = self.list(quasis);
        let e = self.list(expressions);
        self.push(Tag::Template, 0, [q, e], source_location)
    }

    /// A template element whose raw text is the source bytes `raw`.
    pub fn template_element_in_source(
        &mut self,
        raw: Span,
        tail: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::TemplateElement,
            if tail { flag::TAIL } else { 0 },
            [raw.start_offset, raw.end_offset],
            source_location,
        )
    }

    /// A template element with synthesized raw text (already escaped for a template literal).
    pub fn template_element(&mut self, raw: &str, tail: bool) -> NodeIdentifier {
        let d = self.own_str(raw);
        self.push(
            Tag::TemplateElement,
            flag::OWNED | if tail { flag::TAIL } else { 0 },
            d,
            SourceLocation::SYNTHETIC,
        )
    }

    pub fn array(
        &mut self,
        items: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(items);
        self.push(Tag::Array, 0, [l, 0], source_location)
    }

    pub fn object(
        &mut self,
        props: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(props);
        self.push(Tag::Object, 0, [l, 0], source_location)
    }

    pub fn property(
        &mut self,
        key: NodeIdentifier,
        value: NodeIdentifier,
        flags: u8,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Property, flags, [key.0, value.0], source_location)
    }

    pub fn spread(
        &mut self,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Spread, 0, [arg.0, 0], source_location)
    }

    pub fn member(
        &mut self,
        object: NodeIdentifier,
        property: NodeIdentifier,
        computed: bool,
        optional: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let f =
            if computed { flag::COMPUTED } else { 0 } | if optional { flag::OPTIONAL } else { 0 };
        self.push(Tag::Member, f, [object.0, property.0], source_location)
    }

    /// `object.name`, synthesized.
    pub fn dot(&mut self, object: NodeIdentifier, name: &str) -> NodeIdentifier {
        let p = self.identifier(name);
        self.member(object, p, false, false, SourceLocation::SYNTHETIC)
    }

    pub fn call(
        &mut self,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
        optional: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(arguments);
        self.push(
            Tag::Call,
            if optional { flag::OPTIONAL } else { 0 },
            [callee.0, l],
            source_location,
        )
    }

    /// `callee(arguments)`, synthesized.
    pub fn call0(
        &mut self,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
    ) -> NodeIdentifier {
        self.call(callee, arguments, false, SourceLocation::SYNTHETIC)
    }

    /// `$.name(arguments)` — the shape of nearly every runtime call a lowering emits.
    pub fn runtime(
        &mut self,
        ns: &str,
        name: &str,
        arguments: &[NodeIdentifier],
    ) -> NodeIdentifier {
        let n = self.identifier(ns);
        let callee = self.dot(n, name);
        self.call0(callee, arguments)
    }

    pub fn mark_pure(&mut self, call: NodeIdentifier) {
        self.flags[call.index()] |= flag::PURE;
    }

    pub fn new_(
        &mut self,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(arguments);
        self.push(Tag::New, 0, [callee.0, l], source_location)
    }

    pub fn arrow(
        &mut self,
        parameters: &[NodeIdentifier],
        body: NodeIdentifier,
        expression_body: bool,
        is_async: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(parameters);
        let f = if expression_body {
            flag::EXPRESSION_BODY
        } else {
            0
        } | if is_async { flag::ASYNC } else { 0 };
        self.push(Tag::Arrow, f, [l, body.0], source_location)
    }

    pub fn unary(
        &mut self,
        op: UnaryOperator,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Unary, op as u8, [arg.0, 0], source_location)
    }

    pub fn update(
        &mut self,
        op: UpdateOperator,
        prefix: bool,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::Update,
            op as u8 | if prefix { flag::PREFIX } else { 0 },
            [arg.0, 0],
            source_location,
        )
    }

    pub fn binary(
        &mut self,
        op: BinaryOperator,
        l: NodeIdentifier,
        r: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Binary, op as u8, [l.0, r.0], source_location)
    }

    pub fn logical(
        &mut self,
        op: LogicalOperator,
        l: NodeIdentifier,
        r: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Logical, op as u8, [l.0, r.0], source_location)
    }

    pub fn cond(
        &mut self,
        test: NodeIdentifier,
        consequent: NodeIdentifier,
        alternate: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let r = self.record(&[test, consequent, alternate]);
        self.push(Tag::Conditional, 0, [r, 0], source_location)
    }

    pub fn assign(
        &mut self,
        op: AssignmentOperator,
        target: NodeIdentifier,
        value: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Assign, op as u8, [target.0, value.0], source_location)
    }

    pub fn seq(
        &mut self,
        items: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(items);
        self.push(Tag::Sequence, 0, [l, 0], source_location)
    }

    pub fn await_(
        &mut self,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Await, 0, [arg.0, 0], source_location)
    }

    pub fn object_pat(
        &mut self,
        props: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(props);
        self.push(Tag::ObjectPattern, 0, [l, 0], source_location)
    }

    pub fn array_pat(
        &mut self,
        items: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(items);
        self.push(Tag::ArrayPattern, 0, [l, 0], source_location)
    }

    pub fn assign_pat(
        &mut self,
        left: NodeIdentifier,
        right: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::AssignPattern, 0, [left.0, right.0], source_location)
    }

    pub fn rest(
        &mut self,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Rest, 0, [arg.0, 0], source_location)
    }

    pub fn hole(&mut self, source_location: impl Into<SourceLocation>) -> NodeIdentifier {
        self.push(Tag::Hole, 0, [0, 0], source_location)
    }
}

impl SyntaxTree {
    pub fn import_expression(
        &mut self,
        source: NodeIdentifier,
        options: Option<NodeIdentifier>,
        span: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::ImportExpression,
            0,
            [source.0, options.unwrap_or(NodeIdentifier::NONE).0],
            span,
        )
    }

    pub fn meta_property(
        &mut self,
        meta: NodeIdentifier,
        property: NodeIdentifier,
        span: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::MetaProperty, 0, [meta.0, property.0], span)
    }

    pub fn bigint(&mut self, raw: Span) -> NodeIdentifier {
        self.push(Tag::BigInt, 0, [raw.start_offset, raw.end_offset], raw)
    }
}

impl SyntaxTree {
    pub fn mark_generator(&mut self, function: NodeIdentifier, generator: bool) {
        if generator {
            self.flags[function.index()] |= flag::GENERATOR;
        }
    }

    pub fn super_(&mut self, span: impl Into<SourceLocation>) -> NodeIdentifier {
        self.push(Tag::Super, 0, [0, 0], span)
    }

    pub fn yield_(
        &mut self,
        argument: Option<NodeIdentifier>,
        delegate: bool,
        span: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::Yield,
            u8::from(delegate),
            [argument.unwrap_or(NodeIdentifier::NONE).0, 0],
            span,
        )
    }
}
