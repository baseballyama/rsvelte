//! A `$`-prefixed class member NAME is a declaration slot, never a reference,
//! so upstream's `module.scope.references` — the set both the store-subscription
//! loop and runes-mode auto-detection read — never holds it. rsvelte reached the
//! same names through a lexical scan and rejected `class P { $abc() {} }` with
//! `global_reference_invalid`, while `$inspect` as a member name flipped the
//! component into runes mode.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn client(src: &str) -> String {
    compile_to(src, GenerateMode::Client)
}

fn server(src: &str) -> String {
    compile_to(src, GenerateMode::Server)
}

const MEMBERS: &str = "<script>\n\tclass Probe {\n\t\t$inspect = 1;\n\t\tstatic $inspect = 2;\n\t\tstatic {\n\t\t\tvoid Probe.$inspect;\n\t\t}\n\t\t$inspect2() {\n\t\t\treturn 3;\n\t\t}\n\t\tget $inspect_() {\n\t\t\treturn 4;\n\t\t}\n\t}\n\tvoid new Probe();\n</script>\n<p>class members</p>\n";

/// The official compiler accepts this; a member name is not a `$` reference.
#[test]
fn dollar_prefixed_class_members_are_not_store_references() {
    for out in [client(MEMBERS), server(MEMBERS)] {
        assert!(!out.contains("COMPILE_ERROR"), "{out}");
        assert!(
            !out.contains("store_get"),
            "member name became a store: {out}"
        );
    }
}

/// Runes-mode auto-detection reads the same set, so a `$inspect` member name
/// must leave the component in legacy mode.
#[test]
fn dollar_prefixed_class_members_do_not_turn_on_runes_mode() {
    let out = client(MEMBERS);
    assert!(out.contains("svelte/internal/flags/legacy"), "{out}");
    assert!(out.contains("$.push($$props, false)"), "{out}");
}

/// A generator, a private field, a static block, an `async` method and a
/// `;`-terminated bare field all name members rather than reading stores.
#[test]
fn every_member_shape_keeps_its_dollar_name() {
    let out = client(
        "<script>\n\tclass C {\n\t\t*$gen() { yield 1; }\n\t\t#priv = 1;\n\t\tstatic { void 0; }\n\t\tasync $am() { return 1; }\n\t\t$bare;\n\t}\n\tlet c = new C();\n</script>\n<p>{c}</p>",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(!out.contains("store_get"), "{out}");
}

/// A field whose value ends without a `;` is terminated by ASI, so the next
/// member's name is still a name. The value's last token is what says so — a
/// literal, a `]` and a call's `)` each end it, while `new` does not.
#[test]
fn a_semicolon_free_field_still_ends_before_the_next_member() {
    let out = client(
        "<script>\n\tclass P {\n\t\ta = 1\n\t\t$one() { return 1; }\n\t\tb = [1, 2]\n\t\t$two() { return 2; }\n\t\tc = new Set()\n\t\t$three() { return 3; }\n\t}\n\tvoid new P();\n</script>\n<p>asi</p>",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(!out.contains("store_get"), "{out}");
}

/// The opposite direction of the same rule: a token an expression continues
/// through must keep the identifier after it a reference, or a real store
/// subscription is silently dropped.
#[test]
fn a_value_continuing_into_the_next_line_still_reads_its_store() {
    let out = client(
        "<script>\n\timport { writable } from 'svelte/store';\n\tconst count = writable(0);\n\tclass P {\n\t\ta =\n\t\t\t$count;\n\t\tb = 1 +\n\t\t\t$count;\n\t\tc = [1][0] || $count;\n\t\td = [$count][0];\n\t}\n\tlet p = new P();\n</script>\n<p>{p.a}</p>",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert_eq!(
        out.matches("$.store_get(count, '$count'").count(),
        1,
        "the store getter must still be declared: {out}"
    );
}

/// The other half of the check: a class FIELD INITIALIZER and a COMPUTED key
/// are ordinary expressions, so a store read there must still subscribe.
#[test]
fn a_class_field_initializer_still_reads_its_store() {
    let out = client(
        "<script>\n\timport { writable } from 'svelte/store';\n\tconst count = writable(0);\n\tclass C {\n\t\tx = $count;\n\t\t$abc() { return 1; }\n\t}\n\tlet c = new C();\n</script>\n<p>{c.x}</p>",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.store_get(count, '$count'"),
        "field initializer lost its store subscription: {out}"
    );
}

/// The class-header scan must not mistake a `class` property key for a class
/// declaration, which would swallow the following block's references.
#[test]
fn a_class_property_key_does_not_open_a_class_body() {
    let out = client(
        "<script>\n\timport { writable } from 'svelte/store';\n\tconst count = writable(0);\n\tconst o = { class: 1 };\n\tfunction f() {\n\t\t{ $count; }\n\t\treturn $count;\n\t}\n</script>\n<p>{f()}{o.class}</p>",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.store_get(count, '$count'"),
        "a `class` object key swallowed the block's store reference: {out}"
    );
}
