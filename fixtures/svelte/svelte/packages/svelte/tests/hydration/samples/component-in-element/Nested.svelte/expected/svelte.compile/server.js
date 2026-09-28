import * as $ from 'svelte/internal/server';

export default function Nested($$renderer) {
	$$renderer.push(`<p>nested</p>`);
}