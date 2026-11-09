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

/// `sh` stands in for a type checker: `$@` holds what rsvelte passed after the user's arguments.
#[cfg(unix)]
fn shell(script: &str, own: &[&str]) -> Tsc {
    let mut arguments = vec!["-c".to_owned(), script.to_owned(), "sh".to_owned()];
    arguments.extend(own.iter().map(|a| (*a).to_owned()));
    Tsc {
        checker: TypeChecker {
            program: "/bin/sh".into(),
            arguments,
        },
        tsconfig: None,
    }
}

#[cfg(unix)]
#[test]
fn the_type_checker_gets_its_own_arguments_before_the_contract() {
    let tsc = shell(r#"printf '%s|' "$@" >&2; exit 1"#, &["--fast"]);
    let error = tsc.check(&CheckRequest::default()).unwrap_err();
    assert!(
        error.contains("--fast|-p|.|--pretty|true|--runExternalCode|"),
        "{error}"
    );
}

#[cfg(unix)]
#[test]
fn a_type_checker_without_the_command_line_names_the_contract() {
    let tsc = shell(
        "echo \"error TS5023: Unknown compiler option '--runExternalCode'.\"; exit 1",
        &[],
    );
    let error = tsc.check(&CheckRequest::default()).unwrap_err();
    assert!(
        error.contains(CONTRACT) && error.contains("TS5023"),
        "{error}"
    );
}

#[test]
fn only_a_typescript_older_than_7_1_is_refused() {
    assert_eq!(typescript_before_7_1("Version 5.9.3"), Some("5.9.3"));
    assert_eq!(typescript_before_7_1("Version 7.0.2"), Some("7.0.2"));
    assert_eq!(typescript_before_7_1("Version 7.1.0-dev.20261102.1"), None);
    assert_eq!(typescript_before_7_1("Version 8.0.0"), None);
    assert_eq!(typescript_before_7_1("tsrs 0.21.0"), None);
}

#[cfg(unix)]
fn checker(program: &str) -> TypeChecker {
    TypeChecker {
        program: program.into(),
        arguments: Vec::new(),
    }
}

#[cfg(unix)]
#[test]
fn identify_says_what_to_change() {
    let missing = checker("rsvelte-no-such-type-checker")
        .identify()
        .unwrap_err();
    assert!(
        missing.contains("on PATH") && missing.contains("typescript.check"),
        "{missing}"
    );
    let path = checker("/rsvelte/no/such/tsc").identify().unwrap_err();
    assert!(path.contains("does not exist"), "{path}");
    let shell = |script: &str| TypeChecker {
        program: "/bin/sh".into(),
        arguments: vec!["-c".into(), script.into(), "sh".into()],
    };
    let old = shell("echo 'Version 5.9.3'").identify().unwrap_err();
    assert!(old.contains("TypeScript 5.9.3"), "{old}");
    let failing = shell("echo broken >&2; exit 3").identify().unwrap_err();
    assert!(failing.contains("broken"), "{failing}");
    assert_eq!(
        shell("echo 'tsrs 0.21.0'").identify(),
        Ok("tsrs 0.21.0".to_owned())
    );
}
