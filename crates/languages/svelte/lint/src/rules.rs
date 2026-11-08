use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::diagnostic::{Diagnostic, Severity};
use rsvelte_lint_runner::findings::Findings;
use rsvelte_lint_runner::rule::{Reporter, Rule};
use rsvelte_svelte::Parsed;

use crate::RuleConfiguration;

mod button_has_type;
mod no_unused_variables;
mod valid_each_key;

pub(crate) fn execute(
    context: &DocumentContext<'_>,
    rules: &[RuleConfiguration],
) -> Vec<Diagnostic> {
    let mut findings = Findings::new();
    findings.run(rules, context);
    findings.finish()
}

impl Rule<DocumentContext<'_>> for RuleConfiguration {
    fn identifier(&self) -> &'static str {
        (*self).name()
    }

    fn severity(&self) -> Severity {
        match *self {
            Self::NoUnusedVariables(s) | Self::ValidEachKey(s) => s,
            Self::ButtonHasType { severity, .. } => severity,
        }
    }

    fn check(&self, context: &DocumentContext<'_>, reporter: &mut Reporter<'_>) {
        match *self {
            Self::ButtonHasType { allowed, .. } => {
                let tree = context
                    .get::<Parsed>()
                    .as_ref()
                    .expect("lint checks parsing first");
                button_has_type::check(tree, context.source_text(), allowed, reporter);
            }
            Self::NoUnusedVariables(_) => {
                no_unused_variables::check(context, reporter);
            }
            Self::ValidEachKey(_) => valid_each_key::check(context, reporter),
        }
    }
}
