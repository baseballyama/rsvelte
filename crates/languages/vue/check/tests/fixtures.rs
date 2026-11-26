use std::process::ExitCode;

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_test_harness::NodePackages;
use rsvelte_vue_check::{Configuration, TypeCheckConfiguration};

fn main() -> ExitCode {
    let packages = NodePackages::locate();
    let configuration = Configuration {
        check: Some(TypeCheckConfiguration {
            tsc: rsvelte_typescript_check::Tsc::new(
                checker(&packages),
                Some(concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures/tsconfig.json").into()),
                None,
            ),
            vue: packages.package("vue"),
        }),
    };
    let mut registry = Registry::new();
    rsvelte_vue_check::register(&mut registry, &configuration);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .inputs_from(concat!(env!("CARGO_MANIFEST_DIR"), "/../compile"))
        .snapshot("vue.check/default", "findings")
        .run()
}

fn checker(packages: &NodePackages) -> rsvelte_typescript_check::TypeChecker {
    let (program, arguments) = packages.type_checker();
    rsvelte_typescript_check::TypeChecker { program, arguments }
}
