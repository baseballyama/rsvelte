import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Async_arrow_input($$anchor) {
	let a = 1;
	const foo = $.derived(async () => await Promise.resolve(a));

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(foo)));
	$.append($$anchor, text);
}