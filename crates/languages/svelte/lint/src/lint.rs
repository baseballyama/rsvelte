use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::{LineBreaks, Span};
use rsvelte_lint_runner::finding::Finding;
use rsvelte_lint_runner::findings::Findings;

use crate::Configuration;
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
    let comments = comments(file);
    let rules = FileRules::new(
        configuration,
        configuration_comments::settings(&comments, source),
    );
    let mut findings = Findings::new();
    findings.run(rules.running(configuration, file), file);
    let mut findings = findings.finish()?;
    // Directive lines are `ESLint`'s, which any ECMAScript line terminator ends.
    let lines = || file.context.lines(LineBreaks::Ecmascript);
    let on = |name: &str| rules.running(configuration, file).any(|r| r.name == name);
    let unused = javascript::apply(&mut findings, &comments, source, &lines, on);
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
    if on(comment_directive::RULE.name) {
        processor::template(component, source, lines()).apply(
            &mut findings,
            lines(),
            Some(comment_directive::RULE.name),
        );
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

/// Every JavaScript comment of the document, the scripts' and the template's, in document order.
fn comments(file: &File<'_>) -> Vec<Span> {
    let tree = file.javascript();
    let mut out: Vec<Span> = file
        .programs()
        .into_iter()
        .flat_map(|program| &tree.get_program(program).comments)
        .chain(tree.comments())
        .map(|comment| Span::new(comment.span.start, comment.span.end))
        .collect();
    out.sort_unstable_by_key(|comment| comment.start_offset);
    out
}

mod configuration_comments;
pub(crate) mod directive_comments;
pub(crate) use configuration_comments::FileRules;
use directive_comments::{javascript, processor};

#[cfg(test)]
mod tests;
