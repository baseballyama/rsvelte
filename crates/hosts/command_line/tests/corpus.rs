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
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::legacy::legacy_syntax;
use rsvelte_svelte_semantic::{Resolved, Warned};
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

/// Reports a legacy component, which no task compares: rsvelte leaves legacy mode to the official
/// tools.
struct LegacyComponent;

impl Task for LegacyComponent {
    fn identifier(&self) -> &'static str {
        "test.svelte.legacy"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let (Ok(component), Some(resolution), Some(warned)) = (
            context.get::<Parsed>(),
            context.get::<Resolved>(),
            context.get::<Warned>(),
        ) else {
            return;
        };
        if let Some(syntax) =
            legacy_syntax(component, resolution, context.source_text(), warned.runes)
        {
            out.diagnostics.push(Diagnostic::error(
                "legacy_component",
                format!("a legacy component: {syntax}"),
                Span::new(0, 0),
            ));
        }
    }
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
                // The projection exports its component, so it is a module.
                let source_type = SourceType::ts().with_module(true);
                let result = Parser::new(&allocator, &projection.out, source_type).parse();
                let type_syntax = javascript_rejects(component, projection, &result);
                let source = context.source_text();
                let generics = component
                    .instance
                    .iter()
                    .flat_map(|script| &script.attributes)
                    .find(|(name, _)| name.text(source) == "generics")
                    .and_then(|&(_, value)| value);
                let own = script_errors(component, source);
                // The projection keeps the script's own grammar, which may break these rules.
                let added = result.diagnostics.iter().any(|d| {
                    let unchecked = d.code.scope.as_deref() == Some("TS")
                        && d.code.number.as_deref().is_some_and(|n| {
                            rsvelte_svelte_syntax::parse::ACORN_UNCHECKED_TYPESCRIPT_RULES
                                .contains(&n)
                        });
                    // A `generics` list that does not parse is copied as it is, so an error whose
                    // primary span lies within our `<`, the copy and our `>` is the source's own.
                    // An error in generated text after such a list stays unseen, since the parser
                    // stops at the list's own fatal error.
                    let in_generics =
                        generics.is_some_and(|value| {
                            let Some(copy) = projection.mappings.iter().find(|m| {
                                m.source_text == value.start_offset && m.len == value.len()
                            }) else {
                                return false;
                            };
                            // From our `<` to just past our `>`.
                            let list = copy.generated - 1..copy.generated + copy.len + 1;
                            d.labels
                                .iter()
                                .find(|label| label.primary())
                                .or_else(|| d.labels.first())
                                .is_some_and(|label| {
                                    list.contains(&label.offset())
                                        && label.offset() + label.len() <= list.end
                                })
                        });
                    !unchecked
                        && !in_generics
                        && !script_error(
                            d.code.number.as_deref(),
                            d.labels.first().map(oxc_span::LabeledSpan::offset),
                            &own,
                            &projection.mappings,
                        )
                }) || type_syntax;
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

/// Whether JavaScript's grammar rejects a component without a TypeScript script beyond
/// TypeScript's: only what a script's own text holds, such as its second default export, may.
fn javascript_rejects(
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
    projection: &rsvelte_kernel::output::emitter::Emitter,
    as_typescript: &oxc_parser::ParserReturn<'_>,
) -> bool {
    let scripts = || {
        [&component.instance, &component.module]
            .into_iter()
            .flatten()
    };
    if scripts().any(|script| script.typescript) {
        return false;
    }
    let allocator = Allocator::default();
    let as_javascript = Parser::new(&allocator, &projection.out, SourceType::mjs()).parse();
    let in_script = |offset: u32| {
        projection
            .lookup_overlap(Span::new(offset, offset))
            .is_some_and(|at| {
                scripts().any(|script| {
                    (script.content.start_offset..script.content.end_offset)
                        .contains(&at.start_offset)
                })
            })
    };
    as_javascript.diagnostics.iter().any(|d| {
        !as_typescript
            .diagnostics
            .iter()
            .any(|t| t.message == d.message && t.labels == d.labels)
            && !d.labels.iter().any(|label| in_script(label.offset()))
    })
}

/// The tsc code and source offset of each error oxc reports in the component's scripts, read as
/// the TypeScript the projection is.
fn script_errors(
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
    source: &str,
) -> Vec<(String, u32)> {
    let scripts = component.module.iter().chain(&component.instance);
    scripts
        .flat_map(|script| {
            let allocator = Allocator::default();
            let text = script.content.text(source);
            let source_type = SourceType::ts().with_module(true);
            let result = Parser::new(&allocator, text, source_type).parse();
            (result.diagnostics.into_iter())
                .filter_map(|d| {
                    let label = d.labels.first()?;
                    Some((
                        d.code.number.as_deref()?.to_owned(),
                        script.content.start_offset + label.offset(),
                    ))
                })
                .collect::<Vec<_>>()
        })
        .collect()
}

/// Whether the projection's error with code `number` at `offset` is one of `own`, the scripts'
/// own errors: it has the code of one and lies where the mappings copy that one's place.
fn script_error(
    number: Option<&str>,
    offset: Option<u32>,
    own: &[(String, u32)],
    mappings: &[rsvelte_kernel::output::emitter::Mapping],
) -> bool {
    let Some((number, generated)) = number.zip(offset) else {
        return false;
    };
    let Some(copy) = mappings
        .iter()
        .find(|m| (m.generated..m.generated + m.len).contains(&generated))
    else {
        return false;
    };
    let at = copy.source_text + (generated - copy.generated);
    own.iter()
        .any(|(code, offset)| code == number && *offset == at)
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
    registry.task(LegacyComponent);
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
        .out_of_scope("test.svelte.legacy")
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
