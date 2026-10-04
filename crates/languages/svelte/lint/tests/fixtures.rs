use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .inputs_from(concat!(env!("CARGO_MANIFEST_DIR"), "/../compile"))
        .snapshot("svelte.lint/default", "findings")
        .run()
}
