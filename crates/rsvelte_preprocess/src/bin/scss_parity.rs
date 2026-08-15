//! Compiles a batch of SCSS/Sass units with the `grass` backend, for the
//! dart-sass parity gate (`scripts/compat-corpus/scss-verify.mjs`).
//!
//! Reads one JSON array of `{ id, source, indented, filename, loadPaths }` on
//! stdin and writes one JSON object per line — `{ id, ok, css }` /
//! `{ id, ok: false, error }` — on stdout. Batched in one process because the
//! gate's whole point is to compare the same backend the preprocessor ships,
//! and a per-unit process would pay startup 100+ times for a run that is
//! otherwise sub-second.
//!
//! `grass` panics on some real corpus input, and the release profile aborts
//! rather than unwinds, so `catch_unwind` cannot be the isolation: the index is
//! announced on stderr before each unit and `--from <i>` resumes after a crash.

use std::io::{Read, Write};

use rsvelte_core::compiler::preprocess::types::{AttributeValue, PreprocessAttributeMap};
use rsvelte_preprocess::filter::FilterOptions;
use rsvelte_preprocess::sass::{SassOptions, preprocess_sass};
use serde_json::{Value, json};

fn main() {
    let mut input = String::new();
    if let Err(error) = std::io::stdin().read_to_string(&mut input) {
        eprintln!("scss_parity: cannot read stdin: {error}");
        std::process::exit(1);
    }
    let units: Vec<Value> = match serde_json::from_str(&input) {
        Ok(units) => units,
        Err(error) => {
            eprintln!("scss_parity: cannot parse stdin as JSON: {error}");
            std::process::exit(1);
        }
    };

    let from = std::env::args()
        .position(|a| a == "--from")
        .and_then(|i| std::env::args().nth(i + 1))
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(0);

    let mut stdout = std::io::stdout().lock();
    let mut stderr = std::io::stderr().lock();
    for (index, unit) in units.iter().enumerate().skip(from) {
        let _ = writeln!(stderr, "IDX {index}");
        let _ = stderr.flush();
        let _ = writeln!(stdout, "{}", compile(unit));
        let _ = stdout.flush();
    }
}

fn compile(unit: &Value) -> Value {
    let id = unit.get("id").and_then(Value::as_str).unwrap_or_default();
    let source = unit
        .get("source")
        .and_then(Value::as_str)
        .unwrap_or_default();
    let indented = unit
        .get("indented")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let filename = unit.get("filename").and_then(Value::as_str);
    let load_paths = unit
        .get("loadPaths")
        .and_then(Value::as_array)
        .map(|paths| {
            paths
                .iter()
                .filter_map(Value::as_str)
                .map(std::path::PathBuf::from)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    let mut attributes = PreprocessAttributeMap::default();
    attributes.insert(
        "lang".to_string(),
        AttributeValue::String(if indented { "sass" } else { "scss" }.to_string()),
    );

    let compiled = preprocess_sass(
        &SassOptions {
            load_paths,
            ..SassOptions::default()
        },
        &FilterOptions::default(),
        filename,
        source,
        &attributes,
    );

    match compiled {
        Ok(Some(processed)) => json!({ "id": id, "ok": true, "css": processed.code }),
        Ok(None) => json!({ "id": id, "ok": false, "error": "not selected as sass/scss" }),
        Err(error) => json!({ "id": id, "ok": false, "error": error }),
    }
}
