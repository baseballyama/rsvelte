import * as $ from 'svelte/internal/server';

export default function Widget($$renderer) {
	$$renderer.push(`<p>widget</p>`);
}