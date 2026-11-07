//! The projection over the hand-written cases; the corpus runs in `rsvelte_command_line`'s
//! `corpus` test.

use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_svelte_typescript_projection::register(&mut registry);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .inputs_from(concat!(env!("CARGO_MANIFEST_DIR"), "/../compile"))
        .snapshot("svelte.typescript_projection/default", "projection")
        .run()
}
