#![expect(clippy::print_stderr, reason = "reports fixture coverage")]

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

#[derive(Debug, Default)]
struct Coverage {
    valid: AtomicUsize,
    parse_errors: AtomicUsize,
    unsupported: AtomicUsize,
}

#[derive(Debug)]
struct SyntaxCheck(Arc<Coverage>);

impl Task for SyntaxCheck {
    fn identifier(&self) -> &'static str {
        "test.typescript_projection.syntax"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_parser::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, _: &mut TaskOutput) {
        if context.get::<Parsed>().is_err() {
            self.0.parse_errors.fetch_add(1, Ordering::Relaxed);
            return;
        }
        let Ok(projection) = context.get::<Printed>() else {
            self.0.unsupported.fetch_add(1, Ordering::Relaxed);
            return;
        };
        let allocator = Allocator::default();
        let result = Parser::new(&allocator, &projection.out, SourceType::ts()).parse();
        assert!(
            result.diagnostics.is_empty(),
            "{}: invalid generated TypeScript: {:?}",
            context.document.path,
            result.diagnostics,
        );
        self.0.valid.fetch_add(1, Ordering::Relaxed);
    }
}

fn main() -> ExitCode {
    let coverage = Arc::new(Coverage::default());
    let mut registry = Registry::new();
    rsvelte_svelte_typescript_projection::register(&mut registry);
    registry.task(SyntaxCheck(Arc::clone(&coverage)));
    let result = rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .inputs_from(concat!(env!("CARGO_MANIFEST_DIR"), "/../compile"))
        .snapshot("svelte.typescript_projection/default", "projection")
        .snapshot("test.typescript_projection.syntax", "syntax")
        .run();
    eprintln!(
        "projection coverage: {} valid TypeScript outputs, {} source parse errors, \
         {} unsupported projections; type equivalence with svelte2tsx: UNMEASURED",
        coverage.valid.load(Ordering::Relaxed),
        coverage.parse_errors.load(Ordering::Relaxed),
        coverage.unsupported.load(Ordering::Relaxed),
    );
    result
}
