//! `state_referenced_locally` for template declaration tags (`{let}` / `{const}`)
//! and for `$state(identifier)`, whose `should_proxy` resolves the identifier
//! through its binding's own initializer.
//!
//! Every expectation is `(start, end, first message line)` as the official
//! compiler (`submodules/svelte`, `compile`) reports it for the same source.

use rsvelte_core::compiler::CompileOptions;
use rsvelte_core::{GenerateMode, compile};

type Expected = &'static [(usize, usize, &'static str)];

#[rustfmt::skip]
const CELLS: &[(&str, Expected)] = &[
    (
        "<script>\n\tlet s = $state(0);\n\tlet { p, q = 1 } = $props();\n</script>\n<div>{const y = s + p + q}<p>{y}</p></div>",
        &[],
    ),
    (
        "<script>\n\tlet s = $state(0);\n\tlet { p, q = 1 } = $props();\n</script>\n{let a = $state(0), b = a, c = $state(a), d = $state([a])}{b}{c}{d}",
        &[(93, 94, "This reference only captures the initial value of `a`. Did you mean to reference it inside a closure instead?"), (107, 108, "This reference only captures the initial value of `a`. Did you mean to reference it inside a closure instead?"), (123, 124, "This reference only captures the initial value of `a`. Did you mean to reference it inside a derived instead?")],
    ),
    (
        "<script>\n\tlet s = $state(0);\n\tlet { p, q = 1 } = $props();\n</script>\n{let a = $state([1]), b = a}{b}",
        &[],
    ),
    (
        "<script>\n\tlet s = $state(0);\n\tlet { p, q = 1 } = $props();\n</script>\n{let a = $state(0), b = $derived(a), c = { a: 1 }, e = c.a}{b}{e}",
        &[],
    ),
    (
        "<script>\n\tlet s = $state(0);\n\tlet { p, q = 1 } = $props();\n</script>\n{let a = $state(0)}{const b = a}{#if s}{const c = a}{c}{/if}{b}",
        &[(99, 100, "This reference only captures the initial value of `a`. Did you mean to reference it inside a closure instead?")],
    ),
    (
        "<script>\n\tlet s = $state(0);\n\tlet { p, q = 1 } = $props();\n</script>\n{let f = e, e = $state.raw(0)}{f}",
        &[],
    ),
    (
        "<script>\n\tlet s = $state(0);\n\tlet { p, q = 1 } = $props();\n</script>\n{const f = e}{let e = $derived(s)}{f}",
        &[],
    ),
    (
        "<script>\n\tlet s = $state(0);\n\tlet { p, q = 1 } = $props();\n</script>\n{let meta = $state.raw(0)}{const y = import.meta}{y}{meta}",
        &[],
    ),
    (
        "<script>\n\tlet s = $state(0);\n\tlet { p, q = 1 } = $props();\n</script>\n{let a = $state(q), b = a}{b}",
        &[(93, 94, "This reference only captures the initial value of `a`. Did you mean to reference it inside a closure instead?")],
    ),
    (
        "<script>\n\tlet { q = 1 } = $props();\n\tlet a = $state(q);\n\tconsole.log(a);\n</script>",
        &[(52, 53, "This reference only captures the initial value of `q`. Did you mean to reference it inside a closure instead?"), (69, 70, "This reference only captures the initial value of `a`. Did you mean to reference it inside a closure instead?")],
    ),
    (
        "<script>\n\tlet { q = {} } = $props();\n\tlet a = $state(q);\n\tconsole.log(a);\n</script>",
        &[(53, 54, "This reference only captures the initial value of `q`. Did you mean to reference it inside a closure instead?")],
    ),
    (
        "<script>\n\tlet { q = $bindable(5) } = $props();\n\tlet a = $state(q);\n\tconsole.log(a);\n</script>",
        &[(80, 81, "This reference only captures the initial value of `a`. Did you mean to reference it inside a closure instead?")],
    ),
    (
        "<script>\n\tlet { q } = $props();\n\tlet a = $state(q);\n\tconsole.log(a);\n</script>",
        &[(48, 49, "This reference only captures the initial value of `q`. Did you mean to reference it inside a closure instead?")],
    ),
];

#[test]
fn matches_the_official_compiler() {
    let mut wrong = Vec::new();
    for (source, expected) in CELLS {
        let actual: Vec<(usize, usize, String)> = compile(
            source,
            CompileOptions {
                filename: Some("X.svelte".to_string()),
                generate: GenerateMode::Client,
                ..Default::default()
            },
        )
        .expect("compile")
        .warnings
        .iter()
        .filter(|w| w.code == "state_referenced_locally")
        .map(|w| {
            (
                w.start.as_ref().map_or(0, |p| p.character),
                w.end.as_ref().map_or(0, |p| p.character),
                w.message.lines().next().unwrap_or_default().to_string(),
            )
        })
        .collect();
        let expected: Vec<(usize, usize, String)> = expected
            .iter()
            .map(|(s, e, m)| (*s, *e, m.to_string()))
            .collect();
        if actual != expected {
            wrong.push(format!(
                "{source}\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}
