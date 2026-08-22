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
