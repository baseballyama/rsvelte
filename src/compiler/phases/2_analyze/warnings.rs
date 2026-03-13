//! Compiler warning definitions.
//!
//! This module provides warning functions for non-fatal issues detected during the analyze phase.
//! Each function corresponds to a specific warning code in the Svelte compiler.
//!
//! Corresponds to Svelte's `warnings.js`.

/// Warning type for analysis phase.
#[derive(Debug, Clone)]
pub struct AnalysisWarning {
    /// The warning code
    pub code: String,
    /// The warning message
    pub message: String,
    /// Start byte offset in source (if available)
    pub start: Option<u32>,
    /// End byte offset in source (if available)
    pub end: Option<u32>,
}

impl AnalysisWarning {
    /// Create a new warning with a code and message.
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            start: None,
            end: None,
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
pub fn state_referenced_locally(
    name: &str,
    context_type: &str,
    node_start: Option<u32>,
    node_end: Option<u32>,
) -> AnalysisWarning {
    let mut w = warning(
        "state_referenced_locally",
        format!(
            "This reference only captures the initial value of `{}`. Did you mean to reference it inside a {} instead?\nhttps://svelte.dev/e/state_referenced_locally",
            name, context_type
        ),
    );
    w.start = node_start;
    w.end = node_end;
    w
}

/// Reactive declaration references module script dependency
pub fn reactive_declaration_module_script_dependency() -> AnalysisWarning {
    warning(
        "reactive_declaration_module_script_dependency",
        "Reassignments of module-level declarations will not cause reactive statements to update\nhttps://svelte.dev/e/reactive_declaration_module_script_dependency",
    )
}

/// Non-reactive update warning - variable is updated but not declared with $state
pub fn non_reactive_update(name: &str) -> AnalysisWarning {
    warning(
        "non_reactive_update",
        format!(
            "`{}` is updated, but is not declared with `$state(...)`. Changing its value will not correctly trigger updates\nhttps://svelte.dev/e/non_reactive_update",
            name
        ),
    )
}

/// Store/rune naming conflict warning
pub fn store_rune_conflict(store_name: &str) -> AnalysisWarning {
    warning(
        "store_rune_conflict",
        format!(
            "It looks like you're using the `${}` rune, but there is a local binding called `{}`. Referencing a local variable with a `$` prefix will create a store subscription. Please rename `{}` to avoid the ambiguity\nhttps://svelte.dev/e/store_rune_conflict",
            store_name, store_name, store_name
        ),
    )
}

/// Global event reference warning
pub fn attribute_global_event_reference(name: &str) -> AnalysisWarning {
    warning(
        "attribute_global_event_reference",
        format!(
            "You are referencing `globalThis.{}`. Did you forget to declare a variable with that name?\nhttps://svelte.dev/e/attribute_global_event_reference",
            name
        ),
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

/// Elements with the ARIA role must have required attributes
pub fn a11y_role_has_required_aria_props(role: &str, props: &str) -> AnalysisWarning {
    warning(
        "a11y_role_has_required_aria_props",
        format!(
            "Elements with the ARIA role \"{}\" must have the following attributes defined: {}\nhttps://svelte.dev/e/a11y_role_has_required_aria_props",
            role, props
        ),
    )
}

/// The attribute is not supported by the role (explicit)
pub fn a11y_role_supports_aria_props(attribute: &str, role: &str) -> AnalysisWarning {
    warning(
        "a11y_role_supports_aria_props",
        format!(
            "The attribute '{}' is not supported by the role '{}'\nhttps://svelte.dev/e/a11y_role_supports_aria_props",
            attribute, role
        ),
    )
}

/// The attribute is not supported by the role (implicit on the element)
pub fn a11y_role_supports_aria_props_implicit(
    attribute: &str,
    role: &str,
    name: &str,
) -> AnalysisWarning {
    warning(
        "a11y_role_supports_aria_props_implicit",
        format!(
            "The attribute '{}' is not supported by the role '{}'. This role is implicit on the element `<{}>`\nhttps://svelte.dev/e/a11y_role_supports_aria_props_implicit",
            attribute, role, name
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

// ARIA proptypes warnings

/// The value of the attribute must be a specific type (generic)
pub fn a11y_incorrect_aria_attribute_type(attribute: &str, expected_type: &str) -> AnalysisWarning {
    warning(
        "a11y_incorrect_aria_attribute_type",
        format!(
            "The value of '{}' must be a {}\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type",
            attribute, expected_type
        ),
    )
}

/// The value of the attribute must be 'true' or 'false' (boolean)
pub fn a11y_incorrect_aria_attribute_type_boolean(attribute: &str) -> AnalysisWarning {
    warning(
        "a11y_incorrect_aria_attribute_type_boolean",
        format!(
            "The value of '{}' must be either 'true' or 'false'. It cannot be empty\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_boolean",
            attribute
        ),
    )
}

/// The value of the attribute must be a DOM element ID
pub fn a11y_incorrect_aria_attribute_type_id(attribute: &str) -> AnalysisWarning {
    warning(
        "a11y_incorrect_aria_attribute_type_id",
        format!(
            "The value of '{}' must be a string that represents a DOM element ID\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_id",
            attribute
        ),
    )
}

/// The value of the attribute must be a space-separated list of DOM element IDs
pub fn a11y_incorrect_aria_attribute_type_idlist(attribute: &str) -> AnalysisWarning {
    warning(
        "a11y_incorrect_aria_attribute_type_idlist",
        format!(
            "The value of '{}' must be a space-separated list of strings that represent DOM element IDs\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_idlist",
            attribute
        ),
    )
}

/// The value of the attribute must be an integer
pub fn a11y_incorrect_aria_attribute_type_integer(attribute: &str) -> AnalysisWarning {
    warning(
        "a11y_incorrect_aria_attribute_type_integer",
        format!(
            "The value of '{}' must be an integer\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_integer",
            attribute
        ),
    )
}

/// The value of the attribute must be one of the specified tokens
pub fn a11y_incorrect_aria_attribute_type_token(attribute: &str, values: &str) -> AnalysisWarning {
    warning(
        "a11y_incorrect_aria_attribute_type_token",
        format!(
            "The value of '{}' must be exactly one of {}\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_token",
            attribute, values
        ),
    )
}

/// The value of the attribute must be a space-separated list of the specified tokens
pub fn a11y_incorrect_aria_attribute_type_tokenlist(
    attribute: &str,
    values: &str,
) -> AnalysisWarning {
    warning(
        "a11y_incorrect_aria_attribute_type_tokenlist",
        format!(
            "The value of '{}' must be a space-separated list of one or more of {}\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_tokenlist",
            attribute, values
        ),
    )
}

/// The value of the attribute must be 'true', 'false', or 'mixed'
pub fn a11y_incorrect_aria_attribute_type_tristate(attribute: &str) -> AnalysisWarning {
    warning(
        "a11y_incorrect_aria_attribute_type_tristate",
        format!(
            "The value of '{}' must be exactly one of true, false, or mixed\nhttps://svelte.dev/e/a11y_incorrect_aria_attribute_type_tristate",
            attribute
        ),
    )
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

// Element warnings

/// Self-closing HTML tags for non-void elements are ambiguous
pub fn element_invalid_self_closing_tag(name: &str) -> AnalysisWarning {
    warning(
        "element_invalid_self_closing_tag",
        format!(
            "Self-closing HTML tags for non-void elements are ambiguous — use `<{} ...></{}>` rather than `<{} ... />`\nhttps://svelte.dev/e/element_invalid_self_closing_tag",
            name, name, name
        ),
    )
}

// Script warnings

/// `context="module"` is deprecated, use the `module` attribute instead
pub fn script_context_deprecated() -> AnalysisWarning {
    warning(
        "script_context_deprecated",
        "`context=\"module\"` is deprecated, use the `module` attribute instead\nhttps://svelte.dev/e/script_context_deprecated",
    )
}

/// Unrecognized script attribute
pub fn script_unknown_attribute() -> AnalysisWarning {
    warning(
        "script_unknown_attribute",
        "Unrecognized attribute — should be one of `generics`, `lang` or `module`. If this exists for a preprocessor, ensure that the preprocessor removes it\nhttps://svelte.dev/e/script_unknown_attribute",
    )
}

// Component warnings

/// Component name starts with a lowercase letter - will be treated as an HTML element
pub fn component_name_lowercase(name: &str) -> AnalysisWarning {
    warning(
        "component_name_lowercase",
        format!(
            "`<{}>` will be treated as an HTML element unless it begins with a capital letter\nhttps://svelte.dev/e/component_name_lowercase",
            name
        ),
    )
}

/// Empty block warning
pub fn block_empty() -> AnalysisWarning {
    warning(
        "block_empty",
        "Empty block\nhttps://svelte.dev/e/block_empty",
    )
}

// Additional warnings for validator tests

/// The customElement option is used when generating a custom element
pub fn options_missing_custom_element() -> AnalysisWarning {
    warning(
        "options_missing_custom_element",
        "The `customElement` option is used when generating a custom element. Did you forget the `customElement: true` compile option?\nhttps://svelte.dev/e/options_missing_custom_element",
    )
}

/// Using a rest element or a non-destructured declaration with $props()
pub fn custom_element_props_identifier_rest() -> AnalysisWarning {
    warning(
        "custom_element_props_identifier",
        "Using a rest element or a non-destructured declaration with `$props()` means that Svelte can't infer what properties to expose when creating a custom element. Consider destructuring all the props or explicitly specifying the `customElement.props` option.\nhttps://svelte.dev/e/custom_element_props_identifier",
    )
}

/// Binding to a rest element in an each block
pub fn bind_invalid_each_rest(name: &str) -> AnalysisWarning {
    warning(
        "bind_invalid_each_rest",
        format!(
            "The rest operator (...) will create a new object and binding '{}' with the original object will not work\nhttps://svelte.dev/e/bind_invalid_each_rest",
            name
        ),
    )
}

/// Quoted single-expression attribute warning
pub fn attribute_quoted() -> AnalysisWarning {
    warning(
        "attribute_quoted",
        "Quoted attribute values will be stringified in a future version of Svelte. If this isn't what you want, remove the quotes\nhttps://svelte.dev/e/attribute_quoted",
    )
}

// Event directive warnings

/// Attribute invalid property name - React style property used in Svelte
pub fn attribute_invalid_property_name(name: &str, correct_name: &str) -> AnalysisWarning {
    warning(
        "attribute_invalid_property_name",
        format!(
            "'{}' is not a valid HTML attribute. Did you mean '{}'?\nhttps://svelte.dev/e/attribute_invalid_property_name",
            name, correct_name
        ),
    )
}

/// Element was implicitly closed by another element
pub fn element_implicitly_closed(tag: &str, closing: &str) -> AnalysisWarning {
    warning(
        "element_implicitly_closed",
        format!(
            "This element is implicitly closed by the following `{}`, which can cause an unexpected DOM structure. Add an explicit `{}` to avoid surprises.\nhttps://svelte.dev/e/element_implicitly_closed",
            tag, closing
        ),
    )
}

/// Legacy code warning for svelte-ignore using old hyphenated codes in runes mode
pub fn legacy_code(old_code: &str, new_code: &str) -> AnalysisWarning {
    warning(
        "legacy_code",
        format!(
            "`{}` is no longer valid — please use `{}` instead\nhttps://svelte.dev/e/legacy_code",
            old_code, new_code
        ),
    )
}

/// Unknown code in svelte-ignore comment
pub fn unknown_code(code: &str, suggestion: Option<&str>) -> AnalysisWarning {
    let message = if let Some(suggestion) = suggestion {
        format!(
            "`{}` is not a recognised code (did you mean `{}`?)\nhttps://svelte.dev/e/unknown_code",
            code, suggestion
        )
    } else {
        format!(
            "`{}` is not a recognised code\nhttps://svelte.dev/e/unknown_code",
            code
        )
    };
    warning("unknown_code", message)
}

/// Exported `let` variable is not used in the template
pub fn export_let_unused(name: &str) -> AnalysisWarning {
    warning(
        "export_let_unused",
        format!(
            "Component has unused export property '{}'. If it is for external reference only, please consider using `export const {}`\nhttps://svelte.dev/e/export_let_unused",
            name, name
        ),
    )
}

/// Using `on:name` to listen to the event is deprecated. Use the event attribute `onname` instead.
pub fn event_directive_deprecated(name: &str) -> AnalysisWarning {
    warning(
        "event_directive_deprecated",
        format!(
            "Using `on:{}` to listen to the {} event is deprecated. Use the event attribute `on{}` instead\nhttps://svelte.dev/e/event_directive_deprecated",
            name, name, name
        ),
    )
}
