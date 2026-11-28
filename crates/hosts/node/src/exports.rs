//! The functions Node.js sees.
// On a function, the expectation goes unfulfilled on the code napi-derive generates from it.
#![expect(
    clippy::needless_pass_by_value,
    reason = "a JavaScript string arrives owned"
)]

use napi_derive::napi;

use crate::{command, compiler};

/// The version of the official compiler whose output this compiler reproduces.
#[napi]
pub const VERSION: &str = rsvelte_svelte_compile::VERSION;

/// Compiles a component.
///
/// # Errors
/// An option value this compiler does not take.
#[napi]
pub fn compile(source: String, options: compiler::Options) -> napi::Result<compiler::Outcome> {
    compiler::compile(&source, options).map_err(napi::Error::from_reason)
}

/// Compiles a `.svelte.js` module.
///
/// # Errors
/// An option value this compiler does not take.
#[napi]
pub fn compile_module(
    source: String,
    options: compiler::Options,
) -> napi::Result<compiler::Outcome> {
    compiler::compile_module(&source, options).map_err(napi::Error::from_reason)
}

/// Parses a component into its modern AST.
#[napi]
#[must_use]
pub fn parse(source: String) -> compiler::Parsed {
    compiler::parse(&source)
}

/// Runs the `rsvelte` command with `arguments`, its other programs in the directory `programs`,
/// and returns its exit status.
#[napi]
#[must_use]
pub fn run(arguments: Vec<String>, programs: String) -> u32 {
    command::run(&arguments, programs.into())
}
