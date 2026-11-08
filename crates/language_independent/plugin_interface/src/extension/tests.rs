use std::sync::Arc;

use super::*;
use crate::{NoFunctions, Selection};

fn reads_a(_: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    settings.options::<serde_json::Value>("a")?;
    Ok(())
}

static READS_A: Extension = Extension {
    identifier: "a",
    install: reads_a,
};

fn settings(identifiers: &[&str]) -> Settings {
    let mut settings = Settings::new(Selection::Every, Arc::new(NoFunctions));
    for &identifier in identifiers {
        let raw = serde_json::from_str("{}").expect("JSON");
        settings.set(identifier.to_owned(), raw, std::path::PathBuf::new());
    }
    settings
}

#[test]
fn options_some_plugin_read_install() {
    let mut settings = settings(&["a"]);
    install(&mut Registry::new(), &[&READS_A], &mut settings).expect("installs");
}

#[test]
fn options_no_plugin_read_are_refused_by_name() {
    let mut settings = settings(&["a", "b", "c"]);
    let error = install(&mut Registry::new(), &[&READS_A], &mut settings).expect_err("unread");
    assert_eq!(error.0, "no installed plugin reads the options of `b`, `c`");
}
