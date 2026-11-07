import * as $ from 'svelte/internal/server';
import { count } from './stores.js';

export default function Writable_stores04_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function reset() {
			count.set(0);
		}

		$$renderer.push(`<button>reset</button>`);
	});
}