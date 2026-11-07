import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

export default function _4_$effect_pre_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let div;
		let messages = [];

		$$renderer.push(`<div><!--[-->`);

		const each_array = $.ensure_array_like(
			// ...
			// not yet mounted
			// reference `messages` so that this code re-runs whenever it changes
			// autoscroll when new messages are added
			messages
		);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let message = each_array[$$index];

			$$renderer.push(`<p>${$.escape(message)}</p>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}