import * as $ from 'svelte/internal/server';

export default function Child($$renderer) {
	$$renderer.push(`<h1>hello</h1>`);
}