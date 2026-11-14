//! Svelte source trees and their parser.

pub mod names;
pub mod parse;
pub mod syntax_tree;

mod computation;
pub use computation::{
    PLUGIN, Parsed, ParsedAsTypeScript, fully_parsed, matches,
    parsed_reading_scripts_as_typescript, register,
};
