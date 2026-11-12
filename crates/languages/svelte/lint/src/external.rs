//! Rules a host function implements.
//!
//! The function is one of the configuration's runtime. It sees the document's path, its text and
//! its options, and returns reports with `ESLint`'s UTF-16 ranges.

use rsvelte_kernel::source::positions::{LineBreaks, LineIndex, Span};
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_plugin_interface::{TextContract, TextFunction};
use serde::Deserialize;

use crate::rule::{File, SvelteRule};

/// The function of a host rule.
///
/// It takes `(path, source, options)`: the document's absolute path, its text, and the JSON array
/// of the rule's options after its level. It returns a JSON array of reports: `{message, range:
/// [start, end], messageId?, fix?: {range, text}, suggestions?: [{message, fix}]}`, where a range
/// counts UTF-16 code units, as a JavaScript string does. A failure or an invalid report fails the
/// document, as a throwing `ESLint` rule does.
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
    #[serde(default)]
    suggestions: Vec<ExternalSuggestion>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ExternalFix {
    range: [u32; 2],
    text: String,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ExternalSuggestion {
    message: String,
    fix: ExternalFix,
}

impl SvelteRule for ExternalRule {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        match self.reports(file) {
            Ok(reports) => {
                for report in reports {
                    reporter.report(report);
                }
            }
            Err(why) => reporter.fail(why),
        }
    }
}

impl ExternalRule {
    fn reports(&self, file: &File<'_>) -> Result<Vec<Report>, String> {
        let path = std::path::absolute(file.path()).map_err(|e| e.to_string())?;
        let path = path.to_str().ok_or("the document's path is not UTF-8")?;
        let output = self
            .function
            .call(&[path, file.source(), &self.options])
            .map_err(|e| e.to_string())?;
        let reports: Vec<ExternalReport> =
            serde_json::from_str(&output).map_err(|e| format!("it returned {e}"))?;
        let lines = file.context.lines(LineBreaks::Newline);
        let fix = |fix: ExternalFix| {
            span(lines, fix.range)
                .map(|at| Fix::replace(at, fix.text))
                .ok_or_else(|| format!("it returned an invalid fix range {:?}", fix.range))
        };
        reports
            .into_iter()
            .map(|report| {
                let at = span(lines, report.range)
                    .ok_or_else(|| format!("it reported an invalid range {:?}", report.range))?;
                let mut out = Report::range(report.message, at);
                if let Some(id) = report.message_id {
                    out = out.message_id(id);
                }
                if let Some(external) = report.fix {
                    out = out.fix(fix(external)?);
                }
                for suggestion in report.suggestions {
                    out = out.suggest(Suggestion {
                        message_id: None,
                        message: suggestion.message,
                        fix: fix(suggestion.fix)?,
                    });
                }
                Ok(out)
            })
            .collect()
    }
}

fn span(lines: &LineIndex, [start, end]: [u32; 2]) -> Option<Span> {
    let (start, end) = (lines.byte(start)?, lines.byte(end)?);
    (start <= end).then(|| Span::new(start, end))
}
