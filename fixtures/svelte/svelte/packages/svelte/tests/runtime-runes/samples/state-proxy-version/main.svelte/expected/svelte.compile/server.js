import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import Item from './Item.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = {};

		setContext('container', {
			register: (id) => items[id] = true,
			unregister: (id) => delete items[id]
		});

		Item($$renderer, {});
	});
}