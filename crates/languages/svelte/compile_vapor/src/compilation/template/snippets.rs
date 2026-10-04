use rsvelte_svelte::compilation::compiler_syntax_tree::Snippet;

use super::{
    Builder, CompilerNodeIdentifier, DirectiveExpression, DirectiveName, Kind, LoopExpression,
    NodeIdentifier, Parent, R, Span, bound, directive, spelled, unsupported, vue,
};

impl Builder<'_, '_> {
    pub(super) fn snippet(
        &mut self,
        snippet: &Snippet,
        parent: Option<vue::CompilerNodeIdentifier>,
        preserve: bool,
        at: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        let name = self.template_expression(snippet.name);
        let mut parameters = Vec::new();
        for &parameter in self
            .i
            .compiler_syntax_tree
            .javascript_list(snippet.parameters)
        {
            if !matches!(
                self.i.javascript.kind(parameter),
                Kind::Identifier(_)
                    | Kind::ObjectPattern(_)
                    | Kind::ArrayPattern(_)
                    | Kind::AssignPattern(..)
            ) {
                return Err(unsupported("a snippet with a rest parameter", at));
            }
            parameters.push(self.template_expression(parameter));
        }
        self.snippet_body(
            name,
            parameters,
            self.i.compiler_syntax_tree.children(snippet.body),
            parent,
            preserve,
            at,
        )
    }

    pub(super) fn snippet_body(
        &mut self,
        name: NodeIdentifier,
        parameters: Vec<NodeIdentifier>,
        body: &[CompilerNodeIdentifier],
        parent: Option<vue::CompilerNodeIdentifier>,
        preserve: bool,
        at: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        let source = self.to.identifier("undefined");
        let props = self.vb.props([
            bound("name", at, name, at),
            directive(
                DirectiveName::For,
                None,
                DirectiveExpression::For(LoopExpression { parameters, source }),
                at,
            ),
        ]);
        let element = vue::Element {
            tag: spelled("$$Snippet", at),
            tag_type: vue::TagType::Template,
            props,
            children: vue::Children::default(),
        };
        let node = self.vb.node(vue::NodeKind::Element(element), at, parent, 0);
        let children = self.list(Parent::Block, body, Some(node), preserve, at)?;
        self.vb.set_element_children(node, children);
        Ok(node)
    }
}
