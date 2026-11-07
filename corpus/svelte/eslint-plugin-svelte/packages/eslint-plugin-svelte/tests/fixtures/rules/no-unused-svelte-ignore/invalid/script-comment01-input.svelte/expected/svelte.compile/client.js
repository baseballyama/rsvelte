import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_comment01_input($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;
	let doubled = $.derived(() => count * 2);

	// svelte-ignore static-state-reference
	console.log(count);

	function fn() {
		// svelte-ignore static-state-reference
		console.log($.get(doubled));
	}

	var $$exports = { fn };

	return $.pop($$exports);
}