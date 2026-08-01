//! Regression test: an instance-script `interface $$Slots` / `type $$Slots`
//! declaration overrides the computed `slots:` reflection (issue #2156).
//!
//! Official `createRenderFunction.ts` builds `slotsAsDef` as
//! `uses$$SlotsInterface ? '{} as unknown as $$Slots' : '{…computed…}'`, so the
//! user's own type is what the component export gets checked against. rsvelte
//! already threaded the flag into the `__sveltets_2_createCreateSlot<$$Slots>()`
//! binding but still emitted the computed literal in the return statement.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn run(src: &str) -> String {
    svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "Input.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .code
}

const INTERFACE_SRC: &str = r#"<script lang="ts">
    interface $$Slots {
        default: { a: number },
        foo: { b: number }
    }
    let b = 7;
</script>

<div>
    <slot a={b} />
    <slot name="foo" {b} />
</div>
"#;

const TYPE_ALIAS_SRC: &str = r#"<script lang="ts">
    type $$Slots = {
        default: { a: number },
        foo: { b: number }
    }
    let b = 7;
</script>

<div>
    <slot a={b} />
    <slot name="foo" {b} />
</div>
"#;

#[test]
fn interface_declaration_replaces_computed_slots() {
    let out = run(INTERFACE_SRC);
    assert!(
        out.contains("slots: {} as unknown as $$Slots"),
        "got:\n{out}"
    );
    assert!(!out.contains("'default': {a:b}"), "got:\n{out}");
    // The createSlot binding keeps its type argument so slot usage is checked
    // against the declaration too.
    assert!(
        out.contains("__sveltets_2_createCreateSlot<$$Slots>()"),
        "got:\n{out}"
    );
}

#[test]
fn type_alias_declaration_replaces_computed_slots() {
    let out = run(TYPE_ALIAS_SRC);
    assert!(
        out.contains("slots: {} as unknown as $$Slots"),
        "got:\n{out}"
    );
    assert!(!out.contains("'default': {a:b}"), "got:\n{out}");
}

/// Official applies the override from the declaration alone — no `<slot>` in the
/// template is required, because `slotsAsDef` is not gated on `slots.size`.
#[test]
fn declaration_without_any_slot_element_still_overrides() {
    let out = run(r#"<script lang="ts">
    interface $$Slots { default: { a: number } }
    let b = 7;
</script>

<div>hi</div>
"#);
    assert!(
        out.contains("slots: {} as unknown as $$Slots"),
        "got:\n{out}"
    );
}

/// Without the declaration the computed literal must be preserved verbatim.
#[test]
fn no_declaration_keeps_computed_slots() {
    let out = run(r#"<script lang="ts">
    let b = 7;
</script>

<div>
    <slot a={b} />
    <slot name="foo" {b} />
</div>
"#);
    assert!(
        out.contains("slots: {'default': {a:b}, 'foo': {b:b}}"),
        "got:\n{out}"
    );
    assert!(!out.contains("as unknown as $$Slots"), "got:\n{out}");
}
