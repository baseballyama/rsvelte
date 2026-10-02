import * as $ from 'svelte/internal/server';

export default function _1_counter_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let double = $.derived(() => count * 2);

		$$renderer.push(`<button>${$.escape(count)} / ${$.escape(double())}</button>`);
	});
}