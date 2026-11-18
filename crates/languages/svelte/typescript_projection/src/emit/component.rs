//! What svelte2tsx adds around a component's call for its children.

use rsvelte_kernel::source::positions::Span;

use super::Printer;
use crate::syntax_tree::Node;

impl Printer<'_> {
    /// What svelte2tsx adds around a component's call for its children.
    pub(super) fn component_part(&mut self, node: Node) {
        match node {
            Node::SnippetProperty {
                name,
                parameters,
                body,
            } => {
                self.node(name);
                self.output.push(": ");
                match parameters {
                    Some(parameters) => self.node(parameters),
                    None => self.output.push("()"),
                }
                self.output.push(" => {\n");
                self.indent += 1;
                self.indentation();
                self.output.push("async () => {\n");
                self.body(body);
                self.output.push("};\n");
                self.indentation();
                self.output.push("return __rsvelte_snippet_return;\n");
                self.indent -= 1;
                self.indentation();
                self.output.push("},\n");
            }
            Node::SnippetNames { names, component } => {
                self.output.push("const { ");
                self.separated(names, ", ");
                self.output.push(" } = __rsvelte_component_props(");
                self.node(component);
                self.output.push(");\n");
                // svelte-check drops findings on this declaration, such as an unused snippet.
                for &name in self.tree.children(names) {
                    self.indentation();
                    self.node(name);
                    self.output.push(";\n");
                }
            }
            Node::ImplicitChildren(at) => {
                // svelte2tsx's `children` has no source text, so a finding on it lands where its
                // source map puts the key.
                self.output.atom("children", Span::new(at, at));
                self.output.push(": __rsvelte_children,\n");
            }
            _ => unreachable!("only a component's parts are printed here"),
        }
    }
}
