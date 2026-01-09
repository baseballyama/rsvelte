//! Factory functions for creating AST nodes.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to `svelte/packages/svelte/src/compiler/phases/1-parse/utils/create.js`
//!
//! It provides factory functions for creating AST nodes with sensible defaults.

use crate::ast::template::{Fragment, FragmentType};

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
#[inline]
pub fn create_fragment(_transparent: bool) -> Fragment {
    Fragment {
        node_type: FragmentType::Fragment,
        nodes: Vec::new(),
        // Note: The JS version has metadata: { transparent, dynamic: false }
        // but our Rust Fragment struct doesn't have a metadata field yet.
        // This will need to be added to match the JS implementation exactly.
    }
}

// Note: The following functions are kept for backward compatibility
// with existing Rust code, but they don't correspond to the JS implementation.

/// Create an empty Fragment (backward compatibility).
#[inline]
pub fn create_empty_fragment() -> Fragment {
    create_fragment(false)
}

/// Create a Fragment with a single node (backward compatibility).
///
/// Note: This doesn't exist in the JS version.
#[inline]
pub fn create_fragment_with_node(node: crate::ast::template::TemplateNode) -> Fragment {
    Fragment {
        node_type: FragmentType::Fragment,
        nodes: vec![node],
    }
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
