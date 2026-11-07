import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Delete01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new Set([1, 2, 1, 3, 3]);

	variable.delete(42);
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}