//! Every Svelte task over `corpus/svelte`, in one run: each unit is read and parsed once, then
//! compared with the official output and the parity ledger (`rsvelte_corpus::Conformance`).

#![expect(clippy::print_stderr, reason = "reports coverage")]

use std::process::ExitCode;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::Parsed;
use rsvelte_svelte_typescript_projection::Printed;
use rsvelte_test_harness::NodePackages;
use rsvelte_typescript_check::{Tsc, TypeChecker, TypeScriptDocument, TypeScriptView};

#[derive(Debug, Default)]
struct Coverage {
    parse_errors: AtomicUsize,
    /// Invariants that do not need an oracle and failed: a projection that is not valid
    /// TypeScript beyond the grammar rules its source may break, or a token table that is not the
    /// source byte for byte.
    invalid: std::sync::Mutex<Vec<String>>,
    /// The projection: valid TypeScript, or not produced.
    projected: AtomicUsize,
    not_projected: AtomicUsize,
    /// The type check's view: prepared for the checker, a document it skips, an error svelte2tsx
    /// throws, or unsupported.
    prepared: AtomicUsize,
    unchecked: AtomicUsize,
    thrown: AtomicUsize,
    unsupported: AtomicUsize,
}

/// Counts what the projection and the type check cover, and keeps every projection that is not
/// valid TypeScript, which fails the test.
#[derive(Debug)]
struct CountCoverage(Arc<Coverage>);

impl Task for CountCoverage {
    fn identifier(&self) -> &'static str {
        "test.svelte.coverage"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, _: &mut TaskOutput) {
        let count = |counter: &AtomicUsize| counter.fetch_add(1, Ordering::Relaxed);
        let Ok(component) = context.get::<Parsed>() else {
            count(&self.0.parse_errors);
            return;
        };
        if let Some(wrong) = lossless(component, &context.document.text) {
            self.0
                .invalid
                .lock()
                .unwrap_or_else(std::sync::PoisonError::into_inner)
                .push(format!("{}: {wrong}", context.document.path));
        }
        match context.get::<Printed>() {
            Ok(projection) => {
                let allocator = Allocator::default();
                let result = Parser::new(&allocator, &projection.out, SourceType::ts()).parse();
                let in_script = |offset: u32| {
                    [&component.instance, &component.module]
                        .into_iter()
                        .flatten()
                        .any(|script| {
                            (script.content.start_offset..script.content.end_offset)
                                .contains(&offset)
                        })
                };
                let added = result.diagnostics.iter().any(|d| {
                    // The projection keeps the script's own grammar, which may break these rules.
                    let unchecked = d.code.scope.as_deref() == Some("TS")
                        && d.code.number.as_deref().is_some_and(|n| {
                            rsvelte_svelte_syntax::parse::ACORN_UNCHECKED_TYPESCRIPT_RULES
                                .contains(&n)
                        });
                    // svelte2tsx writes a template expression as a statement, which TypeScript
                    // may read as a declaration, so an error there is the source's own.
                    let labels = &d.labels;
                    let in_template = !labels.is_empty()
                        && labels.iter().all(|label| {
                            let at = label.offset();
                            projection
                                .lookup_overlap(Span::new(at, at))
                                .is_some_and(|source| !in_script(source.start_offset))
                        });
                    !unchecked && !in_template
                });
                if added {
                    self.0
                        .invalid
                        .lock()
                        .unwrap_or_else(std::sync::PoisonError::into_inner)
                        .push(format!(
                            "{}: {:?}",
                            context.document.path, result.diagnostics
                        ));
                } else {
                    count(&self.0.projected);
                }
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
            Ok(TypeScriptDocument::Rejected { .. }) => count(&self.0.thrown),
            Err(_) => count(&self.0.unsupported),
        };
    }
}

/// Why the token table is not the source byte for byte, or a trivia token holds what its kind
/// does not say.
fn lossless(
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
    source: &str,
) -> Option<String> {
    use rsvelte_svelte_syntax::syntax_tree::TokenType;
    if let Err(gap) = component.tokens.check_lossless(source) {
        return Some(format!("untokenized {gap:?} {:?}", gap.text(source)));
    }
    component.tokens.iter().find_map(|t| {
        let text = t.span.text(source);
        let ok = match t.kind {
            TokenType::Whitespace => text.chars().all(is_ecmascript_whitespace),
            TokenType::JavaScriptComment => text.starts_with("//") || text.starts_with("/*"),
            TokenType::MarkupComment => text.starts_with("<!--") && text.ends_with("-->"),
            _ => true,
        };
        (!ok).then(|| format!("{:?} at {:?} is {text:?}", t.kind, t.span))
    })
}

fn main() -> ExitCode {
    let packages = NodePackages::locate();
    let (program, arguments) = packages.type_checker();
    let typecheck = rsvelte_svelte_check::Configuration {
        check: Some(rsvelte_svelte_check::TypeCheckConfiguration {
            tsc: Tsc {
                checker: TypeChecker { program, arguments },
                // The configuration svelte-check had for the expected output.
                tsconfig: Some(
                    concat!(
                        env!("CARGO_MANIFEST_DIR"),
                        "/../../../corpus/_registry/tsconfig.json"
                    )
                    .into(),
                ),
            },
            content_mapper: rsvelte_test_harness::content_mapper(),
            svelte: packages.package("svelte"),
        }),
    };
    let coverage = Arc::new(Coverage::default());
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    rsvelte_svelte_format::register(&mut registry);
    rsvelte_svelte_lint::register_with_configuration(&mut registry, oracle_lint_configuration());
    // The oracle lints each unit outside any SvelteKit project, with a `svelte.config.js` of
    // `compilerOptions: { runes: true }`.
    registry.provide::<rsvelte_svelte_lint::computation::SvelteConfiguration>(
        "svelte",
        |_| true,
        |_| {
            Ok(rsvelte_svelte_lint::SvelteConfig {
                runes: Some(true),
                ..rsvelte_svelte_lint::SvelteConfig::default()
            })
        },
    );
    registry.provide::<rsvelte_svelte_lint::computation::SvelteKit>(
        "svelte",
        |_| true,
        |_| rsvelte_svelte_lint::project::SvelteKitProject {
            version: None,
            location: rsvelte_svelte_lint::project::Location::NoProject,
        },
    );
    registry.provide::<rsvelte_svelte_lint::computation::SameNamedFile>(
        "svelte",
        |_| true,
        |_| None,
    );
    rsvelte_svelte_typescript_projection::register(&mut registry);
    rsvelte_svelte_check::register(&mut registry, &typecheck);
    registry.task(CountCoverage(Arc::clone(&coverage)));
    let result = rsvelte_corpus::Conformance::new("svelte", registry)
        .compare("svelte.compile/client")
        .compare("svelte.compile/server")
        .compare_file(
            "svelte.compile.warnings",
            "svelte.compile/client",
            "warnings.json",
        )
        .compare("svelte.compileModule/client")
        .compare("svelte.compileModule/server")
        .compare("svelte.format/default")
        .compare("svelte.lint/default")
        .compare("svelte.check/default")
        .also_run("test.svelte.coverage")
        .run();
    let c = &coverage;
    let n = |counter: &AtomicUsize| counter.load(Ordering::Relaxed);
    let invalid = c
        .invalid
        .lock()
        .unwrap_or_else(std::sync::PoisonError::into_inner);
    eprintln!(
        "coverage: {} parse errors, {} invariants broken; projection: {} valid TypeScript, {} not \
         produced; type check: {} prepared, {} unchecked, {} thrown, {} unsupported",
        n(&c.parse_errors),
        invalid.len(),
        n(&c.projected),
        n(&c.not_projected),
        n(&c.prepared),
        n(&c.unchecked),
        n(&c.thrown),
        n(&c.unsupported),
    );
    for i in invalid.iter() {
        eprintln!("broken invariant: {i}");
    }
    if invalid.is_empty() {
        result
    } else {
        ExitCode::FAILURE
    }
}

/// The rules the oracle's lint runs (`corpus/_registry/oracles.json`) that this crate implements,
/// with their default options, so the corpus compares every one of them.
fn oracle_lint_configuration() -> rsvelte_svelte_lint::Configuration {
    #[derive(serde::Deserialize)]
    struct Oracles {
        #[serde(rename = "svelte.lint")]
        lint: Oracle,
    }
    #[derive(serde::Deserialize)]
    struct Oracle {
        rules: Vec<String>,
    }
    let oracles: Oracles = serde_json::from_str(include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../corpus/_registry/oracles.json"
    )))
    .expect("oracles.json lists the lint oracle's rules");
    let mut configuration =
        rsvelte_svelte_lint::Configuration::new(rsvelte_svelte_lint::LintSettings::default());
    for name in &oracles.lint.rules {
        if rsvelte_svelte_lint::definition(name, &[]).is_some() {
            configuration
                .rule(name, rsvelte_kernel::diagnostics::Severity::Error, &[], &[])
                .unwrap_or_else(|e| panic!("{e}"));
        }
    }
    configuration
}
