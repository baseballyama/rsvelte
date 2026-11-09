use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

use crate::rule::RuleDefinition;

mod block_lang;
mod button_has_type;
pub(crate) mod comment_directive;
mod compile_warnings;
mod consistent_selector_style;
mod constant_string;
mod derived_has_same_inputs_outputs;
mod duplicate_directives;
mod element_kind;
mod experimental_require_slot_types;
mod expressions;
mod first_attribute_linebreak;
mod html_closing_bracket_new_line;
mod html_closing_bracket_spacing;
mod html_quotes;
mod html_self_closing;
mod inactive;
mod indent;
mod infinite_reactive_loop;
mod javascript;
mod kit_navigation;
mod kit_route;
mod legacy_reactivity;
mod markup;
mod max_attributes_per_line;
mod max_lines_per_block;
mod mustache_spacing;
mod no_add_event_listener;
mod no_at_const_tags;
mod no_at_debug_tags;
mod no_at_html_tags;
mod no_bind_value_on_checkable_inputs;
mod no_conflicting_module_names;
mod no_dom_manipulating;
mod no_dupe_else_if_blocks;
mod no_dupe_on_directives;
mod no_dupe_style_properties;
mod no_dupe_use_directives;
mod no_dynamic_slot_name;
mod no_export_load_in_svelte_module_in_kit_pages;
mod no_extra_reactive_curlies;
mod no_goto_without_base;
mod no_ignored_unsubscribe;
mod no_immutable_reactive_statements;
mod no_inline_styles;
mod no_inner_declarations;
mod no_inspect;
mod no_navigation_without_base;
mod no_navigation_without_resolve;
mod no_nested_style_tag;
mod no_not_function_handler;
mod no_object_in_text_mustaches;
mod no_raw_special_elements;
mod no_reactive_functions;
mod no_reactive_literals;
mod no_reactive_reassign;
mod no_restricted_html_elements;
mod no_shorthand_style_property_overrides;
mod no_spaces_around_equal_signs_in_attribute;
mod no_store_async;
mod no_svelte_internal;
mod no_target_blank;
mod no_top_level_browser_globals;
mod no_trailing_spaces;
mod no_unknown_style_directive_property;
mod no_unnecessary_condition;
mod no_unnecessary_state_wrap;
mod no_unused_class_name;
mod no_unused_svelte_ignore;
mod no_unused_variables;
mod no_useless_children_snippet;
mod no_useless_mustaches;
mod nodes;
mod prefer_attribute_interpolation;
mod prefer_class_directive;
mod prefer_const;
mod prefer_derived_over_derived_by;
mod prefer_destructured_store_props;
mod prefer_style_directive;
mod prefer_svelte_reactivity;
mod prefer_writable_derived;
mod reactive_statements;
mod require_each_key;
mod require_optimized_style_attribute;
mod require_store_callbacks_use_set_param;
mod require_store_reactive_access;
mod require_stores_init;
mod runes;
mod runes_mode;
mod shorthand_attribute;
mod shorthand_directive;
mod sort_attributes;
mod spaced_html_comment;
mod string_escape;
pub(crate) mod style_attribute;
pub(crate) mod style_sheet;
mod svelte_store;
pub(crate) mod system;
#[cfg(test)]
mod testing;
mod valid_compile;
mod valid_each_key;
mod valid_prop_names_in_kit_pages;
mod valid_style_parse;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &no_unnecessary_condition::RULE,
    &button_has_type::RULE,
    &no_conflicting_module_names::RULE,
    &no_export_load_in_svelte_module_in_kit_pages::RULE,
    &no_goto_without_base::RULE,
    &no_navigation_without_base::RULE,
    &no_navigation_without_resolve::RULE,
    &consistent_selector_style::RULE,
    &no_dupe_style_properties::RULE,
    &no_inline_styles::RULE,
    &no_shorthand_style_property_overrides::RULE,
    &no_unknown_style_directive_property::RULE,
    &no_unused_class_name::RULE,
    &prefer_class_directive::RULE,
    &prefer_style_directive::RULE,
    &require_optimized_style_attribute::RULE,
    &first_attribute_linebreak::RULE,
    &html_closing_bracket_new_line::RULE,
    &html_closing_bracket_spacing::RULE,
    &html_quotes::RULE,
    &html_self_closing::RULE,
    &max_attributes_per_line::RULE,
    &mustache_spacing::RULE,
    &no_spaces_around_equal_signs_in_attribute::RULE,
    &no_trailing_spaces::RULE,
    &sort_attributes::RULE,
    &spaced_html_comment::RULE,
    &no_at_const_tags::RULE,
    &no_at_debug_tags::RULE,
    &no_at_html_tags::RULE,
    &no_bind_value_on_checkable_inputs::RULE,
    &no_dupe_else_if_blocks::RULE,
    &no_dupe_on_directives::RULE,
    &no_dupe_use_directives::RULE,
    &no_dynamic_slot_name::RULE,
    &no_inspect::RULE,
    &no_nested_style_tag::RULE,
    &no_not_function_handler::RULE,
    &no_object_in_text_mustaches::RULE,
    &no_raw_special_elements::RULE,
    &no_restricted_html_elements::RULE,
    &no_target_blank::RULE,
    &no_useless_children_snippet::RULE,
    &no_useless_mustaches::RULE,
    &prefer_attribute_interpolation::RULE,
    &require_each_key::RULE,
    &shorthand_attribute::RULE,
    &shorthand_directive::RULE,
    &comment_directive::RULE,
    &no_unused_svelte_ignore::RULE,
    &system::RULE,
    &valid_compile::RULE,
    &derived_has_same_inputs_outputs::RULE,
    &infinite_reactive_loop::RULE,
    &no_add_event_listener::RULE,
    &no_dom_manipulating::RULE,
    &no_extra_reactive_curlies::RULE,
    &no_ignored_unsubscribe::RULE,
    &no_immutable_reactive_statements::RULE,
    &no_reactive_functions::RULE,
    &no_reactive_literals::RULE,
    &no_reactive_reassign::RULE,
    &no_store_async::RULE,
    &prefer_destructured_store_props::RULE,
    &require_store_callbacks_use_set_param::RULE,
    &require_store_reactive_access::RULE,
    &require_stores_init::RULE,
    &experimental_require_slot_types::RULE,
    &inactive::EXPERIMENTAL_REQUIRE_STRICT_EVENTS,
    &no_inner_declarations::RULE,
    &no_svelte_internal::RULE,
    &no_top_level_browser_globals::RULE,
    &no_unnecessary_state_wrap::RULE,
    &inactive::NO_UNUSED_PROPS,
    &prefer_const::RULE,
    &prefer_derived_over_derived_by::RULE,
    &prefer_svelte_reactivity::RULE,
    &prefer_writable_derived::RULE,
    &inactive::REQUIRE_EVENT_DISPATCHER_TYPES,
    &inactive::REQUIRE_EVENT_PREFIX,
    &block_lang::RULE,
    &indent::RULE,
    &max_lines_per_block::RULE,
    &valid_each_key::RULE,
    &valid_prop_names_in_kit_pages::RULE,
    &valid_style_parse::RULE,
];

/// A JavaScript node's span: every node a rule reads was parsed from the document.
fn node_span(javascript: &SyntaxTree, node: NodeIdentifier) -> Span {
    javascript
        .source_location(node)
        .span()
        .expect("a parsed node has a span")
}
