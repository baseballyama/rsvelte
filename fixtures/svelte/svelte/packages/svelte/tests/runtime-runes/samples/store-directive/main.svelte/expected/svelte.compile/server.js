import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let store = writable({
			action: (node, text) => {
				node.textContent = text;

				return { destroy() {} };
			}
		});

		let text = writable('mounted');

		$$renderer.push(`<div>hello</div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}