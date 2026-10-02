import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function SetUTCSeconds02_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new Date(8.64e15);

	variable.setUTCSeconds(59, 999);
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}