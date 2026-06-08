//! Regression test for issue #780.
//!
//! A named `{#snippet}` block that is a direct child of a component
//! (`<Comp>{#snippet row(..)}…{/snippet}</Comp>`) must be lowered as an
//! *implicit prop* inside the component's `props: { … }` object literal, not as
//! a standalone `const row = …` emitted after the instantiation. Otherwise the
//! component is constructed with empty props and TypeScript reports
//! `Property 'row' is missing in type '{}' but required in type '$$ComponentProps'`.
//! Placing the snippet inside the props literal both satisfies the required
//! snippet prop and lets TypeScript contextually type the snippet's parameters
//! from the prop's `Snippet<[T]>` type.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn overlay(src: &str) -> String {
    svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".into(),
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

const USE: &str = "<script lang=\"ts\">\n\
                   import List from './List.svelte';\n\
                   </script>\n\
                   <List>\n\
                   {#snippet row({ id })}<p>{id}</p>{/snippet}\n\
                   </List>";

#[test]
fn named_snippet_is_emitted_inside_component_props() {
    let code = overlay(USE);
    // The snippet's arrow function must appear inside the props object literal as
    // a `row:` property, directly assigned so its `{ id }` parameter is
    // contextually typed from the prop's `Snippet<[…]>` type.
    assert!(
        code.contains("props: {row:({ id }) =>"),
        "snippet not wired into props object:\n{code}"
    );
}

#[test]
fn named_snippet_not_emitted_as_standalone_const() {
    let code = overlay(USE);
    assert!(
        !code.contains("const row"),
        "snippet should not be a standalone `const row`:\n{code}"
    );
}

#[test]
fn snippet_prop_overlay_is_brace_balanced() {
    let code = overlay(USE);
    assert!(braces_balanced(&code), "unbalanced overlay:\n{code}");
}

#[test]
fn snippet_prop_keeps_ensurecomponent_instantiation() {
    let code = overlay(USE);
    assert!(
        code.contains("__sveltets_2_ensureComponent(List)"),
        "component instantiation missing:\n{code}"
    );
    // props object must be closed right after the relocated snippet.
    assert!(
        code.contains("};return __sveltets_2_any(0)},}});"),
        "props object not closed after snippet:\n{code}"
    );
}

#[test]
fn multiple_named_snippets_preserve_order() {
    let src = "<script lang=\"ts\">import List from './List.svelte';</script>\n\
               <List>\n\
               {#snippet a()}<p>A</p>{/snippet}\n\
               {#snippet b()}<p>B</p>{/snippet}\n\
               </List>";
    let code = overlay(src);
    assert!(braces_balanced(&code), "unbalanced overlay:\n{code}");
    let ai = code.find("a:() =>").expect("snippet a missing");
    let bi = code.find("b:() =>").expect("snippet b missing");
    assert!(ai < bi, "snippet order not preserved:\n{code}");
}

#[test]
fn empty_body_snippet_prop_is_balanced() {
    let src = "<script lang=\"ts\">import List from './List.svelte';</script>\n\
               <List>{#snippet row()}{/snippet}</List>";
    let code = overlay(src);
    assert!(braces_balanced(&code), "unbalanced overlay:\n{code}");
    assert!(
        code.contains("props: {row:() =>"),
        "empty-body snippet not wired into props:\n{code}"
    );
}

#[test]
fn standalone_snippet_still_const() {
    // Guard: a snippet that is NOT a component child stays a standalone const.
    let src = "<script lang=\"ts\"></script>\n\
               {#snippet row()}<p>x</p>{/snippet}";
    let code = overlay(src);
    assert!(
        code.contains("const row"),
        "standalone snippet should remain a const:\n{code}"
    );
}
