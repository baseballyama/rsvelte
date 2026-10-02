import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function SetUTCMilliseconds01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new Date(8.64e15);

	variable.setUTCMilliseconds(420);
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}