//! `lint-workload rules <candidates.txt>` prints the candidate rules this crate implements.
//! `lint-workload lint <rules.txt> <inputs.txt> <rounds>` lints every input with every rule, with
//! default options, for `rounds` rounds and prints a JSON summary.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_lint::{Configuration, LintSettings};

#[cfg(feature = "allocations")]
#[global_allocator]
static ALLOCATOR: measurement::CountingAllocator = measurement::CountingAllocator;

fn lines(path: &str) -> Vec<String> {
    std::fs::read_to_string(path)
        .unwrap_or_else(|error| panic!("{path}: {error}"))
        .lines()
        .filter(|line| !line.is_empty())
        .map(str::to_owned)
        .collect()
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    match args.get(1).map(String::as_str) {
        Some("rules") => {
            for name in lines(&args[2]) {
                if rsvelte_svelte_lint::definition(&name, &[]).is_some() {
                    println!("{name}");
                }
            }
        }
        Some("lint") => lint(&args[2], &args[3], args[4].parse().expect("rounds")),
        Some("profile") => profile(&args[2], &args[3], args[4].parse().expect("rounds")),
        _ => panic!(
            "expected `rules <candidates.txt>`, or `lint` or `profile` with `<rules.txt> \
             <inputs.txt> <rounds>`"
        ),
    }
}

fn documents(inputs: &str) -> Vec<Document> {
    lines(inputs)
        .into_iter()
        .map(|path| {
            let source = std::fs::read_to_string(&path).expect("source");
            Document::new(path, source).expect("a small input")
        })
        .collect()
}

/// Prints each rule's fastest round alone, less that of `svelte/button-has-type`, which only
/// needs the parse, in nanoseconds, slowest first.
fn profile(rules: &str, inputs: &str, rounds: usize) {
    let documents = documents(inputs);
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_artifacts(&mut registry);
    // The project facts from the files, as ESLint reads them.
    rsvelte_svelte_lint::project::register_file_system(&mut registry);
    let time = |name: &str| {
        let mut configuration = Configuration::new(LintSettings::default());
        configuration
            .rule(name, Severity::Error, &[], &[])
            .unwrap_or_else(|error| panic!("{error}"));
        (0..rounds)
            .map(|_| {
                let start = std::time::Instant::now();
                for document in &documents {
                    let context = DocumentContext::new(document, registry.artifacts());
                    std::hint::black_box(rsvelte_svelte_lint::lint(&context, &configuration))
                        .expect("lints");
                }
                start.elapsed().as_nanos()
            })
            .min()
            .expect("one round")
    };
    let baseline = time("svelte/button-has-type");
    let mut times: Vec<(String, u128)> = lines(rules)
        .into_iter()
        .map(|name| {
            let t = time(&name);
            (name, t)
        })
        .collect();
    times.sort_by_key(|(_, t)| std::cmp::Reverse(*t));
    println!("baseline\tsvelte/button-has-type\t{baseline}");
    for (name, t) in times {
        println!("{}\t{name}\t{t}", t.saturating_sub(baseline));
    }
}

fn lint(rules: &str, inputs: &str, rounds: usize) {
    let rules = lines(rules);
    let mut configuration = Configuration::new(LintSettings::default());
    for name in &rules {
        configuration
            .rule(name, Severity::Error, &[], &[])
            .unwrap_or_else(|error| panic!("{error}"));
    }
    let documents = documents(inputs);
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_artifacts(&mut registry);
    // The project facts from the files, as ESLint reads them.
    rsvelte_svelte_lint::project::register_file_system(&mut registry);
    // A positive control: the configured rules report a button without a type.
    let control = Document::new("control.svelte".to_owned(), "<button></button>".to_owned())
        .expect("a small input");
    let found = rsvelte_svelte_lint::lint(
        &DocumentContext::new(&control, registry.artifacts()),
        &configuration,
    )
    .expect("the control lints");
    assert!(
        found
            .iter()
            .any(|f| f.diagnostic.code == "svelte/button-has-type"),
        "the missing type positive control did not report"
    );
    let names = configuration.rules().iter().map(|rule| rule.name());
    let (mut findings, mut output_bytes, mut allocated) = (0usize, 0usize, (0, 0));
    let mut digest = 0xCBF2_9CE4_8422_2325_u64;
    for round in 0..rounds {
        let before = measurement::thread_allocations();
        for document in &documents {
            let context = DocumentContext::new(document, registry.artifacts());
            let found = rsvelte_svelte_lint::lint(&context, &configuration)
                .unwrap_or_else(|error| panic!("{}: {}", document.path, error.message));
            let text = rsvelte_lint_runner::output::render_json(
                context.ecmascript_line_index(),
                names.clone(),
                &found,
            );
            for byte in text.bytes() {
                digest = (digest ^ u64::from(byte)).wrapping_mul(0x0100_0000_01B3);
            }
            findings += found.len();
            output_bytes += text.len();
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
        .key("rules")
        .write_number(rules.len())
        .key("rounds")
        .write_number(rounds)
        .key("findings")
        .write_number(findings)
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
    report.end_object();
    println!("{}", report.finish());
}
