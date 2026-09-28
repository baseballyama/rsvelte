import * as $ from 'svelte/internal/server';
import Button from "./Button.svelte";

import {
	createBubbler,
	handlers,
	preventDefault,
	stopPropagation,
	stopImmediatePropagation,
	self,
	trusted,
	once,
	passive,
	nonpassive
} from 'svelte/legacy';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const bubble = createBubbler();

		$$renderer.push(`<button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->click me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div><button>click me</button> <button>click me</button> <button>click me</button></div>`);
	});
}