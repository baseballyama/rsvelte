//! An instance-script `import` is hoisted to module scope, but its leading
//! comments are NOT: upstream removes the node and lets esrap's cursor flush
//! them from the enclosing body, so they land on the next located node INSIDE
//! the component function.
//!
//! The SSR assembly placed the region on the hoisted import instead, which sent
//! the comments out of the component function — where the module-scope printer
//! never emitted them, so they vanished. `script.rs` said so in a comment
//! (\"replaying them in place would put them in the wrong function\") directly
//! above the code that did it.
//!
//! Every expectation below is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(body: &str) -> String {
    compile(
        body,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn a_comment_leading_a_hoisted_import_stays_in_the_component() {
    let out = server(
        "<script>\n\t// Icons\n\timport { onMount } from 'svelte';\n\n\tlet a = 1, b = 2;\n</script>\n\n{a}{b}\n",
    );
    assert!(out.contains("\tlet // Icons\n\ta = 1;"), "{out}");
}

/// Two imports, two comments: both stay, in source order, and neither is
/// attached to the import it led.
#[test]
fn every_such_comment_stays_and_keeps_its_order() {
    let out = server(
        "<script>\n\t// Icons\n\timport { onMount } from 'svelte';\n\t// @ts-ignore\n\timport { tick } from 'svelte';\n\n\tlet a = 1, b = 2;\n</script>\n\n{a}{b}\n",
    );
    assert!(
        out.contains("\tlet // Icons\n\t// @ts-ignore\n\ta = 1;"),
        "{out}"
    );
}

/// The next statement decides the SHAPE, not this rule: a single-declarator
/// declaration is not rebuilt, so the comment prints on its own line before it
/// rather than after the keyword.
#[test]
fn a_single_declarator_receives_it_before_the_keyword() {
    let out = server(
        "<script>\n\t// Icons\n\timport { onMount } from 'svelte';\n\n\tlet a = 1;\n</script>\n\n{a}\n",
    );
    assert!(out.contains("\t// Icons\n"), "{out}");
    assert!(!out.contains("let // Icons"), "{out}");
}

/// With no statement after it, the comment is flushed at the end of the body —
/// it must not be dropped for want of an anchor.
#[test]
fn a_trailing_import_still_leaves_its_comment_behind() {
    let out = server(
        "<script>\n\tlet a = 1;\n\t// Icons\n\timport { onMount } from 'svelte';\n</script>\n\n{a}\n",
    );
    assert!(out.contains("// Icons"), "{out}");
}

/// CONTROL — an uncommented import. The body must be unchanged, so a fix that
/// repairs the commented rows by disturbing the hoist is visible.
#[test]
fn an_uncommented_import_is_unchanged() {
    let out = server(
        "<script>\n\timport { onMount } from 'svelte';\n\n\tlet a = 1, b = 2;\n</script>\n\n{a}{b}\n",
    );
    assert!(out.contains("\tlet a = 1;"), "{out}");
    assert!(!out.contains("//"), "{out}");
}

/// CONTROL — the same comment leading a NON-import keeps the placement it
/// already had, which is what separates this rule from "every leading comment
/// moves".
#[test]
fn a_comment_leading_a_kept_statement_is_untouched() {
    let out = server(
        "<script>\n\timport { onMount } from 'svelte';\n\n\t// Props\n\tlet a = 1, b = 2;\n</script>\n\n{a}{b}\n",
    );
    assert!(out.contains("\tlet // Props\n\ta = 1;"), "{out}");
}
