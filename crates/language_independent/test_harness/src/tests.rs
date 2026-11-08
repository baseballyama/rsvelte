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
    let outcome = fixtures.check(&cases, &documents, true, true).unwrap();
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
fn corpus_units_are_measured_only_against_an_official_output() {
    let root = scratch("corpus");
    let own = root.join("crate");
    std::fs::create_dir_all(own.join("tests/fixtures")).unwrap();
    let unit = root.join("corpus/svelte/source/src/~input.svelte");
    std::fs::create_dir_all(&unit).unwrap();
    std::fs::write(unit.join("input.svelte"), "<p />").unwrap();
    // Another task's output, written by `rsvelte corpus`.
    let other = unit.join("actual/svelte.compile/client.js");
    std::fs::create_dir_all(other.parent().unwrap()).unwrap();
    std::fs::write(&other, "x").unwrap();
    let mut registry = Registry::new();
    registry.task(Findings);
    let mut fixtures =
        Fixtures::new(own.to_str().unwrap(), registry).snapshot("test.findings", "findings");
    fixtures.corpus = Some((root.join("corpus"), "svelte"));
    let cases = fixtures.cases().unwrap();
    assert_eq!(cases.len(), 1);
    assert_eq!(cases[0].name, "svelte/source/src/input.svelte");
    assert_eq!(
        cases[0].document().unwrap().path,
        "src/input.svelte",
        "the document is named by its path in the repository"
    );
    let documents = [cases[0].document().unwrap()];
    fixtures.check(&cases, &documents, false, false).unwrap();
    assert!(
        !unit.join("actual/test.findings").exists(),
        "a corpus unit's actual/ is written only when asked"
    );
    let outcome = fixtures.check(&cases, &documents, true, true).unwrap();
    assert_eq!(outcome.unmeasured, 1, "no official output is not a match");
    assert!(outcome.tallies.is_empty() && outcome.parity.is_empty());
    assert_eq!(
        outcome.written, 0,
        "update never writes the official output"
    );
    assert_eq!(
        std::fs::read_to_string(unit.join("actual/test.findings/default.json")).unwrap(),
        "[]\n"
    );
    assert!(other.is_file(), "other tasks' outputs stay");
    let expected = unit.join("expected/test.findings");
    std::fs::create_dir_all(&expected).unwrap();
    std::fs::write(expected.join("default.json"), "[]\n").unwrap();
    let key = "test.findings/default svelte/source/src/input.svelte".to_owned();
    let control = fixtures.check(&cases, &documents, false, true).unwrap();
    assert_eq!(control.unmeasured, 0);
    assert_eq!(control.parity, [(key.clone(), Some(Verdict::Match))]);
    std::fs::write(expected.join("default.json"), "[1]\n").unwrap();
    let differs = fixtures.check(&cases, &documents, false, true).unwrap();
    assert_eq!(differs.parity, [(key, Some(Verdict::Mismatch))]);
    std::fs::write(
        unit.join("fixture.toml"),
        "[skip]\n\"test.findings\" = \"a reason\"\n",
    )
    .unwrap();
    let cases = fixtures.cases().unwrap();
    let skipped = fixtures.check(&cases, &documents, false, true).unwrap();
    assert_eq!(
        (skipped.unmeasured, skipped.parity.len()),
        (1, 0),
        "a skipped task is not compared"
    );
    std::fs::remove_dir_all(root).unwrap();
}
