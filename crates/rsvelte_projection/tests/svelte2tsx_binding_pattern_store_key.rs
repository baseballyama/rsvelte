//! A `$`-prefixed KEY of a binding pattern is a store reference for upstream
//! everywhere except the pattern's first element.
//!
//! `processInstanceScriptContent.ts:284-296` tracks "am I inside a declaration"
//! with a single boolean whose reset is pushed when the FIRST element of a
//! pattern is left, so every element after it is walked as an expression and
//! its key resolves as a store. rsvelte skipped every object-property key, so
//! `let { a, $permissions: permissions } = o` emitted no
//! `__sveltets_2_store_get(permissions)` line at all.
//!
//! The rows below are the axis that separates the two readings — an element's
//! index within its own pattern, crossed with the pattern's host — and every
//! expectation is the official tool's own output on the same source with
//! `{isTsFile: true, mode: 'ts', namespace: 'html', version: '5'}`, the options
//! `svelte2tsx-compile.mjs` uses. Upstream's behaviour is reported in
//! `upstream_issues/svelte2tsx-isdeclaration-is-a-boolean-not-a-stack.md`;
//! byte equality is the goal, so rsvelte reproduces it.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// The store names `__sveltets_2_store_get(...)` is called with, sorted.
fn store_gets(src: &str) -> Vec<String> {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    let mut found: Vec<String> = code
        .match_indices("__sveltets_2_store_get(")
        .map(|(at, needle)| {
            let rest = &code[at + needle.len()..];
            let end = rest.find(')').unwrap_or(rest.len());
            rest[..end].to_string()
        })
        .collect();
    found.sort();
    found
}

#[test]
fn a_binding_pattern_key_is_a_store_everywhere_but_the_first_element() {
    let mut failures = Vec::new();
    for (name, src, expected) in [
        (
            "only element",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet { $permissions: permissions } = o;\n</script>\n<p>{permissions}</p>",
            &[][..],
        ),
        (
            "second element",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet { a, $permissions: permissions } = o;\n</script>\n<p>{permissions}</p>",
            &["permissions"][..],
        ),
        (
            "third element",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet { a, b, $permissions: permissions } = o;\n</script>\n<p>{permissions}</p>",
            &["permissions"][..],
        ),
        (
            "only element of a nested pattern",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet { x: { $permissions: permissions } } = o;\n</script>\n<p>{permissions}</p>",
            &[][..],
        ),
        (
            "nested pattern is the second element",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet { a, x: { $permissions: permissions } } = o;\n</script>\n<p>{permissions}</p>",
            &[][..],
        ),
        (
            "second element of a nested pattern",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet { x: { a, $permissions: permissions } } = o;\n</script>\n<p>{permissions}</p>",
            &["permissions"][..],
        ),
        (
            "inside an array pattern",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet [a, { $permissions: permissions }] = [o, o];\n</script>\n<p>{permissions}</p>",
            &[][..],
        ),
        (
            "only element, second statement",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet z = 1;\n\tlet { $permissions: permissions } = o;\n</script>\n<p>{permissions}</p>",
            &[][..],
        ),
        (
            "second element of a parameter pattern",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tfunction f({ a, $permissions: permissions }: any) { return permissions; }\n\tlet permissions = f(o);\n</script>\n<p>{permissions}</p>",
            &["permissions"][..],
        ),
        (
            "after an element with a default",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet { a = 1, $permissions: permissions } = o;\n</script>\n<p>{permissions}</p>",
            &["permissions"][..],
        ),
        (
            "two keys after a plain first",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet { a, $p: p, $q: q } = o;\n</script>\n<p>{p}{q}</p>",
            &["p", "q"][..],
        ),
        (
            "two keys, the first is a key",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet { $p: p, $q: q } = o;\n</script>\n<p>{p}{q}</p>",
            &["q"][..],
        ),
        (
            "assignment destructuring, second element",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet p: any, a: any;\n\t({ a, $p: p } = o);\n</script>\n<p>{p}</p>",
            &[][..],
        ),
        (
            "assignment destructuring, only element",
            "<script lang=\"ts\">\n\tlet o: any = {};\n\tlet p: any;\n\t({ $p: p } = o);\n</script>\n<p>{p}</p>",
            &[][..],
        ),
    ] {
        let actual = store_gets(src);
        if actual != expected {
            failures.push(format!("{name}: expected {expected:?}, got {actual:?}"));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
