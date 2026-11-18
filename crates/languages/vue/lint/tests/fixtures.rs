use std::process::ExitCode;

use rsvelte_kernel::computation::registry::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_vue_lint::register(&mut registry);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("vue.lint/default", "findings")
        .run()
}
