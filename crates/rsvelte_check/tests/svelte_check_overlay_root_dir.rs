//! The overlay tsconfig extends the project's from `.svelte-check/`, and
//! TypeScript 6+ defaults an unset `rootDir` to the directory of the config it
//! was given. TS6059 ("not under 'rootDir'") must come out exactly where
//! `tsgo -p <project>/tsconfig.json` reports it: never for a project source when
//! only `outDir` is set, never for a sibling-package source reached through
//! `paths` when nothing sets `outDir`, and for that sibling source when it is.
//!
//! Real-compiler e2e; skipped without `TSGO_BIN` or @typescript/native-preview.

use std::fs;
use std::path::{Path, PathBuf};

use rsvelte_check::tsgo::{find_compiler, run_tsgo};
use rsvelte_check::{RunOptions, run};

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

/// A project in `<root>/app` whose `src/main.ts` imports a sibling package's
/// `<root>/shared/s.ts` through `paths`.
fn fixture(tag: &str, extra_options: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!("rsvelte_root_dir_{tag}_{}", std::process::id()));
    let _ = fs::remove_dir_all(&root);
    let app = root.join("app");
    fs::create_dir_all(app.join("src")).unwrap();
    fs::create_dir_all(root.join("shared")).unwrap();
    fs::write(
        root.join("shared/s.ts"),
        "export const shared: number = 1;\n",
    )
    .unwrap();
    fs::write(
        app.join("src/main.ts"),
        "import { shared } from '@shared/s';\nexport const main: number = shared;\n",
    )
    .unwrap();
    fs::write(
        app.join("src/App.svelte"),
        "<script lang=\"ts\">import { main } from './main';\nconst text: string = String(main);</script>\n<p>{text}</p>\n",
    )
    .unwrap();
    fs::write(
        app.join("tsconfig.json"),
        format!(
            r#"{{ "compilerOptions": {{ "moduleResolution": "bundler", "module": "esnext", "target": "esnext", "strict": true, "skipLibCheck": true, "noEmit": true, "paths": {{ "@shared/*": ["../shared/*"] }}{extra_options} }}, "include": ["src/**/*.ts", "src/**/*.svelte"] }}"#
        ),
    )
    .unwrap();
    write_svelte_stub(&app);
    root
}

/// The fixture-relative file each TS6059 names: `(rsvelte-check, the compiler
/// run on the project's own tsconfig)`.
fn ts6059(root: &Path) -> (Vec<String>, Vec<String>) {
    let app = root.join("app");
    let tsconfig = app.join("tsconfig.json");
    let tag = format!("{}/", root.file_name().unwrap().to_string_lossy());
    let named = |message: &str| {
        let file = message
            .split_once("File '")
            .and_then(|(_, rest)| rest.split_once('\''))
            .map_or(message, |(file, _)| file);
        file.split_once(&tag)
            .map_or(file, |(_, rel)| rel)
            .to_string()
    };
    let opts = RunOptions {
        workspace: app.clone(),
        tsconfig: Some(tsconfig.clone()),
        type_check: true,
        prefer_tsgo: true,
        ignore: vec!["node_modules".to_string()],
        ..RunOptions::default()
    };
    let mut ours: Vec<String> = run(&opts)
        .diagnostics
        .into_iter()
        .filter(|d| d.code.as_deref().is_some_and(|code| code.ends_with("6059")))
        .map(|d| named(&d.message))
        .collect();
    let binary = find_compiler(&app, true).unwrap();
    let mut oracle: Vec<String> = run_tsgo(&binary, &tsconfig, &app)
        .unwrap()
        .into_iter()
        .filter(|d| d.code.ends_with("6059"))
        .map(|d| named(&d.message))
        .collect();
    let _ = fs::remove_dir_all(root);
    ours.sort();
    oracle.sort();
    (ours, oracle)
}

fn have_compiler() -> bool {
    if find_compiler(&PathBuf::from("."), true).is_ok() {
        return true;
    }
    assert!(
        std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_none(),
        "no TypeScript 7 native compiler in a job that declares RSVELTE_REQUIRE_PREREQS — \
         set TSGO_BIN, or install @typescript/native-preview."
    );
    eprintln!("skip: no TSGO_BIN and no @typescript/native-preview");
    false
}

#[test]
fn out_dir_alone_keeps_project_sources_under_the_default_root_dir() {
    if !have_compiler() {
        return;
    }
    let root = fixture("outdir", r#", "outDir": "./dist""#);
    // Same project, without the sibling import: tsgo -p reports nothing.
    fs::write(
        root.join("app/src/main.ts"),
        "export const main: number = 1;\n",
    )
    .unwrap();
    let (ours, oracle) = ts6059(&root);
    assert!(oracle.is_empty(), "fixture premise: {oracle:?}");
    assert_eq!(ours, oracle);
}

#[test]
fn no_out_dir_never_compares_sources_against_a_root_dir() {
    if !have_compiler() {
        return;
    }
    let (ours, oracle) = ts6059(&fixture("no-outdir", ""));
    assert!(oracle.is_empty(), "fixture premise: {oracle:?}");
    assert_eq!(ours, oracle);
}

/// TypeScript 6+ reports the sibling source; TypeScript 5 (the `tsc` CI pins
/// through `TSGO_BIN`) defaults `rootDir` to the common source directory and
/// reports nothing. Either way the overlay has to agree with the project.
#[test]
fn out_dir_reports_the_sibling_source_the_compiler_reports() {
    if !have_compiler() {
        return;
    }
    let (ours, oracle) = ts6059(&fixture("outdir-sibling", r#", "outDir": "./dist""#));
    assert!(
        oracle.is_empty() || oracle == ["shared/s.ts"],
        "fixture premise: {oracle:?}"
    );
    assert_eq!(ours, oracle);
}
