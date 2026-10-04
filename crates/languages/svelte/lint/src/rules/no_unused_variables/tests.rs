use rsvelte_kernel::source::positions::LineIndex;

fn lint(source_text: &str) -> String {
    use rsvelte_kernel::computation::database::DocumentContext;
    use rsvelte_kernel::computation::pipeline::{Document, Registry};
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let configuration = crate::Configuration::default();
    let findings = crate::lint(&context, &configuration).expect("source parses");
    let rules: Vec<_> = configuration
        .rules()
        .iter()
        .map(|rule| rule.name())
        .collect();
    rsvelte_lint::output::render_json(&LineIndex::new(source_text), &rules, &findings)
}

fn unused(source_text: &str) -> Vec<String> {
    let got = lint(source_text);
    got.lines()
        .filter_map(|l| l.trim().strip_prefix("\"message\": \""))
        .map(|m| m.trim_end_matches("\",").to_owned())
        .collect()
}

// Expected values from the oracle (ESLint with svelte-eslint-parser and typescript-eslint's
// parser, `no-unused-variables` alone) on these inputs.
#[test]
fn a_name_used_only_in_types_is_used() {
    let typescript = |body: &str| format!("<script lang=\"ts\">\n{body}\n</script>\n");
    assert!(
        unused(&typescript(
            "import type { A } from \"./a\";\nlet x: A = 1;\nconsole.log(x);"
        ))
        .is_empty()
    );
    assert!(
        unused(&typescript(
            "import { B } from \"./b\";\
                 \nlet y = $state<Map<string, B>>(new Map());\nconsole.log(y);"
        ))
        .is_empty()
    );
    assert_eq!(
        unused(&typescript("import { C } from \"./c\";")),
        ["'C' is defined but never used."]
    );
    assert_eq!(
        unused(&typescript(
            "import { D } from \"./d\";\ntype P = { D: string };\
                 \nlet p: P = { D: \"\" };\nconsole.log(p);"
        )),
        ["'D' is defined but never used."]
    );
    assert_eq!(
        unused(&typescript(
            "import { F } from \"./f\";\nlet v: X.F;\nconsole.log(v);"
        )),
        ["'F' is defined but never used."]
    );
}

// Expected value from the oracle (tools/fixtures svelte.lint on this input).
#[test]
fn exported_declarations_are_not_unused() {
    let got =
        lint("<script>\n\texport const e = 1;\n\texport function k() {}\n\tlet u = 1;\n</script>");
    let want = "\"findings\": [\
                    \n\t\t{\
                    \n\t\t\t\"rule\": \"no-unused-vars\",\
                    \n\t\t\t\"message\": \"'u' is assigned a value but never used.\",\
                    \n\t\t\t\"start\": {\n\t\t\t\t\"line\": 4,\n\t\t\t\t\"column\": 6\n\t\t\t},\
                    \n\t\t\t\"end\": {\n\t\t\t\t\"line\": 4,\n\t\t\t\t\"column\": 7\n\t\t\t}\
                    \n\t\t}\
                    \n\t]\n}\n";
    assert!(got.ends_with(want), "{got}");
}
