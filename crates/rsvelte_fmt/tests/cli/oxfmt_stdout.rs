use std::process::Command;

use crate::common::{bin, tempdir};

/// A fake oxfmt that writes one recognisable line to stdout and exits 0 —
/// standing in for the real summary (`Finished in 2ms on 0 files …`) and the
/// real check listing, which are the same stream.
const CHATTY_OXFMT: &str = "console.log('FAKE-OXFMT-STDOUT');\n";

fn run(dir: &std::path::Path, extra: &[&str]) -> (String, String, i32) {
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, CHATTY_OXFMT).unwrap();
    let mut args = vec![
        dir.to_str().unwrap().to_string(),
        "--oxfmt-bin".to_string(),
        fake.to_str().unwrap().to_string(),
    ];
    args.extend(extra.iter().map(|s| (*s).to_string()));
    let out = Command::new(bin()).args(&args).output().unwrap();
    (
        String::from_utf8(out.stdout).unwrap(),
        String::from_utf8(out.stderr).unwrap(),
        out.status.code().unwrap_or(-1),
    )
}

/// #4302: a directory run invokes `oxfmt` for the non-`.svelte` share even when
/// the tree holds only `.svelte` files, and forwarding that invocation's stdout
/// printed a `No files found matching the given patterns.` / `on 0 files` pair
/// above our own `formatted 1 / 1 files`. The two describe different scopes and
/// the first reads exactly like a failure.
#[test]
fn write_mode_does_not_forward_the_child_oxfmt_stdout() {
    let dir = tempdir();
    std::fs::write(dir.join("App.svelte"), "<script>let x=1+2</script>").unwrap();

    let (stdout, stderr, code) = run(&dir, &["--write"]);
    assert_eq!(code, 0, "stdout:\n{stdout}");
    assert!(
        !stdout.contains("FAKE-OXFMT-STDOUT"),
        "write mode should not forward oxfmt's stdout; got:\n{stdout}"
    );
    // The run still did its own work and still reports it — the assertion above
    // is satisfied by a command that prints nothing at all, so this one is what
    // separates "suppressed the child" from "suppressed everything". Our summary
    // goes to stderr (`run.rs`'s `eprintln!`), which is also why the leak was
    // the only thing a caller reading stdout ever saw.
    assert!(
        stderr.contains("formatted"),
        "our own summary should survive; stdout:\n{stdout}\nstderr:\n{stderr}"
    );
    let after = std::fs::read_to_string(dir.join("App.svelte")).unwrap();
    assert!(after.contains("let x = 1 + 2;"), "{after}");
}

/// The other direction: in check mode the child's stdout is the listing of what
/// would be reformatted, so it must still reach the user. Without this cell the
/// fix above is passed by deleting the forward outright.
#[test]
fn check_mode_still_forwards_the_child_oxfmt_stdout() {
    let dir = tempdir();
    std::fs::write(dir.join("App.svelte"), "<script>let x = 1 + 2;</script>\n").unwrap();

    let (stdout, _stderr, _code) = run(&dir, &["--check"]);
    assert!(
        stdout.contains("FAKE-OXFMT-STDOUT"),
        "check mode should forward oxfmt's listing; got:\n{stdout}"
    );
}
