//! What the HTML-based languages (Svelte, Vue) share. Each language still ports its own tool's
//! lists where they differ (the void elements of Svelte's parser and Vue's are not the same list);
//! what lives here is what both read the same way.

pub mod button_type;
pub mod character_references;

pub use character_references::{decode_attribute, decode_text};
