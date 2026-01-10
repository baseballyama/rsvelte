//! Phase 3: Transform
//!
//! Generate JavaScript code from the analyzed AST.
//!
//! This phase is responsible for:
//! - Generating client-side component code
//! - Generating server-side rendering code
//! - Generating CSS with scoped selectors
//!
//! The transformer produces the final JavaScript and CSS output.

pub mod client;
pub mod css;
pub mod js_ast;
pub mod server;
pub mod shared;

// Re-export commonly used types
pub use js_ast::{JsExpr, JsProgram, JsStatement};

use super::phase2_analyze::ComponentAnalysis;
use crate::ast::template::Root;
use crate::compiler::{CompileOptions, GenerateMode};

/// Result of the transform phase.
#[derive(Debug)]
pub struct TransformResult {
    /// The generated JavaScript code
    pub js: String,

    /// Optional source map
    pub js_map: Option<String>,

    /// The generated CSS (if any)
    pub css: Option<CssOutput>,

    /// Compiler warnings
    pub warnings: Vec<TransformWarning>,
}

/// Generated CSS output.
#[derive(Debug)]
pub struct CssOutput {
    /// The CSS code
    pub code: String,

    /// Optional source map
    pub map: Option<String>,
}

/// A compiler warning from the transform phase.
#[derive(Debug)]
pub struct TransformWarning {
    /// Warning code
    pub code: String,
    /// Warning message
    pub message: String,
}

/// Transform a component analysis into JavaScript code.
///
/// This is the entry point for Phase 3 of the compiler.
///
/// # Arguments
///
/// * `analysis` - The component analysis from Phase 2
/// * `ast` - The parsed AST from Phase 1 (to avoid re-parsing)
/// * `source` - The original source code
/// * `options` - Compile options
///
/// # Returns
///
/// Returns a `TransformResult` containing the generated code.
pub fn transform_component(
    analysis: &ComponentAnalysis,
    ast: &Root,
    source: &str,
    options: &CompileOptions,
) -> Result<TransformResult, TransformError> {
    let js = match options.generate {
        GenerateMode::Client => client::transform_client(analysis, ast, source, options)?,
        GenerateMode::Server => server::transform_server(analysis, ast, source, options)?,
    };

    let css = if analysis.css.has_css && !analysis.inject_styles {
        Some(css::render_stylesheet(analysis, source, options)?)
    } else {
        None
    };

    // Convert Phase 2 analysis warnings to transform warnings
    let warnings = analysis
        .warnings
        .iter()
        .map(|w| TransformWarning {
            code: w.code.clone(),
            message: w.message.clone(),
        })
        .collect();

    Ok(TransformResult {
        js,
        js_map: None,
        css,
        warnings,
    })
}

/// Error type for transform failures.
#[derive(Debug)]
pub enum TransformError {
    /// Code generation error
    CodeGen(String),
    /// CSS transformation error
    Css(String),
}

impl std::fmt::Display for TransformError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TransformError::CodeGen(msg) => write!(f, "Code generation error: {}", msg),
            TransformError::Css(msg) => write!(f, "CSS error: {}", msg),
        }
    }
}

impl std::error::Error for TransformError {}
