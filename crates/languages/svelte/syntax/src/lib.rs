//! Svelte source trees and their parser.

pub mod names;
pub mod parse;
pub mod syntax_tree;

mod computation;
pub use computation::{PLUGIN, Parsed, fully_parsed, matches, register};
