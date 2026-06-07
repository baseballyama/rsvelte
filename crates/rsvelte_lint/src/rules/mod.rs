//! Native lint rules. Each rule is a zero-sized struct implementing
//! [`Rule`](crate::rule::Rule); the full set is assembled in
//! [`registry`](crate::registry).

pub mod no_at_html_tags;
pub mod require_each_key;
