use super::{GLOBALS, Global, global};

#[test]
fn rows_are_sorted_and_unique_for_binary_search() {
    assert!(GLOBALS.windows(2).all(|pair| pair[0].0 < pair[1].0));
}

#[test]
fn builtins_and_browser_globals_are_told_apart() {
    assert_eq!(global("Math"), Some(Global::Builtin));
    assert_eq!(global("DisposableStack"), Some(Global::Builtin));
    assert_eq!(global("console"), Some(Global::Browser));
    assert_eq!(global("window"), Some(Global::Browser));
    assert_eq!(global("require"), None);
    assert_eq!(global("unknown"), None);
}
