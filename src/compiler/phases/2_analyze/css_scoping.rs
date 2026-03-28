//! CSS selector-to-element matching for scoped hash application.
//!
//! This module implements proper CSS selector matching against template elements,
//! mirroring the official compiler's css-prune.js. It considers combinators
//! (>, space, +, ~) when determining which elements should be scoped.

use std::collections::HashMap;

use crate::ast::template::{self, Fragment, TemplateNode};

/// Represents the value of an attribute for CSS matching purposes.
#[derive(Debug, Clone)]
pub enum AttrValue {
    /// Boolean attribute (e.g., `<div hidden>`)
    Boolean,
    /// Static text value (e.g., `<div class="foo">`)
    Static(String),
    /// Dynamic/expression value that can't be statically determined
    Dynamic,
}

/// Info about a template element for CSS matching.
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct ElementInfo {
    pub tag_name: String,
    pub has_spread: bool,
    pub classes: Vec<String>,
    pub ids: Vec<String>,
    pub has_dynamic_class: bool,
    /// Whether this is a dynamic element (<svelte:element>), which matches any type selector
    pub is_dynamic: bool,
    /// All attributes on the element (name, value pairs)
    pub attributes: Vec<(String, AttrValue)>,
    /// Whether there's a bind:xxx directive (attribute name -> true)
    pub bind_names: Vec<String>,
    /// Whether there's a style directive
    pub has_style_directive: bool,
    /// Whether the element has a class directive
    pub class_directive_names: Vec<String>,
}

impl ElementInfo {
    pub fn from_element(el: &template::RegularElement) -> Self {
        Self::from_attributes(&el.name, &el.attributes, false)
    }

    pub fn from_svelte_element(el: &template::SvelteDynamicElement) -> Self {
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
        let mut attr_pairs: Vec<(String, AttrValue)> = Vec::new();
        let mut bind_names = Vec::new();
        let mut has_style_directive = false;
        let mut class_directive_names = Vec::new();

        for attr in attributes {
            match attr {
                Attribute::Attribute(a) => {
                    let attr_name = a.name.to_string();
                    match &a.value {
                        template::AttributeValue::True(_) => {
                            // Boolean attribute
                            attr_pairs.push((attr_name.clone(), AttrValue::Boolean));
                        }
                        template::AttributeValue::Sequence(parts) => {
                            let mut static_parts = Vec::new();
                            let mut is_all_text = true;
                            for part in parts {
                                if let template::AttributeValuePart::Text(text) = part {
                                    static_parts.push(text.data.to_string());
                                } else {
                                    is_all_text = false;
                                }
                            }
                            if is_all_text && !static_parts.is_empty() {
                                let full_value = static_parts.join("");
                                attr_pairs.push((
                                    attr_name.clone(),
                                    AttrValue::Static(full_value.clone()),
                                ));
                                if attr_name == "class" {
                                    for class in full_value.split_whitespace() {
                                        classes.push(class.to_string());
                                    }
                                } else if attr_name == "id" {
                                    ids.push(full_value);
                                }
                            } else {
                                attr_pairs.push((attr_name.clone(), AttrValue::Dynamic));
                                if attr_name == "class" {
                                    for part in parts {
                                        if let template::AttributeValuePart::Text(text) = part {
                                            for class in text.data.split_whitespace() {
                                                classes.push(class.to_string());
                                            }
                                        }
                                    }
                                    has_dynamic_class = true;
                                }
                            }
                        }
                        template::AttributeValue::Expression(_) => {
                            attr_pairs.push((attr_name.clone(), AttrValue::Dynamic));
                            if attr_name == "class" {
                                has_dynamic_class = true;
                            }
                        }
                    }
                }
                Attribute::ClassDirective(cd) => {
                    classes.push(cd.name.to_string());
                    class_directive_names.push(cd.name.to_string());
                }
                Attribute::SpreadAttribute(_) => {
                    has_spread = true;
                }
                Attribute::BindDirective(bd) => {
                    bind_names.push(bd.name.to_string());
                }
                Attribute::StyleDirective(_) => {
                    has_style_directive = true;
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
            attributes: attr_pairs,
            bind_names,
            has_style_directive,
            class_directive_names,
        }
    }
}

/// Parsed CSS simple selector.
#[derive(Debug, Clone)]
pub enum CssSimpleSelector {
    Type(String),
    Class(String),
    Id(String),
    /// Attribute selector with optional name, matcher, value, flags
    Attribute {
        name: String,
        matcher: Option<String>,
        value: Option<String>,
        flags: Option<String>,
    },
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
            Some(CssSimpleSelector::Class(decode_css_escape(&name)))
        }
        "IdSelector" => {
            let name = sel.get("name")?.as_str()?.to_string();
            Some(CssSimpleSelector::Id(decode_css_escape(&name)))
        }
        "AttributeSelector" => {
            let name = sel
                .get("name")
                .and_then(|n| n.as_str())
                .unwrap_or("")
                .to_string();
            let matcher = sel
                .get("matcher")
                .and_then(|m| if m.is_null() { None } else { m.as_str() })
                .map(|s| s.to_string());
            let value = sel
                .get("value")
                .and_then(|v| if v.is_null() { None } else { v.as_str() })
                .map(|s| s.to_string());
            let flags = sel
                .get("flags")
                .and_then(|f| if f.is_null() { None } else { f.as_str() })
                .map(|s| s.to_string());
            Some(CssSimpleSelector::Attribute {
                name,
                matcher,
                value,
                flags,
            })
        }
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

/// HTML attributes whose enumerated values are case-insensitive per the HTML spec.
const CASE_INSENSITIVE_ATTRIBUTES: &[&str] = &[
    "accept-charset",
    "autocapitalize",
    "autocomplete",
    "behavior",
    "charset",
    "crossorigin",
    "decoding",
    "dir",
    "direction",
    "draggable",
    "enctype",
    "enterkeyhint",
    "fetchpriority",
    "formenctype",
    "formmethod",
    "formtarget",
    "hidden",
    "http-equiv",
    "inputmode",
    "kind",
    "loading",
    "method",
    "preload",
    "referrerpolicy",
    "rel",
    "rev",
    "role",
    "rules",
    "scope",
    "shape",
    "spellcheck",
    "target",
    "translate",
    "type",
    "valign",
    "wrap",
];

/// Whitelisted attributes for specific elements that should be considered as matching.
fn whitelist_attribute_selector(tag_name: &str) -> &'static [&'static str] {
    match tag_name.to_lowercase().as_str() {
        "details" => &["open"],
        "dialog" => &["open"],
        _ => &[],
    }
}

/// Unquote a CSS string value (remove surrounding quotes if present).
fn unquote(s: &str) -> &str {
    if s.len() >= 2 {
        let first = s.as_bytes()[0];
        let last = s.as_bytes()[s.len() - 1];
        if (first == b'"' || first == b'\'') && first == last {
            return &s[1..s.len() - 1];
        }
    }
    s
}

/// Test an attribute value against a CSS attribute selector operator.
fn test_attribute(operator: &str, expected: &str, case_insensitive: bool, value: &str) -> bool {
    let (expected, value) = if case_insensitive {
        (expected.to_lowercase(), value.to_lowercase())
    } else {
        (expected.to_string(), value.to_string())
    };
    match operator {
        "=" => value == expected,
        "~=" => value.split_whitespace().any(|w| w == expected),
        "|=" => format!("{}-", value).starts_with(&format!("{}-", expected)),
        "^=" => value.starts_with(&expected),
        "$=" => value.ends_with(&expected),
        "*=" => value.contains(&expected),
        _ => false,
    }
}

/// Check if an element's attributes match a CSS attribute selector.
fn attribute_matches(
    element: &ElementInfo,
    attr_name: &str,
    expected_value: Option<&str>,
    operator: Option<&str>,
    case_insensitive: bool,
) -> bool {
    // SpreadAttribute makes any attribute potentially present
    if element.has_spread {
        return true;
    }

    let attr_name_lower = attr_name.to_lowercase();

    // Check bind directives
    for bind_name in &element.bind_names {
        if bind_name == attr_name {
            return true;
        }
    }

    // Check style directive
    if attr_name_lower == "style" && element.has_style_directive {
        return true;
    }

    // Check class directive
    if attr_name_lower == "class" {
        for cd_name in &element.class_directive_names {
            if let Some(op) = operator {
                if op == "~=" {
                    if let Some(expected) = expected_value
                        && cd_name == expected
                    {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        }
    }

    // Check regular attributes
    for (name, value) in &element.attributes {
        if name.to_lowercase() != attr_name_lower {
            continue;
        }

        match value {
            AttrValue::Boolean => {
                // Boolean attribute: matches [attr] but not [attr="value"]
                return operator.is_none();
            }
            AttrValue::Dynamic => {
                // Dynamic attribute: can't determine the value, so assume it could match
                return true;
            }
            AttrValue::Static(attr_val) => {
                // Static attribute: check against the value
                if expected_value.is_none() {
                    return true;
                }
                if let (Some(op), Some(expected)) = (operator, expected_value) {
                    let matches = test_attribute(op, expected, case_insensitive, attr_val);
                    // continue if we still may match against a class/style directive
                    if !matches && (attr_name_lower == "class" || attr_name_lower == "style") {
                        continue;
                    }
                    return matches;
                }
            }
        }
    }

    false
}

/// Check if a relative selector is global or global-like.
fn is_relative_selector_global(rel: &CssRelativeSelector) -> bool {
    if rel.is_global || rel.is_global_like {
        return true;
    }

    // Check if it's a :global selector (with or without args) as the only simple selector
    if rel.selectors.len() == 1
        && let CssSimpleSelector::PseudoClass(name, _) = &rel.selectors[0]
        && name == "global"
    {
        return true;
    }

    // Check for global-like pseudo-classes
    if rel.selectors.len() == 1
        && let CssSimpleSelector::PseudoClass(name, args) = &rel.selectors[0]
        && is_unscoped_pseudo_class(name, args.is_some())
    {
        return true;
    }

    false
}

/// Check if a pseudo-class is unscoped.
fn is_unscoped_pseudo_class(name: &str, has_args: bool) -> bool {
    match name {
        "host" | "root" => !has_args,
        _ => false,
    }
}

/// Check if an element matches a set of simple selectors (one RelativeSelector).
fn element_matches_simple_selectors(
    element: &ElementInfo,
    selectors: &[CssSimpleSelector],
) -> bool {
    for selector in selectors {
        match selector {
            CssSimpleSelector::Type(name) => {
                if name != "*"
                    && !element.is_dynamic
                    && !name.eq_ignore_ascii_case(&element.tag_name)
                {
                    return false;
                }
            }
            CssSimpleSelector::Class(name) => {
                if !attribute_matches(element, "class", Some(name), Some("~="), false) {
                    return false;
                }
            }
            CssSimpleSelector::Id(name) => {
                if !attribute_matches(element, "id", Some(name), Some("="), false) {
                    return false;
                }
            }
            CssSimpleSelector::Attribute {
                name,
                matcher,
                value,
                flags,
            } => {
                // Check whitelisted attributes
                let whitelisted = whitelist_attribute_selector(&element.tag_name);
                if whitelisted.iter().any(|w| w.eq_ignore_ascii_case(name)) {
                    continue;
                }

                let expected_value = value.as_deref().map(unquote);

                let ci = flags.as_deref().map(|f| f.contains('i')).unwrap_or(false)
                    || (!flags.as_deref().map(|f| f.contains('s')).unwrap_or(false)
                        && CASE_INSENSITIVE_ATTRIBUTES
                            .iter()
                            .any(|a| a.eq_ignore_ascii_case(name)));

                if !attribute_matches(element, name, expected_value, matcher.as_deref(), ci) {
                    return false;
                }
            }
            CssSimpleSelector::PseudoClass(name, args) => {
                if name == "host" || name == "root" {
                    return false;
                }
                if name == "global" && args.is_none() {
                    return true;
                }
                if name == "global" && args.is_some() {
                    let args = args.as_ref().unwrap();
                    if !args.is_empty() && selectors.len() == 1 {
                        let cs = &args[0];
                        if let Some(last) = cs.children.last() {
                            return element_matches_simple_selectors(element, &last.selectors);
                        }
                    }
                    continue;
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

/// Truncate trailing global selectors from a complex selector's children.
fn truncate_globals(children: &[CssRelativeSelector]) -> &[CssRelativeSelector] {
    let last_non_global = children
        .iter()
        .rposition(|rel| !is_relative_selector_global(rel));
    match last_non_global {
        Some(idx) => &children[..=idx],
        None => &[],
    }
}

/// Check if a complex selector has a sibling combinator (+ or ~).
fn has_sibling_combinator(selector: &CssComplexSelector) -> bool {
    let effective = truncate_globals(&selector.children);
    effective.iter().any(|rel| {
        rel.combinator
            .as_deref()
            .is_some_and(|c| c == "+" || c == "~")
    })
}

/// Extract the callee name from a RenderTag expression.
fn get_render_tag_callee_name(render_tag: &template::RenderTag) -> Option<String> {
    // Use JSON-based approach to avoid arena dependency
    let expr_json = render_tag.expression.as_json();
    let expr = if expr_json.get("type").and_then(|t| t.as_str()) == Some("ChainExpression") {
        expr_json.get("expression").unwrap_or(expr_json)
    } else {
        expr_json
    };
    let callee = expr.get("callee")?;
    if callee.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        callee
            .get("name")
            .and_then(|n| n.as_str())
            .map(String::from)
    } else {
        None
    }
}

/// Extract the name of a SnippetBlock from its expression.
fn get_snippet_block_name(snippet: &template::SnippetBlock) -> Option<String> {
    snippet.expression.identifier_name().map(String::from)
}

/// Mapping from snippet name to the list of ancestor chains at each render site.
type SnippetAncestorMap = HashMap<String, Vec<Vec<ElementInfo>>>;

/// Pre-pass: Walk the template tree to collect render site ancestor chains.
fn collect_render_site_ancestors(fragment: &Fragment) -> SnippetAncestorMap {
    let mut map: SnippetAncestorMap = HashMap::new();
    let mut ancestors: Vec<ElementInfo> = Vec::new();
    collect_render_sites_in_fragment(fragment, &mut ancestors, &mut map);
    map
}

fn collect_render_sites_in_fragment(
    fragment: &Fragment,
    ancestors: &mut Vec<ElementInfo>,
    map: &mut SnippetAncestorMap,
) {
    for node in &fragment.nodes {
        collect_render_sites_in_node(node, ancestors, map);
    }
}

fn collect_render_sites_in_node(
    node: &TemplateNode,
    ancestors: &mut Vec<ElementInfo>,
    map: &mut SnippetAncestorMap,
) {
    match node {
        TemplateNode::RegularElement(el) => {
            let element_info = ElementInfo::from_element(el);
            ancestors.push(element_info);
            collect_render_sites_in_fragment(&el.fragment, ancestors, map);
            ancestors.pop();
        }
        TemplateNode::SvelteElement(el) => {
            let element_info = ElementInfo::from_svelte_element(el);
            ancestors.push(element_info);
            collect_render_sites_in_fragment(&el.fragment, ancestors, map);
            ancestors.pop();
        }
        TemplateNode::RenderTag(render_tag) => {
            if let Some(name) = get_render_tag_callee_name(render_tag) {
                map.entry(name).or_default().push(ancestors.clone());
            }
        }
        TemplateNode::Component(comp) => {
            collect_render_sites_in_fragment(&comp.fragment, ancestors, map);
        }
        TemplateNode::IfBlock(if_block) => {
            collect_render_sites_in_fragment(&if_block.consequent, ancestors, map);
            if let Some(ref alt) = if_block.alternate {
                collect_render_sites_in_fragment(alt, ancestors, map);
            }
        }
        TemplateNode::EachBlock(each) => {
            collect_render_sites_in_fragment(&each.body, ancestors, map);
            if let Some(ref fallback) = each.fallback {
                collect_render_sites_in_fragment(fallback, ancestors, map);
            }
        }
        TemplateNode::AwaitBlock(await_block) => {
            if let Some(ref pending) = await_block.pending {
                collect_render_sites_in_fragment(pending, ancestors, map);
            }
            if let Some(ref then) = await_block.then {
                collect_render_sites_in_fragment(then, ancestors, map);
            }
            if let Some(ref catch) = await_block.catch {
                collect_render_sites_in_fragment(catch, ancestors, map);
            }
        }
        TemplateNode::KeyBlock(key) => {
            collect_render_sites_in_fragment(&key.fragment, ancestors, map);
        }
        TemplateNode::SnippetBlock(snippet) => {
            collect_render_sites_in_fragment(&snippet.body, ancestors, map);
        }
        TemplateNode::SvelteHead(head) => {
            collect_render_sites_in_fragment(&head.fragment, ancestors, map);
        }
        TemplateNode::SlotElement(slot) => {
            collect_render_sites_in_fragment(&slot.fragment, ancestors, map);
        }
        TemplateNode::TitleElement(title) => {
            collect_render_sites_in_fragment(&title.fragment, ancestors, map);
        }
        _ => {}
    }
}

/// Mark RegularElement nodes in the fragment as scoped based on CSS selector matching.
pub fn mark_elements_scoped(fragment: &mut Fragment, css_selectors: &[CssComplexSelector]) {
    // Pre-pass: collect render site ancestors for each snippet
    let snippet_ancestors = collect_render_site_ancestors(fragment);
    let mut ancestors: Vec<ElementInfo> = Vec::new();
    mark_elements_in_fragment(fragment, css_selectors, &mut ancestors, &snippet_ancestors);
}

/// Walk a fragment and mark elements as scoped.
fn mark_elements_in_fragment(
    fragment: &mut Fragment,
    css_selectors: &[CssComplexSelector],
    ancestors: &mut Vec<ElementInfo>,
    snippet_ancestors: &SnippetAncestorMap,
) {
    // First pass: mark elements that match CSS selectors directly (type/class/id/ancestor matching)
    for node in &mut fragment.nodes {
        process_node_scoping(node, css_selectors, ancestors, snippet_ancestors);
    }

    // Second pass: handle sibling combinators
    // This needs to find all elements that could be siblings (including across block boundaries)
    // and mark matching ones as scoped.
    process_sibling_selectors(fragment, css_selectors, ancestors, snippet_ancestors);

    // Third pass: propagate scoping to ancestor elements
    propagate_ancestor_scoping(fragment, css_selectors, ancestors, snippet_ancestors);
}

/// Process a single node for direct CSS selector matching.
fn process_node_scoping(
    node: &mut TemplateNode,
    css_selectors: &[CssComplexSelector],
    ancestors: &mut Vec<ElementInfo>,
    snippet_ancestors: &SnippetAncestorMap,
) {
    match node {
        TemplateNode::RegularElement(el) => {
            let element_info = ElementInfo::from_element(el);
            el.metadata.scoped = css_selectors.iter().any(|selector| {
                complex_selector_matches_element(selector, &element_info, ancestors)
            });
            ancestors.push(element_info);
            for child in &mut el.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
            ancestors.pop();
        }
        TemplateNode::SvelteElement(el) => {
            let element_info = ElementInfo::from_svelte_element(el);
            el.metadata.scoped = css_selectors.iter().any(|selector| {
                complex_selector_matches_element(selector, &element_info, ancestors)
            });
            ancestors.push(element_info);
            for child in &mut el.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
            ancestors.pop();
        }
        TemplateNode::Component(comp) => {
            for child in &mut comp.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        TemplateNode::IfBlock(if_block) => {
            for child in &mut if_block.consequent.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
            if let Some(ref mut alt) = if_block.alternate {
                for child in &mut alt.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
        }
        TemplateNode::EachBlock(each) => {
            for child in &mut each.body.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
            if let Some(ref mut fallback) = each.fallback {
                for child in &mut fallback.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
        }
        TemplateNode::AwaitBlock(await_block) => {
            if let Some(ref mut pending) = await_block.pending {
                for child in &mut pending.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
            if let Some(ref mut then) = await_block.then {
                for child in &mut then.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
            if let Some(ref mut catch) = await_block.catch {
                for child in &mut catch.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
        }
        TemplateNode::KeyBlock(key) => {
            for child in &mut key.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        TemplateNode::SnippetBlock(snippet) => {
            // Get the snippet name and look up render site ancestors
            let snippet_name = get_snippet_block_name(snippet);
            let render_ancestors = snippet_name
                .as_ref()
                .and_then(|name| snippet_ancestors.get(name));

            if let Some(render_site_chains) = render_ancestors {
                // Process snippet body with each render site's ancestor chain.
                // This ensures elements inside snippets inherit CSS scoping from
                // where they are rendered ({@render} call site), not where defined.
                for site_ancestors in render_site_chains {
                    let mut merged = site_ancestors.clone();
                    for child in &mut snippet.body.nodes {
                        process_node_scoping(child, css_selectors, &mut merged, snippet_ancestors);
                    }
                }
            } else {
                // No render sites found (or dynamic render), process with current ancestors
                for child in &mut snippet.body.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
        }
        TemplateNode::SvelteHead(head) => {
            for child in &mut head.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        TemplateNode::SlotElement(slot) => {
            for child in &mut slot.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        TemplateNode::TitleElement(title) => {
            for child in &mut title.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        _ => {}
    }
}

use std::collections::HashSet;

/// An element with its start/end position for identification in the marking pass.
#[derive(Debug, Clone)]
struct SiblingElementInfo {
    info: ElementInfo,
    start: u32,
    end: u32,
}

/// A path segment describing where a node sits: a fragment and position within it.
/// We use the fragment's raw pointer as identity since we only hold immutable refs.
#[derive(Debug, Clone)]
struct PathSegment<'a> {
    fragment: &'a Fragment,
    node_index: usize,
}

/// Process sibling selectors for a fragment.
/// Uses a path-based approach that mirrors the official compiler's get_possible_element_siblings.
/// Phase 1: Walk the tree immutably, collecting which elements need to be scoped (as start/end positions).
/// Phase 2: Walk the tree mutably and mark the collected elements.
fn process_sibling_selectors(
    fragment: &mut Fragment,
    css_selectors: &[CssComplexSelector],
    ancestors: &[ElementInfo],
    snippet_ancestors: &SnippetAncestorMap,
) {
    let sibling_selectors: Vec<&CssComplexSelector> = css_selectors
        .iter()
        .filter(|s| has_sibling_combinator(s))
        .collect();

    if !sibling_selectors.is_empty() {
        // Phase 1: Collect elements to scope (immutable)
        let mut elements_to_scope: HashSet<(u32, u32)> = HashSet::new();
        collect_sibling_scoping(
            fragment,
            &sibling_selectors,
            ancestors,
            &[],
            &mut elements_to_scope,
        );

        // Phase 2: Mark collected elements as scoped (mutable)
        if !elements_to_scope.is_empty() {
            apply_scoping_marks(fragment, &elements_to_scope);
        }
    }

    // Recurse into child elements for their own sibling handling
    recurse_sibling_processing(fragment, css_selectors, ancestors, snippet_ancestors);
}

/// Walk the tree immutably, finding all sibling relationships and recording which
/// elements need to be scoped. The `path` tracks the nesting context so we can
/// walk up through block boundaries to find siblings (like the official compiler).
fn collect_sibling_scoping<'a>(
    fragment: &'a Fragment,
    sibling_selectors: &[&CssComplexSelector],
    ancestors: &[ElementInfo],
    path: &[PathSegment<'a>],
    elements_to_scope: &mut HashSet<(u32, u32)>,
) {
    for (i, node) in fragment.nodes.iter().enumerate() {
        let current_path_segment = PathSegment {
            fragment,
            node_index: i,
        };

        match node {
            TemplateNode::RegularElement(el) => {
                let elem_info = SiblingElementInfo {
                    info: ElementInfo::from_element(el),
                    start: el.start,
                    end: el.end,
                };
                check_element_as_subject(
                    &elem_info,
                    fragment,
                    i,
                    path,
                    sibling_selectors,
                    ancestors,
                    elements_to_scope,
                );
            }
            TemplateNode::SvelteElement(el) => {
                let elem_info = SiblingElementInfo {
                    info: ElementInfo::from_svelte_element(el),
                    start: el.start,
                    end: el.end,
                };
                check_element_as_subject(
                    &elem_info,
                    fragment,
                    i,
                    path,
                    sibling_selectors,
                    ancestors,
                    elements_to_scope,
                );
            }
            TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_) => {
                // Recurse into block fragments with updated path
                let mut new_path = path.to_vec();
                new_path.push(current_path_segment);

                let block_frags = get_block_fragments_ref(node);
                for bf in block_frags {
                    collect_sibling_scoping(
                        bf,
                        sibling_selectors,
                        ancestors,
                        &new_path,
                        elements_to_scope,
                    );
                }

                // Each block wrap-around: last elements can be siblings of first elements
                if let TemplateNode::EachBlock(each) = node {
                    check_each_wrap_around(
                        &each.body,
                        sibling_selectors,
                        ancestors,
                        elements_to_scope,
                    );
                }
            }
            _ => {}
        }
    }
}

/// Check if an element is a subject of any sibling selector and if so,
/// find matching siblings by walking up through the path.
fn check_element_as_subject(
    elem: &SiblingElementInfo,
    fragment: &Fragment,
    node_index: usize,
    path: &[PathSegment],
    sibling_selectors: &[&CssComplexSelector],
    ancestors: &[ElementInfo],
    elements_to_scope: &mut HashSet<(u32, u32)>,
) {
    for selector in sibling_selectors {
        let effective = truncate_globals(&selector.children);
        if effective.len() < 2 {
            continue;
        }

        let last = &effective[effective.len() - 1];
        if !element_matches_simple_selectors(&elem.info, &last.selectors) {
            continue;
        }

        let combinator = last.combinator.as_deref().unwrap_or(" ");
        if combinator != "+" && combinator != "~" {
            continue;
        }

        let adjacent_only = combinator == "+";
        let prev_sel = &effective[effective.len() - 2];

        // Get all possible previous siblings, walking up through block boundaries
        let siblings =
            get_possible_previous_siblings_via_path(fragment, node_index, adjacent_only, path);

        for sibling in &siblings {
            if element_matches_simple_selectors(&sibling.info, &prev_sel.selectors) {
                // Check ancestor chain if needed
                if effective.len() > 2 {
                    let ancestor_part = &effective[..effective.len() - 2];
                    let prev_combinator = prev_sel.combinator.as_deref().unwrap_or(" ");
                    if (prev_combinator == " " || prev_combinator == ">")
                        && !check_ancestor_chain(ancestor_part, prev_sel, ancestors)
                    {
                        continue;
                    }
                }
                // Mark both the subject and the sibling
                elements_to_scope.insert((elem.start, elem.end));
                elements_to_scope.insert((sibling.start, sibling.end));
            }
        }
    }
}

/// Get all possible previous siblings for an element at (fragment, node_index),
/// walking up through block boundaries via the path.
/// This mirrors the official compiler's get_possible_element_siblings.
fn get_possible_previous_siblings_via_path(
    fragment: &Fragment,
    node_index: usize,
    adjacent_only: bool,
    path: &[PathSegment],
) -> Vec<SiblingElementInfo> {
    let mut result = Vec::new();

    // First, look backward in the current fragment
    let mut found_definite =
        collect_previous_siblings_in_fragment(fragment, node_index, adjacent_only, &mut result);

    if adjacent_only && found_definite {
        return result;
    }

    // Walk up through the path (block boundaries)
    for segment in path.iter().rev() {
        let parent_fragment = segment.fragment;
        let block_index = segment.node_index;
        let block_node = &parent_fragment.nodes[block_index];

        // Check if this is an each block - if so, add wrap-around siblings.
        // Important: wrap-around siblings never cause early termination (matching official compiler).
        if let TemplateNode::EachBlock(_) = block_node {
            let mut _ignored = false;
            collect_last_elements_from_block_recursive(
                block_node,
                adjacent_only,
                &mut result,
                &mut _ignored,
            );
        }

        // Look backward from the block's position in the parent fragment
        found_definite |= collect_previous_siblings_in_fragment(
            parent_fragment,
            block_index,
            adjacent_only,
            &mut result,
        );

        if adjacent_only && found_definite {
            return result;
        }

        // Check if the parent node is a block or component - if not, stop walking up
        if block_index < parent_fragment.nodes.len() {
            let parent_node = &parent_fragment.nodes[block_index];
            if !is_block_node(parent_node) {
                break;
            }
        }
    }

    result
}

/// Collect previous siblings by looking backward in a fragment from a given position.
/// Returns true if a definite (RegularElement) sibling was found.
fn collect_previous_siblings_in_fragment(
    fragment: &Fragment,
    node_index: usize,
    adjacent_only: bool,
    result: &mut Vec<SiblingElementInfo>,
) -> bool {
    let mut i = node_index;
    let mut found_definite = false;

    while i > 0 {
        i -= 1;
        let node = &fragment.nodes[i];
        match node {
            TemplateNode::RegularElement(el) => {
                let has_slot_attr = el.attributes.iter().any(|attr| {
                    if let template::Attribute::Attribute(a) = attr {
                        a.name.as_str().eq_ignore_ascii_case("slot")
                    } else {
                        false
                    }
                });
                if !has_slot_attr {
                    result.push(SiblingElementInfo {
                        info: ElementInfo::from_element(el),
                        start: el.start,
                        end: el.end,
                    });
                    found_definite = true;
                    if adjacent_only {
                        return true;
                    }
                }
            }
            TemplateNode::SvelteElement(el) => {
                result.push(SiblingElementInfo {
                    info: ElementInfo::from_svelte_element(el),
                    start: el.start,
                    end: el.end,
                });
                // Don't set found_definite - svelte:element might resolve to nothing
            }
            TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_) => {
                // Elements inside blocks are "probable" not "definite" because the block
                // might not render (each with 0 items, if with false condition, etc.).
                // We need to check if the block is exhaustive (all branches have elements)
                // to determine if the block provides a definite barrier.
                let block_definite = block_has_definite_elements(node);
                let mut _ignored = false;
                collect_last_elements_from_block_recursive(
                    node,
                    adjacent_only,
                    result,
                    &mut _ignored,
                );
                if block_definite {
                    found_definite = true;
                }
                if adjacent_only && found_definite {
                    return true;
                }
            }
            TemplateNode::Component(_) | TemplateNode::SlotElement(_) => {
                let mut _ignored = false;
                collect_last_elements_from_block_recursive(
                    node,
                    adjacent_only,
                    result,
                    &mut _ignored,
                );
            }
            _ => {}
        }
    }

    found_definite
}

/// Recursively collect the last (backward direction) elements from inside a block node.
/// Mirrors the official compiler's get_possible_nested_siblings + loop_child.
///
/// The key insight: elements from non-exhaustive blocks are "probable" (not "definite"),
/// which means they should NOT stop the adjacent-only search in the parent.
fn collect_last_elements_from_block_recursive(
    node: &TemplateNode,
    adjacent_only: bool,
    result: &mut Vec<SiblingElementInfo>,
    found_definite: &mut bool,
) {
    let fragments = get_block_fragments_ref(node);
    let is_slot_or_snippet = matches!(
        node,
        TemplateNode::SlotElement(_) | TemplateNode::SnippetBlock(_)
    );

    let mut exhaustive = !is_slot_or_snippet;
    let mut all_fragment_results: Vec<(Vec<SiblingElementInfo>, bool)> = Vec::new();

    for fragment in &fragments {
        let (frag_results, frag_has_definite) = loop_child_backward(&fragment.nodes, adjacent_only);
        exhaustive = exhaustive && frag_has_definite;
        all_fragment_results.push((frag_results, frag_has_definite));
    }

    // If any fragment is missing (e.g., no else branch, no fallback), not exhaustive
    match node {
        TemplateNode::IfBlock(if_block) => {
            if if_block.alternate.is_none() {
                exhaustive = false;
            }
        }
        TemplateNode::EachBlock(each) => {
            if each.fallback.is_none() {
                exhaustive = false;
            }
        }
        TemplateNode::AwaitBlock(ab) => {
            if ab.pending.is_none() || ab.then.is_none() || ab.catch.is_none() {
                exhaustive = false;
            }
        }
        _ => {}
    }

    // Add all results
    for (frag_results, _) in all_fragment_results {
        result.extend(frag_results);
    }

    // Only set found_definite if the block is exhaustive
    if exhaustive {
        *found_definite = true;
    }
}

/// Walk backward through a fragment's nodes collecting elements (like loop_child in the official compiler).
/// Returns the elements found and whether any definite elements were found.
fn loop_child_backward(
    nodes: &[TemplateNode],
    adjacent_only: bool,
) -> (Vec<SiblingElementInfo>, bool) {
    let mut result = Vec::new();
    let mut found_definite = false;

    let mut i = nodes.len();
    while i > 0 {
        i -= 1;
        match &nodes[i] {
            TemplateNode::RegularElement(el) => {
                result.push(SiblingElementInfo {
                    info: ElementInfo::from_element(el),
                    start: el.start,
                    end: el.end,
                });
                found_definite = true;
                if adjacent_only {
                    break;
                }
            }
            TemplateNode::SvelteElement(el) => {
                result.push(SiblingElementInfo {
                    info: ElementInfo::from_svelte_element(el),
                    start: el.start,
                    end: el.end,
                });
                // SvelteElement is PROBABLY - don't set found_definite, don't break
            }
            TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_) => {
                let mut child_definite = false;
                collect_last_elements_from_block_recursive(
                    &nodes[i],
                    adjacent_only,
                    &mut result,
                    &mut child_definite,
                );
                // Only break on adjacent_only if the child block provides definite elements
                if child_definite {
                    found_definite = true;
                    if adjacent_only {
                        break;
                    }
                }
            }
            _ => {}
        }
    }

    (result, found_definite)
}

/// Collect first elements from a block fragment (forward direction).
fn collect_first_elements_with_pos(fragment: &Fragment) -> Vec<SiblingElementInfo> {
    let mut result = Vec::new();
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                result.push(SiblingElementInfo {
                    info: ElementInfo::from_element(el),
                    start: el.start,
                    end: el.end,
                });
                return result;
            }
            TemplateNode::SvelteElement(el) => {
                result.push(SiblingElementInfo {
                    info: ElementInfo::from_svelte_element(el),
                    start: el.start,
                    end: el.end,
                });
            }
            TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_) => {
                let block_frags = get_block_fragments_ref(node);
                for bf in block_frags {
                    result.extend(collect_first_elements_with_pos(bf));
                }
                if !result.is_empty() {
                    return result;
                }
            }
            _ => {}
        }
    }
    result
}

/// Collect last elements from a block fragment with position info.
fn collect_last_elements_with_pos(fragment: &Fragment) -> Vec<SiblingElementInfo> {
    let mut result = Vec::new();
    let mut found = false;
    collect_last_elements_from_fragment(fragment, false, &mut result, &mut found);
    result
}

fn collect_last_elements_from_fragment(
    fragment: &Fragment,
    adjacent_only: bool,
    result: &mut Vec<SiblingElementInfo>,
    found_definite: &mut bool,
) {
    let nodes = &fragment.nodes;
    let mut i = nodes.len();
    while i > 0 {
        i -= 1;
        match &nodes[i] {
            TemplateNode::RegularElement(el) => {
                result.push(SiblingElementInfo {
                    info: ElementInfo::from_element(el),
                    start: el.start,
                    end: el.end,
                });
                *found_definite = true;
                if adjacent_only {
                    return;
                }
            }
            TemplateNode::SvelteElement(el) => {
                result.push(SiblingElementInfo {
                    info: ElementInfo::from_svelte_element(el),
                    start: el.start,
                    end: el.end,
                });
            }
            TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_) => {
                collect_last_elements_from_block_recursive(
                    &nodes[i],
                    adjacent_only,
                    result,
                    found_definite,
                );
                if adjacent_only && *found_definite {
                    return;
                }
            }
            _ => {}
        }
    }
}

/// Check each-block wrap-around: last elements in body can be siblings of first elements.
fn check_each_wrap_around(
    body: &Fragment,
    sibling_selectors: &[&CssComplexSelector],
    ancestors: &[ElementInfo],
    elements_to_scope: &mut HashSet<(u32, u32)>,
) {
    let last_elements = collect_last_elements_with_pos(body);
    let first_elements = collect_first_elements_with_pos(body);

    for first_elem in &first_elements {
        for selector in sibling_selectors {
            let effective = truncate_globals(&selector.children);
            if effective.len() < 2 {
                continue;
            }

            let last_sel = &effective[effective.len() - 1];
            if !element_matches_simple_selectors(&first_elem.info, &last_sel.selectors) {
                continue;
            }

            let combinator = last_sel.combinator.as_deref().unwrap_or(" ");
            if combinator != "+" && combinator != "~" {
                continue;
            }

            let prev_sel = &effective[effective.len() - 2];

            for sibling in &last_elements {
                if element_matches_simple_selectors(&sibling.info, &prev_sel.selectors) {
                    if effective.len() > 2 {
                        let ancestor_part = &effective[..effective.len() - 2];
                        let prev_combinator = prev_sel.combinator.as_deref().unwrap_or(" ");
                        if (prev_combinator == " " || prev_combinator == ">")
                            && !check_ancestor_chain(ancestor_part, prev_sel, ancestors)
                        {
                            continue;
                        }
                    }
                    elements_to_scope.insert((first_elem.start, first_elem.end));
                    elements_to_scope.insert((sibling.start, sibling.end));
                }
            }
        }
    }
}

/// Check if a node is a block node (if/each/await/key).
fn is_block_node(node: &TemplateNode) -> bool {
    matches!(
        node,
        TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_)
    )
}

/// Check if a block node has definite elements in ALL its branches.
/// A block is exhaustive (provides a definite barrier) only if every possible
/// branch produces at least one definite element.
fn block_has_definite_elements(node: &TemplateNode) -> bool {
    match node {
        TemplateNode::IfBlock(if_block) => {
            // Both consequent and alternate must have definite elements.
            // If there's no alternate, the block is NOT exhaustive.
            let consequent_definite = fragment_has_definite_element(&if_block.consequent);
            let alternate_definite = if_block
                .alternate
                .as_ref()
                .is_some_and(fragment_has_definite_element);
            consequent_definite && alternate_definite
        }
        TemplateNode::EachBlock(each) => {
            // Body AND fallback must both have definite elements.
            // If there's no fallback, the each could produce 0 items -> not exhaustive.
            let body_definite = fragment_has_definite_element(&each.body);
            let fallback_definite = each
                .fallback
                .as_ref()
                .is_some_and(fragment_has_definite_element);
            body_definite && fallback_definite
        }
        TemplateNode::AwaitBlock(await_block) => {
            // All present branches must have definite elements, and at least
            // pending+then+catch must all be present.
            let pending_ok = await_block
                .pending
                .as_ref()
                .is_some_and(fragment_has_definite_element);
            let then_ok = await_block
                .then
                .as_ref()
                .is_some_and(fragment_has_definite_element);
            let catch_ok = await_block
                .catch
                .as_ref()
                .is_some_and(fragment_has_definite_element);
            pending_ok && then_ok && catch_ok
        }
        TemplateNode::KeyBlock(key) => fragment_has_definite_element(&key.fragment),
        _ => false,
    }
}

/// Check if a fragment contains at least one definite element (RegularElement).
fn fragment_has_definite_element(fragment: &Fragment) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                let has_slot_attr = el.attributes.iter().any(|attr| {
                    if let template::Attribute::Attribute(a) = attr {
                        a.name.as_str().eq_ignore_ascii_case("slot")
                    } else {
                        false
                    }
                });
                if !has_slot_attr {
                    return true;
                }
            }
            TemplateNode::IfBlock(_)
            | TemplateNode::EachBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::KeyBlock(_) => {
                if block_has_definite_elements(node) {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// Apply scoping marks to elements whose (start, end) positions are in the set.
fn apply_scoping_marks(fragment: &mut Fragment, elements_to_scope: &HashSet<(u32, u32)>) {
    for node in &mut fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                if elements_to_scope.contains(&(el.start, el.end)) {
                    el.metadata.scoped = true;
                }
                apply_scoping_marks(&mut el.fragment, elements_to_scope);
            }
            TemplateNode::SvelteElement(el) => {
                if elements_to_scope.contains(&(el.start, el.end)) {
                    el.metadata.scoped = true;
                }
                apply_scoping_marks(&mut el.fragment, elements_to_scope);
            }
            TemplateNode::Component(comp) => {
                apply_scoping_marks(&mut comp.fragment, elements_to_scope);
            }
            TemplateNode::IfBlock(if_block) => {
                apply_scoping_marks(&mut if_block.consequent, elements_to_scope);
                if let Some(ref mut alt) = if_block.alternate {
                    apply_scoping_marks(alt, elements_to_scope);
                }
            }
            TemplateNode::EachBlock(each) => {
                apply_scoping_marks(&mut each.body, elements_to_scope);
                if let Some(ref mut fallback) = each.fallback {
                    apply_scoping_marks(fallback, elements_to_scope);
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    apply_scoping_marks(pending, elements_to_scope);
                }
                if let Some(ref mut then) = await_block.then {
                    apply_scoping_marks(then, elements_to_scope);
                }
                if let Some(ref mut catch) = await_block.catch {
                    apply_scoping_marks(catch, elements_to_scope);
                }
            }
            TemplateNode::KeyBlock(key) => {
                apply_scoping_marks(&mut key.fragment, elements_to_scope);
            }
            TemplateNode::SnippetBlock(snippet) => {
                apply_scoping_marks(&mut snippet.body, elements_to_scope);
            }
            TemplateNode::SvelteHead(head) => {
                apply_scoping_marks(&mut head.fragment, elements_to_scope);
            }
            TemplateNode::SlotElement(slot) => {
                apply_scoping_marks(&mut slot.fragment, elements_to_scope);
            }
            TemplateNode::TitleElement(title) => {
                apply_scoping_marks(&mut title.fragment, elements_to_scope);
            }
            _ => {}
        }
    }
}

/// Recurse into child elements for sibling processing.
fn recurse_sibling_processing(
    fragment: &mut Fragment,
    css_selectors: &[CssComplexSelector],
    ancestors: &[ElementInfo],
    snippet_ancestors: &SnippetAncestorMap,
) {
    for node in &mut fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                let ei = ElementInfo::from_element(el);
                let mut new_ancestors = ancestors.to_vec();
                new_ancestors.push(ei);
                process_sibling_selectors(
                    &mut el.fragment,
                    css_selectors,
                    &new_ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::SvelteElement(el) => {
                let ei = ElementInfo::from_svelte_element(el);
                let mut new_ancestors = ancestors.to_vec();
                new_ancestors.push(ei);
                process_sibling_selectors(
                    &mut el.fragment,
                    css_selectors,
                    &new_ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::Component(comp) => {
                process_sibling_selectors(
                    &mut comp.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::IfBlock(if_block) => {
                process_sibling_selectors(
                    &mut if_block.consequent,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
                if let Some(ref mut alt) = if_block.alternate {
                    process_sibling_selectors(alt, css_selectors, ancestors, snippet_ancestors);
                }
            }
            TemplateNode::EachBlock(each) => {
                process_sibling_selectors(
                    &mut each.body,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
                if let Some(ref mut fallback) = each.fallback {
                    process_sibling_selectors(
                        fallback,
                        css_selectors,
                        ancestors,
                        snippet_ancestors,
                    );
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    process_sibling_selectors(pending, css_selectors, ancestors, snippet_ancestors);
                }
                if let Some(ref mut then) = await_block.then {
                    process_sibling_selectors(then, css_selectors, ancestors, snippet_ancestors);
                }
                if let Some(ref mut catch) = await_block.catch {
                    process_sibling_selectors(catch, css_selectors, ancestors, snippet_ancestors);
                }
            }
            TemplateNode::KeyBlock(key) => {
                process_sibling_selectors(
                    &mut key.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::SnippetBlock(snippet) => {
                let snippet_name = get_snippet_block_name(snippet);
                let render_site_chains = snippet_name
                    .as_ref()
                    .and_then(|name| snippet_ancestors.get(name));
                if let Some(chains) = render_site_chains {
                    for site_anc in chains {
                        process_sibling_selectors(
                            &mut snippet.body,
                            css_selectors,
                            site_anc,
                            snippet_ancestors,
                        );
                    }
                } else {
                    process_sibling_selectors(
                        &mut snippet.body,
                        css_selectors,
                        ancestors,
                        snippet_ancestors,
                    );
                }
            }
            TemplateNode::SvelteHead(head) => {
                process_sibling_selectors(
                    &mut head.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::SlotElement(slot) => {
                process_sibling_selectors(
                    &mut slot.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::TitleElement(title) => {
                process_sibling_selectors(
                    &mut title.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            _ => {}
        }
    }
}

/// Get block fragment references (immutable).
fn get_block_fragments_ref(node: &TemplateNode) -> Vec<&Fragment> {
    match node {
        TemplateNode::IfBlock(if_block) => {
            let mut frags = vec![&if_block.consequent];
            if let Some(ref alt) = if_block.alternate {
                frags.push(alt);
            }
            frags
        }
        TemplateNode::EachBlock(each) => {
            let mut frags = vec![&each.body];
            if let Some(ref fallback) = each.fallback {
                frags.push(fallback);
            }
            frags
        }
        TemplateNode::AwaitBlock(await_block) => {
            let mut frags = Vec::new();
            if let Some(ref pending) = await_block.pending {
                frags.push(pending);
            }
            if let Some(ref then) = await_block.then {
                frags.push(then);
            }
            if let Some(ref catch) = await_block.catch {
                frags.push(catch);
            }
            frags
        }
        TemplateNode::KeyBlock(key) => vec![&key.fragment],
        TemplateNode::SnippetBlock(snippet) => vec![&snippet.body],
        TemplateNode::SlotElement(slot) => vec![&slot.fragment],
        TemplateNode::Component(comp) => vec![&comp.fragment],
        _ => vec![],
    }
}

/// Check ancestor chain for a sibling selector.
fn check_ancestor_chain(
    remaining: &[CssRelativeSelector],
    current_rel: &CssRelativeSelector,
    ancestors: &[ElementInfo],
) -> bool {
    apply_combinator_chain(remaining, current_rel, ancestors, ancestors.len())
}

/// Check if a complex selector matches an element, considering combinators.
fn complex_selector_matches_element(
    selector: &CssComplexSelector,
    element: &ElementInfo,
    ancestors: &[ElementInfo],
) -> bool {
    let children = &selector.children;
    if children.is_empty() {
        return false;
    }

    let effective_children = truncate_globals(children);
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

/// Check if a relative selector is a "bare" global (matches anything).
/// Returns false for `:global(specific_element)` which must still be matched.
fn is_bare_global(rel: &CssRelativeSelector) -> bool {
    if rel.is_global_like {
        return true;
    }
    // Bare :global (no args) is a wildcard
    if rel.selectors.len() == 1
        && let CssSimpleSelector::PseudoClass(name, args) = &rel.selectors[0]
    {
        if name == "global" && args.is_none() {
            return true;
        }
        if is_unscoped_pseudo_class(name, args.is_some()) {
            return true;
        }
    }
    false
}

/// Try to match an ancestor element against a global-with-args selector like `:global(b)`.
/// Extracts the inner selectors and checks if the element matches them.
fn global_selector_matches_element(rel: &CssRelativeSelector, element: &ElementInfo) -> bool {
    if rel.selectors.len() == 1
        && let CssSimpleSelector::PseudoClass(name, Some(args)) = &rel.selectors[0]
        && name == "global"
    {
        // Check if any complex selector in the args matches the element
        for cs in args {
            if let Some(last) = cs.children.last()
                && element_matches_simple_selectors(element, &last.selectors)
            {
                return true;
            }
        }
        return false;
    }
    false
}

/// Check if a relative selector can match a given element.
/// Handles both regular selectors and :global(x) selectors.
fn selector_matches_element(rel: &CssRelativeSelector, element: &ElementInfo) -> bool {
    if is_bare_global(rel) {
        return true;
    }
    if global_selector_matches_element(rel, element) {
        return true;
    }
    element_matches_simple_selectors(element, &rel.selectors)
}

/// Apply combinator chain backward through ancestors.
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
            let next_sel = &remaining[remaining.len() - 1];

            if cursor == 0 {
                // No more ancestors known - if remaining are all global (bare or typed),
                // they could match elements outside the component
                return remaining.iter().all(is_relative_selector_global);
            }

            let parent = &ancestors[cursor - 1];
            if selector_matches_element(next_sel, parent) {
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
            // Parent didn't match. For `>` combinator with a known parent,
            // the global fallback only applies when there are no parents (cursor == 0).
            false
        }
        " " => {
            let next_sel = &remaining[remaining.len() - 1];

            if is_bare_global(next_sel) {
                if remaining.len() == 1 {
                    return true;
                }
                for i in (0..cursor).rev() {
                    if apply_combinator_chain(
                        &remaining[..remaining.len() - 1],
                        next_sel,
                        ancestors,
                        i + 1,
                    ) {
                        return true;
                    }
                }
                return remaining.iter().all(is_relative_selector_global);
            }

            for i in (0..cursor).rev() {
                if selector_matches_element(next_sel, &ancestors[i]) {
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
            // No ancestor matched - fall back to global check
            remaining.iter().all(is_relative_selector_global)
        }
        "+" | "~" => {
            // Sibling combinators are handled by process_sibling_selectors
            // Return false here - the sibling processing pass will handle actual matching
            false
        }
        _ => true,
    }
}

/// Check if an element matches a non-subject (ancestor) part of a selector.
fn element_is_ancestor_in_matching_selector(
    element: &ElementInfo,
    selector: &CssComplexSelector,
) -> bool {
    let children = &selector.children;
    if children.len() < 2 {
        return false;
    }

    let effective_children = truncate_globals(children);
    if effective_children.len() < 2 {
        return false;
    }

    for (idx, child) in effective_children[..effective_children.len() - 1]
        .iter()
        .enumerate()
    {
        if element_matches_simple_selectors(element, &child.selectors) {
            let next = &effective_children[idx + 1];
            let comb = next.combinator.as_deref().unwrap_or(" ");
            if comb == " " || comb == ">" {
                return true;
            }
        }
    }

    false
}

/// Propagate scoping to ancestor elements.
fn propagate_ancestor_scoping(
    fragment: &mut Fragment,
    css_selectors: &[CssComplexSelector],
    ancestors: &[ElementInfo],
    snippet_ancestors: &SnippetAncestorMap,
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
                                &element_info,
                                ancestors,
                                snippet_ancestors,
                            )
                    });
                }

                let mut new_ancestors = ancestors.to_vec();
                new_ancestors.push(element_info);
                propagate_ancestor_scoping(
                    &mut el.fragment,
                    css_selectors,
                    &new_ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::Component(comp) => {
                propagate_ancestor_scoping(
                    &mut comp.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::IfBlock(if_block) => {
                propagate_ancestor_scoping(
                    &mut if_block.consequent,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
                if let Some(ref mut alt) = if_block.alternate {
                    propagate_ancestor_scoping(alt, css_selectors, ancestors, snippet_ancestors);
                }
            }
            TemplateNode::EachBlock(each) => {
                propagate_ancestor_scoping(
                    &mut each.body,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
                if let Some(ref mut fallback) = each.fallback {
                    propagate_ancestor_scoping(
                        fallback,
                        css_selectors,
                        ancestors,
                        snippet_ancestors,
                    );
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    propagate_ancestor_scoping(
                        pending,
                        css_selectors,
                        ancestors,
                        snippet_ancestors,
                    );
                }
                if let Some(ref mut then) = await_block.then {
                    propagate_ancestor_scoping(then, css_selectors, ancestors, snippet_ancestors);
                }
                if let Some(ref mut catch) = await_block.catch {
                    propagate_ancestor_scoping(catch, css_selectors, ancestors, snippet_ancestors);
                }
            }
            TemplateNode::KeyBlock(key) => {
                propagate_ancestor_scoping(
                    &mut key.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::SnippetBlock(snippet) => {
                let snippet_name = get_snippet_block_name(snippet);
                let render_site_chains = snippet_name
                    .as_ref()
                    .and_then(|name| snippet_ancestors.get(name));
                if let Some(chains) = render_site_chains {
                    for site_anc in chains {
                        propagate_ancestor_scoping(
                            &mut snippet.body,
                            css_selectors,
                            site_anc,
                            snippet_ancestors,
                        );
                    }
                } else {
                    propagate_ancestor_scoping(
                        &mut snippet.body,
                        css_selectors,
                        ancestors,
                        snippet_ancestors,
                    );
                }
            }
            TemplateNode::SvelteHead(head) => {
                propagate_ancestor_scoping(
                    &mut head.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::SvelteElement(el) => {
                let element_info = ElementInfo::from_svelte_element(el);

                if !el.metadata.scoped {
                    el.metadata.scoped = css_selectors.iter().any(|selector| {
                        element_is_ancestor_in_matching_selector(&element_info, selector)
                            && subtree_has_matching_subject(
                                &el.fragment,
                                selector,
                                &element_info,
                                ancestors,
                                snippet_ancestors,
                            )
                    });
                }

                let mut new_ancestors = ancestors.to_vec();
                new_ancestors.push(element_info);
                propagate_ancestor_scoping(
                    &mut el.fragment,
                    css_selectors,
                    &new_ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::SlotElement(slot) => {
                propagate_ancestor_scoping(
                    &mut slot.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::TitleElement(title) => {
                propagate_ancestor_scoping(
                    &mut title.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            _ => {}
        }
    }
}

/// Check if any element in the subtree matches the subject of a selector.
fn subtree_has_matching_subject(
    fragment: &Fragment,
    selector: &CssComplexSelector,
    ancestor_element: &ElementInfo,
    outer_ancestors: &[ElementInfo],
    snippet_ancestors: &SnippetAncestorMap,
) -> bool {
    let mut ancestors = outer_ancestors.to_vec();
    ancestors.push(ancestor_element.clone());
    subtree_has_matching_subject_inner(fragment, selector, &ancestors, snippet_ancestors)
}

fn subtree_has_matching_subject_inner(
    fragment: &Fragment,
    selector: &CssComplexSelector,
    ancestors: &[ElementInfo],
    snippet_ancestors: &SnippetAncestorMap,
) -> bool {
    let effective = truncate_globals(&selector.children);
    let subject_sel = effective.last();

    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                let element_info = ElementInfo::from_element(el);
                if complex_selector_matches_element(selector, &element_info, ancestors) {
                    return true;
                }
                // For selectors with sibling combinators, the sibling pass may have already
                // scoped this element. Check if it's scoped and matches the subject selector.
                if el.metadata.scoped
                    && let Some(subj) = subject_sel
                    && element_matches_simple_selectors(&element_info, &subj.selectors)
                {
                    return true;
                }
                let mut new_ancestors = ancestors.to_vec();
                new_ancestors.push(element_info);
                if subtree_has_matching_subject_inner(
                    &el.fragment,
                    selector,
                    &new_ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
            }
            TemplateNode::SvelteElement(el) => {
                let element_info = ElementInfo::from_svelte_element(el);
                if complex_selector_matches_element(selector, &element_info, ancestors) {
                    return true;
                }
                if el.metadata.scoped
                    && let Some(subj) = subject_sel
                    && element_matches_simple_selectors(&element_info, &subj.selectors)
                {
                    return true;
                }
                let mut new_ancestors = ancestors.to_vec();
                new_ancestors.push(element_info);
                if subtree_has_matching_subject_inner(
                    &el.fragment,
                    selector,
                    &new_ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
            }
            TemplateNode::Component(comp) => {
                if subtree_has_matching_subject_inner(
                    &comp.fragment,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
            }
            TemplateNode::IfBlock(if_block) => {
                if subtree_has_matching_subject_inner(
                    &if_block.consequent,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
                if let Some(ref alt) = if_block.alternate
                    && subtree_has_matching_subject_inner(
                        alt,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
            }
            TemplateNode::EachBlock(each) => {
                if subtree_has_matching_subject_inner(
                    &each.body,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
                if let Some(ref fallback) = each.fallback
                    && subtree_has_matching_subject_inner(
                        fallback,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref pending) = await_block.pending
                    && subtree_has_matching_subject_inner(
                        pending,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
                if let Some(ref then) = await_block.then
                    && subtree_has_matching_subject_inner(
                        then,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
                if let Some(ref catch) = await_block.catch
                    && subtree_has_matching_subject_inner(
                        catch,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
            }
            TemplateNode::KeyBlock(key) => {
                if subtree_has_matching_subject_inner(
                    &key.fragment,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
            }
            TemplateNode::SnippetBlock(snippet) => {
                if subtree_has_matching_subject_inner(
                    &snippet.body,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
            }
            TemplateNode::SlotElement(slot) => {
                if subtree_has_matching_subject_inner(
                    &slot.fragment,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
            }
            TemplateNode::RenderTag(render_tag) => {
                // When we encounter a render tag, follow into the rendered snippet's body
                // to check if it contains matching elements (as descendants of the current ancestors)
                if let Some(name) = get_render_tag_callee_name(render_tag) {
                    // Find snippets with this name in the fragment tree
                    // We can check snippet_ancestors to know if there's a snippet with this name
                    if snippet_ancestors.contains_key(&name) {
                        // Look for snippet blocks with this name in the global fragment
                        // For now, we just return true conservatively - the snippet
                        // could contain matching elements
                        // This is handled by the fact that snippet body elements
                        // are already processed with render-site ancestors
                    }
                }
            }
            _ => {}
        }
    }
    false
}

/// Decode CSS escape sequences in a selector name.
/// E.g., `foo\:bar` → `foo:bar`, `\31 23` → `123`
fn decode_css_escape(name: &str) -> String {
    if !name.contains('\\') {
        return name.to_string();
    }

    let mut result = String::new();
    let mut chars = name.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '\\' {
            if let Some(&next) = chars.peek() {
                if next.is_ascii_hexdigit() {
                    // Read up to 6 hex digits
                    let mut hex_str = String::new();
                    while hex_str.len() < 6 {
                        if let Some(&h) = chars.peek() {
                            if h.is_ascii_hexdigit() {
                                hex_str.push(chars.next().unwrap());
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    // Parse hex and convert to char
                    if let Ok(code) = u32::from_str_radix(&hex_str, 16)
                        && let Some(decoded) = char::from_u32(code)
                    {
                        result.push(decoded);
                    }
                    // Consume optional single whitespace after hex escape
                    if let Some(&ws) = chars.peek()
                        && (ws == ' ' || ws == '\t' || ws == '\n')
                    {
                        chars.next();
                    }
                } else if next == '\n' {
                    chars.next();
                } else {
                    result.push(chars.next().unwrap());
                }
            }
        } else {
            result.push(c);
        }
    }

    result
}
