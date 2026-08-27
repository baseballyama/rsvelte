//! Nested rules keep the child selector's scoping metadata when `&` is
//! resolved against a global parent. The upstream pruner walks the
//! `NestingSelector`; flattening it while inheriting the parent's `is_global`
//! flag caused the whole child selector to be truncated.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("NestedGlobal.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn nested_pseudo_under_global_parent_scopes_elements() {
    let js = compile_client(
        r#"<main><button>save</button></main>
<style>
    :global(.external) {
        &:hover { color: red }
    }
</style>"#,
    );

    assert!(
        js.contains("<main class=\"svelte-") && js.contains("<button class=\"svelte-"),
        "the nested local rule should scope each possible match:\n{js}"
    );
}

#[test]
fn bare_nesting_selector_under_global_parent_scopes_elements() {
    let js = compile_client(
        r#"<main>content</main>
<style>
    :global(.external) {
        & { color: red }
    }
</style>"#,
    );

    assert!(
        js.contains("<main class=\"svelte-"),
        "the retained nesting subject should match a fully-global parent:\n{js}"
    );
}

#[test]
fn unnested_global_rule_does_not_scope_local_elements() {
    let js = compile_client(
        r#"<main>content</main>
<style>:global(.external):hover { color: red }</style>"#,
    );

    assert!(
        !js.contains("svelte-"),
        "a genuinely global leaf rule must remain unscoped:\n{js}"
    );
}
