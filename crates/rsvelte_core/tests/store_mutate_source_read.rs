//! `$.store_mutate`'s first argument is the store SOURCE, read the way any
//! reference to its binding is read — upstream's `get_store()` is
//! `context.visit(b.id(name.slice(1)))`, so a prop yields `store()`, a
//! reassigned `let` yields `$.get(store)`, and every other binding kind yields
//! the bare name.
//!
//! `store_assign_ast` (for `$store = …`) had all three arms;
//! `store_member_mutate_ast` (for `$store.prop = …`) had only the prop one, so
//! the same binding was read one way when assigned and another when mutated —
//! and the mutated form passed the signal object where the store belongs. The
//! output parses either way, which is why only output equality reports it.
//!
//! Every expectation below is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(script: &str) -> String {
    compile(
        &format!("<script>\n{script}\n</script>\n\n{{$s.a}}\n"),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const IMPORT: &str = "\timport { writable } from 'svelte/store';\n";

/// A `let` the script reassigns is a `$.mutable_source`, so reading it is
/// `$.get(s)` — the arm this file exists for.
#[test]
fn a_reassigned_store_binding_is_read_through_its_source() {
    let out = client(&format!(
        "{IMPORT}\tlet s = writable({{}});\n\ts = writable({{ b: 1 }});\n\t$: $s.a = 1;"
    ));
    assert!(
        out.contains("$.store_mutate($.get(s), $.untrack($s).a = 1, $.untrack($s));"),
        "{out}"
    );
}

/// The same binding assigned rather than mutated. Both ports must answer with
/// the same read form, which is the invariant a second port drifts away from.
#[test]
fn assigning_and_mutating_one_store_read_it_the_same_way() {
    let out = client(&format!(
        "{IMPORT}\tlet s = writable({{}});\n\ts = writable({{ b: 1 }});\n\t$: $s.a = 1;\n\t$: $s = writable({{ c: 2 }});"
    ));
    assert!(out.contains("$.store_mutate($.get(s),"), "{out}");
    assert!(out.contains("$.store_set($.get(s),"), "{out}");
}

/// CONTROL — a `const` store is not a source, so upstream reads it bare. A fix
/// that answers `$.get(...)` for every store breaks this row.
#[test]
fn a_const_store_is_still_read_by_its_bare_name() {
    let out = client(&format!(
        "{IMPORT}\tconst s = writable({{}});\n\t$: $s.a = 1;"
    ));
    assert!(
        out.contains("$.store_mutate(s, $.untrack($s).a = 1, $.untrack($s));"),
        "{out}"
    );
}

/// CONTROL — a prop-bound store keeps the getter call. This is the one arm the
/// port already had, and it must not regress.
#[test]
fn a_prop_store_is_still_read_as_a_getter_call() {
    let out = client("\texport let s;\n\t$: $s.a = 1;");
    assert!(
        out.contains("$.store_mutate(s(), $.untrack($s).a = 1, $.untrack($s));"),
        "{out}"
    );
}

/// A computed-index mutation reaches the same builder, so the arm cannot be
/// keyed on the static-member shape.
#[test]
fn a_computed_index_mutation_reads_the_source_the_same_way() {
    let out = client(&format!(
        "{IMPORT}\tlet s = writable([]);\n\ts = writable([1]);\n\t$: $s[0] = 1;"
    ));
    assert!(out.contains("$.store_mutate($.get(s),"), "{out}");
}

/// An update expression is the third syntactic form the same builder serves.
#[test]
fn an_update_expression_reads_the_source_the_same_way() {
    let out = client(&format!(
        "{IMPORT}\tlet s = writable({{ a: 0 }});\n\ts = writable({{ a: 1 }});\n\t$: $s.a++;"
    ));
    assert!(out.contains("$.store_mutate($.get(s),"), "{out}");
}
