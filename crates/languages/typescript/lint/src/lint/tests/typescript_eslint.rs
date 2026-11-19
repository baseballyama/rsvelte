use super::{Dialect, unused};

mod ambient;

// The expectations are @typescript-eslint/eslint-plugin 8.72.1's rule on ESLint 10.14.0.
const UNUSED: &[(&str, &str, &[&str])] = &[
    (
        "input.ts",
        "let a = 1; let b = 2; a = 3;",
        &[
            "'b' is assigned a value but never used.@15-16",
            "'a' is assigned a value but never used.@22-23",
        ],
    ),
    ("input.ts", "function f(a, b) { return b; } f();", &[]),
    (
        "input.ts",
        "function f(a, b) { return a; } f();",
        &["'b' is defined but never used.@14-15"],
    ),
    (
        "input.ts",
        "const g = function h() {};",
        &["'g' is assigned a value but never used.@6-7"],
    ),
    (
        "input.ts",
        "export const x = 1; const y = 1;",
        &["'y' is assigned a value but never used.@26-27"],
    ),
    (
        "input.ts",
        "let c = 0; c = c + 1;",
        &["'c' is assigned a value but never used.@11-12"],
    ),
    (
        "input.ts",
        "let d = 0; d++;",
        &["'d' is assigned a value but never used.@11-12"],
    ),
    (
        "input.ts",
        "function q(o) { for (const k in o) return; } q();",
        &[],
    ),
    (
        "input.ts",
        "try {} catch (e) {}",
        &["'e' is defined but never used.@14-15"],
    ),
    (
        "input.ts",
        "class C {}",
        &["'C' is defined but never used.@6-7"],
    ),
    (
        "input.ts",
        "import { u } from 'm'; import type { T } from 'm'; let v: T;",
        &[
            "'u' is defined but never used.@9-10",
            "'v' is defined but never used.@55-56",
        ],
    ),
    (
        "input.ts",
        "function p(x?: number) {} p();",
        &["'x' is defined but never used.@11-12"],
    ),
    (
        "input.ts",
        "const s = (n: number) => s(n);",
        &["'s' is assigned a value but never used.@6-7"],
    ),
    (
        "input.ts",
        "declare const amb: number;",
        &["'amb' is defined but never used.@14-17"],
    ),
    ("input.ts", "class K { set v(x) {} } new K();", &[]),
    (
        "input.ts",
        "let w = 1; function z() { w = 2; } z();",
        &["'w' is assigned a value but never used.@4-5"],
    ),
    (
        "input.ts",
        "function o(a = 1) {} o();",
        &["'a' is assigned a value but never used.@11-12"],
    ),
    (
        "input.ts",
        "const { m, n } = { m: 1, n: 2 }; console.log(m);",
        &["'n' is assigned a value but never used.@11-12"],
    ),
    (
        "input.ts",
        "for (const i of []) {}",
        &["'i' is assigned a value but never used.@11-12"],
    ),
    (
        "input.ts",
        "let r; r = 1;",
        &["'r' is assigned a value but never used.@7-8"],
    ),
    (
        "input.ts",
        "function overload(a: string): void; function overload(a: any) { return a; } overload('');",
        &[],
    ),
    (
        "input.ts",
        "type TT = number; interface II {}",
        &[
            "'TT' is defined but never used.@5-7",
            "'II' is defined but never used.@28-30",
        ],
    ),
    ("input.ts", "let t = 0; t += 1; t ||= 2;", &[]),
    (
        "input.ts",
        "enum E { A } namespace N {}",
        &[
            "'E' is defined but never used.@5-6",
            "'N' is defined but never used.@23-24",
        ],
    ),
    (
        "input.ts",
        "namespace A.B.C { const a = 1; }",
        &["'a' is assigned a value but never used.@24-25"],
    ),
    (
        "input.ts",
        "function g<T>() {} g();",
        &["'T' is defined but never used.@11-12"],
    ),
    (
        "input.ts",
        "type F = (a: number) => void; let ff: F; ff;",
        &[],
    ),
    (
        "input.ts",
        "declare function df(a: number): void;",
        &["'df' is defined but never used.@17-19"],
    ),
    (
        "input.ts",
        "interface I2 { m(a: number): void } let i2: I2; i2;",
        &[],
    ),
    (
        "input.ts",
        "type Mapped = { [K in 'a']: 1 }; let mm: Mapped; mm;",
        &[],
    ),
    (
        "input.ts",
        "class P { constructor(private a: number, b: number) {} } new P(1, 2);",
        &["'b' is defined but never used.@41-42"],
    ),
    (
        "input.ts",
        "abstract class Q { abstract m(a: number): void } new (class extends Q { m() {} })();",
        &[],
    ),
    (
        "input.ts",
        "let typed = 1; type U = typeof typed; let uu: U; uu;",
        &["'typed' is assigned a value but only used as a type.@4-9"],
    ),
    (
        "input.ts",
        "import x = require('x');",
        &["'x' is defined but never used.@7-8"],
    ),
    (
        "input.ts",
        "declare module 'mod' { const inner: number; }",
        &[],
    ),
    ("input.ts", "declare global { var gg: number; }", &[]),
    ("input.ts", "function th(this: Window) {} th;", &[]),
    ("input.ts", "let o2 = {}; o2.a = 1;", &[]),
    (
        "input.ts",
        "if (t) { var fn = function () {}; } if (t) { var fn = function expr() {}; }",
        &["'fn' is assigned a value but never used.@49-51"],
    ),
    (
        "input.ts",
        "var v = 1; var v = 2;",
        &["'v' is assigned a value but never used.@15-16"],
    ),
    (
        "input.ts",
        "var w = 1; var w;",
        &["'w' is assigned a value but never used.@4-5"],
    ),
    (
        "input.ts",
        "const a = 1; interface A { Abc: typeof a } interface Abc { foo: A.Abc } let x: Abc; x;",
        &["'a' is assigned a value but only used as a type.@6-7"],
    ),
    ("input.ts", "interface B {} let y: B.C; y;", &[]),
    (
        "input.ts",
        "const a = new class Foo {}; a; class Bar {} const C = class D { m() { return D; } }; C; \
         const E = class F {}; let g = class H {}; g = 1;",
        &[
            "'Bar' is defined but never used.@37-40",
            "'E' is assigned a value but never used.@94-95",
            "'g' is assigned a value but never used.@130-131",
        ],
    ),
    (
        "input.ts",
        "declare function foo(arg1: string, arg2: string): arg1 is string; type D = (v) => v is \
         number; function g(a: unknown, b: unknown): asserts a is string {} function h(this: \
         Window, x: unknown): this is Window { return true; } export { foo, g, h }; let z: D; z;",
        &[
            "'a' is defined but only used as a type.@106-107",
            "'b' is defined but never used.@118-119",
            "'x' is defined but never used.@179-180",
        ],
    ),
    (
        "input.ts",
        "type Foo = 1; let h: (this: Foo, a: number) => void; h; interface I { m(this: I): void; \
         } let i: I; i; type C = { (this: C): void }; let c: C; c;",
        &[],
    ),
    (
        "input.ts",
        "let x = function (a = 1, b?: string, c = 2) {}; x; let y = function (b: string, { c } = \
         {}) {}; y; let z = function (b: string, ...r) {}; z;",
        &[
            "'a' is assigned a value but never used.@18-19",
            "'c' is assigned a value but never used.@37-38",
            "'c' is assigned a value but never used.@82-83",
            "'b' is defined but never used.@117-118",
            "'r' is defined but never used.@131-132",
        ],
    ),
    (
        "input.ts",
        "class C { m(this: C) {} } class D { x: D; static make() { return new D(); } } class E {} \
         new E(); class F extends Array<F> {}",
        &[
            "'C' is defined but never used.@6-7",
            "'D' is defined but never used.@32-33",
            "'F' is defined but never used.@104-105",
        ],
    ),
    (
        "input.ts",
        "type A = new (a: number) => void; interface B { new (b: number): B; (c: number): void } \
         let x: A; let y: B; x; y;",
        &[],
    ),
    (
        "input.ts",
        "type D = ({ a, b }: { a: 1; b: 2 }, [c]: [3], ...d: 4[]) => void; let x: D; x;",
        &[],
    ),
    (
        "input.ts",
        "class C { m(a: number): void; m(a: number, b?: number) { return a; } } new C();",
        &["'b' is defined but never used.@43-44"],
    ),
    (
        "input.ts",
        "function f(this: Window, a: number) {} f; const g = function (this: Window) {}; g;",
        &["'a' is defined but never used.@25-26"],
    ),
    (
        "input.ts",
        "enum E { A, B = A } enum F { X = F.X } export { E };",
        &["'F' is defined but never used.@25-26"],
    ),
    (
        "input.ts",
        "type M = { [K in 'a' as `x${K}`]: K }; export type { M };",
        &[],
    ),
    (
        "input.ts",
        "class P { constructor(a: number, private b: number) {} } new P(1, 2);",
        &[],
    ),
    (
        "input.ts",
        "class Q { constructor(a: number, readonly b = 1, public c?: string) {} } new Q(1);",
        &[],
    ),
    (
        "input.ts",
        "interface N1 { next: N1 } type L = { next: L }; type U = string | U[]; let ok: N1; ok;",
        &[
            "'L' is defined but never used.@31-32",
            "'U' is defined but never used.@53-54",
        ],
    ),
    (
        "input.ts",
        "namespace NS { export const a = 1; export const b = NS.a; }",
        &["'NS' is defined but never used.@10-12"],
    ),
    (
        "input.ts",
        "namespace NT { export const a = 1; } const v = NT.a; v;",
        &[],
    ),
    (
        "input.ts",
        "function rec(n: number): typeof rec { return rec; } export { rec };",
        &["'n' is defined but never used.@13-14"],
    ),
    (
        "input.ts",
        "const x = 1; type T = typeof x; export type { T };",
        &["'x' is assigned a value but only used as a type.@6-7"],
    ),
    (
        "input.ts",
        "import { y } from 'm'; type T = typeof y; export type { T };",
        &[],
    ),
    (
        "input.ts",
        "import type { Z } from 'm'; type T = typeof Z; export type { T };",
        &[],
    ),
    (
        "input.ts",
        "import { type W, V } from 'm'; type T = typeof W | typeof V; export type { T };",
        &[],
    ),
    (
        "input.ts",
        "function g(a: unknown, b: number): asserts a is string { return b; } g;",
        &[],
    ),
    (
        "input.ts",
        "function h(x: unknown): x is string { return true; } h;",
        &["'x' is defined but only used as a type.@11-12"],
    ),
    ("input.ts", "interface A {} export interface A {}", &[]),
    ("input.ts", "namespace N {} export namespace N {}", &[]),
    (
        "input.ts",
        "function o(a: string): void; export function o(a: any) { return a; }",
        &[],
    ),
    (
        "input.ts",
        "export default interface DI {} interface DI { x: 1 }",
        &[],
    ),
    ("input.ts", "class Cl {} export default Cl;", &[]),
    (
        "input.ts",
        "function outer() { type Local = 1; interface I {} enum En { A } } outer();",
        &[
            "'Local' is defined but never used.@24-29",
            "'I' is defined but never used.@45-46",
            "'En' is defined but never used.@55-57",
        ],
    ),
    (
        "input.ts",
        "let u: (a: number) => void = (b) => {}; u;",
        &["'b' is defined but never used.@30-31"],
    ),
    (
        "input.ts",
        "abstract class AB { abstract m(a: number): void; abstract get g(): number; } export { AB \
         };",
        &[],
    ),
    (
        "input.ts",
        "type G<T> = T; function gen<U>(u: U) { return u; } export { gen };",
        &["'G' is defined but never used.@5-6"],
    ),
    (
        "input.ts",
        "class S { static { } } class T2 { static { const z = 1; } }",
        &[
            "'S' is defined but never used.@6-7",
            "'T2' is defined but never used.@29-31",
            "'z' is assigned a value but never used.@49-50",
        ],
    ),
    (
        "input.ts",
        "try {} catch { } try {} catch ({ message }) {}",
        &["'message' is defined but never used.@33-40"],
    ),
    (
        "input.ts",
        "const { a, ...rest } = { a: 1, b: 2 }; rest;",
        &["'a' is assigned a value but never used.@8-9"],
    ),
    (
        "input.ts",
        "const [ , second] = [1, 2]; const [first, , third] = [1, 2, 3]; first;",
        &[
            "'second' is assigned a value but never used.@10-16",
            "'third' is assigned a value but never used.@44-49",
        ],
    ),
    (
        "input.ts",
        "using res = null as any; await using r2 = null as any;",
        &[
            "'res' is assigned a value but never used.@6-9",
            "'r2' is assigned a value but never used.@37-39",
        ],
    ),
    (
        "input.ts",
        "export const fn = (a: number, b: number) => b; export function f2(this: void, a: number) \
         {}",
        &["'a' is defined but never used.@78-79"],
    ),
    (
        "input.ts",
        "let z: number; z = 1; z = 2;",
        &["'z' is assigned a value but never used.@22-23"],
    ),
    (
        "input.ts",
        "for (let i = 0; i < 1; i++) {} for (const k in {}) {}",
        &["'k' is assigned a value but never used.@42-43"],
    ),
    (
        "input.ts",
        "const obj = { set v(x) {}, get w() { return 1; } }; obj;",
        &[],
    ),
    (
        "input.ts",
        "class Pr { #p = 1; private q = 2; } new Pr();",
        &[],
    ),
    (
        "input.ts",
        "import def, * as ns from 'm'; import { a as b } from 'n';",
        &[
            "'def' is defined but never used.@7-10",
            "'ns' is defined but never used.@17-19",
            "'b' is defined but never used.@44-45",
        ],
    ),
    (
        "input.ts",
        "export import Alias = NSx.a; namespace NSx { export const a = 1; }",
        &[],
    ),
];

#[test]
fn reports_what_typescript_eslint_reports() {
    let mismatches: Vec<String> = UNUSED
        .iter()
        .chain(ambient::UNUSED)
        .filter_map(|&(path, source, expected)| {
            let actual = unused(path, source, Dialect::TypeScriptEslint);
            (actual != expected).then(|| {
                format!("{path}: {source}\n  expected {expected:?}\n  actual   {actual:?}")
            })
        })
        .collect();
    assert!(mismatches.is_empty(), "{}", mismatches.join("\n"));
}
