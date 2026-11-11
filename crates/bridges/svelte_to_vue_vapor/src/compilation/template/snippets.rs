use oxc_ast::ast::{Expression, FormalParameter};

use super::{CompilerNodeIdentifier, NodeKind, Parent, R, Span, Template, unsupported, vue};

impl<'t> Template<'_, '_, 't> {
    /// `{#snippet}` as a `$$Snippet` named after its declaration, whose `v-for` names the
    /// parameters.
    pub(super) fn snippet(
        &mut self,
        identifier: CompilerNodeIdentifier,
        parent: Option<vue::CompilerNodeIdentifier>,
        preserve: bool,
        at: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        let tree = self.i.compiler_syntax_tree;
        let NodeKind::Snippet(snippet) = &tree.node(identifier).kind else {
            unreachable!("called on a snippet")
        };
        let symbol = self
            .i
            .resolution
            .snippet(identifier)
            .expect("a snippet name has a symbol");
        let name = self.b.id(&self.snippet_names[&symbol]);
        let parameters = match snippet.parameters {
            Some(parameters) => {
                let parameters = self.i.component.javascript.get_parameters(parameters);
                if parameters.rest.is_some() {
                    return Err(unsupported("a snippet with a rest parameter", at));
                }
                Some(parameters.items.iter().map(|p| self.parameter(p)).collect())
            }
            None => None,
        };
        self.snippet_body(
            name,
            parameters,
            tree.children(snippet.body),
            parent,
            preserve,
            at,
        )
    }

    pub(super) fn snippet_body(
        &mut self,
        name: Expression<'t>,
        parameters: Option<Vec<FormalParameter<'t>>>,
        body: &[CompilerNodeIdentifier],
        parent: Option<vue::CompilerNodeIdentifier>,
        preserve: bool,
        at: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        let properties = vec![
            self.bound("name", at, name, at),
            self.loop_directive(parameters.unwrap_or_default(), self.b.id("undefined"), at),
        ];
        let node = self.template_node("$$Snippet", at, properties, parent);
        let children = self.list(Parent::Block, body, Some(node), preserve, at)?;
        self.vb.set_element_children(node, children);
        Ok(node)
    }
}
