//! Port of [`@nvl/sveltex`](https://github.com/nvlang/sveltex) — Svelte +
//! Markdown + LaTeX preprocessing.
//!
//! sveltex composes pluggable Markdown / code / math backends (unified, shiki,
//! MathJax/KaTeX, …); its output — especially LaTeX → MathML/SVG — is defined by
//! those JS/TeX backends. Per the plan, v1 bridges to the installed `@nvl/sveltex`
//! over a Node bridge ([`js/sveltex-bridge.mjs`]); a pure-Rust core (and a
//! Rust LaTeX path) is future work. With the default (`none`) backends sveltex
//! still applies its Svelte-structure transform; rendering Markdown/math requires
//! the corresponding backend packages installed in the project.

use rsvelte_core::compiler::preprocess::types::PreprocessorGroup;

use crate::bridge::{MarkupBridge, markup_group};

const SCRIPT: &str = include_str!("../js/sveltex-bridge.mjs");

/// Build the `@nvl/sveltex` [`PreprocessorGroup`].
pub fn sveltex(config: MarkupBridge) -> PreprocessorGroup {
    markup_group("sveltex", SCRIPT, config)
}
