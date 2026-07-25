//! `rsvelte-fmt` — single entry point for formatting a mixed JS/TS/Svelte
//! tree. `.svelte` files go through [`rsvelte_formatter`]; every other file
//! is delegated to a child `oxfmt` process. Both pipelines run in parallel.

// The CLI streams files (read → format → drop, one source live at a time), so
// the system allocator churns pages back to the OS between files; mimalloc
// retains them, closing a large per-file read+format overhead the batched
// in-process benchmark never sees. mimalloc is rsvelte's production allocator
// (the compiler CLI and NAPI addon use it for the same allocation-bound reason).
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use std::process::ExitCode;

mod cli;
mod config;
mod daemon;
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

use crate::run::run;

fn main() -> ExitCode {
    match run() {
        Ok(code) => code,
        Err(err) => {
            eprintln!("rsvelte-fmt: error: {err:#}");
            ExitCode::from(2)
        }
    }
}
