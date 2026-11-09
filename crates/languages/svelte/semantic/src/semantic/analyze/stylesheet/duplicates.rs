use rsvelte_stylesheet::syntax_tree::{ComplexSelector, RuleIdentifier};
use rustc_hash::FxHashMap;

/// The marks one selector's matching made, as offsets from its first selector and relative ids.
struct Marks {
    selector: u32,
    relative: u32,
    used: Vec<u32>,
    scoped: Vec<u32>,
}

/// Matches each distinct selector once: a selector with the same source text under the same
/// parent rule parses to the same shape, selects the same elements and numbers its parts in the
/// same order, so it takes the first one's marks shifted to its own ids.
#[derive(Default)]
pub(super) struct Duplicates<'a> {
    seen: FxHashMap<(Option<RuleIdentifier>, &'a str), Marks>,
}

impl<'a> Duplicates<'a> {
    /// Calls `run` with sinks for the used selector ids and scoped relative ids it finds, unless
    /// an identical selector ran before.
    pub(super) fn match_once(
        &mut self,
        selector: &ComplexSelector,
        source: &'a str,
        used: &mut [bool],
        scoped: &mut [bool],
        run: impl FnOnce(&mut dyn FnMut(u32), &mut dyn FnMut(u32)),
    ) {
        let relative = selector
            .parts
            .first()
            .expect("a complex selector has a compound");
        let key = (relative.parent_rule, selector.span.text(source));
        if let Some(marks) = self.seen.get(&key) {
            for &offset in &marks.used {
                used[(selector.id + offset) as usize] = true;
            }
            for &offset in &marks.scoped {
                scoped[(relative.id + offset) as usize] = true;
            }
            return;
        }
        let mut marks = Marks {
            selector: selector.id,
            relative: relative.id,
            used: Vec::new(),
            scoped: Vec::new(),
        };
        run(
            &mut |id| {
                used[id as usize] = true;
                marks.used.push(id - marks.selector);
            },
            &mut |id| {
                scoped[id as usize] = true;
                marks.scoped.push(id - marks.relative);
            },
        );
        marks.used.sort_unstable();
        marks.used.dedup();
        marks.scoped.sort_unstable();
        marks.scoped.dedup();
        self.seen.insert(key, marks);
    }
}

#[cfg(test)]
mod tests;
