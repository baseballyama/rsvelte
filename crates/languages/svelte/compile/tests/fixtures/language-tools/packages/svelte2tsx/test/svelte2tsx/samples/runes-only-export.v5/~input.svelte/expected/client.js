import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let x = void 0;

	function foo() {
		return true;
	}

	var $$exports = { foo };

	$.next();

	var text = $.text();

	text.nodeValue = '';
	$.append($$anchor, text);

	return $.pop($$exports);
}