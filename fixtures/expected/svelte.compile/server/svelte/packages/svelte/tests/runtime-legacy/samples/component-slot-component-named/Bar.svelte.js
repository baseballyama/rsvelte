import * as $ from 'svelte/internal/server';

export default function Bar($$renderer) {
	$$renderer.push(`<p>bar</p>`);
}