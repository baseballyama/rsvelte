use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_lint_runner::finding::Finding;
use rsvelte_svelte::Parsed;

use crate::Configuration;

/// # Errors
///
/// The source does not parse.
pub fn lint(
    context: &DocumentContext<'_>,
    configuration: &Configuration,
) -> Result<Vec<Finding>, Diagnostic> {
    context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    Ok(configuration
        .no_unnecessary_condition
        .map_or_else(Vec::new, |severity| {
            crate::rules::execute(context, severity)
        }))
}
