use oxc_ast::ast::Statement;
use oxc_syntax::symbol::SymbolFlags;
use rsvelte_svelte_semantic::compiler_syntax_tree::{ElementKind, Snippet};

use super::super::snippets::{Place, place, render_arguments, render_call, snippet_name};
use super::{CompilerNodeIdentifier, EMPTY_COMMENT, NodeKind, Piece, R, ServerCompilationContext};
use crate::lower::{span_of, unsupported};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `SnippetBlock`: a top-level snippet that reads only module-level names is
    /// declared beside the component; any other in the block that holds it.
    pub(super) fn snippet(&mut self, identifier: CompilerNodeIdentifier) -> R<()> {
        let node = self.compiler_syntax_tree.node(identifier);
        let NodeKind::Snippet(snippet) = &node.kind else {
            unreachable!("a snippet node")
        };
        if self.clashes_with_the_script(identifier) {
            return unsupported(
                "on the server, a snippet in elements named like a `let`, `const` or class of the script",
                span_of(self.javascript.get_expression(snippet.name)),
            );
        }
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

    /// Upstream declares a snippet that only elements hold in the component's function, beside a
    /// `let`, `const` or class of the instance script of its name; that output does not parse.
    fn clashes_with_the_script(&self, identifier: CompilerNodeIdentifier) -> bool {
        let tree = self.compiler_syntax_tree;
        let mut parent = tree.node(identifier).parent;
        if parent.is_none() || !self.instance_script {
            return false;
        }
        while let Some(p) = parent {
            let node = tree.node(p);
            if !matches!(&node.kind, NodeKind::Element(e) if e.kind == ElementKind::Regular) {
                return false;
            }
            parent = node.parent;
        }
        let scoping = self.res.scoping();
        self.res.snippet(identifier).is_some_and(|symbol| {
            let name = scoping.symbol_ident(symbol);
            scoping
                .get_binding(self.res.instance_scope(), name)
                .map(|other| scoping.symbol_flags(other))
                .is_some_and(|flags| {
                    flags.intersects(SymbolFlags::BlockScopedVariable | SymbolFlags::Class)
                        && !flags.contains(SymbolFlags::Ambient)
                })
        })
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
        template.push(Piece::Statement(b.statement(call)));
        if !standalone {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
    }
}
