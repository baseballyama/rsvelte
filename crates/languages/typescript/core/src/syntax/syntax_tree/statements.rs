use super::{NodeIdentifier, SourceLocation, SyntaxTree, Tag, flag};

impl SyntaxTree {
    pub fn program(
        &mut self,
        body: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(body);
        self.push(Tag::Program, 0, [l, 0], source_location)
    }

    pub fn var_declaration(
        &mut self,
        kind: u8,
        declarations: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(declarations);
        self.push(Tag::VariableDeclaration, kind, [l, 0], source_location)
    }

    pub fn declarator(
        &mut self,
        identifier: NodeIdentifier,
        initializer: Option<NodeIdentifier>,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::Declarator,
            0,
            [identifier.0, initializer.unwrap_or(NodeIdentifier::NONE).0],
            source_location,
        )
    }

    /// `kind name = initializer;` with a single declarator.
    pub fn let_(
        &mut self,
        kind: u8,
        identifier: NodeIdentifier,
        initializer: Option<NodeIdentifier>,
    ) -> NodeIdentifier {
        let d = self.declarator(identifier, initializer, SourceLocation::SYNTHETIC);
        self.var_declaration(kind, &[d], SourceLocation::SYNTHETIC)
    }

    pub fn expression_statement(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let source_location = self.source_location(e);
        self.push(Tag::ExpressionStatement, 0, [e.0, 0], source_location)
    }

    pub fn expression_statement_at(
        &mut self,
        e: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ExpressionStatement, 0, [e.0, 0], source_location)
    }

    pub fn function(
        &mut self,
        declaration: bool,
        name: Option<NodeIdentifier>,
        parameters: &[NodeIdentifier],
        body: NodeIdentifier,
        is_async: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let p = self.list(parameters);
        let r = self.record(&[
            name.unwrap_or(NodeIdentifier::NONE),
            NodeIdentifier(p),
            body,
        ]);
        self.push(
            if declaration {
                Tag::FunctionDeclaration
            } else {
                Tag::FunctionExpression
            },
            if is_async { flag::ASYNC } else { 0 },
            [r, 0],
            source_location,
        )
    }

    pub fn return_(
        &mut self,
        arg: Option<NodeIdentifier>,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::Return,
            0,
            [arg.unwrap_or(NodeIdentifier::NONE).0, 0],
            source_location,
        )
    }

    pub fn if_(
        &mut self,
        test: NodeIdentifier,
        consequent: NodeIdentifier,
        alternate: Option<NodeIdentifier>,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let r = self.record(&[test, consequent, alternate.unwrap_or(NodeIdentifier::NONE)]);
        self.push(Tag::If, 0, [r, 0], source_location)
    }

    pub fn for_(
        &mut self,
        initializer: Option<NodeIdentifier>,
        test: Option<NodeIdentifier>,
        update: Option<NodeIdentifier>,
        body: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let none = NodeIdentifier::NONE;
        let r = self.record(&[
            initializer.unwrap_or(none),
            test.unwrap_or(none),
            update.unwrap_or(none),
            body,
        ]);
        self.push(Tag::For, 0, [r, 0], source_location)
    }

    pub fn block(
        &mut self,
        body: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(body);
        self.push(Tag::Block, 0, [l, 0], source_location)
    }

    pub fn empty(&mut self, source_location: impl Into<SourceLocation>) -> NodeIdentifier {
        self.push(Tag::Empty, 0, [0, 0], source_location)
    }

    pub fn import(
        &mut self,
        specifiers: &[NodeIdentifier],
        source: NodeIdentifier,
        type_only: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(specifiers);
        self.push(
            Tag::Import,
            if type_only { flag::TYPE_ONLY } else { 0 },
            [l, source.0],
            source_location,
        )
    }

    pub fn import_default(
        &mut self,
        local: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ImportDefault, 0, [local.0, 0], source_location)
    }

    pub fn import_named(
        &mut self,
        imported: NodeIdentifier,
        local: NodeIdentifier,
        type_only: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::ImportNamed,
            if type_only { flag::TYPE_ONLY } else { 0 },
            [imported.0, local.0],
            source_location,
        )
    }

    pub fn import_namespace(
        &mut self,
        local: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ImportNamespace, 0, [local.0, 0], source_location)
    }

    pub fn export_named(
        &mut self,
        declaration: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ExportNamed, 0, [declaration.0, 0], source_location)
    }

    pub fn export_default(
        &mut self,
        declaration: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ExportDefault, 0, [declaration.0, 0], source_location)
    }

    pub fn typescript_declaration(
        &mut self,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::TypeScriptDeclaration, 0, [0, 0], source_location)
    }

    pub fn typescript_interface(
        &mut self,
        name: NodeIdentifier,
        members: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(members);
        self.push(Tag::TypeScriptInterface, 0, [name.0, l], source_location)
    }

    pub fn typescript_prop_sig(
        &mut self,
        key: NodeIdentifier,
        optional: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let f = if optional { flag::OPTIONAL } else { 0 };
        self.push(
            Tag::TypeScriptPropertySignature,
            f,
            [key.0, 0],
            source_location,
        )
    }
}
