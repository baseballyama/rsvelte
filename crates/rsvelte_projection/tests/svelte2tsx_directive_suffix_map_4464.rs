//! Upstream's `Transition.ts` / `Animation.ts` build the generated statement
//! with `transform()`, which MOVES the directive's own name and its parameter
//! expression, so official's map carries a segment for every byte of both runs.
//! rsvelte synthesized the whole statement with `format!`, and the map then
//! answered the element's start for every generated column of the line — every
//! position inside a `transition:` / `in:` / `out:` / `animate:` attribute
//! resolved to the `<` (#4464).
//!
//! The control is the plain attribute on the same element: it was mapped
//! per character before this fix and must stay that way, which is what
//! separates "the map improved here" from "the harness reports everything".

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};
use std::collections::HashSet;

const SOURCE: &str = r#"<script lang="ts">
  function myFade(node: Element, params: { duration: number }) { return { duration: params.duration }; }
  function flipper(node: Element, rect: DOMRect) { return { duration: 1 }; }
  const cls = "a";
</script>

<div class={cls} transition:myFade={{ duration: 1 }} animate:flipper></div>
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
fn a_directive_name_and_its_parameters_carry_a_mapping() {
    let (_, mapped) = project(SOURCE);
    let (line, text) = template_line(SOURCE);

    for run in ["myFade", "flipper", "{ duration: 1 }", "cls"] {
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
    assert!(
        code.contains(
            "__sveltets_2_ensureTransition(myFade(svelteHTML.mapElementTag('div'),({ duration: 1 })));"
        ),
        "{code}"
    );
    assert!(
        code.contains(
            "__sveltets_2_ensureAnimation(flipper(svelteHTML.mapElementTag('div'),__sveltets_2_AnimationMove));"
        ),
        "{code}"
    );
}

#[test]
fn a_directive_on_a_component_keeps_its_ranges_too() {
    let source = r#"<script lang="ts">
  import Comp from './Comp.svelte';
  function myFade(node: Element, params: { duration: number }) { return { duration: params.duration }; }
</script>

<Comp transition:myFade={{ duration: 1 }} />
"#;
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
    let mapped: HashSet<(u32, u32)> = map
        .tokens()
        .map(|token| (token.get_src_line(), token.get_src_col()))
        .collect();
    let index = source
        .lines()
        .position(|line| line.starts_with("<Comp "))
        .expect("template line");
    let line = u32::try_from(index).expect("line fits");
    let text = source.lines().nth(index).expect("template line");
    let start = u32::try_from(text.find("myFade").expect("run")).expect("column fits");
    for column in start..start + 6 {
        assert!(
            mapped.contains(&(line, column)),
            "source {line}:{column} is not in the map\n{}",
            result.code
        );
    }
}
