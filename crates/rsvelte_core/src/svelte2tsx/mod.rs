#[allow(warnings, clippy::all)]
pub mod magic_string;
#[allow(warnings, clippy::all)]
pub mod script;
#[allow(warnings, clippy::all)]
pub mod svelte2tsx;
#[allow(warnings, clippy::all)]
pub mod template;

pub use svelte2tsx::{
    RewriteExternalImportsOptions, Svelte2TsxError, Svelte2TsxMode, Svelte2TsxNamespace,
    Svelte2TsxOptions, Svelte2TsxResult, SvelteVersion, svelte2tsx,
};
