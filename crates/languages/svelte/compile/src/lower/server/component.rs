use super::super::component::{
    Entry, Prop, is_dynamic, props, props_expression, push_binding, push_children, reference,
};
use super::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, CompilerNodeIdentifier, EMPTY_COMMENT, NodeKind,
    Piece, R, ServerCompilationContext, Target, set_settled,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_inline_component`; a `standalone` component is its fragment's only node, so
    /// it needs no comment to end it.
    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        standalone: bool,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let b = self.b;
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
                    parts.push(Entry::Property(b.init(name, value)));
                }
                Prop::Spread(e) => parts.push(Entry::Spread(self.expression(e))),
                Prop::Bind(a, target) => {
                    let value = self.expression(target);
                    let written = self.expression(target);
                    let assignment = match written {
                        oxc_ast::ast::Expression::Identifier(name) => {
                            b.assign_name(&name.name, b.id("$$value"))
                        }
                        member if member.is_member_expression() => {
                            b.assign_member(member, b.id("$$value"))
                        }
                        _ => unreachable!("validation keeps a bound target assignable"),
                    };
                    let setter = vec![b.stmt(assignment), set_settled(b, false)];
                    let name = a.name.text(self.source_text);
                    push_binding(b, &mut parts, name, value, setter);
                }
            }
        }
        let children = self.fragment(element.children)?;
        push_children(b, &mut parts, children, &["$$renderer"]);
        let props = props_expression(b, parts, Target::Server);
        let reference = reference(tree, identifier);
        let callee = self.expression(reference);
        let statement = b.stmt(b.call(callee, [b.id("$$renderer"), props]));
        if is_dynamic(self.res, self.javascript.get_expression(reference)) {
            let test = self.expression(reference);
            let consequent = b.block([
                self.push_literal(BLOCK_OPEN),
                statement,
                self.push_literal(BLOCK_CLOSE),
            ]);
            let alternate = b.block([
                self.push_literal(BLOCK_OPEN_ELSE),
                self.push_literal(BLOCK_CLOSE),
            ]);
            template.push(Piece::Statement(b.if_(test, consequent, Some(alternate))));
        } else {
            template.push(Piece::Statement(statement));
            if !standalone {
                template.push(Piece::Text(EMPTY_COMMENT.into()));
            }
        }
        Ok(())
    }
}
