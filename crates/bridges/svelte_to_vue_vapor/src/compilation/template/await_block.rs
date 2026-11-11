use oxc_ast::ast::BinaryOperator;
use rsvelte_svelte_semantic::compiler_syntax_tree::Await;

use super::{DirectiveName, Helper, Parent, R, Span, Template, vue};

impl Template<'_, '_, '_> {
    /// `{#await}` as a `$$Await` whose `v-for` names the promise's state, with a branch per
    /// status.
    pub(super) fn await_block(
        &mut self,
        await_: &Await,
        parent: Option<vue::CompilerNodeIdentifier>,
        preserve: bool,
        at: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        let b = self.b;
        let javascript = &self.i.component.javascript;
        let expression = self.template_expression(await_.expression);
        let state = format!("$$await_{}", at.start_offset);
        let properties = vec![
            self.bound("catch", at, b.boolean(await_.catch().is_some()), at),
            self.loop_directive([b.parameter(b.binding(&state))], expression, at),
        ];
        let node = self.template_node("$$Await", at, properties, parent);
        let mut children = Vec::with_capacity(3);
        for (status, body, parameter, field) in [
            (0, await_.pending(), None, "value"),
            (1, await_.then(), await_.value, "value"),
            (2, await_.catch(), await_.error, "error"),
        ] {
            let test = b.binary(
                b.member(b.id(&state), "status"),
                BinaryOperator::StrictEquality,
                b.number(f64::from(status)),
            );
            let name = if status == 0 {
                DirectiveName::If
            } else {
                DirectiveName::ElseIf
            };
            let mut lead = vec![self.directive_with(name, Some(test), at)];
            if let Some(parameter) = parameter {
                let parameter = self.parameter(javascript.get_pattern(parameter));
                let source = b.array([b.member(b.id(&state), field)]);
                lead.push(self.loop_directive([parameter], source, at));
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
