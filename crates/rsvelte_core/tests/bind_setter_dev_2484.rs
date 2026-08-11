use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn dev_client(markup: &str) -> String {
    compile(
        &format!(
            "<script>\n\timport Comp from './Comp.svelte';\n\tlet s = $state({{ x: {{}}, y: {{}} }});\n\tlet d = $state({{ e: {{}} }});\n\tlet o = $state({{ k: 1 }});\n\tlet flag = $state(true);\n\tfunction wrap(f) {{ return f; }}\n</script>\n\n{markup}\n"
        ),
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

#[test]
fn bind_setter_assign_exemptions_match_upstream_s0_through_s6() {
    for (name, markup, expected) in [
        ("S0", "<form onsubmit={wrap(() => (s.x = o))}></form>", 1),
        ("S1", "<Comp bind:value={() => s.x, (v) => (s.y = o)} />", 0),
        (
            "S2",
            "<Comp bind:value={() => s.x, wrap((v) => (s.y = o))} />",
            1,
        ),
        (
            "S3",
            "<input bind:value={() => s.x, (v) => (s.y = o)} />",
            0,
        ),
        (
            "S4",
            "<input bind:value={() => s.x, wrap((v) => (s.y = o))} />",
            1,
        ),
        (
            "S5",
            "<Comp bind:value={() => s.x, (v) => (s.y = wrap(() => (d.e = o)))} />",
            1,
        ),
        (
            "S6",
            "<Comp bind:value={() => s.x, (v) => { s.y = o; }} />",
            0,
        ),
    ] {
        let out = dev_client(markup);
        assert_eq!(out.matches("$.assign(").count(), expected, "{name}:\n{out}");
    }
}

#[test]
fn bind_setter_assign_exemptions_match_svelte_body() {
    let body_getter_setter =
        dev_client("<svelte:body bind:clientWidth={() => s.x, (v) => (s.y = o)} />");
    assert!(
        !body_getter_setter.contains("$.assign("),
        "{body_getter_setter}"
    );

    let body_nested = dev_client(
        "<svelte:body bind:clientWidth={() => s.x, (v) => (s.y = wrap(() => (d.e = o)))} />",
    );
    assert_eq!(body_nested.matches("$.assign(").count(), 1, "{body_nested}");
}

#[test]
fn svelte_self_member_binding_uses_dev_assign() {
    let out = dev_client("{#if flag}<svelte:self bind:value={s.x} />{/if}");
    assert_eq!(out.matches("$.assign(").count(), 1, "{out}");
}
