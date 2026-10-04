use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_lint::rules::{Findings, Rule};
use rsvelte_svelte::Parsed;

use crate::RuleConfiguration;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;

mod button_has_type;
mod no_unused_variables;
mod valid_each_key;

pub(crate) fn execute(
    context: &DocumentContext<'_>,
    rules: &[RuleConfiguration],
) -> Vec<Diagnostic> {
    let mut findings = Findings::new();
    for rule in rules {
        let rule: &dyn Rule<DocumentContext<'_>> = rule;
        findings.run(&[rule], context);
    }
    findings.finish()
}

impl Rule<DocumentContext<'_>> for RuleConfiguration {
    fn identifier(&self) -> &'static str {
        (*self).name()
    }

    fn check(&self, context: &DocumentContext<'_>, out: &mut Vec<Diagnostic>) {
        let before = out.len();
        match *self {
            Self::ButtonHasType { allowed, .. } => {
                let tree = context
                    .get::<Parsed>()
                    .as_ref()
                    .expect("lint checks parsing first");
                button_has_type::check(tree, context.source_text(), allowed, out);
            }
            Self::NoUnusedVariables(_) => {
                no_unused_variables::check(context, self.identifier(), out);
            }
            Self::ValidEachKey(_) => valid_each_key::check(context, out),
        }
        for diagnostic in &mut out[before..] {
            diagnostic.severity = self.severity();
        }
    }
}
