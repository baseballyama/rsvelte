import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Nested($$anchor, $$props) {
	$.push($$props, true);

	let text = 'Hello World';

	function updateText() {
		text = 'Bye World';
	}

	var $$exports = { updateText };

	$.next();

	var text_1 = $.text();

	$.template_effect(() => $.set_text(text_1, text));
	$.append($$anchor, text_1);

	return $.pop($$exports);
}