use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_lint_runner::finding::Finding;
use rsvelte_lint_runner::findings::Findings;

use crate::Configuration;
use crate::rule::File;

/// The findings of `configuration`'s rules on a component or a module, in `ESLint`'s order.
///
/// # Errors
///
/// The source does not parse.
pub fn lint(
    context: &DocumentContext<'_>,
    configuration: &Configuration,
) -> Result<Vec<Finding>, Diagnostic> {
    check(&File::new(context)?, configuration)
}

/// [`lint`] of a parsed document.
pub(crate) fn check(
    file: &File<'_>,
    configuration: &Configuration,
) -> Result<Vec<Finding>, Diagnostic> {
    let mut findings = Findings::new();
    findings.run(
        configuration
            .rules()
            .iter()
            .filter(|rule| rule.applies(file)),
        file,
    );
    findings.finish()
}
