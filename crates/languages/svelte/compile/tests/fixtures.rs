use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .corpus("svelte")
        .javascript_snapshot("svelte.compile/client", "client")
        .javascript_snapshot("svelte.compile/server", "server")
        .run()
}
