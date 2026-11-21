//! HTML facts the Svelte and Vue crates share: character references, void elements, the DOM
//! properties attributes set and the language a script element names.

pub mod attributes;
pub mod character_references;
pub mod elements;
pub mod script_language;

pub use attributes::property_name;
pub use character_references::{decode_attribute, decode_text, escape_markup};
pub use elements::is_void;
