mod support;

use std::process::ExitCode;

fn main() -> ExitCode {
    support::verify_strict();
    rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), support::registry())
        .directory(support::ROOT)
        .snapshot("svelte.lint.typed/default", "findings")
        .run()
}
