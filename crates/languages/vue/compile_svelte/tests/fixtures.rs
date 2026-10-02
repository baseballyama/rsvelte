//! `behaviour.toml` in a case is read by the behaviour oracle's tests in `tools/fixtures`.

use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_vue::register(&mut registry);
    rsvelte_svue::register(&mut registry);
    rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("svue.compile/client", "client")
        .snapshot("svue.compile/server", "server")
        .run()
}
