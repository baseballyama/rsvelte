//! `rsvelte-language-server` — an LSP server exposing rsvelte's formatter and
//! linter to any LSP client (VS Code, Neovim, …).
//!
//! It also ports the TypeScript-free half of the official language server's
//! `SveltePlugin`: template tag and event modifier [`completions`] and
//! [`hover`].
//!
//! The message loop owns only protocol state; every analysis runs on the
//! [`worker`] thread, which is where the stack depth and panic isolation the
//! Svelte compiler needs are provided.

pub mod client;
pub mod code_actions;
pub mod completions;
pub mod context;
pub mod diagnostics;
pub mod document;
pub mod format;
pub mod hover;
pub mod lint;
pub mod log;
pub mod modifiers;
pub mod server;
pub mod settings;
pub mod tags;
pub mod text;
pub mod uri;
pub mod worker;

pub use server::run_stdio;
