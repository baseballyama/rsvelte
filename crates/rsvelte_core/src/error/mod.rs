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

    /// Svelte-compatible error with specific error code.
    /// Used to match Svelte's error codes for compatibility testing.
    #[error("{code}: {message}")]
    #[diagnostic()]
    SvelteError {
        /// The Svelte error code (e.g., "element_unclosed", "void_element_invalid_content")
        code: String,
        /// The error message
        message: String,
        #[label("{message}")]
        span: (usize, usize),
    },
}

impl ParseError {
    /// Create a Svelte-compatible error with a specific error code.
    pub fn svelte(code: &str, message: impl Into<String>, span: (usize, usize)) -> Self {
        ParseError::SvelteError {
            code: code.to_string(),
            message: message.into(),
            span,
        }
    }

    /// Create an expected token error.
    ///
    /// Corresponds to `expected_token()` in JavaScript errors.
    pub fn expected_token(expected: &str, position: usize) -> Self {
        ParseError::svelte(
            "expected_token",
            format!("Expected token {}", expected),
            (position, position + 1),
        )
    }

    /// Create a TypeScript invalid feature error.
    ///
    /// Mirrors upstream `e.typescript_invalid_feature(node, feature)` — the
    /// message (including the `svelte.dev/e/…` URL) matches the official
    /// compiler so the error code can be extracted from the message text the
    /// same way as every other Svelte-coded error.
    pub fn typescript_invalid_feature(feature: impl Into<String>, span: (usize, usize)) -> Self {
        ParseError::svelte(
            "typescript_invalid_feature",
            format!(
                "TypeScript language features like {} are not natively supported, and their use is generally discouraged. Outside of `<script>` tags, these features are not supported. For use within `<script>` tags, you will need to use a preprocessor to convert it to JavaScript before it gets passed to the Svelte compiler. If you are using `vitePreprocess`, make sure to specifically enable preprocessing script tags (`vitePreprocess({{ script: true }})`)\nhttps://svelte.dev/e/typescript_invalid_feature",
                feature.into()
            ),
            span,
        )
    }

    /// Return the `(start, end)` byte-offset span associated with this error.
    ///
    /// Every variant carries a `span` field (the `#[label]` source range used
    /// by miette); this accessor exposes it without exhaustive matching.
    pub fn span(&self) -> (usize, usize) {
        match self {
            ParseError::UnexpectedEof { span }
            | ParseError::UnexpectedToken { span, .. }
            | ParseError::UnclosedElement { span, .. }
            | ParseError::UnclosedBlock { span, .. }
            | ParseError::InvalidAttribute { span }
            | ParseError::InvalidExpression { span, .. }
            | ParseError::Generic { span, .. }
            | ParseError::SvelteError { span, .. } => *span,
        }
    }
}

/// Result type for parse operations.
pub type ParseResult<T> = Result<T, ParseError>;
