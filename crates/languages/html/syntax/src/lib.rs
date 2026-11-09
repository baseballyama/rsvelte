//! HTML character references, decoded the same way by the Svelte and Vue parsers.

pub mod character_references;

pub use character_references::{decode_attribute, decode_text};
