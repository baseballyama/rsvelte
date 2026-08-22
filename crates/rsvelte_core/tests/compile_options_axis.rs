//! Compile options that no other Rust test varies. Every expectation here was
//! read off the official compiler run over the same source and options; the
//! `compiler-option` matrix family is what keeps them compared byte-for-byte.
//!
//! These cannot be `compatibility/pattern-corpus` repros: that corpus compiles
//! under one fixed option set, so a defect that only exists under a flag has no
//! way to appear in it.

use rsvelte_core::compiler::{CompileOptions, FragmentMode, GenerateMode, compile};

fn js(source: &str, options: CompileOptions) -> String {
    compile(source, options)
        .expect("compile should succeed")
        .js
        .code
}

fn opts(generate: GenerateMode, dev: bool) -> CompileOptions {
    CompileOptions {
        generate,
        dev,
        ..Default::default()
    }
}

const PLAIN: &str = "<h1>x</h1>";
const STYLED: &str =
    "<script>let n = $state(1);</script><b class=\"a\">{n}</b><style>.a { color: red }</style>";

// ---------------------------------------------------------------------------
// filename — upstream's `validate-options.js` declares it `string('(unknown)')`,
// so every consumer downstream reads the DEFAULTED value, never `undefined`.
// ---------------------------------------------------------------------------

#[test]
fn a_missing_filename_names_the_component_from_the_unknown_default() {
    let code = js(PLAIN, opts(GenerateMode::Client, false));
    assert!(
        code.contains("export default function _unknown_("),
        "expected the `(unknown)` default to derive `_unknown_`; got:\n{code}"
    );
}

/// Dev mode reads the filename twice — once for `[$.FILENAME]` and once for
/// `$.add_locations` — and the second reads what the first wrote. Gating the
/// assignment on `filename.is_some()` while leaving `add_locations` ungated is
/// what produced output referencing a component tag that was never set.
#[test]
fn a_missing_filename_still_emits_the_dev_filename_assignment() {
    let code = js(PLAIN, opts(GenerateMode::Client, true));
    assert!(
        code.contains("_unknown_[$.FILENAME] = '(unknown)'"),
        "expected the dev FILENAME assignment; got:\n{code}"
    );
}

#[test]
fn a_missing_filename_reaches_the_server_output_too() {
    let code = js(PLAIN, opts(GenerateMode::Server, false));
    assert!(
        code.contains("export default function _unknown_("),
        "server output should use the same defaulted name; got:\n{code}"
    );
}

/// Negative control: an explicit filename must still win, so the default is
/// reached only by absence.
#[test]
fn an_explicit_filename_is_unaffected_by_the_default() {
    let mut options = opts(GenerateMode::Client, false);
    options.filename = Some("Foo.svelte".to_string());
    let code = js(PLAIN, options);
    assert!(
        code.contains("export default function Foo("),
        "got:\n{code}"
    );
    assert!(!code.contains("_unknown_"), "got:\n{code}");
}

// ---------------------------------------------------------------------------
// customElement — upstream's `custom_element` is
// `options.customElementOptions ?? options.customElement({ filename })`, so the
// compile option alone (with no `<svelte:options customElement>`) still makes
// the component a custom element.
// ---------------------------------------------------------------------------

#[test]
fn the_custom_element_option_alone_registers_the_element() {
    let mut options = opts(GenerateMode::Client, false);
    options.filename = Some("El.svelte".to_string());
    options.custom_element = true;
    let code = js(STYLED, options);
    assert!(
        code.contains("$.create_custom_element("),
        "expected a registration call; got:\n{code}"
    );
}

/// `inject_styles` is `css === 'injected' || is_custom_element`, so a custom
/// element carries its CSS in `$$css` even under the default `css: 'external'`.
#[test]
fn the_custom_element_option_alone_injects_the_styles() {
    let mut options = opts(GenerateMode::Client, false);
    options.filename = Some("El.svelte".to_string());
    options.custom_element = true;
    let code = js(STYLED, options);
    assert!(code.contains("$$css"), "got:\n{code}");
    assert!(code.contains("$.append_styles("), "got:\n{code}");
}

/// Negative control: without the option the same source is a plain component,
/// so neither marker may appear.
#[test]
fn without_the_option_the_same_source_is_a_plain_component() {
    let mut options = opts(GenerateMode::Client, false);
    options.filename = Some("El.svelte".to_string());
    let code = js(STYLED, options);
    assert!(!code.contains("$.create_custom_element("), "got:\n{code}");
    assert!(!code.contains("$$css"), "got:\n{code}");
}

// ---------------------------------------------------------------------------
// fragments: 'tree' — upstream's `objectify` returns `null` for an anchor
// comment and `b.array` prints it as a hole, so the slots the runtime walks
// positionally stay aligned.
// ---------------------------------------------------------------------------

fn tree(source: &str) -> String {
    let mut options = opts(GenerateMode::Client, false);
    options.filename = Some("App.svelte".to_string());
    options.fragments = FragmentMode::Tree;
    js(source, options)
}

#[test]
fn an_anchor_at_the_end_of_a_fragment_leaves_a_hole() {
    let code =
        tree("<script>let { children } = $props();</script>\n<b>x</b>\n{@render children?.()}\n");
    assert!(
        code.contains("$.from_tree([['b', null, 'x'], ' ',,], 1)"),
        "got:\n{code}"
    );
}

#[test]
fn an_anchor_inside_an_element_leaves_a_hole() {
    let code =
        tree("<script>let { children } = $props();</script>\n<b>x{@render children?.()}</b>\n");
    assert!(
        code.contains("$.from_tree([['b', null, 'x',,]])"),
        "got:\n{code}"
    );
}

/// The hole is not `{@render}`-specific: `{@html}` and `{#await}` push the same
/// anchor comment, and so does a component tag.
#[test]
fn every_anchor_construct_leaves_a_hole() {
    for source in [
        "<script>let s = $state('');</script>\n<b>x</b>{@html s}<i>y</i>\n",
        "<script>let p = $state(null);</script>\n<b>x</b>{#await p}a{/await}<i>y</i>\n",
    ] {
        let code = tree(source);
        assert!(
            code.contains("$.from_tree([['b', null, 'x'],, ['i', null, 'y']], 1)"),
            "{source}\ngot:\n{code}"
        );
    }
}

/// Negative control: a fragment with no anchor must not gain a hole.
#[test]
fn a_fragment_without_an_anchor_is_unchanged() {
    let code = tree("<b>x</b><i>y</i>\n");
    assert!(
        code.contains("$.from_tree([['b', null, 'x'], ['i', null, 'y']], 1)"),
        "got:\n{code}"
    );
    assert!(!code.contains(",,"), "got:\n{code}");
}

/// Two options at once, which the matrix family varies one at a time and so
/// cannot reach: a kept comment is `['// …']` while the anchor `as_tree`
/// unshifts ahead of it stays a hole, so the two comment kinds have to be
/// distinguished inside one array.
#[test]
fn a_preserved_comment_keeps_its_entry_while_the_unshifted_anchor_stays_a_hole() {
    let mut options = opts(GenerateMode::Client, false);
    options.filename = Some("App.svelte".to_string());
    options.fragments = FragmentMode::Tree;
    options.preserve_comments = true;
    let code = js("<!-- hi -->\n<b>x</b>\n", options);
    assert!(
        code.contains("$.from_tree([, ['//  hi '], ' ', ['b', null, 'x']], 1)"),
        "got:\n{code}"
    );
}
