import * as $ from 'svelte/internal/server';

export default function Custom($$renderer) {
	$$renderer.push(`<div>A custom toast with default styling</div>`);
}