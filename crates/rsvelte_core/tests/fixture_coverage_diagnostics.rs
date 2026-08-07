//! `FixtureCoverage`'s empty-suite diagnostic must name the directory it
//! searched and the remedy for *that* directory's tree.
//!
//! The assertion is shared by suites rooted in two different trees — 13
//! instances under `submodules/svelte/`, 8 under the generated `fixtures/`
//! tree — so a single wording is wrong for one group or the other:
//! `generate-fixtures` writes only `fixtures/`, and cannot populate a
//! submodule. These tests pin both directions, because a message that is
//! merely *plausible* for the tree in front of the reader is what sent people
//! to the wrong command.

mod common;

use common::{FixtureCoverage, fixture_samples_dir, svelte_samples_dir};

/// Panic payload of `coverage.assert(0)`, which an empty ledger always trips.
fn empty_suite_message(searched: std::path::PathBuf) -> String {
    let coverage = FixtureCoverage::new("probe", searched, 0);
    let payload = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        // Silence the default hook: this panic is the value under test.
        let hook = std::panic::take_hook();
        std::panic::set_hook(Box::new(|_| {}));
        let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| coverage.assert(0)));
        std::panic::set_hook(hook);
        r
    }))
    .expect("outer catch_unwind")
    .expect_err("assert(0) on a zero-sample ledger must panic");

    payload
        .downcast_ref::<String>()
        .cloned()
        .or_else(|| payload.downcast_ref::<&str>().map(|s| (*s).to_string()))
        .expect("panic payload should be a string")
}

/// The remedy alone, with the `…: no sample directories under <path>` header
/// dropped. Tests must assert on this rather than on the whole message: the
/// header always differs between the two roots because it embeds the path, so
/// a whole-message comparison passes even when both roots share one remedy —
/// which is precisely the defect under test.
fn remedy_of(searched: std::path::PathBuf) -> String {
    let msg = empty_suite_message(searched);
    let (_header, remedy) = msg
        .split_once('\n')
        .expect("message should carry a remedy on its own line");
    remedy.trim().to_string()
}

#[test]
fn submodule_rooted_suite_names_the_path_and_never_suggests_generate_fixtures() {
    let searched = svelte_samples_dir("no-such-category");
    let msg = empty_suite_message(searched.clone());

    assert!(
        msg.contains(&searched.display().to_string()),
        "message must name the directory it searched, got: {msg}"
    );
    // The load-bearing half: `generate-fixtures` writes `fixtures/`, so it can
    // never populate this path. Suggesting it sends the reader to a command
    // that is expensive here and cannot help.
    assert!(
        !msg.contains("generate-fixtures"),
        "a submodule-rooted suite must not suggest generate-fixtures, got: {msg}"
    );
}

#[test]
fn fixtures_rooted_suite_suggests_generate_fixtures_and_not_the_submodule() {
    let searched = fixture_samples_dir("no-such-category");
    let msg = empty_suite_message(searched.clone());
    let remedy = remedy_of(searched.clone());

    assert!(
        msg.contains(&searched.display().to_string()),
        "message must name the directory it searched, got: {msg}"
    );
    assert!(
        remedy.contains("generate-fixtures"),
        "a fixtures-rooted suite must suggest generate-fixtures, got: {remedy}"
    );
    // The mirror of the assertion above: nothing about the submodule can
    // create the generated tree, so mentioning it here is the same defect
    // reversed. Asserted on the remedy, not the message, because the searched
    // path is free to contain any word.
    assert!(
        !remedy.contains("submodule"),
        "a fixtures-rooted suite must not point at the submodule, got: {remedy}"
    );
}

/// The two branches must not collapse into one wording. Compared on the remedy
/// only — comparing whole messages passes trivially, because each embeds its
/// own path, and that is exactly how a single shared remedy would slip through.
#[test]
fn the_two_roots_produce_different_remedies() {
    let submodule = remedy_of(svelte_samples_dir("no-such-category"));
    let fixtures = remedy_of(fixture_samples_dir("no-such-category"));
    assert_ne!(
        submodule, fixtures,
        "the same remedy for both trees is the defect this change removes"
    );
}
