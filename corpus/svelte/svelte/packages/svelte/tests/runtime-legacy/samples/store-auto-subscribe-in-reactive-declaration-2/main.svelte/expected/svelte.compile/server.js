import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import Child from './App.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const store_container = { store: writable('Hello World') };

		function update_value(value) {
			store_container.store = writable(value);
		}

		Child($$renderer, { store_container });
		$.bind_props($$props, { update_value });
	});
}