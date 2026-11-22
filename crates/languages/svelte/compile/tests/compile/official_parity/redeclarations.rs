//! A name declared twice, where acorn fails at the second name and oxc labels it or the declarator
//! around it, in a component's script and in a `.svelte.js` module.

/// A module's text, the first line of acorn's message and where it is.
const CASES: &[(&str, &str, u32)] = &[
    (
        "function $v() {} var $v = 1",
        "Identifier '$v' has already been declared",
        21,
    ),
    (
        "function a() {} var a = 1;",
        "Identifier 'a' has already been declared",
        20,
    ),
    (
        "function a() {} var a;",
        "Identifier 'a' has already been declared",
        20,
    ),
    (
        "function a() {} var { a } = {};",
        "Identifier 'a' has already been declared",
        22,
    ),
    (
        "function a() {} var [a] = [];",
        "Identifier 'a' has already been declared",
        21,
    ),
    (
        "function a() {} var b = 1, a = 2;",
        "Identifier 'a' has already been declared",
        27,
    ),
    (
        "function a() {} var { b: a } = {};",
        "Identifier 'a' has already been declared",
        25,
    ),
    (
        "function a() {} var { ...a } = {};",
        "Identifier 'a' has already been declared",
        25,
    ),
    (
        "function a() {} var [b = 1, a] = [];",
        "Identifier 'a' has already been declared",
        28,
    ),
    (
        "{ function a() {} var { a } = {}; }",
        "Identifier 'a' has already been declared",
        24,
    ),
    (
        "let a; var a = 1;",
        "Identifier 'a' has already been declared",
        11,
    ),
    (
        "function g() { { function a() {} var a = 1; } }",
        "Identifier 'a' has already been declared",
        37,
    ),
    ("function f(a, a) {}", "Argument name clash", 14),
    (
        "class K { #a = 1; #a = 2; }",
        "Identifier '#a' has already been declared",
        18,
    ),
    (
        "class K { #a() {} #a() {} }",
        "Identifier '#a' has already been declared",
        18,
    ),
];

#[test]
fn a_name_declared_again_raises_acorns_error_at_the_name() {
    super::outcomes::assert_script_and_module_errors(CASES);
}

/// A component with a TypeScript script, and the code, the first line of the message and where
/// svelte's error is, or `None` where it compiles; acorn-typescript checks no public class member.
const TYPESCRIPT_CASES: &[(&str, super::outcomes::Outcome<'_>)] = &[
    (
        "<script lang=\"ts\">class A { a = 1; a = 2 }</script>",
        Some(("duplicate_class_field", "`a` has already been declared", 35)),
    ),
    (
        "<script lang=\"ts\">class A { 'a' = 1; 'a' = 2 }</script>",
        Some(("duplicate_class_field", "`a` has already been declared", 37)),
    ),
    (
        "<script lang=\"ts\">class A { a; a; }</script>",
        Some(("duplicate_class_field", "`a` has already been declared", 31)),
    ),
    (
        "<script lang=\"ts\">class A { a: number = 1; a: number = 2 }</script>",
        Some(("duplicate_class_field", "`a` has already been declared", 43)),
    ),
    (
        "<script lang=\"ts\">class A { a = 1; a() {} }</script>",
        Some(("duplicate_class_field", "`a` has already been declared", 35)),
    ),
    (
        "<script lang=\"ts\">class A { a() {} a() {} }</script>",
        Some(("duplicate_class_field", "`a` has already been declared", 35)),
    ),
    (
        "<script lang=\"ts\">class A { get a() { return 1 } get a() { return 2 } }</script>",
        Some(("duplicate_class_field", "`a` has already been declared", 49)),
    ),
    (
        "<script lang=\"ts\">class A { get a() { return 1 } set a(v) {} }</script>",
        None,
    ),
    (
        "<script lang=\"ts\">class A { static a = 1; static a = 2 }</script>",
        None,
    ),
    (
        "<script lang=\"ts\">class A { static a() {} static a() {} }</script>",
        Some((
            "duplicate_class_field",
            "`@a` has already been declared",
            42,
        )),
    ),
    (
        "<script lang=\"ts\">class A { static #a = 1; #a = 2 }</script>",
        Some((
            "js_parse_error",
            "Identifier '#a' has already been declared",
            43,
        )),
    ),
    (
        "<script lang=\"ts\">class A { #a = 1; static #a = 2 }</script>",
        Some((
            "js_parse_error",
            "Identifier '#a' has already been declared",
            43,
        )),
    ),
    (
        "<script lang=\"ts\">class A { #a = 1; #a = 2 }</script>",
        Some((
            "js_parse_error",
            "Identifier '#a' has already been declared",
            36,
        )),
    ),
    (
        "<script lang=\"ts\">class A { static get #a() { return 1 } set #a(v) {} }</script>",
        Some((
            "js_parse_error",
            "Identifier '#a' has already been declared",
            61,
        )),
    ),
    (
        "<script lang=\"ts\">function g() { { function a() {} var [a] = []; } }</script>",
        Some((
            "js_parse_error",
            "Identifier 'a' has already been declared",
            56,
        )),
    ),
    (
        "<script lang=\"ts\">function g() { { function a() {} var a; } }</script>",
        Some((
            "js_parse_error",
            "Identifier 'a' has already been declared",
            55,
        )),
    ),
    (
        "<script lang=\"ts\">{ function a() {} var a; }</script>",
        Some((
            "js_parse_error",
            "Identifier 'a' has already been declared",
            40,
        )),
    ),
    (
        "<script lang=\"ts\">class A { a = $state(1); a = $state(2) }</script>",
        Some((
            "state_field_duplicate",
            "`a` has already been declared on this class",
            43,
        )),
    ),
];

#[test]
fn a_typescript_name_declared_again_raises_what_svelte_raises() {
    super::outcomes::assert_component_outcomes(TYPESCRIPT_CASES);
}
