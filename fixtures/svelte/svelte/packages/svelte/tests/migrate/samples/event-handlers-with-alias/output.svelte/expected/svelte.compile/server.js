import * as $ from 'svelte/internal/server';

import {
	createBubbler as createBubbler_1,
	handlers as handlers_1,
	preventDefault as preventDefault_1,
	stopPropagation as stopPropagation_1,
	stopImmediatePropagation as stopImmediatePropagation_1,
	self as self_1,
	trusted as trusted_1,
	once as once_1,
	passive as passive_1,
	nonpassive as nonpassive_1
} from 'svelte/legacy';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const bubble_1 = createBubbler_1();
		let handlers;
		let stopPropagation;
		let preventDefault;
		let stopImmediatePropagation;
		let once;
		let trusted;
		let self;
		let createBubbler;
		let bubble;
		let passive;
		let nonpassive;

		$$renderer.push(`<button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->click me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div><button>click me</button> <button>click me</button> <button>click me</button></div>`);
	});
}