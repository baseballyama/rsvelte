//! Integration tests for the `rsvelte-fmt` CLI. The Svelte formatting path
//! and the batched `<style>` delegation path are exercised here; the latter
//! stands in a fake `oxfmt` (a `.cjs` run through `node`) so it needs no real
//! `oxfmt` on `$PATH`. Delegation of whole non-`.svelte` files to a real
//! `oxfmt` is covered by the corpus formatter-parity track (see
//! scripts/compat-corpus/README.md).

use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

fn bin() -> PathBuf {
    // Cargo sets CARGO_BIN_EXE_<bin-name> for integration tests so the test
    // doesn't have to guess where the binary lives — important under
    // cargo-llvm-cov, which uses target/llvm-cov-target/ instead of target/.
    PathBuf::from(env!("CARGO_BIN_EXE_rsvelte-fmt"))
}

/// A fake oxfmt that prepends `/*FMT*/` to every CSS file it formats. Handles
/// both explicit file arguments and the `<style>` staging directory the batch
/// hands it (basename `rsvelte-fmt-styles-*`, walked like real oxfmt walks a
/// directory). Any *other* directory argument — e.g. the project dir from the
/// non-`.svelte` delegation pass — is ignored, so it never touches the test's
/// own `.svelte`/`.cjs` files. Shared by the delegation and cache-output tests.
const MARKER_OXFMT: &str = r#"const fs = require('node:fs');
const path = require('node:path');
function fmtFile(p) { fs.writeFileSync(p, '/*FMT*/' + fs.readFileSync(p, 'utf8')); }
for (const p of process.argv.slice(2)) {
  if (p.startsWith('-') || p.startsWith('!')) continue;
  let st;
  try { st = fs.statSync(p); } catch { continue; }
  if (st.isFile()) fmtFile(p);
  else if (st.isDirectory() && path.basename(p).startsWith('rsvelte-fmt-styles-')) {
    for (const e of fs.readdirSync(p)) {
      const fp = path.join(p, e);
      if (fs.statSync(fp).isFile()) fmtFile(fp);
    }
  }
}
"#;

fn run_stdin(stdin: &str, args: &[&str]) -> (String, String, i32) {
    let mut child = Command::new(bin())
        .args(args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn rsvelte-fmt");
    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(stdin.as_bytes())
        .unwrap();
    let out = child.wait_with_output().unwrap();
    (
        String::from_utf8(out.stdout).unwrap(),
        String::from_utf8(out.stderr).unwrap(),
        out.status.code().unwrap_or(-1),
    )
}

#[test]
fn stdin_format_svelte_succeeds() {
    let (stdout, _stderr, code) = run_stdin(
        "<script>let x=1+2</script>\n<p>{ x }</p>",
        &["--stdin", "--stdin-filepath", "test.svelte"],
    );
    assert_eq!(code, 0);
    assert!(stdout.contains("let x = 1 + 2;"), "stdout:\n{stdout}");
    assert!(stdout.contains("<p>{x}</p>"), "stdout:\n{stdout}");
}

#[test]
fn stdin_check_returns_one_when_unformatted() {
    let (_stdout, _stderr, code) = run_stdin(
        "<script>let x=1+2</script>",
        &["--stdin", "--stdin-filepath", "test.svelte", "--check"],
    );
    assert_eq!(code, 1);
}

#[test]
fn stdin_check_returns_zero_when_formatted() {
    let (_stdout, _stderr, code) = run_stdin(
        "<script>\n  let x = 1 + 2;\n</script>\n",
        &["--stdin", "--stdin-filepath", "test.svelte", "--check"],
    );
    assert_eq!(code, 0);
}

#[test]
fn stdin_respects_use_tabs() {
    let (stdout, _stderr, code) = run_stdin(
        "<script>let x=1+2</script>",
        &["--stdin", "--stdin-filepath", "test.svelte", "--use-tabs"],
    );
    assert_eq!(code, 0);
    assert!(
        stdout.contains("\n\tlet x = 1 + 2;\n"),
        "expected tab indent:\n{stdout:?}"
    );
}

#[test]
fn write_mode_updates_svelte_file_on_disk() {
    let dir = tempdir();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let after = std::fs::read_to_string(&file).unwrap();
    assert!(after.contains("let x = 1 + 2;"), "{after}");
}

#[test]
fn no_paths_errors_helpfully() {
    let out = Command::new(bin())
        .stderr(Stdio::piped())
        .stdout(Stdio::null())
        .output()
        .unwrap();
    assert_ne!(out.status.code(), Some(0));
    let stderr = String::from_utf8(out.stderr).unwrap();
    assert!(stderr.contains("no paths given"), "stderr:\n{stderr}");
}

/// Batched `<style>` delegation: every `.svelte` file's `<style>` body is
/// collected and formatted in a single `oxfmt` invocation, then mapped back
/// to its own file. We stand in a fake `oxfmt` (a `.cjs` the binary runs
/// through `node`, so this is cross-platform) that prefixes each file it's
/// given with a marker — proving (a) the batch path runs and (b) each block
/// lands back in the correct file, not mixed across files.
#[test]
fn batched_style_delegation_maps_each_block_to_its_file() {
    let dir = tempdir();

    // Fake oxfmt: prepend `/*FMT*/` to every real *file* it receives (in
    // place). Skips flags (`--…`) and exclude globs (`!…`). It walks the
    // `<style>` staging directory (`rsvelte-fmt-styles-*`) the batch now hands
    // it (#707), mirroring real oxfmt's directory walk, but ignores any *other*
    // directory — so the project dir from the non-`.svelte` delegation pass
    // (`--no-error-on-unmatched-pattern !**/*.svelte <dir>`) is left alone (real
    // oxfmt covers that tree via its own walker + the .svelte exclude).
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();

    let c1 = dir.join("c1.svelte");
    let c2 = dir.join("c2.svelte");
    let c3 = dir.join("c3.svelte"); // no <style> — callback must never fire
    std::fs::write(&c1, "<div></div>\n<style>.sel_one{color:red}</style>\n").unwrap();
    std::fs::write(&c2, "<div></div>\n<style>.sel_two{color:blue}</style>\n").unwrap();
    std::fs::write(&c3, "<p>{x}</p>\n").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out1 = std::fs::read_to_string(&c1).unwrap();
    let out2 = std::fs::read_to_string(&c2).unwrap();
    let out3 = std::fs::read_to_string(&c3).unwrap();

    // Each file got the fake formatter applied to its own <style> body.
    assert!(out1.contains("/*FMT*/"), "c1 missing marker:\n{out1}");
    assert!(
        out1.contains(".sel_one"),
        "c1 missing its selector:\n{out1}"
    );
    assert!(out2.contains("/*FMT*/"), "c2 missing marker:\n{out2}");
    assert!(
        out2.contains(".sel_two"),
        "c2 missing its selector:\n{out2}"
    );

    // Critically: no cross-contamination between batched files.
    assert!(!out1.contains(".sel_two"), "c1 leaked c2's css:\n{out1}");
    assert!(!out2.contains(".sel_one"), "c2 leaked c1's css:\n{out2}");

    // A file with no <style> never invokes the formatter, so no marker.
    assert!(!out3.contains("/*FMT*/"), "c3 should be untouched:\n{out3}");

    // The placeholder must never survive into output.
    assert!(
        !out1.contains("RSVELTE_FMT_STYLE"),
        "placeholder leaked:\n{out1}"
    );
}

/// #693: inline `<script>` formatting must honor the project `.oxfmtrc`.
/// The script body is formatted in-process (no `oxfmt` needed), so a config
/// with `singleQuote: true` should keep the string single-quoted instead of
/// flipping it to oxc_formatter's double-quote default.
#[test]
fn inline_script_respects_oxfmtrc_single_quote() {
    let dir = tempdir();
    let cfg = dir.join(".oxfmtrc.json");
    std::fs::write(&cfg, r#"{ "singleQuote": true }"#).unwrap();

    let (stdout, _stderr, code) = run_stdin(
        "<script>const x = \"hello\"</script>\n<p>{x}</p>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            "x.svelte",
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0);
    assert!(
        stdout.contains("const x = 'hello';"),
        "expected single quotes from .oxfmtrc:\n{stdout}"
    );
    assert!(
        !stdout.contains("\"hello\""),
        "string should not be double-quoted:\n{stdout}"
    );
}

/// Without a config, the in-process default is oxc_formatter's double quotes —
/// confirms the config layer is what flips quote style, not something else.
#[test]
fn inline_script_defaults_to_double_quote_without_config() {
    let (stdout, _stderr, code) = run_stdin(
        "<script>const x = 'hello'</script>\n",
        &["--stdin", "--stdin-filepath", "x.svelte"],
    );
    assert_eq!(code, 0);
    assert!(
        stdout.contains("const x = \"hello\";"),
        "expected double-quote default:\n{stdout}"
    );
}

/// #694: a directory input is delegated to a single `oxfmt` invocation that
/// covers the full supported set (not a hard-coded extension list), with
/// `.svelte` excluded for the in-process pass. We stand in a fake `oxfmt` that
/// logs the exact argv it received so we can assert the delegation contract:
/// the directory is passed through, `.svelte` is excluded, and unmatched
/// patterns don't error.
#[test]
fn directory_delegates_full_set_to_oxfmt_with_svelte_excluded() {
    let dir = tempdir();

    // Fake oxfmt: append its received argv (one per line) to $FAKE_OXFMT_LOG.
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(
        &fake,
        r#"const fs = require('node:fs');
fs.appendFileSync(process.env.FAKE_OXFMT_LOG, process.argv.slice(2).join('\n') + '\n');
"#,
    )
    .unwrap();

    let log = dir.join("argv.log");
    std::fs::write(&log, "").unwrap();
    // A `.svelte` file (in-process) plus a non-`.svelte` file so the dir isn't
    // svelte-only.
    std::fs::write(dir.join("a.svelte"), "<p>{x}</p>\n").unwrap();
    std::fs::write(dir.join("readme.md"), "# x\n").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .env("FAKE_OXFMT_LOG", log.to_str().unwrap())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let argv = std::fs::read_to_string(&log).unwrap();
    let args: Vec<&str> = argv.lines().collect();
    assert!(
        args.contains(&"!**/*.svelte"),
        "oxfmt should be told to exclude .svelte; argv:\n{argv}"
    );
    assert!(
        args.contains(&"--no-error-on-unmatched-pattern"),
        "oxfmt should not error on unmatched patterns; argv:\n{argv}"
    );
    assert!(
        args.contains(&dir.to_str().unwrap()),
        "the directory itself should be delegated to oxfmt; argv:\n{argv}"
    );
    // We must NOT enumerate individual non-svelte files — the directory is
    // handed off whole so oxfmt's own walker decides coverage.
    assert!(
        !args.iter().any(|a| a.ends_with("readme.md")),
        "individual files should not be enumerated; argv:\n{argv}"
    );
}

// ─── Inline `<style>` cache (#703) ───────────────────────────────────────

/// A fake oxfmt that records one line in `$FAKE_OXFMT_LOG` per *batch*
/// invocation (any run that receives a real file argument), and otherwise
/// leaves the staged CSS files unchanged (identity format). Counting log lines
/// tells us how many times the `<style>` batch actually reached oxfmt.
fn write_counting_oxfmt(dir: &std::path::Path) -> PathBuf {
    let fake = dir.join("counting-oxfmt.cjs");
    std::fs::write(
        &fake,
        r#"const fs = require('node:fs');
const path = require('node:path');
let touchedFile = false;
for (const p of process.argv.slice(2)) {
  if (p.startsWith('-') || p.startsWith('!')) continue;
  let st;
  try { st = fs.statSync(p); } catch { continue; }
  if (st.isFile()) touchedFile = true; // identity: leave content as-is
  else if (st.isDirectory() && path.basename(p).startsWith('rsvelte-fmt-styles-')) {
    for (const e of fs.readdirSync(p)) {
      if (fs.statSync(path.join(p, e)).isFile()) touchedFile = true;
    }
  }
}
if (touchedFile && process.env.FAKE_OXFMT_LOG) {
  fs.appendFileSync(process.env.FAKE_OXFMT_LOG, 'call\n');
}
"#,
    )
    .unwrap();
    fake
}

fn oxfmt_call_count(log: &std::path::Path) -> usize {
    std::fs::read_to_string(log)
        .map(|s| s.lines().count())
        .unwrap_or(0)
}

/// A warm cache serves an unchanged `<style>` body without touching oxfmt: the
/// first `--check` populates the cache (one batch call), the second hits it
/// (zero further calls).
#[test]
fn style_cache_skips_oxfmt_on_warm_run() {
    let dir = tempdir();
    let cache = dir.join("cache");
    let log = dir.join("calls.log");
    std::fs::write(&log, "").unwrap();
    let fake = write_counting_oxfmt(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let check = || {
        Command::new(bin())
            .args([
                file.to_str().unwrap(),
                "--check",
                "--oxfmt-bin",
                fake.to_str().unwrap(),
            ])
            .env("RSVELTE_FMT_CACHE_DIR", &cache)
            .env("FAKE_OXFMT_LOG", &log)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .unwrap();
    };

    check(); // cold — populates the cache
    assert_eq!(
        oxfmt_call_count(&log),
        1,
        "cold run should invoke oxfmt once"
    );
    check(); // warm — should be served from cache
    assert_eq!(
        oxfmt_call_count(&log),
        1,
        "warm run should NOT invoke oxfmt again (served from cache)"
    );
}

/// `--no-style-cache` opts out: oxfmt is invoked on every run.
#[test]
fn no_style_cache_flag_always_invokes_oxfmt() {
    let dir = tempdir();
    let cache = dir.join("cache");
    let log = dir.join("calls.log");
    std::fs::write(&log, "").unwrap();
    let fake = write_counting_oxfmt(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let check = || {
        Command::new(bin())
            .args([
                file.to_str().unwrap(),
                "--check",
                "--no-style-cache",
                "--oxfmt-bin",
                fake.to_str().unwrap(),
            ])
            .env("RSVELTE_FMT_CACHE_DIR", &cache)
            .env("FAKE_OXFMT_LOG", &log)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .unwrap();
    };

    check();
    check();
    assert_eq!(
        oxfmt_call_count(&log),
        2,
        "--no-style-cache should invoke oxfmt on every run"
    );
}

/// `RSVELTE_FMT_NO_CACHE` disables the cache the same way the flag does.
#[test]
fn env_disables_style_cache() {
    let dir = tempdir();
    let cache = dir.join("cache");
    let log = dir.join("calls.log");
    std::fs::write(&log, "").unwrap();
    let fake = write_counting_oxfmt(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let check = || {
        Command::new(bin())
            .args([
                file.to_str().unwrap(),
                "--check",
                "--oxfmt-bin",
                fake.to_str().unwrap(),
            ])
            .env("RSVELTE_FMT_CACHE_DIR", &cache)
            .env("RSVELTE_FMT_NO_CACHE", "1")
            .env("FAKE_OXFMT_LOG", &log)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .unwrap();
    };

    check();
    check();
    assert_eq!(
        oxfmt_call_count(&log),
        2,
        "RSVELTE_FMT_NO_CACHE should disable the cache"
    );
}

/// Cache hits must be byte-identical to a fresh (uncached) format. A fake oxfmt
/// that prefixes each `<style>` body with a marker formats two identical files;
/// one run uses the cache, the other disables it — the written output must match.
#[test]
fn style_cache_output_matches_uncached() {
    let dir = tempdir();
    let cache = dir.join("cache");
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();

    let body = "<div></div>\n<style>.a{color:red}</style>\n";
    let cached = dir.join("cached.svelte");
    let uncached = dir.join("uncached.svelte");
    std::fs::write(&cached, body).unwrap();
    std::fs::write(&uncached, body).unwrap();

    let fmt = |file: &std::path::Path, no_cache: bool| {
        let mut args = vec![
            file.to_str().unwrap().to_string(),
            "--write".to_string(),
            "--oxfmt-bin".to_string(),
            fake.to_str().unwrap().to_string(),
        ];
        if no_cache {
            args.push("--no-style-cache".to_string());
        }
        Command::new(bin())
            .args(&args)
            .env("RSVELTE_FMT_CACHE_DIR", &cache)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .unwrap();
    };

    // Warm the cache by formatting the cached file once, then re-create it and
    // format again (this second format is served from cache).
    fmt(&cached, false);
    std::fs::write(&cached, body).unwrap();
    fmt(&cached, false);

    fmt(&uncached, true);

    let a = std::fs::read_to_string(&cached).unwrap();
    let b = std::fs::read_to_string(&uncached).unwrap();
    assert_eq!(a, b, "cached output must equal uncached output");
    assert!(
        a.contains("/*FMT*/"),
        "marker missing — oxfmt result not applied:\n{a}"
    );
}

/// `.oxfmtrc` `ignorePatterns` must exclude matching `.svelte` files from the
/// in-process walk, mirroring what `oxfmt` does for the non-`.svelte` files it
/// walks. The dummy `--oxfmt-bin true` keeps the delegated directory pass a
/// no-op so the test needs no real `oxfmt`.
#[test]
fn check_excludes_svelte_via_oxfmtrc_ignore_patterns() {
    let dir = tempdir();
    std::fs::write(
        dir.join(".oxfmtrc.json"),
        r#"{ "ignorePatterns": ["ignored/**/*.svelte"] }"#,
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("ignored")).unwrap();
    std::fs::create_dir_all(dir.join("kept")).unwrap();
    // Both files are unformatted, so only ignore rules decide who is reported.
    std::fs::write(
        dir.join("ignored").join("skip.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();
    std::fs::write(
        dir.join("kept").join("keep.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--check", ".", "--oxfmt-bin", "true"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();
    let stdout = String::from_utf8(out.stdout).unwrap();

    assert!(
        stdout.contains("keep.svelte"),
        "kept file must be checked:\n{stdout}"
    );
    assert!(
        !stdout.contains("skip.svelte"),
        "ignored file must be excluded:\n{stdout}"
    );
    assert_eq!(out.status.code(), Some(1));
}

/// `.prettierignore` (oxfmt's default formatter ignore file) must also exclude
/// matching `.svelte` files from the in-process walk.
#[test]
fn check_excludes_svelte_via_prettierignore() {
    let dir = tempdir();
    std::fs::write(dir.join(".prettierignore"), "ignored/\n").unwrap();
    std::fs::create_dir_all(dir.join("ignored")).unwrap();
    std::fs::create_dir_all(dir.join("kept")).unwrap();
    std::fs::write(
        dir.join("ignored").join("skip.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();
    std::fs::write(
        dir.join("kept").join("keep.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--check", ".", "--oxfmt-bin", "true"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();
    let stdout = String::from_utf8(out.stdout).unwrap();

    assert!(
        stdout.contains("keep.svelte"),
        "kept file must be checked:\n{stdout}"
    );
    assert!(
        !stdout.contains("skip.svelte"),
        "ignored file must be excluded:\n{stdout}"
    );
    assert_eq!(out.status.code(), Some(1));
}

fn tempdir() -> PathBuf {
    let mut dir = std::env::temp_dir();
    dir.push(format!(
        "rsvelte_fmt_test_{}_{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos(),
    ));
    std::fs::create_dir_all(&dir).unwrap();
    dir
}
