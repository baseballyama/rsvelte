//! `rsvelte`, the command people install: its commands, and what it refuses.

use std::path::PathBuf;
use std::process::{Command, Output};

/// A project of its own below the temporary directory, removed when dropped.
struct Project(PathBuf);

impl Project {
    fn new(name: &str, files: &[(&str, &str)]) -> Self {
        let root =
            std::env::temp_dir().join(format!("rsvelte-release-{name}-{}", std::process::id()));
        drop(std::fs::remove_dir_all(&root));
        std::fs::create_dir_all(&root).expect("test directory");
        for (file, text) in files {
            let path = root.join(file);
            std::fs::create_dir_all(path.parent().expect("a file has a directory"))
                .expect("test directory");
            std::fs::write(path, text).expect("test file");
        }
        Self(std::fs::canonicalize(&root).expect("test directory"))
    }

    fn rsvelte(&self, arguments: &[&str]) -> Output {
        Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .current_dir(&self.0)
            .args(arguments)
            .output()
            .expect("run CLI")
    }
}

impl Drop for Project {
    fn drop(&mut self) {
        drop(std::fs::remove_dir_all(&self.0));
    }
}

fn text(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).into_owned()
}

#[test]
fn help_and_version_succeed_and_a_development_command_is_unknown() {
    let project = Project::new("help", &[]);
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
        &["lint", "--task", "x"],
        &[],
    ] {
        let output = project.rsvelte(arguments);
        assert_eq!(output.status.code(), Some(2), "{arguments:?}");
    }
}

#[test]
fn lint_and_format_read_svelte_and_typescript_and_not_vue() {
    let project = Project::new(
        "languages",
        &[
            ("a.ts", "const unused = 1\n"),
            ("B.svelte", "<script>\n\tlet unused = 1;\n</script>\n"),
            ("C.vue", "<script setup>\nconst unused = 1\n</script>\n"),
        ],
    );
    let lint = project.rsvelte(&["lint"]);
    let report = text(&lint.stdout);
    assert_eq!(lint.status.code(), Some(1), "{report}");
    assert!(
        report.contains("a.ts") && report.contains("B.svelte"),
        "{report}"
    );
    assert!(!report.contains("C.vue"), "{report}");
    let format = project.rsvelte(&["format", "--check"]);
    let listed = text(&format.stdout);
    assert!(listed.contains("a.ts"), "{listed}");
    assert!(!listed.contains("C.vue"), "{listed}");
}

#[test]
fn format_follows_the_projects_formatter_configuration() {
    let project = Project::new(
        "format-configuration",
        &[
            (".prettierrc.json", r#"{"tabWidth":4,"printWidth":100}"#),
            ("a.ts", "if (x) {\n  y(\"z\");\n}\n"),
            ("App.svelte", "<script>\n  let a = 1;\n</script>\n"),
        ],
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "if (x) {\n    y(\"z\");\n}\n");
    assert_eq!(read("App.svelte"), "<script>\n    let a = 1;\n</script>\n");
}

#[test]
fn format_leaves_svelte_files_whose_options_it_cannot_print_and_says_so() {
    let project = Project::new(
        "format-refused",
        &[
            (
                ".oxfmtrc.jsonc",
                r#"{
  // the house style
  "singleQuote": true,
  "ignorePatterns": ["generated/"],
}
"#,
            ),
            ("a.ts", "y(\"z\");\n"),
            ("generated/b.ts", "y(\"z\");\n"),
            ("App.svelte", "<script>\nlet   a = \"1\"\n</script>\n"),
        ],
    );
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(
        stderr.contains("1 Svelte files were not formatted"),
        "{stderr}"
    );
    assert!(stderr.contains("`singleQuote`"), "{stderr}");
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "y('z');\n");
    assert_eq!(read("generated/b.ts"), "y(\"z\");\n");
    assert_eq!(read("App.svelte"), "<script>\nlet   a = \"1\"\n</script>\n");
}

#[test]
fn format_refuses_a_configuration_it_cannot_honor_and_writes_nothing() {
    let project = Project::new(
        "format-overrides",
        &[
            (
                ".prettierrc",
                r#"{"overrides":[{"files":"*.ts","options":{"semi":false}}]}"#,
            ),
            ("a.ts", "y(\"z\")\n"),
        ],
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(2));
    assert!(
        text(&output.stderr).contains("`overrides`"),
        "{}",
        text(&output.stderr)
    );
    assert_eq!(
        std::fs::read_to_string(project.0.join("a.ts")).expect("file"),
        "y(\"z\")\n"
    );
}

#[test]
fn format_resolves_the_configuration_of_each_file_as_prettier_does() {
    let unformatted = "function f() {\nreturn \"x\"\n}\n";
    let project = Project::new(
        "format-per-file",
        &[
            (".git/HEAD", "ref: refs/heads/main\n"),
            ("sub/.prettierrc", r#"{"tabWidth":4}"#),
            ("sub/a.ts", unformatted),
            ("a.ts", unformatted),
            ("tabs/.editorconfig", "[*.ts]\nindent_style = tab\n"),
            ("tabs/b.ts", unformatted),
        ],
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "function f() {\n  return \"x\";\n}\n");
    assert_eq!(read("sub/a.ts"), "function f() {\n    return \"x\";\n}\n");
    assert_eq!(read("tabs/b.ts"), "function f() {\n\treturn \"x\";\n}\n");
}

#[test]
fn format_takes_from_rsvelte_config_the_options_it_names() {
    let project = Project::new(
        "format-rsvelte-config",
        &[
            (".prettierrc", r#"{"semi":false}"#),
            ("rsvelte.config.json", r#"{"plugins":{"svelte.format":{}}}"#),
            ("App.svelte", "<script>\nlet   a = 1\n</script>\n"),
            ("a.ts", "y(\"z\");\n"),
        ],
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("App.svelte"), "<script>\n  let a = 1;\n</script>\n");
    assert_eq!(read("a.ts"), "y(\"z\")\n");
}

#[test]
fn format_ignores_an_unknown_option_and_says_so() {
    let project = Project::new(
        "format-unknown-option",
        &[
            (".prettierrc", r#"{"svelteStrictMode":true,"tabWidth":4}"#),
            ("a.ts", "if (x) {\n  y(\"z\");\n}\n"),
        ],
    );
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(0), "{stderr}");
    assert!(
        stderr.contains("ignored unknown option `svelteStrictMode`"),
        "{stderr}"
    );
    assert_eq!(
        std::fs::read_to_string(project.0.join("a.ts")).expect("file"),
        "if (x) {\n    y(\"z\");\n}\n"
    );
}

#[test]
fn format_reads_nothing_for_a_file_oxfmt_leaves_and_skips_a_package_json_that_does_not_parse() {
    let unformatted = "const a = [1,2];\n";
    let formatted = "const a = [1, 2];\n";
    let project = Project::new(
        "format-left-unread",
        &[
            (
                ".oxfmtrc.json",
                r#"{"ignorePatterns":["vendor/**","fixtures/**","big"]}"#,
            ),
            ("a.ts", unformatted),
            ("vendor/.prettierrc.yaml", "semi: false\n"),
            ("vendor/x.ts", unformatted),
            ("fixtures/bad/package.json", "{ broken\n"),
            ("fixtures/bad/x.ts", unformatted),
            ("big/y.ts", unformatted),
            ("big/sub/.oxfmtrc.json", "{}"),
            ("big/sub/x.ts", unformatted),
            ("prettier/fixtures/package.json", "{ broken\n"),
            ("prettier/.prettierrc", "{}"),
            ("prettier/fixtures/x.ts", unformatted),
        ],
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), formatted);
    assert_eq!(read("vendor/x.ts"), unformatted);
    assert_eq!(read("fixtures/bad/x.ts"), unformatted);
    assert_eq!(read("big/y.ts"), unformatted);
    assert_eq!(read("big/sub/x.ts"), formatted);
    assert_eq!(read("prettier/fixtures/x.ts"), formatted);
}
