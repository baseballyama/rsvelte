import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p>${$.html('x')}<span>baz</span></p>`);
}