use rustc_hash::FxHashMap;

use super::super::is_dom;
use super::{Edge, Flow, FlowIdentifier, Rendered, SnippetFlow, Topology};
use crate::compiler_syntax_tree::{
    AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, ElementKind, MetadataTag,
    NodeKind,
};

impl Topology<'_> {
    pub(super) fn selected_content(&mut self, tree: &CompilerSyntaxTree) {
        for (select, element) in tree.elements() {
            if element.name.text(self.source) != "select" {
                continue;
            }
            let descendants: Vec<_> = self.children.transitive(select).collect();
            let mut contents = Vec::new();
            let mut option_children = Vec::new();
            for id in descendants {
                if let NodeKind::Element(element) = &tree.node(id).kind {
                    match element.name.text(self.source) {
                        "selectedcontent" => contents.push(id),
                        "option" => option_children.extend(self.children.direct(id)),
                        _ => {}
                    }
                }
            }
            for content in contents {
                for &child in &option_children {
                    self.relate(child, content);
                }
            }
        }
    }

    pub(super) fn flow(&mut self, element: Option<CompilerNodeIdentifier>) -> FlowIdentifier {
        self.flows.push(Flow {
            element,
            previous: None,
            following: None,
            opaque: false,
        })
    }

    pub(super) fn edge(&mut self, from: FlowIdentifier, target: FlowIdentifier) {
        let next = self.flows[from].previous;
        self.linear &= next.is_none() && self.flows[target].following.is_none() && from != target;
        let edge = self.edges.push(Edge { target, next });
        self.flows[from].previous = Some(edge);
        let next = self.flows[target].following;
        let edge = self.edges.push(Edge { target: from, next });
        self.flows[target].following = Some(edge);
    }

    fn relate(&mut self, child: CompilerNodeIdentifier, parent: CompilerNodeIdentifier) {
        self.parents.add(child, parent);
        self.children.add(parent, child);
        self.links[child].parent.get_or_insert(parent);
        self.links[parent].first.get_or_insert(child);
    }

    fn invoke(
        &mut self,
        snippet: SnippetFlow,
        parent: Option<CompilerNodeIdentifier>,
        before: FlowIdentifier,
    ) -> FlowIdentifier {
        self.edge(snippet.entry, before);
        if let Some(parent) = parent {
            self.parents.general();
            self.children.general();
            for &child in &self.roots[&snippet.node] {
                self.parents.add(child, parent);
                self.children.add(parent, child);
                self.links[child].parent.get_or_insert(parent);
                self.links[parent].first.get_or_insert(child);
            }
        }
        snippet.exit
    }

    pub(super) fn walk(
        &mut self,
        tree: &CompilerSyntaxTree,
        children: Children,
        parent: Option<CompilerNodeIdentifier>,
        before: FlowIdentifier,
    ) -> FlowIdentifier {
        self.walk_nodes(tree, tree.children(children), parent, before)
    }

    fn component(
        &mut self,
        tree: &CompilerSyntaxTree,
        id: CompilerNodeIdentifier,
        children: Children,
        parent: Option<CompilerNodeIdentifier>,
        before: FlowIdentifier,
    ) -> FlowIdentifier {
        let mut groups = FxHashMap::<&str, Vec<CompilerNodeIdentifier>>::default();
        let supplied_snippets = self.rendered_snippets(id);
        for &child in tree.children(children) {
            if self.snippet_nodes.contains_key(&child) {
                continue;
            }
            let name = match &tree.node(child).kind {
                NodeKind::Element(el) => tree
                    .attributes(el.attributes)
                    .iter()
                    .find_map(|a| {
                        if a.name.text(self.source) == "slot"
                            && let AttributeValue::Static(name) = &a.value
                        {
                            return Some(name.as_ref());
                        }
                        None
                    })
                    .unwrap_or(""),
                _ => "",
            };
            groups.entry(name).or_default().push(child);
        }
        let merge = self.flow(None);
        let opaque = self.flow(None);
        self.flows[opaque].opaque = true;
        self.edge(opaque, before);
        self.edge(merge, opaque);
        for snippet in supplied_snippets {
            let end = self.invoke(snippet, parent, before);
            self.edge(merge, end);
        }
        let mut groups: Vec<_> = groups.into_iter().collect();
        groups.sort_by_key(|&(name, _)| name);
        for (_, group) in groups {
            let end = self.walk_nodes(tree, &group, parent, before);
            self.edge(merge, end);
        }
        merge
    }

    fn dom_element(
        &mut self,
        tree: &CompilerSyntaxTree,
        id: CompilerNodeIdentifier,
        element: &crate::compiler_syntax_tree::Element,
        parent: Option<CompilerNodeIdentifier>,
        before: FlowIdentifier,
    ) -> FlowIdentifier {
        let flow = self.flow(Some(id));
        self.edge(flow, before);
        self.links[id].flow = Some(flow);
        if let Some(parent) = parent {
            self.relate(id, parent);
        }
        let root = self.flow(None);
        self.walk(tree, element.children, Some(id), root);
        if element.kind == ElementKind::Metadata(Some(MetadataTag::Element)) {
            let merge = self.flow(None);
            self.edge(merge, flow);
            self.edge(merge, before);
            return merge;
        }
        flow
    }

    fn walk_nodes(
        &mut self,
        tree: &CompilerSyntaxTree,
        children: &[CompilerNodeIdentifier],
        parent: Option<CompilerNodeIdentifier>,
        mut before: FlowIdentifier,
    ) -> FlowIdentifier {
        for &id in children {
            match &tree.node(id).kind {
                NodeKind::Element(element) if is_dom(element) => {
                    before = self.dom_element(tree, id, element, parent, before);
                }
                NodeKind::Element(element) if element.kind.renders_component() => {
                    before = self.component(tree, id, element.children, parent, before);
                }
                NodeKind::Element(element) if element.kind == ElementKind::Slot => {
                    let opaque = self.flow(None);
                    self.flows[opaque].opaque = true;
                    self.edge(opaque, before);
                    let end = self.walk(tree, element.children, parent, before);
                    let merge = self.flow(None);
                    self.edge(merge, end);
                    self.edge(merge, opaque);
                    before = merge;
                }
                NodeKind::Element(element) => {
                    before = self.walk(tree, element.children, parent, before);
                }
                NodeKind::Key { body, .. } => before = self.walk(tree, *body, parent, before),
                NodeKind::Await(block) => {
                    let merge = self.flow(None);
                    for body in [block.pending(), block.then(), block.catch()] {
                        let end = body.map_or(before, |body| self.walk(tree, body, parent, before));
                        self.edge(merge, end);
                    }
                    before = merge;
                }
                NodeKind::If {
                    branches,
                    otherwise,
                } => {
                    let merge = self.flow(None);
                    for branch in tree.branches(*branches) {
                        let end = self.walk(tree, branch.body, parent, before);
                        self.edge(merge, end);
                    }
                    let end =
                        otherwise.map_or(before, |body| self.walk(tree, body, parent, before));
                    self.edge(merge, end);
                    before = merge;
                }
                NodeKind::Each(each) => {
                    let entry = self.flow(None);
                    self.edge(entry, before);
                    let end = self.walk(tree, each.body, parent, entry);
                    self.edge(entry, end);
                    let fallback = each
                        .fallback
                        .map_or(before, |body| self.walk(tree, body, parent, before));
                    before = self.flow(None);
                    self.edge(before, end);
                    self.edge(before, fallback);
                }
                NodeKind::Snippet(_) => {
                    let component_child =
                        tree.node(id)
                            .parent
                            .is_some_and(|parent| match &tree.node(parent).kind {
                                NodeKind::Element(el) => el.kind == ElementKind::Component,
                                _ => false,
                            });
                    if component_child && let Some(snippet) = self.snippet_nodes.get(&id).copied() {
                        let end = self.invoke(snippet, parent, before);
                        let merge = self.flow(None);
                        self.edge(merge, before);
                        self.edge(merge, end);
                        before = merge;
                    }
                }
                NodeKind::Render { .. } => {
                    let every = matches!(self.rendered.get(&id), Some(Rendered::Every));
                    let snippets = self.rendered_snippets(id);
                    if let [snippet] = snippets[..]
                        && !every
                    {
                        before = self.invoke(snippet, parent, before);
                    } else {
                        let opaque = self.flow(None);
                        self.flows[opaque].opaque = true;
                        self.edge(opaque, before);
                        let merge = self.flow(None);
                        self.edge(merge, opaque);
                        for snippet in snippets {
                            let end = self.invoke(snippet, parent, before);
                            self.edge(merge, end);
                        }
                        before = merge;
                    }
                }
                _ => {}
            }
        }
        before
    }
}

/// The elements a snippet's body puts at its top, and the renderers there, whose snippets' top
/// elements are the snippet's too.
pub(super) fn snippet_roots(
    tree: &CompilerSyntaxTree,
    body: Children,
) -> (Vec<CompilerNodeIdentifier>, Vec<CompilerNodeIdentifier>) {
    let mut roots = Vec::new();
    let mut renderers = Vec::new();
    let mut pending = vec![body];
    while let Some(body) = pending.pop() {
        for &child in tree.children(body) {
            match &tree.node(child).kind {
                NodeKind::Element(el) if is_dom(el) => roots.push(child),
                NodeKind::Snippet(_) => {}
                NodeKind::Render { .. } => renderers.push(child),
                NodeKind::Element(el) if el.kind.renders_component() => {
                    renderers.push(child);
                    pending.extend(tree.child_lists(child));
                }
                _ => pending.extend(tree.child_lists(child)),
            }
        }
    }
    (roots, renderers)
}
