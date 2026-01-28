use svelte_compiler_rust::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn main() {
    let source = r#"<script>
	let x = $state(0);
	let y = $state(0);

	$effect(() => {
		console.log(x);
	});
</script>

<button on:click={() => x++}>{x}</button>
<button on:click={() => y++}>{y}</button>"#;

    let client_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        experimental: ExperimentalOptions { r#async: true },
        ..Default::default()
    };

    let client_result = compile(source, client_options).expect("Failed to compile client");
    println!("=== OUR CLIENT ===");
    println!("{}", client_result.js.code);

    println!("\n=== EXPECTED CLIENT ===");
    println!(
        r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button>`, 1);

export default function Main($$anchor, $$props) {{
	$.push($$props, true);

	let x = $.state(0);
	let y = $.state(0);

	$.user_effect(() => {{
		console.log($.get(x));
	}});

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.child(button, true);

	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var text_1 = $.child(button_1, true);

	$.reset(button_1);

	$.template_effect(() => {{
		$.set_text(text, $.get(x));
		$.set_text(text_1, $.get(y));
	}});

	$.event('click', button, () => $.update(x));
	$.event('click', button_1, () => $.update(y));
	$.append($$anchor, fragment);
	$.pop();
}}"#
    );
}
