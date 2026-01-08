//! Shared utilities for visitors.
//!
//! Common functions used across multiple visitors.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/` directory.

pub mod a11y;
pub mod attribute;
pub mod component;
pub mod element;
pub mod fragment;
pub mod function;
pub mod snippets;
pub mod special_element;
pub mod utils;

pub use attribute::{validate_attribute, validate_attribute_name, validate_slot_attribute};
pub use element::validate_element;
pub use fragment::mark_subtree_dynamic;
