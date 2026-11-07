import * as $ from 'svelte/internal/server';

export default function Ts_event08_type_output($$renderer) {
	let count = 0; // count: number, $state(0): 0

	$$renderer.push(`<button>clicks: ${$.escape(
		// event: number
		// count: number, event: number
		count
	)}</button>`);
}