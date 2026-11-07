import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Function_expression_return_input($$anchor) {
	let a = $.proxy({ b: 1 });

	const foo = $.derived(function () {
		return a.b;
	});

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(foo)));
	$.append($$anchor, text);
}