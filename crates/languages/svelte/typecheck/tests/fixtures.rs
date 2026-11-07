//! The type check over the hand-written cases; the corpus runs in `rsvelte_command_line`'s
//! `corpus` test.

use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_svelte_typecheck::{Configuration, TypeCheckConfiguration};
use rsvelte_test_harness::NodePackages;

fn main() -> ExitCode {
    let packages = NodePackages::locate();
    let configuration = Configuration {
        check: Some(TypeCheckConfiguration {
            checker: checker(&packages),
            content_mapper: rsvelte_test_harness::content_mapper(),
            tsconfig: Some(
                concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures/tsconfig.json").into(),
            ),
            svelte: packages.package("svelte"),
        }),
    };
    let mut registry = Registry::new();
    rsvelte_svelte_typecheck::register(&mut registry, &configuration);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .inputs_from(concat!(env!("CARGO_MANIFEST_DIR"), "/../compile"))
        .per_project()
        .snapshot("svelte.check/default", "findings")
        .run()
}

fn checker(packages: &NodePackages) -> rsvelte_typescript_check::TypeChecker {
    let (program, arguments) = packages.type_checker();
    rsvelte_typescript_check::TypeChecker { program, arguments }
}
