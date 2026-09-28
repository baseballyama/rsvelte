import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from 'svelte';

var root = $.from_html(`<button>test</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let s = $.state(1);
	let d = $.derived(() => $.get(s) * 10);
	var button = root();

	$.delegated('click', button, () => {
		const f = fork(() => {
			// d has not been read yet, so this write happens with an uninitialized old value
			$.set(s, 2);

			$.set(d, 99);
		});

		f.discard();
		console.log($.get(d));
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);