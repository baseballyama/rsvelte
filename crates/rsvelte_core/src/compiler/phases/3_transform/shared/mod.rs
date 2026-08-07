//! Shared utilities for Phase 3 Transform.
//!
//! This module contains utilities that are shared between client and server
//! code generation.

pub mod ast_rewrite;
pub mod async_body;
pub mod class_body;
pub mod js_scan;
pub mod offsets;
pub mod template;

pub use template::*;
