//! Upstream's `should_proxy` answers `false` for `undefined` in the **same
//! clause** as the literal types (`client/utils.js:133-145`), and resolves a
//! bare identifier by recursing on `binding.initial` — so a prop whose
//! destructure default is `undefined` is not proxied when it is written into a
//! `$state`.
//!
//! rsvelte ports that node-type list twice. `should_proxy_node_type` carries
//! the `undefined` arm; `is_non_proxy_node_type` was its negation **without**
//! it, and two of that function's four call sites had bolted the arm back on at
//! the call site while the other two had not. The name is now a parameter, so
//! the decision cannot be spelled without answering it.
//!
//! Every expected value below was taken from the official compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`), not inferred
//! from rsvelte's own output. Both directions are present, and the test
//! asserts that they are rather than restating their sizes, because a
//! predicate that is wrong in one direction is passed by a population that
//! only carries the other.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// Whether the `$.set(s, …)` emitted for `s = <expr>` carries the third
/// (proxy) argument. Read off the whole call rather than a line: both
/// compilers break the call across lines when the value is multi-line.
fn write_is_proxied(declaration: &str, write: &str, dev: bool) -> bool {
    let src = format!(
        "<script>\n\t{declaration}\n\tlet s = $state(0);\n\texport function go() {{ {write} }}\n</script>\n{{s}}\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let at = js
        .find("$.set(s,")
        .unwrap_or_else(|| panic!("no `$.set(s,` for `{declaration}` / `{write}` in:\n{js}"));
    let mut depth = 0usize;
    let mut commas = 0usize;
    for (i, b) in js.as_bytes()[at + "$.set(".len() - 1..].iter().enumerate() {
        match b {
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    let _ = i;
                    break;
                }
            }
            b',' if depth == 1 => commas += 1,
            _ => {}
        }
    }
    commas >= 2
}

/// `(declaration, write, official proxies the value)`.
const CELLS: &[(&str, &str, bool)] = &[
    ("let { a = undefined } = $props();", "s = a;", false),
    ("let { a = 1 } = $props();", "s = a;", false),
    ("let { a = {} } = $props();", "s = a;", true),
    ("let { a = () => 1 } = $props();", "s = a;", false),
    ("let { a } = $props();", "s = a;", true),
    (
        "let { a = $bindable(undefined) } = $props();",
        "s = a;",
        false,
    ),
    ("let { a = $bindable({}) } = $props();", "s = a;", true),
    ("let a = undefined;", "s = a;", false),
    ("let a = 1;", "s = a;", false),
    ("let a = {};", "s = a;", true),
    ("", "s = undefined;", false),
];

#[test]
fn an_undefined_initial_is_not_proxied_and_an_object_one_is() {
    for &(declaration, write, expected) in CELLS {
        for dev in [false, true] {
            assert_eq!(
                write_is_proxied(declaration, write, dev),
                expected,
                "`{declaration}` then `{write}` (dev={dev})"
            );
        }
    }
    // The table is only a test while it contains both answers: a predicate that
    // never proxies passes every `false` row, and one that always proxies passes
    // every `true` row. Asserted against the table rather than against a written
    // count, which would be a second claim nobody re-derives.
    assert!(CELLS.iter().any(|c| c.2), "no cell expects a proxy");
    assert!(CELLS.iter().any(|c| !c.2), "no cell expects no proxy");
}
