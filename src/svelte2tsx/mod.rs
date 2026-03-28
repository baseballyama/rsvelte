#[allow(warnings, clippy::inherent_to_string_shadow_display)]
pub mod magic_string;
#[allow(warnings)]
pub mod script;
#[allow(warnings)]
pub mod svelte2tsx;
#[allow(warnings)]
pub mod template;

pub use svelte2tsx::{
    Svelte2TsxError, Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, Svelte2TsxResult,
    SvelteVersion, svelte2tsx,
};
