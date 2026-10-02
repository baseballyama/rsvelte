import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Switch01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable('hello');
		const constStore = writable('hello');

		switch (store) {
			case 'hello':
				console.log('hello');
				break;

			default:
				console.log('other');
		}

		switch (constStore) {
			case 'hello':
				console.log('hello');
				break;

			default:
				console.log('other');
		}
	});
}