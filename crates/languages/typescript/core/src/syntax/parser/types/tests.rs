use super::super::tests::{entries, outline, typescript};
use crate::syntax_tree::TypeScriptKind;

/// The outline of what the first statement declares.
fn declared(source_text: &str) -> String {
    let (tree, statements) = typescript(source_text);
    let declaration = tree.declaration(statements[0]).expect("a declaration");
    outline(&tree, source_text, declaration)
}

#[test]
fn a_conditional_type_reads_its_inferred_elements() {
    assert_eq!(
        declared("type A<T> = T extends [infer U, ...infer R] ? U : never;"),
        r#"Alias"type A<T> = T extends [infer U, ...infer R] ? U : never"("A" Parameters"<T>"(Parameter"T"("T")) Conditional"T extends [infer U, ...infer R] ? U : never"(Reference"T"("T") Tuple"[infer U, ...infer R]"(Infer"infer U"(Parameter"U"("U")) Rest"...infer R"(Infer"infer R"(Parameter"R"("R")))) Reference"U"("U") Leaf"never"))"#
    );
}

#[test]
fn operators_queries_imports_and_mapped_types_nest() {
    assert_eq!(
        declared(
            "type B = keyof typeof x | import(\"m\").C<string>[] & { readonly [K in keyof T]?: T[K] };"
        ),
        r#"Alias"type B = keyof typeof x | import(\"m\").C<string>[] & { readonly [K in keyof T]?: T[K] }"("B" Union"keyof typeof x | import(\"m\").C<string>[] & { readonly [K in keyof T]?: T[K] }"(Operator"keyof typeof x"(Query"typeof x"("x")) Intersection"import(\"m\").C<string>[] & { readonly [K in keyof T]?: T[K] }"(Array"import(\"m\").C<string>[]"(Import"import(\"m\").C<string>"("\"m\"" "C" Arguments"<string>"(Leaf"string"))) Mapped"{ readonly [K in keyof T]?: T[K] }"(Parameter"K in keyof T"("K" Operator"keyof T"(Reference"T"("T"))) Indexed"T[K]"(Reference"T"("T") Reference"K"("K"))))))"#
    );
}

#[test]
fn function_types_read_their_parameters_and_predicates() {
    assert_eq!(
        declared("type F = new (a: string) => void;"),
        r#"Alias"type F = new (a: string) => void"("F" Signature"new (a: string) => void"("a" Leaf"void"))"#
    );
    assert_eq!(
        declared("type G = (this: Window, ...a: number[]) => a is string;"),
        r#"Alias"type G = (this: Window, ...a: number[]) => a is string"("G" Signature"(this: Window, ...a: number[]) => a is string"("this" "...a: number[]" Predicate"a is string"("a" Leaf"string")))"#
    );
}

#[test]
fn a_template_literal_type_holds_its_types() {
    assert_eq!(
        declared("type T = `a${B}c${D}`;"),
        r#"Alias"type T = `a${B}c${D}`"("T" TemplateLiteral"`a${B}c${D}`"(Reference"B"("B") Reference"D"("D")))"#
    );
}

#[test]
fn a_shift_token_closes_two_type_argument_lists() {
    let source_text = "let a: Map<string, Array<number>> = b;";
    let (tree, _) = typescript(source_text);
    assert_eq!(
        entries(&tree, source_text),
        [(
            TypeScriptKind::Annotation,
            r#"Map<string, Array<number>> = Reference"Map<string, Array<number>>"("Map" Arguments"<string, Array<number>>"(Leaf"string" Reference"Array<number>"("Array" Arguments"<number>"(Leaf"number"))))"#
                .to_owned()
        )]
    );
}

#[test]
fn a_heritage_clause_reads_type_arguments_on_the_next_line() {
    assert_eq!(
        declared("interface Foo\n<\nT\n>\nextends\nBar\n<\nT\n>\n{ }"),
        r#"Interface"interface Foo\n<\nT\n>\nextends\nBar\n<\nT\n>\n{ }"("Foo" Parameters"<\nT\n>"(Parameter"T"("T")) Heritage"Bar\n<\nT\n>"(Reference"Bar\n<\nT\n>"("Bar" Arguments"<\nT\n>"(Reference"T"("T")))))"#
    );
}
