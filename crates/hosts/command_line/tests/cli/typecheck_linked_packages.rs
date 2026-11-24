//! `rsvelte typecheck` of a project that imports a package linked into `node_modules`, whose
//! files are outside the project: TypeScript reads them as a library's, not as the project's.

use rsvelte_test_harness::NodePackages;

use crate::typecheck::{Project, text, typecheck_config};

/// `app`, whose tsconfig has `compilerOptions` `options` and selects `src`, beside `dep`, which
/// `app/node_modules/dep` links to, with `files` added to both.
#[cfg(unix)]
fn linked(options: &str, files: &[(&str, &str)]) -> Project {
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    let tsconfig = format!(
        r#"{{"compilerOptions":{{"strict":true,"noEmit":true,"target":"es2022","module":"esnext",
"moduleResolution":"bundler"{options}}},"include":["src"]}}"#
    );
    let mut all = vec![
        ("app/rsvelte.config.json", config.as_str()),
        ("app/tsconfig.json", tsconfig.as_str()),
    ];
    all.extend_from_slice(files);
    let project = Project::new(&all);
    let modules = project.0.join("app/node_modules");
    std::fs::create_dir_all(&modules).expect("node_modules");
    std::os::unix::fs::symlink("../../dep", modules.join("dep")).expect("link");
    let svelte = NodePackages::locate().package("svelte");
    std::os::unix::fs::symlink(svelte, modules.join("svelte")).expect("link");
    project
}

/// `outDir` makes TypeScript check each file of the project against `rootDir`, by default the
/// tsconfig's directory, but not a file an import of a package reaches. `tsc` 7.1 and 6.0 find
/// no error; an import of the same file by its path reports TS6059, and these lines are
/// `tsc` 7.1's.
#[cfg(unix)]
#[test]
fn typecheck_does_not_check_a_linked_package_file_against_the_root_directory() {
    let typecheck = |import: &str| {
        let main =
            format!("import {{ one }} from '{import}';\nexport const two: number = one + 1;\n");
        let project = linked(
            r#","outDir":"dist","allowImportingTsExtensions":true"#,
            &[
                ("app/src/main.ts", &main),
                (
                    "dep/package.json",
                    r#"{"name":"dep","type":"module","exports":{".":"./src/index.ts"}}"#,
                ),
                ("dep/src/index.ts", "export const one = 1;\n"),
            ],
        );
        let output = project.rsvelte_in("app", &["typecheck"]);
        let report = format!("{}{}", text(&output.stdout), text(&output.stderr));
        (output.status.code(), report, project)
    };
    let (code, report, _project) = typecheck("dep");
    assert_eq!((code, report), (Some(0), String::new()));
    let (code, report, project) = typecheck("../../dep/src/index.ts");
    let file = project.0.join("dep/src/index.ts");
    let app = project.0.join("app");
    assert_eq!(
        (code, report),
        (
            Some(1),
            format!(
                "src/main.ts(1,21): error TS6059: File '{}' is not under 'rootDir' '{}'. \
                 'rootDir' is expected to contain all source files.\n\
                 \nFound 1 error in 1 file.\n",
                file.display(),
                app.display()
            )
        )
    );
}

/// A component of a linked package is checked where its real path is, which is outside
/// `node_modules`, as svelte-check 4.7.7 and later report it; svelte-check 4.7.6 skipped it,
/// since it did not follow the link. `outDir` adds no TS6059 for it. The expected lines are
/// svelte-check 4.7.8's, with and without `outDir`.
#[cfg(unix)]
#[test]
fn typecheck_reports_a_linked_package_component_as_svelte_check_does() {
    let wrapper = "<script lang=\"ts\">\n  import Icon from './Icon.svelte';\n  \
                   let { n }: { n: number } = $props();\n  const bad: string = 1;\n\
                   </script>\n\n<Icon />{n}\n";
    for options in [
        r#","types":["svelte"]"#,
        r#","types":["svelte"],"outDir":"dist""#,
    ] {
        let project = linked(
            options,
            &[
                (
                    "app/src/App.svelte",
                    "<script lang=\"ts\">\n  import Wrapper from 'dep/Wrapper.svelte';\n\
                     </script>\n\n<Wrapper />\n",
                ),
                (
                    "dep/package.json",
                    r#"{"name":"dep","type":"module","exports":{"./Wrapper.svelte":
{"svelte":"./src/Wrapper.svelte","default":"./src/Wrapper.svelte"}},
"peerDependencies":{"svelte":"^5"}}"#,
                ),
                ("dep/src/Wrapper.svelte", wrapper),
                (
                    "dep/src/Icon.svelte",
                    "<svg width=\"16\" height=\"16\"></svg>\n",
                ),
            ],
        );
        let output = project.rsvelte_in("app", &["typecheck"]);
        assert_eq!(
            format!("{}{}", text(&output.stdout), text(&output.stderr)),
            format!(
                "../dep/src/Wrapper.svelte(2,20): error TS7016: Could not find a declaration \
                 file for module './Icon.svelte'. '{}' implicitly has an 'any' type.\n\
                 ../dep/src/Wrapper.svelte(4,9): error TS2322: Type 'number' is not assignable \
                 to type 'string'.\n\
                 src/App.svelte(5,2): error TS2741: Property 'n' is missing in type '{{}}' but \
                 required in type '$$ComponentProps'.\n\
                 \nFound 3 errors in 2 files.\n",
                project.0.join("dep/src/Icon.svelte").display()
            ),
            "{options}"
        );
    }
}
