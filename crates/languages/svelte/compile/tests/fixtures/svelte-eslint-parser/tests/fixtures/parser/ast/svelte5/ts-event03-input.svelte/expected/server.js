import * as $ from 'svelte/internal/server';

export default function Ts_event03_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { onfoo } = $$props;

		onfoo({ detail: 1 });
		$$renderer.push(`<button></button> <input/>`);
	});
}