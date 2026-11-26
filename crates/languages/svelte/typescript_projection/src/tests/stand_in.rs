/// Each script, whether TypeScript 6.0.3's `isExternalModule` reads it as a module, and whether
/// the stand-in here is one. A script oxc cannot parse is not one here, where TypeScript's
/// recovery can still find an import or export; the stand-in is then empty, never a global
/// script.
#[test]
fn a_thrown_stand_in_is_a_module_where_typescript_reads_the_script_as_one() {
    let cells = [
        ("import x from \"y\";\nlet g1 = 1;\nlet = ;\n", true, false),
        ("let g2 = 1;\nlet = ;\nexport const z = 1;\n", true, false),
        ("let g3 = 1;\n{{{\n", false, false),
        ("let g4 = 1; export\n", false, false),
        ("let g5 = 1; import\n", false, false),
        ("let g6 = 1; const a = import.meta;\n", true, true),
        ("let g7 = 1; export = 1 + ;\n", true, false),
        ("let g8 = 1; ( export const q = 1 );\n", true, false),
        (
            "let g9 = 1; function f() { export const q = 1; }\n",
            false,
            false,
        ),
        ("let g10 = 1; if (a) import x from \"y\";\n", false, false),
        (
            "let g11 = 1; const s = `${;\nexport const q = 1;\n",
            true,
            false,
        ),
        ("let g12 = 1; /* \nexport const q = 1;\n", false, false),
        ("let g13 = 1; import(\"y\");\n", false, false),
        (
            "let g14 = 1; declare module \"m\" { export const q: number; }\n",
            false,
            false,
        ),
        ("let g15 = 1; export {};\nlet = ;\n", true, false),
        ("let g16 = 1; import type { T } from \"y\";\n", true, true),
        ("let g = 1;\nconst d = await fetch(\"x\");\n", false, false),
        ("let g = 1;\nfor await (const x of y) {}\n", false, false),
        ("let g = 1;\nexport {};\n", true, true),
        ("let g = 1;\nimport x = require(\"y\");\n", true, true),
        ("let g = 1;\nimport x = N.y;\n", false, false),
        ("let g = 1;\nexport import x = N.y;\n", true, true),
        ("let g = 1;\nexport as namespace X;\n", false, false),
        ("let g = 1;\nexport declare const q: number;\n", true, true),
        ("let g = 1;\nexport default 1;\n", true, true),
        ("let g = 1;\nexport * from \"y\";\n", true, true),
        (
            "let g = 1;\nfunction f() { return import.meta; }\n",
            true,
            true,
        ),
        ("let g = 1;\n", false, false),
        ("let g = 1;\nimport \"y\";\n", true, true),
        ("let g = 1;\nexport type T = 1;\n", true, true),
    ];
    for (script, _typescript, module) in cells {
        let source = format!("<script lang=\"ts\">\n{script}</script>\n\n<div {{\n");
        let text = crate::unprojected(&source, crate::Unprojected::Thrown);
        let expected = if module {
            format!("\n{script}\n;\nexport {{}};\n")
        } else {
            String::new()
        };
        assert_eq!(text, expected, "{script:?}");
    }
}
