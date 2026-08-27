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
    Attribute as AttributeNode, AttributeNode as PlainAttribute, AttributeValue, Fragment,
    RegularElement, SvelteDynamicElement, TemplateNode,
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

/// Codes upstream attaches to the *element* even though they are raised while
/// walking an attribute (`a11y/index.js` passes `node`, not `attribute`); the
/// caller's element-span fallback is correct for these.
const ELEMENT_SCOPED_CODES: &[&str] = &[
    "a11y_interactive_supports_focus",
    "a11y_no_interactive_element_to_noninteractive_role",
    "a11y_no_noninteractive_element_to_interactive_role",
];

/// Attach `attr`'s span to every warning raised while examining it, mirroring
/// upstream's per-warning warn target. Without this the caller stamps the
/// element's span and the column points at `<tag` instead of the attribute.
fn stamp_attribute(warnings: &mut [w::AnalysisWarning], attr: &PlainAttribute) {
    for warning in warnings {
        if warning.start.is_some() || ELEMENT_SCOPED_CODES.contains(&warning.code.as_str()) {
            continue;
        }
        warning.start = Some(attr.start);
        warning.end = Some(attr.end);
    }
}

/// The element being checked. `<svelte:element>` reaches the same checker
/// upstream, under the literal name `svelte:element`, with the rules that need a
/// statically known tag skipped via `is_dynamic`.
pub struct A11yElement<'x, 'a> {
    name: &'x str,
    attributes: &'x [AttributeNode<'a>],
    fragment: &'x Fragment<'a>,
    is_dynamic: bool,
}

impl<'x, 'a> A11yElement<'x, 'a> {
    pub fn regular(element: &'x RegularElement<'a>) -> Self {
        Self {
            name: element.name.as_str(),
            attributes: &element.attributes,
            fragment: &element.fragment,
            is_dynamic: false,
        }
    }

    pub fn dynamic(element: &'x SvelteDynamicElement<'a>) -> Self {
        Self {
            name: element.name.as_str(),
            attributes: &element.attributes,
            fragment: &element.fragment,
            is_dynamic: true,
        }
    }
}

/// Where the element sits, for the rules that consult its ancestors.
pub struct A11yAncestors<'x> {
    /// Names of the enclosing regular elements, outermost first.
    pub names: &'x [String],
    /// Whether a `<svelte:element>` encloses the node with no nearer regular
    /// element. Upstream's `is_parent` stops at one and answers "unknown", so
    /// every ancestor-dependent rule is suppressed rather than guessed.
    pub inside_dynamic_element: bool,
}

pub fn check_element(node: &A11yElement, ancestors: &A11yAncestors) -> Vec<w::AnalysisWarning> {
    let mut warnings = Vec::new();
    let mut attribute_map: FxHashMap<String, &AttributeNode> = FxHashMap::default();
    let mut handlers: IndexSet<String> = IndexSet::new();
    let mut attributes: Vec<&AttributeNode> = Vec::new();

    let is_dynamic_element = node.is_dynamic;
    let mut has_spread = false;
    let mut has_contenteditable_attr = false;
    let mut has_contenteditable_binding = false;

    // Collect attributes
    for attribute in node.attributes {
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
    for attribute in node.attributes {
        if let AttributeNode::Attribute(attr) = attribute {
            let mark = warnings.len();
            let name = attr.name.to_lowercase();
            let (attr_start, attr_end) = (attr.start, attr.end);

            // aria-props
            if let Some(aria_type) = name.strip_prefix("aria-") {
                if INVISIBLE_ELEMENTS.contains(&node.name) {
                    warnings.push(w::a11y_aria_attributes(node.name).at(attr_start, attr_end));
                }

                if !ARIA_ATTRIBUTES.contains(&aria_type) {
                    let suggestion = fuzzymatch(aria_type, ARIA_ATTRIBUTES);
                    warnings.push(
                        w::a11y_unknown_aria_attribute(aria_type, suggestion.as_deref())
                            .at(attr_start, attr_end),
                    );
                }

                if name == "aria-hidden" && REGEX_HEADING_TAGS.is_match(node.name) {
                    warnings.push(w::a11y_hidden(node.name).at(attr_start, attr_end));
                }

                // aria-proptypes validation. A *bare* ARIA attribute (no value)
                // must NOT be silently accepted as `true` for boolean / tristate
                // / number / token / id properties — upstream reports a
                // type-specific `a11y_incorrect_aria_attribute_type` warning
                // because the attribute presence alone is not a valid value.
                // (issue #454, H-078)
                let value = get_static_text_value(attribute);
                let is_bare = matches!(
                    attribute,
                    AttributeNode::Attribute(a) if matches!(a.value, AttributeValue::True(_))
                );
                if let Some(schema) = ARIA_PROPERTY_DEFINITIONS.get(name.as_str()) {
                    validate_aria_attribute_value(
                        &mut warnings,
                        &name,
                        schema,
                        value,
                        is_bare,
                        (attr_start, attr_end),
                    );
                }

                // aria-activedescendant-has-tabindex
                if name == "aria-activedescendant"
                    && !is_dynamic_element
                    && !is_interactive_element(node.name, &attribute_map)
                    && !attribute_map.contains_key("tabindex")
                    && !has_spread
                {
                    warnings.push(
                        w::a11y_aria_activedescendant_has_tabindex().at(attr_start, attr_end),
                    );
                }
            }

            // Check role attribute
            if name == "role" {
                if INVISIBLE_ELEMENTS.contains(&node.name) {
                    warnings.push(w::a11y_misplaced_role(node.name).at(attr_start, attr_end));
                }

                // A valueless `role` is the boolean `true`, which upstream skips.
                if let Some(StaticValue::Text(value)) = get_static_value(attribute) {
                    for current_role in value.split(|c: char| c.is_whitespace()) {
                        if current_role.is_empty() {
                            continue;
                        }

                        if is_abstract_role(current_role) {
                            warnings.push(
                                w::a11y_no_abstract_role(current_role).at(attr_start, attr_end),
                            );
                        } else if !ARIA_ROLES.contains(current_role) {
                            // Ordered list, not the set: fuzzymatch breaks ties by first occurrence.
                            let suggestion = fuzzymatch(current_role, ARIA_ROLE_NAMES);
                            warnings.push(
                                w::a11y_unknown_role(current_role, suggestion.as_deref())
                                    .at(attr_start, attr_end),
                            );
                        }

                        // no-redundant-roles
                        if let Some(implicit_role) = get_implicit_role(node.name, &attribute_map)
                            && current_role == implicit_role
                            && !["ul", "ol", "li", "menu"].contains(&node.name)
                            && (node.name != "a" || attribute_map.contains_key("href"))
                        {
                            warnings.push(
                                w::a11y_no_redundant_roles(current_role).at(attr_start, attr_end),
                            );
                        }

                        // Footers and headers special case
                        let is_parent_section_or_article =
                            is_parent(ancestors, &["section", "article"]);
                        if !is_parent_section_or_article
                            && let Some(nested_role) = A11Y_NESTED_IMPLICIT_SEMANTICS.get(node.name)
                            && current_role == *nested_role
                        {
                            warnings.push(
                                w::a11y_no_redundant_roles(current_role).at(attr_start, attr_end),
                            );
                        }

                        // role-has-required-aria-props
                        if !is_dynamic_element
                            && !is_semantic_role_element(current_role, node.name, &attribute_map)
                            && let Some(required_props) = ROLE_REQUIRED_PROPS.get(current_role)
                        {
                            let has_missing_props = !has_spread
                                && required_props
                                    .iter()
                                    .any(|prop| !attribute_map.contains_key(*prop));
                            if has_missing_props {
                                // Upstream reports the role's complete required-prop
                                // contract once any prop is missing, rather than only
                                // the missing subset.
                                let quoted_props: Vec<String> = required_props
                                    .iter()
                                    .map(|p| format!("\"{}\"", p))
                                    .collect();
                                let quoted_refs: Vec<&str> =
                                    quoted_props.iter().map(|s| s.as_str()).collect();
                                let props_list = list(&quoted_refs, "and");
                                warnings.push(
                                    w::a11y_role_has_required_aria_props(current_role, &props_list)
                                        .at(attr_start, attr_end),
                                );
                            }
                        }

                        // interactive-supports-focus
                        if !has_spread
                            && !has_disabled_attribute(&attribute_map)
                            && !is_hidden_from_screen_reader(node.name, &attribute_map)
                            && !is_presentation_role(current_role)
                            && is_interactive_roles(current_role)
                            && is_static_element(node.name, &attribute_map)
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
                            && is_interactive_element(node.name, &attribute_map)
                            && (is_non_interactive_roles(current_role)
                                || is_presentation_role(current_role))
                        {
                            warnings.push(w::a11y_no_interactive_element_to_noninteractive_role(
                                node.name,
                                current_role,
                            ));
                        }

                        // no-noninteractive-element-to-interactive-role
                        if !has_spread
                            && is_non_interactive_element(node.name, &attribute_map)
                            && is_interactive_roles(current_role)
                        {
                            if let Some(exceptions) =
                                A11Y_NON_INTERACTIVE_ELEMENT_TO_INTERACTIVE_ROLE_EXCEPTIONS
                                    .get(node.name)
                            {
                                if !exceptions.contains(&current_role) {
                                    warnings.push(
                                        w::a11y_no_noninteractive_element_to_interactive_role(
                                            node.name,
                                            current_role,
                                        ),
                                    );
                                }
                            } else {
                                warnings.push(
                                    w::a11y_no_noninteractive_element_to_interactive_role(
                                        node.name,
                                        current_role,
                                    ),
                                );
                            }
                        }
                    }
                }
            }

            // no-access-key
            if name == "accesskey" {
                warnings.push(w::a11y_accesskey().at(attr_start, attr_end));
            }

            // no-autofocus
            if name == "autofocus" && node.name != "dialog" && !is_parent(ancestors, &["dialog"]) {
                warnings.push(w::a11y_autofocus().at(attr_start, attr_end));
            }

            // scope
            if name == "scope" && !is_dynamic_element && node.name != "th" {
                warnings.push(w::a11y_misplaced_scope().at(attr_start, attr_end));
            }

            // tabindex-no-positive
            if name == "tabindex"
                && let Some(value) = get_static_value(attribute)
                && value.to_number() > 0.0
            {
                warnings.push(w::a11y_positive_tabindex().at(attr_start, attr_end));
            }

            stamp_attribute(&mut warnings[mark..], attr);
        }
    }

    let has_role_attr = attribute_map.contains_key("role");
    let role_static_value = attribute_map
        .get("role")
        .and_then(|attr| get_static_text_value(attr));

    // click-events-have-key-events
    if handlers.contains("click") {
        let is_non_presentation_role =
            role_static_value.is_some() && !is_presentation_role(role_static_value.unwrap());
        if !is_dynamic_element
            && !is_hidden_from_screen_reader(node.name, &attribute_map)
            && (!has_role_attr || is_non_presentation_role)
            && !is_interactive_element(node.name, &attribute_map)
            && !has_spread
        {
            let has_key_event = handlers.contains("keydown")
                || handlers.contains("keyup")
                || handlers.contains("keypress");
            if !has_key_event {
                warnings.push(w::a11y_click_events_have_key_events(node.name));
            }
        }
    }

    // role-supports-aria-props
    // Compute the effective role value: explicit role attribute or implicit role from element name
    let role_value: Option<&str> = if has_role_attr {
        role_static_value
    } else {
        get_implicit_role(node.name, &attribute_map)
    };

    if let Some(rv) = role_value
        && constants::ROLE_ALLOWED_ARIA_PROPS.contains_key(rv)
    {
        let allowed_props = constants::ROLE_ALLOWED_ARIA_PROPS[rv];
        let is_implicit = !has_role_attr;

        for attr in &attributes {
            if let AttributeNode::Attribute(a) = attr {
                let mark = warnings.len();
                let attr_name = a.name.as_str();
                if let Some(aria_suffix) = attr_name.strip_prefix("aria-") {
                    // Only check valid ARIA attributes - misspelled ones are caught
                    // by a11y-aria-props separately
                    let is_valid_aria = constants::ARIA_ATTRIBUTES.contains(&aria_suffix);
                    if is_valid_aria && !allowed_props.contains(&attr_name) {
                        if is_implicit {
                            warnings.push(
                                w::a11y_role_supports_aria_props_implicit(attr_name, rv, node.name)
                                    .at(a.start, a.end),
                            );
                        } else {
                            warnings.push(
                                w::a11y_role_supports_aria_props(attr_name, rv).at(a.start, a.end),
                            );
                        }
                    }
                }
                stamp_attribute(&mut warnings[mark..], a);
            }
        }
    }

    // no-noninteractive-tabindex
    // Check: if tabindex exists AND (value is dynamic/None OR value is >= 0)
    // This matches the official Svelte implementation: (tab_index_value === null || Number(tab_index_value) >= 0)
    if !is_dynamic_element
        && !is_interactive_element(node.name, &attribute_map)
        && !role_static_value.is_some_and(is_interactive_roles)
        && let Some(tab_index) = attribute_map.get("tabindex")
    {
        let tab_index_value = get_static_text_value(tab_index);
        let should_warn = tab_index_value.is_none()  // Dynamic value (like {0}) or valueless
            || tab_index_value.is_some_and(|v| js_str_to_number(v) >= 0.0);
        if should_warn {
            warnings.push(w::a11y_no_noninteractive_tabindex());
        }
    }

    // no-noninteractive-element-interactions
    if !has_spread
        && !has_contenteditable_attr
        && !is_hidden_from_screen_reader(node.name, &attribute_map)
        && !role_static_value.is_some_and(is_presentation_role)
    {
        // Check if element should trigger the warning:
        // (!is_interactive_element && is_non_interactive_roles) ||
        // (is_non_interactive_element && !role)
        let should_check = (!is_interactive_element(node.name, &attribute_map)
            && role_static_value.is_some_and(is_non_interactive_roles))
            || (is_non_interactive_element(node.name, &attribute_map) && !has_role_attr);

        if should_check {
            let has_interactive_handlers = handlers
                .iter()
                .any(|h| A11Y_RECOMMENDED_INTERACTIVE_HANDLERS.contains(&h.as_str()));
            if has_interactive_handlers {
                warnings.push(w::a11y_no_noninteractive_element_interactions(node.name));
            }
        }
    }

    // no-static-element-interactions
    // Check: (!role || role_static_value !== null)
    // This means: either there's no role attribute, OR if there is a role, it has a static value
    if !has_spread
        && (!has_role_attr || role_static_value.is_some())
        && !is_hidden_from_screen_reader(node.name, &attribute_map)
        && role_static_value.is_none_or(|r| !is_presentation_role(r))
        && !is_interactive_element(node.name, &attribute_map)
        && !role_static_value.is_some_and(is_interactive_roles)
        && !is_non_interactive_element(node.name, &attribute_map)
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
                node.name,
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

    match node.name {
        "a" | "button" => {
            let is_hidden = static_text_is(attribute_map.get("aria-hidden"), "true")
                || attribute_map
                    .get("inert")
                    .is_some_and(|a| get_static_value(a).is_some());

            if !has_spread && !is_hidden && !is_labelled && !has_content(node.fragment) {
                warnings.push(w::a11y_consider_explicit_label());
            }

            if node.name == "a" {
                let href = attribute_map
                    .get("href")
                    .or_else(|| attribute_map.get("xlink:href"));
                if let Some(href_attr) = href {
                    if let AttributeNode::Attribute(a) = href_attr
                        && let Some(href_value) = get_static_text_value(href_attr)
                        && (href_value.is_empty()
                            || href_value == "#"
                            || REGEX_JS_PREFIX.is_match(href_value))
                    {
                        let mark = warnings.len();
                        // Upstream names the attribute that was found, so `xlink:href` reports itself.
                        warnings.push(w::a11y_invalid_attribute(href_value, &a.name));
                        stamp_attribute(&mut warnings[mark..], a);
                    }
                } else if !has_spread {
                    let id_attribute = attribute_map.get("id").and_then(|a| get_static_value(a));
                    let name_attribute =
                        attribute_map.get("name").and_then(|a| get_static_value(a));
                    if !id_attribute.is_some_and(StaticValue::is_truthy)
                        && !name_attribute.is_some_and(StaticValue::is_truthy)
                        && !static_text_is(attribute_map.get("aria-disabled"), "true")
                    {
                        warn_missing_attribute(&mut warnings, node.name, &["href"], None);
                    }
                }
            }
        }
        "input" => {
            let type_value = attribute_map
                .get("type")
                .and_then(|t| get_static_text_value(t));
            if type_value == Some("image") && !has_spread {
                let required_attributes = ["alt", "aria-label", "aria-labelledby"];
                let has_attribute = required_attributes
                    .iter()
                    .any(|name| attribute_map.contains_key(*name));
                if !has_attribute {
                    warn_missing_attribute(
                        &mut warnings,
                        node.name,
                        &required_attributes,
                        Some("input type=\"image\""),
                    );
                }
            }
            // autocomplete-valid check (a11y/index.js L431-442)
            if let Some(autocomplete_attr) = attribute_map.get("autocomplete")
                && let AttributeNode::Attribute(a) = autocomplete_attr
                && attribute_map.contains_key("type")
            {
                let autocomplete_value = get_static_value(autocomplete_attr);
                if !is_valid_autocomplete(autocomplete_value) {
                    let display_value = match autocomplete_value {
                        Some(StaticValue::Text(v)) => v,
                        _ => "true",
                    };
                    let mark = warnings.len();
                    warnings.push(w::a11y_autocomplete_valid(
                        display_value,
                        type_value.unwrap_or("..."),
                    ));
                    stamp_attribute(&mut warnings[mark..], a);
                }
            }
        }
        "img" => {
            if let Some(alt_attribute) = attribute_map.get("alt")
                && let Some(alt_value) = get_static_text_value(alt_attribute)
            {
                let aria_hidden = attribute_map
                    .get("aria-hidden")
                    .and_then(|a| get_static_value(a));
                if !aria_hidden.is_some_and(StaticValue::is_truthy)
                    && !has_spread
                    && REGEX_REDUNDANT_IMG_ALT.is_match(alt_value)
                {
                    warnings.push(w::a11y_img_redundant_alt());
                }
            }
        }
        "label"
            if !has_spread
                && !attribute_map.contains_key("for")
                && !has_input_child(node.fragment) =>
        {
            warnings.push(w::a11y_label_has_associated_control());
        }
        "video" => {
            let aria_hidden_exist = static_text_is(attribute_map.get("aria-hidden"), "true");

            if attribute_map.contains_key("muted") || aria_hidden_exist || has_spread {
                // Skip video caption check if muted, aria-hidden, or has spread
            } else if !attribute_map.contains_key("src") {
                // Skip video caption check if no src attribute
            } else {
                // Upstream reads only the FIRST `<track>` (`nodes.find(...)`), so a
                // `<video>` whose caption track is not the first one still warns.
                let has_caption = node
                    .fragment
                    .nodes
                    .iter()
                    .find_map(|n| match n {
                        TemplateNode::RegularElement(el) if el.name == "track" => Some(el),
                        _ => None,
                    })
                    .is_some_and(|track| {
                        track.attributes.iter().any(|a| {
                            matches!(a, AttributeNode::SpreadAttribute(_))
                                || matches!(a, AttributeNode::Attribute(attr) if attr.name == "kind" && get_static_value(a) == Some(StaticValue::Text("captions")))
                        })
                    });

                if !has_caption {
                    warnings.push(w::a11y_media_has_caption());
                }
            }
        }
        "figcaption" if !is_parent(ancestors, &["figure"]) => {
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
                let mut warning = w::a11y_figcaption_index();
                // Upstream warns on the offending child, not the visited
                // `<figure>`; without this the caller stamps the element span.
                if let TemplateNode::RegularElement(el) = children[idx] {
                    warning.start = Some(el.start);
                    warning.end = Some(el.end);
                }
                warnings.push(warning);
            }
        }
        _ => {}
    }

    // Check required attributes
    if !has_spread
        && node.name != "a"
        && let Some(required_attributes) = A11Y_REQUIRED_ATTRIBUTES.get(node.name)
    {
        let has_attribute = required_attributes
            .iter()
            .any(|name| attribute_map.contains_key(*name));
        if !has_attribute {
            warn_missing_attribute(&mut warnings, node.name, required_attributes, None);
        }
    }

    // no-distracting-elements
    if A11Y_DISTRACTING_ELEMENTS.contains(&node.name) {
        warnings.push(w::a11y_distracting_elements(node.name));
    }

    // Check content
    if !has_spread
        && !is_labelled
        && !has_contenteditable_binding
        && A11Y_REQUIRED_CONTENT.contains(&node.name)
        && !has_content(node.fragment)
    {
        warnings.push(w::a11y_missing_content(node.name));
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
        && get_static_value(type_attr) == Some(StaticValue::Text("hidden"))
    {
        return true;
    }

    if let Some(aria_hidden) = attribute_map.get("aria-hidden") {
        return match get_static_value(aria_hidden) {
            None => true, // Dynamic value
            Some(StaticValue::True) => true,
            Some(StaticValue::Text(value)) => value == "true",
        };
    }

    false
}

fn has_disabled_attribute(attribute_map: &FxHashMap<String, &AttributeNode>) -> bool {
    if let Some(disabled) = attribute_map.get("disabled")
        && get_static_value(disabled).is_some_and(StaticValue::is_truthy)
    {
        return true;
    }

    if static_text_is(attribute_map.get("aria-disabled"), "true") {
        return true;
    }

    false
}

fn match_schemas_by_index(
    schemas: &[RoleRelationConcept],
    index: &FxHashMap<&'static str, Vec<usize>>,
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
    if let Some(schema_attrs) = schema.attributes {
        for schema_attr in schema_attrs {
            if let Some(attribute) = attribute_map.get(schema_attr.name) {
                if let Some(expected_value) = schema_attr.value {
                    if let Some(actual_value) = get_static_text_value(attribute) {
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
        INTERACTIVE_ELEMENT_ROLE_SCHEMAS,
        &INTERACTIVE_ELEMENT_ROLE_INDEX,
        tag_name,
        attribute_map,
    ) {
        return element_interactivity::INTERACTIVE;
    }

    if tag_name != "header"
        && match_schemas_by_index(
            NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS,
            &NON_INTERACTIVE_ELEMENT_ROLE_INDEX,
            tag_name,
            attribute_map,
        )
    {
        return element_interactivity::NON_INTERACTIVE;
    }

    if match_schemas_by_index(
        INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS,
        &INTERACTIVE_ELEMENT_AX_OBJECT_INDEX,
        tag_name,
        attribute_map,
    ) {
        return element_interactivity::INTERACTIVE;
    }

    if match_schemas_by_index(
        NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS,
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
        .and_then(|t| get_static_text_value(t))
        .filter(|t| !t.is_empty())?;
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
        .and_then(|t| get_static_text_value(t))
        .filter(|t| !t.is_empty())?;
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

/// Upstream's `get_static_value` yields `null | true | string`; a valueless
/// attribute (`<div role>`) is the boolean `true`, which is not the string
/// `"true"` any check may compare against.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum StaticValue<'b> {
    True,
    Text(&'b str),
}

impl StaticValue<'_> {
    /// JS truthiness, which upstream tests directly on the result.
    fn is_truthy(self) -> bool {
        !matches!(self, StaticValue::Text(""))
    }

    /// JS `Number(value)`: `true` is 1 and a string coerces numerically.
    fn to_number(self) -> f64 {
        match self {
            StaticValue::True => 1.0,
            StaticValue::Text(s) => js_str_to_number(s),
        }
    }
}

/// JS `Number(string)` coercion — an empty/whitespace string is 0, and the
/// numeric grammar is wider than Rust's `parse`.
fn js_str_to_number(s: &str) -> f64 {
    let t = s.trim_matches(|c: char| c.is_whitespace() || c == '\u{feff}');
    if t.is_empty() {
        return 0.0;
    }
    if let Some(hex) = t.strip_prefix("0x").or_else(|| t.strip_prefix("0X")) {
        return i64::from_str_radix(hex, 16)
            .map(|v| v as f64)
            .unwrap_or(f64::NAN);
    }
    if let Some(oct) = t.strip_prefix("0o").or_else(|| t.strip_prefix("0O")) {
        return i64::from_str_radix(oct, 8)
            .map(|v| v as f64)
            .unwrap_or(f64::NAN);
    }
    if let Some(bin) = t.strip_prefix("0b").or_else(|| t.strip_prefix("0B")) {
        return i64::from_str_radix(bin, 2)
            .map(|v| v as f64)
            .unwrap_or(f64::NAN);
    }
    match t {
        "Infinity" | "+Infinity" => return f64::INFINITY,
        "-Infinity" => return f64::NEG_INFINITY,
        _ => {}
    }
    // Rust accepts `inf`/`nan`/`1_0`; JS does not.
    if t.bytes()
        .any(|b| matches!(b, b'i' | b'I' | b'n' | b'N' | b'_'))
    {
        return f64::NAN;
    }
    t.parse::<f64>().unwrap_or(f64::NAN)
}

fn get_static_value<'b>(attribute: &'b AttributeNode<'_>) -> Option<StaticValue<'b>> {
    if let AttributeNode::Attribute(attr) = attribute {
        if matches!(attr.value, AttributeValue::True(_)) {
            return Some(StaticValue::True);
        }
        if let AttributeValue::Sequence(parts) = &attr.value
            && parts.len() == 1
            && let crate::ast::template::AttributeValuePart::Text(text) = &parts[0]
        {
            return Some(StaticValue::Text(&text.data));
        }
    }
    None
}

/// Upstream's `get_static_text_value`: the valueless spelling reads as absent.
fn get_static_text_value<'b>(attribute: &'b AttributeNode<'_>) -> Option<&'b str> {
    match get_static_value(attribute)? {
        StaticValue::True => None,
        StaticValue::Text(s) => Some(s),
    }
}

/// `get_static_value(attr) === expected` for a string `expected`.
fn static_text_is(attribute: Option<&&AttributeNode<'_>>, expected: &str) -> bool {
    attribute.map(|a| get_static_value(a)) == Some(Some(StaticValue::Text(expected)))
}

fn has_content(fragment: &Fragment) -> bool {
    for node in &fragment.nodes {
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
                if has_content(&el.fragment) {
                    return true;
                }
            }
            // Upstream shares this arm with RegularElement, so an EMPTY
            // `<svelte:element>` child is not content either; its name can never
            // be `img` or `selectedcontent`, so only the popover skip applies.
            TemplateNode::SvelteElement(el) => {
                let is_popover = el
                    .attributes
                    .iter()
                    .any(|a| matches!(a, AttributeNode::Attribute(attr) if attr.name == "popover"));
                if is_popover {
                    continue;
                }
                if has_content(&el.fragment) {
                    return true;
                }
            }
            TemplateNode::Comment(_) => {}
            _ => return true, // Assume everything else has content
        }
    }
    false
}
fn is_parent(ancestors: &A11yAncestors, elements: &[&str]) -> bool {
    // Check if the immediate parent element name is in the list
    if let Some(parent_name) = ancestors.names.last() {
        return elements.contains(&parent_name.as_str());
    }
    // Upstream plays it safe when the nearest element ancestor is dynamic.
    ancestors.inside_dynamic_element
}

fn has_input_child(fragment: &Fragment) -> bool {
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

    walk_fragment(fragment)
}

/// Helper to generate missing attribute warning with proper article and sequence.
fn warn_missing_attribute(
    warnings: &mut Vec<w::AnalysisWarning>,
    element_name: &str,
    attributes: &[&str],
    context: Option<&str>,
) {
    let name = context.unwrap_or(element_name);
    let article = if attributes[0] == "href" || REGEX_STARTS_WITH_VOWEL.is_match(attributes[0]) {
        "an"
    } else {
        "a"
    };

    let sequence = if attributes.len() == 1 {
        attributes[0].to_string()
    } else {
        let last = attributes.last().unwrap();
        let rest = &attributes[..attributes.len() - 1];
        format!("{} or {}", rest.join(", "), last)
    };

    warnings.push(w::a11y_missing_attribute(name, article, &sequence));
}

/// Format a list of strings with a conjunction.
/// Examples:
/// - ["a"] -> "a"
/// - ["a", "b"] -> "a or b"
/// - ["a", "b", "c"] -> "a, b or c"
fn quoted_value_list(values: &[&str]) -> String {
    let quoted: Vec<String> = values.iter().map(|v| format!("\"{}\"", v)).collect();
    let refs: Vec<&str> = quoted.iter().map(String::as_str).collect();
    list(&refs, "or")
}

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
                static_text_is(attribute_map.get(*attr_name), attr_value)
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
    is_bare: bool,
    (start, end): (u32, u32),
) {
    // A bare ARIA attribute (no value) is *not* a valid value for any
    // typed property — upstream emits the type-specific
    // `a11y_incorrect_aria_attribute_type[_<kind>]` warning. (#454, H-078)
    if is_bare {
        match schema.property_type {
            AriaPropertyType::Boolean => {
                warnings.push(w::a11y_incorrect_aria_attribute_type_boolean(name).at(start, end));
            }
            AriaPropertyType::Tristate => {
                warnings.push(w::a11y_incorrect_aria_attribute_type_tristate(name).at(start, end));
            }
            AriaPropertyType::Integer => {
                warnings.push(w::a11y_incorrect_aria_attribute_type_integer(name).at(start, end));
            }
            AriaPropertyType::Number => {
                warnings.push(w::a11y_incorrect_aria_attribute_type(name, "number").at(start, end));
            }
            AriaPropertyType::Id | AriaPropertyType::String => {
                warnings.push(
                    w::a11y_incorrect_aria_attribute_type(name, "non-empty string").at(start, end),
                );
            }
            AriaPropertyType::IdList => {
                warnings.push(w::a11y_incorrect_aria_attribute_type_idlist(name).at(start, end));
            }
            AriaPropertyType::Token => {
                if let Some(valid_values) = schema.values {
                    warnings.push(
                        w::a11y_incorrect_aria_attribute_type_token(
                            name,
                            &quoted_value_list(valid_values),
                        )
                        .at(start, end),
                    );
                }
            }
            AriaPropertyType::TokenList => {
                if let Some(valid_values) = schema.values {
                    warnings.push(
                        w::a11y_incorrect_aria_attribute_type_tokenlist(
                            name,
                            &quoted_value_list(valid_values),
                        )
                        .at(start, end),
                    );
                }
            }
        }
        return;
    }

    // If value is None (dynamic, e.g. `aria-hidden={x}`), skip validation.
    let value = match value {
        None => return,
        Some(v) => v,
    };

    match schema.property_type {
        AriaPropertyType::Id | AriaPropertyType::String => {
            if value.is_empty() {
                warnings.push(
                    w::a11y_incorrect_aria_attribute_type(name, "non-empty string").at(start, end),
                );
            }
        }
        AriaPropertyType::Number => {
            if value.is_empty() || value.parse::<f64>().is_err() {
                warnings.push(w::a11y_incorrect_aria_attribute_type(name, "number").at(start, end));
            }
        }
        AriaPropertyType::Boolean => {
            if value != "true" && value != "false" {
                warnings.push(w::a11y_incorrect_aria_attribute_type_boolean(name).at(start, end));
            }
        }
        AriaPropertyType::IdList => {
            if value.is_empty() {
                warnings.push(w::a11y_incorrect_aria_attribute_type_idlist(name).at(start, end));
            }
        }
        AriaPropertyType::Integer => {
            let is_valid_integer = if value.is_empty() {
                false
            } else {
                value.parse::<f64>().is_ok_and(|n| n.fract() == 0.0)
            };
            if !is_valid_integer {
                warnings.push(w::a11y_incorrect_aria_attribute_type_integer(name).at(start, end));
            }
        }
        AriaPropertyType::Token => {
            if let Some(valid_values) = schema.values {
                let lowercase_value = value.to_lowercase();
                if !valid_values
                    .iter()
                    .any(|v| v.to_lowercase() == lowercase_value)
                {
                    warnings.push(
                        w::a11y_incorrect_aria_attribute_type_token(
                            name,
                            &quoted_value_list(valid_values),
                        )
                        .at(start, end),
                    );
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
                    warnings.push(
                        w::a11y_incorrect_aria_attribute_type_tokenlist(
                            name,
                            &quoted_value_list(valid_values),
                        )
                        .at(start, end),
                    );
                }
            }
        }
        AriaPropertyType::Tristate => {
            if value != "true" && value != "false" && value != "mixed" {
                warnings.push(w::a11y_incorrect_aria_attribute_type_tristate(name).at(start, end));
            }
        }
    }
}

/// Validate an autocomplete attribute value.
/// Corresponds to `is_valid_autocomplete` in the official compiler's a11y/index.js.
fn is_valid_autocomplete(autocomplete: Option<StaticValue<'_>>) -> bool {
    let autocomplete = match autocomplete {
        Some(StaticValue::True) => return false,
        None | Some(StaticValue::Text("")) => return true, // dynamic or falsy value
        Some(StaticValue::Text(v)) => v,
    };

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
