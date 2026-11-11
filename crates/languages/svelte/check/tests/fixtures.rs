//! The type check over the hand-written cases; the corpus runs in `rsvelte_command_line`'s
//! `corpus` test.

use std::process::ExitCode;

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_svelte_check::{Configuration, TypeCheckConfiguration};
use rsvelte_test_harness::NodePackages;

fn main() -> ExitCode {
    let batched = fixtures().per_project().run();
    // A case's findings must not depend on the cases checked with it.
    let alone = fixtures().each_alone().run();
    if batched == ExitCode::SUCCESS {
        alone
    } else {
        batched
    }
}

fn fixtures() -> rsvelte_test_harness::Fixtures {
    let packages = NodePackages::locate();
    let configuration = Configuration {
        check: Some(TypeCheckConfiguration {
            tsc: rsvelte_typescript_check::Tsc {
                checker: checker(&packages),
                tsconfig: Some(
                    concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures/tsconfig.json").into(),
                ),
            },
            content_mapper: rsvelte_test_harness::content_mapper(),
            svelte: packages.package("svelte"),
        }),
    };
    let mut registry = Registry::new();
    rsvelte_svelte_check::register(&mut registry, &configuration);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .inputs_from(concat!(env!("CARGO_MANIFEST_DIR"), "/../compile"))
        .snapshot("svelte.check/default", "findings")
}

fn checker(packages: &NodePackages) -> rsvelte_typescript_check::TypeChecker {
    let (program, arguments) = packages.type_checker();
    rsvelte_typescript_check::TypeChecker { program, arguments }
}
