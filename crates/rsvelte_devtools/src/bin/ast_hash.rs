//! Print one hash per corpus component of `compile()`'s `result.ast`, so a
//! change to WHEN that field is built can be shown not to change WHAT it holds.
//! Run it on both sides of the change and diff the output.

use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::PathBuf;

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn main() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let manifest: serde_json::Value = serde_json::from_str(
        &fs::read_to_string(root.join("compatibility/manifest.json")).unwrap(),
    )
    .unwrap();
    let limit: usize = std::env::args()
        .nth(1)
        .and_then(|s| s.parse().ok())
        .unwrap_or(3000);

    let ids: Vec<String> = manifest
        .as_array()
        .unwrap()
        .iter()
        .filter(|e| e["kind"] == "component")
        .map(|e| e["id"].as_str().unwrap().to_string())
        .collect();
    let stride = (ids.len() / limit).max(1);

    for id in ids.iter().step_by(stride).take(limit) {
        let Ok(source) = fs::read_to_string(root.join("compatibility/sources").join(id)) else {
            continue;
        };
        for (label, generate, modern) in [
            ("client", GenerateMode::Client, false),
            ("server", GenerateMode::Server, false),
            ("modern", GenerateMode::Client, true),
        ] {
            let options = CompileOptions {
                filename: Some(id.clone()),
                generate,
                modern_ast: modern,
                ..Default::default()
            };
            let out = match compile(&source, options) {
                Ok(result) => result.ast.into_string(),
                Err(_) => None,
            };
            let mut hasher = DefaultHasher::new();
            out.hash(&mut hasher);
            println!(
                "{id}\t{label}\t{:016x}\t{}",
                hasher.finish(),
                out.map_or(0, |s| s.len())
            );
        }
    }
}
