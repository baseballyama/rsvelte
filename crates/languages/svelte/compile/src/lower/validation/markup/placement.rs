//! Upstream `html-tree-validation`: where the HTML parser would repair the tree a template writes.

use rsvelte_svelte_semantic::html_tree::{Rule, SLOTS, entry, rule};

/// The nearest element above the parent with each tag of a [`Rule::Descendant`], which upstream's
/// `is_tag_valid_with_ancestor` asks about while it walks up to a component or snippet.
#[derive(Clone, Copy, Default)]
pub(super) struct Ancestors {
    seen: [Option<Seen>; SLOTS],
}

#[derive(Clone, Copy)]
struct Seen {
    depth: u32,
    /// A block lies between it and the node asking, so upstream only warns.
    crossed_block: bool,
    /// An element its rule is reset by lies between, which allows the descendants again.
    reset: bool,
}

impl Ancestors {
    /// `parent`, at `depth`, becomes an ancestor of the children of `element`, its child.
    pub(super) fn below(mut self, parent: (&str, u32, bool), element: &str) -> Self {
        let (tag, depth, crossed_block) = parent;
        if let Some((slot, Rule::Descendant(..))) = rule(tag) {
            self.seen[slot] = Some(Seen {
                depth,
                crossed_block,
                reset: false,
            });
        }
        for (slot, seen) in self.seen.iter_mut().enumerate() {
            if let Some(seen) = seen
                && entry(slot).1.reset_by(element)
            {
                seen.reset = true;
            }
        }
        self
    }

    pub(super) fn cross_block(mut self) -> Self {
        for seen in self.seen.iter_mut().flatten() {
            seen.crossed_block = true;
        }
        self
    }

    /// Why `child` cannot sit below its nearest forbidding ancestor, unless a block lies between.
    pub(super) fn invalid(&self, child: &str) -> Option<String> {
        let (message, seen) = (self.seen.iter().enumerate())
            .filter_map(|(slot, seen)| Some((entry(slot), (*seen)?)))
            .filter(|(_, seen)| !seen.reset)
            .filter_map(|((tag, rule), seen)| Some((rule.invalid_descendant(child, tag)?, seen)))
            .max_by_key(|(_, seen)| seen.depth)?;
        (!seen.crossed_block).then_some(message)
    }
}
