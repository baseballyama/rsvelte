//! `loc_base` separates real source offsets from the comment buffer's own
//! coordinates, and it was computed from `synth.max_span` — the running max of
//! whatever the probe pass happened to note (chunk text lengths, some statement
//! ends). Nothing makes that an upper bound on the source offsets the printer
//! resolves, so on a component whose template reaches past its largest chunk a
//! genuine source offset sat above `loc_base` and was read as comment space
//! (#4521). The source length is the bound, and the converter already receives
//! the source.
//!
//! The carrier is `svelte-eslint-parser`'s `ts-event03-type-output.svelte`,
//! embedded verbatim: its handlers' comments live past offset 375 while the
//! largest noted chunk is shorter than that. Over 33,661 real-world components
//! compiled on both arms this is the ONLY file whose `js.code` moves.
//!
//! The expected lines are official Svelte 5.57.0's own output for this source
//! (`submodules/svelte`, pin `7bc0a70fe`), read off the oracle. Official also
//! repeats both comments inside the handler bodies, which rsvelte still does
//! not; this test pins the half the boundary repair closes, not parity.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("A.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .unwrap_or_else(|error| format!("COMPILE_ERROR: {error:?}"))
}

const CARRIER: &str = r#"<script lang="ts">
    const {onfoo}:{ // onfoo: (e: { detail: number; }) => void, onfoo: (e: { detail: number; }) => void
        onfoo: (e: { detail: number }) => void // onfoo: (e: { detail: number; }) => void, e: { detail: number; }
    } = $props() // $props(): { onfoo: (e: { detail: number; }) => void; }
    onfoo({detail: 1}) // onfoo({detail: 1}): void
</script>

<button onclick="{e=>{ // e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }
    e.currentTarget; // e.currentTarget: EventTarget & HTMLButtonElement
}}"></button>
<input oninput="{e=>{ // e: Event & { currentTarget: EventTarget & HTMLInputElement; }
    e.currentTarget; // e.currentTarget: EventTarget & HTMLInputElement
}}">
"#;

/// Official's lines 18-19 for this source.
const HANDLER_COMMENTS: &str = "\tvar // e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }\n\t// e.currentTarget: EventTarget & HTMLButtonElement\n";

#[test]
fn a_handler_comment_past_the_largest_chunk_is_not_read_as_comment_space() {
    let out = client(CARRIER);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains(HANDLER_COMMENTS), "{out}");
}

/// The component the boundary repair must not move: a script comment sits below
/// every plausible `max_span`, so both arms already place it. Without this cell
/// the test above passes on any change that simply emits more comments.
#[test]
fn a_script_comment_below_the_boundary_is_unchanged() {
    let out = client("<script>/* c */ let { a } = $props();</script>\n<b>{a}</b>");
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("\tvar /* c */\n\tb = root();"), "{out}");
}
