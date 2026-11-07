import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let link = '';

	$$renderer.push(`<a href="https://svelte.dev/" target="_blank">link</a> <a href="https://svelte.dev/" target="_blank" rel="noopenernoreferrer">link</a> <a${$.attr('href', link)} target="_blank" rel="3">link</a> <a${$.attr('href', link)} target="_blank">link</a> <a href="https://svelte.dev/" target="_blank" rel="noopener">link</a>`);
}