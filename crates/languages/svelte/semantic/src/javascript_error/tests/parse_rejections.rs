//! Every rejection svelte 5.59.1's `parse` raises, against the error rsvelte reports first, which
//! is a JavaScript syntax error as each of them is.

use super::{first_error_if_any, javascript};

/// Every rejection acorn raises as svelte 5.59.1's `parse` reads a component, with the message
/// and offset `parse` reports: in each kind of script and in the template.
const PARSE_REJECTIONS: &[(&str, Option<(&str, u32)>)] = &[
    (
        "<script lang=\"ts\">\ndeclare const a = f();\n</script>\n",
        Some((
            concat!(
                "A 'const' initializer in an ambient context must be a string or numeric ",
                "literal or literal enum reference."
            ),
            37,
        )),
    ),
    (
        "<script lang=\"ts\">\ndeclare let a: number = 1;\n</script>\n",
        Some(("Initializers are not allowed in ambient contexts.", 43)),
    ),
    (
        "<script>\nclass A { x = arguments }\n</script>\n",
        Some(("Cannot use 'arguments' in class field initializer", 23)),
    ),
    (
        "<script module>\nclass A { x = arguments }\n</script>\n",
        Some(("Cannot use 'arguments' in class field initializer", 30)),
    ),
    (
        "<script lang=\"ts\">\nclass A { x = arguments }\n</script>\n",
        Some(("Cannot use 'arguments' in class field initializer", 33)),
    ),
    (
        "{(class { x = arguments })}\n",
        Some(("Cannot use 'arguments' in class field initializer", 14)),
    ),
    (
        "<script>\nclass A { static { arguments; } }\n</script>\n",
        Some((
            "Cannot use arguments in class static initialization block",
            28,
        )),
    ),
    (
        "<script module>\nclass A { static { arguments; } }\n</script>\n",
        Some((
            "Cannot use arguments in class static initialization block",
            35,
        )),
    ),
    (
        "<script lang=\"ts\">\nclass A { static { arguments; } }\n</script>\n",
        Some((
            "Cannot use arguments in class static initialization block",
            38,
        )),
    ),
    (
        "<script lang=\"ts\">\nclass A { @d x = 1 }\n</script>\n",
        None,
    ),
    (
        "<script>\n(class { static { await 0 } });\n</script>\n",
        Some(("Cannot use await in class static initialization block", 27)),
    ),
    (
        "<script module>\n(class { static { await 0 } });\n</script>\n",
        Some(("Cannot use await in class static initialization block", 34)),
    ),
    (
        "<script lang=\"ts\">\n(class { static { await 0 } });\n</script>\n",
        Some(("Cannot use await in class static initialization block", 37)),
    ),
    (
        "{(class { static { await 0 } })}\n",
        Some(("Cannot use await in class static initialization block", 19)),
    ),
    (
        "<script>\nfunction f(a, a) {}\n</script>\n",
        Some(("Argument name clash", 23)),
    ),
    (
        "<script module>\nfunction f(a, a) {}\n</script>\n",
        Some(("Argument name clash", 30)),
    ),
    (
        "<script lang=\"ts\">\nfunction f(a, a) {}\n</script>\n",
        Some(("Argument name clash", 33)),
    ),
    (
        "<script lang=\"ts\">\nexport declare global { }\n</script>\n",
        Some((
            "'export declare' must be followed by an ambient declaration.",
            34,
        )),
    ),
    (
        "<script>\nclass A { # }\n</script>\n",
        Some(("Unexpected character ' '", 20)),
    ),
    (
        "<script module>\nclass A { # }\n</script>\n",
        Some(("Unexpected character ' '", 27)),
    ),
    (
        "<script lang=\"ts\">\nclass A { # }\n</script>\n",
        Some(("Unexpected character ' '", 30)),
    ),
    (
        "<script>\nlet a = '\\08';\n</script>\n",
        Some(("Octal literal in strict mode", 18)),
    ),
    (
        "<script module>\nlet a = '\\08';\n</script>\n",
        Some(("Octal literal in strict mode", 25)),
    ),
    (
        "<script lang=\"ts\">\nlet a = '\\08';\n</script>\n",
        Some(("Octal literal in strict mode", 28)),
    ),
    (
        "<script>\nlet a = 010;\n</script>\n",
        Some(("Invalid number", 17)),
    ),
    (
        "<script module>\nlet a = 010;\n</script>\n",
        Some(("Invalid number", 24)),
    ),
    (
        "<script lang=\"ts\">\nlet a = 010;\n</script>\n",
        Some(("Invalid number", 27)),
    ),
    (
        "<script>\nlet a =\u{85}1;\n</script>\n",
        Some(("Unexpected character '\u{85}'", 16)),
    ),
    (
        "<script module>\nlet a =\u{85}1;\n</script>\n",
        Some(("Unexpected character '\u{85}'", 23)),
    ),
    (
        "<script lang=\"ts\">\nlet a =\u{85}1;\n</script>\n",
        Some(("Unexpected character '\u{85}'", 26)),
    ),
    (
        "<script lang=\"ts\">\nclass A { override x = 1 }\n</script>\n",
        Some((
            concat!(
                "This member cannot have an 'override' modifier because its containing class does ",
                "not extend another class."
            ),
            29,
        )),
    ),
    (
        "<script>\nlet a; let a;\n</script>\n",
        Some(("Identifier 'a' has already been declared", 20)),
    ),
    (
        "<script module>\nlet a; let a;\n</script>\n",
        Some(("Identifier 'a' has already been declared", 27)),
    ),
    (
        "<script lang=\"ts\">\nlet a; let a;\n</script>\n",
        Some(("Identifier 'a' has already been declared", 30)),
    ),
    (
        "<script lang=\"ts\">\ndeclare let interface: number;\n</script>\n",
        Some(("The keyword 'interface' is reserved", 31)),
    ),
    (
        "<script>\nlet eval = 1;\n</script>\n",
        Some(("Binding eval in strict mode", 13)),
    ),
    (
        "<script module>\nlet eval = 1;\n</script>\n",
        Some(("Binding eval in strict mode", 20)),
    ),
    (
        "<script lang=\"ts\">\nlet eval = 1;\n</script>\n",
        Some(("Binding eval in strict mode", 23)),
    ),
    (
        "<script>\nfunction f(arguments) {}\n</script>\n",
        Some(("Binding arguments in strict mode", 20)),
    ),
    (
        "<script module>\nfunction f(arguments) {}\n</script>\n",
        Some(("Binding arguments in strict mode", 27)),
    ),
    (
        "<script lang=\"ts\">\nfunction f(arguments) {}\n</script>\n",
        Some(("Binding arguments in strict mode", 30)),
    ),
    (
        "<script>\nlet a = yield;\n</script>\n",
        Some(("The keyword 'yield' is reserved", 17)),
    ),
    (
        "<script module>\nlet a = yield;\n</script>\n",
        Some(("The keyword 'yield' is reserved", 24)),
    ),
    (
        "<script lang=\"ts\">\nlet a = yield;\n</script>\n",
        Some(("The keyword 'yield' is reserved", 27)),
    ),
    ("{yield}\n", Some(("The keyword 'yield' is reserved", 1))),
    (
        "<script>\nlet a =\u{200b}1;\n</script>\n",
        Some(("Unexpected character '\u{200b}'", 16)),
    ),
    (
        "<script module>\nlet a =\u{200b}1;\n</script>\n",
        Some(("Unexpected character '\u{200b}'", 23)),
    ),
    (
        "<script lang=\"ts\">\nlet a =\u{200b}1;\n</script>\n",
        Some(("Unexpected character '\u{200b}'", 26)),
    ),
];

#[test]
fn every_rejection_svelte_parse_raises_is_the_first_error() {
    let failures: Vec<_> = PARSE_REJECTIONS
        .iter()
        .filter_map(|&(source, expected)| {
            let first = first_error_if_any(source);
            let wanted = expected.map(|_| javascript());
            (first != wanted)
                .then(|| format!("{source:?}: {first:?}, where svelte says {expected:?}"))
        })
        .collect();
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
