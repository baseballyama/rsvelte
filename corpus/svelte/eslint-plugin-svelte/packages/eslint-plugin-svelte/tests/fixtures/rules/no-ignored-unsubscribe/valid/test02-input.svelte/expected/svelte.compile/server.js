import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Test02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const foo = writable(0);
		const unsubscribers = [];

		unsubscribers.push(foo.subscribe(() => {
			console.log('foo changed');
		}));
	});
}