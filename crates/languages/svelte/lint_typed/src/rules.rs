use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_lint_runner::finding::Finding;
use rsvelte_lint_runner::findings::Findings;

mod no_unnecessary_condition;

use no_unnecessary_condition::NoUnnecessaryCondition;
pub(crate) use no_unnecessary_condition::RULE;

pub(crate) fn execute(context: &DocumentContext<'_>, severity: Severity) -> Vec<Finding> {
    let rule = NoUnnecessaryCondition(severity);
    let mut findings = Findings::new();
    findings.run([&rule], context);
    findings.finish()
}
