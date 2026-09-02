//! Upstream parenthesises the `__sveltets_2_invalidate` arrow body under a
//! three-way condition (`ImplicitTopLevelNames.ts:45-52`): an object literal, an
//! expression whose text starts with one, or an `as` expression. rsvelte answered
//! it with `rhs.starts_with('{')`, which covers the first two and cannot see the
//! third. Expectations are generated from official svelte2tsx.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn invalidate_call(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "C.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    const OPEN: &str = "__sveltets_2_invalidate(() => ";
    let start = code.find(OPEN).expect("no invalidate call");
    let end = code[start..].find(");").expect("no invalidate end") + start + 2;
    code[start..end].to_string()
}

const CASES: &[(&str, &str, &str)] = &[
    (
        "object literal",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = { a: 1 };\n</script>\n{w}",
        "__sveltets_2_invalidate(() => ({ a: 1 }));",
    ),
    (
        "object member",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = { a: 1 }.a;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => ({ a: 1 }.a));",
    ),
    (
        "object element access",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = { a: 1 }['a'];\n</script>\n{w}",
        "__sveltets_2_invalidate(() => ({ a: 1 }['a']));",
    ),
    (
        "object binary",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = { a: 1 }.a + 1;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => ({ a: 1 }.a + 1));",
    ),
    (
        "object conditional",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = { a: 1 }.a ? 1 : 2;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => ({ a: 1 }.a ? 1 : 2));",
    ),
    (
        "as expression",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = q as Record<string, any>;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => (q as Record<string, any>));",
    ),
    (
        "as any",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = q as any;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => (q as any));",
    ),
    (
        "object as any",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = { a: 1 } as any;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => ({ a: 1 } as any));",
    ),
    (
        "as chained",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = q as any as string;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => (q as any as string));",
    ),
    (
        "satisfies",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = q satisfies any;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => q satisfies any);",
    ),
    (
        "non-null",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = q!;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => q!);",
    ),
    (
        "identifier",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = q;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => q);",
    ),
    (
        "call",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = f(q);\n</script>\n{w}",
        "__sveltets_2_invalidate(() => f(q));",
    ),
    (
        "binary",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = q + 1;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => q + 1);",
    ),
    (
        "template",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = `${q}`;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => `${q}`);",
    ),
    (
        "array",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = [q];\n</script>\n{w}",
        "__sveltets_2_invalidate(() => [q]);",
    ),
    (
        "arrow",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = () => q;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => () => q);",
    ),
    (
        "conditional",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = q ? 1 : 2;\n</script>\n{w}",
        "__sveltets_2_invalidate(() => q ? 1 : 2);",
    ),
    (
        "parenthesized object",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = ({ a: 1 });\n</script>\n{w}",
        "__sveltets_2_invalidate(() => ({ a: 1 }));",
    ),
    (
        "iife",
        "<script lang=\"ts\">\n  let q: any;\n  function f(x: any) { return x; }\n  $: w = (() => { return 1 })();\n</script>\n{w}",
        "__sveltets_2_invalidate(() => (() => { return 1 })());",
    ),
];

#[test]
fn an_as_expression_is_parenthesised_inside_the_invalidate_arrow() {
    let mut failures = Vec::new();
    for (label, source, expected) in CASES {
        let actual = invalidate_call(source);
        if actual != *expected {
            failures.push(format!(
                "{label}\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of {} cells diverge from official:\n{}",
        failures.len(),
        CASES.len(),
        failures.join("\n")
    );
}
