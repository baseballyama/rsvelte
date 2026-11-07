import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteURLSearchParams as URLSearchParams } from "svelte/reactivity";

export default function Aliased_url_search_params01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new URLSearchParams("foo=1&bar=2");

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}