use std::path::{Path, PathBuf};
use std::sync::Arc;

use rsvelte_plugin_interface::{NoFunctions, Selection, Settings};

use super::*;

/// The type checker `options` name, with relative paths relative to `base`.
fn checker(base: &Path, options: &str) -> Result<Option<Tsc>, CallError> {
    let mut settings = Settings::new(Selection::DocumentTasks, Arc::new(NoFunctions));
    let options = serde_json::from_str(options).map_err(|e| CallError(e.to_string()))?;
    settings.set("typescript.check".to_owned(), options, base.to_owned());
    type_checker(&mut settings, false)
}

struct Scratch(PathBuf);

impl Scratch {
    fn new(name: &str) -> Self {
        let path =
            std::env::temp_dir().join(format!("rsvelte-check-{name}-{}", std::process::id()));
        drop(std::fs::remove_dir_all(&path));
        std::fs::create_dir_all(&path).expect("test directory");
        Self(std::path::absolute(path).expect("absolute"))
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove test directory");
    }
}

#[test]
fn a_relative_program_and_tsconfig_are_relative_to_the_options() {
    let scratch = Scratch::new("relative");
    let got = checker(
        &scratch.0,
        concat!(
            r#"{ "command": ["node_modules/.bin/tsrs", "launcher.js"], "#,
            r#""tsconfig": "app/tsconfig.json" }"#,
        ),
    )
    .unwrap()
    .unwrap();
    assert_eq!(
        got.checker.program,
        scratch.0.join("node_modules/.bin/tsrs")
    );
    assert_eq!(got.checker.arguments, ["launcher.js"]);
    assert_eq!(got.tsconfig, Some(scratch.0.join("app/tsconfig.json")));
}

#[test]
fn a_bare_program_is_the_projects_own_copy_first() {
    let scratch = Scratch::new("bare");
    let got = checker(&scratch.0, r#"{ "command": ["tsrs"] }"#)
        .unwrap()
        .unwrap();
    assert_eq!(
        got.checker.program,
        Path::new("tsrs"),
        "not installed: looked up in PATH"
    );
    let bin = scratch.0.join("node_modules/.bin");
    std::fs::create_dir_all(&bin).unwrap();
    std::fs::write(bin.join("tsrs"), "").unwrap();
    let got = checker(&scratch.0, r#"{ "command": ["tsrs"] }"#)
        .unwrap()
        .unwrap();
    assert_eq!(got.checker.program, bin.join("tsrs"));
}

#[test]
fn the_tsconfig_next_to_the_options_is_the_default() {
    let scratch = Scratch::new("tsconfig");
    let got = checker(&scratch.0, r#"{ "command": ["tsc"] }"#)
        .unwrap()
        .unwrap();
    assert_eq!(got.tsconfig, None, "none there");
    std::fs::write(scratch.0.join("tsconfig.json"), "{}").unwrap();
    let got = checker(&scratch.0, r#"{ "command": ["tsc"] }"#)
        .unwrap()
        .unwrap();
    assert_eq!(got.tsconfig, Some(scratch.0.join("tsconfig.json")));
}

#[test]
fn a_command_needs_a_program_and_options_are_checked() {
    let scratch = Scratch::new("invalid");
    let empty = checker(&scratch.0, r#"{ "command": [] }"#).unwrap_err();
    assert!(empty.0.contains("needs a program"), "{}", empty.0);
    let unknown = checker(&scratch.0, r#"{ "command": ["tsc"], "tsconfg": "x" }"#).unwrap_err();
    assert!(unknown.0.contains("tsconfg"), "{}", unknown.0);
    let mut settings = Settings::new(Selection::DocumentTasks, Arc::new(NoFunctions));
    assert!(
        type_checker(&mut settings, false).unwrap().is_none(),
        "no options"
    );
}
