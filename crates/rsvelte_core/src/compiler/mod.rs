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
//! use rsvelte_core::{compile, CompileOptions, GenerateMode};
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

use crate::ast::arena::SerializeArenaGuard;

#[cfg(feature = "native")]
use rayon::prelude::*;

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
    /// Raw digest function (no `svelte-` prefix), matching the `hash` argument
    /// upstream hands to a user `cssHash` callback.
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
#[derive(Clone)]
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
    /// Enable source map generation.
    /// When false, sourcemap computation is skipped for better performance.
    /// Defaults to true for backward compatibility.
    pub enable_sourcemap: bool,
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
            enable_sourcemap: true,
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
            .field("enable_sourcemap", &self.enable_sourcemap)
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
    /// Filename of the source file.
    pub filename: Option<String>,
    /// Start position in the source.
    pub start: Option<Position>,
    /// End position in the source.
    pub end: Option<Position>,
    /// Source code frame showing the warning context.
    pub frame: Option<String>,
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

/// Resolve a warning/error byte `offset` to a [`Position`] (1-indexed line;
/// 0-indexed UTF-16 column; UTF-16 character offset — matching JavaScript's
/// string indexing) using a precomputed [`legacy::Utf8ToUtf16`] table.
///
/// Callers build one `table` per compile and reuse it across every warning, so
/// the whole warning list shares a single source scan instead of rescanning
/// from the start for each offset. An out-of-range or mid-codepoint `offset`
/// resolves to the nearest char boundary at or below it (the table maps every
/// byte of a multi-byte char to that char's start), so slicing never panics.
fn warning_position(table: &legacy::Utf8ToUtf16, offset: u32) -> Position {
    let (line, column, character) = table.position(offset as usize);
    Position {
        line,
        column,
        character,
    }
}

/// Generate a source code frame snippet for a warning/error.
/// Shows 2 lines of context before and after, with a caret pointing to the column.
/// Matches the official Svelte compiler's `locate_with_frame` output.
fn generate_frame(source: &str, start_pos: &Position, end_pos: Option<&Position>) -> String {
    // Match the official compiler's get_code_frame behavior:
    // - Uses start.line - 1 (0-indexed) for the target line
    // - Uses end.column for the caret position
    // - Converts tabs to 2 spaces
    // Use split('\n') to match JS behavior (includes trailing empty string after final newline)
    let lines: Vec<&str> = source.split('\n').collect();
    let line_idx = start_pos.line.saturating_sub(1);
    let frame_start = line_idx.saturating_sub(2);
    // Match JS: Math.min(line + 3, lines.length) — exclusive upper bound
    let frame_end = (line_idx + 3).min(lines.len());

    // Determine the column for the caret (official compiler uses end.column)
    let caret_column = end_pos.map_or(start_pos.column, |ep| ep.column);

    let digits = format!("{}", frame_end + 1).len();

    lines[frame_start..frame_end]
        .iter()
        .enumerate()
        .map(|(i, &line)| {
            let actual_line = frame_start + i;
            let line_num = actual_line + 1;
            let line_content = tabs_to_spaces(line);
            if actual_line == line_idx {
                let indicator = format!(
                    "{}^",
                    " ".repeat(digits + 2 + tabs_to_spaces_column(line, caret_column))
                );
                format!(
                    "{:>width$}: {}\n{}",
                    line_num,
                    line_content,
                    indicator,
                    width = digits
                )
            } else {
                format!("{:>width$}: {}", line_num, line_content, width = digits)
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}

/// Convert tabs to 2-space indentation (matching Svelte's tabs_to_spaces in compile_diagnostic.js)
fn tabs_to_spaces(s: &str) -> String {
    // Only replace leading tabs
    let leading_tabs = s.bytes().take_while(|&b| b == b'\t').count();
    if leading_tabs == 0 {
        return s.to_string();
    }
    format!("{}{}", "  ".repeat(leading_tabs), &s[leading_tabs..])
}

/// Convert a column position (in the original source) to the column position after
/// tabs-to-spaces conversion. Only leading tabs are converted.
fn tabs_to_spaces_column(line: &str, column: usize) -> usize {
    let leading_tabs = line.bytes().take_while(|&b| b == b'\t').count();
    if column <= leading_tabs {
        // Column is within the leading tabs region: each tab becomes 2 spaces
        column * 2
    } else {
        // Column is past the leading tabs: add the extra space per tab
        leading_tabs + column
    }
}

/// Parse phase shared by [`compile`] and [`compile_both`]: the fixed component
/// parse options plus [`phase1_parse::parse`](phases::phase1_parse::parse).
///
/// Returned to the caller so the `Root` is pinned on the caller's stack before
/// the arena guard is installed — the guard holds a raw pointer to `ast.arena`,
/// so the `Root` must not move after the guard is created.
fn parse_component(source: &str) -> Result<crate::ast::Root<'_>, CompileError> {
    let parse_options = crate::ParseOptions {
        modern: true,
        loose: false,
        skip_expression_loc: true,
        defer_script_parse: true,
        force_typescript: false,
        lenient_script: false,
        skip_non_css_lang_style: false,
        capture_comments: false,
    };
    // M5-A: caller-owned arena, unused for now (Root borrows only `source`).
    let alloc = oxc_allocator::Allocator::default();
    Ok(phases::phase1_parse::parse(source, &alloc, parse_options)?)
}

/// Front-half shared by [`compile`] and [`compile_both`], run under the caller's
/// arena guard: resolve lazy expressions, finish deferred script parsing, strip
/// TypeScript, merge `<svelte:options>` into `options`, and analyze.
///
/// Returns the merged options, the analysis, and whether runes mode is active.
/// The caller owns the arena guard so it spans the following transform pass(es).
fn prepare_and_analyze(
    ast: &mut crate::ast::Root,
    source: &str,
    mut options: CompileOptions,
) -> Result<(CompileOptions, ComponentAnalysis, bool), CompileError> {
    // Resolve lazy expressions (deferred template expressions). If any
    // expression has a parse error, return it immediately.
    if let Some(parse_err) =
        phases::phase1_parse::resolve_lazy::resolve_lazy_expressions(ast, source)
    {
        return Err(parse_err.into());
    }

    // Ensure deferred script parsing is completed before TypeScript removal.
    // When defer_script_parse is enabled, script content is stored as raw text;
    // parse it first so remove_typescript_nodes can inspect the AST.
    {
        let line_offsets = phases::phase1_parse::compute_line_offsets(source, false);
        if let Some(ref mut instance) = ast.instance
            && let Some(parse_err) = phases::phase1_parse::read::script::ensure_script_parsed(
                &ast.arena,
                instance,
                source,
                &line_offsets,
            )
        {
            return Err(parse_err.into());
        }
        if let Some(ref mut module) = ast.module
            && let Some(parse_err) = phases::phase1_parse::read::script::ensure_script_parsed(
                &ast.arena,
                module,
                source,
                &line_offsets,
            )
        {
            return Err(parse_err.into());
        }
    }

    // Remove TypeScript nodes from script content if TypeScript is detected.
    remove_typescript_from_ast(ast)?;

    // Merge parsed <svelte:options> into compile options.
    // Reference: svelte/packages/svelte/src/compiler/index.js
    //   const combined_options = { ...validated, ...parsed_options, customElementOptions };
    if let Some(ref parsed_options) = ast.options {
        if let Some(pw) = parsed_options.preserve_whitespace {
            options.preserve_whitespace = pw;
        }
        // Handle <svelte:options css="injected" /> — override compile options
        if parsed_options.css == Some(crate::ast::template::CssOption::Injected) {
            options.css = CssMode::Injected;
        }
    }

    // Phase 2: Analyze
    let analysis = phases::phase2_analyze::analyze_component(ast, source, &options)?;
    // Determine if runes mode was used
    let runes_mode = options.runes.unwrap_or(analysis.runes);
    Ok((options, analysis, runes_mode))
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
    let mut ast = parse_component(source)?;

    // Install the thread-local serialize arena via an RAII guard for the
    // entire resolve_lazy → strip_ts → analyze → transform pipeline.
    // The guard restores whatever pointer was set on entry when dropped
    // (including on `?` early-return and panic unwind), so concurrent
    // `compile()` calls reusing the same thread can't observe each
    // other's arenas — and nested `JsNode::to_value` fallbacks to
    // `DESER_ARENA` can't wipe the outer scope.
    //
    // SAFETY: `ast.arena` lives until the end of this function, which
    // outlives `_arena_guard`.
    let _arena_guard = unsafe { SerializeArenaGuard::new(&ast.arena as *const _) };

    // Front-half (resolve-lazy → strip-ts → options-merge → analyze), shared
    // with `compile_both` and run under the arena guard above.
    let (options, analysis, runes_mode) = prepare_and_analyze(&mut ast, source, options)?;

    // Phase 3: Transform (pass AST to avoid re-parsing)
    let transform_result =
        phases::phase3_transform::transform_component(&analysis, &ast, source, &options)?;

    Ok(finalize_compile_result(
        transform_result,
        &analysis,
        source,
        &options,
        runes_mode,
    ))
}

/// Compile a single component to **both** client (CSR) and server (SSR) output in
/// one call, sharing one parse + analyze pass between the two transforms.
///
/// This is the mold-linker P5 principle ("never reprocess data you already hold")
/// applied structurally. A dual-output build (e.g. Vite/SvelteKit SSR) otherwise
/// calls [`compile`] twice and re-parses + re-analyzes the same source each time —
/// and analyze alone is ~half of a compile. `analyze_component` is deterministic
/// and does not depend on `generate` mode, and `transform_component` borrows the
/// AST + analysis immutably, so running both transforms over a single shared
/// analysis yields byte-identical output to two separate [`compile`] calls while
/// doing the parse + analyze work only once.
///
/// `options.generate` is ignored; the returned tuple is `(client, server)`.
pub fn compile_both(
    source: &str,
    options: CompileOptions,
) -> Result<(CompileResult, CompileResult), CompileError> {
    // Phase 1: Parse (identical to `compile`).
    let mut ast = parse_component(source)?;

    // SAFETY: `ast.arena` lives until the end of this function (see `compile`).
    let _arena_guard = unsafe { SerializeArenaGuard::new(&ast.arena as *const _) };

    // Front-half (resolve-lazy → strip-ts → options-merge → analyze) — analyze
    // runs ONCE here and is shared by both transforms (it is mode-independent).
    let (options, analysis, runes_mode) = prepare_and_analyze(&mut ast, source, options)?;

    // Phase 3: Transform twice over the shared (ast, analysis).
    let mut client_options = options.clone();
    client_options.generate = GenerateMode::Client;
    let client_tr =
        phases::phase3_transform::transform_component(&analysis, &ast, source, &client_options)?;
    let client = finalize_compile_result(client_tr, &analysis, source, &client_options, runes_mode);

    let mut server_options = options;
    server_options.generate = GenerateMode::Server;
    let server_tr =
        phases::phase3_transform::transform_component(&analysis, &ast, source, &server_options)?;
    let server = finalize_compile_result(server_tr, &analysis, source, &server_options, runes_mode);

    Ok((client, server))
}

/// Build a [`CompileResult`] from a finished transform — accessors-deprecation
/// warning, source-position resolution, frame generation, and warning filtering.
/// Shared by [`compile`] and [`compile_both`] so the two paths are identical.
fn finalize_compile_result(
    mut transform_result: TransformResult,
    analysis: &ComponentAnalysis,
    source: &str,
    options: &CompileOptions,
    runes_mode: bool,
) -> CompileResult {
    // Emit options_deprecated_accessors warning when accessors option is used in runes mode.
    // Reference: svelte/packages/svelte/src/compiler/validate-options.js line 52
    if options.accessors && runes_mode {
        transform_result.warnings.insert(
            0,
            phases::phase3_transform::TransformWarning {
                code: "options_deprecated_accessors".to_string(),
                message: "The `accessors` option has been deprecated. It will have no effect in runes mode\nhttps://svelte.dev/e/options_deprecated_accessors".to_string(),
                start: None,
                end: None,
            },
        );
    }

    // Convert to CompileResult
    CompileResult {
        js: CompileOutput {
            code: transform_result.js,
            map: transform_result.js_map,
        },
        css: transform_result.css.map(|c| CssOutput {
            code: c.code,
            map: c.map,
            has_global: analysis.css.has_global,
        }),
        warnings: {
            // Pre-compute warning filename once (shared across all warnings)
            let warning_filename = options.filename.as_ref().map(|f| {
                // Only allocate if backslashes are present
                let f_owned;
                let f_normalized: &str = if f.contains('\\') {
                    f_owned = f.replace('\\', "/");
                    &f_owned
                } else {
                    f
                };
                if let Some(ref root) = options.root_dir {
                    let root_owned;
                    let root_normalized: &str = if root.contains('\\') {
                        root_owned = root.replace('\\', "/");
                        &root_owned
                    } else {
                        root
                    };
                    if let Some(stripped) = f_normalized.strip_prefix(root_normalized) {
                        return stripped.trim_start_matches('/').to_string();
                    }
                }
                f_normalized.to_string()
            });
            // Build the byte→UTF-16 position table once and share it across every
            // warning, instead of rescanning the source for each offset.
            let pos_table = legacy::Utf8ToUtf16::new(source);
            transform_result
                .warnings
                .into_iter()
                .map(|w| {
                    let start_pos = w.start.map(|offset| warning_position(&pos_table, offset));
                    let end_pos = w.end.map(|offset| warning_position(&pos_table, offset));
                    let frame = start_pos
                        .as_ref()
                        .map(|sp| generate_frame(source, sp, end_pos.as_ref()));
                    let url_suffix = format!("\nhttps://svelte.dev/e/{}", w.code);
                    let message_with_url = if w.message.contains(&url_suffix) {
                        w.message
                    } else {
                        format!("{}{}", w.message, url_suffix)
                    };
                    Warning {
                        code: w.code,
                        message: message_with_url,
                        filename: warning_filename.clone(),
                        start: start_pos,
                        end: end_pos,
                        frame,
                    }
                })
                // Apply the public `warning_filter` (keep the warning when the
                // filter returns true, or when no filter is set) — H-083.
                .filter(|w| {
                    options
                        .warning_filter
                        .as_ref()
                        .is_none_or(|filter| filter(w))
                })
                .collect()
        },
        metadata: CompileMetadata { runes: runes_mode },
        ast: None, // TODO: Return AST if options.modern_ast is true
    }
}

/// Module compile options (subset of CompileOptions for module files).
///
/// These correspond to Svelte's `ModuleCompileOptions` - the options that apply
/// to `.svelte.js` / `.svelte.ts` module files (not full Svelte components).
#[derive(Clone)]
pub struct ModuleCompileOptions {
    /// Enable development mode.
    pub dev: bool,
    /// The target generation mode (client or server).
    pub generate: GenerateMode,
    /// The filename of the module being compiled.
    pub filename: Option<String>,
    /// Root directory for relative path resolution.
    pub root_dir: Option<String>,
    /// Warning filter function.
    pub warning_filter: Option<WarningFilterFn>,
    /// Experimental options.
    pub experimental: ExperimentalOptions,
}

impl Default for ModuleCompileOptions {
    fn default() -> Self {
        Self {
            dev: false,
            generate: GenerateMode::Client,
            filename: None,
            root_dir: None,
            warning_filter: None,
            experimental: ExperimentalOptions::default(),
        }
    }
}

impl std::fmt::Debug for ModuleCompileOptions {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ModuleCompileOptions")
            .field("dev", &self.dev)
            .field("generate", &self.generate)
            .field("filename", &self.filename)
            .field("root_dir", &self.root_dir)
            .field("experimental", &self.experimental)
            .finish()
    }
}

/// Compile a Svelte module (`.svelte.js` or `.svelte.ts` file).
///
/// This function takes JavaScript/TypeScript source code containing runes and
/// compiles it into a JavaScript module. Unlike `compile()`, this does not
/// handle HTML templates or CSS - just JavaScript analysis and transformation.
///
/// Corresponds to `compileModule()` in the official Svelte compiler.
///
/// # Arguments
///
/// * `source` - The JavaScript/TypeScript source code
/// * `options` - Module compilation options
///
/// # Returns
///
/// Returns a `CompileResult` containing the generated JavaScript.
pub fn compile_module(
    source: &str,
    options: ModuleCompileOptions,
) -> Result<CompileResult, CompileError> {
    // Parse JS source into an AST using the same infrastructure as component scripts.
    // Upstream `compileModule` → `analyze_module` always parses with
    // `typescript: false` (2-analyze/index.js `parse(source, comments, false,
    // false)`), so TypeScript syntax in a module is a `js_parse_error` — even
    // for `.svelte.ts` filenames (callers like Vite strip TS first).
    // Pass empty line_offsets to skip loc object creation (not needed during compilation)
    let arena = crate::ast::arena::ParseArena::new();
    // RAII install of the serialize arena. We install it *twice* across
    // this function — once for the parse_program step here, then again
    // below after `arena` is moved into `ast` — because the second guard
    // refers to the moved arena. Each guard restores the prior pointer on
    // drop, so the outer scope's arena (if any) is preserved.
    //
    // SAFETY: `arena` lives until it is moved into `ast` below, which
    // outlives `_pre_move_guard`. The `?`/early-return paths only fire
    // after the program is built, so the guard always covers the parser.
    let program = {
        // SAFETY: `arena` outlives `_pre_move_guard` — it is moved into `ast` only after
        // the program is built, and the guard restores the prior pointer on drop.
        let _pre_move_guard = unsafe { SerializeArenaGuard::new(&arena as *const _) };
        let (program, parse_error) =
            phases::phase1_parse::read::expression::parse_program_with_error(
                &arena,
                phases::phase1_parse::read::expression::ProgramParseParams {
                    content: source,
                    offset: 0, // source is the entire file
                    line_offsets: &[],
                    is_typescript: false, // upstream analyze_module always parses plain JS
                    leading_comments: &[],
                    script_tag_start: 0,
                    script_tag_end: source.len(),
                },
            );

        // Mirror upstream acorn's throw-on-error behaviour (js_parse_error).
        if let Some(parse_err) = parse_error {
            return Err(parse_err.into());
        }

        program
    };

    // Build a synthetic Root AST that treats the JS source as a module script.
    // This allows us to reuse the entire component analysis infrastructure.
    let mut ast = crate::ast::template::Root {
        css: None,
        js: Vec::new(),
        start: 0,
        end: source.len() as u32,
        node_type: crate::ast::template::RootType::Root,
        fragment: crate::ast::template::Fragment {
            node_type: crate::ast::template::FragmentType::Fragment,
            nodes: Vec::new(),
            metadata: crate::ast::template::FragmentMetadata {
                transparent: false,
                dynamic: false,
            },
        },
        options: None,
        comments: Vec::new(),
        instance: None,
        module: Some(Box::new(crate::ast::template::Script {
            node_type: crate::ast::template::ScriptType::Script,
            start: 0,
            end: source.len() as u32,
            context: crate::ast::template::ScriptContext::Module,
            content: program,
            attributes: Vec::new(),
            raw_content: String::new(),
            content_offset: 0,
            is_typescript: false,
        })),
        parse_warnings: Vec::new(),
        source: None,
        arena,
    };

    // Convert ModuleCompileOptions to CompileOptions for the analysis phase.
    // Module files are always in runes mode.
    let compile_options = CompileOptions {
        dev: options.dev,
        generate: options.generate,
        filename: options.filename.clone(),
        root_dir: options.root_dir.clone(),
        warning_filter: options.warning_filter.clone(),
        experimental: options.experimental.clone(),
        runes: Some(true), // Modules are always in runes mode
        ..Default::default()
    };

    // Re-install the serialize arena pointer now that `arena` has been
    // moved into `ast.arena`. The RAII guard covers the rest of the
    // function and restores the previous pointer on drop / panic /
    // early-`?`, so we no longer need the manual `clear_serialize_arena`
    // sprinkled along each return path.
    //
    // SAFETY: `ast.arena` lives until the end of this function, which
    // outlives `_arena_guard`.
    let _arena_guard = unsafe { SerializeArenaGuard::new(&ast.arena as *const _) };

    // Phase 2: Analyze (reuses component analysis infrastructure)
    let analysis = phases::phase2_analyze::analyze_component(&mut ast, source, &compile_options)?;

    // Module-specific validation: check for store subscriptions.
    // In modules, $store references (where `store` is a binding) are invalid.
    // This corresponds to the check in `analyze_module()` in the official compiler:
    //   if (binding !== null && !is_rune(name)) {
    //     e.store_invalid_subscription_module(references[0].node);
    //   }
    check_module_store_subscriptions(&analysis)?;

    // Phase 3: Generate module output using the module-specific transform.
    // Unlike transform_component, this does NOT generate a component wrapper.
    // Modules are always plain JS (upstream `analyze_module` parses with
    // `typescript: false`; TS input is rejected above as `js_parse_error`),
    // so the transform operates on the raw source directly.
    let transform_result =
        phases::phase3_transform::transform_module(&analysis, source, &compile_options);

    // Propagate transform errors — the previous code swallowed every error,
    // emitting the raw source with a header comment instead, which silently
    // hid real compile failures from users. Component compilation uses `?`
    // for the same path. (issue #450, H-086)
    let js_code = transform_result?.js;

    Ok(CompileResult {
        js: CompileOutput {
            code: js_code,
            map: None,
        },
        css: None,
        warnings: {
            // One shared byte→UTF-16 position table for every module warning.
            let pos_table = legacy::Utf8ToUtf16::new(source);
            analysis
                .warnings
                .iter()
                .map(|w| {
                    let start_pos = w.start.map(|offset| warning_position(&pos_table, offset));
                    let end_pos = w.end.map(|offset| warning_position(&pos_table, offset));
                    let frame = start_pos
                        .as_ref()
                        .map(|sp| generate_frame(source, sp, end_pos.as_ref()));
                    let url_suffix = format!("\nhttps://svelte.dev/e/{}", w.code);
                    let message_with_url = if w.message.contains(&url_suffix) {
                        w.message.clone()
                    } else {
                        format!("{}{}", w.message, url_suffix)
                    };
                    Warning {
                        code: w.code.clone(),
                        message: message_with_url,
                        filename: options.filename.clone(),
                        start: start_pos,
                        end: end_pos,
                        frame,
                    }
                })
                // Apply the public `warning_filter` for module compilation too (H-083).
                .filter(|w| {
                    options
                        .warning_filter
                        .as_ref()
                        .is_none_or(|filter| filter(w))
                })
                .collect()
        },
        metadata: CompileMetadata { runes: true },
        ast: None,
    })
}

/// Check for invalid store subscriptions in a module context.
///
/// In module files, `$store` references (where `store` is a declared binding)
/// are not allowed because store subscriptions only work in `.svelte` files.
fn check_module_store_subscriptions(
    analysis: &phases::phase2_analyze::ComponentAnalysis,
) -> Result<(), CompileError> {
    // Check all bindings for StoreSub kind - these indicate $store references
    // that resolved to a declared store binding.
    // Corresponds to official Svelte's analyze_module():
    //   if (binding !== null && !is_rune(name)) {
    //     e.store_invalid_subscription_module(references[0].node);
    //   }
    for binding in &analysis.root.bindings {
        if matches!(binding.kind, phases::phase2_analyze::BindingKind::StoreSub) {
            // Skip rune-named store subs - in module context, rune names are always valid
            if phases::phase2_analyze::visitors::shared::function::is_rune(&binding.name) {
                continue;
            }
            return Err(CompileError::Analysis(
                phases::phase2_analyze::errors::store_invalid_subscription_module(),
            ));
        }
    }
    Ok(())
}

/// Remove TypeScript nodes from the parsed AST's script content.
///
/// This checks if any script block has `lang="ts"` or `lang="typescript"` attributes,
/// and if so, applies `remove_typescript_nodes` to strip type annotations.
/// This matches the official Svelte compiler behavior where TypeScript stripping
/// happens during compilation, not during parsing.
fn remove_typescript_from_ast(ast: &mut crate::ast::Root) -> Result<(), crate::error::ParseError> {
    use crate::ast::AttributeValue;
    use crate::ast::AttributeValuePart;

    fn is_typescript_script(script: &crate::ast::Script) -> bool {
        for attr in &script.attributes {
            if attr.name.as_str() == "lang"
                && let AttributeValue::Sequence(parts) = &attr.value
                && let Some(AttributeValuePart::Text(t)) = parts.first()
            {
                let lang = t.data.as_ref();
                return lang == "ts" || lang == "typescript";
            }
        }
        false
    }

    fn strip_ts_from_script(
        script: &mut crate::ast::Script,
    ) -> Result<(), crate::error::ParseError> {
        use crate::ast::js::Expression;
        match &mut script.content {
            // Typed path: mutate the arena-backed typed tree in place, keeping
            // the script `Expression::Typed` (no expensive `as_json()` round
            // trip). The serialize arena is installed by the caller's
            // `SerializeArenaGuard`, so it backs this Program's children.
            Expression::Typed(te) => crate::ast::arena::with_current_serialize_arena(|arena| {
                phases::phase1_parse::remove_typescript_nodes::remove_typescript_nodes_typed(
                    &mut te.node,
                    arena,
                )
            }),
            // Lazy expressions are resolved before strip_ts (the pipeline is
            // resolve_lazy -> strip_ts), so this is never reached.
            Expression::Lazy { .. } => {
                unreachable!("Expression::Lazy must be resolved before strip_ts")
            }
        }
    }

    // In Svelte, if ANY script has lang="ts", ALL scripts are treated as TypeScript.
    // This matches the official compiler behavior where the module script's lang attribute
    // propagates to the instance script.
    let any_is_typescript = ast
        .instance
        .as_ref()
        .is_some_and(|s| is_typescript_script(s))
        || ast.module.as_ref().is_some_and(|s| is_typescript_script(s));

    if any_is_typescript {
        if let Some(ref mut instance) = ast.instance {
            strip_ts_from_script(instance)?;
        }
        if let Some(ref mut module) = ast.module {
            strip_ts_from_script(module)?;
        }
        // Also strip TypeScript from the fragment (template expressions).
        // The official Svelte compiler calls remove_typescript_nodes on the entire fragment:
        // `fragment: parsed.fragment && remove_typescript_nodes(parsed.fragment)`
        strip_ts_from_fragment(&mut ast.fragment)?;
    }
    Ok(())
}

/// Strip TypeScript annotations from a single Expression.
fn strip_ts_from_expression(
    expr: &mut crate::ast::js::Expression,
) -> Result<(), crate::error::ParseError> {
    use crate::ast::js::Expression;
    match expr {
        // Typed path: mutate the arena-backed typed tree in place (no `as_json()`).
        Expression::Typed(te) => crate::ast::arena::with_current_serialize_arena(|arena| {
            phases::phase1_parse::remove_typescript_nodes::remove_typescript_nodes_typed(
                &mut te.node,
                arena,
            )
        }),
        // Lazy expressions are resolved before strip_ts, so this is never reached.
        Expression::Lazy { .. } => {
            unreachable!("Expression::Lazy must be resolved before strip_ts")
        }
    }
}

/// Strip TypeScript annotations from all Expression nodes in a Fragment.
fn strip_ts_from_fragment(
    fragment: &mut crate::ast::template::Fragment,
) -> Result<(), crate::error::ParseError> {
    for node in &mut fragment.nodes {
        strip_ts_from_template_node(node)?;
    }
    Ok(())
}

/// Strip TypeScript annotations from a TemplateNode and all its descendants.
fn strip_ts_from_template_node(
    node: &mut crate::ast::template::TemplateNode,
) -> Result<(), crate::error::ParseError> {
    use crate::ast::template::TemplateNode;
    match node {
        TemplateNode::Text(_) | TemplateNode::Comment(_) => {}
        TemplateNode::ExpressionTag(tag) => {
            strip_ts_from_expression(&mut tag.expression)?;
        }
        TemplateNode::HtmlTag(tag) => {
            strip_ts_from_expression(&mut tag.expression)?;
        }
        TemplateNode::ConstTag(tag) => {
            strip_ts_from_expression(&mut tag.declaration)?;
        }
        TemplateNode::DeclarationTag(tag) => {
            strip_ts_from_expression(&mut tag.declaration)?;
        }
        TemplateNode::DebugTag(tag) => {
            for expr in &mut tag.identifiers {
                strip_ts_from_expression(expr)?;
            }
        }
        TemplateNode::RenderTag(tag) => {
            strip_ts_from_expression(&mut tag.expression)?;
        }
        TemplateNode::AttachTag(tag) => {
            strip_ts_from_expression(&mut tag.expression)?;
        }
        TemplateNode::IfBlock(block) => {
            strip_ts_from_expression(&mut block.test)?;
            strip_ts_from_fragment(&mut block.consequent)?;
            if let Some(ref mut alt) = block.alternate {
                strip_ts_from_fragment(alt)?;
            }
        }
        TemplateNode::EachBlock(block) => {
            strip_ts_from_expression(&mut block.expression)?;
            if let Some(ref mut ctx) = block.context {
                strip_ts_from_expression(ctx)?;
            }
            if let Some(ref mut key) = block.key {
                strip_ts_from_expression(key)?;
            }
            strip_ts_from_fragment(&mut block.body)?;
            if let Some(ref mut fallback) = block.fallback {
                strip_ts_from_fragment(fallback)?;
            }
        }
        TemplateNode::AwaitBlock(block) => {
            strip_ts_from_expression(&mut block.expression)?;
            if let Some(ref mut val) = block.value {
                strip_ts_from_expression(val)?;
            }
            if let Some(ref mut err) = block.error {
                strip_ts_from_expression(err)?;
            }
            if let Some(ref mut pending) = block.pending {
                strip_ts_from_fragment(pending)?;
            }
            if let Some(ref mut then) = block.then {
                strip_ts_from_fragment(then)?;
            }
            if let Some(ref mut catch) = block.catch {
                strip_ts_from_fragment(catch)?;
            }
        }
        TemplateNode::KeyBlock(block) => {
            strip_ts_from_expression(&mut block.expression)?;
            strip_ts_from_fragment(&mut block.fragment)?;
        }
        TemplateNode::SnippetBlock(block) => {
            strip_ts_from_expression(&mut block.expression)?;
            for param in &mut block.parameters {
                strip_ts_from_expression(param)?;
            }
            strip_ts_from_fragment(&mut block.body)?;
        }
        TemplateNode::RegularElement(el) => {
            strip_ts_from_attributes(&mut el.attributes)?;
            strip_ts_from_fragment(&mut el.fragment)?;
        }
        TemplateNode::Component(el) => {
            strip_ts_from_attributes(&mut el.attributes)?;
            strip_ts_from_fragment(&mut el.fragment)?;
        }
        TemplateNode::TitleElement(el) => {
            strip_ts_from_attributes(&mut el.attributes)?;
            strip_ts_from_fragment(&mut el.fragment)?;
        }
        TemplateNode::SlotElement(el) => {
            strip_ts_from_attributes(&mut el.attributes)?;
            strip_ts_from_fragment(&mut el.fragment)?;
        }
        TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteSelf(el)
        | TemplateNode::SvelteWindow(el) => {
            strip_ts_from_attributes(&mut el.attributes)?;
            strip_ts_from_fragment(&mut el.fragment)?;
        }
        TemplateNode::SvelteComponent(el) => {
            strip_ts_from_expression(&mut el.expression)?;
            strip_ts_from_attributes(&mut el.attributes)?;
            strip_ts_from_fragment(&mut el.fragment)?;
        }
        TemplateNode::SvelteElement(el) => {
            strip_ts_from_expression(&mut el.tag)?;
            strip_ts_from_attributes(&mut el.attributes)?;
            strip_ts_from_fragment(&mut el.fragment)?;
        }
    }
    Ok(())
}

/// Strip TypeScript annotations from attribute expressions.
fn strip_ts_from_attributes(
    attrs: &mut [crate::ast::template::Attribute],
) -> Result<(), crate::error::ParseError> {
    use crate::ast::template::Attribute;
    for attr in attrs {
        match attr {
            Attribute::SpreadAttribute(spread) => {
                strip_ts_from_expression(&mut spread.expression)?;
            }
            Attribute::AttachTag(tag) => {
                strip_ts_from_expression(&mut tag.expression)?;
            }
            Attribute::BindDirective(bind) => {
                strip_ts_from_expression(&mut bind.expression)?;
            }
            Attribute::OnDirective(on) => {
                if let Some(ref mut expr) = on.expression {
                    strip_ts_from_expression(expr)?;
                }
            }
            Attribute::ClassDirective(class) => {
                strip_ts_from_expression(&mut class.expression)?;
            }
            Attribute::StyleDirective(style) => {
                strip_ts_from_attribute_value(&mut style.value)?;
            }
            Attribute::TransitionDirective(transition) => {
                if let Some(ref mut expr) = transition.expression {
                    strip_ts_from_expression(expr)?;
                }
            }
            Attribute::AnimateDirective(animate) => {
                if let Some(ref mut expr) = animate.expression {
                    strip_ts_from_expression(expr)?;
                }
            }
            Attribute::UseDirective(use_dir) => {
                if let Some(ref mut expr) = use_dir.expression {
                    strip_ts_from_expression(expr)?;
                }
            }
            Attribute::Attribute(attr_node) => {
                // AttributeNode values may contain expressions in their parts
                strip_ts_from_attribute_value(&mut attr_node.value)?;
            }
            Attribute::LetDirective(_) => {}
        }
    }
    Ok(())
}

/// Strip TypeScript from attribute values.
fn strip_ts_from_attribute_value(
    value: &mut crate::ast::AttributeValue,
) -> Result<(), crate::error::ParseError> {
    use crate::ast::AttributeValue;
    use crate::ast::AttributeValuePart;
    match value {
        AttributeValue::Expression(tag) => {
            strip_ts_from_expression(&mut tag.expression)?;
        }
        AttributeValue::Sequence(parts) => {
            for part in parts {
                if let AttributeValuePart::ExpressionTag(tag) = part {
                    strip_ts_from_expression(&mut tag.expression)?;
                }
            }
        }
        AttributeValue::True(_) => {}
    }
    Ok(())
}

/// Compile multiple Svelte components in parallel.
///
/// This function uses Rayon to compile multiple components concurrently,
/// taking advantage of multiple CPU cores for better performance.
///
/// # Arguments
///
/// * `inputs` - A slice of tuples containing (source, options) pairs
///
/// # Returns
///
/// A vector of `Result<CompileResult, CompileError>` in the same order as the inputs.
///
/// # Example
///
/// ```rust,ignore
/// use rsvelte_core::{compile_batch, CompileOptions, GenerateMode};
///
/// let sources = vec![
///     ("<h1>Hello</h1>", CompileOptions { generate: GenerateMode::Client, ..Default::default() }),
///     ("<p>World</p>", CompileOptions { generate: GenerateMode::Client, ..Default::default() }),
/// ];
///
/// let results = compile_batch(&sources);
/// for result in results {
///     match result {
///         Ok(output) => println!("{}", output.js.code),
///         Err(e) => eprintln!("Error: {:?}", e),
///     }
/// }
/// ```
#[cfg(feature = "native")]
pub fn compile_batch(
    inputs: &[(&str, CompileOptions)],
) -> Vec<Result<CompileResult, CompileError>> {
    inputs
        .par_iter()
        .map(|(source, options)| compile(source, options.clone()))
        .collect()
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
    fn test_warning_position_clamps_to_char_boundary() {
        // "é" is two UTF-8 bytes (0xC3 0xA9). An offset landing between them
        // must rewind to the boundary instead of panicking on the slice.
        let source = "aéb";
        let table = legacy::Utf8ToUtf16::new(source);
        let pos = warning_position(&table, 2);
        // Rewound to offset 1 ("a"): one UTF-16 unit consumed.
        assert_eq!(pos.character, 1);
        assert_eq!(pos.column, 1);
        assert_eq!(pos.line, 1);

        // Past-the-end offset clamps to the string length.
        let end = warning_position(&table, 999);
        assert_eq!(end.character, 3);
    }

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
        assert!(code.contains("<!--[0-->"), "Should have BLOCK_OPEN marker");
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
        assert!(code.contains("<!--[0-->"), "Should have BLOCK_OPEN marker");
        // Should contain BLOCK_OPEN_ELSE marker for else branch
        assert!(
            code.contains("<!--[-1-->"),
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

        // Following official Svelte compiler, else-if is rendered as nested if inside else block
        // Structure:
        // if (value === 1) { <!--[0--> ... } else { <!--[-1--> if (value === 2) { <!--[0--> ... } else { <!--[-1--> ... } <!--]--> } <!--]-->
        assert!(
            code.contains("if (value === 1)"),
            "Should have outer if statement"
        );
        assert!(
            code.contains("if (value === 2)"),
            "Should have nested if statement for else-if"
        );
        assert!(code.contains("else"), "Should have else branch");
        // Verify block markers
        assert!(code.contains("<!--[0-->"), "Should have BLOCK_OPEN markers");
        assert!(
            code.contains("<!--[-1-->"),
            "Should have BLOCK_OPEN_ELSE markers"
        );
        assert!(code.contains("<!--]-->"), "Should have BLOCK_CLOSE markers");
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

        // Verify structure
        assert!(code.contains("if (visible)"), "Should have if statement");
        assert!(code.contains("<!--[0-->"), "Should have BLOCK_OPEN marker");
        assert!(
            code.contains("<!--[-1-->"),
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

        // Should contain the expressions before if block
        assert!(
            code.contains("$.escape(first)"),
            "Should have first expression"
        );

        // Should contain the button
        assert!(code.contains("<button"), "Should have button");

        // Should contain if statement. `derivedSecond` is a `$derived(...)` binding,
        // which the SSR transform compiles to a callable: every read becomes
        // `derivedSecond()`. Originally this test asserted the bare identifier — it
        // started failing on main after #322 (SSR compiler upgrade) without the
        // assertion being updated to match the new derived-read shape.
        assert!(
            code.contains("if (first || derivedSecond())"),
            "Should have if statement with condition"
        );
        // Should contain BLOCK_OPEN marker
        assert!(code.contains("<!--[0-->"), "Should have BLOCK_OPEN marker");
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
        // NOTE: Official Svelte SSR does NOT include catch callback in $.await()
        // The SSR $.await() only takes (renderer, promise, pending_fn, then_fn) - no catch.
        // The :catch block is not rendered server-side.
        // Should contain BLOCK_CLOSE marker
        assert!(code.contains("<!--]-->"), "Should have BLOCK_CLOSE marker");
    }

    #[test]
    fn test_compile_bind_props_server() {
        // Test case for $.bind_props() generation with export const (Svelte 5/runes mode)
        let source = r#"<script>
export const message = "Hello";
</script>

<p>{message}</p>"#;
        let options = CompileOptions {
            generate: GenerateMode::Server,
            runes: Some(true),
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        let code = &result.js.code;

        // Should contain $.bind_props() call with message
        assert!(
            code.contains("$.bind_props("),
            "Should have $.bind_props call"
        );
        // Should contain $$props as first argument
        assert!(
            code.contains("$.bind_props($$props,"),
            "Should have $$props as first argument"
        );
        // Should contain message in the object
        assert!(
            code.contains("message") && code.contains("$.bind_props"),
            "Should have message in bind_props"
        );
    }

    #[test]
    fn test_compile_bind_props_with_function_exports_server() {
        // Test case for $.bind_props() generation with export function
        let source = r#"<script>
export function greet(name) {
    return "Hello " + name;
}
</script>

<p>{greet("World")}</p>"#;
        let options = CompileOptions {
            generate: GenerateMode::Server,
            runes: Some(true),
            ..Default::default()
        };
        let result = compile(source, options).unwrap();
        let code = &result.js.code;

        // Should contain $.bind_props() call
        assert!(
            code.contains("$.bind_props("),
            "Should have $.bind_props call"
        );
        // Should contain greet in the object
        assert!(
            code.contains("greet") && code.contains("$.bind_props"),
            "Should have greet in bind_props"
        );
    }

    #[test]
    fn test_server_module_jsdoc_not_mangled() {
        // Regression test for JSDoc block comments being mangled in server modules:
        // each line inside /** ... */ should NOT get a `;` appended, and the
        // newline after `*/` should NOT be consumed.
        //
        // IMPORTANT: the class must contain a `$state(…)` field so that
        // `transform_class_fields_server` actually runs (it short-circuits when
        // there are no rune fields).  The bug was only triggered on classes that
        // have at least one `$state`/`$derived` field alongside JSDoc comments.
        let source = r#"export class Foo {
  #fieldNode = $state(null);

  /**
   * Sets the field node.
   * Keep #fieldNode private.
   */
  setFieldNode(node) {
    this.#fieldNode = node;
  }
}"#;
        let options = ModuleCompileOptions {
            generate: GenerateMode::Server,
            dev: false,
            filename: Some("test.svelte.ts".to_string()),
            ..Default::default()
        };
        let result = compile_module(source, options).unwrap();
        let code = &result.js.code;
        // The JSDoc lines must NOT have ';' appended
        assert!(
            !code.contains("/**;"),
            "/**; found — block comment corrupted"
        );
        assert!(
            !code.contains(" * Sets the field node.;"),
            "comment line has ; appended"
        );
        // `*/` must be followed by a newline and then the method, not joined inline
        let lines: Vec<&str> = code.lines().collect();
        let star_close = lines.iter().position(|l| l.trim() == "*/");
        let set_field = lines
            .iter()
            .position(|l| l.trim().starts_with("setFieldNode("));
        assert!(
            star_close.is_some() && set_field.is_some(),
            "both */ and setFieldNode must appear in server output; got:\n{code}"
        );
        if let (Some(a), Some(b)) = (star_close, set_field) {
            assert_eq!(b, a + 1, "*/ and setFieldNode must be on consecutive lines");
        }
    }
}
