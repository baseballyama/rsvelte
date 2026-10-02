use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .javascript_snapshot("svelte.compile/client", "client")
        .javascript_snapshot("svelte.compile/server", "server")
        .run()
}
