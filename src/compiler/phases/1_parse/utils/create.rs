//! Factory functions for creating AST nodes.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to `svelte/packages/svelte/src/compiler/phases/1-parse/utils/create.js`
//!
//! It provides factory functions for creating AST nodes with sensible defaults.

// Allow dead code for library functions that will be used as the parser is extended
#![allow(dead_code)]

use crate::ast::template::{Fragment, FragmentType, TemplateNode};

/// Create a new Fragment with the given nodes.
///
/// # Arguments
/// * `nodes` - The child nodes of the fragment
///
/// # Example
/// ```ignore
/// let fragment = create_fragment(vec![
///     TemplateNode::Text(Text { ... }),
///     TemplateNode::Element(Element { ... }),
/// ]);
/// ```
#[inline]
pub fn create_fragment(nodes: Vec<TemplateNode>) -> Fragment {
    Fragment {
        node_type: FragmentType::Fragment,
        nodes,
    }
}

/// Create an empty Fragment.
///
/// This is useful when initializing a fragment that will be populated later.
#[inline]
pub fn create_empty_fragment() -> Fragment {
    Fragment {
        node_type: FragmentType::Fragment,
        nodes: Vec::new(),
    }
}

/// Create a Fragment with a single node.
///
/// # Arguments
/// * `node` - The single child node
#[inline]
pub fn create_fragment_with_node(node: TemplateNode) -> Fragment {
    Fragment {
        node_type: FragmentType::Fragment,
        nodes: vec![node],
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::template::Text;
    use compact_str::CompactString;

    #[test]
    fn test_create_fragment() {
        let text = TemplateNode::Text(Text {
            start: 0,
            end: 5,
            raw: CompactString::from("hello"),
            data: CompactString::from("hello"),
        });

        let fragment = create_fragment(vec![text]);
        assert_eq!(fragment.node_type, FragmentType::Fragment);
        assert_eq!(fragment.nodes.len(), 1);
    }

    #[test]
    fn test_create_empty_fragment() {
        let fragment = create_empty_fragment();
        assert_eq!(fragment.node_type, FragmentType::Fragment);
        assert!(fragment.nodes.is_empty());
    }

    #[test]
    fn test_create_fragment_with_node() {
        let text = TemplateNode::Text(Text {
            start: 0,
            end: 5,
            raw: CompactString::from("hello"),
            data: CompactString::from("hello"),
        });

        let fragment = create_fragment_with_node(text);
        assert_eq!(fragment.node_type, FragmentType::Fragment);
        assert_eq!(fragment.nodes.len(), 1);
    }
}
