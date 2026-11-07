use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_test_harness::NodePackages;
use rsvelte_vue_check::{Configuration, TypeCheckConfiguration};

fn main() -> ExitCode {
    let packages = NodePackages::locate();
    let configuration = Configuration {
        check: Some(TypeCheckConfiguration {
            checker: rsvelte_typescript_check::TypeChecker::new(packages.tsc()),
            tsconfig: Some(
                concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures/tsconfig.json").into(),
            ),
            vue: packages.package("vue"),
        }),
    };
    let mut registry = Registry::new();
    rsvelte_vue_check::register(&mut registry, &configuration);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("vue.check/default", "findings")
        .run()
}
