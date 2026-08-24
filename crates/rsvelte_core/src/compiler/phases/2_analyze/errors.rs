//! Compiler error definitions.
//!
//! This module provides error functions for semantic validation during the analyze phase.
//! Each function corresponds to a specific error code in the Svelte compiler.
//!
//! Corresponds to Svelte's `errors.js`.

use super::AnalysisError;
use super::diagnostic::diagnostics;

/// Create an error with a specific code and message.
fn error(code: &str, message: impl Into<String>) -> AnalysisError {
    let mut message = message.into();
    if !message.contains("\nhttps://svelte.dev/e/") {
        message.push_str("\nhttps://svelte.dev/e/");
        message.push_str(code);
    }
    AnalysisError::ValidationWithCode {
        code: code.to_string(),
        message,
        start: None,
        end: None,
    }
}

// Every constructor in this file goes through `error()`, so `ValidationWithCode` is the
// only variant a snapshot test ever sees here.
#[cfg(test)]
impl super::diagnostic::DiagnosticDump for AnalysisError {
    fn dump_code(&self) -> &str {
        match self {
            AnalysisError::ValidationWithCode { code, .. } => code,
            _ => unreachable!("errors.rs constructors only ever produce ValidationWithCode"),
        }
    }

    fn dump_message(&self) -> &str {
        match self {
            AnalysisError::ValidationWithCode { message, .. } => message,
            _ => unreachable!("errors.rs constructors only ever produce ValidationWithCode"),
        }
    }
}

// Rune-related errors

diagnostics! {
    error => AnalysisError;

    /// `$bindable()` can only be used inside a `$props()` declaration
    bindable_invalid_location() => "`$bindable()` can only be used inside a `$props()` declaration";

    /// `$host()` can only be used inside custom element component instances
    host_invalid_placement() => "`$host()` can only be used inside custom element component instances";

    /// `$props()` can only be used at the component top level as a variable declaration initializer.
    props_invalid_placement() => "`$props()` can only be used at the top level of components as a variable declaration initializer";

    /// `$props()` can only be used with an object destructuring pattern
    props_invalid_identifier() => "`$props()` can only be used with an object destructuring pattern";

    /// `%rune%` has already been declared
    props_duplicate(rune: &str) => "Cannot use `{}()` more than once", rune;

    /// Declaring or accessing a prop starting with `$$` is illegal (they are reserved for Svelte internals)
    props_illegal_name() => "Declaring or accessing a prop starting with `$$` is illegal (they are reserved for Svelte internals)";

    /// `$props.id()` can only be used at the top level of components as a variable declaration initializer
    props_id_invalid_placement() => "`$props.id()` can only be used at the top level of components as a variable declaration initializer";

    /// `%rune%` cannot be used with arguments
    rune_invalid_arguments(rune: &str) => "`{}` cannot be called with arguments", rune;

    /// `%rune%` cannot be called with a spread argument
    rune_invalid_spread(rune: &str) => "`{}` cannot be called with a spread argument", rune;

    /// `%rune%` requires %expected%
    rune_invalid_arguments_length(rune: &str, expected: &str) => "`{}` must be called with {}", rune, expected;

    /// `%rune%` can only be used as a variable declaration initializer, a class field declaration, or the first assignment to a class field at the top level of the constructor.
    state_invalid_placement(rune: &str) => "`{}(...)` can only be used as a variable declaration initializer, a class field declaration, or the first assignment to a class field at the top level of the constructor.\nhttps://svelte.dev/e/state_invalid_placement", rune;

    /// `$effect()` can only be used as an expression statement
    effect_invalid_placement() => "`$effect()` can only be used as an expression statement";

    /// `$inspect.trace()` can only be called as a statement within the body of a function
    inspect_trace_invalid_placement() => "`$inspect.trace()` can only be called as a statement within the body of a function";

    /// Generator functions cannot be used with $inspect.trace
    inspect_trace_generator() => "Generator functions cannot be used with $inspect.trace";

    // Binding-related errors

    /// `bind:%name%` can only be used with %elements%
    bind_invalid_target(name: &str, elements: &str) => "`bind:{}` can only be used with {}", name, elements;

    /// Can only bind to an Identifier or MemberExpression or a `{get, set}` pair
    bind_invalid_expression() => "Can only bind to an Identifier or MemberExpression or a `{get, set}` pair\nhttps://svelte.dev/e/bind_invalid_expression";

    /// `bind:group` can only bind to an Identifier or MemberExpression
    bind_group_invalid_expression() => "`bind:group` can only bind to an Identifier or MemberExpression";

    /// Cannot `bind:group` to a snippet parameter
    bind_group_invalid_snippet_parameter() => "Cannot `bind:group` to a snippet parameter";

    /// Cannot assign to %thing%
    constant_assignment(thing: &str) => "Cannot assign to {}", thing;

    /// Cannot bind to %thing%
    constant_binding(thing: &str) => "Cannot bind to {}", thing;

    // Attribute-related errors

    /// Attributes need to be unique
    attribute_duplicate() => "Attributes need to be unique";

    /// 'type' attribute must be a static text value if input uses two-way binding
    attribute_invalid_type() => "'type' attribute must be a static text value if input uses two-way binding";

    /// The 'multiple' attribute must be static if select uses two-way binding
    attribute_invalid_multiple() => "'multiple' attribute must be static if select uses two-way binding\nhttps://svelte.dev/e/attribute_invalid_multiple";

    // Declaration-related errors

    /// `%name%` has already been declared
    declaration_duplicate(name: &str) => "`{}` has already been declared", name;

    /// acorn's own wording and code for a redeclaration. Raised from the
    /// analyze phase only where TypeScript hides it from the parser: OXC's TS
    /// mode exempts every function-vs-function redeclaration, so `1_parse` has
    /// no diagnostic to map onto acorn's.
    js_parse_error(name: &str) => "Identifier '{}' has already been declared", name;

    // Class-related errors

    /// `%name%` has already been declared
    duplicate_class_field(name: &str) => "`{}` has already been declared", name;

    /// `%name%` has already been declared on this class
    state_field_duplicate(name: &str) => "`{}` has already been declared on this class", name;

    /// Cannot declare a variable with the same name as an import from `<script module>`
    declaration_duplicate_module_import() => "Cannot declare a variable with the same name as an import from `<script module>`";

    // Export-related errors

    /// Cannot export derived state from a module
    derived_invalid_export() => "Cannot export derived state from a module. To expose the current derived value, export a function returning its value\nhttps://svelte.dev/e/derived_invalid_export";

    /// A component cannot have a default export
    module_illegal_default_export() => "A component cannot have a default export\nhttps://svelte.dev/e/module_illegal_default_export";

    // Element-related errors

    /// `<svelte:element>` must have a 'this' attribute with a value
    svelte_element_missing_this() => "`<svelte:element>` must have a 'this' attribute with a value";

    /// `<svelte:component>` must have a `this` attribute (issue #453, H-046)
    svelte_component_missing_this() => "`<svelte:component>` must have a 'this' attribute";

    /// A component can only have one `<%name%>` element
    svelte_meta_duplicate(name: &str) => "A component can only have one `<{}>` element", name;

    /// `<%name%>` tags cannot be inside elements or blocks
    svelte_meta_invalid_placement(name: &str) => "`<{}>` tags cannot be inside elements or blocks", name;

    /// `<svelte:self>` components can only appear in supported nested contexts
    svelte_self_invalid_placement() => "`<svelte:self>` components can only exist inside `{#if}` blocks, `{#each}` blocks, `{#snippet}` blocks or slots passed to components\nhttps://svelte.dev/e/svelte_self_invalid_placement";

    // Render tag errors

    /// `{@render ...}` tags can only contain call expressions
    render_tag_invalid_expression() => "`{@render ...}` tags can only contain call expressions";

    /// Cannot use spread arguments in `{@render ...}` tags
    render_tag_invalid_spread_argument() => "cannot use spread arguments in `{@render ...}` tags";

    /// Calling a snippet function using apply, bind or call is not allowed
    render_tag_invalid_call_expression() => "Calling a snippet function using apply, bind or call is not allowed";

    // Assignment-related errors

    /// Cannot reassign or bind to each block item
    each_item_invalid_assignment() => "Cannot reassign or bind to each block argument in runes mode. Use the array and index variables instead (e.g. `array[i] = value` instead of `entry = value`, or `bind:value={array[i]}` instead of `bind:value={entry}`)";

    /// Cannot reassign or bind to snippet parameter
    snippet_parameter_assignment() => "Cannot reassign or bind to snippet parameter";

    /// The `$` name is reserved for Svelte's internal namespace.
    dollar_binding_invalid() => "The $ name is reserved, and cannot be used for variables and imports";

    /// Variable name cannot start with `$`
    dollar_prefix_invalid() => "The $ prefix is reserved, and cannot be used for variables and imports";

    /// Cannot export state from a module if it is reassigned
    state_invalid_export() => "Cannot export state from a module if it is reassigned. Either export a function returning the state value or only mutate the state value's properties\nhttps://svelte.dev/e/state_invalid_export";

    // Block-related errors

    /// {@const} tag can only be used in certain contexts
    const_tag_invalid_placement() => "`{@const}` must be the immediate child of `{#snippet}`, `{#if}`, `{:else if}`, `{:else}`, `{#each}`, `{:then}`, `{:catch}`, `<svelte:fragment>`, `<svelte:boundary>` or `<Component>`\nhttps://svelte.dev/e/const_tag_invalid_placement";

    /// Declaration tags (`{let …}` / `{const …}`) are not allowed in legacy mode.
    /// Svelte 5.56.0 (#18282).
    declaration_tag_no_legacy_mode() => "Declaration tags cannot be used in legacy mode\nhttps://svelte.dev/e/declaration_tag_no_legacy_mode";

    /// A declaration tag must contain a plain `let` or `const` VariableDeclaration.
    /// Svelte 5.56.0 (#18282).
    declaration_tag_invalid_type() => "Declaration tags can only contain `let` or `const` variable declarations\nhttps://svelte.dev/e/declaration_tag_invalid_type";

    /// Block must start with expected character
    block_unexpected_character(expected: &str) => "Expected a `{}` character immediately following the opening bracket\nhttps://svelte.dev/e/block_unexpected_character", expected;

    /// `{#each}` block with a key requires an `as` binding
    each_key_without_as() => "An `{#each ...}` block without an `as` clause cannot have a key";

    /// Cannot assign to a state field before its declaration
    state_field_invalid_assignment() => "Cannot assign to a state field before its declaration";

    /// %name% cannot have children
    svelte_meta_invalid_content(name: &str) => "<{}> cannot have children", name;

    /// `use:`, `transition:` and `animate:` directives, attachments and bindings do not support await expressions
    illegal_await_expression() => "`use:`, `transition:` and `animate:` directives, attachments and bindings do not support await expressions";

    /// `arguments` cannot be used outside of functions
    invalid_arguments_usage() => "The arguments keyword cannot be used within the template or at the top level of a component";

    /// Runes cannot use computed properties
    rune_invalid_computed_property() => "Runes cannot use computed member expressions";

    /// Rune %old_name% has been renamed to %new_name%
    rune_renamed(old_name: &str, new_name: &str) => "`{}` is now `{}`", old_name, new_name;

    /// Rune %name% has been removed
    rune_removed(name: &str) => "`{}` has been removed", name;

    /// Invalid rune name %name%
    rune_invalid_name(name: &str) => "`{}` is not a valid rune", name;

    /// Runes must be called
    rune_missing_parentheses() => "Cannot use rune without parentheses";

    /// {@const} tag cannot reference %name% in this context
    const_tag_invalid_reference(name: &str) => "{{@const}} tag cannot reference `{}` in this context - it can only be used with declarations from an implicit children snippet", name;

    // Slot element errors

    /// `<slot>` can only receive attributes and (optionally) let directives
    slot_element_invalid_attribute() => "`<slot>` can only receive attributes and (optionally) let directives";

    /// slot attribute must be a static value
    slot_element_invalid_name() => "slot attribute must be a static value";

    /// `default` is a reserved word — it cannot be used as a slot name
    slot_element_invalid_name_default() => "`default` is a reserved word — it cannot be used as a slot name";

    // Event handler errors

    /// Event modifiers other than 'once' can only be used on DOM elements
    event_handler_invalid_component_modifier() => "Event modifiers other than 'once' can only be used on DOM elements\nhttps://svelte.dev/e/event_handler_invalid_component_modifier";

    // Transition/animation directive errors

    /// Cannot use multiple `%type%:` directives on a single element
    transition_duplicate(directive_name: &str) => "Cannot use multiple `{}:` directives on a single element", directive_name;

    /// Cannot use `%type%:` alongside existing `%existing%:` directive
    transition_conflict(a: &str, b: &str) => "Cannot use `{}:` alongside existing `{}:` directive", a, b;

    /// An element can only have one animate directive
    animation_duplicate() => "An element can only have one 'animate' directive\nhttps://svelte.dev/e/animation_duplicate";

    /// An element that uses the `animate:` directive must be the only child of a keyed `{#each ...}` block
    animation_invalid_placement() => "An element that uses the `animate:` directive must be the only child of a keyed `{#each ...}` block\nhttps://svelte.dev/e/animation_invalid_placement";

    /// An element that uses the `animate:` directive must be the only child of a keyed `{#each ...}` block. Did you forget to add a key to your each block?
    animation_missing_key() => "An element that uses the `animate:` directive must be the only child of a keyed `{#each ...}` block. Did you forget to add a key to your each block?\nhttps://svelte.dev/e/animation_missing_key";

    // CSS-related errors

    /// `:global(...)` must contain exactly one selector
    css_global_invalid_selector() => "`:global(...)` must contain exactly one selector";

    /// `:global(...)` must not contain type or universal selectors when used in a compound selector
    css_global_invalid_selector_list() => "`:global(...)` must not contain type or universal selectors when used in a compound selector";

    /// `:global(...)` can be at the start or end of a selector sequence, but not in the middle
    css_global_invalid_placement() => "`:global(...)` can be at the start or end of a selector sequence, but not in the middle";

    /// Invalid selector
    css_selector_invalid() => "Invalid selector";

    /// A `:global` selector cannot be inside a pseudoclass
    css_global_block_invalid_placement() => "A `:global` selector cannot be inside a pseudoclass";

    /// A `:global` selector cannot follow a `%name%` combinator
    css_global_block_invalid_combinator(combinator_name: &str) => "A `:global` selector cannot follow a `{}` combinator", combinator_name;

    /// A top-level `:global {{...}}` block can only contain rules, not declarations
    css_global_block_invalid_declaration() => "A top-level `:global {...}` block can only contain rules, not declarations";

    /// A `:global` selector cannot be part of a selector list with entries that don't contain `:global`
    css_global_block_invalid_list() => "A `:global` selector cannot be part of a selector list with entries that don't contain `:global`";

    /// A `:global` selector cannot modify an existing selector
    css_global_block_invalid_modifier() => "A `:global` selector cannot modify an existing selector";

    /// A `:global` selector can only be modified if it is a descendant of other selectors
    css_global_block_invalid_modifier_start() => "A `:global` selector can only be modified if it is a descendant of other selectors";

    /// Nesting selectors can only be used inside a rule or as the first selector inside a lone `:global(...)`
    css_nesting_selector_invalid_placement() => "Nesting selectors can only be used inside a rule or as the first selector inside a lone `:global(...)`";

    /// `:global(...)` must not be followed by a type selector
    css_type_selector_invalid_placement() => "`:global(...)` must not be followed by a type selector";

    /// Declaration cannot be empty
    css_empty_declaration() => "Declaration cannot be empty";

    // Attribute-related errors

    /// '%name%' is not a valid attribute name
    attribute_invalid_name(name: &str) => "'{}' is not a valid attribute name", name;

    /// 'contenteditable' attribute cannot be dynamic if element uses two-way binding
    attribute_contenteditable_dynamic() => "'contenteditable' attribute cannot be dynamic if element uses two-way binding";

    /// 'contenteditable' attribute is required for textContent, innerHTML and innerText two-way bindings
    attribute_contenteditable_missing() => "'contenteditable' attribute is required for textContent, innerHTML and innerText two-way bindings";

    /// Cannot use `%rune%` rune in non-runes mode
    rune_invalid_usage(rune: &str) => "Cannot use `{}` rune in non-runes mode\nhttps://svelte.dev/e/rune_invalid_usage", rune;

    /// `$props()` assignment must not contain nested properties or computed keys
    props_invalid_pattern() => "`$props()` assignment must not contain nested properties or computed keys";

    // Component-related errors

    /// This type of directive is not valid on components
    component_invalid_directive() => "This type of directive is not valid on components";

    // Svelte element errors

    /// `<svelte:head>` cannot have attributes nor directives
    svelte_head_illegal_attribute() => "`<svelte:head>` cannot have attributes nor directives";

    // Title element errors

    /// `<title>` cannot have attributes nor directives
    title_illegal_attribute() => "`<title>` cannot have attributes nor directives";

    // Reactive declaration errors

    /// Cyclical dependency detected: %cycle%
    reactive_declaration_cycle(cycle: &str) => "Cyclical dependency detected: {}", cycle;

    /// {@%name% ...} tag cannot be %location%
    tag_invalid_placement(name: &str, location: &str) => "{{@{} ...}} tag cannot be {}\nhttps://svelte.dev/e/tag_invalid_placement", name, location;

    /// %message%. The browser will 'repair' the HTML (by moving, removing, or inserting elements) which breaks Svelte's assumptions about the structure of your components.
    node_invalid_placement(message: &str) => "{}. The browser will 'repair' the HTML (by moving, removing, or inserting elements) which breaks Svelte's assumptions about the structure of your components.\nhttps://svelte.dev/e/node_invalid_placement", message;

    /// A `<textarea>` can have either a value attribute or (equivalently) child content, but not both
    textarea_invalid_content() => "A `<textarea>` can have either a value attribute or (equivalently) child content, but not both\nhttps://svelte.dev/e/textarea_invalid_content";

    /// Cannot reference store value outside a `.svelte` file
    store_invalid_subscription_module() => "Cannot reference store value outside a `.svelte` file\nhttps://svelte.dev/e/store_invalid_subscription_module";

    /// Mixing old (on:event) and new syntaxes for event handling is not allowed
    mixed_event_handler_syntaxes(name: &str) => "Mixing old (on:{}) and new syntaxes for event handling is not allowed. Use only the on{} syntax\nhttps://svelte.dev/e/mixed_event_handler_syntaxes", name, name;

    /// Imports of `svelte/internal/*` are forbidden
    import_svelte_internal_forbidden() => "Imports of `svelte/internal/*` are forbidden. It contains private runtime code which is subject to change without notice. If you're importing from `svelte/internal/*` to work around a limitation of Svelte, please open an issue at https://github.com/sveltejs/svelte and explain your use case\nhttps://svelte.dev/e/import_svelte_internal_forbidden";

    /// %name% cannot be used in runes mode
    runes_mode_invalid_import(name: &str) => "{} cannot be used in runes mode\nhttps://svelte.dev/e/runes_mode_invalid_import", name;

    /// Cannot use `export let` in runes mode — use `$props()` instead
    legacy_export_invalid() => "Cannot use `export let` in runes mode — use `$props()` instead\nhttps://svelte.dev/e/legacy_export_invalid";

    /// Cannot use `$$props` in runes mode
    legacy_props_invalid() => "Cannot use `$$props` in runes mode\nhttps://svelte.dev/e/legacy_props_invalid";

    /// Cannot use `$$restProps` in runes mode
    legacy_rest_props_invalid() => "Cannot use `$$restProps` in runes mode\nhttps://svelte.dev/e/legacy_rest_props_invalid";

    /// `$:` is not allowed in runes mode, use `$derived` or `$effect` instead
    legacy_reactive_statement_invalid() => "`$:` is not allowed in runes mode, use `$derived` or `$effect` instead\nhttps://svelte.dev/e/legacy_reactive_statement_invalid";

    /// Cannot subscribe to stores that are not declared at the top level of the component
    store_invalid_scoped_subscription() => "Cannot subscribe to stores that are not declared at the top level of the component\nhttps://svelte.dev/e/store_invalid_scoped_subscription";

    /// Cannot reference store value inside `<script module>`
    store_invalid_subscription() => "Cannot reference store value inside `<script module>`\nhttps://svelte.dev/e/store_invalid_subscription";

    /// `%name%` is not defined
    export_undefined(name: &str) => "`{}` is not defined\nhttps://svelte.dev/e/export_undefined", name;

    /// Duplicate slot name '%name%' in <%component%>
    slot_attribute_duplicate(name: &str, component: &str) => "Duplicate slot name '{}' in <{}>\nhttps://svelte.dev/e/slot_attribute_duplicate", name, component;

    /// Found default slot content alongside an explicit slot="default"
    slot_default_duplicate() => "Found default slot content alongside an explicit slot=\"default\"\nhttps://svelte.dev/e/slot_default_duplicate";

    /// This snippet is shadowing the prop `%prop%` with the same name
    snippet_shadowing_prop(prop: &str) => "This snippet is shadowing the prop `{}` with the same name\nhttps://svelte.dev/e/snippet_shadowing_prop", prop;

    /// Element with a slot='...' attribute must be a child of a component or a descendant of a custom element
    slot_attribute_invalid_placement() => "Element with a slot='...' attribute must be a child of a component or a descendant of a custom element\nhttps://svelte.dev/e/slot_attribute_invalid_placement";

    /// slot attribute must be a static value
    slot_attribute_invalid() => "slot attribute must be a static value\nhttps://svelte.dev/e/slot_attribute_invalid";

    /// `<svelte:fragment>` must be the direct child of a component
    svelte_fragment_invalid_placement() => "`<svelte:fragment>` must be the direct child of a component\nhttps://svelte.dev/e/svelte_fragment_invalid_placement";

    /// `<svelte:fragment>` only accepts slot and let directives
    svelte_fragment_invalid_attribute() => "`<svelte:fragment>` can only have a slot attribute and (optionally) a let: directive\nhttps://svelte.dev/e/svelte_fragment_invalid_attribute";

    /// `<svelte:boundary>` received an unsupported attribute or directive
    svelte_boundary_invalid_attribute() => "Valid attributes on `<svelte:boundary>` are `onerror` and `failed`\nhttps://svelte.dev/e/svelte_boundary_invalid_attribute";

    /// `<svelte:boundary>` attributes require an expression value
    svelte_boundary_invalid_attribute_value() => "Attribute value must be a non-string expression\nhttps://svelte.dev/e/svelte_boundary_invalid_attribute_value";

    /// Cyclical dependency detected: %cycle%
    const_tag_cycle(cycle: &str) => "Cyclical dependency detected: {}\nhttps://svelte.dev/e/const_tag_cycle", cycle;

    /// Attribute shorthand cannot be empty
    attribute_empty_shorthand() => "Attribute shorthand cannot be empty\nhttps://svelte.dev/e/attribute_empty_shorthand";

    /// `%type%` name cannot be empty
    directive_missing_name(directive_type: &str) => "`{}` name cannot be empty\nhttps://svelte.dev/e/directive_missing_name", directive_type;

    /// Sequence expressions are not allowed as attribute/directive values in runes mode, unless wrapped in parentheses
    attribute_invalid_sequence_expression() => "Comma-separated expressions are not allowed as attribute/directive values in runes mode, unless wrapped in parentheses\nhttps://svelte.dev/e/attribute_invalid_sequence_expression";

    /// `%name%` is an illegal variable name. To reference a global variable called `%name%`, use `globalThis.%name%`
    global_reference_invalid(name: &str) => "`{}` is an illegal variable name. To reference a global variable called `{}`, use `globalThis.{}`\nhttps://svelte.dev/e/global_reference_invalid", name, name, name;

    /// Valid `<svelte:...>` tag names are %list%
    svelte_meta_invalid_tag(list: &str) => "Valid `<svelte:...>` tag names are {}\nhttps://svelte.dev/e/svelte_meta_invalid_tag", list;

    /// Expected a valid element or component name. Components must have a valid variable name or dot notation expression
    tag_invalid_name() => "Expected a valid element or component name. Components must have a valid variable name or dot notation expression\nhttps://svelte.dev/e/tag_invalid_name";

    /// Cannot use `<slot>` syntax and `{@render ...}` tags in the same component. Migrate towards `{@render ...}` tags completely
    slot_snippet_conflict() => "Cannot use `<slot>` syntax and `{@render ...}` tags in the same component. Migrate towards `{@render ...}` tags completely\nhttps://svelte.dev/e/slot_snippet_conflict";

    /// Cannot use explicit children snippet at the same time as implicit children content. Remove either the non-whitespace content or the children snippet block
    snippet_conflict() => "Cannot use explicit children snippet at the same time as implicit children content. Remove either the non-whitespace content or the children snippet block\nhttps://svelte.dev/e/snippet_conflict";

    /// An exported snippet can only reference things declared in a `<script module>`, or other exportable snippets
    snippet_invalid_export() => "An exported snippet can only reference things declared in a `<script module>`, or other exportable snippets\nhttps://svelte.dev/e/snippet_invalid_export";

    /// Attribute values containing `{...}` must be enclosed in quote marks, unless the value only contains the expression
    attribute_unquoted_sequence() => "Attribute values containing `{...}` must be enclosed in quote marks, unless the value only contains the expression\nhttps://svelte.dev/e/attribute_unquoted_sequence";

    /// Event attribute must be a JavaScript expression, not a string
    attribute_invalid_event_handler() => "Event attribute must be a JavaScript expression, not a string\nhttps://svelte.dev/e/attribute_invalid_event_handler";

    /// A component can have a single top-level `<script>` element and/or a single top-level `<script module>` element
    script_duplicate() => "A component can have a single top-level `<script>` element and/or a single top-level `<script module>` element\nhttps://svelte.dev/e/script_duplicate";

    /// `let:` directive at invalid position
    let_directive_invalid_placement() => "`let:` directive at invalid position\nhttps://svelte.dev/e/let_directive_invalid_placement";

    /// `<%name%>` does not support non-event attributes or spread attributes
    illegal_element_attribute(element: &str) => "`<{}>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/illegal_element_attribute", element;

    /// `<svelte:body>` does not support non-event attributes or spread attributes
    svelte_body_illegal_attribute() => "`<svelte:body>` does not support non-event attributes or spread attributes\nhttps://svelte.dev/e/svelte_body_illegal_attribute";

    /// `{@debug ...}` arguments must be identifiers
    debug_tag_invalid_arguments() => "{@debug ...} arguments must be identifiers, not arbitrary expressions\nhttps://svelte.dev/e/debug_tag_invalid_arguments";

    /// Title element can only contain text and `{expression}`
    title_invalid_content() => "`<title>` can only contain text and {tags}\nhttps://svelte.dev/e/title_invalid_content";

    /// Logic block or expression inside textarea
    block_invalid_placement(thing: &str) => "{} block cannot be inside <textarea>\nhttps://svelte.dev/e/block_invalid_placement", thing;

    /// Style directive modifier invalid
    style_directive_invalid_modifier() => "`style:` directive can only use the `important` modifier\nhttps://svelte.dev/e/style_directive_invalid_modifier";

    /// Directive value must be an expression
    directive_invalid_value() => "Directive value must be a JavaScript expression enclosed in curly braces\nhttps://svelte.dev/e/directive_invalid_value";

    /// `bind:value` on wrong element
    bind_invalid_value(element: &str) => "`bind:value` can only be used on `<input>`, `<textarea>` or `<select>`, not `<{}>`\nhttps://svelte.dev/e/bind_invalid_value", element;

    /// TypeScript feature invalid
    typescript_invalid_feature(feature: &str) => "TypeScript {} are not supported in Svelte components\nhttps://svelte.dev/e/typescript_invalid_feature", feature;
}

// Diagnostics whose message is assembled conditionally, or that carry a span,
// do not fit the declarative form above.

/// `bind:%name%` is not a valid binding. %explanation%
pub fn bind_invalid_name(name: &str, explanation: Option<&str>) -> AnalysisError {
    let message = if let Some(exp) = explanation {
        format!(
            "`bind:{}` is not a valid binding. {}\nhttps://svelte.dev/e/bind_invalid_name",
            name, exp
        )
    } else {
        format!(
            "`bind:{}` is not a valid binding\nhttps://svelte.dev/e/bind_invalid_name",
            name
        )
    };
    error("bind_invalid_name", message)
}
