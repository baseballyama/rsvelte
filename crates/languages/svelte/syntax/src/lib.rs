//! Svelte source trees and their parser.

mod character_references;
pub mod names;
pub mod parse;
pub mod syntax_tree;

mod computation;
pub use computation::{PLUGIN, Parsed, matches, register};
