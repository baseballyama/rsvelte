//! `generateDocumentation` is ported, not wrapped, so the port is compared to
//! the function itself on every entry `vscode-html-languageservice` ships.
//! Regenerate the fixture with `node scripts/dev/generate-html-data.mjs`.

use std::collections::BTreeMap;

use serde::Deserialize;

use rsvelte_language_server::html_data::documentation::{Entry, documentation};
use rsvelte_language_server::html_data::web::{
    BASELINE_HIGH_IMAGE, BASELINE_LIMITED_IMAGE, BASELINE_LOW_IMAGE, GLOBAL_ATTRIBUTES, TAGS,
};

const ORACLE: &str = include_str!("data/html-documentation.json");

/// The fixture carries a token where upstream inlines ~1.5 KB of base64, so
/// the rows stay readable; the images themselves are pinned below.
fn tokenize(value: String) -> String {
    value
        .replace(BASELINE_LIMITED_IMAGE, "<BASELINE_LIMITED>")
        .replace(BASELINE_LOW_IMAGE, "<BASELINE_LOW>")
        .replace(BASELINE_HIGH_IMAGE, "<BASELINE_HIGH>")
}

#[derive(Deserialize)]
struct Oracle {
    images: BTreeMap<String, String>,
    entries: BTreeMap<String, [Option<String>; 2]>,
}

/// Tokenizing an image on both sides makes a corrupted constant replace itself,
/// so the URIs are compared to upstream's own bytes first.
#[test]
fn the_baseline_images_are_the_ones_upstream_ships() {
    let oracle: Oracle = serde_json::from_str(ORACLE).expect("parse the documentation oracle");
    assert_eq!(oracle.images["BASELINE_LIMITED"], BASELINE_LIMITED_IMAGE);
    assert_eq!(oracle.images["BASELINE_LOW"], BASELINE_LOW_IMAGE);
    assert_eq!(oracle.images["BASELINE_HIGH"], BASELINE_HIGH_IMAGE);
}

#[test]
fn every_entry_documents_itself_the_way_upstream_does() {
    let expected = serde_json::from_str::<Oracle>(ORACLE)
        .expect("parse the documentation oracle")
        .entries;

    let mut actual: BTreeMap<String, [Option<String>; 2]> = BTreeMap::new();
    let mut record = |key: String, entry: Entry| {
        let rendered = [
            documentation(&entry, true).map(tokenize),
            documentation(&entry, false).map(tokenize),
        ];
        assert!(
            actual.insert(key.clone(), rendered).is_none(),
            "{key} twice"
        );
    };
    for tag in TAGS {
        record(
            format!("tag:{}", tag.name),
            Entry {
                description: tag.description,
                status: tag.status.as_ref(),
                browsers: tag.browsers,
                references: tag.references,
            },
        );
        for (index, attribute) in tag.attributes.iter().enumerate() {
            record(
                format!("tag:{}/attr:{index}:{}", tag.name, attribute.name),
                Entry {
                    description: attribute.description,
                    status: attribute.status.as_ref(),
                    browsers: attribute.browsers,
                    references: attribute.references,
                },
            );
        }
    }
    for (index, attribute) in GLOBAL_ATTRIBUTES.iter().enumerate() {
        record(
            format!("global:{index}:{}", attribute.name),
            Entry {
                description: attribute.description,
                status: attribute.status.as_ref(),
                browsers: attribute.browsers,
                references: attribute.references,
            },
        );
    }

    assert_eq!(
        actual.keys().collect::<Vec<_>>(),
        expected.keys().collect::<Vec<_>>(),
        "the vendored data and the oracle describe different entries"
    );
    let divergent: Vec<&String> = expected
        .keys()
        .filter(|key| expected[*key] != actual[*key])
        .collect();
    assert!(
        divergent.is_empty(),
        "{} of {} entries diverge, first: {:?}\n  upstream: {:?}\n  rsvelte:  {:?}",
        divergent.len(),
        expected.len(),
        divergent[0],
        expected[divergent[0]],
        actual[divergent[0]],
    );
}
