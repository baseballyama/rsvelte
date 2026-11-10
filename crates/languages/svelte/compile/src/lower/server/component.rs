use super::super::component::{
    Entry, Prop, is_dynamic, props, props_expression, push_binding, push_children, reference,
};
use super::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, CompilerNodeIdentifier, EMPTY_COMMENT, NodeKind,
    Piece, R, ServerCompilationContext, SourceLocation, Target, assign_statement, init_property,
    set_settled,
};

impl ServerCompilationContext<'_> {
    /// Upstream `build_inline_component`; a `standalone` component is its fragment's only node, so
    /// it needs no comment to end it.
    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        standalone: bool,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("a component element")
        };
        let mut parts = Vec::new();
        for prop in props(tree.attributes(element.attributes)) {
            match prop {
                Prop::Value(a) => {
                    let value = self.attribute_value(a, false, false);
                    let name = a.name.text(self.source_text);
                    parts.push(Entry::Property(init_property(&mut self.out, name, value)));
                }
                Prop::Spread(e) => parts.push(Entry::Spread(self.expression(e))),
                Prop::Bind(a, target) => {
                    let value = self.expression(target);
                    let target = self.expression(target);
                    let written = self.out.identifier("$$value");
                    let setter = [
                        assign_statement(&mut self.out, target, written),
                        set_settled(&mut self.out, false),
                    ];
                    let name = a.name.text(self.source_text);
                    push_binding(&mut self.out, &mut parts, name, value, &setter);
                }
            }
        }
        let children = self.fragment(element.children)?;
        push_children(&mut self.out, &mut parts, &children, &["$$renderer"]);
        let props = props_expression(&mut self.out, parts, Target::Server);
        let reference = reference(tree, identifier);
        let callee = self.expression(reference);
        let renderer = self.out.identifier("$$renderer");
        let call = self.out.call0(callee, &[renderer, props]);
        let statement = self.out.expression_statement(call);
        if is_dynamic(self.javascript, self.res, reference) {
            let test = self.expression(reference);
            let open = self.push_literal(BLOCK_OPEN);
            let close = self.push_literal(BLOCK_CLOSE);
            let consequent = self
                .out
                .block(&[open, statement, close], SourceLocation::SYNTHETIC);
            let open = self.push_literal(BLOCK_OPEN_ELSE);
            let close = self.push_literal(BLOCK_CLOSE);
            let alternate = self.out.block(&[open, close], SourceLocation::SYNTHETIC);
            let statement =
                self.out
                    .if_(test, consequent, Some(alternate), SourceLocation::SYNTHETIC);
            template.push(Piece::Statement(statement));
        } else {
            template.push(Piece::Statement(statement));
            if !standalone {
                template.push(Piece::Text(EMPTY_COMMENT.into()));
            }
        }
        Ok(())
    }
}
