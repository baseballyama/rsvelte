use std::cell::Cell;

use super::*;

#[test]
fn a_program_asks_its_version_once() {
    let asked = Cell::new(0);
    let version = || {
        asked.set(asked.get() + 1);
        Ok("1.0".to_owned())
    };
    let mut tools = Tools::default();
    tools.record("tsc".to_owned(), version).expect("records");
    tools.record("tsc".to_owned(), version).expect("records");
    tools
        .record("vue-tsc".to_owned(), version)
        .expect("records");
    assert_eq!(asked.get(), 2);
    let commands: Vec<&str> = tools
        .as_slice()
        .iter()
        .map(|tool| tool.command.as_str())
        .collect();
    assert_eq!(commands, ["tsc", "vue-tsc"]);
}

#[test]
fn a_program_whose_version_fails_is_not_recorded() {
    let mut tools = Tools::default();
    let error = tools
        .record("tsc".to_owned(), || Err(CallError("missing".to_owned())))
        .expect_err("fails");
    assert_eq!(error.0, "missing");
    assert_eq!(tools.as_slice(), &[]);
}
