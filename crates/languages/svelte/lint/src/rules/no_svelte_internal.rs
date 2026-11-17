use oxc_ast::AstKind;
use oxc_ast::ast::Expression;
use oxc_span::GetSpan;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::javascript::{span, walk};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-svelte-internal",
    files: Files::All,
    configure: without_options::<NoSvelteInternal>,
};

#[derive(Debug, Default)]
struct NoSvelteInternal;

impl SvelteRule for NoSvelteInternal {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        walk(file, |node| {
            let module = match node.kind() {
                AstKind::ImportDeclaration(import) => &import.source,
                AstKind::ExportFromDeclaration(export) => &export.source,
                AstKind::ExportAllDeclaration(export) => &export.source,
                AstKind::ImportExpression(import) => match &import.source {
                    Expression::StringLiteral(source) => source,
                    _ => return,
                },
                _ => return,
            };
            let Some(value) = module.value.as_str() else {
                return;
            };
            if value == "svelte/internal" || value.starts_with("svelte/internal/") {
                reporter.report(Report::range(
                    "Using svelte/internal is prohibited. This will be removed in Svelte 6.",
                    span(node.kind().span()),
                ));
            }
        });
    }
}
