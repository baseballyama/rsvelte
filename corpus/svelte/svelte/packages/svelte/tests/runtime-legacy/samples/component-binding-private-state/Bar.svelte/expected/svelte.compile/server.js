import * as $ from 'svelte/internal/server';

export default function Bar($$renderer) {
	let x = 'no';

	$$renderer.push(`<p>Bar: no</p>`);
}