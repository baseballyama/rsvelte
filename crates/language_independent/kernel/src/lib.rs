//! Shared source data, computed results, diagnostics, output, and performance measurements.
//!
//! Layers, lowest first. A module uses only the modules on earlier lines; modules on one line do
//! not use each other. `tools/structure/kernel.test.ts` checks this list against the code.
//!
//! 1. `performance`, `index`
//! 2. `source`
//! 3. `diagnostics`, `output`, `computation::file_facts`
//! 4. `computation::plugins`, `computation::database`
//! 5. `computation::task`
//! 6. `computation::registry`
//! 7. `computation::pipeline`

/// Registration, cached computation, and task execution.
pub mod computation {
    pub mod database;
    pub mod file_facts;
    pub mod pipeline;
    pub mod plugins;
    pub mod registry;
    pub mod task;
}
pub mod diagnostics;
pub mod index;
/// Generated code and structured data.
pub mod output {
    pub mod edits;
    pub mod emitter;
    pub mod structured_data;
}
/// Runtime measurements and reusable working buffers.
pub mod performance {
    pub mod buffer_pool;
    pub mod measurement;
    pub mod stack;
}
/// Documents, character classes, source positions, names, and tokens.
pub mod source {
    pub mod characters;
    pub mod document;
    pub mod interning;
    pub mod positions;
    pub mod tokens;
}
