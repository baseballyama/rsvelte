//! `ts.check` checks the documents of every language plugin in one project, so its cases need
//! several plugins and live with the host.

use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_test_harness::NodePackages;

fn main() -> ExitCode {
    let packages = NodePackages::locate();
    let (program, arguments) = packages.type_checker();
    let tsc = rsvelte_typescript_check::Tsc {
        checker: rsvelte_typescript_check::TypeChecker { program, arguments },
        tsconfig: Some(concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures/tsconfig.json").into()),
    };
    let svelte = rsvelte_svelte_typecheck::Configuration {
        check: Some(rsvelte_svelte_typecheck::TypeCheckConfiguration {
            tsc: tsc.clone(),
            content_mapper: rsvelte_test_harness::content_mapper(),
            svelte: packages.package("svelte"),
        }),
    };
    let vue = rsvelte_vue_check::Configuration {
        check: Some(rsvelte_vue_check::TypeCheckConfiguration {
            tsc: tsc.clone(),
            vue: packages.package("vue"),
        }),
    };
    let mut registry = Registry::new();
    rsvelte_svelte_typecheck::register(&mut registry, &svelte);
    rsvelte_vue_check::register(&mut registry, &vue);
    registry.finish_task(rsvelte_typescript_check::Check {
        identifier: "ts.check/default",
        documents: rsvelte_typescript_check::Documents::WithTypeScriptView,
        tsc: Some(tsc),
    });
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("ts.check/default", "ts-check")
        .run()
}
