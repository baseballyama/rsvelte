import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run } from 'svelte/legacy';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	run(() => {
		$.set(count, $.get(count) + 1);
	});

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.append($$anchor, text);
	$.pop();
}