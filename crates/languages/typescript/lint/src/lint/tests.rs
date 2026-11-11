use oxc_span::SourceType;
use rsvelte_kernel::source::document::Document;
use rsvelte_lint_runner::findings::Findings;
use rsvelte_lint_runner::rule::{Reporter, Rule};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};

use super::{NoInnerDeclarationsOptions, PreferConstOptions, ProgramStatements};

struct NoUnusedVariables;

/// A rule from a function over the analysis and the program, for the cases.
struct Check(fn(&Semantic, ProgramIdentifier, &mut Reporter<'_>));

impl Rule<(Semantic, ProgramIdentifier)> for Check {
    fn identifier(&self) -> &'static str {
        "check"
    }

    fn check(&self, context: &(Semantic, ProgramIdentifier), reporter: &mut Reporter<'_>) {
        (self.0)(&context.0, context.1, reporter);
    }
}

impl Rule<Semantic> for NoUnusedVariables {
    fn identifier(&self) -> &'static str {
        "no-unused-vars"
    }

    fn check(&self, context: &Semantic, reporter: &mut Reporter<'_>) {
        super::no_unused_variables(context, |_| true, reporter);
    }
}

/// Each finding as `message@start-end`, the form the expectations take.
fn unused(source: &str) -> Vec<String> {
    let document =
        Document::new("input.ts".to_owned(), source.to_owned()).expect("a small document");
    let (tree, program) = Tree::program(&document, SourceType::ts()).expect("the case parses");
    let semantic = Semantic::program(tree, program);
    let mut findings = Findings::new();
    findings.run([&NoUnusedVariables], &semantic);
    findings
        .finish()
        .expect("the rule does not fail")
        .iter()
        .map(|f| {
            let span = f.diagnostic.span;
            format!(
                "{}@{}-{}",
                f.diagnostic.message, span.start_offset, span.end_offset
            )
        })
        .collect()
}

// The expectations are ESLint 10.14.0's rules with @typescript-eslint/parser 8.72.1.
const UNUSED: &[(&str, &[&str])] = &[
    (
        "let a = 1; let b = 2; a = 3;",
        &[
            "'b' is assigned a value but never used.@15-16",
            "'a' is assigned a value but never used.@22-23",
        ],
    ),
    ("function f(a, b) { return b; } f();", &[]),
    (
        "function f(a, b) { return a; } f();",
        &["'b' is defined but never used.@14-15"],
    ),
    (
        "const g = function h() {};",
        &["'g' is assigned a value but never used.@6-7"],
    ),
    (
        "export const x = 1; const y = 1;",
        &["'y' is assigned a value but never used.@26-27"],
    ),
    (
        "let c = 0; c = c + 1;",
        &["'c' is assigned a value but never used.@11-12"],
    ),
    (
        "let d = 0; d++;",
        &["'d' is assigned a value but never used.@11-12"],
    ),
    ("function q(o) { for (const k in o) return; } q();", &[]),
    (
        "try {} catch (e) {}",
        &["'e' is defined but never used.@14-15"],
    ),
    ("class C {}", &["'C' is defined but never used.@6-7"]),
    (
        "import { u } from 'm'; import type { T } from 'm'; let v: T;",
        &[
            "'u' is defined but never used.@9-10",
            "'v' is defined but never used.@55-59",
        ],
    ),
    (
        "function p(x?: number) {} p();",
        &["'x' is defined but never used.@11-21"],
    ),
    (
        "const s = (n: number) => s(n);",
        &["'s' is assigned a value but never used.@6-7"],
    ),
    (
        "declare const amb: number;",
        &["'amb' is defined but never used.@14-25"],
    ),
    ("class K { set v(x) {} } new K();", &[]),
    (
        "let w = 1; function z() { w = 2; } z();",
        &["'w' is assigned a value but never used.@4-5"],
    ),
    (
        "function o(a = 1) {} o();",
        &["'a' is assigned a value but never used.@11-12"],
    ),
    (
        "const { m, n } = { m: 1, n: 2 }; console.log(m);",
        &["'n' is assigned a value but never used.@11-12"],
    ),
    (
        "for (const i of []) {}",
        &["'i' is assigned a value but never used.@11-12"],
    ),
    (
        "let r; r = 1;",
        &["'r' is assigned a value but never used.@7-8"],
    ),
    (
        "function overload(a: string): void; function overload(a: any) { return a; } overload('');",
        &["'a' is defined but never used.@18-27"],
    ),
    (
        "type TT = number; interface II {}",
        &[
            "'TT' is defined but never used.@5-7",
            "'II' is defined but never used.@28-30",
        ],
    ),
    ("let t = 0; t += 1; t ||= 2;", &[]),
    (
        "enum E { A } namespace N {}",
        &[
            "'E' is defined but never used.@5-6",
            "'A' is defined but never used.@9-10",
            "'N' is defined but never used.@23-24",
        ],
    ),
    (
        "function g<T>() {} g();",
        &["'T' is defined but never used.@11-12"],
    ),
    (
        "type F = (a: number) => void; let ff: F; ff;",
        &["'a' is defined but never used.@10-19"],
    ),
    (
        "declare function df(a: number): void;",
        &[
            "'df' is defined but never used.@17-19",
            "'a' is defined but never used.@20-29",
        ],
    ),
    (
        "interface I2 { m(a: number): void } let i2: I2; i2;",
        &["'a' is defined but never used.@17-26"],
    ),
    (
        "type Mapped = { [K in 'a']: 1 }; let mm: Mapped; mm;",
        &["'K' is defined but never used.@17-18"],
    ),
    (
        "class P { constructor(private a: number, b: number) {} } new P(1, 2);",
        &[
            "'a' is defined but never used.@30-39",
            "'b' is defined but never used.@41-50",
        ],
    ),
    (
        "abstract class Q { abstract m(a: number): void } new (class extends Q { m() {} })();",
        &["'a' is defined but never used.@30-39"],
    ),
    ("let typed = 1; type U = typeof typed; let uu: U; uu;", &[]),
    (
        "import x = require('x');",
        &["'x' is defined but never used.@7-8"],
    ),
    (
        "declare module 'mod' { const inner: number; }",
        &["'inner' is defined but never used.@29-42"],
    ),
    (
        "declare global { var gg: number; }",
        &["'gg' is defined but never used.@21-31"],
    ),
    (
        "function th(this: Window) {} th;",
        &["'this' is defined but never used.@12-24"],
    ),
    ("let o2 = {}; o2.a = 1;", &[]),
];

#[test]
fn reports_what_eslint_reports() {
    let cases = UNUSED;
    let mismatches: Vec<String> = cases
        .iter()
        .filter_map(|&(source, expected)| {
            let actual = unused(source);
            (actual != expected)
                .then(|| format!("{source}\n  expected {expected:?}\n  actual   {actual:?}"))
        })
        .collect();
    assert!(mismatches.is_empty(), "{}", mismatches.join("\n"));
}

/// Each finding of `check` as `message@start-end`, and `#start-end:text` for its fix.
fn findings(source: &str, check: &Check) -> Vec<String> {
    let document =
        Document::new("input.ts".to_owned(), source.to_owned()).expect("a small document");
    let (tree, program) = Tree::program(&document, SourceType::ts()).expect("the case parses");
    let context = (Semantic::program(tree, program), program);
    let mut findings = Findings::new();
    findings.run([check], &context);
    findings
        .finish()
        .expect("the rule does not fail")
        .iter()
        .map(|f| {
            let span = f.diagnostic.span;
            let fix = f
                .fix
                .as_ref()
                .and_then(|fix| fix.merged(source))
                .map_or_else(String::new, |edit| {
                    format!(
                        "#{}-{}:{}",
                        edit.span.start_offset, edit.span.end_offset, edit.text
                    )
                });
            format!(
                "{}@{}-{}{fix}",
                f.diagnostic.message, span.start_offset, span.end_offset
            )
        })
        .collect()
}

fn assert_cases(
    cases: &[(&str, &[&str])],
    check: fn(&Semantic, ProgramIdentifier, &mut Reporter<'_>),
) {
    let mismatches: Vec<String> = cases
        .iter()
        .filter_map(|&(source, expected)| {
            let actual = findings(source, &Check(check));
            (actual != expected)
                .then(|| format!("{source}\n  expected {expected:?}\n  actual   {actual:?}"))
        })
        .collect();
    assert!(mismatches.is_empty(), "{}", mismatches.join("\n"));
}

#[test]
fn prefers_const_where_eslint_does() {
    assert_cases(
        &[
            (
                "let a = 1; console.log(a);",
                &["'a' is never reassigned. Use 'const' instead.@4-5#0-10:const a = 1;"],
            ),
            (
                "let b; b = 1; console.log(b);",
                &["'b' is never reassigned. Use 'const' instead.@7-8"],
            ),
            ("let c = 1; c = 2; console.log(c);", &[]),
            (
                "let { d, e } = { d: 1, e: 2 }; e = 3; console.log(d, e);",
                &["'d' is never reassigned. Use 'const' instead.@6-7"],
            ),
            (
                "for (let f of [1]) console.log(f);",
                &["'f' is never reassigned. Use 'const' instead.@9-10#5-10:const f"],
            ),
            ("for (let g = 0; g < 1; g++) {}", &[]),
            (
                "let h, i = 1; h = 2; console.log(h, i);",
                &[
                    "'i' is never reassigned. Use 'const' instead.@7-8",
                    "'h' is never reassigned. Use 'const' instead.@14-15",
                ],
            ),
            (
                "let j; console.log(j); j = 1;",
                &["'j' is never reassigned. Use 'const' instead.@4-5"],
            ),
            ("let k; if (true) { k = 1; } console.log(k);", &[]),
            (
                "{ let l; l = 1; console.log(l); }",
                &["'l' is never reassigned. Use 'const' instead.@9-10"],
            ),
            (
                "let [m, n] = [1, 2]; console.log(m, n);",
                &[
                    "'m' is never reassigned. Use 'const' instead.@5-6#0-20:const [m, n] = [1, 2];",
                    "'n' is never reassigned. Use 'const' instead.@8-9#0-20:const [m, n] = [1, 2];",
                ],
            ),
            (
                "let o; [o] = [1]; console.log(o);",
                &["'o' is never reassigned. Use 'const' instead.@8-9"],
            ),
            (
                "function p() { let q; q = 1; return q; } p();",
                &["'q' is never reassigned. Use 'const' instead.@22-23"],
            ),
            (
                "let r = 1, s = 2; s++; console.log(r, s);",
                &["'r' is never reassigned. Use 'const' instead.@4-5"],
            ),
        ],
        |semantic, program, reporter| {
            super::prefer_const(
                semantic,
                &[program],
                PreferConstOptions::default(),
                ProgramStatements::InProgram,
                |_| false,
                |_| false,
                reporter,
            );
        },
    );
}

#[test]
fn finds_inner_functions_in_a_script() {
    assert_cases(
        &[
            (
                "if (true) { function a() {} }",
                &["Move function declaration to program root.@12-27"],
            ),
            (
                "function b() { if (true) { function c() {} } } b();",
                &["Move function declaration to function body root.@27-42"],
            ),
            ("if (true) { var d = 1; }", &[]),
            ("function e() { var f = 1; return f; } e();", &[]),
            ("export function g() {}", &[]),
            ("class H { static { if (true) { function i() {} } } }", &[]),
            ("while (true) { var j; }", &[]),
            (
                "const k = () => { { function l() {} } };",
                &["Move function declaration to function body root.@20-35"],
            ),
        ],
        |semantic, program, reporter| {
            super::no_inner_declarations(
                semantic,
                &[program],
                false,
                NoInnerDeclarationsOptions::default(),
                reporter,
            );
        },
    );
}

#[test]
fn finds_inner_variables_with_both() {
    assert_cases(
        &[
            (
                "if (true) { function a() {} }",
                &["Move function declaration to program root.@12-27"],
            ),
            (
                "function b() { if (true) { function c() {} } } b();",
                &["Move function declaration to function body root.@27-42"],
            ),
            (
                "if (true) { var d = 1; }",
                &["Move variable declaration to program root.@12-22"],
            ),
            ("function e() { var f = 1; return f; } e();", &[]),
            ("export function g() {}", &[]),
            ("class H { static { if (true) { function i() {} } } }", &[]),
            (
                "while (true) { var j; }",
                &["Move variable declaration to program root.@15-21"],
            ),
            (
                "const k = () => { { function l() {} } };",
                &["Move function declaration to function body root.@20-35"],
            ),
        ],
        |semantic, program, reporter| {
            let options = NoInnerDeclarationsOptions {
                variables: true,
                disallow_block_scoped_functions: false,
            };
            super::no_inner_declarations(semantic, &[program], false, options, reporter);
        },
    );
}

#[test]
fn finds_block_scoped_functions_when_disallowed() {
    assert_cases(
        &[
            (
                "if (true) { function a() {} }",
                &["Move function declaration to program root.@12-27"],
            ),
            (
                "function b() { if (true) { function c() {} } } b();",
                &["Move function declaration to function body root.@27-42"],
            ),
            ("if (true) { var d = 1; }", &[]),
            ("function e() { var f = 1; return f; } e();", &[]),
            ("export function g() {}", &[]),
            (
                "class H { static { if (true) { function i() {} } } }",
                &["Move function declaration to class static block body root.@31-46"],
            ),
            ("while (true) { var j; }", &[]),
            (
                "const k = () => { { function l() {} } };",
                &["Move function declaration to function body root.@20-35"],
            ),
        ],
        |semantic, program, reporter| {
            let options = NoInnerDeclarationsOptions {
                variables: false,
                disallow_block_scoped_functions: true,
            };
            super::no_inner_declarations(semantic, &[program], true, options, reporter);
        },
    );
}
