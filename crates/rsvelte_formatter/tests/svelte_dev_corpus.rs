//! svelte.dev formatter parity corpus.
//!
//! Formats every `.svelte` file from the `submodules/svelte.dev` checkout with
//! `rsvelte_formatter` and asserts the result matches the oracle produced by
//! `oxfmt` (with `svelte: true`, i.e. `prettier-plugin-svelte` for the Svelte
//! structure + the oxc engine for embedded JS/CSS — the same layering rsvelte
//! uses). The oracle is precomputed into `fixtures/fmt-corpus/<svelte.dev-sha>/`
//! by `pnpm run generate-fmt-corpus`.
//!
//! Because real-world components surface many not-yet-implemented gaps, the
//! suite uses a committed *baseline* of currently-failing samples
//! (`tests/fmt_corpus_baseline.txt`) rather than a skip list. It asserts only
//! that no NEW sample regresses (current failures ⊆ baseline) and reports
//! baseline entries that now pass (remove them as the gap is closed).
//!
//! Requirements at test time:
//! - the corpus fixtures must exist (run the generator); otherwise the test
//!   no-ops with a notice.
//! - a working `oxfmt` launcher for the `<style>` CSS callback, located via
//!   `FMT_CORPUS_OXFMT` (falls back to `OXFMT_BIN`, then `node_modules/.bin/oxfmt`).
//!   If oxfmt cannot run, the test no-ops with a notice.

use std::collections::BTreeSet;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_formatter::{
    FormatOptions, IndentStyle, IndentWidth, JsFormatOptions, LineWidth, StyleFormatter, format,
};

fn repo_root() -> PathBuf {
    // crates/rsvelte_formatter -> repo root
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .canonicalize()
        .expect("canonicalize repo root")
}

fn svelte_dev_short_sha(root: &Path) -> Option<String> {
    let out = Command::new("git")
        .args(["-C"])
        .arg(root.join("submodules/svelte.dev"))
        .args(["rev-parse", "HEAD"])
        .output()
        .ok()?;
    if !out.status.success() {
        return None;
    }
    let sha = String::from_utf8(out.stdout).ok()?;
    let sha = sha.trim();
    if sha.len() < 12 {
        return None;
    }
    Some(sha[..12].to_string())
}

fn oxfmt_bin() -> PathBuf {
    if let Ok(p) = std::env::var("FMT_CORPUS_OXFMT") {
        return PathBuf::from(p);
    }
    if let Ok(p) = std::env::var("OXFMT_BIN") {
        return PathBuf::from(p);
    }
    repo_root().join("node_modules/.bin/oxfmt")
}

fn canonical_config(root: &Path) -> PathBuf {
    root.join("scripts/fixtures/fmt-corpus.oxfmtrc.json")
}

fn oxfmt_runnable(oxfmt: &Path) -> bool {
    Command::new(oxfmt)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

/// Build a style callback that mirrors the production one in
/// `crates/rsvelte_fmt/src/main.rs::make_oxfmt_style_formatter`: pipe the
/// dedented `<style>` body through oxfmt with the canonical config.
fn make_style_formatter(oxfmt: PathBuf, config: PathBuf) -> StyleFormatter {
    std::sync::Arc::new(move |body: &str, lang: &str| -> Result<String, String> {
        let ext = match lang {
            "scss" => "scss",
            "less" => "less",
            _ => "css",
        };
        let filename = format!("inline.{ext}");
        let mut child = Command::new(&oxfmt)
            .arg("-c")
            .arg(&config)
            .arg("--stdin-filepath")
            .arg(&filename)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("spawn oxfmt: {e}"))?;
        child
            .stdin
            .take()
            .unwrap()
            .write_all(body.as_bytes())
            .map_err(|e| format!("write stdin: {e}"))?;
        let out = child.wait_with_output().map_err(|e| format!("wait: {e}"))?;
        if !out.status.success() {
            return Err(format!(
                "oxfmt exited {:?}: {}",
                out.status.code(),
                String::from_utf8_lossy(&out.stderr)
            ));
        }
        String::from_utf8(out.stdout).map_err(|e| format!("oxfmt non-utf8: {e}"))
    })
}

/// Mirror `rsvelte_fmt`'s default `build_format_options` with an empty config:
/// spaces / width 2 / printWidth 80, oxc defaults for everything else. The
/// canonical oxfmt config pins the same three values; the rest are oxc/oxfmt
/// defaults on both sides. Keep this in sync with
/// `scripts/fixtures/fmt-corpus.oxfmtrc.json`.
fn format_options(style: StyleFormatter) -> FormatOptions {
    let js = JsFormatOptions {
        indent_style: IndentStyle::Space,
        indent_width: IndentWidth::try_from(2u8).unwrap(),
        line_width: LineWidth::try_from(80u16).unwrap(),
        ..JsFormatOptions::new()
    };
    FormatOptions {
        js,
        style_formatter: Some(style),
        typescript: false,
    }
}

struct Sample {
    id: String,
    dir: PathBuf,
}

fn collect_samples(files_root: &Path) -> Vec<Sample> {
    let mut out = Vec::new();
    fn walk(dir: &Path, root: &Path, out: &mut Vec<Sample>) {
        let Ok(entries) = std::fs::read_dir(dir) else {
            return;
        };
        for e in entries.flatten() {
            let p = e.path();
            if p.is_dir() {
                if p.join("input.svelte").is_file() && p.join("expected.svelte").is_file() {
                    let id = p
                        .strip_prefix(root)
                        .unwrap()
                        .to_string_lossy()
                        .replace('\\', "/");
                    out.push(Sample { id, dir: p });
                } else {
                    walk(&p, root, out);
                }
            }
        }
    }
    walk(files_root, files_root, &mut out);
    out.sort_by(|a, b| a.id.cmp(&b.id));
    out
}

fn load_baseline() -> BTreeSet<String> {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fmt_corpus_baseline.txt");
    let Ok(text) = std::fs::read_to_string(&path) else {
        return BTreeSet::new();
    };
    text.lines()
        .map(str::trim)
        .filter(|l| !l.is_empty() && !l.starts_with('#'))
        .map(str::to_string)
        .collect()
}

#[test]
fn svelte_dev_corpus_parity() {
    let root = repo_root();

    let Some(short_sha) = svelte_dev_short_sha(&root) else {
        eprintln!(
            "[fmt-corpus] svelte.dev submodule not checked out; skipping. \
             Run: git submodule update --init submodules/svelte.dev"
        );
        return;
    };
    let fixtures = root.join("fixtures/fmt-corpus").join(&short_sha);
    if !fixtures.join("files").is_dir() {
        eprintln!(
            "[fmt-corpus] no fixtures at fixtures/fmt-corpus/{short_sha}; skipping. \
             Run: pnpm run generate-fmt-corpus"
        );
        return;
    }

    let oxfmt = oxfmt_bin();
    if !oxfmt_runnable(&oxfmt) {
        eprintln!(
            "[fmt-corpus] oxfmt not runnable at {} (set FMT_CORPUS_OXFMT); skipping.",
            oxfmt.display()
        );
        return;
    }
    let config = canonical_config(&root);

    // Walk both files/ (Stage 1: .svelte files) and blocks/ (Stage 2: svelte
    // code blocks in markdown). Sample ids are relative to the SHA dir, so they
    // read `files/…` / `blocks/…`. markdown/ (Stage 3) holds `input.md` and is
    // exercised by the rsvelte_fmt crate's CLI test instead.
    let samples = collect_samples(&fixtures);
    assert!(!samples.is_empty(), "no samples found under {fixtures:?}");

    let failures: Mutex<Vec<(String, String)>> = Mutex::new(Vec::new());
    let next = AtomicUsize::new(0);
    let n_threads = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
        .min(8);

    std::thread::scope(|scope| {
        for _ in 0..n_threads {
            let style = make_style_formatter(oxfmt.clone(), config.clone());
            let opts = format_options(style);
            let next = &next;
            let failures = &failures;
            let samples = &samples;
            scope.spawn(move || {
                loop {
                    let i = next.fetch_add(1, Ordering::Relaxed);
                    if i >= samples.len() {
                        break;
                    }
                    let s = &samples[i];
                    let input = std::fs::read_to_string(s.dir.join("input.svelte")).unwrap();
                    let expected = std::fs::read_to_string(s.dir.join("expected.svelte")).unwrap();
                    let detail = match format(&input, &opts) {
                        Ok(got) if got == expected => continue,
                        Ok(got) => first_diff(&expected, &got),
                        Err(e) => format!("format error: {e}"),
                    };
                    failures.lock().unwrap().push((s.id.clone(), detail));
                }
            });
        }
    });

    let mut failures = failures.into_inner().unwrap();
    failures.sort_by(|a, b| a.0.cmp(&b.0));
    let failing: BTreeSet<String> = failures.iter().map(|(id, _)| id.clone()).collect();
    let baseline = load_baseline();

    let total = samples.len();
    let passing = total - failures.len();
    let new_failures: Vec<&String> = failing.difference(&baseline).collect();
    let now_passing: Vec<&String> = baseline.difference(&failing).collect();

    println!(
        "[fmt-corpus] svelte.dev@{short_sha}: {passing}/{total} pass, \
         {} fail ({} baseline, {} new)",
        failures.len(),
        baseline.len(),
        new_failures.len(),
    );
    if !now_passing.is_empty() {
        println!(
            "[fmt-corpus] {} baseline entr{} now PASS — remove from \
             tests/fmt_corpus_baseline.txt:",
            now_passing.len(),
            if now_passing.len() == 1 { "y" } else { "ies" },
        );
        for id in &now_passing {
            println!("    {id}");
        }
    }

    if !new_failures.is_empty() {
        let mut msg = format!(
            "\n{} NEW formatter parity regression(s) not in baseline:\n",
            new_failures.len()
        );
        for id in &new_failures {
            let detail = failures
                .iter()
                .find(|(fid, _)| &fid == id)
                .map(|(_, d)| d.as_str())
                .unwrap_or("");
            msg.push_str(&format!("\n  ✗ {id}\n      {detail}\n"));
        }
        msg.push_str(
            "\nIf a change intentionally affects formatting, regenerate and review, \
             or add the sample id to tests/fmt_corpus_baseline.txt with justification.\n",
        );
        panic!("{msg}");
    }
}

/// Compact first-divergence preview for failure messages.
fn first_diff(expected: &str, got: &str) -> String {
    for (i, (e, g)) in expected.lines().zip(got.lines()).enumerate() {
        if e != g {
            return format!("line {}: expected {:?} got {:?}", i + 1, trunc(e), trunc(g));
        }
    }
    let (el, gl) = (expected.lines().count(), got.lines().count());
    if el != gl {
        format!("line count differs: expected {el} got {gl}")
    } else {
        "outputs differ (trailing whitespace/newline)".to_string()
    }
}

fn trunc(s: &str) -> String {
    if s.len() > 80 {
        format!("{}…", &s[..80])
    } else {
        s.to_string()
    }
}
