//! A private field whose name continues past the `$state` field being
//! transformed must not be split.
//!
//! The client class transform decided where the field name ended from
//! `result.as_bytes()[after_pos] as char`, which Latin-1-decodes one byte of a
//! UTF-8 sequence. `א` is `D7 90`, and `0xD7` — the lead byte of the whole Hebrew
//! block — is the one lead byte whose Latin-1 image (`×`) is not alphanumeric, so
//! the scan saw a word boundary inside an identifier and spliced `$.get(...)`
//! there. `compile()` returned `Ok` with `return $.get(this.#c)א;` in the output,
//! which is not JavaScript at all.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client_code(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("Probe.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("component should compile")
    .js
    .code
}

#[track_caller]
fn assert_parses(code: &str) {
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "output is not JavaScript: {:?}\n--- output ---\n{code}",
        ret.diagnostics,
    );
}

const HEBREW: &str = "\
<script>
class C {
	#c = $state(0);
	#c\u{5D0} = 1;

	read() { return this.#c\u{5D0}; }
}
</script>
";

/// Control: the ASCII shape of the same component, which already compiled.
const ASCII: &str = "\
<script>
class C {
	#c = $state(0);
	#cx = 1;

	read() { return this.#cx; }
}
</script>
";

#[test]
fn a_hebrew_private_field_compiles_to_javascript() {
    assert_parses(&client_code(ASCII));
    assert_parses(&client_code(HEBREW));
}

/// The read must stay a read of `#cא`, not of `#c`. Asserting only that the
/// output parses would not catch a fix that produced valid but wrong JavaScript.
#[test]
fn a_hebrew_private_field_read_keeps_its_own_field() {
    let code = client_code(HEBREW);
    assert!(
        code.contains("return this.#c\u{5D0};"),
        "read was rewritten: {code}"
    );
    assert!(
        !code.contains("$.get(this.#c)"),
        "read was rewritten: {code}"
    );
    // Control on the other side: the `$state` field is still a state field.
    assert!(code.contains("#c = $.state(0);"), "{code}");
}
