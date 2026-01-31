//! Compiler warning definitions.
//!
//! This module provides warning functions for non-fatal issues detected during the analyze phase.
//! Each function corresponds to a specific warning code in the Svelte compiler.
//!
//! Corresponds to Svelte's `warnings.js`.

/// Warning type for analysis phase.
#[derive(Debug)]
pub struct AnalysisWarning {
    /// The warning code
    pub code: String,
    /// The warning message
    pub message: String,
}

impl AnalysisWarning {
    /// Create a new warning with a code and message.
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
        }
    }
}

/// Create a warning with a specific code and message.
fn warning(code: &str, message: impl Into<String>) -> AnalysisWarning {
    AnalysisWarning::new(code, message)
}

// Component creation warnings

/// Creating a component with `new ComponentName({ target: ... })` is deprecated.
/// Use `mount(ComponentName, { target: ... })` instead.
pub fn legacy_component_creation() -> AnalysisWarning {
    warning(
        "legacy_component_creation",
        "Creating a component with `new ComponentName({ target: ... })` is deprecated. Use `mount(ComponentName, { target: ... })` instead",
    )
}

/// State referenced locally - may not be reactive
pub fn state_referenced_locally(name: &str, context_type: &str) -> AnalysisWarning {
    let message = if context_type == "derived" {
        "State referenced in its own scope will never update. Did you mean to reference it inside a closure?".to_string()
    } else {
        format!(
            "State `{}` referenced in its own scope will never update. Did you mean to reference it inside a closure?",
            name
        )
    };

    warning("state_referenced_locally", message)
}

/// Reactive declaration references module script dependency
pub fn reactive_declaration_module_script_dependency() -> AnalysisWarning {
    warning(
        "reactive_declaration_module_script_dependency",
        "Reactive declarations in instance script should not reference variables from module script that are reassigned. This can lead to unexpected behavior.",
    )
}

/// Reactive declaration is invalid placement (not at the top level of an instance script)
pub fn reactive_declaration_invalid_placement() -> AnalysisWarning {
    warning(
        "reactive_declaration_invalid_placement",
        "Reactive declarations are only valid at the top level of the instance script",
    )
}

// Performance warnings

/// Avoid 'new class' — instead, declare the class at the top level scope
pub fn perf_avoid_inline_class() -> AnalysisWarning {
    warning(
        "perf_avoid_inline_class",
        "Avoid 'new class' — instead, declare the class at the top level scope\nhttps://svelte.dev/e/perf_avoid_inline_class",
    )
}

/// Avoid declaring classes below the top level scope
pub fn perf_avoid_nested_class() -> AnalysisWarning {
    warning(
        "perf_avoid_nested_class",
        "Avoid declaring classes below the top level scope\nhttps://svelte.dev/e/perf_avoid_nested_class",
    )
}

// Security warnings

/// Bidirectional control character detected in code.
///
/// These Unicode characters can alter the visual direction of code
/// and could have unintended security consequences.
///
/// Corresponds to Svelte's `bidirectional_control_characters` warning.
pub fn bidirectional_control_characters() -> AnalysisWarning {
    warning(
        "bidirectional_control_characters",
        "A bidirectional control character was detected in your code. These characters can be used to alter the visual direction of your code and could have unintended consequences\nhttps://svelte.dev/e/bidirectional_control_characters",
    )
}

// Slot element warnings

/// Using `<slot>` to render parent content is deprecated. Use `{@render ...}` tags instead
pub fn slot_element_deprecated() -> AnalysisWarning {
    warning(
        "slot_element_deprecated",
        "Using `<slot>` to render parent content is deprecated. Use `{@render ...}` tags instead",
    )
}

/// `<svelte:self>` is deprecated — use self-imports (e.g. `import Component from './Component.svelte'`) instead
pub fn svelte_self_deprecated(name: &str, basename: &str) -> AnalysisWarning {
    warning(
        "svelte_self_deprecated",
        format!(
            "`<svelte:self>` is deprecated — use self-imports (e.g. `import {} from './{}'`) instead\nhttps://svelte.dev/e/svelte_self_deprecated",
            name, basename
        ),
    )
}

/// `<svelte:component>` is deprecated in runes mode — components are dynamic by default
pub fn svelte_component_deprecated() -> AnalysisWarning {
    warning(
        "svelte_component_deprecated",
        "`<svelte:component>` is deprecated in runes mode — components are dynamic by default",
    )
}

// Attribute warnings

/// Attributes should not contain ':' characters to prevent ambiguity with Svelte directives
pub fn attribute_illegal_colon() -> AnalysisWarning {
    warning(
        "attribute_illegal_colon",
        "Attributes should not contain ':' characters to prevent ambiguity with Svelte directives",
    )
}

// A11y warnings

/// Avoid using accesskey
pub fn a11y_accesskey() -> AnalysisWarning {
    warning(
        "a11y_accesskey",
        "Avoid using accesskey\nhttps://svelte.dev/e/a11y_accesskey",
    )
}

/// An element with an aria-activedescendant attribute should have a tabindex value
pub fn a11y_aria_activedescendant_has_tabindex() -> AnalysisWarning {
    warning(
        "a11y_aria_activedescendant_has_tabindex",
        "An element with an aria-activedescendant attribute should have a tabindex value\nhttps://svelte.dev/e/a11y_aria_activedescendant_has_tabindex",
    )
}

/// Element should not have aria-* attributes
pub fn a11y_aria_attributes(name: &str) -> AnalysisWarning {
    warning(
        "a11y_aria_attributes",
        format!(
            "`<{}>` should not have aria-* attributes\nhttps://svelte.dev/e/a11y_aria_attributes",
            name
        ),
    )
}

/// Invalid value for autocomplete on input element
pub fn a11y_autocomplete_valid(value: &str, input_type: &str) -> AnalysisWarning {
    warning(
        "a11y_autocomplete_valid",
        format!(
            "'{}' is an invalid value for 'autocomplete' on `<input type=\"{}\">`\nhttps://svelte.dev/e/a11y_autocomplete_valid",
            value, input_type
        ),
    )
}

/// Avoid using autofocus
pub fn a11y_autofocus() -> AnalysisWarning {
    warning(
        "a11y_autofocus",
        "Avoid using autofocus\nhttps://svelte.dev/e/a11y_autofocus",
    )
}

/// Visible, non-interactive elements with a click event must be accompanied by a keyboard event handler
pub fn a11y_click_events_have_key_events() -> AnalysisWarning {
    warning(
        "a11y_click_events_have_key_events",
        "Visible, non-interactive elements with a click event must be accompanied by a keyboard event handler. Consider whether an interactive element such as `<button type=\"button\">` or `<a>` might be more appropriate\nhttps://svelte.dev/e/a11y_click_events_have_key_events",
    )
}

/// Buttons and links should either contain text or have an aria-label, aria-labelledby or title attribute
pub fn a11y_consider_explicit_label() -> AnalysisWarning {
    warning(
        "a11y_consider_explicit_label",
        "Buttons and links should either contain text or have an `aria-label`, `aria-labelledby` or `title` attribute\nhttps://svelte.dev/e/a11y_consider_explicit_label",
    )
}

/// Avoid distracting elements
pub fn a11y_distracting_elements(name: &str) -> AnalysisWarning {
    warning(
        "a11y_distracting_elements",
        format!(
            "Avoid `<{}>` elements\nhttps://svelte.dev/e/a11y_distracting_elements",
            name
        ),
    )
}

/// `<figcaption>` must be first or last child of `<figure>`
pub fn a11y_figcaption_index() -> AnalysisWarning {
    warning(
        "a11y_figcaption_index",
        "`<figcaption>` must be first or last child of `<figure>`\nhttps://svelte.dev/e/a11y_figcaption_index",
    )
}

/// `<figcaption>` must be an immediate child of `<figure>`
pub fn a11y_figcaption_parent() -> AnalysisWarning {
    warning(
        "a11y_figcaption_parent",
        "`<figcaption>` must be an immediate child of `<figure>`\nhttps://svelte.dev/e/a11y_figcaption_parent",
    )
}

/// Element should not be hidden
pub fn a11y_hidden(name: &str) -> AnalysisWarning {
    warning(
        "a11y_hidden",
        format!(
            "`<{}>` element should not be hidden\nhttps://svelte.dev/e/a11y_hidden",
            name
        ),
    )
}

/// Screenreaders already announce `<img>` elements as an image
pub fn a11y_img_redundant_alt() -> AnalysisWarning {
    warning(
        "a11y_img_redundant_alt",
        "Screenreaders already announce `<img>` elements as an image\nhttps://svelte.dev/e/a11y_img_redundant_alt",
    )
}

/// Elements with the interactive role must have a tabindex value
pub fn a11y_interactive_supports_focus(role: &str) -> AnalysisWarning {
    warning(
        "a11y_interactive_supports_focus",
        format!(
            "Elements with the '{}' interactive role must have a tabindex value\nhttps://svelte.dev/e/a11y_interactive_supports_focus",
            role
        ),
    )
}

/// Invalid href attribute value
pub fn a11y_invalid_attribute(href_value: &str, href_attribute: &str) -> AnalysisWarning {
    warning(
        "a11y_invalid_attribute",
        format!(
            "'{}' is not a valid {} attribute\nhttps://svelte.dev/e/a11y_invalid_attribute",
            href_value, href_attribute
        ),
    )
}

/// A form label must be associated with a control
pub fn a11y_label_has_associated_control() -> AnalysisWarning {
    warning(
        "a11y_label_has_associated_control",
        "A form label must be associated with a control\nhttps://svelte.dev/e/a11y_label_has_associated_control",
    )
}

/// `<video>` elements must have a `<track kind="captions">`
pub fn a11y_media_has_caption() -> AnalysisWarning {
    warning(
        "a11y_media_has_caption",
        "`<video>` elements must have a `<track kind=\"captions\">`\nhttps://svelte.dev/e/a11y_media_has_caption",
    )
}

/// Element should not have role attribute
pub fn a11y_misplaced_role(name: &str) -> AnalysisWarning {
    warning(
        "a11y_misplaced_role",
        format!(
            "`<{}>` should not have role attribute\nhttps://svelte.dev/e/a11y_misplaced_role",
            name
        ),
    )
}

/// The scope attribute should only be used with `<th>` elements
pub fn a11y_misplaced_scope() -> AnalysisWarning {
    warning(
        "a11y_misplaced_scope",
        "The scope attribute should only be used with `<th>` elements\nhttps://svelte.dev/e/a11y_misplaced_scope",
    )
}

/// Element should have required attribute
pub fn a11y_missing_attribute(name: &str, article: &str, sequence: &str) -> AnalysisWarning {
    warning(
        "a11y_missing_attribute",
        format!(
            "`<{}>` element should have {} {} attribute\nhttps://svelte.dev/e/a11y_missing_attribute",
            name, article, sequence
        ),
    )
}

/// Element should contain text
pub fn a11y_missing_content(name: &str) -> AnalysisWarning {
    warning(
        "a11y_missing_content",
        format!(
            "`<{}>` element should contain text\nhttps://svelte.dev/e/a11y_missing_content",
            name
        ),
    )
}

/// Mouse event must be accompanied by keyboard event
pub fn a11y_mouse_events_have_key_events(event: &str, accompanied_by: &str) -> AnalysisWarning {
    warning(
        "a11y_mouse_events_have_key_events",
        format!(
            "'{}' event must be accompanied by '{}' event\nhttps://svelte.dev/e/a11y_mouse_events_have_key_events",
            event, accompanied_by
        ),
    )
}

/// Abstract role is forbidden
pub fn a11y_no_abstract_role(role: &str) -> AnalysisWarning {
    warning(
        "a11y_no_abstract_role",
        format!(
            "Abstract role '{}' is forbidden\nhttps://svelte.dev/e/a11y_no_abstract_role",
            role
        ),
    )
}

/// Interactive element cannot have non-interactive role
pub fn a11y_no_interactive_element_to_noninteractive_role(
    element: &str,
    role: &str,
) -> AnalysisWarning {
    warning(
        "a11y_no_interactive_element_to_noninteractive_role",
        format!(
            "`<{}>` cannot have role '{}'\nhttps://svelte.dev/e/a11y_no_interactive_element_to_noninteractive_role",
            element, role
        ),
    )
}

/// Non-interactive element should not be assigned mouse or keyboard event listeners
pub fn a11y_no_noninteractive_element_interactions(element: &str) -> AnalysisWarning {
    warning(
        "a11y_no_noninteractive_element_interactions",
        format!(
            "Non-interactive element `<{}>` should not be assigned mouse or keyboard event listeners\nhttps://svelte.dev/e/a11y_no_noninteractive_element_interactions",
            element
        ),
    )
}

/// Non-interactive element cannot have interactive role
pub fn a11y_no_noninteractive_element_to_interactive_role(
    element: &str,
    role: &str,
) -> AnalysisWarning {
    warning(
        "a11y_no_noninteractive_element_to_interactive_role",
        format!(
            "Non-interactive element `<{}>` cannot have interactive role '{}'\nhttps://svelte.dev/e/a11y_no_noninteractive_element_to_interactive_role",
            element, role
        ),
    )
}

/// Noninteractive element cannot have nonnegative tabIndex value
pub fn a11y_no_noninteractive_tabindex() -> AnalysisWarning {
    warning(
        "a11y_no_noninteractive_tabindex",
        "noninteractive element cannot have nonnegative tabIndex value\nhttps://svelte.dev/e/a11y_no_noninteractive_tabindex",
    )
}

/// Redundant role
pub fn a11y_no_redundant_roles(role: &str) -> AnalysisWarning {
    warning(
        "a11y_no_redundant_roles",
        format!(
            "Redundant role '{}'\nhttps://svelte.dev/e/a11y_no_redundant_roles",
            role
        ),
    )
}

/// Element with handler must have an ARIA role
pub fn a11y_no_static_element_interactions(element: &str, handler: &str) -> AnalysisWarning {
    warning(
        "a11y_no_static_element_interactions",
        format!(
            "`<{}>` with a {} handler must have an ARIA role\nhttps://svelte.dev/e/a11y_no_static_element_interactions",
            element, handler
        ),
    )
}

/// Avoid tabindex values above zero
pub fn a11y_positive_tabindex() -> AnalysisWarning {
    warning(
        "a11y_positive_tabindex",
        "Avoid tabindex values above zero\nhttps://svelte.dev/e/a11y_positive_tabindex",
    )
}

/// Unknown ARIA attribute
pub fn a11y_unknown_aria_attribute(attribute: &str, suggestion: Option<&str>) -> AnalysisWarning {
    let message = if let Some(suggestion) = suggestion {
        format!(
            "Unknown aria attribute 'aria-{}' (did you mean '{}'?)\nhttps://svelte.dev/e/a11y_unknown_aria_attribute",
            attribute, suggestion
        )
    } else {
        format!(
            "Unknown aria attribute 'aria-{}'\nhttps://svelte.dev/e/a11y_unknown_aria_attribute",
            attribute
        )
    };
    warning("a11y_unknown_aria_attribute", message)
}

/// Unknown role
pub fn a11y_unknown_role(role: &str, suggestion: Option<&str>) -> AnalysisWarning {
    let message = if let Some(suggestion) = suggestion {
        format!(
            "Unknown role '{}' (did you mean '{}'?)\nhttps://svelte.dev/e/a11y_unknown_role",
            role, suggestion
        )
    } else {
        format!(
            "Unknown role '{}'\nhttps://svelte.dev/e/a11y_unknown_role",
            role
        )
    };
    warning("a11y_unknown_role", message)
}

// Custom element warnings

/// When creating a custom element, props should be defined using the `customElement.props` compiler option
pub fn custom_element_props_identifier() -> AnalysisWarning {
    warning(
        "custom_element_props_identifier",
        "When creating a custom element, props should be defined using the `customElement.props` compiler option",
    )
}

// Node placement warnings

/// Node placement SSR warning - when an element placement is invalid but can work on client
/// because it's inside a conditional block that creates separate template strings.
pub fn node_invalid_placement_ssr(message: &str) -> AnalysisWarning {
    warning(
        "node_invalid_placement_ssr",
        format!(
            "{}. When rendering this component on the server, the resulting HTML will be modified by the browser (by moving, removing, or inserting elements), likely resulting in a `hydration_mismatch` warning\nhttps://svelte.dev/e/node_invalid_placement_ssr",
            message
        ),
    )
}
