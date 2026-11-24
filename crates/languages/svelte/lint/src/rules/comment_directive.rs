use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::Component;
use serde::Deserialize;

use crate::lint::directive_comments::{ESLINT, Kind, markup_directives};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

/// Turns on `<!-- eslint-disable -->` and its kin; `lint` applies them. With
/// `reportUnusedDisableDirectives` it reports every directive, and `lint` drops the reports of
/// those that turned something off, as upstream's processor does.
pub(crate) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/comment-directive",
    files: Files::Components,
    category: Category::Correctness,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    #[serde(default)]
    report_unused_disable_directives: bool,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(CommentDirective {
        report_unused: options.report_unused_disable_directives,
    }))
}

#[derive(Debug)]
struct CommentDirective {
    report_unused: bool,
}

impl SvelteRule for CommentDirective {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !self.report_unused {
            return;
        }
        let component = file.component().expect("a component rule");
        for (message, span) in unused_reports(component, file.source(), ESLINT) {
            reporter.report(Report::range(message, span));
        }
    }
}

/// A report of each template directive with one of `prefixes`, as if it turned nothing off;
/// `lint` drops those of the directives that did.
pub(crate) fn unused_reports(
    component: &Component,
    source: &str,
    prefixes: &[&'static str],
) -> Vec<(String, Span)> {
    let mut out = Vec::new();
    for directive in markup_directives(component, source, prefixes) {
        let kind = directive.keyword();
        let enable = directive.kind == Kind::Enable;
        if directive.rules.is_empty() {
            let message = if enable {
                format!("Unused {kind} directive (reporting is not suppressed).")
            } else {
                format!("Unused {kind} directive (no problems were reported).")
            };
            out.push((message, directive.comment));
        }
        for &rule in &directive.rules {
            let name = rule.text(source);
            let message = if enable {
                format!("Unused {kind} directive (reporting from '{name}' is not suppressed).")
            } else {
                format!("Unused {kind} directive (no problems were reported from '{name}').")
            };
            out.push((message, rule));
        }
    }
    out
}
