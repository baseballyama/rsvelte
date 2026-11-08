//! Rules a host function implements.
//!
//! The function is one of the configuration's runtime or a symbol of a native library. It sees the
//! document's path, its text and its options, and returns reports with `ESLint`'s UTF-16 ranges.

use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_plugin_interface::{TextContract, TextFunction};
use serde::Deserialize;

use crate::rule::{File, SvelteRule};

/// The function of a host rule.
///
/// It takes `(path, source, options)`, where `options` is the JSON array of the rule's options
/// after its level. It returns a JSON array of reports: `{message, range: [start, end], messageId?,
/// fix?: {range, text}}`, where a range counts UTF-16 code units, as a JavaScript string does.
pub static CONTRACT: TextContract = TextContract {
    identifier: "svelte.lint.rule",
    version: 1,
    arguments: &["path", "source", "options"],
};

#[derive(Debug)]
pub(crate) struct ExternalRule {
    pub(crate) function: TextFunction,
    /// The options as the function receives them.
    pub(crate) options: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ExternalReport {
    message: String,
    range: [u32; 2],
    message_id: Option<String>,
    fix: Option<ExternalFix>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ExternalFix {
    range: [u32; 2],
    text: String,
}

impl SvelteRule for ExternalRule {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        // A failing function is reported at the start, never dropped.
        let failed = |reporter: &mut Reporter<'_>, why: String| {
            reporter.report(Report::point(why, 0));
        };
        let output = match self
            .function
            .call(&[file.path(), file.source(), &self.options])
        {
            Ok(output) => output,
            Err(error) => return failed(reporter, format!("the rule failed: {error}")),
        };
        let reports: Vec<ExternalReport> = match serde_json::from_str(&output) {
            Ok(reports) => reports,
            Err(error) => return failed(reporter, format!("the rule returned {error}")),
        };
        let lines = file.context.line_index();
        for report in reports {
            let Some(at) = span(lines, report.range) else {
                failed(
                    reporter,
                    format!("the rule reported an invalid range {:?}", report.range),
                );
                continue;
            };
            let mut out = Report::range(report.message, at);
            if let Some(id) = report.message_id {
                out = out.message_id(id);
            }
            if let Some(external) = report.fix {
                let Some(edit) = span(lines, external.range) else {
                    failed(
                        reporter,
                        format!(
                            "the rule returned an invalid fix range {:?}",
                            external.range
                        ),
                    );
                    continue;
                };
                out = out.fix(Fix::replace(edit, external.text));
            }
            reporter.report(out);
        }
    }
}

fn span(lines: &LineIndex, [start, end]: [u32; 2]) -> Option<Span> {
    let (start, end) = (lines.byte(start)?, lines.byte(end)?);
    (start <= end).then(|| Span::new(start, end))
}
