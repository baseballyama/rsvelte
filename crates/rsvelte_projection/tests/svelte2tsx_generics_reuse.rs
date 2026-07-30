use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn project(source: &str, is_ts_file: bool, emit_jsdoc: bool) -> String {
    svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "Generic.svelte".into(),
            is_ts_file,
            emit_jsdoc,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code
}

#[test]
fn quoted_ts_generics_reach_render_export_and_hoist_checks() {
    for quote in ['"', '\''] {
        let source = format!(
            "<script lang=\"ts\" generics={quote}T extends string{quote}>\n\
             type Local<U> = {{ value: U }};\n\
             let {{ item }}: {{ item: Local<T> }} = $props();\n\
             </script>\n<span>{{item.value}}</span>"
        );
        let code = project(&source, true, false);
        let render = code.find("function $$render<T extends string>()").unwrap();
        let local = code.find("type Local<U>").unwrap();

        assert!(
            local > render,
            "generic-dependent type escaped $$render:\n{code}"
        );
        assert!(
            code.contains("class __sveltets_Render<T extends string>"),
            "component export lost generics:\n{code}"
        );
        assert!(
            code.contains("item: Local<T>"),
            "generic-dependent prop lost its type:\n{code}"
        );
    }
}

#[test]
fn jsdoc_generics_emit_template_without_ts_render_syntax() {
    let code = project(
        "<script generics='T extends object'>\n/** @type {T} */\nexport let value;\n</script>",
        false,
        true,
    );

    assert!(
        code.contains("/** @template T extends object */\nfunction $$render()"),
        "missing JSDoc generic template:\n{code}"
    );
    assert!(
        !code.contains("function $$render<T"),
        "JSDoc output used TypeScript render generics:\n{code}"
    );
}

#[test]
fn empty_and_absent_generics_keep_their_existing_shapes() {
    let empty = project(r#"<script lang="ts" generics=""></script>"#, true, false);
    let absent = project(r#"<script lang="ts"></script>"#, true, false);

    assert!(
        empty.contains("function $$render<>()"),
        "empty generics attribute changed meaning:\n{empty}"
    );
    assert!(
        absent.contains("function $$render()") && !absent.contains("function $$render<"),
        "absent generics attribute changed meaning:\n{absent}"
    );
}
