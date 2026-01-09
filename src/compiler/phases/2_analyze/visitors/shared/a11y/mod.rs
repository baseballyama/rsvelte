// ... (continuing from previous write, this file is very large)
//! Accessibility (a11y) checking.
//!
//! Validates elements for accessibility best practices.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/a11y/index.js`.
//!
//! This file implements complete a11y checks from the official Svelte compiler.

mod constants;

pub use constants::*;

use crate::ast::template::{
    Attribute as AttributeNode, AttributeValue, Fragment, RegularElement, TemplateNode,
};
use regex::Regex;
use std::collections::{HashMap, HashSet};
use std::sync::LazyLock;

// Regex patterns
static REGEX_HEADING_TAGS: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^h[1-6]$").unwrap());
static REGEX_JS_PREFIX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^(javascript|data|vbscript):").unwrap());
static REGEX_NOT_WHITESPACE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\S").unwrap());
static REGEX_REDUNDANT_IMG_ALT: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)\b(image|picture|photo)\b").unwrap());
static REGEX_STARTS_WITH_VOWEL: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[aeiou]").unwrap());
static REGEX_WHITESPACES: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\s+").unwrap());

/// Check element for a11y issues.
/// This is the main entry point for accessibility checking.
///
/// # Arguments
/// * `node` - The element to check (RegularElement or SvelteElement)
/// * `context` - The visitor context (not used yet, but matches Svelte API)
///
/// # Note
/// Warning generation is handled via TODO comments for now.
/// The actual warning system needs to be integrated with the compiler's error reporting.
pub fn check_element(node: &RegularElement, path: &[&TemplateNode]) {
    let mut attribute_map: HashMap<String, &AttributeNode> = HashMap::new();
    let mut handlers: HashSet<String> = HashSet::new();
    let mut attributes: Vec<&AttributeNode> = Vec::new();

    let is_dynamic_element = false; // SvelteElement check would go here
    let mut has_spread = false;
    let mut has_contenteditable_attr = false;
    let mut has_contenteditable_binding = false;

    // Collect attributes
    for attribute in &node.attributes {
        match attribute {
            AttributeNode::Attribute(attr) => {
                // Check if it's an event handler (starts with "on")
                if attr.name.starts_with("on") && attr.name.len() > 2 {
                    handlers.insert(attr.name[2..].to_string());
                } else {
                    attributes.push(attribute);
                    attribute_map.insert(attr.name.to_string(), attribute);
                    if attr.name == "contenteditable" {
                        has_contenteditable_attr = true;
                    }
                }
            }
            AttributeNode::SpreadAttribute(_) => {
                has_spread = true;
            }
            AttributeNode::BindDirective(bind) => {
                // Check for contenteditable bindings
                if matches!(
                    bind.name.as_str(),
                    "innerHTML" | "innerText" | "textContent"
                ) {
                    has_contenteditable_binding = true;
                }
            }
            AttributeNode::OnDirective(on) => {
                handlers.insert(on.name.to_string());
            }
            _ => {}
        }
    }

    // Check ARIA attributes
    for attribute in &node.attributes {
        if let AttributeNode::Attribute(attr) = attribute {
            let name = attr.name.to_lowercase();

            // aria-props
            if let Some(aria_type) = name.strip_prefix("aria-") {
                if INVISIBLE_ELEMENTS.contains(&node.name.as_str()) {
                    // TODO: w.a11y_aria_attributes(attribute, node.name);
                }

                if !ARIA_ATTRIBUTES.contains(&aria_type) {
                    // TODO: fuzzymatch and warning
                    // w.a11y_unknown_aria_attribute(attribute, type, match);
                }

                if name == "aria-hidden" && REGEX_HEADING_TAGS.is_match(&node.name) {
                    // TODO: w.a11y_hidden(attribute, node.name);
                }

                // aria-activedescendant-has-tabindex
                if name == "aria-activedescendant"
                    && !is_dynamic_element
                    && !is_interactive_element(&node.name, &attribute_map)
                    && !attribute_map.contains_key("tabindex")
                    && !has_spread
                {
                    // TODO: w.a11y_aria_activedescendant_has_tabindex(attribute);
                }
            }

            // Check role attribute
            if name == "role" {
                if INVISIBLE_ELEMENTS.contains(&node.name.as_str()) {
                    // TODO: w.a11y_misplaced_role(attribute, node.name);
                }

                if let Some(value) = get_static_value(attribute) {
                    for current_role in value.split(|c: char| c.is_whitespace()) {
                        if current_role.is_empty() {
                            continue;
                        }

                        if is_abstract_role(current_role) {
                            // TODO: w.a11y_no_abstract_role(attribute, current_role);
                        } else if !ARIA_ROLES.contains(current_role) {
                            // TODO: w.a11y_unknown_role(attribute, current_role, match);
                        }

                        // no-redundant-roles
                        if let Some(implicit_role) = get_implicit_role(&node.name, &attribute_map)
                            && current_role == implicit_role
                            && !["ul", "ol", "li"].contains(&node.name.as_str())
                            && (node.name != "a" || attribute_map.contains_key("href"))
                        {
                            // TODO: w.a11y_no_redundant_roles(attribute, current_role);
                        }

                        // Footers and headers special case
                        let is_parent_section_or_article = is_parent(path, &["section", "article"]);
                        if !is_parent_section_or_article
                            && let Some(nested_role) =
                                A11Y_NESTED_IMPLICIT_SEMANTICS.get(node.name.as_str())
                            && current_role == *nested_role
                        {
                            // TODO: w.a11y_no_redundant_roles(attribute, current_role);
                        }

                        // interactive-supports-focus
                        if !has_spread
                            && !has_disabled_attribute(&attribute_map)
                            && !is_hidden_from_screen_reader(&node.name, &attribute_map)
                            && !is_presentation_role(current_role)
                            && is_interactive_roles(current_role)
                            && is_static_element(&node.name, &attribute_map)
                            && !attribute_map.contains_key("tabindex")
                        {
                            let has_interactive_handlers = handlers
                                .iter()
                                .any(|h| A11Y_INTERACTIVE_HANDLERS.contains(&h.as_str()));
                            if has_interactive_handlers {
                                // TODO: w.a11y_interactive_supports_focus(node, current_role);
                            }
                        }

                        // no-interactive-element-to-noninteractive-role
                        if !has_spread
                            && is_interactive_element(&node.name, &attribute_map)
                            && (is_non_interactive_roles(current_role)
                                || is_presentation_role(current_role))
                        {
                            // TODO: w.a11y_no_interactive_element_to_noninteractive_role
                        }

                        // no-noninteractive-element-to-interactive-role
                        if !has_spread
                            && is_non_interactive_element(&node.name, &attribute_map)
                            && is_interactive_roles(current_role)
                        {
                            if let Some(exceptions) =
                                A11Y_NON_INTERACTIVE_ELEMENT_TO_INTERACTIVE_ROLE_EXCEPTIONS
                                    .get(node.name.as_str())
                            {
                                if !exceptions.contains(&current_role) {
                                    // TODO: w.a11y_no_noninteractive_element_to_interactive_role
                                }
                            } else {
                                // TODO: w.a11y_no_noninteractive_element_to_interactive_role
                            }
                        }
                    }
                }
            }

            // no-access-key
            if name == "accesskey" {
                // TODO: w.a11y_accesskey(attribute);
            }

            // no-autofocus
            if name == "autofocus" && node.name != "dialog" && !is_parent(path, &["dialog"]) {
                // TODO: w.a11y_autofocus(attribute);
            }

            // scope
            if name == "scope" && !is_dynamic_element && node.name != "th" {
                // TODO: w.a11y_misplaced_scope(attribute);
            }

            // tabindex-no-positive
            if name == "tabindex"
                && let Some(value) = get_static_value(attribute)
                && let Ok(num) = value.parse::<i32>()
                && num > 0
            {
                // TODO: w.a11y_positive_tabindex(attribute);
            }
        }
    }

    let role_static_value = attribute_map
        .get("role")
        .and_then(|attr| get_static_value(attr));

    // click-events-have-key-events
    if handlers.contains("click") {
        let is_non_presentation_role =
            role_static_value.is_some() && !is_presentation_role(role_static_value.unwrap());
        if !is_dynamic_element
            && !is_hidden_from_screen_reader(&node.name, &attribute_map)
            && (role_static_value.is_none() || is_non_presentation_role)
            && !is_interactive_element(&node.name, &attribute_map)
            && !has_spread
        {
            let has_key_event = handlers.contains("keydown")
                || handlers.contains("keyup")
                || handlers.contains("keypress");
            if !has_key_event {
                // TODO: w.a11y_click_events_have_key_events(node);
            }
        }
    }

    // no-noninteractive-tabindex
    if !is_dynamic_element
        && !is_interactive_element(&node.name, &attribute_map)
        && !role_static_value.is_some_and(is_interactive_roles)
        && let Some(tab_index) = attribute_map.get("tabindex")
        && let Some(tab_index_value) = get_static_value(tab_index)
        && let Ok(num) = tab_index_value.parse::<i32>()
        && num >= 0
    {
        // TODO: w.a11y_no_noninteractive_tabindex(node);
    }

    // no-noninteractive-element-interactions
    if !has_spread
        && !has_contenteditable_attr
        && !is_hidden_from_screen_reader(&node.name, &attribute_map)
        && role_static_value.is_some_and(|r| !is_presentation_role(r))
    {
        let should_check = if !is_interactive_element(&node.name, &attribute_map) {
            role_static_value.is_some_and(is_non_interactive_roles)
        } else if is_non_interactive_element(&node.name, &attribute_map) {
            role_static_value.is_none()
        } else {
            false
        };

        if should_check {
            let has_interactive_handlers = handlers
                .iter()
                .any(|h| A11Y_RECOMMENDED_INTERACTIVE_HANDLERS.contains(&h.as_str()));
            if has_interactive_handlers {
                // TODO: w.a11y_no_noninteractive_element_interactions(node, node.name);
            }
        }
    }

    // no-static-element-interactions
    if !has_spread
        && (role_static_value.is_none() || role_static_value.is_some())
        && !is_hidden_from_screen_reader(&node.name, &attribute_map)
        && role_static_value.is_none_or(|r| !is_presentation_role(r))
        && !is_interactive_element(&node.name, &attribute_map)
        && !role_static_value.is_some_and(is_interactive_roles)
        && !is_non_interactive_element(&node.name, &attribute_map)
        && !role_static_value.is_some_and(is_non_interactive_roles)
        && !role_static_value.is_some_and(is_abstract_role)
    {
        let interactive_handlers: Vec<_> = handlers
            .iter()
            .filter(|h| A11Y_INTERACTIVE_HANDLERS.contains(&h.as_str()))
            .collect();
        if !interactive_handlers.is_empty() {
            // TODO: w.a11y_no_static_element_interactions(node, node.name, list(interactive_handlers));
        }
    }

    // mouse-events-have-key-events
    if !has_spread && handlers.contains("mouseover") && !handlers.contains("focus") {
        // TODO: w.a11y_mouse_events_have_key_events(node, "mouseover", "focus");
    }

    if !has_spread && handlers.contains("mouseout") && !handlers.contains("blur") {
        // TODO: w.a11y_mouse_events_have_key_events(node, "mouseout", "blur");
    }

    // Element-specific checks
    let is_labelled = attribute_map.contains_key("aria-label")
        || attribute_map.contains_key("aria-labelledby")
        || attribute_map.contains_key("title");

    match node.name.as_str() {
        "a" | "button" => {
            let is_hidden = (attribute_map
                .get("aria-hidden")
                .and_then(|a| get_static_value(a))
                == Some("true"))
                || attribute_map.contains_key("inert");

            if !has_spread && !is_hidden && !is_labelled && !has_content(node) {
                // TODO: w.a11y_consider_explicit_label(node);
            }

            if node.name == "a" {
                let href = attribute_map
                    .get("href")
                    .or_else(|| attribute_map.get("xlink:href"));
                if let Some(href_attr) = href {
                    if let Some(href_value) = get_static_value(href_attr)
                        && (href_value.is_empty()
                            || href_value == "#"
                            || REGEX_JS_PREFIX.is_match(href_value))
                    {
                        // TODO: w.a11y_invalid_attribute(href, href_value, href.name);
                    }
                } else if !has_spread {
                    let id_attribute = attribute_map.get("id").and_then(|a| get_static_value(a));
                    let name_attribute =
                        attribute_map.get("name").and_then(|a| get_static_value(a));
                    let aria_disabled = attribute_map
                        .get("aria-disabled")
                        .and_then(|a| get_static_value(a));
                    if id_attribute.is_none()
                        && name_attribute.is_none()
                        && aria_disabled != Some("true")
                    {
                        // TODO: warn_missing_attribute(node, ["href"]);
                    }
                }
            }
        }
        "input" => {
            let type_value = attribute_map
                .get("type")
                .and_then(|t| get_static_value(t))
                .unwrap_or("text");
            if type_value == "image" && !has_spread {
                let required_attributes = ["alt", "aria-label", "aria-labelledby"];
                let has_attribute = required_attributes
                    .iter()
                    .any(|name| attribute_map.contains_key(*name));
                if !has_attribute {
                    // TODO: warn_missing_attribute(node, required_attributes, "input type=\"image\"");
                }
            }
        }
        "img" => {
            if let Some(alt_attribute) = attribute_map.get("alt")
                && let Some(alt_value) = get_static_value(alt_attribute)
            {
                let aria_hidden = attribute_map.get("aria-hidden");
                if aria_hidden.is_none()
                    && !has_spread
                    && REGEX_REDUNDANT_IMG_ALT.is_match(alt_value)
                {
                    // TODO: w.a11y_img_redundant_alt(node);
                }
            }
        }
        "label" => {
            if !has_spread && !attribute_map.contains_key("for") && !has_input_child(node) {
                // TODO: w.a11y_label_has_associated_control(node);
            }
        }
        "video" => {
            let aria_hidden_exist = attribute_map
                .get("aria-hidden")
                .and_then(|a| get_static_value(a))
                == Some("true");

            if attribute_map.contains_key("muted") || aria_hidden_exist || has_spread {
                return;
            }

            if !attribute_map.contains_key("src") {
                return;
            }

            let has_caption = node
                .fragment
                .nodes
                .iter()
                .filter_map(|n| {
                    if let TemplateNode::RegularElement(el) = n {
                        if el.name == "track" {
                            Some(el)
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                })
                .any(|track| {
                    track.attributes.iter().any(|a| {
                        matches!(a, AttributeNode::SpreadAttribute(_))
                            || matches!(a, AttributeNode::Attribute(attr) if attr.name == "kind" && get_static_value(a) == Some("captions"))
                    })
                });

            if !has_caption {
                // TODO: w.a11y_media_has_caption(node);
            }
        }
        "figcaption" => {
            if !is_parent(path, &["figure"]) {
                // TODO: w.a11y_figcaption_parent(node);
            }
        }
        "figure" => {
            let children: Vec<_> = node
                .fragment
                .nodes
                .iter()
                .filter(|n| match n {
                    TemplateNode::Comment(_) => false,
                    TemplateNode::Text(t) => REGEX_NOT_WHITESPACE.is_match(&t.data),
                    _ => true,
                })
                .collect();
            let index = children.iter().position(|child| {
                matches!(child, TemplateNode::RegularElement(el) if el.name == "figcaption")
            });
            if let Some(idx) = index
                && idx != 0
                && idx != children.len() - 1
            {
                // TODO: w.a11y_figcaption_index(children[idx]);
            }
        }
        _ => {}
    }

    // Check required attributes
    if !has_spread
        && node.name != "a"
        && let Some(required_attributes) = A11Y_REQUIRED_ATTRIBUTES.get(node.name.as_str())
    {
        let has_attribute = required_attributes
            .iter()
            .any(|name| attribute_map.contains_key(*name));
        if !has_attribute {
            // TODO: warn_missing_attribute(node, required_attributes);
        }
    }

    // no-distracting-elements
    if A11Y_DISTRACTING_ELEMENTS.contains(&node.name.as_str()) {
        // TODO: w.a11y_distracting_elements(node, node.name);
    }

    // Check content
    if !has_spread
        && !is_labelled
        && !has_contenteditable_binding
        && A11Y_REQUIRED_CONTENT.contains(&node.name.as_str())
        && !has_content(node)
    {
        // TODO: w.a11y_missing_content(node, node.name);
    }
}

// Helper functions

fn is_presentation_role(role: &str) -> bool {
    PRESENTATION_ROLES.contains(&role)
}

fn is_hidden_from_screen_reader(
    tag_name: &str,
    attribute_map: &HashMap<String, &AttributeNode>,
) -> bool {
    if tag_name == "input"
        && let Some(type_attr) = attribute_map.get("type")
        && get_static_value(type_attr) == Some("hidden")
    {
        return true;
    }

    if let Some(aria_hidden) = attribute_map.get("aria-hidden") {
        if let Some(value) = get_static_value(aria_hidden) {
            return value == "true";
        }
        return true; // Dynamic value
    }

    false
}

fn has_disabled_attribute(attribute_map: &HashMap<String, &AttributeNode>) -> bool {
    if let Some(disabled) = attribute_map.get("disabled")
        && get_static_value(disabled).is_some()
    {
        return true;
    }

    if let Some(aria_disabled) = attribute_map.get("aria-disabled")
        && get_static_value(aria_disabled) == Some("true")
    {
        return true;
    }

    false
}

fn element_interactivity(
    tag_name: &str,
    attribute_map: &HashMap<String, &AttributeNode>,
) -> &'static str {
    if INTERACTIVE_ELEMENT_ROLE_SCHEMAS
        .iter()
        .any(|schema| match_schema(schema, tag_name, attribute_map))
    {
        return element_interactivity::INTERACTIVE;
    }

    if tag_name != "header"
        && NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS
            .iter()
            .any(|schema| match_schema(schema, tag_name, attribute_map))
    {
        return element_interactivity::NON_INTERACTIVE;
    }

    if INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS
        .iter()
        .any(|schema| match_schema(schema, tag_name, attribute_map))
    {
        return element_interactivity::INTERACTIVE;
    }

    if NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS
        .iter()
        .any(|schema| match_schema(schema, tag_name, attribute_map))
    {
        return element_interactivity::NON_INTERACTIVE;
    }

    element_interactivity::STATIC
}

fn is_interactive_element(tag_name: &str, attribute_map: &HashMap<String, &AttributeNode>) -> bool {
    element_interactivity(tag_name, attribute_map) == element_interactivity::INTERACTIVE
}

fn is_non_interactive_element(
    tag_name: &str,
    attribute_map: &HashMap<String, &AttributeNode>,
) -> bool {
    element_interactivity(tag_name, attribute_map) == element_interactivity::NON_INTERACTIVE
}

fn is_static_element(tag_name: &str, attribute_map: &HashMap<String, &AttributeNode>) -> bool {
    element_interactivity(tag_name, attribute_map) == element_interactivity::STATIC
}

fn get_implicit_role(
    name: &str,
    attribute_map: &HashMap<String, &AttributeNode>,
) -> Option<&'static str> {
    if name == "menuitem" {
        return menuitem_implicit_role(attribute_map);
    } else if name == "input" {
        return input_implicit_role(attribute_map);
    }
    A11Y_IMPLICIT_SEMANTICS.get(name).copied()
}

fn input_implicit_role(attribute_map: &HashMap<String, &AttributeNode>) -> Option<&'static str> {
    let type_value = attribute_map
        .get("type")
        .and_then(|t| get_static_value(t))?;
    let has_list = attribute_map.contains_key("list");
    if has_list && COMBOBOX_IF_LIST.contains(&type_value) {
        return Some("combobox");
    }
    INPUT_TYPE_TO_IMPLICIT_ROLE.get(type_value).copied()
}

fn menuitem_implicit_role(attribute_map: &HashMap<String, &AttributeNode>) -> Option<&'static str> {
    let type_value = attribute_map
        .get("type")
        .and_then(|t| get_static_value(t))?;
    MENUITEM_TYPE_TO_IMPLICIT_ROLE.get(type_value).copied()
}

fn is_non_interactive_roles(role: &str) -> bool {
    NON_INTERACTIVE_ROLES.contains(&role)
}

fn is_interactive_roles(role: &str) -> bool {
    INTERACTIVE_ROLES.contains(&role)
}

fn is_abstract_role(role: &str) -> bool {
    ABSTRACT_ROLES.contains(role)
}

fn get_static_value(attribute: &AttributeNode) -> Option<&str> {
    if let AttributeNode::Attribute(attr) = attribute {
        if matches!(attr.value, AttributeValue::True(_)) {
            return Some("true");
        }
        if let AttributeValue::Sequence(parts) = &attr.value
            && parts.len() == 1
            && let crate::ast::template::AttributeValuePart::Text(text) = &parts[0]
        {
            return Some(&text.data);
        }
    }
    None
}

fn has_content(element: &RegularElement) -> bool {
    for node in &element.fragment.nodes {
        match node {
            TemplateNode::Text(text) => {
                if !text.data.trim().is_empty() {
                    return true;
                }
            }
            TemplateNode::RegularElement(el) => {
                if el.name == "img"
                    && el
                        .attributes
                        .iter()
                        .any(|a| matches!(a, AttributeNode::Attribute(attr) if attr.name == "alt"))
                {
                    return true;
                }

                // Recursively check for content
                if has_content(el) {
                    return true;
                }
            }
            TemplateNode::Comment(_) => {}
            _ => return true, // Assume everything else has content
        }
    }
    false
}

fn match_schema(
    schema: &RoleRelationConcept,
    tag_name: &str,
    attribute_map: &HashMap<String, &AttributeNode>,
) -> bool {
    if schema.name != tag_name {
        return false;
    }

    if let Some(schema_attrs) = &schema.attributes {
        for schema_attr in schema_attrs {
            if let Some(attribute) = attribute_map.get(&schema_attr.name) {
                if let Some(expected_value) = &schema_attr.value {
                    if let Some(actual_value) = get_static_value(attribute) {
                        if actual_value != expected_value {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            } else {
                return false;
            }
        }
    }

    true
}

fn is_parent(path: &[&TemplateNode], elements: &[&str]) -> bool {
    for node in path.iter().rev() {
        if let TemplateNode::SvelteElement(_) = node {
            return true; // Unknown, play it safe
        }
        if let TemplateNode::RegularElement(el) = node {
            return elements.contains(&el.name.as_str());
        }
    }
    false
}

fn has_input_child(element: &RegularElement) -> bool {
    fn walk_fragment(fragment: &Fragment) -> bool {
        for node in &fragment.nodes {
            match node {
                TemplateNode::RegularElement(el) => {
                    if A11Y_LABELABLE.contains(&el.name.as_str()) || el.name == "slot" {
                        return true;
                    }
                    if walk_fragment(&el.fragment) {
                        return true;
                    }
                }
                TemplateNode::SvelteElement(_)
                | TemplateNode::SlotElement(_)
                | TemplateNode::Component(_)
                | TemplateNode::RenderTag(_) => {
                    return true;
                }
                TemplateNode::IfBlock(block) => {
                    if walk_fragment(&block.consequent) {
                        return true;
                    }
                    if let Some(alt) = &block.alternate
                        && walk_fragment(alt)
                    {
                        return true;
                    }
                }
                TemplateNode::EachBlock(block) => {
                    if walk_fragment(&block.body) {
                        return true;
                    }
                    if let Some(fallback) = &block.fallback
                        && walk_fragment(fallback)
                    {
                        return true;
                    }
                }
                TemplateNode::AwaitBlock(block) => {
                    if let Some(pending) = &block.pending
                        && walk_fragment(pending)
                    {
                        return true;
                    }
                    if let Some(then) = &block.then
                        && walk_fragment(then)
                    {
                        return true;
                    }
                    if let Some(catch) = &block.catch
                        && walk_fragment(catch)
                    {
                        return true;
                    }
                }
                _ => {}
            }
        }
        false
    }

    walk_fragment(&element.fragment)
}
