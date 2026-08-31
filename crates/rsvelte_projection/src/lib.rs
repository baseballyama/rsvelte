//! Low-level Svelte-to-TypeScript projection engine.
//!
//! Prefer the `rsvelte` facade when you need a deliberately small, stable
//! embedder API. This crate exposes the language-tools-compatible projection
//! model used by rsvelte's own checker and language server.

pub(crate) mod ast {
    pub use rsvelte_core::ast::*;
}

pub(crate) mod compiler {
    pub use rsvelte_core::compiler::*;
}

pub(crate) mod error {
    pub use rsvelte_core::error::*;
}

pub mod script_kind;
pub mod svelte2tsx;
mod toolchain;

pub use script_kind::is_typescript_component;
pub use svelte2tsx::{
    RewriteExternalImportsOptions, Svelte2TsxError, Svelte2TsxMode, Svelte2TsxNamespace,
    Svelte2TsxOptions, Svelte2TsxResult, SvelteVersion,
};
pub use toolchain::{
    ByteRange, ExactMapping, PROJECTION_SCHEMA_VERSION, ProjectionArtifact, ProjectionEngine,
    ProjectionExport, ProjectionFacts, ProjectionMap, ProjectionProp,
};
