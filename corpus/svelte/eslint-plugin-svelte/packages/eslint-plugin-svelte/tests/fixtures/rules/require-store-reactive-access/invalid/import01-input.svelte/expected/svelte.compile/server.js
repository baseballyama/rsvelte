import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Import01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable('hello');
		const constStore = writable('hello');

		async function foo() {
			return [await import(store), await import(constStore)];
		}
	});
}