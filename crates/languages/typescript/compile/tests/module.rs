//! Whether the emit stays a module once its types are gone, against TypeScript 6.0.3's
//! `transpileModule` with ts.compile's options (an `ESNext` target and module,
//! `verbatimModuleSyntax`).

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_typescript_compile::emit;

#[test]
fn a_module_stays_one_and_a_script_gets_no_export() {
    for (source_text, expected) in [
        ("const a = 1;\n", "\"use strict\";\nconst a = 1;\n"),
        (
            "export type T = 1;\nconst a = 1;\n",
            "const a = 1;\nexport {};\n",
        ),
        (
            "import type { X } from \"x\";\nconst a = 1;\n",
            "const a = 1;\nexport {};\n",
        ),
        ("type A = 1;\nexport { type A };\n", "export {};\n"),
        (
            "const a = import.meta.url;\n",
            "const a = import.meta.url;\nexport {};\n",
        ),
        ("export {};\nconst a = 1;\n", "export {};\nconst a = 1;\n"),
        (
            "export as namespace N;\nconst a = 1;\n",
            "\"use strict\";\nconst a = 1;\n",
        ),
        (
            "export as namespace N;\nexport type T = 1;\nconst a = 1;\n",
            "const a = 1;\nexport {};\n",
        ),
    ] {
        assert_eq!(emitted(source_text), expected, "{source_text:?}");
    }
}

#[test]
fn an_import_or_export_of_types_only_stays_without_its_specifiers() {
    for (source_text, expected) in [
        (
            "import { type A } from \"x\";\nexport const a = 1;\n",
            "import {} from \"x\";\nexport const a = 1;\n",
        ),
        (
            "import { type A, b } from \"x\";\nexport const a = b;\n",
            "import { b } from \"x\";\nexport const a = b;\n",
        ),
        (
            "export { type A } from \"x\";\nconst a = 1;\n",
            "export {} from \"x\";\nconst a = 1;\n",
        ),
    ] {
        assert_eq!(emitted(source_text), expected, "{source_text:?}");
    }
}

fn emitted(source_text: &str) -> String {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source_text, SourceType::ts()).parse();
    assert!(parsed.diagnostics.is_empty(), "{:?}", parsed.diagnostics);
    emit(&parsed.program)
}
