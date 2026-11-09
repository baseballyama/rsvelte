//! One unit's official output against rsvelte's, for one task and variant.
//!
//! Each official file is paired with the rsvelte file of the same name, except that the compiler's
//! `warnings.json` is paired with rsvelte's diagnostics and `lint.txt` with `lint.json`. JavaScript
//! is compared as a syntax tree, lint findings by the rules rsvelte ran, JSON as values and the
//! rest as bytes. An official `error.*` means the official tool rejected the unit.

mod javascript;

use javascript::Unparsed;
use rsvelte_kernel::computation::task::TaskOutput;
use serde::Deserialize;

use crate::pack::Entry;

/// A unit's verdict for one task and variant, from worst to best.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug, Hash)]
pub(crate) enum Verdict {
    /// A task panicked on the unit.
    Panicked,
    /// rsvelte rejected a unit the official tool accepted.
    Refused,
    /// rsvelte's JavaScript does not parse.
    Unparseable,
    Mismatch,
    /// The official tool wrote a file that rsvelte did not.
    Missing,
    /// rsvelte wrote a file that the official tool did not, or accepted what it rejected.
    Unexpected,
    Match,
}

impl Verdict {
    pub(crate) const ALL: [Self; 7] = [
        Self::Panicked,
        Self::Refused,
        Self::Unparseable,
        Self::Mismatch,
        Self::Missing,
        Self::Unexpected,
        Self::Match,
    ];

    pub(crate) const fn label(self) -> &'static str {
        match self {
            Self::Panicked => "panicked",
            Self::Refused => "refused",
            Self::Unparseable => "unparseable",
            Self::Mismatch => "mismatch",
            Self::Missing => "missing",
            Self::Unexpected => "unexpected",
            Self::Match => "match",
        }
    }

    pub(crate) fn from_label(label: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|v| v.label() == label)
    }
}

/// What rsvelte made of the unit for the task: its files, and its diagnostics as
/// `task_files::diagnostics_json` writes them.
pub(crate) struct Ours<'a> {
    pub(crate) output: &'a TaskOutput,
    pub(crate) diagnostics: Option<String>,
}

/// The unit's verdict, or `None` when neither side has output for it. `lint_rules` are the rules
/// the official linter ran.
///
/// # Errors
///
/// An official file cannot be read as what its name says: the corpus is broken.
pub(crate) fn verdict(
    official: &[Entry<'_>],
    ours: Option<&Ours<'_>>,
    lint_rules: &[String],
) -> Result<Option<Verdict>, String> {
    let wrote = ours.is_some_and(|o| !o.output.files.is_empty());
    let rejected = ours.is_some_and(|o| !wrote && o.diagnostics.is_some());
    if official.is_empty() {
        return Ok((wrote || rejected).then_some(Verdict::Unexpected));
    }
    if let Some(error) = official.iter().find(|e| e.attributes.starts_with("error.")) {
        return Ok(Some(match ours.and_then(|o| o.diagnostics.as_deref()) {
            _ if wrote => Verdict::Unexpected,
            None => Verdict::Missing,
            Some(diagnostics) if error.attributes == "error.json" => {
                same(same_error(error.body, diagnostics)?)
            }
            Some(_) => Verdict::Match,
        }));
    }
    if rejected {
        return Ok(Some(Verdict::Refused));
    }
    let Some(ours) = ours.filter(|_| wrote) else {
        return Ok(Some(Verdict::Missing));
    };
    let mut worst = Verdict::Match;
    for e in official {
        let actual = match e.attributes {
            "warnings.json" => ours.diagnostics.as_deref(),
            "lint.txt" => file(ours.output, "lint.json"),
            name => file(ours.output, name),
        };
        let v = match actual {
            None => Verdict::Missing,
            Some(actual) => compare(e.attributes, e.body, actual, lint_rules)
                .map_err(|why| format!("official {} of {}: {why}", e.attributes, e.path))?,
        };
        worst = worst.min(v);
    }
    let paired = |name: &str| {
        let official_name = if name == "lint.json" {
            "lint.txt"
        } else {
            name
        };
        official.iter().any(|e| e.attributes == official_name)
    };
    let extra_file = ours.output.files.iter().any(|f| !paired(&f.name));
    let extra_warnings = ours.diagnostics.is_some() && !paired("warnings.json");
    if extra_file || extra_warnings {
        worst = worst.min(Verdict::Unexpected);
    }
    Ok(Some(worst))
}

/// One file of a unit: the official one against the one rsvelte's task wrote, JSON as values and
/// the rest as bytes. Neither file matches, as both tools found nothing to write.
///
/// # Errors
///
/// The official file is not the JSON its name says.
pub(crate) fn file_verdict(
    official: Option<&Entry<'_>>,
    ours: Option<&TaskOutput>,
    name: &str,
) -> Result<Verdict, String> {
    let (official, actual) = match (official, ours.and_then(|o| file(o, name))) {
        (None, None) => return Ok(Verdict::Match),
        (None, Some(_)) => return Ok(Verdict::Unexpected),
        (Some(_), None) => return Ok(Verdict::Missing),
        (Some(e), Some(actual)) => (e, actual),
    };
    if !name.ends_with("json") {
        return Ok(same(official.body == actual));
    }
    let parse = serde_json::from_str::<serde_json::Value>;
    let expected = parse(official.body)
        .map_err(|e| format!("official {name} of {}: not JSON: {e}", official.path))?;
    Ok(same(parse(actual).is_ok_and(|actual| actual == expected)))
}

fn file<'a>(output: &'a TaskOutput, name: &str) -> Option<&'a str> {
    output
        .files
        .iter()
        .find(|f| f.name == name)
        .map(|f| f.text.as_str())
}

const fn same(equal: bool) -> Verdict {
    if equal {
        Verdict::Match
    } else {
        Verdict::Mismatch
    }
}

/// `Err` when the official text itself is not what its name says.
fn compare(
    name: &str,
    official: &str,
    actual: &str,
    lint_rules: &[String],
) -> Result<Verdict, String> {
    match name {
        "js" => match javascript::same_tree(official, actual) {
            Ok(equal) => Ok(same(equal)),
            Err(Unparsed::Actual(_)) => Ok(Verdict::Unparseable),
            Err(Unparsed::Expected(e)) => Err(format!("does not parse: {e}")),
        },
        "lint.txt" => lint(official, actual, lint_rules).map(same),
        "warnings.json" => same_diagnostics(official, actual).map(same),
        _ if name.ends_with("json") => {
            let parse = serde_json::from_str::<serde_json::Value>;
            let official = parse(official).map_err(|e| format!("not JSON: {e}"))?;
            Ok(same(parse(actual).is_ok_and(|actual| actual == official)))
        }
        _ => Ok(same(official == actual)),
    }
}

#[derive(Deserialize, PartialEq, Eq, Debug)]
struct Position {
    line: u32,
    column: u32,
}

/// What a user sees of a diagnostic: the frame and the offset are left out.
#[derive(Deserialize, PartialEq, Eq, Debug)]
struct Diagnostic {
    code: String,
    message: String,
    start: Option<Position>,
    end: Option<Position>,
}

/// The official compiler's warnings against rsvelte's diagnostics.
fn same_diagnostics(official: &str, actual: &str) -> Result<bool, String> {
    let official: Vec<Diagnostic> = serde_json::from_str(official).map_err(|e| e.to_string())?;
    let actual: Vec<Diagnostic> = serde_json::from_str(actual).map_err(|e| e.to_string())?;
    Ok(official == actual)
}

/// The official compile error against rsvelte's first diagnostic.
fn same_error(official: &str, actual: &str) -> Result<bool, String> {
    let official: Diagnostic =
        serde_json::from_str(official).map_err(|e| format!("official error.json: {e}"))?;
    let actual: Vec<Diagnostic> = serde_json::from_str(actual).map_err(|e| e.to_string())?;
    Ok(actual.first() == Some(&official))
}

#[derive(Deserialize)]
struct LintFile {
    rules: Vec<String>,
    findings: Vec<Finding>,
}

#[derive(Deserialize)]
struct Finding {
    rule: Option<String>,
    message: String,
    start: Position,
    end: Option<Position>,
}

impl Finding {
    /// The finding as a `lint.txt` line (tools/oracle/tasks/lint-shared.ts).
    fn line(&self) -> String {
        let end = self
            .end
            .as_ref()
            .map_or_else(|| "-".to_owned(), |e| format!("{}:{}", e.line, e.column));
        let message = serde_json::to_string(&self.message).expect("a string serializes");
        format!(
            "{}:{} {end} {} {message}",
            self.start.line,
            self.start.column,
            self.rule.as_deref().unwrap_or("-"),
        )
    }
}

/// The official linter runs every plugin rule and rsvelte the rules it has. They agree when
/// rsvelte's findings are the official findings of those rules, plus the ones without a rule (a
/// fatal parse error). A rule the official linter did not run disagrees.
fn lint(official: &str, actual: &str, official_rules: &[String]) -> Result<bool, String> {
    let Ok(actual) = serde_json::from_str::<LintFile>(actual) else {
        return Ok(false);
    };
    if actual.rules.iter().any(|r| !official_rules.contains(r)) {
        return Ok(false);
    }
    let mut wanted = Vec::new();
    for line in official.lines() {
        let mut fields = line.splitn(4, ' ');
        let (Some(_), Some(_), Some(rule), Some(_)) =
            (fields.next(), fields.next(), fields.next(), fields.next())
        else {
            return Err(format!("lint.txt line {line:?}"));
        };
        if rule == "-" || actual.rules.iter().any(|r| r == rule) {
            wanted.push(line);
        }
    }
    Ok(wanted.len() == actual.findings.len()
        && wanted
            .iter()
            .zip(&actual.findings)
            .all(|(w, a)| *w == a.line()))
}

#[cfg(test)]
mod tests;
