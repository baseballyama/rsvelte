//! Vue single-file component trees and their parser.

pub mod parse;
pub mod syntax_tree;

pub mod computation;
pub use computation::{PLUGIN, Parsed, matches, register};
