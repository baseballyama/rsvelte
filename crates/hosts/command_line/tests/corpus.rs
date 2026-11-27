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
use rsvelte_svelte_typescript_projection::EmittedProjection;
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
        match context.get::<EmittedProjection>() {
            Ok(projection) => {
                let allocator = Allocator::default();
                // The projection exports its component, so it is a module.
                let source_type = SourceType::ts().with_module(true);
                let result = Parser::new(&allocator, &projection.out, source_type).parse();
                let source = context.source_text();
                let generics = generics_list(component, source, projection);
                let type_syntax =
                    javascript_rejects(component, source, projection, &result, generics.as_ref());
                let own = script_errors(component, source);
                let rejected = rejected_default_exports(component, source);
                // The projection keeps the script's own grammar, which may break these rules, and
                // moves its statements into a function, where an `await` is outside an async one.
                let added = result.diagnostics.iter().any(|d| {
                    let unchecked = d.code.scope.as_deref() == Some("TS")
                        && d.code.number.as_deref().is_some_and(|n| {
                            n == "1308"
                                || rsvelte_svelte_syntax::parse::ACORN_UNCHECKED_TYPESCRIPT_RULES
                                    .contains(&n)
                        });
                    // A `generics` list that does not parse is copied as it is, so an error whose
                    // primary span lies within it is the source's own. An error in generated text
                    // after such a list stays unseen, since the parser stops at the list's own
                    // fatal error.
                    let in_generics = generics.as_ref().is_some_and(|list| {
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
                        && !in_tag(component, projection, &d.labels)
                        && !source_offsets(projection, &d.labels)
                            .any(|at| rejected.iter().any(|export| export.contains(&at)))
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
            Ok(TypeScriptDocument::Unchecked { .. }) => count(&self.0.unchecked),
            Ok(TypeScriptDocument::Rejected { .. }) => count(&self.0.thrown),
            Err(_) => count(&self.0.unsupported),
        };
    }
}

/// Whether one of `labels` lies in the copy of a tag's expression, which the projection writes as a
/// statement, as svelte2tsx does, so that a function, class or keyword there is the source's own
/// error.
fn in_tag(
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
    projection: &rsvelte_kernel::output::emitter::Emitter,
    labels: &[oxc_span::LabeledSpan],
) -> bool {
    use rsvelte_svelte_syntax::syntax_tree::TemplateNode;
    let in_a_tag = |at: u32| {
        component.nodes.iter().any(|node| match *node {
            TemplateNode::Expression { span, .. } | TemplateNode::Html { span, .. } => {
                span.start_offset < at && at < span.end_offset
            }
            _ => false,
        })
    };
    source_offsets(projection, labels).any(in_a_tag)
}

/// The source offsets the projection's mappings copy the labels' starts from.
fn source_offsets<'a>(
    projection: &'a rsvelte_kernel::output::emitter::Emitter,
    labels: &'a [oxc_span::LabeledSpan],
) -> impl Iterator<Item = u32> + 'a {
    labels.iter().flat_map(|label| {
        let offset = label.offset();
        (projection.mappings.iter())
            .filter(move |m| (m.generated..m.generated + m.len).contains(&offset))
            .map(move |m| m.source_text + (offset - m.generated))
    })
}

/// The `export default` keywords of the instance script's default exports, which svelte2tsx leaves
/// in the render function as written or without `export`, where TypeScript reports them. oxc's
/// error there is fatal, so the invariant checks such a unit only up to the export.
fn rejected_default_exports(
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
    source: &str,
) -> Vec<std::ops::RangeInclusive<u32>> {
    let Some(script) = &component.instance else {
        return Vec::new();
    };
    let allocator = Allocator::default();
    let source_type = SourceType::ts().with_module(true);
    let parsed = Parser::new(&allocator, script.content.text(source), source_type).parse();
    let start = script.content.start_offset;
    (parsed.program.body.iter())
        .filter_map(|statement| match statement {
            oxc_ast::ast::Statement::ExportDefaultDeclaration(export) => {
                let at = start + export.span.start;
                Some(at..=at + "export default".len() as u32)
            }
            _ => None,
        })
        .collect()
}

/// The projection's copy of the instance script's `generics` value, from our `<` to just past our
/// `>`.
fn generics_list(
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
    source: &str,
    projection: &rsvelte_kernel::output::emitter::Emitter,
) -> Option<std::ops::Range<u32>> {
    let value = (component.instance.iter())
        .flat_map(|script| &script.attributes)
        .find(|(name, _)| name.text(source) == "generics")
        .and_then(|&(_, value)| value)?;
    let copy = (projection.mappings.iter())
        .find(|m| m.source_text == value.start_offset && m.len == value.len())?;
    // A JavaScript component's list sits in an ignored range after its start comment.
    let list = (projection.ignored.iter())
        .find(|range| (range.start_offset..range.end_offset).contains(&copy.generated))
        .map_or(copy.generated..copy.generated + copy.len + 1, |range| {
            range.start_offset..range.end_offset
        });
    Some(list.start - 1..list.end)
}

/// Whether JavaScript's grammar rejects a projection svelte-check reads as JavaScript beyond
/// TypeScript's: only text copied from the component, such as a script's second default export
/// or a template expression the compiler read as TypeScript, may, and the type parameters
/// svelte2tsx writes from a `generics` list in a JavaScript component too.
fn javascript_rejects(
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
    source: &str,
    projection: &rsvelte_kernel::output::emitter::Emitter,
    as_typescript: &oxc_parser::ParserReturn<'_>,
    generics: Option<&std::ops::Range<u32>>,
) -> bool {
    if component.checked_as_typescript(source) {
        return false;
    }
    let allocator = Allocator::default();
    let as_javascript = Parser::new(&allocator, &projection.out, SourceType::mjs()).parse();
    let copied = |offset: u32| {
        generics.is_some_and(|list| list.contains(&offset))
            || (projection.mappings.iter())
                .any(|m| (m.generated..m.generated + m.len).contains(&offset))
    };
    as_javascript.diagnostics.iter().any(|d| {
        !as_typescript
            .diagnostics
            .iter()
            .any(|t| t.message == d.message && t.labels == d.labels)
            && !d.labels.iter().any(|label| copied(label.offset()))
    })
}

/// The tsc code and source offset of each error oxc reports in the component's scripts, read as
/// the TypeScript the projection is.
fn script_errors(
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
    source: &str,
) -> Vec<(String, u32)> {
    let scripts = component.scripts();
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
            tsc: Tsc::new(
                TypeChecker { program, arguments },
                // The configuration svelte-check had for the expected output.
                Some(
                    concat!(
                        env!("CARGO_MANIFEST_DIR"),
                        "/../../../corpus/_registry/tsconfig.json"
                    )
                    .into(),
                ),
                None,
            ),
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
    registry.provide::<rsvelte_svelte_lint::project::SvelteConfiguration>(
        "svelte",
        |_| true,
        |_| {
            Ok(rsvelte_svelte_lint::SvelteConfig {
                runes: Some(true),
                ..rsvelte_svelte_lint::SvelteConfig::default()
            })
        },
    );
    registry.provide::<rsvelte_svelte_lint::project::SvelteKit>(
        "svelte",
        |_| true,
        |_| rsvelte_svelte_lint::project::SvelteKitProject {
            version: None,
            location: rsvelte_svelte_lint::project::Location::NoProject,
        },
    );
    registry.provide::<rsvelte_svelte_lint::project::SameNamedFile>("svelte", |_| true, |_| None);
    // The oracle runs where no PostCSS configuration is found, so it strips a `postcss` style.
    registry.provide::<rsvelte_svelte_lint::project::PostcssConfiguration>(
        "svelte",
        |_| true,
        |_| false,
    );
    rsvelte_svelte_typescript_projection::register(&mut registry);
    rsvelte_svelte_check::register(&mut registry, &typecheck);
    registry.task(CountCoverage(Arc::clone(&coverage)));
    registry.task(LegacyComponent);
    let result = compared(rsvelte_corpus::Conformance::new("svelte", registry)).run();
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
/// with their default options, so the corpus compares every one of them, and the globals the
/// oracle declares.
fn oracle_lint_configuration() -> rsvelte_svelte_lint::Configuration {
    #[derive(serde::Deserialize)]
    struct Oracles {
        #[serde(rename = "svelte.lint")]
        lint: Oracle,
    }
    #[derive(serde::Deserialize)]
    struct Oracle {
        rules: Vec<String>,
        /// What the oracle's configuration declares in `languageOptions.globals`.
        globals: Vec<String>,
    }
    let oracles: Oracles = serde_json::from_str(include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../corpus/_registry/oracles.json"
    )))
    .expect("oracles.json lists the lint oracle's rules");
    let mut configuration =
        rsvelte_svelte_lint::Configuration::new(rsvelte_svelte_lint::LintSettings::default());
    configuration.declare_globals(rsvelte_typescript_semantic::globals::Declared::new(
        oracles.lint.globals,
    ));
    for name in &oracles.lint.rules {
        if rsvelte_svelte_lint::definition(name, &[]).is_some() {
            configuration
                .rule(name, rsvelte_kernel::diagnostics::Severity::Error, &[], &[])
                .unwrap_or_else(|e| panic!("{e}"));
        }
    }
    configuration
}

/// Every task the corpus compares, and what else it runs on each unit.
fn compared(conformance: rsvelte_corpus::Conformance) -> rsvelte_corpus::Conformance {
    conformance
        .compare("svelte.compile/client")
        .compare("svelte.compile/server")
        .compare_file("svelte.compile.warnings")
        .compare("svelte.compileModule/client")
        .compare("svelte.compileModule/server")
        .compare("svelte.format/default")
        .compare("svelte.lint/default")
        .compare("svelte.check/default")
        .compare_comments("svelte.compile.comments/client", "svelte.compile/client")
        .compare_comments("svelte.compile.comments/server", "svelte.compile/server")
        .compare_comments(
            "svelte.compileModule.comments/client",
            "svelte.compileModule/client",
        )
        .compare_comments(
            "svelte.compileModule.comments/server",
            "svelte.compileModule/server",
        )
        .compare_source_map("svelte.compile.sourcemap/client", "svelte.compile/client")
        .compare_source_map("svelte.compile.sourcemap/server", "svelte.compile/server")
        .also_run("test.svelte.coverage")
        .out_of_scope("test.svelte.legacy")
}
