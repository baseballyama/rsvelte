import * as $ from 'svelte/internal/server';

export default function Skip_comments01_input($$renderer) {
	// This is a comment
	/* Another comment */
	let count = 0;

	$$renderer.push(`<div class="svelte-173ofx6">0</div>`);
}