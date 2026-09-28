import * as $ from 'svelte/internal/server';
import { reset, increment, get, count } from './state.svelte.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		console.log(d());
		console.log(d());
		console.log({ local_count });
	});
}