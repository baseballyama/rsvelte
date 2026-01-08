//! Error types for the Svelte parser.

// The unused_assignments warning is a false positive from thiserror macro expansion
// in newer Rust versions (1.92+). The fields are used in #[error(...)] format strings.
#![allow(unused_assignments)]

use miette::Diagnostic;
use thiserror::Error;

/// A parse error.
#[derive(Debug, Error, Diagnostic)]
pub enum ParseError {
    #[error("Unexpected end of input")]
    #[diagnostic(code(svelte::parse::unexpected_eof))]
    UnexpectedEof {
        #[label("here")]
        span: (usize, usize),
    },

    #[error("Unexpected token: expected {expected}, found {found}")]
    #[diagnostic(code(svelte::parse::unexpected_token))]
    UnexpectedToken {
        expected: String,
        found: String,
        #[label("unexpected token")]
        span: (usize, usize),
    },

    #[error("Unclosed element: <{name}>")]
    #[diagnostic(code(svelte::parse::unclosed_element))]
    UnclosedElement {
        name: String,
        #[label("opened here")]
        span: (usize, usize),
    },

    #[error("Unclosed block: {{#{name}}}")]
    #[diagnostic(code(svelte::parse::unclosed_block))]
    UnclosedBlock {
        name: String,
        #[label("opened here")]
        span: (usize, usize),
    },

    #[error("Invalid attribute name")]
    #[diagnostic(code(svelte::parse::invalid_attribute))]
    InvalidAttribute {
        #[label("invalid attribute")]
        span: (usize, usize),
    },

    #[error("Invalid JavaScript expression: {message}")]
    #[diagnostic(code(svelte::parse::invalid_expression))]
    InvalidExpression {
        message: String,
        #[label("invalid expression")]
        span: (usize, usize),
    },

    #[error("{message}")]
    #[diagnostic(code(svelte::parse::generic))]
    Generic {
        message: String,
        #[label("{message}")]
        span: (usize, usize),
    },
}

/// Result type for parse operations.
pub type ParseResult<T> = Result<T, ParseError>;
