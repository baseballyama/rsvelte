import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import Test from './Test.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let counter = 1;
		let store = writable(counter);

		$$renderer.push(`<button></button> `);
		Test($$renderer, { store });
		$$renderer.push(`<!---->`);
	});
}