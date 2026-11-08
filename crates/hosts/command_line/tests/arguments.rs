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
fn performance_rounds_are_a_whole_number() {
    let scratch = Scratch::new("rounds");
    let output = rsvelte(&["performance", scratch.path(), "rounds=two"]);
    assert_eq!(output.status.code(), Some(2));
    assert!(
        stderr(&output).contains("expected a whole number"),
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
    for arguments in [&["run", "App.svelte/input.svelte"][..], &["corpus", "."]] {
        let output = rsvelte_in(&scratch, arguments);
        assert_eq!(output.status.code(), Some(2), "{arguments:?}");
        let stderr = stderr(&output);
        assert!(
            stderr.contains("ts.check/default needs a type checker"),
            "{arguments:?}: {stderr}"
        );
        assert!(
            stderr.contains("no task was named"),
            "{arguments:?}: {stderr}"
        );
    }
    assert!(
        !scratch.0.join("App.svelte/actual").exists(),
        "a refused run writes nothing"
    );
}

/// A plugin that needs more than the shared type checker says so, after the checker is found.
#[cfg(unix)]
#[test]
fn a_check_names_the_option_it_lacks() {
    use std::os::unix::fs::PermissionsExt;
    let scratch = component("check-option");
    let checker = scratch.0.join("tsc");
    std::fs::write(&checker, "#!/bin/sh\necho 'Version 7.1.0'\n").expect("checker");
    std::fs::set_permissions(&checker, std::fs::Permissions::from_mode(0o755)).expect("mode");
    let options = format!(r#"{{"command":["{}"]}}"#, checker.display());
    let output = rsvelte_in(
        &scratch,
        &["corpus", ".", "--options", "typescript.check", &options],
    );
    assert_eq!(output.status.code(), Some(2));
    let stderr = stderr(&output);
    assert!(
        stderr.contains("svelte.check/default needs the svelte package"),
        "{stderr}"
    );
    let output = rsvelte_in(
        &scratch,
        &[
            "corpus",
            ".",
            "--task",
            "svelte.compile/client",
            "--options",
            "typescript.check",
            &options,
        ],
    );
    assert!(output.status.success(), "{}", self::stderr(&output));
}

#[test]
fn options_for_no_installed_plugin_are_refused() {
    let scratch = component("unknown-plugin");
    let output = rsvelte_in(
        &scratch,
        &[
            "corpus",
            ".",
            "--task",
            "svelte.compile/client",
            "--options",
            "svelte.compiler",
            "{}",
        ],
    );
    assert_eq!(output.status.code(), Some(2));
    let stderr = stderr(&output);
    assert!(
        stderr.contains("no installed plugin reads the options of `svelte.compiler`"),
        "{stderr}"
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
