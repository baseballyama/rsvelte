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
