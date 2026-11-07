import * as $ from 'svelte/internal/server';

export default function SharedCSS($$renderer) {
	$$renderer.push(`<p class="svelte-1a2g26r">This component is imported in multiple pages and therefore its CSS lands in a separate CSS chunk</p>`);
}