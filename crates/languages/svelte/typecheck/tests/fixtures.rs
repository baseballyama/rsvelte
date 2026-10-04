#![expect(clippy::print_stderr, reason = "reports fixture coverage")]

use std::process::ExitCode;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_fixture_test::NodePackages;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_svelte_parser::Parsed;
use rsvelte_svelte_typecheck::{Configuration, TypeCheckConfiguration};
use rsvelte_typescript_check::{TypeScriptDocument, TypeScriptView};

#[derive(Debug, Default)]
struct Coverage {
    prepared: AtomicUsize,
    unchecked: AtomicUsize,
    unsupported: AtomicUsize,
    parse_errors: AtomicUsize,
}

#[derive(Debug)]
struct CountCoverage(Arc<Coverage>);

impl Task for CountCoverage {
    fn identifier(&self) -> &'static str {
        "test.svelte.typecheck.coverage"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_parser::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, _: &mut TaskOutput) {
        let counter = if context.get::<Parsed>().is_err() {
            &self.0.parse_errors
        } else {
            match context
                .facet::<TypeScriptView>()
                .expect("Svelte provides its TypeScript view")
            {
                Ok(TypeScriptDocument::Checked { .. }) => &self.0.prepared,
                Ok(TypeScriptDocument::Unchecked) => &self.0.unchecked,
                Err(_) => &self.0.unsupported,
            }
        };
        counter.fetch_add(1, Ordering::Relaxed);
    }
}

fn main() -> ExitCode {
    let packages = NodePackages::locate();
    let configuration = Configuration {
        check: Some(TypeCheckConfiguration {
            tsc: packages.tsc(),
            content_mapper: env!("CARGO_BIN_EXE_rsvelte-svelte-typecheck-content-mapper").into(),
            tsconfig: Some(
                concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures/tsconfig.json").into(),
            ),
            svelte: packages.package("svelte"),
        }),
    };
    let coverage = Arc::new(Coverage::default());
    let mut registry = Registry::new();
    rsvelte_svelte_typecheck::register(&mut registry, &configuration);
    registry.task(CountCoverage(Arc::clone(&coverage)));
    let result = rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .inputs_from(concat!(env!("CARGO_MANIFEST_DIR"), "/../compile"))
        .snapshot("svelte.check/default", "findings")
        .snapshot("test.svelte.typecheck.coverage", "coverage")
        .run();
    eprintln!(
        "typecheck coverage: {} inputs prepared for TS, {} unchecked inputs, \
         {} unsupported projections, {} parse errors; \
         snapshot matches do not measure type equivalence",
        coverage.prepared.load(Ordering::Relaxed),
        coverage.unchecked.load(Ordering::Relaxed),
        coverage.unsupported.load(Ordering::Relaxed),
        coverage.parse_errors.load(Ordering::Relaxed),
    );
    result
}
