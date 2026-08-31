//! CSS analysis for the analyzer.
//!
//! This module handles CSS semantic analysis and CSS-related warnings.
//!
//! It does **not** decide which selectors are used: that verdict is made in
//! `3_transform/css.rs`, which is what emits `/* (unused) … */` and raises
//! `css_unused_selector`.
//!
//! Corresponds to Svelte's `2-analyze/css/` directory.

pub mod analyze;
mod utils;
mod warn;

pub use analyze::{analyze_css, extract_css_selector_info};
pub use utils::{
    get_parent_rules, get_possible_values, get_possible_values_expr, is_global, is_outer_global,
    is_unscoped_pseudo_class, possible_attribute_values, possible_class_names,
};
pub use warn::warn_unused;
