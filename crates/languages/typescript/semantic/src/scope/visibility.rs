//! [`Semantic::lookup`] without walking the scope chain.
//!
//! A preorder walk numbers the scopes, so each scope's subtree is a range of numbers. A binding is
//! visible in its scope's range, and the ranges of the bindings of one name nest or are disjoint.
//! Per name, a sorted list then says, from each number on, which of them is innermost: a lookup is
//! one binary search, whatever the depth.

use rustc_hash::FxHashMap;

use super::{Atom, BindingIdentifier, ScopeIdentifier, Semantic, TypedIndex};

const NONE: u32 = u32::MAX;

#[derive(Debug)]
pub(super) struct Visibility {
    /// Per scope: its number in the preorder walk.
    number: Vec<u32>,
    /// Per name: `(number, binding)`, sorted by number; the binding (or [`NONE`]) holds from that
    /// number to the next entry's.
    by_name: FxHashMap<Atom, Vec<(u32, u32)>>,
}

impl Visibility {
    pub(super) fn new(s: &Semantic) -> Self {
        let count = s.scopes.len();
        // The children of each scope, grouped by parent (`children[start[p]..start[p + 1]]`).
        let mut start = vec![0u32; count + 1];
        for scope in &s.scopes {
            if let Some(parent) = scope.parent {
                start[parent.index() + 1] += 1;
            }
        }
        for i in 1..start.len() {
            start[i] += start[i - 1];
        }
        let mut fill = start.clone();
        let mut children = vec![0u32; start[count] as usize];
        for (identifier, scope) in s.scopes.iter_enumerated() {
            if let Some(parent) = scope.parent {
                children[fill[parent.index()] as usize] = identifier.index() as u32;
                fill[parent.index()] += 1;
            }
        }
        let mut number = vec![0u32; count];
        let mut end = vec![0u32; count];
        let mut next = 0u32;
        let mut walk: Vec<(u32, u32)> = Vec::new();
        for (identifier, scope) in s.scopes.iter_enumerated() {
            if scope.parent.is_some() {
                continue;
            }
            let root = identifier.index() as u32;
            number[root as usize] = next;
            next += 1;
            walk.push((root, start[root as usize]));
            while let Some(&mut (scope, ref mut child)) = walk.last_mut() {
                if *child == start[scope as usize + 1] {
                    end[scope as usize] = next;
                    walk.pop();
                    continue;
                }
                let c = children[*child as usize];
                *child += 1;
                number[c as usize] = next;
                next += 1;
                walk.push((c, start[c as usize]));
            }
        }
        let mut ranges: FxHashMap<Atom, Vec<(u32, u32, u32)>> = FxHashMap::default();
        for (identifier, binding) in s.bindings.iter_enumerated() {
            let (scope, name) = (binding.scope, binding.name);
            // A name declared twice in one scope is the first declaration's.
            if s.names.get(&(scope, name)) != Some(&identifier) {
                continue;
            }
            ranges.entry(name).or_default().push((
                number[scope.index()],
                end[scope.index()],
                identifier.index() as u32,
            ));
        }
        let by_name = ranges
            .into_iter()
            .map(|(name, mut ranges)| {
                ranges.sort_unstable_by_key(|&(from, to, _)| (from, std::cmp::Reverse(to)));
                (name, breakpoints(&ranges))
            })
            .collect();
        Self { number, by_name }
    }

    pub(super) fn lookup(&self, scope: ScopeIdentifier, name: Atom) -> Option<BindingIdentifier> {
        let at = self.number[scope.index()];
        let entries = self.by_name.get(&name)?;
        let i = entries.partition_point(|&(from, _)| from <= at);
        let binding = entries[i.checked_sub(1)?].1;
        (binding != NONE).then(|| BindingIdentifier::new(binding as usize))
    }
}

/// The innermost of nested `ranges` (`(from, to, binding)`, sorted by `from` then widest first)
/// at each number, as `(number, binding)` entries; of entries at one number, the last holds.
fn breakpoints(ranges: &[(u32, u32, u32)]) -> Vec<(u32, u32)> {
    let mut entries = Vec::with_capacity(ranges.len() * 2);
    let mut open: Vec<(u32, u32)> = Vec::new();
    for &(from, to, binding) in ranges {
        close_until(&mut open, &mut entries, from);
        entries.push((from, binding));
        open.push((to, binding));
    }
    close_until(&mut open, &mut entries, u32::MAX);
    // Several entries can share a number; the binary search must land on the last of them.
    entries.dedup_by(|later, earlier| {
        if later.0 == earlier.0 {
            earlier.1 = later.1;
            true
        } else {
            false
        }
    });
    entries
}

/// Closes the ranges of `open` that end by `at`, each giving way to the one around it.
fn close_until(open: &mut Vec<(u32, u32)>, entries: &mut Vec<(u32, u32)>, at: u32) {
    while let Some(&(to, _)) = open.last() {
        if to > at {
            break;
        }
        open.pop();
        entries.push((to, open.last().map_or(NONE, |&(_, b)| b)));
    }
}

#[cfg(test)]
mod tests;
