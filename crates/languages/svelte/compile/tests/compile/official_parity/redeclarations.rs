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
    super::assert_script_and_module_errors(CASES);
}
