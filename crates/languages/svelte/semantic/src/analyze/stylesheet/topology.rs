use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use oxc_semantic::SymbolId as BindingIdentifier;
use rsvelte_kernel::index::IndexVector;
use rsvelte_kernel::newtype_index;
use rustc_hash::FxHashMap;

use super::relations::Relations;
use crate::compiler_syntax_tree::{AttributeValue, CompilerNodeIdentifier, Element, NodeKind};

mod build;
mod traversal;
use crate::input::ComponentInput;
use crate::resolve::{BindingKind, Resolution};

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
    rendered: FxHashMap<CompilerNodeIdentifier, Rendered>,
}

/// The snippets a `{@render}` or a component may render, as Svelte links them.
enum Rendered {
    Snippets(Box<[SnippetFlow]>),
    /// Svelte cannot tell which, so it links every snippet of the component.
    Every,
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
            rendered: FxHashMap::default(),
        };
        for (id, node) in tree.nodes.iter_enumerated() {
            if let NodeKind::Snippet(snippet) = &node.kind
                && let Some(binding) = resolution.snippet(id)
            {
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
        for (id, node) in tree.nodes.iter_enumerated() {
            let rendered = match &node.kind {
                NodeKind::Render { expression } => {
                    match rendered(input.javascript.get_expression(*expression)) {
                        Some(Expression::Identifier(callee)) => {
                            topology.resolved_snippet(resolution, resolution.symbol(callee))
                        }
                        _ => Rendered::Every,
                    }
                }
                NodeKind::Element(element) if element.kind.renders_component() => {
                    topology.component_snippets(input, resolution, element)
                }
                _ => continue,
            };
            topology.rendered.insert(id, rendered);
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

impl Topology<'_> {
    /// Svelte's `is_resolved_snippet`: the local snippet `symbol` names, none for a global, an
    /// import or a prop, and every snippet for a name that may hold any of them.
    fn resolved_snippet(
        &self,
        resolution: &Resolution,
        symbol: Option<BindingIdentifier>,
    ) -> Rendered {
        let Some(symbol) = symbol else {
            return Rendered::Snippets(Box::default());
        };
        if let Some(&snippet) = self.snippets.get(&symbol) {
            return Rendered::Snippets(Box::new([snippet]));
        }
        let import = matches!(
            resolution.declaration(symbol),
            AstKind::ImportSpecifier(_)
                | AstKind::ImportDefaultSpecifier(_)
                | AstKind::ImportNamespaceSpecifier(_)
        );
        let prop = matches!(
            resolution.binding(symbol).kind,
            BindingKind::Property | BindingKind::BindableProperty | BindingKind::RestProperty
        );
        if import || prop {
            Rendered::Snippets(Box::default())
        } else {
            Rendered::Every
        }
    }

    /// Svelte's `visit_component`: the snippets its attributes name and the ones it holds, or
    /// every snippet when a spread, a `bind:` or another expression may pass any of them.
    fn component_snippets(
        &self,
        input: &ComponentInput<'_>,
        resolution: &Resolution,
        element: &Element,
    ) -> Rendered {
        let tree = input.compiler_syntax_tree;
        let mut snippets = Vec::new();
        for attribute in tree.attributes(element.attributes) {
            let expression = match attribute.value {
                AttributeValue::Spread(_) | AttributeValue::Bind(_) => return Rendered::Every,
                AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression) => expression,
                _ => continue,
            };
            match input.javascript.get_expression(expression) {
                Expression::Identifier(name) => {
                    match self.resolved_snippet(resolution, resolution.symbol(name)) {
                        Rendered::Snippets(named) => snippets.extend(named),
                        Rendered::Every => return Rendered::Every,
                    }
                }
                expression if expression.is_literal() => {}
                _ => return Rendered::Every,
            }
        }
        snippets.extend(
            tree.children(element.children)
                .iter()
                .filter_map(|child| self.snippet_nodes.get(child).copied()),
        );
        Rendered::Snippets(snippets.into_boxed_slice())
    }
}

/// The callee of `{@render callee(…)}`, or of `{@render callee?.(…)}`.
fn rendered<'e>(e: &'e Expression<'e>) -> Option<&'e Expression<'e>> {
    match e {
        Expression::CallExpression(call) => Some(&call.callee),
        Expression::ChainExpression(chain) => match &chain.expression {
            oxc_ast::ast::ChainElement::CallExpression(call) => Some(&call.callee),
            _ => None,
        },
        _ => None,
    }
}

const _: () = assert!(size_of::<Links>() == 12, "Links must stay 12 bytes");
const _: () = assert!(size_of::<Flow>() == 16, "Flow must stay 16 bytes");
const _: () = assert!(size_of::<Edge>() == 8, "Edge must stay 8 bytes");
