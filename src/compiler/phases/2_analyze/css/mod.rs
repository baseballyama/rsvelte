//! CSS analysis for the analyzer.
//!
//! This module handles CSS semantic analysis, unused selector detection,
//! and CSS-related warnings.
//!
//! Corresponds to Svelte's `2-analyze/css/` directory.

// Allow dead code for stub implementations that will be integrated later
#![allow(dead_code)]

mod analyze;
mod prune;
mod utils;
mod warn;

pub use analyze::analyze_css;
pub use prune::prune_css;
pub use utils::{
    get_parent_rules, get_possible_values, is_global, is_outer_global, is_unscoped_pseudo_class,
};
pub use warn::warn_unused;
