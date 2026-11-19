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

/// Expected values are svelte-check 4.7.8's, except `+page.ts`: it reports a finding after an
/// annotation in the annotated text's columns (1:136), where the file's own column is 1:65.
#[test]
fn typecheck_types_sveltekit_files_as_svelte_check_does() {
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
        "kit-files",
        &[
            ("rsvelte.config.json", &config.to_string()),
            (
                "tsconfig.json",
                r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler",
"strict":true,"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#,
            ),
            (
                "node_modules/@sveltejs/kit/package.json",
                r#"{"name":"@sveltejs/kit","version":"3.0.0",
"exports":{"./hooks":{"types":"./hooks.d.ts"}}}"#,
            ),
            (
                "node_modules/@sveltejs/kit/hooks.d.ts",
                "export interface RequestEvent { url: URL }\n\
                 export type Handle = (input: { event: RequestEvent; resolve: (event: \
                 RequestEvent) => Promise<Response> }) => Promise<Response>;\n\
                 export type HandleFetch = (input: { event: RequestEvent; request: Request; \
                 fetch: typeof fetch }) => Promise<Response>;\n\
                 export type HandleServerError = (input: { error: unknown; event: \
                 RequestEvent; message: string }) => void;\n",
            ),
            (
                "src/hooks.server.ts",
                "export const handleFetch = async ({ request, fetch, event }) => {\n\
                 \treturn fetch(request);\n};\n\
                 export function handle({ event, resolve }) {\n\tconsole.log(event.url);\n}\n\
                 export const handleError = function ({ error, status }) {\n\
                 \tconsole.log(error, status);\n};\n",
            ),
            (
                "src/routes/$types.d.ts",
                "export type PageLoadEvent = { params: { id: string } };\n",
            ),
            (
                "src/routes/+page.ts",
                "export const load = ({ params }) => ({ id: params.id, n: params.nope });\n",
            ),
            (
                "src/routes/x/+page.server.ts",
                "export const load = (event) => ({});\n",
            ),
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
        "src/hooks.server.ts(4,44): error TS2355: A function whose declared type is neither \
         'undefined', 'void', nor 'any' must return a value.\n\
         src/hooks.server.ts(7,47): error TS2339: Property 'status' does not exist on type '{ \
         error: unknown; event: RequestEvent; message: string; }'.\n\
         src/routes/+page.ts(1,65): error TS2339: Property 'nope' does not exist on type '{ id: \
         string; }'.\n\
         src/routes/x/+page.server.ts(1,27): error TS2307: Cannot find module './$types.js' or \
         its corresponding type declarations. (this likely means that SvelteKit's type \
         generation didn't run yet - try running it by executing 'npm run dev' or 'npm run \
         build')\n\
         \nFound 4 errors in 3 files.\n"
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
