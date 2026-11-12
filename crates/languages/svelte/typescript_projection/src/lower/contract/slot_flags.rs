//! svelte2tsx's `$$slots`: a flag for each slot the component declares.

use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Part, TemplateNode};

use super::super::{Builder, Node, Range, Span};
use super::Edit;

impl Builder<'_> {
    /// `let $$slots = __rsvelte_slot_flags<"a" | "b">();` when the component reads `$$slots`,
    /// typed as svelte2tsx's `Record<"a" | "b", boolean>`.
    pub(super) fn slot_flags(&mut self, at: u32) -> Option<Edit> {
        let resolution = (self.resolution)()?;
        if !resolution.unresolved_names().any(|name| name == "$$slots") {
            return None;
        }
        let mut seen: Vec<&str> = Vec::new();
        let mut keys = Vec::new();
        for node in &self.component.nodes {
            let TemplateNode::Element {
                name,
                component: None,
                attributes,
                ..
            } = *node
            else {
                continue;
            };
            if name.text(self.source) != "slot" {
                continue;
            }
            let named = self
                .component
                .attributes(attributes)
                .iter()
                .find(|a| a.name.text(self.source) == "name");
            let key = match named.map(|a| a.value) {
                None => None,
                Some(AttributeValue::Parts(parts)) => match self.component.parts(parts) {
                    [Part::Text(text)] => Some(*text),
                    _ => continue,
                },
                Some(_) => continue,
            };
            let text = key.map_or("default", |text| text.text(self.source));
            if seen.contains(&text) {
                continue;
            }
            seen.push(text);
            keys.push(match key {
                None => self.tree.push(Node::StringLiteral("default")),
                Some(text) => {
                    let text = self.tree.push(Node::Text(text));
                    let parts = self.tree.list(&[text]);
                    self.tree.push(Node::String {
                        parts,
                        template: false,
                    })
                }
            });
        }
        let key = if keys.is_empty() {
            self.tree.push(Node::Identifier("never"))
        } else {
            let parts = self.tree.list(&keys);
            self.tree.push(Node::TypeUnion(parts))
        };
        let callee = self.tree.push(Node::Identifier("__rsvelte_slot_flags"));
        let arguments = self.tree.list(&[key]);
        let callee = self.tree.push(Node::TypeArguments { callee, arguments });
        let value = self.tree.push(Node::Call {
            callee,
            arguments: Range::default(),
        });
        let name = self.tree.push(Node::Identifier("$$slots"));
        Some(Edit {
            span: Span::new(at, at),
            replacement: Some(self.tree.push(Node::Const { name, value })),
        })
    }
}
