import * as $ from 'svelte/internal/server';
import { count } from './stores.js';

export default function Writable_stores02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function decrement() {
			count.update((n) => n - 1);
		}

		$$renderer.push(`<button>-</button>`);
	});
}