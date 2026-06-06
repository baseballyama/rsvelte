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

    // Fake oxfmt: prepend `/*FMT*/` to every file path it receives (in place).
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(
        &fake,
        r#"const fs = require('node:fs');
for (const p of process.argv.slice(2)) {
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
    assert!(out1.contains(".sel_one"), "c1 missing its selector:\n{out1}");
    assert!(out2.contains("/*FMT*/"), "c2 missing marker:\n{out2}");
    assert!(out2.contains(".sel_two"), "c2 missing its selector:\n{out2}");

    // Critically: no cross-contamination between batched files.
    assert!(!out1.contains(".sel_two"), "c1 leaked c2's css:\n{out1}");
    assert!(!out2.contains(".sel_one"), "c2 leaked c1's css:\n{out2}");

    // A file with no <style> never invokes the formatter, so no marker.
    assert!(!out3.contains("/*FMT*/"), "c3 should be untouched:\n{out3}");

    // The placeholder must never survive into output.
    assert!(!out1.contains("RSVELTE_FMT_STYLE"), "placeholder leaked:\n{out1}");
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
