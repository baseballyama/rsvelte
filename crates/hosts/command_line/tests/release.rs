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
