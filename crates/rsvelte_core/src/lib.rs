//! # rsvelte_core
//!
//! A high-performance Rust implementation of the Svelte compiler.
//!
//! ## Goals
//!
//! 1. **100% Test Compatibility**: Pass all tests from the official Svelte compiler test suite
//! 2. **100x Performance**: Achieve 100 times the performance of the official Svelte compiler
//!
//! ## Usage
//!
//! ```rust,no_run
//! use rsvelte_core::{parse, ParseOptions};
//!
//! let source = r#"<h1>Hello, {name}!</h1>"#;
//! let ast = parse(source, ParseOptions::default()).unwrap();
//! ```

// `#[global_allocator]` deliberately lives in each binary entry point
// (src/main.rs, src/bin/*.rs) and in the `rsvelte_napi` cdylib root rather
// than here, so that linking this rlib never imposes an allocator on the
// consumer. The system-allocator fallback for the rlib path is intentional;
// everything that runs in production installs its own allocator (mimalloc
// preferred, jemalloc as a fallback).

pub mod ast;
pub mod compiler;
pub mod error;
pub mod lint_scope;
pub mod svelte2tsx;
#[cfg(feature = "native")]
pub mod svelte_check;
pub mod vps;

// The raw-transfer envelope stays in this crate (rather than in `rsvelte_napi`)
// so unit tests and non-NAPI consumers such as the WASM build can exercise the
// encoder.
pub mod napi_raw;
pub mod napi_raw_parse;

#[cfg(feature = "wasm")]
pub mod wasm;

pub use compiler::legacy::convert_to_legacy;
#[cfg(not(feature = "native"))]
pub use compiler::phases::phase1_parse::{ParseOptions, parse};
#[cfg(feature = "native")]
pub use compiler::phases::phase1_parse::{ParseOptions, parse, parse_parallel};
pub use compiler::print::{PrintError, PrintOptions, PrintResult, print};
#[cfg(feature = "native")]
pub use compiler::{
    CompileError, CompileOptions, CompileResult, ExperimentalOptions, GenerateMode,
    ModuleCompileOptions, Warning, WarningFilterFn, compile, compile_batch, compile_both,
    compile_module,
};
#[cfg(not(feature = "native"))]
pub use compiler::{
    CompileError, CompileOptions, CompileResult, ExperimentalOptions, GenerateMode,
    ModuleCompileOptions, Warning, WarningFilterFn, compile, compile_both, compile_module,
};
