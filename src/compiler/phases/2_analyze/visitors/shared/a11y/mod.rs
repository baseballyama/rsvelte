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
use indexmap::IndexSet;
use regex::Regex;
use rustc_hash::FxHashMap;
use std::sync::LazyLock;

// Regex patterns
static REGEX_HEADING_TAGS: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^h[1-6]$").unwrap());
// Mirrors upstream `regex_js_prefix = /^\W*javascript:/i`: case-insensitive and
// tolerant of leading non-word characters (whitespace / control chars), so
// `JavaScript:` and ` javascript:` are caught too (H-081).
static REGEX_JS_PREFIX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)^\W*javascript:").unwrap());
static REGEX_NOT_WHITESPACE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\S").unwrap());
static REGEX_REDUNDANT_IMG_ALT: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)\b(image|picture|photo)\b").unwrap());
static REGEX_STARTS_WITH_VOWEL: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[aeiou]").unwrap());
static REGEX_WHITESPACES: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\s+").unwrap());

use crate::compiler::phases::phase1_parse::utils::fuzzymatch::fuzzymatch;
use crate::compiler::phases::phase2_analyze::warnings as w;

/// Check element for a11y issues.
/// This is the main entry point for accessibility checking.
///
/// # Arguments
/// * `node` - The element to check (RegularElement or SvelteElement)
/// * `ancestor_names` - The element names of ancestors from root to parent (for parent checks)
///
/// # Returns
/// A vector of warnings detected for this element.
pub fn check_element(node: &RegularElement, ancestor_names: &[String]) -> Vec<w::AnalysisWarning> {
    let mut warnings = Vec::new();
    let mut attribute_map: FxHashMap<String, &AttributeNode> = FxHashMap::default();
    let mut handlers: IndexSet<String> = IndexSet::new();
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
                    warnings.push(w::a11y_aria_attributes(&node.name));
                }

                if !ARIA_ATTRIBUTES.contains(&aria_type) {
                    let suggestion = fuzzymatch(aria_type, ARIA_ATTRIBUTES);
                    warnings.push(w::a11y_unknown_aria_attribute(
                        aria_type,
                        suggestion.as_deref(),
                    ));
                }

                if name == "aria-hidden" && REGEX_HEADING_TAGS.is_match(&node.name) {
                    warnings.push(w::a11y_hidden(&node.name));
                }

                // aria-proptypes validation
                let value = get_static_value(attribute);
                if let Some(schema) = ARIA_PROPERTY_DEFINITIONS.get(name.as_str()) {
                    validate_aria_attribute_value(&mut warnings, &name, schema, value);
                }

                // aria-activedescendant-has-tabindex
                if name == "aria-activedescendant"
                    && !is_dynamic_element
                    && !is_interactive_element(&node.name, &attribute_map)
                    && !attribute_map.contains_key("tabindex")
                    && !has_spread
                {
                    warnings.push(w::a11y_aria_activedescendant_has_tabindex());
                }
            }

            // Check role attribute
            if name == "role" {
                if INVISIBLE_ELEMENTS.contains(&node.name.as_str()) {
                    warnings.push(w::a11y_misplaced_role(&node.name));
                }

                if let Some(value) = get_static_value(attribute) {
                    for current_role in value.split(|c: char| c.is_whitespace()) {
                        if current_role.is_empty() {
                            continue;
                        }

                        if is_abstract_role(current_role) {
                            warnings.push(w::a11y_no_abstract_role(current_role));
                        } else if !ARIA_ROLES.contains(current_role) {
                            let aria_roles_vec: Vec<&str> = ARIA_ROLES.iter().copied().collect();
                            let suggestion = fuzzymatch(current_role, &aria_roles_vec);
                            warnings
                                .push(w::a11y_unknown_role(current_role, suggestion.as_deref()));
                        }

                        // no-redundant-roles
                        if let Some(implicit_role) = get_implicit_role(&node.name, &attribute_map)
                            && current_role == implicit_role
                            && !["ul", "ol", "li", "menu"].contains(&node.name.as_str())
                            && (node.name != "a" || attribute_map.contains_key("href"))
                        {
                            warnings.push(w::a11y_no_redundant_roles(current_role));
                        }

                        // Footers and headers special case
                        let is_parent_section_or_article =
                            is_parent(ancestor_names, &["section", "article"]);
                        if !is_parent_section_or_article
                            && let Some(nested_role) =
                                A11Y_NESTED_IMPLICIT_SEMANTICS.get(node.name.as_str())
                            && current_role == *nested_role
                        {
                            warnings.push(w::a11y_no_redundant_roles(current_role));
                        }

                        // role-has-required-aria-props
                        if !is_dynamic_element
                            && !is_semantic_role_element(current_role, &node.name, &attribute_map)
                            && let Some(required_props) = ROLE_REQUIRED_PROPS.get(current_role)
                        {
                            let missing_props: Vec<&str> = if !has_spread {
                                required_props
                                    .iter()
                                    .filter(|prop| !attribute_map.contains_key(**prop))
                                    .copied()
                                    .collect()
                            } else {
                                Vec::new()
                            };
                            if !missing_props.is_empty() {
                                let quoted_props: Vec<String> =
                                    missing_props.iter().map(|p| format!("\"{}\"", p)).collect();
                                let quoted_refs: Vec<&str> =
                                    quoted_props.iter().map(|s| s.as_str()).collect();
                                let props_list = list(&quoted_refs, "and");
                                warnings.push(w::a11y_role_has_required_aria_props(
                                    current_role,
                                    &props_list,
                                ));
                            }
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
                                warnings.push(w::a11y_interactive_supports_focus(current_role));
                            }
                        }

                        // no-interactive-element-to-noninteractive-role
                        if !has_spread
                            && is_interactive_element(&node.name, &attribute_map)
                            && (is_non_interactive_roles(current_role)
                                || is_presentation_role(current_role))
                        {
                            warnings.push(w::a11y_no_interactive_element_to_noninteractive_role(
                                current_role,
                                &node.name,
                            ));
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
                                    warnings.push(
                                        w::a11y_no_noninteractive_element_to_interactive_role(
                                            current_role,
                                            &node.name,
                                        ),
                                    );
                                }
                            } else {
                                warnings.push(
                                    w::a11y_no_noninteractive_element_to_interactive_role(
                                        current_role,
                                        &node.name,
                                    ),
                                );
                            }
                        }
                    }
                }
            }

            // no-access-key
            if name == "accesskey" {
                warnings.push(w::a11y_accesskey());
            }

            // no-autofocus
            if name == "autofocus"
                && node.name != "dialog"
                && !is_parent(ancestor_names, &["dialog"])
            {
                warnings.push(w::a11y_autofocus());
            }

            // scope
            if name == "scope" && !is_dynamic_element && node.name != "th" {
                warnings.push(w::a11y_misplaced_scope());
            }

            // tabindex-no-positive
            if name == "tabindex"
                && let Some(value) = get_static_value(attribute)
                && let Ok(num) = value.parse::<i32>()
                && num > 0
            {
                warnings.push(w::a11y_positive_tabindex());
            }
        }
    }

    let has_role_attr = attribute_map.contains_key("role");
    let role_static_value = attribute_map
        .get("role")
        .and_then(|attr| get_static_value(attr));

    // click-events-have-key-events
    if handlers.contains("click") {
        let is_non_presentation_role =
            role_static_value.is_some() && !is_presentation_role(role_static_value.unwrap());
        if !is_dynamic_element
            && !is_hidden_from_screen_reader(&node.name, &attribute_map)
            && (!has_role_attr || is_non_presentation_role)
            && !is_interactive_element(&node.name, &attribute_map)
            && !has_spread
        {
            let has_key_event = handlers.contains("keydown")
                || handlers.contains("keyup")
                || handlers.contains("keypress");
            if !has_key_event {
                warnings.push(w::a11y_click_events_have_key_events());
            }
        }
    }

    // role-supports-aria-props
    // Compute the effective role value: explicit role attribute or implicit role from element name
    let role_value: Option<&str> = if has_role_attr {
        role_static_value
    } else {
        get_implicit_role(&node.name, &attribute_map)
    };

    if let Some(rv) = role_value
        && constants::ROLE_ALLOWED_ARIA_PROPS.contains_key(rv)
    {
        let allowed_props = constants::ROLE_ALLOWED_ARIA_PROPS[rv];
        let is_implicit = !has_role_attr;

        for attr in &attributes {
            if let AttributeNode::Attribute(a) = attr {
                let attr_name = a.name.as_str();
                if let Some(aria_suffix) = attr_name.strip_prefix("aria-") {
                    // Only check valid ARIA attributes - misspelled ones are caught
                    // by a11y-aria-props separately
                    let is_valid_aria = constants::ARIA_ATTRIBUTES.contains(&aria_suffix);
                    if is_valid_aria && !allowed_props.contains(&attr_name) {
                        if is_implicit {
                            warnings.push(w::a11y_role_supports_aria_props_implicit(
                                attr_name, rv, &node.name,
                            ));
                        } else {
                            warnings.push(w::a11y_role_supports_aria_props(attr_name, rv));
                        }
                    }
                }
            }
        }
    }

    // no-noninteractive-tabindex
    // Check: if tabindex exists AND (value is dynamic/None OR value is >= 0)
    // This matches the official Svelte implementation: (tab_index_value === null || Number(tab_index_value) >= 0)
    if !is_dynamic_element
        && !is_interactive_element(&node.name, &attribute_map)
        && !role_static_value.is_some_and(is_interactive_roles)
        && let Some(tab_index) = attribute_map.get("tabindex")
    {
        let tab_index_value = get_static_value(tab_index);
        let should_warn = tab_index_value.is_none()  // Dynamic value (like {0})
            || tab_index_value
                .and_then(|v| v.parse::<i32>().ok())
                .is_some_and(|num| num >= 0);
        if should_warn {
            warnings.push(w::a11y_no_noninteractive_tabindex());
        }
    }

    // no-noninteractive-element-interactions
    if !has_spread
        && !has_contenteditable_attr
        && !is_hidden_from_screen_reader(&node.name, &attribute_map)
        && !role_static_value.is_some_and(is_presentation_role)
    {
        // Check if element should trigger the warning:
        // (!is_interactive_element && is_non_interactive_roles) ||
        // (is_non_interactive_element && !role)
        let should_check = (!is_interactive_element(&node.name, &attribute_map)
            && role_static_value.is_some_and(is_non_interactive_roles))
            || (is_non_interactive_element(&node.name, &attribute_map) && !has_role_attr);

        if should_check {
            let has_interactive_handlers = handlers
                .iter()
                .any(|h| A11Y_RECOMMENDED_INTERACTIVE_HANDLERS.contains(&h.as_str()));
            if has_interactive_handlers {
                warnings.push(w::a11y_no_noninteractive_element_interactions(&node.name));
            }
        }
    }

    // no-static-element-interactions
    // Check: (!role || role_static_value !== null)
    // This means: either there's no role attribute, OR if there is a role, it has a static value
    if !has_spread
        && (!has_role_attr || role_static_value.is_some())
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
            .map(|s| s.as_str())
            .collect();
        if !interactive_handlers.is_empty() {
            let handler_list = list(&interactive_handlers, "or");
            warnings.push(w::a11y_no_static_element_interactions(
                &node.name,
                &handler_list,
            ));
        }
    }

    // mouse-events-have-key-events
    if !has_spread && handlers.contains("mouseover") && !handlers.contains("focus") {
        warnings.push(w::a11y_mouse_events_have_key_events("mouseover", "focus"));
    }

    if !has_spread && handlers.contains("mouseout") && !handlers.contains("blur") {
        warnings.push(w::a11y_mouse_events_have_key_events("mouseout", "blur"));
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
                warnings.push(w::a11y_consider_explicit_label());
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
                        warnings.push(w::a11y_invalid_attribute(href_value, "href"));
                    }
                } else if !has_spread {
                    let id_attribute = attribute_map.get("id").and_then(|a| get_static_value(a));
                    let name_attribute =
                        attribute_map.get("name").and_then(|a| get_static_value(a));
                    let aria_disabled = attribute_map
                        .get("aria-disabled")
                        .and_then(|a| get_static_value(a));
                    if id_attribute.is_none_or(|v| v.is_empty())
                        && name_attribute.is_none_or(|v| v.is_empty())
                        && aria_disabled != Some("true")
                    {
                        warn_missing_attribute(&mut warnings, &node.name, &["href"], None);
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
                    warn_missing_attribute(
                        &mut warnings,
                        &node.name,
                        &required_attributes,
                        Some("input type=\"image\""),
                    );
                }
            }
            // autocomplete-valid check (a11y/index.js L431-442)
            if let Some(autocomplete_attr) = attribute_map.get("autocomplete")
                && attribute_map.contains_key("type")
            {
                let autocomplete_value = get_static_value(autocomplete_attr);
                if !is_valid_autocomplete(autocomplete_value) {
                    let display_value = autocomplete_value.unwrap_or("true");
                    warnings.push(w::a11y_autocomplete_valid(display_value, type_value));
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
                    warnings.push(w::a11y_img_redundant_alt());
                }
            }
        }
        "label" if !has_spread && !attribute_map.contains_key("for") && !has_input_child(node) => {
            warnings.push(w::a11y_label_has_associated_control());
        }
        "video" => {
            let aria_hidden_exist = attribute_map
                .get("aria-hidden")
                .and_then(|a| get_static_value(a))
                == Some("true");

            if attribute_map.contains_key("muted") || aria_hidden_exist || has_spread {
                // Skip video caption check if muted, aria-hidden, or has spread
            } else if !attribute_map.contains_key("src") {
                // Skip video caption check if no src attribute
            } else {
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
                    warnings.push(w::a11y_media_has_caption());
                }
            }
        }
        "figcaption" if !is_parent(ancestor_names, &["figure"]) => {
            warnings.push(w::a11y_figcaption_parent());
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
                warnings.push(w::a11y_figcaption_index());
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
            warn_missing_attribute(&mut warnings, &node.name, required_attributes, None);
        }
    }

    // no-distracting-elements
    if A11Y_DISTRACTING_ELEMENTS.contains(&node.name.as_str()) {
        warnings.push(w::a11y_distracting_elements(&node.name));
    }

    // Check content
    if !has_spread
        && !is_labelled
        && !has_contenteditable_binding
        && A11Y_REQUIRED_CONTENT.contains(&node.name.as_str())
        && !has_content(node)
    {
        warnings.push(w::a11y_missing_content(&node.name));
    }

    warnings
}

// Helper functions

fn is_presentation_role(role: &str) -> bool {
    PRESENTATION_ROLES.contains(&role)
}

fn is_hidden_from_screen_reader(
    tag_name: &str,
    attribute_map: &FxHashMap<String, &AttributeNode>,
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

fn has_disabled_attribute(attribute_map: &FxHashMap<String, &AttributeNode>) -> bool {
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

fn match_schemas_by_index(
    schemas: &[RoleRelationConcept],
    index: &FxHashMap<String, Vec<usize>>,
    tag_name: &str,
    attribute_map: &FxHashMap<String, &AttributeNode>,
) -> bool {
    if let Some(indices) = index.get(tag_name) {
        for &i in indices {
            if match_schema_attrs(&schemas[i], attribute_map) {
                return true;
            }
        }
    }
    false
}

fn match_schema_attrs(
    schema: &RoleRelationConcept,
    attribute_map: &FxHashMap<String, &AttributeNode>,
) -> bool {
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

fn element_interactivity(
    tag_name: &str,
    attribute_map: &FxHashMap<String, &AttributeNode>,
) -> &'static str {
    if match_schemas_by_index(
        &INTERACTIVE_ELEMENT_ROLE_SCHEMAS,
        &INTERACTIVE_ELEMENT_ROLE_INDEX,
        tag_name,
        attribute_map,
    ) {
        return element_interactivity::INTERACTIVE;
    }

    if tag_name != "header"
        && match_schemas_by_index(
            &NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS,
            &NON_INTERACTIVE_ELEMENT_ROLE_INDEX,
            tag_name,
            attribute_map,
        )
    {
        return element_interactivity::NON_INTERACTIVE;
    }

    if match_schemas_by_index(
        &INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS,
        &INTERACTIVE_ELEMENT_AX_OBJECT_INDEX,
        tag_name,
        attribute_map,
    ) {
        return element_interactivity::INTERACTIVE;
    }

    if match_schemas_by_index(
        &NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS,
        &NON_INTERACTIVE_ELEMENT_AX_OBJECT_INDEX,
        tag_name,
        attribute_map,
    ) {
        return element_interactivity::NON_INTERACTIVE;
    }

    element_interactivity::STATIC
}

fn is_interactive_element(
    tag_name: &str,
    attribute_map: &FxHashMap<String, &AttributeNode>,
) -> bool {
    element_interactivity(tag_name, attribute_map) == element_interactivity::INTERACTIVE
}

fn is_non_interactive_element(
    tag_name: &str,
    attribute_map: &FxHashMap<String, &AttributeNode>,
) -> bool {
    element_interactivity(tag_name, attribute_map) == element_interactivity::NON_INTERACTIVE
}

fn is_static_element(tag_name: &str, attribute_map: &FxHashMap<String, &AttributeNode>) -> bool {
    element_interactivity(tag_name, attribute_map) == element_interactivity::STATIC
}

fn get_implicit_role(
    name: &str,
    attribute_map: &FxHashMap<String, &AttributeNode>,
) -> Option<&'static str> {
    if name == "menuitem" {
        return menuitem_implicit_role(attribute_map);
    } else if name == "input" {
        return input_implicit_role(attribute_map);
    }
    A11Y_IMPLICIT_SEMANTICS.get(name).copied()
}

fn input_implicit_role(attribute_map: &FxHashMap<String, &AttributeNode>) -> Option<&'static str> {
    let type_value = attribute_map
        .get("type")
        .and_then(|t| get_static_value(t))?;
    let has_list = attribute_map.contains_key("list");
    if has_list && COMBOBOX_IF_LIST.contains(&type_value) {
        return Some("combobox");
    }
    INPUT_TYPE_TO_IMPLICIT_ROLE.get(type_value).copied()
}

fn menuitem_implicit_role(
    attribute_map: &FxHashMap<String, &AttributeNode>,
) -> Option<&'static str> {
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
                // Elements with `popover` attribute are not visible content
                // (they appear on hover/focus). Corresponds to a11y/index.js L827
                let is_popover = el
                    .attributes
                    .iter()
                    .any(|a| matches!(a, AttributeNode::Attribute(attr) if attr.name == "popover"));
                if is_popover {
                    continue;
                }
                // <img alt="..."> is considered content
                if el.name == "img"
                    && el
                        .attributes
                        .iter()
                        .any(|a| matches!(a, AttributeNode::Attribute(attr) if attr.name == "alt"))
                {
                    return true;
                }

                // <selectedcontent> is a special element used in customizable select dropdowns
                // and should be considered as valid content for buttons inside <select>
                // Reference: https://developer.chrome.com/blog/customizable-select
                if el.name == "selectedcontent" {
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
    attribute_map: &FxHashMap<String, &AttributeNode>,
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

fn is_parent(ancestor_names: &[String], elements: &[&str]) -> bool {
    // Check if the immediate parent element name is in the list
    if let Some(parent_name) = ancestor_names.last() {
        return elements.contains(&parent_name.as_str());
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

/// Helper to generate missing attribute warning with proper article and sequence.
fn warn_missing_attribute(
    warnings: &mut Vec<w::AnalysisWarning>,
    element_name: &str,
    attributes: &[&str],
    context: Option<&str>,
) {
    let name = context.unwrap_or(element_name);
    let article = if attributes.len() == 1 {
        if attributes[0] == "href" || REGEX_STARTS_WITH_VOWEL.is_match(attributes[0]) {
            "an"
        } else {
            "a"
        }
    } else {
        ""
    };

    let sequence = if attributes.len() == 1 {
        attributes[0].to_string()
    } else if attributes.len() == 2 {
        format!("{} or {}", attributes[0], attributes[1])
    } else {
        let last = attributes.last().unwrap();
        let rest = &attributes[..attributes.len() - 1];
        format!("{}, or {}", rest.join(", "), last)
    };

    warnings.push(w::a11y_missing_attribute(name, article, &sequence));
}

/// Format a list of strings with a conjunction.
/// Examples:
/// - ["a"] -> "a"
/// - ["a", "b"] -> "a or b"
/// - ["a", "b", "c"] -> "a, b or c"
fn list(strings: &[&str], conjunction: &str) -> String {
    match strings.len() {
        0 => String::new(),
        1 => strings[0].to_string(),
        2 => format!("{} {} {}", strings[0], conjunction, strings[1]),
        _ => {
            let last = strings.last().unwrap();
            let rest = &strings[..strings.len() - 1];
            format!("{} {} {}", rest.join(", "), conjunction, last)
        }
    }
}

/// Check if an element semantically carries the given role based on its tag name and attributes.
/// For example, `<input type="checkbox">` semantically carries the "checkbox" and "switch" roles.
/// This is used to skip the `role-has-required-aria-props` check for elements that naturally
/// satisfy the role's requirements.
///
/// Corresponds to `is_semantic_role_element` in the official Svelte compiler's a11y/index.js.
fn is_semantic_role_element(
    role: &str,
    tag_name: &str,
    attribute_map: &FxHashMap<String, &AttributeNode>,
) -> bool {
    for (elem_name, attrs, roles) in SEMANTIC_ROLE_ELEMENTS.iter() {
        if *elem_name != tag_name {
            continue;
        }
        // Check if all required attributes match
        let attrs_match = match attrs {
            Some(required_attrs) => required_attrs.iter().all(|(attr_name, attr_value)| {
                attribute_map
                    .get(*attr_name)
                    .and_then(|a| get_static_value(a))
                    == Some(attr_value)
            }),
            None => true,
        };
        if attrs_match && roles.contains(&role) {
            return true;
        }
    }
    false
}

/// Validate ARIA attribute value against its schema type.
/// Corresponds to `validate_aria_attribute_value` in the official Svelte compiler.
fn validate_aria_attribute_value(
    warnings: &mut Vec<w::AnalysisWarning>,
    name: &str,
    schema: &AriaPropertyDefinition,
    value: Option<&str>,
) {
    // If value is None (dynamic), skip validation
    let value = match value {
        None => return,
        Some(v) => {
            // If it was a boolean attribute (true), treat as empty string
            if v == "true" && matches!(schema.property_type, AriaPropertyType::Boolean) {
                // For aria-props, "true" (the string) is valid for boolean
                // The issue is when attribute is present with no value or wrong value
                return;
            }
            v
        }
    };

    match schema.property_type {
        AriaPropertyType::Id | AriaPropertyType::String => {
            if value.is_empty() {
                warnings.push(w::a11y_incorrect_aria_attribute_type(
                    name,
                    "non-empty string",
                ));
            }
        }
        AriaPropertyType::Number => {
            if value.is_empty() || value.parse::<f64>().is_err() {
                warnings.push(w::a11y_incorrect_aria_attribute_type(name, "number"));
            }
        }
        AriaPropertyType::Boolean => {
            if value != "true" && value != "false" {
                warnings.push(w::a11y_incorrect_aria_attribute_type_boolean(name));
            }
        }
        AriaPropertyType::IdList => {
            if value.is_empty() {
                warnings.push(w::a11y_incorrect_aria_attribute_type_idlist(name));
            }
        }
        AriaPropertyType::Integer => {
            let is_valid_integer = if value.is_empty() {
                false
            } else {
                value.parse::<f64>().is_ok_and(|n| n.fract() == 0.0)
            };
            if !is_valid_integer {
                warnings.push(w::a11y_incorrect_aria_attribute_type_integer(name));
            }
        }
        AriaPropertyType::Token => {
            if let Some(valid_values) = schema.values {
                let lowercase_value = value.to_lowercase();
                if !valid_values
                    .iter()
                    .any(|v| v.to_lowercase() == lowercase_value)
                {
                    let values_list: Vec<String> =
                        valid_values.iter().map(|v| format!("\"{}\"", v)).collect();
                    warnings.push(w::a11y_incorrect_aria_attribute_type_token(
                        name,
                        &values_list.join(", "),
                    ));
                }
            }
        }
        AriaPropertyType::TokenList => {
            if let Some(valid_values) = schema.values {
                let tokens: Vec<&str> = REGEX_WHITESPACES.split(value).collect();
                let invalid_tokens: Vec<_> = tokens
                    .iter()
                    .filter(|t| {
                        !valid_values
                            .iter()
                            .any(|v| v.to_lowercase() == t.to_lowercase())
                    })
                    .collect();
                if !invalid_tokens.is_empty() {
                    let values_list: Vec<String> =
                        valid_values.iter().map(|v| format!("\"{}\"", v)).collect();
                    warnings.push(w::a11y_incorrect_aria_attribute_type_tokenlist(
                        name,
                        &values_list.join(", "),
                    ));
                }
            }
        }
        AriaPropertyType::Tristate => {
            if value != "true" && value != "false" && value != "mixed" {
                warnings.push(w::a11y_incorrect_aria_attribute_type_tristate(name));
            }
        }
    }
}

/// Validate an autocomplete attribute value.
/// Corresponds to `is_valid_autocomplete` in the official compiler's a11y/index.js.
fn is_valid_autocomplete(autocomplete: Option<&str>) -> bool {
    let autocomplete = match autocomplete {
        None => return true, // dynamic value
        Some(v) => v,
    };

    if autocomplete == "true" {
        return false;
    }

    // Empty string is valid (dynamic or intentionally empty)
    if autocomplete.trim().is_empty() {
        return true;
    }

    // We need owned strings since we lowercased
    let binding = autocomplete.trim().to_lowercase();
    let mut tokens: Vec<&str> = binding.split_whitespace().collect();

    if tokens.is_empty() {
        return true; // empty after trimming whitespace
    }

    // section-* prefix
    if tokens[0].starts_with("section-") {
        tokens.remove(0);
    }
    if tokens.is_empty() {
        return false;
    }

    // address type
    if ADDRESS_TYPE_TOKENS.contains(&tokens[0]) {
        tokens.remove(0);
    }
    if tokens.is_empty() {
        return false;
    }

    // autofill field name
    if AUTOFILL_FIELD_NAME_TOKENS.contains(&tokens[0]) {
        tokens.remove(0);
    } else {
        // contact type
        if CONTACT_TYPE_TOKENS.contains(&tokens[0]) {
            tokens.remove(0);
        }
        if tokens.is_empty() {
            return false;
        }
        // autofill contact field name
        if AUTOFILL_CONTACT_FIELD_NAME_TOKENS.contains(&tokens[0]) {
            tokens.remove(0);
        } else {
            return false;
        }
    }

    // webauthn
    if !tokens.is_empty() && tokens[0] == "webauthn" {
        tokens.remove(0);
    }

    tokens.is_empty()
}
