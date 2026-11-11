use rsvelte_svelte_compile::Target;

use super::squashed;

#[test]
fn a_destructured_derived_outside_the_instance_top_level_is_split_as_upstream_splits_it() {
    for (source, client, server) in [
        (
            "<script>let o = $state({}); function f() { let { a } = $derived(o); return a; \
             }</script>",
            "functionf(){leta=$.derived(()=>o.a);return$.get(a);}",
            "functionf(){leta=$.derived(()=>o.a);returna();}",
        ),
        (
            "<script module>let { a } = $derived({ a: 1 });</script><script>let b = 1;</script>",
            "a:1})),a=$.derived(()=>$.get($$d).a);",
            "a:1})),a=$.derived(()=>$$d().a);",
        ),
        (
            "<script>function f() { let [a] = $derived.by(() => [1]); return a; }</script>",
            "let$$d=$.derived(()=>[1]),$$array=$.derived(()=>$.to_array($.get($$d),1)),a=$.derived(\
             ()=>$.get($$array)[0]);",
            "let$$d=$.derived(()=>[1]),$$derived_array=$.derived(()=>$.to_array($$d(),1)),a=$.\
             derived(()=>$$derived_array()[0]);",
        ),
    ] {
        for (target, expected) in [(Target::Client, client), (Target::Server, server)] {
            let compiled = squashed(source, target);
            assert!(
                compiled.contains(expected),
                "{source} on {target:?}: {compiled}"
            );
        }
    }
}
