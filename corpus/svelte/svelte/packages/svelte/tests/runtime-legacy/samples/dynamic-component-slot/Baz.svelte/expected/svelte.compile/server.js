import * as $ from 'svelte/internal/server';

export default function Baz($$renderer) {
	$$renderer.push(`<div>baz</div>`);
}