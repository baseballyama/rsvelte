use std::path::{Path, PathBuf};

use super::declarations;

fn of(scripts: &[&str], taken: &[&str]) -> Vec<(PathBuf, String)> {
    let scripts: Vec<PathBuf> = scripts.iter().map(PathBuf::from).collect();
    declarations(&scripts, &[".svelte"], &|path: &Path| {
        taken.iter().any(|t| Path::new(t) == path)
    })
}

fn both(module: &str) -> String {
    format!("export * from {module};\nexport {{ default }} from {module};\n")
}

#[test]
fn a_script_named_after_a_component_gets_a_declaration_of_that_name() {
    assert_eq!(
        of(
            &[
                "/p/src/state.svelte.ts",
                "/p/src/m.svelte.mjs",
                "/p/src/plain.ts"
            ],
            &[]
        ),
        [
            (
                PathBuf::from("/p/src/state.d.svelte.ts"),
                both("'./state.svelte.js'")
            ),
            (
                PathBuf::from("/p/src/m.d.svelte.ts"),
                both("'./m.svelte.mjs'")
            ),
        ]
    );
}

#[test]
fn a_component_or_declaration_of_that_name_keeps_its_place() {
    assert_eq!(
        of(
            &[
                "/p/a.svelte.ts",
                "/p/b.svelte.ts",
                "/p/c.d.svelte.ts",
                "/p/d.svelte.ts",
                "/p/d.svelte.js"
            ],
            &["/p/a.svelte", "/p/b.d.svelte.ts"],
        ),
        [(PathBuf::from("/p/d.d.svelte.ts"), both("'./d.svelte.js'"))]
    );
}
