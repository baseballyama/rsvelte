mod parameters;

use oxc_ast::ast::Statement;
pub(super) use parameters::Hooks;
use rsvelte_svelte_semantic::compiler_syntax_tree::Snippet;

use super::super::derived::{Created, callback};
use super::super::snippets::{
    Place, is_dynamic_render, place, render_arguments, render_call, snippet_name,
};
use super::{ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeKind, R};
use crate::lower::builder::Runtime;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `SnippetBlock`: a top-level snippet is declared beside the component, so that the
    /// script can read it; any other in the block that holds it.
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
        match place {
            Place::Block => self.snippets.push(declaration),
            Place::Module => self.module_snippets.push(declaration),
            Place::Instance => self.instance_snippets.push(declaration),
        }
        Ok(())
    }

    pub(super) fn snippet_name(&self, snippet: &Snippet) -> &'o str {
        snippet_name(self.javascript, snippet)
    }

    /// `const name = ($$anchor, …) => {…}`.
    pub(super) fn snippet_declaration(&mut self, snippet: &Snippet) -> R<Statement<'o>> {
        let b = self.b;
        let saved_scope = self.scope;
        let parameters = self.snippet_parameters(snippet);
        let body = self.fragment(snippet.body);
        self.scope = saved_scope;
        for (symbol, read) in parameters.saved_reads {
            if let Some(read) = read {
                self.reads.insert(symbol, read);
            } else {
                self.reads.remove(&symbol);
            }
        }
        let mut declarations = parameters.declarations;
        declarations.extend(body?);
        let callback = b.arrow_block(
            b.formal_parameters(parameters.arguments),
            declarations,
            false,
        );
        Ok(b.const_(self.snippet_name(snippet), callback))
    }

    /// Upstream `RenderTag`: a snippet that may change is read through `$.snippet`.
    pub(super) fn render_tag(
        &self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) {
        let b = self.b;
        let NodeKind::Render { expression } = self.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!("a render tag")
        };
        frag.tpl.push_comment();
        let (call, optional) = render_call(self.javascript.get_expression(expression));
        // Upstream memoizes an argument that calls a function, so each read does not call it.
        let mut statements = Vec::new();
        let metadata = self.an.render_arguments(expression);
        let mut arguments = Vec::with_capacity(call.arguments.len());
        for (index, argument) in render_arguments(call).enumerate() {
            let value = self.rewrite(argument, true);
            let value = if metadata[index].has_call {
                let name = format!("${}", statements.len());
                let value = callback(b, self.res, Some(argument), value, Created::Template);
                statements.push(b.let_(&name, Some(b.runtime("derived", [value]))));
                b.runtime("get", [b.id(&name)])
            } else {
                value
            };
            arguments.push(b.thunk(value));
        }
        let callee = self.rewrite(call.callee.get_inner_expression(), true);
        let anchor = b.id(node);
        let call = if is_dynamic_render(self.res, call) {
            let callee = if optional {
                b.logical(
                    callee,
                    oxc_ast::ast::LogicalOperator::Coalesce,
                    b.member(b.id("$"), "noop"),
                )
            } else {
                callee
            };
            let mut list = vec![anchor, b.thunk(callee)];
            list.extend(arguments);
            b.runtime("snippet", list)
        } else {
            let list: Vec<_> = std::iter::once(anchor).chain(arguments).collect();
            if optional {
                b.optional_call(callee, list)
            } else {
                b.call(callee, list)
            }
        };
        statements.push(b.stmt(call));
        lists.initializer.push(if statements.len() == 1 {
            statements.pop().expect("one statement")
        } else {
            b.block(statements)
        });
    }
}
