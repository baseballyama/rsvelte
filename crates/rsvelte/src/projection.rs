use std::fmt;

use rsvelte_projection::{
    ProjectionArtifact as RawProjectionArtifact, ProjectionMap as RawProjectionMap,
    svelte2tsx::{
        RewriteExternalImportsOptions, Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions,
    },
};

use crate::{
    ByteRange, Diagnostic, DiagnosticSeverity,
    options::{OptionsCacheKey, push_cache_field},
};

/// TypeScript projection output mode.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub enum ProjectionMode {
    /// Full TypeScript suitable for type checking.
    #[default]
    TypeScript,
    /// Declaration-oriented output.
    Declaration,
}

/// Element namespace used by the projected component.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub enum MarkupNamespace {
    /// HTML namespace, used by ordinary Svelte components.
    #[default]
    Html,
    /// SVG namespace.
    Svg,
    /// MathML namespace.
    Mathml,
}

#[derive(Debug, Clone)]
struct ExternalImportRewrite {
    source_path: String,
    generated_path: String,
    workspace_path: String,
}

/// Options for projecting one component to TypeScript/TSX.
///
/// Fields are private so new language-tools options can be added without
/// making downstream struct literals a compatibility constraint.
#[derive(Debug, Clone)]
pub struct ProjectionOptions {
    filename: String,
    typescript: bool,
    mode: ProjectionMode,
    accessors: bool,
    namespace: MarkupNamespace,
    runes: Option<bool>,
    emit_jsdoc: bool,
    rewrite_external_imports: Option<ExternalImportRewrite>,
}

impl ProjectionOptions {
    /// Create projection options using language-tools-compatible defaults.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Set the source filename embedded in generated code and source maps.
    #[must_use]
    pub fn filename(mut self, filename: impl Into<String>) -> Self {
        self.filename = filename.into();
        self
    }

    /// Treat the component's instance script as TypeScript.
    ///
    /// Set this when the source uses `<script lang="ts">`.
    #[must_use]
    pub fn typescript(mut self, enabled: bool) -> Self {
        self.typescript = enabled;
        self
    }

    /// Select full type-checking or declaration-oriented output.
    #[must_use]
    pub fn mode(mut self, mode: ProjectionMode) -> Self {
        self.mode = mode;
        self
    }

    /// Include component accessor declarations in the projection.
    #[must_use]
    pub fn accessors(mut self, enabled: bool) -> Self {
        self.accessors = enabled;
        self
    }

    /// Set the component's markup namespace.
    #[must_use]
    pub fn namespace(mut self, namespace: MarkupNamespace) -> Self {
        self.namespace = namespace;
        self
    }

    /// Force runes mode on, off, or leave it source-detected.
    #[must_use]
    pub fn runes(mut self, enabled: Option<bool>) -> Self {
        self.runes = enabled;
        self
    }

    /// Include generated JSDoc where supported by the projection.
    #[must_use]
    pub fn emit_jsdoc(mut self, enabled: bool) -> Self {
        self.emit_jsdoc = enabled;
        self
    }

    /// Rewrite relative imports that escape a generated-file workspace.
    #[must_use]
    pub fn rewrite_external_imports(
        mut self,
        source_path: impl Into<String>,
        generated_path: impl Into<String>,
        workspace_path: impl Into<String>,
    ) -> Self {
        self.rewrite_external_imports = Some(ExternalImportRewrite {
            source_path: source_path.into(),
            generated_path: generated_path.into(),
            workspace_path: workspace_path.into(),
        });
        self
    }

    /// Return a stable identity covering every projection option.
    ///
    /// This key does not include source contents or engine versions. Include
    /// those separately when constructing a persistent artifact-cache key.
    #[must_use]
    pub fn cache_key(&self) -> OptionsCacheKey {
        let mut encoded = "rsvelte-projection-options:v1|".to_string();
        push_cache_field(&mut encoded, "filename", Some(&self.filename));
        push_cache_field(
            &mut encoded,
            "typescript",
            Some(if self.typescript { "1" } else { "0" }),
        );
        push_cache_field(
            &mut encoded,
            "mode",
            Some(match self.mode {
                ProjectionMode::TypeScript => "typescript",
                ProjectionMode::Declaration => "declaration",
            }),
        );
        push_cache_field(
            &mut encoded,
            "accessors",
            Some(if self.accessors { "1" } else { "0" }),
        );
        push_cache_field(
            &mut encoded,
            "namespace",
            Some(match self.namespace {
                MarkupNamespace::Html => "html",
                MarkupNamespace::Svg => "svg",
                MarkupNamespace::Mathml => "mathml",
            }),
        );
        push_cache_field(
            &mut encoded,
            "runes",
            Some(match self.runes {
                None => "auto",
                Some(false) => "false",
                Some(true) => "true",
            }),
        );
        push_cache_field(
            &mut encoded,
            "emit_jsdoc",
            Some(if self.emit_jsdoc { "1" } else { "0" }),
        );
        if let Some(rewrite) = &self.rewrite_external_imports {
            push_cache_field(
                &mut encoded,
                "rewrite_source_path",
                Some(&rewrite.source_path),
            );
            push_cache_field(
                &mut encoded,
                "rewrite_generated_path",
                Some(&rewrite.generated_path),
            );
            push_cache_field(
                &mut encoded,
                "rewrite_workspace_path",
                Some(&rewrite.workspace_path),
            );
        } else {
            push_cache_field(&mut encoded, "rewrite_source_path", None);
            push_cache_field(&mut encoded, "rewrite_generated_path", None);
            push_cache_field(&mut encoded, "rewrite_workspace_path", None);
        }
        OptionsCacheKey::from_encoded(encoded)
    }

    pub(crate) fn source_filename(&self) -> String {
        self.filename.clone()
    }

    pub(crate) fn into_projection(self) -> Svelte2TsxOptions {
        Svelte2TsxOptions {
            filename: self.filename,
            is_ts_file: self.typescript,
            mode: match self.mode {
                ProjectionMode::TypeScript => Svelte2TsxMode::Ts,
                ProjectionMode::Declaration => Svelte2TsxMode::Dts,
            },
            accessors: self.accessors,
            namespace: match self.namespace {
                MarkupNamespace::Html => Svelte2TsxNamespace::Html,
                MarkupNamespace::Svg => Svelte2TsxNamespace::Svg,
                MarkupNamespace::Mathml => Svelte2TsxNamespace::Mathml,
            },
            version: rsvelte_projection::SvelteVersion::V5,
            runes: self.runes,
            emit_jsdoc: self.emit_jsdoc,
            rewrite_external_imports: self.rewrite_external_imports.map(|rewrite| {
                RewriteExternalImportsOptions {
                    source_path: rewrite.source_path,
                    generated_path: rewrite.generated_path,
                    workspace_path: rewrite.workspace_path,
                }
            }),
        }
    }
}

impl Default for ProjectionOptions {
    fn default() -> Self {
        Self {
            filename: "Input.svelte".to_string(),
            typescript: false,
            mode: ProjectionMode::TypeScript,
            accessors: false,
            namespace: MarkupNamespace::Html,
            runes: None,
            emit_jsdoc: false,
            rewrite_external_imports: None,
        }
    }
}

/// A normalized component prop discovered by projection.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectionProp {
    /// Public component prop name.
    pub name: String,
    /// Local script binding name.
    pub local_name: String,
    /// Whether callers may omit the prop.
    pub optional: bool,
    /// Whether consumers may bind to the prop.
    pub bindable: bool,
    /// Source-level TypeScript annotation, when one was declared.
    pub type_annotation: Option<String>,
}

/// A normalized named export discovered by projection.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectionExport {
    /// Public export name.
    pub name: String,
    /// Local script binding name.
    pub local_name: String,
    /// Source-level TypeScript annotation, when one was declared.
    pub type_annotation: Option<String>,
}

/// Immutable facts collected while projecting a component.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectionFacts {
    /// Whether projection selected runes mode.
    pub runes: bool,
    /// Component props in discovery order.
    pub props: Vec<ProjectionProp>,
    /// Named component exports in discovery order.
    pub exports: Vec<ProjectionExport>,
    /// Dispatched event names in discovery order.
    pub events: Vec<String>,
}

/// One byte-exact, length-preserving source mapping.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct ExactProjectionMapping {
    /// Half-open UTF-8 byte range in the Svelte source.
    pub source: ByteRange,
    /// Equal-length byte range in generated code.
    pub generated: ByteRange,
}

/// Exact mappings for verbatim source chunks.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ProjectionMap {
    segments: Vec<ExactProjectionMapping>,
}

impl ProjectionMap {
    fn from_projection(map: RawProjectionMap) -> Self {
        Self {
            segments: map
                .segments()
                .iter()
                .map(|segment| ExactProjectionMapping {
                    source: ByteRange::new(segment.source.start(), segment.source.end())
                        .expect("projection source mapping is ordered"),
                    generated: ByteRange::new(segment.generated.start(), segment.generated.end())
                        .expect("projection generated mapping is ordered"),
                })
                .collect(),
        }
    }

    /// Return all byte-exact mapping segments.
    #[must_use]
    pub fn segments(&self) -> &[ExactProjectionMapping] {
        &self.segments
    }

    /// Return every generated offset corresponding exactly to `offset`.
    ///
    /// A source chunk can occur more than once in generated output.
    #[must_use]
    pub fn source_to_generated(&self, offset: u32) -> Vec<u32> {
        self.segments
            .iter()
            .filter(|segment| offset >= segment.source.start() && offset < segment.source.end())
            .map(|segment| segment.generated.start() + offset - segment.source.start())
            .collect()
    }

    /// Return the source offset corresponding exactly to `offset`.
    #[must_use]
    pub fn generated_to_source(&self, offset: u32) -> Option<u32> {
        self.segments
            .iter()
            .find(|segment| offset >= segment.generated.start() && offset < segment.generated.end())
            .map(|segment| segment.source.start() + offset - segment.generated.start())
    }

    /// Return every generated range exactly corresponding to `range`.
    ///
    /// The range must be fully contained by one exact mapping segment.
    #[must_use]
    pub fn source_range_to_generated(&self, range: ByteRange) -> Vec<ByteRange> {
        self.segments
            .iter()
            .filter(|segment| {
                range.start() >= segment.source.start() && range.end() <= segment.source.end()
            })
            .map(|segment| {
                let start = segment.generated.start() + range.start() - segment.source.start();
                ByteRange::new(start, start + range.len())
                    .expect("projection mapping preserves range order")
            })
            .collect()
    }

    /// Return the source range exactly corresponding to `range`.
    ///
    /// The range must be fully contained by one exact mapping segment.
    #[must_use]
    pub fn generated_range_to_source(&self, range: ByteRange) -> Option<ByteRange> {
        self.segments
            .iter()
            .find(|segment| {
                range.start() >= segment.generated.start() && range.end() <= segment.generated.end()
            })
            .map(|segment| {
                let start = segment.source.start() + range.start() - segment.generated.start();
                ByteRange::new(start, start + range.len())
                    .expect("projection mapping preserves range order")
            })
    }
}

/// Generated TypeScript/TSX, source maps, exact mappings, and normalized facts.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectionArtifact {
    /// Generated TypeScript/TSX code.
    pub code: String,
    /// JSON source map, when generated.
    pub source_map: Option<String>,
    /// Byte-exact mappings for unchanged generated regions.
    ///
    /// Import-rewrite replacement text is unmapped, while surrounding source
    /// chunks retain exact coordinates.
    pub exact_mappings: Option<ProjectionMap>,
    /// Compiler-neutral facts collected by projection.
    pub facts: ProjectionFacts,
}

impl ProjectionArtifact {
    pub(crate) fn from_projection(raw: RawProjectionArtifact) -> Self {
        Self {
            code: raw.code,
            source_map: raw.source_map,
            exact_mappings: raw.exact_mappings.map(ProjectionMap::from_projection),
            facts: ProjectionFacts {
                runes: raw.facts.runes,
                props: raw
                    .facts
                    .props
                    .into_iter()
                    .map(|prop| ProjectionProp {
                        name: prop.name,
                        local_name: prop.local_name,
                        optional: prop.optional,
                        bindable: prop.bindable,
                        type_annotation: prop.type_annotation,
                    })
                    .collect(),
                exports: raw
                    .facts
                    .exports
                    .into_iter()
                    .map(|export| ProjectionExport {
                        name: export.name,
                        local_name: export.local_name,
                        type_annotation: export.type_annotation,
                    })
                    .collect(),
                events: raw.facts.events,
            },
        }
    }
}

/// Projection failure with no parser or compiler implementation types.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectionFailure {
    /// Failure diagnostic using the same neutral shape as runtime compilation.
    pub diagnostic: Diagnostic,
}

impl ProjectionFailure {
    pub(crate) fn from_projection(
        error: &rsvelte_projection::Svelte2TsxError,
        source: &str,
        filename: String,
    ) -> Self {
        Self {
            diagnostic: Diagnostic {
                severity: DiagnosticSeverity::Error,
                code: error.code().to_string(),
                message: error.to_string(),
                filename: Some(filename),
                span: error
                    .span()
                    .map(|(start, end)| ByteRange::from_clamped_usize(start, end, source.len())),
            },
        }
    }
}

impl fmt::Display for ProjectionFailure {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.diagnostic.message)
    }
}

impl std::error::Error for ProjectionFailure {}
