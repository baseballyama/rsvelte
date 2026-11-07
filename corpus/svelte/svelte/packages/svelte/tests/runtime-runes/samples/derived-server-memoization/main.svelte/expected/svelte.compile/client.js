import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { reset, increment, get, count } from './state.svelte.js';

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	reset();
	console.log(get());
	increment();
	console.log(get());
	console.log({ count });

	let local_count = 0;
	let s = 0;

	let d = $.derived(() => {
		local_count += 1;

		return s * 2;
	});

	console.log($.get(d));
	console.log($.get(d));
	console.log({ local_count });
	$.pop();
}