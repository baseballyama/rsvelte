use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

#[test]
fn bound_slots_use_one_monotonic_counter() {
    let output = svelte2tsx(
        "<script>let first; let second;</script>\
         <slot bind:this={first}/><slot bind:this={second}/>",
        Svelte2TsxOptions::default(),
    )
    .expect("compile")
    .code;

    assert!(output.contains("const $$_slot0 = __sveltets_createSlot"));
    assert!(output.contains("const $$_slot1 = __sveltets_createSlot"));
    assert!(output.contains("first = $$_slot0"));
    assert!(output.contains("second = $$_slot1"));
    assert!(!output.contains("$$_slot2"));
}
