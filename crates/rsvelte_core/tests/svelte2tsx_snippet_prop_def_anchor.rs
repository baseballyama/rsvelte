//! Regression test for issue #796.
//!
//! A named `{#snippet}` passed as a direct child of a component must be wired
//! as an implicit prop AND anchored via the instance's `$$prop_def`
//! (`const $$_inst = new C({ props: { name:(args) => … } }); const {name} =
//! $$_inst.$$prop_def;`). The `$$prop_def` destructuring is what lets
//! TypeScript infer the snippet's parameters from the prop's `Snippet<[Args]>`
//! type when the component's type comes from a *value* rather than an imported
//! `.svelte` module — e.g. Storybook CSF's `const { Story } = defineMeta(…)`.
//! Without it, `{#snippet template(args)}` inside `<Story>` left `args` as
//! implicit `any` under `--tsgo`. This mirrors official svelte2tsx, which the
//! issue confirms reports 0 errors.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn overlay(src: &str, filename: &str) -> String {
    svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: filename.into(),
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

const STORY: &str = "<script module lang=\"ts\">\n\
    import { defineMeta } from '@storybook/addon-svelte-csf';\n\
    import B from './B.svelte';\n\
    const { Story } = defineMeta({ title: 'X/B', component: B, args: { label: 'x' } });\n\
    </script>\n\
    <Story name=\"Default\">\n\
    {#snippet template(args)}\n\
    <B {...args} />\n\
    {/snippet}\n\
    </Story>";

#[test]
fn storybook_story_template_snippet_is_prop_def_anchored() {
    let code = overlay(STORY, "B.stories.svelte");
    // Snippet wired as an implicit prop on the Story instance.
    assert!(
        code.contains("template:(args) =>"),
        "snippet not wired into props:\n{code}"
    );
    // Instance assigned to a const so it can be destructured below.
    assert!(
        code.contains("const $$_yrotS0 = new $$_yrotS0C("),
        "component instance not assigned to a const:\n{code}"
    );
    // The $$prop_def anchor — what gives `args` its `Snippet<[Args]>` type.
    assert!(
        code.contains("const {template} = $$_yrotS0.$$prop_def;"),
        "snippet not anchored via $$prop_def:\n{code}"
    );
    assert!(braces_balanced(&code), "unbalanced overlay:\n{code}");
}

#[test]
fn multiple_story_snippets_are_all_anchored() {
    let src = "<script lang=\"ts\">import List from './List.svelte';</script>\n\
        <List>\n\
        {#snippet a()}<p>A</p>{/snippet}\n\
        {#snippet b(x)}<p>{x}</p>{/snippet}\n\
        </List>";
    let code = overlay(src, "T.svelte");
    assert!(
        code.contains(".$$prop_def;"),
        "snippets not anchored:\n{code}"
    );
    // Both snippet names appear in the single destructuring.
    let anchor = code
        .split(".$$prop_def;")
        .next()
        .and_then(|s| s.rfind("const {").map(|i| &s[i..]))
        .unwrap_or("");
    assert!(
        anchor.contains("a") && anchor.contains("b"),
        "both snippets not in $$prop_def destructuring: {anchor}\n{code}"
    );
    assert!(braces_balanced(&code), "unbalanced overlay:\n{code}");
}
