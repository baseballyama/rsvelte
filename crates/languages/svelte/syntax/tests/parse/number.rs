use rsvelte_svelte_syntax::parse::parse;

/// What svelte 5.59.1 reports, and where, for a number acorn cannot read.
const NUMBERS: &str = include_str!("number.txt");

#[test]
fn acorn_reads_a_number_to_its_first_error() {
    for cell in NUMBERS.lines() {
        let (source, expected) = cell.rsplit_once(" => ").expect(cell);
        let error = parse(source).expect_err(source);
        assert_eq!(
            error.code, "js_parse_error",
            "{source:?}: svelte says {expected}"
        );
    }
}
