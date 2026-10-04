use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::index::IndexVector;
use rsvelte_svelte_hir::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};
use rsvelte_typescript::Kind;
use rsvelte_typescript::scope::BindingIdentifier;
use rustc_hash::FxHashMap;

use super::relations::Relations;

mod build;
mod traversal;
use crate::semantic::input::ComponentInput;
use crate::semantic::resolve::Resolution;

newtype_index!(
    pub(super) struct FlowIdentifier;
);
newtype_index!(
    struct EdgeIdentifier;
);

#[derive(Clone, Copy, Default)]
pub(super) struct Links {
    pub parent: Option<CompilerNodeIdentifier>,
    pub first: Option<CompilerNodeIdentifier>,
    flow: Option<FlowIdentifier>,
}

struct Flow {
    element: Option<CompilerNodeIdentifier>,
    previous: Option<EdgeIdentifier>,
    following: Option<EdgeIdentifier>,
    opaque: bool,
}

struct Edge {
    target: FlowIdentifier,
    next: Option<EdgeIdentifier>,
}

#[derive(Clone, Copy)]
struct SnippetFlow {
    node: CompilerNodeIdentifier,
    entry: FlowIdentifier,
    exit: FlowIdentifier,
}

pub(super) struct Topology<'a> {
    pub links: IndexVector<CompilerNodeIdentifier, Links>,
    pub parents: Relations,
    pub children: Relations,
    flows: IndexVector<FlowIdentifier, Flow>,
    edges: IndexVector<EdgeIdentifier, Edge>,
    source: &'a str,
    linear: bool,
    snippets: FxHashMap<BindingIdentifier, SnippetFlow>,
    snippet_nodes: FxHashMap<CompilerNodeIdentifier, SnippetFlow>,
    roots: FxHashMap<CompilerNodeIdentifier, Box<[CompilerNodeIdentifier]>>,
    renders: FxHashMap<CompilerNodeIdentifier, BindingIdentifier>,
}

impl<'a> Topology<'a> {
    pub(super) fn new(input: &ComponentInput<'a>, resolution: &Resolution) -> Self {
        let tree = input.compiler_syntax_tree;
        let mut topology = Self {
            links: IndexVector::from_element_n(Links::default(), tree.nodes.len()),
            parents: Relations::new(tree.nodes.len()),
            children: Relations::new(tree.nodes.len()),
            flows: IndexVector::new(),
            edges: IndexVector::new(),
            source: input.source_text,
            linear: true,
            snippets: FxHashMap::default(),
            snippet_nodes: FxHashMap::default(),
            roots: FxHashMap::default(),
            renders: FxHashMap::default(),
        };
        for (id, node) in tree.nodes.iter_enumerated() {
            match &node.kind {
                NodeKind::Snippet(snippet) => {
                    if let Some(binding) = resolution.sem.binding_of(snippet.name) {
                        let entry = topology.flow(None);
                        let exit = topology.flow(None);
                        let flow = SnippetFlow {
                            node: id,
                            entry,
                            exit,
                        };
                        topology.snippets.insert(binding, flow);
                        topology.snippet_nodes.insert(id, flow);
                        topology.roots.insert(
                            id,
                            build::snippet_roots(tree, snippet.body).into_boxed_slice(),
                        );
                    }
                }
                NodeKind::Render { expression } => {
                    if let Kind::Call { callee, .. } = input.javascript.kind(*expression)
                        && let Some(binding) = resolution.sem.binding_of(callee)
                    {
                        topology.renders.insert(id, binding);
                    }
                }
                _ => {}
            }
        }
        topology.linear &= topology.snippet_nodes.is_empty();
        let mut snippets: Vec<_> = topology.snippet_nodes.values().copied().collect();
        snippets.sort_by_key(|snippet| snippet.node);
        for snippet in snippets {
            let NodeKind::Snippet(node) = &tree.node(snippet.node).kind else {
                unreachable!("a snippet flow owns a snippet")
            };
            let end = topology.walk(tree, node.body, None, snippet.entry);
            topology.edge(snippet.exit, end);
        }
        let root = topology.flow(None);
        topology.walk(tree, tree.root, None, root);
        topology.selected_content(tree);
        topology
    }
}

const _: () = assert!(size_of::<Links>() == 12, "Links must stay 12 bytes");
const _: () = assert!(size_of::<Flow>() == 16, "Flow must stay 16 bytes");
const _: () = assert!(size_of::<Edge>() == 8, "Edge must stay 8 bytes");
