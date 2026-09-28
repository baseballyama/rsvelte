import * as $ from 'svelte/internal/server';

export default function Widget($$renderer) {
	$$renderer.push(`<div>A wild component appears</div>`);
}