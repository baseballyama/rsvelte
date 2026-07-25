//! Cycle detection in dependency graphs.
//!
//! Used to detect circular dependencies in reactive declarations.
//!
//! Corresponds to Svelte's `2-analyze/utils/check_graph_for_cycles.js`.

use rustc_hash::FxHashMap;
use std::hash::Hash;

/// Check a directed graph for cycles.
///
/// Takes a list of edges (pairs of nodes) and returns the first cycle found,
/// or `None` if no cycles exist.
///
/// # Arguments
///
/// * `edges` - A slice of (source, target) pairs representing directed edges.
///
/// # Returns
///
/// The first cycle found as a vector of nodes, or `None` if acyclic.
///
/// # Implementation Note
///
/// This matches the JavaScript implementation which uses a Set for `on_stack`.
/// JavaScript Sets maintain insertion order, so `[...on_stack, w]` creates an array
/// with all nodes currently on the DFS path (in traversal order) plus the back-edge target.
/// We replicate this by using a Vec for `on_stack` to maintain insertion order.
pub fn check_graph_for_cycles<T>(edges: &[(T, T)]) -> Option<Vec<T>>
where
    T: Clone + Eq + Hash,
{
    // Build adjacency list. The JS original uses a `Map`, whose iteration order
    // decides which cycle is reported, so the roots must be visited in insertion
    // order rather than hash order.
    let mut graph: FxHashMap<T, Vec<T>> = FxHashMap::default();
    let mut roots: Vec<T> = Vec::new();

    for (u, v) in edges {
        for node in [u, v] {
            if !graph.contains_key(node) {
                graph.insert(node.clone(), Vec::new());
                roots.push(node.clone());
            }
        }
        graph.entry(u.clone()).or_default().push(v.clone());
    }

    let mut visited: FxHashMap<T, bool> = FxHashMap::default();
    let mut on_stack: Vec<T> = Vec::new();
    let mut cycles: Vec<Vec<T>> = Vec::new();

    fn visit<T: Clone + Eq + Hash>(
        v: T,
        graph: &FxHashMap<T, Vec<T>>,
        visited: &mut FxHashMap<T, bool>,
        on_stack: &mut Vec<T>,
        cycles: &mut Vec<Vec<T>>,
    ) {
        visited.insert(v.clone(), true);
        on_stack.push(v.clone());

        if let Some(neighbors) = graph.get(&v) {
            for w in neighbors {
                if !visited.contains_key(w) {
                    visit(w.clone(), graph, visited, on_stack, cycles);
                } else if on_stack.contains(w) {
                    // Found a cycle - equivalent to [...on_stack, w]
                    let mut cycle = on_stack.clone();
                    cycle.push(w.clone());
                    cycles.push(cycle);
                }
            }
        }

        on_stack.pop();
    }

    for v in &roots {
        if !visited.contains_key(v) {
            visit(v.clone(), &graph, &mut visited, &mut on_stack, &mut cycles);
        }
    }

    cycles.into_iter().next()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_cycles() {
        let edges = vec![("a", "b"), ("b", "c"), ("c", "d")];
        assert!(check_graph_for_cycles(&edges).is_none());
    }

    #[test]
    fn test_simple_cycle() {
        let edges = vec![("a", "b"), ("b", "c"), ("c", "a")];
        let cycle = check_graph_for_cycles(&edges);
        assert!(cycle.is_some());
        let cycle = cycle.unwrap();
        assert!(cycle.contains(&"a"));
        assert!(cycle.contains(&"b"));
        assert!(cycle.contains(&"c"));
    }

    #[test]
    fn test_self_loop() {
        let edges = vec![("a", "a")];
        let cycle = check_graph_for_cycles(&edges);
        assert!(cycle.is_some());
    }

    #[test]
    fn test_disconnected_with_cycle() {
        let edges = vec![("a", "b"), ("c", "d"), ("d", "c")];
        let cycle = check_graph_for_cycles(&edges);
        assert!(cycle.is_some());
        let cycle = cycle.unwrap();
        assert!(cycle.contains(&"c") || cycle.contains(&"d"));
    }

    /// With two disjoint cycles the JS original reports the one whose node was
    /// inserted first, so the reported path must not depend on hash order.
    #[test]
    fn test_first_inserted_cycle_wins() {
        let edges = vec![("c", "d"), ("d", "c"), ("a", "b"), ("b", "a")];
        assert_eq!(check_graph_for_cycles(&edges), Some(vec!["c", "d", "c"]));

        let edges = vec![("a", "b"), ("b", "a"), ("c", "d"), ("d", "c")];
        assert_eq!(check_graph_for_cycles(&edges), Some(vec!["a", "b", "a"]));
    }

    #[test]
    fn test_empty_graph() {
        let edges: Vec<(&str, &str)> = vec![];
        assert!(check_graph_for_cycles(&edges).is_none());
    }
}
