//! `rsvelte typecheck` where `allowJs` loads JavaScript but a JavaScript component a package's
//! import reaches stays untyped, as `maxNodeModuleJsDepth` decides.

use crate::typecheck::{Project, text, typecheck_config};

/// A project whose page imports a JavaScript component and a TypeScript one through a linked
/// package, and a JavaScript component by its path, under `compilerOptions` `options`.
fn project(options: &str) -> Project {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let annotated = "<script>\n\tlet { n }: { n: number } = $props();\n</script>\n\n{n}\n";
    let tsconfig = format!(
        r#"{{"compilerOptions":{{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[],"allowJs":true{options}}},"include":["src"]}}"#
    );
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        ("app/tsconfig.json", &tsconfig),
        ("app/src/Annotated.svelte", annotated),
        (
            "app/src/Page.svelte",
            "<script lang=\"ts\">\n\timport Linked from \"dep/src/Annotated.svelte\";\n\
             \timport Typed from \"dep/src/Typed.svelte\";\n\
             \timport Local from \"./Annotated.svelte\";\n</script>\n\n\
             <Linked n=\"s\" /><Typed n=\"s\" /><Local n=\"s\" />\n",
        ),
        ("dep/package.json", r#"{"name":"dep","type":"module"}"#),
        ("dep/src/Annotated.svelte", annotated),
        (
            "dep/src/Typed.svelte",
            "<script lang=\"ts\">\n\tlet { n }: { n: number } = $props();\n</script>\n\n{n}\n",
        ),
    ]);
    let app = project.0.join("app");
    std::fs::create_dir_all(app.join("node_modules")).expect("node_modules");
    #[cfg(unix)]
    std::os::unix::fs::symlink("../../dep", app.join("node_modules/dep")).expect("link");
    project
}

const LOCAL: &str = "src/Annotated.svelte(2,12): error TS8008: Type aliases can only be used in \
                     TypeScript files.\n";
const TYPED: &str = "src/Page.svelte(7,24): error TS2322: Type 'string' is not assignable to type \
                     'number'.\n\
                     src/Page.svelte(7,39): error TS2322: Type 'string' is not assignable to type \
                     'number'.\n";

/// With `allowJs`, TypeScript loads the JavaScript component a relative import reaches, and not
/// the one a search of `node_modules` finds: that import reports TS7016, the component is not
/// checked, and its props are not typed. The TypeScript component of the package stays typed.
/// The expected lines are svelte-check 4.7.8's.
#[cfg(unix)]
#[test]
fn typecheck_reads_a_package_javascript_component_as_untyped_beside_allow_js() {
    let project = project("");
    let output = project.rsvelte_in("app", &["typecheck"]);
    let linked = project.0.join("dep/src/Annotated.svelte");
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "{LOCAL}src/Page.svelte(2,21): error TS7016: Could not find a declaration file for \
             module 'dep/src/Annotated.svelte'. '{}' implicitly has an 'any' type.\n\
             {TYPED}\nFound 4 errors in 2 files.\n",
            linked.display()
        )
    );
}

/// `maxNodeModuleJsDepth` 1 loads the package's JavaScript component, so it is checked and
/// typed as the local one is. The expected lines are svelte-check 4.7.8's.
#[cfg(unix)]
#[test]
fn typecheck_loads_a_package_javascript_component_within_max_node_module_js_depth() {
    let project = project(r#","maxNodeModuleJsDepth":1"#);
    let output = project.rsvelte_in("app", &["typecheck"]);
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "{LOCAL}../dep/src/Annotated.svelte(2,12): error TS8008: Type aliases can only be \
             used in TypeScript files.\n\
             src/Page.svelte(7,9): error TS2322: Type 'string' is not assignable to type \
             'number'.\n\
             {TYPED}\nFound 5 errors in 3 files.\n"
        )
    );
}
