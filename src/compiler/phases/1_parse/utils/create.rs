//! Factory functions for creating AST nodes.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to `svelte/packages/svelte/src/compiler/phases/1-parse/utils/create.js`
//!
//! It provides factory functions for creating AST nodes with sensible defaults.

use crate::ast::template::{Fragment, FragmentMetadata, FragmentType};

/// Create a new Fragment with metadata.
///
/// Corresponds to JavaScript's `create_fragment(transparent = false)`.
///
/// # Arguments
/// * `transparent` - Whether the fragment is transparent (default: false)
///
/// # Returns
/// A new Fragment with empty nodes and the specified metadata
///
/// # Example
/// ```ignore
/// let fragment = create_fragment(false);
/// assert_eq!(fragment.nodes.len(), 0);
/// ```
#[allow(dead_code)]
#[inline]
pub fn create_fragment(transparent: bool) -> Fragment {
    Fragment {
        node_type: FragmentType::Fragment,
        nodes: Vec::new(),
        metadata: FragmentMetadata {
            transparent,
            dynamic: false,
        },
    }
}

// Note: The following functions are kept for backward compatibility
// with existing Rust code, but they don't correspond to the JS implementation.

/// Create an empty Fragment (backward compatibility).
#[allow(dead_code)]
#[inline]
pub fn create_empty_fragment() -> Fragment {
    create_fragment(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_fragment() {
        let fragment = create_fragment(false);
        assert_eq!(fragment.node_type, FragmentType::Fragment);
        assert!(fragment.nodes.is_empty());
    }

    #[test]
    fn test_create_fragment_transparent() {
        let fragment = create_fragment(true);
        assert_eq!(fragment.node_type, FragmentType::Fragment);
        assert!(fragment.nodes.is_empty());
    }

    #[test]
    fn test_create_empty_fragment() {
        let fragment = create_empty_fragment();
        assert_eq!(fragment.node_type, FragmentType::Fragment);
        assert!(fragment.nodes.is_empty());
    }
}
