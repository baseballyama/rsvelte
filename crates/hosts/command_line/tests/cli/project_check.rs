//! `rsvelte-dev check` on a project on disk, whose own tsconfig sets the options under test.

use std::path::Path;

use rsvelte_test_harness::NodePackages;

use crate::Scratch;

struct Project(Scratch);

impl Project {
    fn new(files: &[(&str, &str)]) -> Self {
        Self(Scratch::new(files))
    }

    /// Each finding of the check, as `<file> TS<code>`.
    fn check(&self) -> Vec<String> {
        self.check_in(None)
    }

    /// [`Self::check`] with `processes` checker processes, or as many as rsvelte chooses.
    fn check_in(&self, processes: Option<usize>) -> Vec<String> {
        let mut found: Vec<String> = self
            .findings(processes)
            .into_iter()
            .map(|(file, code, _)| format!("{file} TS{code}"))
            .collect();
        found.sort();
        found
    }

    /// Each finding of the check: its file, code and message.
    fn findings(&self, processes: Option<usize>) -> Vec<(String, serde_json::Value, String)> {
        self.findings_with(processes, None)
    }

    /// [`Self::findings`], with every request to a checker process appended to `log`.
    fn findings_with(
        &self,
        processes: Option<usize>,
        log: Option<&Path>,
    ) -> Vec<(String, serde_json::Value, String)> {
        let packages = NodePackages::locate();
        let (program, arguments) = packages.type_checker();
        let mut command: Vec<String> = std::iter::once(program.to_string_lossy().into_owned())
            .chain(arguments)
            .collect();
        if let Some(log) = log {
            let tee = ["/bin/sh", "-c", r#"tee -a "$0" | "$@""#];
            let log = log.to_string_lossy().into_owned();
            command.splice(0..0, tee.into_iter().map(str::to_owned).chain([log]));
        }
        let mut tsc = serde_json::json!({
            "command": command,
            "tsconfig": self.0.join("tsconfig.json"),
        });
        if let Some(processes) = processes {
            tsc["processes"] = processes.into();
        }
        let svelte = serde_json::json!({
            "svelte": packages.package("svelte"),
            "contentMapper": rsvelte_test_harness::content_mapper(),
        });
        let output = crate::rsvelte_dev(&self.0)
            .arg("check")
            .args(["--options", "typescript.check", &tsc.to_string()])
            .args(["--options", "svelte.check", &svelte.to_string()])
            .output()
            .expect("run CLI");
        let stdout = String::from_utf8(output.stdout).expect("UTF-8");
        assert!(
            matches!(output.status.code(), Some(0 | 1)),
            "{stdout}{}",
            String::from_utf8_lossy(&output.stderr)
        );
        let mut found = Vec::new();
        for block in stdout.split("// ").skip(1) {
            let (header, body) = block.split_once('\n').expect("a header line");
            let file = header.split(' ').next().expect("a file");
            let findings: serde_json::Value = serde_json::from_str(body).expect("findings");
            let findings = findings.as_array().expect("a list");
            // Without `skipLibCheck` the program's default libraries are checked too, clean.
            let Ok(file) = Path::new(file).strip_prefix(&*self.0) else {
                assert!(findings.is_empty(), "{file}: {findings:?}");
                continue;
            };
            for finding in findings {
                let message = finding["message"].as_str().unwrap_or_default().to_owned();
                found.push((file.display().to_string(), finding["code"].clone(), message));
            }
        }
        found
    }
}

const NODENEXT: &str = r#"{"compilerOptions":{"module":"nodenext","moduleResolution":"nodenext",
"strict":true,"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#;

#[test]
fn an_esm_import_of_a_rune_module_by_its_component_name_reads_the_module() {
    let project = Project::new(&[
        ("package.json", r#"{"type":"module"}"#),
        ("tsconfig.json", NODENEXT),
        (
            "src/state.svelte.ts",
            concat!(
                "export const count = (): string => '';\n",
                "export default class Counter {\n",
                "  n = '';\n",
                "}\n",
            ),
        ),
        (
            "src/use.ts",
            concat!(
                "import Counter, { count } from './state.svelte';\n",
                "export const n: number = count();\n",
                "export const m: number = new Counter().n;\n",
            ),
        ),
        (
            "src/Use.svelte",
            concat!(
                "<script lang=\"ts\">\n",
                "  import { count } from './state.svelte';\n",
                "  const n: number = count();\n",
                "</script>\n",
                "{n}\n",
            ),
        ),
    ]);
    // Without the module's types, each import would fail to resolve (TS2307) instead.
    assert_eq!(
        project.check(),
        [
            "src/Use.svelte TS2322",
            "src/use.ts TS2322",
            "src/use.ts TS2322"
        ]
    );
}

#[test]
fn a_snippet_given_to_a_component_is_read_and_an_unused_one_is_not() {
    let project = Project::new(&[
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler","strict":true,
"skipLibCheck":true,"noEmit":true,"types":[],"noUnusedLocals":true},"include":["src"]}"#,
        ),
        (
            "src/Child.svelte",
            concat!(
                "<script lang=\"ts\">\n",
                "  import type { Snippet } from 'svelte';\n",
                "  let { text }: { text?: Snippet } = $props();\n",
                "</script>\n",
                "{@render text?.()}\n",
            ),
        ),
        (
            "src/Parent.svelte",
            concat!(
                "<script lang=\"ts\">\n",
                "  import Child from './Child.svelte';\n",
                "</script>\n",
                "<Child>\n",
                "  {#snippet text()}<p></p>{/snippet}\n",
                "</Child>\n",
                "{#snippet unused()}<p></p>{/snippet}\n",
            ),
        ),
    ]);
    // svelte-check reports the unused snippet, and not the one it reads as a prop.
    assert_eq!(project.check(), ["src/Parent.svelte TS6133"]);
}

#[test]
fn a_class_component_of_a_package_takes_the_props_of_its_instance() {
    let project = Project::new(&[
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler","strict":true,
"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#,
        ),
        (
            "node_modules/icons/package.json",
            r#"{"name":"icons","types":"index.d.ts"}"#,
        ),
        (
            "node_modules/icons/index.d.ts",
            concat!(
                "import { SvelteComponent } from 'svelte';\n",
                "export declare class Icon extends SvelteComponent<{ size?: number }> {}\n",
            ),
        ),
        (
            "src/App.svelte",
            concat!(
                "<script lang=\"ts\">\n",
                "  import { Icon } from 'icons';\n",
                "</script>\n",
                "<Icon size={2} />\n",
                "<Icon size=\"big\" />\n",
            ),
        ),
    ]);
    // svelte-check reports only the prop of the wrong type, as its svelte2tsx constructs the class.
    assert_eq!(project.check(), ["src/App.svelte TS2322"]);
}

#[test]
fn a_bindable_prop_only_written_is_not_unused() {
    let project = Project::new(&[
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler","strict":true,
"skipLibCheck":true,"noEmit":true,"types":[],"noUnusedLocals":true},"include":["src"]}"#,
        ),
        (
            "src/Drawer.svelte",
            concat!(
                "<script lang=\"ts\">\n",
                "  let { open = $bindable(false), plain = 1 }:\n",
                "    { open?: boolean; plain?: number } =\n",
                "    $props();\n",
                "  const close = () => (open = false);\n",
                "</script>\n",
                "<button onclick={close}>x</button>\n",
            ),
        ),
    ]);
    // svelte-check reads each bindable prop once, so only `plain` is unused.
    assert_eq!(project.check(), ["src/Drawer.svelte TS6133"]);
}

#[test]
fn a_stylesheet_custom_property_given_to_a_component_is_not_a_prop() {
    let project = Project::new(&[
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler","strict":true,
"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#,
        ),
        (
            "src/Child.svelte",
            concat!(
                "<script lang=\"ts\">\n",
                "  let { size }: { size?: number } = $props();\n",
                "</script>\n",
                "{size}\n",
            ),
        ),
        (
            "src/App.svelte",
            concat!(
                "<script lang=\"ts\">\n",
                "  import Child from './Child.svelte';\n",
                "</script>\n",
                "<Child --color=\"red\" --gap={missing} size={1} />\n",
            ),
        ),
    ]);
    // svelte-check checks the value, but no prop `--color`.
    assert_eq!(project.check(), ["src/App.svelte TS2304"]);
}

#[test]
fn checker_processes_that_share_the_documents_report_each_finding_once() {
    let wrong =
        |n: u32| format!("<script lang=\"ts\">\n\tconst wrong: number = '{n}';\n</script>\n");
    let components: Vec<(String, String)> = (0..5)
        .map(|n| (format!("src/C{n}.svelte"), wrong(n)))
        .collect();
    let mut files: Vec<(&str, &str)> = components
        .iter()
        .map(|(path, text)| (path.as_str(), text.as_str()))
        .collect();
    files.push(("src/m.ts", "export const wrong: number = 'm';\n"));
    files.push(("tsconfig.json", NODENEXT));
    let project = Project::new(&files);
    let one = project.check_in(Some(1));
    assert_eq!(one.len(), 6, "{one:?}");
    assert_eq!(project.check_in(Some(3)), one);
    assert_eq!(project.check_in(Some(9)), one);
}

#[test]
fn a_sveltekit_route_file_is_typed_as_svelte_check_types_it() {
    let project = Project::new(&[
        (
            "tsconfig.json",
            r#"{ "compilerOptions": { "strict": true, "noEmit": true, "module": "esnext",
                "moduleResolution": "bundler", "types": [],
                "rootDirs": [".", ".svelte-kit/types"] },
                "include": ["src/**/*.ts", ".svelte-kit/types/**/$types.d.ts"] }"#,
        ),
        (
            "src/routes/+page.ts",
            "export const load = async ({ params }) => ({ id: params.id });\n",
        ),
        (
            "src/routes/missing/+page.ts",
            "export function load(event) {\n  return { id: event.params.id };\n}\n",
        ),
        (
            ".svelte-kit/types/src/routes/$types.d.ts",
            "export type PageLoadEvent = { params: { id: string } };\n\
                 export type PageLoad = (event: PageLoadEvent) => unknown;\n",
        ),
    ]);
    // svelte-check 4.7.6 reports only the route without generated types, at the type it inserts.
    let found = project.findings(None);
    assert_eq!(found.len(), 1, "{found:?}");
    let (file, code, message) = &found[0];
    assert_eq!(
        (file.as_str(), code.as_u64()),
        ("src/routes/missing/+page.ts", Some(2307))
    );
    assert!(
        message.ends_with(
            "(this likely means that SvelteKit's type generation didn't run yet - \
             try running it by executing 'npm run dev' or 'npm run build')"
        ),
        "{message}"
    );
}

const OUT_DIR: &str = r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler",
"strict":true,"skipLibCheck":true,"types":[],"outDir":"./dist"ROOT_DIR},"include":["src"]}"#;

fn out_dir_project(root_dir: &str) -> Project {
    Project::new(&[
        ("tsconfig.json", &OUT_DIR.replace("ROOT_DIR", root_dir)),
        ("shared.ts", "export const shared = 1;\n"),
        ("src/lib/util.ts", "export const n: number = '';\n"),
        (
            "src/App.svelte",
            concat!(
                "<script lang=\"ts\">\n",
                "  import { n } from './lib/util';\n",
                "  import { shared } from '../shared';\n",
                "</script>\n",
                "{n}{shared}\n",
            ),
        ),
    ])
}

#[test]
fn an_out_dir_without_a_root_dir_keeps_the_root_dir_of_the_project() {
    // TS6059 would name the overlay's directory as the rootDir.
    let project = out_dir_project("");
    assert_eq!(project.check(), ["src/lib/util.ts TS2322"]);
}

#[test]
fn a_root_dir_the_project_sets_still_holds_its_files() {
    let project = out_dir_project(r#","rootDir":"./src""#);
    assert_eq!(
        project.check(),
        ["src/App.svelte TS6059", "src/lib/util.ts TS2322"]
    );
}

/// svelte2tsx reads `generics` in a JavaScript component too, and writes it between its ignore
/// comments. svelte-check 4.7.8 reports only `G2`'s type alias and the two wrong props.
#[test]
fn a_javascript_component_reads_its_generics_and_hides_their_findings() {
    let project = Project::new(&[
        (
            "tsconfig.json",
            r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler","strict":true,
"allowJs":true,"checkJs":true,"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#,
        ),
        (
            "src/G1.svelte",
            concat!(
                "<script generics=\"T extends string\">\n",
                "  /** @type {{ value: T, all: T[] }} */\n",
                "  let { value, all } = $props();\n",
                "  /** @type {T} */\n",
                "  const first = all[0];\n",
                "</script>\n",
                "<p>{value}{first}</p>\n",
            ),
        ),
        (
            "src/G2.svelte",
            concat!(
                "<script generics=\"T extends string\">\n",
                "  let { v }: { v: T } = $props();\n",
                "</script>\n",
                "<p>{v}</p>\n",
            ),
        ),
        // A list that does not parse.
        (
            "src/G5.svelte",
            concat!(
                "<script generics=\"T extends\">\n",
                "  /** @type {{ v: string }} */\n",
                "  let { v } = $props();\n",
                "</script>\n",
                "<p>{v}</p>\n",
            ),
        ),
        (
            "src/G7.svelte",
            "<script generics=\"T\">\n  let { n = 1 } = $props();\n</script>\n<p>{n}</p>\n",
        ),
        (
            "src/Use.svelte",
            concat!(
                "<script lang=\"ts\">\n",
                "  import G1 from \"./G1.svelte\";\n",
                "  import G2 from \"./G2.svelte\";\n",
                "  import G5 from \"./G5.svelte\";\n",
                "  import G7 from \"./G7.svelte\";\n",
                "</script>\n",
                "<G1 value=\"a\" all={[\"a\"]} />\n",
                "<G2 v={1} />\n",
                "<G5 v=\"ok\" />\n",
                "<G7 n=\"s\" />\n",
            ),
        ),
    ]);
    assert_eq!(
        project.check(),
        [
            "src/G2.svelte TS8008",
            "src/Use.svelte TS2322",
            "src/Use.svelte TS2322"
        ]
    );
}

#[cfg(unix)]
#[test]
fn a_check_that_adds_nothing_to_the_project_checks_in_the_snapshot_that_lists_its_files() {
    let project = Project::new(&[
        ("tsconfig.json", NODENEXT),
        ("package.json", r#"{"type":"module"}"#),
        ("src/a.ts", "export const wrong: number = 'a';\n"),
        (
            "src/b.ts",
            "import { wrong } from './a.js';\nexport const right: string = wrong;\n",
        ),
    ]);
    let log = project.0.join("requests");
    let found: Vec<_> = (project.findings_with(None, Some(&log)).into_iter())
        .map(|(file, code, _)| format!("{file} TS{code}"))
        .collect();
    assert_eq!(found, ["src/a.ts TS2322", "src/b.ts TS2322"]);
    let requests = std::fs::read(&log).expect("the checker's requests");
    let snapshots = (requests.windows(b"createSnapshot".len()))
        .filter(|window| *window == b"createSnapshot")
        .count();
    assert_eq!(snapshots, 1);
}
