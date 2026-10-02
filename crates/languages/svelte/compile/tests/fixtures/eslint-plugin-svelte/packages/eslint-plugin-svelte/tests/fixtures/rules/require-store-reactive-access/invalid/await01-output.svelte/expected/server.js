import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Await01_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store = writable('hello');
		const constStore = writable('hello');

		async function foo() {
			return [
				await store,
				await $.store_get($$store_subs ??= {}, '$constStore', constStore)
			];
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}