//! Regression fixture: a 200-case sample of real `class="…"` attribute values
//! taken from the shadcn-svelte / flowbite-svelte / bits-ui corpora, each paired
//! with the ordering produced by the real `prettier-plugin-tailwindcss` sorter
//! against a default (`@import "tailwindcss";`, no config/plugins) stylesheet.
//!
//! Every case here is one this crate reproduces byte-for-byte; the file locks
//! that parity in-repo without needing the Node oracle. The overall parity rate
//! over the *full* corpus (3,806 unique lists) is recorded in `README.md`; the
//! classes this crate cannot yet match are documented there too.

use tailwind_class_order::sort_class_string;

#[derive(serde::Deserialize)]
struct Case {
    input: String,
    expected: String,
}

#[test]
fn corpus_fixture_parity() {
    let raw = include_str!("corpus_fixture.json");
    let cases: Vec<Case> = serde_json::from_str(raw).expect("valid fixture json");
    assert!(!cases.is_empty());

    let mut failures = Vec::new();
    for case in &cases {
        let got = sort_class_string(&case.input);
        if got != case.expected {
            failures.push(format!(
                "\n  input:    {:?}\n  expected: {:?}\n  got:      {:?}",
                case.input, case.expected, got
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} / {} fixture cases diverged from the oracle:{}",
        failures.len(),
        cases.len(),
        failures.join("")
    );
}
