use std::fmt;

use rsvelte_core::toolchain::{
    PreparedComponent as CorePreparedComponent, RuntimeTarget as CoreRuntimeTarget,
    Toolchain as CoreToolchain,
};

use crate::{CompileFailure, ComponentFacts, ComponentOptions, RuntimeArtifact};

/// Version of the stable facade contract.
pub const API_SCHEMA_VERSION: u32 = 1;
/// Version of the runtime artifact contract.
pub const RUNTIME_ARTIFACT_SCHEMA_VERSION: u32 = 1;
/// Version of the component facts contract.
pub const COMPONENT_FACTS_SCHEMA_VERSION: u32 = 1;
/// Version of the optional projection artifact contract.
pub const PROJECTION_ARTIFACT_SCHEMA_VERSION: u32 = 1;

/// Versions that namespace an embedder's persistent caches.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct EngineFingerprint {
    /// Version of this stable facade crate.
    pub facade_version: &'static str,
    /// Version of the compiler implementation behind the facade.
    pub compiler_version: &'static str,
    /// Svelte compatibility version targeted by the compiler.
    pub svelte_version: &'static str,
    /// Stable facade schema version.
    pub api_schema: u32,
    /// Runtime artifact schema version.
    pub runtime_schema: u32,
    /// Component facts schema version.
    pub facts_schema: u32,
    /// Optional TypeScript projection artifact schema version.
    pub projection_schema: u32,
}

/// Runtime output target.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum RuntimeTarget {
    /// Browser runtime output.
    Client,
    /// Server-side rendering output.
    Server,
}

/// Stateless compiler entry point.
///
/// The type is intentionally not `Copy`: future releases may attach
/// configuration or shared immutable state without invalidating an ownership
/// contract made by the first release.
pub struct Engine {
    compiler: CoreToolchain,
    #[cfg(feature = "projection")]
    projection: rsvelte_projection::ProjectionEngine,
}

impl Engine {
    /// Construct an engine.
    #[must_use]
    pub fn new() -> Self {
        Self {
            compiler: CoreToolchain::new(),
            #[cfg(feature = "projection")]
            projection: rsvelte_projection::ProjectionEngine::new(),
        }
    }

    /// Return versions and schemas that participate in persistent cache keys.
    #[must_use]
    pub fn fingerprint(&self) -> EngineFingerprint {
        let compiler = self.compiler.fingerprint();
        EngineFingerprint {
            facade_version: env!("CARGO_PKG_VERSION"),
            compiler_version: compiler.rsvelte_version,
            svelte_version: compiler.svelte_version,
            api_schema: API_SCHEMA_VERSION,
            runtime_schema: RUNTIME_ARTIFACT_SCHEMA_VERSION,
            facts_schema: COMPONENT_FACTS_SCHEMA_VERSION,
            projection_schema: PROJECTION_ARTIFACT_SCHEMA_VERSION,
        }
    }

    /// Parse and analyze a component once, freezing its analysis options.
    pub fn prepare<'source>(
        &self,
        source: &'source str,
        options: ComponentOptions,
    ) -> Result<PreparedComponent<'source>, CompileFailure> {
        let filename = options.source_filename();
        let inner = self
            .compiler
            .prepare(source, options.into_core())
            .map_err(|error| CompileFailure::from_core(&error, source, filename.clone()))?;
        let facts = ComponentFacts::from_core(inner.facts());
        Ok(PreparedComponent {
            source,
            filename,
            inner,
            facts,
        })
    }

    /// Project a component to TypeScript/TSX for editor and type-checking use.
    #[cfg(feature = "projection")]
    pub fn project(
        &self,
        source: &str,
        options: crate::ProjectionOptions,
    ) -> Result<crate::ProjectionArtifact, crate::ProjectionFailure> {
        let filename = options.source_filename();
        self.projection
            .project(source, options.into_projection())
            .map(crate::ProjectionArtifact::from_projection)
            .map_err(|error| crate::ProjectionFailure::from_projection(&error, source, filename))
    }
}

impl Default for Engine {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Debug for Engine {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.debug_struct("Engine").finish_non_exhaustive()
    }
}

/// A parsed and analyzed component with frozen analysis options.
///
/// Prepared components can move to a worker (`Send`) but intentionally require
/// one mutable worker lease while emitting and are not `Sync`.
pub struct PreparedComponent<'source> {
    source: &'source str,
    filename: Option<String>,
    inner: CorePreparedComponent<'source>,
    facts: ComponentFacts,
}

impl PreparedComponent<'_> {
    /// Return immutable compiler-neutral component facts.
    #[must_use]
    pub fn facts(&self) -> &ComponentFacts {
        &self.facts
    }

    /// Emit one runtime target without repeating parsing or analysis.
    pub fn compile(&mut self, target: RuntimeTarget) -> Result<RuntimeArtifact, CompileFailure> {
        let target = match target {
            RuntimeTarget::Client => CoreRuntimeTarget::Client,
            RuntimeTarget::Server => CoreRuntimeTarget::Server,
        };
        let result = self.inner.compile(target).map_err(|error| {
            CompileFailure::from_core(&error, self.source, self.filename.clone())
        })?;
        Ok(RuntimeArtifact::from_core(self.source, &self.facts, result))
    }

    /// Emit client and server targets from the same analysis.
    pub fn compile_both(&mut self) -> Result<(RuntimeArtifact, RuntimeArtifact), CompileFailure> {
        let client = self.compile(RuntimeTarget::Client)?;
        let server = self.compile(RuntimeTarget::Server)?;
        Ok((client, server))
    }
}

impl fmt::Debug for PreparedComponent<'_> {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter
            .debug_struct("PreparedComponent")
            .field("source_len", &self.source.len())
            .field("filename", &self.filename)
            .field("facts", &self.facts)
            .finish_non_exhaustive()
    }
}
