//! Input the command refuses instead of reporting an empty or partial run as a success.

use std::path::PathBuf;
use std::process::{Command, Output};

fn rsvelte(arguments: &[&str]) -> Output {
    Command::new(env!("CARGO_BIN_EXE_rsvelte"))
        .args(arguments)
        .output()
        .expect("run CLI")
}

fn stderr(output: &Output) -> String {
    String::from_utf8_lossy(&output.stderr).into_owned()
}

/// A directory of its own below the temporary directory, removed when dropped.
struct Scratch(PathBuf);

impl Scratch {
    fn new(name: &str) -> Self {
        let path = std::env::temp_dir().join(format!("rsvelte-cli-{name}-{}", std::process::id()));
        drop(std::fs::remove_dir_all(&path));
        std::fs::create_dir_all(&path).expect("test directory");
        Self(path)
    }

    fn path(&self) -> &str {
        self.0.to_str().expect("a UTF-8 temporary directory")
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove test directory");
    }
}

#[test]
fn a_directory_that_does_not_exist_is_not_an_empty_corpus() {
    let scratch = Scratch::new("missing");
    let missing = scratch.0.join("missing");
    let missing = missing.to_str().expect("UTF-8");
    for arguments in [
        &["corpus", missing][..],
        &["benchmark", missing],
        &["performance", missing],
    ] {
        let output = rsvelte(arguments);
        assert_eq!(output.status.code(), Some(2), "{arguments:?}");
        assert!(
            stderr(&output).contains("not a directory"),
            "{}",
            stderr(&output)
        );
    }
}

#[test]
fn a_mistyped_option_is_not_a_directory() {
    let scratch = Scratch::new("option");
    let output = rsvelte(&["corpus", scratch.path(), "--tasks", "svelte.compile/client"]);
    assert_eq!(output.status.code(), Some(2));
    assert!(
        stderr(&output).contains("unknown option --tasks"),
        "{}",
        stderr(&output)
    );
}

#[test]
fn outputs_that_cannot_be_written_fail_the_run() {
    let scratch = Scratch::new("unwritable");
    let unit = scratch.0.join("App.svelte");
    std::fs::create_dir_all(&unit).expect("unit directory");
    std::fs::write(unit.join("input.svelte"), "<p>Hello</p>").expect("input");
    // A file where `actual/` has to be a directory.
    std::fs::write(unit.join("actual"), "").expect("blocking file");
    let output = rsvelte(&["corpus", scratch.path(), "--task", "svelte.compile/client"]);
    assert_eq!(output.status.code(), Some(1), "{}", stderr(&output));
    let stderr = stderr(&output);
    assert!(stderr.contains("cannot write: "), "{stderr}");
    assert!(stderr.contains("1 unit(s) not written"), "{stderr}");
}
