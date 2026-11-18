use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_syntax::Parsed;

use crate::Resolved;
use crate::warnings::tests::compiled_with_errors;

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
fn a_rune_parameter_called_in_a_declarator_is_an_error_in_legacy_mode() {
    let errors = |code: &str| compiled_with_errors(code, None).1;
    assert_eq!(
        errors("<script>\nfunction f($derived) { const x = $derived(1); }\n</script>\n"),
        ["rune_invalid_usage"]
    );
    assert_eq!(
        errors("<script>\nimport { state } from './s.js';\nlet a = $state(0);\n</script>\n"),
        Vec::<String>::new()
    );
}

#[test]
fn an_instance_name_a_module_import_declares_is_a_duplicate() {
    let errors = |code: &str| compiled_with_errors(code, None).1;
    let module = "<script module>\n  import { FOO } from './a.js';\n</script>\n";
    assert_eq!(
        errors(&format!(
            "{module}<script>\n  let FOO;\n</script>\n{{FOO}}\n"
        )),
        ["declaration_duplicate_module_import"]
    );
    assert_eq!(
        errors(&format!(
            "{module}<script>\n  let BAR;\n</script>\n{{FOO}}{{BAR}}\n"
        )),
        Vec::<String>::new()
    );
    assert_eq!(
        errors(&format!(
            "{module}<script>\n  let {{ a: [FOO] }} = {{}};\n</script>\n{{FOO}}\n"
        )),
        ["declaration_duplicate_module_import"]
    );
    let types = "<script module lang=\"ts\">\n  import type { T } from './a';\n  \
        import { type U } from './a';\n</script>\n";
    assert_eq!(
        errors(&format!(
            "{types}<script lang=\"ts\">\n  let T = 1;\n  let U = 2;\n</script>\n{{T}}{{U}}\n"
        )),
        Vec::<String>::new()
    );
}

#[test]
fn a_props_call_after_the_first_or_off_the_top_level_is_an_error() {
    let cases: [(&str, &[&str]); 5] = [
        ("<script>let x = 1;</script>", &[]),
        ("<script>let p = $props();</script>", &[]),
        (
            "<script>let p = $props(); let q = $props();</script>",
            &["props_duplicate"],
        ),
        (
            "<script>function f() { return $props(); }</script>",
            &["props_invalid_placement"],
        ),
        (
            "<script lang=\"ts\">declare const $props: any; function f() { $props(); }</script>",
            &["props_invalid_placement"],
        ),
    ];
    for (code, expected) in cases {
        assert_eq!(compiled_with_errors(code, Some(true)).1, expected, "{code}");
    }
}
