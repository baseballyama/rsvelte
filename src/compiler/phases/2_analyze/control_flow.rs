//! Control flow analysis for CSS sibling combinator detection.
//!
//! This module analyzes template fragments to determine possible sibling relationships
//! between elements, taking into account control flow (if/each/await blocks).
//!
//! The algorithm is based on Svelte's `get_possible_element_siblings()` in css-prune.js.

use super::types::{DomStructure, SiblingCertainty};
use crate::ast::template::{Fragment, IfBlock, TemplateNode};
use std::collections::{HashMap, HashSet};

/// Check if an if block is "exhaustive" (always renders something).
/// An if block is exhaustive if it has a final else branch that is not another if.
fn is_if_block_exhaustive(block: &IfBlock) -> bool {
    match &block.alternate {
        None => false, // No else branch - not exhaustive
        Some(alt_fragment) => {
            // Check if the alternate is just another if block (else-if)
            // or if it's a real else branch
            if alt_fragment.nodes.len() == 1
                && let Some(TemplateNode::IfBlock(inner_if)) = alt_fragment.nodes.first()
            {
                // It's an else-if, recursively check if THAT is exhaustive
                return is_if_block_exhaustive(inner_if);
            }
            // Has content that's not just another if - it's a real else
            !alt_fragment.nodes.is_empty()
        }
    }
}

/// Build sibling relationships for all elements in the DOM structure.
///
/// This function analyzes the template and computes possible sibling relationships
/// for each element, taking control flow into account.
pub fn build_sibling_relationships(dom_structure: &mut DomStructure, root_fragment: &Fragment) {
    // First, collect element positions and their context
    let mut context = TraversalContext::new();
    collect_elements(root_fragment, &mut context, vec![], None);

    // For each element, compute its possible siblings
    for (dom_idx, info) in &context.element_info {
        let (prev_adj, prev_gen) = find_previous_siblings(*dom_idx, info, &context);
        let (next_adj, next_gen) = find_next_siblings(*dom_idx, info, &context);

        if *dom_idx < dom_structure.elements.len() {
            dom_structure.elements[*dom_idx].possible_prev_adjacent = prev_adj;
            dom_structure.elements[*dom_idx].possible_prev_general = prev_gen;
            dom_structure.elements[*dom_idx].possible_next_adjacent = next_adj;
            dom_structure.elements[*dom_idx].possible_next_general = next_gen;
        }
    }
}

/// Information about an element's position in the template.
#[derive(Debug, Clone)]
struct ElementInfo {
    /// Index in dom_structure.elements
    #[allow(dead_code)]
    dom_idx: usize,
    /// Path from root to this element's parent fragment
    fragment_path: Vec<FragmentSegment>,
    /// Position within immediate fragment (excludes nested block contents)
    position_in_fragment: usize,
    /// Sub-position for elements at the same position (e.g., elements inside
    /// non-exhaustive blocks vs elements after the block)
    sub_position: usize,
    /// Set of branch identifiers this element belongs to
    branches: HashSet<BranchId>,
}

/// Identifies a specific branch in a control flow block.
#[derive(Debug, Clone, Hash, PartialEq, Eq)]
struct BranchId {
    /// Path to the block
    path: Vec<FragmentSegment>,
    /// Branch index within the block
    branch: usize,
}

/// Segment in the fragment path.
#[derive(Debug, Clone, Hash, PartialEq, Eq)]
#[allow(dead_code)]
enum FragmentSegment {
    Root,
    Element(usize), // DOM element index
    IfBlock(usize), // Block's position in parent fragment
    EachBlock(usize),
    AwaitBlock(usize),
    KeyBlock(usize),
    SnippetBlock,
    SlotElement,
}

/// Type for sibling pair results
type SiblingPair = (
    Vec<(usize, SiblingCertainty)>,
    Vec<(usize, SiblingCertainty)>,
);

/// Context for template traversal.
struct TraversalContext {
    element_info: HashMap<usize, ElementInfo>,
    current_dom_idx: usize,
    /// Map from (fragment_path, position) to elements in each branch
    #[allow(clippy::type_complexity)]
    position_to_elements: HashMap<(Vec<FragmentSegment>, usize), Vec<(usize, HashSet<BranchId>)>>,
    /// Track the position within each fragment level
    fragment_positions: Vec<usize>,
}

impl TraversalContext {
    fn new() -> Self {
        Self {
            element_info: HashMap::new(),
            current_dom_idx: 0,
            position_to_elements: HashMap::new(),
            fragment_positions: vec![0],
        }
    }

    fn current_position(&self) -> usize {
        *self.fragment_positions.last().unwrap_or(&0)
    }

    fn increment_position(&mut self) {
        if let Some(pos) = self.fragment_positions.last_mut() {
            *pos += 1;
        }
    }

    fn push_position(&mut self) {
        self.fragment_positions.push(0);
    }

    fn pop_position(&mut self) {
        self.fragment_positions.pop();
    }
}

/// Sub-position constants for ordering elements at the same position.
const SUB_POS_INSIDE_BLOCK: usize = 0; // Elements inside a non-exhaustive block
const SUB_POS_AFTER_BLOCK: usize = 1; // Elements after a non-exhaustive block

/// Collect elements and their positions from a fragment.
fn collect_elements(
    fragment: &Fragment,
    ctx: &mut TraversalContext,
    path: Vec<FragmentSegment>,
    current_branches: Option<&HashSet<BranchId>>,
) {
    collect_elements_impl(fragment, ctx, path, current_branches, None, None);
}

/// Collect elements from a control flow branch, using a fixed position for all elements.
fn collect_elements_with_position(
    fragment: &Fragment,
    ctx: &mut TraversalContext,
    path: Vec<FragmentSegment>,
    current_branches: Option<&HashSet<BranchId>>,
    fixed_position: usize,
    fixed_sub_position: Option<usize>,
) {
    collect_elements_impl(
        fragment,
        ctx,
        path,
        current_branches,
        Some(fixed_position),
        fixed_sub_position,
    );
}

/// Implementation of element collection with optional fixed position.
fn collect_elements_impl(
    fragment: &Fragment,
    ctx: &mut TraversalContext,
    path: Vec<FragmentSegment>,
    current_branches: Option<&HashSet<BranchId>>,
    fixed_position: Option<usize>,
    fixed_sub_position: Option<usize>,
) {
    let branches = current_branches.cloned().unwrap_or_default();

    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(element) => {
                let dom_idx = ctx.current_dom_idx;
                ctx.current_dom_idx += 1;

                // Use fixed position if provided, otherwise use current position
                let position = fixed_position.unwrap_or_else(|| ctx.current_position());
                // Use fixed sub_position if provided, otherwise use SUB_POS_AFTER_BLOCK
                // (elements not in a block come "after" any potential block elements)
                let sub_pos = fixed_sub_position.unwrap_or(SUB_POS_AFTER_BLOCK);

                let info = ElementInfo {
                    dom_idx,
                    fragment_path: path.clone(),
                    position_in_fragment: position,
                    sub_position: sub_pos,
                    branches: branches.clone(),
                };

                ctx.element_info.insert(dom_idx, info);

                // Track position mapping
                let key = (path.clone(), position);
                ctx.position_to_elements
                    .entry(key)
                    .or_default()
                    .push((dom_idx, branches.clone()));

                // Only increment if not using fixed position
                if fixed_position.is_none() {
                    ctx.increment_position();
                }

                // Process children
                let mut child_path = path.clone();
                child_path.push(FragmentSegment::Element(dom_idx));
                ctx.push_position();
                collect_elements(&element.fragment, ctx, child_path, Some(&branches));
                ctx.pop_position();
            }

            TemplateNode::IfBlock(block) => {
                let block_position = ctx.current_position();
                let mut block_path = path.clone();
                block_path.push(FragmentSegment::IfBlock(block_position));

                // Check if this if block is exhaustive (always renders something)
                let is_exhaustive = is_if_block_exhaustive(block);

                // For non-exhaustive blocks, elements inside get SUB_POS_INSIDE_BLOCK
                // so they come "before" elements after the block at the same position
                let sub_pos = if is_exhaustive {
                    None // Use default
                } else {
                    Some(SUB_POS_INSIDE_BLOCK)
                };

                // Consequent branch - elements inherit the block's position
                let mut consequent_branches = branches.clone();
                consequent_branches.insert(BranchId {
                    path: block_path.clone(),
                    branch: 0,
                });

                // Both exhaustive and non-exhaustive: elements inside share the block's position
                // and stay on the same path. This allows sibling detection between
                // elements inside and outside the block.
                collect_elements_with_position(
                    &block.consequent,
                    ctx,
                    path.clone(),
                    Some(&consequent_branches),
                    block_position,
                    sub_pos,
                );

                // Alternate branch (if any)
                if let Some(ref alternate) = block.alternate {
                    let mut alternate_branches = branches.clone();
                    alternate_branches.insert(BranchId {
                        path: block_path.clone(),
                        branch: 1,
                    });
                    collect_elements_with_position(
                        alternate,
                        ctx,
                        path.clone(),
                        Some(&alternate_branches),
                        block_position,
                        sub_pos,
                    );
                }

                // Only increment position if exhaustive (block takes up a position)
                // Non-exhaustive blocks don't increment, allowing elements before/after
                // to be adjacent (e.g., .a + .d when {#if} might not render anything)
                if is_exhaustive {
                    ctx.increment_position();
                }
            }

            TemplateNode::EachBlock(block) => {
                let block_position = ctx.current_position();
                let mut block_path = path.clone();
                block_path.push(FragmentSegment::EachBlock(block_position));

                // Body - elements inherit the block's position
                let mut body_branches = branches.clone();
                body_branches.insert(BranchId {
                    path: block_path.clone(),
                    branch: 0,
                });
                collect_elements_with_position(
                    &block.body,
                    ctx,
                    path.clone(),
                    Some(&body_branches),
                    block_position,
                    None,
                );

                // Fallback (if any)
                if let Some(ref fallback) = block.fallback {
                    let mut fallback_branches = branches.clone();
                    fallback_branches.insert(BranchId {
                        path: block_path.clone(),
                        branch: 1,
                    });
                    collect_elements_with_position(
                        fallback,
                        ctx,
                        path.clone(),
                        Some(&fallback_branches),
                        block_position,
                        None,
                    );
                }

                ctx.increment_position();
            }

            TemplateNode::AwaitBlock(block) => {
                let block_position = ctx.current_position();
                let mut block_path = path.clone();
                block_path.push(FragmentSegment::AwaitBlock(block_position));

                // Pending - elements inherit the block's position
                if let Some(ref pending) = block.pending {
                    let mut pending_branches = branches.clone();
                    pending_branches.insert(BranchId {
                        path: block_path.clone(),
                        branch: 0,
                    });
                    collect_elements_with_position(
                        pending,
                        ctx,
                        path.clone(),
                        Some(&pending_branches),
                        block_position,
                        None,
                    );
                }

                // Then
                if let Some(ref then) = block.then {
                    let mut then_branches = branches.clone();
                    then_branches.insert(BranchId {
                        path: block_path.clone(),
                        branch: 1,
                    });
                    collect_elements_with_position(
                        then,
                        ctx,
                        path.clone(),
                        Some(&then_branches),
                        block_position,
                        None,
                    );
                }

                // Catch
                if let Some(ref catch) = block.catch {
                    let mut catch_branches = branches.clone();
                    catch_branches.insert(BranchId {
                        path: block_path.clone(),
                        branch: 2,
                    });
                    collect_elements_with_position(
                        catch,
                        ctx,
                        path.clone(),
                        Some(&catch_branches),
                        block_position,
                        None,
                    );
                }

                ctx.increment_position();
            }

            TemplateNode::KeyBlock(block) => {
                collect_elements(&block.fragment, ctx, path.clone(), Some(&branches));
            }

            TemplateNode::SnippetBlock(block) => {
                let snippet_branches = branches.clone();
                let mut block_path = path.clone();
                block_path.push(FragmentSegment::SnippetBlock);
                ctx.push_position();
                collect_elements(&block.body, ctx, block_path, Some(&snippet_branches));
                ctx.pop_position();
                ctx.increment_position();
            }

            TemplateNode::SlotElement(slot) => {
                let slot_branches = branches.clone();
                let mut block_path = path.clone();
                block_path.push(FragmentSegment::SlotElement);
                ctx.push_position();
                collect_elements(&slot.fragment, ctx, block_path, Some(&slot_branches));
                ctx.pop_position();
                ctx.increment_position();
            }

            TemplateNode::Component(comp) => {
                // Components can contain children
                ctx.push_position();
                collect_elements(&comp.fragment, ctx, path.clone(), Some(&branches));
                ctx.pop_position();
                ctx.increment_position();
            }

            TemplateNode::SvelteElement(_) => {
                // Dynamic element - count it but don't analyze further
                ctx.current_dom_idx += 1;
                ctx.increment_position();
            }

            _ => {
                // Text, comments, expression tags - don't contribute to position
            }
        }
    }
}

/// Compare two elements by their position (position_in_fragment, sub_position).
/// Returns true if a comes before b.
fn comes_before(a: &ElementInfo, b: &ElementInfo) -> bool {
    if a.position_in_fragment != b.position_in_fragment {
        a.position_in_fragment < b.position_in_fragment
    } else {
        a.sub_position < b.sub_position
    }
}

/// Find previous siblings for an element.
fn find_previous_siblings(
    dom_idx: usize,
    info: &ElementInfo,
    ctx: &TraversalContext,
) -> SiblingPair {
    let mut adjacent = Vec::new();
    let mut general = Vec::new();

    // Find elements that come before this one at the same fragment level
    for (other_idx, other_info) in &ctx.element_info {
        if *other_idx == dom_idx {
            continue;
        }

        // Same fragment path means same level, and check if other element comes before this one
        if other_info.fragment_path == info.fragment_path && comes_before(other_info, info) {
            let certainty = determine_certainty(&other_info.branches, &info.branches);

            // Only add if they can actually be siblings (not mutually exclusive branches)
            if certainty != SiblingCertainty::Probable
                || can_be_siblings(&other_info.branches, &info.branches)
            {
                general.push((*other_idx, certainty));

                // Check if immediately adjacent (no elements between)
                let is_adjacent =
                    is_immediately_before(other_info, info, &ctx.element_info, &info.branches);
                if is_adjacent {
                    adjacent.push((*other_idx, certainty));
                }
            }
        }
    }

    (adjacent, general)
}

/// Find next siblings for an element.
fn find_next_siblings(dom_idx: usize, info: &ElementInfo, ctx: &TraversalContext) -> SiblingPair {
    let mut adjacent = Vec::new();
    let mut general = Vec::new();

    for (other_idx, other_info) in &ctx.element_info {
        if *other_idx == dom_idx {
            continue;
        }

        if other_info.fragment_path == info.fragment_path && comes_before(info, other_info) {
            let certainty = determine_certainty(&info.branches, &other_info.branches);

            if certainty != SiblingCertainty::Probable
                || can_be_siblings(&info.branches, &other_info.branches)
            {
                general.push((*other_idx, certainty));

                let is_adjacent =
                    is_immediately_after(info, other_info, &ctx.element_info, &info.branches);
                if is_adjacent {
                    adjacent.push((*other_idx, certainty));
                }
            }
        }
    }

    (adjacent, general)
}

/// Determine if two elements can be siblings (not in mutually exclusive branches).
fn can_be_siblings(branches1: &HashSet<BranchId>, branches2: &HashSet<BranchId>) -> bool {
    // If elements share a branch ID with different branch numbers for the same path,
    // they are mutually exclusive and cannot be siblings.

    for b1 in branches1 {
        for b2 in branches2 {
            if b1.path == b2.path && b1.branch != b2.branch {
                // Same block, different branches - mutually exclusive
                return false;
            }
        }
    }

    true
}

/// Determine the certainty of sibling relationship.
fn determine_certainty(
    branches1: &HashSet<BranchId>,
    branches2: &HashSet<BranchId>,
) -> SiblingCertainty {
    // If either element is in a control flow branch, relationship is probable
    if !branches1.is_empty() || !branches2.is_empty() {
        // If they share the exact same branches, it's definite
        if branches1 == branches2 {
            SiblingCertainty::Definite
        } else {
            SiblingCertainty::Probable
        }
    } else {
        SiblingCertainty::Definite
    }
}

/// Check if an element is a definite barrier (will always be present when both
/// source and target are present).
fn is_definite_barrier(between: &ElementInfo, source: &ElementInfo, target: &ElementInfo) -> bool {
    // Elements inside non-exhaustive blocks (sub_position == SUB_POS_INSIDE_BLOCK)
    // are NOT definite barriers because the block might not render at all
    if between.sub_position == SUB_POS_INSIDE_BLOCK {
        // This element is in a non-exhaustive block, so it might not be present
        // when source and target are both present
        return false;
    }

    // For elements in exhaustive blocks or outside any block:
    // They are definite barriers if they share the same branches as source and target
    // (or have no additional branches)
    for branch in &between.branches {
        if !source.branches.contains(branch) && !target.branches.contains(branch) {
            // This element is in a branch that neither source nor target share
            // But since it's in an exhaustive block, SOME element at this position
            // will definitely be present. However, THIS specific element might not be.
            // For exhaustive blocks, we still want to consider it a barrier because
            // at least one of the elements at this position will be present.
            // This check is for elements that are in entirely different branches.

            // Actually, for exhaustive blocks, we should still consider them barriers
            // because the position itself is occupied. Only non-exhaustive blocks
            // (checked above) should be skipped.
        }
    }

    true
}

/// Check if other_info immediately precedes target_info (no elements between).
fn is_immediately_before(
    other_info: &ElementInfo,
    target_info: &ElementInfo,
    all_elements: &HashMap<usize, ElementInfo>,
    _target_branches: &HashSet<BranchId>,
) -> bool {
    // Check if any element exists between other and target that would ALWAYS be present
    for between_info in all_elements.values() {
        if between_info.fragment_path == other_info.fragment_path
            && comes_before(other_info, between_info)
            && comes_before(between_info, target_info)
            && can_be_siblings(&between_info.branches, &target_info.branches)
            && is_definite_barrier(between_info, other_info, target_info)
        {
            return false;
        }
    }
    true
}

/// Check if other_info immediately follows source_info (no elements between).
fn is_immediately_after(
    source_info: &ElementInfo,
    other_info: &ElementInfo,
    all_elements: &HashMap<usize, ElementInfo>,
    _source_branches: &HashSet<BranchId>,
) -> bool {
    for between_info in all_elements.values() {
        if between_info.fragment_path == source_info.fragment_path
            && comes_before(source_info, between_info)
            && comes_before(between_info, other_info)
            && can_be_siblings(&source_info.branches, &between_info.branches)
            && is_definite_barrier(between_info, source_info, other_info)
        {
            return false;
        }
    }
    true
}
