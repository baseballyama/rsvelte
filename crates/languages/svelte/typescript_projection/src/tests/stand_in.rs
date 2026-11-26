/// Each script, and whether TypeScript 6.0.3's `isExternalModule` and tsgo 7.1 read it as a module
/// (by the TS2306 an import of its component reports in svelte-check 4.7.8 and in tsgo), and
/// whether the stand-in here is one. Where a script does not parse, oxc's recovery and
/// TypeScript's can disagree; the stand-in is then empty or a module, never a global script.
#[test]
fn a_thrown_stand_in_is_a_module_where_the_script_imports_or_exports() {
    let cells = [
        ("import x from \"y\";\nlet g = 1;\nlet = ;\n", true, true),
        ("let g = 1;\nlet = ;\nexport const z = 1;\n", true, false),
        ("let g = 1;\n{{{\n", false, false),
        ("let g = 1; export\n", false, true),
        ("let g = 1; import\n", false, true),
        ("let g = 1; const a = import.meta;\n", true, true),
        ("let g = 1; export = 1 + ;\n", true, true),
        ("let g = 1; ( export const q = 1 );\n", true, false),
        (
            "let g = 1; function f() { export const q = 1; }\n",
            false,
            false,
        ),
        ("let g = 1; if (a) import x from \"y\";\n", false, true),
        (
            "let g = 1; const s = `${;\nexport const q = 1;\n",
            true,
            false,
        ),
        ("let g = 1; /* \nexport const q = 1;\n", false, false),
        ("let g = 1; import(\"y\");\n", false, false),
        (
            "let g = 1; declare module \"m\" { export const q: number; }\n",
            false,
            false,
        ),
        ("let g = 1; export {};\nlet = ;\n", true, true),
        ("let g = 1; import type { T } from \"y\";\n", true, true),
        ("let g = 1;\n", false, false),
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
