use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile_client(source, false)
}

fn server(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Server,
            filename: Some("comments.svelte".into()),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn compile_client(source: &str, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            dev,
            filename: Some("comments.svelte".into()),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn assert_parses(code: &str) {
    let allocator = oxc_allocator::Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    assert!(
        parsed.diagnostics.is_empty(),
        "{:?}\n{code}",
        parsed.diagnostics
    );
}

#[test]
fn inline_parameter_comment_stays_at_the_parameter() {
    let code = client(
        "<script>\nlet xs = $state([]);\nlet path = $derived(xs.map((/** @type {object} */ d) => d));\n/** @type {string} */\nlet area = $derived(path);\n</script>",
    );
    assert!(
        code.contains(".map((/** @type {object} */ d) => d)"),
        "{code}"
    );
    assert!(code.contains("/** @type {string} */\n\tlet area"), "{code}");
    assert_parses(&code);
}

#[test]
fn chain_comments_stay_before_the_following_member() {
    let code = client(
        "<script>\nlet chain;\nlet value = $derived(chain.a(1)\n// @ts-expect-error\n.b(2)\n// @ts-expect-error\n.c(3));\n</script>",
    );
    assert!(code.contains("// @ts-expect-error\n.b(2)"), "{code}");
    assert!(code.contains("// @ts-expect-error\n.c(3)"), "{code}");
    assert_parses(&code);
}

#[test]
fn non_ascii_before_a_relocated_comment_does_not_split_utf8() {
    let code = client(
        "<script>\nlet label = 'é';\nlet value = label\n// explain\n.replace('é', 'e');\n</script>",
    );
    assert!(code.contains("// explain\n.replace"), "{code}");
    assert_parses(&code);
}

#[test]
fn trailing_line_comment_stays_before_generated_declarations() {
    let code = client("<script>\n// c\n</script>\n\n<button>x</button>");
    assert!(code.contains("var // c\n button = root();"), "{code}");
    assert_parses(&code);
}

#[test]
fn trailing_line_comment_after_script_code_stays_before_generated_declarations() {
    let code = client("<script>\nlet n = 1;\n// c\n</script>\n\n<button>{n}</button>");
    assert!(code.contains("var // c\n button = root();"), "{code}");
    assert_parses(&code);
}

#[test]
fn arrow_parameter_jsdoc_stays_with_the_parameter() {
    let code = compile_client(
        "<script>\nlet featuresToDraw = $state([]);\n$effect(() => {\nfeaturesToDraw.forEach(\n/** @param {any} feature */ feature => {}\n);\n});\n</script>",
        true,
    );
    let comment = code.find("/** @param {any} feature */").expect("comment");
    let parameter = code.find("(feature) =>").expect("parameter");
    assert!(comment < parameter, "{code}");
    assert!(
        !code.contains("/** @param {any} feature */ featuresToDraw"),
        "{code}"
    );
    assert_parses(&code);
}

#[test]
fn tab_literals_match_official_output() {
    let code = client("<script>const value = 'a\\tb';</script>{value}");
    assert!(code.contains("const value = 'a\\tb'"), "{code}");
    assert_parses(&code);
}

#[test]
fn escaped_literal_spellings_are_preserved() {
    let source = "{#if true}{@const a = 'a\\x41b'}{@const b = 'a\\u{1F600}b'}<p>{a}{b}</p>{/if}";
    for code in [client(source), server(source)] {
        assert!(code.contains("'a\\x41b'"), "{code}");
        assert!(code.contains("'a\\u{1F600}b'"), "{code}");
        assert_parses(&code);
    }
}

#[test]
fn inline_division_comment_stays_after_the_operator() {
    let source = "<script>\nexport let v;\nlet k;\nfunction f() {\nreturn (v /* return */ / 2 / 4);\n}\n$: k = f();\n</script><p>{k}{v}</p>";
    for code in [client(source), server(source)] {
        assert!(
            code.contains("v() / /* return */ 2 / 4") || code.contains("v / /* return */ 2 / 4"),
            "{code}"
        );
        assert_parses(&code);
    }
}

#[test]
fn reactive_division_comment_stays_after_the_operator() {
    let source =
        "<script>\nexport let v;\nlet k;\n$: k = v /* return */ / 2 / 4;\n</script><p>{k}{v}</p>";
    let code = server(source);
    assert!(code.contains("$: k = v / /* return */ 2 / 4"), "{code}");
    assert_parses(&code);
}

#[test]
fn line_continuation_comment_is_not_moved_to_generated_markup() {
    let code = client(
        "<script>\nlet n = $state(0);\nconst cont =\n\t/* c */\n\t\"a\\\n\t\tb\";\n</script>\n<p>{cont}{n}</p>",
    );
    let declaration = code.find("const cont =").expect("declaration");
    let comment = code.find("/* c */").expect("comment");
    let literal = code.find("\"a\\\n").expect("literal");
    assert!(declaration < comment && comment < literal, "{code}");
    assert!(!code.contains("var /* c */"), "{code}");
    assert_parses(&code);
}

#[test]
fn trailing_comment_after_transformed_class_stays_on_generated_var() {
    let code = client(
        "<script>\nclass Counter {\n#n = $state(0);\nget n() { return this.#n; }\n}\nconst c = new Counter();\n/* c */\n</script>\n<button onclick={() => c.n}>x</button>",
    );
    let comment = code.find("/* c */").expect("comment");
    let generated = code[..comment].rfind("var ").expect("generated var");
    let button = code[comment..].find("button =").expect("button") + comment;
    assert!(generated < comment && comment < button, "{code}");
    assert_parses(&code);
}

#[test]
fn prop_default_jsdoc_stays_in_the_generated_thunk_parameters() {
    let code = compile_client(
        "<script>\n/** @typedef {Object} Props\n * @property {Object} [data]\n */\n/** @type {Props} */\nlet { data = /** @type {Object} */ ({}), slug } = $props();\n</script>",
        true,
    );
    assert!(code.contains("(/** @type {Object} */) => ("), "{code}");
    assert_parses(&code);
}
