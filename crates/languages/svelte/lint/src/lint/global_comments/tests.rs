use rsvelte_typescript_semantic::globals::Setting;

use super::settings;
use crate::lint::tests::comment;

/// The settings of one comment, `text`.
fn of(text: &str) -> Vec<(String, Setting)> {
    settings(&[&comment(text)], text)
        .into_iter()
        .map(|(name, setting)| (name.into(), setting))
        .collect()
}

fn named(entries: &[(&str, Setting)]) -> Vec<(String, Setting)> {
    entries.iter().map(|&(n, s)| (n.to_owned(), s)).collect()
}

#[test]
fn names_are_read_only_unless_a_setting_follows() {
    use Setting::{Off, Readonly, Writable};
    assert_eq!(of("/* global foo */"), named(&[("foo", Readonly)]));
    assert_eq!(
        of("/* globals foo, bar:writable */"),
        named(&[("foo", Readonly), ("bar", Writable)])
    );
    assert_eq!(
        of("/*global foo bar baz*/"),
        named(&[("foo", Readonly), ("bar", Readonly), ("baz", Readonly)])
    );
    assert_eq!(
        of("/* global foo : readonly , bar:true,baz:false */"),
        named(&[("foo", Readonly), ("bar", Writable), ("baz", Readonly)])
    );
    assert_eq!(
        of("/* global foo, foo:off */"),
        named(&[("foo", Readonly), ("foo", Off)])
    );
    assert_eq!(of("/* global foo -- why */"), named(&[("foo", Readonly)]));
}

/// `ESLint` reports these settings and sets nothing for them.
#[test]
fn an_unknown_setting_sets_nothing() {
    assert_eq!(
        of("/* global foo:bogus, bar */"),
        named(&[("bar", Setting::Readonly)])
    );
    assert_eq!(of("/* global q:null, r: */"), named(&[]));
}

#[test]
fn other_comments_are_no_directives() {
    for text in [
        "// global foo",
        "/* globalfoo */",
        "/* Global foo */",
        "/* global-foo */",
        "/* eslint foo: 2 */",
        "/* -- global foo */",
    ] {
        assert_eq!(of(text), named(&[]), "{text}");
    }
    assert_eq!(of("/*  global  */"), named(&[]));
}
