use crate::warnings::tests::{compiled, compiled_with_errors, texts};

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
fn state_in_a_template_function_is_read_locally_at_that_function_depth() {
    // As svelte 5.57.3 warns: in that function, not a nested one, and never the template's reads.
    for (template, expected) in [
        (
            "<b onclick={() => { let x = $derived(v); v = x; }}>{v}</b>",
            &["x"][..],
        ),
        (
            "{#each [1] as i}<b onclick={() => { let y = $state(i); y = 2; f(y); }}></b>{/each}",
            &["y"],
        ),
        (
            "<b onclick={() => { let x = $state(1); x = 2; return () => f(x); }}></b>",
            &[],
        ),
        ("<b onclick={() => v}>{v}</b>", &[]),
    ] {
        let source =
            format!("<script>let v = $state(1); v = 2; const f = (a) => a;</script>{template}");
        assert_eq!(
            texts("state_referenced_locally", &source),
            expected,
            "{template}"
        );
    }
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
fn a_declaration_tag_reads_its_own_state_locally() {
    let source = "{let a = $state(0), b = $derived(a), c = a}\n{a}{b}{c}\n";
    assert_eq!(texts("state_referenced_locally", source), ["a"]);
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
    assert_eq!(
        texts("state_referenced_locally", source),
        Vec::<String>::new()
    );
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
fn a_reactive_statement_off_the_instance_top_level_warns_in_legacy_mode() {
    let codes = |code: &str| -> Vec<String> {
        compiled_with_errors(code, None)
            .0
            .into_iter()
            .map(|(code, ..)| code)
            .collect()
    };
    let placement = ["reactive_declaration_invalid_placement"];
    assert_eq!(codes("<script module>\n$: x = 1;\n</script>\n"), placement);
    assert_eq!(
        codes("<script>\nfunction f() { $: x = 1; }\n</script>\n"),
        placement
    );
    assert_eq!(
        codes("<script>\nlet y = 1;\n$: x = y;\n</script>\n{x}\n"),
        Vec::<String>::new()
    );
}
