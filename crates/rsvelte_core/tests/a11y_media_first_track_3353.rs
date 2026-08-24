//! `a11y_media_has_caption` reads only the FIRST `<track>` child.
//!
//! Upstream's `video` case does `node.fragment.nodes.find(...)` and then tests
//! that one element's attributes
//! (`2-analyze/visitors/shared/a11y/index.js:500-511`); rsvelte ran the same
//! predicate over *every* `track` child with `filter(...).any(...)`, so a
//! `<video>` whose caption track is not the first one stayed silent where the
//! official compiler warns. `find` and `any` agree only when there is exactly
//! one `<track>`, which is the shape every earlier test used.
//!
//! Every expectation is the official compiler's own verdict for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn warns(src: &str) -> bool {
    // The rule lives in phase 2, so it must hold on every target.
    [
        (GenerateMode::Client, false),
        (GenerateMode::Client, true),
        (GenerateMode::Server, false),
        (GenerateMode::Server, true),
    ]
    .into_iter()
    .map(|(generate, dev)| {
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
        .warnings
        .iter()
        .any(|w| w.code == "a11y_media_has_caption")
    })
    .reduce(|a, b| {
        assert_eq!(a, b, "targets disagree for:\n{src}");
        a
    })
    .unwrap()
}

/// The reported shape: the caption track is second, so upstream never sees it.
#[test]
fn a_caption_track_after_the_first_track_does_not_silence_the_warning() {
    assert!(warns(
        "<video src=\"a\"><track kind=\"subtitles\" /><track kind=\"captions\" /></video>"
    ));
    assert!(warns(
        "<video src=\"a\"><track kind=\"descriptions\" /><track kind=\"chapters\" /><track kind=\"captions\" /></video>"
    ));
    // Whitespace text between the children does not make the caption track first.
    assert!(warns(
        "<video src=\"a\">\n\t<track kind=\"subtitles\" />\n\t<track kind=\"captions\" />\n</video>"
    ));
}

/// A spread on the first track still counts as possibly-captions; a spread on a
/// later one is never read.
#[test]
fn only_a_spread_on_the_first_track_counts() {
    assert!(!warns(
        "<video src=\"a\"><track {...rest} /><track kind=\"subtitles\" /></video>"
    ));
    assert!(warns(
        "<video src=\"a\"><track kind=\"subtitles\" /><track {...rest} /></video>"
    ));
}

/// The single-track shapes, which `filter`/`any` and `find` cannot tell apart —
/// they are what made the divergence survive, so they are pinned as controls.
#[test]
fn the_single_track_verdicts_are_unchanged() {
    assert!(!warns(
        "<video src=\"a\"><track kind=\"captions\" /></video>"
    ));
    assert!(warns(
        "<video src=\"a\"><track kind=\"subtitles\" /></video>"
    ));
    assert!(warns("<video src=\"a\"></video>"));
    // A caption track first, junk after, is still silent.
    assert!(!warns(
        "<video src=\"a\"><track kind=\"captions\" /><track kind=\"subtitles\" /></video>"
    ));
}

/// The suppressing attributes still suppress, so "first track only" did not
/// widen into "always warn".
#[test]
fn muted_and_srcless_video_stay_silent() {
    assert!(!warns(
        "<video src=\"a\" muted><track kind=\"subtitles\" /><track kind=\"captions\" /></video>"
    ));
    assert!(!warns(
        "<video><track kind=\"subtitles\" /><track kind=\"captions\" /></video>"
    ));
}

/// `find` searches the direct children only: a `<track>` nested in an element is
/// not the first track, and does not become one.
#[test]
fn a_track_nested_in_a_child_element_is_not_the_first_track() {
    assert!(warns(
        "<video src=\"a\"><div><track kind=\"captions\" /></div><track kind=\"subtitles\" /></video>"
    ));
}
