//! # svelte-compiler-rust
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
//! ```rust
//! use svelte_compiler_rust::{parse, ParseOptions};
//!
//! let source = r#"<h1>Hello, {name}!</h1>"#;
//! let ast = parse(source, ParseOptions::default()).unwrap();
//! ```

// Use jemalloc as the global allocator for better multi-threaded performance
#[cfg(all(feature = "jemalloc", not(target_arch = "wasm32")))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

pub mod ast;
pub mod compiler;
pub mod error;

#[cfg(feature = "wasm")]
pub mod wasm;

pub use compiler::legacy::convert_to_legacy;
#[cfg(not(feature = "native"))]
pub use compiler::phases::phase1_parse::{ParseOptions, parse};
#[cfg(feature = "native")]
pub use compiler::phases::phase1_parse::{ParseOptions, parse, parse_parallel};
pub use compiler::print::{PrintError, PrintOptions, PrintResult, print};
#[cfg(not(feature = "native"))]
pub use compiler::{
    CompileError, CompileOptions, CompileResult, ExperimentalOptions, GenerateMode, compile,
};
#[cfg(feature = "native")]
pub use compiler::{
    CompileError, CompileOptions, CompileResult, ExperimentalOptions, GenerateMode, compile,
    compile_batch,
};
