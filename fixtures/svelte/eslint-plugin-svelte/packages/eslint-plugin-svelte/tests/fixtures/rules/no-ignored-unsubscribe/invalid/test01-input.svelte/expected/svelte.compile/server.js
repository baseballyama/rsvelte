import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Test01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const foo = writable(0);

		foo.subscribe(() => {
			console.log('foo changed');
		});
	});
}