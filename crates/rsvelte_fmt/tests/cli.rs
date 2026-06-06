//! Integration tests for the `rsvelte-fmt` CLI. The Svelte formatting path
//! and the batched `<style>` delegation path are exercised here; the latter
//! stands in a fake `oxfmt` (a `.cjs` run through `node`) so it needs no real
//! `oxfmt` on `$PATH`. Delegation of whole non-`.svelte` files to a real
//! `oxfmt` is covered by the ecosystem-ci job.

use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

fn bin() -> PathBuf {
    // Cargo sets CARGO_BIN_EXE_<bin-name> for integration tests so the test
    // doesn't have to guess where the binary lives — important under
    // cargo-llvm-cov, which uses target/llvm-cov-target/ instead of target/.
    PathBuf::from(env!("CARGO_BIN_EXE_rsvelte-fmt"))
}

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
    // place). Skips flags (`--…`) and exclude globs (`!…`) and silently ignores
    // directory arguments — so it tolerates the directory-delegation args
    // (`--no-error-on-unmatched-pattern !**/*.svelte <dir>`) the non-`.svelte`
    // pass now passes, while still exercising the temp-file `<style>` batch.
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(
        &fake,
        r#"const fs = require('node:fs');
for (const p of process.argv.slice(2)) {
  if (p.startsWith('-') || p.startsWith('!')) continue;
  let st;
  try { st = fs.statSync(p); } catch { continue; }
  if (!st.isFile()) continue;
  fs.writeFileSync(p, '/*FMT*/' + fs.readFileSync(p, 'utf8'));
}
"#,
    )
    .unwrap();

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
