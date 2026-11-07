//! Every Svelte task over `corpus/svelte`, in one run: each unit is found, read and parsed once,
//! then compared with the official output and the parity ratchet.

#![expect(clippy::print_stderr, reason = "reports coverage")]

use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_svelte_parser::Parsed;
use rsvelte_svelte_typescript_projection::Printed;
use rsvelte_test_harness::NodePackages;
use rsvelte_typescript_check::{TypeChecker, TypeScriptDocument, TypeScriptView};

#[derive(Debug, Default)]
struct Coverage {
    parse_errors: AtomicUsize,
    /// The projection: valid TypeScript, or not produced.
    projected: AtomicUsize,
    not_projected: AtomicUsize,
    /// The type check's view: prepared for the checker, a document it skips, or unsupported.
    prepared: AtomicUsize,
    unchecked: AtomicUsize,
    unsupported: AtomicUsize,
}

/// Counts what the projection and the type check cover, and fails on a projection that is not
/// valid TypeScript.
#[derive(Debug)]
struct CountCoverage(Arc<Coverage>);

impl Task for CountCoverage {
    fn identifier(&self) -> &'static str {
        "test.svelte.coverage"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_parser::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, _: &mut TaskOutput) {
        let count = |counter: &AtomicUsize| counter.fetch_add(1, Ordering::Relaxed);
        if context.get::<Parsed>().is_err() {
            count(&self.0.parse_errors);
            return;
        }
        match context.get::<Printed>() {
            Ok(projection) => {
                let allocator = Allocator::default();
                let result = Parser::new(&allocator, &projection.out, SourceType::ts()).parse();
                assert!(
                    result.diagnostics.is_empty(),
                    "{}: invalid generated TypeScript: {:?}",
                    context.document.path,
                    result.diagnostics,
                );
                count(&self.0.projected);
            }
            Err(_) => {
                count(&self.0.not_projected);
            }
        }
        match context
            .facet::<TypeScriptView>()
            .expect("Svelte provides its TypeScript view")
        {
            Ok(TypeScriptDocument::Checked { .. }) => count(&self.0.prepared),
            Ok(TypeScriptDocument::Unchecked) => count(&self.0.unchecked),
            Err(_) => count(&self.0.unsupported),
        };
    }
}

/// The type check's content mapper, which cargo builds next to this test for the workspace.
fn content_mapper() -> PathBuf {
    let name = "rsvelte-svelte-typecheck-content-mapper";
    let mapper = std::env::current_exe()
        .ok()
        .and_then(|exe| Some(exe.parent()?.parent()?.join(name)))
        .filter(|m| m.is_file());
    mapper.unwrap_or_else(|| {
        panic!("{name} is not built: run `cargo build -p rsvelte_svelte_typecheck --bins`")
    })
}

fn main() -> ExitCode {
    let packages = NodePackages::locate();
    let (program, arguments) = packages.type_checker();
    let typecheck = rsvelte_svelte_typecheck::Configuration {
        check: Some(rsvelte_svelte_typecheck::TypeCheckConfiguration {
            checker: TypeChecker { program, arguments },
            content_mapper: content_mapper(),
            tsconfig: Some(
                concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures/tsconfig.json").into(),
            ),
            svelte: packages.package("svelte"),
        }),
    };
    let coverage = Arc::new(Coverage::default());
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    rsvelte_svelte_lint::register(&mut registry);
    rsvelte_svelte_typescript_projection::register(&mut registry);
    rsvelte_svelte_typecheck::register(&mut registry, &typecheck);
    registry.task(CountCoverage(Arc::clone(&coverage)));
    let result = rsvelte_test_harness::Fixtures::corpus_only("svelte", registry)
        // Unrelated repositories can declare conflicting global types.
        .per_project()
        .snapshot("svelte.compile/client", "client")
        .snapshot("svelte.compile/server", "server")
        .not_implemented("svelte.compileModule/client")
        .not_implemented("svelte.compileModule/server")
        .snapshot("svelte.lint/default", "findings")
        .snapshot("svelte.typescript_projection/default", "projection")
        .snapshot("svelte.check/default", "check")
        .snapshot("test.svelte.coverage", "coverage")
        .run();
    let c = &coverage;
    let n = |counter: &AtomicUsize| counter.load(Ordering::Relaxed);
    eprintln!(
        "coverage: {} parse errors; projection: {} valid TypeScript, {} not produced; type \
         check: {} prepared, {} unchecked, {} unsupported; type equivalence with svelte2tsx and \
         svelte-check: UNMEASURED",
        n(&c.parse_errors),
        n(&c.projected),
        n(&c.not_projected),
        n(&c.prepared),
        n(&c.unchecked),
        n(&c.unsupported),
    );
    result
}
