//! One unit's official output against rsvelte's, for one task and variant.
//!
//! Each official file is paired with the rsvelte file of the same name, except that the compiler's
//! `warnings.json` is paired with rsvelte's diagnostics and `lint.txt` with `lint.json`. JavaScript
//! is compared as a syntax tree, lint findings by the rules rsvelte ran, JSON as values and the
//! rest as bytes. An official `error.*` means the official tool rejected the unit. Where
//! JavaScript's comments are is a verdict of its own.

mod comments;
mod javascript;
mod source_map;
mod syntax_tree;

pub(crate) use javascript::Parentheses;
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
    /// Both rejected the unit for a JavaScript syntax error, which oxc and acorn word and place
    /// apart.
    JavascriptEquivalent,
    /// Not compared: the official tool rejected the unit. Only a comment verdict says so; the
    /// task's own verdict judges the rejection.
    OfficialRejected,
    /// Not compared: `units.toml` skips the unit for the task. Only a comment verdict says so.
    Skipped,
    Match,
}

impl Verdict {
    pub(crate) const ALL: [Self; 10] = [
        Self::Panicked,
        Self::Refused,
        Self::Unparseable,
        Self::Mismatch,
        Self::Missing,
        Self::Unexpected,
        Self::JavascriptEquivalent,
        Self::OfficialRejected,
        Self::Skipped,
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
            Self::JavascriptEquivalent => "js-equivalent",
            Self::OfficialRejected => "official-rejected",
            Self::Skipped => "skipped",
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

/// The unit's verdict, or `None` when neither side has output for it.
///
/// # Errors
///
/// An official file cannot be read as what its name says: the corpus is broken.
pub(crate) fn verdict(
    official: &[Entry<'_>],
    ours: Option<&Ours<'_>>,
    parentheses: Parentheses,
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
                error_verdict(error.body, diagnostics)?
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
            "ast.sha256" => file(ours.output, "ast.json"),
            name => file(ours.output, name),
        };
        let v = match actual {
            None => Verdict::Missing,
            Some(actual) => compare(e.attributes, e.body, actual, parentheses)
                .map_err(|why| format!("official {} of {}: {why}", e.attributes, e.path))?,
        };
        worst = worst.min(v);
    }
    let paired = |name: &str| {
        let official_name = match name {
            "lint.json" => "lint.txt",
            "ast.json" => "ast.sha256",
            name => name,
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
    same_json(official.body, actual)
        .map_err(|e| format!("official {name} of {}: not JSON: {e}", official.path))
}

/// Where the comments of a unit's JavaScript are, against the official output: `Missing` when
/// only the official output has places the other lacks, `Unexpected` when only rsvelte's does,
/// `Mismatch` when both. A unit that is not compared says why; `None` when the official tool
/// wrote nothing for it.
///
/// # Errors
///
/// The official JavaScript does not parse.
pub(crate) fn comments_verdict(
    official: &[Entry<'_>],
    ours: Option<&TaskOutput>,
) -> Result<Option<Verdict>, String> {
    if official.iter().any(|e| e.attributes.starts_with("error.")) {
        return Ok(Some(Verdict::OfficialRejected));
    }
    let Some(official) = official.iter().find(|e| e.attributes == "js") else {
        return Ok(None);
    };
    let Some(actual) = ours.and_then(|o| file(o, "js")) else {
        return Ok(Some(Verdict::Refused));
    };
    match comments::difference(official.body, actual) {
        Ok(d) => Ok(Some(match (d.missing > 0, d.extra > 0) {
            (false, false) => Verdict::Match,
            (true, false) => Verdict::Missing,
            (false, true) => Verdict::Unexpected,
            (true, true) => Verdict::Mismatch,
        })),
        Err(Unparsed::Actual(_)) => Ok(Some(Verdict::Unparseable)),
        Err(Unparsed::Expected(e)) => Err(format!(
            "official js of {}: does not parse: {e}",
            official.path
        )),
    }
}

/// Whether rsvelte's source map gives each identifier of its JavaScript the origin the official
/// map gives the same identifier: `Missing` when only the official map gives some an origin,
/// `Unexpected` when only rsvelte's does, `Mismatch` when the two give one different origins or
/// both of the others happen. `official` is the official compile's entries and `map` its
/// `js.map`. A unit that is not compared says why; `None` when the official tool wrote no map.
///
/// # Errors
///
/// The official JavaScript or map does not parse.
pub(crate) fn source_map_verdict(
    official: &[Entry<'_>],
    map: Option<&Entry<'_>>,
    ours: Option<&TaskOutput>,
) -> Result<Option<Verdict>, String> {
    if official.iter().any(|e| e.attributes.starts_with("error.")) {
        return Ok(Some(Verdict::OfficialRejected));
    }
    let (Some(javascript), Some(map)) = (official.iter().find(|e| e.attributes == "js"), map)
    else {
        return Ok(None);
    };
    let (Some(actual), Some(actual_map)) = (
        ours.and_then(|o| file(o, "js")),
        ours.and_then(|o| file(o, "js.map")),
    ) else {
        return Ok(Some(Verdict::Refused));
    };
    let expected = source_map::Mapped {
        javascript: javascript.body,
        map: map.body,
    };
    let actual = source_map::Mapped {
        javascript: actual,
        map: actual_map,
    };
    match source_map::difference(expected, actual) {
        Ok(d) => Ok(Some(match (d.missing > 0, d.extra > 0, d.moved > 0) {
            (false, false, false) => Verdict::Match,
            (true, false, false) => Verdict::Missing,
            (false, true, false) => Verdict::Unexpected,
            _ => Verdict::Mismatch,
        })),
        Err(Unparsed::Actual(_)) => Ok(Some(Verdict::Unparseable)),
        Err(Unparsed::Expected(e)) => Err(format!(
            "official js or map of {}: does not parse: {e}",
            javascript.path
        )),
    }
}

fn file<'a>(output: &'a TaskOutput, name: &str) -> Option<&'a str> {
    output
        .files
        .iter()
        .find(|f| f.name == name)
        .map(|f| f.text.as_str())
}

/// Two JSON texts compared as values; an actual text that is not JSON does not match. Two that
/// differ only in the words and places of JavaScript syntax errors are
/// [`Verdict::JavascriptEquivalent`].
fn same_json(official: &str, actual: &str) -> Result<Verdict, serde_json::Error> {
    let parse = serde_json::from_str::<serde_json::Value>;
    let mut official = parse(official)?;
    let Ok(mut actual) = parse(actual) else {
        return Ok(Verdict::Mismatch);
    };
    if actual == official {
        return Ok(Verdict::Match);
    }
    blank_javascript_errors(&mut official);
    blank_javascript_errors(&mut actual);
    Ok(if actual == official {
        Verdict::JavascriptEquivalent
    } else {
        Verdict::Mismatch
    })
}

/// Where Svelte names a JavaScript syntax error by its documentation link.
const JAVASCRIPT_ERROR_LINK: &str = "https://svelte.dev/e/js_parse_error";

/// Drops the message and the place of every diagnostic in `value` that is a JavaScript syntax
/// error.
fn blank_javascript_errors(value: &mut serde_json::Value) {
    match value {
        serde_json::Value::Array(items) => items.iter_mut().for_each(blank_javascript_errors),
        serde_json::Value::Object(fields) => {
            let javascript = (fields.get("message").and_then(serde_json::Value::as_str))
                .is_some_and(|message| message.contains(JAVASCRIPT_ERROR_LINK));
            if javascript {
                for key in ["message", "start", "end"] {
                    fields.remove(key);
                }
            }
            fields.values_mut().for_each(blank_javascript_errors);
        }
        _ => {}
    }
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
    parentheses: Parentheses,
) -> Result<Verdict, String> {
    match name {
        "js" => match javascript::same_tree(official, actual, parentheses) {
            Ok(equal) => Ok(same(equal)),
            Err(Unparsed::Actual(_)) => Ok(Verdict::Unparseable),
            Err(Unparsed::Expected(e)) => Err(format!("does not parse: {e}")),
        },
        "lint.txt" => lint(official, actual),
        // An AST that is not JSON is rsvelte's to fix.
        "ast.sha256" => {
            Ok(syntax_tree::same_hash(official, actual).map_or(Verdict::Unparseable, same))
        }
        "warnings.json" => same_diagnostics(official, actual).map(same),
        _ if name.ends_with("json") => {
            same_json(official, actual).map_err(|e| format!("not JSON: {e}"))
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

/// The official compile error against rsvelte's first diagnostic. A JavaScript syntax error is
/// the parser's to word and place, so two of them agree on the code alone.
fn error_verdict(official: &str, actual: &str) -> Result<Verdict, String> {
    let official: Diagnostic =
        serde_json::from_str(official).map_err(|e| format!("official error.json: {e}"))?;
    let actual: Vec<Diagnostic> = serde_json::from_str(actual).map_err(|e| e.to_string())?;
    let Some(first) = actual.first() else {
        return Ok(Verdict::Mismatch);
    };
    Ok(if *first == official {
        Verdict::Match
    } else if first.code == JAVASCRIPT_PARSE_ERROR && official.code == JAVASCRIPT_PARSE_ERROR {
        Verdict::JavascriptEquivalent
    } else {
        Verdict::Mismatch
    })
}

const JAVASCRIPT_PARSE_ERROR: &str = "js_parse_error";

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
    /// The finding as a `lint.txt` line (tools/oracle/tasks/eslint.ts).
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
/// fatal parse error). A rule outside the official configuration runs on both sides only when
/// the unit's own configuration comment turns it on, so its findings are compared too.
fn lint(official: &str, actual: &str) -> Result<Verdict, String> {
    let Ok(actual) = serde_json::from_str::<LintFile>(actual) else {
        return Ok(Verdict::Mismatch);
    };
    let mut wanted = Vec::new();
    for line in official.lines() {
        let mut fields = line.splitn(4, ' ');
        let (Some(_), Some(_), Some(rule), Some(_)) =
            (fields.next(), fields.next(), fields.next(), fields.next())
        else {
            return Err(format!("lint.txt line {line:?}"));
        };
        let ran = |rule: &str| actual.rules.iter().any(|r| r == rule);
        let wanted_line = if rule == "-" {
            // Whether a rule rsvelte did not run reported nothing is not rsvelte's to say.
            unused_directive_rule(line).is_none_or(ran)
        } else {
            ran(rule)
        };
        if wanted_line {
            wanted.push(line);
        }
    }
    let mut actual: Vec<String> = actual.findings.iter().map(Finding::line).collect();
    let mut wanted: Vec<String> = wanted.into_iter().map(str::to_owned).collect();
    // ESLint orders findings at one position by when each rule reported during its walk, which
    // says nothing about what was found.
    sort_ties(&mut wanted);
    sort_ties(&mut actual);
    if wanted == actual {
        return Ok(Verdict::Match);
    }
    // A syntax error's place also orders it among the other findings, so they are set apart.
    let parts = |lines: &[String]| -> (Vec<String>, Vec<String>) {
        let (mut javascript, rest): (Vec<String>, Vec<String>) = lines
            .iter()
            .cloned()
            .partition(|line| javascript_error_rule(line).is_some());
        javascript = javascript
            .iter()
            .filter_map(|line| javascript_error_rule(line))
            .map(str::to_owned)
            .collect();
        javascript.sort_unstable();
        (javascript, rest)
    };
    Ok(if parts(&wanted) == parts(&actual) {
        Verdict::JavascriptEquivalent
    } else {
        Verdict::Mismatch
    })
}

/// The rule of a `lint.txt` line that reports a JavaScript syntax error, as a fatal parse error
/// and `svelte/valid-compile` do.
fn javascript_error_rule(line: &str) -> Option<&str> {
    let mut fields = line.splitn(4, ' ');
    let (Some(_), Some(_), Some(rule), Some(message)) =
        (fields.next(), fields.next(), fields.next(), fields.next())
    else {
        return None;
    };
    message.contains(JAVASCRIPT_ERROR_LINK).then_some(rule)
}

/// Sorts each run of lines that start at the same position, keeping the runs in order.
fn sort_ties(lines: &mut [String]) {
    let start = |line: &String| line.split(' ').next().unwrap_or_default().to_owned();
    for run in lines.chunk_by_mut(|a, b| start(a) == start(b)) {
        run.sort_unstable();
    }
}

/// The rule an `ESLint` report of an unused `eslint-disable` directive names, from its message.
fn unused_directive_rule(line: &str) -> Option<&str> {
    let message = line.splitn(4, ' ').nth(3)?;
    message
        .strip_prefix("\"Unused eslint-disable directive (no problems were reported from '")?
        .strip_suffix("').\"")
}

#[cfg(test)]
mod tests;
