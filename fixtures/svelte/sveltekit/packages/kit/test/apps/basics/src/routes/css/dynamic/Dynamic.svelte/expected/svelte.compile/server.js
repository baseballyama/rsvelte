import * as $ from 'svelte/internal/server';

export default function Dynamic($$renderer) {
	$$renderer.push(`<p class="svelte-1892thy">I'm dynamically imported</p>`);
}