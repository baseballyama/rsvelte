import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test($$anchor, $$props) {
	$.push($$props, true);

	let x = $.prop($$props, 'x', 15);

	$.user_effect(() => {
		x({});
	});

	function soThatTestReturnsAnObject() {
		return x();
	}

	var $$exports = { soThatTestReturnsAnObject };

	return $.pop($$exports);
}