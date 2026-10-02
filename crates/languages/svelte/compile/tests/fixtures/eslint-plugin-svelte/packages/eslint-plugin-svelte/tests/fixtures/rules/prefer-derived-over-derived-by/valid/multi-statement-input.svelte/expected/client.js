import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Multi_statement_input($$anchor) {
	let a = $.proxy({ b: 1 });

	const foo = $.derived(() => {
		const c = a.b * 2;

		return c + 1;
	});

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(foo)));
	$.append($$anchor, text);
}