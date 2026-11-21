//! `rsvelte <command> <command>...`: several commands in one run, which print and exit as the
//! commands run one by one do.

use std::path::Path;
use std::process::{Command, Output};

use crate::Scratch;

fn rsvelte(directory: &Path, arguments: &[&str]) -> Output {
    Command::new(env!("CARGO_BIN_EXE_rsvelte"))
        .current_dir(directory)
        .args(arguments)
        .output()
        .expect("run CLI")
}

fn text(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).into_owned()
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

/// A project with a lint error and a type error in a component and in a script, and a component
/// in `other` that only lint reads. The components' styles do not parse, and lint names the file
/// in that message.
fn project() -> Scratch {
    let config = crate::typecheck::typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let mut config: serde_json::Value = serde_json::from_str(&config).expect("config");
    config["plugins"]["svelte.lint"] =
        serde_json::json!({ "rules": { "svelte/valid-style-parse": "error" } });
    Scratch::new(&[
        ("rsvelte.config.json", &config.to_string()),
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler",
"strict":true,"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#,
        ),
        (
            "src/App.svelte",
            "<script lang=\"ts\">\n\tlet unused = 1;\n\tconst n: number = 'x';\n</script>\n\n{n}\n\n\
             <style>\n\t.a { color: red; }}\n</style>\n",
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
    for needle in ["./src/App.svelte:2:20", "Only.svelte", "src/wrong.ts(2,14)"] {
        assert!(expected.1.contains(needle), "{needle}: {}", expected.1);
    }
    // A configuration that discovery does not find, so only `--config` names it.
    std::fs::rename(
        project.join("rsvelte.config.json"),
        project.join("custom.json"),
    )
    .expect("rename");
    for combined in [
        &["lint", "typecheck", "--config", "custom.json"][..],
        &["typecheck", "lint", "--config", "custom.json"],
        &["--config", "custom.json", "lint", "typecheck"],
        &["lint", "--config", "custom.json", "typecheck"],
    ] {
        assert_eq!(run(&project, combined), expected, "{combined:?}");
    }
    std::fs::rename(
        project.join("custom.json"),
        project.join("rsvelte.config.json"),
    )
    .expect("rename");
    // Lint reads only `other`, so typecheck reads the project's files alone.
    let expected = one_by_one(&project, &[&["lint", "other"], &["typecheck"]]);
    assert_eq!(run(&project, &["lint", "typecheck", "other"]), expected);
    let clean = "<script lang=\"ts\">\n\tconst n: number = 1;\n</script>\n\n{n}\n";
    std::fs::write(project.join("src/App.svelte"), clean).expect("component");
    std::fs::write(
        project.join("src/wrong.ts"),
        "export const s: string = '';\n",
    )
    .expect("script");
    std::fs::remove_dir_all(project.join("other")).expect("other");
    assert_eq!(
        run(&project, &["lint", "typecheck"]),
        (Some(0), String::new())
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
    assert_eq!(run(&project, &["lint", "typecheck"]), expected);
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
        let formats = (report.strip_suffix(&others.1)).unwrap_or_else(|| panic!("{report}"));
        assert!(
            formats.contains("Format issues found"),
            "{combined:?}: {report}"
        );
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
    assert!(written.ends_with(&after.1), "{written}\n---\n{}", after.1);
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
        (&["lint", "--check"], "--check applies to `format`"),
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
    let project = Scratch::new(&[("A.svelte", "<script>\n\tlet unused = 1;\n</script>\n")]);
    let both = rsvelte(&project, &["lint", "typecheck"]);
    let lint = rsvelte(&project, &["lint"]);
    let typecheck = rsvelte(&project, &["typecheck"]);
    assert_eq!(lint.status.code(), Some(1));
    assert_eq!(typecheck.status.code(), Some(2));
    assert_eq!(both.status.code(), Some(2));
    assert_eq!(text(&both.stdout), text(&lint.stdout));
    assert_eq!(text(&both.stderr), text(&typecheck.stderr));
}
