import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<p>${$.html(raw1)} ${$.html(raw2)}</p>`);
}