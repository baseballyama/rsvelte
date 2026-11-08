//! `behaviour.toml` in a case is read by the behaviour oracle's tests in `tools/oracle`.

use std::process::ExitCode;

use rsvelte_kernel::computation::registry::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_svelte::register(&mut registry);
    rsvelte_svelte_compile_vapor::register(&mut registry);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("vuelte.compile/client", "client")
        .snapshot("vuelte.compile/server", "server")
        .run()
}
