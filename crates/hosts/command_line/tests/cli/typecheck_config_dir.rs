//! `rsvelte typecheck` where the tsconfig's paths use `${configDir}`, which TypeScript reads as
//! the directory of the tsconfig it checks, the project's own, wherever the pattern is written.

use crate::typecheck::{Project, text, typecheck_config};

const OPTIONS: &str = r#""compilerOptions":{"strict":true,"noEmit":true,"target":"es2022",
"module":"esnext","moduleResolution":"bundler","types":[]}"#;

/// Checks the project in `app` whose tsconfig is `own`, beside `tsconfig.base.json` as `base`,
/// where `excluded.ts` has an error, and expects no finding.
fn check_excludes(base: &str, own: &str) {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let project = Project::new(&[
        ("tsconfig.base.json", base),
        ("app/rsvelte.config.json", &config),
        ("app/tsconfig.json", own),
        ("app/src/main.ts", "export const ok: number = 1;\n"),
        (
            "app/src/Ok.svelte",
            "<script lang=\"ts\">\n\tconst n: number = 1;\n</script>\n{n}\n",
        ),
        ("app/excluded.ts", "export const bad: number = 'x';\n"),
    ]);
    let output = project.rsvelte_in("app", &["typecheck"]);
    let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
    assert_eq!(
        (output.status.code(), report.as_str()),
        (Some(0), ""),
        "the checker leaves out the file `exclude` removes"
    );
}

#[test]
fn typecheck_expands_config_dir_in_an_extended_exclude() {
    check_excludes(
        &format!(r#"{{{OPTIONS},"exclude":["${{configDir}}/excluded.ts"]}}"#),
        r#"{"extends":"../tsconfig.base.json","include":["src","excluded.ts"]}"#,
    );
}

#[test]
fn typecheck_expands_config_dir_in_the_projects_own_exclude() {
    check_excludes(
        &format!("{{{OPTIONS}}}"),
        r#"{"extends":"../tsconfig.base.json","include":["src","excluded.ts"],
"exclude":["${configDir}/excluded.ts"]}"#,
    );
}

#[test]
fn typecheck_excludes_a_path_without_config_dir() {
    check_excludes(
        &format!(r#"{{{OPTIONS},"exclude":["app/excluded.ts"]}}"#),
        r#"{"extends":"../tsconfig.base.json","include":["src","excluded.ts"]}"#,
    );
}
