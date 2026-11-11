use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_syntax::Parsed;

use super::{CompileWarnings, Options};
use crate::{Analyzed, Lowered, Resolved};

/// What `svelte.compile` with `runes: true` warns about `code`, as each warning's code, source
/// text and message.
fn compiled(code: &str) -> Vec<(String, String, String)> {
    let (warnings, _) = compiled_with_errors(code, Some(true));
    warnings
}

/// [`compiled`] with the `runes` option, and the codes of the errors the analysis raises.
fn compiled_with_errors(
    code: &str,
    runes: Option<bool>,
) -> (Vec<(String, String, String)>, Vec<String>) {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new("Test.svelte".to_owned(), code.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let component = context.get::<Parsed>().as_ref().expect("parses");
    let lowered = context.get::<Lowered>().as_ref().expect("lowers");
    let resolution = context.get::<Resolved>().as_ref().expect("resolves");
    let options = Options {
        runes,
        custom_element: false,
    };
    let analysis = context.get::<Analyzed>().as_ref();
    let found = super::warnings(
        component,
        lowered,
        resolution,
        analysis,
        code,
        "Test.svelte",
        options,
    );
    let warnings = found
        .compiled()
        .map(|w| {
            let text = w.span.text(code).to_owned();
            (w.code.to_string(), text, w.message.clone())
        })
        .collect();
    let errors = found
        .errors
        .iter()
        .map(|(_, e)| e.code.to_string())
        .collect();
    (warnings, errors)
}

/// The source text of each `code` warning.
fn texts(code: &str, source: &str) -> Vec<String> {
    compiled(source)
        .into_iter()
        .filter(|(c, ..)| c == code)
        .map(|(_, text, _)| text)
        .collect()
}

#[test]
fn an_update_warning_spans_the_type_annotation() {
    let source = "<script lang=\"ts\">\n  let a: string = '';\n  a = 'b';\n</script>\n{a}\n";
    assert_eq!(texts("non_reactive_update", source), ["a: string"]);
}

#[test]
fn an_export_specifier_reassigns_its_binding() {
    let source = "<script>\n  let a = 1;\n  export { a };\n</script>\n{a}\n";
    assert_eq!(texts("non_reactive_update", source), ["a"]);
}

#[test]
fn only_a_reference_below_a_state_argument_suggests_a_derived() {
    let source = "<script>\n  let { a, b } = $props();\n  let c = $state(a);\n  let d = \
        $state([b]);\n</script>\n";
    let kinds: Vec<(String, bool)> = compiled(source)
        .into_iter()
        .filter(|(c, ..)| c == "state_referenced_locally")
        .map(|(_, text, message)| (text, message.contains("inside a derived")))
        .collect();
    assert_eq!(kinds, [("a".to_owned(), false), ("b".to_owned(), true)]);
}

#[test]
fn state_is_read_locally_at_its_own_function_depth() {
    let source = "<script>\n  console.log(a);\n  var a = $state(1);\n  a = 2;\n  function f() \
        {\n    let b = $state(1);\n    b = 2;\n    b;\n    () => b;\n  }\n  export { a \
        };\n</script>\n";
    // Only `b;`: `a` is read before its declarator, `() => b` is a function deeper, and the
    // export specifier's name is not visited.
    assert_eq!(texts("state_referenced_locally", source), ["b"]);
}

#[test]
fn a_legacy_code_before_the_style_is_reported_at_the_code() {
    let source =
        "<p class=\"a\"></p>\n<!-- svelte-ignore css-unused-selector -->\n<style>.b {}</style>\n";
    // Upstream reports it four bytes early; see `upstream_issues.md`. The selector is reported too.
    assert_eq!(texts("legacy_code", source), ["css-unused-selector"]);
    assert_eq!(texts("css_unused_selector", source), [".b"]);
}

#[test]
fn an_element_is_closed_by_the_next_tag_or_the_end_tag_around_it() {
    let source = "<ul><li>a<li>b</ul>\n<div><p></div>\n";
    let found: Vec<(String, String)> = compiled(source)
        .into_iter()
        .filter(|(c, ..)| c == "element_implicitly_closed")
        .map(|(_, text, message)| {
            (
                text,
                message[..message.find(',').expect("a comma")].to_owned(),
            )
        })
        .collect();
    let by = |tag: &str| format!("This element is implicitly closed by the following `{tag}`");
    assert_eq!(
        found,
        [
            ("<li>".to_owned(), by("<li>")),
            ("<li>".to_owned(), by("</ul>")),
            ("<p>".to_owned(), by("</div>")),
        ]
    );
}

/// Each warning's code and message, its link left out.
fn messages(source: &str) -> Vec<(String, String)> {
    compiled(source)
        .into_iter()
        .map(|(code, _, message)| {
            let message = message.split('\n').next().unwrap_or_default().to_owned();
            (code, message)
        })
        .collect()
}

fn pair(code: &str, message: &str) -> (String, String) {
    (code.to_owned(), message.to_owned())
}

#[test]
fn a_div_with_a_click_handler_needs_a_key_handler_and_a_role() {
    assert_eq!(
        messages("<div onclick={() => {}} onmouseover={() => {}}></div>"),
        [
            pair(
                "a11y_click_events_have_key_events",
                "Visible, non-interactive element `<div>` with a click event must be accompanied \
                    by a keyboard event handler. Consider whether an interactive element such as \
                    `<button type=\"button\">` or `<a>` might be more appropriate"
            ),
            pair(
                "a11y_no_static_element_interactions",
                "`<div>` with a click or mouseover handler must have an ARIA role"
            ),
            pair(
                "a11y_mouse_events_have_key_events",
                "'mouseover' event must be accompanied by 'focus' event"
            ),
        ]
    );
}

#[test]
fn a_link_needs_a_label_and_somewhere_to_go() {
    assert_eq!(
        messages("<a href=\"#\"></a><button aria-hidden=\"\"></button>"),
        [
            pair(
                "a11y_consider_explicit_label",
                "Buttons and links should either contain text or have an `aria-label`, \
                    `aria-labelledby` or `title` attribute"
            ),
            pair(
                "a11y_invalid_attribute",
                "'#' is not a valid href attribute"
            ),
            pair(
                "a11y_incorrect_aria_attribute_type_boolean",
                "The value of 'aria-hidden' must be either 'true' or 'false'. It cannot be empty"
            ),
            pair(
                "a11y_consider_explicit_label",
                "Buttons and links should either contain text or have an `aria-label`, \
                    `aria-labelledby` or `title` attribute"
            ),
        ]
    );
}

#[test]
fn a_role_is_checked_token_by_token() {
    assert_eq!(
        messages(
            "<ul><li><figure role=\"figure\"><img alt=\"\" /></figure></li></ul><div \
                role=\"buton\"></div><article role=\"button\"></article>"
        ),
        [
            pair("a11y_no_redundant_roles", "Redundant role 'figure'"),
            pair(
                "a11y_unknown_role",
                "Unknown role 'buton'. Did you mean 'button'?"
            ),
            pair(
                "a11y_no_noninteractive_element_to_interactive_role",
                "Non-interactive element `<article>` cannot have interactive role 'button'"
            ),
        ]
    );
}

#[test]
fn an_escape_in_a_string_can_spell_a_control_character() {
    let source = "<script>\n  let a = '\\u2067';\n</script>\n";
    assert_eq!(
        texts("bidirectional_control_characters", source),
        ["'\\u2067'"]
    );
}

#[test]
fn a_special_element_reads_global_handlers_too() {
    let source = "<svelte:window {onresize} />\n";
    assert_eq!(
        texts("attribute_global_event_reference", source),
        ["{onresize}"]
    );
}

#[test]
fn svelte_component_this_is_not_an_attribute() {
    let source = "<script>\n  let A;\n</script>\n<svelte:component this=\"{A}\" b=\"{A}\" />\n";
    assert_eq!(texts("attribute_quoted", source), ["b=\"{A}\""]);
}

#[test]
fn a_block_turns_a_misplaced_element_into_a_warning() {
    let source = "<form>{#if a}<form></form>{/if}</form>\n<p>{#if a}<div></div>{/if}</p>\n";
    let found = messages(source);
    let codes: Vec<&str> = found.iter().map(|(c, _)| c.as_str()).collect();
    assert_eq!(
        codes,
        ["node_invalid_placement_ssr", "node_invalid_placement_ssr"]
    );
    assert!(
        found[0]
            .1
            .starts_with("`<form>` cannot be a child of `<form>`. When"),
        "{found:?}"
    );
    assert!(
        found[1]
            .1
            .starts_with("`<div>` cannot be a child of `<p>`. When"),
        "{found:?}"
    );
}

#[test]
fn a_declaration_tag_reads_its_own_state_locally() {
    let source = "{let a = $state(0), b = $derived(a), c = a}\n{a}{b}{c}\n";
    assert_eq!(texts("state_referenced_locally", source), ["a"]);
}

#[test]
fn the_selectors_of_a_global_block_are_used() {
    let source = "<div></div>\n<style>\n  div :global:is(html.x *) { color: red; }\n</style>\n";
    assert_eq!(texts("css_unused_selector", source), [""; 0]);
}

#[test]
fn a_comment_in_a_default_slot_warns_once() {
    let source = "<script>\n  import C from './C.svelte';\n</script>\n<C>\n  <!-- svelte-ignore \
        a11y-autofocus -->\n  <div></div>\n  <input autofocus />\n</C>\n";
    // Upstream warns twice and ignores the later `<input>` too; see `upstream_issues.md`.
    assert_eq!(texts("legacy_code", source), ["a11y-autofocus"]);
    assert_eq!(texts("a11y_autofocus", source), ["autofocus"]);
}

#[test]
fn a_rune_named_after_a_binding_subscribes_to_a_store() {
    let source = "<script>\n  import { state } from './s.js';\n  let foo = $state(0);\n  foo = \
        1;\n</script>\n{foo}\n";
    // `foo` is no state, so updating it does not render.
    assert_eq!(texts("store_rune_conflict", source), ["$state"]);
    assert_eq!(texts("non_reactive_update", source), ["foo"]);
}

#[test]
fn store_rune_conflicts_come_name_by_name() {
    let source = "<script>\n  import { state, effect } from './s.js';\n  $state(1);\n  $effect(() \
        => {});\n  $state(2);\n</script>\n";
    // Upstream warns each name's references together, in the order the names first appear.
    assert_eq!(
        texts("store_rune_conflict", source),
        ["$state", "$state", "$effect"]
    );
}

#[test]
fn a_props_fallback_does_not_read_state_locally() {
    let source = "<script>\n  let { a, b = a } = $props();\n</script>\n";
    assert_eq!(texts("state_referenced_locally", source), [""; 0]);
}

#[test]
fn the_tables_come_from_the_svelte_the_oracle_installs() {
    let package = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../../tools/oracle/package.json"
    ));
    let pinned = package
        .split("\"svelte\": \"")
        .nth(1)
        .and_then(|rest| rest.split('"').next())
        .expect("the oracle pins svelte");
    for vendored in [
        include_str!("vendor/codes.rs"),
        include_str!("vendor/a11y.rs"),
    ] {
        let header = vendored.lines().next().expect("a header");
        assert_eq!(
            header
                .strip_prefix("// svelte ")
                .and_then(|rest| rest.split(',').next()),
            Some(pinned),
            "{header}: the oracle installs svelte {pinned}; run `node tools/oracle/oracle.ts \
                warnings`"
        );
    }
}

#[test]
fn every_checked_code_is_a_svelte_code() {
    for code in CompileWarnings::CODES {
        assert!(CompileWarnings::SVELTE_CODES.contains(code), "{code}");
    }
    assert!(CompileWarnings::SVELTE_CODES.contains(&"ownership_invalid_mutation"));
}

#[test]
fn a_script_comment_ignores_a_local_state_reference() {
    for script in [
        "let count = $state(0);\n// svelte-ignore state_referenced_locally\nlet x = count;",
        "let count = $state(0);\nlet x = $derived(1);\n// svelte-ignore \
            state_referenced_locally\nconsole.log(count);",
        "let { a } = $props();\n// svelte-ignore state_referenced_locally\nconst b = a;",
        "let count = $state(0) as number;\n// svelte-ignore state_referenced_locally\nlet x = \
            count;",
    ] {
        let lang = if script.contains(" as ") {
            " lang=\"ts\""
        } else {
            ""
        };
        let code = format!("<script{lang}>\n{script}\n</script>\n{{x}}");
        assert_eq!(compiled(&code), [], "{script}");
    }
}

#[test]
fn a_cast_state_is_referenced_locally_as_the_bare_one_is() {
    let bare = compiled("<script lang=\"ts\">let count = $state(0); let x = count;</script>{x}");
    let cast =
        compiled("<script lang=\"ts\">let count = $state(0) as number; let x = count;</script>{x}");
    assert_eq!(bare.len(), 1);
    assert_eq!(cast, bare);
}

#[test]
fn an_erased_or_parameter_dollar_name_is_no_binding() {
    // The control: a plain `$` binding is an error.
    assert_eq!(
        compiled_with_errors("<script>let $x = 1;</script>", None).1,
        ["dollar_prefix_invalid"]
    );
    for script in [
        "<script context=\"module\" lang=\"ts\">\n\
         import { writable } from 'svelte/store';\n\
         const a = writable(0)\n\
         declare const $a: string\n\
         </script>\n\
         <script lang=\"ts\">\n\
         const b = writable(0)\n\
         declare const $b: string\n\
         </script>\n\
         {$a}\n\
         {$b}",
        "<script module lang=\"ts\">import { derived } from 'svelte/store';\n\
         export const m = derived([a, b], ([$a, $b]) => $a < $b);</script>",
        "<script module>export const m = (($c) => $c)(1);</script>",
    ] {
        let errors = compiled_with_errors(script, None).1;
        assert!(
            !errors.iter().any(|e| e.starts_with("dollar_")),
            "{script}: {errors:?}"
        );
    }
}

#[test]
fn a_cast_attribute_value_selects_as_its_value() {
    let source = "<script lang=\"ts\">\n\t//\n</script>\n\n<div data-active={false as \
        true}>\n\t<span></span>\n</div>\n\n\
                  <style>\n\t[data-active='true'] > span {\n\t\tbackground-color: \
                      red;\n\t}\n</style>\n";
    let codes: Vec<String> = compiled(source)
        .into_iter()
        .map(|(code, ..)| code)
        .collect();
    assert_eq!(codes, ["css_unused_selector"]);
}

#[test]
fn a_function_expression_name_counts_no_depth_and_a_class_is_walked() {
    // Each case with where svelte 5.57.3 raises `dollar_prefix_invalid`, without and with runes.
    let cases = [
        ("function g() { const f = function $x() {}; }", None, None),
        ("const f = function $x() {};", Some(27), Some(27)),
        (
            "function g() { function h() { const f = function $x() {}; } }",
            None,
            None,
        ),
        ("function g() { class $C {} }", None, Some(29)),
        (
            "function g() { function h() { class $C {} } }",
            None,
            Some(44),
        ),
        (
            "function g() { function h() { let $v = 1; } }",
            None,
            Some(42),
        ),
    ];
    let mut registry = Registry::new();
    crate::register(&mut registry);
    for (script, without, with) in cases {
        let source = format!("<script>{script}</script>");
        let document = Document::new("Test.svelte".to_owned(), source).expect("small");
        let context = DocumentContext::new(&document, registry.artifacts());
        let component = context.get::<Parsed>().as_ref().expect("parses");
        let resolution = context.get::<Resolved>().as_ref().expect("resolves");
        for (runes, expected) in [(false, without), (true, with)] {
            let errors = super::dollar_name_errors(
                &component.javascript,
                component.instance.as_ref().map(|s| s.program),
                None,
                resolution,
                runes,
            );
            let raised: Vec<_> = errors
                .iter()
                .map(|(_, e)| (e.code.to_string(), e.span.start_offset))
                .collect();
            let expected: Vec<_> = expected
                .map(|at| ("dollar_prefix_invalid".to_owned(), at))
                .into_iter()
                .collect();
            assert_eq!(raised, expected, "{script} runes={runes}");
        }
    }
}

#[test]
fn a_type_only_dollar_import_is_erased() {
    // svelte 5.57.3 compiles the first two and rejects the value import at 27.
    let cases = [
        ("import type { $T } from \"./t\";", None),
        ("import { type $T } from \"./t\";", None),
        ("import { $T } from \"./t\";", Some(27)),
    ];
    let mut registry = Registry::new();
    crate::register(&mut registry);
    for (script, expected) in cases {
        let source = format!("<script lang=\"ts\">{script}</script>");
        let document = Document::new("Test.svelte".to_owned(), source).expect("small");
        let context = DocumentContext::new(&document, registry.artifacts());
        let component = context.get::<Parsed>().as_ref().expect("parses");
        let resolution = context.get::<Resolved>().as_ref().expect("resolves");
        let errors = super::dollar_name_errors(
            &component.javascript,
            component.instance.as_ref().map(|s| s.program),
            None,
            resolution,
            false,
        );
        let raised: Vec<_> = errors.iter().map(|(_, e)| e.span.start_offset).collect();
        assert_eq!(raised, expected.into_iter().collect::<Vec<_>>(), "{script}");
    }
}

#[test]
fn a_module_file_warns_as_svelte_s_compile_module() {
    use crate::compiler_syntax_tree::{Children, CompilerSyntaxTreeBuilder};

    let code = "let count = $state(0);\n\
                let doubled = count * 2;\n\
                // svelte-ignore state_referenced_locally\n\
                let tripled = count * 3;\n\
                class A {}\n\
                function f() {\n\
                \tclass B {}\n\
                \tconst x = new class {};\n\
                \tfunction g() {\n\
                \t\tclass C {}\n\
                \t}\n\
                }\n\
                const y = new class {};\n";
    let document = Document::new("a.svelte.js".to_owned(), code.to_owned()).expect("small");
    let (tree, program) =
        rsvelte_typescript_tree::Tree::program(&document, oxc_span::SourceType::mjs())
            .expect("parses");
    let empty = CompilerSyntaxTreeBuilder::new(code, 0, 0).finish(Children::default());
    let resolution = crate::resolve::resolve(&tree, None, Some(program), &empty);
    let options = Options {
        runes: None,
        custom_element: false,
    };
    let found = super::module_warnings(&tree, program, &resolution, code, options);
    // `tripled`'s read is found, and the `svelte-ignore` before it drops it.
    assert_eq!(found.ignored, [false, true, false, false]);
    let warnings: Vec<_> = found
        .compiled()
        .map(|w| (w.code.to_string(), w.span.text(code).to_owned()))
        .collect();
    // What svelte 5's `compileModule` reports for the same text.
    assert_eq!(
        warnings,
        [
            ("state_referenced_locally", "count"),
            ("perf_avoid_inline_class", "new class {}"),
            ("perf_avoid_nested_class", "class C {}"),
        ]
        .map(|(code, text)| (code.to_owned(), text.to_owned()))
    );
}
