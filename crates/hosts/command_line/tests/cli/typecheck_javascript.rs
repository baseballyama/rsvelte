//! `rsvelte typecheck` on JavaScript modules, which TypeScript checks as the tsconfig says.

use crate::typecheck::{Project, text, typecheck_config};

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
        format!("{checked}\nFound 1 error in 1 file.\n")
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
    );
}
