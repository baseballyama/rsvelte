import * as $ from 'svelte/internal/server';

export default function Nested($$renderer) {
	$$renderer.push(`<p>no slot here</p>`);
}