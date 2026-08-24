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
    /// `MathML` element namespace.
    Mathml,
    /// Foreign (non-HTML/SVG/MathML) namespace: attribute names keep their
    /// source casing instead of being folded to match the intrinsic typings.
    Foreign,
}

impl Svelte2TsxNamespace {
    /// Whether element attribute names keep their source casing. Mirrors
    /// `htmlxtojsx_v2/index.ts`'s `options.namespace === 'foreign'`.
    pub(crate) const fn preserves_attribute_case(self) -> bool {
        matches!(self, Self::Foreign)
    }
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
    ///
    /// Empty means the caller supplied none, in which case the component is
    /// named `$$Component` — mirrors `options.filename || ''` upstream.
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
    /// Whether to emit `JSDoc` format for component export instead of TypeScript syntax.
    /// When true and not a TS file, uses `export const` + `/** @typedef */` format.
    pub emit_jsdoc: bool,
    /// The JSX typings namespace the generated `createElement` /
    /// `mapElementTag` calls are qualified with. Mirrors upstream's
    /// `options.typingsNamespace || 'svelteHTML'`.
    pub typings_namespace: String,
    /// Import `SvelteComponent` instead of `SvelteComponentTyped` in the
    /// class-component shapes (Svelte 3 backwards compatibility).
    pub no_svelte_component_typed: bool,
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

impl Svelte2TsxOptions {
    /// Whether an element's `bind:` prefix survives into the emitted property
    /// name. Mirrors upstream's `preserveBind = typingsNamespace ===
    /// 'svelteHTML'` — a custom typings namespace expects plain prop names.
    #[must_use]
    pub fn preserves_bind_prefix(&self) -> bool {
        self.typings_namespace == DEFAULT_TYPINGS_NAMESPACE
    }

    /// Build options from the JavaScript `svelte2tsx(source, options)` object.
    ///
    /// Shared by every binding (NAPI, wasm) so the JS-visible option contract
    /// has exactly one implementation. An absent key takes the JS reference's
    /// fallback, which is not always [`Default::default`] — an absent
    /// `filename` stays empty rather than being invented, because upstream
    /// derives the component name from `options.filename || ''`.
    #[must_use]
    pub fn from_json(options: &serde_json::Value) -> Self {
        let mut opts = Self {
            filename: String::new(),
            ..Self::default()
        };

        let Some(obj) = options.as_object() else {
            return opts;
        };

        if let Some(v) = obj.get("filename").and_then(serde_json::Value::as_str) {
            opts.filename = v.to_string();
        }

        if let Some(v) = obj.get("isTsFile").and_then(serde_json::Value::as_bool) {
            opts.is_ts_file = v;
        }

        if let Some(v) = obj.get("mode").and_then(serde_json::Value::as_str) {
            opts.mode = match v {
                "dts" => Svelte2TsxMode::Dts,
                _ => Svelte2TsxMode::Ts,
            };
        }

        if let Some(v) = obj.get("accessors").and_then(serde_json::Value::as_bool) {
            opts.accessors = v;
        }

        if let Some(v) = obj.get("namespace").and_then(serde_json::Value::as_str) {
            opts.namespace = match v {
                "svg" => Svelte2TsxNamespace::Svg,
                "mathml" => Svelte2TsxNamespace::Mathml,
                "foreign" => Svelte2TsxNamespace::Foreign,
                _ => Svelte2TsxNamespace::Html,
            };
        }

        if let Some(v) = obj.get("version").and_then(serde_json::Value::as_str) {
            opts.version = if v.starts_with('5') {
                SvelteVersion::V5
            } else {
                SvelteVersion::V4
            };
        }

        if let Some(v) = obj
            .get("typingsNamespace")
            .and_then(serde_json::Value::as_str)
        {
            opts.typings_namespace = v.to_string();
        }

        if let Some(v) = obj.get("emitJsDoc").and_then(serde_json::Value::as_bool) {
            opts.emit_jsdoc = v;
        }

        if let Some(v) = obj
            .get("noSvelteComponentTyped")
            .and_then(serde_json::Value::as_bool)
        {
            opts.no_svelte_component_typed = v;
        }

        opts
    }
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
            typings_namespace: DEFAULT_TYPINGS_NAMESPACE.to_string(),
            no_svelte_component_typed: false,
            rewrite_external_imports: None,
        }
    }
}

/// The JSX typings namespace upstream falls back to when the caller passes none.
pub const DEFAULT_TYPINGS_NAMESPACE: &str = "svelteHTML";

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
    #[must_use]
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
