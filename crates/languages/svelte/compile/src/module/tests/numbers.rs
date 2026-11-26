use super::{Target, body, compile};

#[test]
#[expect(
    clippy::literal_string_with_formatting_args,
    reason = "an object literal"
)]
fn a_typescript_module_prints_numbers_as_typescripts_emit_does() {
    // TypeScript 6.0.3's emit, then svelte 5.59.1's `compileModule`: `canUseOriginalText`'s cases.
    let kept = "0x10,0X1F,0B11,0O17,1e3,1E3,1.50,.5,5.,0,1_000,0b1_1,0o1_7,0x1_0,1_0.5";
    let bigints = "10n,1_0n,0b11n,0o7n,0x1fn,0X1_Fn";
    for (written, printed) in [
        // `Octal`, also under a minus
        ("010,0777,-010", "8,511,-8"),
        // `ContainsLeadingZero`
        ("08,09.5,08e1,08.5e1,00", "8,9.5,80,85,0"),
        // a bigint
        (bigints, "10n,10n,3n,7n,0x1fn,0x1fn"),
        // the rest, with the separators an ES2021 target allows
        (kept, kept),
    ] {
        for target in [Target::Client, Target::Server] {
            let script = body(&format!("let x = [{written}];\n"), target);
            assert_eq!(
                script,
                format!("(\"usestrict\");letx=[{printed}];"),
                "{written} {target:?}"
            );
            let module = body(&format!("export const x = [{written}];\n"), target);
            assert_eq!(
                module,
                format!("exportconstx=[{printed}];"),
                "{written} {target:?}"
            );
        }
    }
    for target in [Target::Client, Target::Server] {
        let class = body("export class C { 010 = 1 }\n", target);
        assert_eq!(class, "exportclassC{8=1;}", "{target:?}");
        let object = body("export const o = { 010: 1 };\n", target);
        assert_eq!(object, "exportconsto={8:1};", "{target:?}");
        // svelte prints `(8.).toString()`, TypeScript's `8.` read back: the same tree.
        let member = compile("a.svelte.ts", "export const a = 010 .toString();\n", target);
        assert!(
            member.ends_with("export const a = 8 .toString();\n"),
            "{member}"
        );
    }
    // A constant enum member is its value, printed as `String(value)` prints it.
    let members = "export enum E { A = 0x10, B = 1 << 10, C = 1e21, D = .5, F = 1_000 }\n";
    let values = concat!(
        r#"E[E["A"]=16]="A";E[E["B"]=1024]="B";E[E["C"]=1e+21]="C";"#,
        r#"E[E["D"]=0.5]="D";E[E["F"]=1000]="F";"#,
    );
    for target in [Target::Client, Target::Server] {
        assert!(body(members, target).contains(values), "{target:?}");
    }
}
