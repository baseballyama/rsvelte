use crate::lower::server::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, BinaryOperator, CompilerNodeIdentifier,
    NodeIdentifier, NodeKind, Piece, R, ServerCompilationContext, SourceLocation, UpdateOperator,
    flag, unsupported,
};

impl ServerCompilationContext<'_> {
    /// Upstream `EachBlock` (server) for a block whose context is an identifier.
    pub(in crate::lower::server) fn each_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript) = (self.compiler_syntax_tree, self.javascript);
        let NodeKind::Each(each) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let context = each.context().expect("the parser requires `as`");
        if !javascript.is_identifier(context) {
            let span = javascript
                .source_location(context)
                .span()
                .expect("parsed from source");
            return unsupported("a destructuring `{#each}` context", span);
        }
        let collection = self.expression(each.collection);
        let index = each.index().map_or_else(
            || self.each_index[&identifier].clone(),
            |i| javascript.name(i).to_owned(),
        );
        let array_id = self.names.unique("each_array");
        let ensure = self.out.runtime("$", "ensure_array_like", &[collection]);
        let array = self.out.identifier(&array_id);
        let array_declaration = self.out.let_(flag::CONST, array, Some(ensure));

        let mut body = Vec::new();
        let item = self.out.ident(
            javascript.name(context),
            javascript.source_location(context),
        );
        let array = self.out.identifier(&array_id);
        let at = self.out.identifier(&index);
        let element = self
            .out
            .member(array, at, true, false, SourceLocation::SYNTHETIC);
        body.push(self.out.let_(flag::LET, item, Some(element)));
        body.extend(self.fragment(each.body)?);

        let for_loop = self.each_loop(&index, &array_id, &body);

        if let Some(f) = each.fallback {
            let open = self.push_literal(BLOCK_OPEN);
            let fallback = self.fragment(f)?;
            let fallback = self.prepend_block_marker(fallback, BLOCK_OPEN_ELSE);
            let array = self.out.identifier(&array_id);
            let array_length = self.out.dot(array, "length");
            let zero = self.out.write_number(0.0, SourceLocation::SYNTHETIC);
            let test = self.out.binary(
                BinaryOperator::StrictNotEq,
                array_length,
                zero,
                SourceLocation::SYNTHETIC,
            );
            let consequent = self.out.block(&[open, for_loop], SourceLocation::SYNTHETIC);
            let statement =
                self.out
                    .if_(test, consequent, Some(fallback), SourceLocation::SYNTHETIC);
            template.push(Piece::Statement(array_declaration));
            template.push(Piece::Statement(statement));
        } else {
            template.push(Piece::Text(BLOCK_OPEN.into()));
            template.push(Piece::Statement(array_declaration));
            template.push(Piece::Statement(for_loop));
        }
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }

    /// `for (let i = 0, $$length = array.length; i < $$length; i++) { … }`.
    fn each_loop(
        &mut self,
        index: &str,
        array_id: &str,
        body: &[NodeIdentifier],
    ) -> NodeIdentifier {
        let i = self.out.identifier(index);
        let zero = self.out.write_number(0.0, SourceLocation::SYNTHETIC);
        let first = self
            .out
            .declarator(i, Some(zero), SourceLocation::SYNTHETIC);
        let length = self.out.identifier("$$length");
        let array = self.out.identifier(array_id);
        let array_length = self.out.dot(array, "length");
        let second = self
            .out
            .declarator(length, Some(array_length), SourceLocation::SYNTHETIC);
        let initializer =
            self.out
                .var_declaration(flag::LET, &[first, second], SourceLocation::SYNTHETIC);
        let i = self.out.identifier(index);
        let length = self.out.identifier("$$length");
        let test = self
            .out
            .binary(BinaryOperator::Lt, i, length, SourceLocation::SYNTHETIC);
        let i = self.out.identifier(index);
        let update = self
            .out
            .update(UpdateOperator::Inc, false, i, SourceLocation::SYNTHETIC);
        let block = self.out.block(body, SourceLocation::SYNTHETIC);
        self.out.for_(
            Some(initializer),
            Some(test),
            Some(update),
            block,
            SourceLocation::SYNTHETIC,
        )
    }

    /// `$$renderer.push('…')`.
    fn push_literal(&mut self, text: &str) -> NodeIdentifier {
        let r = self.out.identifier("$$renderer");
        let callee = self.out.dot(r, "push");
        let m = self.out.write_string(text);
        let call = self
            .out
            .call(callee, &[m], false, SourceLocation::SYNTHETIC);
        self.out.expression_statement(call)
    }
}
