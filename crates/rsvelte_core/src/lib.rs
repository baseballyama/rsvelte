//! Low-level compiler implementation for the rsvelte toolchain.
//!
//! Most embedders should use the compiler-neutral [`rsvelte`](https://docs.rs/rsvelte)
//! facade. This crate exposes rsvelte's parser, AST, phases, and raw compiler
//! options for workspace products and advanced integrations. Those low-level
//! types follow a pre-1.0 compatibility policy and may change between minor
//! releases as Svelte compatibility work evolves.
//!
//! The default feature set is empty. `parallel` adds only batch/parser
//! parallelism; host policy such as filesystem access, watching, CLI parsing,
//! allocator selection, and language bindings belongs to dedicated crates.
//!
//! # Low-level usage
//!
//! ```rust,no_run
//! use rsvelte_core::{Allocator, parse, ParseOptions};
//!
//! let source = r#"<h1>Hello, {name}!</h1>"#;
//! let allocator = Allocator::default();
//! let ast = parse(source, &allocator, ParseOptions::default()).unwrap();
//! ```

// `#[global_allocator]` deliberately lives only in artifacts that explicitly
// own allocator policy (for example repository profiling binaries and the
// `rsvelte_napi` cdylib), never in this library. Ordinary CLIs inherit the
// platform allocator, and embedding this rlib never imposes one on the host.

pub mod ast;
pub mod compiler;
pub mod error;
pub mod toolchain;

pub use compiler::legacy::convert_to_legacy;
#[cfg(not(feature = "parallel"))]
pub use compiler::phases::phase1_parse::{ParseOptions, parse};
#[cfg(feature = "parallel")]
pub use compiler::phases::phase1_parse::{ParseOptions, parse, parse_parallel};
pub use compiler::print::{PrintError, PrintOptions, PrintResult, print};
#[cfg(feature = "parallel")]
pub use compiler::{
    CompileError, CompileOptions, CompileResult, ExperimentalOptions, GenerateMode,
    ModuleCompileOptions, Warning, WarningFilterFn, compile, compile_batch, compile_both,
    compile_module,
};
#[cfg(not(feature = "parallel"))]
pub use compiler::{
    CompileError, CompileOptions, CompileResult, ExperimentalOptions, GenerateMode,
    ModuleCompileOptions, Warning, WarningFilterFn, compile, compile_both, compile_module,
};
#[doc(hidden)]
pub use oxc_allocator::Allocator;
