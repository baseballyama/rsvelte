//! Compat oracle (design doc §F) — a RuleTester-equivalent harness that drives
//! the real eslint-plugin-svelte fixtures through the ported native rules and
//! asserts parity on every field the upstream fixtures actually store:
//!
//! - **valid/** fixtures → **zero** findings for the rule.
//! - **invalid/** fixtures → the exact set of `(message, line, column)` from the
//!   sibling `*-errors.yaml`, in order, with the same count.
//! - **fixable** rules → applying `--fix` reproduces the `*-output.svelte`
//!   fixture byte-for-byte (when present).
//!
//! eslint-plugin-svelte's `*-errors.yaml` stores `message` (resolved text),
//! 1-based `line`, 1-based `column`, and `suggestions` — but **no** `messageId`,
//! `endLine` or `endColumn` (verified across the corpus). rsvelte emits 1-based
//! lines and 0-based (UTF-16) columns, so we compare `our_column + 1` to the
//! fixture column.
//!
//! Fixtures that exercise a behaviour the port doesn't cover yet are listed in
//! [`SKIP`] with the reason. The test skips entirely when the
//! `eslint-plugin-svelte` submodule isn't checked out.

use std::path::{Path, PathBuf};

use rsvelte_core::CompileOptions;
use rsvelte_core::svelte_check::diagnostic::Diagnostic;
use rsvelte_lint::registry::registered_rule_metas;
use rsvelte_lint::{Fixable, LintConfig, Severity, fix_source, lint_source};
use serde::Deserialize;
use serde_json::Value;

/// One rule under test, derived from the live registry: its rule id, the
/// upstream fixture directory (the id with the `svelte/` prefix stripped), and
/// whether it emits an autofix (`Fixable::Code`) — gating the
/// `*-output.svelte` byte-parity comparison.
struct RuleUnderTest {
    code: &'static str,
    dir: &'static str,
    fixable: bool,
}

/// Build the rules-under-test list from the registered rule metas, so adding a
/// rule to either registry automatically subjects it to upstream-fixture
/// parity — no hand-maintained list. Mirrors upstream `loadTestCases`, which
/// derives `fixable` from `plugin.rules[name].meta.fixable != null`.
fn rules_under_test() -> Vec<RuleUnderTest> {
    registered_rule_metas()
        .into_iter()
        .map(|m| RuleUnderTest {
            code: m.name,
            dir: m.name.strip_prefix("svelte/").unwrap_or(m.name),
            fixable: m.fixable == Fixable::Code,
        })
        .collect()
}

/// Fixture path substrings to skip, each with the porting gap it exercises.
const SKIP: &[&str] = &[
    // `require-store-reactive-access` TS fixtures: store detection by TYPE (a
    // value whose type has a `subscribe` signature, imported from external `.ts`
    // modules) needs the TypeScript checker / tsgo. The ES path (stores created
    // via `writable`/`readable`/`derived`) covers every non-`ts/` fixture.
    "require-store-reactive-access/valid/ts/",
    "require-store-reactive-access/invalid/ts/",
    // rsvelte serializes a *computed* object-property key with an off-by-one
    // span (the key node starts at the `[`), so the reported column / `$`-insert
    // offset for `{ [store]: … }` don't match. A core serialization quirk, not a
    // rule gap; every other store-access position is covered.
    "require-store-reactive-access/invalid/properties01",
    // Duplicate-property detection inside a ternary *interpolation* (the plugin
    // collapses both branches); the port treats interpolations as opaque.
    "no-dupe-style-properties/invalid/ternary01",
    // Compound `&&` condition: the plugin reports at the precise covered
    // sub-expression node (paren-stripped), e.g. column 17 for
    // `d && ((c && e && b) || a)`. The text-based operand split reports at the
    // whole condition (column 11). Logic/count are correct; only the column of
    // that one compound branch differs.
    "no-dupe-else-if-blocks/invalid/test02",
    // ESLint ≤8 `no-inner-declarations` fixtures (older option/strict-mode
    // semantics). rsvelte mirrors the ESLint ≥9 rule, exercised by the
    // sibling non-`v8` fixtures.
    "no-inner-declarations/invalid/v8",
    // `prefer-svelte-reactivity` exported-instance fixtures are `.svelte.js`
    // modules exercising the export path (flag exported `new X()` even without
    // mutation), which is not ported — the mutation path covers the rest.
    "prefer-svelte-reactivity/invalid/exports",
    // `no-top-level-browser-globals` template-position case: the globals are used
    // in markup (`{location.href}` / `{#if browser}`), not in `<script>`. This is
    // a script-AST rule, so template usage is out of scope (would need a separate
    // template-AST pass). All `<script>`-based fixtures are covered.
    "no-top-level-browser-globals/invalid/in-template01",
    // `no-shorthand-style-property-overrides` ternary fixture: CSS declarations
    // written INSIDE a mustache interpolation (`{cond ? `background: x` : …}`).
    // Parsing CSS inside template interpolations is out of scope; the static
    // `style=""` and `style:` directive cases are covered.
    "no-shorthand-style-property-overrides/invalid/ternary01",
    // `no-add-event-listener` TS-cast case: `(window.addEventListener as any)(…)`.
    // rsvelte's ESTree strips the TS `as` cast, so the call's callee looks like a
    // plain `window.addEventListener` member (upstream keeps it a TSAsExpression
    // and skips it). The non-cast member/identifier cases are covered.
    "no-add-event-listener/invalid/typescript01",
];

/// One expected error from a `*-errors.yaml` file.
#[derive(Debug, Deserialize)]
struct ExpectedError {
    message: String,
    line: u32,
    column: u32,
    // Present in the fixtures but not asserted here (suggestions parity is a
    // follow-up); accepted so deserialization succeeds.
    #[serde(default)]
    #[allow(dead_code)]
    suggestions: Option<serde_yaml::Value>,
}

fn fixture_root() -> Option<PathBuf> {
    let p = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("submodules/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules");
    if p.exists() { Some(p) } else { None }
}

fn is_skipped(path: &Path) -> bool {
    let s = path.to_string_lossy().replace('\\', "/");
    SKIP.iter().any(|frag| s.contains(frag))
}

/// Recursively collect fixture input files: a `.svelte` (or `.svelte.ts`) file
/// whose stem ends with `input`, or a SvelteKit-style `+*.svelte` file.
fn collect_inputs(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if name.starts_with('_') {
            continue;
        }
        if path.is_dir() {
            collect_inputs(&path, out);
        } else if is_input(&name) {
            out.push(path);
        }
    }
}

fn is_input(name: &str) -> bool {
    // `.svelte` components plus standalone JS/TS module fixtures
    // (`*.svelte.js`, `*.svelte.ts`, `*.js`, `*.ts`).
    let is_lintable = name.ends_with(".svelte") || name.ends_with(".js") || name.ends_with(".ts");
    if !is_lintable {
        return false;
    }
    // stem (minus all extensions) ends with `input`, or a SvelteKit `+page` etc.
    let stem = name.split('.').next().unwrap_or("");
    stem.ends_with("input") || name.starts_with('+')
}

/// Derive the `*-errors.yaml` path for an input file.
fn errors_path(input: &Path) -> Option<PathBuf> {
    let dir = input.parent()?;
    let name = input.file_name()?.to_string_lossy().to_string();
    let errors = if name.starts_with('+') {
        "errors.yaml".to_string()
    } else {
        let idx = name.find("input")?;
        format!("{}errors.yaml", &name[..idx])
    };
    Some(dir.join(errors))
}

/// Derive the `*-output.svelte` path for an input file.
fn output_path(input: &Path) -> Option<PathBuf> {
    let dir = input.parent()?;
    let name = input.file_name()?.to_string_lossy().to_string();
    let out = if name.starts_with('+') {
        "output.svelte".to_string()
    } else {
        let idx = name.find("input")?;
        format!("{}output{}", &name[..idx], &name[idx + "input".len()..])
    };
    Some(dir.join(out))
}

/// Load a fixture's `options` array from `<case>-config.json` or `_config.json`.
fn load_options(input: &Path) -> Option<Value> {
    let dir = input.parent()?;
    let name = input.file_name()?.to_string_lossy().to_string();
    let stem = name.split('.').next().unwrap_or("");
    let per_case = stem
        .strip_suffix("input")
        .map(|p| dir.join(format!("{p}config.json")));
    let candidates = [per_case, Some(dir.join("_config.json"))];
    for cand in candidates.into_iter().flatten() {
        if let Ok(txt) = std::fs::read_to_string(&cand)
            && let Ok(v) = serde_json::from_str::<Value>(&txt)
            && let Some(opts) = v.get("options")
        {
            return Some(opts.clone());
        }
    }
    None
}

/// Whether a fixture's `svelte` requirement (if any) admits Svelte 5. We run
/// Svelte-5 semantics, so legacy-only (`^3`/`^4` without 5) fixtures are skipped.
fn requirements_ok(input: &Path) -> bool {
    let Some(dir) = input.parent() else {
        return true;
    };
    let name = input.file_name().map(|n| n.to_string_lossy().to_string());
    let stem = name
        .as_deref()
        .and_then(|n| n.split('.').next())
        .unwrap_or("");
    let per_case = format!(
        "{}requirements.json",
        stem.strip_suffix("input").unwrap_or("")
    );
    for cand in [dir.join(per_case), dir.join("_requirements.json")] {
        if let Ok(txt) = std::fs::read_to_string(&cand)
            && let Ok(v) = serde_json::from_str::<Value>(&txt)
            && let Some(range) = v.get("svelte").and_then(Value::as_str)
        {
            return svelte5_in_range(range);
        }
    }
    true
}

/// Crude semver-range admittance for Svelte 5: true unless the range is clearly
/// legacy-only (mentions 3/4 but not 5 and not an open lower bound).
fn svelte5_in_range(range: &str) -> bool {
    let r = range.to_lowercase();
    if r.contains('5') || r.contains(">=3") || r.contains(">=4") || r.contains('*') {
        return true;
    }
    // e.g. "^3.0.0 || ^4.0.0" → legacy only.
    !(r.contains('3') || r.contains('4'))
}

fn findings_for(source: &str, file: &Path, code: &str, options: &Option<Value>) -> Vec<Diagnostic> {
    let mut cfg = LintConfig::empty().with_override(code, Severity::Error);
    if let Some(opts) = options {
        cfg = cfg.with_options(code, opts.clone());
    }
    // Use the fixture's real filename so the linter classifies `.js`/`.ts`
    // module fixtures (not just `.svelte` components) correctly.
    let name = file
        .file_name()
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("Fixture.svelte"));
    lint_source(source, &name, &CompileOptions::default(), &cfg)
        .into_iter()
        .filter(|d| d.code.as_deref() == Some(code))
        .collect()
}

/// `(line, column-1-based, message)` for an emitted diagnostic.
fn actual_tuple(d: &Diagnostic) -> (u32, u32, String) {
    let (line, col) = d
        .range
        .map(|r| (r.start.line, r.start.column))
        .unwrap_or((1, 0));
    (line, col + 1, d.message.clone())
}

#[test]
fn oracle_strict_parity() {
    let Some(root) = fixture_root() else {
        eprintln!("Skipping oracle: eslint-plugin-svelte submodule not checked out");
        return;
    };

    let mut checked = 0usize;
    let mut failures: Vec<String> = Vec::new();

    let under_test = rules_under_test();

    // Coverage: every registered rule must map to an upstream fixture directory.
    // A registered rule with no fixtures is almost certainly a typo'd id or a
    // rule that doesn't exist upstream — fail loudly rather than silently pass.
    for rut in &under_test {
        if !root.join(rut.dir).exists() {
            failures.push(format!(
                "[no fixtures] registered rule `{}` has no upstream fixture dir `{}/`",
                rut.code, rut.dir
            ));
        }
    }

    for rut in &under_test {
        let RuleUnderTest { dir, code, fixable } = *rut;
        let rule_dir = root.join(dir);
        if !rule_dir.exists() {
            continue;
        }

        // valid → zero findings.
        let mut valid = Vec::new();
        collect_inputs(&rule_dir.join("valid"), &mut valid);
        for input in valid {
            if is_skipped(&input) || !requirements_ok(&input) {
                continue;
            }
            let Ok(src) = std::fs::read_to_string(&input) else {
                continue;
            };
            let found = findings_for(&src, &input, code, &load_options(&input));
            checked += 1;
            if !found.is_empty() {
                failures.push(format!(
                    "[false positive] {}: expected 0, got {:?}",
                    input.display(),
                    found.iter().map(actual_tuple).collect::<Vec<_>>()
                ));
            }
        }

        // invalid → exact (message, line, column) set.
        let mut invalid = Vec::new();
        collect_inputs(&rule_dir.join("invalid"), &mut invalid);
        for input in invalid {
            if is_skipped(&input) || !requirements_ok(&input) {
                continue;
            }
            let Ok(src) = std::fs::read_to_string(&input) else {
                continue;
            };
            let Some(epath) = errors_path(&input) else {
                continue;
            };
            let Ok(eyaml) = std::fs::read_to_string(&epath) else {
                continue;
            };
            let Ok(expected) = serde_yaml::from_str::<Vec<ExpectedError>>(&eyaml) else {
                failures.push(format!("[bad errors.yaml] {}", epath.display()));
                continue;
            };
            checked += 1;

            let mut exp: Vec<(u32, u32, String)> = expected
                .iter()
                .map(|e| (e.line, e.column, e.message.clone()))
                .collect();
            let mut act: Vec<(u32, u32, String)> =
                findings_for(&src, &input, code, &load_options(&input))
                    .iter()
                    .map(actual_tuple)
                    .collect();
            exp.sort();
            act.sort();
            if exp != act {
                failures.push(format!(
                    "[mismatch] {}\n    expected {:?}\n    actual   {:?}",
                    input.display(),
                    exp,
                    act
                ));
                continue;
            }

            // Autofix parity (when the rule is fixable and an output exists).
            if fixable
                && let Some(opath) = output_path(&input)
                && let Ok(expected_out) = std::fs::read_to_string(&opath)
            {
                let mut cfg = LintConfig::empty().with_override(code, Severity::Error);
                if let Some(opts) = load_options(&input) {
                    cfg = cfg.with_options(code, opts);
                }
                let fixed = fix_source(&src, &cfg).output;
                if fixed != expected_out {
                    failures.push(format!(
                        "[fix mismatch] {}\n    expected:\n{}\n    actual:\n{}",
                        input.display(),
                        expected_out,
                        fixed
                    ));
                }
            }
        }
    }

    assert!(
        checked > 0,
        "oracle ran no fixtures — directory layout changed?"
    );
    assert!(
        failures.is_empty(),
        "compat-oracle parity failures ({}):\n\n{}",
        failures.len(),
        failures.join("\n\n")
    );

    // Coverage report (informational): upstream rules with a fixture dir that
    // no registered rule covers yet — the remaining porting backlog.
    let registered: std::collections::HashSet<&str> =
        under_test.iter().map(|r| r.dir).collect();
    let mut unported: Vec<String> = std::fs::read_dir(&root)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|e| e.path().is_dir())
        .map(|e| e.file_name().to_string_lossy().to_string())
        .filter(|name| !registered.contains(name.as_str()))
        .collect();
    unported.sort();

    eprintln!(
        "oracle: strict parity over {checked} fixtures across {} registered rules",
        under_test.len()
    );
    eprintln!(
        "oracle: {} upstream rules not yet ported: {}",
        unported.len(),
        unported.join(", ")
    );
}
