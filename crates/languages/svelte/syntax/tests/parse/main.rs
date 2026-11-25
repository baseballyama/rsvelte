//! The crate's integration tests, in one binary. `token_capacity` keeps its own, since it turns off
//! the process-wide buffer pool.

mod acorn_errors;
mod after_a_number;
mod element_boundaries;
mod invalid_character;
mod javascript_tokens;
mod lexical_boundaries;
mod nesting;
mod number;
mod parse_growth;
mod scripts_read_as_typescript;
mod style_sheet_errors;
mod text_delimiters;
mod token_after_part;
mod trailing_whitespace;
mod typescript_grammar;
mod typescript_in_javascript;
mod whitespace;
