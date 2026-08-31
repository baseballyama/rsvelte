//! A `$:` statement's text span, and the line collapse that runs over its body.
//!
//! Both defects below produced output that is not JavaScript on real corpus
//! sources (huly's `ModernEditbox`, `NavigatorCardsSection`, threlte's
//! `Sequence`), and both are invisible to a gate that only asks whether the two
//! compilers agree on a *parsed* shape: one emits a statement cut in half, the
//! other comments the rest of an object literal out.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// A brace nested inside a `$:` statement — an object-literal argument or an
/// arrow body — is not the statement's own block. Treating it as one ran the
/// statement's end past every following statement, and the comment-rehoming
/// pass then re-inserted a leading comment in the middle of one of them.
#[test]
fn a_nested_brace_does_not_extend_the_reactive_statement() {
    for body in [
        "$: translate(label, {}, str)",
        "$: translate(label, (r) => {\n    str = r\n  })",
    ] {
        let out = client(&format!(
            "<script>\n  export let label = ''\n  let str = ''\n  {body}\n\n  // C\n  export let focusIndex = -1\n  const {{ idx }} = registerFocus(focusIndex, {{ a: 1 }})\n\n  $: if (idx) {{\n    str = 'x'\n  }}\n</script>\n<b>{{str}}{{idx}}{{focusIndex}}</b>\n"
        ));
        assert!(!out.contains("COMPILE_ERROR"), "{body}\n{out}");
        // The declaration must survive whole, with its initializer attached.
        assert!(
            out.contains("const { idx } = registerFocus(focusIndex(), { a: 1 });"),
            "{body}\n{out}"
        );
        // The comment belongs above the prop it leads, not inside a later
        // statement.
        assert!(
            out.contains("// C\n\tlet focusIndex = $.prop($$props, 'focusIndex', 24, () => -1);"),
            "{body}\n{out}"
        );
    }
}

/// The chain-continuation collapse joins a line starting with `.` onto the one
/// above. A `...` spread also starts with `.`, and joining it onto a line that
/// ends in a `//` comment moves it inside the comment.
#[test]
fn a_spread_line_is_not_collapsed_onto_a_comment() {
    let out = client(
        "<script>\n  export let cardIds = []\n  let a = 1\n  $: if (cardIds.length > 0) {\n    query({\n      // keep me\n      ...(a ? {} : { b: 1 }),\n      ...(a ? { d: 2 } : {})\n    })\n  }\n</script>\n<b>{cardIds}{a}</b>\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(!out.contains("// keep me..."), "{out}");
    assert!(out.contains("...a ? {} : { b: 1 }"), "{out}");
    assert!(out.contains("...a ? { d: 2 } : {}"), "{out}");
}

/// The collapse still has to do its job: a real `.method()` continuation is
/// joined, which is what makes the assignment detection downstream see one
/// expression.
#[test]
fn a_method_chain_continuation_is_still_collapsed() {
    let out = client(
        "<script>\n  export let count = 0\n  $: ids = new Array(count)\n    .fill(null)\n    .map((_, i) => 'id-' + i)\n</script>\n<b>{ids}</b>\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("$.set(ids, new Array(count()).fill(null).map((_, i) => 'id-' + i));"),
        "{out}"
    );
}
