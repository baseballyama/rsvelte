import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const count = writable(0);
		let ran = 0;

		$$renderer.push(`<button>increment</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}