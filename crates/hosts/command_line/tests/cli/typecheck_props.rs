//! `rsvelte typecheck` of a component's untyped `$props()`, which svelte2tsx types as
//! `$$ComponentProps` from the pattern's syntax.

use rsvelte_test_harness::NodePackages;

use crate::typecheck::{Native, Project, link, text, typecheck_config};

/// A component that destructures `$props()` without a type, in JavaScript and in TypeScript, and
/// a TypeScript component that renders it without a prop, with an unknown one and with a wrong
/// one. The defaults are typed by their syntax: a number, an identifier by its `typeof`, and a
/// parenthesized number as `any`. In JavaScript, what TypeScript finds in the `@typedef` is
/// reported at the declarator, and a directive before the declaration still reaches it. The
/// expected lines are svelte-check 4.7.8's.
#[test]
fn typecheck_types_untyped_props_as_svelte2tsx_names_them() {
    let child = |lang: &str, prelude: &str, pattern: &str| {
        format!("<script{lang}>\n\t{prelude}let {pattern} = $props();\n</script>\n\n<p></p>\n")
    };
    let parent = |child: &str, wrong: Option<&str>| {
        let wrong = wrong.map_or(String::new(), |wrong| format!("<C v={{1}} {wrong} />\n"));
        format!(
            "<script lang=\"ts\">\n\timport C from \"./{child}.svelte\";\n</script>\n\n\
             <C />\n<C v={{1}} zz={{2}} />\n{wrong}"
        )
    };
    let (javascript, typescript) = ("", " lang=\"ts\"");
    let files = [
        ("src/Number.svelte", child(javascript, "", "{ v, w = 1 }")),
        ("src/NumberTs.svelte", child(typescript, "", "{ v, w = 1 }")),
        (
            "src/Typeof.svelte",
            child(typescript, "const d = 1; ", "{ v, w = d }"),
        ),
        (
            "src/Parenthesized.svelte",
            child(javascript, "", "{ v, w = (1) }"),
        ),
        (
            "src/Undeclared.svelte",
            child(javascript, "", "{ v, w = x }"),
        ),
        (
            "src/UndeclaredTs.svelte",
            child(typescript, "", "{ v, w = x }"),
        ),
        (
            "src/Directive.svelte",
            child(javascript, "// @ts-expect-error\n\t", "{ v, w = x }"),
        ),
        (
            "src/DirectiveTs.svelte",
            child(typescript, "// @ts-expect-error\n\t", "{ v, w = x }"),
        ),
        ("src/UseNumber.svelte", parent("Number", Some("w=\"s\""))),
        (
            "src/UseNumberTs.svelte",
            parent("NumberTs", Some("w=\"s\"")),
        ),
        ("src/UseTypeof.svelte", parent("Typeof", Some("w=\"s\""))),
        (
            "src/UseParenthesized.svelte",
            parent("Parenthesized", Some("w=\"s\"")),
        ),
    ];
    let mut all: Vec<(&str, &str)> = vec![(
        "tsconfig.json",
        r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[],"allowJs":true,"checkJs":true},"include":["src"]}"#,
    )];
    all.extend(files.iter().map(|(path, text)| (*path, text.as_str())));
    let project = Project::new(&all);
    std::fs::create_dir_all(project.0.join("node_modules")).expect("node_modules");
    link(
        NodePackages::locate().package("svelte"),
        project.0.join("node_modules/svelte"),
    );
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    std::fs::write(project.0.join("rsvelte.config.json"), config).expect("config");
    let output = project.rsvelte(&["typecheck"]);
    let missing = "error TS2741: Property 'v' is missing in type '{}' but required in type \
                   '$$ComponentProps'.";
    let unknown = "error TS2353: Object literal may only specify known properties, and '\"zz\"' \
                   does not exist in type '$$ComponentProps'.";
    let wrong = |to: &str| format!("error TS2322: Type 'string' is not assignable to type '{to}'.");
    let undeclared = "error TS2304: Cannot find name 'x'.";
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "src/Undeclared.svelte(2,5): {undeclared}\n\
             src/Undeclared.svelte(2,15): {undeclared}\n\
             src/UndeclaredTs.svelte(2,15): {undeclared}\n\
             src/UseNumber.svelte(5,2): {missing}\n\
             src/UseNumber.svelte(6,10): {unknown}\n\
             src/UseNumber.svelte(7,10): {number}\n\
             src/UseNumberTs.svelte(5,2): {missing}\n\
             src/UseNumberTs.svelte(6,10): {unknown}\n\
             src/UseNumberTs.svelte(7,10): {number}\n\
             src/UseParenthesized.svelte(5,2): {missing}\n\
             src/UseParenthesized.svelte(6,10): {unknown}\n\
             src/UseTypeof.svelte(5,2): {missing}\n\
             src/UseTypeof.svelte(6,10): {unknown}\n\
             src/UseTypeof.svelte(7,10): {one}\n\
             \nFound 14 errors in 6 files.\n",
            number = wrong("number"),
            one = wrong("1"),
        )
        .native()
    );
}
