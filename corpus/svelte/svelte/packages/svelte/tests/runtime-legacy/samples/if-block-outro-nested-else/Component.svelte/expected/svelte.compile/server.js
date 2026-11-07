import * as $ from 'svelte/internal/server';

export default function Component($$renderer) {
	$$renderer.push(`<div></div>`);
}