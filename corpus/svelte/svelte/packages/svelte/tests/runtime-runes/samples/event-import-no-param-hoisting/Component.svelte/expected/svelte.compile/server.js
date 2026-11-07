import * as $ from 'svelte/internal/server';
import { num } from './state.svelte.js';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { foo } = $$props;

		function onclick() {
			foo();
			console.log(num);
		}

		$$renderer.push(`<button>click</button>`);
	});
}