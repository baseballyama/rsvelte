import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteMap as Map } from "svelte/reactivity";

export default function Aliased_map01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new Map([[1, "one"], [2, "two"]]);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}