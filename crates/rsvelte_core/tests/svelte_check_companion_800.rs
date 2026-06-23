//! #800: a same-name `Foo.svelte.ts` companion must not shadow `./Foo.svelte`'s
//! component overlay (its default + `<script module>` named exports).
//!
//! Real-tsgo e2e; skipped when no tsgo/tsc is found.

use std::fs;
use std::path::PathBuf;

use rsvelte_core::svelte_check::diagnostic::DiagnosticSeverity;
use rsvelte_core::svelte_check::tsgo::find_compiler;
use rsvelte_core::svelte_check::{RunOptions, run};

// #800 is a known architectural limitation: a same-name `Foo.svelte.ts`
// companion in the same directory self-resolves `import './Foo.svelte'` to
// itself (`.ts` beats the component's `.svelte.tsx` / `.svelte.d.ts` shadow),
// and TS *relative*-import resolution can't be redirected via tsconfig
// `rootDirs`/`paths` — the upstream fix is a TS language-server plugin that
// intercepts `resolveModuleNameLiterals`, which `tsgo` does not support. This
// test is the real-tsgo repro; run it explicitly to verify a future fix:
//   TSGO_BIN=… cargo test --test svelte_check_companion_800 -- --ignored --nocapture
#[ignore = "#800: companion .svelte.ts shadows ./Foo.svelte — needs resolution interception (tsgo plugin); repro only"]
#[test]
fn companion_svelte_ts_does_not_shadow_component_module() {
    if find_compiler(&PathBuf::from("."), true).is_err() {
        eprintln!("skip #800: no tsgo/tsc found");
        return;
    }
    let dir = std::env::temp_dir().join(format!("rsvelte_800_{}", std::process::id()));
    let _ = fs::remove_dir_all(&dir);
    let src = dir.join("src");
    fs::create_dir_all(&src).unwrap();
    fs::write(
        src.join("H.svelte"),
        "<script module lang=\"ts\">export const ATTR = 'data-x' as const;</script>\n<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<span data-x={ATTR}>{n}</span>\n",
    )
    .unwrap();
    fs::write(
        src.join("H.svelte.ts"),
        "import H, { ATTR } from './H.svelte';\nexport const useAttr = (): string => ATTR;\nexport const Comp = H;\n",
    )
    .unwrap();
    fs::write(
        src.join("idx.ts"),
        "export { default as H, ATTR } from './H.svelte';\n",
    )
    .unwrap();
    fs::write(
        dir.join("tsconfig.json"),
        r#"{ "compilerOptions": { "moduleResolution": "bundler", "allowArbitraryExtensions": true, "strict": true, "skipLibCheck": true }, "include": ["src/**/*.ts", "src/**/*.svelte"] }"#,
    )
    .unwrap();
    // Minimal `svelte` type stub — enough for tsgo to resolve `import('svelte')`
    // without pulling the source package's `.svelte` test fixtures into the walk.
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

    let opts = RunOptions {
        workspace: dir.clone(),
        type_check: true,
        prefer_tsgo: true,
        ignore: vec!["node_modules".to_string()],
        ..RunOptions::default()
    };
    let result = run(&opts);
    let errs: Vec<String> = result
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
    eprintln!("=DIAG800=\n{}\n=ENDDIAG800=", errs.join("\n"));
    let _ = fs::remove_dir_all(&dir);

    // The companion's `./H.svelte` import must see the component default + ATTR.
    let bad: Vec<&String> = errs
        .iter()
        .filter(|m| {
            m.contains("H.svelte")
                && (m.contains("no default") || m.contains("ATTR") || m.contains("Circular"))
        })
        .collect();
    assert!(
        bad.is_empty(),
        "#800 companion errors present:\n{}",
        errs.join("\n")
    );
}
