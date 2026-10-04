use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, Severity, lint_source};

fn main() {
    let arguments: Vec<_> = std::env::args().collect();
    let rounds: usize = arguments[2].parse().expect("positive rounds");
    let inputs: Vec<_> = std::fs::read_to_string(&arguments[1])
        .expect("input list")
        .lines()
        .map(|path| (path.to_owned(), std::fs::read_to_string(path).expect("input")))
        .collect();
    let configuration = LintConfig::empty().with_override("svelte/button-has-type", Severity::Error);
    let control = lint_source("<button/>", std::path::Path::new("control.svelte"),
        &CompileOptions::default(), &configuration);
    assert_eq!(control.len(), 1, "missing type positive control");
    let mut output_bytes = 0;
    let mut findings = 0;
    for _ in 0..rounds {
        for (path, source) in &inputs {
            let options = CompileOptions { filename: Some(path.clone()), ..Default::default() };
            for diagnostic in lint_source(source, std::path::Path::new(path), &options, &configuration) {
                output_bytes += diagnostic.message.len();
                findings += 1;
            }
        }
    }
    println!(
        "{{\"documents\":{},\"rounds\":{},\"output_bytes\":{},\"findings\":{}}}",
        inputs.len(), rounds, output_bytes, findings
    );
}
