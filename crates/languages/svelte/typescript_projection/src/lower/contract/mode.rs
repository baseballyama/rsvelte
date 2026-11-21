//! svelte2tsx's runes mode, which decides the props of a component without `$props()` and which
//! component its default export is.

use oxc_ast::ast::Expression;
use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Part, TemplateNode};

use super::super::awaits::awaits_in_template;
use super::super::{Builder, Node, NodeIdentifier};
use super::Export;

/// A component's mode as svelte2tsx reads it, which is not the compiler's.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum ComponentMode {
    /// `$props()`, a read of `$state`, `$derived` or `$effect`, an `await` outside every
    /// function, or `<svelte:options runes>`.
    Runes,
    Legacy,
}

/// No props, which TypeScript prints as svelte2tsx's `Record<string, never>`. svelte2tsx writes the
/// bare name, so a component's own `type Record` turns its props into `any`; qualifying it is a
/// deliberate divergence (rsvelte#4939, item 171).
const NO_PROPS: &str = "globalThis.Record<string, never>";

impl Builder<'_> {
    /// `props`: whether the instance declares `$props()`; `asynchronous`: whether it awaits at
    /// the top level.
    pub(super) fn component_mode(&self, props: bool, asynchronous: bool) -> ComponentMode {
        let runes = props
            || asynchronous
            || self.runes_option()
            || (self.resolution)().is_some_and(|resolution| {
                resolution
                    .unresolved_names()
                    .any(|name| matches!(name, "$state" | "$derived" | "$effect"))
            })
            || awaits_in_template(&self.component.javascript);
        if runes {
            ComponentMode::Runes
        } else {
            ComponentMode::Legacy
        }
    }

    /// svelte2tsx's props of a component without `$props()`: outside runes mode, each export
    /// is an optional prop; otherwise, or without exports, it takes none.
    pub(super) fn props_without_rune(
        &mut self,
        exports: &[Export],
        mode: ComponentMode,
    ) -> NodeIdentifier {
        match mode {
            ComponentMode::Legacy if !exports.is_empty() => self.export_type(exports, true),
            // svelte2tsx's `__sveltets_2_partial` expands JavaScript's no props.
            ComponentMode::Legacy if self.tree.javascript => {
                self.tree.push(Node::Identifier("{ [x: string]: never }"))
            }
            ComponentMode::Legacy | ComponentMode::Runes => {
                self.tree.push(Node::Identifier(NO_PROPS))
            }
        }
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
