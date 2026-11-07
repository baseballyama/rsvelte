import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function For_in01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable('hello');
		const constStore = writable('hello');

		for (const k in store) {
			console.log(k);
		}

		for (const k in constStore) {
			console.log(k);
		}
	});
}