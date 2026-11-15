use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::task::{Task, TaskOutput};

use super::*;

struct Panics;

impl Task for Panics {
    fn identifier(&self) -> &'static str {
        "test.panics"
    }

    fn applies(&self, document: &Document) -> bool {
        document.path.starts_with("panics")
    }

    fn run(&self, _: &DocumentContext<'_>, _: &mut TaskOutput) {
        panic!("injected");
    }
}

#[test]
fn a_panicking_document_is_reported_not_measured_as_less_work() {
    let mut reg = Registry::new();
    reg.task(Panics);
    let docs = [
        reg.document("fine.txt", "").expect("small"),
        reg.document("panics.txt", "").expect("small"),
    ];
    let m = measure(&reg, &docs, &["test.panics"], 1);
    assert_eq!(
        m.panicked,
        [("panics.txt".to_owned(), "injected".to_owned())]
    );
    let options = Options::parse(&["dir"]).expect("valid").1;
    let report = report(&m, &docs, 0, &["test.panics"], &options);
    assert!(report.contains(r#""path": "panics.txt""#), "{report}");
    assert!(report.contains(r#""panic": "injected""#), "{report}");
}

#[test]
fn rounds_are_whole_numbers() {
    assert!(Options::parse(&["dir", "rounds=-1"]).is_err());
    assert_eq!(
        Options::parse(&["dir", "rounds=0"])
            .expect("valid")
            .1
            .rounds,
        0
    );
    assert_eq!(
        Options::parse(&["dir", "rounds=3"])
            .expect("valid")
            .1
            .rounds,
        3
    );
}

#[test]
fn the_hash_is_fnv1a() {
    assert_eq!(fnv1a(b""), 0xCBF2_9CE4_8422_2325);
    assert_eq!(fnv1a(b"a"), 0xAF63_DC4C_8601_EC8C);
}

#[test]
fn adding_a_document_keeps_the_others_sampled_or_not() {
    let reg = Registry::new();
    let picked = |names: &[String]| {
        let docs = names
            .iter()
            .map(|name| reg.document(name, "").expect("small"))
            .collect();
        let dirs: Vec<PathBuf> = names
            .iter()
            .map(|name| Path::new("/root").join(name).join("actual"))
            .collect();
        sample(docs, &dirs, &[Path::new("/root")], 4)
            .into_iter()
            .map(|doc| doc.path)
            .collect::<Vec<_>>()
    };
    let mut names: Vec<String> = (0..40).map(|i| format!("unit-{i:02}")).collect();
    let before = picked(&names);
    assert!(
        !before.is_empty() && before.len() < names.len(),
        "{before:?}"
    );
    names.insert(1, "unit-00a".to_owned());
    let after: Vec<String> = picked(&names)
        .into_iter()
        .filter(|name| name != "unit-00a")
        .collect();
    assert_eq!(before, after);
}
