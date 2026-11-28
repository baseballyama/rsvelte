//! `rsvelte typecheck` of a component tag whose value is no component.

use crate::typecheck::Native;
use crate::typecheck_events::check;

/// A value that is no component is one TS2345 at the tag, with svelte-check's note, against
/// svelte2tsx's constraint, which TypeScript 7 prints in another order. `null`, `undefined` or a
/// function that returns no object constructs `never`: TS2351 at the tag name's last character, or
/// after the expression of `<svelte:component this>`. svelte-check 4.7.8 reports these lines.
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
        ("DynamicNull", "null", "<svelte:component this={P} />"),
        ("Function", "() => 1", "<P />"),
        (
            "DynamicFunction",
            "() => 1",
            "<svelte:component this={P} />",
        ),
        ("Member", "{ x: null }", "<P.x />"),
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
    assert_eq!(
        lines,
        expected().iter().map(|l| l.native()).collect::<Vec<_>>()
    );
}

/// The lines svelte-check 4.7.8 reports for the cells of
/// `typecheck_reports_a_value_that_is_no_component_at_its_tag`, in its order.
fn expected() -> Vec<String> {
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
            format!("src/{at}: error TS2351: This expression is not constructable."),
            "  Type 'never' has no construct signatures.".to_owned(),
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
            never(&format!("DynamicNull{suffix}.svelte(5,26)")),
            never(&format!("Function{suffix}.svelte(5,2)")),
            never(&format!("DynamicFunction{suffix}.svelte(5,26)")),
            never(&format!("Member{suffix}.svelte(5,4)")),
        ]);
    }
    expected.sort();
    expected.concat()
}

/// svelte-check 4.7.8 reports the TS2351 of `<P.𝒜 />` at column 5, the second UTF-16 unit of `𝒜`,
/// which is no character position. rsvelte reports it at column 4, the start of `𝒜`.
#[test]
fn typecheck_reports_a_tag_that_ends_in_an_astral_character_at_its_start() {
    let report = check(&[(
        "src/App.svelte",
        "<script lang=\"ts\">\n\tconst P = { \u{1d49c}: null };\n</script>\n\n<P.\u{1d49c} />\n",
    )]);
    assert_eq!(
        report,
        "src/App.svelte(5,4): error TS2351: This expression is not constructable.\n  \
         Type 'never' has no construct signatures.\n\nFound 1 error in 1 file.\n"
            .native()
    );
}
