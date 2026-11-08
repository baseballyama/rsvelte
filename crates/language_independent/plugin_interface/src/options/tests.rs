use std::path::PathBuf;

use serde::Deserialize;

use super::*;

#[derive(Debug, Deserialize, PartialEq, Eq)]
struct Width {
    width: u32,
}

fn store(entries: &[(&str, &str)]) -> OptionStore {
    let mut store = OptionStore::default();
    for &(identifier, json) in entries {
        let raw = serde_json::from_str(json).expect("valid JSON");
        store.set(identifier.to_owned(), raw, PathBuf::from("/project"));
    }
    store
}

#[test]
fn decoding_marks_the_options_read_and_keeps_their_base() {
    let mut store = store(&[("a", r#"{"width":80}"#), ("b", "{}")]);
    let got = store.decode::<Width>("a").expect("decodes").expect("given");
    assert_eq!(got.value, Width { width: 80 });
    assert_eq!(got.base, PathBuf::from("/project"));
    assert_eq!(store.unread().collect::<Vec<_>>(), ["b"]);
}

#[test]
fn absent_options_are_none() {
    let mut store = store(&[]);
    assert!(store.decode::<Width>("a").expect("no error").is_none());
}

#[test]
fn options_that_do_not_decode_name_their_plugin_and_stay_unread() {
    let mut store = store(&[("a", r#"{"width":"wide"}"#)]);
    let error = store.decode::<Width>("a").expect_err("wrong type");
    assert!(error.0.starts_with("options of `a`: "), "{}", error.0);
    assert_eq!(store.unread().collect::<Vec<_>>(), ["a"]);
}

#[test]
fn setting_again_replaces_the_options_and_forgets_the_read() {
    let mut store = store(&[("a", r#"{"width":80}"#)]);
    store.decode::<Width>("a").expect("decodes");
    store.set(
        "a".to_owned(),
        serde_json::from_str(r#"{"width":100}"#).expect("JSON"),
        PathBuf::new(),
    );
    assert_eq!(store.unread().collect::<Vec<_>>(), ["a"]);
    let got = store.decode::<Width>("a").expect("decodes").expect("given");
    assert_eq!(got.value, Width { width: 100 });
}
