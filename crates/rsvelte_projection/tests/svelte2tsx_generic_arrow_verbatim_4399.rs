//! svelte2tsx copies a script's angle-bracket type-parameter list into the TSX
//! shadow verbatim. rsvelte used to insert a disambiguating comma (`<T>` →
//! `<T,>`) so the shadow would not lex the arrow as JSX; upstream inserts none,
//! in either `isTsFile` mode, and the rewrite changed the program the type
//! checker sees — `<string>() => a` is a type assertion, `<string,>() => a` is a
//! generic arrow whose type parameter is named `string` (TS2368).
//!
//! Every expected line below is the official `svelte2tsx`'s own output
//! (`submodules/language-tools/packages/svelte2tsx`), not a prediction.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// `(name, script body, the expected shadow line)`.
const CELLS: &[(&str, &str, &str)] = &[
    (
        "assertion_arrow",
        "let a: any;\nconst x = <string>() => a;",
        "const x = <string>() => a;",
    ),
    (
        "assertion_arrow_named",
        "let a: any;\nconst z = <Foo>() => a;",
        "const z = <Foo>() => a;",
    ),
    (
        "generic_arrow",
        "const id = <T>(x: T): T => x;",
        "const id = <T>(x: T): T => x;",
    ),
    (
        "generic_multi",
        "const m = <T, U>(x: T, y: U): T => x;",
        "const m = <T, U>(x: T, y: U): T => x;",
    ),
    (
        "generic_already_comma",
        "const c = <T,>(x: T): T => x;",
        "const c = <T,>(x: T): T => x;",
    ),
    (
        "assertion_plain",
        "let a: any;\nconst y = <string>a;",
        "const y = <string>a;",
    ),
];

fn shadow(body: &str, is_ts_file: bool) -> String {
    let src = format!("<script lang=\"ts\">\n{body}\n</script>\n<p>{{1}}</p>");
    svelte2tsx(
        &src,
        Svelte2TsxOptions {
            filename: "x.svelte".to_string(),
            is_ts_file,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code
}

#[test]
fn every_cell_is_copied_verbatim_in_both_modes() {
    for is_ts_file in [true, false] {
        for (name, body, expected) in CELLS {
            let code = shadow(body, is_ts_file);
            assert!(
                code.lines().any(|l| l.trim() == *expected),
                "{name} (is_ts_file={is_ts_file}): expected a line `{expected}`\n{code}"
            );
        }
    }
}

/// A shadow that dropped the declaration entirely would satisfy an
/// "inserts no comma" assertion, so pin the count instead of the absence: the
/// shadow must carry exactly as many `,>` sequences as the source body did.
#[test]
fn no_cell_gains_a_disambiguating_comma() {
    for is_ts_file in [true, false] {
        for (name, body, _) in CELLS {
            let code = shadow(body, is_ts_file);
            let in_source = body.matches(",>").count();
            let in_shadow = code.matches(",>").count();
            assert_eq!(
                in_shadow, in_source,
                "{name} (is_ts_file={is_ts_file}): `,>` count moved\n{code}"
            );
        }
    }
}
