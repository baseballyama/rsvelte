import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Hostname01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new URL("https://svelte.dev/");

	variable.hostname = "example.test";
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}