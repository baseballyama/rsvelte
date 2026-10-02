use super::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, BinaryOperator, CompilerNodeIdentifier, Diagnostic,
    Kind, NodeIdentifier, NodeKind, Piece, R, ServerCompilationContext, SourceLocation,
    UpdateOperator, flag, sanitize_template_string,
};

impl ServerCompilationContext<'_> {
    /// Upstream `IfBlock` (server).
    pub(super) fn if_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::If {
            branches,
            otherwise,
        } = compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let mut arms = Vec::new();
        for (index, b) in compiler_syntax_tree.branches(branches).iter().enumerate() {
            let body = self.fragment(b.body)?;
            let marker = format!("<!--[{index}-->");
            let block = self.prepend_block_marker(body, &marker);
            let t = self.expression(b.test);
            arms.push((t, block));
        }
        let final_body = match otherwise {
            Some(o) => self.fragment(o)?,
            None => Vec::new(),
        };
        let mut chain = self.prepend_block_marker(final_body, "<!--[-1-->");
        for (t, block) in arms.into_iter().rev() {
            chain = self
                .out
                .if_(t, block, Some(chain), SourceLocation::SYNTHETIC);
        }
        template.push(Piece::Statement(chain));
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }

    /// Upstream `EachBlock` (server) for a block whose context is an identifier.
    pub(super) fn each_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript) = (self.compiler_syntax_tree, self.javascript);
        let NodeKind::Each(each) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let context = each.context().expect("the parser requires `as`");
        if !matches!(javascript.kind(context), Kind::Identifier(_)) {
            return Err(Diagnostic::error(
                "unsupported",
                "a destructuring `{#each}` context is not supported yet",
                javascript
                    .source_location(context)
                    .span()
                    .expect("parsed from source"),
            ));
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

        let i = self.out.identifier(&index);
        let zero = self.out.write_number(0.0, SourceLocation::SYNTHETIC);
        let first = self
            .out
            .declarator(i, Some(zero), SourceLocation::SYNTHETIC);
        let length = self.out.identifier("$$length");
        let array = self.out.identifier(&array_id);
        let array_length = self.out.dot(array, "length");
        let second = self
            .out
            .declarator(length, Some(array_length), SourceLocation::SYNTHETIC);
        let initializer =
            self.out
                .var_declaration(flag::LET, &[first, second], SourceLocation::SYNTHETIC);
        let i = self.out.identifier(&index);
        let length = self.out.identifier("$$length");
        let test = self
            .out
            .binary(BinaryOperator::Lt, i, length, SourceLocation::SYNTHETIC);
        let i = self.out.identifier(&index);
        let update = self
            .out
            .update(UpdateOperator::Inc, false, i, SourceLocation::SYNTHETIC);
        let block = self.out.block(&body, SourceLocation::SYNTHETIC);
        let for_loop = self.out.for_(
            Some(initializer),
            Some(test),
            Some(update),
            block,
            SourceLocation::SYNTHETIC,
        );

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

    /// `$$renderer.push('…')`.
    pub(super) fn push_literal(&mut self, text: &str) -> NodeIdentifier {
        let r = self.out.identifier("$$renderer");
        let callee = self.out.dot(r, "push");
        let m = self.out.write_string(text);
        let call = self
            .out
            .call(callee, &[m], false, SourceLocation::SYNTHETIC);
        self.out.expression_statement(call)
    }

    /// Upstream `prepend_block_marker`: folds the marker into a leading static push.
    pub(super) fn prepend_block_marker(
        &mut self,
        mut body: Vec<NodeIdentifier>,
        marker: &str,
    ) -> NodeIdentifier {
        let folded = body.first().and_then(|&first| {
            let Kind::ExpressionStatement(call) = self.out.kind(first) else {
                return None;
            };
            let Kind::Call {
                callee,
                arguments: [arg],
                ..
            } = self.out.kind(call)
            else {
                return None;
            };
            let is_push = matches!(self.out.kind(callee), Kind::Member { object, property, .. }
                if self.out.name(object) == "$$renderer" && self.out.name(property) == "push");
            let Kind::Template {
                quasis,
                expressions,
            } = self.out.kind(*arg)
            else {
                return None;
            };
            if !is_push {
                return None;
            }
            let (quasis, expressions) = (quasis.to_vec(), expressions.to_vec());
            let n = quasis.len();
            let mut new_quasis = Vec::with_capacity(n);
            for (i, &q) in quasis.iter().enumerate() {
                let raw = self.out.str_value(q, self.source_text).to_owned();
                let raw = if i == 0 {
                    format!("{}{raw}", sanitize_template_string(marker))
                } else {
                    raw
                };
                new_quasis.push(self.out.template_element(&raw, i + 1 == n));
            }
            let t = self
                .out
                .template(&new_quasis, &expressions, SourceLocation::SYNTHETIC);
            let r = self.out.identifier("$$renderer");
            let callee = self.out.dot(r, "push");
            let call = self
                .out
                .call(callee, &[t], false, SourceLocation::SYNTHETIC);
            Some(self.out.expression_statement(call))
        });
        if let Some(s) = folded {
            body[0] = s;
        } else {
            let r = self.out.identifier("$$renderer");
            let callee = self.out.dot(r, "push");
            let m = self.out.write_string(marker);
            let call = self
                .out
                .call(callee, &[m], false, SourceLocation::SYNTHETIC);
            body.insert(0, self.out.expression_statement(call));
        }
        self.out.block(&body, SourceLocation::SYNTHETIC)
    }
}
