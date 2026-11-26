//! `rsvelte typecheck` of a component tag whose value is no component.

use crate::typecheck::Native;
use crate::typecheck_events::check;

/// A value that is no component is one TS2345 at the tag, with svelte-check's note, against
/// svelte2tsx's constraint, which TypeScript 7 prints in another order. `null` or `undefined` is a
/// call of `never`, where svelte-check reports TS2351 "This expression is not constructable." at
/// the same place: the projection calls a component where svelte2tsx constructs one. svelte-check
/// 4.7.8 reports the positions.
#[test]
fn typecheck_reports_a_value_that_is_no_component_at_its_tag() {
    let tsconfig = (
        "tsconfig.json",
        r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"target":"esnext","types":[],"skipLibCheck":true,"allowJs":true,"checkJs":true},
"include":["src"]}"#,
    );
    let cells = [
        ("Five", "5", "<P foo={1} />"),
        ("Null", "null", "<P />"),
        ("Undefined", "undefined", "<P>x</P>"),
        ("Dynamic", "5", "<svelte:component this={P} foo={1} />"),
        ("Number", "Number(5)", "<P />"),
        (
            "DynamicNumber",
            "Number(5)",
            "<svelte:component this={P} />",
        ),
    ];
    let mut sources = vec![(
        "src/Real.svelte".to_owned(),
        "<script lang=\"ts\">\n\tlet { foo }: { foo?: number } = $props();\n</script>\n\n{foo}\n"
            .to_owned(),
    )];
    for (lang, suffix) in [(" lang=\"ts\"", "TS"), ("", "JS")] {
        for (name, value, tag) in cells {
            sources.push((
                format!("src/{name}{suffix}.svelte"),
                format!("<script{lang}>\n\tconst P = {value};\n</script>\n\n{tag}\n"),
            ));
        }
        sources.push((
            format!("src/Real{suffix}.svelte"),
            format!(
                "<script{lang}>\n\timport P from './Real.svelte';\n</script>\n\n<P foo={{1}} />\n"
            ),
        ));
    }
    let mut files = vec![tsconfig];
    files.extend(
        sources
            .iter()
            .map(|(path, text)| (path.as_str(), text.as_str())),
    );
    let report = check(&files);
    let mut lines: Vec<_> = report
        .lines()
        .skip_while(|l| !l.starts_with("src"))
        .take_while(|l| !l.starts_with("Found"))
        .collect();
    while lines.last() == Some(&"") {
        lines.pop();
    }
    let constraint = "'Component<any, any, any> | ConstructorOfATypedSvelteComponent | null | \
                      undefined'";
    let not_a_component = |at: &str, value: &str| {
        vec![
            format!(
                "src/{at}: error TS2345: Argument of type '{value}' is not assignable to parameter \
                 of type {constraint}."
            ),
            String::new(),
            "Possible causes:".to_owned(),
            "- You use the instance type of a component where you should use the constructor type"
                .to_owned(),
            "- Type definitions are missing for this Svelte Component. ".to_owned(),
        ]
    };
    let never = |at: &str| {
        vec![
            format!("src/{at}: error TS2349: This expression is not callable."),
            "  Type 'never' has no call signatures.".to_owned(),
        ]
    };
    let mut expected = Vec::new();
    for suffix in ["JS", "TS"] {
        expected.extend([
            not_a_component(&format!("Dynamic{suffix}.svelte(5,25)"), "5"),
            not_a_component(&format!("DynamicNumber{suffix}.svelte(5,25)"), "number"),
            not_a_component(&format!("Five{suffix}.svelte(5,2)"), "5"),
            not_a_component(&format!("Number{suffix}.svelte(5,2)"), "number"),
            never(&format!("Null{suffix}.svelte(5,2)")),
            never(&format!("Undefined{suffix}.svelte(5,2)")),
        ]);
    }
    expected.sort();
    let expected: Vec<_> = expected.concat();
    assert_eq!(
        lines,
        expected.iter().map(|l| l.native()).collect::<Vec<_>>()
    );
}
