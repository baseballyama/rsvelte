use std::path::Path;
use std::process::{Command, Stdio};

use crate::common::{bin, real_oxfmt_bin, real_oxfmt_runnable, tempdir};

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

/// A stand-in `oxfmt` that mirrors just the one behavior this file's no-match
/// tests need: real oxfmt only reports "Expected at least one target file…"
/// (exit 2) when `--no-error-on-unmatched-pattern` is *not* on its argv. Since
/// `rsvelte-fmt` always used to pass that flag unconditionally (masking a
/// genuinely empty tree as a false success), whether the flag is present is
/// exactly what proves the fix: it must be omitted once every in-process pass
/// (Svelte, native JS/JSON/CSS) also found nothing.
const NO_MATCH_ECHO_OXFMT: &str = r#"const argv = process.argv.slice(2);
if (!argv.includes('--no-error-on-unmatched-pattern')) {
  process.stderr.write('Expected at least one target file. All matched files may have been excluded by ignore rules.\n');
  process.exit(2);
}
"#;

/// An empty directory (no files at all, so not even `oxfmt`'s own delegated
/// share has a target) must exit like real `oxfmt` does when it hits "no
/// target file" unsuppressed — exit 2 with its exact message — not a false
/// success from the `--no-error-on-unmatched-pattern` flag `rsvelte-fmt`
/// always used to pass.
#[test]
fn empty_directory_exits_two_with_oxfmt_message() {
    // The fake oxfmt script lives next to (not inside) the target directory —
    // it's a `.cjs` file, so placing it inside would make the tree not
    // actually empty (the native-JS pass would pick it up as a real target).
    let holder = tempdir();
    let fake = holder.join("fake-oxfmt.cjs");
    std::fs::write(&fake, NO_MATCH_ECHO_OXFMT).unwrap();
    let dir = holder.join("empty");
    std::fs::create_dir(&dir).unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--oxfmt-bin", fake.to_str().unwrap()])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();

    assert_eq!(out.status.code(), Some(2), "empty directory must exit 2");
    assert!(out.stdout.is_empty(), "stdout:\n{:?}", out.stdout);
    assert_eq!(
        String::from_utf8(out.stderr).unwrap(),
        "Expected at least one target file. All matched files may have been excluded by ignore rules.\n",
    );
}

/// Same as `empty_directory_exits_two_with_oxfmt_message`, but with `--check`
/// — the no-match error takes priority over `--check`'s own "would reformat"
/// exit-1 convention, matching oxfmt (which also exits 2, not 1, here).
#[test]
fn empty_directory_check_exits_two_with_oxfmt_message() {
    let holder = tempdir();
    let fake = holder.join("fake-oxfmt.cjs");
    std::fs::write(&fake, NO_MATCH_ECHO_OXFMT).unwrap();
    let dir = holder.join("empty");
    std::fs::create_dir(&dir).unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--check", "--oxfmt-bin", fake.to_str().unwrap()])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();

    assert_eq!(
        out.status.code(),
        Some(2),
        "empty directory must exit 2 even under --check"
    );
    assert!(out.stdout.is_empty(), "stdout:\n{:?}", out.stdout);
    assert_eq!(
        String::from_utf8(out.stderr).unwrap(),
        "Expected at least one target file. All matched files may have been excluded by ignore rules.\n",
    );
}

/// A directory containing only a `.svelte` file legitimately leaves oxfmt's
/// own delegated share empty — that must stay a clean no-op (the
/// `--no-error-on-unmatched-pattern` flag still applied), not the no-match
/// error above. Regression guard for the `in_process_empty` gate added
/// alongside `empty_directory_exits_two_with_oxfmt_message`.
#[test]
fn svelte_only_directory_is_not_treated_as_no_match() {
    let dir = tempdir();
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, NO_MATCH_ECHO_OXFMT).unwrap();
    std::fs::write(dir.join("App.svelte"), "<script>let x=1+2</script>").unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--oxfmt-bin", fake.to_str().unwrap()])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();

    assert!(
        out.status.success(),
        "svelte-only tree must still succeed: exit {:?}, stderr:\n{}",
        out.status.code(),
        String::from_utf8_lossy(&out.stderr)
    );
}

// ─── real-oxfmt no-match parity (#1636) ──────────────────────────────────
//
// The tests above exercise `rsvelte-fmt`'s own decision logic against a fake
// oxfmt; the tests below replay the same scenarios end-to-end against the
// real vendored `oxfmt` binary, since the whole point of this fix is exact
// exit-code/message parity with it. No-op (with a notice) when that binary
// isn't present/runnable, matching this crate's other real-oxfmt-dependent
// tests (see `svelte_dev_markdown.rs`).

/// Runs `rsvelte-fmt <dir>` against the real `oxfmt` binary and asserts both
/// exit 2 and oxfmt's exact "no target file" message — the scenario is set up
/// by `setup` beforehand.
fn assert_real_oxfmt_no_match(setup: impl FnOnce(&Path)) {
    let oxfmt = real_oxfmt_bin();
    if !real_oxfmt_runnable(&oxfmt) {
        eprintln!(
            "[fmt-no-match] real oxfmt not runnable at {} (set OXFMT_BIN); skipping.",
            oxfmt.display()
        );
        return;
    }

    let dir = tempdir();
    setup(&dir);

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--oxfmt-bin", oxfmt.to_str().unwrap()])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();

    assert_eq!(
        out.status.code(),
        Some(2),
        "expected exit 2 against real oxfmt; stderr:\n{}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert_eq!(
        String::from_utf8(out.stderr).unwrap(),
        "Expected at least one target file. All matched files may have been excluded by ignore rules.\n",
    );
}

/// Case A: a fully empty directory.
#[test]
fn real_oxfmt_empty_directory_is_no_match() {
    assert_real_oxfmt_no_match(|_dir| {});
}

/// Case E: an empty subdirectory only — no files anywhere in the tree.
#[test]
fn real_oxfmt_empty_subdirectory_only_is_no_match() {
    assert_real_oxfmt_no_match(|dir| {
        std::fs::create_dir(dir.join("sub")).unwrap();
    });
}

/// Case B: a `.js` file exists but is excluded via `.gitignore`.
#[test]
fn real_oxfmt_gitignored_js_is_no_match() {
    assert_real_oxfmt_no_match(|dir| {
        let status = Command::new("git")
            .arg("init")
            .arg("-q")
            .arg(dir)
            .status()
            .unwrap();
        assert!(status.success(), "git init failed");
        std::fs::write(dir.join(".gitignore"), "a.js\n").unwrap();
        std::fs::write(dir.join("a.js"), "const x=1\n").unwrap();
    });
}

/// Case C: a `.js` file exists but is excluded via `.prettierignore`.
#[test]
fn real_oxfmt_prettierignored_js_is_no_match() {
    assert_real_oxfmt_no_match(|dir| {
        std::fs::write(dir.join(".prettierignore"), "a.js\n").unwrap();
        std::fs::write(dir.join("a.js"), "const x=1\n").unwrap();
    });
}

/// Case D: only a `.txt` file, which no pass (native or oxfmt) formats.
#[test]
fn real_oxfmt_unsupported_extension_only_is_no_match() {
    assert_real_oxfmt_no_match(|dir| {
        std::fs::write(dir.join("note.txt"), "hello\n").unwrap();
    });
}
