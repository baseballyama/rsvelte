import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Arrow_block_return_input($$anchor) {
	let a = $.proxy({ b: 1 });

	const foo = $.derived(() => {
		return a.b;
	});

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(foo)));
	$.append($$anchor, text);
}