//! Deeply nested markup is lowered and resolved on a worker's 2 MiB stack.

use rsvelte_svelte_semantic::compiler_syntax_tree::lower;
use rsvelte_svelte_semantic::resolve::resolve;

#[test]
fn deep_markup_is_lowered_and_resolved_on_a_small_stack() {
    let r = |s: &str| s.repeat(20_000);
    for source_text in [
        format!("{}x{}", r("<div>"), r("</div>")),
        format!("{}{{b}}{}", r("{#each a as b}"), r("{/each}")),
        format!("{}x{}", r("{#if a}{@const c = 1}"), r("{/if}")),
    ] {
        let scopes = std::thread::Builder::new()
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
            .expect("does not overflow");
        // The root's, and one per `{#each}` or fragment with `{@const}`.
        assert!(scopes == 1 || scopes == 20_001, "{scopes}");
    }
}
