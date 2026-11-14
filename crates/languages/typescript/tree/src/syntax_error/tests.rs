use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;

use super::Acorn;
use crate::Tree;

/// What acorn reports for `text`, a TypeScript program read as acorn reads it, and where; `None`
/// where it reads the program.
fn acorn_reads(text: &str) -> Option<(String, u32)> {
    let mut reported = None;
    let parsed = Tree::build(text, |builder| {
        builder.read_as_acorn();
        let range = Span::new(0, text.len() as u32);
        builder.program(range, SourceType::ts()).map_err(|error| {
            reported = Some(error.acorn.clone());
            error.into()
        })
    });
    match (parsed, reported) {
        (Ok(_), _) => None,
        (Err(_), Some(Some(Acorn::Fails { message, at }))) => Some((message.into_owned(), at)),
        (Err(error), acorn) => panic!("{text:?}: acorn says nothing of {error:?} ({acorn:?})"),
    }
}

const OPTIONAL_PATTERN: &str =
    "A binding pattern parameter cannot be optional in an implementation signature.";

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
        assert_eq!(acorn_reads(text), None, "{text:?}");
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
        assert_eq!(acorn_reads(text), None, "{text:?}");
    }
}

#[test]
fn an_optional_rest_in_a_binding_list_fails_at_its_start() {
    for (text, at) in [
        ("function f(...p?: string[]) {}", 11),
        ("function f(...p?: string[]): void;\nfunction f() {}", 11),
        ("class C { m(...p?: string[]) {} }", 12),
        (
            "abstract class C { abstract m(...p?: string[]): void; }",
            30,
        ),
        ("function f([...a?]) {}", 12),
        ("let [...a?] = [];", 5),
        ("namespace N { function h(...p?: string[]) {} }", 25),
    ] {
        assert_eq!(
            acorn_reads(text),
            Some((OPTIONAL_PATTERN.to_owned(), at)),
            "{text:?}"
        );
    }
}

#[test]
fn an_optional_rest_acorn_reads_as_an_expression_or_a_name_fails_at_the_question_mark() {
    for (text, at) in [
        ("const g = async (a, ...p?: string[]) => {};", 24),
        ("const g = ([...a?]) => {};", 16),
        ("const g = ({...a?}) => {};", 16),
        ("function f({...a?}) {}", 16),
        ("declare function f({...a?}: T): void;", 24),
        ("interface I { m({...a?}: T): void }", 21),
        ("type T = (x, {...a?}: T) => void;", 18),
    ] {
        assert_eq!(
            acorn_reads(text),
            Some(("Unexpected token".to_owned(), at)),
            "{text:?}"
        );
    }
}
