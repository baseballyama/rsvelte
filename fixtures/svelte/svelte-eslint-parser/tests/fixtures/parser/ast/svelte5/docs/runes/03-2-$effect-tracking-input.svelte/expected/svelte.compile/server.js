import * as $ from 'svelte/internal/server';

export default function _3_2_$effect_tracking_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		console.log(
			"in component setup:", // false
			false
		);

		$$renderer.push(`<p>in template: ${$.escape(false)}</p>`);
		// true
	});
}