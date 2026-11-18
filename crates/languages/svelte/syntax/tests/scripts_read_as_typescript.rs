//! A script the compiler rejects, read as Prettier's Svelte plugin reads it: as TypeScript, and
//! past it when TypeScript rejects it too. The compiler's read does not change.

use rsvelte_svelte_syntax::parse::{parse, parse_reading_scripts_as_typescript};

fn at(source: &str, text: &str) -> u32 {
    source.find(text).expect("the text") as u32
}

#[test]
fn a_plain_script_that_only_typescript_reads_keeps_its_program() {
    let source = "<script>\n\tclass C {\n\t\tprivate m() {}\n\t}\n</script>\n\n<p>{C}</p>\n";
    let strict = parse(source).expect_err("acorn stops at the modifier");
    assert_eq!(strict.code, "js_parse_error");
    assert_eq!(strict.span.start_offset, at(source, "m() {}"));

    let component = parse_reading_scripts_as_typescript(source).expect("TypeScript reads it");
    assert!(component.script_typescript_errors.is_empty());
    let instance = component.instance.as_ref().expect("the script");
    let program = component.javascript.get_program(instance.program);
    assert_eq!(program.body.len(), 1);
}

#[test]
fn a_script_typescript_rejects_too_is_empty_and_keeps_its_errors() {
    for source in [
        "<script>\n\tlet x = ;\n</script>\n\n<p>a</p>\n",
        "<script lang=\"ts\">\n\tlet x = ;\n</script>\n\n<p>a</p>\n",
    ] {
        let strict = parse(source).expect_err(source);
        assert_eq!(strict.code, "js_parse_error", "{source}");

        let component = parse_reading_scripts_as_typescript(source).expect(source);
        let first = component.script_typescript_errors.first().expect(source);
        assert_eq!(
            first.diagnostic.span.start_offset,
            at(source, ";"),
            "{source}"
        );
        let instance = component.instance.as_ref().expect(source);
        assert!(
            component
                .javascript
                .get_program(instance.program)
                .body
                .is_empty()
        );
        assert!(!component.children(component.root).is_empty(), "{source}");
    }
}

#[test]
fn the_first_script_typescript_rejects_gives_the_errors() {
    let source = "<script>\n\tclass C { private m() {} }\n</script>\n<script module>\n\tlet x = ;\n\
                  </script>\n<script>\n\tconst y = ;\n</script>\n";
    let error = parse_reading_scripts_as_typescript(source).expect_err("a second instance");
    assert_eq!(error.code, "script_duplicate");

    let source = "<script module>\n\tlet x = ;\n</script>\n<script>\n\tconst y = ;\n</script>\n";
    let component = parse_reading_scripts_as_typescript(source).expect("both scripts read");
    let first = component
        .script_typescript_errors
        .first()
        .expect("the errors");
    assert_eq!(first.diagnostic.span.start_offset, at(source, ";"));
}

#[test]
fn an_error_after_the_script_is_the_compilers_only_when_it_reads_the_script() {
    let source = "<script>\n\tlet x = ;\n</script>\n\n<p>{</p>\n";
    let strict = parse(source).expect_err("the script stops it");
    assert_eq!(strict.code, "js_parse_error");
    assert_eq!(strict.span.start_offset, at(source, ";"));

    let past = parse_reading_scripts_as_typescript(source).expect_err("the template stops it");
    assert!(past.span.start_offset > at(source, "<p>"), "{past:?}");
}

#[test]
fn an_error_before_the_script_stops_both_reads_there() {
    for source in [
        "<p>{</p>\n<script>\n\tlet x = ;\n</script>\n",
        "<p>{</p>\n<script lang=\"ts\">\n\tlet x = ;\n</script>\n",
    ] {
        let strict = parse(source).expect_err(source);
        let past = parse_reading_scripts_as_typescript(source).expect_err(source);
        assert_eq!(
            (strict.code, strict.span),
            (past.code, past.span),
            "{source}"
        );
        assert!(strict.span.start_offset < at(source, "<script"), "{source}");
    }
}
