import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<p>Hello <strong>bold</strong> world</p>`);
}