//! svelte2tsx's props of a component outside runes mode, which its exports are.

use oxc_ast::ast::Expression;
use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Part, TemplateNode};

use super::super::{Builder, Node, NodeIdentifier};

impl Builder<'_> {
    /// svelte2tsx's props of a component without `$props()`: outside `runes` mode, each export
    /// is an optional prop; otherwise, or without exports, it takes none.
    pub(super) fn props_without_rune(
        &mut self,
        exports: &[NodeIdentifier],
        runes: bool,
    ) -> NodeIdentifier {
        if exports.is_empty() || runes {
            // A name of the prelude's, which no `Record` of the component's own can shadow.
            return self.tree.push(Node::Identifier("__rsvelte_no_props"));
        }
        let exports = self.tree.list(exports);
        let exports = self.tree.push(Node::TypeLiteral(exports));
        let callee = self.tree.push(Node::Identifier("Partial"));
        let arguments = self.tree.list(&[exports]);
        self.tree.push(Node::TypeArguments { callee, arguments })
    }

    /// svelte2tsx's runes mode of a component without `$props()`: it reads `$state`, `$derived`
    /// or `$effect`, awaits at the top level, or `<svelte:options runes>` says so.
    pub(super) fn runes_mode(&self, asynchronous: bool) -> bool {
        asynchronous
            || self.runes_option()
            || (self.resolution)().is_some_and(|resolution| {
                resolution
                    .unresolved_names()
                    .any(|name| matches!(name, "$state" | "$derived" | "$effect"))
            })
    }

    fn runes_option(&self) -> bool {
        let component = self.component;
        component.children(component.root).iter().any(|&child| {
            let TemplateNode::Element {
                name, attributes, ..
            } = *component.node(child)
            else {
                return false;
            };
            name.text(self.source) == "svelte:options"
                && component.attributes(attributes).iter().any(|attribute| {
                    attribute.name.text(self.source) == "runes"
                        && match attribute.value {
                            AttributeValue::True => true,
                            AttributeValue::Parts(parts) => matches!(
                                component.parts(parts),
                                [Part::Expression { expression, .. }]
                                    if matches!(
                                        self.expression(*expression),
                                        Expression::BooleanLiteral(literal) if literal.value
                                    )
                            ),
                        }
                })
        })
    }
}
