//! Native lint rules. Each rule is a zero-sized struct implementing
//! [`Rule`](crate::rule::Rule); the full set is assembled in
//! [`registry`](crate::registry).

pub mod button_has_type;
pub mod no_at_debug_tags;
pub mod no_at_html_tags;
pub mod no_dupe_else_if_blocks;
pub mod no_dupe_style_properties;
pub mod no_object_in_text_mustaches;
pub mod no_restricted_html_elements;
pub mod require_each_key;
