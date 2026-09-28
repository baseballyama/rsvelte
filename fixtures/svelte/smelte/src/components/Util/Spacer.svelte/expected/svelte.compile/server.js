import * as $ from 'svelte/internal/server';

export default function Spacer($$renderer) {
	$$renderer.push(`<div class="flex-grow"></div>`);
}