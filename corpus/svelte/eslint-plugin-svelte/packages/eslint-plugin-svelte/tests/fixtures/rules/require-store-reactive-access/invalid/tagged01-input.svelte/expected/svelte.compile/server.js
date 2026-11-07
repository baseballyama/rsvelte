import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Tagged01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable((...args) => args.join(','));
		const constStore = writable((...args) => args.join(','));

		console.log(store`abc`);
		console.log(constStore`abc`);
	});
}