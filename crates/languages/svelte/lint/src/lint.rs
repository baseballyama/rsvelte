use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::LineBreaks;
use rsvelte_lint_runner::finding::Finding;
use rsvelte_lint_runner::findings::Findings;

use crate::Configuration;
use crate::configuration::Directives;
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
    check(&File::new(context, configuration.globals())?, configuration)
        .map(|(findings, _)| findings)
}

/// [`lint`] of a parsed document, with the rules that ran.
pub(crate) fn check(
    file: &File<'_>,
    configuration: &Configuration,
) -> Result<(Vec<Finding>, FileRules), Diagnostic> {
    let source = file.source();
    let comments = file.comments();
    let rules = FileRules::new(
        configuration,
        configuration_comments::settings(comments, source),
    );
    let mut findings = Findings::new();
    findings.run(rules.running(configuration, file), file);
    let mut findings = findings.finish()?;
    // Directive lines are `ESLint`'s, which any ECMAScript line terminator ends.
    let lines = || file.context.lines(LineBreaks::Ecmascript);
    let on = |name: &str| rules.running(configuration, file).any(|r| r.name == name);
    let directives = configuration.applied_directives();
    let unused = match directives {
        Directives::Eslint => javascript::apply(&mut findings, comments, source, &lines, on),
        Directives::Oxlint { .. } => Vec::new(),
    };
    // The processor keeps a report without a rule, so the unused reports join after it.
    let add_unused = |mut findings: Vec<Finding>| {
        if !unused.is_empty() {
            findings.extend(unused);
            findings.sort_by_key(|f| f.diagnostic.span.start_offset);
        }
        findings
    };
    let Some(component) = file.component() else {
        return Ok((add_unused(findings), rules));
    };
    // Upstream's processor applies the plugin's directives after `ESLint`'s, in rule order.
    match directives {
        Directives::Eslint if on(comment_directive::RULE.name) => {
            processor::template(component, source, lines(), ESLINT).apply(
                &mut findings,
                lines(),
                Some(comment_directive::RULE.name),
            );
        }
        Directives::Eslint => {}
        Directives::Oxlint { report_unused } => {
            let name = comment_directive::RULE.name;
            if let Some(severity) = report_unused {
                let reports = comment_directive::unused_reports(component, source, OXLINT);
                findings.extend(reports.into_iter().map(|(message, span)| {
                    Finding::from(Diagnostic {
                        severity,
                        code: name.into(),
                        message,
                        span,
                        has_end: true,
                    })
                }));
                findings.sort_by_key(|f| f.diagnostic.span.start_offset);
            }
            processor::template(component, source, lines(), OXLINT).apply(
                &mut findings,
                lines(),
                report_unused.map(|_| name),
            );
        }
    }
    if on(system::RULE.name) {
        let patterns = configuration.settings().ignored_rules();
        if !patterns.is_empty() {
            processor::ignored_in_template(component, patterns, lines()).apply(
                &mut findings,
                lines(),
                None,
            );
        }
    }
    Ok((add_unused(findings), rules))
}

mod configuration_comments;
pub(crate) mod directive_comments;
pub(crate) mod global_comments;
pub(crate) use configuration_comments::FileRules;
use directive_comments::{ESLINT, OXLINT, javascript, processor};

#[cfg(test)]
mod tests;
