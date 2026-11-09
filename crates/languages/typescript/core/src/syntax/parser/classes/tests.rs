use super::super::tests::{entries, typescript};
use crate::syntax_tree::{SyntaxTree, TypeScriptFeature};

fn runtime<'s>(tree: &SyntaxTree, source_text: &'s str) -> Vec<(TypeScriptFeature, &'s str)> {
    tree.typescript_runtime
        .iter()
        .map(|r| (r.feature, r.span.text(source_text)))
        .collect()
}

#[test]
fn erased_members_heritage_and_parameter_properties_are_recorded_on_the_class() {
    let source_text = "abstract class A<T> extends B<T> implements C, D<E> {\n\
        abstract m(): void;\n\
        declare x: number;\n\
        [k: string]: unknown;\n\
        y!: string;\n\
        constructor(public a: number, readonly b?: string) { super(); }\n\
        }";
    let (tree, _) = typescript(source_text);
    assert_eq!(
        format!("{:#?}", entries(&tree, source_text)),
        r#"[
    (
        TypeArgs,
        "<T> = Arguments\"<T>\"(Reference\"T\"(\"T\"))",
    ),
    (
        ReturnType,
        "void = Leaf\"void\"",
    ),
    (
        Annotation,
        "number = Leaf\"number\"",
    ),
    (
        Annotation,
        "string = Leaf\"string\"",
    ),
    (
        Definite,
        "!",
    ),
    (
        Annotation,
        "string = Leaf\"string\"",
    ),
    (
        Annotation,
        "number = Leaf\"number\"",
    ),
    (
        ParameterProperty,
        "public",
    ),
    (
        Optional,
        "?",
    ),
    (
        Annotation,
        "string = Leaf\"string\"",
    ),
    (
        ParameterProperty,
        "readonly",
    ),
    (
        TypeParameters,
        "<T> = Parameters\"<T>\"(Parameter\"T\"(\"T\"))",
    ),
    (
        Implements,
        "C, D<E> = Heritage\"C, D<E>\"(Reference\"C\"(\"C\") Reference\"D<E>\"(\"D\" Arguments\"<E>\"(Reference\"E\"(\"E\"))))",
    ),
    (
        Member,
        "abstract m(): void; = \"abstract m(): void;\"",
    ),
    (
        Member,
        "declare x: number; = \"declare x: number;\"",
    ),
    (
        Member,
        "[k: string]: unknown = Index\"[k: string]: unknown\"(\"k\" Leaf\"unknown\")",
    ),
]"#
    );
    assert_eq!(
        format!("{:?}", runtime(&tree, source_text)),
        r#"[(ParameterProperty, "public a: number"), (ParameterProperty, "readonly b?: string")]"#
    );
}

#[test]
fn decorators_are_recorded_with_their_expressions() {
    let source_text = "@d @e.f(1) class K { @g m() {} }";
    let (tree, _) = typescript(source_text);
    assert_eq!(
        format!("{:#?}", entries(&tree, source_text)),
        r#"[
    (
        Decorator,
        "@g = \"g\"",
    ),
    (
        Decorator,
        "@d = \"d\"",
    ),
    (
        Decorator,
        "@e.f(1) = \"e.f(1)\"",
    ),
]"#
    );
    assert_eq!(
        format!("{:?}", runtime(&tree, source_text)),
        r#"[(Decorator, "@d"), (Decorator, "@g")]"#
    );
}

#[test]
fn a_modifier_followed_by_a_line_break_is_a_member_name() {
    let source_text = "class Foo {\naccessor\nfoo\n;\naccessor bar = 1;\npublic\n[1] = 2;\n}";
    let (tree, _) = typescript(source_text);
    assert_eq!(
        format!("{:?}", runtime(&tree, source_text)),
        r#"[(Accessor, "accessor bar = 1;")]"#
    );
}
