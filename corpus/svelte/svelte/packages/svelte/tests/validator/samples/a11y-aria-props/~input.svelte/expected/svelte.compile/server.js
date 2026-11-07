import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<input type="image" aria-labeledby="foo"/>`);
}