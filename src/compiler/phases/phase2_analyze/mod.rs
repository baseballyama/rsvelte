//! Phase 2: Analyze
//!
//! Semantic analysis of the parsed AST.
//!
//! This phase is responsible for:
//! - Creating scopes and tracking variable bindings
//! - Validating identifiers and imports
//! - Analyzing reactive declarations and dependencies
//! - Checking directives and their usage
//! - Pruning unused CSS
//! - Generating scope maps for code generation
//!
//! The analyzer produces a `ComponentAnalysis` structure that contains
//! all the semantic information needed for code generation.

mod scope;
mod scope_builder;
mod types;
mod visitors;

pub use scope::{
    Binding, BindingKind, BindingReference, DeclarationKind, Mutation, MutationKind, Scope,
    ScopeRoot,
};
pub use types::{ComponentAnalysis, CssAnalysis, JsAnalysis, ScriptContent, TemplateAnalysis};

use crate::ast::template::Root;
use crate::compiler::CompileOptions;

/// Analyze a parsed Svelte component.
///
/// This is the entry point for Phase 2 of the compiler.
///
/// # Arguments
///
/// * `ast` - The parsed AST from Phase 1
/// * `source` - The original source code
/// * `options` - Compile options
///
/// # Returns
///
/// Returns a `ComponentAnalysis` containing all semantic information.
pub fn analyze_component(
    ast: &Root,
    source: &str,
    options: &CompileOptions,
) -> Result<ComponentAnalysis, AnalysisError> {
    let mut analysis = ComponentAnalysis::new(source, options);

    // Extract script content for Phase 3 (avoids re-parsing)
    analysis.extract_scripts(ast);

    // Create scopes for the component
    analysis.create_scopes(ast)?;

    // Analyze the template
    visitors::analyze_template(ast, &mut analysis)?;

    // Analyze CSS if present
    if let Some(ref css) = ast.css {
        analysis.analyze_css(css)?;
    }

    Ok(analysis)
}

/// Error type for analysis failures.
#[derive(Debug)]
pub enum AnalysisError {
    /// Scope-related error
    Scope(String),
    /// Validation error
    Validation(String),
    /// CSS analysis error
    Css(String),
}

impl std::fmt::Display for AnalysisError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AnalysisError::Scope(msg) => write!(f, "Scope error: {}", msg),
            AnalysisError::Validation(msg) => write!(f, "Validation error: {}", msg),
            AnalysisError::Css(msg) => write!(f, "CSS error: {}", msg),
        }
    }
}

impl std::error::Error for AnalysisError {}
