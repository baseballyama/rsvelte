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
fn lint_reads_svelte_and_typescript_and_not_vue() {
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
fn format_formats_what_oxfmt_formats_natively_and_svelte() {
    let project = Project::new(
        "format-languages",
        &[
            ("a.ts", "const   a = [1,2]\n"),
            ("b.json", "{\"a\":1}\n"),
            ("c.css", "a{color:red}\n"),
            ("d.md", "* a\n"),
            (
                "E.vue",
                "<template>\n<p   class=\"x\">{{ a }}</p>\n</template>\n",
            ),
            (
                "F.svelte",
                "<script>\nlet   a=1\n</script>\n<p   class=\"x\">{a}</p>\n",
            ),
            ("G.astro", "---\n---\n<p   class=\"x\">a</p>\n"),
        ],
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "const a = [1, 2];\n");
    assert_eq!(read("b.json"), "{ \"a\": 1 }\n");
    assert_eq!(read("c.css"), "a {\n  color: red;\n}\n");
    assert_eq!(read("d.md"), "- a\n");
    assert_eq!(
        read("E.vue"),
        "<template>\n  <p class=\"x\">{{ a }}</p>\n</template>\n"
    );
    assert_eq!(
        read("F.svelte"),
        "<script>\n  let a = 1;\n</script>\n\n<p class=\"x\">{a}</p>\n"
    );
    assert_eq!(read("G.astro"), "---\n---\n<p   class=\"x\">a</p>\n");
}

#[test]
fn format_takes_oxfmts_options_and_configuration_for_svelte_too() {
    let project = Project::new(
        "format-configuration",
        &[
            (
                ".oxfmtrc.json",
                r#"{ "tabWidth": 4, "svelte": { "indentScriptAndStyle": false } }"#,
            ),
            ("a.ts", "if (x) {\n  y(\"z\");\n}\n"),
            (
                "App.svelte",
                "<script>\n  let a = 1;\n</script>\n\n<p>{#if a}\n<b>a</b>\n{/if}</p>\n",
            ),
        ],
    );
    let check = project.rsvelte(&["format", "--list-different"]);
    assert_eq!(check.status.code(), Some(1), "{}", text(&check.stderr));
    let listed = text(&check.stdout);
    assert!(
        listed.contains("a.ts") && listed.contains("App.svelte"),
        "{listed}"
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "if (x) {\n    y(\"z\");\n}\n");
    assert_eq!(
        read("App.svelte"),
        "<script>\nlet a = 1;\n</script>\n\n<p>\n    {#if a}\n        <b>a</b>\n    {/if}\n</p>\n"
    );
    let help = project.rsvelte(&["format", "--help"]);
    assert!(
        text(&help.stdout).contains("Usage: rsvelte format"),
        "{}",
        text(&help.stdout)
    );
}

#[test]
fn format_reports_each_svelte_file_whose_options_it_cannot_print_and_formats_the_others() {
    let svelte = "<script>\nlet   a = \"1\"\n</script>\n";
    let project = Project::new(
        "format-unprinted",
        &[
            (".oxfmtrc.json", r#"{ "singleQuote": true }"#),
            ("a.ts", "y(\"z\");\n"),
            ("App.svelte", svelte),
        ],
    );
    let output = project.rsvelte(&["format"]);
    let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
    assert_eq!(output.status.code(), Some(2), "{report}");
    assert!(
        report.contains("`singleQuote`") && report.contains("App.svelte"),
        "{report}"
    );
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "y('z');\n");
    assert_eq!(read("App.svelte"), svelte);
}

#[test]
fn format_leaves_svelte_files_a_configuration_turns_off() {
    let svelte = "<script>\nlet   a = 1\n</script>\n";
    let project = Project::new(
        "format-svelte-off",
        &[
            (".oxfmtrc.json", r#"{ "svelte": false }"#),
            ("a.ts", "y(\"z\")\n"),
            ("App.svelte", svelte),
        ],
    );
    let output = project.rsvelte(&["format"]);
    assert_eq!(output.status.code(), Some(0), "{}", text(&output.stderr));
    let read = |name: &str| std::fs::read_to_string(project.0.join(name)).expect("file");
    assert_eq!(read("a.ts"), "y(\"z\");\n");
    assert_eq!(read("App.svelte"), svelte);
}
