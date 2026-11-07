import * as $ from 'svelte/internal/server';

export default function _1_$state_input($$renderer) {
	let count = 0;

	$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
}