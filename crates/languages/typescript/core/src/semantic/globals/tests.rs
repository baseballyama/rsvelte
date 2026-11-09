use super::{GLOBALS, Global, global};

#[test]
fn rows_are_sorted_and_unique_for_binary_search() {
    assert!(GLOBALS.windows(2).all(|pair| pair[0].0 < pair[1].0));
}

#[test]
fn builtins_and_browser_globals_are_told_apart() {
    assert_eq!(global("Math"), Some(Global::Builtin));
    assert_eq!(global("DisposableStack"), Some(Global::Builtin));
    // globals 16.5.0 declares the Web Storage API for Node.js too.
    for name in ["console", "setTimeout", "fetch", "localStorage"] {
        assert_eq!(global(name), Some(Global::Browser { node: true }), "{name}");
    }
    for name in ["window", "document"] {
        assert_eq!(
            global(name),
            Some(Global::Browser { node: false }),
            "{name}"
        );
    }
    assert_eq!(global("require"), None);
    assert_eq!(global("unknown"), None);
}

#[test]
fn the_table_comes_from_the_versions_the_oracle_installs() {
    let header = include_str!("../vendor/globals.rs")
        .lines()
        .next()
        .expect("a header");
    let package = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../../tools/oracle/package.json"
    ));
    for name in ["eslint", "globals"] {
        let pinned = package
            .split(&format!("\"{name}\": \""))
            .nth(1)
            .and_then(|rest| rest.split('"').next())
            .expect("the oracle pins the package");
        assert!(
            header.contains(&format!("{name} {pinned}")),
            "{header}: the oracle installs {name} {pinned}; run `node tools/oracle/oracle.ts globals`"
        );
    }
}
