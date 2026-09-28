import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from 'svelte';

var root = $.from_html(`<button>++</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let s = $.state(1);
	let d = $.derived(() => $.get(s));
	var button = root();

	$.delegated('click', button, async () => {
		const f = fork(() => {
			$.set(s, $.get(s) + 1);
		});

		console.log($.get(d));
		await f.commit();
		console.log($.get(d));
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);