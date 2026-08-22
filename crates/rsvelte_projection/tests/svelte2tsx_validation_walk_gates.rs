use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn error(source: &str) -> String {
    svelte2tsx(source, Svelte2TsxOptions::default())
        .expect_err("fixture should fail")
        .to_string()
}

#[test]
fn validation_markers_preserve_debug_and_meta_errors() {
    assert!(error("{@debug user.name}").contains("arguments must be identifiers"));
    assert!(error("<div><svelte:window /></div>").contains("cannot be inside"));
    assert!(error("<svelte:window /><svelte:window />").contains("only have one"));
    assert!(error("<svelte:element />").contains("must have a 'this' attribute"));
}

#[test]
fn validation_markers_preserve_component_action_errors() {
    assert!(error("<Component use:action />").contains("directive is not valid"));
    assert!(
        error("<svelte:component this={Component} use:action />")
            .contains("directive is not valid")
    );
}

#[test]
fn validation_false_positive_markers_are_harmless() {
    let source = r#"<script>
const markers = ["{@debug", "<svelte:", "use:"];
</script>
<style>/* {@debug <svelte: use: */</style>
<!-- {@debug <svelte: use: -->
<p>{markers.length}</p>"#;

    svelte2tsx(source, Svelte2TsxOptions::default()).expect("markers are not template nodes");
}

#[test]
fn the_first_error_in_source_order_wins() {
    // The parser raises both of these, so position decides which one surfaces —
    // the marker scan must not reorder them.
    assert!(error("<div><svelte:window /></div>{@debug user.name}").contains("cannot be inside"));
    assert!(
        error("{@debug user.name}<div><svelte:window /></div>")
            .contains("arguments must be identifiers")
    );
}

#[test]
fn deeply_nested_template_without_markers_converts() {
    let mut source = String::new();
    for _ in 0..32 {
        source.push_str("{#if ready}<div>");
    }
    source.push_str("{value}");
    for _ in 0..32 {
        source.push_str("</div>{/if}");
    }

    svelte2tsx(&source, Svelte2TsxOptions::default()).expect("marker-free template should convert");
}
