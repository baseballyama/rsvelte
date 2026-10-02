import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function If_statement01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable('hello');
		const constStore = writable('hello');

		if (store) {
			console.log(store);
		}

		if (constStore) {
			console.log(constStore);
		}
	});
}