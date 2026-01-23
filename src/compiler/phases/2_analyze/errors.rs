//! Compiler error definitions.
//!
//! This module provides error functions for semantic validation during the analyze phase.
//! Each function corresponds to a specific error code in the Svelte compiler.
//!
//! Corresponds to Svelte's `errors.js`.

use super::AnalysisError;

/// Create an error with a specific code and message.
fn error(code: &str, message: impl Into<String>) -> AnalysisError {
    AnalysisError::ValidationWithCode {
        code: code.to_string(),
        message: message.into(),
    }
}

// Rune-related errors

/// `$bindable()` can only be used inside a `$props()` declaration
pub fn bindable_invalid_location() -> AnalysisError {
    error(
        "bindable_invalid_location",
        "`$bindable()` can only be used inside a `$props()` declaration",
    )
}

/// `$host()` can only be used inside custom element component instances
pub fn host_invalid_placement() -> AnalysisError {
    error(
        "host_invalid_placement",
        "`$host()` can only be used inside custom element component instances",
    )
}

/// `$props()` can only be used as a variable declaration initializer at the top level of the `<script>` tag
pub fn props_invalid_placement() -> AnalysisError {
    error(
        "props_invalid_placement",
        "`$props()` can only be used as a variable declaration initializer at the top level of the `<script>` tag",
    )
}

/// `$props()` can only be used with an object destructuring pattern or an identifier
pub fn props_invalid_identifier() -> AnalysisError {
    error(
        "props_invalid_identifier",
        "`$props()` can only be used with an object destructuring pattern or an identifier",
    )
}

/// `%rune%` has already been declared
pub fn props_duplicate(rune: &str) -> AnalysisError {
    error(
        "props_duplicate",
        format!("`{}` has already been declared", rune),
    )
}

/// Declaring or accessing a prop starting with `$$` is illegal (they are reserved for Svelte internals)
pub fn props_illegal_name() -> AnalysisError {
    error(
        "props_illegal_name",
        "Declaring or accessing a prop starting with `$$` is illegal (they are reserved for Svelte internals)",
    )
}

/// `$props.id()` can only be used as a variable declaration initializer at the top level of the `<script>` tag
pub fn props_id_invalid_placement() -> AnalysisError {
    error(
        "props_id_invalid_placement",
        "`$props.id()` can only be used as a variable declaration initializer at the top level of the `<script>` tag",
    )
}

/// `%rune%` cannot be used with arguments
pub fn rune_invalid_arguments(rune: &str) -> AnalysisError {
    error(
        "rune_invalid_arguments",
        format!("`{}` cannot be used with arguments", rune),
    )
}

/// `%rune%` cannot be used with spread arguments
pub fn rune_invalid_spread(rune: &str) -> AnalysisError {
    error(
        "rune_invalid_spread",
        format!("`{}` cannot be used with spread arguments", rune),
    )
}

/// `%rune%` requires %expected%
pub fn rune_invalid_arguments_length(rune: &str, expected: &str) -> AnalysisError {
    error(
        "rune_invalid_arguments_length",
        format!("`{}` requires {}", rune, expected),
    )
}

/// `%rune%` can only be used inside `%location%`
pub fn state_invalid_placement(rune: &str) -> AnalysisError {
    error(
        "state_invalid_placement",
        format!(
            "`{}` can only be used at the top level of a component or inside a function",
            rune
        ),
    )
}

/// `$effect()` can only be used as an expression statement
pub fn effect_invalid_placement() -> AnalysisError {
    error(
        "effect_invalid_placement",
        "`$effect()` can only be used as an expression statement",
    )
}

/// `$inspect.trace()` can only be called as a statement within the body of a function
pub fn inspect_trace_invalid_placement() -> AnalysisError {
    error(
        "inspect_trace_invalid_placement",
        "`$inspect.trace()` can only be called as a statement within the body of a function",
    )
}

/// Generator functions cannot be used with $inspect.trace
pub fn inspect_trace_generator() -> AnalysisError {
    error(
        "inspect_trace_generator",
        "Generator functions cannot be used with $inspect.trace",
    )
}

// Binding-related errors

/// `%name%` can only be bound to %target%
pub fn bind_invalid_target(name: &str, target: &str) -> AnalysisError {
    error(
        "bind_invalid_target",
        format!("`{}` can only be bound to {}", name, target),
    )
}

/// `%name%` binding is invalid for this element. %message%
pub fn bind_invalid_name(name: &str, message: &str) -> AnalysisError {
    error(
        "bind_invalid_name",
        format!(
            "`{}` binding is invalid for this element. {}",
            name, message
        ),
    )
}

/// Cannot assign to %thing%
pub fn constant_assignment(thing: &str) -> AnalysisError {
    error("constant_assignment", format!("Cannot assign to {}", thing))
}

/// Cannot bind to %thing%
pub fn constant_binding(thing: &str) -> AnalysisError {
    error("constant_binding", format!("Cannot bind to {}", thing))
}

// Attribute-related errors

/// Attribute "%name%" is ambiguous — use "%values_string%" instead
pub fn attribute_ambiguous(name: &str, values_string: &str) -> AnalysisError {
    error(
        "attribute_ambiguous",
        format!(
            "Attribute \"{}\" is ambiguous — use \"{}\" instead",
            name, values_string
        ),
    )
}

/// Attributes need to be unique
pub fn attribute_duplicate() -> AnalysisError {
    error("attribute_duplicate", "Attributes need to be unique")
}

/// '%name%' attribute cannot be dynamic
pub fn attribute_invalid_type(name: &str) -> AnalysisError {
    error(
        "attribute_invalid_type",
        format!("'{}' attribute cannot be dynamic", name),
    )
}

/// The 'multiple' attribute must be static
pub fn attribute_invalid_multiple() -> AnalysisError {
    error(
        "attribute_invalid_multiple",
        "The 'multiple' attribute must be static",
    )
}

// Declaration-related errors

/// `%name%` has already been declared
pub fn declaration_duplicate(name: &str) -> AnalysisError {
    error(
        "declaration_duplicate",
        format!("`{}` has already been declared", name),
    )
}

// Class-related errors

/// `%name%` has already been declared
pub fn duplicate_class_field(name: &str) -> AnalysisError {
    error(
        "duplicate_class_field",
        format!("`{}` has already been declared", name),
    )
}

/// `%name%` has already been declared on this class
pub fn state_field_duplicate(name: &str) -> AnalysisError {
    error(
        "state_field_duplicate",
        format!("`{}` has already been declared on this class", name),
    )
}

/// Cannot declare a variable with the same name as an import inside `<script module>`
pub fn declaration_duplicate_module_import() -> AnalysisError {
    error(
        "declaration_duplicate_module_import",
        "Cannot declare a variable with the same name as an import inside `<script module>`",
    )
}

// Export-related errors

/// Cannot export derived state from a module
pub fn derived_invalid_export() -> AnalysisError {
    error(
        "derived_invalid_export",
        "Cannot export derived state from a module. To expose the current derived value, export a function returning its value",
    )
}

/// A component cannot have a default export
pub fn module_illegal_default_export() -> AnalysisError {
    error(
        "module_illegal_default_export",
        "A component cannot have a default export",
    )
}

// Element-related errors

/// `<svelte:element>` must have a 'this' attribute with a value
pub fn svelte_element_missing_this() -> AnalysisError {
    error(
        "svelte_element_missing_this",
        "`<svelte:element>` must have a 'this' attribute with a value",
    )
}

/// `<svelte:element>` can only have one `this` attribute
pub fn svelte_element_duplicate_this() -> AnalysisError {
    error(
        "svelte_element_duplicate_this",
        "`<svelte:element>` can only have one `this` attribute",
    )
}

/// A component can only have one `<%name%>` element
pub fn svelte_meta_duplicate(name: &str) -> AnalysisError {
    error(
        "svelte_meta_duplicate",
        format!("A component can only have one `<{}>` element", name),
    )
}

/// `<%name%>` tags cannot be inside elements or blocks
pub fn svelte_meta_invalid_placement(name: &str) -> AnalysisError {
    error(
        "svelte_meta_invalid_placement",
        format!("`<{}>` tags cannot be inside elements or blocks", name),
    )
}

// Slot-related errors

/// Duplicate slot name "%name%" in <%component%>
pub fn slot_duplicate(name: &str, component: &str) -> AnalysisError {
    error(
        "slot_duplicate",
        format!("Duplicate slot name \"{}\" in <{}>", name, component),
    )
}

// Render tag errors

/// `{@render ...}` tags can only contain call expressions
pub fn render_tag_invalid_expression() -> AnalysisError {
    error(
        "render_tag_invalid_expression",
        "`{@render ...}` tags can only contain call expressions",
    )
}

/// Cannot use spread arguments in `{@render ...}` tags
pub fn render_tag_invalid_spread_argument() -> AnalysisError {
    error(
        "render_tag_invalid_spread_argument",
        "cannot use spread arguments in `{@render ...}` tags",
    )
}

/// Calling a snippet function using apply, bind or call is not allowed
pub fn render_tag_invalid_call_expression() -> AnalysisError {
    error(
        "render_tag_invalid_call_expression",
        "Calling a snippet function using apply, bind or call is not allowed",
    )
}

// General errors

/// `%feature%` is not yet implemented
pub fn not_implemented(feature: &str) -> AnalysisError {
    error(
        "not_implemented",
        format!("`{}` is not yet implemented", feature),
    )
}

// Assignment-related errors

/// Cannot reassign or bind to each block item
pub fn each_item_invalid_assignment() -> AnalysisError {
    error(
        "each_item_invalid_assignment",
        "Cannot reassign or bind to each block item",
    )
}

/// Cannot reassign or bind to snippet parameter
pub fn snippet_parameter_assignment() -> AnalysisError {
    error(
        "snippet_parameter_assignment",
        "Cannot reassign or bind to snippet parameter",
    )
}

/// Cannot use `$` as a variable name
pub fn dollar_binding_invalid() -> AnalysisError {
    error(
        "dollar_binding_invalid",
        "Cannot use `$` as a variable name",
    )
}

/// Variable name cannot start with `$`
pub fn dollar_prefix_invalid() -> AnalysisError {
    error(
        "dollar_prefix_invalid",
        "Variable name cannot start with `$` except for special Svelte stores",
    )
}

/// Cannot export reassigned state
pub fn state_invalid_export() -> AnalysisError {
    error(
        "state_invalid_export",
        "Cannot export reassigned state. To expose the current state value, export a function returning its value",
    )
}

// Block-related errors

/// {@const} tag can only be used in certain contexts
pub fn const_tag_invalid_placement() -> AnalysisError {
    error(
        "const_tag_invalid_placement",
        "{@const} tag can only be used as a direct child of {#if}, {#each}, {#await}, {#key}, {#snippet}, or a component/element with a slot attribute",
    )
}

/// Block must start with expected character
pub fn block_unexpected_character(expected: &str) -> AnalysisError {
    error(
        "block_unexpected_character",
        format!(
            "Block must start with '{{{{{}' (no whitespace after '{{{{')",
            expected
        ),
    )
}

/// `{#each}` block with a key requires an `as` binding
pub fn each_key_without_as() -> AnalysisError {
    error(
        "each_key_without_as",
        "`{#each}` block with a key requires an `as` binding",
    )
}

/// Cannot assign to %thing% before initialization
pub fn state_field_invalid_assignment() -> AnalysisError {
    error(
        "state_field_invalid_assignment",
        "Cannot assign to state field before initialization in constructor",
    )
}

/// %name% cannot have children
pub fn svelte_meta_invalid_content(name: &str) -> AnalysisError {
    error(
        "svelte_meta_invalid_content",
        format!("`<{}>` cannot have children", name),
    )
}

/// `use:`, `transition:` and `animate:` directives, attachments and bindings do not support await expressions
pub fn illegal_await_expression() -> AnalysisError {
    error(
        "illegal_await_expression",
        "`use:`, `transition:` and `animate:` directives, attachments and bindings do not support await expressions",
    )
}

/// `arguments` cannot be used outside of functions
pub fn invalid_arguments_usage() -> AnalysisError {
    error(
        "invalid_arguments_usage",
        "`arguments` cannot be used outside of functions",
    )
}

/// Runes cannot use computed properties
pub fn rune_invalid_computed_property() -> AnalysisError {
    error(
        "rune_invalid_computed_property",
        "Runes cannot use computed member expressions",
    )
}

/// Rune %old_name% has been renamed to %new_name%
pub fn rune_renamed(old_name: &str, new_name: &str) -> AnalysisError {
    error(
        "rune_renamed",
        format!("`{}` has been renamed to `{}`", old_name, new_name),
    )
}

/// Rune %name% has been removed
pub fn rune_removed(name: &str) -> AnalysisError {
    error("rune_removed", format!("`{}` has been removed", name))
}

/// Invalid rune name %name%
pub fn rune_invalid_name(name: &str) -> AnalysisError {
    error(
        "rune_invalid_name",
        format!("`{}` is not a valid rune", name),
    )
}

/// Runes must be called
pub fn rune_missing_parentheses() -> AnalysisError {
    error(
        "rune_missing_parentheses",
        "Runes must be called as functions",
    )
}

/// {@const} tag cannot reference %name% in this context
pub fn const_tag_invalid_reference(name: &str) -> AnalysisError {
    error(
        "const_tag_invalid_reference",
        format!(
            "{{@const}} tag cannot reference `{}` in this context - it can only be used with declarations from an implicit children snippet",
            name
        ),
    )
}

// Slot element errors

/// `<slot>` can only receive attributes and (optionally) let directives
pub fn slot_element_invalid_attribute() -> AnalysisError {
    error(
        "slot_element_invalid_attribute",
        "`<slot>` can only receive attributes and (optionally) let directives",
    )
}

/// slot attribute must be a static value
pub fn slot_element_invalid_name() -> AnalysisError {
    error(
        "slot_element_invalid_name",
        "slot attribute must be a static value",
    )
}

/// `default` is a reserved word — it cannot be used as a slot name
pub fn slot_element_invalid_name_default() -> AnalysisError {
    error(
        "slot_element_invalid_name_default",
        "`default` is a reserved word — it cannot be used as a slot name",
    )
}

// Transition/animation directive errors

/// An element can only have one '%name%' directive
pub fn transition_duplicate(directive_name: &str) -> AnalysisError {
    error(
        "transition_duplicate",
        format!(
            "An element can only have one '{}' directive",
            directive_name
        ),
    )
}

/// An element cannot have both '%a%' and '%b%' directives
pub fn transition_conflict(a: &str, b: &str) -> AnalysisError {
    error(
        "transition_conflict",
        format!("An element cannot have both '{}' and '{}' directives", a, b),
    )
}

/// An element can only have one animate directive
pub fn animation_duplicate() -> AnalysisError {
    error(
        "animation_duplicate",
        "An element can only have one animate directive",
    )
}

// CSS-related errors

/// `:global(...)` must contain exactly one selector
pub fn css_global_invalid_selector() -> AnalysisError {
    error(
        "css_global_invalid_selector",
        "`:global(...)` must contain exactly one selector",
    )
}

/// `:global(...)` must not contain type or universal selectors when used in a compound selector
pub fn css_global_invalid_selector_list() -> AnalysisError {
    error(
        "css_global_invalid_selector_list",
        "`:global(...)` must not contain type or universal selectors when used in a compound selector",
    )
}

/// `:global(...)` can be at the start or end of a selector sequence, but not in the middle
pub fn css_global_invalid_placement() -> AnalysisError {
    error(
        "css_global_invalid_placement",
        "`:global(...)` can be at the start or end of a selector sequence, but not in the middle",
    )
}

/// Invalid selector
pub fn css_selector_invalid() -> AnalysisError {
    error("css_selector_invalid", "Invalid selector")
}

/// `:global` is invalid inside a pseudo-class like :has
pub fn css_global_block_invalid_placement() -> AnalysisError {
    error(
        "css_global_block_invalid_placement",
        "`:global` is invalid inside a pseudo-class like :has",
    )
}

/// Type selector cannot appear after `:global(...)`
pub fn css_type_selector_invalid_placement() -> AnalysisError {
    error(
        "css_type_selector_invalid_placement",
        "Type selector cannot appear after `:global(...)`",
    )
}

// Attribute-related errors

/// '%name%' is not a valid attribute name
pub fn attribute_invalid_name(name: &str) -> AnalysisError {
    error(
        "attribute_invalid_name",
        format!("'{}' is not a valid attribute name", name),
    )
}

/// 'contenteditable' attribute cannot be dynamic if element uses two-way binding
pub fn attribute_contenteditable_dynamic() -> AnalysisError {
    error(
        "attribute_contenteditable_dynamic",
        "'contenteditable' attribute cannot be dynamic if element uses two-way binding",
    )
}

/// 'contenteditable' attribute is required for textContent, innerHTML and innerText two-way bindings
pub fn attribute_contenteditable_missing() -> AnalysisError {
    error(
        "attribute_contenteditable_missing",
        "'contenteditable' attribute is required for textContent, innerHTML and innerText two-way bindings",
    )
}

/// Cannot use `%rune%` rune in non-runes mode
pub fn rune_invalid_usage(rune: &str) -> AnalysisError {
    error(
        "rune_invalid_usage",
        format!(
            "Cannot use `{}` rune in non-runes mode\nhttps://svelte.dev/e/rune_invalid_usage",
            rune
        ),
    )
}

/// Props destructuring pattern cannot use computed properties
pub fn props_invalid_pattern() -> AnalysisError {
    error(
        "props_invalid_pattern",
        "Props destructuring pattern cannot use computed properties or non-identifier keys",
    )
}

// Component-related errors

/// This type of directive is not valid on components
pub fn component_invalid_directive() -> AnalysisError {
    error(
        "component_invalid_directive",
        "This type of directive is not valid on components",
    )
}

// Svelte element errors

/// `<svelte:head>` cannot have attributes nor directives
pub fn svelte_head_illegal_attribute() -> AnalysisError {
    error(
        "svelte_head_illegal_attribute",
        "`<svelte:head>` cannot have attributes nor directives",
    )
}

// Title element errors

/// `<title>` cannot have attributes nor directives
pub fn title_illegal_attribute() -> AnalysisError {
    error(
        "title_illegal_attribute",
        "`<title>` cannot have attributes nor directives",
    )
}

// Reactive declaration errors

/// Cyclical dependency detected: %cycle%
pub fn reactive_declaration_cycle(cycle: &str) -> AnalysisError {
    error(
        "reactive_declaration_cycle",
        format!("Cyclical dependency detected: {}", cycle),
    )
}

/// {@%name% ...} tag cannot be %location%
pub fn tag_invalid_placement(name: &str, location: &str) -> AnalysisError {
    error(
        "tag_invalid_placement",
        format!("{{@{} ...}} tag cannot be {}", name, location),
    )
}
