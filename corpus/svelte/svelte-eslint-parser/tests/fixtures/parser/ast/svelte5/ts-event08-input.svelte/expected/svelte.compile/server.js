import * as $ from 'svelte/internal/server';

export default function Ts_event08_input($$renderer) {
	let count = 0;

	$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
}