//! `ts.check` belongs to no language plugin, so its cases live with the host that registers it.

use std::process::ExitCode;

use rsvelte_fixture_test::NodePackages;
use rsvelte_kernel::computation::pipeline::Registry;

fn main() -> ExitCode {
    let packages = NodePackages::locate();
    let tsc = packages.tsc();
    let tsconfig: std::path::PathBuf =
        concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures/tsconfig.json").into();
    let svelte = rsvelte_svelte_check::Configuration {
        check: Some(rsvelte_svelte_check::TypeCheckConfiguration {
            tsc: tsc.clone(),
            tsconfig: Some(tsconfig.clone()),
            svelte: packages.package("svelte"),
        }),
    };
    let vue = rsvelte_vue_check::Configuration {
        check: Some(rsvelte_vue_check::TypeCheckConfiguration {
            tsc: tsc.clone(),
            tsconfig: Some(tsconfig.clone()),
            vue: packages.package("vue"),
        }),
    };
    let mut registry = Registry::new();
    rsvelte_svelte_check::register(&mut registry, &svelte);
    rsvelte_vue_check::register(&mut registry, &vue);
    registry.finish_task(rsvelte_typescript_check::Check {
        identifier: "ts.check/default",
        matches: |document| {
            rsvelte_typescript::matches(document)
                || rsvelte_svelte::matches(document)
                || rsvelte_vue::matches(document)
        },
        tsc: Some(rsvelte_typescript_check::Tsc {
            binary: tsc,
            tsconfig: Some(tsconfig),
        }),
    });
    rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("ts.check/default", "ts-check")
        .run()
}
