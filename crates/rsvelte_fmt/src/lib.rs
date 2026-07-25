//! `rsvelte-fmt` — single entry point for formatting a mixed JS/TS/Svelte
//! tree. `.svelte` files go through [`rsvelte_formatter`]; every other file
//! is delegated to a child `oxfmt` process. Both pipelines run in parallel.
//!
//! The CLI lives in [`run`]; [`embed::FormatSession`] exposes the same
//! stdin-mode pipeline to in-process consumers.

mod cli;
mod config;
mod daemon;
pub mod embed;
mod native_css;
mod native_js;
mod native_json;
mod options;
mod output;
mod oxfmt;
mod oxfmt_ignore;
mod paths;
mod run;
mod status;
mod stdin;
mod style_cache;
mod svelte_pipeline;
mod tailwind;
mod tailwind_sidecar;
mod tailwind_sort;
mod ts_config;
mod walk;

pub use embed::FormatSession;
pub use run::run;
