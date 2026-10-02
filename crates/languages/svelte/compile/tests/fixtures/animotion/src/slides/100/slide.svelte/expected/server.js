import * as $ from 'svelte/internal/server';

export default function Slide($$renderer) {
	$$renderer.push(`<p class="text-4xl font-bold drop-shadow-sm">🪄 Use arrow keys to navigate</p>`);
}