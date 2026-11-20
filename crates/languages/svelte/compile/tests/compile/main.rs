//! The crate's integration tests, in one binary. `fixtures` and `scaling` keep their own: one has
//! its own harness, the other a counting global allocator and CPU timings.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_compile::CompileInput;
use rsvelte_svelte_semantic::analyze::{self, Analysis};
use rsvelte_svelte_semantic::resolve::{self, Resolution};

mod configuration;
mod lowering;
mod official_parity;
mod preserve_whitespace;
mod render_plan;
mod special_validation;
mod styling;

/// Parses, resolves and analyzes `source` as `filename`, and calls `f` with what the compiler
/// reads.
///
/// # Errors
///
/// The parse error.
fn analyzed<R>(
    source: &str,
    filename: &str,
    f: impl FnOnce(CompileInput<'_>, &Resolution, &Analysis) -> R,
) -> Result<R, Diagnostic> {
    let component = rsvelte_svelte_syntax::parse::parse(source)?;
    let tree = rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, source);
    let input = CompileInput::from(rsvelte_svelte_semantic::svelte_input(
        &component, &tree, source, filename,
    ));
    let resolution = resolve::resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = analyze::analyze(&input.component, &resolution);
    Ok(f(input, &resolution, &analysis))
}
