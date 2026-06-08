//! Regression test for issue #780.
//!
//! A named snippet passed as a direct child of a component
//! (`<List>{#snippet row(..)}…{/snippet}</List>`) must be wired into the
//! component's props so a required `Snippet` prop is satisfied. Previously the
//! snippet was emitted as a standalone `const row = …` *inside* the component
//! block while the props object stayed empty, so TypeScript reported a false
//! `Property 'row' is missing in type '{}' but required in type
//! '$$ComponentProps'`. The fix adds a `row` shorthand prop and relocates the
//! snippet declaration to before the component block (so the reference is in
//! scope), mirroring upstream's implicit-snippet-prop behaviour. Verified
//! end-to-end with tsc: the false "missing prop" error is gone (0 errors,
//! matching official svelte-check).

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "Use.svelte".into(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code
}

fn braces_balanced(s: &str) -> bool {
    let mut depth: i32 = 0;
    let mut in_str: Option<char> = None;
    let mut prev = '\0';
    for c in s.chars() {
        match in_str {
            Some(q) => {
                if c == q && prev != '\\' {
                    in_str = None;
                }
            }
            None => match c {
                '"' | '\'' | '`' => in_str = Some(c),
                '{' => depth += 1,
                '}' => depth -= 1,
                _ => {}
            },
        }
        if depth < 0 {
            return false;
        }
        prev = c;
    }
    depth == 0
}

/// The opener line carrying `new $$_…({ … props: { … } })`.
fn opener(out: &str) -> String {
    out.lines()
        .find(|l| l.contains("ensureComponent"))
        .unwrap_or("")
        .to_string()
}

#[test]
fn named_snippet_child_becomes_prop() {
    let src = "<script lang=\"ts\">\n  import List from './List.svelte';\n</script>\n\
               <List>\n  {#snippet row({ id })}<p>{id}</p>{/snippet}\n</List>";
    let out = to_tsx(src);
    assert!(braces_balanced(&out), "unbalanced overlay:\n{out}");
    let op = opener(&out);
    // `row` is wired into the props object …
    assert!(
        op.contains("props: { row,"),
        "snippet prop not wired:\n{op}"
    );
    // … and the snippet declaration is hoisted before the component block.
    let const_pos = out.find("const row").expect("snippet const");
    let block_pos = out
        .find("__sveltets_2_ensureComponent(List)")
        .expect("block");
    assert!(
        const_pos < block_pos,
        "snippet const must precede the component block:\n{out}"
    );
}

#[test]
fn multiple_named_snippets_all_wired() {
    let src = "<script lang=\"ts\">import L from './L.svelte';</script>\n\
               <L>{#snippet a()}<p>x</p>{/snippet}{#snippet b(n)}<p>{n}</p>{/snippet}</L>";
    let out = to_tsx(src);
    assert!(braces_balanced(&out), "unbalanced overlay:\n{out}");
    let op = opener(&out);
    assert!(
        op.contains("props: { a,b,"),
        "both snippets not wired:\n{op}"
    );
}

#[test]
fn snippet_prop_alongside_attribute() {
    let src = "<script lang=\"ts\">import L from './L.svelte';let v=1;</script>\n\
               <L x={v}>{#snippet a()}<p>x</p>{/snippet}</L>";
    let out = to_tsx(src);
    assert!(braces_balanced(&out), "unbalanced overlay:\n{out}");
    let op = opener(&out);
    assert!(op.contains("\"x\":v,"), "attribute prop lost:\n{op}");
    assert!(op.contains("a,}"), "snippet prop not appended:\n{op}");
}

#[test]
fn snippet_prop_alongside_real_children() {
    // Non-snippet content keeps the `children` prop; the snippet is appended.
    let src = "<script lang=\"ts\">import L from './L.svelte';</script>\n\
               <L>hello{#snippet a()}<p>x</p>{/snippet}</L>";
    let out = to_tsx(src);
    assert!(braces_balanced(&out), "unbalanced overlay:\n{out}");
    let op = opener(&out);
    assert!(op.contains("children:"), "children prop lost:\n{op}");
    assert!(op.contains(",a,}"), "snippet prop not appended:\n{op}");
}

#[test]
fn self_closing_component_unchanged() {
    // No snippet children → no snippet props, behaviour untouched.
    let src = "<script lang=\"ts\">import L from './L.svelte';</script>\n<L/>";
    let out = to_tsx(src);
    assert!(braces_balanced(&out), "unbalanced overlay:\n{out}");
    assert!(
        !out.contains("const a"),
        "unexpected snippet emission:\n{out}"
    );
}
