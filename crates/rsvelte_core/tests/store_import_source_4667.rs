//! `$derived` beside an imported `derived` is the rune only when the import's
//! source is `svelte/store` (#4667). Upstream reads the binding's own
//! `ImportDeclaration.source.value`, so the specifier's spelling — spaces
//! around `{`, named against default — decides nothing. Expected values are
//! the official compiler's output for the same input.

use rsvelte_core::compiler::{CompileOptions, GenerateMode, compile};

fn code(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            generate,
            ..Default::default()
        },
    )
    .unwrap()
    .js
    .code
}

fn component(import_line: &str) -> String {
    format!(
        "<script>\n\t{import_line}\n\tlet a = $state(1);\n\tlet b = $derived(a * 2);\n</script>\n\n<p>{{b}}</p>\n"
    )
}

#[test]
fn a_store_import_without_spaces_leaves_the_rune_alone() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = code(
            &component(r#"import{derived}from"svelte/store";"#),
            generate,
        );
        assert!(out.contains("$.derived(() => a * 2)"), "{out}");
        assert!(!out.contains("store_get"), "{out}");
    }
}

#[test]
fn a_space_on_only_one_side_of_the_braces_reads_the_same() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let tight = code(
            &component(r#"import{derived} from "svelte/store";"#),
            generate,
        );
        let spaced = code(
            &component(r#"import { derived } from "svelte/store";"#),
            generate,
        );
        assert_eq!(tight, spaced);
        assert!(spaced.contains("$.derived(() => a * 2)"), "{spaced}");
    }
}

#[test]
fn a_default_import_from_the_store_module_counts_too() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = code(
            &component(r#"import derived from"svelte/store";"#),
            generate,
        );
        assert!(out.contains("$.derived(() => a * 2)"), "{out}");
        assert!(!out.contains("store_get"), "{out}");
    }
}

#[test]
fn the_same_name_imported_from_another_module_stays_a_subscription() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = code(&component(r#"import{derived}from"./m.js";"#), generate);
        assert!(out.contains("store_get"), "{out}");
        assert!(!out.contains("$.derived(() => a * 2)"), "{out}");
    }
}

#[test]
fn a_real_subscription_to_a_tightly_imported_store_still_subscribes() {
    let source = "<script>\n\timport{writable}from\"svelte/store\";\n\tconst count = writable(0);\n</script>\n\n<p>{$count}</p>\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = code(source, generate);
        assert!(out.contains("store_get"), "{out}");
    }
}
