use super::{Declared, GLOBALS, Global, LIBRARY, Setting, global, library};

#[test]
fn rows_are_sorted_and_unique_for_binary_search() {
    assert!(GLOBALS.windows(2).all(|pair| pair[0].0 < pair[1].0));
    assert!(LIBRARY.windows(2).all(|pair| pair[0].0 < pair[1].0));
}

#[test]
fn library_names_are_types_and_some_are_values() {
    assert_eq!(library("Record"), Some(false));
    assert_eq!(library("PropertyKey"), Some(false));
    assert_eq!(library("Map"), Some(true));
    // es5 declares `Symbol` as a type before es2015 declares its value, and the first one wins.
    assert_eq!(library("Symbol"), Some(false));
    assert_eq!(library("HTMLElement"), None);
}

#[test]
fn builtins_and_browser_globals_are_told_apart() {
    assert_eq!(global("Math"), Some(Global::Builtin));
    assert_eq!(global("DisposableStack"), Some(Global::Builtin));
    for name in ["console", "setTimeout", "fetch"] {
        assert_eq!(global(name), Some(Global::Browser { node: true }), "{name}");
    }
    // globals 16.4.0, which eslint-plugin-svelte's tests use, gives Node.js no Web Storage API.
    for name in ["window", "document", "localStorage"] {
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
            "{header}: the oracle installs {name} {pinned}; run `node tools/oracle/oracle.ts \
                globals`"
        );
    }
    let header = include_str!("../vendor/typescript_library.rs")
        .lines()
        .next()
        .expect("a header");
    let pinned = package
        .split("\"@typescript-eslint/parser\": \"")
        .nth(1)
        .and_then(|rest| rest.split('"').next())
        .expect("the oracle pins the parser");
    // typescript-eslint releases its packages together.
    assert!(
        header.ends_with(&format!("scope-manager {pinned}")),
        "{header}: the oracle installs @typescript-eslint/parser {pinned}; run `node \
            tools/oracle/oracle.ts globals`"
    );
}

#[test]
fn a_setting_declares_a_name_or_turns_off_even_a_builtin() {
    let declared = Declared::with_settings([("foo", Setting::Writable), ("Promise", Setting::Off)]);
    assert!(declared.declares("foo") && declared.declares("Math"));
    assert!(!declared.declares("Promise") && !declared.declares("bar"));
    let overridden = declared.overridden([("foo", Setting::Off), ("bar", Setting::Readonly)]);
    assert!(!overridden.declares("foo") && overridden.declares("bar"));
    assert!(
        declared.declares("foo"),
        "the configuration's globals stay as they are"
    );
}

#[test]
fn settings_are_the_names_normalize_config_global_accepts() {
    for (name, setting) in [
        ("off", Setting::Off),
        ("true", Setting::Writable),
        ("writeable", Setting::Writable),
        ("writable", Setting::Writable),
        ("false", Setting::Readonly),
        ("readable", Setting::Readonly),
        ("readonly", Setting::Readonly),
    ] {
        assert_eq!(Setting::named(name), Some(setting), "{name}");
    }
    for name in ["null", "bogus", "Off", ""] {
        assert_eq!(Setting::named(name), None, "{name}");
    }
}

#[test]
fn off_leaves_a_value_the_typescript_library_declares() {
    // ESLint 10.14.0 with @typescript-eslint/parser 8.72.1: `/* global NAME:off */ NAME;` under
    // no-undef, the same with the configuration's `{ NAME: 'off' }`.
    let declared = [
        "Math", "Map", "Set", "Array", "JSON", "Reflect", "WeakMap", "Intl", "BigInt",
    ];
    let undeclared = [
        "Promise",
        "Symbol",
        "Proxy",
        "globalThis",
        "URL",
        "console",
        "parseInt",
        "NaN",
        "undefined",
    ];
    for name in declared.into_iter().chain(["Date", "Object", "Error"]) {
        let off = Declared::with_settings([(name, Setting::Off)]);
        assert!(off.declares(name), "{name}");
    }
    for name in undeclared {
        let off = Declared::with_settings([(name, Setting::Off)]);
        assert!(!off.declares(name), "{name}");
    }
}
