//! A prop default is emitted as a value (`$.prop($$props, 'type', 3, 'button')`)
//! when upstream's `is_simple_expression` accepts it and as a lazy thunk
//! (`19, () => …`) otherwise. rsvelte answers that from the default's TEXT, and
//! its call test — "ends in `)` and something precedes the matching `(`" — read
//! a leading JSDoc comment as the callee, so
//! `/** @type {"a"} */ ('button')` became `19, (/** @type {"a"} */) => 'button'`.
//!
//! Neither axis reproduces it alone: the comment without parentheses is EQ
//! because the text does not end in `)`, and the parentheses without a comment
//! are EQ because nothing precedes the matching `(`. Only the product diverges,
//! so the cells below cross them rather than listing the shape that broke.
//!
//! Every expected string was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The `$.prop(...)` line for a single destructured prop with a default.
fn prop_line(initializer: &str) -> String {
    let src = format!(
        "<script>\n\tlet {{ type = {initializer} }} = $props();\n</script>\n<button {{type}}>x</button>\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let line = js
        .lines()
        .map(str::trim)
        .find(|l| l.contains("$.prop($$props,"))
        .unwrap_or_else(|| panic!("no `$.prop` line for `{initializer}` in:\n{js}"));
    // From the call, not the whole statement: the declaration keyword and name
    // are the same in every cell and only lengthen the failure message.
    line[line.find("$.prop($$props,").expect("call")..].to_string()
}

/// `(name, initializer, official's `$.prop` line)`.
const CELLS: &[(&str, &str, &str)] = &[
    (
        "bare literal",
        "'button'",
        "$.prop($$props, 'type', 3, 'button');",
    ),
    (
        "parenthesised literal",
        "('button')",
        "$.prop($$props, 'type', 3, 'button');",
    ),
    (
        "comment then literal",
        "/** @type {\"a\"} */ 'button'",
        "$.prop($$props, 'type', 3, /** @type {\"a\"} */ 'button');",
    ),
    (
        // The product of the two cells above — the only one that diverged.
        "comment then parenthesised literal",
        "/** @type {\"a\"} */ ('button')",
        "$.prop($$props, 'type', 3, /** @type {\"a\"} */ 'button');",
    ),
    (
        "doubly parenthesised literal",
        "(('button'))",
        "$.prop($$props, 'type', 3, 'button');",
    ),
    (
        "comment then parenthesised number",
        "/** @type {number} */ (1)",
        "$.prop($$props, 'type', 3, /** @type {number} */ 1);",
    ),
    (
        // The negative half: an object default IS lazy on both sides, so a fix
        // that stopped thunking altogether fails here.
        "parenthesised object",
        "({ a: 1 })",
        "$.prop($$props, 'type', 19, () => ({ a: 1 }));",
    ),
    (
        // Where the default really is lazy, official puts the comment in the
        // arrow's PARAMETER list — the same shape rsvelte produced for the
        // broken cell above, which is why the fix has to change which branch is
        // taken and not how the comment is printed.
        "comment then parenthesised object",
        "/** @type {{a: number}} */ ({ a: 1 })",
        "$.prop($$props, 'type', 19, (/** @type {{a: number}} */) => ({ a: 1 }));",
    ),
];

#[test]
fn a_leading_comment_does_not_make_a_parenthesised_default_a_call() {
    // Both directions present: a rule that made everything eager, or everything
    // lazy, satisfies neither half.
    assert!(
        CELLS.iter().any(|(_, _, want)| want.contains("', 3, ")),
        "no cell expects an eager default"
    );
    assert!(
        CELLS.iter().any(|(_, _, want)| want.contains("', 19, ")),
        "no cell expects a lazy default"
    );

    for (name, initializer, want) in CELLS {
        assert_eq!(prop_line(initializer), *want, "cell `{name}`");
    }
}

/// The `$.prop` call for the prop named `type`, in a declaration that may hold
/// others before it.
fn typed_prop_line(decl: &str) -> String {
    let src = format!(
        "<script>\n\tlet {{ {decl} }} = $props();\n</script>\n<button {{type}}>x</button>\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(str::trim)
        .find(|l| l.contains("$.prop($$props, 'type'"))
        .unwrap_or_else(|| panic!("no `type` prop line for `{decl}` in:\n{js}"))
        .to_string()
}

/// The grid above holds the declaration at ONE prop, and that is the branch the
/// oracle's comment cursor keys on: with a prop before it, official moves the
/// annotation to the FIRST `$.prop`'s value and leaves `type` bare. The
/// eager/lazy digit — the only thing this fix decides — does not move with the
/// prop count, and that is what these cells pin; the placement divergence is
/// separate and `primo/…/ui/Button.svelte` is its carrier.
#[test]
fn the_eager_lazy_branch_does_not_depend_on_how_many_props_precede() {
    for decl in [
        "type = /** @type {\"a\"} */ ('button')",
        "a = '', type = /** @type {\"a\"} */ ('button')",
        "a = '', b = 0, type = /** @type {\"a\"} */ ('button')",
    ] {
        let line = typed_prop_line(decl);
        assert!(
            line.contains("'type', 3, "),
            "`{decl}` took the lazy branch: {line}"
        );
    }
    // The negative half, on the same host: an object default stays lazy however
    // many props precede it, so the assertion above is not satisfied by a
    // compiler that made every default eager.
    assert!(
        typed_prop_line("a = '', type = /** @type {{a: number}} */ ({ x: 1 })")
            .contains("'type', 19, "),
        "an object default did not stay lazy"
    );
}
