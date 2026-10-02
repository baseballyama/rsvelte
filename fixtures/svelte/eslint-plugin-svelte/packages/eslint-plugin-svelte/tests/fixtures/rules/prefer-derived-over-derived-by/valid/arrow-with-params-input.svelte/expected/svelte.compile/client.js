import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Arrow_with_params_input($$anchor) {
	let a = 1;
	const foo = $.derived((x) => x + a);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(foo)));
	$.append($$anchor, text);
}