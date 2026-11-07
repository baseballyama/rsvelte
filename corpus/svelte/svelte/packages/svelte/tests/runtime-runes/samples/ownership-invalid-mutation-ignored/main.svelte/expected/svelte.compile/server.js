import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let test = { test: 'a' };
		const store = writable(test);

		Child($$renderer, { test, store });
	});
}