//! Upstream exempts the dev `$.assign` wrap for an assignment that is the
//! **direct body of the arrow that is an event attribute's expression**, on a
//! `RegularElement` or a `SvelteElement` and nowhere else
//! (`AssignmentExpression.js:182-201`, whose third conjunct is the identity test
//! `expression === context.path.at(-1)`).
//!
//! rsvelte expressed that with a boolean plus a depth counter, which cannot say
//! *which* arrow, and set the boolean from two places with different rules. That
//! produced three divergences in both directions at once.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `object.property` for every `$.assign*` call in dev client output, sorted.
fn assigns(src: &str) -> Vec<String> {
    let js = compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let mut found = Vec::new();
    let mut rest = js.as_str();
    while let Some(i) = rest.find("$.assign") {
        rest = &rest[i..];
        let open = rest.find('(').map(|p| p + 1).unwrap_or(rest.len());
        let seg: String = rest[open..].chars().take(40).collect();
        let mut parts = seg.splitn(3, ',');
        if let (Some(obj), Some(prop)) = (parts.next(), parts.next()) {
            found.push(format!(
                "{}.{}",
                obj.trim(),
                prop.trim().trim_matches(['\'', '"'])
            ));
        }
        rest = &rest[open..];
    }
    found.sort();
    found
}

/// `obj` is deliberately non-primitive: upstream's `should_transform` requires
/// `!scope.evaluate(right).is_primitive`, so a literal RHS makes every case
/// below silent on both compilers and the comparison proves nothing.
const HEAD: &str = "<script>let o = $state({}), c = $state({}), tag = \"div\";\n\
                    let obj = {};\n\
                    function f(g) { return g; }</script>\n";

fn src(body: &str) -> String {
    format!("{HEAD}{body}")
}

/// Positive control. Without it, "no `$.assign`" is unreadable — every
/// assertion below would also hold if the wrap were never emitted at all.
#[test]
fn assignment_outside_a_handler_arrow_is_still_wrapped() {
    assert_eq!(
        assigns(&src("<button onclick={() => { f(o.x = obj); }}>y</button>")),
        ["o.x"]
    );
}

/// Pin: the case the exemption exists for.
#[test]
fn regular_element_handler_arrow_body_is_exempt() {
    assert!(assigns(&src("<button onclick={() => (o.x = obj)}>y</button>")).is_empty());
}

/// Under-reach. `<svelte:element>` is in upstream's list; rsvelte routed its
/// event attributes through `build_attribute_effect`, never through the
/// visitor that grants the exemption.
#[test]
fn svelte_element_handler_arrow_body_is_exempt() {
    let out = assigns(&src(
        "<svelte:element this={tag} onclick={() => (o.x = obj)}>y</svelte:element>",
    ));
    assert!(out.is_empty(), "expected no wrap, got {out:?}");
}

/// Over-reach. The exemption belongs to the attribute's own arrow; a nested
/// arrow is a different node, and upstream's `path.at(-2)` is the call rather
/// than the element there.
#[test]
fn nested_arrow_inside_a_handler_is_not_exempt() {
    assert_eq!(
        assigns(&src(
            "<button onclick={() => (o.x = f(() => (c.d = obj)))}>y</button>"
        )),
        ["c.d"]
    );
}

/// Both directions in one input: the outer body must stay exempt while the
/// nested one is wrapped, on an element that was not routed at all.
#[test]
fn svelte_element_exempts_only_its_own_handler_arrow() {
    assert_eq!(
        assigns(&src(
            "<svelte:element this={tag} onclick={() => (o.x = f(() => (c.d = obj)))}>y</svelte:element>"
        )),
        ["c.d"]
    );
}

/// Over-reach the epic did not name. Upstream's special case lists exactly
/// `RegularElement` and `SvelteElement`, so `<svelte:window>` and friends are
/// never exempt — but rsvelte set the flag unconditionally for them, without
/// even checking the expression is an arrow.
#[test]
fn special_elements_are_never_exempt() {
    for tag in ["svelte:window", "svelte:document", "svelte:body"] {
        let out = assigns(&src(&format!("<{tag} onclick={{() => (o.x = obj)}} />")));
        assert_eq!(out, ["o.x"], "`<{tag}>` must not be exempt");
    }
}

/// Pin: an `on:` **directive** is not an event attribute, so upstream never
/// exempts it. This is the boundary the fix must not widen.
#[test]
fn on_directive_is_not_exempt() {
    assert_eq!(
        assigns(&src("<button on:click={() => (o.x = obj)}>y</button>")),
        ["o.x"]
    );
}
