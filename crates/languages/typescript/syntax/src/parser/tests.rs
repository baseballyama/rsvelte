use rsvelte_kernel::source::positions::Span;

use super::parse_program;
use crate::NodeIdentifier;
use crate::syntax_tree::{Kind, SyntaxTree, TypeScriptKind};

/// The tree of a TypeScript program, and its statements.
pub(super) fn typescript(source_text: &str) -> (SyntaxTree, Vec<NodeIdentifier>) {
    let mut syntax_tree = SyntaxTree::new();
    let program = parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        true,
    )
    .unwrap_or_else(|e| panic!("{source_text}: {}", e.message));
    let Kind::Program(statements) = syntax_tree.kind(program) else {
        panic!("a program");
    };
    let statements = statements.to_vec();
    (syntax_tree, statements)
}

/// A type node as `Variant"text"(children)`; a value node inside it is its quoted text.
pub(super) fn outline(tree: &SyntaxTree, source_text: &str, node: NodeIdentifier) -> String {
    let text = tree
        .source_location(node)
        .span()
        .expect("located")
        .text(source_text);
    let Kind::Type(ty) = tree.kind(node) else {
        return format!("{text:?}");
    };
    let debug = format!("{ty:?}");
    let variant: String = debug
        .chars()
        .take_while(char::is_ascii_alphanumeric)
        .collect();
    let mut children = Vec::new();
    tree.for_each_type_child(node, |c| children.push(outline(tree, source_text, c)));
    if children.is_empty() {
        format!("{variant}{text:?}")
    } else {
        format!("{variant}{text:?}({})", children.join(" "))
    }
}

/// Each entry of the `typescript` table as its kind and its span's text, followed by its syntax
/// outlined when it has one.
pub(super) fn entries(tree: &SyntaxTree, source_text: &str) -> Vec<(TypeScriptKind, String)> {
    tree.typescript
        .iter()
        .map(|t| {
            let text = t.span.text(source_text);
            let entry = t.syntax.opt().map_or_else(
                || text.to_owned(),
                |s| format!("{text} = {}", outline(tree, source_text, s)),
            );
            (t.kind, entry)
        })
        .collect()
}

fn parses(source_text: &str) -> Result<(), String> {
    let mut syntax_tree = SyntaxTree::new();
    parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        false,
    )
    .map(drop)
    .map_err(|e| e.message)
}

#[test]
fn a_shorthand_initializer_is_valid_only_in_a_pattern() {
    for valid in [
        "({ a = 1 } = v);",
        "[{ a = 1, b }] = v;",
        "({ a: { b = 2 } } = v);",
        "for ({ a = 1 } of v);",
    ] {
        assert_eq!(parses(valid), Ok(()), "{valid}");
    }
    for invalid in ["({ a = 1 });", "f({ a = 1 });", "({ b: { a = 1 } }).b;"] {
        assert!(parses(invalid).is_err(), "{invalid}");
    }
}

#[test]
fn many_shorthand_initializers_are_read_in_linear_time() {
    let properties: Vec<String> = (0..10_000).map(|i| format!("a{i}=1")).collect();
    let source = format!("({{{}}} = v);", properties.join(","));
    let started = std::time::Instant::now();
    assert_eq!(parses(&source), Ok(()));
    // Removing each property from a list of the pending ones takes over ten seconds here.
    assert!(started.elapsed().as_secs() < 3, "{:?}", started.elapsed());
}

#[test]
fn a_class_records_its_type_parameters() {
    let source_text = "class K<T extends { a: 1 }> {}\n(class<U> {});";
    let mut syntax_tree = SyntaxTree::new();
    parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        true,
    )
    .expect("parses");
    let recorded: Vec<(TypeScriptKind, &str)> = syntax_tree
        .typescript
        .iter()
        .map(|t| (t.kind, t.span.text(source_text)))
        .collect();
    assert_eq!(
        recorded,
        [
            (TypeScriptKind::TypeParameters, "<T extends { a: 1 }>"),
            (TypeScriptKind::TypeParameters, "<U>"),
        ]
    );
}

#[test]
fn a_tagged_template_is_a_call_of_its_tag() {
    let source_text = "a.b`x${c}y`;\nf<T>``;";
    let mut syntax_tree = SyntaxTree::new();
    let program = parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        true,
    )
    .expect("parses");
    let Kind::Program(statements) = syntax_tree.kind(program) else {
        panic!("a program");
    };
    let text = |n| {
        syntax_tree
            .source_location(n)
            .span()
            .expect("located")
            .text(source_text)
    };
    let tagged: Vec<(&str, &str, &str)> = statements
        .iter()
        .map(|&s| {
            let Kind::ExpressionStatement(e) = syntax_tree.kind(s) else {
                panic!("an expression statement");
            };
            let Kind::TaggedTemplate { tag, quasi } = syntax_tree.kind(e) else {
                panic!("a tagged template");
            };
            (text(e), text(tag), text(quasi))
        })
        .collect();
    assert_eq!(
        tagged,
        [("a.b`x${c}y`", "a.b", "`x${c}y`"), ("f<T>``", "f", "``")]
    );
}

#[test]
fn an_escaped_identifier_names_what_it_decodes_to() {
    let source_text = concat!("let \\", "u0061b = 1; \\", "u{61}b;");
    let (tree, statements) = typescript(source_text);
    let Kind::ExpressionStatement(reference) = tree.kind(statements[1]) else {
        panic!("an expression statement");
    };
    assert_eq!(tree.name(reference), "ab");
    let span = tree.source_location(reference).span().expect("located");
    assert_eq!(span, Span::new(17, 24));
}

#[test]
fn an_exported_declaration_starts_at_export() {
    let source_text = "export async function f() {}\nexport function g() {}";
    let (tree, statements) = typescript(source_text);
    let text = |n| {
        tree.source_location(n)
            .span()
            .expect("located")
            .text(source_text)
    };
    let spans: Vec<(&str, &str)> = statements
        .iter()
        .map(|&s| {
            let Kind::ExportNamed(declaration) = tree.kind(s) else {
                panic!("a named export");
            };
            (text(s), text(declaration))
        })
        .collect();
    assert_eq!(
        spans,
        [
            ("export async function f() {}", "async function f() {}"),
            ("export function g() {}", "function g() {}"),
        ]
    );
}

/// The error parsing `source_text` on a thread with a worker's 2 MiB stack, if any.
fn error_on_a_small_stack(source_text: String, typescript: bool) -> Option<String> {
    std::thread::Builder::new()
        .stack_size(2 << 20)
        .spawn(move || {
            let mut syntax_tree = SyntaxTree::new();
            let range = Span::new(0, source_text.len() as u32);
            parse_program(&mut syntax_tree, &source_text, range, typescript)
                .err()
                .map(|e| e.message)
        })
        .expect("spawns")
        .join()
        .expect("does not overflow")
}

#[test]
fn chains_parse_in_a_loop() {
    let r = |s: &str| s.repeat(30_000);
    for source_text in [
        format!("{}x;", r("a => ")),
        format!("{}c;", r("a ? b : ")),
        format!("{}1;", r("a = ")),
        format!("{}x;", r("!")),
        format!("{}x;", r("typeof ")),
        format!("if (a) {{}}{}", r(" else if (a) {}")),
    ] {
        assert_eq!(error_on_a_small_stack(source_text, false), None);
    }
}

#[test]
fn nesting_grows_the_stack_up_to_a_limit() {
    let r = |s: &str| s.repeat(20_000);
    for (source_text, typescript) in [
        (format!("{}x{};", r("("), r(")")), false),
        (format!("{}{};", r("["), r("]")), false),
        (format!("({}1{});", r("{a:"), r("}")), false),
        (format!("{}x;{}", r("function f(){"), r("}")), false),
        (format!("{}x;{}", r("{"), r("}")), false),
        (format!("a{};", r(" ** a")), false),
        (
            format!("x = {}Object{};", r("class extends "), r(" {}")),
            false,
        ),
        (format!("let {}a{} = 1;", r("["), r("]")), false),
        (format!("{}a{} = 1;", r("["), r("]")), false),
        (format!("type T = {}X{};", r("("), r(")")), true),
        (format!("type T = {}X;", r("keyof ")), true),
        (format!("type T = {}X;", r("() => ")), true),
    ] {
        assert_eq!(error_on_a_small_stack(source_text, typescript), None);
    }
    let deep = "[".repeat(super::MAX_NESTING as usize + 1);
    let message = error_on_a_small_stack(deep, false).expect("too deep");
    assert!(message.contains("nest too deeply"), "{message}");
}

#[test]
fn nested_parentheses_are_read_in_linear_time() {
    let n = 20_000;
    let source_text = format!("{}x{};", "(".repeat(n), ")".repeat(n));
    let started = std::time::Instant::now();
    assert_eq!(error_on_a_small_stack(source_text, false), None);
    // Looking for `=>` after each `(` from scratch takes over ten seconds here.
    assert!(started.elapsed().as_secs() < 2, "{:?}", started.elapsed());
}

#[test]
fn comparison_chains_are_read_in_linear_time() {
    let n = 20_000;
    let source_text = format!("x = a{};", " < a".repeat(n));
    let started = std::time::Instant::now();
    assert_eq!(error_on_a_small_stack(source_text, true), None);
    // Looking for the `>` that closes type arguments after each `<` from scratch takes minutes
    // here.
    assert!(started.elapsed().as_secs() < 2, "{:?}", started.elapsed());
}
