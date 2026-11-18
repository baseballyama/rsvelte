//! An `{#each}` block, whose iterable Svelte reads outside the names the block binds.

use oxc_ast::ast::{BindingIdentifier, IdentifierReference};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;
use rsvelte_typescript_tree::{ExpressionIdentifier, PatternIdentifier};

use super::{Builder, Node, NodeIdentifier, Result, source_expression};

impl Builder<'_> {
    /// The block as svelte2tsx writes it: a `for…of` over the iterable, then the fallback.
    pub(super) fn each_block(&mut self, identifier: u32) -> Result<Node> {
        let TemplateNode::Each {
            expression,
            context,
            index,
            key,
            body,
            fallback,
            has_fallback,
            ..
        } = *self.component.node(identifier)
        else {
            unreachable!("the caller matched an each block");
        };
        let start = self.scratch.len();
        let bound = [context, index];
        let iterable = self.expression_source(expression, None);
        let callee = self.tree.push(Node::Identifier("__rsvelte_each"));
        let arguments = self.tree.list(&[iterable]);
        let iterable = self.tree.push(Node::Call { callee, arguments });
        let javascript = &self.component.javascript;
        let index = index.map(|index| javascript.get_pattern(index).span);
        let index = index.map(|at| self.source(at, None));
        // svelte2tsx drops a context's type annotation, and `for…of` takes none.
        let value = context.map(|context| javascript.get_pattern(context).pattern.span());
        let value = value.map(|at| self.source(at, None));
        let binding = self.tree.push(Node::ArrayPattern { index, value });
        if let Some(key) = key {
            let value = source_expression(self.expression(key).span(), None);
            self.scratch.push(self.tree.push(Node::Expression(value)));
        }
        self.append_children(body)?;
        let body = self.finish_list(start);
        let iterable = self.each_iterable(iterable, expression, bound);
        let loop_node = self.tree.push(Node::ForOf {
            binding,
            iterable,
            body,
        });
        self.scratch.push(loop_node);
        if has_fallback {
            let body = self.children(fallback)?;
            self.scratch.push(self.tree.push(Node::Block { body }));
        }
        let body = self.finish_list(start);
        Ok(Node::Block { body })
    }

    /// The loop's iterable. A `for…of` reads its iterable inside its own bindings, so an
    /// `expression` that names one of `bindings` is computed in a constant before the loop.
    fn each_iterable(
        &mut self,
        iterable: NodeIdentifier,
        expression: ExpressionIdentifier,
        bindings: [Option<PatternIdentifier>; 2],
    ) -> NodeIdentifier {
        let javascript = &self.component.javascript;
        let mut names = Names(Vec::new());
        for pattern in bindings.into_iter().flatten() {
            names.visit_binding_pattern(&javascript.get_pattern(pattern).pattern);
        }
        let mut reads = Reads {
            names: &names.0,
            found: false,
        };
        reads.visit_expression(javascript.get_expression(expression));
        if !reads.found {
            return iterable;
        }
        let name = self.unused_name("__rsvelte_iterable");
        let constant = self.tree.push(Node::Const {
            name,
            value: iterable,
        });
        self.scratch.push(constant);
        name
    }
}

/// The names a pattern binds.
struct Names<'a>(Vec<&'a str>);

impl<'a> Visit<'a> for Names<'a> {
    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'a>) {
        self.0.push(it.name.as_str());
    }
}

/// Whether an expression reads one of `names`.
struct Reads<'n, 'a> {
    names: &'n [&'a str],
    found: bool,
}

impl<'a> Visit<'a> for Reads<'_, 'a> {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        self.found |= self.names.contains(&it.name.as_str());
    }
}
