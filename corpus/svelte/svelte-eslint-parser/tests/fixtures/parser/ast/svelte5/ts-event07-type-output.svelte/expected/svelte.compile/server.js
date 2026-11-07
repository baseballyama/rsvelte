import * as $ from 'svelte/internal/server';

export default function Ts_event07_type_output($$renderer) {
	let count = 0; // count: number, $state(0): 0

	$$renderer.push(`<button>clicks: ${$.escape(
		// e: MouseEvent
		// next: number, count: number
		// count: number, next: number
		count
	)}</button>`);
}