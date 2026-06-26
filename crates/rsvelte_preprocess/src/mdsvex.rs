//! Port of [`mdsvex`](https://github.com/pngwn/MDsveX) (v0.12.x) — Markdown →
//! Svelte preprocessing.
//!
//! mdsvex's output is defined by its `unified`/remark/rehype pipeline (custom
//! remark/rehype plugins, layouts, frontmatter, code highlighting). There is no
//! pure-Rust engine that reproduces that output byte-for-byte, so this port
//! follows the plan's JS-fallback boundary (§2.2 / §3): the rsvelte
//! [`PreprocessorGroup`] delegates to the user's installed `mdsvex` over a Node
//! bridge ([`js/mdsvex-bridge.mjs`]), making it a faithful drop-in on the
//! rsvelte preprocess pipeline. A pure-Rust core is future work.

use rsvelte_core::compiler::preprocess::types::PreprocessorGroup;

use crate::bridge::{MarkupBridge, markup_group};

const SCRIPT: &str = include_str!("../js/mdsvex-bridge.mjs");

/// Build the `mdsvex` [`PreprocessorGroup`].
pub fn mdsvex(config: MarkupBridge) -> PreprocessorGroup {
    markup_group("mdsvex", SCRIPT, config)
}
