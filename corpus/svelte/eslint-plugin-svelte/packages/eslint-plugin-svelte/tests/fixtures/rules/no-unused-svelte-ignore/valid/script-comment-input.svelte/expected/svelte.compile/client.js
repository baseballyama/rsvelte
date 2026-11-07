import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Script_comment_input($$anchor) {
	let count = 0;
	let doubled = $.derived(() => count * 2);

	// svelte-ignore state_referenced_locally
	console.log(count);

	// svelte-ignore state_referenced_locally
	console.log($.get(doubled));
}