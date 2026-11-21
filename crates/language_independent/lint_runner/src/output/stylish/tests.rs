use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Finding;
use rsvelte_kernel::source::positions::Span;

use super::*;

const TEXT: &str = "let a = 1;\nlet bb = 2;\n";

struct Reports;

impl Task for Reports {
    fn identifier(&self) -> &'static str {
        "lint"
    }

    fn applies(&self, _: &Document) -> bool {
        true
    }

    fn run(&self, _: &DocumentContext<'_>, out: &mut TaskOutput) {
        let at = |text: &str| TEXT.find(text).expect("in the text") as u32;
        let finding = |diagnostic| Finding {
            diagnostic,
            fix: Vec::new(),
        };
        out.findings.push(finding(Diagnostic::warning(
            UNUSED_DIRECTIVE,
            "Unused eslint-disable directive.",
            Span::new(at("bb"), at("bb") + 2),
        )));
        out.findings.push(finding(Diagnostic::error(
            "no-unused-vars",
            "'a' is assigned a value but never used.",
            Span::new(at("a"), at("a") + 1),
        )));
    }
}

fn report(colors: bool) -> (String, usize) {
    let mut reg = Registry::new();
    reg.task(Reports);
    let documents = [Document::new("file.js", TEXT).expect("valid text")];
    let options = RunOptions {
        tasks: &[],
        sharing: Sharing::Shared,
        threads: Some(1),
    };
    let results = run(&reg, &documents, &options).expect("known tasks");
    render_stylish(&documents, &results, colors)
}

#[test]
fn rows_are_ordered_aligned_and_summarised_as_stylish_prints_them() {
    let (out, errors) = report(false);
    assert_eq!(errors, 1);
    assert_eq!(
        out,
        concat!(
            "\nfile.js\n",
            "  1:5  error    'a' is assigned a value but never used  no-unused-vars\n",
            "  2:5  warning  Unused eslint-disable directive\n",
            "\n\u{2716} 2 problems (1 error, 1 warning)\n",
            "  0 errors and 1 warning potentially fixable with the `--fix` option.\n",
            "\n",
        )
    );
}

#[test]
fn each_severity_has_its_own_colour() {
    let (out, _) = report(true);
    assert!(out.contains("\u{1b}[31merror  \u{1b}[0m"), "{out:?}");
    assert!(out.contains("\u{1b}[33mwarning\u{1b}[0m"), "{out:?}");
}
