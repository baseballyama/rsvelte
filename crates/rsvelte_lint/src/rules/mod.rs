//! Native lint rules. Each rule is a zero-sized struct implementing
//! [`Rule`](crate::rule::Rule); the full set is assembled in
//! [`registry`](crate::registry).

pub mod button_has_type;
pub mod known_css_properties;
pub mod no_add_event_listener;
pub mod no_at_const_tags;
pub mod no_at_debug_tags;
pub mod no_at_html_tags;
pub mod no_dupe_else_if_blocks;
pub mod no_dupe_on_directives;
pub mod no_dupe_style_properties;
pub mod no_dupe_use_directives;
pub mod no_dynamic_slot_name;
pub mod no_ignored_unsubscribe;
pub mod no_inner_declarations;
pub mod no_inspect;
pub mod no_nested_style_tag;
pub mod no_not_function_handler;
pub mod no_object_in_text_mustaches;
pub mod no_raw_special_elements;
pub mod no_restricted_html_elements;
pub mod no_shorthand_style_property_overrides;
pub mod no_store_async;
pub mod no_svelte_internal;
pub mod no_target_blank;
pub mod no_top_level_browser_globals;
pub mod no_unknown_style_directive_property;
pub mod no_useless_children_snippet;
pub mod no_useless_mustaches;
pub mod prefer_derived_over_derived_by;
pub mod prefer_svelte_reactivity;
pub mod require_each_key;
pub mod require_store_callbacks_use_set_param;
pub mod require_stores_init;
pub mod store_refs;
pub mod valid_each_key;
