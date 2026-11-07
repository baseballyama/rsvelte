import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from "svelte/store";

export default function Type_only_import02_input($$anchor, $$props) {
	$.push($$props, true);

	const $a = () => $.store_get(a, '$a', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let a = writable(42);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, { $a: $a() }));
	$.append($$anchor, text);
	$.pop();
	$$cleanup();
}