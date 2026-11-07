//! A `.svelte` component reached through package.json `imports` — SvelteKit 3's
//! `#lib`, which replaces the `$lib` tsconfig alias and leaves the generated
//! `paths` empty — must resolve to its shadow from both a `.svelte` and a plain
//! `.ts` importer, as official svelte-check resolves it. It used to be
//! `TS2307: Cannot find module '#lib/components/Foo.svelte'`.
//!
//! Real-compiler e2e; skipped without `TSGO_BIN` or @typescript/native-preview.

use std::fs;
use std::path::{Path, PathBuf};

use rsvelte_check::tsgo::find_compiler;
use rsvelte_check::{RunOptions, run};
use rsvelte_diagnostics::DiagnosticSeverity;

/// Minimal `svelte` package stub — enough for the emitted shims and the
/// component shadows to type-check without pulling in the real package.
fn write_svelte_stub(dir: &Path) {
    let svelte_dir = dir.join("node_modules/svelte");
    fs::create_dir_all(&svelte_dir).unwrap();
    fs::write(
        svelte_dir.join("package.json"),
        r#"{ "name": "svelte", "version": "5.0.0", "types": "./index.d.ts" }"#,
    )
    .unwrap();
    fs::write(
        svelte_dir.join("index.d.ts"),
        "export class SvelteComponent<P=any,E=any,S=any>{ constructor(o:any); $$bindings?:any; $set(p:any):void; $on(t:any,c:any):()=>void; $destroy():void; }\nexport interface ComponentConstructorOptions<P=any>{ target:any; anchor?:any; props?:P; [k:string]:any; }\nexport type Snippet<T extends unknown[]=any[]>=(...a:T)=>any;\nexport type Component<P=any>=any;\nexport type ComponentProps<T>=any;\nexport type ComponentEvents<T>=any;\nexport function mount(...a:any[]):any;\nexport function unmount(...a:any[]):any;\n",
    )
    .unwrap();
    fs::write(
        svelte_dir.join("elements.d.ts"),
        "export interface HTMLAttributes<T=any>{ [k:string]:any }\nexport interface SVGAttributes<T=any>{ [k:string]:any }\nexport interface DOMAttributes<T=any>{ [k:string]:any }\nexport interface AriaAttributes{ [k:string]:any }\nexport type HTMLElements = any;\nexport type SvelteHTMLElements = any;\nexport type SvelteMediaTimeRange = any;\n",
    )
    .unwrap();
}

#[test]
fn package_imports_svelte_component_resolves_without_ts2307() {
    if find_compiler(&PathBuf::from("."), true).is_err() {
        // Only a job that promised a TypeScript compiler may fail on its absence.
        assert!(
            std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_none(),
            "no TypeScript 7 native compiler in a job that declares \
             RSVELTE_REQUIRE_PREREQS — set TSGO_BIN, or install \
             @typescript/native-preview. The package.json `imports` \
             assertions would be silently skipped."
        );
        eprintln!("skip package imports: no TSGO_BIN and no @typescript/native-preview");
        return;
    }
    let dir = std::env::temp_dir().join(format!("rsvelte_pkg_imports_{}", std::process::id()));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(dir.join("src/lib/components")).unwrap();
    fs::create_dir_all(dir.join("src/routes")).unwrap();
    fs::write(
        dir.join("package.json"),
        r##"{ "name": "app", "type": "module", "imports": { "#lib": "./src/lib/index.ts", "#lib/*": "./src/lib/*" } }"##,
    )
    .unwrap();
    fs::write(
        dir.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler", "module": "esnext", "target": "esnext", "allowArbitraryExtensions": true, "allowImportingTsExtensions": true, "strict": true, "skipLibCheck": true, "noEmit": true, "paths": {} }, "include": ["src/**/*.ts", "src/**/*.svelte"] }"#,
    )
    .unwrap();
    fs::write(
        dir.join("src/lib/components/Foo.svelte"),
        "<script module lang=\"ts\">export const SIZE: number = 1;</script>\n<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<i>{n}</i>\n",
    )
    .unwrap();
    fs::write(dir.join("src/lib/util.ts"), "export const util = 1;\n").unwrap();
    fs::write(
        dir.join("src/lib/index.ts"),
        "export { default as Foo, SIZE } from '#lib/components/Foo.svelte';\n",
    )
    .unwrap();
    fs::write(
        dir.join("src/routes/+page.svelte"),
        "<script lang=\"ts\">import Foo, { SIZE } from '#lib/components/Foo.svelte';\nimport { util } from '#lib/util.ts';\nimport { Foo as Bar } from '#lib';</script>\n<Foo n={SIZE + util} /><Bar n={1} />\n",
    )
    .unwrap();
    fs::write(
        dir.join("src/ambient.d.ts"),
        "declare function $props(): any;\n",
    )
    .unwrap();
    write_svelte_stub(&dir);

    let opts = RunOptions {
        workspace: dir.clone(),
        tsconfig: Some(dir.join("tsconfig.json")),
        type_check: true,
        prefer_tsgo: true,
        ignore: vec!["node_modules".to_string()],
        ..RunOptions::default()
    };
    let errs: Vec<String> = run(&opts)
        .diagnostics
        .iter()
        .filter(|d| d.severity == DiagnosticSeverity::Error)
        .map(|d| {
            format!(
                "{} [{}] {}",
                d.file.display(),
                d.code.clone().unwrap_or_default(),
                d.message
            )
        })
        .collect();
    let _ = fs::remove_dir_all(&dir);

    assert!(
        errs.is_empty(),
        "expected 0 errors, got:\n{}",
        errs.join("\n")
    );
}

/// Each `src/routes/<cell>.ts` / `<CELL>.svelte` pair imports `KIND` from one
/// specifier and annotates it `'t'`: it checks clean only when the specifier
/// lands on a `src/t/` component, which is where official svelte-check
/// (TypeScript's resolver) sends every cell but `p`, whose `null` target makes
/// it TS2307. The expected set is the official checker's output on this
/// fixture.
#[test]
fn package_imports_follow_typescript_conditions_precedence_and_null() {
    if find_compiler(&PathBuf::from("."), true).is_err() {
        assert!(
            std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_none(),
            "no TypeScript 7 native compiler in a job that declares RSVELTE_REQUIRE_PREREQS"
        );
        eprintln!("skip package imports: no TSGO_BIN and no @typescript/native-preview");
        return;
    }
    let dir = std::env::temp_dir().join(format!("rsvelte_pkg_imports_cond_{}", std::process::id()));
    let _ = fs::remove_dir_all(&dir);
    for sub in [
        "src/t",
        "src/x",
        "src/lib/ui",
        "src/lib/private",
        "src/routes",
    ] {
        fs::create_dir_all(dir.join(sub)).unwrap();
    }
    fs::write(
        dir.join("package.json"),
        r##"{ "name": "app", "type": "module", "imports": {
            "#t/*": { "types": "./src/t/*", "default": "./src/x/*" },
            "#s/*": { "svelte": "./src/x/*", "default": "./src/t/*" },
            "#c/*": { "dev": "./src/t/*", "default": "./src/x/*" },
            "#lib/*": "./src/lib/*",
            "#lib/private/*": null,
            "#lib/ui/*": "./src/t/*",
            "#cmp/*.svelte": "./src/t/*.svelte"
        } }"##,
    )
    .unwrap();
    fs::write(
        dir.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler", "module": "esnext", "target": "esnext", "allowArbitraryExtensions": true, "strict": true, "skipLibCheck": true, "noEmit": true, "paths": {}, "customConditions": ["dev"] }, "include": ["src/**/*.ts", "src/**/*.svelte"] }"#,
    )
    .unwrap();
    let kind = |k: &str| {
        format!(
            "<script module lang=\"ts\">export const KIND = '{k}' as const;</script>\n<i></i>\n"
        )
    };
    fs::write(dir.join("src/t/Foo.svelte"), kind("t")).unwrap();
    fs::write(dir.join("src/x/Foo.svelte"), kind("x")).unwrap();
    fs::write(dir.join("src/lib/ui/Foo.svelte"), kind("x")).unwrap();
    fs::write(dir.join("src/lib/private/P.svelte"), kind("t")).unwrap();
    for (cell, spec) in [
        ("t", "#t/Foo.svelte"),
        ("s", "#s/Foo.svelte"),
        ("c", "#c/Foo.svelte"),
        ("u", "#lib/ui/Foo.svelte"),
        ("m", "#cmp/Foo.svelte"),
        ("p", "#lib/private/P.svelte"),
    ] {
        fs::write(
            dir.join(format!("src/routes/{cell}.ts")),
            format!("import {{ KIND }} from '{spec}';\nexport const k: 't' = KIND;\n"),
        )
        .unwrap();
        fs::write(
            dir.join(format!("src/routes/{}.svelte", cell.to_uppercase())),
            format!(
                "<script lang=\"ts\">import {{ KIND }} from '{spec}';\nconst k: 't' = KIND;</script>\n{{k}}\n"
            ),
        )
        .unwrap();
    }
    write_svelte_stub(&dir);

    let opts = RunOptions {
        workspace: dir.clone(),
        tsconfig: Some(dir.join("tsconfig.json")),
        type_check: true,
        prefer_tsgo: true,
        ignore: vec!["node_modules".to_string()],
        ..RunOptions::default()
    };
    let mut errs: Vec<String> = run(&opts)
        .diagnostics
        .iter()
        .filter(|d| d.severity == DiagnosticSeverity::Error)
        .map(|d| {
            format!(
                "{} {}",
                d.file.file_name().unwrap_or_default().to_string_lossy(),
                d.message
            )
        })
        .collect();
    errs.sort();
    let _ = fs::remove_dir_all(&dir);

    assert_eq!(
        errs,
        [
            "P.svelte Cannot find module '#lib/private/P.svelte' or its corresponding type declarations.",
            "p.ts Cannot find module '#lib/private/P.svelte' or its corresponding type declarations.",
        ],
    );
}

/// `Foo.svelte?raw` is Vite's raw-source module, typed by an ambient `*?raw`
/// declaration; official svelte-check types `#lib/Foo.svelte?raw` and
/// `$lib/Foo.svelte?raw` as `string` and a fragment as unresolvable, never as
/// the component.
#[test]
fn a_query_or_fragment_specifier_is_not_the_component() {
    if find_compiler(&PathBuf::from("."), true).is_err() {
        assert!(
            std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_none(),
            "no TypeScript 7 native compiler in a job that declares RSVELTE_REQUIRE_PREREQS"
        );
        eprintln!("skip package imports: no TSGO_BIN and no @typescript/native-preview");
        return;
    }
    let dir =
        std::env::temp_dir().join(format!("rsvelte_pkg_imports_query_{}", std::process::id()));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(dir.join("src/lib")).unwrap();
    fs::create_dir_all(dir.join("src/routes")).unwrap();
    fs::write(
        dir.join("package.json"),
        r##"{ "name": "app", "type": "module", "imports": { "#lib/*": "./src/lib/*" } }"##,
    )
    .unwrap();
    fs::write(
        dir.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler", "module": "esnext", "target": "esnext", "allowArbitraryExtensions": true, "strict": true, "skipLibCheck": true, "noEmit": true, "paths": { "$lib/*": ["./src/lib/*"] } }, "include": ["src/**/*.ts", "src/**/*.svelte"] }"#,
    )
    .unwrap();
    fs::write(
        dir.join("src/lib/Foo.svelte"),
        "<script module lang=\"ts\">export const SIZE: number = 1;</script>\n<i></i>\n",
    )
    .unwrap();
    fs::write(
        dir.join("src/ambient.d.ts"),
        "declare module '*?raw' { const source: string; export default source; }\n",
    )
    .unwrap();
    fs::write(
        dir.join("src/routes/Q.svelte"),
        "<script lang=\"ts\">import a from '#lib/Foo.svelte?raw';\nimport b from '$lib/Foo.svelte?raw';\nimport { SIZE } from '#lib/Foo.svelte';\nimport c from '#lib/Foo.svelte#frag';\nconst s: string = a + b;\nconst n: number = SIZE;</script>\n{s}{n}{c}\n",
    )
    .unwrap();
    write_svelte_stub(&dir);

    let opts = RunOptions {
        workspace: dir.clone(),
        tsconfig: Some(dir.join("tsconfig.json")),
        type_check: true,
        prefer_tsgo: true,
        ignore: vec!["node_modules".to_string()],
        ..RunOptions::default()
    };
    let errs: Vec<String> = run(&opts)
        .diagnostics
        .iter()
        .filter(|d| d.severity == DiagnosticSeverity::Error)
        .map(|d| {
            format!(
                "{} {}",
                d.file.file_name().unwrap_or_default().to_string_lossy(),
                d.message
            )
        })
        .collect();
    let _ = fs::remove_dir_all(&dir);

    assert_eq!(
        errs,
        [
            "Q.svelte Cannot find module '#lib/Foo.svelte#frag' or its corresponding type declarations."
        ],
    );
}
