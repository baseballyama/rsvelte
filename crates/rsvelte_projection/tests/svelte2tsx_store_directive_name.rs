use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

/// A `$name` written as a directive NAME subscribes for every directive kind
/// except `style:` and `on:`. Measured against official svelte2tsx (0.7.61)
/// across all nine kinds rather than derived from a rule — the split is neither
/// shorthand-vs-value nor directive-vs-value:
///
/// * `class:$store` subscribes, `style:$store` does not
/// * `style:color={$store}` subscribes, `style:$store` does not
fn tsx_for(template: &str) -> String {
    let source = format!(
        "<script>\n\timport {{ writable }} from 'svelte/store';\n\tconst store = writable('v');\n</script>\n\n{template}"
    );
    svelte2tsx(&source, Svelte2TsxOptions::default())
        .unwrap_or_else(|error| panic!("svelte2tsx failed for {template:?}: {error:?}"))
        .code
}

fn subscribes(template: &str) -> bool {
    tsx_for(template)
        .lines()
        .find(|line| line.contains("const store"))
        .unwrap_or_else(|| panic!("no `const store` line for {template:?}"))
        .contains("__sveltets_2_store_get")
}

#[test]
fn directive_name_store_subscribes_for_every_kind_but_style_and_on() {
    for template in [
        "<div use:$store>x</div>",
        "<div transition:$store>x</div>",
        "<div in:$store>x</div>",
        "<div out:$store>x</div>",
        "{#each [1] as k (k)}<div animate:$store>{k}</div>{/each}",
        "<div class:$store>x</div>",
        "<input bind:$store />",
    ] {
        assert!(
            subscribes(template),
            "expected a store subscription for {template:?}"
        );
    }

    for template in ["<div style:$store>x</div>", "<div on:$store>x</div>"] {
        assert!(
            !subscribes(template),
            "expected NO store subscription for {template:?}"
        );
    }
}

/// The positive control that separates "style: is special" from
/// "the shorthand form is special": the same store as a style VALUE subscribes.
#[test]
fn a_store_used_as_a_style_value_still_subscribes() {
    assert!(subscribes("<div style:color={$store}>x</div>"));
}

/// A directive NAME subscribes only in its bare form. Official subscribes for
/// `use:$store` but not for `use:$store.action`, and the same holds for every
/// kind that subscribes at all — the member form reads a property off a store
/// it never declares, so a subscription here is one upstream does not write.
/// This is what `runtime-runes/samples/store-directive/main.svelte` exercises.
#[test]
fn a_member_access_in_a_directive_name_does_not_subscribe() {
    for template in [
        "<div use:$store.action>x</div>",
        "<div transition:$store.action>x</div>",
        "<div in:$store.action>x</div>",
        "<div out:$store.action>x</div>",
        "{#each [1] as k (k)}<div animate:$store.action>{k}</div>{/each}",
        "<div class:$store.action>x</div>",
        "<div use:$store.a.b>x</div>",
    ] {
        assert!(
            !subscribes(template),
            "expected NO store subscription for {template:?}"
        );
    }
}

/// The control that keeps the previous test honest: the restriction is on the
/// NAME position only. A member access read through a directive VALUE, or in a
/// plain expression, still subscribes — so a fix that simply dropped every
/// `$store.` occurrence would fail here.
#[test]
fn a_member_access_outside_a_directive_name_still_subscribes() {
    for template in [
        "<div use:x={$store.action}>x</div>",
        "<div style:color={$store.c}>x</div>",
        "<div>{$store.x}</div>",
    ] {
        assert!(
            subscribes(template),
            "expected a store subscription for {template:?}"
        );
    }
}
