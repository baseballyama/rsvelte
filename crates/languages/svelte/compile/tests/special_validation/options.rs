use rsvelte_svelte_compile::{CompileInput, Target, compile_input};
use rsvelte_svelte_semantic::{analyze, compiler_syntax_tree, resolve};

/// The code and span of the error that rejects `source`, or `None` when it compiles.
fn rejected(source: &str, target: Target) -> Option<(String, (u32, u32))> {
    let component = match rsvelte_svelte_syntax::parse::parse(source) {
        Ok(component) => component,
        Err(e) => return Some((e.code.to_string(), (e.span.start_offset, e.span.end_offset))),
    };
    let tree = compiler_syntax_tree::lower(&component, source);
    let input = rsvelte_svelte_semantic::svelte_input(&component, &tree, source, "test.svelte");
    let resolution = resolve::resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &tree,
    );
    let analysis = analyze::analyze(&input, &resolution);
    compile_input(&CompileInput::from(input), &resolution, &analysis, target)
        .err()
        .map(|e| (e.code.to_string(), (e.span.start_offset, e.span.end_offset)))
}

#[test]
fn svelte_options_raise_upstreams_errors_after_the_parsers_and_before_content() {
    // From svelte 5.57.3, compiled with `runes: true`.
    for (source, expected) in [
        (
            "<svelte:options on:click={f} />",
            Some(("svelte_options_invalid_attribute", (16, 28))),
        ),
        (
            "<svelte:options {...o} />",
            Some(("svelte_options_invalid_attribute", (16, 22))),
        ),
        (
            "<svelte:options tag=\"my-el\" />",
            Some(("svelte_options_deprecated_tag", (16, 27))),
        ),
        (
            "<svelte:options runes=\"yes\" />",
            Some(("svelte_options_invalid_attribute_value", (16, 27))),
        ),
        (
            "<svelte:options namespace=\"nope\" />",
            Some(("svelte_options_invalid_attribute_value", (16, 32))),
        ),
        (
            "<svelte:options css />",
            Some(("svelte_options_invalid_attribute_value", (16, 19))),
        ),
        (
            "<svelte:options immutable={1} />\n<svelte:options immutable={1} />",
            Some(("svelte_meta_duplicate", (33, 33))),
        ),
        (
            "<svelte:options bogus>x</svelte:options>",
            Some(("svelte_options_unknown_attribute", (16, 21))),
        ),
        (
            "<svelte:options runes={false} bogus />",
            Some(("svelte_options_unknown_attribute", (30, 35))),
        ),
        (
            "<svelte:options runes> x</svelte:options>",
            Some(("svelte_meta_invalid_content", (22, 24))),
        ),
        (
            "<svelte:window>x</svelte:window>",
            Some(("svelte_meta_invalid_content", (15, 16))),
        ),
        (
            "<svelte:options runes immutable={false} accessors preserveWhitespace={true} \
             namespace=\"svg\" css=\"injected\" />",
            None,
        ),
    ] {
        for target in [Target::Client, Target::Server] {
            let expected = expected.map(|(code, at)| (code.to_owned(), at));
            assert_eq!(rejected(source, target), expected, "{source} on {target:?}");
        }
    }
}
