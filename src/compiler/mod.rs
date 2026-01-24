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
//! ## Directory Structure
//!
//! This directory mirrors the official Svelte compiler structure:
//!
//! ```text
//! compiler/
//! ├── mod.rs          # Public API: compile(), types
//! ├── legacy.rs       # Legacy AST conversion (Svelte 4 format)
//! └── phases/         # Compiler phases
//!     ├── 1_parse/    # Parse source to AST
//!     ├── 2_analyze/  # Semantic analysis
//!     └── 3_transform/# Code generation
//! ```
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

pub mod constants;
pub mod legacy;
pub mod phases;
pub mod preprocess;
pub mod print;
pub mod utils;

use serde::{Deserialize, Serialize};
use std::sync::Arc;

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
    /// Don't generate code (useful for tooling that only needs warnings).
    #[serde(rename = "false")]
    None,
}

/// Namespace for elements.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Namespace {
    /// HTML namespace (default).
    #[default]
    Html,
    /// SVG namespace.
    Svg,
    /// MathML namespace.
    Mathml,
}

/// Fragment cloning strategy.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FragmentMode {
    /// Use innerHTML and clone (faster, but requires trusted types).
    #[default]
    Html,
    /// Create elements one by one and clone (slower, but works everywhere).
    Tree,
}

/// Component API compatibility mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum ComponentApi {
    /// Svelte 4 compatible API.
    #[serde(rename = "4")]
    V4,
    /// Svelte 5 API (default).
    #[default]
    #[serde(rename = "5")]
    V5,
}

/// Compatibility options for backward compatibility.
#[derive(Debug, Clone, Default)]
pub struct CompatibilityConfig {
    /// Component API version (4 or 5).
    pub component_api: ComponentApi,
}

/// Custom element configuration.
#[derive(Debug, Clone)]
pub struct CustomElementConfig {
    /// Tag name for the custom element.
    pub tag: Option<String>,
    /// Shadow DOM mode ('open' or 'none').
    pub shadow: Option<ShadowMode>,
    /// Props configuration for custom elements.
    pub props: Option<std::collections::HashMap<String, CustomElementPropConfig>>,
    /// Extension function for the custom element class.
    /// Note: In TypeScript this is `(ceClass: new () => HTMLElement) => new () => HTMLElement`
    /// but in Rust we'll store the AST node when needed.
    pub extend: Option<()>, // Will be implemented later with proper AST types
}

/// Shadow DOM mode for custom elements.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShadowMode {
    /// Open shadow root.
    Open,
    /// No shadow root.
    None,
}

/// Custom element property configuration.
#[derive(Debug, Clone)]
pub struct CustomElementPropConfig {
    /// Attribute name mapping.
    pub attribute: Option<String>,
    /// Whether to reflect the property to an attribute.
    pub reflect: bool,
    /// Type of the property.
    pub prop_type: Option<CustomElementPropType>,
}

/// Type of custom element property.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CustomElementPropType {
    Array,
    Boolean,
    Number,
    Object,
    String,
}

/// CSS hash function type.
pub type CssHashFn = Arc<dyn Fn(&CssHashInput) -> String + Send + Sync>;

/// Input for CSS hash function.
pub struct CssHashInput {
    /// Component name.
    pub name: String,
    /// Filename.
    pub filename: String,
    /// CSS code.
    pub css: String,
    /// Hash function.
    pub hash: Arc<dyn Fn(&str) -> String + Send + Sync>,
}

/// Warning filter function type.
pub type WarningFilterFn = Arc<dyn Fn(&Warning) -> bool + Send + Sync>;

/// Experimental options.
#[derive(Debug, Clone, Default)]
pub struct ExperimentalOptions {
    /// Allow `await` keyword in deriveds, template expressions, and top level of components.
    pub r#async: bool,
}

/// Options for the Svelte compiler.
pub struct CompileOptions {
    // === ModuleCompileOptions fields ===
    /// Enable development mode (additional runtime checks).
    pub dev: bool,
    /// The target generation mode (client or server).
    pub generate: GenerateMode,
    /// The filename of the component being compiled.
    pub filename: Option<String>,
    /// Root directory for relative path resolution.
    pub root_dir: Option<String>,
    /// Warning filter function.
    #[allow(clippy::type_complexity)]
    pub warning_filter: Option<WarningFilterFn>,
    /// Experimental options.
    pub experimental: ExperimentalOptions,

    // === Component-specific options ===
    /// The name of the component (derived from filename if not provided).
    pub name: Option<String>,
    /// Enable custom element mode.
    pub custom_element: bool,
    /// Custom element configuration (when custom_element is true or from svelte:options).
    pub custom_element_options: Option<CustomElementConfig>,
    /// Enable accessors for component props.
    /// @deprecated This will have no effect in runes mode.
    pub accessors: bool,
    /// The namespace of the element.
    pub namespace: Namespace,
    /// Enable immutable mode.
    /// @deprecated This will have no effect in runes mode.
    pub immutable: bool,
    /// CSS handling mode.
    pub css: CssMode,
    /// CSS hash function.
    pub css_hash: Option<CssHashFn>,
    /// Preserve HTML comments in output.
    pub preserve_comments: bool,
    /// Preserve whitespace as typed.
    pub preserve_whitespace: bool,
    /// Fragment cloning strategy.
    pub fragments: FragmentMode,
    /// Force runes mode on/off (undefined = auto-detect).
    pub runes: Option<bool>,
    /// Expose Svelte version in browser.
    pub disclose_version: bool,
    /// Compatibility options.
    pub compatibility: CompatibilityConfig,
    /// Initial sourcemap (usually from preprocessor).
    pub sourcemap: Option<String>,
    /// Output filename for JavaScript sourcemap.
    pub output_filename: Option<String>,
    /// Output filename for CSS sourcemap.
    pub css_output_filename: Option<String>,
    /// Enable HMR (Hot Module Replacement) support.
    pub hmr: bool,
    /// Return modern AST format.
    pub modern_ast: bool,
}

impl Default for CompileOptions {
    fn default() -> Self {
        Self {
            // ModuleCompileOptions defaults
            dev: false,
            generate: GenerateMode::Client,
            filename: None,
            root_dir: None,
            warning_filter: None,
            experimental: ExperimentalOptions::default(),

            // Component options defaults
            name: None,
            custom_element: false,
            custom_element_options: None,
            accessors: false,
            namespace: Namespace::Html,
            immutable: false,
            css: CssMode::External,
            css_hash: None,
            preserve_comments: false,
            preserve_whitespace: false,
            fragments: FragmentMode::Html,
            runes: None,
            disclose_version: true,
            compatibility: CompatibilityConfig::default(),
            sourcemap: None,
            output_filename: None,
            css_output_filename: None,
            hmr: false,
            modern_ast: false,
        }
    }
}

impl std::fmt::Debug for CompileOptions {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CompileOptions")
            .field("dev", &self.dev)
            .field("generate", &self.generate)
            .field("filename", &self.filename)
            .field("root_dir", &self.root_dir)
            .field(
                "warning_filter",
                &self.warning_filter.as_ref().map(|_| "<function>"),
            )
            .field("experimental", &self.experimental)
            .field("name", &self.name)
            .field("custom_element", &self.custom_element)
            .field("custom_element_options", &self.custom_element_options)
            .field("accessors", &self.accessors)
            .field("namespace", &self.namespace)
            .field("immutable", &self.immutable)
            .field("css", &self.css)
            .field("css_hash", &self.css_hash.as_ref().map(|_| "<function>"))
            .field("preserve_comments", &self.preserve_comments)
            .field("preserve_whitespace", &self.preserve_whitespace)
            .field("fragments", &self.fragments)
            .field("runes", &self.runes)
            .field("disclose_version", &self.disclose_version)
            .field("compatibility", &self.compatibility)
            .field("sourcemap", &self.sourcemap)
            .field("output_filename", &self.output_filename)
            .field("css_output_filename", &self.css_output_filename)
            .field("hmr", &self.hmr)
            .field("modern_ast", &self.modern_ast)
            .finish()
    }
}

/// CSS handling mode for the compiler.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CssMode {
    /// Inject CSS into the component.
    Injected,
    /// Extract CSS to a separate file.
    #[default]
    External,
}

/// Result of compiling a Svelte component.
#[derive(Debug, Clone)]
pub struct CompileResult {
    /// The generated JavaScript code.
    pub js: CompileOutput,
    /// The generated CSS (if any).
    pub css: Option<CssOutput>,
    /// Compiler warnings.
    pub warnings: Vec<Warning>,
    /// Metadata about the compiled component.
    pub metadata: CompileMetadata,
    /// The AST (if requested).
    pub ast: Option<String>, // Will be properly typed later
}

/// Metadata about the compiled component.
#[derive(Debug, Clone)]
pub struct CompileMetadata {
    /// Whether the file was compiled in runes mode.
    pub runes: bool,
}

/// CSS output with additional metadata.
#[derive(Debug, Clone)]
pub struct CssOutput {
    /// The generated CSS code.
    pub code: String,
    /// Optional source map.
    pub map: Option<String>,
    /// Whether the CSS includes global rules.
    pub has_global: bool,
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
    let mut ast = phases::phase1_parse::parse(source, parse_options)?;

    // Phase 2: Analyze
    let analysis = phases::phase2_analyze::analyze_component(&mut ast, source, &options)?;

    // Determine if runes mode was used
    let runes_mode = options.runes.unwrap_or(analysis.runes);

    // Phase 3: Transform (pass AST to avoid re-parsing)
    let transform_result =
        phases::phase3_transform::transform_component(&analysis, &ast, source, &options)?;

    // Convert to CompileResult
    Ok(CompileResult {
        js: CompileOutput {
            code: transform_result.js,
            map: transform_result.js_map,
        },
        css: transform_result.css.map(|c| CssOutput {
            code: c.code,
            map: c.map,
            has_global: false, // TODO: Track global CSS usage
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
        metadata: CompileMetadata { runes: runes_mode },
        ast: None, // TODO: Return AST if options.modern_ast is true
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

    #[test]
    fn test_compile_if_block_server() {
        let source = r#"<script>
  let { visible } = $props();
</script>

{#if visible}
  <div>Visible!</div>
{/if}"#;
        let options = CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        let code = &result.js.code;

        // Should contain if statement
        assert!(code.contains("if (visible)"), "Should have if statement");
        // Should contain BLOCK_OPEN marker
        assert!(code.contains("<!--[-->"), "Should have BLOCK_OPEN marker");
        // Should contain BLOCK_CLOSE marker
        assert!(code.contains("<!--]-->"), "Should have BLOCK_CLOSE marker");
        // Should contain the div content
        assert!(code.contains("Visible!"), "Should have content");
    }

    #[test]
    fn test_compile_if_else_block_server() {
        let source = r#"<script>
  let { visible } = $props();
</script>

{#if visible}
  <div>Yes</div>
{:else}
  <div>No</div>
{/if}"#;
        let options = CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        let code = &result.js.code;

        // Should contain if and else
        assert!(code.contains("if (visible)"), "Should have if statement");
        assert!(code.contains("else"), "Should have else branch");
        // Should contain BLOCK_OPEN marker for if branch
        assert!(code.contains("<!--[-->"), "Should have BLOCK_OPEN marker");
        // Should contain BLOCK_OPEN_ELSE marker for else branch
        assert!(
            code.contains("<!--[!-->"),
            "Should have BLOCK_OPEN_ELSE marker"
        );
        // Should contain BLOCK_CLOSE marker
        assert!(code.contains("<!--]-->"), "Should have BLOCK_CLOSE marker");
    }

    #[test]
    fn test_compile_if_elseif_else_block_server() {
        let source = r#"<script>
  let { value } = $props();
</script>

{#if value === 1}
  <div>One</div>
{:else if value === 2}
  <div>Two</div>
{:else}
  <div>Other</div>
{/if}"#;
        let options = CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        let code = &result.js.code;

        // Should contain if, else if, and else
        assert!(
            code.contains("if (value === 1)"),
            "Should have if statement"
        );
        assert!(
            code.contains("else if (value === 2)"),
            "Should have else if statement"
        );
        assert!(code.contains("else"), "Should have else branch");
    }

    #[test]
    fn test_compile_if_block_server_output() {
        let source = r#"<script>
  let { visible } = $props();
</script>

{#if visible}
  <div>Visible!</div>
{:else}
  <div>Hidden</div>
{/if}"#;
        let options = CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        let code = &result.js.code;

        // Print for debugging
        println!("Generated code:\n{}", code);

        // Verify structure
        assert!(code.contains("if (visible)"), "Should have if statement");
        assert!(code.contains("<!--[-->"), "Should have BLOCK_OPEN marker");
        assert!(
            code.contains("<!--[!-->"),
            "Should have BLOCK_OPEN_ELSE marker"
        );
        assert!(code.contains("<!--]-->"), "Should have BLOCK_CLOSE marker");
    }

    #[test]
    fn test_compile_if_block_with_derived_server() {
        // Test case that exactly mimics if-block-dependencies test
        let source = r#"<script>
	let first = $state(true)
	let second = $state(false)
	let derivedSecond = $derived(second)

	queueMicrotask(() => {
		first = false
	});
</script>

{first} {second}

<button onclick={() => {
	second = true
}}>Toggle</button>

{#if first || derivedSecond}
		first: {first}
		<br />
		second: {derivedSecond}
{/if}"#;
        let options = CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        let code = &result.js.code;

        // Print for debugging
        println!("Generated code with derived:\n{}", code);

        // Should contain the expressions before if block
        assert!(
            code.contains("$.escape(first)"),
            "Should have first expression"
        );

        // Should contain the button
        assert!(code.contains("<button"), "Should have button");

        // Should contain if statement
        assert!(
            code.contains("if (first || derivedSecond)"),
            "Should have if statement with condition"
        );
        // Should contain BLOCK_OPEN marker
        assert!(code.contains("<!--[-->"), "Should have BLOCK_OPEN marker");
        // Should contain BLOCK_CLOSE marker
        assert!(code.contains("<!--]-->"), "Should have BLOCK_CLOSE marker");
    }

    #[test]
    fn test_compile_await_block_server() {
        let source = r#"<script>
let promise = Promise.resolve(42);
</script>

{#await promise}
  <p>pending</p>
{:then value}
  <p>then {value}</p>
{:catch error}
  <p>error {error}</p>
{/await}"#;
        let options = CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        let code = &result.js.code;

        // Print for debugging
        println!("Generated await code:\n{}", code);

        // Should contain $.await call
        assert!(code.contains("$.await("), "Should have $.await call");
        // Should contain $$renderer in first argument
        assert!(
            code.contains("$$renderer,"),
            "Should have $$renderer parameter"
        );
        // Should contain the promise
        assert!(code.contains("promise"), "Should have promise parameter");
        // Should contain pending body with <p>pending</p>
        assert!(
            code.contains("<p>pending</p>"),
            "Should have pending content"
        );
        // Should contain then callback with value parameter
        assert!(
            code.contains("(value) =>"),
            "Should have then callback with value"
        );
        // Should contain then body content
        assert!(
            code.contains("then ${$.escape(value)}")
                || code.contains("<p>then ${$.escape(value)}</p>"),
            "Should have then content with escaped value"
        );
        // Should contain catch callback with error parameter
        assert!(
            code.contains("(error) =>"),
            "Should have catch callback with error"
        );
        // Should contain catch body content
        assert!(
            code.contains("error ${$.escape(error)}")
                || code.contains("<p>error ${$.escape(error)}</p>"),
            "Should have catch content with escaped error"
        );
        // Should contain BLOCK_CLOSE marker
        assert!(code.contains("<!--]-->"), "Should have BLOCK_CLOSE marker");
    }
}
