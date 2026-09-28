import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from 'svelte';

var root = $.from_html(`<button>++</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let s = $.state(1);
	let d = $.derived(() => $.get(s) * 10);
	var button = root();

	$.delegated('click', button, async () => {
		const f = fork(() => {
			// First modify s, then write to d
			// If d is evaluated in fork context, it would see s=2 and compute d=20
			// But it should evaluate in real-world context to get d=10
			$.set(s, 2);

			$.set(d, 99);
		});

		// Should be 10 (real-world value: s=1, so d=1*10=10), not 20 (fork value)
		console.log($.get(d));

		await f.commit();

		// Should be 99 (the value we wrote)
		console.log($.get(d));
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);