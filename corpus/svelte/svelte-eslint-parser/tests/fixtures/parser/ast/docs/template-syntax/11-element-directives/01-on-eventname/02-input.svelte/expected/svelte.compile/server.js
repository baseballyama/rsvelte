import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	let count = 0;

	function handleClick(event) {
		count += 1;
	}

	$$renderer.push(`<button>count: ${$.escape(count)}</button>`);
}