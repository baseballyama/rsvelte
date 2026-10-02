import * as $ from 'svelte/internal/server';

export default function Widget($$renderer) {
	$$renderer.push(`<button>click me</button>`);
}