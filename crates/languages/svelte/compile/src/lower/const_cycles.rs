//! Upstream `const_tag_cycle`: `{@const}` tags of one fragment that read each other.

use std::collections::hash_map::Entry;

use oxc_ast::ast::IdentifierReference;
use oxc_ast_visit::Visit;
use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::compiler_syntax_tree::{Children, CompilerNodeIdentifier};
use rustc_hash::{FxHashMap, FxHashSet};

use super::paths::bound_names;
use super::special::invalid;
use super::{CompileInput, Diagnostic, NodeKind, Resolution};

/// Upstream raises this only outside runes mode, where it sorts the tags; in runes mode it keeps
/// their order, and a tag that reads a later one throws when it runs.
///
/// # Errors
///
/// The first fragment's cycle, at the tag upstream names first.
pub(super) fn check(input: &CompileInput<'_>, res: &Resolution) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    std::iter::once(tree.root)
        .chain(
            (tree.nodes.iter_enumerated()).flat_map(|(identifier, _)| tree.child_lists(identifier)),
        )
        .try_for_each(|children| check_fragment(input, res, children))
}

fn check_fragment(
    input: &CompileInput<'_>,
    res: &Resolution,
    children: Children,
) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    // Each binding's tag and what the tag reads, in upstream's insertion order.
    let mut tags: Vec<(SymbolId, CompilerNodeIdentifier, usize)> = Vec::new();
    let mut reads: Vec<Vec<SymbolId>> = Vec::new();
    for &child in tree.children(children) {
        let NodeKind::Const { declaration } = tree.node(child).kind else {
            continue;
        };
        let declarator = &input
            .component
            .javascript
            .get_declaration(declaration)
            .declarations[0];
        let mut deps = Reads {
            res,
            seen: FxHashSet::default(),
            order: Vec::new(),
        };
        if let Some(init) = &declarator.init {
            deps.visit_expression(init);
        }
        let index = reads.len();
        reads.push(deps.order);
        bound_names(&declarator.id, false, &mut |binding, _| {
            tags.push((binding.symbol_id(), child, index));
        });
    }
    if tags.is_empty() {
        return Ok(());
    }
    let tag_of: FxHashMap<SymbolId, (CompilerNodeIdentifier, usize)> = (tags.iter())
        .map(|&(symbol, node, index)| (symbol, (node, index)))
        .collect();
    // Upstream's graph: each vertex in the order an edge first names it.
    let mut order: Vec<SymbolId> = Vec::new();
    let mut edges: FxHashMap<SymbolId, Vec<SymbolId>> = FxHashMap::default();
    for &(symbol, _, index) in &tags {
        for &dep in &reads[index] {
            if !tag_of.contains_key(&dep) {
                continue;
            }
            for vertex in [symbol, dep] {
                if let Entry::Vacant(entry) = edges.entry(vertex) {
                    entry.insert(Vec::new());
                    order.push(vertex);
                }
            }
            edges.get_mut(&symbol).expect("inserted above").push(dep);
        }
    }
    let Some(cycle) = first_cycle(&order, &edges) else {
        return Ok(());
    };
    let names: Vec<&str> = (cycle.iter())
        .map(|&symbol| res.scoping().symbol_name(symbol))
        .collect();
    let (node, _) = tag_of[&cycle[0]];
    let message = format!("Cyclical dependency detected: {}", names.join(" → "));
    invalid("const_tag_cycle", &message, tree.node(node).span)
}

/// Upstream `check_graph_for_cycles`: the first cycle a depth-first search meets, as the whole
/// stack it is on and the vertex it returns to.
fn first_cycle(
    order: &[SymbolId],
    edges: &FxHashMap<SymbolId, Vec<SymbolId>>,
) -> Option<Vec<SymbolId>> {
    fn visit(
        v: SymbolId,
        edges: &FxHashMap<SymbolId, Vec<SymbolId>>,
        visited: &mut FxHashSet<SymbolId>,
        stack: &mut Vec<SymbolId>,
    ) -> Option<Vec<SymbolId>> {
        visited.insert(v);
        stack.push(v);
        let mut found = None;
        for &w in &edges[&v] {
            if !visited.contains(&w) {
                let inner = visit(w, edges, visited, stack);
                found = found.or(inner);
            } else if found.is_none() && stack.contains(&w) {
                let mut cycle = stack.clone();
                cycle.push(w);
                found = Some(cycle);
            }
        }
        stack.pop();
        found
    }
    let mut visited = FxHashSet::default();
    let mut stack = Vec::new();
    for &v in order {
        if !visited.contains(&v)
            && let Some(cycle) = visit(v, edges, &mut visited, &mut stack)
        {
            return Some(cycle);
        }
    }
    None
}

/// The bindings an initializer reads, each once, in the order it first reads them.
struct Reads<'r> {
    res: &'r Resolution,
    seen: FxHashSet<SymbolId>,
    order: Vec<SymbolId>,
}

impl<'a> Visit<'a> for Reads<'_> {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        if let Some(symbol) = self.res.symbol(it)
            && self.seen.insert(symbol)
        {
            self.order.push(symbol);
        }
    }
}
