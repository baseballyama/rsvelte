//! `rsvelte typecheck` where TypeScript reads JavaScript as untyped: which JavaScript components
//! it checks, and the TS7016 of each import of one.

use crate::typecheck::{Native, Project, link, text, typecheck_config, typescript};

/// A JavaScript component is untyped where TypeScript reads JavaScript as untyped: each import of
/// it reports TS7016, from a component or a script and through a package or a relative path, and
/// one only a package's import reaches is not checked. The expected lines are svelte-check
/// 4.7.8's.
#[test]
fn typecheck_reads_a_javascript_component_as_untyped_javascript() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let annotated = "<script>\n\tlet { n }: { n: number } = $props();\n</script>\n\n{n}\n";
    let page = |from: &str| {
        format!(
            "<script lang=\"ts\">\n\timport Annotated from \"{from}\";\n</script>\n\n\
             <Annotated n=\"str\" />\n"
        )
    };
    let (linked, local) = (page("dep/src/Annotated.svelte"), page("./Annotated.svelte"));
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[]},"include":["src"]}"#,
        ),
        ("app/src/Annotated.svelte", annotated),
        ("app/src/DepPage.svelte", &linked),
        ("app/src/Page.svelte", &local),
        (
            "app/src/use.ts",
            "import Local from \"./Annotated.svelte\";\n\
             import Linked from \"dep/src/Annotated.svelte\";\n\
             export const components = [Local, Linked];\n",
        ),
        ("dep/package.json", r#"{"name":"dep","type":"module"}"#),
        ("dep/src/Annotated.svelte", annotated),
    ]);
    let app = project.0.join("app");
    std::fs::create_dir_all(app.join("node_modules")).expect("node_modules");
    link("../../dep", app.join("node_modules/dep"));
    let output = project.rsvelte_in("app", &["typecheck"]);
    let untyped = |specifier: &str, file: &str| {
        format!(
            "error TS7016: Could not find a declaration file for module '{specifier}'. '{file}' \
             implicitly has an 'any' type."
        )
    };
    let dep = project.0.join("dep/src/Annotated.svelte");
    let dep = typescript(&dep);
    let local = project.0.join("app/src/Annotated.svelte");
    let local = typescript(&local);
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "src/Annotated.svelte(2,12): error TS8008: Type aliases can only be used in \
             TypeScript files.\n\
             src/DepPage.svelte(2,24): {}\n\
             src/Page.svelte(2,24): {}\n\
             src/use.ts(1,19): {}\n\
             src/use.ts(2,20): {}\n\
             \nFound 5 errors in 4 files.\n",
            untyped("dep/src/Annotated.svelte", &dep),
            untyped("./Annotated.svelte", &local),
            untyped("./Annotated.svelte", &local),
            untyped("dep/src/Annotated.svelte", &dep),
        )
        .native()
    );
}

/// Where JavaScript is untyped, TypeScript loads no JavaScript component the tsconfig does not
/// select, whatever imports it: one a JavaScript component imports, through a package or a
/// relative path, is not checked. The expected lines are svelte-check 4.7.8's.
#[test]
fn typecheck_does_not_check_a_javascript_component_only_javascript_reaches() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let annotated = "<script>\n\tlet { n }: { n: number } = $props();\n</script>\n\n{n}\n";
    let importing = |from: &str| {
        format!("<script>\n\timport Annotated from \"{from}\";\n</script>\n\n<Annotated />\n")
    };
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[]},"include":["src"]}"#,
        ),
        (
            "app/src/Page.svelte",
            "<script lang=\"ts\">\n\timport Chain from \"dep/src/Chain.svelte\";\n</script>\n\n\
             <Chain />\n",
        ),
        ("app/src/Local.svelte", &importing("../Outside.svelte")),
        (
            "app/src/Linked.svelte",
            &importing("dep/src/Annotated.svelte"),
        ),
        ("app/Outside.svelte", annotated),
        ("dep/package.json", r#"{"name":"dep","type":"module"}"#),
        ("dep/src/Chain.svelte", &importing("./Only.svelte")),
        ("dep/src/Only.svelte", annotated),
        ("dep/src/Annotated.svelte", annotated),
    ]);
    let app = project.0.join("app");
    std::fs::create_dir_all(app.join("node_modules")).expect("node_modules");
    link("../../dep", app.join("node_modules/dep"));
    let output = project.rsvelte_in("app", &["typecheck"]);
    let chain = project.0.join("dep/src/Chain.svelte");
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "src/Page.svelte(2,20): error TS7016: Could not find a declaration file for module \
             'dep/src/Chain.svelte'. '{}' implicitly has an 'any' type.\n\
             \nFound 1 error in 1 file.\n",
            typescript(&chain)
        )
        .native()
    );
}

/// TypeScript's own TS7016 for a JavaScript module names the module by its absolute path, as
/// svelte-check 4.7.8 prints it.
#[test]
fn typecheck_names_an_untyped_javascript_module_by_its_absolute_path() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[]},"include":["src"]}"#,
        ),
        ("app/src/s.js", "export const sj = 1;\n"),
        (
            "app/src/Page.svelte",
            "<script lang=\"ts\">\n\timport { sj } from \"./s.js\";\n</script>\n\n{sj}\n",
        ),
    ]);
    let output = project.rsvelte_in("app", &["typecheck"]);
    let module = project.0.join("app/src/s.js");
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "src/Page.svelte(2,21): error TS7016: Could not find a declaration file for module \
             './s.js'. '{}' implicitly has an 'any' type.\n\
             \nFound 1 error in 1 file.\n",
            typescript(&module)
        )
        .native()
    );
}

/// A JavaScript component the projection does not cover, such as one with a legacy `export let`,
/// is still untyped JavaScript: each import of it reports TS7016, even where no JavaScript
/// component is checked. The expected lines are svelte-check 4.7.8's.
#[cfg(unix)]
#[test]
fn typecheck_reads_a_javascript_component_it_does_not_check_as_untyped() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[]},"include":["src"]}"#,
        ),
        (
            "app/src/Legacy.svelte",
            "<script>\n\texport let v = 1;\n</script>\n\n{v}\n",
        ),
        (
            "app/src/NoDefault.svelte",
            "<script>\n\texport let v;\n</script>\n\n{v}\n",
        ),
        (
            "app/src/Module.svelte",
            "<script context=\"module\">\n\texport const m = 1;\n</script>\n\n\
             <script>\n\texport let v = m;\n</script>\n\n{v}\n",
        ),
        (
            "app/src/Page.svelte",
            "<script lang=\"ts\">\n\timport Legacy from \"./Legacy.svelte\";\n\
             \timport NoDefault from \"./NoDefault.svelte\";\n\
             \timport Module from \"./Module.svelte\";\n</script>\n\n\
             <Legacy v={1} />\n<NoDefault />\n<Module />\n",
        ),
        (
            "app/src/use.ts",
            "import Legacy from \"./Legacy.svelte\";\nexport const legacy = Legacy;\n",
        ),
    ]);
    let output = project.rsvelte_in("app", &["typecheck"]);
    let untyped = |at: &str, specifier: &str, file: &str| {
        let file = project.0.join("app/src").join(file);
        format!(
            "{at}: error TS7016: Could not find a declaration file for module '{specifier}'. \
             '{}' implicitly has an 'any' type.\n",
            file.display()
        )
    };
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "{}{}{}{}\nFound 4 errors in 2 files.\n",
            untyped("src/Page.svelte(2,21)", "./Legacy.svelte", "Legacy.svelte"),
            untyped(
                "src/Page.svelte(3,24)",
                "./NoDefault.svelte",
                "NoDefault.svelte"
            ),
            untyped("src/Page.svelte(4,21)", "./Module.svelte", "Module.svelte"),
            untyped("src/use.ts(1,20)", "./Legacy.svelte", "Legacy.svelte"),
        )
    );
}

/// Beside `allowJs`, a package's JavaScript component the projection does not cover is untyped
/// as a checked one is. The expected line is svelte-check 4.7.8's.
#[cfg(unix)]
#[test]
fn typecheck_reads_a_package_component_it_does_not_check_as_untyped() {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let project = Project::new(&[
        ("app/rsvelte.config.json", &config),
        (
            "app/tsconfig.json",
            r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"types":[],"allowJs":true},"include":["src"]}"#,
        ),
        (
            "app/src/Page.svelte",
            "<script lang=\"ts\">\n\timport Legacy from \"dep/src/Legacy.svelte\";\n</script>\n\n\
             <Legacy v={1} />\n",
        ),
        ("dep/package.json", r#"{"name":"dep","type":"module"}"#),
        (
            "dep/src/Legacy.svelte",
            "<script>\n\texport let v = 1;\n</script>\n\n{v}\n",
        ),
    ]);
    let app = project.0.join("app");
    std::fs::create_dir_all(app.join("node_modules")).expect("node_modules");
    std::os::unix::fs::symlink("../../dep", app.join("node_modules/dep")).expect("link");
    let output = project.rsvelte_in("app", &["typecheck"]);
    let dep = project.0.join("dep/src/Legacy.svelte");
    assert_eq!(
        format!("{}{}", text(&output.stdout), text(&output.stderr)),
        format!(
            "src/Page.svelte(2,21): error TS7016: Could not find a declaration file for module \
             'dep/src/Legacy.svelte'. '{}' implicitly has an 'any' type.\n\
             \nFound 1 error in 1 file.\n",
            dep.display()
        )
    );
}
