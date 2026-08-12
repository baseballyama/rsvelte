//! Low-level, in-process runtime compilation building blocks.
//!
//! The facade owns no filesystem, cache, scheduler, or thread pool. Embedders
//! keep those policies and cache the returned immutable DTOs themselves.

#![deny(missing_docs)]

use std::{cell::OnceCell, ops::Range};

use serde_json::Value;

use crate::{
    CompileError, CompileOptions, CompileResult, GenerateMode,
    ast::{AttributeValue, AttributeValuePart, Root, ScriptContext, oxc_program::RetainedScripts},
    compiler::{
        ComponentAnalysis,
        phases::{phase2_analyze::BindingKind, phase3_transform::transform_component_with_scripts},
    },
};

/// Version of the low-level toolchain DTO contract.
pub const TOOLCHAIN_SCHEMA_VERSION: u32 = 1;
/// Version of the reusable runtime preparation contract.
pub const RUNTIME_SCHEMA_VERSION: u32 = 1;

pub(crate) fn source_pos(value: usize) -> u32 {
    u32::try_from(value).expect("source positions are limited to u32")
}
/// Version of the normalized facts contract.
pub const FACTS_SCHEMA_VERSION: u32 = 2;

const SVELTE_VERSION: &str = match option_env!("SVELTE_VERSION") {
    Some(version) => version,
    None => "unknown",
};

/// Versions that participate in an embedder's cache namespace.
///
/// This does not fingerprint source or options. In particular, function-valued
/// compile options require caller-owned stable identities to be cacheable.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct EngineFingerprint {
    /// rsvelte crate version.
    pub rsvelte_version: &'static str,
    /// Svelte reference version compiled into rsvelte.
    pub svelte_version: &'static str,
    /// Low-level toolchain schema version.
    pub toolchain_schema: u32,
    /// Runtime preparation and generation schema version.
    pub runtime_schema: u32,
    /// Normalized facts schema version.
    pub facts_schema: u32,
}

/// A half-open UTF-8 byte range in the original or generated source.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub struct ByteRange {
    start: u32,
    end: u32,
}

impl ByteRange {
    /// Construct an ordered byte range, or return `None` for inverted bounds.
    #[must_use]
    pub const fn new(start: u32, end: u32) -> Option<Self> {
        if start <= end {
            Some(Self { start, end })
        } else {
            None
        }
    }

    const fn trusted(start: u32, end: u32) -> Self {
        debug_assert!(start <= end);
        Self { start, end }
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
}

/// Runtime output target for a prepared component.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum RuntimeTarget {
    /// Browser runtime output.
    Client,
    /// Server-side rendering output.
    Server,
}

impl From<RuntimeTarget> for GenerateMode {
    fn from(target: RuntimeTarget) -> Self {
        match target {
            RuntimeTarget::Client => Self::Client,
            RuntimeTarget::Server => Self::Server,
        }
    }
}

/// The role of a component script block.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ScriptKind {
    /// Instance script visible to the component template.
    Instance,
    /// Module-context script.
    Module,
}

/// Source regions and dialect for one script block.
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

/// Source regions for the component style block.
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
    /// Public prop name.
    pub name: String,
    /// Local script binding name.
    pub local_name: String,
    /// Source range of the declaration, when known.
    pub declaration: Option<ByteRange>,
    /// Whether consumers may bind to the prop.
    pub bindable: bool,
}

/// A component export discovered during analysis.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ComponentExport {
    /// Public export name.
    pub name: String,
    /// Local script binding name.
    pub local_name: String,
}

/// Immutable, cross-file-resolution-free facts from compiler analysis.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ComponentFacts {
    /// Whether analysis selected runes mode.
    pub runes: bool,
    /// Scope class frozen by component analysis, when a style block exists.
    pub css_scope_hash: Option<String>,
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
    fn collect(source: &str, ast: &Root<'_>, analysis: &ComponentAnalysis, runes: bool) -> Self {
        let mut scripts = [ast.instance.as_deref(), ast.module.as_deref()]
            .into_iter()
            .flatten()
            .map(|script| ScriptRegion {
                kind: match script.context {
                    ScriptContext::Default => ScriptKind::Instance,
                    ScriptContext::Module => ScriptKind::Module,
                },
                tag: ByteRange::trusted(script.start, script.end),
                content: ByteRange::trusted(
                    script.content_offset,
                    source[script.content_offset as usize..script.end as usize]
                        .rfind("</script")
                        .map_or(script.end, |offset| {
                            script.content_offset + source_pos(offset)
                        }),
                ),
                typescript: script.attributes.iter().any(|attribute| {
                    attribute.name == "lang"
                        && matches!(
                            &attribute.value,
                            AttributeValue::Sequence(parts)
                                if matches!(
                                    parts.first(),
                                    Some(AttributeValuePart::Text(text))
                                        if text.data == "ts" || text.data == "typescript"
                                )
                        )
                }),
            })
            .collect::<Vec<_>>();
        scripts.sort_by_key(|script| script.tag.start);

        let style = ast.css.as_ref().map(|style| StyleRegion {
            tag: ByteRange::trusted(style.start, style.end),
            content: ByteRange::trusted(style.content.start, style.content.end),
        });

        let mut props = analysis
            .root
            .bindings
            .iter()
            .filter(|binding| matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp))
            .map(|binding| ComponentProp {
                name: binding
                    .prop_alias
                    .clone()
                    .unwrap_or_else(|| binding.name.clone()),
                local_name: binding.name.clone(),
                declaration: binding.declaration_start.map(|start| {
                    ByteRange::trusted(start, start.saturating_add(source_pos(binding.name.len())))
                }),
                bindable: binding.kind == BindingKind::BindableProp,
            })
            .collect::<Vec<_>>();
        props.sort_by_key(|prop| prop.declaration.map_or(u32::MAX, |range| range.start));

        Self {
            runes,
            css_scope_hash: style.as_ref().map(|_| analysis.css.hash.clone()),
            uses_legacy_props: analysis.uses_props,
            uses_legacy_rest_props: analysis.uses_rest_props,
            uses_legacy_slots: analysis.uses_slots,
            uses_render_tags: analysis.uses_render_tags,
            uses_component_bindings: analysis.uses_component_bindings,
            scripts,
            style,
            props,
            exports: analysis
                .exports
                .iter()
                .map(|export| ComponentExport {
                    name: export.alias.clone().unwrap_or_else(|| export.name.clone()),
                    local_name: export.name.clone(),
                })
                .collect(),
        }
    }
}

/// A parsed and analyzed component whose runtime options are frozen.
///
/// The component borrows its source, is movable between workers, and is
/// intentionally not `Sync`. Emission requires `&mut self`, while the AST and
/// analysis remain private. Client and server output can be generated in any
/// order without repeating parse or analysis.
pub struct PreparedComponent<'source> {
    source: &'source str,
    ast: Box<Root<'source>>,
    analysis: Box<ComponentAnalysis>,
    options: CompileOptions,
    runes_mode: bool,
    retained_scripts: RetainedScripts<'source>,
    facts: OnceCell<ComponentFacts>,
}

impl std::fmt::Debug for PreparedComponent<'_> {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("PreparedComponent")
            .field("source_len", &self.source.len())
            .field("options", &self.options)
            .field("runes_mode", &self.runes_mode)
            .field("facts_initialized", &self.facts.get().is_some())
            .finish_non_exhaustive()
    }
}

impl<'source> PreparedComponent<'source> {
    pub(crate) fn new(source: &'source str, options: CompileOptions) -> Result<Self, CompileError> {
        let mut ast = Box::new(crate::compiler::parse_component(
            source,
            options.modern_ast,
        )?);
        let (options, analysis, runes_mode, retained_scripts) = {
            // SAFETY: the guard is dropped before `ast` moves into the result.
            let _arena_guard =
                unsafe { crate::ast::arena::SerializeArenaGuard::new(&ast.arena as *const _) };
            let (options, analysis, runes_mode, retained_scripts) =
                crate::compiler::prepare_and_analyze(&mut ast, source, options)?;
            (options, Box::new(analysis), runes_mode, retained_scripts)
        };

        Ok(Self {
            source,
            ast,
            analysis,
            options,
            runes_mode,
            retained_scripts,
            facts: OnceCell::new(),
        })
    }

    /// Return immutable compiler facts frozen during preparation.
    #[must_use]
    pub fn facts(&self) -> &ComponentFacts {
        self.facts.get_or_init(|| {
            ComponentFacts::collect(self.source, &self.ast, &self.analysis, self.runes_mode)
        })
    }

    /// Emit one runtime target without repeating parse or analysis.
    ///
    /// # Errors
    ///
    /// Returns an error if target transformation or code generation fails.
    pub fn compile(&mut self, target: RuntimeTarget) -> Result<CompileResult, CompileError> {
        self.compile_mode(target.into())
    }

    /// Emit client and server targets from the same analysis.
    ///
    /// # Errors
    ///
    /// Returns an error if either target transformation or code generation fails.
    pub fn compile_both(&mut self) -> Result<(CompileResult, CompileResult), CompileError> {
        let client = self.compile(RuntimeTarget::Client)?;
        let server = self.compile(RuntimeTarget::Server)?;
        Ok((client, server))
    }

    pub(crate) fn compile_mode(
        &mut self,
        generate: GenerateMode,
    ) -> Result<CompileResult, CompileError> {
        self.compile_mode_with_sourcemap_content(generate, true)
    }

    pub(crate) fn compile_mode_with_sourcemap_content(
        &mut self,
        generate: GenerateMode,
        include_sourcemap_content: bool,
    ) -> Result<CompileResult, CompileError> {
        // SAFETY: `self.ast` cannot move for the duration of this mutable borrow.
        let _arena_guard =
            unsafe { crate::ast::arena::SerializeArenaGuard::new(&self.ast.arena as *const _) };
        let adjusted_options = (self.options.generate != generate).then(|| {
            let mut options = self.options.clone();
            options.generate = generate;
            options
        });
        let options = adjusted_options.as_ref().unwrap_or(&self.options);
        let include_sourcemap_content = include_sourcemap_content || options.sourcemap.is_some();
        let transform_result = transform_component_with_scripts(
            &self.analysis,
            &self.ast,
            self.source,
            options,
            include_sourcemap_content,
            Some(&self.retained_scripts),
        )
        .map_err(CompileError::from)?;
        let mut result = crate::compiler::finalize_compile_result(
            transform_result,
            &self.analysis,
            self.source,
            options,
            self.runes_mode,
        );
        if options.modern_ast {
            result.ast = Some(self.public_ast_json());
        }
        Ok(result)
    }

    fn public_ast_json(&self) -> String {
        let mut value = serde_json::to_value(&*self.ast).expect("the public AST is serializable");
        remove_metadata(&mut value);
        if let Some(root) = value.as_object_mut() {
            root.entry("comments")
                .or_insert_with(|| Value::Array(Vec::new()));
        }
        if !self.source.is_ascii() {
            let positions = crate::compiler::legacy::Utf8ToUtf16::new(self.source);
            crate::compiler::legacy::convert_positions_to_utf16(&mut value, &positions);
        }
        serde_json::to_string(&value).expect("the public AST JSON is serializable")
    }
}

fn remove_metadata(value: &mut Value) {
    match value {
        Value::Object(object) => {
            object.remove("metadata");
            for value in object.values_mut() {
                remove_metadata(value);
            }
        }
        Value::Array(values) => {
            for value in values {
                remove_metadata(value);
            }
        }
        _ => {}
    }
}

/// Stateless entry point for runtime compiler products.
#[derive(Debug, Default)]
pub struct Toolchain;

impl Toolchain {
    /// Construct a low-level compiler toolchain.
    #[must_use]
    pub const fn new() -> Self {
        Self
    }

    /// Return versions and schemas for caller-owned cache namespaces.
    #[must_use]
    pub const fn fingerprint(&self) -> EngineFingerprint {
        EngineFingerprint {
            rsvelte_version: env!("CARGO_PKG_VERSION"),
            svelte_version: SVELTE_VERSION,
            toolchain_schema: TOOLCHAIN_SCHEMA_VERSION,
            runtime_schema: RUNTIME_SCHEMA_VERSION,
            facts_schema: FACTS_SCHEMA_VERSION,
        }
    }

    /// Parse and analyze a component once, freezing its compile options.
    ///
    /// # Errors
    ///
    /// Returns an error when component parsing or analysis fails.
    pub fn prepare<'source>(
        &self,
        source: &'source str,
        options: CompileOptions,
    ) -> Result<PreparedComponent<'source>, CompileError> {
        PreparedComponent::new(source, options)
    }
}
