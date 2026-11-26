//! `rsvelte lsp`'s type check, against what `rsvelte typecheck` prints for the same texts.

use std::path::Path;
use std::process::Command;

use serde_json::{Value, json};

use crate::Scratch;
use crate::language_server::{Client, uri};
use crate::typecheck::typecheck_config;

const TSCONFIG: &str = r#"{"compilerOptions":{"module":"esnext","moduleResolution":"bundler",
"strict":true,"skipLibCheck":true,"noEmit":true,"types":[]},"include":["src"]}"#;

/// A UTF-16 pair before the error, so its column counts code units, not bytes.
const WRONG: &str = "<script lang=\"ts\">\n\tconst s = '😀'; const n: number = s;\n</script>\n\
                     <button>{n}</button>\n";
const RIGHT: &str = "<script lang=\"ts\">\n\tconst s = '😀'; const n: string = s;\n</script>\n\
                     <button>{n}</button>\n";

/// A project that `rsvelte typecheck` checks with the test checker, with `component` saved as
/// `src/App.svelte` and an error in `src/wrong.ts`, which the editor does not open.
fn project(component: &str) -> Scratch {
    let config = typecheck_config(&rsvelte_test_harness::content_mapper());
    Scratch::new(&[
        ("rsvelte.config.json", &config),
        (
            ".oxlintrc.json",
            r#"{ "rules": { "svelte/button-has-type": "error" } }"#,
        ),
        ("tsconfig.json", TSCONFIG),
        ("src/App.svelte", component),
        ("src/wrong.ts", "export const w: string = 1;\n"),
    ])
}

/// `(line, character, code, message)` of each error `rsvelte typecheck` prints for `file`, as the
/// protocol counts them from 0.
fn typechecked(root: &Path, file: &str) -> Vec<(u64, u64, Value, String)> {
    let output = Command::new(env!("CARGO_BIN_EXE_rsvelte"))
        .arg("typecheck")
        .current_dir(root)
        .output()
        .expect("run rsvelte typecheck");
    let report = String::from_utf8_lossy(&output.stdout).into_owned();
    let prefix = format!("{}(", file.replace('/', std::path::MAIN_SEPARATOR_STR));
    (report.lines())
        .filter_map(|line| line.strip_prefix(&prefix))
        .map(|rest| {
            let (at, rest) = rest.split_once("): error TS").expect("a tsc line");
            let (line, column) = at.split_once(',').expect("a line and a column");
            let (code, message) = rest.split_once(": ").expect("a code and a message");
            (
                line.parse::<u64>().expect("a line") - 1,
                column.parse::<u64>().expect("a column") - 1,
                json!(code.parse::<u64>().expect("a code")),
                message.to_owned(),
            )
        })
        .collect()
}

/// The diagnostics of `source` in `diagnostics`, as [`typechecked`] reads errors.
fn of(source: &str, diagnostics: &[Value]) -> Vec<(u64, u64, Value, String)> {
    (diagnostics.iter())
        .filter(|d| d["source"] == source)
        .map(|d| {
            let start = &d["range"]["start"];
            (
                start["line"].as_u64().expect("a line"),
                start["character"].as_u64().expect("a character"),
                d["code"].clone(),
                d["message"].as_str().expect("a message").to_owned(),
            )
        })
        .collect()
}

/// The diagnostics of the next publication for `uri` that `done` accepts.
fn published(client: &mut Client, uri: &str, done: impl Fn(&[Value]) -> bool) -> Vec<Value> {
    loop {
        let parameters = client.notification("textDocument/publishDiagnostics");
        let diagnostics = parameters["diagnostics"].as_array().expect("diagnostics");
        if parameters["uri"] == uri && done(diagnostics) {
            return diagnostics.clone();
        }
    }
}

fn change(client: &mut Client, path: &Path, version: u64, text: &str) {
    client.notify(
        "textDocument/didChange",
        &json!({
            "textDocument": { "uri": uri(path), "version": version },
            "contentChanges": [{ "text": text }],
        }),
    );
}

#[test]
fn type_errors_are_the_ones_rsvelte_typecheck_prints_for_the_editors_text() {
    let root = project(RIGHT);
    let saved = project(WRONG);
    let (mut client, _) = Client::start(&root, false);
    let app = root.join("src/App.svelte");
    // The unsaved text has the error the disk's has not.
    client.open(&app, WRONG);
    let has_type_errors = |d: &[Value]| d.iter().any(|d| d["source"] == "ts");
    let found = published(&mut client, &uri(&app), has_type_errors);
    let expected = typechecked(&saved, "src/App.svelte");
    assert!(!expected.is_empty(), "the oracle finds the error");
    assert_eq!(of("ts", &found), expected);
    let wrong = published(
        &mut client,
        &uri(&root.join("src/wrong.ts")),
        has_type_errors,
    );
    assert_eq!(of("ts", &wrong), typechecked(&saved, "src/wrong.ts"));
    change(&mut client, &app, 2, RIGHT);
    published(&mut client, &uri(&app), |d| !has_type_errors(d));
    assert_eq!(client.exit(), Some(0));
}

#[test]
fn the_lint_and_the_type_check_of_a_file_are_published_together() {
    let root = project(RIGHT);
    let (mut client, _) = Client::start(&root, false);
    let app = root.join("src/App.svelte");
    client.open(&app, WRONG);
    let sources = |d: &[Value]| {
        let mut sources: Vec<String> = (d.iter())
            .map(|d| d["source"].as_str().expect("a source").to_owned())
            .collect();
        sources.sort();
        sources.dedup();
        sources
    };
    published(&mut client, &uri(&app), |d| sources(d) == ["oxc", "ts"]);
    // The lint's next publication keeps the type check's errors, and the reverse.
    change(&mut client, &app, 2, RIGHT);
    published(&mut client, &uri(&app), |d| sources(d) == ["oxc"]);
    assert_eq!(client.exit(), Some(0));
}
