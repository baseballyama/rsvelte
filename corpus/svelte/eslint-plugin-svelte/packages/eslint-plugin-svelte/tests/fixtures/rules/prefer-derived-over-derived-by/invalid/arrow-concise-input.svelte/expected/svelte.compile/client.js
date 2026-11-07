import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Arrow_concise_input($$anchor) {
	let a = $.proxy({ b: 1 });
	const foo = $.derived(() => a.b);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(foo)));
	$.append($$anchor, text);
}