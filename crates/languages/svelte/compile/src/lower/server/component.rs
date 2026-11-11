use super::super::component::{
    Callee, Entry, Prop, callee, child_snippets, props, props_expression, push_accessors,
    push_binding, push_children,
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
        for prop in props(
            tree.attributes(element.attributes),
            self.source_text,
            self.javascript,
        ) {
            match prop {
                Prop::Accessors(a, get, set) => {
                    let mut rewrite = self.rewrite();
                    let functions = (rewrite.expression(get), rewrite.expression(set));
                    let name = a.name.text(self.source_text);
                    // Upstream declares them first in the fragment, with the snippets.
                    let mut declarations = Vec::new();
                    push_accessors(
                        b,
                        &mut parts,
                        &mut declarations,
                        name,
                        functions,
                        &mut self.names,
                    );
                    self.snippets.append(&mut declarations);
                }
                Prop::Value(a) => {
                    let value = self.attribute_value(a, false, false);
                    let name = a.name.text(self.source_text);
                    parts.push(Entry::Property(b.init(name, value)));
                }
                Prop::Spread(e) => parts.push(Entry::Spread(self.expression(e))),
                Prop::Bind(a, target) => {
                    let value = self.expression(target);
                    let source = self.javascript.get_expression(target);
                    let assignment = self.rewrite().binding_assignment(source, false);
                    let setter = vec![b.stmt(assignment), set_settled(b, false)];
                    let name = a.name.text(self.source_text);
                    push_binding(b, &mut parts, name, value, setter);
                }
            }
        }
        let (mut declarations, snippets) =
            child_snippets(tree, self.javascript, element.children, |snippet| {
                self.snippet_declaration(snippet)
            })?;
        let children = self.fragment_without(element.children, |_| true)?;
        push_children(b, &mut parts, &snippets, children, &["$$renderer"]);
        let props = props_expression(b, parts, Target::Server);
        let callee = callee(tree, self.javascript, self.res, identifier);
        let function = match callee {
            Callee::Static(reference) | Callee::Dynamic(reference) => self.expression(reference),
            Callee::OwnFunction => b.id(self.component_name),
        };
        let statement = b.stmt(b.call(function, [b.id("$$renderer"), props]));
        let dynamic = matches!(callee, Callee::Dynamic(_));
        let statement = if let Callee::Dynamic(reference) = callee {
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
            b.if_(test, consequent, Some(alternate))
        } else {
            statement
        };
        template.push(Piece::Statement(if declarations.is_empty() {
            statement
        } else {
            declarations.push(statement);
            b.block(declarations)
        }));
        if !dynamic && !standalone {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        Ok(())
    }
}
