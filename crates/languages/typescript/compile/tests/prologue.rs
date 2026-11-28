//! The `"use strict"` prologue of the emit, against TypeScript 6.0.3's `transpileModule` with
//! ts.compile's options (an `ESNext` target and module, `verbatimModuleSyntax`).

use std::path::Path;

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_typescript_compile::emit;
use rsvelte_typescript_compile::prologue::is_external_module;

/// The directives at the top of the emit of `source_text` in a file called `file`.
fn directives(file: &str, source_text: &str) -> Vec<String> {
    let allocator = Allocator::default();
    let source_type = SourceType::from_path(Path::new(file)).expect("a known extension");
    let parsed = Parser::new(&allocator, source_text, source_type).parse();
    assert!(parsed.diagnostics.is_empty(), "{:?}", parsed.diagnostics);
    let emitted = emit(&parsed.program);
    let output = Allocator::default();
    let reparsed = Parser::new(&output, &emitted, SourceType::mjs()).parse();
    assert!(reparsed.diagnostics.is_empty(), "{emitted}");
    (reparsed.program.directives.iter())
        .map(|directive| {
            directive
                .expression
                .value
                .as_str()
                .expect("no lone surrogate")
                .to_owned()
        })
        .collect()
}

#[test]
fn a_file_that_is_not_a_module_gets_the_prologue_once() {
    let strict = ["use strict"].as_slice();
    let none: &[&str] = &[];
    for (file, source_text, expected) in [
        ("x.ts", "a;", strict),
        ("x.ts", "", strict),
        ("x.ts", "#!/usr/bin/env node\na;", strict),
        ("x.ts", "declare module \"m\" {} a;", strict),
        ("x.ts", "export as namespace X; a;", strict),
        ("x.ts", "const x = import(\"x\");", strict),
        ("x.ts", "function f() { \"use strict\"; }", strict),
        ("x.ts", "(\"use strict\"); a;", strict),
        ("x.js", "a;", strict),
        ("x.tsx", "a;", strict),
        ("x.ts", "\"use strict\"; a;", strict),
        ("x.ts", "'use strict'; a;", strict),
        ("x.ts", "\"use\\x20strict\"; a;", strict),
        ("x.ts", "\"a\"; \"use strict\"; a;", &["a", "use strict"]),
        ("x.ts", "\"a\"; b;", &["use strict", "a"]),
        ("x.ts", "export type T = 1; a;", none),
        ("x.ts", "import type X from \"x\"; a;", none),
        ("x.ts", "export interface I {} a;", none),
        ("x.ts", "export {} from \"x\"; a;", none),
        ("x.ts", "export * as n from \"x\";", none),
        ("x.ts", "import \"x\";", none),
        ("x.ts", "import.meta.x;", none),
        ("x.ts", "function f() { import.meta; }", none),
        ("x.mts", "a;", none),
        ("x.mjs", "a;", none),
    ] {
        assert_eq!(
            directives(file, source_text),
            expected,
            "{file}: {source_text}"
        );
    }
}

/// ts.compile refuses an import assignment, so its emit never shows this.
#[test]
fn an_import_assignment_of_a_module_makes_the_file_one() {
    for (source_text, expected) in [
        ("import type A = require(\"x\"); a;", true),
        ("import A = require(\"x\"); a;", true),
        ("import A = N.B; a;", false),
    ] {
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source_text, SourceType::ts()).parse();
        assert!(parsed.diagnostics.is_empty(), "{:?}", parsed.diagnostics);
        assert_eq!(
            is_external_module(&parsed.program),
            expected,
            "{source_text}"
        );
    }
}
