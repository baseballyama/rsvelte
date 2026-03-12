//! CSS selector-to-element matching for scoped hash application.
//!
//! This module implements proper CSS selector matching against template elements,
//! similar to the official compiler's css-prune.js. It considers combinators
//! (>, space, +, ~) when determining which elements should be scoped.

use crate::ast::template::{self, Fragment, TemplateNode};

/// Info about a template element for CSS matching.
#[derive(Debug, Clone)]
pub struct ElementInfo {
    pub tag_name: String,
    pub has_spread: bool,
    pub classes: Vec<String>,
    pub ids: Vec<String>,
    pub has_dynamic_class: bool,
    /// Whether this is a dynamic element (<svelte:element>), which matches any type selector
    pub is_dynamic: bool,
}

impl ElementInfo {
    pub fn from_element(el: &template::RegularElement) -> Self {
        Self::from_attributes(&el.name, &el.attributes, false)
    }

    pub fn from_svelte_element(el: &template::SvelteDynamicElement) -> Self {
        // Use empty tag name - the is_dynamic flag will make type selectors always match
        Self::from_attributes("", &el.attributes, true)
    }

    fn from_attributes(
        tag_name: &str,
        attributes: &[template::Attribute],
        is_dynamic: bool,
    ) -> Self {
        use template::Attribute;

        let mut classes = Vec::new();
        let mut ids = Vec::new();
        let mut has_spread = false;
        let mut has_dynamic_class = false;

        for attr in attributes {
            match attr {
                Attribute::Attribute(a) => {
                    if a.name == "class" {
                        match &a.value {
                            template::AttributeValue::Sequence(parts) => {
                                for part in parts {
                                    if let template::AttributeValuePart::Text(text) = part {
                                        for class in text.data.split_whitespace() {
                                            classes.push(class.to_string());
                                        }
                                    } else {
                                        has_dynamic_class = true;
                                    }
                                }
                            }
                            template::AttributeValue::Expression(_) => {
                                has_dynamic_class = true;
                            }
                            _ => {}
                        }
                    } else if a.name == "id"
                        && let template::AttributeValue::Sequence(parts) = &a.value
                    {
                        for part in parts {
                            if let template::AttributeValuePart::Text(text) = part {
                                ids.push(text.data.to_string());
                            }
                        }
                    }
                }
                Attribute::ClassDirective(cd) => {
                    classes.push(cd.name.to_string());
                }
                Attribute::SpreadAttribute(_) => {
                    has_spread = true;
                }
                _ => {}
            }
        }

        Self {
            tag_name: tag_name.to_string(),
            has_spread,
            classes,
            ids,
            has_dynamic_class,
            is_dynamic,
        }
    }
}

/// Parsed CSS simple selector.
#[derive(Debug, Clone)]
pub enum CssSimpleSelector {
    Type(String),
    Class(String),
    Id(String),
    Attribute,
    PseudoClass(String, Option<Vec<CssComplexSelector>>),
    PseudoElement,
    Nesting,
}

/// Parsed CSS relative selector (simple selectors + combinator).
#[derive(Debug, Clone)]
pub struct CssRelativeSelector {
    pub combinator: Option<String>,
    pub selectors: Vec<CssSimpleSelector>,
    pub is_global: bool,
    pub is_global_like: bool,
}

/// Parsed CSS complex selector (list of relative selectors).
#[derive(Debug, Clone)]
pub struct CssComplexSelector {
    pub children: Vec<CssRelativeSelector>,
}

/// Extract all CSS complex selectors from the stylesheet JSON.
pub fn extract_css_selectors(stylesheet: &crate::ast::css::StyleSheet) -> Vec<CssComplexSelector> {
    let mut selectors = Vec::new();
    for child in &stylesheet.children {
        extract_selectors_from_css_node(child, &mut selectors);
    }
    selectors
}

fn extract_selectors_from_css_node(
    node: &serde_json::Value,
    selectors: &mut Vec<CssComplexSelector>,
) {
    let node_type = match node.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return,
    };
    match node_type {
        "Rule" => {
            if let Some(metadata) = node.get("metadata")
                && metadata
                    .get("is_global_block")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false)
            {
                return;
            }
            if let Some(prelude) = node.get("prelude")
                && let Some(complex_selectors) = prelude.get("children").and_then(|c| c.as_array())
            {
                for cs in complex_selectors {
                    if let Some(parsed) = parse_complex_selector(cs) {
                        selectors.push(parsed);
                    }
                }
            }
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    extract_selectors_from_css_node(child, selectors);
                }
            }
        }
        "Atrule" => {
            let is_keyframes = node
                .get("name")
                .and_then(|n| n.as_str())
                .is_some_and(|name| {
                    matches!(
                        name,
                        "keyframes" | "-webkit-keyframes" | "-moz-keyframes" | "-o-keyframes"
                    )
                });
            if !is_keyframes
                && let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    extract_selectors_from_css_node(child, selectors);
                }
            }
        }
        _ => {}
    }
}

fn parse_complex_selector(cs: &serde_json::Value) -> Option<CssComplexSelector> {
    let children = cs.get("children")?.as_array()?;
    let mut relative_selectors = Vec::new();
    for rel in children {
        if let Some(parsed) = parse_relative_selector(rel) {
            relative_selectors.push(parsed);
        }
    }
    if relative_selectors.is_empty() {
        return None;
    }
    Some(CssComplexSelector {
        children: relative_selectors,
    })
}

fn parse_relative_selector(rel: &serde_json::Value) -> Option<CssRelativeSelector> {
    let combinator = rel.get("combinator").and_then(|c| {
        if c.is_null() {
            None
        } else {
            c.get("name")
                .and_then(|n| n.as_str())
                .map(|s| s.to_string())
        }
    });

    let is_global = rel
        .get("metadata")
        .and_then(|m| m.get("is_global"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let is_global_like = rel
        .get("metadata")
        .and_then(|m| m.get("is_global_like"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let selectors_json = rel.get("selectors")?.as_array()?;
    let mut selectors = Vec::new();
    for sel in selectors_json {
        if let Some(parsed) = parse_simple_selector(sel) {
            selectors.push(parsed);
        }
    }

    Some(CssRelativeSelector {
        combinator,
        selectors,
        is_global,
        is_global_like,
    })
}

fn parse_simple_selector(sel: &serde_json::Value) -> Option<CssSimpleSelector> {
    let sel_type = sel.get("type")?.as_str()?;
    match sel_type {
        "TypeSelector" => {
            let name = sel.get("name")?.as_str()?.to_string();
            Some(CssSimpleSelector::Type(name))
        }
        "ClassSelector" => {
            let name = sel.get("name")?.as_str()?.to_string();
            Some(CssSimpleSelector::Class(name))
        }
        "IdSelector" => {
            let name = sel.get("name")?.as_str()?.to_string();
            Some(CssSimpleSelector::Id(name))
        }
        "AttributeSelector" => Some(CssSimpleSelector::Attribute),
        "PseudoClassSelector" => {
            let name = sel.get("name")?.as_str()?.to_string();
            let args = sel.get("args").and_then(|args| {
                if args.is_null() {
                    return None;
                }
                let children = args.get("children")?.as_array()?;
                let mut complex_selectors = Vec::new();
                for cs in children {
                    if let Some(parsed) = parse_complex_selector(cs) {
                        complex_selectors.push(parsed);
                    }
                }
                Some(complex_selectors)
            });
            Some(CssSimpleSelector::PseudoClass(name, args))
        }
        "PseudoElementSelector" => Some(CssSimpleSelector::PseudoElement),
        "NestingSelector" => Some(CssSimpleSelector::Nesting),
        _ => None,
    }
}

/// Check if a relative selector is global or global-like.
fn is_relative_selector_global(rel: &CssRelativeSelector) -> bool {
    if rel.is_global || rel.is_global_like {
        return true;
    }
    if rel.selectors.len() == 1
        && let CssSimpleSelector::PseudoClass(name, None) = &rel.selectors[0]
        && name == "global"
    {
        return true;
    }
    false
}

/// Check if an element matches a set of simple selectors (one RelativeSelector).
fn element_matches_simple_selectors(
    element: &ElementInfo,
    selectors: &[CssSimpleSelector],
) -> bool {
    for selector in selectors {
        match selector {
            CssSimpleSelector::Type(name) => {
                // SvelteElement (dynamic tag) matches any type selector, just like the official compiler
                if name != "*"
                    && !element.is_dynamic
                    && !name.eq_ignore_ascii_case(&element.tag_name)
                {
                    return false;
                }
            }
            CssSimpleSelector::Class(name) => {
                if !element.classes.iter().any(|c| c == name)
                    && !element.has_spread
                    && !element.has_dynamic_class
                {
                    return false;
                }
            }
            CssSimpleSelector::Id(name) => {
                if !element.ids.iter().any(|id| id == name) && !element.has_spread {
                    return false;
                }
            }
            CssSimpleSelector::Attribute => {
                // Conservative: always match
            }
            CssSimpleSelector::PseudoClass(name, args) => {
                if name == "host" || name == "root" {
                    return false;
                }
                if name == "global" && args.is_none() {
                    return true;
                }
                if (name == "is" || name == "where") && args.is_some() {
                    let args = args.as_ref().unwrap();
                    let any_matches = args.iter().any(|cs| {
                        if let Some(last) = cs.children.last() {
                            element_matches_simple_selectors(element, &last.selectors)
                        } else {
                            false
                        }
                    });
                    if !any_matches {
                        return false;
                    }
                }
                // Other pseudo-classes (hover, focus, etc.) always match
            }
            CssSimpleSelector::PseudoElement | CssSimpleSelector::Nesting => {}
        }
    }
    true
}

/// Check if a complex selector matches an element, considering combinators.
/// Note: ancestors are stored in reverse order (closest parent at the END).
fn complex_selector_matches_element(
    selector: &CssComplexSelector,
    element: &ElementInfo,
    ancestors: &[ElementInfo],
) -> bool {
    let children = &selector.children;
    if children.is_empty() {
        return false;
    }

    // Truncate trailing :global selectors
    let last_non_global = children
        .iter()
        .rposition(|rel| !is_relative_selector_global(rel));
    let effective_children = match last_non_global {
        Some(idx) => &children[..=idx],
        None => return false,
    };

    if effective_children.is_empty() {
        return false;
    }

    let last = &effective_children[effective_children.len() - 1];
    if !element_matches_simple_selectors(element, &last.selectors) {
        return false;
    }

    if effective_children.len() == 1 {
        return true;
    }

    apply_combinator_chain(
        &effective_children[..effective_children.len() - 1],
        last,
        ancestors,
        ancestors.len(),
    )
}

/// Apply combinator chain backward through ancestors.
/// `ancestors` is stored in reverse order (closest parent at end).
/// `cursor` tracks the current position (starts at ancestors.len()).
fn apply_combinator_chain(
    remaining: &[CssRelativeSelector],
    current_rel: &CssRelativeSelector,
    ancestors: &[ElementInfo],
    cursor: usize,
) -> bool {
    if remaining.is_empty() {
        return true;
    }

    let combinator = current_rel.combinator.as_deref().unwrap_or(" ");

    match combinator {
        ">" => {
            if cursor == 0 {
                return remaining.iter().all(is_relative_selector_global);
            }
            let parent = &ancestors[cursor - 1];
            let next_sel = &remaining[remaining.len() - 1];
            if element_matches_simple_selectors(parent, &next_sel.selectors) {
                if remaining.len() == 1 {
                    return true;
                }
                return apply_combinator_chain(
                    &remaining[..remaining.len() - 1],
                    next_sel,
                    ancestors,
                    cursor - 1,
                );
            }
            remaining.iter().all(is_relative_selector_global)
        }
        " " => {
            let next_sel = &remaining[remaining.len() - 1];
            for i in (0..cursor).rev() {
                if element_matches_simple_selectors(&ancestors[i], &next_sel.selectors) {
                    if remaining.len() == 1 {
                        return true;
                    }
                    if apply_combinator_chain(
                        &remaining[..remaining.len() - 1],
                        next_sel,
                        ancestors,
                        i,
                    ) {
                        return true;
                    }
                }
            }
            remaining.iter().all(is_relative_selector_global)
        }
        "+" | "~" => {
            // Sibling combinators - be conservative and mark as scoped
            true
        }
        _ => true,
    }
}

/// Mark RegularElement nodes in the fragment as scoped based on CSS selector matching.
pub fn mark_elements_scoped(fragment: &mut Fragment, css_selectors: &[CssComplexSelector]) {
    let mut ancestors = Vec::new();
    mark_elements_scoped_with_ancestors(fragment, css_selectors, &mut ancestors);

    // Second pass: propagate scoping to ancestor elements in combinator chains.
    // When a child element is scoped via a selector like `.parent > .child`,
    // the parent element also needs to be scoped (it needs the CSS hash class).
    let mut ancestors2 = Vec::new();
    propagate_scoping_to_ancestors(fragment, css_selectors, &mut ancestors2);
}

fn mark_elements_scoped_with_ancestors(
    fragment: &mut Fragment,
    css_selectors: &[CssComplexSelector],
    ancestors: &mut Vec<ElementInfo>,
) {
    for node in &mut fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                let element_info = ElementInfo::from_element(el);
                el.metadata.scoped = css_selectors.iter().any(|selector| {
                    complex_selector_matches_element(selector, &element_info, ancestors)
                });
                ancestors.push(element_info);
                mark_elements_scoped_with_ancestors(&mut el.fragment, css_selectors, ancestors);
                ancestors.pop();
            }
            TemplateNode::Component(comp) => {
                mark_elements_scoped_with_ancestors(&mut comp.fragment, css_selectors, ancestors);
            }
            TemplateNode::IfBlock(if_block) => {
                mark_elements_scoped_with_ancestors(
                    &mut if_block.consequent,
                    css_selectors,
                    ancestors,
                );
                if let Some(ref mut alt) = if_block.alternate {
                    mark_elements_scoped_with_ancestors(alt, css_selectors, ancestors);
                }
            }
            TemplateNode::EachBlock(each) => {
                mark_elements_scoped_with_ancestors(&mut each.body, css_selectors, ancestors);
                if let Some(ref mut fallback) = each.fallback {
                    mark_elements_scoped_with_ancestors(fallback, css_selectors, ancestors);
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    mark_elements_scoped_with_ancestors(pending, css_selectors, ancestors);
                }
                if let Some(ref mut then) = await_block.then {
                    mark_elements_scoped_with_ancestors(then, css_selectors, ancestors);
                }
                if let Some(ref mut catch) = await_block.catch {
                    mark_elements_scoped_with_ancestors(catch, css_selectors, ancestors);
                }
            }
            TemplateNode::KeyBlock(key) => {
                mark_elements_scoped_with_ancestors(&mut key.fragment, css_selectors, ancestors);
            }
            TemplateNode::SnippetBlock(snippet) => {
                mark_elements_scoped_with_ancestors(&mut snippet.body, css_selectors, ancestors);
            }
            TemplateNode::SvelteHead(head) => {
                mark_elements_scoped_with_ancestors(&mut head.fragment, css_selectors, ancestors);
            }
            TemplateNode::SvelteElement(el) => {
                let element_info = ElementInfo::from_svelte_element(el);
                el.metadata.scoped = css_selectors.iter().any(|selector| {
                    complex_selector_matches_element(selector, &element_info, ancestors)
                });
                ancestors.push(element_info);
                mark_elements_scoped_with_ancestors(&mut el.fragment, css_selectors, ancestors);
                ancestors.pop();
            }
            TemplateNode::SlotElement(slot) => {
                mark_elements_scoped_with_ancestors(&mut slot.fragment, css_selectors, ancestors);
            }
            TemplateNode::TitleElement(title) => {
                mark_elements_scoped_with_ancestors(&mut title.fragment, css_selectors, ancestors);
            }
            _ => {}
        }
    }
}

/// Check if an element matches a non-subject (ancestor) part of a selector that has
/// a matching descendant. This is used to mark parent elements as scoped when they
/// appear in combinator chains like `.parent > .child`.
fn element_is_ancestor_in_matching_selector(
    element: &ElementInfo,
    selector: &CssComplexSelector,
) -> bool {
    let children = &selector.children;
    if children.len() < 2 {
        return false;
    }

    // Truncate trailing :global selectors
    let last_non_global = children
        .iter()
        .rposition(|rel| !is_relative_selector_global(rel));
    let effective_children = match last_non_global {
        Some(idx) => &children[..=idx],
        None => return false,
    };

    if effective_children.len() < 2 {
        return false;
    }

    // Check if the element matches any NON-LAST relative selector in the chain
    for child in &effective_children[..effective_children.len() - 1] {
        if element_matches_simple_selectors(element, &child.selectors) {
            return true;
        }
    }

    false
}

/// Second pass: propagate scoping to ancestor elements.
/// When an element is scoped and it was matched via a selector with combinators,
/// mark the matching ancestor elements as scoped too.
fn propagate_scoping_to_ancestors(
    fragment: &mut Fragment,
    css_selectors: &[CssComplexSelector],
    ancestors: &mut Vec<ElementInfo>,
) {
    for node in &mut fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                let element_info = ElementInfo::from_element(el);

                if !el.metadata.scoped {
                    el.metadata.scoped = css_selectors.iter().any(|selector| {
                        element_is_ancestor_in_matching_selector(&element_info, selector)
                            && subtree_has_matching_subject(
                                &el.fragment,
                                selector,
                                std::slice::from_ref(&element_info),
                            )
                    });
                }

                ancestors.push(element_info);
                propagate_scoping_to_ancestors(&mut el.fragment, css_selectors, ancestors);
                ancestors.pop();
            }
            TemplateNode::Component(comp) => {
                propagate_scoping_to_ancestors(&mut comp.fragment, css_selectors, ancestors);
            }
            TemplateNode::IfBlock(if_block) => {
                propagate_scoping_to_ancestors(&mut if_block.consequent, css_selectors, ancestors);
                if let Some(ref mut alt) = if_block.alternate {
                    propagate_scoping_to_ancestors(alt, css_selectors, ancestors);
                }
            }
            TemplateNode::EachBlock(each) => {
                propagate_scoping_to_ancestors(&mut each.body, css_selectors, ancestors);
                if let Some(ref mut fallback) = each.fallback {
                    propagate_scoping_to_ancestors(fallback, css_selectors, ancestors);
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    propagate_scoping_to_ancestors(pending, css_selectors, ancestors);
                }
                if let Some(ref mut then) = await_block.then {
                    propagate_scoping_to_ancestors(then, css_selectors, ancestors);
                }
                if let Some(ref mut catch) = await_block.catch {
                    propagate_scoping_to_ancestors(catch, css_selectors, ancestors);
                }
            }
            TemplateNode::KeyBlock(key) => {
                propagate_scoping_to_ancestors(&mut key.fragment, css_selectors, ancestors);
            }
            TemplateNode::SnippetBlock(snippet) => {
                propagate_scoping_to_ancestors(&mut snippet.body, css_selectors, ancestors);
            }
            TemplateNode::SvelteHead(head) => {
                propagate_scoping_to_ancestors(&mut head.fragment, css_selectors, ancestors);
            }
            TemplateNode::SvelteElement(el) => {
                let element_info = ElementInfo::from_svelte_element(el);

                if !el.metadata.scoped {
                    el.metadata.scoped = css_selectors.iter().any(|selector| {
                        element_is_ancestor_in_matching_selector(&element_info, selector)
                            && subtree_has_matching_subject(
                                &el.fragment,
                                selector,
                                std::slice::from_ref(&element_info),
                            )
                    });
                }

                ancestors.push(element_info);
                propagate_scoping_to_ancestors(&mut el.fragment, css_selectors, ancestors);
                ancestors.pop();
            }
            TemplateNode::SlotElement(slot) => {
                propagate_scoping_to_ancestors(&mut slot.fragment, css_selectors, ancestors);
            }
            TemplateNode::TitleElement(title) => {
                propagate_scoping_to_ancestors(&mut title.fragment, css_selectors, ancestors);
            }
            _ => {}
        }
    }
}

/// Check if any element in the subtree matches the subject of a selector,
/// with the given ancestors in the combinator chain.
fn subtree_has_matching_subject(
    fragment: &Fragment,
    selector: &CssComplexSelector,
    ancestors: &[ElementInfo],
) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                let element_info = ElementInfo::from_element(el);
                if complex_selector_matches_element(selector, &element_info, ancestors) {
                    return true;
                }
                let mut new_ancestors = vec![element_info];
                new_ancestors.extend_from_slice(ancestors);
                if subtree_has_matching_subject(&el.fragment, selector, &new_ancestors) {
                    return true;
                }
            }
            TemplateNode::Component(comp) => {
                if subtree_has_matching_subject(&comp.fragment, selector, ancestors) {
                    return true;
                }
            }
            TemplateNode::IfBlock(if_block) => {
                if subtree_has_matching_subject(&if_block.consequent, selector, ancestors) {
                    return true;
                }
                if let Some(ref alt) = if_block.alternate
                    && subtree_has_matching_subject(alt, selector, ancestors)
                {
                    return true;
                }
            }
            TemplateNode::EachBlock(each) => {
                if subtree_has_matching_subject(&each.body, selector, ancestors) {
                    return true;
                }
                if let Some(ref fallback) = each.fallback
                    && subtree_has_matching_subject(fallback, selector, ancestors)
                {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}
