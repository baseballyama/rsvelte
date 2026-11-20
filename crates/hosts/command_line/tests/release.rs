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
        self.rsvelte_in("", arguments)
    }

    /// Runs the CLI in the project's directory `dir`.
    fn rsvelte_in(&self, dir: &str, arguments: &[&str]) -> Output {
        Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .current_dir(self.0.join(dir))
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

/// `rsvelte.config.json` for a type check with the test checker and `content_mapper`.
fn typecheck_config(content_mapper: &std::path::Path) -> String {
    let packages = NodePackages::locate();
    let (program, arguments) = packages.type_checker();
    let command: Vec<String> = std::iter::once(program.to_string_lossy().into_owned())
        .chain(arguments)
        .collect();
    serde_json::json!({ "plugins": {
        "typescript.check": { "command": command },
        "svelte.check": {
            "svelte": packages.package("svelte"),
            "contentMapper": content_mapper,
        },
    }})
    .to_string()
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
    let config = typecheck_config(&rsvelte_test_harness::content_mapper());
    let project = Project::new(
        "typecheck",
        &[
            ("rsvelte.config.json", &config),
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
    let config = typecheck_config(&rsvelte_test_harness::content_mapper());
    let project = Project::new(
        "typecheck-tsconfig",
        &[
            ("rsvelte.config.json", &config),
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

/// svelte-check reports every file of the program but a declaration under `skipLibCheck`,
/// JavaScript in `node_modules` and a component in `node_modules`: here a script and a declaration
/// outside `include`, a package's script and declaration, and a workspace package that a link in
/// `node_modules` reaches outside the project. The expected lines are svelte-check 4.7.8's.
#[cfg(unix)]
#[test]
fn typecheck_reports_every_file_of_the_program_that_svelte_check_reports() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let wrong = "const wrong: string = 2;\n";
    let component = format!("<script lang=\"ts\">\n\t{wrong}</script>\n\n{{wrong}}\n");
    let scripts = [
        ("app/outside/b.ts", "export const b: number = 1;\n"),
        (
            "app/outside/d.d.ts",
            "export declare const d: number;\ndeclare ",
        ),
        (
            "app/node_modules/pkg/index.d.ts",
            "export declare const p: number;\nexport { q } from './q';\ndeclare ",
        ),
        ("app/node_modules/pkg/q.ts", "export const q: number = 1;\n"),
        ("dep/src/util.ts", "export const u: number = 1;\n"),
    ]
    .map(|(path, head)| (path, format!("{head}{wrong}")));
    let mut files = vec![
        ("app/rsvelte.config.json", config.as_str()),
        (
            "app/src/App.svelte",
            "<script lang=\"ts\">\n\
             \timport { b } from '../outside/b';\n\
             \timport { d } from '../outside/d';\n\
             \timport { p, q } from 'pkg';\n\
             \timport Comp from 'pkg/Comp.svelte';\n\
             \timport Typed from 'dep/Typed.svelte';\n\
             \timport { u } from 'dep/util';\n\
             \tconst n: number = b + d + p + q + u;\n\
             </script>\n\n<Comp /><Typed />{n}\n",
        ),
        (
            "app/node_modules/pkg/package.json",
            r#"{"name":"pkg","type":"module","exports":{".":{"types":"./index.d.ts"},
"./Comp.svelte":{"svelte":"./Comp.svelte","default":"./Comp.svelte"}}}"#,
        ),
        ("app/node_modules/pkg/Comp.svelte", &component),
        (
            "dep/package.json",
            r#"{"name":"dep","type":"module","exports":{
"./Typed.svelte":{"svelte":"./src/Typed.svelte","default":"./src/Typed.svelte"},
"./util":{"types":"./src/util.ts"}}}"#,
        ),
        ("dep/src/Typed.svelte", &component),
    ];
    files.extend(scripts.iter().map(|(path, text)| (*path, text.as_str())));
    let project = Project::new("typecheck-program", &files);
    let app = project.0.join("app");
    std::os::unix::fs::symlink("../../dep", app.join("node_modules/dep")).expect("link");
    let typecheck = |skip_lib_check: bool| {
        let tsconfig = format!(
            r#"{{"compilerOptions":{{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[],"skipLibCheck":{skip_lib_check}}},"include":["src"]}}"#
        );
        std::fs::write(app.join("tsconfig.json"), tsconfig).expect("tsconfig");
        let output = project.rsvelte_in("app", &["typecheck"]);
        let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
        (output.status.code(), report)
    };
    let assignment = "error TS2322: Type 'number' is not assignable to type 'string'.";
    let initializer = "error TS1039: Initializers are not allowed in ambient contexts.";
    assert_eq!(
        typecheck(false),
        (
            Some(1),
            format!(
                "outside/b.ts(2,7): {assignment}\n\
                 outside/d.d.ts(2,15): {assignment}\n\
                 outside/d.d.ts(2,31): {initializer}\n\
                 node_modules/pkg/q.ts(2,7): {assignment}\n\
                 node_modules/pkg/index.d.ts(3,15): {assignment}\n\
                 node_modules/pkg/index.d.ts(3,31): {initializer}\n\
                 ../dep/src/Typed.svelte(2,8): {assignment}\n\
                 ../dep/src/util.ts(2,7): {assignment}\n\
                 \nFound 8 errors in 6 files.\n"
            )
        ),
        "without skipLibCheck"
    );
    assert_eq!(
        typecheck(true),
        (
            Some(1),
            format!(
                "outside/b.ts(2,7): {assignment}\n\
                 node_modules/pkg/q.ts(2,7): {assignment}\n\
                 ../dep/src/Typed.svelte(2,8): {assignment}\n\
                 ../dep/src/util.ts(2,7): {assignment}\n\
                 \nFound 4 errors in 4 files.\n"
            )
        ),
        "with skipLibCheck"
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
