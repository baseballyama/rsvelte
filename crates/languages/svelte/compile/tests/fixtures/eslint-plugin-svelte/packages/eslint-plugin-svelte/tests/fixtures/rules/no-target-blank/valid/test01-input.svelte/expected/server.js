import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let link = '';

	$$renderer.push(`<a>link</a> <a attr="">link</a> <a target="">link</a> <a href="https://svelte.dev/">link</a> <a${$.attr('href', link)}>link</a> <a${$.attr('href', link)} target="_blank" rel="noopener noreferrer">link</a> <a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">link</a> <a href="/foo" target="_blank">link</a> <a href="/foo" target="_blank" rel="noopener noreferrer">link</a> <a href="foo/bar" target="_blank">link</a> <a href="foo/bar" target="_blank" rel="noopener noreferrer">link</a>`);
}