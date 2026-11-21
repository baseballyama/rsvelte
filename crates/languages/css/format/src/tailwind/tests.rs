use std::path::Path;

use rsvelte_test_harness::NodePackages;

use super::{ClassList, Options, Sorter, sorted_part};

fn part(text: &str, first: bool, last: bool) -> Option<&str> {
    sorted_part(text, first, last).map(|(start, end)| &text[start..end])
}

#[test]
fn the_sorted_part_leaves_the_classes_that_touch_an_expression() {
    assert_eq!(part("p-4 m-2", false, false), Some("p-4 m-2"));
    assert_eq!(part("a p-4  m-2", true, false), Some("p-4  m-2"));
    assert_eq!(part("p-4 m-2\nb", false, true), Some("p-4 m-2"));
    assert_eq!(part("a p-4 m-2 b", true, true), Some("p-4 m-2"));
    assert_eq!(part("a b", true, true), Some(""));
    assert_eq!(part("a", true, true), Some(""));
    assert_eq!(part("{{ a }} b", false, false), None);
    assert_eq!(part("", false, false), None);
}

/// The oracle's Tailwind: its default theme (`tools/oracle/tasks/tailwind.css`).
fn oracle() -> std::sync::Arc<Sorter> {
    let packages = NodePackages::locate();
    let options = Options {
        stylesheet: Some("tasks/tailwind.css".into()),
        ..Options::default()
    };
    Sorter::start(&options, packages.directory()).unwrap()
}

#[test]
fn sorts_as_the_plugin_sorts_in_each_place() {
    let list = |text, collapse_whitespace, remove_duplicates| ClassList {
        text,
        collapse_whitespace,
        remove_duplicates,
    };
    let file = NodePackages::locate().directory().join("x.svelte");
    let sorted = oracle()
        .sort(
            &file,
            &[
                list(" p-4  m-2 p-4 unknown ", true, true),
                list(" p-4  m-2 p-4 unknown ", false, true),
                list(" p-4  m-2 p-4 unknown ", false, false),
            ],
        )
        .unwrap();
    assert_eq!(
        sorted,
        [
            "unknown m-2 p-4",
            " unknown  m-2 p-4 ",
            " unknown  m-2 p-4 p-4 ",
        ]
    );
}

#[test]
fn a_missing_plugin_is_said_once() {
    let error = Sorter::start(&Options::default(), Path::new("/")).unwrap_err();
    assert!(
        error.contains("cannot find prettier-plugin-tailwindcss from /"),
        "{error}"
    );
}
