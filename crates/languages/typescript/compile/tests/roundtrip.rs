use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::parser::parse_program;
use rsvelte_typescript::syntax_tree::SyntaxTree;
use rsvelte_typescript_compile::codegen::print_program;

fn print(source_text: &str, typescript: bool) -> String {
    let mut syntax_tree = SyntaxTree::new();
    let p = parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        typescript,
    )
    .unwrap_or_else(|e| panic!("{}: {:?}", e.message, e.span));
    print_program(&syntax_tree, source_text, p).out
}

/// Printing is a fixed point after one round: parse(print(x)) prints the same text.
fn stable(source_text: &str, typescript: bool) -> String {
    let once = print(source_text, typescript);
    let twice = print(&once, false);
    assert_eq!(once, twice, "not stable for {source_text:?}");
    once
}

#[test]
fn precedence_and_parentheses() {
    assert_eq!(
        stable(
            "a = (b, c); x = (1 + 2) * 3; y = 2 ** 3 ** 2; z = (2 ** 3) ** 2;",
            false
        ),
        "a = (b, c);\n\nx = (1 + 2) * 3;\n\ny = 2 ** 3 ** 2;\n\nz = (2 ** 3) ** 2;\n"
    );
    assert_eq!(
        stable("f(() => ({ a: 1 })); (function () {}());", false),
        "f(() => ({ a: 1 }));\n\n(function () {}());\n"
    );
    assert_eq!(
        stable("a ?? (b || c); (a && b) ?? c; - -x; typeof x;", false),
        "a ?? (b || c);\n\n(a && b) ?? c;\n\n- -x;\n\ntypeof x;\n"
    );
}

#[test]
fn declarations_patterns_and_asi() {
    let out = stable(
        "let { a, b: [c, , d = 1], ...rest } = obj\
         \nconst f = async (x, { y } = {}) => { return x + y }\
         \nfunction g(a, ...b) { if (a) return; else { b } }",
        false,
    );
    assert!(
        out.contains("let { a, b: [c, , d = 1], ...rest } = obj;"),
        "{out}"
    );
    assert!(
        out.contains("const f = async (x, { y } = {}) => {"),
        "{out}"
    );
}

#[test]
fn typescript_is_erased() {
    let out = stable(
        "import type { A } from './a';\
         \nimport { type B, c } from './b';\
         \ntype P = { a: string };\
         \ninterface Q { b: number }\
         \nlet { name }: P = $props();\
         \nconst n = (x as number)!;\
         \nfunction h(a: string, b?: number): void {}\
         \nconst k = (v: string): string => v;",
        true,
    );
    assert_eq!(
        out,
        "import { c } from './b';\n\
         \nlet { name } = $props();\n\
         \nconst n = x;\n\
         \nfunction h(a, b) {}\n\
         \nconst k = (v) => v;\n"
    );
}

#[test]
fn templates_strings_and_members() {
    let out = stable(
        "const s = `a${b}c${`d${e}`}`; o?.p?.[q]?.(r); new Foo(1).bar; 'it\\'s';",
        false,
    );
    assert!(out.contains("const s = `a${b}c${`d${e}`}`;"), "{out}");
    assert!(out.contains("o?.p?.[q]?.(r);"), "{out}");
    assert!(out.contains("new Foo(1).bar;"), "{out}");
}

#[test]
fn unsupported_syntax_is_an_error_not_a_panic() {
    for source_text in ["for () {}", "class {}", "a`t`"] {
        let mut syntax_tree = SyntaxTree::new();
        assert!(
            parse_program(
                &mut syntax_tree,
                source_text,
                Span::new(0, source_text.len() as u32),
                false
            )
            .is_err(),
            "{source_text}"
        );
    }
}

#[test]
fn regex_literals_keep_patterns_flags_and_division() {
    let source = r"const r = /[{}()\/]+/giu; const x = a / 2 / b; r.test('a');";
    let out = stable(source, false);
    assert!(out.contains(r"const r = /[{}()\/]+/giu;"), "{out}");
    assert!(out.contains("const x = a / 2 / b;"), "{out}");
}

#[test]
fn regex_lexical_errors_are_rejected() {
    for source in [
        "const r = /abc",
        "const r = /a\nb/",
        "const r = /a/gg",
        "const r = /a/uv",
        "const r = /a/z",
    ] {
        let mut tree = SyntaxTree::new();
        assert!(
            parse_program(&mut tree, source, Span::new(0, source.len() as u32), false).is_err(),
            "{source:?}"
        );
    }
}

#[test]
fn lookahead_preserves_nested_templates_and_regex_delimiters() {
    for source in [
        "const f = (x = /[(){}]/, y = `a${x}b`) => y;",
        "const items = Array.from({length: 2}, (_, i) => ({text: `Item ${i + 1}`}));",
        "const x = (`a${{value: `b${c}d`}.value}e`);",
        "const x = (/\\)/.test(s) ? a / 2 : /[(]/);",
    ] {
        stable(source, false);
    }
}

#[test]
fn object_accessors_keep_names_parameters_and_bodies() {
    let out = stable(
        "const obj = { get value() { return x; }, set value(v) { x = v; }, \
         get() { return 1; }, set: 2 };",
        false,
    );
    assert!(out.contains("get value() {"), "{out}");
    assert!(out.contains("set value(v) {"), "{out}");
    assert!(out.contains("get() {"), "{out}");
    assert!(out.contains("set: 2"), "{out}");
    for source in [
        "({get value(x) {}});",
        "({set value() {}});",
        "({set value(...x) {}});",
        "({async get value() {}});",
    ] {
        let mut tree = SyntaxTree::new();
        assert!(
            parse_program(&mut tree, source, Span::new(0, source.len() as u32), false).is_err(),
            "{source}"
        );
    }
}

#[test]
#[expect(
    clippy::literal_string_with_formatting_args,
    reason = "JavaScript braces are literal test inputs"
)]
fn control_flow_classes_and_module_expressions() {
    for source in [
        "function f(x) { try { if (x) throw x; } catch ({message}) { return \
            message; } finally { cleanup(); } }",
        "outer: for (let i=0; i<3; i++) { if (i) continue outer; else break; } \
            while (x) x--; do { x++; } while (x<3);",
        "for (const [key,value] of entries) log(key,value); for (key in \
            object) log(key); for await (const item of stream) log(item);",
        "switch (x) { case 1: x++; break; case 2: {let y=x;} default: debugger; }",
        "class A extends B { #value=1; static count=0; constructor(x) \
            {super(x);} get value() {return this.#value;} set value(x) \
            {this.#value=x;} static { init(); } async *values() {yield \
            this.#value;yield* items;} }",
        "const C=class Named {method() {return Named;}}; function* g() {yield \
            1;yield* [2,3];} const o={async method() {}, *values() {yield 1;}};",
        "const p=import('./x',{with:{type:'json'}}); const url=import.meta.url; const n=123n;",
        "export {a as b}; export {c as d} from './c'; export * from './x'; \
            export * as ns from './y'; import data from './data.json' with \
            {type:'json'};",
        "let a,b; ({a,b} = obj); [a,...b] = items;",
    ] {
        stable(source, false);
    }
    for source in [
        "const f = <T,>(x:T):T=>x; const x=<number>value;",
        "type P<T extends A = A> =
  A &
  B<T, {x?: string}>; let x:P<A>;",
        "const p=value as unknown as {method?:()=>string}; const f = value as (x:number)=>number;",
        "interface P extends Item<{reason:string}> {value?: string} export \
            type {P as Q} from './p';",
        "const f=(item):item is {article:Article;number:number}=>!!item.article;",
    ] {
        stable(source, true);
    }
}

#[test]
fn bigint_errors_are_rejected_before_lowering() {
    for source in [
        "1.2n;", "1e2n;", "00n;", "0xn;", "0b2n;", "1__2n;", "12nfoo;",
    ] {
        let mut tree = SyntaxTree::new();
        assert!(
            parse_program(&mut tree, source, Span::new(0, source.len() as u32), false).is_err(),
            "{source}"
        );
    }
    for source in [
        "0n;",
        "123456789012345678901234567890n;",
        "0xFF_FFn;",
        "0o7_7n;",
        "0b10_10n;",
    ] {
        stable(source, false);
    }
}

#[test]
fn classic_loop_initializers_keep_parenthesized_in_expressions() {
    let out = stable(
        "for(let exists=(key in object);exists;exists=false) {}",
        false,
    );
    assert!(out.contains("exists = (key in object)"), "{out}");
    for source in [
        "class A { get value(x) {} }",
        "class A { set value() {} }",
        "class A {async get value() {}}",
    ] {
        let mut tree = SyntaxTree::new();
        assert!(
            parse_program(&mut tree, source, Span::new(0, source.len() as u32), false).is_err(),
            "{source}"
        );
    }
}

#[test]
fn same_name_property_prints_shorthand_except_proto() {
    for (input, printed) in [
        ("f({ a: a });", "f({ a });\n"),
        ("f({ a });", "f({ a });\n"),
        ("f({ a: b });", "f({ a: b });\n"),
        ("f({ [a]: a });", "f({ [a]: a });\n"),
        ("f({ a() {} });", "f({ a() {} });\n"),
        (
            "f({ get a() { return a; } });",
            "f({ get a() {\n\treturn a;\n} });\n",
        ),
        ("let { a: a } = o;", "let { a } = o;\n"),
        ("let { a: b } = o;", "let { a: b } = o;\n"),
        // `{ __proto__: x }` sets the prototype; `{ __proto__ }` makes an own property.
        (
            "f({ __proto__: __proto__ });",
            "f({ __proto__: __proto__ });\n",
        ),
        ("f({ __proto__ });", "f({ __proto__ });\n"),
        (
            "f({ '__proto__': __proto__ });",
            "f({ '__proto__': __proto__ });\n",
        ),
        (
            "f({ ['__proto__']: __proto__ });",
            "f({ ['__proto__']: __proto__ });\n",
        ),
        (
            "let { __proto__: __proto__ } = o;",
            "let { __proto__: __proto__ } = o;\n",
        ),
    ] {
        assert_eq!(stable(input, false), printed, "{input}");
    }
}
