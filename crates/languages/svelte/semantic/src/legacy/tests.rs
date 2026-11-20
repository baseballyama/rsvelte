use rsvelte_svelte_syntax::parse::parse;

use crate::compiler_syntax_tree::lower;
use crate::resolve::resolve;

/// [`super::legacy_syntax`] of `source`, in runes mode when `runes`.
fn legacy_syntax(source: &str, runes: bool) -> Option<&'static str> {
    let component = parse(source).expect("parses");
    let lowered = lower(&component, source);
    let instance = component.instance.as_ref().map(|s| s.program);
    let module = component.module.as_ref().map(|s| s.program);
    let res = resolve(&component.javascript, instance, module, &lowered);
    super::legacy_syntax(&component, &res, source, runes)
}

#[test]
fn legacy_mode_syntax_that_runes_mode_rejects_makes_a_legacy_component() {
    for (source, syntax) in [
        ("<script>export let a;</script>", "export let"),
        ("<script>export var a = 1;</script>", "export let"),
        ("<script>let a = 1; $: b = a;</script>{b}", "$:"),
        ("<p {...$$props}></p>", "$$props"),
        ("<p {...$$restProps}></p>", "$$restProps"),
        (
            "<script lang=\"ts\">declare let $$props: any;</script><p>{$$props.a}</p>",
            "$$props",
        ),
        (
            "<svelte:options runes={false} />",
            "<svelte:options runes={false}>",
        ),
    ] {
        assert_eq!(legacy_syntax(source, false), Some(syntax), "{source}");
        assert_eq!(legacy_syntax(source, true), None, "{source}");
    }
}

#[test]
fn a_component_without_legacy_only_syntax_is_not_legacy() {
    for source in [
        "<p>plain</p>",
        "<script>export const a = 1; let b = 0;</script><button on:click={() => b++}>{b}</button>",
        "<script module>export let a = 1;</script>",
        "<slot />",
    ] {
        assert_eq!(legacy_syntax(source, false), None, "{source}");
    }
}
