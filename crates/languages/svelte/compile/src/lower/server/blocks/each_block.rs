use oxc_ast::ast::{
    BinaryOperator, ForStatementInit, SimpleAssignmentTarget, Statement, UpdateOperator,
    VariableDeclarationKind,
};
use oxc_span::SPAN;

use crate::lower::builder::Runtime;
use crate::lower::server::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, CompilerNodeIdentifier, NodeKind, Piece, R,
    ServerCompilationContext, unsupported,
};
use crate::lower::span_of;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `EachBlock` (server) for a block whose context is an identifier.
    pub(in crate::lower::server) fn each_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript, b) =
            (self.compiler_syntax_tree, self.javascript, self.b);
        let NodeKind::Each(each) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let context = &javascript
            .get_pattern(each.context.expect("the parser requires `as`"))
            .pattern;
        let Some(item) = context
            .get_binding_identifier()
            .filter(|_| context.is_binding_identifier())
        else {
            return unsupported("a destructuring `{#each}` context", span_of(context));
        };
        let collection = self.expression(each.collection);
        let index = each.index.map_or_else(
            || self.each_index[&identifier].clone(),
            |i| {
                javascript
                    .get_pattern(i)
                    .pattern
                    .get_binding_identifier()
                    .expect("an `{#each}` index is an identifier")
                    .name
                    .to_string()
            },
        );
        let array_id = self.names.unique("each_array");
        let array_declaration = b.const_(&array_id, b.runtime("ensure_array_like", [collection]));

        let element = b.computed(b.id(&array_id), b.id(&index));
        let mut body = vec![b.declaration(
            VariableDeclarationKind::Let,
            [b.declarator(b.binding_at(&item.name, item.span), Some(element))],
        )];
        body.extend(self.fragment(each.body)?);

        let for_loop = self.each_loop(&index, &array_id, body);

        if let Some(f) = each.fallback {
            let open = self.push_literal(BLOCK_OPEN);
            let fallback = self.fragment(f)?;
            let fallback = self.prepend_block_marker(fallback, BLOCK_OPEN_ELSE);
            let test = b.binary(
                b.member(b.id(&array_id), "length"),
                BinaryOperator::StrictInequality,
                b.number(0.0),
            );
            let statement = b.if_(test, b.block([open, for_loop]), Some(fallback));
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
    fn each_loop(&self, index: &str, array_id: &str, body: Vec<Statement<'o>>) -> Statement<'o> {
        let b = self.b;
        let Statement::VariableDeclaration(initializer) = b.declaration(
            VariableDeclarationKind::Let,
            [
                b.declarator(b.binding(index), Some(b.number(0.0))),
                b.declarator(
                    b.binding("$$length"),
                    Some(b.member(b.id(array_id), "length")),
                ),
            ],
        ) else {
            unreachable!("a variable declaration")
        };
        let test = b.binary(b.id(index), BinaryOperator::LessThan, b.id("$$length"));
        let target =
            SimpleAssignmentTarget::new_assignment_target_identifier(SPAN, b.str(index), b);
        let update = oxc_ast::ast::Expression::new_update_expression(
            SPAN,
            UpdateOperator::Increment,
            false,
            target,
            b,
        );
        Statement::new_for_statement(
            SPAN,
            Some(ForStatementInit::VariableDeclaration(initializer)),
            Some(test),
            Some(update),
            b.block(body),
            b,
        )
    }
}
