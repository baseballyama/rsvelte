//! Official svelte2tsx never looks past `value[0]` of a slot-name attribute, so
//! an interpolated `name="a{b}c"` / `slot="a{b}c"` is decided by its FIRST value
//! part alone (#2100). Three sibling paths read that value with two different
//! rules, and rsvelte used to apply a third (concatenate every `Text` part):
//!
//! * `slot.ts`'s `nameAttr.value[0].raw` — the `slots: { … }` type key and the
//!   `$$slots` declaration built from the same map;
//! * `svelteAst.ts`'s `getSlotName` (`value[0].raw`) — the slot a child's `let:`
//!   bindings are typed against;
//! * `Attribute.ts`'s `attributeValueIsOfType(value, 'Text')` (a SINGLE `Text`
//!   part) — whether `slot=` lowers to a `$$slot_def[…]` wrapper at all.
//!
//! Every expectation below was taken from official svelte2tsx (svelte 5.56.8).

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn tsx(source: &str) -> String {
    svelte2tsx(source, Svelte2TsxOptions::default())
        .expect("project")
        .code
}

// --- `slots: { … }` type key + `$$slots` (official `nameAttr.value[0].raw`) ---

#[test]
fn slots_type_key_uses_the_first_value_part() {
    let code = tsx("<script>let b = 'x';</script>\n<slot name=\"a{b}c\" />");
    assert!(code.contains("slots: {'a': {}}"), "{code}");
}

#[test]
fn slots_type_key_is_undefined_when_the_first_value_part_is_an_expression() {
    for source in [
        "<script>let n = 'x';</script>\n<slot name={n} />",
        "<script>let b = 'x';</script>\n<slot name=\"{b}c\" />",
    ] {
        let code = tsx(source);
        assert!(code.contains("slots: {'undefined': {}}"), "{code}");
    }
}

#[test]
fn dollar_slots_shares_the_slots_type_keys() {
    let code = tsx("<script>let b = 'x';\n$$slots;</script>\n<slot name=\"a{b}c\" />");
    assert!(
        code.contains("let $$slots = __sveltets_2_slotsType({'a': ''});"),
        "{code}"
    );

    let code = tsx("<script>let n = 'x';\n$$slots;</script>\n<slot name={n} />");
    assert!(
        code.contains("let $$slots = __sveltets_2_slotsType({'undefined': ''});"),
        "{code}"
    );
}

#[test]
fn two_slots_sharing_a_first_value_part_collapse_to_one_key() {
    let code = tsx(
        "<script>let b='x';\n$$slots;</script>\n<slot name=\"a{b}c\" /><slot name=\"a{b}d\" />",
    );
    assert!(
        code.contains("let $$slots = __sveltets_2_slotsType({'a': ''});"),
        "{code}"
    );
}

/// Official reads `value[0].raw` unconditionally, so a boolean `<slot name>`
/// throws and `<slot name="">` emits a syntactically broken
/// `__sveltets_createSlot(, …)`. rsvelte keeps its `default` fallback there
/// rather than reproducing broken output — the same call this file's sibling
/// `get_slot_name` already makes.
#[test]
fn degenerate_slot_names_stay_on_the_default_fallback() {
    for source in ["<slot name />", "<slot name=\"\" />"] {
        let code = tsx(source);
        assert!(
            code.contains("__sveltets_createSlot(\"default\","),
            "{code}"
        );
        assert!(code.contains("slots: {'default': {}}"), "{code}");
    }
}

// --- `slot=` lowering (official `attributeValueIsOfType(value, 'Text')`) ---

#[test]
fn interpolated_slot_attribute_is_a_plain_attribute_not_a_named_slot() {
    let code = tsx(
        "<script>import Comp from './C.svelte'; let b='x';</script>\n<Comp><div slot=\"a{b}c\">hi</div></Comp>",
    );
    assert!(!code.contains("$$slot_def"), "{code}");
    assert!(
        code.contains("svelteHTML.createElement(\"div\", { \"slot\":`a${b}c`,});"),
        "{code}"
    );
}

#[test]
fn interpolated_slot_attribute_on_a_slot_element_keeps_the_slot_prop() {
    let code = tsx(
        "<script>import Comp from './C.svelte'; let b='x';</script>\n<Comp><slot slot=\"a{b}c\" /></Comp>",
    );
    assert!(!code.contains("$$slot_def"), "{code}");
    assert!(
        code.contains("__sveltets_createSlot(\"default\", {  \"slot\":`a${b}c`,});"),
        "{code}"
    );
}

#[test]
fn dynamic_slot_attribute_on_a_slot_element_keeps_the_slot_prop() {
    let code = tsx(
        "<script>import Comp from './C.svelte'; let n='x';</script>\n<Comp><slot slot={n} /></Comp>",
    );
    assert!(!code.contains("$$slot_def"), "{code}");
    assert!(
        code.contains("__sveltets_createSlot(\"default\", {  \"slot\":n,});"),
        "{code}"
    );
}

/// An unforwarded `slot=` is an ordinary slot prop: outside a component nothing
/// consumes it, so even a plain static value survives.
#[test]
fn slot_attribute_outside_a_component_stays_a_slot_prop() {
    let code = tsx("<slot slot=\"a\" />");
    assert!(
        code.contains("__sveltets_createSlot(\"default\", {  \"slot\":`a`,});"),
        "{code}"
    );
    assert!(code.contains("slots: {'default': {slot:\"a\"}}"), "{code}");
}

/// A single EMPTY `Text` part still satisfies official's rule, so `slot=""`
/// really does target the `""` slot.
#[test]
fn empty_slot_attribute_is_still_a_named_slot() {
    let code =
        tsx("<script>import Comp from './C.svelte';</script>\n<Comp><div slot=\"\">x</div></Comp>");
    assert!(code.contains("$$_pmoC0.$$slot_def[\"\"];"), "{code}");
}

#[test]
fn interpolated_slot_attribute_keeps_lets_on_the_default_slot_block() {
    let code = tsx(
        "<script>import Comp from './C.svelte'; let b='x';</script>\n<Comp><div slot=\"a{b}c\" let:x>{x}</div></Comp>",
    );
    assert!(code.contains("$$_pmoC0.$$slot_def.default;"), "{code}");
    assert!(!code.contains("$$slot_def[\"ac\"]"), "{code}");
}

// --- `let:` scope resolution (official `getSlotName`'s `value[0].raw`) ---

/// The laxer of the two `slot=` rules: the JSX block above stays on the default
/// slot, yet the same child's `let:x` is typed against slot `a`. (Official spells
/// the index with single quotes here; that quoting difference is tracked apart
/// from this rule.)
#[test]
fn let_bindings_of_an_interpolated_slot_child_resolve_against_the_first_part() {
    let code = tsx(
        "<script>import Comp from './C.svelte'; let b='x';</script>\n<Comp><div slot=\"a{b}c\" let:x><slot name=\"s\" p={x} /></div></Comp>",
    );
    assert!(
        code.contains("p:__sveltets_2_instanceOf(Comp).$$slot_def[\"a\"].x"),
        "{code}"
    );
}

#[test]
fn let_bindings_of_a_dynamic_slot_child_resolve_to_nothing() {
    let code = tsx(
        "<script>import Comp from './C.svelte'; let n='x';</script>\n<Comp><div slot={n} let:x><slot name=\"s\" p={x} /></div></Comp>",
    );
    assert!(code.contains("slots: {'s': {p:x}}"), "{code}");
}
