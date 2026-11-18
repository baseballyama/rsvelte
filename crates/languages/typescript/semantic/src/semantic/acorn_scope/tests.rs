use oxc_span::SourceType;
use rsvelte_kernel::source::document::Document;
use rsvelte_typescript_tree::{Acorn, Tree};

use crate::semantic::Semantic;

/// Where acorn reports a name declared twice in `text`, a TypeScript module.
fn redeclared_at(text: &str) -> Option<u32> {
    let document = Document::new("a.ts".to_owned(), text.to_owned()).expect("small");
    let (tree, program) = Tree::program(&document, SourceType::ts()).expect("parses");
    let semantic = Semantic::program(tree, program);
    assert!(semantic.syntax_error().is_none(), "oxc accepts {text:?}");
    semantic
        .acorn_redeclaration()
        .map(|error| match error.acorn {
            Some(Acorn::Fails { at, .. }) => at,
            other => panic!("acorn fails, not {other:?}"),
        })
}

#[test]
fn a_type_only_import_is_a_value_to_acorn() {
    assert_eq!(
        redeclared_at("import type { X } from 'x'; let X;"),
        Some(32)
    );
    assert_eq!(
        redeclared_at("var X; import { type X } from 'x';"),
        Some(21)
    );
}

#[test]
fn a_second_implementation_is_lexical_in_a_module() {
    assert_eq!(redeclared_at("function f() {} function f() {}"), Some(25));
    assert_eq!(
        redeclared_at("{ function f() {} function f() {} }"),
        Some(27)
    );
}

#[test]
fn what_acorn_declares_once_is_not_reported() {
    for text in [
        "function f(a: number): void; function f(a: any) {}",
        "function g() { function f() {} function f() {} }",
        "import type { X } from 'x'; interface X {}",
        "import type { X } from 'x'; type Y = X;",
        "declare function f(): void; function f() {}",
    ] {
        assert_eq!(redeclared_at(text), None, "{text:?}");
    }
}
