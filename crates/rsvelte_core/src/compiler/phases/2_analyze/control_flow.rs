//! Control flow analysis for CSS sibling combinator detection.
//!
//! This module analyzes template fragments to determine possible sibling relationships
//! between elements, taking into account control flow (if/each/await blocks).
//!
//! The algorithm is a faithful port of Svelte's `get_possible_element_siblings()` in css-prune.js.

use super::types::{DomStructure, SiblingCertainty};
use crate::ast::template::{Attribute, Fragment, TemplateNode};
use crate::compiler::phases::phase3_transform::shared::json_field::Field;
use rustc_hash::FxHashMap;

pub fn stylesheet_has_sibling_combinator(stylesheet: &crate::ast::css::StyleSheet) -> bool {
    let mut pending: Vec<&serde_json::Value> = stylesheet.children.iter().collect();
    while let Some(value) = pending.pop() {
        match value {
            serde_json::Value::Object(object) => {
                if object.field("type").and_then(serde_json::Value::as_str) == Some("Combinator")
                    && object
                        .field("name")
                        .and_then(serde_json::Value::as_str)
                        .is_some_and(|name| matches!(name, "+" | "~"))
                {
                    return true;
                }
                pending.extend(object.values());
            }
            serde_json::Value::Array(values) => pending.extend(values),
            _ => {}
        }
    }
    false
}

pub fn supports_static_sibling_relationships(fragment: &Fragment) -> bool {
    let mut pending = vec![fragment];
    while let Some(fragment) = pending.pop() {
        for node in &fragment.nodes {
            match node {
                TemplateNode::RegularElement(element) => pending.push(&element.fragment),
                TemplateNode::Text(_)
                | TemplateNode::Comment(_)
                | TemplateNode::ExpressionTag(_)
                | TemplateNode::ConstTag(_)
                | TemplateNode::DebugTag(_) => {}
                _ => return false,
            }
        }
    }
    true
}

/// State carried through one sibling walk.
struct Walk<'a> {
    node_to_dom_idx: &'a FxHashMap<NodePtr, usize>,
    snippets: &'a SnippetSites<'a>,
    /// Snippets already left through their render sites, so a snippet rendered
    /// from inside itself terminates.
    seen: rustc_hash::FxHashSet<NodePtr>,
    /// Snippets already descended into for edge elements. Upstream keeps this set
    /// separate: it is shared down a `loop_child` chain but starts empty at each
    /// nested-sibling call made from the element walk.
    nested_seen: rustc_hash::FxHashSet<NodePtr>,
    /// Set when the walk stopped at something it cannot enumerate — a snippet
    /// whose render sites did not resolve, or a render tag naming no known
    /// snippet. The result is then a subset of the real siblings.
    incomplete: bool,
}

/// Node existence values, mirroring Svelte's NODE_DEFINITELY_EXISTS / NODE_PROBABLY_EXISTS.
const NODE_DEFINITELY_EXISTS: u8 = 1;
const NODE_PROBABLY_EXISTS: u8 = 2;

/// Direction for sibling search.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Direction {
    Forward,
    Backward,
}

/// A unique identifier for a TemplateNode, based on its memory address.
type NodePtr = usize;

fn node_ptr(node: &TemplateNode) -> NodePtr {
    node as *const TemplateNode as usize
}

/// The snippet a `{@render name(...)}` renders, when the callee is a plain name.
fn render_tag_callee_name(render_tag: &crate::ast::template::RenderTag) -> Option<String> {
    let expr = render_tag.expression.as_json();
    let expr = if expr.field("type").and_then(|t| t.as_str()) == Some("ChainExpression") {
        expr.field("expression").unwrap_or(expr)
    } else {
        expr
    };
    let callee = expr.field("callee")?;
    if callee.field("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return None;
    }
    callee
        .field("name")
        .and_then(|n| n.as_str())
        .map(String::from)
}

/// Build sibling relationships for all elements in the DOM structure.
///
/// This function implements the same algorithm as the official Svelte compiler's
/// `get_possible_element_siblings()` and `apply_combinator()` in css-prune.js.
pub fn build_sibling_relationships(dom_structure: &mut DomStructure, root_fragment: &Fragment) {
    // First pass: build a mapping from TemplateNode pointer to dom_idx.
    // Also collect the path (chain of fragments/indices) for each element.
    let mut node_to_dom_idx: FxHashMap<NodePtr, usize> = FxHashMap::default();
    let mut element_paths: FxHashMap<usize, Vec<PathEntry>> = FxHashMap::default();
    let mut dom_idx_counter: usize = 0;

    let mut snippets = SnippetSites::default();
    collect_elements_and_paths(
        root_fragment,
        &mut node_to_dom_idx,
        &mut element_paths,
        &mut dom_idx_counter,
        vec![],
        &mut snippets,
    );
    snippets.resolve();

    // Second pass: for each element, compute possible siblings using AST walk.
    let num_elements = dom_structure.elements.len();
    for dom_idx in 0..num_elements {
        if let Some(path) = element_paths.get(&dom_idx) {
            let mut incomplete = false;
            let mut run = |direction, adjacent_only| {
                let mut walk = Walk {
                    node_to_dom_idx: &node_to_dom_idx,
                    snippets: &snippets,
                    seen: rustc_hash::FxHashSet::default(),
                    nested_seen: rustc_hash::FxHashSet::default(),
                    incomplete: false,
                };
                let map = get_possible_element_siblings(path, direction, adjacent_only, &mut walk);
                incomplete |= walk.incomplete;
                map
            };
            let prev_adj = run(Direction::Backward, true);
            let prev_gen = run(Direction::Backward, false);
            let next_adj = run(Direction::Forward, true);
            let next_gen = run(Direction::Forward, false);

            // Convert results to the DomStructure format
            dom_structure.elements[dom_idx].possible_prev_adjacent = convert_results(&prev_adj);
            dom_structure.elements[dom_idx].possible_prev_general = convert_results(&prev_gen);
            dom_structure.elements[dom_idx].possible_next_adjacent = convert_results(&next_adj);
            dom_structure.elements[dom_idx].possible_next_general = convert_results(&next_gen);
            dom_structure.elements[dom_idx].sibling_walk_incomplete = incomplete;
        }
    }

    // Third pass: mark elements that are adjacent to opaque boundaries
    // (slots, render tags, components). This is used for :global(X) + Y detection.
    mark_opaque_boundary_adjacency(dom_structure, root_fragment, &node_to_dom_idx);
}

pub fn build_static_sibling_relationships(dom_structure: &mut DomStructure) {
    let mut previous_by_parent: FxHashMap<Option<usize>, usize> = FxHashMap::default();
    for current_idx in 0..dom_structure.elements.len() {
        let parent_idx = dom_structure.elements[current_idx].parent_idx;
        if let Some(previous_idx) = previous_by_parent.insert(parent_idx, current_idx) {
            dom_structure.elements[current_idx]
                .possible_prev_adjacent
                .push((previous_idx, SiblingCertainty::Definite));
            dom_structure.elements[current_idx]
                .possible_prev_general
                .push((previous_idx, SiblingCertainty::Definite));
            dom_structure.elements[previous_idx]
                .possible_next_adjacent
                .push((current_idx, SiblingCertainty::Definite));
            dom_structure.elements[previous_idx]
                .possible_next_general
                .push((current_idx, SiblingCertainty::Definite));
        }
    }
    dom_structure.general_siblings_linked = true;
}

/// Convert results map to Vec of (dom_idx, certainty) pairs.
fn convert_results(results: &FxHashMap<usize, u8>) -> Vec<(usize, SiblingCertainty)> {
    results
        .iter()
        .map(|(&dom_idx, &existence)| {
            let certainty = if existence == NODE_DEFINITELY_EXISTS {
                SiblingCertainty::Definite
            } else {
                SiblingCertainty::Probable
            };
            (dom_idx, certainty)
        })
        .collect()
}

/// An entry in the element's path from root to the element.
/// Each entry records the fragment and the index of the node within that fragment.
#[derive(Clone)]
struct PathEntry<'a> {
    /// The fragment containing the node
    fragment: &'a Fragment<'a>,
    /// The index of the node within the fragment
    index: usize,
}

/// Where a `{#snippet}` body is rendered from, so the sibling walk can leave it the
/// way upstream does — through `SnippetBlock.metadata.sites` — instead of stopping.
#[derive(Default)]
struct SnippetSites<'a> {
    /// Declared snippets, by name.
    decls: FxHashMap<String, &'a TemplateNode<'a>>,
    /// `{@render name(...)}` call sites and the path each one sits at.
    calls: Vec<(String, Vec<PathEntry<'a>>)>,
    /// Resolved: snippet node -> the paths it is rendered at.
    sites: FxHashMap<NodePtr, Vec<Vec<PathEntry<'a>>>>,
    /// Resolved: render-tag node -> the snippet nodes it renders.
    rendered: FxHashMap<NodePtr, Vec<&'a TemplateNode<'a>>>,
}

impl<'a> SnippetSites<'a> {
    fn resolve(&mut self) {
        for (name, path) in std::mem::take(&mut self.calls) {
            let Some(&snippet) = self.decls.get(&name) else {
                continue;
            };
            if let Some(last) = path.last() {
                let render_tag = &last.fragment.nodes[last.index];
                self.rendered
                    .entry(node_ptr(render_tag))
                    .or_default()
                    .push(snippet);
            }
            self.sites.entry(node_ptr(snippet)).or_default().push(path);
        }
    }
}

/// Collect elements and their paths from the template AST.
fn collect_elements_and_paths<'a>(
    fragment: &'a Fragment<'a>,
    node_to_dom_idx: &mut FxHashMap<NodePtr, usize>,
    element_paths: &mut FxHashMap<usize, Vec<PathEntry<'a>>>,
    dom_idx_counter: &mut usize,
    current_path: Vec<PathEntry<'a>>,
    snippets: &mut SnippetSites<'a>,
) {
    for (i, node) in fragment.nodes.iter().enumerate() {
        let mut node_path = current_path.clone();
        node_path.push(PathEntry { fragment, index: i });

        match node {
            TemplateNode::RenderTag(render_tag) => {
                if let Some(name) = render_tag_callee_name(render_tag) {
                    snippets.calls.push((name, node_path.clone()));
                }
            }
            TemplateNode::RegularElement(element) => {
                let dom_idx = *dom_idx_counter;
                *dom_idx_counter += 1;
                node_to_dom_idx.insert(node_ptr(node), dom_idx);
                element_paths.insert(dom_idx, node_path.clone());

                // Recurse into children
                collect_elements_and_paths(
                    &element.fragment,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path,
                    snippets,
                );
            }
            TemplateNode::SvelteElement(element) => {
                let dom_idx = *dom_idx_counter;
                *dom_idx_counter += 1;
                node_to_dom_idx.insert(node_ptr(node), dom_idx);
                element_paths.insert(dom_idx, node_path.clone());

                // Recurse into children
                collect_elements_and_paths(
                    &element.fragment,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path,
                    snippets,
                );
            }
            TemplateNode::IfBlock(block) => {
                collect_elements_and_paths(
                    &block.consequent,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path.clone(),
                    snippets,
                );
                if let Some(ref alt) = block.alternate {
                    collect_elements_and_paths(
                        alt,
                        node_to_dom_idx,
                        element_paths,
                        dom_idx_counter,
                        node_path,
                        snippets,
                    );
                }
            }
            TemplateNode::EachBlock(block) => {
                collect_elements_and_paths(
                    &block.body,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path.clone(),
                    snippets,
                );
                if let Some(ref fallback) = block.fallback {
                    collect_elements_and_paths(
                        fallback,
                        node_to_dom_idx,
                        element_paths,
                        dom_idx_counter,
                        node_path,
                        snippets,
                    );
                }
            }
            TemplateNode::AwaitBlock(block) => {
                if let Some(ref pending) = block.pending {
                    collect_elements_and_paths(
                        pending,
                        node_to_dom_idx,
                        element_paths,
                        dom_idx_counter,
                        node_path.clone(),
                        snippets,
                    );
                }
                if let Some(ref then) = block.then {
                    collect_elements_and_paths(
                        then,
                        node_to_dom_idx,
                        element_paths,
                        dom_idx_counter,
                        node_path.clone(),
                        snippets,
                    );
                }
                if let Some(ref catch) = block.catch {
                    collect_elements_and_paths(
                        catch,
                        node_to_dom_idx,
                        element_paths,
                        dom_idx_counter,
                        node_path,
                        snippets,
                    );
                }
            }
            TemplateNode::KeyBlock(block) => {
                collect_elements_and_paths(
                    &block.fragment,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path,
                    snippets,
                );
            }
            TemplateNode::SlotElement(slot) => {
                collect_elements_and_paths(
                    &slot.fragment,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path,
                    snippets,
                );
            }
            TemplateNode::SnippetBlock(snippet) => {
                if let Some(name) = snippet.expression.identifier_name() {
                    snippets.decls.insert(name.to_string(), node);
                }
                collect_elements_and_paths(
                    &snippet.body,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path,
                    snippets,
                );
            }
            TemplateNode::Component(comp) => {
                collect_elements_and_paths(
                    &comp.fragment,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path,
                    snippets,
                );
            }
            TemplateNode::SvelteComponent(comp) => {
                collect_elements_and_paths(
                    &comp.fragment,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path,
                    snippets,
                );
            }
            // Wrapper elements the analysis visitor descends into when assigning
            // `dom_idx`; skipping them here desyncs the two counters and shifts
            // every later element's sibling data.
            TemplateNode::SvelteSelf(elem)
            | TemplateNode::SvelteHead(elem)
            | TemplateNode::SvelteFragment(elem)
            | TemplateNode::SvelteBoundary(elem)
            | TemplateNode::SvelteBody(elem)
            | TemplateNode::SvelteWindow(elem)
            | TemplateNode::SvelteDocument(elem) => {
                collect_elements_and_paths(
                    &elem.fragment,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path,
                    snippets,
                );
            }
            TemplateNode::TitleElement(title) => {
                collect_elements_and_paths(
                    &title.fragment,
                    node_to_dom_idx,
                    element_paths,
                    dom_idx_counter,
                    node_path,
                    snippets,
                );
            }
            _ => {
                // Text, comments, expression tags
            }
        }
    }
}

/// Port of Svelte's `get_possible_element_siblings()`.
///
/// Walks up from an element through its parent fragments to find possible sibling elements.
fn get_possible_element_siblings(
    path: &[PathEntry],
    direction: Direction,
    adjacent_only: bool,
    walk: &mut Walk,
) -> FxHashMap<usize, u8> {
    let mut result: FxHashMap<usize, u8> = FxHashMap::default();

    // The path is: [root_fragment_entry, ..., parent_fragment_entry, element_entry]
    // We walk backwards from the element entry, looking at siblings in each fragment.
    //
    // In the official compiler, the path is interleaved: [parent_node, fragment, parent_node, fragment, ...]
    // where path[i] is a fragment and path[i-1] is the parent node of that fragment.
    //
    // In our path, each entry has (fragment, index). The node at fragment.nodes[index] is either
    // the element itself or a block that contains the element's sub-path.
    //
    // Walking up: path[last] is the element in its immediate fragment.
    // path[last-1] is the block node in its parent fragment that contains the immediate fragment.
    // path[last-2] is the block node (or root) in its grandparent fragment, etc.

    let mut i = path.len();

    while i > 0 {
        i -= 1;
        let entry = &path[i];
        let fragment = entry.fragment;
        let node_index = entry.index;

        // Look at siblings in this fragment
        let range: Box<dyn Iterator<Item = usize>> = if direction == Direction::Forward {
            Box::new((node_index + 1)..fragment.nodes.len())
        } else {
            Box::new((0..node_index).rev())
        };

        for j in range {
            let sibling = &fragment.nodes[j];

            match sibling {
                TemplateNode::RegularElement(el) => {
                    // Skip elements with slot attribute
                    let has_slot_attr = el.attributes.iter().any(|attr| {
                        if let Attribute::Attribute(a) = attr {
                            a.name.eq_ignore_ascii_case("slot")
                        } else {
                            false
                        }
                    });

                    if !has_slot_attr
                        && let Some(&dom_idx) = walk.node_to_dom_idx.get(&node_ptr(sibling))
                    {
                        add_to_map_entry(&mut result, dom_idx, NODE_DEFINITELY_EXISTS);
                        if adjacent_only {
                            return result;
                        }
                    }
                    // If has slot attr, skip and continue
                }

                TemplateNode::SvelteElement(_) => {
                    if let Some(&dom_idx) = walk.node_to_dom_idx.get(&node_ptr(sibling)) {
                        add_to_map_entry(&mut result, dom_idx, NODE_PROBABLY_EXISTS);
                    }
                    // svelte:element might not render, so don't return for adjacent_only
                }

                _ if is_block(sibling) || matches!(sibling, TemplateNode::Component(_)) => {
                    // For SlotElement and Component, they produce opaque content
                    if matches!(
                        sibling,
                        TemplateNode::SlotElement(_) | TemplateNode::Component(_)
                    ) {
                        // The official compiler adds the node itself to the result map
                        // as NODE_PROBABLY_EXISTS. We can't do that directly since we
                        // only track element dom_idx. Instead, we just collect nested children.
                    }

                    let saved = std::mem::take(&mut walk.nested_seen);
                    let nested =
                        get_possible_nested_siblings(sibling, direction, adjacent_only, walk);
                    walk.nested_seen = saved;
                    add_to_map(&nested, &mut result);

                    if adjacent_only
                        && !matches!(sibling, TemplateNode::Component(_))
                        && has_definite_elements(&nested)
                    {
                        return result;
                    }
                }

                TemplateNode::RenderTag(_) => {
                    match walk.snippets.rendered.get(&node_ptr(sibling)) {
                        Some(snippet_nodes) => {
                            let saved = std::mem::take(&mut walk.nested_seen);
                            for snippet in snippet_nodes.clone() {
                                let nested = get_possible_nested_siblings(
                                    snippet,
                                    direction,
                                    adjacent_only,
                                    walk,
                                );
                                add_to_map(&nested, &mut result);
                            }
                            walk.nested_seen = saved;
                        }
                        None => walk.incomplete = true,
                    }
                }

                _ => {
                    // Text, comments, expression tags - skip
                }
            }
        }

        // Move up to the parent.
        // We need to look at the previous path entry to determine the parent node.
        if i == 0 {
            break;
        }

        let parent_entry = &path[i - 1];
        let parent_node = &parent_entry.fragment.nodes[parent_entry.index];

        // Skip Component/SvelteComponent/SvelteSelf parents (continue looking up)
        if matches!(
            parent_node,
            TemplateNode::Component(_)
                | TemplateNode::SvelteComponent(_)
                | TemplateNode::SvelteSelf(_)
        ) {
            // The `i -= 1` at the top of the next iteration will move past this
            continue;
        }

        // Upstream leaves a snippet body through `SnippetBlock.metadata.sites`, so the
        // element's real siblings are the ones around each `{@render}` of it.
        if matches!(parent_node, TemplateNode::SnippetBlock(_)) {
            if !walk.seen.insert(node_ptr(parent_node)) {
                break;
            }
            match walk.snippets.sites.get(&node_ptr(parent_node)) {
                Some(sites) => {
                    let single = sites.len() == 1;
                    for site in sites.clone() {
                        let siblings =
                            get_possible_element_siblings(&site, direction, adjacent_only, walk);
                        let definite = has_definite_elements(&siblings);
                        add_to_map(&siblings, &mut result);
                        if adjacent_only && single && definite {
                            return result;
                        }
                    }
                }
                None => walk.incomplete = true,
            }
            break;
        }

        // If parent is not a block, stop walking up.
        if !is_block(parent_node) {
            break;
        }

        // Special case: if the parent is an EachBlock and we're in its body,
        // add wrap-around siblings (from get_possible_nested_siblings)
        if let TemplateNode::EachBlock(each) = parent_node {
            let in_body = std::ptr::eq(entry.fragment, &each.body);
            if in_body {
                let saved = std::mem::take(&mut walk.nested_seen);
                let wrap_siblings =
                    get_possible_nested_siblings(parent_node, direction, adjacent_only, walk);
                walk.nested_seen = saved;
                add_to_map(&wrap_siblings, &mut result);
            }
        }

        // Continue walking up (i will be decremented at the top of the loop)
    }

    result
}

/// Port of Svelte's `get_possible_nested_siblings()`.
///
/// Gets elements at the edge (first or last) of a block node's fragments.
fn get_possible_nested_siblings(
    node: &TemplateNode,
    direction: Direction,
    adjacent_only: bool,
    walk: &mut Walk,
) -> FxHashMap<usize, u8> {
    let mut fragments: Vec<Option<&Fragment>> = Vec::new();

    match node {
        TemplateNode::EachBlock(block) => {
            fragments.push(Some(&block.body));
            fragments.push(block.fallback.as_ref());
        }
        TemplateNode::IfBlock(block) => {
            fragments.push(Some(&block.consequent));
            fragments.push(block.alternate.as_ref());
        }
        TemplateNode::AwaitBlock(block) => {
            fragments.push(block.pending.as_ref());
            fragments.push(block.then.as_ref());
            fragments.push(block.catch.as_ref());
        }
        TemplateNode::KeyBlock(block) => {
            fragments.push(Some(&block.fragment));
        }
        TemplateNode::SlotElement(slot) => {
            fragments.push(Some(&slot.fragment));
        }
        TemplateNode::SnippetBlock(snippet) => {
            if !walk.nested_seen.insert(node_ptr(node)) {
                return FxHashMap::default();
            }
            fragments.push(Some(&snippet.body));
        }
        TemplateNode::Component(comp) => {
            fragments.push(Some(&comp.fragment));
            // Also include snippet bodies defined inside the component
            for child in &comp.fragment.nodes {
                if let TemplateNode::SnippetBlock(snippet) = child {
                    fragments.push(Some(&snippet.body));
                }
            }
        }
        _ => {}
    }

    let mut result: FxHashMap<usize, u8> = FxHashMap::default();
    let mut exhaustive = !matches!(
        node,
        TemplateNode::SlotElement(_) | TemplateNode::SnippetBlock(_)
    );

    for fragment_opt in &fragments {
        match fragment_opt {
            None => {
                exhaustive = false;
            }
            Some(fragment) => {
                let map = loop_child(&fragment.nodes, direction, adjacent_only, walk);
                exhaustive = exhaustive && has_definite_elements(&map);
                add_to_map(&map, &mut result);
            }
        }
    }

    if !exhaustive {
        // Demote all entries to PROBABLY_EXISTS
        for value in result.values_mut() {
            *value = NODE_PROBABLY_EXISTS;
        }
    }

    result
}

/// Port of Svelte's `loop_child()`.
///
/// Iterates through fragment children to find edge elements.
fn loop_child(
    children: &[TemplateNode],
    direction: Direction,
    adjacent_only: bool,
    walk: &mut Walk,
) -> FxHashMap<usize, u8> {
    let mut result: FxHashMap<usize, u8> = FxHashMap::default();

    let iter: Box<dyn Iterator<Item = usize>> = if direction == Direction::Forward {
        Box::new(0..children.len())
    } else {
        Box::new((0..children.len()).rev())
    };

    for i in iter {
        let child = &children[i];

        match child {
            TemplateNode::RegularElement(_) => {
                if let Some(&dom_idx) = walk.node_to_dom_idx.get(&node_ptr(child)) {
                    add_to_map_entry(&mut result, dom_idx, NODE_DEFINITELY_EXISTS);
                    if adjacent_only {
                        break;
                    }
                }
            }
            TemplateNode::SvelteElement(_) => {
                if let Some(&dom_idx) = walk.node_to_dom_idx.get(&node_ptr(child)) {
                    add_to_map_entry(&mut result, dom_idx, NODE_PROBABLY_EXISTS);
                }
                // Don't break - svelte:element might not render
            }
            TemplateNode::RenderTag(_) => match walk.snippets.rendered.get(&node_ptr(child)) {
                Some(snippet_nodes) => {
                    for snippet in snippet_nodes.clone() {
                        let nested =
                            get_possible_nested_siblings(snippet, direction, adjacent_only, walk);
                        add_to_map(&nested, &mut result);
                    }
                }
                None => walk.incomplete = true,
            },
            _ if is_block(child) => {
                let child_result =
                    get_possible_nested_siblings(child, direction, adjacent_only, walk);
                add_to_map(&child_result, &mut result);
                if adjacent_only && has_definite_elements(&child_result) {
                    break;
                }
            }
            _ => {
                // Text, comments, expression tags - skip
            }
        }
    }

    result
}

/// Check if a node is a "block" node (IfBlock, EachBlock, AwaitBlock, KeyBlock, SlotElement).
fn is_block(node: &TemplateNode) -> bool {
    matches!(
        node,
        TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_)
            | TemplateNode::SlotElement(_)
    )
}

/// Check if any entry in the map has NODE_DEFINITELY_EXISTS.
fn has_definite_elements(map: &FxHashMap<usize, u8>) -> bool {
    map.values().any(|&v| v == NODE_DEFINITELY_EXISTS)
}

/// Add entries from `from` to `to`, using higher_existence for conflicts.
fn add_to_map(from: &FxHashMap<usize, u8>, to: &mut FxHashMap<usize, u8>) {
    for (&key, &value) in from {
        add_to_map_entry(to, key, value);
    }
}

/// Add a single entry to the map, using higher_existence for conflicts.
fn add_to_map_entry(map: &mut FxHashMap<usize, u8>, key: usize, value: u8) {
    let entry = map.entry(key).or_insert(0);
    *entry = higher_existence(value, *entry);
}

/// Returns the higher existence value (DEFINITELY > PROBABLY > 0).
fn higher_existence(a: u8, b: u8) -> u8 {
    a.max(b)
}

/// Mark elements that are adjacent to opaque boundaries (slots, render tags, components).
/// For `:global(X) + Y`, Y must be immediately after an opaque boundary.
/// For `:global(X) ~ Y`, Y must be somewhere after an opaque boundary.
fn mark_opaque_boundary_adjacency(
    dom_structure: &mut DomStructure,
    root_fragment: &Fragment,
    node_to_dom_idx: &FxHashMap<NodePtr, usize>,
) {
    mark_opaque_in_fragment(dom_structure, root_fragment, node_to_dom_idx);
}

/// Recursively scan a fragment for opaque boundary adjacency.
fn mark_opaque_in_fragment(
    dom_structure: &mut DomStructure,
    fragment: &Fragment,
    node_to_dom_idx: &FxHashMap<NodePtr, usize>,
) {
    let mut saw_opaque = false;
    let mut saw_opaque_ever = false;

    for node in &fragment.nodes {
        let is_opaque = matches!(
            node,
            TemplateNode::SlotElement(_)
                | TemplateNode::RenderTag(_)
                | TemplateNode::Component(_)
                | TemplateNode::SvelteComponent(_)
                | TemplateNode::SvelteSelf(_)
        );

        if is_opaque {
            saw_opaque = true;
            saw_opaque_ever = true;
        }

        // If this is an element and we just saw an opaque boundary, mark it
        match node {
            TemplateNode::RegularElement(el) => {
                if let Some(&dom_idx) = node_to_dom_idx.get(&node_ptr(node)) {
                    if saw_opaque {
                        dom_structure.elements[dom_idx].prev_is_opaque_boundary = true;
                    }
                    if saw_opaque_ever {
                        dom_structure.elements[dom_idx].prev_has_opaque_boundary = true;
                    }
                    // After seeing a real element, reset the adjacent flag
                    // (only the first element after opaque is "adjacent")
                    saw_opaque = false;
                }
                // Recurse into element children
                mark_opaque_in_fragment(dom_structure, &el.fragment, node_to_dom_idx);
            }
            TemplateNode::SvelteElement(el) => {
                if let Some(&dom_idx) = node_to_dom_idx.get(&node_ptr(node)) {
                    if saw_opaque {
                        dom_structure.elements[dom_idx].prev_is_opaque_boundary = true;
                    }
                    if saw_opaque_ever {
                        dom_structure.elements[dom_idx].prev_has_opaque_boundary = true;
                    }
                    saw_opaque = false;
                }
                mark_opaque_in_fragment(dom_structure, &el.fragment, node_to_dom_idx);
            }
            TemplateNode::IfBlock(block) => {
                mark_opaque_in_fragment(dom_structure, &block.consequent, node_to_dom_idx);
                if let Some(ref alt) = block.alternate {
                    mark_opaque_in_fragment(dom_structure, alt, node_to_dom_idx);
                }
            }
            TemplateNode::EachBlock(block) => {
                mark_opaque_in_fragment(dom_structure, &block.body, node_to_dom_idx);
                if let Some(ref fallback) = block.fallback {
                    mark_opaque_in_fragment(dom_structure, fallback, node_to_dom_idx);
                }
            }
            TemplateNode::AwaitBlock(block) => {
                if let Some(ref pending) = block.pending {
                    mark_opaque_in_fragment(dom_structure, pending, node_to_dom_idx);
                }
                if let Some(ref then) = block.then {
                    mark_opaque_in_fragment(dom_structure, then, node_to_dom_idx);
                }
                if let Some(ref catch) = block.catch {
                    mark_opaque_in_fragment(dom_structure, catch, node_to_dom_idx);
                }
            }
            TemplateNode::KeyBlock(block) => {
                mark_opaque_in_fragment(dom_structure, &block.fragment, node_to_dom_idx);
            }
            TemplateNode::SlotElement(slot) => {
                mark_opaque_in_fragment(dom_structure, &slot.fragment, node_to_dom_idx);
            }
            TemplateNode::SnippetBlock(snippet) => {
                mark_opaque_in_fragment(dom_structure, &snippet.body, node_to_dom_idx);
            }
            TemplateNode::Component(comp) => {
                mark_opaque_in_fragment(dom_structure, &comp.fragment, node_to_dom_idx);
            }
            TemplateNode::SvelteComponent(comp) => {
                mark_opaque_in_fragment(dom_structure, &comp.fragment, node_to_dom_idx);
            }
            TemplateNode::SvelteSelf(elem)
            | TemplateNode::SvelteHead(elem)
            | TemplateNode::SvelteFragment(elem)
            | TemplateNode::SvelteBoundary(elem)
            | TemplateNode::SvelteBody(elem)
            | TemplateNode::SvelteWindow(elem)
            | TemplateNode::SvelteDocument(elem) => {
                mark_opaque_in_fragment(dom_structure, &elem.fragment, node_to_dom_idx);
            }
            TemplateNode::TitleElement(title) => {
                mark_opaque_in_fragment(dom_structure, &title.fragment, node_to_dom_idx);
            }
            _ => {}
        }
    }
}
