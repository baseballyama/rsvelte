//! Integration tests for the `rsvelte-fmt` CLI. Only the Svelte path is
//! exercised here — the oxfmt-delegation path requires `oxfmt` to be on
//! `$PATH`, which we can't assume in CI; that surface is covered by the
//! ecosystem-ci job once a Phase ≥3 lands.

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
