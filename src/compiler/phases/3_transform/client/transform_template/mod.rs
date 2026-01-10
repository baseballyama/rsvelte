//! Template transformation for client-side code generation.
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-template/`
//!
//! It provides functionality for building and transforming templates into client-side
//! JavaScript code.

pub mod fix_attribute_casing;
pub mod index;
pub mod template;
pub mod types;

// Re-export commonly used items
pub use fix_attribute_casing::fix_attribute_casing;
pub use index::{Location, Locator, Namespace, transform_template};
pub use template::Template;
pub use types::{Comment, Element, Node, TextNode};
