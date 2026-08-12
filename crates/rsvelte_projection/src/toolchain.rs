#![deny(missing_docs)]

use std::ops::Range;

use crate::svelte2tsx::{Svelte2TsxError, Svelte2TsxOptions, svelte2tsx};

/// Version of the normalized IDE projection artifact contract.
pub const PROJECTION_SCHEMA_VERSION: u32 = 1;

/// A half-open UTF-8 byte range in source or generated text.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub struct ByteRange {
    start: u32,
    end: u32,
}

impl ByteRange {
    /// Construct a byte range. Returns `None` for inverted bounds.
    #[must_use]
    pub const fn new(start: u32, end: u32) -> Option<Self> {
        if start <= end {
            Some(Self { start, end })
        } else {
            None
        }
    }

    /// Start byte offset.
    #[must_use]
    pub const fn start(self) -> u32 {
        self.start
    }

    /// Exclusive end byte offset.
    #[must_use]
    pub const fn end(self) -> u32 {
        self.end
    }

    /// Range length in bytes.
    #[must_use]
    pub const fn len(self) -> u32 {
        self.end - self.start
    }

    /// Whether the range contains no bytes.
    #[must_use]
    pub const fn is_empty(self) -> bool {
        self.start == self.end
    }

    /// Whether the range contains `offset`.
    #[must_use]
    pub const fn contains(self, offset: u32) -> bool {
        offset >= self.start && offset < self.end
    }

    /// Whether the range fully contains `range`.
    #[must_use]
    pub const fn contains_range(self, range: Self) -> bool {
        range.start >= self.start && range.end <= self.end
    }

    /// Convert to a range usable for source-text indexing.
    #[must_use]
    pub const fn as_usize_range(self) -> Range<usize> {
        self.start as usize..self.end as usize
    }

    const fn trusted(start: u32, end: u32) -> Self {
        Self { start, end }
    }
}

/// One byte-exact, length-preserving mapping segment.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct ExactMapping {
    /// Range in the original Svelte source.
    pub source: ByteRange,
    /// Equal-length range in generated TypeScript.
    pub generated: ByteRange,
}

/// Byte-exact mappings for verbatim chunks in an IDE projection.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ProjectionMap {
    segments: Vec<ExactMapping>,
}

impl ProjectionMap {
    fn from_segments(segments: Vec<ExactMapping>) -> Self {
        debug_assert!(
            segments
                .iter()
                .all(|segment| segment.source.len() == segment.generated.len())
        );
        Self { segments }
    }

    /// Return all exact mapping segments.
    #[must_use]
    pub fn segments(&self) -> &[ExactMapping] {
        &self.segments
    }

    /// Return every generated offset exactly corresponding to `offset`.
    #[must_use]
    pub fn source_to_generated(&self, offset: u32) -> Vec<u32> {
        self.segments
            .iter()
            .filter(|segment| segment.source.contains(offset))
            .map(|segment| segment.generated.start + offset - segment.source.start)
            .collect()
    }

    /// Return the source offset exactly corresponding to `offset`.
    #[must_use]
    pub fn generated_to_source(&self, offset: u32) -> Option<u32> {
        self.segments
            .iter()
            .find(|segment| segment.generated.contains(offset))
            .map(|segment| segment.source.start + offset - segment.generated.start)
    }

    /// Return every generated range exactly corresponding to `range`.
    #[must_use]
    pub fn source_range_to_generated(&self, range: ByteRange) -> Vec<ByteRange> {
        self.segments
            .iter()
            .filter(|segment| segment.source.contains_range(range))
            .map(|segment| {
                let start = segment.generated.start + range.start - segment.source.start;
                ByteRange::trusted(start, start + range.len())
            })
            .collect()
    }

    /// Return the source range exactly corresponding to `range`.
    #[must_use]
    pub fn generated_range_to_source(&self, range: ByteRange) -> Option<ByteRange> {
        self.segments
            .iter()
            .find(|segment| segment.generated.contains_range(range))
            .map(|segment| {
                let start = segment.source.start + range.start - segment.generated.start;
                ByteRange::trusted(start, start + range.len())
            })
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
    /// Source-level TypeScript annotation, when present.
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
    /// Source-level TypeScript annotation, when present.
    pub type_annotation: Option<String>,
}

/// Immutable syntactic facts collected while projecting a component.
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

/// Generated IDE code, source maps, exact mappings, and normalized facts.
#[non_exhaustive]
#[derive(Debug, Clone)]
pub struct ProjectionArtifact {
    /// Generated TypeScript/TSX source.
    pub code: String,
    /// Standard JSON source map using final generated-text coordinates.
    pub source_map: Option<String>,
    /// Exact mappings for unchanged generated regions.
    ///
    /// External-import replacement text is intentionally unmapped, while
    /// unchanged regions before and after each replacement remain exact.
    pub exact_mappings: Option<ProjectionMap>,
    /// Compiler-neutral projection facts.
    pub facts: ProjectionFacts,
}

/// Stateless entry point for IDE projection.
#[derive(Debug, Default)]
pub struct ProjectionEngine;

impl ProjectionEngine {
    /// Construct a projection engine.
    #[must_use]
    pub const fn new() -> Self {
        Self
    }

    /// Project one Svelte component to TypeScript/TSX.
    pub fn project(
        &self,
        source: &str,
        options: Svelte2TsxOptions,
    ) -> Result<ProjectionArtifact, Svelte2TsxError> {
        let result = svelte2tsx(source, options)?;
        let bindable_props = &result.exported_names.bindable_props;
        let mut props = Vec::new();
        let mut exports = Vec::new();
        for name in result.exported_names.get_all_names() {
            let Some(info) = result.exported_names.get(name) else {
                continue;
            };
            if info.is_prop() {
                props.push(ProjectionProp {
                    name: name.to_string(),
                    local_name: info.local_name.clone(),
                    optional: info.has_default(),
                    bindable: bindable_props.iter().any(|bindable| bindable == name),
                    type_annotation: info.type_annotation.clone(),
                });
            }
            if (!info.is_prop() || info.is_named_export())
                && (!info.is_let()
                    || (result.exported_names.is_runes_mode() && info.is_named_export()))
            {
                exports.push(ProjectionExport {
                    name: name.to_string(),
                    local_name: info.local_name.clone(),
                    type_annotation: info.type_annotation.clone(),
                });
            }
        }
        let facts = ProjectionFacts {
            runes: result.exported_names.is_runes_mode(),
            props,
            exports,
            events: result
                .events
                .get_event_names()
                .into_iter()
                .map(str::to_string)
                .collect(),
        };
        let exact_mappings = Some(ProjectionMap::from_segments(
            result
                .forward_map
                .iter()
                .map(
                    |&(source_start, source_end, generated_start)| ExactMapping {
                        source: ByteRange::trusted(source_start, source_end),
                        generated: ByteRange::trusted(
                            generated_start,
                            generated_start + source_end - source_start,
                        ),
                    },
                )
                .collect(),
        ));

        Ok(ProjectionArtifact {
            code: result.code,
            source_map: result.map,
            exact_mappings,
            facts,
        })
    }
}
