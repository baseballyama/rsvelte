//! Native project checker used by the `svelte_check` product.
//!
//! Filesystem walking, module resolution, watch mode, and CLI rendering live
//! here instead of in the embeddable compiler core.

pub(crate) mod compiler {
    pub use rsvelte_core::compiler::*;
}

pub(crate) mod svelte2tsx {
    pub use rsvelte_projection::svelte2tsx::*;
}

mod svelte_check;

pub use rsvelte_diagnostics::{
    Diagnostic, DiagnosticSeverity, OutputFormat, Position, Range, Threshold, write_diagnostic,
    write_summary,
};
pub use svelte_check::*;
