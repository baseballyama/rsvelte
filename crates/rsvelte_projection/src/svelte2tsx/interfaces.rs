//! Public option / result types for the svelte2tsx conversion.
//!
//! Mirrors `svelte2tsx/src/interfaces.ts` in the JS reference.

#![deny(missing_docs)]

use super::script::{ComponentEvents, ExportedNames};

/// The output mode for svelte2tsx.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Svelte2TsxMode {
    /// Full TypeScript output (for type checking `.svelte` files).
    #[default]
    Ts,
    /// Declaration output (for generating `.d.ts` files).
    Dts,
}

/// Namespace for elements (mirrors the compiler's Namespace).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Svelte2TsxNamespace {
    /// HTML element namespace.
    #[default]
    Html,
    /// SVG element namespace.
    Svg,
    /// MathML element namespace.
    Mathml,
}

/// Svelte version target.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SvelteVersion {
    /// Svelte 4 (legacy class-based component export).
    V4,
    /// Svelte 5 (runes, isomorphic component export).
    #[default]
    V5,
}

/// Options for the svelte2tsx conversion.
#[derive(Debug, Clone)]
pub struct Svelte2TsxOptions {
    /// The filename of the Svelte component (e.g., "App.svelte").
    pub filename: String,
    /// Whether the file uses TypeScript (`lang="ts"` on script tag).
    /// Auto-detected from filename if not set.
    pub is_ts_file: bool,
    /// Output mode: full TypeScript or declaration file.
    pub mode: Svelte2TsxMode,
    /// Whether to generate accessors for props.
    pub accessors: bool,
    /// The namespace for elements.
    pub namespace: Svelte2TsxNamespace,
    /// Svelte version target (affects component export format).
    pub version: SvelteVersion,
    /// Whether to use the new Svelte 5 runes mode.
    /// When None, auto-detected from source.
    pub runes: Option<bool>,
    /// Whether to emit JSDoc format for component export instead of TypeScript syntax.
    /// When true and not a TS file, uses `export const` + `/** @typedef */` format.
    pub emit_jsdoc: bool,
    /// When set, rewrites relative import specifiers that escape the workspace
    /// so they remain valid from the generated `.tsx` location. Mirrors
    /// `helpers/rewriteExternalImports.ts` in the JS reference.
    pub rewrite_external_imports: Option<RewriteExternalImportsOptions>,
}

/// Inputs for the optional external-import rewrite pass — mirrors the JS
/// reference's `RewriteExternalImportsOptions`.
#[derive(Debug, Clone)]
pub struct RewriteExternalImportsOptions {
    /// Absolute path of the `.svelte` source file we are converting.
    pub source_path: String,
    /// Absolute path the generated `.tsx` will live at.
    pub generated_path: String,
    /// Workspace root — `../` specifiers that resolve *inside* this directory
    /// stay unchanged.
    pub workspace_path: String,
}

impl Default for Svelte2TsxOptions {
    fn default() -> Self {
        Self {
            filename: "Input.svelte".to_string(),
            is_ts_file: false,
            mode: Svelte2TsxMode::Ts,
            accessors: false,
            namespace: Svelte2TsxNamespace::Html,
            version: SvelteVersion::V5,
            runes: None,
            emit_jsdoc: false,
            rewrite_external_imports: None,
        }
    }
}

/// The result of a svelte2tsx conversion.
#[derive(Debug, Clone)]
pub struct Svelte2TsxResult {
    /// The generated TypeScript/TSX code.
    pub code: String,
    /// Source map as JSON using final generated-text coordinates.
    pub map: Option<String>,
    /// Names exported from the component (for tooling integration).
    pub exported_names: ExportedNames,
    /// Events declared by the component.
    pub events: ComponentEvents,
    /// Forward-mapping segments `(original_start, original_end, generated_start)`
    /// for verbatim-copied (unedited) regions, in generated order. Lets a
    /// type-aware consumer map an original Svelte byte offset forward to the
    /// generated TSX offset for a `get_type_at_position` probe. See
    /// `MagicString::forward_segments` (crate-internal).
    /// External-import replacement text is excluded, while unchanged regions
    /// retain exact coordinates across the rewrite.
    pub forward_map: Vec<(u32, u32, u32)>,
}

impl Svelte2TsxResult {
    /// Map an original Svelte source byte offset forward to the generated TSX
    /// byte offset, using [`Self::forward_map`]. Returns `None` when the offset
    /// falls in synthesized output (no verbatim copy) or outside every segment.
    pub fn map_offset_forward(&self, original_offset: u32) -> Option<u32> {
        // Segments are in generated order, not sorted by original offset
        // (the emitter can move ranges), so a linear scan is required. The
        // count is small (one per verbatim chunk) and lookups are few.
        for &(o_start, o_end, g_start) in &self.forward_map {
            if original_offset >= o_start && original_offset < o_end {
                return Some(g_start + (original_offset - o_start));
            }
        }
        None
    }
}
