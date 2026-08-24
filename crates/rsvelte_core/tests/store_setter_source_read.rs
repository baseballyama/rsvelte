use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// Upstream's store transforms read the store *variable* through its own
/// binding (`get_store()` = `context.visit(b.id(name.slice(1)))`), so the first
/// argument of `$.store_set` is `$.get(store)` / `store()` / `$$props.store`,
/// never the bare name. The bind-setter path emitted the bare name, which the
/// transform-idempotency gate caught as a second pass that was not a no-op.
#[test]
fn a_bind_setter_reads_the_store_source_through_its_binding() {
    let state_store = client(
        "<script>\n\
         \timport { writable } from 'svelte/store';\n\
         \tlet searchValue = writable('');\n\
         \tsearchValue = writable('x');\n\
         </script>\n\n\
         <input bind:value={$searchValue} />\n",
    );
    assert!(
        state_store.contains("$.store_set($.get(searchValue), $$value)"),
        "a mutated store variable reads as `$.get(...)`, got:\n{state_store}"
    );

    let prop_store = client(
        "<script>\n\
         \texport let parameterStore;\n\
         </script>\n\n\
         <input type=\"checkbox\" bind:checked={$parameterStore} />\n",
    );
    assert!(
        prop_store.contains("$.store_set(parameterStore(), $$value)"),
        "a prop-source store reads as the getter call, got:\n{prop_store}"
    );
}
