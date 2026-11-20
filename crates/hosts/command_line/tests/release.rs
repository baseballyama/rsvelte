//! `rsvelte`, the command people install: its commands, and what it refuses.

use std::path::PathBuf;
use std::process::{Command, Output};

use rsvelte_test_harness::NodePackages;

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
fn typecheck_prints_each_error_as_tsc_does_and_fails() {
    let packages = NodePackages::locate();
    let (program, arguments) = packages.type_checker();
    let command: Vec<String> = std::iter::once(program.to_string_lossy().into_owned())
        .chain(arguments)
        .collect();
    let config = serde_json::json!({ "plugins": {
        "typescript.check": { "command": command },
        "svelte.check": {
            "svelte": packages.package("svelte"),
            "contentMapper": rsvelte_test_harness::content_mapper(),
        },
    }});
    let project = Project::new(
        "typecheck",
        &[
            ("rsvelte.config.json", &config.to_string()),
            (
                "tsconfig.json",
                r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler",
"strict":true,"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#,
            ),
            (
                "src/App.svelte",
                "<script lang=\"ts\">\n\tconst n: number = 'x';\n</script>\n{n}\n",
            ),
            ("src/ok.ts", "export const n: number = 1;\n"),
            ("src/wrong.ts", "export const s: string = 1;\n"),
        ],
    );
    let output = project.rsvelte(&["typecheck"]);
    let report = text(&output.stdout);
    assert_eq!(
        output.status.code(),
        Some(1),
        "{report}{}",
        text(&output.stderr)
    );
    assert_eq!(
        report,
        "src/App.svelte(2,8): error TS2322: Type 'string' is not assignable to type 'number'.\n\
         src/wrong.ts(1,14): error TS2322: Type 'number' is not assignable to type 'string'.\n\
         \nFound 2 errors in 2 files.\n"
    );
    std::fs::write(
        project.0.join("src/wrong.ts"),
        "export const s: string = '';\n",
    )
    .expect("fixed file");
    std::fs::write(
        project.0.join("src/App.svelte"),
        "<script lang=\"ts\">\n\tconst n: number = 1;\n</script>\n{n}\n",
    )
    .expect("fixed component");
    let output = project.rsvelte(&["typecheck"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stdout));
    assert_eq!(text(&output.stdout), "");
}

#[test]
fn typecheck_reports_the_errors_of_the_tsconfig_instead_of_the_files() {
    let packages = NodePackages::locate();
    let (program, arguments) = packages.type_checker();
    let command: Vec<String> = std::iter::once(program.to_string_lossy().into_owned())
        .chain(arguments)
        .collect();
    let config = serde_json::json!({ "plugins": {
        "typescript.check": { "command": command },
        "svelte.check": {
            "svelte": packages.package("svelte"),
            "contentMapper": rsvelte_test_harness::content_mapper(),
        },
    }});
    let project = Project::new(
        "typecheck-tsconfig",
        &[
            ("rsvelte.config.json", &config.to_string()),
            (
                "tsconfig.json",
                r#"{"compilerOptions":{"strict":true,"types":[],"foo":1},"include":["src"]}"#,
            ),
            (
                "src/App.svelte",
                "<script lang=\"ts\">\n\tconst n: number = 'x';\n</script>\n{n}\n",
            ),
        ],
    );
    let typecheck = || {
        let output = project.rsvelte(&["typecheck"]);
        let mut report = text(&output.stdout);
        report.push_str(&text(&output.stderr));
        (output.status.code(), report)
    };
    assert_eq!(
        typecheck(),
        (
            Some(1),
            "tsconfig.json(1,46): error TS5023: Unknown compiler option 'foo'.\n\
             \nFound 1 error in 1 file.\n"
                .to_owned()
        ),
        "an unknown option, and the component is not checked"
    );
    let tsconfig = project.0.join("tsconfig.json");
    std::fs::write(
        &tsconfig,
        r#"{"compilerOptions":{"strict":true,"types":[]},"include":["missing/**/*.ts"]}"#,
    )
    .expect("tsconfig");
    assert_eq!(
        typecheck(),
        (
            Some(1),
            format!(
                "tsconfig.json(1,1): error TS18003: No inputs were found in config file '{}'. \
                 Specified 'include' paths were '[\"missing/**/*.ts\"]' and 'exclude' paths were \
                 '[]'.\n\nFound 1 error in 1 file.\n",
                tsconfig.display()
            )
        ),
        "no inputs"
    );
    std::fs::write(
        &tsconfig,
        r#"{"compilerOptions":{"strict":true,"types":[]},"include":["src/**/*.svelte"]}"#,
    )
    .expect("tsconfig");
    assert_eq!(
        typecheck(),
        (
            Some(1),
            "src/App.svelte(2,8): error TS2322: Type 'string' is not assignable to type \
             'number'.\n\nFound 1 error in 1 file.\n"
                .to_owned()
        ),
        "components alone are inputs"
    );
    std::fs::write(
        &tsconfig,
        r#"{"compilerOptions":{"strict":true,"types":[]},"files":[]}"#,
    )
    .expect("tsconfig");
    assert_eq!(
        typecheck(),
        (
            Some(1),
            format!(
                "tsconfig.json(1,55): error TS18002: The 'files' list in config file '{}' is \
                 empty.\n\nFound 1 error in 1 file.\n",
                tsconfig.display()
            )
        ),
        "an empty `files`, which only the tsconfig without `extends` reports"
    );
}

#[test]
fn typecheck_without_a_checker_says_what_to_install() {
    let project = Project::new(
        "no-checker",
        &[("tsconfig.json", "{}"), ("a.ts", "export {};\n")],
    );
    let output = project.rsvelte(&["typecheck"]);
    assert_eq!(output.status.code(), Some(2));
    let stderr = text(&output.stderr);
    assert!(stderr.contains("\n    npm install -D tsrs\n"), "{stderr}");
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
    assert!(stderr.contains("1 file was not formatted"), "{stderr}");
    assert!(stderr.contains("`singleQuote`"), "{stderr}");
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "y('z');\n");
    assert_eq!(read("generated/b.ts"), "y(\"z\");\n");
    assert_eq!(read("App.svelte"), "<script>\nlet   a = \"1\"\n</script>\n");
}

#[test]
fn format_leaves_the_files_of_a_configuration_it_cannot_honor() {
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

#[test]
fn format_leaves_the_files_one_configuration_refuses_and_formats_the_others() {
    let unformatted = "const a = [1,2];\n";
    let project = Project::new(
        "format-refused-group",
        &[
            (".git/HEAD", "ref: refs/heads/main\n"),
            ("a.ts", unformatted),
            ("sub/.prettierrc", "semi: false\n"),
            ("sub/b.ts", unformatted),
            ("sub/App.svelte", "<script>\nlet   a = 1\n</script>\n"),
        ],
    );
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(stderr.contains("2 files were not formatted"), "{stderr}");
    assert!(stderr.contains(".prettierrc"), "{stderr}");
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const a = [1, 2];\n");
    assert_eq!(read("sub/b.ts"), unformatted);
    assert_eq!(read("sub/App.svelte"), "<script>\nlet   a = 1\n</script>\n");
}

#[test]
fn format_leaves_the_files_of_options_a_formatter_cannot_read_and_formats_the_others() {
    let unformatted = "const   x = [1,2]\n";
    let project = Project::new(
        "format-unread-option",
        &[
            (".oxfmtrc.json", "{}"),
            ("a.ts", unformatted),
            ("sub/.oxfmtrc.json", r#"{ "printWidth": "x" }"#),
            ("sub/b.ts", unformatted),
        ],
    );
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(stderr.contains("1 file was not formatted"), "{stderr}");
    assert!(stderr.contains("`printWidth`"), "{stderr}");
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const x = [1, 2];\n");
    assert_eq!(read("sub/b.ts"), unformatted);
}

#[test]
fn format_leaves_every_file_of_a_configuration_a_formatter_cannot_read() {
    let unformatted = "const   x = [1,2]\n";
    let svelte = "<script lang=\"ts\">\nlet   y = [2]\n</script>\n";
    let project = Project::new(
        "format-unread-svelte-option",
        &[
            (".oxfmtrc.json", "{}"),
            ("a.ts", unformatted),
            ("sub/.oxfmtrc.json", r#"{ "svelte": { "sortOrder": 3 } }"#),
            ("sub/b.ts", unformatted),
            ("sub/B.svelte", svelte),
        ],
    );
    let output = project.rsvelte(&["format"]);
    let stderr = text(&output.stderr);
    assert_eq!(output.status.code(), Some(2), "{stderr}");
    assert!(stderr.contains("2 files were not formatted"), "{stderr}");
    assert!(stderr.contains("`svelte.sortOrder`"), "{stderr}");
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const x = [1, 2];\n");
    assert_eq!(read("sub/b.ts"), unformatted);
    assert_eq!(read("sub/B.svelte"), svelte);
}

#[test]
fn format_reads_null_as_an_option_left_unset() {
    let project = Project::new(
        "format-null-option",
        &[
            (".oxfmtrc.json", r#"{ "semi": null, "printWidth": null }"#),
            ("a.ts", "const   x = [1,2]\n"),
        ],
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const x = [1, 2];\n");
}
