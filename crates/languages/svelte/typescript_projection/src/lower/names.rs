//! Names for generated code that the component's own names leave free.

use super::{Builder, Node, NodeIdentifier};

impl Builder<'_> {
    /// Whether the component binds `name`, a type included.
    pub(super) fn declares(&self, name: &str) -> bool {
        (self.resolution)()
            .is_some_and(|resolution| resolution.scoping().symbol_names().any(|n| n == name))
    }

    /// A name for generated code that no binding or reference of the component uses.
    pub(super) fn unused_name(&mut self, prefix: &'static str) -> NodeIdentifier {
        self.unused_name_from(prefix, 0)
    }

    /// [`Self::unused_name`] with an index of at least `from`, so names generated into one
    /// scope differ.
    pub(super) fn unused_name_from(&mut self, prefix: &'static str, from: u32) -> NodeIdentifier {
        // Compares in place: a name written out per candidate allocates for each component.
        let is = |n: &str, index: u32| {
            n.strip_prefix(prefix).is_some_and(|rest| {
                (rest == "0" || !rest.starts_with(['0', '+'])) && rest.parse() == Ok(index)
            })
        };
        let taken = |index: u32| {
            (self.resolution)().is_some_and(|resolution| {
                let scoping = resolution.scoping();
                scoping.symbol_names().any(|n| is(n, index))
                    || resolution.unresolved_names().any(|n| is(n, index))
            })
        };
        let mut index = from;
        while taken(index) {
            index += 1;
        }
        let prefix = self.tree.push(Node::Identifier(prefix));
        self.tree.push(Node::GeneratedIdentifier { prefix, index })
    }
}
