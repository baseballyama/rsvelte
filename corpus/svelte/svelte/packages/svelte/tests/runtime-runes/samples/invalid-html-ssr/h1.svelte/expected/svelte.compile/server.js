import * as $ from 'svelte/internal/server';

export default function H1($$renderer) {
	$$renderer.push(`<h1>foo</h1>`);
}