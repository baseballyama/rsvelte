import * as $ from 'svelte/internal/server';

export default function World($$renderer) {
	$$renderer.push(`<span>world</span>`);
}