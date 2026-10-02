import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Append01_input($$anchor, $$props) {
	$.push($$props, true);

	const variable = new URLSearchParams("foo=1&bar=2");

	variable.append("baz", "3");
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}