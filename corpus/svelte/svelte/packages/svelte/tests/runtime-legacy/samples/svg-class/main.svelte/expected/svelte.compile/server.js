import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<svg class="foo"></svg>`);
}