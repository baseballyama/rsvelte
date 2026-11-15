//! `rsvelte check` on a project on disk, whose own tsconfig sets the options under test.

use std::path::{Path, PathBuf};
use std::process::Command;

use rsvelte_test_harness::NodePackages;

struct Project(PathBuf);

impl Project {
    fn new(name: &str, files: &[(&str, &str)]) -> Self {
        let root = std::env::temp_dir().join(format!("rsvelte-cli-{name}-{}", std::process::id()));
        for (file, text) in files {
            let path = root.join(file);
            std::fs::create_dir_all(path.parent().expect("a file has a directory"))
                .expect("test directory");
            std::fs::write(path, text).expect("test file");
        }
        Self(std::fs::canonicalize(&root).expect("test directory"))
    }

    /// Each finding of the check, as `<file> TS<code>`.
    fn check(&self) -> Vec<String> {
        let packages = NodePackages::locate();
        let (program, arguments) = packages.type_checker();
        let command: Vec<String> = std::iter::once(program.to_string_lossy().into_owned())
            .chain(arguments)
            .collect();
        let tsc = serde_json::json!({
            "command": command,
            "tsconfig": self.0.join("tsconfig.json"),
        });
        let svelte = serde_json::json!({
            "svelte": packages.package("svelte"),
            "contentMapper": rsvelte_test_harness::content_mapper(),
        });
        let output = Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .current_dir(&self.0)
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
            let file = Path::new(file)
                .strip_prefix(&self.0)
                .expect("a file of the project");
            let findings: serde_json::Value = serde_json::from_str(body).expect("findings");
            for finding in findings.as_array().expect("a list") {
                found.push(format!("{} TS{}", file.display(), finding["code"]));
            }
        }
        found.sort();
        found
    }
}

impl Drop for Project {
    fn drop(&mut self) {
        drop(std::fs::remove_dir_all(&self.0));
    }
}

const NODENEXT: &str = r#"{"compilerOptions":{"module":"nodenext","moduleResolution":"nodenext",
"strict":true,"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#;

#[test]
fn an_esm_import_of_a_rune_module_by_its_component_name_reads_the_module() {
    let project = Project::new(
        "rune-module",
        &[
            ("package.json", r#"{"type":"module"}"#),
            ("tsconfig.json", NODENEXT),
            (
                "src/state.svelte.ts",
                "export const count = (): string => '';\nexport default class Counter {\n  n = '';\n}\n",
            ),
            (
                "src/use.ts",
                "import Counter, { count } from './state.svelte';\nexport const n: number = count();\nexport const m: number = new Counter().n;\n",
            ),
            (
                "src/Use.svelte",
                "<script lang=\"ts\">\n  import { count } from './state.svelte';\n  const n: number = count();\n</script>\n{n}\n",
            ),
        ],
    );
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
    let project = Project::new(
        "unused-snippet",
        &[
            (
                "tsconfig.json",
                r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler","strict":true,
"skipLibCheck":true,"noEmit":true,"types":[],"noUnusedLocals":true},"include":["src"]}"#,
            ),
            (
                "src/Child.svelte",
                "<script lang=\"ts\">\n  import type { Snippet } from 'svelte';\n  let { text }: { text?: Snippet } = $props();\n</script>\n{@render text?.()}\n",
            ),
            (
                "src/Parent.svelte",
                "<script lang=\"ts\">\n  import Child from './Child.svelte';\n</script>\n<Child>\n  {#snippet text()}<p></p>{/snippet}\n</Child>\n{#snippet unused()}<p></p>{/snippet}\n",
            ),
        ],
    );
    // svelte-check reports the unused snippet, and not the one it reads as a prop.
    assert_eq!(project.check(), ["src/Parent.svelte TS6133"]);
}
