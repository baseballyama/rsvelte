import * as $ from 'svelte/internal/server';

export default function Script_comment_input($$renderer) {
	let count = 0;
	let doubled = $.derived(() => count * 2);

	// svelte-ignore state_referenced_locally
	console.log(count);

	// svelte-ignore state_referenced_locally
	console.log(doubled());
}