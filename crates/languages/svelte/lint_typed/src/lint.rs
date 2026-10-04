use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_svelte::Parsed;

use crate::Configuration;

/// # Errors
///
/// The source does not parse.
pub fn lint(
    context: &DocumentContext<'_>,
    configuration: &Configuration,
) -> Result<Vec<Diagnostic>, Diagnostic> {
    context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    Ok(configuration
        .no_unnecessary_condition
        .map_or_else(Vec::new, |severity| {
            crate::rules::execute(context, severity)
        }))
}
