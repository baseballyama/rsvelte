use std::io::Write;
use std::process::{Command, Stdio};

use crate::common::{bin, run_stdin, tempdir};

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

/// The cwd default applies only to the file-walk path: `--stdin` still reads
/// stdin and leaves on-disk files untouched even with no path argument.
#[test]
fn stdin_ignores_cwd_default() {
    let dir = tempdir();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let mut child = Command::new(bin())
        .current_dir(&dir)
        .args(["--stdin", "--stdin-filepath", "In.svelte"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .unwrap();
    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(b"<script>let y=3+4</script>\n<p>{ y }</p>")
        .unwrap();
    let out = child.wait_with_output().unwrap();
    assert_eq!(out.status.code(), Some(0));

    let stdout = String::from_utf8(out.stdout).unwrap();
    assert!(stdout.contains("let y = 3 + 4;"), "stdout:\n{stdout}");
    // The on-disk file must be left untouched — stdin mode doesn't walk the cwd.
    let after = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        after, "<script>let x=1+2</script>",
        "stdin must not touch cwd"
    );
}
