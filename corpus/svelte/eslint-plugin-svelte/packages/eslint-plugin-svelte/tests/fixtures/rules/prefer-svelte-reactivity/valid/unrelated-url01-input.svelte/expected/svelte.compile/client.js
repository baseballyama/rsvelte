import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { URL } from "package";

export default function Unrelated_url01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new URL("https://svelte.dev/");

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}