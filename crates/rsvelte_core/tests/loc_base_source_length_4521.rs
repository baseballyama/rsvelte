//! `loc_base` is the boundary between real source offsets and the comment
//! coordinate space, and it has to sit above **every** source offset the
//! printer can resolve.
//!
//! It used to be `synth.max_span + 2`, where `max_span` is a running max over
//! whatever the probe pass happened to note — chunk text lengths, some
//! statement ends, some `RawMapped` offsets. A template element's identifier
//! span is not among them, so on a component whose template reaches past the
//! largest noted span a genuine source offset sat ABOVE the boundary and was
//! translated as if it were comment space (#4521). The source's length is an
//! upper bound on all of them, which is why it is what the boundary is built
//! from now.
//!
//! Expected positions below are the oracle's (`submodules/svelte`
//! `7bc0a70fe64d`, `VERSION 5.57.0`, `dev: false`), read out of its own map.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `submodules/svelte-eslint-parser/.../svelte5/ts-event03-type-output.svelte`,
/// the component #4521 measured. Its script comments are long enough that the
/// template's identifiers sit past the largest span the probe pass notes.
const SOURCE: &str = r#"<script lang="ts">
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

fn vlq(chars: &mut std::iter::Peekable<std::str::Chars<'_>>) -> Option<i64> {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut shift = 0u32;
    let mut value = 0i64;
    loop {
        let ch = chars.next()?;
        let digit = ALPHABET.iter().position(|byte| *byte as char == ch)? as i64;
        value += (digit & 31) << shift;
        if digit & 32 == 0 {
            let negative = value & 1 == 1;
            value >>= 1;
            return Some(if negative { -value } else { value });
        }
        shift += 5;
    }
}

/// `(generated line, generated column, source line, source column)` for every
/// four-or-five field segment, in order.
fn segments(mappings: &str) -> Vec<(u32, i64, i64, i64)> {
    let (mut source, mut source_line, mut source_column) = (0i64, 0i64, 0i64);
    let mut out = Vec::new();
    for (generated_line, line) in mappings.split(';').enumerate() {
        let mut generated_column = 0i64;
        for field in line.split(',').filter(|field| !field.is_empty()) {
            let mut chars = field.chars().peekable();
            let Some(delta) = vlq(&mut chars) else {
                continue;
            };
            generated_column += delta;
            let (Some(a), Some(b), Some(c)) = (vlq(&mut chars), vlq(&mut chars), vlq(&mut chars))
            else {
                continue;
            };
            source += a;
            source_line += b;
            source_column += c;
            let _ = source;
            out.push((
                generated_line as u32,
                generated_column,
                source_line,
                source_column,
            ));
        }
    }
    out
}

fn identifier_at(line: &str, column: usize) -> Option<&str> {
    let rest = line.get(column..)?;
    let mut end = 0;
    for (index, ch) in rest.char_indices() {
        let head = index == 0;
        let ok =
            ch.is_ascii_alphabetic() || ch == '_' || ch == '$' || (!head && ch.is_ascii_digit());
        if !ok {
            break;
        }
        end = index + ch.len_utf8();
    }
    (end > 0).then(|| &rest[..end])
}

/// Source positions of every segment whose GENERATED position starts `name`.
fn sources_of(name: &str) -> Vec<(i64, i64)> {
    let result = compile(
        SOURCE,
        CompileOptions {
            filename: Some("Ts_event03_type_output.svelte".to_string()),
            generate: GenerateMode::Client,
            enable_sourcemap: true,
            ..Default::default()
        },
    )
    .expect("compiles");
    let map: serde_json::Value =
        serde_json::from_str(&result.js.map.expect("a map was requested")).expect("map is JSON");
    let mappings = map["mappings"].as_str().expect("mappings is a string");
    let generated: Vec<&str> = result.js.code.split('\n').collect();
    segments(mappings)
        .into_iter()
        .filter(|(generated_line, generated_column, _, _)| {
            generated
                .get(*generated_line as usize)
                .and_then(|line| identifier_at(line, *generated_column as usize))
                == Some(name)
        })
        .map(|(_, _, source_line, source_column)| (source_line, source_column))
        .collect()
}

/// The defect: `<button>`'s identifier sits above the old boundary, so its
/// segments were translated as comment-space offsets and landed at 11:42 —
/// inside `HTMLButtonElement;`'s comment, not on the tag. The oracle puts all
/// three on the tag name at 7:1.
#[test]
fn the_button_tag_maps_to_its_own_name() {
    let sources = sources_of("button");
    assert_eq!(sources.len(), 3, "denominator: {sources:?}");
    assert!(
        sources.iter().all(|position| *position == (7, 1)),
        "{sources:?}"
    );
}

/// The control. `<input>` starts at a LARGER source offset than `<button>` and
/// was mapped correctly under the old rule too, so a change that pointed every
/// template identifier at one place would satisfy the test above and fail here.
#[test]
fn the_input_tag_still_maps_to_its_own_name() {
    let sources = sources_of("input");
    assert_eq!(sources.len(), 2, "denominator: {sources:?}");
    assert!(
        sources.iter().all(|position| *position == (10, 1)),
        "{sources:?}"
    );
}

/// The instrument reads a real axis: a name the generated code does not carry
/// at any mapped position comes back empty, so an `all()` over an empty set
/// cannot be what makes the two tests above pass.
#[test]
fn the_extractor_is_live() {
    assert!(sources_of("no_such_identifier").is_empty());
}
