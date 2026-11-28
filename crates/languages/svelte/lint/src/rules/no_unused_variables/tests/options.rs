//! The rule's options.

use rsvelte_kernel::source::positions::LineIndex;

/// Each finding as `line:column message`, with `option` as the rule's one option.
fn unused_with(source_text: &str, option: &str) -> Vec<String> {
    use rsvelte_kernel::computation::database::DocumentContext;
    use rsvelte_kernel::computation::registry::Registry;
    use rsvelte_kernel::source::document::Document;
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    let option = serde_json::value::RawValue::from_string(option.to_owned()).expect("JSON");
    configuration
        .rule(
            "no-unused-vars",
            rsvelte_kernel::diagnostics::Severity::Error,
            &[option],
            &[],
        )
        .expect("the option configures the rule");
    let findings = crate::lint(&context, &configuration).expect("source parses");
    let lines = LineIndex::new(source_text);
    let mut out: Vec<String> = findings
        .iter()
        .map(|finding| {
            let start = lines.line_column(finding.diagnostic.span.start_offset);
            let message = &finding.diagnostic.message;
            format!("{}:{} {message}", start.line, start.column + 1)
        })
        .collect();
    out.sort();
    out
}

fn component(script: &str, typescript: bool, markup: &str) -> String {
    let lang = if typescript { " lang=\"ts\"" } else { "" };
    format!("<script{lang}>\n{script}\n</script>\n{markup}\n")
}

// Expected values from the oracle (ESLint with svelte-eslint-parser, typescript-eslint's parser
// and `@typescript-eslint/no-unused-vars` alone, in runes mode) on these inputs.
// A pattern ignores the names of its kind, and a report names the pattern that would allow it. A
// block's names are parameters, as svelte-eslint-parser declares them.
#[test]
fn each_kind_of_name_has_its_own_ignore_pattern() {
    assert_eq!(
        unused_with(
            &component(
                "const _a = 1;\nconst b = 2;\nfunction _f() {}\nclass _C {}\nimport { _i, j } \
                    from './m';",
                false,
                ""
            ),
            r#"{"varsIgnorePattern": "^_"}"#
        ),
        [
            "3:7 'b' is assigned a value but never used. Allowed unused vars must match /^_/u.",
            "6:14 'j' is defined but never used. Allowed unused vars must match /^_/u."
        ]
    );
    assert_eq!(
        unused_with(
            &component(
                "function f(_a, b, _c) {}\nf();\nfunction g(a, _b) { return a; }\ng();\nconst h \
                    = (_x, { y }) => 1;\nh();",
                false,
                ""
            ),
            r#"{"argsIgnorePattern": "^_"}"#
        ),
        [
            "2:16 'b' is defined but never used. Allowed unused args must match /^_/u.",
            "6:18 'y' is defined but never used. Allowed unused args must match /^_/u."
        ]
    );
    assert_eq!(
        unused_with(
            &component(
                "try {} catch (ignoreErr) {}\ntry {} catch (err) {}",
                false,
                ""
            ),
            r#"{"caughtErrors": "all", "caughtErrorsIgnorePattern": "^ignore"}"#
        ),
        [
            "3:15 'err' is defined but never used. Allowed unused caught errors must match \
                /^ignore/u."
        ]
    );
    assert_eq!(
        unused_with(
            &component(
                "const arr = [1, 2];\nconst [_x, y] = arr;\nlet _z, w;\n[_z, w] = arr;\nconst [a \
                    = 1] = arr;\nconst { _o } = { _o: 1 };",
                false,
                ""
            ),
            r#"{"destructuredArrayIgnorePattern": "^_"}"#
        ),
        [
            "3:12 'y' is assigned a value but never used. Allowed unused elements of array \
                destructuring must match /^_/u.",
            "5:6 'w' is assigned a value but never used.",
            "6:8 'a' is assigned a value but never used.",
            "7:9 '_o' is assigned a value but never used."
        ]
    );
    assert_eq!(
        unused_with(
            &component(
                "const arr = [1];\nconst [q] = arr;\nconst r = 1;",
                false,
                ""
            ),
            r#"{"destructuredArrayIgnorePattern": "^_", "varsIgnorePattern": "^v"}"#
        ),
        [
            "3:8 'q' is assigned a value but never used. Allowed unused elements of array \
                destructuring must match /^_/u.",
            "4:7 'r' is assigned a value but never used. Allowed unused vars must match /^v/u."
        ]
    );
    assert_eq!(
        unused_with(
            &component(
                "let items = [1];",
                false,
                "{#each items as _item, i}x{/each}\n{#snippet s(_a, b)}x{/snippet}\n{@render \
                    s(1, 2)}"
            ),
            r#"{"argsIgnorePattern": "^_", "varsIgnorePattern": "^_"}"#
        ),
        [
            "4:24 'i' is defined but never used. Allowed unused args must match /^_/u.",
            "5:17 'b' is defined but never used. Allowed unused args must match /^_/u."
        ]
    );
}

// Expected values from the oracle (ESLint with svelte-eslint-parser, typescript-eslint's parser
// and `@typescript-eslint/no-unused-vars` alone, in runes mode) on these inputs.
#[test]
fn a_message_prints_the_pattern_as_javascript_does() {
    assert_eq!(
        unused_with(
            &component("const b = 2;", false, ""),
            r#"{"varsIgnorePattern": "a/b|^_"}"#
        ),
        ["2:7 'b' is assigned a value but never used. Allowed unused vars must match /a\\/b|^_/u."]
    );
    assert_eq!(
        unused_with(
            &component("const b = 2;", false, ""),
            r#"{"varsIgnorePattern": "[/]x"}"#
        ),
        ["2:7 'b' is assigned a value but never used. Allowed unused vars must match /[/]x/u."]
    );
    assert_eq!(
        unused_with(
            &component("const Ä = 1;\nconst b = 2;", false, ""),
            r#"{"varsIgnorePattern": "^\\p{Lu}"}"#
        ),
        ["3:7 'b' is assigned a value but never used. Allowed unused vars must match /^\\p{Lu}/u."]
    );
    assert_eq!(
        unused_with(
            &component("const a = 1;", false, ""),
            r#"{"varsIgnorePattern": ""}"#
        ),
        ["2:7 'a' is assigned a value but never used."]
    );
}

// Expected values from the oracle (ESLint with svelte-eslint-parser, typescript-eslint's parser
// and `@typescript-eslint/no-unused-vars` alone, in runes mode) on these inputs.
#[test]
fn options_skip_kinds_of_names() {
    assert_eq!(
        unused_with(
            &component("function f(a, b) {}\nf();\nconst _u = 1;", false, ""),
            r#"{"args": "none"}"#
        ),
        ["4:7 '_u' is assigned a value but never used."]
    );
    assert_eq!(
        unused_with(
            &component("function f(a, b) { return b; }\nf();", false, ""),
            r#"{"args": "all"}"#
        ),
        ["2:12 'a' is defined but never used."]
    );
    assert_eq!(
        unused_with(
            &component(
                "try {} catch (err) {}\ntry {} catch ({ message }) {}",
                false,
                ""
            ),
            r#"{"caughtErrors": "none"}"#
        ),
        Vec::<String>::new()
    );
    assert_eq!(
        unused_with(
            &component(
                "const obj = { a: 1, b: 2 };\nconst { a, ...rest } = \
                    obj;\nconsole.log(rest);\nlet p, q;\n({ p, ...q } = \
                    obj);\nconsole.log(q);\nconst { b: bb, ...others } = \
                    obj;\nconsole.log(others);\nconst { c = 1, ...more } = \
                    obj;\nconsole.log(more);",
                false,
                ""
            ),
            r#"{"ignoreRestSiblings": true}"#
        ),
        ["10:9 'c' is assigned a value but never used."]
    );
    assert_eq!(
        unused_with(
            &component(
                "class A { static { console.log(1); } }\nclass B {}",
                false,
                ""
            ),
            r#"{"ignoreClassWithStaticInitBlock": true}"#
        ),
        ["3:7 'B' is defined but never used."]
    );
    assert_eq!(
        unused_with(
            &component("const a = 1;\nfunction f(b) {}\nf();", false, ""),
            r#""local""#
        ),
        [
            "2:7 'a' is assigned a value but never used.",
            "3:12 'b' is defined but never used."
        ]
    );
    assert_eq!(
        unused_with(
            &component(
                "function f() {\n  using x = { [Symbol.dispose]() {} };\n}\nf();",
                false,
                ""
            ),
            r#"{"ignoreUsingDeclarations": true}"#
        ),
        Vec::<String>::new()
    );
}

// Expected values from the oracle (ESLint with svelte-eslint-parser, typescript-eslint's parser
// and `@typescript-eslint/no-unused-vars` alone, in runes mode) on these inputs.
// Including a signature's parameter, which typescript-eslint counts as used, but not an enum
// member.
#[test]
fn a_used_name_a_pattern_ignores_is_reported_when_asked() {
    assert_eq!(
        unused_with(
            &component(
                "const _used = 1;\nconsole.log(_used);\nlet _w = 1;\n_w = \
                    2;\nconsole.log(_w);\nfunction f(_p) { return _p; }\nf();\ntry {} catch (_e) \
                    { console.log(_e); }\nconst [_d] = [1];\nconsole.log(_d);\nconst _unused = 2;",
                false,
                ""
            ),
            r#"{"varsIgnorePattern": "^_", "argsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_", "destructuredArrayIgnorePattern": "^_",
                "reportUsedIgnorePattern": true}"#
        ),
        [
            "10:8 '_d' is marked as ignored but is used. Used elements of array destructuring \
                must not match /^_/u.",
            "2:7 '_used' is marked as ignored but is used. Used vars must not match /^_/u.",
            "5:1 '_w' is marked as ignored but is used. Used vars must not match /^_/u.",
            "7:12 '_p' is marked as ignored but is used. Used args must not match /^_/u.",
            "9:15 '_e' is marked as ignored but is used. Used caught errors must not match /^_/u."
        ]
    );
    assert_eq!(
        unused_with(
            &component("let _x = 1;", false, "{_x}"),
            r#"{"varsIgnorePattern": "^_", "reportUsedIgnorePattern": true}"#
        ),
        ["2:5 '_x' is marked as ignored but is used. Used vars must not match /^_/u."]
    );
    assert_eq!(
        unused_with(
            &component(
                "type F = (_a: string) => void;\nexport const f: F = () => {};\nfunction g(this: \
                    Window, _b: number) {}\ng.call(window, 1);",
                true,
                ""
            ),
            r#"{"argsIgnorePattern": "^_", "reportUsedIgnorePattern": true}"#
        ),
        ["2:11 '_a' is marked as ignored but is used. Used args must not match /^_/u."]
    );
    assert_eq!(
        unused_with(
            &component(
                "enum E { _A, B }\nconsole.log(E._A);\ntype _T = string;\nlet x: _T = \
                    '';\nconsole.log(x);",
                true,
                ""
            ),
            r#"{"varsIgnorePattern": "^_", "reportUsedIgnorePattern": true}"#
        ),
        ["4:6 '_T' is marked as ignored but is used. Used vars must not match /^_/u."]
    );
}

#[test]
fn an_option_the_rules_do_not_take_is_an_error() {
    let configure = |option: &str| {
        let option = serde_json::value::RawValue::from_string(option.to_owned()).expect("JSON");
        crate::Configuration::new(crate::LintSettings::default())
            .rule(
                "no-unused-vars",
                rsvelte_kernel::diagnostics::Severity::Error,
                &[option],
                &[],
            )
            .map(drop)
    };
    configure(r#"{ "fix": { "imports": "off" }, "varsIgnorePattern": "^_" }"#).unwrap();
    let error = configure(r#"{ "bogus": true }"#).unwrap_err();
    assert!(error.contains("unknown field `bogus`"), "{error}");
    let error = configure(r#"{ "varsIgnorePattern": "(" }"#).unwrap_err();
    assert!(error.contains("invalid regular expression `(`"), "{error}");
    configure(r#""nowhere""#).unwrap_err();
}
