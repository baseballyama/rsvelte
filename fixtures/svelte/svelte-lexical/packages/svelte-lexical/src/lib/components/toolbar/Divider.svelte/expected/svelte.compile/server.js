import * as $ from 'svelte/internal/server';

export default function Divider($$renderer) {
	$$renderer.push(`<div class="divider"></div>`);
}