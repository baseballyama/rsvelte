//! `behaviour.toml` in a case is read by the behaviour oracle's tests in `tools/fixtures`.

use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_svelte::register(&mut registry);
    rsvelte_vuelte::register(&mut registry);
    rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("vuelte.compile/client", "client")
        .snapshot("vuelte.compile/server", "server")
        .run()
}
