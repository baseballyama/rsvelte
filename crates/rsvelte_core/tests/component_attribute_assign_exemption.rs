//! Upstream's second dev `$.assign` special case is path-shaped
//! (`AssignmentExpression.js:204-215`): the exemption belongs to the expression a
//! `Component` / `<svelte:component>` / `bind:` directive visits *directly*, to an
//! arrow that **is** that expression, or to an arrow that is a direct element of a
//! getter/setter `SequenceExpression` under it — and to nothing else.
//!
//! rsvelte expressed that with two subtree booleans (`in_component_attribute`,
//! `in_bind_directive`), which say "somewhere inside" and cannot say "this exact
//! node". Every assertion below that names a wrap divergence was measured against
//! the official compiler at the same version.

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
/// `!scope.evaluate(right).is_primitive`, so a literal RHS makes every case below
/// silent on both compilers and the comparison proves nothing.
const HEAD: &str = "<script>import Comp from './Comp.svelte';\n\
                    let o = $state({}), c = $state({});\n\
                    let obj = {}, tag = 'div', C = Comp, g = () => {};\n\
                    function f(x) { return x; }</script>\n";

fn src(body: &str) -> String {
    format!("{HEAD}{body}")
}

/// Positive control. Without it, every "no `$.assign`" assertion below would also
/// hold if the wrap were never emitted at all.
#[test]
fn an_assignment_in_a_call_argument_is_still_wrapped() {
    assert_eq!(
        assigns(&src("<button onclick={() => { f(o.x = obj); }}>y</button>")),
        ["o.x"]
    );
}

/// Pins: the shapes the exemption exists for.
#[test]
fn a_component_attribute_arrow_body_is_exempt() {
    assert!(assigns(&src("<Comp prop={() => (o.x = obj)} />")).is_empty());
    assert!(assigns(&src("<Comp prop=\"{() => (o.x = obj)}\" />")).is_empty());
    assert!(assigns(&src("<Comp on:foo={() => (o.x = obj)} />")).is_empty());
    assert!(assigns(&src("<Comp bind:value={() => o.x, (v) => (o.y = obj)} />")).is_empty());
}

/// Over-reach. The arrow must **be** the attribute's expression; one nested in a
/// call is a different node and upstream's `path.at(-2)` is the call there.
#[test]
fn an_arrow_nested_in_a_component_attribute_is_not_exempt() {
    assert_eq!(
        assigns(&src("<Comp prop={f(() => (o.x = obj))} />")),
        ["o.x"]
    );
}

/// Over-reach, both directions in one input: the outer body stays exempt while
/// the arrow nested inside it is wrapped.
#[test]
fn a_component_attribute_exempts_only_its_own_arrow() {
    assert_eq!(
        assigns(&src("<Comp prop={() => (o.x = f(() => (c.d = obj)))} />")),
        ["c.d"]
    );
    assert_eq!(
        assigns(&src(
            "<Comp bind:value={() => o.x, (v) => (o.y = f(() => (c.d = obj)))} />"
        )),
        ["c.d"]
    );
}

/// Over-reach. Only a *direct* element of the sequence qualifies
/// (`path.at(-3)`); one sequence deeper puts `SequenceExpression` there.
#[test]
fn an_arrow_in_a_nested_sequence_is_not_exempt() {
    assert_eq!(
        assigns(&src("<Comp prop={(g, (h, () => (o.x = obj)))} />")),
        ["o.x"]
    );
}

/// Under-reach. `path.at(-1) === 'Component' | 'SvelteComponent'` exempts the
/// assignment itself, with no arrow involved.
#[test]
fn an_assignment_that_is_the_attribute_expression_is_exempt() {
    assert!(assigns(&src("<Comp prop={(o.x = obj)} />")).is_empty());
    assert!(assigns(&src("<svelte:component this={C} prop={(o.x = obj)} />")).is_empty());
}

/// Over-reach. Upstream's arrow arm names `Component`, never `SvelteComponent`
/// or `SvelteSelf`, so a lone arrow on those keeps the wrap.
#[test]
fn a_lone_arrow_on_svelte_component_or_svelte_self_is_not_exempt() {
    assert_eq!(
        assigns(&src(
            "<svelte:component this={C} prop={() => (o.x = obj)} />"
        )),
        ["o.x"]
    );
    assert_eq!(
        assigns(&src(
            "{#if obj}<svelte:self prop={() => (o.x = obj)} />{/if}"
        )),
        ["o.x"]
    );
}

/// Over-reach. `SvelteSelf` is absent from the `SequenceExpression` arm too,
/// where `SvelteComponent` is present.
#[test]
fn a_getter_setter_pair_on_svelte_self_is_not_exempt() {
    assert_eq!(
        assigns(&src(
            "{#if obj}<svelte:self bind:value={() => o.x, (v) => (o.y = obj)} />{/if}"
        )),
        ["o.y"]
    );
    assert!(
        assigns(&src(
            "<svelte:component this={C} bind:value={() => o.x, (v) => (o.y = obj)} />"
        ))
        .is_empty()
    );
}

/// Under-reach. On an element the `BindDirective` node stays on the path and
/// grants the exemption itself — rsvelte only ever set its flag for components.
#[test]
fn an_element_bind_setter_is_exempt() {
    for body in [
        "<input bind:value={() => o.y, (v) => (o.y = obj)} />",
        "<svelte:window bind:scrollY={() => o.y, (v) => (o.y = obj)} />",
        "<svelte:element this={tag} bind:clientWidth={() => o.y, (v) => (o.y = obj)}></svelte:element>",
    ] {
        let out = assigns(&src(body));
        assert!(out.is_empty(), "expected no wrap for `{body}`, got {out:?}");
    }
}

/// Pin for the one conjunct the arrow arm adds, `path.at(-3) === 'Fragment'`: a
/// `RegularElement`'s children are the one container reached without a
/// `Fragment` node. The sequence arm has no such conjunct.
#[test]
fn a_component_inside_an_element_keeps_only_the_sequence_exemption() {
    assert_eq!(
        assigns(&src("<div><Comp prop={() => (o.x = obj)} /></div>")),
        ["o.x"]
    );
    assert!(
        assigns(&src(
            "<div><Comp bind:value={() => o.x, (v) => (o.y = obj)} /></div>"
        ))
        .is_empty()
    );
    assert!(
        assigns(&src(
            "<svelte:element this={tag}><Comp prop={() => (o.x = obj)} /></svelte:element>"
        ))
        .is_empty()
    );
}

/// Pin: upstream keeps the `SpreadAttribute` node on the path, so nothing under
/// a spread is exempt.
#[test]
fn a_spread_attribute_is_never_exempt() {
    assert_eq!(
        assigns(&src("<Comp {...{ prop: () => (o.x = obj) }} />")),
        ["o.x"]
    );
    assert_eq!(assigns(&src("<Comp {...(() => (o.x = obj))} />")), ["o.x"]);
}
