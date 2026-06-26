//! Port of [`svelte-preprocess-markdown`](https://github.com/AlexxNB/svelte-preprocess-markdown)
//! (v2.7.3) — author a Svelte component in Markdown.
//!
//! Its output is produced by the `marked` Markdown parser (plus `front-matter`
//! and configurable renderers/highlighters); a comrak/pulldown-cmark core would
//! not byte-match `marked`'s HTML. Per the plan's JS-fallback boundary, the
//! rsvelte [`PreprocessorGroup`] delegates to the installed
//! `svelte-preprocess-markdown` over a Node bridge
//! ([`js/markdown-bridge.mjs`]). A pure-Rust core is future work.

use rsvelte_core::compiler::preprocess::types::PreprocessorGroup;

use crate::bridge::{MarkupBridge, markup_group};

const SCRIPT: &str = include_str!("../js/markdown-bridge.mjs");

/// Build the `svelte-preprocess-markdown` [`PreprocessorGroup`].
pub fn markdown(config: MarkupBridge) -> PreprocessorGroup {
    markup_group("svelte-preprocess-markdown", SCRIPT, config)
}
