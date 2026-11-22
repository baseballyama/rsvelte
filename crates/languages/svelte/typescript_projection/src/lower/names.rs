//! Names for generated code that the component's own names leave free.

use rsvelte_svelte_semantic::resolve::Resolution;

use super::{Builder, Node, NodeIdentifier};

/// The start of every generated name, which few of the component's own names have.
const GENERATED: &str = "__rsvelte_";

/// What the component's names say about generated names, read once per component.
#[derive(Debug, Default)]
pub(super) struct Names<'a> {
    /// Each name of the component that a prefix and an index of [`Builder::unused_name_from`]
    /// spell, sorted.
    taken: Vec<(&'a str, u32)>,
    /// Whether the component binds `$$Slots`.
    slots: bool,
}

impl<'a> Names<'a> {
    fn of(resolution: &'a Resolution) -> Self {
        let mut names = Names::default();
        for name in resolution.scoping().symbol_names() {
            names.slots |= name == "$$Slots";
            names.insert(name);
        }
        for name in resolution.unresolved_names() {
            names.insert(name);
        }
        names.taken.sort_unstable();
        names
    }

    fn insert(&mut self, name: &'a str) {
        if !name.starts_with(GENERATED) {
            return;
        }
        let digits = name.trim_end_matches(|c: char| c.is_ascii_digit()).len();
        let (prefix, index) = name.split_at(digits);
        // Only the index a generated name writes takes it: `_01` does not take `_1`.
        if (index == "0" || !index.starts_with('0'))
            && let Ok(index) = index.parse()
        {
            self.taken.push((prefix, index));
        }
    }

    fn takes(&self, prefix: &str, index: u32) -> bool {
        self.taken.binary_search(&(prefix, index)).is_ok()
    }
}

impl<'a> Builder<'a> {
    fn names(&self) -> &Names<'a> {
        self.names
            .get_or_init(|| (self.resolution)().map_or_default(Names::of))
    }

    /// Whether the component binds `$$Slots`, a type included.
    pub(super) fn declares_slots(&self) -> bool {
        self.names().slots
    }

    /// A name for generated code that no binding or reference of the component uses.
    pub(super) fn unused_name(&mut self, prefix: &'static str) -> NodeIdentifier {
        self.unused_name_from(prefix, 0)
    }

    /// [`Self::unused_name`] with an index of at least `from`, so names generated into one
    /// scope differ.
    pub(super) fn unused_name_from(&mut self, prefix: &'static str, from: u32) -> NodeIdentifier {
        debug_assert!(
            prefix.starts_with(GENERATED) && !prefix.ends_with(|c: char| c.is_ascii_digit()),
            "{prefix} is not a generated name's prefix"
        );
        let names = self.names();
        let mut index = from;
        while names.takes(prefix, index) {
            index += 1;
        }
        let prefix = self.tree.push(Node::Identifier(prefix));
        self.tree.push(Node::GeneratedIdentifier { prefix, index })
    }
}

#[cfg(test)]
mod tests;
