//! The fixture generator records the exact compile options used for every
//! expectation. Keep test runners in lockstep with that observable contract.

mod common;

use std::collections::BTreeSet;
use std::fs;

use common::{ensure_fixtures_exist, fixture_samples_dir, fixtures_path, get_fixture_samples};

const CATEGORIES: &[&str] = &[
    "hydration",
    "runtime-browser",
    "runtime-legacy",
    "runtime-runes",
    "server-side-rendering",
];

#[test]
fn generated_runtime_options_are_all_runner_supported() {
    ensure_fixtures_exist();

    let fixtures = fixtures_path();
    let mut seen = BTreeSet::new();
    let mut dev = false;
    for category in CATEGORIES {
        for sample in get_fixture_samples(category) {
            let name = sample.file_name().expect("sample name");
            let path = fixtures.join(category).join(name).join("metadata.json");
            let Ok(metadata) = fs::read_to_string(path) else {
                continue;
            };
            let metadata = serde_json::from_str::<serde_json::Value>(&metadata)
                .expect("fixture metadata is JSON");
            let options = metadata
                .get("compileOptions")
                .and_then(serde_json::Value::as_object)
                .expect("fixture metadata records compileOptions");
            seen.extend(options.keys().cloned());
            dev |= options
                .get("dev")
                .and_then(serde_json::Value::as_bool)
                .unwrap_or(false);
        }
    }

    assert_eq!(
        seen,
        BTreeSet::from([
            "accessors".to_string(),
            "css".to_string(),
            "dev".to_string(),
            "experimental".to_string(),
            "hmr".to_string(),
        ]),
        "fixture generation gained an option no runner has explicitly handled"
    );
    assert!(dev, "the gate needs a dev-mode positive control");
    assert!(fixture_samples_dir("runtime-legacy").exists());
}
