//! `$$slots` key order follows the children, not a seeded `default`.
//!
//! Upstream keys one `children` record by slot name while walking the
//! component's children and later emits `Object.keys(children)`, so the object
//! is ordered by the position at which each slot name is *first seen*. The
//! server port seeded `default` before walking, so `default` always led.
//!
//! Object key order is observable JS, so this is an output divergence rather
//! than a formatting one. Every expectation below is the official compiler's
//! own output for the same source, measured one compiler process per case on
//! all four targets (the four agree on every row, which is why the helper
//! asserts it rather than picking one).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The top-level keys of the `$$slots: { … }` object literal, in source order.
fn slot_keys_of(out: &str) -> Option<Vec<String>> {
    let at = out.find("$$slots: {")?;
    let bytes: Vec<char> = out[at + "$$slots: ".len()..].chars().collect();
    let mut keys = Vec::new();
    let mut depth = 0i32;
    let mut i = 0usize;
    while i < bytes.len() {
        let c = bytes[i];
        match c {
            '{' | '(' | '[' => depth += 1,
            '}' | ')' | ']' => {
                depth -= 1;
                if depth == 0 {
                    break;
                }
            }
            '`' | '"' | '\'' => {
                i += 1;
                while i < bytes.len() && bytes[i] != c {
                    i += if bytes[i] == '\\' { 2 } else { 1 };
                }
            }
            _ if depth == 1 && (c.is_alphabetic() || c == '_' || c == '$') => {
                let start = i;
                while i < bytes.len()
                    && (bytes[i].is_alphanumeric() || bytes[i] == '_' || bytes[i] == '$')
                {
                    i += 1;
                }
                let name: String = bytes[start..i].iter().collect();
                let mut j = i;
                while j < bytes.len() && bytes[j].is_whitespace() {
                    j += 1;
                }
                if bytes.get(j) == Some(&':') {
                    keys.push(name);
                }
                continue;
            }
            _ => {}
        }
        i += 1;
    }
    Some(keys)
}

/// Compiles on all four targets and asserts they agree before returning the
/// key order, so a target-dependent answer fails instead of being averaged away.
fn slot_keys(body: &str) -> Vec<String> {
    let src = format!("<script>\n\tlet {{ C, n }} = $props();\n</script>\n\n{body}\n");
    let mut agreed: Option<Vec<String>> = None;
    for (generate, dev) in [
        (GenerateMode::Server, false),
        (GenerateMode::Server, true),
        (GenerateMode::Client, false),
        (GenerateMode::Client, true),
    ] {
        let out = code(&src, generate, dev);
        let keys = slot_keys_of(&out)
            .unwrap_or_else(|| panic!("no `$$slots` in {generate:?} dev={dev} output:\n{out}"));
        match &agreed {
            None => agreed = Some(keys),
            Some(first) => assert_eq!(
                first, &keys,
                "targets disagree on `$$slots` order for `{body}`"
            ),
        }
    }
    agreed.unwrap()
}

fn assert_order(body: &str, expected: &[&str]) {
    assert_eq!(slot_keys(body), expected, "`$$slots` order for `{body}`");
}

/// The issue's repro: a named slot written before the default content.
#[test]
fn a_named_slot_before_the_default_content_comes_first() {
    assert_order(
        "<C><b slot=\"named\">{n}</b><i>{n}</i></C>",
        &["named", "default"],
    );
}

/// The control in the other direction — this shape was already correct, so a
/// fix that merely moved `default` to the end would break it.
#[test]
fn default_content_before_a_named_slot_still_comes_first() {
    assert_order(
        "<C><i>{n}</i><b slot=\"named\">{n}</b></C>",
        &["default", "named"],
    );
}

/// `default` is not pinned to either end: it takes the position of the first
/// child that has no `slot` attribute.
#[test]
fn default_takes_its_position_among_the_named_slots() {
    assert_order(
        "<C><b slot=\"a\">{n}</b><i>{n}</i><u slot=\"z\">{n}</u></C>",
        &["a", "default", "z"],
    );
}

/// Named slots keep their own relative order too, which alphabetical or
/// sorted-map storage would silently normalise away.
#[test]
fn named_slots_keep_the_order_they_appear_in() {
    assert_order(
        "<C><b slot=\"z\">{n}</b><u slot=\"m\">{n}</u><s slot=\"a\">{n}</s></C>",
        &["z", "m", "a"],
    );
}

/// A `{#snippet}` child is lifted into a prop before the slots are assembled,
/// so it leads regardless of where it sits among the children — measured
/// identical for a snippet written first, in the middle and last.
#[test]
fn a_snippet_leads_from_any_position_among_the_children() {
    for body in [
        "<C>{#snippet s(v)}<b>{v}</b>{/snippet}<u slot=\"z\">{n}</u><i>{n}</i></C>",
        "<C><u slot=\"z\">{n}</u>{#snippet s(v)}<b>{v}</b>{/snippet}<i>{n}</i></C>",
        "<C><u slot=\"z\">{n}</u><i>{n}</i>{#snippet s(v)}<b>{v}</b>{/snippet}</C>",
    ] {
        assert_order(body, &["s", "z", "default"]);
    }
}

/// Two snippets keep their source order — the same "not sorted" check one level
/// down, on the path that never reaches the slot map.
#[test]
fn snippets_keep_the_order_they_appear_in() {
    assert_order(
        "<C>{#snippet z(v)}<b>{v}</b>{/snippet}{#snippet a(v)}<b>{v}</b>{/snippet}</C>",
        &["z", "a"],
    );
}

/// The four container / child shapes that reach different arms of the slot
/// builder — an explicit `slot="default"`, a `let:` on the named slot, a `let:`
/// on the default one, and `<svelte:fragment>` — all order the same way.
#[test]
fn every_slot_builder_arm_orders_by_the_children() {
    for body in [
        "<C><b slot=\"named\">{n}</b><i slot=\"default\">{n}</i></C>",
        "<C><b slot=\"named\" let:v>{v}</b><i>{n}</i></C>",
        "<C><b slot=\"named\">{n}</b><svelte:fragment let:v>{v}</svelte:fragment></C>",
        "<C><svelte:fragment slot=\"named\">{n}</svelte:fragment><i>{n}</i></C>",
    ] {
        assert_order(body, &["named", "default"]);
    }
}

/// A comment between the children is not a slot and does not take a position.
#[test]
fn a_comment_between_the_children_does_not_take_a_position() {
    assert_order(
        "<C><b slot=\"named\">{n}</b><!-- c --><i>{n}</i></C>",
        &["named", "default"],
    );
}

/// `<svelte:component>` reaches the same builder as `<C>`.
#[test]
fn svelte_component_orders_by_the_children_too() {
    assert_order(
        "<svelte:component this={C}><b slot=\"named\">{n}</b><i>{n}</i></svelte:component>",
        &["named", "default"],
    );
}

/// A single slot of either kind is the shape every earlier test used, and is
/// the reason this survived: with one entry the order cannot be wrong.
#[test]
fn a_lone_slot_of_either_kind_is_unaffected() {
    assert_order("<C><b slot=\"named\">{n}</b></C>", &["named"]);
    assert_order("<C><i>{n}</i></C>", &["default"]);
}
