use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::diagnostic::{Diagnostic, Severity};
use rsvelte_lint::rules::Findings;

mod no_unnecessary_condition;

use no_unnecessary_condition::NoUnnecessaryCondition;
pub(crate) use no_unnecessary_condition::RULE;

pub(crate) fn execute(context: &DocumentContext<'_>, severity: Severity) -> Vec<Diagnostic> {
    let rule = NoUnnecessaryCondition(severity);
    let mut findings = Findings::new();
    findings.run(&[&rule], context);
    findings.finish()
}
