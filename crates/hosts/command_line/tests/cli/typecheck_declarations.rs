//! `rsvelte typecheck` under `declaration` or `composite`, where TypeScript reports what stops it
//! from writing the declarations even under `noEmit`, in a module and in a component.

use crate::typecheck::{Native, Project, text, typecheck_config};

/// The exit code and report of a check of a module and a component that each export a class
/// expression with a private member, under `compilerOptions` `options`.
fn check(options: &str) -> (Option<i32>, String) {
    check_files(options, true)
}

/// [`check`], with the component only when `component`.
fn check_files(options: &str, with_component: bool) -> (Option<i32>, String) {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let tsconfig = format!(
        r#"{{"compilerOptions":{{"strict":true,"noEmit":true,"target":"es2022","module":"esnext",
"moduleResolution":"bundler","types":[]{options}}},"include":["src"]}}"#
    );
    let class = "export const Box = class { private value = 1; read() { return this.value; } };\n";
    let component = format!(
        "<script lang=\"ts\" module>\n\t{class}</script>\n\n<script lang=\"ts\">\n\tlet {{ n }}: \
         {{ n: number }} = $props();\n</script>\n\n{{n}}\n"
    );
    let mut files = vec![
        ("app/rsvelte.config.json", config.as_str()),
        ("app/tsconfig.json", &tsconfig),
        ("app/src/a.ts", class),
    ];
    if with_component {
        files.push(("app/src/C.svelte", &component));
    }
    let output = Project::new(&files).rsvelte_in("app", &["typecheck"]);
    let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
    (output.status.code(), report)
}

/// TS4094 in both files, where `tsc` and svelte-check 4.7.8 place it.
fn reported() -> (Option<i32>, String) {
    let message = "error TS4094: Property 'value' of exported anonymous class type may not be \
                   private or protected.\n";
    (
        Some(1),
        format!(
            "src/C.svelte(2,15): {message}src/a.ts(1,14): {message}\nFound 2 errors in 2 files.\n"
        )
        .native(),
    )
}

#[test]
fn typecheck_reports_declaration_findings_under_declaration() {
    assert_eq!(check(r#","declaration":true"#), reported());
}

#[test]
fn typecheck_reports_declaration_findings_under_composite() {
    assert_eq!(check(r#","composite":true"#), reported());
}

#[test]
fn typecheck_reports_no_declaration_findings_without_declarations() {
    assert_eq!(check(""), (Some(0), String::new()));
}

#[test]
fn typecheck_reports_declaration_findings_of_a_project_without_components() {
    let message = "error TS4094: Property 'value' of exported anonymous class type may not be \
                   private or protected.\n";
    assert_eq!(
        check_files(r#","declaration":true"#, false),
        (
            Some(1),
            format!("src/a.ts(1,14): {message}\nFound 1 error in 1 file.\n").native()
        )
    );
}
