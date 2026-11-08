//! Whether `$$render` is `async` follows upstream's `hasTopLevelAwait`
//! (`processInstanceScriptContent.ts`): an `AwaitExpression` that no `Block` or
//! function-like encloses, where TypeScript decides which `await` tokens are
//! `AwaitExpression`s. Every expectation below is official svelte2tsx's output
//! for `<script lang="ts">\n{script}\n</script>\n<p>x</p>\n`.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, SvelteVersion, svelte2tsx};

fn convert(script: &str, version: SvelteVersion) -> String {
    let source = format!("<script lang=\"ts\">\n{script}\n</script>\n<p>x</p>\n");
    svelte2tsx(
        &source,
        Svelte2TsxOptions {
            filename: "A.svelte".to_string(),
            is_ts_file: true,
            version,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code
}

#[test]
fn render_is_async_exactly_when_upstream_sees_a_top_level_await() {
    let cells: &[(&str, bool)] = &[
        ("const a = $derived((await fetch('/x')) as Response);", true),
        (
            "const a = $derived((await fetch('/x')) satisfies Response);",
            true,
        ),
        ("const a = $derived((await fetch('/x'))!);", true),
        ("const a = $derived(<Response>(await fetch('/x')));", true),
        ("const a = $derived((await fetch('/x'))?.status);", true),
        ("const a = $derived(f(await g())?.());", true),
        ("const a = $derived((await g)<string>);", true),
        (
            "const a = $derived(await fetch('/x') satisfies Response);",
            true,
        ),
        (
            "const a = async () => (await fetch('/x')) as Response;",
            false,
        ),
        ("export const a = await f();", true),
        ("if (c) await f();", true),
        ("if (c) { await f(); }", false),
        ("for await (const x of y) {}", false),
        ("for await (const x of y) g(await f(x));", true),
        ("for (const x of await y) {}", true),
        ("while (await f()) {}", true),
        ("if (await f()) {}", true),
        ("switch (a) { case 1: await f(); }", true),
        ("switch (await a) { case 1: break; }", true),
        ("try { await f(); } catch {}", false),
        ("throw await f();", true),
        ("lbl: await f();", true),
        ("$: x = await f();", true),
        ("class A { x = await f(); }", true),
        ("class A { [await k]() {} }", false),
        ("class A { [await k] = 1; }", true),
        ("class A { static { await f(); } }", false),
        ("const C = class { x = await f(); };", true),
        ("const o = { [await k]: 1 };", true),
        ("const o = { get [await k]() { return 1; } };", false),
        ("const o = { m() { return 1; }, [await k]: 2 };", true),
        ("const { a = await f() } = obj;", true),
        ("const [b = await f()] = arr;", true),
        ("new (await f())();", true),
        ("(await f()).x = 1;", true),
        ("obj[await k] = 1;", true),
        ("import(await f());", true),
        ("const r = await (fetch('/x'));", false),
        ("import x from 'y';\nconst r = await (fetch('/x'));", true),
        ("const r = await\nfetch('/x');", false),
        (
            "function f() { return 1; }\nconst a = f`${await g()}`;",
            true,
        ),
        ("const a = `${await g()}`;", true),
        ("const a = c ? await b : d;", true),
        ("void (await f());", true),
        ("const g = (a = await f()) => a;", false),
        ("function h() { await g(); }", false),
        (
            "let { a }: { a: string } = $props();\nconst resume = $derived((await fetch(a)) as Response);",
            true,
        ),
        ("export {};\nconst r = await (fetch('/x'));", true),
        ("export type T = 1;\nconst r = await (fetch('/x'));", true),
        (
            "type T = 1;\nexport { type T };\nconst r = await (fetch('/x'));",
            true,
        ),
        (
            "const m = import.meta;\nconst r = await (fetch('/x'));",
            true,
        ),
        ("import y = Z.w;\nconst r = await (fetch('/x'));", false),
        (
            "export as namespace Q;\nconst r = await (fetch('/x'));",
            false,
        ),
        (
            "declare module 'm' { export const z: 1; }\nconst r = await (fetch('/x'));",
            false,
        ),
        ("const r = await [p][0];", false),
        ("const r = await `x`;", false),
        ("const r = await 'x';", true),
        ("const r = await 1;", true),
        ("const r = await .5;", true),
        ("const r = await 1n;", true),
        ("const r = await -1;", false),
        ("const r = await !p;", false),
        ("const r = await this;", true),
        ("const r = await new P();", true),
        ("const r = await typeof p;", true),
        ("const r = await {};", false),
        ("const r = await /re/;", false),
        ("const r = await /* c */ p;", true),
        ("const r = await /* c\n */ p;", false),
        ("const r = await // c\n p;", false),
        (r#"const r = await \u0070;"#, true),
        ("const r = await ñ;", true),
        ("const r = await <T>p;", false),
        ("const r = await (await (p));", false),
        ("const r = await\np;", false),
        ("import x from 'y';\nconst r = await\np;", true),
        ("class A { x = await (f()); }", false),
        ("import x from 'y';\nclass A { x = await (f()); }", false),
        ("import x from 'y';\nclass A { x = await f(); }", true),
        ("import x from 'y';\nconst o = { [await (k)]: 1 };", true),
        ("import x from 'y';\nclass A { [await (k)] = 1; }", true),
        (
            "import x from 'y';\nconst C = class { x = await (f()); };",
            false,
        ),
        (
            "import x from 'y';\nclass A { static x = await (f()); }",
            false,
        ),
        (
            "import x from 'y';\nclass A { accessor x = await (f()); }",
            false,
        ),
        ("import x from 'y';\n@d(await (f())) class A {}", true),
        ("@d(await f()) class A {}", true),
        ("class A { @d(await f()) x = 1; }", true),
        ("class A { @d(await f()) m() {} }", false),
        (
            "import x from 'y';\nclass A { x = () => 1; y = await (f()); }",
            false,
        ),
        (
            "import x from 'y';\nclass A { x = { a: await (f()) }; }",
            false,
        ),
        ("const r = p\n  ? await (q)\n  : 1;", false),
        ("const r = $derived(await (q));", false),
        ("const r = await (q) satisfies T;", false),
        ("enum E { A = await (f()) }", false),
        ("import x from 'y';\nenum E { A = await (f()) }", false),
        ("enum E { A = await f() }", true),
        (
            "import x from 'y';\nnamespace N { const a = await (f()); }",
            false,
        ),
        ("namespace N { const a = await (f()); }", false),
        ("import x from 'y';\nexport default await (f());", true),
        ("import x from 'y';\nif (c) await (f());", true),
        (
            "import x from 'y';\nswitch (a) { case await (b): break; }",
            true,
        ),
        ("import x from 'y';\nclass A extends (await (B)) {}", true),
        ("class A extends (await B) {}", true),
        (
            "import x from 'y';\nclass A { [k] = 1; static { } x = 1; }; const z = await (f());",
            true,
        ),
        (
            "import x from 'y';\nconst o = { a: await (f()), get b() { return 1; } };",
            true,
        ),
        (
            "import x from 'y';\nconst o = { m: function () {}, a: await (f()) };",
            true,
        ),
        (
            "import x from 'y';\nconst t = <T,>(a: T) => a; const z = await (f());",
            true,
        ),
        ("label: { await f(); }", false),
        ("import x from 'y';\nconst r = await (p) as T;", true),
        ("import x from 'y';\nconst r = (await (p))!;", true),
        (
            "import x from 'y';\nconst r = $derived((await (p)) satisfies T);",
            true,
        ),
        ("const r = await (p)\nexport {}", true),
        ("if (c) { await f(); }\nconst r = await (g());", false),
        (
            "const h = async () => { await f(); };\nconst r = await (g());",
            false,
        ),
        ("class A { x = await f(); }\nconst r = await (g());", true),
        ("export as namespace Q;\nconst r = await f();", true),
        ("import y = Z.w;\nconst r = await f();", true),
        ("const r = await (g());\nconst s = await f();", true),
        ("{ await f(); }\nconst r = await [g][0];", false),
        ("await using x = f();", false),
        ("const r = await\n(g());", false),
    ];
    let wrong: Vec<String> = cells
        .iter()
        .filter_map(|&(script, expected)| {
            let code = convert(script, SvelteVersion::V5);
            let actual = code.contains("async function $$render");
            (actual != expected).then(|| format!("expected async={expected}: {script:?}"))
        })
        .collect();
    assert!(
        wrong.is_empty(),
        "{} of {} cells disagree:\n{}",
        wrong.len(),
        cells.len(),
        wrong.join("\n")
    );
}

#[test]
fn the_await_declaration_is_byte_identical_to_upstream() {
    let code = convert(
        "const a = $derived((await fetch('/x')) as Response);",
        SvelteVersion::V5,
    );
    assert!(
        code.contains("\n/*Ωignore_startΩ*/const $$$render = await $$render();/*Ωignore_endΩ*/\n"),
        "{code}"
    );
}

#[test]
fn svelte_4_never_makes_render_async() {
    let code = convert("const a = await f();", SvelteVersion::V4);
    assert!(!code.contains("async function $$render"), "{code}");
}
