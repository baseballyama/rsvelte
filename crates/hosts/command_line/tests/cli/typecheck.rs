//! `rsvelte typecheck`: the files of the project it reports, and how it prints them.

use std::process::{Command, Output};

use rsvelte_test_harness::NodePackages;

use crate::Scratch;

struct Project(Scratch);

impl Project {
    fn new(files: &[(&str, &str)]) -> Self {
        Self(Scratch::new(files))
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

fn text(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).into_owned()
}

/// `rsvelte.config.json` for a type check with the test checker and `content_mapper`.
pub(crate) fn typecheck_config(content_mapper: &std::path::Path) -> String {
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
    let project = Project::new(&[
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
    ]);
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
    let project = Project::new(&[
        ("rsvelte.config.json", &config.to_string()),
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"types":[],"foo":1},"include":["src"]}"#,
        ),
        (
            "src/App.svelte",
            "<script lang=\"ts\">\n\tconst n: number = 'x';\n</script>\n{n}\n",
        ),
    ]);
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
    let project = Project::new(&[("tsconfig.json", "{}"), ("a.ts", "export {};\n")]);
    let output = project.rsvelte(&["typecheck"]);
    assert_eq!(output.status.code(), Some(2));
    let stderr = text(&output.stderr);
    assert!(stderr.contains("\n    npm install -D tsrs\n"), "{stderr}");
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
    let project = Project::new(&files);
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

/// A JavaScript component is untyped where TypeScript reads JavaScript as untyped: each import of
/// it reports TS7016, from a component or a script and through a package or a relative path, and
/// one only a package's import reaches is not checked. The expected lines are svelte-check
/// 4.7.8's, but a TS7016 path inside the project, which it prints absolute, from the root as its
/// recorded output reads it.
#[cfg(unix)]
#[test]
fn typecheck_reads_a_javascript_component_as_untyped_javascript() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let annotated = "<script>\n\tlet { n }: { n: number } = $props();\n</script>\n\n{n}\n";
    let page = |from: &str| {
        format!(
            "<script lang=\"ts\">\n\timport Annotated from \"{from}\";\n</script>\n\n\
             <Annotated n=\"str\" />\n"
        )
    };
    let (linked, local) = (page("dep/src/Annotated.svelte"), page("./Annotated.svelte"));
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[]},"include":["src"]}"#,
        ),
        ("app/src/Annotated.svelte", annotated),
        ("app/src/DepPage.svelte", &linked),
        ("app/src/Page.svelte", &local),
        (
            "app/src/use.ts",
            "import Local from \"./Annotated.svelte\";\n\
             import Linked from \"dep/src/Annotated.svelte\";\n\
             export const components = [Local, Linked];\n",
        ),
        ("dep/package.json", r#"{"name":"dep","type":"module"}"#),
        ("dep/src/Annotated.svelte", annotated),
    ]);
    let app = project.0.join("app");
    std::fs::create_dir_all(app.join("node_modules")).expect("node_modules");
    std::os::unix::fs::symlink("../../dep", app.join("node_modules/dep")).expect("link");
    let output = project.rsvelte_in("app", &["typecheck"]);
    let untyped = |specifier: &str, file: &str| {
        format!(
            "error TS7016: Could not find a declaration file for module '{specifier}'. '{file}' \
             implicitly has an 'any' type."
        )
    };
    let dep = project.0.join("dep/src/Annotated.svelte");
    let dep = dep.display().to_string();
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "src/Annotated.svelte(2,12): error TS8008: Type aliases can only be used in \
             TypeScript files.\n\
             src/DepPage.svelte(2,24): {}\n\
             src/Page.svelte(2,24): {}\n\
             src/use.ts(1,19): {}\n\
             src/use.ts(2,20): {}\n\
             \nFound 5 errors in 4 files.\n",
            untyped("dep/src/Annotated.svelte", &dep),
            untyped("./Annotated.svelte", "src/Annotated.svelte"),
            untyped("./Annotated.svelte", "src/Annotated.svelte"),
            untyped("dep/src/Annotated.svelte", &dep),
        )
    );
}

/// Where JavaScript is untyped, TypeScript loads no JavaScript component the tsconfig does not
/// select, whatever imports it: one a JavaScript component imports, through a package or a
/// relative path, is not checked. The expected lines are svelte-check 4.7.8's.
#[cfg(unix)]
#[test]
fn typecheck_does_not_check_a_javascript_component_only_javascript_reaches() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let annotated = "<script>\n\tlet { n }: { n: number } = $props();\n</script>\n\n{n}\n";
    let importing = |from: &str| {
        format!("<script>\n\timport Annotated from \"{from}\";\n</script>\n\n<Annotated />\n")
    };
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[]},"include":["src"]}"#,
        ),
        (
            "app/src/Page.svelte",
            "<script lang=\"ts\">\n\timport Chain from \"dep/src/Chain.svelte\";\n</script>\n\n\
             <Chain />\n",
        ),
        ("app/src/Local.svelte", &importing("../Outside.svelte")),
        (
            "app/src/Linked.svelte",
            &importing("dep/src/Annotated.svelte"),
        ),
        ("app/Outside.svelte", annotated),
        ("dep/package.json", r#"{"name":"dep","type":"module"}"#),
        ("dep/src/Chain.svelte", &importing("./Only.svelte")),
        ("dep/src/Only.svelte", annotated),
        ("dep/src/Annotated.svelte", annotated),
    ]);
    let app = project.0.join("app");
    std::fs::create_dir_all(app.join("node_modules")).expect("node_modules");
    std::os::unix::fs::symlink("../../dep", app.join("node_modules/dep")).expect("link");
    let output = project.rsvelte_in("app", &["typecheck"]);
    let chain = project.0.join("dep/src/Chain.svelte");
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "src/Page.svelte(2,20): error TS7016: Could not find a declaration file for module \
             'dep/src/Chain.svelte'. '{}' implicitly has an 'any' type.\n\
             \nFound 1 error in 1 file.\n",
            chain.display()
        )
    );
}

/// svelte2tsx's ignore start keeps a `generics` list that begins with `/` from reading as `</`,
/// a closing tag, in its `.tsx` code. With a list that comments out the rest of its line, the
/// script's own code follows the type parameters; these four lines are svelte-check 4.7.8's.
#[cfg(unix)]
#[test]
fn typecheck_reads_a_javascript_generics_list_after_the_ignore_start() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let output = Project::new(&[
        ("rsvelte.config.json", config.as_str()),
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[],"allowJs":true,"checkJs":true},"include":["src"]}"#,
        ),
        (
            "src/C.svelte",
            "<script generics=\"// x\">\n  /** @type {{ n: number }} */\n  let { n } = $props();\n\
             </script>\n<p>{n}</p>\n",
        ),
    ])
    .rsvelte(&["typecheck"]);
    let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
    let lines: Vec<&str> = report.lines().collect();
    for oracle in [
        "src/C.svelte(3,7): error TS1005: '>' expected.",
        "src/C.svelte(3,13): error TS2809: Declaration or statement expected. This '=' follows a \
         block of statements, so if you intended to write a destructuring assignment, you might \
         need to wrap the whole assignment in parentheses.",
        "src/C.svelte(3,9): error TS2304: Cannot find name 'n'.",
        "src/C.svelte(5,5): error TS2304: Cannot find name 'n'.",
    ] {
        assert!(lines.contains(&oracle), "{oracle} missing from:\n{report}");
    }
    // Without the ignore start, TypeScript reads `</` and then a regular expression.
    for text in ["TS1161", "TS2363", "Unterminated regular expression"] {
        assert!(!report.contains(text), "{text} in:\n{report}");
    }
}

/// svelte2tsx writes a JavaScript component's `generics` list and its `>` between its ignore
/// comments, and svelte-check hides a finding that starts there: one at the list's `>` is hidden
/// and one at the `(` after it is shown, though both map to the closing quote. The ignore end also
/// closes a comment the list leaves open. The expected lines are svelte-check 4.7.8's.
#[cfg(unix)]
#[test]
fn typecheck_hides_what_starts_in_the_ignored_generics_of_a_javascript_component() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let lists = [
        "T extends (",
        "T>U",
        "T extends string /* x",
        "T extends",
        "T extends string",
        "T,",
        "",
    ];
    let components: Vec<(String, String)> = (lists.iter().enumerate())
        .map(|(i, list)| {
            (
                format!("src/C{}.svelte", i + 1),
                format!(
                    "<script generics=\"{list}\">\n  /** @type {{{{ n: number }}}} */\n  \
                     let {{ n }} = $props();\n</script>\n<p>{{n}}</p>\n"
                ),
            )
        })
        .collect();
    let mut files = vec![
        ("rsvelte.config.json", config.as_str()),
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[],"allowJs":true,"checkJs":true},"include":["src"]}"#,
        ),
    ];
    files.extend(
        components
            .iter()
            .map(|(path, text)| (path.as_str(), text.as_str())),
    );
    let output = Project::new(&files).rsvelte(&["typecheck"]);
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        "src/C1.svelte(1,30): error TS1109: Expression expected.\n\
         src/C1.svelte(1,30): error TS1005: ')' expected.\n\
         src/C2.svelte(1,22): error TS1109: Expression expected.\n\
         src/C2.svelte(1,22): error TS1005: ';' expected.\n\
         src/C2.svelte(1,2): error TS7010: '$$render', which lacks return-type annotation, \
         implicitly has an 'any' return type.\n\
         src/C3.svelte(1,40): error TS1005: '>' expected.\n\
         \nFound 6 errors in 3 files.\n"
    );
}

/// A project whose component imports svelte's types, checked without `skipLibCheck` and with
/// `lib`, and its `rsvelte.config.json`, which names its tsconfig so the CLI runs from anywhere.
#[cfg(unix)]
fn importing_svelte(lib: &str) -> (Project, String) {
    let tsconfig = format!(
        r#"{{"compilerOptions":{{"strict":true,"module":"esnext","moduleResolution":"bundler",
"target":"esnext","lib":["{lib}"],"types":[],"skipLibCheck":false}},"include":["src"]}}"#
    );
    let component = "<script lang=\"ts\">\n\timport type { Snippet } from \"svelte\";\n\
        \tlet { children }: { children?: Snippet } = $props();\n</script>\n\
        {@render children?.()}\n";
    let project = Project::new(&[("tsconfig.json", &tsconfig), ("src/App.svelte", component)]);
    std::fs::create_dir_all(project.0.join("node_modules")).expect("node_modules");
    let svelte = NodePackages::locate().package("svelte");
    std::os::unix::fs::symlink(svelte, project.0.join("node_modules/svelte")).expect("link");
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let mut config: serde_json::Value = serde_json::from_str(&config).expect("config");
    config["plugins"]["typescript.check"]["tsconfig"] =
        serde_json::json!(project.0.join("tsconfig.json"));
    let config_path = project.0.join("rsvelte.config.json");
    std::fs::write(&config_path, config.to_string()).expect("config");
    let config_path = config_path.display().to_string();
    (project, config_path)
}

/// Without `skipLibCheck` svelte's types are a file the check reports and a file the check
/// replaces, whose blanked `declare module '*.svelte'` spans eight lines. svelte-check 4.7.8
/// finds no error, and with `lib` `es5` two at lines of the replaced text.
#[cfg(unix)]
#[test]
fn typecheck_reads_a_replaced_package_file_as_one_text() {
    let types = NodePackages::locate()
        .package("svelte")
        .join("types/index.d.ts");
    let types = types.strip_prefix("/").expect("an absolute path").display();
    let es5 = |name: &str, line: u32| {
        format!(
            "{types}({line},5): error TS2583: Cannot find name '{name}'. Do you need to change \
             your target library? Try changing the 'lib' compiler option to 'es2020' or later.\n"
        )
    };
    let es5 = format!(
        "{}{}\nFound 2 errors in 1 file.\n",
        es5("BigInt64Array", 3569),
        es5("BigUint64Array", 3570)
    );
    let cases = [("esnext", Some(0), String::new()), ("es5", Some(1), es5)];
    for (lib, code, expected) in cases {
        let (project, config) = importing_svelte(lib);
        // Run from `/`, the report names the package's file by its whole path.
        let output = project.rsvelte_in("/", &["typecheck", "--config", &config]);
        let output = (
            output.status.code(),
            text(&output.stdout),
            text(&output.stderr),
        );
        assert_eq!(output, (code, expected, String::new()), "lib {lib}");
    }
}

/// A run of the check on the replaced file alone reads the same text: svelte-check 4.7.8's two
/// errors in it, at its lines less one, as the task's JSON counts lines from 0.
#[cfg(unix)]
#[test]
fn a_run_on_a_replaced_file_reads_the_replaced_text() {
    let (project, config) = importing_svelte("es5");
    let types = NodePackages::locate()
        .package("svelte")
        .join("types/index.d.ts");
    let output = Command::new(env!("CARGO_BIN_EXE_rsvelte-dev"))
        .current_dir(&*project.0)
        .args([
            "run",
            &types.display().to_string(),
            "--task",
            "ts.check/default",
        ])
        .args(["--config", &config])
        .output()
        .expect("run CLI");
    let stdout = text(&output.stdout);
    let found: serde_json::Value = (stdout.split_once("json\n"))
        .and_then(|(_, json)| serde_json::from_str(json).ok())
        .unwrap_or_else(|| panic!("{stdout}{}", text(&output.stderr)));
    let found: Vec<_> = (found.as_array().expect("findings").iter())
        .filter(|d| d["message"].as_str().is_some_and(|m| m.contains("Big")))
        .map(|d| {
            (
                d["message"].as_str().map(|m| m[..30].to_owned()),
                d["start"].clone(),
            )
        })
        .collect();
    let error = |name: &str, line: u32| {
        let message = format!("Cannot find name '{name}'. Do");
        (
            Some(message[..30].to_owned()),
            serde_json::json!({ "line": line, "character": 4 }),
        )
    };
    assert_eq!(
        found,
        [error("BigInt64Array", 3568), error("BigUint64Array", 3569)],
        "{stdout}"
    );
}
