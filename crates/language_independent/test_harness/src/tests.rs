use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::task::{Task, TaskOutput};

use super::*;

#[derive(Debug)]
struct Findings;

impl Task for Findings {
    fn identifier(&self) -> &'static str {
        "test.findings"
    }

    fn applies(&self, _: &Document) -> bool {
        true
    }

    fn run(&self, _: &DocumentContext<'_>, out: &mut TaskOutput) {
        out.file("json", "[]\n".to_owned());
    }
}

fn scratch(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!("rsvelte-{name}-{}", std::process::id()));
    drop(std::fs::remove_dir_all(&root));
    root
}

#[test]
fn shared_inputs_keep_this_crates_snapshots() {
    let root = scratch("shared-inputs");
    let shared = root.join("compile");
    let own = root.join("typecheck");
    let case = shared.join("tests/fixtures/rsvelte/case");
    std::fs::create_dir_all(&case).unwrap();
    std::fs::write(case.join("input.svelte"), "<p />").unwrap();
    let mut registry = Registry::new();
    registry.task(Findings);
    let fixtures = Fixtures::new(own.to_str().unwrap(), registry)
        .inputs_from(shared.to_str().unwrap())
        .snapshot("test.findings", "findings");
    let cases = fixtures.cases().unwrap();
    assert_eq!(cases.len(), 1);
    assert_eq!(cases[0].name, "rsvelte/case");
    assert_eq!(cases[0].dir, own.join("tests/fixtures/rsvelte/case"));
    let documents = [cases[0].document().unwrap()];
    let outcome = fixtures.check(&cases, &documents, true).unwrap();
    assert_eq!(outcome.written, 1);
    assert!(
        own.join("tests/fixtures/rsvelte/case/expected/findings.json")
            .is_file()
    );
    assert!(
        !case.join("actual").exists(),
        "the other crate's case is untouched"
    );
    std::fs::remove_dir_all(root).unwrap();
}

#[test]
fn a_copied_case_is_compared_but_its_official_output_never_written() {
    let root = scratch("copied");
    let source = root.join("tests/fixtures/upstream");
    std::fs::create_dir_all(&source).unwrap();
    std::fs::write(source.join("source.json"), "{}").unwrap();
    let case = source.join("src/input");
    std::fs::create_dir_all(case.join("expected")).unwrap();
    std::fs::write(case.join("input.svelte"), "<p />").unwrap();
    let expected = case.join("expected/findings.json");
    std::fs::write(&expected, "[]\n").unwrap();
    let mut registry = Registry::new();
    registry.task(Findings);
    let fixtures =
        Fixtures::new(root.to_str().unwrap(), registry).snapshot("test.findings", "findings");
    let cases = fixtures.cases().unwrap();
    assert_eq!(cases.len(), 1);
    assert_eq!(cases[0].name, "upstream/src/input");
    assert_eq!(
        cases[0].document().unwrap().path,
        "src/input",
        "the document is named by its path in the copied source"
    );
    let documents = [cases[0].document().unwrap()];
    let same = fixtures.check(&cases, &documents, false).unwrap();
    assert_eq!((same.same, same.problems), (1, 0));
    std::fs::write(&expected, "[1]\n").unwrap();
    let differs = fixtures.check(&cases, &documents, true).unwrap();
    assert_eq!(
        (differs.problems, differs.written),
        (1, 0),
        "a difference fails, and update does not write the official output"
    );
    assert_eq!(std::fs::read_to_string(&expected).unwrap(), "[1]\n");
    assert_eq!(
        std::fs::read_to_string(case.join("actual/findings.json")).unwrap(),
        "[]\n"
    );
    std::fs::remove_dir_all(root).unwrap();
}

#[test]
fn a_copied_case_in_differs_txt_must_differ() {
    let root = scratch("differs");
    let source = root.join("tests/fixtures/upstream");
    let case = source.join("src/input");
    std::fs::create_dir_all(case.join("expected")).unwrap();
    std::fs::write(source.join("source.json"), "{}").unwrap();
    std::fs::write(case.join("input.svelte"), "<p />").unwrap();
    let expected = case.join("expected/findings.json");
    std::fs::write(&expected, "[1]\n").unwrap();
    let differs = source.join("differs.txt");
    std::fs::write(&differs, "# a reason\nsrc/input\n").unwrap();
    let mut registry = Registry::new();
    registry.task(Findings);
    let fixtures =
        Fixtures::new(root.to_str().unwrap(), registry).snapshot("test.findings", "findings");
    let cases = fixtures.cases().unwrap();
    assert!(cases[0].differs);
    let documents = [cases[0].document().unwrap()];
    let listed = fixtures.check(&cases, &documents, false).unwrap();
    assert_eq!((listed.differ, listed.problems), (1, 0));
    std::fs::write(&expected, "[]\n").unwrap();
    let fixed = fixtures.check(&cases, &documents, false).unwrap();
    assert_eq!((fixed.differ, fixed.problems), (0, 1));
    assert!(fixed.messages[0].contains("remove it from differs.txt"));
    std::fs::write(&differs, "src/input\nsrc/gone\n").unwrap();
    assert!(fixtures.cases().is_err(), "unsorted");
    std::fs::write(&differs, "src/gone\nsrc/input\n").unwrap();
    let error = fixtures.cases().err().unwrap();
    assert!(error.ends_with("src/gone is no case"), "{error}");
    std::fs::remove_dir_all(root).unwrap();
}
