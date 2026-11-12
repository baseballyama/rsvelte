//! HTML facts the Svelte and Vue crates share: character references, void elements and the DOM
//! properties attributes set.

pub mod attributes;
pub mod character_references;
pub mod elements;

pub use attributes::property_name;
pub use character_references::{decode_attribute, decode_text};
pub use elements::{VOID_ELEMENTS, is_void};
