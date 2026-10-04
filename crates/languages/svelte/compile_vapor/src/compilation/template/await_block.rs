use rsvelte_svelte::compilation::compiler_syntax_tree::Await;

use super::{
    BinaryOperator, Builder, DirectiveExpression, DirectiveName, Helper, LoopExpression,
    NodeIdentifier, Parent, R, SourceLocation, Span, directive, spelled, vue,
};

impl Builder<'_, '_> {
    pub(super) fn await_block(
        &mut self,
        await_: &Await,
        parent: Option<vue::CompilerNodeIdentifier>,
        preserve: bool,
        at: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        let expression = self.template_expression(await_.expression);
        let state_name = format!("$$await_{}", at.start_offset);
        let state = self.to.identifier(&state_name);
        let has_catch = self
            .to
            .write_boolean(await_.catch().is_some(), SourceLocation::SYNTHETIC);
        let properties = self.vb.props([
            super::bound("catch", at, has_catch, at),
            directive(
                DirectiveName::For,
                None,
                DirectiveExpression::For(LoopExpression {
                    parameters: vec![state],
                    source: expression,
                }),
                at,
            ),
        ]);
        let element = vue::Element {
            tag: spelled("$$Await", at),
            tag_type: vue::TagType::Template,
            props: properties,
            children: vue::Children::default(),
        };
        let node = self.vb.node(vue::NodeKind::Element(element), at, parent, 0);
        let mut children = Vec::new();
        for (status, body, parameter, field) in [
            (0, await_.pending(), NodeIdentifier::NONE, "value"),
            (1, await_.then(), await_.value, "value"),
            (2, await_.catch(), await_.error, "error"),
        ] {
            let state = self.to.identifier(&state_name);
            let status_value = self.to.dot(state, "status");
            let number = self
                .to
                .write_number(f64::from(status), SourceLocation::SYNTHETIC);
            let test = self.to.binary(
                BinaryOperator::StrictEq,
                status_value,
                number,
                SourceLocation::SYNTHETIC,
            );
            let name = if status == 0 {
                DirectiveName::If
            } else {
                DirectiveName::ElseIf
            };
            let mut lead = vec![directive(
                name,
                None,
                DirectiveExpression::Expression(test),
                at,
            )];
            if parameter != NodeIdentifier::NONE {
                let parameter = self.template_expression(parameter);
                let state = self.to.identifier(&state_name);
                let value = self.to.dot(state, field);
                let source = self.to.array(&[value], SourceLocation::SYNTHETIC);
                lead.push(directive(
                    DirectiveName::For,
                    None,
                    DirectiveExpression::For(LoopExpression {
                        parameters: vec![parameter],
                        source,
                    }),
                    at,
                ));
            }
            let ids = body.map_or(&[][..], |body| self.i.compiler_syntax_tree.children(body));
            children.push(self.block_element(
                Parent::Block,
                ids,
                Some(node),
                lead,
                preserve,
                at,
            )?);
        }
        let children = self.vb.children(&children);
        self.vb.set_element_children(node, children);
        if !self.i.server {
            self.helpers.insert(Helper::Await);
        }
        Ok(node)
    }
}
