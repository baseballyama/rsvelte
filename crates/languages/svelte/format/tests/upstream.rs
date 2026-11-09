//! prettier-plugin-svelte's own tests, copied byte for byte to `tests/upstream`, run the way its
//! runners (`printer/index.ts`, `formatting/index.ts`) run them under CI. Every verdict, with a
//! refusal's reason, is recorded in `tests/upstream.verdicts`; a verdict that moves fails the test
//! until `UPDATE_EXPECT=1` records it. With `FIXTURE_ACTUAL=1`, each output is written under
//! `CARGO_TARGET_TMPDIR` for diffing.

#![expect(clippy::print_stderr, reason = "a test harness reports on stderr")]
#![expect(
    clippy::case_sensitive_file_extension_comparisons,
    reason = "the runners match names with a case-sensitive `endsWith`"
)]

use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsvelte_svelte_format::Options;
use serde::Deserialize;
use serde_json::{Map, Value};

const UPSTREAM: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/tests/upstream/prettier-plugin-svelte"
);
const VERDICTS: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/tests/upstream.verdicts");

#[derive(Deserialize)]
struct Upstream {
    versions: BTreeMap<String, String>,
}

struct Case {
    /// `printer/<file>` or `formatting/<directory>`, as the runners name the test.
    name: String,
    input: PathBuf,
    /// `None` for a printer case, whose input is its expected output.
    output: Option<PathBuf>,
    options: PathBuf,
}

enum Verdict {
    Pass,
    Fail(String),
    /// The formatter declined the input (the construct or option it named).
    Refused(String),
    /// The case needs something this crate does not do (named in the reason).
    Unmeasured(&'static str),
}

impl Verdict {
    const fn key(&self) -> &'static str {
        match self {
            Self::Pass => "pass",
            Self::Fail(_) => "fail",
            Self::Refused(_) => "refused",
            Self::Unmeasured(_) => "unmeasured",
        }
    }

    /// The line `tests/upstream.verdicts` keeps for `name`: the verdict, the name and, for a
    /// refusal, what was refused, separated by tabs.
    fn line(&self, name: &str) -> String {
        match self {
            Self::Refused(what) => format!("{}\t{name}\t{what}", self.key()),
            _ => format!("{}\t{name}", self.key()),
        }
    }
}

fn main() -> ExitCode {
    let upstream: Upstream =
        serde_json::from_str(&read(&Path::new(UPSTREAM).join("UPSTREAM.json")))
            .expect("UPSTREAM.json is valid");
    let cases = cases();
    assert!(!cases.is_empty(), "no upstream case under {UPSTREAM}");
    let actual = std::env::var_os("FIXTURE_ACTUAL")
        .map(|_| Path::new(env!("CARGO_TARGET_TMPDIR")).join("prettier-plugin-svelte"));

    let mut recorded = String::new();
    let mut counts: BTreeMap<&str, usize> = BTreeMap::new();
    let mut refusals: BTreeMap<String, usize> = BTreeMap::new();
    for case in &cases {
        let (verdict, output) = run(case);
        if let (Some(dir), Some(output)) = (&actual, &output) {
            let path = dir.join(&case.name);
            fs::create_dir_all(path.parent().expect("a case has a parent")).expect("writable");
            fs::write(&path, output).expect("writable");
        }
        match &verdict {
            Verdict::Pass => {}
            Verdict::Fail(detail) => eprintln!("FAIL {}: {detail}", case.name),
            Verdict::Refused(what) => *refusals.entry(what.clone()).or_default() += 1,
            Verdict::Unmeasured(reason) => eprintln!("UNMEASURED {}: {reason}", case.name),
        }
        *counts.entry(verdict.key()).or_default() += 1;
        writeln!(recorded, "{}", verdict.line(&case.name)).expect("writing to a String");
    }

    let mut refusals: Vec<_> = refusals.into_iter().collect();
    refusals.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));
    for (what, n) in &refusals {
        eprintln!("  refused {n}: {what}");
    }
    eprintln!(
        "prettier-plugin-svelte {} (prettier {}): {} cases, {}",
        upstream.versions["prettier-plugin-svelte"],
        upstream.versions["prettier"],
        cases.len(),
        counts
            .iter()
            .map(|(k, n)| format!("{n} {k}"))
            .collect::<Vec<_>>()
            .join(", ")
    );
    if let Some(dir) = &actual {
        eprintln!("outputs: {}", dir.display());
    }
    ratchet(&recorded)
}

/// Compares the verdicts with the recorded ones, or records them with `UPDATE_EXPECT=1`.
fn ratchet(recorded: &str) -> ExitCode {
    if std::env::var_os("UPDATE_EXPECT").is_some() {
        fs::write(VERDICTS, recorded).expect("writable");
        eprintln!("recorded {VERDICTS}");
        return ExitCode::SUCCESS;
    }
    let before = fs::read_to_string(VERDICTS).unwrap_or_default();
    let before = verdict_lines(&before);
    let now = verdict_lines(recorded);
    let mut moved = 0;
    for (name, verdict) in &now {
        let was = before.get(name).copied().unwrap_or("absent");
        if was != *verdict {
            eprintln!("MOVED {name}: {was} -> {verdict}");
            moved += 1;
        }
    }
    for name in before.keys().filter(|name| !now.contains_key(*name)) {
        eprintln!("MOVED {name}: {} -> absent", before[name]);
        moved += 1;
    }
    if moved == 0 {
        ExitCode::SUCCESS
    } else {
        eprintln!("{moved} verdicts moved; run with UPDATE_EXPECT=1 to record them");
        ExitCode::FAILURE
    }
}

/// Each case's line, by name; a line without a name or a name listed twice is a broken file.
fn verdict_lines(text: &str) -> BTreeMap<&str, &str> {
    let mut out = BTreeMap::new();
    for line in text.lines() {
        let name = line
            .split('\t')
            .nth(1)
            .unwrap_or_else(|| panic!("{VERDICTS}: `{line}` has no case name"));
        assert!(
            out.insert(name, line).is_none(),
            "{VERDICTS}: {name} is listed twice"
        );
    }
    out
}

/// The cases in the order the runners list them; `.skip` cases are left out as upstream does.
fn cases() -> Vec<Case> {
    let printer = Path::new(UPSTREAM).join("printer/samples");
    let formatting = Path::new(UPSTREAM).join("formatting/samples");
    let files: Vec<String> = sorted(&printer)
        .into_iter()
        .filter(|f| f.ends_with(".html") || f.ends_with(".md"))
        .collect();
    let dirs = sorted(&formatting);
    // Under CI the runners throw when a case is marked `.only`, so no full run has one.
    let only = files
        .iter()
        .find(|f| f.ends_with(".only.html") || f.ends_with(".only.md"))
        .or_else(|| dirs.iter().find(|d| d.ends_with(".only")));
    assert!(only.is_none(), "{only:?} is marked `.only`");

    let mut out = Vec::new();
    for file in files {
        let ending = file
            .rsplit('.')
            .next()
            .expect("a name ending in .html or .md");
        // `file.replace('.only', '').replace(`.${ending}`, '.options.json')`, each the first match.
        let options =
            file.replacen(".only", "", 1)
                .replacen(&format!(".{ending}"), ".options.json", 1);
        out.push(Case {
            name: format!("printer/{file}"),
            input: printer.join(&file),
            output: None,
            options: printer.join(options),
        });
    }
    for dir in dirs {
        if dir.ends_with(".skip") {
            continue;
        }
        let dir_path = formatting.join(&dir);
        out.push(Case {
            name: format!("formatting/{dir}"),
            input: dir_path.join("input.html"),
            output: Some(dir_path.join("output.html")),
            options: dir_path.join("options.json"),
        });
    }
    out
}

fn sorted(dir: &Path) -> Vec<String> {
    let mut names: Vec<String> = fs::read_dir(dir)
        .unwrap_or_else(|e| panic!("{}: {e}", dir.display()))
        .map(|entry| {
            entry
                .expect("readable directory")
                .file_name()
                .into_string()
                .expect("UTF-8 names")
        })
        .collect();
    names.sort();
    names
}

fn run(case: &Case) -> (Verdict, Option<String>) {
    if case.input.extension().is_some_and(|e| e == "md") {
        return (Verdict::Unmeasured("Markdown is not formatted"), None);
    }
    let input = normalized(&read(&case.input));
    let expected = case
        .output
        .as_ref()
        .map_or_else(|| input.clone(), |p| normalized(&read(p)));
    let options = match options(&case.options) {
        Ok(o) => o,
        Err(e) => return (Verdict::Refused(e), None),
    };
    let output = match format(&input, &options) {
        Ok(o) => o,
        Err(v) => return (v, None),
    };
    if output != expected {
        let detail = first_difference(&expected, &output);
        return (Verdict::Fail(detail), Some(output));
    }
    // The formatting runner also formats the output again and expects no change.
    if case.output.is_some() {
        match format(&output, &options) {
            Ok(again) if again == expected => {}
            Ok(again) => {
                let detail = format!("reprint: {}", first_difference(&expected, &again));
                return (Verdict::Fail(detail), Some(output));
            }
            Err(Verdict::Refused(what)) => {
                return (
                    Verdict::Fail(format!("reprint refused: {what}")),
                    Some(output),
                );
            }
            Err(v) => return (v, Some(output)),
        }
    }
    (Verdict::Pass, Some(output))
}

fn format(input: &str, options: &Options) -> Result<String, Verdict> {
    rsvelte_svelte_format::format(input, options).map_err(|d| {
        match d
            .message
            .strip_prefix("not supported by the formatter yet: ")
        {
            Some(what) if d.code == "format_unsupported" => Verdict::Refused(what.to_owned()),
            _ => Verdict::Fail(format!("does not parse: {}", d.message)),
        }
    })
}

/// Upstream's options: `tabWidth: 4`, then the case's `options.json`, without the runner's own
/// `expectSyntaxErrors`, which only silences logging.
fn options(path: &Path) -> Result<Options, String> {
    let mut map: Map<String, Value> = if path.exists() {
        serde_json::from_str(&read(path)).map_err(|e| format!("options.json: {e}"))?
    } else {
        Map::new()
    };
    map.remove("expectSyntaxErrors");
    map.entry("tabWidth").or_insert(Value::from(4));
    serde_json::from_value(Value::Object(map)).map_err(|e| format!("options: {e}"))
}

/// The runners' `.replace(/\r?\n/g, '\n')`.
fn normalized(text: &str) -> String {
    text.replace("\r\n", "\n")
}

/// The first line, split at `\n` only, where two outputs that differ part.
fn first_difference(expected: &str, actual: &str) -> String {
    let (e, a): (Vec<&str>, Vec<&str>) =
        (expected.split('\n').collect(), actual.split('\n').collect());
    let line = e
        .iter()
        .zip(&a)
        .position(|(e, a)| e != a)
        .unwrap_or_else(|| e.len().min(a.len()));
    let at = |lines: &[&str]| {
        lines
            .get(line)
            .map_or_else(|| "<end>".to_owned(), |l| format!("{l:?}"))
    };
    format!("line {}: expected {}, got {}", line + 1, at(&e), at(&a))
}

fn read(path: &Path) -> String {
    fs::read_to_string(path).unwrap_or_else(|e| panic!("{}: {e}", path.display()))
}
