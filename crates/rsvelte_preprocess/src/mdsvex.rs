//! Port of [`mdsvex`](https://github.com/pngwn/MDsveX) (v0.12.x) — Markdown →
//! Svelte preprocessing.
//!
//! mdsvex's output is defined by its `unified`/remark/rehype pipeline (custom
//! remark/rehype plugins, layouts, frontmatter, code highlighting). The native
//! module ports deterministic standard stages; the public `PreprocessorGroup`
//! continues to delegate configurations requiring remaining stages or arbitrary
//! JavaScript callbacks to the installed `mdsvex` package.

use rsvelte_core::compiler::preprocess::types::PreprocessorGroup;

use crate::bridge::{MarkupBridge, markup_group};

pub mod native;

const SCRIPT: &str = include_str!("../js/mdsvex-bridge.mjs");

/// Build the `mdsvex` `PreprocessorGroup`.
#[must_use]
pub fn mdsvex(config: MarkupBridge) -> PreprocessorGroup {
    markup_group("mdsvex", SCRIPT, config)
}
