import * as $ from 'svelte/internal/server';

export default function Nested($$renderer) {
	$$renderer.push(`<div>This is nested</div>`);
}