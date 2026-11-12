//! Svelte source trees and their parser.

pub mod names;
pub mod parse;
pub mod syntax_tree;

mod computation;
pub use computation::{CutStyle, PLUGIN, Parsed, cut_parse_error, fully_parsed, matches, register};
