import * as $ from 'svelte/internal/server';

export default function Ts_event03_type_output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			onfoo // onfoo: (e: { detail: number; }) => void, onfoo: (e: { detail: number; }) => void

			// onfoo: (e: { detail: number; }) => void, e: { detail: number; }
		} = $$props; // $props(): { onfoo: (e: { detail: number; }) => void; }

		onfoo({ detail: 1 }); // onfoo({detail: 1}): void
		$$renderer.push(`<button></button> <input/>`);
	});
}