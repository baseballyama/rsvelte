use super::*;

// Captured from tsc 7.0.2 `--pretty true`, colours stripped.
const REPORT: &str = "f0.ts:1:5 - error TS2322: Type '(x: string) => number' is not \
                          assignable to type '(x: number) => string'.
  Types of parameters 'x' and 'x' are incompatible.
    Type 'number' is not assignable to type 'string'.

1 let f: (x: number) => string = (x: string) => 1;
      ~

f1.ts:3:3 - error TS2783: 'a' is specified more than once, so this usage will be overwritten.

3   a: 1,
    ~~~~

  f1.ts:4:3 - This spread always overwrites this property.
    4   ...{ a: \"x\" },
        ~~~~~~~~~~~~~


Found 2 errors in 2 files.

Errors  Files
     1  f0.ts:1
     1  f1.ts:3
";

#[test]
fn parses_chains_underlines_and_skips_related_information() {
    let files = [
        "let f: (x: number) => string = (x: string) => 1;\n".to_owned(),
        "const big = {\n\n  a: 1,\n  ...{ a: \"x\" },\n};\n".to_owned(),
    ];
    let index: Vec<LineIndex> = files.iter().map(|f| LineIndex::new(f)).collect();
    let got = parse_report(REPORT, |f, l, c| index[f].offset(l, c)).unwrap();
    assert_eq!(got.len(), 2);
    assert_eq!(got[0].code, 2322);
    assert_eq!(
        got[0].message,
        "Type '(x: string) => number' is not assignable to type '(x: number) => string'.\
             \n  Types of parameters 'x' and 'x' are incompatible.\
             \n    Type 'number' is not assignable to type 'string'."
    );
    assert_eq!(got[0].span.text(&files[0]), "f");
    assert_eq!((got[1].file, got[1].span.text(&files[1])), (1, "a: 1"));
}

#[test]
fn a_count_that_disagrees_with_the_summary_is_an_error() {
    let files = ["let f: (x: number) => string = (x: string) => 1;\n".to_owned()];
    let index = LineIndex::new(&files[0]);
    let truncated = format!(
        "{}Found 2 errors in 2 files.\n",
        REPORT.split("f1.ts:3:3").next().unwrap()
    );
    let got = parse_report(&truncated, |_, l, c| index.offset(l, c));
    assert!(got.unwrap_err().contains("reported 2 error(s), parsed 1"));
}

#[test]
fn an_empty_span_at_a_line_end_is_empty() {
    // tsc 7.0.2 `--pretty true`, colours stripped: the underline sits one column past the line.
    let report = "f0.ts:2:12 - error TS1109: Expression expected.\n\n2 let t = s +\
                      \n             ~\n\n\nFound 1 error in f0.ts:2\n\n";
    let files = ["let s = 1;\nlet t = s +\n".to_owned()];
    let index = LineIndex::new(&files[0]);
    let got = parse_report(report, |_, l, c| index.offset(l, c)).unwrap();
    let end = files[0].find(" +").unwrap() as u32 + 2;
    assert_eq!(got[0].span, Span::new(end, end));
}

#[test]
fn an_unknown_line_is_an_error() {
    let got = parse_report("error TS5083: Cannot read file 'x'.\n", |_, _, _| Some(0));
    got.unwrap_err();
}
