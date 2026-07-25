use std::process::{Command, Stdio};

use crate::common::{bin, tempdir};

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

/// With no path argument, `rsvelte-fmt` formats the current directory in place
/// (write is the default), matching `oxfmt`'s "if not provided, current working
/// directory is used" behavior (#1432).
#[test]
fn no_paths_defaults_to_cwd_and_writes() {
    let dir = tempdir();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .unwrap();
    assert_eq!(out.status.code(), Some(0), "should default to cwd + write");

    let after = std::fs::read_to_string(&file).unwrap();
    assert!(after.contains("let x = 1 + 2;"), "{after}");
}

/// `--check` with no path checks the current directory and never writes, exiting
/// non-zero when a file would be reformatted — same as `oxfmt --check`.
#[test]
fn no_paths_check_does_not_write() {
    let dir = tempdir();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--check", "--oxfmt-bin", "true"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();
    assert_eq!(
        out.status.code(),
        Some(1),
        "unformatted cwd must fail --check"
    );

    let after = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        after, "<script>let x=1+2</script>",
        "--check must not write"
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
