import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Set01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new Map([[1, "one"], [2, "two"]]);

	variable.set(1, "two");
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}