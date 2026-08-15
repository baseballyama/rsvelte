//! Compiles a batch of SCSS/Sass units with the `grass` backend, for the
//! dart-sass parity gate (`scripts/compat-corpus/scss-verify.mjs`).
//!
//! Reads one JSON array of `{ id, source, indented, filename, loadPaths }` on stdin and
//! writes one JSON array of `{ id, ok, css }` / `{ id, ok: false, error }` on
//! stdout. Batched in one process because the gate's whole point is to compare
//! the same backend the preprocessor ships, and a per-unit process would pay
//! startup 100+ times for a run that is otherwise sub-second.

use std::io::Read;

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

    let results: Vec<Value> = units.iter().map(compile).collect();
    println!("{}", Value::Array(results));
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

    // A panic in `grass` would abort the batch and lose every later unit, so
    // each one is isolated and reported as its own failure.
    let compiled = std::panic::catch_unwind(|| {
        preprocess_sass(
            &SassOptions {
                load_paths: load_paths.clone(),
                ..SassOptions::default()
            },
            &FilterOptions::default(),
            filename,
            source,
            &attributes,
        )
    });

    match compiled {
        Ok(Ok(Some(processed))) => json!({ "id": id, "ok": true, "css": processed.code }),
        Ok(Ok(None)) => json!({ "id": id, "ok": false, "error": "not selected as sass/scss" }),
        Ok(Err(error)) => json!({ "id": id, "ok": false, "error": error }),
        Err(_) => json!({ "id": id, "ok": false, "error": "panic" }),
    }
}
