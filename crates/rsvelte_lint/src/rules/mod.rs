//! Native lint rules. Each rule is a zero-sized struct implementing
//! [`Rule`](crate::rule::Rule); the full set is assembled in
//! [`registry`](crate::registry).

pub mod button_has_type;
pub mod no_at_debug_tags;
pub mod no_at_html_tags;
pub mod no_dupe_else_if_blocks;
pub mod no_dupe_on_directives;
pub mod no_dupe_style_properties;
pub mod no_dupe_use_directives;
pub mod no_inspect;
pub mod no_not_function_handler;
pub mod no_object_in_text_mustaches;
pub mod no_raw_special_elements;
pub mod no_restricted_html_elements;
pub mod no_svelte_internal;
pub mod no_useless_children_snippet;
pub mod no_useless_mustaches;
pub mod require_each_key;
pub mod valid_each_key;
