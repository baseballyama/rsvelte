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

/// `$props()` can only be used with an object destructuring pattern
pub fn props_invalid_placement() -> AnalysisError {
    error(
        "props_invalid_placement",
        "`$props()` can only be used with an object destructuring pattern",
    )
}

/// `%rune%` has already been declared
pub fn props_duplicate(rune: &str) -> AnalysisError {
    error(
        "props_duplicate",
        format!("`{}` has already been declared", rune),
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

/// `<svelte:element>` must have a `this` attribute
pub fn svelte_element_missing_this() -> AnalysisError {
    error(
        "svelte_element_missing_this",
        "`<svelte:element>` must have a `this` attribute",
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

/// Cannot assign to %thing% before initialization
pub fn state_field_invalid_assignment() -> AnalysisError {
    error(
        "state_field_invalid_assignment",
        "Cannot assign to state field before initialization in constructor",
    )
}

// Block-related errors

/// %block% must start with {%expected%
pub fn block_unexpected_character(expected: &str) -> AnalysisError {
    error(
        "block_unexpected_character",
        format!("Block must start with {{{}", expected),
    )
}

// Identifier-related errors

/// `$` is an invalid variable name
pub fn dollar_binding_invalid() -> AnalysisError {
    error("dollar_binding_invalid", "`$` is an invalid variable name")
}

/// Variable name cannot start with `$` (this is reserved for Svelte internals)
pub fn dollar_prefix_invalid() -> AnalysisError {
    error(
        "dollar_prefix_invalid",
        "Variable name cannot start with `$` (this is reserved for Svelte internals)",
    )
}

/// Cannot export reassigned state
pub fn state_invalid_export() -> AnalysisError {
    error(
        "state_invalid_export",
        "Cannot export reassigned state from a module. To expose the current state value, export a function returning its value",
    )
}

/// %name% cannot have children
pub fn svelte_meta_invalid_content(name: &str) -> AnalysisError {
    error(
        "svelte_meta_invalid_content",
        format!("`<{}>` cannot have children", name),
    )
}
