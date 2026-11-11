use rsvelte_kernel::source::positions::LineIndex;

fn lint(source_text: &str) -> String {
    use rsvelte_kernel::computation::database::DocumentContext;
    use rsvelte_kernel::computation::registry::Registry;
    use rsvelte_kernel::source::document::Document;
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let configuration = crate::Configuration::default();
    let findings = crate::lint(&context, &configuration).expect("source parses");
    let rules = configuration
        .rules()
        .iter()
        .map(crate::ConfiguredRule::name);
    rsvelte_lint_runner::output::render_json(&LineIndex::new(source_text), rules, &findings)
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
    assert_eq!(
        unused(&typescript(
            "import type { A } from \"./a\";\nlet x: A = 1;\nconsole.log(x);"
        )),
        Vec::<String>::new()
    );
    assert_eq!(
        unused(&typescript(
            "import { B } from \"./b\";\
                 \nlet y = $state<Map<string, B>>(new Map());\nconsole.log(y);"
        )),
        Vec::<String>::new()
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

// Expected value from the oracle (tools/oracle svelte.lint on this input).
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

/// Each finding's message and start line.
fn unused_at(source_text: &str) -> Vec<(String, u32)> {
    let got = lint(source_text);
    let mut out = Vec::new();
    let mut lines = got.lines().map(str::trim);
    while let Some(line) = lines.next() {
        if let Some(message) = line.strip_prefix("\"message\": \"") {
            let start = lines
                .by_ref()
                .find_map(|l| l.strip_prefix("\"line\": "))
                .expect("a start line");
            out.push((
                message.trim_end_matches("\",").to_owned(),
                start.trim_end_matches(',').parse().expect("a number"),
            ));
        }
    }
    out
}

// Expected values from ESLint with svelte-eslint-parser and typescript-eslint's parser,
// `svelteFeatures.runes: true`, `no-unused-vars` alone.
#[test]
fn a_bindable_prop_is_used() {
    let script = |body: &str| format!("<script lang=\"ts\">{body}</script>");
    assert_eq!(
        unused(&script("let { a = $bindable() } = $props(); a = 1;")),
        Vec::<String>::new()
    );
    assert_eq!(
        unused(&script("let { a = $bindable() } = $props();")),
        Vec::<String>::new()
    );
    assert_eq!(
        unused(&script("let { x: a = $bindable() } = $props(); a = 1;")),
        Vec::<String>::new()
    );
    assert_eq!(
        unused(&script(
            "let { a = $bindable(1), b = 2 } = $props(); b = 3;"
        )),
        ["'b' is assigned a value but never used."]
    );
    assert_eq!(
        unused(&script("let { a } = $props(); a = 1;")),
        ["'a' is assigned a value but never used."]
    );
}

#[test]
fn a_snippet_passed_to_a_component_is_used() {
    let component = "<script lang=\"ts\">import C from './C.svelte';</script>\n";
    assert_eq!(
        unused(&format!(
            "{component}<C>{{#snippet child({{ props }})}}<p/>{{/snippet}}</C>"
        )),
        ["'props' is defined but never used."]
    );
    assert_eq!(
        unused(&format!(
            "{component}<C><div>{{#snippet child({{ props }})}}<p/>{{/snippet}}</div></C>"
        )),
        [
            "'child' is defined but never used.",
            "'props' is defined but never used."
        ]
    );
    assert_eq!(
        unused(&format!(
            "{component}<C>{{#if x}}{{#snippet child()}}<p/>{{/snippet}}{{/if}}</C>"
        )),
        ["'child' is defined but never used."]
    );
    assert_eq!(
        unused(
            "<script>import * as M from './m';</script><M.C>{#snippet child()}<p/>{/snippet}</M.C>"
        ),
        Vec::<String>::new()
    );
    assert_eq!(
        unused("<svelte:boundary>{#snippet failed()}<p/>{/snippet}</svelte:boundary>"),
        Vec::<String>::new()
    );
    assert_eq!(
        unused("<svelte:component this={x}>{#snippet child()}<p/>{/snippet}</svelte:component>"),
        Vec::<String>::new()
    );
    assert_eq!(
        unused("<div>{#snippet child()}<p/>{/snippet}</div>"),
        ["'child' is defined but never used."]
    );
}

#[test]
fn the_scripts_share_their_top_level_names() {
    let scripts = |module: &str, instance: &str| {
        format!(
            "<script lang=\"ts\" module>{module}</script>\n<script lang=\"ts\">{instance}</script>"
        )
    };
    assert_eq!(
        unused_at(&scripts(
            "type Shadowed = string;",
            "type Shadowed = boolean; let { p }: { p: Shadowed } = $props(); console.log(p);"
        )),
        []
    );
    assert_eq!(
        unused_at(&scripts(
            "type S = string; export const q: S = '';",
            "type S = boolean;"
        )),
        []
    );
    assert_eq!(
        unused_at(&scripts(
            "namespace A { export const x = 1; }",
            "interface A { y: number } let { p }: { p: A } = $props(); console.log(p);"
        )),
        []
    );
    assert_eq!(
        unused_at(&scripts(
            "type Shadowed = string;",
            "type Shadowed = boolean;"
        )),
        [("'Shadowed' is defined but never used.".to_owned(), 1)]
    );
    assert_eq!(
        unused_at(&scripts(
            "namespace A { export const x = 1; }",
            "interface A { y: number }"
        )),
        [("'A' is defined but never used.".to_owned(), 1)]
    );
    assert_eq!(
        unused_at(&scripts("let v = 1;", "let v = 2; console.log(v);")),
        []
    );
    assert_eq!(
        unused_at(&scripts("let v = 1;", "let v = 2;")),
        [("'v' is assigned a value but never used.".to_owned(), 2)]
    );
}

#[test]
fn a_store_subscription_reads_the_store() {
    let store = "<script>import { writable } from 'svelte/store';";
    assert_eq!(
        unused(&format!(
            "{store} const count = writable(0); const unused = writable(0);\
             </script>\n<p>{{$count}}</p>"
        )),
        ["'unused' is assigned a value but never used."]
    );
    assert_eq!(
        unused(&format!(
            "{store} const count = writable(0); function f() {{ $count = 1; }} f();</script>"
        )),
        Vec::<String>::new()
    );
    assert_eq!(
        unused(&format!(
            "{store} const obj = writable({{ a: 1 }}); function f() {{ $obj.a++; }} f();</script>"
        )),
        Vec::<String>::new()
    );
    assert_eq!(
        unused(&format!(
            "{store} const action = writable(() => {{}});</script>\n<p use:$action></p>"
        )),
        Vec::<String>::new()
    );
    assert_eq!(
        unused(
            "<script module>import { writable } from 'svelte/store'; const count = writable(0);\
             </script>\n<script>console.log($count);</script>"
        ),
        Vec::<String>::new()
    );
    assert_eq!(
        unused("<script>import { page } from '$app/stores';</script>\n{$page.url}"),
        Vec::<String>::new()
    );
    assert_eq!(
        unused("<script>let state = 1; let x = $state(0); console.log(x);</script>"),
        ["'state' is assigned a value but never used."]
    );
}

// A `$name` is a plain read of `name`, so ESLint's `isReadForItself` drops an update of it.
#[test]
fn a_store_updated_only_for_itself_is_unused() {
    let store = "<script>import { writable } from 'svelte/store'; const count = writable(0);";
    let assigned = ["'count' is assigned a value but never used."];
    assert_eq!(
        unused(&format!(
            "{store} function f() {{ $count++; }} f();</script>"
        )),
        assigned
    );
    assert_eq!(unused(&format!("{store} $count += 1;</script>")), assigned);
    assert_eq!(
        unused(&format!(
            "{store} function f() {{ $count = 1; $count++; }} f();</script>"
        )),
        assigned
    );
    assert_eq!(
        unused(&format!(
            "{store} const y = $count++; console.log(y);</script>"
        )),
        Vec::<String>::new()
    );
    assert_eq!(
        unused(&format!(
            "{store} count.set(1); function f() {{ $count = 1; }} f();</script>"
        )),
        Vec::<String>::new()
    );
    assert_eq!(
        unused(
            "<script>import { count } from './store.js'; export function increment() { $count++; }\
             </script>"
        ),
        ["'count' is defined but never used."]
    );
}

// ESLint 10.14.0 with svelte-eslint-parser 1.10.0: the scripts see a top-level snippet only.
#[test]
fn a_script_reads_a_top_level_snippet() {
    assert_eq!(
        unused("<script>bar;</script>{#snippet bar()}x{/snippet}{#snippet baz()}y{/snippet}"),
        ["'baz' is defined but never used."]
    );
    assert_eq!(
        unused("<script module>bar;</script>{#snippet bar()}x{/snippet}"),
        Vec::<String>::new()
    );
    assert_eq!(
        unused("<script>x;</script><div>{#snippet x()}y{/snippet}</div>"),
        ["'x' is defined but never used."]
    );
    assert_eq!(
        unused(
            "<script>function f() { return bar; } f;</script>\
             {#if true}{#snippet bar()}x{/snippet}{/if}"
        ),
        ["'bar' is defined but never used."]
    );
}
