//! A dotted component tag name is transformed as a whole member expression.
//!
//! Upstream lowers a component's tag name with
//! `context.visit(b.member_id(component_name))` — it visits the whole chain, not
//! its root. That matters because the rest-prop read rule lives in the
//! `Identifier` visitor and is keyed on the PARENT:
//!
//! ```js
//! // 3-transform/client/visitors/Identifier.js
//! if (parent?.type === 'MemberExpression' && !parent.computed && …) {
//!     if (!binding.metadata?.exclude_props?.includes(key.name)) return b.id('$$props');
//! }
//! ```
//!
//! rsvelte transformed the root identifier alone and re-appended the properties,
//! so the rule never saw a parent and `<rest.Sub />` stayed `rest.Sub` where
//! official emits `$$props.Sub` — while `{rest.Sub}` in the same file was already
//! correct, because the template path walks a member expression it parsed.
//!
//! The three assertions below are one axis each, and the second is the one that
//! keeps the fix honest: `keep` is destructured out of the rest, so it sits in
//! `exclude_props` and must NOT be rewritten. A test asserting only that
//! `$$props.` appears is satisfied by a blanket rewrite that breaks it.

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

const SRC: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/4088-dotted-component-tag-read-transform.svelte"
);

fn out(generate: GenerateMode, dev: bool) -> String {
    compile(
        SRC,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn a_dotted_tag_name_rooted_at_a_rest_prop_reads_through_props() {
    for (label, dev) in [("client", false), ("client-dev", true)] {
        let code = out(GenerateMode::Client, dev);
        assert!(!code.contains("COMPILE_ERROR"), "{label}: {code}");

        // One property deep, nested, and inside an `{#each}` body.
        for expected in [
            "() => $$props.component",
            "() => $$props.a.b",
            "() => $$props.Sub",
        ] {
            assert!(
                code.contains(expected),
                "{label}: a dotted tag name did not read through `$$props` — \
                 `{expected}` is missing:\n{code}"
            );
        }
        for unexpected in ["() => rest.component", "() => rest.a.b", "() => rest.Sub"] {
            assert!(
                !code.contains(unexpected),
                "{label}: the tag name kept its untransformed root — \
                 `{unexpected}` should not exist:\n{code}"
            );
        }
    }
}

#[test]
fn a_property_excluded_from_the_rest_is_not_rewritten() {
    // `keep` is destructured, so it is in the binding's `exclude_props` and
    // `$$props.keep` would read a value the rest object does not carry.
    for (label, dev) in [("client", false), ("client-dev", true)] {
        let code = out(GenerateMode::Client, dev);
        assert!(
            code.contains("() => rest.keep"),
            "{label}: an excluded property was rewritten:\n{code}"
        );
    }
}

#[test]
fn the_other_root_kinds_and_the_server_do_not_move() {
    // Controls. A `$state` object, a nested one and a plain `const` reach the
    // same builder and must keep their own spelling; the server never applies
    // this rule at all.
    for (label, dev) in [("client", false), ("client-dev", true)] {
        let code = out(GenerateMode::Client, dev);
        for expected in ["() => state.Sub", "() => state.deep.Sub", "() => plain.Sub"] {
            assert!(
                code.contains(expected),
                "{label}: a non-prop root moved — `{expected}` is missing:\n{code}"
            );
        }
    }

    let server = out(GenerateMode::Server, false);
    assert!(!server.contains("COMPILE_ERROR"), "server: {server}");
    assert!(
        !server.contains("$$props.component") && !server.contains("$$props.Sub"),
        "server: the client-only rest-prop read rule leaked into SSR:\n{server}"
    );
    assert!(
        server.contains("rest.component(") && server.contains("rest.Sub("),
        "server: the tag name lost its own spelling:\n{server}"
    );
}
