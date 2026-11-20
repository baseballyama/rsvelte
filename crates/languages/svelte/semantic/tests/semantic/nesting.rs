//! Deeply nested markup is lowered and resolved on a worker's 2 MiB stack.

use rsvelte_svelte_semantic::compiler_syntax_tree::lower;
use rsvelte_svelte_semantic::resolve::resolve;

const DEPTH: usize = 20_000;

/// The number of scopes, counted on a thread with a worker's stack.
fn scopes_on_a_small_stack(open: &str, inner: &str, close: &str) -> usize {
    let source_text = format!("{}{inner}{}", open.repeat(DEPTH), close.repeat(DEPTH));
    std::thread::Builder::new()
        .stack_size(2 << 20)
        .spawn(move || {
            let c = rsvelte_svelte_syntax::parse::parse(&source_text).expect("parses");
            let tree = lower(&c, &source_text);
            let instance = c.instance.as_ref().map(|s| s.program);
            let module = c.module.as_ref().map(|s| s.program);
            resolve(&c.javascript, instance, module, &tree)
                .scoping()
                .scopes_len()
        })
        .expect("spawns")
        .join()
        .expect("does not overflow")
}

#[test]
fn deep_elements() {
    // The root's.
    assert_eq!(scopes_on_a_small_stack("<div>", "x", "</div>"), 1);
}

#[test]
fn deep_each_blocks() {
    // The root's, and one per `{#each}`.
    assert_eq!(
        scopes_on_a_small_stack("{#each a as b}", "{b}", "{/each}"),
        DEPTH + 1
    );
}

#[test]
fn deep_if_blocks_with_const() {
    // The root's, and one per fragment with `{@const}`.
    assert_eq!(
        scopes_on_a_small_stack("{#if a}{@const c = 1}", "x", "{/if}"),
        DEPTH + 1
    );
}
