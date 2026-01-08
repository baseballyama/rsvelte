//! HTML utility functions.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/utils/html.js`
//!
//! It provides HTML-related utility functions such as checking for void elements.

/// Check if an element is a void element.
pub fn is_void_element(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}
