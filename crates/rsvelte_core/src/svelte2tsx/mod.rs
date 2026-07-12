#[allow(
    clippy::inherent_to_string_shadow_display,
    reason = "MagicString::to_string mirrors JS `MagicString.toString()`; the inherent name is the ported public API"
)]
pub mod magic_string;
pub mod script;
#[allow(
    clippy::module_inception,
    reason = "svelte2tsx::svelte2tsx mirrors the upstream package layout (svelte2tsx/index.ts); renaming the file would break the 1:1 structural mapping"
)]
pub mod svelte2tsx;
pub mod template;

pub use svelte2tsx::{
    RewriteExternalImportsOptions, Svelte2TsxError, Svelte2TsxMode, Svelte2TsxNamespace,
    Svelte2TsxOptions, Svelte2TsxResult, SvelteVersion, svelte2tsx,
};
