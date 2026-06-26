//! Regression tests for #1232: a legacy `let:` binding on a COMPONENT child of
//! another component must destructure from the *child's own* `$$slot_def.default`
//! (emitted by the child's own `handle_component`), NOT be re-forwarded onto the
//! enclosing component's instance.
//!
//! Before the fix, `<Preview><State let:value let:set>…</State></Preview>` marked
//! `Preview` as a "default-slot-let child" carrier, so rsvelte (a) gave `Preview`
//! a spurious instance const and (b) emitted a duplicate
//! `$$_preview.$$slot_def.default` destructure binding `State`'s `let:` props onto
//! `Preview`. Official svelte2tsx only routes a component's *own* lets through its
//! own slot_def — a non-component slot-content child (`<div let:x>` /
//! `<svelte:fragment let:x>`) is what forwards to the parent.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Comp.svelte".to_string(),
        is_ts_file: false,
        emit_jsdoc: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx ok").code
}

/// A component child with its own `let:` directives destructures from its own
/// instance, and the enclosing component is a bare `new` (no instance const, no
/// duplicated destructure).
#[test]
fn component_child_let_binds_from_own_slot_def() {
    let src = "<script>\n  import Preview from './Preview.svelte';\n  import State from './State.svelte';\n</script>\n\n<Preview>\n  <State let:value={xDomain} let:set>\n    {xDomain}\n  </State>\n</Preview>\n";
    let code = convert(src);

    // State (reversed `etatS`) gets its own instance const + destructure.
    assert!(
        code.contains("$$_etatS1.$$slot_def.default"),
        "expected State to destructure from its own slot_def, got:\n{code}"
    );
    // Preview (reversed `weiverP`) must NOT carry a slot_def destructure — the
    // `let:` props belong to State.
    assert!(
        !code.contains("$$_weiverP0.$$slot_def.default"),
        "Preview must not duplicate State's let: bindings, got:\n{code}"
    );
    // Preview is a bare `new` (no `const $$_weiverP0 =` instance var).
    assert!(
        !code.contains("const $$_weiverP0 ="),
        "Preview must not get a spurious instance const, got:\n{code}"
    );
}

/// A NON-component default-slot child (`<div let:x>`) still forwards its `let:`
/// bindings to the enclosing component's `$$slot_def.default` (unchanged
/// behavior — this is the case that legitimately needs the parent instance).
#[test]
fn element_child_let_still_forwards_to_parent() {
    let src = "<script>\n  import Preview from './Preview.svelte';\n</script>\n\n<Preview>\n  <div let:value={v} let:set>\n    {v}\n  </div>\n</Preview>\n";
    let code = convert(src);
    assert!(
        code.contains("$$_weiverP0.$$slot_def.default"),
        "element child let: must forward to the parent component's slot_def, got:\n{code}"
    );
    assert!(
        code.contains("const $$_weiverP0 ="),
        "parent must get an instance const for the element-child let forward, got:\n{code}"
    );
}
