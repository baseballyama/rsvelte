use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn project(source: &str, filename: &str, is_ts_file: bool, emit_jsdoc: bool) -> String {
    svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: filename.into(),
            is_ts_file,
            emit_jsdoc,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code
}

#[test]
fn runes_ts_component_export_suffix_is_exact() {
    let code = project(
        r#"<script lang="ts">let count = $state(0);</script>"#,
        "RunesTs.svelte",
        true,
        false,
    );

    assert!(code.ends_with(
        "const RunesTs__SvelteComponent_ = __sveltets_2_fn_component($$render());\n\
         /*Ωignore_startΩ*/type RunesTs__SvelteComponent_ = ReturnType<typeof RunesTs__SvelteComponent_>;\n\
         /*Ωignore_endΩ*/export default RunesTs__SvelteComponent_;"
    ));
}

#[test]
fn runes_jsdoc_component_export_suffix_is_exact() {
    let code = project(
        "<script>let count = $state(0);</script>",
        "RunesJs.svelte",
        false,
        true,
    );

    assert!(code.ends_with(
        "export const RunesJs__SvelteComponent_ = __sveltets_2_fn_component($$render());\n\
         /*Ωignore_startΩ*//** @typedef {ReturnType<typeof RunesJs__SvelteComponent_>} RunesJs__SvelteComponent_ */\n\
         /*Ωignore_endΩ*/export default RunesJs__SvelteComponent_;"
    ));
}

#[test]
fn legacy_v5_component_export_suffix_is_exact() {
    let code = project(
        r#"<script lang="ts">export let count: number;</script>"#,
        "Legacy.svelte",
        true,
        false,
    );

    assert!(code.ends_with(
        "const Legacy__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_with_any_event($$render()));\n\
         /*Ωignore_startΩ*/type Legacy__SvelteComponent_ = InstanceType<typeof Legacy__SvelteComponent_>;\n\
         /*Ωignore_endΩ*/export default Legacy__SvelteComponent_;"
    ));
}
