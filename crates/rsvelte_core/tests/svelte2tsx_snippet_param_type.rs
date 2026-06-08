//! Regression test for issue #912.
//!
//! An explicit type annotation on a `{#snippet}` parameter that uses a
//! destructuring pattern (`{ contentId }: { contentId?: string }`) must be
//! carried verbatim into the generated arrow's parameter list. Previously the
//! lowering spanned only the destructuring pattern (`{ contentId }`), dropping
//! the annotation — so the parameter was inferred as `{ contentId: any }`
//! (losing both the type and the `?` optionality), and `{@render menuitem({})}`
//! wrongly errored as "missing required property".

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn overlay(src: &str) -> String {
    svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".into(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code
}

#[test]
fn object_pattern_snippet_param_keeps_type_annotation() {
    let src = "<script lang=\"ts\">let v = 1;</script>\n\
               {#snippet menuitem({ contentId }: { contentId?: string })}\n\
               <button id={contentId}>{v}</button>\n\
               {/snippet}\n\
               {@render menuitem({})}";
    let code = overlay(src);
    assert!(
        code.contains("{ contentId }: { contentId?: string }"),
        "snippet param type annotation dropped:\n{code}"
    );
}

#[test]
fn array_pattern_snippet_param_keeps_type_annotation() {
    let src = "<script lang=\"ts\">let v = 1;</script>\n\
               {#snippet row([first]: [string?])}\n\
               <button>{first}{v}</button>\n\
               {/snippet}\n\
               {@render row([])}";
    let code = overlay(src);
    assert!(
        code.contains("[first]: [string?]"),
        "array-pattern snippet param type annotation dropped:\n{code}"
    );
}

#[test]
fn identifier_snippet_param_type_annotation_unaffected() {
    // Guard: the already-working identifier-with-annotation path still emits
    // its annotation (it is folded into the span in convert_formal_parameter).
    let src = "<script lang=\"ts\">let v = 1;</script>\n\
               {#snippet item(id: string)}\n\
               <button>{id}{v}</button>\n\
               {/snippet}\n\
               {@render item('a')}";
    let code = overlay(src);
    assert!(
        code.contains("id: string"),
        "identifier snippet param type annotation dropped:\n{code}"
    );
}
