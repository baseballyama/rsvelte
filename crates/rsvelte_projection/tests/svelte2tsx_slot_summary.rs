use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

#[test]
fn dollar_slots_uses_collected_static_dynamic_and_duplicate_name_order() {
    let source = r#"<script>
    let dynamic = "dynamic";
    void $$slots;
</script>
{#if dynamic}<slot name="named" first={dynamic} />{/if}
<div><slot /></div>
<slot name="named" last={dynamic} />
<slot name={dynamic} />
<slot name="pre{dynamic}post" />"#;
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).expect("project");

    assert!(result.code.contains(
        "let $$slots = __sveltets_2_slotsType({'named': '', 'default': '', 'post': ''});"
    ));
    let named = result
        .code
        .find("'named': {")
        .expect("named slot definition");
    let default = result
        .code
        .find("'default': {")
        .expect("default slot definition");
    let dynamic = result
        .code
        .find("'undefined': {")
        .expect("dynamic slot definition");
    assert!(named < default && default < dynamic);
}

#[test]
fn dollar_slots_without_real_slots_uses_an_empty_summary() {
    let source = r#"<script>
    const marker = "<slot>";
    void $$slots;
</script>
<!-- <slot name="comment"> -->
{@html "<slot>"}<div />"#;
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).expect("project");

    assert!(
        result
            .code
            .contains("let $$slots = __sveltets_2_slotsType({});")
    );
    assert!(!result.code.contains("const __sveltets_createSlot"));
    assert!(result.code.contains("slots: {}"));
}

#[test]
fn nested_slots_still_emit_the_create_slot_helper() {
    let source = "{#if visible}<section><slot name=\"nested\" /></section>{/if}";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).expect("project");

    assert!(result.code.contains("const __sveltets_createSlot"));
    assert!(result.code.contains("'nested': {}"));
}

#[test]
fn slot_summary_reuse_preserves_script_mappings() {
    let source = r#"<script>
    void $$slots;
</script>
<slot name="named" />"#;
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).expect("project");
    let original = source.find("$$slots").expect("source usage") as u32;
    let generated = result
        .map_offset_forward(original)
        .expect("script usage remains mapped") as usize;

    assert_eq!(
        &result.code[generated..generated + "$$slots".len()],
        "$$slots"
    );
    assert!(result.map.is_some());
}
