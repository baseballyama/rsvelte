import * as $ from 'svelte/internal/server';

export default function Hello($$renderer) {
	$$renderer.push(`<span>Hello</span>`);
}