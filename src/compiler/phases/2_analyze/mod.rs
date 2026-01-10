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
//!
//! Corresponds to Svelte's `2-analyze/` directory.

pub mod binding_properties;
pub mod control_flow;
pub mod css;
pub mod errors;
pub mod scope;
mod scope_builder;
pub mod types;
pub mod utils;
pub mod visitors;

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
/// Corresponds to `analyze_component` in Svelte's `2-analyze/index.js`.
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

    // Analyze scripts (JavaScript AST)
    if let Some(ref instance) = ast.instance {
        let script_ast = instance.content.as_json();
        let mut context = visitors::VisitorContext::new(&mut analysis);
        visitors::visit_script(script_ast, &mut context)?;
    }

    if let Some(ref module) = ast.module {
        let script_ast = module.content.as_json();
        let mut context = visitors::VisitorContext::new(&mut analysis);
        visitors::visit_script(script_ast, &mut context)?;
    }

    // Analyze the template using visitors
    visitors::analyze_template(ast, &mut analysis)?;

    // Build sibling relationships for CSS analysis
    // This must happen after template analysis builds the DOM structure
    control_flow::build_sibling_relationships(&mut analysis.css.dom_structure, &ast.fragment);

    // Analyze CSS if present
    if let Some(ref stylesheet) = ast.css {
        analysis.analyze_css(stylesheet, options)?;

        // Run CSS analysis
        css::analyze_css(stylesheet, &mut analysis);

        // Prune unused selectors
        css::prune_css(stylesheet, &analysis);
    }

    Ok(analysis)
}

/// Analyze a Svelte module (context="module" script).
///
/// Corresponds to `analyze_module` in Svelte's `2-analyze/index.js`.
///
/// # Arguments
///
/// * `source` - The module source code
/// * `options` - Compile options
///
/// # Returns
///
/// Returns a `ModuleAnalysis` containing semantic information.
pub fn analyze_module(
    _source: &str,
    options: &CompileOptions,
) -> Result<ModuleAnalysis, AnalysisError> {
    let analysis = ModuleAnalysis {
        name: options.filename.clone(),
        runes: true,
        immutable: true,
    };

    Ok(analysis)
}

/// Module analysis result.
#[derive(Debug)]
pub struct ModuleAnalysis {
    /// Module name
    pub name: Option<String>,
    /// Whether the module uses runes
    pub runes: bool,
    /// Whether the module uses immutable mode
    pub immutable: bool,
}

/// Error type for analysis failures.
#[derive(Debug)]
pub enum AnalysisError {
    /// Scope-related error
    Scope(String),
    /// Validation error (generic, legacy)
    Validation(String),
    /// CSS analysis error
    Css(String),
    /// Validation error with error code (Svelte-compatible format)
    /// The code is the Svelte error code (e.g., "attribute_duplicate")
    ValidationWithCode { code: String, message: String },
}

impl AnalysisError {
    /// Create a validation error with code
    pub fn validation(code: &str, message: impl Into<String>) -> Self {
        AnalysisError::ValidationWithCode {
            code: code.to_string(),
            message: message.into(),
        }
    }
}

impl std::fmt::Display for AnalysisError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AnalysisError::Scope(msg) => write!(f, "Scope error: {}", msg),
            AnalysisError::Validation(msg) => write!(f, "Validation error: {}", msg),
            AnalysisError::Css(msg) => write!(f, "CSS error: {}", msg),
            AnalysisError::ValidationWithCode { code, message } => {
                write!(f, "{}: {}", code, message)
            }
        }
    }
}

impl std::error::Error for AnalysisError {}

/// Reserved identifiers that cannot be declared.
pub const RESERVED: &[&str] = &["$$props", "$$restProps", "$$slots"];

/// Get the component name from a filename.
///
/// Matches Svelte's `get_component_name()` in `2-analyze/index.js`.
pub fn get_component_name(filename: &str) -> String {
    let parts: Vec<&str> = filename.split(['/', '\\']).collect();
    let basename = parts.last().unwrap_or(&"Component");
    let last_dir = if parts.len() > 1 {
        parts.get(parts.len() - 2).copied()
    } else {
        None
    };

    let mut name = basename.replace(".svelte", "");

    // If name is "index" and there's a parent dir (not "src"), use the parent dir name
    if name == "index"
        && let Some(dir) = last_dir
        && dir != "src"
        && !dir.is_empty()
    {
        name = dir.to_string();
    }

    // Capitalize first letter
    let mut chars = name.chars();
    match chars.next() {
        None => "Component".to_string(),
        Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
    }
}
