//! A corpus unit against the official output, and the parity ratchet over the verdicts.
//!
//! For one task and variant, each file name either side has is a row: `missing` (only the
//! official tool wrote it), `unexpected` (only rsvelte did), or a comparison. JavaScript is
//! compared as a syntax tree, `lint.json` by the rules rsvelte ran, other JSON as values, and the
//! rest as bytes. A unit where the official tool reported an error is compared only on its
//! `error.json`. The unit's verdict is its worst row; a unit where rsvelte wrote only diagnostics
//! and the official tool wrote output is refused, and not in the ratchet.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use rsvelte_kernel::output::task_files;
use serde::Deserialize;

use crate::javascript::{self, Unparsed};

const ERROR: &str = "error.json";
const LINT: &str = "lint.json";

/// A unit's verdict for one task and variant, from best to worst.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub(crate) enum Verdict {
    Match,
    Unexpected,
    Missing,
    Mismatch,
    Unparseable,
}

impl Verdict {
    pub(crate) const ALL: [Self; 5] = [
        Self::Match,
        Self::Unexpected,
        Self::Missing,
        Self::Mismatch,
        Self::Unparseable,
    ];

    pub(crate) const fn label(self) -> &'static str {
        match self {
            Self::Match => "match",
            Self::Unexpected => "unexpected",
            Self::Missing => "missing",
            Self::Mismatch => "mismatch",
            Self::Unparseable => "unparseable",
        }
    }
}

/// One file of a unit for one task and variant: its extension and verdict.
pub(crate) type Row = (String, Verdict);

/// The unit's rows for the snapshot whose files start with `prefix` (`<task>/<variant>.`).
/// `existing` lists the official files, relative to `expected`; `produced` holds rsvelte's.
pub(crate) fn rows(
    expected: &Path,
    prefix: &str,
    existing: &[String],
    produced: &[(String, String)],
) -> Result<Vec<Row>, String> {
    let official: Vec<&str> = existing
        .iter()
        .filter_map(|n| n.strip_prefix(prefix))
        .collect();
    let ours: Vec<(&str, &str)> = produced
        .iter()
        .filter_map(|(n, t)| n.strip_prefix(prefix).map(|e| (e, t.as_str())))
        .collect();
    let mut extensions: Vec<&str> = if official.contains(&ERROR) {
        vec![ERROR]
    } else {
        official
            .iter()
            .copied()
            .chain(ours.iter().map(|(e, _)| *e))
            .collect()
    };
    extensions.sort_unstable();
    extensions.dedup();
    let mut rows = Vec::with_capacity(extensions.len());
    for extension in extensions {
        let actual = ours.iter().find(|(e, _)| *e == extension).map(|(_, t)| *t);
        let verdict = match (official.contains(&extension), actual) {
            (false, None) => continue,
            (true, None) => Verdict::Missing,
            (false, Some(_)) => Verdict::Unexpected,
            (true, Some(actual)) => {
                let path = expected.join(format!("{prefix}{extension}"));
                let official = std::fs::read_to_string(&path)
                    .map_err(|e| format!("{}: {e}", path.display()))?;
                compare(extension, &official, actual)
                    .map_err(|e| format!("{}: {e}", path.display()))?
            }
        };
        rows.push((extension.to_owned(), verdict));
    }
    Ok(rows)
}

/// The unit's verdict, or `None` when rsvelte refused it.
pub(crate) fn verdict(rows: &[Row]) -> Option<Verdict> {
    let diagnostics = |e: &str| e == task_files::DIAGNOSTICS;
    let refused = rows.iter().any(|(e, _)| diagnostics(e))
        && rows
            .iter()
            .all(|(e, v)| *v == Verdict::Missing || (*v == Verdict::Unexpected && diagnostics(e)));
    (!refused).then(|| rows.iter().map(|(_, v)| *v).max().unwrap_or(Verdict::Match))
}

/// `Err` when the official file itself cannot be read as what its extension says.
fn compare(extension: &str, official: &str, actual: &str) -> Result<Verdict, String> {
    let same = |equal: bool| {
        if equal {
            Verdict::Match
        } else {
            Verdict::Mismatch
        }
    };
    if extension == "js" {
        return match javascript::same_tree(official, actual) {
            Ok(equal) => Ok(same(equal)),
            Err(Unparsed::Actual(_)) => Ok(Verdict::Unparseable),
            Err(Unparsed::Expected(e)) => Err(format!("the official output does not parse: {e}")),
        };
    }
    if !extension.ends_with("json") {
        return Ok(same(official == actual));
    }
    let parse = |text: &str| serde_json::from_str::<serde_json::Value>(text);
    let official = parse(official).map_err(|e| format!("the official output is not JSON: {e}"))?;
    let Ok(actual) = parse(actual) else {
        return Ok(Verdict::Unparseable);
    };
    if extension == LINT {
        return lint(official, actual).map(same);
    }
    Ok(same(official == actual))
}

#[derive(Deserialize)]
struct LintFile {
    rules: Vec<String>,
    findings: Vec<serde_json::Value>,
}

/// The official linter runs every rule and rsvelte the rules it has, and says which. They agree
/// when rsvelte's findings are the official findings of those rules, plus the ones without a rule
/// (a fatal parse error, an unused disable directive). A rule the official linter did not run
/// disagrees.
fn lint(official: serde_json::Value, actual: serde_json::Value) -> Result<bool, String> {
    let official: LintFile =
        serde_json::from_value(official).map_err(|e| format!("official lint.json: {e}"))?;
    let Ok(actual) = serde_json::from_value::<LintFile>(actual) else {
        return Ok(false);
    };
    if actual.rules.iter().any(|r| !official.rules.contains(r)) {
        return Ok(false);
    }
    let wanted: Vec<&serde_json::Value> = official
        .findings
        .iter()
        .filter(|f| match f.get("rule") {
            Some(serde_json::Value::String(rule)) => actual.rules.contains(rule),
            _ => true,
        })
        .collect();
    Ok(wanted.len() == actual.findings.len()
        && wanted.iter().zip(&actual.findings).all(|(w, a)| *w == a))
}

/// The recorded verdict of every corpus unit for every task and variant:
/// `corpus/_registry/parity.json`, `"<task>/<variant> <family>/<source>/<path>": "<verdict>"`.
pub(crate) struct Ratchet {
    file: PathBuf,
    known: BTreeMap<String, String>,
}

impl Ratchet {
    pub(crate) fn load(corpus: &Path) -> Result<Self, String> {
        let file = corpus.join("_registry/parity.json");
        let text =
            std::fs::read_to_string(&file).map_err(|e| format!("{}: {e}", file.display()))?;
        let known = serde_json::from_str(&text).map_err(|e| format!("{}: {e}", file.display()))?;
        Ok(Self { file, known })
    }

    /// Every entry that differs from `now` among those `owned` selects, as
    /// `(key, recorded, now)` with `refused` for an absent side. With `update`, records `now`
    /// for them instead and keeps the other entries.
    pub(crate) fn check(
        &mut self,
        now: &BTreeMap<String, Verdict>,
        owned: impl Fn(&str) -> bool,
        update: bool,
    ) -> Result<Vec<(String, String, String)>, String> {
        let mut moved = Vec::new();
        for (key, recorded) in self.known.iter().filter(|(k, _)| owned(k)) {
            match now.get(key) {
                Some(v) if v.label() == recorded => {}
                v => moved.push((
                    key.clone(),
                    recorded.clone(),
                    v.map_or("refused", |v| v.label()).to_owned(),
                )),
            }
        }
        for (key, verdict) in now {
            if !self.known.contains_key(key) {
                moved.push((
                    key.clone(),
                    "refused".to_owned(),
                    verdict.label().to_owned(),
                ));
            }
        }
        moved.sort_unstable();
        if update && !moved.is_empty() {
            self.known.retain(|k, _| !owned(k));
            self.known
                .extend(now.iter().map(|(k, v)| (k.clone(), v.label().to_owned())));
            std::fs::write(&self.file, json(&self.known))
                .map_err(|e| format!("{}: {e}", self.file.display()))?;
        }
        Ok(moved)
    }
}

/// `JSON.stringify(map, null, '\t')` with a final newline, keys in JavaScript's string order.
fn json(map: &BTreeMap<String, String>) -> String {
    let mut entries: Vec<(&String, &String)> = map.iter().collect();
    entries.sort_by(|(a, _), (b, _)| a.encode_utf16().cmp(b.encode_utf16()));
    if entries.is_empty() {
        return "{}\n".to_owned();
    }
    let quote = |s: &str| serde_json::to_string(s).expect("a string serializes");
    let body: Vec<String> = entries
        .iter()
        .map(|(k, v)| format!("\t{}: {}", quote(k), quote(v)))
        .collect();
    format!("{{\n{}\n}}\n", body.join(",\n"))
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use super::{Ratchet, Row, Verdict, compare, lint, verdict};

    fn rows(rows: &[(&str, Verdict)]) -> Vec<Row> {
        rows.iter().map(|(e, v)| ((*e).to_owned(), *v)).collect()
    }

    #[test]
    fn only_diagnostics_where_the_official_tool_wrote_output_is_a_refusal() {
        let refused = rows(&[
            ("diagnostics.json", Verdict::Unexpected),
            ("js", Verdict::Missing),
        ]);
        assert_eq!(verdict(&refused), None);
        let missing = rows(&[("js", Verdict::Missing)]);
        assert_eq!(verdict(&missing), Some(Verdict::Missing));
        let worse = rows(&[
            ("diagnostics.json", Verdict::Unexpected),
            ("js", Verdict::Mismatch),
        ]);
        assert_eq!(verdict(&worse), Some(Verdict::Mismatch));
        assert_eq!(verdict(&[]), Some(Verdict::Match));
    }

    #[test]
    fn files_are_compared_by_kind() {
        assert_eq!(compare("js", "f('a');", "f(\"a\")"), Ok(Verdict::Match));
        assert_eq!(compare("js", "f(a);", "f(b)"), Ok(Verdict::Mismatch));
        assert_eq!(compare("js", "f(a);", "f("), Ok(Verdict::Unparseable));
        assert!(
            compare("js", "f(", "f()").is_err(),
            "the official side must parse"
        );
        assert_eq!(compare("css", "a{}", "a {}"), Ok(Verdict::Mismatch));
        assert_eq!(
            compare("json", "{\"a\":1,\"b\":2}", "{\"b\":2,\"a\":1}"),
            Ok(Verdict::Match)
        );
    }

    #[test]
    fn lint_findings_are_compared_by_the_rules_rsvelte_ran() {
        let official = serde_json::json!({
            "rules": ["a", "b"],
            "findings": [{"rule": "a", "line": 1}, {"rule": "b", "line": 2}, {"rule": null}],
        });
        let ran_a = serde_json::json!({"rules": ["a"], "findings": [{"rule": "a", "line": 1}, {"rule": null}]});
        assert_eq!(lint(official.clone(), ran_a), Ok(true));
        let wrong = serde_json::json!({"rules": ["a"], "findings": [{"rule": null}]});
        assert_eq!(lint(official.clone(), wrong), Ok(false));
        let unknown = serde_json::json!({"rules": ["c"], "findings": [{"rule": null}]});
        assert_eq!(lint(official, unknown), Ok(false));
    }

    #[test]
    fn the_ratchet_is_two_sided_and_records_only_what_it_owns() {
        let corpus = std::env::temp_dir().join(format!("rsvelte-ratchet-{}", std::process::id()));
        drop(std::fs::remove_dir_all(&corpus));
        std::fs::create_dir_all(corpus.join("_registry")).unwrap();
        let file = corpus.join("_registry/parity.json");
        let entry = |k: &str, v: &str| format!("\t\"{k}\": \"{v}\"");
        let text = |entries: &[String]| format!("{{\n{}\n}}\n", entries.join(",\n"));
        std::fs::write(
            &file,
            text(&[
                entry("a/x u", "match"),
                entry("a/x v", "missing"),
                entry("b/x u", "mismatch"),
            ]),
        )
        .unwrap();
        let owned = |k: &str| k.starts_with("a/");
        let map = |entries: &[(&str, Verdict)]| -> BTreeMap<String, Verdict> {
            entries.iter().map(|(k, v)| ((*k).to_owned(), *v)).collect()
        };
        let same = map(&[("a/x u", Verdict::Match), ("a/x v", Verdict::Missing)]);
        let load = || Ratchet::load(&corpus).unwrap();
        assert_eq!(load().check(&same, owned, false), Ok(Vec::new()));
        let better = map(&[
            ("a/x u", Verdict::Match),
            ("a/x v", Verdict::Match),
            ("a/x w", Verdict::Mismatch),
        ]);
        let moved = load().check(&better, owned, false).unwrap();
        assert_eq!(moved.len(), 2, "an improvement moves too: {moved:?}");
        let gone = load()
            .check(&map(&[("a/x u", Verdict::Match)]), owned, false)
            .unwrap();
        assert_eq!(
            gone,
            [(
                "a/x v".to_owned(),
                "missing".to_owned(),
                "refused".to_owned()
            )]
        );
        load().check(&better, owned, true).unwrap();
        assert_eq!(
            std::fs::read_to_string(&file).unwrap(),
            text(&[
                entry("a/x u", "match"),
                entry("a/x v", "match"),
                entry("a/x w", "mismatch"),
                entry("b/x u", "mismatch"),
            ]),
            "another harness's entries stay"
        );
        std::fs::remove_dir_all(corpus).unwrap();
    }
}
