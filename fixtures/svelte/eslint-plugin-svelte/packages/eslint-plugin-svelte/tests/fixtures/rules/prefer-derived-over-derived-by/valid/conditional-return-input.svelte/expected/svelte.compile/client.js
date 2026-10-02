import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Conditional_return_input($$anchor) {
	let a = $.proxy({ b: 1 });

	const foo = $.derived(() => {
		if (a.b > 0) {
			return a.b;
		}

		return 0;
	});

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(foo)));
	$.append($$anchor, text);
}