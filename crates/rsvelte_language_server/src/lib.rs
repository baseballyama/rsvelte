//! `rsvelte-language-server` — an LSP server exposing rsvelte's formatter and
//! linter to any LSP client (VS Code, Neovim, …).
//!
//! It also ports the TypeScript-free half of the official language server's
//! `SveltePlugin`: template tag and event modifier [`completions`] and
//! [`hover`], and the structure the Svelte AST alone can answer for —
//! [`folding`] ranges, [`selection_ranges`] and document [`symbols`].
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
pub mod selection_ranges;
pub mod server;
pub mod settings;
pub mod symbols;
pub mod tags;
pub mod text;
pub mod uri;
pub mod worker;

pub use server::run_stdio;
