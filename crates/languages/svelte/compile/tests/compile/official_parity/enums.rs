//! A TypeScript enum: upstream refuses it when it removes the types, and acorn-typescript checks
//! no member's name, so a member declared twice raises nothing first.

use rsvelte_svelte_compile::{CompileOptions, compile};

/// A TypeScript script, the code svelte 5.57.3 raises in runes mode, and where in the script its
/// JavaScript error is (`typescript_invalid_feature` is at the script's start).
const CASES: &[(&str, &str, u32)] = &[
    ("enum E { A, A }", "typescript_invalid_feature", 0),
    ("enum E { 'A', 'A' }", "typescript_invalid_feature", 0),
    ("enum E { A, 'A' }", "typescript_invalid_feature", 0),
    ("const enum E { A, A }", "typescript_invalid_feature", 0),
    ("declare enum E { A, A }", "typescript_invalid_feature", 0),
    ("enum E { A, B }", "typescript_invalid_feature", 0),
    ("enum E { A } let E;", "js_parse_error", 17),
    (
        "enum E { A, A } let x: number = delete y;",
        "js_parse_error",
        32,
    ),
];

#[test]
fn a_repeated_enum_member_leaves_the_enum_to_be_refused() {
    let open = "<script lang=\"ts\">";
    for &(script, code, at) in CASES {
        let source = format!("{open}{script}</script>");
        let error = compile(&source, &CompileOptions::default()).expect_err(&source);
        let (raised, _, raised_at) = super::outcomes::raised(&error);
        let (official, _, official_at) =
            super::outcomes::official(code, "", at + open.len() as u32);
        assert_eq!((raised, raised_at), (official, official_at), "{source}");
    }
}
