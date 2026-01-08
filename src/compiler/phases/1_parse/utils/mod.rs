//! Utility functions for parsing.

pub mod bracket;
pub mod create;
pub mod entities;
mod entities_data;
pub mod fuzzymatch;
pub mod html;

// Re-export utilities for use by other parser modules
// These are library functions that may be used as the parser is extended
#[allow(unused_imports)]
pub use bracket::{
    BracketDepth, BracketType, find_expression_end, find_matching_bracket, is_closing_bracket,
    is_opening_bracket, is_quote, skip_string_literal, skip_template_literal,
};
#[allow(unused_imports)]
pub use create::{create_empty_fragment, create_fragment, create_fragment_with_node};
#[allow(unused_imports)]
pub use entities::decode_html_entities;
#[allow(unused_imports)]
pub use fuzzymatch::fuzzymatch;
pub use html::is_void_element;
