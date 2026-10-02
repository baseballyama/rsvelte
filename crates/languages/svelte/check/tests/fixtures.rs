use std::process::ExitCode;

use rsvelte_fixture_test::NodePackages;
use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_svelte_check::{Configuration, TypeCheckConfiguration};

fn main() -> ExitCode {
    let packages = NodePackages::locate();
    let configuration = Configuration {
        check: Some(TypeCheckConfiguration {
            tsc: packages.tsc(),
            tsconfig: Some(
                concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures/tsconfig.json").into(),
            ),
            svelte: packages.package("svelte"),
        }),
    };
    let mut registry = Registry::new();
    rsvelte_svelte_check::register(&mut registry, &configuration);
    rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("svelte.check/default", "findings")
        .run()
}
