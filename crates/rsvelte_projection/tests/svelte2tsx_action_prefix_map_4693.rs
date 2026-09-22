//! A `use:` action's generated call is a PREFIX — it precedes
//! `svelteHTML.createElement(...)` while its attribute sits among the others —
//! so the source ranges it preserves run backwards against the ones that stay
//! in place. Upstream has no such constraint: `transform()` moves every
//! preserved chunk to the tag end. rsvelte keeps chunks in place, so the
//! action's are relocated with `move_range` instead (#4693).
//!
//! The control is `class={cls}` on the same element: it was mapped per
//! character before this fix and must stay that way, which is what separates
//! "the action gained its mapping" from "the relocation cost the neighbour
//! theirs".

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};
use std::collections::HashSet;

const SOURCE: &str = r#"<script lang="ts">
  function tip(node: Element, text: string) { return { destroy() {} }; }
  function log(node: Element) { return { destroy() {} }; }
  const cls = "a";
</script>

<div class={cls} use:tip={"hi"} use:log></div>
"#;

fn project(source: &str) -> (String, HashSet<(u32, u32)>) {
    let result = svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "A.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx");
    let map = sourcemap::SourceMap::from_slice(result.map.as_deref().expect("map").as_bytes())
        .expect("valid source map");
    (
        result.code,
        map.tokens()
            .map(|token| (token.get_src_line(), token.get_src_col()))
            .collect(),
    )
}

fn template_line(source: &str) -> (u32, &str) {
    let index = source
        .lines()
        .position(|line| line.starts_with("<div "))
        .expect("template line");
    (
        u32::try_from(index).expect("line fits"),
        source.lines().nth(index).expect("template line"),
    )
}

#[test]
fn an_action_name_and_its_parameters_carry_a_mapping() {
    let (_, mapped) = project(SOURCE);
    let (line, text) = template_line(SOURCE);

    for run in ["tip", "\"hi\"", "log", "cls"] {
        let start = u32::try_from(text.find(run).expect("run")).expect("column fits");
        for column in start..start + u32::try_from(run.len()).expect("length fits") {
            assert!(
                mapped.contains(&(line, column)),
                "{run}: source {line}:{column} is not in the map",
            );
        }
    }
}

#[test]
fn the_generated_text_is_unchanged() {
    let (code, _) = project(SOURCE);
    for statement in [
        "const $$action_0 = __sveltets_2_ensureAction(tip(svelteHTML.mapElementTag('div'),(\"hi\")));",
        "const $$action_1 = __sveltets_2_ensureAction(log(svelteHTML.mapElementTag('div')));",
        "svelteHTML.createElement(\"div\", __sveltets_2_union($$action_0,$$action_1), {",
    ] {
        assert!(code.contains(statement), "{statement}\n{code}");
    }
}

/// An action on an element whose attributes all come AFTER it: the relocation
/// has to leave those in place too, and the order of the moved chunks is the
/// order the declarations are written in.
#[test]
fn an_action_before_the_other_attributes_keeps_both_sides() {
    const FIRST: &str = r#"<script lang="ts">
  function tip(node: Element, text: string) { return { destroy() {} }; }
  const cls = "a";
</script>

<div use:tip={"hi"} class={cls}></div>
"#;
    let (code, mapped) = project(FIRST);
    let (line, text) = template_line(FIRST);
    for run in ["tip", "\"hi\"", "cls"] {
        let start = u32::try_from(text.find(run).expect("run")).expect("column fits");
        for column in start..start + u32::try_from(run.len()).expect("length fits") {
            assert!(
                mapped.contains(&(line, column)),
                "{run}: source {line}:{column} is not in the map\n{code}",
            );
        }
    }
}
