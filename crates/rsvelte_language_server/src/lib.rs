//! `rsvelte-language-server` — an LSP server exposing rsvelte's formatter and
//! linter to any LSP client (VS Code, Neovim, …).
//!
//! Native Svelte, HTML and CSS providers run alongside a supervised TypeScript
//! 7 LSP child. A diskless `.svelte` to `.tsx` overlay maps TypeScript
//! navigation, completion, rename, diagnostics and edits back to source files.
//!
//! The message loop owns only protocol state; every analysis runs on the
//! [`worker`] thread, which is where the stack depth and panic isolation the
//! Svelte compiler needs are provided.

pub mod client;
pub mod code_actions;
pub mod code_lens;
pub mod completions;
pub mod context;
pub mod css;
pub mod diagnostics;
pub mod document;
pub mod extract;
pub mod folding;
pub mod format;
pub mod hover;
pub mod html_data;
pub mod html_tags;
pub mod indent_folding;
pub mod lint;
pub mod log;
pub mod modifiers;
pub mod nodes;
pub mod preprocess_sidecar;
pub mod selection_ranges;
pub mod server;
pub mod settings;
pub mod symbols;
pub mod tags;
pub mod text;
pub mod tsgo_client;
pub mod tsgo_code_actions;
pub mod tsgo_completion;
pub mod tsgo_component_info;
pub mod tsgo_custom;
pub mod tsgo_overlay;
pub mod tsgo_rename;
pub mod tsgo_response;
pub mod uri;
pub mod worker;

pub use server::run_stdio;
