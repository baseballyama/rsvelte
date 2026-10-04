use rsvelte_kernel::performance::buffer_pool;
use rsvelte_svelte_parser::parse::parse;

#[test]
fn token_storage_follows_token_count_for_large_sources() {
    let pooling = buffer_pool::enabled();
    buffer_pool::set_enabled(false);
    let text = "日本語🙂".repeat(100_000);
    let component = parse(&text).expect("long text");
    component.tokens.check_lossless(&text).expect("all bytes");
    assert!(
        component.tokens.heap_bytes() <= 128 * 1024,
        "long text needs little token storage"
    );
    drop(component);

    let expressions = "{value}".repeat(4_000);
    let component = parse(&expressions).expect("many expressions");
    component
        .tokens
        .check_lossless(&expressions)
        .expect("all expressions");
    assert_eq!(component.template_expressions.len(), 4_000);
    drop(component);
    buffer_pool::set_enabled(pooling);
}
