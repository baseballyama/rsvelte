import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from "svelte/reactivity";

export default function Svelte_set01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new SvelteSet([1, 2, 1, 3, 3]);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}