import * as $ from 'svelte/internal/server';

export default function _3_1_$effect_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let double = $.derived(() => count * 2);

		$$renderer.push(`<button>${$.escape(// runs when the component is mounted, and again
		// whenever `count` or `double` change,
		// after the DOM has been updated
		// if a callback is provided, it will run
		// a) immediately before the effect re-runs
		// b) when the component is destroyed
		double())}</button> <p>${$.escape(count)} doubled is ${$.escape(double())}</p>`);
	});
}