import * as $ from 'svelte/internal/server';

export default function Trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { getValue } = $$props;

		$$renderer.push(`<span>trigger</span>`);
		// Reads reactive state during teardown
	});
}