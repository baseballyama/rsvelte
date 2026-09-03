//! `shared/assignments.js:20-22` decides whether a destructuring assignment's
//! right-hand side is cached in `$$value` with `value.type !== 'Identifier'`,
//! where `value` is the **visited** node — so a binding whose read is rewritten
//! is cached and a plain local is not. rsvelte answered that from a list of
//! props eligible as assignment TARGETS, which in runes mode excludes a prop
//! that is never written; such a prop reads as `$$props.data`, a member
//! expression, and upstream caches it.
//!
//! Every expected string was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The body of `go()`, whitespace-collapsed.
fn go_body(declaration: &str) -> String {
    let src = format!(
        "<script>\n\t{declaration}\n\tlet g = $state([]);\n\texport function go() {{ ({{ g }} = data); }}\n</script>\n<p>{{g}}</p>\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let start = js.find("function go(").expect("go()");
    let end = js[start..].find("\n\t}").expect("end of go()") + start + 3;
    js[start..end]
        .lines()
        .map(str::trim)
        .collect::<Vec<_>>()
        .join(" ")
}

/// `(name, declaration of `data`, official's body)`.
const CELLS: &[(&str, &str, &str)] = &[
    (
        // Reads as `$$props.data` — a member expression, so cached.
        "a runes prop that is never written",
        "let { data } = $props();",
        "function go() { (($$value) => { $.set(g, $$value.g, true); })($$props.data); }",
    ),
    (
        // Reads as `data()`; this shape was already right, because a prop with
        // a default is an assignment target too.
        "a runes prop with a default",
        "let { data = {} } = $props();",
        "function go() { (($$value) => { $.set(g, $$value.g, true); })(data()); }",
    ),
    (
        "a `$bindable()` prop that is never written",
        "let { data = $bindable() } = $props();",
        "function go() { (($$value) => { $.set(g, $$value.g, true); })($$props.data); }",
    ),
    (
        // A `$state` read is a bare identifier when the source is never
        // reassigned, so upstream does NOT cache — the control that fails if
        // the rule becomes "cache whenever the binding is reactive".
        "a `$state` object",
        "let data = $state({});",
        "function go() { ($.set(g, data.g, true)); }",
    ),
    (
        "a `$derived`",
        "let src = $state({});\n\tlet data = $derived(src);",
        "function go() { (($$value) => { $.set(g, $$value.g, true); })($.get(data)); }",
    ),
    (
        "a plain local `const`",
        "const data = { g: 1 };",
        "function go() { ($.set(g, data.g, true)); }",
    ),
    (
        "a module-level import",
        "import { data } from './d.js';",
        "function go() { ($.set(g, data.g, true)); }",
    ),
];

#[test]
fn a_destructures_right_hand_side_is_cached_from_its_visited_read() {
    // Both forms occur, so a rule that always caches — or never does — fails
    // one half.
    assert!(CELLS.iter().any(|(_, _, b)| b.contains("$$value")));
    assert!(CELLS.iter().any(|(_, _, b)| !b.contains("$$value")));

    for (name, declaration, want) in CELLS {
        assert_eq!(go_body(declaration), *want, "cell `{name}`");
    }
}
