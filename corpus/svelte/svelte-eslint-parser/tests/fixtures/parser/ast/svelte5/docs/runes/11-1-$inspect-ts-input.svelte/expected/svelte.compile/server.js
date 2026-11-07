import * as $ from 'svelte/internal/server';

export default function _1_1_$inspect_ts_input($$renderer) {
	let count = 0;
	let message = "hello";

	;; // will console.log when `count` or `message` change
	$$renderer.push(`<button>Increment</button> <input${$.attr('value', message)}/>`);
}