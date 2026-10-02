import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Spread01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable([42]);
		const constStore = writable(['hello']);

		console.log(...store);
		console.log(...constStore);
	});
}