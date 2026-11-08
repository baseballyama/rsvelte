//! Svelte parsing.

pub mod syntax {
    pub mod parse;
}
pub use syntax::parse;

mod computation;
pub use computation::{PLUGIN, Parsed, matches, register};
