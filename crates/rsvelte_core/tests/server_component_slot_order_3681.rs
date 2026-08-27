//! Generated names inside component slots are allocated while slot bodies are
//! built. Upstream builds those bodies in the order their slot names first
//! occur in source, including when a named slot precedes the default slot.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const SOURCE: &str = r#"<script>
	import C from './C.svelte';
	let items = [1, 2];
</script>

<C><p slot="beta">{#each items as n}<b>{n}</b>{/each}</p><span>{#each items as _, n}<u>{n}</u>{/each}</span></C>
"#;

#[test]
fn named_slot_before_default_claims_the_first_each_array_name() {
    for dev in [false, true] {
        let code = compile(
            SOURCE,
            CompileOptions {
                filename: Some("T.svelte".into()),
                generate: GenerateMode::Server,
                dev,
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;

        let slots_start = code.find("$$slots: {").expect("named slots object");
        let (default_prop, named_slots) = code.split_at(slots_start);

        assert!(
            named_slots.contains("beta: ($$renderer) => {")
                && named_slots.contains("const each_array ="),
            "the first source slot did not claim `each_array` (dev={dev}):\n{code}"
        );
        assert!(
            default_prop.contains("const each_array_1 ="),
            "the later default slot did not claim `each_array_1` (dev={dev}):\n{code}"
        );
    }
}
