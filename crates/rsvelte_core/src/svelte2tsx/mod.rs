#[allow(
    clippy::inherent_to_string_shadow_display,
    reason = "MagicString::to_string mirrors JS `MagicString.toString()`; the inherent name is the ported public API"
)]
pub mod magic_string;
#[allow(
    dead_code,
    clippy::doc_lazy_continuation,
    clippy::if_same_then_else,
    reason = "ported svelte2tsx module: retains upstream TS structure (explicit branches / doc layout) and helpers not yet wired into the port; only these specific lints are waived, full rustc + clippy enforcement applies otherwise"
)]
pub mod script;
#[allow(
    dead_code,
    clippy::if_same_then_else,
    clippy::unnecessary_unwrap,
    clippy::module_inception,
    reason = "ported svelte2tsx module: retains upstream TS structure (explicit branches / doc layout) and helpers not yet wired into the port; only these specific lints are waived, full rustc + clippy enforcement applies otherwise"
)]
pub mod svelte2tsx;
#[allow(
    dead_code,
    clippy::doc_lazy_continuation,
    clippy::doc_overindented_list_items,
    reason = "ported svelte2tsx module: retains upstream TS structure (explicit branches / doc layout) and helpers not yet wired into the port; only these specific lints are waived, full rustc + clippy enforcement applies otherwise"
)]
pub mod template;

pub use svelte2tsx::{
    RewriteExternalImportsOptions, Svelte2TsxError, Svelte2TsxMode, Svelte2TsxNamespace,
    Svelte2TsxOptions, Svelte2TsxResult, SvelteVersion, svelte2tsx,
};
