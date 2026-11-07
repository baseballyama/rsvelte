import * as $ from 'svelte/internal/server';

export default function Ts_$effect01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let doubled = $.derived(() => count * 2);

		$$renderer.push(`<button>${$.escape(// runs when the component is mounted, and again
		// whenever `count` or `doubled` change,
		// after the DOM has been updated
		// if a callback is provided, it will run
		// a) immediately before the effect re-runs
		// b) when the component is destroyed
		doubled())}</button> <p>${$.escape(count)} doubled is ${$.escape(doubled())}</p>`);
	});
}