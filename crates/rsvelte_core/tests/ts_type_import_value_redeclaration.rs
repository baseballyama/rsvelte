//! acorn-typescript treats a type-only import as colliding with a top-level
//! runtime declaration. OXC keeps the TypeScript type and value namespaces
//! separate and accepts the same source, so parser parity needs an explicit
//! early-error check without making the import a phase-2 runtime binding.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_script(body: &str) -> Result<String, String> {
    let src = format!("<script lang=\"ts\">\n{body}\n</script>\n\n<p>ok</p>\n");
    compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|error| format!("{error:?}"))
}

const REDECLARATIONS: &[&str] = &[
    "import type { X } from 'x'; let |X;",
    "let X; import type { |X } from 'x';",
    "import { type X } from 'x'; const { a: |X } = value;",
    "import type X from 'x'; function |X() {}",
    "import type * as X from 'x'; class |X {}",
    "import type { X } from 'x'; export let |X;",
    "import type { X } from 'x'; export default function |X() {}",
    "import { X } from 'a'; import type { |X } from 'b';",
    "import type { X } from 'a'; import { |X } from 'b';",
    "import { type X, |X } from 'x';",
    "import type X = require('x'); let |X;",
];

#[test]
fn type_imports_collide_with_value_declarations_at_the_second_name() {
    for marked in REDECLARATIONS {
        let body = marked.replace('|', "");
        let at = format!("<script lang=\"ts\">\n{marked}")
            .find('|')
            .expect("the marker survives wrapping");
        let error = compile_script(&body)
            .expect_err("acorn-typescript rejects a type import/value redeclaration");
        assert!(
            error.contains("js_parse_error"),
            "expected acorn's error code for {body:?}, got: {error}"
        );
        assert!(
            error.contains("Identifier 'X' has already been declared"),
            "expected acorn's wording for {body:?}, got: {error}"
        );
        assert!(
            error.contains(&format!("span: ({at}, {at})")),
            "expected the zero-width span at {at} for {body:?}, got: {error}"
        );
    }
}

#[test]
fn ordinary_types_still_have_their_separate_namespace() {
    for body in [
        "type X = number; let X = 1;",
        "interface X {} class X {}",
        "import type { X } from 'x'; type Y = X;",
        "import { type X, Y } from 'x'; Y;",
    ] {
        assert!(
            compile_script(body).is_ok(),
            "the compatibility check must not turn types into runtime bindings: {body:?}"
        );
    }
}
