//! #800: a same-name `Foo.svelte.ts` companion must not shadow `./Foo.svelte`'s
//! component overlay (its default + `<script module>` named exports).
//!
//! TypeScript resolves `./Foo.svelte` by appending extensions in the importer's
//! own directory, so a sibling `Foo.svelte.ts` always wins over the overlay's
//! `Foo.svelte.tsx` shadow — `rootDirs` is only a fallback and `paths` never
//! applies to relative specifiers. The overlay therefore augments the module
//! TypeScript did pick (the companion) with the shadow's default + named
//! exports. The same fixture pins #751 (named imports resolved *from* the
//! companion via `./Foo.svelte.js`) so neither direction regresses.
//!
//! Real-tsc/tsgo e2e; skipped when no tsgo/tsc is found.

use std::fs;
use std::path::{Path, PathBuf};

use rsvelte_check::tsgo::find_compiler;
use rsvelte_check::{RunOptions, run};
use rsvelte_diagnostics::DiagnosticSeverity;

/// Minimal `svelte` package stub — enough for the emitted shims and the
/// component shadows to type-check without pulling in the real package (whose
/// `.svelte` test fixtures would end up in the walk).
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
    // `svelte-jsx-v4.d.ts` imports these; without them every shim reference
    // degrades to a TS2307 that would drown the assertions below.
    fs::write(
        svelte_dir.join("elements.d.ts"),
        "export interface HTMLAttributes<T=any>{ [k:string]:any }\nexport interface SVGAttributes<T=any>{ [k:string]:any }\nexport interface DOMAttributes<T=any>{ [k:string]:any }\nexport interface AriaAttributes{ [k:string]:any }\nexport type HTMLElements = any;\nexport type SvelteHTMLElements = any;\nexport type SvelteMediaTimeRange = any;\n",
    )
    .unwrap();
}

const TSCONFIG: &str = r#"{ "compilerOptions": { "moduleResolution": "bundler", "module": "esnext", "target": "esnext", "allowArbitraryExtensions": true, "strict": true, "skipLibCheck": true }, "include": ["src/**/*.ts", "src/**/*.svelte"] }"#;

fn run_check(dir: &Path) -> Vec<String> {
    let opts = RunOptions {
        workspace: dir.to_path_buf(),
        tsconfig: Some(dir.join("tsconfig.json")),
        type_check: true,
        prefer_tsgo: true,
        ignore: vec!["node_modules".to_string()],
        ..RunOptions::default()
    };
    run(&opts)
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
        .collect()
}

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
        "<script module lang=\"ts\">export const ATTR = 'data-x' as const;\nexport type Kind = 'a' | 'b';</script>\n<script lang=\"ts\">let { n }: { n: number } = $props();</script>\n<span data-x={ATTR}>{n}</span>\n",
    )
    .unwrap();
    fs::write(
        src.join("H.svelte.ts"),
        "import H, { ATTR } from './H.svelte';\nexport const useAttr = (): string => ATTR;\nexport const Comp = H;\n",
    )
    .unwrap();
    // Barrel: the component's default + `<script module>` exports, plus the
    // companion's own named export reached through `./H.svelte.js` (#751).
    fs::write(
        src.join("idx.ts"),
        "export { default as H, ATTR } from './H.svelte';\nexport type { Kind } from './H.svelte';\nexport { useAttr } from './H.svelte.js';\n",
    )
    .unwrap();
    // A component importing both halves — the shadow side of the same split.
    fs::write(
        src.join("User.svelte"),
        "<script lang=\"ts\">import H from './H.svelte';\nimport { ATTR } from './H.svelte';\nimport { useAttr } from './H.svelte.js';\nconst label: string = useAttr() + ATTR;</script>\n<H n={1} />{label}\n",
    )
    .unwrap();
    fs::write(
        src.join("ambient.d.ts"),
        "declare function $props(): any;\ndeclare function $state<T>(v: T): T;\n",
    )
    .unwrap();
    fs::write(dir.join("tsconfig.json"), TSCONFIG).unwrap();
    write_svelte_stub(&dir);

    let errs = run_check(&dir);
    let augment =
        fs::read_to_string(dir.join(".svelte-check/companion-augment.d.ts")).unwrap_or_default();
    let _ = fs::remove_dir_all(&dir);

    assert!(
        errs.is_empty(),
        "#800 expected 0 errors, got:\n{}",
        errs.join("\n")
    );
    assert!(
        augment.contains("export import ATTR ="),
        "companion augmentation should forward the module-context exports:\n{augment}"
    );
}

/// Without a companion nothing is augmented — the plain `.svelte` shadow path
/// must stay untouched, and no stale augmentation file may linger.
#[test]
fn no_companion_means_no_augmentation() {
    if find_compiler(&PathBuf::from("."), true).is_err() {
        eprintln!("skip #800: no tsgo/tsc found");
        return;
    }
    let dir = std::env::temp_dir().join(format!("rsvelte_800_solo_{}", std::process::id()));
    let _ = fs::remove_dir_all(&dir);
    let src = dir.join("src");
    fs::create_dir_all(&src).unwrap();
    fs::write(
        src.join("H.svelte"),
        "<script module lang=\"ts\">export const ATTR = 'data-x' as const;</script>\n<span data-x={ATTR}></span>\n",
    )
    .unwrap();
    fs::write(
        src.join("idx.ts"),
        "export { default as H, ATTR } from './H.svelte';\n",
    )
    .unwrap();
    fs::write(dir.join("tsconfig.json"), TSCONFIG).unwrap();
    write_svelte_stub(&dir);

    let errs = run_check(&dir);
    let augment_exists = dir.join(".svelte-check/companion-augment.d.ts").exists();
    let _ = fs::remove_dir_all(&dir);

    assert!(
        errs.is_empty(),
        "expected 0 errors, got:\n{}",
        errs.join("\n")
    );
    assert!(
        !augment_exists,
        "no companion — no augmentation file expected"
    );
}
