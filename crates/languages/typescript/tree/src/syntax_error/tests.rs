use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;

use crate::{Tree, TypeScriptReader};

/// Whether a host whose parser is acorn rejects `text`, a TypeScript program.
fn rejects(text: &str) -> bool {
    Tree::build(text, |builder| {
        builder.read_as_acorn(TypeScriptReader::AcornTypescript);
        let range = Span::new(0, text.len() as u32);
        builder.program(range, SourceType::ts()).map_err(Into::into)
    })
    .is_err()
}

#[test]
fn an_optional_rest_parameter_passes_where_acorn_reads_it_as_an_expression_or_a_type() {
    for text in [
        "const g = (...p?: string[]) => {};",
        "const g = (a, ...[b]?: string[]) => {};",
        "const g = (x = (...p?: string[]) => {}) => {};",
        "function f(x = (...p?: string[]) => {}) {}",
        "type T = (...p?: string[]) => void;",
        "type T = (x, [...a?]: T) => void;",
        "type T = new ([...a?]: T) => void;",
        "interface I { m([...a?]: T): void }",
        "interface I { m(...p?: string[]): void; }",
        "function f(this: (...p?: string[]) => void) {}",
    ] {
        assert!(!rejects(text), "{text:?}");
    }
}

#[test]
fn an_optional_rest_parameter_passes_under_a_declare() {
    for text in [
        "declare function h(...p?: string[]): void;",
        "declare namespace N { function h(...p?: string[]): void; }",
        "declare global { function h(...p?: string[]): void; }",
        "declare module \"m\" { function h(...p?: string[]): void; }",
        "declare class D { m(...p?: string[]): void; }",
        "declare let [...a?]: string[];",
    ] {
        assert!(!rejects(text), "{text:?}");
    }
}

#[test]
fn an_optional_rest_acorn_reads_as_a_binding_a_name_or_an_expression_is_rejected() {
    for text in [
        "function f(...p?: string[]) {}",
        "function f(...p?: string[]): void;\nfunction f() {}",
        "class C { m(...p?: string[]) {} }",
        "abstract class C { abstract m(...p?: string[]): void; }",
        "function f([...a?]) {}",
        "let [...a?] = [];",
        "namespace N { function h(...p?: string[]) {} }",
        "const g = async (a, ...p?: string[]) => {};",
        "const g = ([...a?]) => {};",
        "const g = ({...a?}) => {};",
        "function f({...a?}) {}",
        "declare function f({...a?}: T): void;",
        "interface I { m({...a?}: T): void }",
        "type T = (x, {...a?}: T) => void;",
    ] {
        assert!(rejects(text), "{text:?}");
    }
}
