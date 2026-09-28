import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>+</button>`);

export default function Main($$anchor) {
	let count = $.proxy({ current: 0 });
	var button = root();

	$.template_effect(() => {
		console.log({ count: $.snapshot(count) });

		debugger;
	});

	$.delegated('click', button, () => count.current++);
	$.append($$anchor, button);
}

$.delegate(['click']);