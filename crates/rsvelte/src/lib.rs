#![doc = include_str!("../README.md")]
#![forbid(unsafe_code)]
#![deny(missing_docs)]

mod artifact;
mod diagnostics;
mod engine;
mod facts;
mod options;
#[cfg(feature = "projection")]
mod projection;

pub use artifact::{GeneratedCode, GeneratedCss, RuntimeArtifact};
pub use diagnostics::{CompileFailure, Diagnostic, DiagnosticSeverity};
pub use engine::{
    API_SCHEMA_VERSION, COMPONENT_FACTS_SCHEMA_VERSION, Engine, EngineFingerprint,
    PROJECTION_ARTIFACT_SCHEMA_VERSION, PreparedComponent, RUNTIME_ARTIFACT_SCHEMA_VERSION,
    RuntimeTarget,
};
pub use facts::{
    ByteRange, ComponentExport, ComponentFacts, ComponentProp, ScriptKind, ScriptRegion,
    StyleRegion,
};
pub use options::{ComponentOptions, CssMode, OptionsCacheKey};
#[cfg(feature = "projection")]
pub use projection::{
    ExactProjectionMapping, MarkupNamespace, ProjectionArtifact, ProjectionExport, ProjectionFacts,
    ProjectionFailure, ProjectionMap, ProjectionMode, ProjectionOptions, ProjectionProp,
};
