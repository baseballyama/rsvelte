//! `rsvelte typecheck` on JavaScript modules, which TypeScript checks as the tsconfig says.

use crate::typecheck::{Native, Project, text, typecheck_config};

/// The project's JavaScript modules, under `compilerOptions` `options`.
fn project(options: &str) -> Project {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let tsconfig = format!(
        r#"{{"compilerOptions":{{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[]{options}}},"include":["src"]}}"#
    );
    Project::new(&[
        ("app/rsvelte.config.json", &config),
        ("app/tsconfig.json", &tsconfig),
        (
            "app/src/checked.js",
            "// @ts-check\n/** @type {string} */\nexport const checked = 1;\n",
        ),
        (
            "app/src/plain.js",
            "/** @type {string} */\nexport const plain = 1;\n",
        ),
        (
            "app/src/routes/+page.js",
            "export function load(event) {\n\treturn event.params;\n}\n",
        ),
    ])
}

/// `allowJs` checks only a module that asks with `// @ts-check`; `checkJs` checks every one, and
/// a route's `load` takes its event's type from `JSDoc`, as svelte2tsx writes it. The expected
/// lines are svelte-check 4.7.8's.
#[test]
fn typecheck_checks_javascript_as_the_tsconfig_says() {
    let checked = "src/checked.js(3,14): error TS2322: Type 'number' is not assignable to type \
                   'string'.\n";
    let output = project(r#","allowJs":true"#).rsvelte_in("app", &["typecheck"]);
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!("{checked}\nFound 1 error in 1 file.\n").native()
    );
    let output = project(r#","checkJs":true"#).rsvelte_in("app", &["typecheck"]);
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "{checked}\
             src/plain.js(2,14): error TS2322: Type 'number' is not assignable to type \
             'string'.\n\
             src/routes/+page.js(1,1): error TS2307: Cannot find module './$types.js' or its \
             corresponding type declarations. (this likely means that SvelteKit's type \
             generation didn't run yet - try running it by executing 'npm run dev' or 'npm run \
             build')\n\
             \nFound 3 errors in 3 files.\n"
        )
        .native()
    );
}

/// A JavaScript route component's untyped props take their types from `./$types` in `JSDoc`, as
/// svelte2tsx writes them, where a missing `./$types` is reported. The expected lines are
/// svelte-check 4.7.8's.
#[test]
fn typecheck_types_a_javascript_route_component_props() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let types = "export type PageData = { a: number };\nexport type LayoutData = { a: number };\n\
                 export type ActionData = { c: number } | undefined;\n";
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[],"allowJs":true,"checkJs":true},"include":["src"]}"#,
        ),
        (
            "app/src/app.d.ts",
            "declare global {\n\tnamespace App {\n\t\tinterface Error {\n\t\t\tmessage: string;\n\
             \t\t}\n\t}\n}\nexport {};\n",
        ),
        ("app/src/routes/page/$types.d.ts", types),
        (
            "app/src/routes/page/+page.svelte",
            "<script>\n\tlet { data, form } = $props();\n</script>\n\n{data.b}{form.c}\n",
        ),
        ("app/src/routes/layout/$types.d.ts", types),
        (
            "app/src/routes/layout/+layout.svelte",
            "<script>\n\tlet { data, children } = $props();\n</script>\n\n\
             {data.b}{@render children()}\n",
        ),
        (
            "app/src/routes/error/+error.svelte",
            "<script>\n\tlet { error } = $props();\n</script>\n\n{error.x}\n",
        ),
        (
            "app/src/routes/generated/+page.svelte",
            "<script>\n\tlet { data } = $props();\n</script>\n\n{data.b}\n",
        ),
    ]);
    let output = project.rsvelte_in("app", &["typecheck"]);
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        "src/routes/error/+error.svelte(5,8): error TS2339: Property 'x' does not exist on type \
         'Error'.\n\
         src/routes/generated/+page.svelte(2,5): error TS2307: Cannot find module './$types.js' or \
         its corresponding type declarations.\n\
         src/routes/layout/+layout.svelte(5,7): error TS2339: Property 'b' does not exist on type \
         'LayoutData'.\n\
         src/routes/page/+page.svelte(5,7): error TS2339: Property 'b' does not exist on type \
         'PageData'.\n\
         src/routes/page/+page.svelte(5,10): error TS18048: 'form' is possibly 'undefined'.\n\
         \nFound 5 errors in 4 files.\n"
            .native()
    );
}
