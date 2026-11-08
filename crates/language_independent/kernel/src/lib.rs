//! Shared source data, computed results, diagnostics, output, and performance measurements.
//!
//! Layers, lowest first. A module uses only the modules on earlier lines; modules on one line do
//! not use each other. `tools/structure/kernel.test.ts` checks this list against the code.
//!
//! 1. `performance`, `index`
//! 2. `source`
//! 3. `diagnostics`, `output`
//! 4. `computation::plugins`, `computation::database`
//! 5. `computation::task`
//! 6. `computation::registry`
//! 7. `computation::pipeline`
//! 8. `task_files`

pub mod computation;
pub mod diagnostics;
pub mod index;
pub mod output;
pub mod performance;
pub mod source;
pub mod task_files;
