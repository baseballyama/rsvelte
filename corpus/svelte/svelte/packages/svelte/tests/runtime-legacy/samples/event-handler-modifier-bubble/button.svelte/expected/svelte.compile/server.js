import * as $ from 'svelte/internal/server';

export default function Button($$renderer) {
	$$renderer.push(`<button>click me</button>`);
}