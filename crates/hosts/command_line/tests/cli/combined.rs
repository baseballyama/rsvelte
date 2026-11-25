//! `rsvelte <command> <command>...`: several commands in one run, which print and exit as the
//! commands run one by one do.

use std::path::Path;
use std::process::Output;

use crate::Scratch;
use crate::typecheck::Native;

fn rsvelte(directory: &Path, arguments: &[&str]) -> Output {
    crate::rsvelte(directory)
        .args(arguments)
        .output()
        .expect("run CLI")
}

fn text(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).into_owned()
}

/// The lines of `report` in order, less oxlint's timing, which differs from run to run. oxlint
/// prints the files in the order its threads finish them.
fn lines(report: &str) -> Vec<&str> {
    let mut lines: Vec<&str> = (report.lines())
        .filter(|line| !line.starts_with("Finished in "))
        .collect();
    lines.sort_unstable();
    lines
}

/// The exit code and the output of a run.
fn run(directory: &Path, arguments: &[&str]) -> (Option<i32>, String) {
    let output = rsvelte(directory, arguments);
    (output.status.code(), text(&output.stdout))
}

/// The worst exit code and the output of each of `runs`, one after another.
fn one_by_one(directory: &Path, runs: &[&[&str]]) -> (Option<i32>, String) {
    let mut worst = (Some(0), String::new());
    for arguments in runs {
        let (code, stdout) = run(directory, arguments);
        worst.0 = worst.0.max(code);
        worst.1.push_str(&stdout);
    }
    worst
}

/// Whether two runs exit and print alike, as [`lines`] compares their reports.
#[track_caller]
fn assert_same(actual: &(Option<i32>, String), expected: &(Option<i32>, String), what: &str) {
    assert_eq!(actual.0, expected.0, "{what}: {}", actual.1);
    assert_eq!(lines(&actual.1), lines(&expected.1), "{what}");
}

/// A project with a lint error and a type error in a component and in a script, and a component
/// in `other` that only lint reads. The components' styles do not parse, and lint names the file
/// in that message.
fn project() -> Scratch {
    let config = crate::typecheck::typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    Scratch::new(&[
        ("rsvelte.config.json", &config),
        (
            ".oxlintrc.json",
            r#"{ "rules": { "svelte/valid-style-parse": "error" } }"#,
        ),
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler",
"strict":true,"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#,
        ),
        (
            "src/App.svelte",
            "<script lang=\"ts\">\n\tlet unused = 1;\n\tconst n: number = 'x';\n</script>\n\n\
             {n}\n\n<style>\n\t.a { color: red; }}\n</style>\n",
        ),
        (
            "src/wrong.ts",
            "const unused = 1;\nexport const s: string = 1;\n",
        ),
        (
            "other/Only.svelte",
            "<style>
	.a { color: red; }}
</style>
",
        ),
    ])
}

#[test]
fn lint_and_typecheck_print_and_exit_as_they_do_one_by_one() {
    let project = project();
    let expected = one_by_one(&project, &[&["lint"], &["typecheck"]]);
    assert_eq!(expected.0, Some(1));
    for needle in [
        "[src/App.svelte:",
        "[other/Only.svelte:",
        "src/wrong.ts(2,14): ",
    ] {
        let needle = needle.native();
        assert!(expected.1.contains(&needle), "{needle}: {}", expected.1);
    }
    // A configuration that discovery does not find, so only `--config` names it. `lint` followed by
    // an option takes oxlint's arguments, so the option goes after the commands or before them.
    std::fs::rename(
        project.join("rsvelte.config.json"),
        project.join("custom.json"),
    )
    .expect("rename");
    for combined in [
        &["lint", "typecheck", "--config", "custom.json"][..],
        &["typecheck", "lint", "--config", "custom.json"],
        &["--config", "custom.json", "lint", "typecheck"],
    ] {
        assert_same(
            &run(&project, combined),
            &expected,
            &format!("{combined:?}"),
        );
    }
    std::fs::rename(
        project.join("custom.json"),
        project.join("rsvelte.config.json"),
    )
    .expect("rename");
    // Lint reads only `other`, so typecheck reads the project's files alone.
    let expected = one_by_one(&project, &[&["lint", "other"], &["typecheck"]]);
    assert!(!expected.1.contains("[src/App.svelte:"), "{}", expected.1);
    assert_same(
        &run(&project, &["lint", "typecheck", "other"]),
        &expected,
        "other",
    );
    let clean = "<script lang=\"ts\">\n\tconst n: number = 1;\n</script>\n\n{n}\n";
    std::fs::write(project.join("src/App.svelte"), clean).expect("component");
    std::fs::write(
        project.join("src/wrong.ts"),
        "export const s: string = '';\n",
    )
    .expect("script");
    std::fs::remove_dir_all(project.join("other")).expect("other");
    let (code, report) = run(&project, &["lint", "typecheck"]);
    assert_eq!(code, Some(0), "{report}");
    assert!(
        report.contains("Found 0 warnings and 0 errors."),
        "{report}"
    );
}

/// The project's tsconfig.json has problems, which typecheck prints instead of checking.
#[test]
fn typecheck_prints_the_problems_of_its_tsconfig_after_the_lint_report() {
    let project = project();
    let tsconfig = r#"{"compilerOptions":{"strict":true,"types":[],"foo":1},"include":["src"]}"#;
    std::fs::write(project.join("tsconfig.json"), tsconfig).expect("tsconfig");
    let expected = one_by_one(&project, &[&["lint"], &["typecheck"]]);
    assert!(expected.1.contains("TS5023"), "{}", expected.1);
    assert_same(
        &run(&project, &["lint", "typecheck"]),
        &expected,
        "tsconfig",
    );
}

#[test]
fn format_runs_first_and_the_others_read_what_it_wrote() {
    let project = project();
    let unformatted = "const unused = 1;\n\n\n\nexport const s: string = 1\n";
    std::fs::write(project.join("src/wrong.ts"), unformatted).expect("script");
    for (combined, alone) in [
        (
            &["format", "lint", "typecheck", "--check"][..],
            &[&["lint"][..], &["typecheck"]][..],
        ),
        (&["format", "lint", "--check"], &[&["lint"]]),
        (&["format", "typecheck", "--check"], &[&["typecheck"]]),
    ] {
        let others = one_by_one(&project, alone);
        let (code, report) = run(&project, combined);
        assert_eq!(code, Some(1), "{combined:?}");
        let formatted = report.find("Format issues found").expect("format's report");
        for line in lines(&others.1) {
            assert!(
                report[formatted..].contains(line),
                "{combined:?} {line}: {report}"
            );
        }
    }
    // The paths go to `format` too: `other` is formatted.
    let (code, report) = run(&project, &["format", "lint", "other", "--check"]);
    assert_eq!(code, Some(1));
    assert!(!report.contains("Format issues found"), "{report}");
    assert_eq!(
        std::fs::read_to_string(project.join("src/wrong.ts")).expect("script"),
        unformatted
    );
    let (code, written) = run(&project, &["lint", "typecheck", "format"]);
    assert_eq!(code, Some(1));
    // Formatting moved the type error from line 5 to line 3, and the reports name line 3.
    let after = one_by_one(&project, &[&["lint"], &["typecheck"]]);
    assert!(after.1.contains("src/wrong.ts(3,14)"), "{}", after.1);
    for line in lines(&after.1) {
        assert!(written.contains(line), "{line}: {written}");
    }
}

#[test]
fn a_combined_run_refuses_what_it_cannot_run() {
    let project = project();
    for (arguments, message) in [
        (&["lint", "lint"][..], "`lint` is named twice"),
        (
            &["lint", "typecheck", "--check"],
            "--check applies to `format`",
        ),
        (&["lint", "typecheck", "--bogus"], "unknown option --bogus"),
    ] {
        let output = rsvelte(&project, arguments);
        assert_eq!(output.status.code(), Some(2), "{arguments:?}");
        let stderr = text(&output.stderr);
        assert!(stderr.contains(message), "{arguments:?}: {stderr}");
    }
}

#[test]
fn a_command_that_cannot_install_does_not_stop_the_other() {
    let project = Scratch::new(&[(
        "A.svelte",
        "<script>\n\tlet unused = 1;\n\tdebugger;\n</script>\n",
    )]);
    let both = rsvelte(&project, &["lint", "typecheck"]);
    let lint = rsvelte(&project, &["lint"]);
    let typecheck = rsvelte(&project, &["typecheck"]);
    assert_eq!(lint.status.code(), Some(0));
    assert!(text(&lint.stdout).contains("no-debugger"));
    assert_eq!(typecheck.status.code(), Some(2));
    assert_eq!(both.status.code(), Some(2));
    assert_eq!(lines(&text(&both.stdout)), lines(&text(&lint.stdout)));
    assert_eq!(text(&both.stderr), text(&typecheck.stderr));
}
