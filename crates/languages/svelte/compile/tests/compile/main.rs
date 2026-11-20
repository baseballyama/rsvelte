//! The crate's integration tests, in one binary. `fixtures` and `scaling` keep their own: one has
//! its own harness, the other a counting global allocator and CPU timings.

#[path = "../common/analyzed.rs"]
mod common;

use common::analyzed;

mod configuration;
mod lowering;
mod official_parity;
mod preserve_whitespace;
mod render_plan;
mod special_validation;
mod styling;
