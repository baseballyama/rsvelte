use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .corpus("svelte")
        .snapshot("svelte.compile/client", "client")
        .snapshot("svelte.compile/server", "server")
        .not_implemented("svelte.compileModule/client")
        .not_implemented("svelte.compileModule/server")
        .run()
}
