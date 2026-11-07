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
        &["corpus", missing, "--task", "svelte.compile/client"][..],
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
fn performance_needs_at_least_one_round() {
    let scratch = Scratch::new("rounds");
    let output = rsvelte(&["performance", scratch.path(), "rounds=0"]);
    assert_eq!(output.status.code(), Some(2));
    assert!(
        stderr(&output).contains("expected a positive integer"),
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

/// `rsvelte <arguments>` in `directory`, which holds `App.svelte/input.svelte`.
fn rsvelte_in(directory: &Scratch, arguments: &[&str]) -> Output {
    Command::new(env!("CARGO_BIN_EXE_rsvelte"))
        .current_dir(&directory.0)
        .args(arguments)
        .output()
        .expect("run CLI")
}

fn component(name: &str) -> Scratch {
    let scratch = Scratch::new(name);
    let unit = scratch.0.join("App.svelte");
    std::fs::create_dir_all(&unit).expect("unit directory");
    std::fs::write(unit.join("input.svelte"), "<p>Hello</p>").expect("input");
    scratch
}

#[test]
fn every_task_includes_the_checks_so_they_must_be_configured() {
    let scratch = component("every-task");
    let refused = [
        (
            &["run", "App.svelte/input.svelte"][..],
            "svelte.check/default needs a type checker",
        ),
        (
            &["corpus", "."],
            "svelte.check/default needs a type checker",
        ),
        (
            &["corpus", ".", "--type-checker", "tsc"],
            "svelte.check/default needs --svelte <svelte package dir>",
        ),
    ];
    for (arguments, message) in refused {
        let output = rsvelte_in(&scratch, arguments);
        assert_eq!(output.status.code(), Some(2), "{arguments:?}");
        let stderr = stderr(&output);
        assert!(stderr.contains(message), "{arguments:?}: {stderr}");
        assert!(stderr.contains("--task"), "{arguments:?}: {stderr}");
    }
    assert!(
        !scratch.0.join("App.svelte/actual").exists(),
        "a refused run writes nothing"
    );
}

#[test]
fn named_tasks_and_document_task_commands_need_no_type_checker() {
    let scratch = component("named-tasks");
    for arguments in [
        &[
            "run",
            "App.svelte/input.svelte",
            "--task",
            "svelte.compile/client",
        ][..],
        &["corpus", ".", "--task", "svelte.compile/client"],
        // These run the document tasks when none is named.
        &["performance", ".", "json=/dev/null"],
        &["benchmark", ".", "rounds=1", "json=/dev/null"],
    ] {
        let output = rsvelte_in(&scratch, arguments);
        assert!(
            output.status.success(),
            "{arguments:?}: {}",
            stderr(&output)
        );
    }
}
