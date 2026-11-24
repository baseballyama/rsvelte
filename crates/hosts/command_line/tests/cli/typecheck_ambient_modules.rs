//! `rsvelte typecheck` of an import TypeScript reads as untyped where an ambient module's pattern,
//! such as `declare module '*.svelte'`, matches its specifier: TypeScript reads that module
//! instead of reporting TS7016.

use crate::typecheck::{Native, text};
use crate::typecheck_linked_packages::linked;

const ENV: &str = "declare module '*.svelte' {\n  import type { Component } from 'svelte';\n  \
                   const component: Component;\n  export default component;\n}\n";
const ICON: &str = "<svg width=\"16\" height=\"16\"></svg>\n";

/// Components without `<script>` read as untyped JavaScript: one of the project, and one of a
/// linked package that its barrel `.ts`, a component of its own and the package's name import.
/// The pattern makes every import quiet; without it each one reports TS7016. The expected lines
/// are svelte-check 4.7.8's.
#[test]
fn typecheck_reads_an_untyped_import_as_the_ambient_module_its_specifier_matches() {
    let typecheck = |env: Option<&str>| {
        let mut files = vec![
            (
                "app/src/App.svelte",
                "<script lang=\"ts\">\n  import { Wrapper, Icon } from 'dep/components';\n  \
                 import Direct from 'dep/Icon.svelte';\n  import Local from './Local.svelte';\n\
                 </script>\n\n<Wrapper /><Icon /><Direct /><Local />\n",
            ),
            ("app/src/Local.svelte", ICON),
            (
                "dep/package.json",
                r#"{"name":"dep","type":"module","exports":{
"./components":{"types":"./src/index.ts","svelte":"./src/index.ts"},
"./Icon.svelte":{"svelte":"./src/Icon.svelte","default":"./src/Icon.svelte"}},
"peerDependencies":{"svelte":"^5"}}"#,
            ),
            (
                "dep/src/index.ts",
                "export { default as Wrapper } from './Wrapper.svelte';\n\
                 export { default as Icon } from './Icon.svelte';\n",
            ),
            (
                "dep/src/Wrapper.svelte",
                "<script lang=\"ts\">\n  import Icon from './Icon.svelte';\n</script>\n\n\
                 <Icon />\n",
            ),
            ("dep/src/Icon.svelte", ICON),
        ];
        files.extend(env.map(|env| ("app/src/env.d.ts", env)));
        let project = linked(r#","types":["svelte"]"#, &files);
        let output = project.rsvelte_in("app", &["typecheck"]);
        let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
        (output.status.code(), report, project)
    };
    let (code, report, _project) = typecheck(Some(ENV));
    assert_eq!((code, report), (Some(0), String::new()));
    let (code, report, project) = typecheck(None);
    let untyped = |specifier: &str, file: &str| {
        format!(
            "error TS7016: Could not find a declaration file for module '{specifier}'. '{}' \
             implicitly has an 'any' type.",
            project.0.join(file).display()
        )
    };
    let icon = "dep/src/Icon.svelte";
    assert_eq!(
        (code, report),
        (
            Some(1),
            format!(
                "../dep/src/Wrapper.svelte(2,20): {}\n\
                 ../dep/src/index.ts(2,33): {}\n\
                 src/App.svelte(3,22): {}\n\
                 src/App.svelte(4,21): {}\n\
                 \nFound 4 errors in 3 files.\n",
                untyped("./Icon.svelte", icon),
                untyped("./Icon.svelte", icon),
                untyped("dep/Icon.svelte", icon),
                untyped("./Local.svelte", "app/src/Local.svelte"),
            )
            .native()
        )
    );
}
