import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run } from 'svelte/legacy';

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	let width = 0;
	let mobile = $.derived(() => width < 640);

	run(() => {
		console.log($.get(mobile));
	});

	$.next();

	var text = $.text();

	text.nodeValue = width / $.get(mobile);
	$.append($$anchor, text);
	$.pop();
}