use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::{Document, DocumentError};
use rsvelte_kernel::source::positions::{LineBreaks, Span};
use rsvelte_lint_runner::finding::Finding;
use rsvelte_lint_runner::findings::Findings;

use crate::rule::File;
use crate::rules::{comment_directive, system};
use crate::{Configuration, directives};

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
    let lines = file.context.lines(LineBreaks::Ecmascript);
    directives::apply_javascript(&mut findings, &comments, source, lines);
    let Some(component) = file.component() else {
        return Ok((findings, rules));
    };
    let on = |name: &str| rules.running(configuration, file).any(|r| r.name == name);
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
    Ok((findings, rules))
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

/// Lints one source, as `ESLint`'s `Linter.verify(code, config, filename)` does with
/// `eslint-plugin-svelte`. `filename` is where rules that look at the path read it.
///
/// # Errors
///
/// The source does not parse, or is too long for 32-bit positions.
pub fn verify(
    source_text: &str,
    configuration: &Configuration,
    filename: &str,
) -> Result<Vec<Finding>, Diagnostic> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new(filename.to_owned(), source_text.to_owned()).map_err(
        |DocumentError::TooLarge(n)| {
            Diagnostic::error(
                "svelte.lint.too_large",
                format!("the source is {n} bytes, too long for 32-bit positions"),
                Span::new(0, 0),
            )
        },
    )?;
    lint(
        &DocumentContext::new(&document, registry.artifacts()),
        configuration,
    )
}

mod configuration_comments;
pub(crate) use configuration_comments::FileRules;

#[cfg(test)]
mod tests;
