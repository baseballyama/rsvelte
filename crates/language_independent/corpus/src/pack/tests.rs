use super::{Entry, Pack, format};

fn entry<'a>(path: &'a str, attributes: &'a str, body: &'a str) -> Entry<'a> {
    Entry {
        path,
        attributes,
        body,
    }
}

#[test]
fn round_trips_any_body_and_sorts_by_path_then_attributes() {
    let entries = [
        entry("b.svelte", "js", "=== 3 fake\nheader\n"),
        entry("a/b.svelte", "", ""),
        entry("a", "js", "ü\n"),
        entry("a", "css", "no newline"),
    ];
    let text = format(entries);
    let pack = Pack::parse(text).expect("a formatted pack parses");
    let read: Vec<Entry<'_>> = pack.entries().collect();
    assert_eq!(
        read,
        [
            entry("a", "css", "no newline"),
            entry("a", "js", "ü\n"),
            entry("a/b.svelte", "", ""),
            entry("b.svelte", "js", "=== 3 fake\nheader\n"),
        ]
    );
    let a: Vec<&str> = pack.find("a").map(|e| e.attributes).collect();
    assert_eq!(a, ["css", "js"]);
    assert_eq!(pack.find("a/b").count(), 0);
}

#[test]
fn rejects_a_wrong_length_and_unsorted_entries() {
    let short = "# rsvelte pack 1\n=== 2 a\tjs\nabc\n".to_owned();
    Pack::parse(short).unwrap_err();
    let unsorted = "# rsvelte pack 1\n=== 0 b\n\n=== 0 a\n\n".to_owned();
    Pack::parse(unsorted).unwrap_err();
    Pack::parse("=== 0 a\n\n".to_owned()).unwrap_err();
}

#[test]
fn reads_the_format_the_oracle_writes() {
    // tools/oracle/pack.ts formatPack([{ path: 'x.svelte', attributes: ['svelte', 'runes', '-'],
    // body: 'é' }])
    let text = "# rsvelte pack 1\n=== 2 x.svelte\tsvelte\trunes\t-\n\u{e9}\n".to_owned();
    let pack = Pack::parse(text).expect("parses");
    assert_eq!(
        pack.entries().next(),
        Some(entry("x.svelte", "svelte\trunes\t-", "é"))
    );
}
