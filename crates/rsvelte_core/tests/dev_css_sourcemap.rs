//! The dev CSS source map. Upstream builds it with MagicString over the whole
//! `.svelte` source, so a segment lands at the start of every unedited chunk, at
//! every line start inside one, and at every `addSourcemapLocation` — which
//! `css/index.js`'s `_` visitor calls on every visited node's `start` and `end`.
//! The scoping modifier is inserted with `appendLeft`, which maps nowhere.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn injected_css(src: &str) -> String {
    let out = compile(
        src,
        CompileOptions {
            filename: Some("Child.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let start = out.find("base64,").expect("no inline map") + "base64,".len();
    let end = out[start..].find(" */").expect("unterminated map");
    String::from_utf8(base64_decode(&out[start..start + end])).expect("map is not utf-8")
}

fn base64_decode(input: &str) -> Vec<u8> {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = Vec::new();
    let mut buffer = 0u32;
    let mut bits = 0u32;
    for byte in input.bytes().filter(|b| *b != b'=') {
        let value = ALPHABET
            .iter()
            .position(|c| *c == byte)
            .unwrap_or_else(|| panic!("not base64: {byte}")) as u32;
        buffer = (buffer << 6) | value;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((buffer >> bits) as u8);
        }
    }
    out
}

const COMPONENT: &str = r#"<svelte:options css="injected" />

<h1>count</h1>

<style>
	h1 {
		color: red;
	}
</style>
"#;

#[test]
fn the_map_carries_the_source_basename_and_upstream_segments() {
    let map = injected_css(COMPONENT);
    assert!(map.contains("\"file\":\"Child.svelte\""), "got:\n{map}");
    // `;AAKA,CAAC,gBAAE,CAAC;AACJ,EAAE,UAAU;AACZ;` — the empty first line, then
    // the chunk start, the selector node, the resume after the inserted
    // `.svelte-…`, the block brace, and one segment per declaration boundary.
    assert!(
        map.contains("\"mappings\":\";AAKA,CAAC,gBAAE,CAAC;AACJ,EAAE,UAAU;AACZ;\""),
        "got:\n{map}"
    );
}

#[test]
fn a_custom_element_carries_the_map_too() {
    let map = injected_css(
        r#"<svelte:options customElement="my-widget" />

<h1>count</h1>

<style>
	h1 {
		color: red;
	}
</style>
"#,
    );
    assert!(map.contains("\"mappings\":\";AAKA,"), "got:\n{map}");
}

#[test]
fn a_partially_pruned_selector_list_keeps_its_segments() {
    let map = injected_css(
        r#"<svelte:options css="injected" />

<div class="foo">foo</div>

<style>
	.foo, .unused {
		color: green;
	}
</style>
"#,
    );
    // `overwrite` replaces the separator before the pruned selector, so the
    // ` /* (unused) ` it writes still carries that separator's position, and
    // both selectors keep segments of their own.
    assert!(
        map.contains("\"mappings\":\";AAKA,CAAC,kBAAI,aAAE,SAAO,CAAC;AACf,EAAE,YAAY;AACd;\""),
        "got:\n{map}"
    );
}
