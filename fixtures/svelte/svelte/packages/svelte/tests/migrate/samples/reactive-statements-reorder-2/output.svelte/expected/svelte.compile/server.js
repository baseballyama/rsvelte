import * as $ from 'svelte/internal/server';
import { run } from 'svelte/legacy';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let width = 0;
		let mobile = $.derived(() => width < 640);

		run(() => {
			console.log(mobile());
		});

		$$renderer.push(`<!---->0`);
	});
}