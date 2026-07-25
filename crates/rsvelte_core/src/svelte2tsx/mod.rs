pub(crate) mod add_component_export;
pub(crate) mod create_render_function;
pub(crate) mod helpers;
pub(crate) mod interfaces;
#[allow(
    clippy::inherent_to_string_shadow_display,
    reason = "MagicString::to_string mirrors JS `MagicString.toString()`; the inherent name is the ported public API"
)]
pub(crate) mod magic_string;
pub(crate) mod nodes;
pub(crate) mod process_instance_script_tag;
pub(crate) mod script;
#[allow(
    clippy::module_inception,
    reason = "svelte2tsx::svelte2tsx mirrors the upstream package layout (svelte2tsx/index.ts); renaming the file would break the 1:1 structural mapping"
)]
pub(crate) mod svelte2tsx;
pub(crate) mod template;
pub(crate) mod utils;
pub(crate) mod validation;

pub use svelte2tsx::{
    RewriteExternalImportsOptions, Svelte2TsxError, Svelte2TsxMode, Svelte2TsxNamespace,
    Svelte2TsxOptions, Svelte2TsxResult, SvelteVersion, svelte2tsx,
};
