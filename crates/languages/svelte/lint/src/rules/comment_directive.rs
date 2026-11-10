use rsvelte_lint_runner::rule::{Report, Reporter};
use serde::Deserialize;

use crate::directives::{Kind, html_directives};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

/// Turns on `<!-- eslint-disable -->` and its kin; `lint` applies them. With
/// `reportUnusedDisableDirectives` it reports every directive, and `lint` drops the reports of
/// those that turned something off, as upstream's processor does.
pub(crate) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/comment-directive",
    files: Files::Components,
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
        let source = file.source();
        for directive in html_directives(component, source) {
            let kind = directive.kind.keyword();
            let enable = directive.kind == Kind::Enable;
            if directive.rules.is_empty() {
                let (id, message) = if enable {
                    (
                        "unusedEnable",
                        format!("Unused {kind} directive (reporting is not suppressed)."),
                    )
                } else {
                    (
                        "unused",
                        format!("Unused {kind} directive (no problems were reported)."),
                    )
                };
                reporter.report(Report::range(message, directive.comment).message_id(id));
            }
            for &rule in &directive.rules {
                let name = rule.text(source);
                let (id, message) = if enable {
                    (
                        "unusedEnableRule",
                        format!(
                            "Unused {kind} directive (reporting from '{name}' is not suppressed)."
                        ),
                    )
                } else {
                    (
                        "unusedRule",
                        format!(
                            "Unused {kind} directive (no problems were reported from '{name}')."
                        ),
                    )
                };
                reporter.report(Report::range(message, rule).message_id(id));
            }
        }
    }
}
