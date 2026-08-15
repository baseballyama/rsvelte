//! `@use` / `@import`ed partials must be reported as dependencies, or a watcher
//! never rebuilds a component when one of them changes.

#![cfg(feature = "sass")]

use std::fs;
use std::path::{Path, PathBuf};

use rsvelte_core::compiler::preprocess::types::{AttributeValue, PreprocessAttributeMap as Map};
use rsvelte_preprocess::filter::FilterOptions;
use rsvelte_preprocess::sass::{SassOptions, preprocess_sass};
use rsvelte_preprocess::svelte_preprocess::scss;

fn attrs(pairs: &[(&str, &str)]) -> Map<String, AttributeValue> {
    let mut m = Map::default();
    for (k, v) in pairs {
        m.insert(k.to_string(), AttributeValue::String(v.to_string()));
    }
    m
}

/// A directory holding `_vars.scss` and `_nested.scss`, where `_vars` forwards
/// `_nested`, so a transitive load is covered too.
struct Fixture {
    dir: PathBuf,
}

impl Fixture {
    fn new(name: &str) -> Self {
        let dir = std::env::temp_dir().join(format!("rsvelte-sass-deps-{name}"));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("_nested.scss"), "$accent: blue;\n").unwrap();
        fs::write(dir.join("_vars.scss"), "@use 'nested';\n$color: red;\n").unwrap();
        Fixture { dir }
    }

    fn entry(&self) -> String {
        self.dir
            .join("Component.svelte")
            .to_string_lossy()
            .into_owned()
    }

    fn canonical(&self, file: &str) -> String {
        fs::canonicalize(self.dir.join(file))
            .unwrap()
            .to_string_lossy()
            .into_owned()
    }
}

impl Drop for Fixture {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.dir);
    }
}

#[test]
fn the_sass_backend_reports_used_partials() {
    let fixture = Fixture::new("sass");
    let processed = preprocess_sass(
        &SassOptions::default(),
        &FilterOptions::default(),
        Some(&fixture.entry()),
        "@use 'vars';\nb { color: vars.$color }",
        &attrs(&[("lang", "scss")]),
    )
    .unwrap()
    .expect("the block selects scss");

    assert_eq!(processed.code, "b {\n  color: red;\n}");
    assert_eq!(
        processed.dependencies,
        vec![
            fixture.canonical("_nested.scss"),
            fixture.canonical("_vars.scss")
        ]
    );
}

#[test]
fn the_svelte_preprocess_backend_reports_used_partials() {
    let fixture = Fixture::new("svelte-preprocess");
    let output = scss::transform(
        scss::ScssOptions::default(),
        false,
        Some(&fixture.entry()),
        "@use 'vars';\nb { color: vars.$color }",
    )
    .unwrap();

    assert_eq!(output.code, "b {\n  color: red;\n}");
    assert_eq!(
        output.dependencies,
        vec![
            fixture.canonical("_nested.scss"),
            fixture.canonical("_vars.scss")
        ]
    );
}

#[test]
fn a_block_with_no_imports_reports_no_dependencies() {
    let processed = preprocess_sass(
        &SassOptions::default(),
        &FilterOptions::default(),
        None,
        "b { color: red }",
        &attrs(&[("lang", "scss")]),
    )
    .unwrap()
    .expect("the block selects scss");

    assert!(processed.dependencies.is_empty());
}

#[test]
fn an_extra_load_path_is_recorded_too() {
    let fixture = Fixture::new("load-path");
    let processed = preprocess_sass(
        &SassOptions {
            load_paths: vec![fixture.dir.clone()],
            ..SassOptions::default()
        },
        &FilterOptions::default(),
        Some(Path::new("elsewhere/Component.svelte").to_str().unwrap()),
        "@use 'vars';\nb { color: vars.$color }",
        &attrs(&[("lang", "scss")]),
    )
    .unwrap()
    .expect("the block selects scss");

    assert_eq!(
        processed.dependencies,
        vec![
            fixture.canonical("_nested.scss"),
            fixture.canonical("_vars.scss")
        ]
    );
}
