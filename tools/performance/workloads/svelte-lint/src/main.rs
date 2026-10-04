use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::performance::measurement;
use rsvelte_svelte::{Normalized, Parsed, Resolved};
#[allow(dead_code)]
mod baseline;
#[cfg(feature = "allocations")]
#[global_allocator]
static ALLOCATOR: measurement::CountingAllocator = measurement::CountingAllocator;
fn baseline(mode: &str, context: &DocumentContext<'_>, out: &mut TaskOutput) {
    let c = context
        .get::<Parsed>()
        .as_ref()
        .expect("benchmark input parses");
    let tree = context.get::<Normalized>().as_ref().expect("lowered");
    let res = context.get::<Resolved>().as_ref().expect("resolved");
    let parents = c.javascript.parents();
    let early = baseline::SyntaxTreeContext {
        c,
        source_text: context.source_text(),
        javascript: rsvelte_typescript_lint::JavaScriptFacts {
            syntax_tree: &c.javascript,
            sem: &res.sem,
            parents: &parents,
        },
    };
    let late = baseline::CompilerSyntaxTreeContext {
        compiler_syntax_tree: tree,
        res,
        source_text: context.source_text(),
    };
    let (rules, findings) = if mode == "before-button" {
        use rsvelte_lint::rules::Rule;
        let mut findings = Vec::new();
        baseline::ButtonHasType.check(&late, &mut findings);
        (vec!["svelte/button-has-type"], findings)
    } else {
        (
            baseline::rule_identifiers().collect(),
            baseline::lint(&early, &late),
        )
    };
    out.file(
        "lint.json",
        rsvelte_lint::output::render_json(context.line_index(), &rules, &findings),
    );
}
fn main() {
    let args: Vec<_> = std::env::args().collect();
    let mode = &args[1];
    assert!(
        matches!(
            mode.as_str(),
            "before" | "after" | "before-button" | "after-button"
        ),
        "expected before, after, before-button, or after-button"
    );
    let rounds: usize = args[3].parse().expect("rounds");
    let documents: Vec<_> = std::fs::read_to_string(&args[2])
        .expect("inputs")
        .lines()
        .map(|path| {
            Document::new(
                path.to_owned(),
                std::fs::read_to_string(path).expect("source"),
            )
            .expect("valid source")
        })
        .collect();
    let mut registry = Registry::new();
    if mode.ends_with("-button") {
        let rules = rsvelte_svelte_lint::Configuration::new(vec![
            rsvelte_svelte_lint::RuleConfiguration::ButtonHasType {
                severity: rsvelte_kernel::diagnostics::diagnostic::Severity::Error,
                allowed: rsvelte_markup::button_type::Allowed::default(),
            },
        ])
        .expect("config");
        rsvelte_svelte_lint::register_with_configuration(&mut registry, rules);
    } else {
        rsvelte_svelte_lint::register(&mut registry);
    }
    let mut digest = 0xCBF29CE484222325u64;
    let mut output_bytes = 0usize;
    let mut allocated = (0, 0);
    for round in 0..rounds {
        let before = measurement::thread_allocations();
        for document in &documents {
            let context = DocumentContext::new(document, registry.artifacts());
            let mut output = TaskOutput::default();
            if mode.starts_with("before") {
                baseline(mode, &context, &mut output);
            } else {
                rsvelte_svelte_lint::Lint.run(&context, &mut output);
            }
            assert!(output.diagnostics.is_empty(), "benchmark input parsed");
            assert_eq!(output.files.len(), 1);
            for file in output.files {
                for byte in file.text.bytes() {
                    digest = (digest ^ u64::from(byte)).wrapping_mul(0x100000001B3);
                }
                output_bytes += file.text.len();
            }
        }
        let after = measurement::thread_allocations();
        if round + 1 == rounds {
            allocated = (after.0 - before.0, after.1 - before.1);
        }
    }
    let mut report = rsvelte_kernel::output::structured_data::StructuredDataWriter::new(false);
    report
        .begin_object()
        .key("documents")
        .write_number(documents.len())
        .key("rounds")
        .write_number(rounds)
        .key("output_bytes")
        .write_number(output_bytes)
        .key("digest")
        .write_string(&format!("{digest:016x}"));
    for (key, value) in [
        ("allocations", allocated.0),
        ("allocated_bytes", allocated.1),
    ] {
        report.key(key);
        if cfg!(feature = "allocations") {
            report.write_number(value);
        } else {
            report.null();
        }
    }
    report
        .key("condition_type_bytes")
        .null()
        .key("rule_configuration_bytes")
        .write_number(size_of::<rsvelte_svelte_lint::RuleConfiguration>())
        .key("type_facts_bytes")
        .null()
        .end_object();
    println!("{}", report.finish());
}
