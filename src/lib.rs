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

pub mod ast;
pub mod compiler;
pub mod error;
pub mod parser;

#[cfg(feature = "wasm")]
pub mod wasm;

pub use compiler::{CompileError, CompileOptions, CompileResult, GenerateMode, compile};
#[cfg(not(feature = "native"))]
pub use parser::{ParseOptions, parse};
#[cfg(feature = "native")]
pub use parser::{ParseOptions, parse, parse_parallel};
