//! An attribute-free custom element does not make its ancestors dynamic.
//!
//! A custom element takes its attributes through properties, so upstream marks
//! the ancestor fragments dynamic for one — but only when it HAS an attribute:
//!
//! ```js
//! // 2-analyze/visitors/RegularElement.js
//! if (is_custom_element_node(node) && node.attributes.length > 0) {
//!     mark_subtree_dynamic(context.path);
//! }
//! ```
//!
//! rsvelte's `has_dynamic_children` — which stands in for `metadata.dynamic`
//! when deciding whether a PARENT is static — dropped the `attributes.length`
//! half, so a bare `<media-a></media-a>` made every ancestor traverse and the
//! component emitted `$.child` / `$.sibling` / `$.reset` chains that official
//! replaces with nothing at all. That is the same mistake
//! `has_dynamic_children_for_merge` already records next door: a predicate about
//! the node itself used to decide about its parent.
//!
//! The element's OWN `is_static_element` is a different question and upstream
//! gates it on no attribute count, so that check must stay unconditional.
//!
//! Both directions are asserted. A test that only checked for the absence of a
//! traversal is satisfied by never traversing, which would break every custom
//! element that does carry an attribute — so the attribute-bearing forms are
//! asserted to keep theirs.

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

const SRC: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/custom-element-parent-traversal.svelte"
);

fn client(dev: bool) -> String {
    compile(
        SRC,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn an_attribute_free_custom_element_leaves_its_ancestors_static() {
    for (label, dev) in [("client", false), ("client-dev", true)] {
        let out = client(dev);
        assert!(!out.contains("COMPILE_ERROR"), "{label}: {out}");

        // `media-a`, `media-e` and `media-f` carry no attribute, so nothing is
        // applied to them at runtime and no ancestor needs a node reference.
        for name in ["media_a", "media_e", "media_f"] {
            assert!(
                !out.contains(&format!("var {name}")),
                "{label}: an attribute-free custom element made its ancestors \
                 traverse — `var {name}` should not exist:\n{out}"
            );
        }
    }
}

#[test]
fn a_custom_element_with_an_attribute_still_makes_its_ancestors_dynamic() {
    // The control that stops the fix from becoming "never traverse". Each of
    // these reaches the rule by a different route: a dashed name with a static
    // attribute, the `is=` spelling on a plain tag name, and an attribute-free
    // custom element whose fragment is dynamic on its own account.
    for (label, dev) in [("client", false), ("client-dev", true)] {
        let out = client(dev);
        assert!(!out.contains("COMPILE_ERROR"), "{label}: {out}");

        for name in ["media_b", "button", "media_d"] {
            assert!(
                out.contains(&format!("var {name}")),
                "{label}: a custom element that needs runtime work lost its \
                 node reference — `var {name}` is missing:\n{out}"
            );
        }
    }
}

#[test]
fn the_server_target_is_unaffected() {
    // The server builds no traversal at all, so it is the axis that must not
    // move in either direction.
    let out = compile(
        SRC,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Server,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"));

    assert!(!out.contains("COMPILE_ERROR"), "server: {out}");
    assert!(
        !out.contains("$.child(") && !out.contains("$.sibling("),
        "server: emitted a client traversal:\n{out}"
    );
    assert!(
        out.contains("<media-a></media-a>"),
        "server: the custom element is missing from the payload:\n{out}"
    );
}
