//! Declarations an ambient context or a declaration file exports without `export`.

// The expectations are @typescript-eslint/eslint-plugin 8.72.1's rule on ESLint 10.14.0.
pub(super) const UNUSED: &[(&str, &str, &[&str])] = &[
    (
        "input.ts",
        "declare class K { m(a: number): void; constructor(b: number); } new K(1);",
        &[],
    ),
    (
        "input.ts",
        "declare namespace DN { const a: number; namespace Inner { const b: number; } function \
         f(c: number): void; }",
        &["'DN' is defined but never used.@18-20"],
    ),
    (
        "input.ts",
        "declare namespace DE { const a: number; export {}; }",
        &[
            "'DE' is defined but never used.@18-20",
            "'a' is defined but never used.@29-30",
        ],
    ),
    (
        "input.ts",
        "declare module 'mm' { const a: number; export = a; }",
        &[],
    ),
    (
        "input.ts",
        "declare module 'mx' { import { t } from 'z'; const a: typeof t; }",
        &[],
    ),
    (
        "input.ts",
        "namespace Plain { const a = 1; declare const b: number; }",
        &[
            "'Plain' is defined but never used.@10-15",
            "'a' is assigned a value but never used.@24-25",
            "'b' is defined but never used.@45-46",
        ],
    ),
    (
        "input.ts",
        "declare global { interface Window { x: number } var gv: number; function gf(p: number): \
         void; }",
        &[],
    ),
    (
        "input.ts",
        "export {}; declare global { namespace App { interface Locals {} } }",
        &[],
    ),
    (
        "input.ts",
        "declare namespace Q.R { const s: number; }",
        &[],
    ),
    (
        "input.ts",
        "declare function df2(a: number): void; declare const dc: number; declare let dl: number; \
         declare var dv: number; declare class DC {} declare enum DEn {} declare namespace DNs {}",
        &[
            "'df2' is defined but never used.@17-20",
            "'dc' is defined but never used.@53-55",
            "'dl' is defined but never used.@77-79",
            "'dv' is defined but never used.@101-103",
            "'DC' is defined but never used.@127-129",
            "'DEn' is defined but never used.@146-149",
            "'DNs' is defined but never used.@171-174",
        ],
    ),
    (
        "types.d.ts",
        "import type * as Kit from '@sveltejs/kit'; import { unusedValue } from 'x'; type \
         RouteParams = {}; interface I {} declare const c: number; declare function f(a: number): \
         void; declare class K {} declare enum E {} declare namespace N { const inner: number; \
         namespace M { const deep: number; } } export type PageData = {};",
        &[
            "'Kit' is defined but never used.@17-20",
            "'unusedValue' is defined but never used.@52-63",
        ],
    ),
    (
        "types.d.ts",
        "type A = 1; interface B {} declare const c: number; export {};",
        &[
            "'A' is defined but never used.@5-6",
            "'B' is defined but never used.@22-23",
            "'c' is defined but never used.@41-42",
        ],
    ),
    (
        "types.d.ts",
        "type A = 1; export * from 'x';",
        &["'A' is defined but never used.@5-6"],
    ),
    (
        "types.d.ts",
        "type A = 1; declare const d: number; export default d;",
        &["'A' is defined but never used.@5-6"],
    ),
    ("types.d.ts", "type A = 1; export = A;", &[]),
    (
        "types.d.ts",
        "namespace N { const a: number; type T = 1; } namespace O { const b: number; export {}; }",
        &["'b' is defined but never used.@65-66"],
    ),
    ("types.d.mts", "type A = 1; declare const c: number;", &[]),
    ("types.d.cts", "type A = 1;", &[]),
    ("types.d.css.ts", "type A = 1;", &[]),
    (
        "app.d.ts",
        "declare global { namespace App { interface Locals {} } interface ImportMetaEnv { X: \
         string } } export {};",
        &[],
    ),
];
