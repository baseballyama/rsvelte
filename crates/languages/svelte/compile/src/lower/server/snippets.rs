use oxc_ast::ast::Statement;
use rsvelte_svelte_semantic::compiler_syntax_tree::Snippet;

use super::super::snippets::{Place, place, render_arguments, render_call, snippet_name};
use super::{CompilerNodeIdentifier, EMPTY_COMMENT, NodeKind, Piece, R, ServerCompilationContext};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `SnippetBlock`: a top-level snippet that reads only module-level names is
    /// declared beside the component; any other in the block that holds it.
    pub(super) fn snippet(&mut self, identifier: CompilerNodeIdentifier) -> R<()> {
        let node = self.compiler_syntax_tree.node(identifier);
        let NodeKind::Snippet(snippet) = &node.kind else {
            unreachable!("a snippet node")
        };
        let declaration = self.snippet_declaration(snippet)?;
        let place = place(
            self.compiler_syntax_tree,
            self.res,
            self.hoistable,
            identifier,
        );
        if place == Place::Module {
            self.hoisted_snippets.push(declaration);
        } else {
            self.snippets.push(declaration);
        }
        Ok(())
    }

    pub(super) fn snippet_name(&self, snippet: &Snippet) -> &'o str {
        snippet_name(self.javascript, snippet)
    }

    /// `function name($$renderer, …) {…}`.
    pub(super) fn snippet_declaration(&mut self, snippet: &Snippet) -> R<Statement<'o>> {
        let b = self.b;
        let body = self.fragment(snippet.body)?;
        let mut parameters = vec![b.parameter(b.binding("$$renderer"))];
        if let Some(list) = snippet.parameters {
            parameters.extend(self.parameters(list));
        }
        Ok(b.function_declaration(
            self.snippet_name(snippet),
            b.formal_parameters(parameters),
            body,
            false,
        ))
    }

    /// Upstream `RenderTag`; a `standalone` tag is its fragment's only node, so it needs no
    /// comment to end it.
    pub(super) fn render_tag(
        &self,
        identifier: CompilerNodeIdentifier,
        standalone: bool,
        template: &mut Vec<Piece<'o>>,
    ) {
        let b = self.b;
        let NodeKind::Render { expression } = self.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!("a render tag")
        };
        let (call, optional) = render_call(self.javascript.get_expression(expression));
        let callee = self
            .rewrite()
            .expression(call.callee.get_inner_expression());
        let mut arguments = vec![b.id("$$renderer")];
        arguments
            .extend(render_arguments(call).map(|argument| self.rewrite().expression(argument)));
        let call = if optional {
            b.optional_call(callee, arguments)
        } else {
            b.call(callee, arguments)
        };
        template.push(Piece::Statement(b.stmt(call)));
        if !standalone {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
    }
}
