use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::finding::{Finding, apply_fixes};

/// What `svelte/indent` reports, with the line of each, 1-based.
fn findings(source_text: &str) -> Vec<(u32, Finding)> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    configuration
        .rule("svelte/indent", Severity::Error, &[], &[])
        .expect("a known rule");
    let lines = context.ecmascript_line_index();
    crate::lint(&context, &configuration)
        .expect("source parses")
        .into_iter()
        .map(|f| (lines.line(f.diagnostic.span.start_offset), f))
        .collect()
}

fn reported_lines(source_text: &str) -> Vec<u32> {
    findings(source_text).into_iter().map(|(l, _)| l).collect()
}

fn fixed(source_text: &str) -> String {
    let findings: Vec<Finding> = findings(source_text).into_iter().map(|(_, f)| f).collect();
    apply_fixes(source_text, &findings)
}

#[test]
fn type_syntax_the_tree_does_not_hold_is_not_checked() {
    // Line 4 is a type, which the parameter list would otherwise place; line 6 is JavaScript.
    let typescript = "<script lang=\"ts\">\n  function f(\n    b:\n        number\n  ) {}\nlet c = 1;\n</script>\n";
    assert_eq!(reported_lines(typescript), [6]);
    // The same shape in JavaScript is checked.
    let javascript = typescript.replace(" lang=\"ts\"", "").replace("b:", "b =");
    assert_eq!(reported_lines(&javascript), [4, 6]);
}

#[test]
fn a_shorthand_property_with_a_default_is_a_pattern() {
    let source = "<script>\n  ({\n  a = 1\n  } = v);\n</script>\n";
    assert_eq!(reported_lines(source), [3]);
}

#[test]
fn deep_nesting_on_one_line_is_linear() {
    let depth = 8000;
    let source = format!(
        "<script>\n  let x = {}1{};\n</script>\n",
        "f(".repeat(depth),
        ")".repeat(depth)
    );
    let started = std::time::Instant::now();
    let lines = std::thread::Builder::new()
        .stack_size(256 << 20)
        .spawn(move || reported_lines(&source))
        .expect("a thread")
        .join()
        .expect("no panic");
    assert_eq!(lines, [0u32; 0]);
    // A walk of every base chain per token takes tens of seconds here.
    assert!(started.elapsed().as_secs() < 3, "{:?}", started.elapsed());
}

#[test]
fn an_implicitly_closed_element_does_not_take_a_child_end_tag() {
    let p = "<div>\n<p>\n  text <b>x\n    </b>\n<div>y</div>\n</div>\n";
    assert_eq!(reported_lines(p), [2, 5]);
    let li = "<ul>\n<li>one <i>a\n    </i>\n  <li>two\n</ul>\n";
    assert_eq!(reported_lines(li), [2]);
}

#[test]
fn a_snippet_without_parameters_takes_its_own_parentheses() {
    // Upstream takes `baz(` for the parameter list and reports line 5; see upstream_issues.md.
    let source = "<div>\n  {#snippet foo()}\n    <p>\n      {@render baz()\n          }\n    </p>\n  {/snippet}\n</div>\n";
    assert_eq!(reported_lines(source), [0u32; 0]);
    // With a parameter, upstream finds the right parentheses and reports nothing either.
    assert_eq!(
        reported_lines(&source.replace("foo()", "foo(a)")),
        [0u32; 0]
    );
}

#[test]
fn lines_end_at_every_ecmascript_line_terminator() {
    let source = "<div>\n<p>x</p>\n</div>\n<script>\nlet a;\n  let b;\n</script>\n";
    for terminator in ["\n", "\r\n", "\r", "\u{2028}", "\u{2029}"] {
        let source = source.replace('\n', terminator);
        assert_eq!(reported_lines(&source), [2, 5], "{terminator:?}");
    }
}

#[test]
fn indentation_is_ecmascript_whitespace() {
    // U+0085 is text to JavaScript, so the fix keeps it; U+FEFF is indentation.
    assert_eq!(
        fixed("<div>\n\u{85}<p>x</p>\n</div>\n"),
        "<div>\n  \u{85}<p>x</p>\n</div>\n"
    );
    assert_eq!(
        fixed("<div>\n\u{feff}<p>x</p>\n</div>\n"),
        "<div>\n  <p>x</p>\n</div>\n"
    );
}

#[test]
fn raw_text_and_script_attribute_values_are_words() {
    let head = "<svelte:head>\n  <script type=\"application/ld+json\">\n{\n\"a\": 1\n}\n    </script>\n</svelte:head>\n";
    assert_eq!(reported_lines(head), [3, 4, 5, 6]);
    let attribute =
        "<script\n  data-x=\"a\nb\"\n>\n  let a;\n</script>\n<div\n  data-x=\"a\nb\"\n></div>\n";
    assert_eq!(reported_lines(attribute), [3, 9]);
}

#[test]
fn only_lines_that_start_inside_a_type_are_not_checked() {
    // Line 4 starts inside the type, so the array after it is checked from there.
    let array =
        "<script lang=\"ts\">\n  let v: Array<{\n    k: string;\n  }> = [\n  1,\n  ];\n</script>\n";
    assert_eq!(reported_lines(array), [5]);
    let class = "<script lang=\"ts\">\n  class K<T extends {\n    a: 1;\n  }> {\n    x = 1;\n  }\n</script>\n";
    assert_eq!(reported_lines(class), [0u32; 0]);
}

#[test]
fn ignored_nodes_selectors_are_refused() {
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    let options = serde_json::value::RawValue::from_string(
        r#"{"ignoredNodes":["ConditionalExpression"]}"#.to_owned(),
    )
    .expect("JSON options");
    let refused = configuration
        .rule("svelte/indent", Severity::Error, &[options], &[])
        .map(drop);
    assert_eq!(
        refused,
        Err("rule `svelte/indent`: `ignoredNodes` selectors are not supported".to_owned())
    );
}
