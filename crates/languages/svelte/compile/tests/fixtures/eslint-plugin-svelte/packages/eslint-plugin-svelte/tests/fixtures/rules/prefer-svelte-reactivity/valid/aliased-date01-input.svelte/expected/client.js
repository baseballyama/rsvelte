import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteDate as Date } from "svelte/reactivity";

export default function Aliased_date01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new Date(8.64e15);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}