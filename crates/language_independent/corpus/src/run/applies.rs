//! Which units a compared task runs on.

use std::collections::BTreeMap;

/// What [`super::Conformance::applies_to`] reads of a unit.
#[derive(Debug, Clone, Copy)]
pub struct Unit<'a> {
    /// The first attribute of its `inputs.pack` entry.
    pub language: &'a str,
    /// Its path within its source.
    pub path: &'a str,
}

/// Whether a task runs on a unit.
pub type Applies = fn(Unit<'_>) -> bool;

/// The tasks of each unit, as an index into one list per distinct answer of the predicates: a
/// task runs on a unit unless a predicate for it rejects the unit.
pub(super) fn tasks_per_unit<'t>(
    tasks: &[&'t str],
    applies: &[(&'static str, Applies)],
    units: &[Unit<'_>],
) -> (Vec<Vec<&'t str>>, Vec<usize>) {
    let mut lists = Vec::new();
    let mut seen: BTreeMap<Vec<bool>, usize> = BTreeMap::new();
    let list_of = (units.iter())
        .map(|&unit| {
            let answer: Vec<bool> = applies.iter().map(|(_, a)| a(unit)).collect();
            *seen.entry(answer).or_insert_with_key(|answer| {
                lists.push(
                    (tasks.iter().copied())
                        .filter(|task| {
                            applies
                                .iter()
                                .zip(answer)
                                .all(|((t, _), &yes)| t != task || yes)
                        })
                        .collect(),
                );
                lists.len() - 1
            })
        })
        .collect();
    (lists, list_of)
}

#[cfg(test)]
mod tests;
