import * as $ from 'svelte/internal/server';

export default function Hello_world($$renderer) {
	$$renderer.push(`<h1 class="text-2xl font-bold">Hello world</h1>`);
}