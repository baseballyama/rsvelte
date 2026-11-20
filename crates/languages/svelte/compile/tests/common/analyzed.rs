//! The setup both test binaries share.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_compile::CompileInput;
use rsvelte_svelte_semantic::analyze::{self, Analysis};
use rsvelte_svelte_semantic::input::ComponentInput;
use rsvelte_svelte_semantic::resolve::{self, Resolution};

/// Parses, resolves and analyzes `source` as `filename`, and calls `f` with what the compiler
/// reads.
///
/// # Errors
///
/// The parse error.
pub(crate) fn analyzed<R>(
    source: &str,
    filename: &str,
    f: impl FnOnce(CompileInput<'_>, &Resolution, &Analysis) -> R,
) -> Result<R, Diagnostic> {
    let component = rsvelte_svelte_syntax::parse::parse(source)?;
    let tree = rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, source);
    let input = CompileInput::from(ComponentInput::new(&component, &tree, source, filename));
    let resolution = resolve::resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = analyze::analyze(&input.component, &resolution);
    Ok(f(input, &resolution, &analysis))
}
