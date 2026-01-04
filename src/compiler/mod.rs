//! Svelte compiler module.
//!
//! This module handles the compilation of Svelte components into JavaScript.
//!
//! ## Compiler Phases
//!
//! The compilation process follows the same structure as the official Svelte compiler:
//!
//! 1. **Phase 1: Parse** - Convert source code into an AST
//! 2. **Phase 2: Analyze** - Semantic analysis (scopes, bindings, reactivity)
//! 3. **Phase 3: Transform** - Code generation for client/server
//!
//! ## Usage
//!
//! ```rust,ignore
//! use svelte_compiler_rust::{compile, CompileOptions, GenerateMode};
//!
//! let source = "<h1>Hello World</h1>";
//! let options = CompileOptions {
//!     generate: GenerateMode::Client,
//!     ..Default::default()
//! };
//! let result = compile(source, options).unwrap();
//! println!("{}", result.js.code);
//! ```

pub mod phases;

use serde::{Deserialize, Serialize};

// Re-export phase types
pub use phases::phase2_analyze::{AnalysisError, ComponentAnalysis};
pub use phases::phase3_transform::{TransformError, TransformResult};

/// Compilation target mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GenerateMode {
    /// Generate client-side code (default).
    #[default]
    Client,
    /// Generate server-side code for SSR.
    Server,
}

/// Options for the Svelte compiler.
#[derive(Debug, Clone, Default)]
pub struct CompileOptions {
    /// The target generation mode (client or server).
    pub generate: GenerateMode,
    /// The name of the component (derived from filename if not provided).
    pub name: Option<String>,
    /// The filename of the component being compiled.
    pub filename: Option<String>,
    /// Enable development mode (additional runtime checks).
    pub dev: bool,
    /// Enable HMR (Hot Module Replacement) support.
    pub hmr: bool,
    /// CSS handling mode.
    pub css: CssMode,
}

/// CSS handling mode for the compiler.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CssMode {
    /// Inject CSS into the component.
    #[default]
    Injected,
    /// Extract CSS to a separate file.
    External,
    /// Don't process CSS at all.
    None,
}

/// Result of compiling a Svelte component.
#[derive(Debug, Clone)]
pub struct CompileResult {
    /// The generated JavaScript code.
    pub js: CompileOutput,
    /// The generated CSS (if any).
    pub css: Option<CompileOutput>,
    /// Compiler warnings.
    pub warnings: Vec<Warning>,
}

/// Output code with optional source map.
#[derive(Debug, Clone)]
pub struct CompileOutput {
    /// The generated code.
    pub code: String,
    /// Optional source map.
    pub map: Option<String>,
}

/// Compiler warning.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Warning {
    /// Warning code.
    pub code: String,
    /// Warning message.
    pub message: String,
    /// Start position in the source.
    pub start: Option<Position>,
    /// End position in the source.
    pub end: Option<Position>,
}

/// Position in the source code.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    /// Line number (1-indexed).
    pub line: usize,
    /// Column number (0-indexed).
    pub column: usize,
    /// Character offset.
    pub character: usize,
}

/// Compile a Svelte component.
///
/// This function takes Svelte source code and compiles it into JavaScript.
/// It follows the three-phase compilation process:
///
/// 1. **Parse** - Convert source to AST
/// 2. **Analyze** - Semantic analysis
/// 3. **Transform** - Code generation
///
/// # Arguments
///
/// * `source` - The Svelte component source code
/// * `options` - Compilation options
///
/// # Returns
///
/// Returns a `CompileResult` containing the generated JavaScript and CSS.
pub fn compile(source: &str, options: CompileOptions) -> Result<CompileResult, CompileError> {
    // Phase 1: Parse
    let parse_options = crate::ParseOptions {
        modern: true,
        loose: false,
        filename: options.filename.clone(),
    };
    let ast = phases::phase1_parse::parse(source, parse_options)?;

    // Phase 2: Analyze
    let analysis = phases::phase2_analyze::analyze_component(&ast, source, &options)?;

    // Phase 3: Transform
    let transform_result =
        phases::phase3_transform::transform_component(&analysis, source, &options)?;

    // Convert to CompileResult
    Ok(CompileResult {
        js: CompileOutput {
            code: transform_result.js,
            map: transform_result.js_map,
        },
        css: transform_result.css.map(|c| CompileOutput {
            code: c.code,
            map: c.map,
        }),
        warnings: transform_result
            .warnings
            .into_iter()
            .map(|w| Warning {
                code: w.code,
                message: w.message,
                start: None,
                end: None,
            })
            .collect(),
    })
}

/// Error type for compilation failures.
#[derive(Debug)]
pub enum CompileError {
    /// Parse error.
    Parse(crate::error::ParseError),
    /// Analysis error.
    Analysis(AnalysisError),
    /// Transform error.
    Transform(TransformError),
}

impl From<crate::error::ParseError> for CompileError {
    fn from(err: crate::error::ParseError) -> Self {
        CompileError::Parse(err)
    }
}

impl From<AnalysisError> for CompileError {
    fn from(err: AnalysisError) -> Self {
        CompileError::Analysis(err)
    }
}

impl From<TransformError> for CompileError {
    fn from(err: TransformError) -> Self {
        CompileError::Transform(err)
    }
}

impl std::fmt::Display for CompileError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CompileError::Parse(e) => write!(f, "Parse error: {:?}", e),
            CompileError::Analysis(e) => write!(f, "Analysis error: {}", e),
            CompileError::Transform(e) => write!(f, "Transform error: {}", e),
        }
    }
}

impl std::error::Error for CompileError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compile_simple() {
        let source = "<h1>Hello World</h1>";
        let options = CompileOptions::default();
        let result = compile(source, options);
        assert!(result.is_ok());
    }

    #[test]
    fn test_compile_client_mode() {
        let source = "<div>Test</div>";
        let options = CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        assert!(result.js.code.contains("svelte/internal/client"));
    }

    #[test]
    fn test_compile_server_mode() {
        let source = "<div>Test</div>";
        let options = CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        assert!(result.js.code.contains("svelte/internal/server"));
    }
}
