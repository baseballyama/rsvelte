use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_lint_runner::finding::Finding;
use rsvelte_lint_runner::findings::Findings;

use crate::Configuration;
use crate::directives;
use crate::rule::File;
use crate::rules::{comment_directive, system};

/// The findings of `configuration`'s rules on a component or a module, in `ESLint`'s order, less
/// those directive comments turn off.
///
/// # Errors
///
/// The source does not parse.
pub fn lint(
    context: &DocumentContext<'_>,
    configuration: &Configuration,
) -> Result<Vec<Finding>, Diagnostic> {
    let file = File::new(context)?;
    let mut findings = Findings::new();
    findings.run(
        configuration
            .rules()
            .iter()
            .filter(|rule| rule.applies(&file)),
        &file,
    );
    let mut findings = findings.finish();
    let lines = context.line_index();
    let source = file.source();
    directives::apply_javascript(&mut findings, &file.javascript().comments, source, lines);
    let Some(component) = file.component() else {
        return Ok(findings);
    };
    let on = |name: &str| configuration.rules().iter().any(|r| r.name() == name);
    // Upstream's processor applies the plugin's directives after `ESLint`'s, in rule order.
    if on(comment_directive::RULE.name) {
        directives::template(component, source, lines).apply(
            &mut findings,
            lines,
            Some(comment_directive::RULE.name),
        );
    }
    if on(system::RULE.name) {
        let patterns = configuration.settings().ignored_rules();
        if !patterns.is_empty() {
            directives::ignored_in_template(component, patterns, lines).apply(
                &mut findings,
                lines,
                None,
            );
        }
    }
    Ok(findings)
}
