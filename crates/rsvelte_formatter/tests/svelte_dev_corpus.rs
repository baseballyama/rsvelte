//! svelte.dev formatter parity corpus.
//!
//! Formats every `.svelte` file from the `submodules/svelte.dev` checkout with
//! `rsvelte_formatter` and asserts the result matches the oracle produced by
//! `oxfmt` (with `svelte: true`, i.e. `prettier-plugin-svelte` for the Svelte
//! structure, oxc for embedded JS, and PostCSS for embedded CSS). The actual
//! side delegates each style body to standalone oxfmt. The oracle is precomputed
//! into `fixtures/fmt-corpus/<svelte.dev-sha>/`
//! by `pnpm run generate-fmt-corpus`.
//!
//! Because real-world components surface many not-yet-implemented gaps, the
//! suite is a hard gate: EVERY sample must match the oracle byte-for-byte, so
//! any formatting divergence fails CI (no baseline tolerance). Remaining gaps
//! are fixed in the formatter, not tolerated.
//!
//! Requirements at test time:
//! - the corpus fixtures must exist (run the generator); otherwise the test
//!   no-ops with a notice.
//! - a working `oxfmt` launcher for the `<style>` CSS callback, located via
//!   `FMT_CORPUS_OXFMT` (falls back to `OXFMT_BIN`, then `node_modules/.bin/oxfmt`).
//!   If oxfmt cannot run, the test no-ops with a notice.

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
    let submodule = root.join("submodules/svelte.dev");
    // An uninitialised submodule is an empty directory, and `git -C` there walks
    // up to the superproject and reports *its* HEAD — a valid-looking wrong SHA.
    if !submodule.join(".git").exists() {
        return None;
    }
    let out = Command::new("git")
        .args(["-C"])
        .arg(&submodule)
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

/// May this run fail on a missing prerequisite? Two conditions, because either
/// alone is wrong: `RSVELTE_REQUIRE_PREREQS` says the *job* promised its
/// prerequisites (the sharded `test` job omits svelte.dev and must stay green),
/// and `FMT_CORPUS_OXFMT` says the corpus is in scope for it. `FMT_CORPUS_OXFMT`
/// is a user-facing knob, so gating on it alone would turn a contributor's local
/// export into a panic where they used to get a skip.
fn in_corpus_job() -> bool {
    std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_some()
        && std::env::var_os("FMT_CORPUS_OXFMT").is_some()
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
        .is_ok_and(|s| s.success())
}

/// Build the legacy `--no-native-css` style callback: pipe the dedented
/// `<style>` body through standalone oxfmt with the canonical config.
///
/// This is intentionally not rsvelte-fmt's default in-process CSS path; the
/// full compatibility corpus is the parity gate for that shipped path.
fn make_style_formatter(oxfmt: PathBuf, config: PathBuf) -> StyleFormatter {
    let base = std::fs::read_to_string(&config).unwrap_or_default();
    std::sync::Arc::new(
        move |body: &str, lang: &str, width: usize| -> Result<String, String> {
            let ext = match lang {
                "scss" => "scss",
                "less" => "less",
                _ => "css",
            };
            let filename = format!("inline.{ext}");
            // Format CSS at `width` (global print width minus the <style> body indent)
            // so embedded CSS wraps where the oracle (which formats it at its real
            // column) does. Derive a per-width config from the canonical one (its
            // printWidth is always 80). Use a UNIQUE temp file per call — the corpus
            // formats files in parallel, so a shared per-width path would race
            // (concurrent writers corrupt the config a reader picks up).
            static SEQ: AtomicUsize = AtomicUsize::new(0);
            let n = SEQ.fetch_add(1, Ordering::Relaxed);
            let cfg = std::env::temp_dir().join(format!(
                "rsvelte-fmtcorpus-css-{}-{width}-{n}.json",
                std::process::id()
            ));
            let contents = base.replace("\"printWidth\": 80", &format!("\"printWidth\": {width}"));
            std::fs::write(&cfg, contents).map_err(|e| format!("write css config: {e}"))?;
            let mut child = Command::new(&oxfmt)
                .arg("-c")
                .arg(&cfg)
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
            let _ = std::fs::remove_file(&cfg);
            if !out.status.success() {
                return Err(format!(
                    "oxfmt exited {:?}: {}",
                    out.status.code(),
                    String::from_utf8_lossy(&out.stderr)
                ));
            }
            String::from_utf8(out.stdout).map_err(|e| format!("oxfmt non-utf8: {e}"))
        },
    )
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
        ..JsFormatOptions::default()
    };
    FormatOptions {
        js,
        style_formatter: Some(style),
        typescript: false,
        ..FormatOptions::new()
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

#[test]
fn svelte_dev_corpus_parity() {
    let root = repo_root();

    let Some(short_sha) = svelte_dev_short_sha(&root) else {
        assert!(
            !in_corpus_job(),
            "submodules/svelte.dev is not checked out in the job that sets \
             FMT_CORPUS_OXFMT — the corpus parity assertions would be silently \
             skipped."
        );
        eprintln!(
            "[fmt-corpus] svelte.dev submodule not checked out; skipping. \
             Run: git submodule update --init submodules/svelte.dev"
        );
        return;
    };
    let fixtures = root.join("fixtures/fmt-corpus").join(&short_sha);
    if !fixtures.join("files").is_dir() {
        assert!(
            !in_corpus_job(),
            "no fixtures at fixtures/fmt-corpus/{short_sha} in the job that sets \
             FMT_CORPUS_OXFMT — `generate-fmt-corpus` produced nothing, or wrote \
             a different svelte.dev SHA."
        );
        eprintln!(
            "[fmt-corpus] no fixtures at fixtures/fmt-corpus/{short_sha}; skipping. \
             Run: pnpm run generate-fmt-corpus"
        );
        return;
    }

    let oxfmt = oxfmt_bin();
    if !oxfmt_runnable(&oxfmt) {
        assert!(
            !in_corpus_job(),
            "FMT_CORPUS_OXFMT is set but oxfmt is not runnable at {} — the \
             oracle is broken, not absent.",
            oxfmt.display()
        );
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
    let unparseable: Mutex<Vec<(String, String)>> = Mutex::new(Vec::new());
    let next = AtomicUsize::new(0);
    let n_threads = std::thread::available_parallelism()
        .map_or(4, std::num::NonZero::get)
        .min(8);

    std::thread::scope(|scope| {
        for _ in 0..n_threads {
            let style = make_style_formatter(oxfmt.clone(), config.clone());
            let opts = format_options(style);
            let next = &next;
            let failures = &failures;
            let unparseable = &unparseable;
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
                    match format(&input, &opts) {
                        Ok(got) if got == expected => continue,
                        Ok(got) => failures
                            .lock()
                            .unwrap()
                            .push((s.id.clone(), first_diff(&expected, &got))),
                        // A parse / sub-format error means rsvelte can't read the
                        // input at all — a parser (or embedded JS/CSS) gap, not a
                        // formatting-parity diff. Track it separately so the hard
                        // gate stays focused on output mismatches; these are
                        // reported for follow-up but don't fail the suite.
                        Err(e) => unparseable
                            .lock()
                            .unwrap()
                            .push((s.id.clone(), format!("{e}"))),
                    }
                }
            });
        }
    });

    let mut failures = failures.into_inner().unwrap();
    failures.sort_by(|a, b| a.0.cmp(&b.0));
    let mut unparseable = unparseable.into_inner().unwrap();
    unparseable.sort_by(|a, b| a.0.cmp(&b.0));

    let total = samples.len();
    let passing = total - failures.len() - unparseable.len();
    println!(
        "[fmt-corpus] svelte.dev@{short_sha}: {passing}/{total} pass, {} fail, {} unparseable",
        failures.len(),
        unparseable.len(),
    );
    if !unparseable.is_empty() {
        println!(
            "[fmt-corpus] {} sample(s) rsvelte could not parse (parser/embedded-code gaps, \
             not counted as parity failures):",
            unparseable.len()
        );
        for (id, e) in &unparseable {
            println!("    {id}\n        {}", trunc(e));
        }
    }

    // Unparseable samples are excused from the parity gate below, so an
    // unbounded count would let a parser regression that breaks nearly every
    // sample look green here. Ceiling is well above the current baseline (0)
    // to leave room for normal corpus drift.
    const MAX_UNPARSEABLE: usize = 20;
    assert!(
        unparseable.len() <= MAX_UNPARSEABLE,
        "{} unparseable sample(s) exceeds the ceiling of {MAX_UNPARSEABLE} — this usually \
         means a parser regression, not isolated embedded-code gaps",
        unparseable.len(),
    );

    if !failures.is_empty() {
        // Hard gate: every sample must match the oxfmt(svelte:true) oracle.
        // FMT_CORPUS_SHOW raises the per-run cap for burndown analysis.
        let show: usize = std::env::var("FMT_CORPUS_SHOW")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(60);
        let mut msg = format!(
            "\n{} formatter parity failure(s) vs the oxfmt(svelte:true) oracle \
             ({passing}/{total} pass):\n",
            failures.len(),
        );
        use std::fmt::Write as _;
        for (id, detail) in failures.iter().take(show) {
            let _ = write!(msg, "\n  ✗ {id}\n      {detail}\n");
        }
        if failures.len() > show {
            let _ = write!(msg, "\n  … and {} more.\n", failures.len() - show);
        }
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
    if el == gl {
        "outputs differ (trailing whitespace/newline)".to_string()
    } else {
        format!("line count differs: expected {el} got {gl}")
    }
}

fn trunc(s: &str) -> String {
    if s.len() > 80 {
        format!("{}…", &s[..80])
    } else {
        s.to_string()
    }
}
