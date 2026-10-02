import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

export default function _6_autoscroll_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let theme = 'dark';
		let messages = [];
		let div;

		function handleKeydown(event) {
			if (event.key === 'Enter') {
				const text = event.target.value;

				if (!text) return;

				messages = [...messages, text];
				event.target.value = '';
			}
		}

		function toggle() {
			toggleValue = !toggleValue;
		}

		$$renderer.push(`<div${$.attr_class('', void 0, { 'dark': theme === 'dark' })}><div><!--[-->`);

		const each_array = $.ensure_array_like(messages);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let message = each_array[$$index];

			$$renderer.push(`<p>${$.escape(message)}</p>`);
		}

		$$renderer.push(`<!--]--></div> <input/> <button>Toggle dark mode</button></div>`);
	});
}