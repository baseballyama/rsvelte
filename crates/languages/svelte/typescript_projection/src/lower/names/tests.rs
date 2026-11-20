#[test]
fn a_generated_name_skips_the_indices_the_component_names() {
    // `__rsvelte_element02` spells no index a generated name writes, so it leaves 2 free.
    let source = "<script lang=\"ts\">let e: HTMLElement | undefined; let w = $state(0); \
                  let __rsvelte_element0 = 0, __rsvelte_element02 = 0; __rsvelte_element1;</script>\
                  <div bind:this={e!} bind:clientWidth={w as number}></div>";
    let component = rsvelte_svelte_syntax::parse::parse(source).expect("valid Svelte source");
    let tree = crate::lower_alone(&component, source, "App.svelte").expect("supported template");
    let output = crate::emit(&tree, source, "");
    assert!(
        output.out.contains("e = __rsvelte_element2!;"),
        "{}",
        output.out
    );
}
