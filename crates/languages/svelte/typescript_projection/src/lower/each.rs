//! An `{#each}` block's iterable, which Svelte reads outside the names the block binds.

use oxc_ast::ast::{BindingIdentifier, IdentifierReference};
use oxc_ast_visit::Visit;
use rsvelte_typescript_tree::{ExpressionIdentifier, PatternIdentifier};

use super::{Builder, Node, NodeIdentifier};

impl Builder<'_> {
    /// The loop's iterable. A `for…of` reads its iterable inside its own bindings, so an
    /// `expression` that names one of `bindings` is computed in a constant before the loop.
    pub(super) fn each_iterable(
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
