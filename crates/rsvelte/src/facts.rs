use std::ops::Range;

use rsvelte_core::toolchain as core;

/// A half-open UTF-8 byte range in source text.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub struct ByteRange {
    start: u32,
    end: u32,
}

impl ByteRange {
    /// Construct a valid half-open range, or return `None` when `end < start`.
    #[must_use]
    pub const fn new(start: u32, end: u32) -> Option<Self> {
        if start <= end {
            Some(Self { start, end })
        } else {
            None
        }
    }

    pub(crate) const fn from_core(range: core::ByteRange) -> Self {
        Self {
            start: range.start(),
            end: range.end(),
        }
    }

    pub(crate) fn from_clamped_usize(start: usize, end: usize, source_len: usize) -> Self {
        let start = start.min(source_len).min(u32::MAX as usize) as u32;
        let end = end.min(source_len).min(u32::MAX as usize) as u32;
        if start <= end {
            Self { start, end }
        } else {
            Self {
                start: end,
                end: start,
            }
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

    /// Convert to a range usable for indexing a source string.
    #[must_use]
    pub const fn as_usize_range(self) -> Range<usize> {
        self.start as usize..self.end as usize
    }
}

/// The role of a component script block.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ScriptKind {
    /// Instance script visible to the template.
    Instance,
    /// Module-context script.
    Module,
}

/// Source regions and language dialect for one script block.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ScriptRegion {
    /// Script role.
    pub kind: ScriptKind,
    /// Full script-tag range.
    pub tag: ByteRange,
    /// Script-content range.
    pub content: ByteRange,
    /// Whether the script declares a TypeScript language.
    pub typescript: bool,
}

/// Source regions for a component style block.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct StyleRegion {
    /// Full style-tag range.
    pub tag: ByteRange,
    /// Style-content range.
    pub content: ByteRange,
}

/// A syntactically declared component prop.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ComponentProp {
    /// Exported prop name.
    pub name: String,
    /// Local binding name.
    pub local_name: String,
    /// Source range of the declaration, when known.
    pub declaration: Option<ByteRange>,
    /// Whether the prop is bindable.
    pub bindable: bool,
}

/// A component export discovered during analysis.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ComponentExport {
    /// Exported name.
    pub name: String,
    /// Local binding name.
    pub local_name: String,
}

/// Immutable, cross-file-resolution-free component facts.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ComponentFacts {
    /// Whether analysis selected runes mode.
    pub runes: bool,
    /// Frozen CSS scope class, when the component has a style block.
    pub css_scope: Option<String>,
    /// Whether legacy `$$props` is referenced.
    pub uses_legacy_props: bool,
    /// Whether legacy `$$restProps` is referenced.
    pub uses_legacy_rest_props: bool,
    /// Whether legacy `$$slots` is referenced.
    pub uses_legacy_slots: bool,
    /// Whether the template contains render tags.
    pub uses_render_tags: bool,
    /// Whether the component contains component bindings.
    pub uses_component_bindings: bool,
    /// Script regions in source order.
    pub scripts: Vec<ScriptRegion>,
    /// Component style region.
    pub style: Option<StyleRegion>,
    /// Declared component props.
    pub props: Vec<ComponentProp>,
    /// Declared component exports.
    pub exports: Vec<ComponentExport>,
}

impl ComponentFacts {
    pub(crate) fn from_core(facts: &core::ComponentFacts) -> Self {
        Self {
            runes: facts.runes,
            css_scope: facts.css_scope_hash.clone(),
            uses_legacy_props: facts.uses_legacy_props,
            uses_legacy_rest_props: facts.uses_legacy_rest_props,
            uses_legacy_slots: facts.uses_legacy_slots,
            uses_render_tags: facts.uses_render_tags,
            uses_component_bindings: facts.uses_component_bindings,
            scripts: facts
                .scripts
                .iter()
                .map(|script| ScriptRegion {
                    kind: match script.kind {
                        core::ScriptKind::Instance => ScriptKind::Instance,
                        core::ScriptKind::Module => ScriptKind::Module,
                    },
                    tag: ByteRange::from_core(script.tag),
                    content: ByteRange::from_core(script.content),
                    typescript: script.typescript,
                })
                .collect(),
            style: facts.style.as_ref().map(|style| StyleRegion {
                tag: ByteRange::from_core(style.tag),
                content: ByteRange::from_core(style.content),
            }),
            props: facts
                .props
                .iter()
                .map(|prop| ComponentProp {
                    name: prop.name.clone(),
                    local_name: prop.local_name.clone(),
                    declaration: prop.declaration.map(ByteRange::from_core),
                    bindable: prop.bindable,
                })
                .collect(),
            exports: facts
                .exports
                .iter()
                .map(|export| ComponentExport {
                    name: export.name.clone(),
                    local_name: export.local_name.clone(),
                })
                .collect(),
        }
    }
}
