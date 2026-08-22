//! `<svelte:options>` deprecation diagnostics, pinned against the official
//! compiler's `(code, line, column)` triples.
//!
//! Upstream raises all three of these from one loop over
//! `root.options.attributes` (`2-analyze/index.js` L685-698), so they come out
//! in **attribute source order** and each carries its own attribute's span.
//! rsvelte instead had two separate sites: `customElement` unconditionally
//! early, `immutable` later and span-less, and `accessors` not at all — which
//! is issues #3291/#3224 (missing), #3225 (no span) and the ordering.
//!
//! The last test pins a deliberate divergence rather than parity (#3239).

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

fn opts(generate: GenerateMode) -> CompileOptions {
    CompileOptions {
        filename: Some("T.svelte".into()),
        generate,
        dev: false,
        ..Default::default()
    }
}

/// `(code, "line:column")` per warning, in emission order — the same shape the
/// official probe prints, so a row can be read straight off it.
fn warned(src: &str, generate: GenerateMode) -> Vec<(String, String)> {
    compile(src, opts(generate))
        .expect("compile")
        .warnings
        .into_iter()
        .map(|w: Warning| {
            let pos = match (&w.start, &w.end) {
                (Some(s), Some(e)) => format!("{}:{}-{}:{}", s.line, s.column, e.line, e.column),
                _ => "none".to_string(),
            };
            (w.code, pos)
        })
        .collect()
}

/// Both targets agree in upstream, and every row below was measured on both, so
/// each assertion runs twice rather than trusting the client to stand for the
/// server.
fn assert_both(src: &str, expected: &[(&str, &str)]) {
    let expected: Vec<(String, String)> = expected
        .iter()
        .map(|(c, p)| ((*c).to_string(), (*p).to_string()))
        .collect();
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        assert_eq!(warned(src, generate), expected, "generate={generate:?}");
    }
}

/// #3291 / #3224: the bare spelling warned nothing at all.
#[test]
fn accessors_warns_in_runes_mode() {
    assert_both(
        "<svelte:options accessors />\n<script>\n\tlet n = $state(1);\n</script>\n\n<b>{n}</b>",
        &[("options_deprecated_accessors", "1:16-1:25")],
    );
}

/// The explicit spelling too — upstream keys on the attribute's presence, not
/// on its value, so `={true}` warns and the span covers the whole attribute.
#[test]
fn accessors_true_warns_and_spans_the_whole_attribute() {
    assert_both(
        "<svelte:options accessors={true} />\n<script>\n\tlet n = $state(1);\n</script>\n<b>{n}</b>",
        &[("options_deprecated_accessors", "1:16-1:32")],
    );
}

/// The negative control that makes this a runes-mode arm rather than a missing
/// table entry: neither compiler warns in legacy mode.
#[test]
fn accessors_silent_in_legacy_mode() {
    assert_both("<svelte:options accessors />\n<div>hi</div>", &[]);
    assert_both(
        "<svelte:options runes={false} accessors />\n<script>let n = 1;</script>\n<b>{n}</b>",
        &[],
    );
}

/// #3225: the code and the mode gate were already right; only the span was
/// missing. `1:16` is the attribute's own start, not the tag's.
#[test]
fn immutable_carries_the_attribute_span() {
    assert_both(
        "<svelte:options immutable />\n<script>\n\tlet n = $state(1);\n</script>\n\n<b>{n}</b>",
        &[("options_deprecated_immutable", "1:16-1:25")],
    );
}

#[test]
fn immutable_silent_in_legacy_mode() {
    assert_both("<svelte:options immutable />\n<div>hi</div>", &[]);
}

/// One loop over the attribute list means the emission order is the source
/// order of the attributes, which no per-check site can reproduce: here
/// `immutable` precedes `accessors` even though upstream's `switch` tests
/// `accessors` first.
#[test]
fn warnings_follow_attribute_source_order() {
    assert_both(
        "<svelte:options immutable accessors />\n<script>\n\tlet n = $state(1);\n</script>\n\n<b>{n}</b>",
        &[
            ("options_deprecated_immutable", "1:16-1:25"),
            ("options_deprecated_accessors", "1:26-1:35"),
        ],
    );
}

/// The same two codes across the two sites rsvelte used to emit from, in both
/// orders — `customElement` was pushed ahead of everything regardless of where
/// it sat in the tag.
#[test]
fn custom_element_and_accessors_interleave_by_position() {
    assert_both(
        "<svelte:options customElement=\"my-el\" accessors />\n<script>\n\tlet n = $state(1);\n</script>\n<p>{n}</p>",
        &[
            ("options_missing_custom_element", "1:16-1:37"),
            ("options_deprecated_accessors", "1:38-1:47"),
        ],
    );
    assert_both(
        "<svelte:options accessors customElement=\"my-el\" />\n<script>\n\tlet n = $state(1);\n</script>\n<p>{n}</p>",
        &[
            ("options_deprecated_accessors", "1:16-1:25"),
            ("options_missing_custom_element", "1:26-1:47"),
        ],
    );
}

/// `customElement={null}` is skipped by `read_options` before it sets
/// `component_options.customElement`, but the analyze loop keys on the
/// attribute *name*, so upstream still warns. rsvelte keyed on the parsed
/// option and so stayed silent.
#[test]
fn custom_element_null_still_warns() {
    assert_both(
        "<svelte:options customElement={null} />\n<script>let x = 0;</script>\n{x}",
        &[("options_missing_custom_element", "1:16-1:36")],
    );
}

/// The corpus warning-**code** ratchet's only `options_missing_custom_element`
/// entry, inlined:
/// `svelte/…/runtime-browser/custom-elements-samples/$$slot-dynamic-content/main.svelte`.
/// Keeping it here means the entry can be removed from the ratchet without the
/// shape losing its only guard.
#[test]
fn corpus_entry_custom_element_null_sample() {
    assert_both(
        "<!-- before Svelte 4 it was necessary to explicitly set customElement to null or else you'd get a warning. Keep this around for backwards compat -->\n<svelte:options customElement={null} />\n\n<script>\n\timport \"./my-widget.svelte\";\n\texport let name;\n</script>\n\n<my-widget>\n\t<p>default {name}</p>\n</my-widget>\n",
        &[("options_missing_custom_element", "2:16-2:36")],
    );
}

/// The corpus warning-**position** ratchet's only entry, inlined:
/// `svelte/…/migrate/samples/accessors/output.svelte`. It is the shape that
/// made `<svelte:options>` the one emission site the span-attachment pass never
/// reached — a runes component whose `<svelte:options immutable/>` trails the
/// markup, so the span is nowhere near the tag's own start either.
#[test]
fn corpus_entry_trailing_immutable_sample() {
    assert_both(
        "<script lang=\"ts\">\n\t\n\t\n\tinterface Props {\n\t\ttest: string;\n\t\tcount?: number;\n\t\tstuff: any;\n\t\tcool?: import('svelte').Snippet;\n\t}\n\n\tlet {\n\t\tcount = 0,\n\t\tstuff,\n\t\tcool\n\t}: Props = $props();\n\n\texport {\n\t\tcount,\n\t\tstuff,\n\t}\n</script>\n\n<button>\n\t{@render cool?.()}\n</button>\n\n<svelte:options immutable/>",
        &[("options_deprecated_immutable", "27:16-27:25")],
    );
}

/// #3239, pinned as a **deliberate** divergence, not as parity.
///
/// Upstream dedupes compile-*option* deprecations through a module-level
/// `warned` Set in `validate-options.js`, so a second `compile()` in the same
/// process reports nothing. Reproducing that in rsvelte needs process-global
/// mutable state, which would make *which* file receives the single warning
/// nondeterministic under the parallel NAPI driver. We warn every time; this
/// test exists so that a future change to once-per-process is a deliberate
/// choice rather than a silent one.
#[test]
fn compile_option_deprecations_repeat_on_every_call() {
    let src = "<script>let n = 1;</script>\n<b>{n}</b>";
    for _ in 0..3 {
        let warnings = compile(
            src,
            CompileOptions {
                accessors: true,
                ..opts(GenerateMode::Client)
            },
        )
        .expect("compile")
        .warnings;
        assert_eq!(
            warnings.iter().map(|w| w.code.as_str()).collect::<Vec<_>>(),
            ["options_deprecated_accessors"],
        );
        assert!(
            warnings[0].start.is_none(),
            "an option diagnostic has no node to point at"
        );
    }
}
