//! Shared utilities for client visitors.
//!
//! This module contains helper functions and utilities that are used
//! by multiple client-side visitors. It mirrors the structure at
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/`.
//!
//! # Submodules
//!
//! - `assignment_helpers.rs` - Assignment expression helper functions
//! - `component.rs` - Component instantiation utilities
//! - `declarations.rs` - Declaration transformations for reactive state
//! - `element.rs` - Element attribute/property handling
//! - `events.rs` - Event handler utilities
//! - `fragment.rs` - Fragment processing utilities
//! - `function.rs` - Function utilities
//! - `special_element.rs` - Special element utilities
//! - `utils.rs` - General utilities (build_render_statement, etc.)
//!
//! # Usage
//!
//! These utilities are designed to be used by individual visitor modules
//! to avoid code duplication. Common patterns like building template
//! effects, handling bindings, and processing children should be
//! implemented here.

pub mod assignment_helpers;
pub mod component;
pub mod declarations;
pub mod element;
pub mod events;
pub mod fragment;
pub mod function;
pub mod special_element;
pub mod utils;
