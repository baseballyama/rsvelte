//! `rsvelte`, the command people install: its commands, and what it refuses.

use std::process::{Command, Output};

use crate::Scratch;
struct Project(Scratch);

impl Project {
    fn new(files: &[(&str, &str)]) -> Self {
        Self(Scratch::new(files))
    }

    fn rsvelte(&self, arguments: &[&str]) -> Output {
        Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .current_dir(&self.0)
            .args(arguments)
            .output()
            .expect("run CLI")
    }
}

fn text(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).into_owned()
}

#[test]
fn help_and_version_succeed_and_a_development_command_is_unknown() {
    let project = Project::new(&[]);
    let help = project.rsvelte(&["--help"]);
    assert_eq!(help.status.code(), Some(0));
    let help = text(&help.stdout);
    for command in ["lint", "format", "typecheck"] {
        assert!(help.contains(command), "{help}");
    }
    let version = project.rsvelte(&["--version"]);
    assert_eq!(
        text(&version.stdout).trim(),
        concat!("rsvelte ", env!("CARGO_PKG_VERSION"))
    );
    for arguments in [
        &["corpus", "."][..],
        &["check"],
        &["--config", "x", "lint"],
        &[],
    ] {
        let output = project.rsvelte(arguments);
        assert_eq!(output.status.code(), Some(2), "{arguments:?}");
    }
}

#[test]
fn help_prints_the_guide_to_the_command_it_names() {
    let project = Project::new(&[]);
    let overview = text(&project.rsvelte(&["help"]).stdout);
    assert_eq!(overview, text(&project.rsvelte(&["--help"]).stdout));
    for command in ["typecheck", "version"] {
        let usage = format!("Usage: rsvelte {command} ");
        for arguments in [
            &["help", command][..],
            &[command, "--help"],
            &["-h", command],
            &[command, "--bogus", "-V", "-h", "--config"],
        ] {
            let output = project.rsvelte(arguments);
            assert_eq!(output.status.code(), Some(0), "{arguments:?}");
            assert!(output.stderr.is_empty(), "{arguments:?}");
            let guide = text(&output.stdout);
            assert!(guide.starts_with(&usage), "{arguments:?}: {guide}");
        }
    }
    // `format` and `lint` take oxfmt's and oxlint's arguments, so their guides are their help.
    for command in ["format", "lint"] {
        let own = text(&project.rsvelte(&[command, "--help"]).stdout);
        assert!(own.contains(&format!("rsvelte {command}")), "{own}");
        for arguments in [&["help", command][..], &["-h", command]] {
            let output = project.rsvelte(arguments);
            assert_eq!(output.status.code(), Some(0), "{arguments:?}");
            assert_eq!(text(&output.stdout), own, "{arguments:?}");
        }
    }
    for arguments in [&["help", "help"][..], &["help", "--help"]] {
        let guide = text(&project.rsvelte(arguments).stdout);
        assert!(
            guide.starts_with("Usage: rsvelte help "),
            "{arguments:?}: {guide}"
        );
    }
    let unknown = project.rsvelte(&["help", "check"]);
    assert_eq!(unknown.status.code(), Some(2));
    assert!(text(&unknown.stderr).contains("unknown command `check`"));
    let extra = project.rsvelte(&["help", "typecheck", "src"]);
    assert_eq!(extra.status.code(), Some(2));
    let guide = text(
        &project
            .rsvelte(&["help", "typecheck", "-V", "--bogus"])
            .stdout,
    );
    assert!(guide.starts_with("Usage: rsvelte typecheck "), "{guide}");
    // An option's value is not a request for help.
    let typecheck = project.rsvelte(&["typecheck", "--config-runtime-arg", "-h"]);
    assert!(!text(&typecheck.stdout).contains("Usage:"));
}

#[test]
fn lint_is_oxlint_with_svelte_files_linted_natively() {
    let project = Project::new(&[
        ("a.ts", "const unused = 1\n"),
        (
            "B.svelte",
            "<script>\n\tlet unused = 1;\n</script>\n<button>x</button>\n",
        ),
    ]);
    // As oxlint, a run with warnings only succeeds unless warnings are denied.
    let lint = project.rsvelte(&["lint", "-f", "unix"]);
    let report = text(&lint.stdout);
    assert_eq!(lint.status.code(), Some(0), "{report}");
    assert!(report.contains("a.ts:1:7:"), "{report}");
    // The Svelte linter's no-unused-vars, which reads the template, and not oxlint's.
    assert!(
        report.contains("B.svelte:2:6: 'unused' is assigned a value but never used."),
        "{report}"
    );
    assert_eq!(report.matches("B.svelte").count(), 1, "{report}");
    let denied = project.rsvelte(&["lint", "--deny-warnings"]);
    assert_eq!(denied.status.code(), Some(1));
    // A Svelte rule is configured as oxlint configures its own.
    std::fs::write(
        project.0.join(".oxlintrc.json"),
        r#"{ "rules": { "svelte/button-has-type": "error", "no-unused-vars": "off" } }"#,
    )
    .unwrap();
    let configured = project.rsvelte(&["lint", "-f", "unix"]);
    let report = text(&configured.stdout);
    assert_eq!(configured.status.code(), Some(1), "{report}");
    assert!(
        report.contains("B.svelte:4:1:") && report.contains("svelte(button-has-type)"),
        "{report}"
    );
    assert!(!report.contains("unused"), "{report}");
}

#[test]
fn version_names_the_oracles_of_the_corpus_and_the_type_checker() {
    #[derive(serde::Deserialize)]
    struct Task {
        oracles: std::collections::BTreeMap<String, String>,
    }
    let oracles = include_str!("../../../../../corpus/_registry/oracles.json");
    let tasks: std::collections::BTreeMap<String, Task> = serde_json::from_str(oracles).unwrap();
    let config = crate::typecheck::typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let project = Project::new(&[("rsvelte.config.json", &config)]);
    let output = project.rsvelte(&["version"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let report = text(&output.stdout);
    assert!(
        report.starts_with(concat!("rsvelte ", env!("CARGO_PKG_VERSION"), " (")),
        "{report}"
    );
    for (task, covers) in [
        ("svelte.lint", "lint of Svelte files"),
        ("svelte.format", "format of Svelte files"),
        ("svelte.check", "typecheck of Svelte files"),
    ] {
        let section = report
            .split(&format!("\n  {covers}:\n"))
            .nth(1)
            .unwrap_or_else(|| panic!("no {covers}: {report}"));
        for (name, version) in &tasks[task].oracles {
            assert!(
                section.contains(&format!("    {name} {version}\n")),
                "{name}: {report}"
            );
        }
    }
    for built_on in ["oxfmt", "oxc"] {
        let line = format!("\n  {built_on} ");
        let version = report
            .split(&line)
            .nth(1)
            .and_then(|rest| rest.chars().next());
        assert!(
            version.is_some_and(|c| c.is_ascii_digit()),
            "{built_on}: {report}"
        );
    }
    let checker = report
        .split("\nType checker that typecheck runs here:\n  ")
        .nth(1)
        .unwrap_or_else(|| panic!("{report}"));
    let (program, _) = rsvelte_test_harness::NodePackages::locate().type_checker();
    assert!(checker.starts_with(&*program.to_string_lossy()), "{report}");
    let without = Project::new(&[]);
    let report = text(&without.rsvelte(&["version"]).stdout);
    assert!(report.contains("runs here:\n  none: "), "{report}");
    assert_eq!(without.rsvelte(&["version", "x"]).status.code(), Some(2));
    let broken = without.rsvelte(&["version", "--config", "missing.json"]);
    assert_eq!(broken.status.code(), Some(2));
    assert_eq!(text(&broken.stdout), "");
}

#[test]
fn lint_reads_the_scripts_of_a_component_as_svelte_does() {
    let project = Project::new(&[
        (
            ".oxlintrc.json",
            r#"{ "rules": { "no-debugger": "error" } }"#,
        ),
        (
            "Attribute.svelte",
            "<p title=\"<script>debugger;</script>\">x</p>\n",
        ),
        ("Html.svelte", "{@html \"<script>debugger;</script>\"}\n"),
        (
            "Head.svelte",
            "<svelte:head><script>debugger;</script></svelte:head>\n",
        ),
        (
            "Both.svelte",
            "<script module>\n\tdebugger;\n</script>\n<script lang=\"ts\">\n\tdebugger;\n</script>\n",
        ),
    ]);
    let lint = project.rsvelte(&["lint", "-f", "unix"]);
    let report = text(&lint.stdout);
    // Each of these is text to Svelte, not a script.
    for file in ["Attribute.svelte", "Html.svelte", "Head.svelte"] {
        assert!(!report.contains(file), "{file}: {report}");
    }
    for position in ["Both.svelte:2:2:", "Both.svelte:5:2:"] {
        assert!(report.contains(position), "{position}: {report}");
    }
}
