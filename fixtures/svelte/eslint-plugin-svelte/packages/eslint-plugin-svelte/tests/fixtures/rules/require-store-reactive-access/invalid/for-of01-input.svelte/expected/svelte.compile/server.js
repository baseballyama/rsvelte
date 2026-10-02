import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function For_of01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable('hello');
		const constStore = writable('hello');

		for (const c of store) {
			console.log(c);
		}

		for (const c of constStore) {
			console.log(c);
		}
	});
}