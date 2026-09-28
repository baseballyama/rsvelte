import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let style = writable('world');

		function init() {
			style = writable('svelte');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}